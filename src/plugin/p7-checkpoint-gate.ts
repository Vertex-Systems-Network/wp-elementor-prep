import { hasPendingSafeFixCheckpoint } from './safe-fix-runtime';

export const P7_CHECKPOINT_PAUSE_REASON = 'Resolve the pending P5 Safe Fix checkpoint by restoring or finalizing it before the batch continues.';

/**
 * Async inter-frame safety gate for P7.
 *
 * This is intentionally read-only: it never restores or finalizes on the user's behalf. The batch
 * pauses while P5 retains its bounded checkpoint and can resume only after that checkpoint is
 * explicitly resolved through the existing P5 controls.
 */
export async function p7CheckpointPauseReason(): Promise<string | null> {
  return await hasPendingSafeFixCheckpoint()
    ? P7_CHECKPOINT_PAUSE_REASON
    : null;
}
