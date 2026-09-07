export type BatchItemStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'SKIPPED' | 'CANCELLED';
export type BatchQueueStatus = 'IDLE' | 'RUNNING' | 'CANCELLING' | 'COMPLETED' | 'CANCELLED';

export interface BatchQueueInput {
  frameId: string;
  frameName: string;
  /** Optional versioned processing key recorded by a previous successful run. */
  previousRunKey?: string | null;
}

export interface BatchQueueItem {
  frameId: string;
  frameName: string;
  status: BatchItemStatus;
  attempts: number;
  error: string | null;
  skipReason: 'ALREADY_PROCESSED' | null;
}

export interface BatchQueueState {
  schemaVersion: 1;
  runKey: string;
  status: BatchQueueStatus;
  items: BatchQueueItem[];
  cancelRequested: boolean;
}

export interface BatchQueueSummary {
  total: number;
  pending: number;
  running: number;
  succeeded: number;
  failed: number;
  skipped: number;
  cancelled: number;
  finished: number;
  progressPct: number;
}

export type BatchItemOutcome =
  | { status: 'SUCCEEDED' }
  | { status: 'FAILED'; error: string }
  | { status: 'SKIPPED'; reason?: 'ALREADY_PROCESSED' };

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

function hasPendingItem(state: BatchQueueState): boolean {
  return state.items.some((item) => item.status === 'PENDING');
}

function settleQueueStatus(state: BatchQueueState): BatchQueueState {
  if (hasRunningItem(state)) {
    return { ...state, status: state.cancelRequested ? 'CANCELLING' : 'RUNNING' };
  }
  if (state.cancelRequested) {
    return { ...state, status: 'CANCELLED' };
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
  });
}

/** Starts exactly one pending item. A second concurrent RUNNING item is never created. */
export function startNextBatchItem(state: BatchQueueState): BatchQueueState {
  if (state.cancelRequested || hasRunningItem(state)) return settleQueueStatus(state);
  const index = state.items.findIndex((item) => item.status === 'PENDING');
  if (index < 0) return settleQueueStatus(state);

  const items = state.items.map((item, itemIndex) => itemIndex === index
    ? { ...item, status: 'RUNNING' as const, attempts: item.attempts + 1, error: null }
    : item);
  return { ...state, status: 'RUNNING', items };
}

/**
 * Settles the one running item. Failures are isolated to that frame; remaining pending frames stay
 * available for the next sequential start.
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
    return { ...item, status: 'SUCCEEDED', error: null, skipReason: null };
  });

  return settleQueueStatus({ ...state, items });
}

/**
 * Requests cancellation without interrupting an in-flight frame transaction. Pending frames are
 * cancelled immediately; the running frame can finish/rollback safely before the queue settles.
 */
export function requestBatchCancel(state: BatchQueueState): BatchQueueState {
  const items = state.items.map((item): BatchQueueItem => item.status === 'PENDING'
    ? { ...item, status: 'CANCELLED' }
    : item);
  return settleQueueStatus({ ...state, items, cancelRequested: true });
}

/**
 * Resumes a cancelled/completed queue without repeating successful or version-matched skipped work.
 * Failed items are retried by default; callers may keep them failed for inspection.
 */
export function resumeBatchQueue(
  state: BatchQueueState,
  options: { retryFailed?: boolean } = {},
): BatchQueueState {
  const retryFailed = options.retryFailed ?? true;
  const items = state.items.map((item): BatchQueueItem => {
    if (item.status === 'CANCELLED' || (retryFailed && item.status === 'FAILED')) {
      return { ...item, status: 'PENDING', error: null };
    }
    return item;
  });
  return settleQueueStatus({ ...state, items, cancelRequested: false });
}

export function summarizeBatchQueue(state: BatchQueueState): BatchQueueSummary {
  const count = (status: BatchItemStatus) => state.items.filter((item) => item.status === status).length;
  const total = state.items.length;
  const pending = count('PENDING');
  const running = count('RUNNING');
  const succeeded = count('SUCCEEDED');
  const failed = count('FAILED');
  const skipped = count('SKIPPED');
  const cancelled = count('CANCELLED');
  const finished = succeeded + failed + skipped + cancelled;

  return {
    total,
    pending,
    running,
    succeeded,
    failed,
    skipped,
    cancelled,
    finished,
    progressPct: total === 0 ? 100 : Math.round((finished / total) * 100),
  };
}
