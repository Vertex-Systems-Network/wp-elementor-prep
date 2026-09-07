import {
  resolveBatchCheckpoint,
  type BatchCheckpointResolution,
  type BatchQueueState,
} from '../core/batch-queue';
import type { CommitEvidence } from '../core/transaction-types';
import { finalizeLastSafeFix, restoreLastSafeFix } from './safe-fix-runtime';

export interface P7CheckpointActions {
  restore(): Promise<CommitEvidence | null>;
  finalize(): Promise<boolean>;
}

export type P7CheckpointActionProof =
  | { resolution: 'RESTORED'; evidence: CommitEvidence }
  | { resolution: 'FINALIZED' | 'FINALIZED_CONTINUE'; finalized: true };

export interface P7CheckpointResolutionResult {
  state: BatchQueueState;
  proof: P7CheckpointActionProof;
  resolution: BatchCheckpointResolution;
}

const productionActions: P7CheckpointActions = {
  restore: restoreLastSafeFix,
  finalize: finalizeLastSafeFix,
};

function hasAwaitingCheckpoint(state: BatchQueueState): boolean {
  return state.items.some((item) => item.status === 'AWAITING_CHECKPOINT');
}

async function resolveAfterP5Action(
  state: BatchQueueState,
  resolution: BatchCheckpointResolution,
  actions: P7CheckpointActions,
): Promise<P7CheckpointResolutionResult> {
  if (!hasAwaitingCheckpoint(state)) {
    throw new Error('P7 batch has no frame awaiting checkpoint resolution.');
  }

  if (resolution === 'RESTORED') {
    const evidence = await actions.restore();
    if (!evidence) {
      throw new Error('P5 checkpoint restore returned no evidence; batch state was not advanced.');
    }
    return {
      state: resolveBatchCheckpoint(state, 'RESTORED'),
      proof: { resolution: 'RESTORED', evidence },
      resolution: 'RESTORED',
    };
  }

  const finalized = await actions.finalize();
  if (!finalized) {
    throw new Error('P5 checkpoint finalize returned false; batch state was not advanced.');
  }
  return {
    state: resolveBatchCheckpoint(state, resolution),
    proof: { resolution, finalized: true },
    resolution,
  };
}

/**
 * Restores the actual P5 checkpoint first. Only after that succeeds does the queue mark the frame as
 * SKIPPED/RESTORED_CHECKPOINT, ensuring a failed restore cannot corrupt batch bookkeeping.
 */
export function restoreP7BatchCheckpoint(
  state: BatchQueueState,
  actions: P7CheckpointActions = productionActions,
): Promise<P7CheckpointResolutionResult> {
  return resolveAfterP5Action(state, 'RESTORED', actions);
}

/**
 * Finalizes the actual P5 checkpoint first. Use this only when re-audit already proves the frame has
 * no additional eligible Safe Fix target; the queue then marks it durable SUCCEEDED.
 */
export function finalizeP7BatchCheckpoint(
  state: BatchQueueState,
  actions: P7CheckpointActions = productionActions,
): Promise<P7CheckpointResolutionResult> {
  return resolveAfterP5Action(state, 'FINALIZED', actions);
}

/**
 * Finalizes the actual P5 checkpoint but returns the same frame to PENDING so the canonical processor
 * can re-audit it for another eligible Safe Fix. No successful run-key metadata is allowed yet.
 */
export function finalizeAndContinueP7BatchCheckpoint(
  state: BatchQueueState,
  actions: P7CheckpointActions = productionActions,
): Promise<P7CheckpointResolutionResult> {
  return resolveAfterP5Action(state, 'FINALIZED_CONTINUE', actions);
}
