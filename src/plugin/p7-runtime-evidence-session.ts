import type {
  BatchCheckpointResolution,
  BatchQueueState,
} from '../core/batch-queue';
import type {
  P7RuntimeEvidenceOptions,
  P7RuntimeEvidenceSnapshot,
  P7RuntimeMemorySampler,
} from '../core/batch-runtime-evidence';
import type { P7BatchRuntimeOptions } from './p7-batch-runtime';
import { createFigmaP7RuntimeEvidenceRecorder } from './p7-runtime-evidence';

export interface P7RuntimeEvidenceSessionOptions extends Omit<P7RuntimeEvidenceOptions, 'memorySampler'> {
  memorySampler?: P7RuntimeMemorySampler;
}

/**
 * Small plugin-facing integration seam around the observational P7 recorder.
 *
 * It does not own queue state and cannot change scheduler/mutation outcomes. The plugin controller
 * can keep one session for the lifetime of a prepared batch and feed it cancel/checkpoint events.
 */
export class P7RuntimeEvidenceSession {
  readonly recorder;

  constructor(
    runKey: string,
    options: P7RuntimeEvidenceSessionOptions = {},
  ) {
    this.recorder = createFigmaP7RuntimeEvidenceRecorder(runKey, options);
  }

  runtimeOptions(onState?: P7BatchRuntimeOptions['onState']): Pick<P7BatchRuntimeOptions, 'evidenceRecorder' | 'onState'> {
    return onState
      ? { evidenceRecorder: this.recorder, onState }
      : { evidenceRecorder: this.recorder };
  }

  markCancellationRequested(state: BatchQueueState): void {
    this.recorder.markCancellationRequested(state);
  }

  markCheckpointResolution(
    resolution: BatchCheckpointResolution,
    before: BatchQueueState,
    after: BatchQueueState,
  ): void {
    this.recorder.markCheckpointResolution(resolution, before, after);
  }

  snapshot(state?: BatchQueueState | null): P7RuntimeEvidenceSnapshot {
    return state === undefined ? this.recorder.snapshot() : this.recorder.snapshot(state);
  }
}

export function summarizeP7RuntimeEvidence(snapshot: P7RuntimeEvidenceSnapshot): string {
  const memory = snapshot.memorySamplingSupported
    ? `${snapshot.observedPeakUsedJsHeapBytesAtSamplePoints ?? 0} B sampled JS-heap peak`
    : 'JS-heap sampling unsupported';
  const cancelled = snapshot.cancellation
    ? ` · cancel ${snapshot.cancellation.finalStatus ?? 'pending'}`
    : '';

  return [
    `segments ${snapshot.segmentCount}`,
    `attempts ${snapshot.attempts.length}${snapshot.attemptEvidenceTruncated ? '+' : ''}`,
    `processor ${Math.round(snapshot.totalProcessorMs)} ms`,
    `max concurrency ${snapshot.maxConcurrentProcessors}`,
    `checkpoint pauses ${snapshot.checkpointPauseCount}`,
    memory,
  ].join(' · ') + cancelled;
}

export function serializeP7RuntimeEvidence(snapshot: P7RuntimeEvidenceSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}
