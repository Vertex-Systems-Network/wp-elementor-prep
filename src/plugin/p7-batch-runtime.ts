import type { BatchQueueState } from '../core/batch-queue';
import type { P7RuntimeEvidenceRecorder } from '../core/batch-runtime-evidence';
import {
  runBatchQueue,
  type BatchFrameProcessor,
  type BatchRunnerOptions,
} from '../core/batch-runner';
import { p7CheckpointPauseReason } from './p7-checkpoint-gate';
import { createFigmaP7SingleFrameProcessor } from './p7-single-frame-processor';
import type { FullP3Validator } from './safe-fix-runtime';

export interface P7BatchRuntimeOptions extends Omit<BatchRunnerOptions, 'shouldPause'> {
  /** Test/integration seam. Production defaults to the real P5 pending-checkpoint query. */
  checkpointPauseReason?: () => string | null | Promise<string | null>;
  /** Optional additional safety gate composed after the P5 checkpoint gate. */
  additionalPauseReason?: BatchRunnerOptions['shouldPause'];
  /** Optional observer only. It must not influence processor outcomes or scheduling decisions. */
  evidenceRecorder?: P7RuntimeEvidenceRecorder;
}

/**
 * P7 runtime composition layer. The caller supplies one canonical single-frame processor; P7 owns
 * scheduling and inter-frame checkpoint policy only. Optional evidence recording is observational:
 * it wraps processor/state/cancellation observation but never authorizes, rejects or changes a mutation.
 */
export async function runP7BatchRuntime(
  initialState: BatchQueueState,
  processFrame: BatchFrameProcessor,
  options: P7BatchRuntimeOptions = {},
): Promise<BatchQueueState> {
  const checkpointPauseReason = options.checkpointPauseReason ?? p7CheckpointPauseReason;
  const {
    additionalPauseReason,
    evidenceRecorder,
    onState,
    shouldCancel,
    ...runnerOptions
  } = options;
  let lastState = initialState;
  let lastProcessorFrameId: string | null = null;
  evidenceRecorder?.beginSegment(initialState);

  const observedProcessor: BatchFrameProcessor = async (item) => {
    lastProcessorFrameId = item.frameId;
    return processFrame(item);
  };
  const instrumentedProcessor = evidenceRecorder
    ? evidenceRecorder.wrapProcessor(observedProcessor)
    : observedProcessor;

  const observedShouldCancel = shouldCancel
    ? () => {
      const requested = shouldCancel();
      if (requested) {
        const runningFrameId = lastState.items.find((item) => item.status === 'RUNNING')?.frameId;
        // Cancellation is intentionally polled by the scheduler only after the async processor has
        // settled. If the pre-frame poll was false and this post-frame poll is true, the request
        // arrived while the just-settled processor was active; retain that identity as evidence.
        evidenceRecorder?.markCancellationRequested(
          lastState,
          runningFrameId ?? lastProcessorFrameId,
        );
      }
      return requested;
    }
    : undefined;

  try {
    const state = await runBatchQueue(
      initialState,
      instrumentedProcessor,
      {
        ...runnerOptions,
        ...(observedShouldCancel ? { shouldCancel: observedShouldCancel } : {}),
        onState: (nextState) => {
          lastState = nextState;
          evidenceRecorder?.observeState(nextState);
          onState?.(nextState);
        },
        shouldPause: async (queueState) => {
          const checkpointReason = await checkpointPauseReason();
          if (checkpointReason) return checkpointReason;
          return await additionalPauseReason?.(queueState) ?? null;
        },
      },
    );
    lastState = state;
    return state;
  } finally {
    evidenceRecorder?.endSegment(lastState);
  }
}

/**
 * Production Figma entrypoint. It injects the processor that reuses P5's proof gate, fresh planner,
 * candidate transaction, Full P3 validation and checkpoint semantics. No P5 mutation logic is copied
 * into the batch scheduler.
 */
export function runFigmaP7BatchRuntime(
  initialState: BatchQueueState,
  validateFullP3: FullP3Validator,
  options: P7BatchRuntimeOptions = {},
): Promise<BatchQueueState> {
  return runP7BatchRuntime(
    initialState,
    createFigmaP7SingleFrameProcessor(validateFullP3),
    options,
  );
}
