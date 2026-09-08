import {
  resolveBatchCheckpoint,
  type BatchCheckpointResolution,
  type BatchQueueState,
} from '../core/batch-queue';
import type { CommitEvidence } from '../core/transaction-types';
import {
  recordCurrentFigmaP7CheckpointResolutionBestEffort,
} from './p7-runtime-evidence-session';
import { p7FrameHasMoreEligibleWork } from './p7-single-frame-processor';
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

export type P7CheckpointReaudit = (frameId: string) => Promise<boolean>;

const productionActions: P7CheckpointActions = {
  restore: restoreLastSafeFix,
  finalize: finalizeLastSafeFix,
};

function awaitingCheckpointItem(state: BatchQueueState) {
  return state.items.find((item) => item.status === 'AWAITING_CHECKPOINT') ?? null;
}

async function finishResolution(
  before: BatchQueueState,
  state: BatchQueueState,
  proof: P7CheckpointActionProof,
  resolution: BatchCheckpointResolution,
): Promise<P7CheckpointResolutionResult> {
  // Runtime evidence must never influence checkpoint correctness. The helper is a no-op when no
  // Figma evidence session exists and persists best-effort when one does.
  await recordCurrentFigmaP7CheckpointResolutionBestEffort(resolution, before, state);
  return { state, proof, resolution };
}

async function resolveAfterP5Action(
  state: BatchQueueState,
  resolution: BatchCheckpointResolution,
  actions: P7CheckpointActions,
): Promise<P7CheckpointResolutionResult> {
  if (!awaitingCheckpointItem(state)) {
    throw new Error('P7 batch has no frame awaiting checkpoint resolution.');
  }

  if (resolution === 'RESTORED') {
    const evidence = await actions.restore();
    if (!evidence?.committedNodeId) {
      throw new Error('P5 checkpoint restore returned no usable evidence; batch state was not advanced.');
    }
    return finishResolution(
      state,
      resolveBatchCheckpoint(state, 'RESTORED', { resolvedFrameId: evidence.committedNodeId }),
      { resolution: 'RESTORED', evidence },
      'RESTORED',
    );
  }

  const finalized = await actions.finalize();
  if (!finalized) {
    throw new Error('P5 checkpoint finalize returned false; batch state was not advanced.');
  }
  return finishResolution(
    state,
    resolveBatchCheckpoint(state, resolution),
    { resolution, finalized: true },
    resolution,
  );
}

/**
 * Restores the actual P5 checkpoint first. Only after that succeeds does the queue mark the frame as
 * SKIPPED/RESTORED_CHECKPOINT and switch identity back to the restored original Frame id.
 */
export function restoreP7BatchCheckpoint(
  state: BatchQueueState,
  actions: P7CheckpointActions = productionActions,
): Promise<P7CheckpointResolutionResult> {
  return resolveAfterP5Action(state, 'RESTORED', actions);
}

/**
 * Finalizes the actual P5 checkpoint first. Use this only when a caller has already proved the current
 * committed Frame has no additional eligible Safe Fix target; the queue becomes durable SUCCEEDED.
 */
export function finalizeP7BatchCheckpoint(
  state: BatchQueueState,
  actions: P7CheckpointActions = productionActions,
): Promise<P7CheckpointResolutionResult> {
  return resolveAfterP5Action(state, 'FINALIZED', actions);
}

/**
 * Finalizes the actual P5 checkpoint but returns the current committed Frame to PENDING so the
 * canonical processor can re-audit it for another eligible Safe Fix. No run-key metadata is allowed yet.
 */
export function finalizeAndContinueP7BatchCheckpoint(
  state: BatchQueueState,
  actions: P7CheckpointActions = productionActions,
): Promise<P7CheckpointResolutionResult> {
  return resolveAfterP5Action(state, 'FINALIZED_CONTINUE', actions);
}

/**
 * Production-safe checkpoint acceptance path. The committed Frame is re-audited read-only while the
 * bounded P5 checkpoint still exists. Only after that decision succeeds do we irreversibly finalize:
 * more eligible work -> FINALIZED_CONTINUE/PENDING; no more work -> FINALIZED/SUCCEEDED.
 *
 * Re-audit failure leaves the real P5 checkpoint untouched, so the user can still restore or retry.
 */
export async function finalizeP7BatchCheckpointAfterReaudit(
  state: BatchQueueState,
  reaudit: P7CheckpointReaudit = p7FrameHasMoreEligibleWork,
  actions: P7CheckpointActions = productionActions,
): Promise<P7CheckpointResolutionResult> {
  const awaiting = awaitingCheckpointItem(state);
  if (!awaiting) throw new Error('P7 batch has no frame awaiting checkpoint resolution.');

  const hasMoreEligibleWork = await reaudit(awaiting.frameId);
  return resolveAfterP5Action(
    state,
    hasMoreEligibleWork ? 'FINALIZED_CONTINUE' : 'FINALIZED',
    actions,
  );
}
