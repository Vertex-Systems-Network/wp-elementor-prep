import type { BatchQueueState } from '../core/batch-queue';
import {
  runBatchQueue,
  type BatchFrameProcessor,
  type BatchRunnerOptions,
} from '../core/batch-runner';
import { p7CheckpointPauseReason } from './p7-checkpoint-gate';

export interface P7BatchRuntimeOptions extends Omit<BatchRunnerOptions, 'shouldPause'> {
  /** Test/integration seam. Production defaults to the real P5 pending-checkpoint query. */
  checkpointPauseReason?: () => string | null | Promise<string | null>;
  /** Optional additional safety gate composed after the P5 checkpoint gate. */
  additionalPauseReason?: BatchRunnerOptions['shouldPause'];
}

/**
 * P7 runtime composition layer.
 *
 * This still requires an injected canonical single-frame processor; it does not duplicate P5 audit,
 * planning or mutation logic. The only production policy added here is that the real P5 bounded
 * checkpoint gate is evaluated between frames before any next item can start.
 */
export async function runP7BatchRuntime(
  initialState: BatchQueueState,
  processFrame: BatchFrameProcessor,
  options: P7BatchRuntimeOptions = {},
): Promise<BatchQueueState> {
  const checkpointPauseReason = options.checkpointPauseReason ?? p7CheckpointPauseReason;
  const { additionalPauseReason, ...runnerOptions } = options;

  return runBatchQueue(initialState, processFrame, {
    ...runnerOptions,
    shouldPause: async (state) => {
      const checkpointReason = await checkpointPauseReason();
      if (checkpointReason) return checkpointReason;
      return await additionalPauseReason?.(state) ?? null;
    },
  });
}
