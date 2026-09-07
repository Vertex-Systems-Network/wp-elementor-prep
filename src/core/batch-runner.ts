import {
  finishRunningBatchItem,
  requestBatchCancel,
  startNextBatchItem,
  type BatchItemOutcome,
  type BatchQueueItem,
  type BatchQueueState,
} from './batch-queue';

export type BatchFrameProcessor = (item: BatchQueueItem) => Promise<BatchItemOutcome>;

export interface BatchRunnerOptions {
  /**
   * Polled only between frame transactions. A running single-frame transaction is never interrupted
   * by the batch layer; it must settle/rollback through its own canonical lifecycle first.
   */
  shouldCancel?: () => boolean;
  /** Receives immutable queue snapshots after meaningful state transitions. */
  onState?: (state: BatchQueueState) => void;
}

function copyState(state: BatchQueueState): BatchQueueState {
  return {
    ...state,
    items: state.items.map((item) => ({ ...item })),
  };
}

function notify(state: BatchQueueState, onState?: (state: BatchQueueState) => void): void {
  if (onState) onState(copyState(state));
}

function runningItem(state: BatchQueueState): BatchQueueItem | null {
  return state.items.find((item) => item.status === 'RUNNING') ?? null;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return 'Unknown batch frame processing failure';
}

/**
 * Runs the compact P7 queue strictly one frame at a time through an injected canonical single-frame
 * processor. The runner owns scheduling only; it does not audit, transform or commit Figma nodes.
 */
export async function runBatchQueue(
  initialState: BatchQueueState,
  processFrame: BatchFrameProcessor,
  options: BatchRunnerOptions = {},
): Promise<BatchQueueState> {
  let state = copyState(initialState);
  notify(state, options.onState);

  while (true) {
    if (options.shouldCancel?.()) {
      state = requestBatchCancel(state);
      notify(state, options.onState);
      return state;
    }

    state = startNextBatchItem(state);
    const item = runningItem(state);
    if (!item) {
      notify(state, options.onState);
      return state;
    }
    notify(state, options.onState);

    let outcome: BatchItemOutcome;
    try {
      outcome = await processFrame({ ...item });
    } catch (error) {
      outcome = { status: 'FAILED', error: errorMessage(error) };
    }

    state = finishRunningBatchItem(state, outcome);
    notify(state, options.onState);

    // Cancellation is intentionally observed only after the current frame transaction has settled.
    if (options.shouldCancel?.()) {
      state = requestBatchCancel(state);
      notify(state, options.onState);
      return state;
    }

    if (state.status === 'COMPLETED' || state.status === 'CANCELLED') return state;
  }
}
