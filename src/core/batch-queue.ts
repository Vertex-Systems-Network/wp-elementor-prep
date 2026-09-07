export type BatchItemStatus = 'PENDING' | 'RUNNING' | 'AWAITING_CHECKPOINT' | 'SUCCEEDED' | 'FAILED' | 'SKIPPED' | 'CANCELLED';
export type BatchQueueStatus = 'IDLE' | 'RUNNING' | 'CANCELLING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type BatchSkipReason = 'ALREADY_PROCESSED' | 'RESTORED_CHECKPOINT';
export type BatchCheckpointResolution = 'FINALIZED' | 'RESTORED';

export interface BatchQueueInput {
  frameId: string;
  frameName: string;
  /** Optional versioned processing key recorded by a previous finalized successful run. */
  previousRunKey?: string | null;
}

export interface BatchQueueItem {
  frameId: string;
  frameName: string;
  status: BatchItemStatus;
  attempts: number;
  error: string | null;
  skipReason: BatchSkipReason | null;
}

export interface BatchQueueState {
  schemaVersion: 1;
  runKey: string;
  status: BatchQueueStatus;
  items: BatchQueueItem[];
  cancelRequested: boolean;
  /** Inter-frame safety pause. A pending P5 checkpoint must be explicitly finalized or restored. */
  pauseReason: string | null;
}

export interface BatchQueueSummary {
  total: number;
  pending: number;
  running: number;
  awaitingCheckpoint: number;
  succeeded: number;
  failed: number;
  skipped: number;
  cancelled: number;
  finished: number;
  progressPct: number;
}

export type BatchItemOutcome =
  | { status: 'SUCCEEDED' }
  | { status: 'CHECKPOINT_PENDING'; reason?: string }
  | { status: 'FAILED'; error: string }
  | { status: 'SKIPPED'; reason?: BatchSkipReason };

const DEFAULT_CHECKPOINT_PAUSE_REASON = 'Resolve the pending Safe Fix checkpoint by finalizing or restoring it before the batch continues.';

function normalizedInput(inputs: BatchQueueInput[]): BatchQueueInput[] {
  const seen = new Set<string>();
  const output: BatchQueueInput[] = [];
  for (const input of inputs) {
    if (!input.frameId || seen.has(input.frameId)) continue;
    seen.add(input.frameId);
    output.push(input);
  }
  return output;
}

function hasRunningItem(state: BatchQueueState): boolean {
  return state.items.some((item) => item.status === 'RUNNING');
}

function hasAwaitingCheckpoint(state: BatchQueueState): boolean {
  return state.items.some((item) => item.status === 'AWAITING_CHECKPOINT');
}

function hasPendingItem(state: BatchQueueState): boolean {
  return state.items.some((item) => item.status === 'PENDING');
}

function settleQueueStatus(state: BatchQueueState): BatchQueueState {
  if (hasRunningItem(state)) {
    return { ...state, status: state.cancelRequested ? 'CANCELLING' : 'RUNNING' };
  }
  if (hasAwaitingCheckpoint(state)) {
    return {
      ...state,
      status: 'PAUSED',
      pauseReason: state.pauseReason ?? DEFAULT_CHECKPOINT_PAUSE_REASON,
    };
  }
  if (state.cancelRequested) {
    return { ...state, status: 'CANCELLED' };
  }
  if (state.pauseReason) {
    return { ...state, status: 'PAUSED' };
  }
  if (hasPendingItem(state)) {
    return { ...state, status: 'IDLE' };
  }
  return { ...state, status: 'COMPLETED' };
}

/**
 * Creates a compact queue containing only stable frame identity and execution state. Audit trees,
 * rendered images and mutation candidates deliberately stay outside the queue to keep memory bounded.
 */
export function createBatchQueue(inputs: BatchQueueInput[], runKey: string): BatchQueueState {
  const items = normalizedInput(inputs).map<BatchQueueItem>((input) => {
    const alreadyProcessed = Boolean(runKey) && input.previousRunKey === runKey;
    return {
      frameId: input.frameId,
      frameName: input.frameName,
      status: alreadyProcessed ? 'SKIPPED' : 'PENDING',
      attempts: 0,
      error: null,
      skipReason: alreadyProcessed ? 'ALREADY_PROCESSED' : null,
    };
  });

  return settleQueueStatus({
    schemaVersion: 1,
    runKey,
    status: 'IDLE',
    items,
    cancelRequested: false,
    pauseReason: null,
  });
}

/** Starts exactly one pending item. A paused/cancelling queue or second concurrent item is never started. */
export function startNextBatchItem(state: BatchQueueState): BatchQueueState {
  if (
    state.cancelRequested
    || state.pauseReason
    || hasRunningItem(state)
    || hasAwaitingCheckpoint(state)
  ) return settleQueueStatus(state);

  const index = state.items.findIndex((item) => item.status === 'PENDING');
  if (index < 0) return settleQueueStatus(state);

  const items = state.items.map((item, itemIndex) => itemIndex === index
    ? { ...item, status: 'RUNNING' as const, attempts: item.attempts + 1, error: null }
    : item);
  return { ...state, status: 'RUNNING', items };
}

/**
 * Settles the one running item. A committed P5 mutation is not a durable success yet: callers must
 * return CHECKPOINT_PENDING until the bounded restore/finalize checkpoint is explicitly resolved.
 */
export function finishRunningBatchItem(state: BatchQueueState, outcome: BatchItemOutcome): BatchQueueState {
  const runningIndex = state.items.findIndex((item) => item.status === 'RUNNING');
  if (runningIndex < 0) return settleQueueStatus(state);

  const items = state.items.map((item, itemIndex): BatchQueueItem => {
    if (itemIndex !== runningIndex) return item;
    if (outcome.status === 'FAILED') {
      return { ...item, status: 'FAILED', error: outcome.error, skipReason: null };
    }
    if (outcome.status === 'SKIPPED') {
      return {
        ...item,
        status: 'SKIPPED',
        error: null,
        skipReason: outcome.reason ?? null,
      };
    }
    if (outcome.status === 'CHECKPOINT_PENDING') {
      return { ...item, status: 'AWAITING_CHECKPOINT', error: null, skipReason: null };
    }
    return { ...item, status: 'SUCCEEDED', error: null, skipReason: null };
  });

  const pauseReason = outcome.status === 'CHECKPOINT_PENDING'
    ? outcome.reason?.trim() || DEFAULT_CHECKPOINT_PAUSE_REASON
    : state.pauseReason;
  return settleQueueStatus({ ...state, items, pauseReason });
}

/**
 * Resolves the one checkpoint-owning frame only after the external P5 checkpoint action succeeded.
 * FINALIZED becomes durable SUCCEEDED. RESTORED becomes a terminal skip and never receives run-key
 * success metadata, preventing restored frames from being incorrectly treated as processed.
 */
export function resolveBatchCheckpoint(
  state: BatchQueueState,
  resolution: BatchCheckpointResolution,
): BatchQueueState {
  const awaitingIndex = state.items.findIndex((item) => item.status === 'AWAITING_CHECKPOINT');
  if (awaitingIndex < 0) return settleQueueStatus(state);

  const items = state.items.map((item, index): BatchQueueItem => {
    if (index !== awaitingIndex) return item;
    if (resolution === 'FINALIZED') {
      return { ...item, status: 'SUCCEEDED', error: null, skipReason: null };
    }
    return {
      ...item,
      status: 'SKIPPED',
      error: null,
      skipReason: 'RESTORED_CHECKPOINT',
    };
  });

  return settleQueueStatus({ ...state, items, pauseReason: null });
}

/**
 * Requests cancellation without interrupting an in-flight transaction or silently resolving a P5
 * checkpoint. Pending frames are cancelled immediately; an awaiting checkpoint remains paused until
 * it is explicitly finalized/restored, then the queue settles cancelled.
 */
export function requestBatchCancel(state: BatchQueueState): BatchQueueState {
  const items = state.items.map((item): BatchQueueItem => item.status === 'PENDING'
    ? { ...item, status: 'CANCELLED' }
    : item);
  return settleQueueStatus({ ...state, items, cancelRequested: true });
}

/**
 * Pauses scheduling between frame transactions without changing pending item state. If called while
 * a frame is still running, the running transaction is allowed to settle first and the pause becomes
 * effective before another frame can start.
 */
export function requestBatchPause(state: BatchQueueState, reason: string): BatchQueueState {
  const pauseReason = reason.trim() || 'Batch paused by safety policy.';
  return settleQueueStatus({ ...state, pauseReason });
}

/**
 * Resumes ordinary paused/cancelled work without repeating durable successes. An unresolved P5
 * checkpoint cannot be bypassed through resume; it must first pass resolveBatchCheckpoint().
 */
export function resumeBatchQueue(
  state: BatchQueueState,
  options: { retryFailed?: boolean } = {},
): BatchQueueState {
  if (hasAwaitingCheckpoint(state)) return settleQueueStatus(state);

  const retryFailed = options.retryFailed ?? true;
  const items = state.items.map((item): BatchQueueItem => {
    if (item.status === 'CANCELLED' || (retryFailed && item.status === 'FAILED')) {
      return { ...item, status: 'PENDING', error: null };
    }
    return item;
  });
  return settleQueueStatus({ ...state, items, cancelRequested: false, pauseReason: null });
}

export function summarizeBatchQueue(state: BatchQueueState): BatchQueueSummary {
  const count = (status: BatchItemStatus) => state.items.filter((item) => item.status === status).length;
  const total = state.items.length;
  const pending = count('PENDING');
  const running = count('RUNNING');
  const awaitingCheckpoint = count('AWAITING_CHECKPOINT');
  const succeeded = count('SUCCEEDED');
  const failed = count('FAILED');
  const skipped = count('SKIPPED');
  const cancelled = count('CANCELLED');
  const finished = succeeded + failed + skipped + cancelled;

  return {
    total,
    pending,
    running,
    awaitingCheckpoint,
    succeeded,
    failed,
    skipped,
    cancelled,
    finished,
    progressPct: total === 0 ? 100 : Math.round((finished / total) * 100),
  };
}
