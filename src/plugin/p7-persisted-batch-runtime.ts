import {
  createBatchQueue,
  resumeBatchQueue,
  type BatchQueueInput,
  type BatchQueueState,
} from '../core/batch-queue';
import type { BatchRunMetadata } from '../core/batch-run-metadata';
import {
  finalizeP7BatchCheckpointAfterReaudit,
  restoreP7BatchCheckpoint,
  type P7CheckpointActions,
  type P7CheckpointReaudit,
} from './p7-checkpoint-resolution';
import {
  runFigmaP7BatchRuntime,
  type P7BatchRuntimeOptions,
} from './p7-batch-runtime';
import {
  createFigmaP7RunMetadataStorage,
  type P7RunMetadataStorage,
} from './p7-run-metadata-storage';
import type { FullP3Validator } from './safe-fix-runtime';

export interface P7PersistenceStatus {
  ok: boolean;
  error: string | null;
  metadata: BatchRunMetadata | null;
}

export interface P7PersistedBatchResult {
  state: BatchQueueState;
  persistence: P7PersistenceStatus;
}

export type P7BatchExecutor = (state: BatchQueueState) => Promise<BatchQueueState>;

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return 'Unknown P7 run-metadata persistence failure.';
}

/**
 * Persist durable successes without changing scheduler/mutation state when storage fails. A failed
 * metadata write means future runs may safely re-audit work; it must never masquerade as a P5 rollback.
 */
export async function persistP7DurableSuccesses(
  state: BatchQueueState,
  storage: P7RunMetadataStorage,
  completedAt?: string,
): Promise<P7PersistenceStatus> {
  if (!state.items.some((item) => item.status === 'SUCCEEDED')) {
    return { ok: true, error: null, metadata: null };
  }

  try {
    const metadata = await storage.recordSuccessfulState(state, completedAt);
    return { ok: true, error: null, metadata };
  } catch (error) {
    return { ok: false, error: errorMessage(error), metadata: null };
  }
}

/** Hydrate compact success metadata before queue creation so current-version completed frames skip. */
export async function createPersistedP7Queue(
  inputs: BatchQueueInput[],
  runKey: string,
  storage: P7RunMetadataStorage,
): Promise<BatchQueueState> {
  const hydrated = await storage.hydrateInputs(inputs);
  return createBatchQueue(hydrated, runKey);
}

/** Generic persisted execution seam used by production and tests. */
export async function runPersistedP7Batch(
  state: BatchQueueState,
  execute: P7BatchExecutor,
  storage: P7RunMetadataStorage,
): Promise<P7PersistedBatchResult> {
  const next = await execute(state);
  return {
    state: next,
    persistence: await persistP7DurableSuccesses(next, storage),
  };
}

/**
 * Production initial-run entrypoint: metadata hydration -> compact queue -> canonical Figma P7 runtime
 * -> durable-success persistence.
 */
export async function startFigmaP7PersistedBatch(
  inputs: BatchQueueInput[],
  runKey: string,
  validateFullP3: FullP3Validator,
  options: P7BatchRuntimeOptions = {},
  storage: P7RunMetadataStorage = createFigmaP7RunMetadataStorage(),
): Promise<P7PersistedBatchResult> {
  const queue = await createPersistedP7Queue(inputs, runKey, storage);
  return runPersistedP7Batch(
    queue,
    (state) => runFigmaP7BatchRuntime(state, validateFullP3, options),
    storage,
  );
}

/** Resume ordinary retry/cancelled work, while unresolved checkpoints remain non-bypassable. */
export function resumeFigmaP7PersistedBatch(
  state: BatchQueueState,
  validateFullP3: FullP3Validator,
  options: P7BatchRuntimeOptions = {},
  storage: P7RunMetadataStorage = createFigmaP7RunMetadataStorage(),
): Promise<P7PersistedBatchResult> {
  return runPersistedP7Batch(
    resumeBatchQueue(state),
    (resumed) => runFigmaP7BatchRuntime(resumed, validateFullP3, options),
    storage,
  );
}

/**
 * Re-audit and finalize the real P5 checkpoint, then persist only if that transition produced a
 * durable SUCCEEDED frame. FINALIZED_CONTINUE remains retryable and receives no run key yet.
 */
export async function finalizeFigmaP7PersistedCheckpoint(
  state: BatchQueueState,
  storage: P7RunMetadataStorage = createFigmaP7RunMetadataStorage(),
  reaudit?: P7CheckpointReaudit,
  actions?: P7CheckpointActions,
): Promise<P7PersistedBatchResult> {
  const resolved = await finalizeP7BatchCheckpointAfterReaudit(
    state,
    reaudit,
    actions,
  );
  return {
    state: resolved.state,
    persistence: await persistP7DurableSuccesses(resolved.state, storage),
  };
}

/** Restore the real P5 checkpoint; restored work is never recorded as successful. */
export async function restoreFigmaP7PersistedCheckpoint(
  state: BatchQueueState,
  storage: P7RunMetadataStorage = createFigmaP7RunMetadataStorage(),
  actions?: P7CheckpointActions,
): Promise<P7PersistedBatchResult> {
  const resolved = await restoreP7BatchCheckpoint(state, actions);
  return {
    state: resolved.state,
    persistence: await persistP7DurableSuccesses(resolved.state, storage),
  };
}
