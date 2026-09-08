import type {
  BatchCheckpointResolution,
  BatchItemOutcome,
  BatchQueueItem,
  BatchQueueState,
  BatchQueueStatus,
} from './batch-queue';
import type { BatchFrameProcessor } from './batch-runner';

export type P7RuntimeMemorySampler = () => number | null;

export interface P7RuntimeEvidenceClock {
  nowMs(): number;
  nowIso(): string;
}

export type P7RuntimeAttemptOutcome = BatchItemOutcome['status'] | 'THREW';

export interface P7RuntimeAttemptEvidence {
  sequence: number;
  frameIdAtStart: string;
  frameName: string;
  attempt: number;
  startedAt: string;
  durationMs: number;
  outcome: P7RuntimeAttemptOutcome;
  committedFrameId: string | null;
  error: string | null;
  usedJsHeapBytesBefore: number | null;
  usedJsHeapBytesAfter: number | null;
}

export interface P7RuntimeCheckpointEvidence {
  sequence: number;
  at: string;
  resolution: BatchCheckpointResolution;
  frameIdBefore: string | null;
  frameIdAfter: string | null;
}

export interface P7RuntimeCancellationEvidence {
  requestedAt: string;
  activeFrameIdAtRequest: string | null;
  settledAt: string | null;
  finalStatus: BatchQueueStatus | null;
}

export interface P7RuntimeEvidenceSnapshot {
  schemaVersion: 1;
  runKey: string;
  startedAt: string;
  elapsedMs: number;
  segmentCount: number;
  stateTransitionCount: number;
  checkpointPauseCount: number;
  totalProcessorMs: number;
  maxConcurrentProcessors: number;
  attemptEvidenceTruncated: boolean;
  attempts: P7RuntimeAttemptEvidence[];
  checkpointEvidenceTruncated: boolean;
  checkpointResolutions: P7RuntimeCheckpointEvidence[];
  cancellation: P7RuntimeCancellationEvidence | null;
  memorySamplingSupported: boolean;
  memorySampleCount: number;
  observedPeakUsedJsHeapBytesAtSamplePoints: number | null;
  finalStatus: BatchQueueStatus | null;
  finalFinishedCount: number | null;
  finalTotalCount: number | null;
}

export interface P7RuntimeEvidenceOptions {
  clock?: P7RuntimeEvidenceClock;
  memorySampler?: P7RuntimeMemorySampler;
  maxAttemptRecords?: number;
  maxCheckpointRecords?: number;
}

function defaultClock(): P7RuntimeEvidenceClock {
  return {
    nowMs: () => Date.now(),
    nowIso: () => new Date().toISOString(),
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return 'Unknown processor error';
}

function finishedCount(state: BatchQueueState): number {
  return state.items.filter((item) => (
    item.status === 'SUCCEEDED'
    || item.status === 'FAILED'
    || item.status === 'SKIPPED'
    || item.status === 'CANCELLED'
  )).length;
}

/**
 * Bounded runtime evidence recorder for real P7 calibration runs.
 *
 * It never changes scheduler outcomes. Memory values are recorded only when an injected sampler
 * returns a finite non-negative byte count; unsupported environments remain explicitly null/false.
 */
export class P7RuntimeEvidenceRecorder {
  private readonly clock: P7RuntimeEvidenceClock;
  private readonly memorySampler: P7RuntimeMemorySampler | undefined;
  private readonly maxAttemptRecords: number;
  private readonly maxCheckpointRecords: number;
  private readonly startedAtMs: number;
  private readonly startedAtIso: string;
  private segmentCount = 0;
  private stateTransitionCount = 0;
  private checkpointPauseCount = 0;
  private totalProcessorMs = 0;
  private activeProcessors = 0;
  private maxConcurrentProcessors = 0;
  private attemptSequence = 0;
  private checkpointSequence = 0;
  private attempts: P7RuntimeAttemptEvidence[] = [];
  private attemptEvidenceTruncated = false;
  private checkpointResolutions: P7RuntimeCheckpointEvidence[] = [];
  private checkpointEvidenceTruncated = false;
  private memorySamplingSupported = false;
  private memorySampleCount = 0;
  private observedPeakUsedJsHeapBytes: number | null = null;
  private cancellation: P7RuntimeCancellationEvidence | null = null;
  private lastState: BatchQueueState | null = null;
  private lastObservedCheckpointPause = false;

  constructor(
    readonly runKey: string,
    options: P7RuntimeEvidenceOptions = {},
  ) {
    this.clock = options.clock ?? defaultClock();
    this.memorySampler = options.memorySampler;
    this.maxAttemptRecords = Math.max(1, Math.floor(options.maxAttemptRecords ?? 500));
    this.maxCheckpointRecords = Math.max(1, Math.floor(options.maxCheckpointRecords ?? 500));
    this.startedAtMs = this.clock.nowMs();
    this.startedAtIso = this.clock.nowIso();
  }

  private sampleMemory(): number | null {
    if (!this.memorySampler) return null;
    let sample: number | null;
    try {
      sample = this.memorySampler();
    } catch {
      return null;
    }
    if (typeof sample !== 'number' || !Number.isFinite(sample) || sample < 0) return null;
    this.memorySamplingSupported = true;
    this.memorySampleCount += 1;
    this.observedPeakUsedJsHeapBytes = this.observedPeakUsedJsHeapBytes === null
      ? sample
      : Math.max(this.observedPeakUsedJsHeapBytes, sample);
    return sample;
  }

  beginSegment(state: BatchQueueState): void {
    this.segmentCount += 1;
    this.lastState = state;
    this.sampleMemory();
  }

  observeState(state: BatchQueueState): void {
    this.stateTransitionCount += 1;
    const checkpointPause = state.status === 'PAUSED'
      && state.items.some((item) => item.status === 'AWAITING_CHECKPOINT');
    if (checkpointPause && !this.lastObservedCheckpointPause) this.checkpointPauseCount += 1;
    this.lastObservedCheckpointPause = checkpointPause;
    this.lastState = state;
    this.sampleMemory();

    if (this.cancellation && !this.cancellation.settledAt && state.status === 'CANCELLED') {
      this.cancellation = {
        ...this.cancellation,
        settledAt: this.clock.nowIso(),
        finalStatus: state.status,
      };
    }
  }

  endSegment(state: BatchQueueState): void {
    this.lastState = state;
    this.sampleMemory();
  }

  wrapProcessor(processFrame: BatchFrameProcessor): BatchFrameProcessor {
    return async (item: BatchQueueItem): Promise<BatchItemOutcome> => {
      const startedMs = this.clock.nowMs();
      const startedAt = this.clock.nowIso();
      const beforeMemory = this.sampleMemory();
      this.activeProcessors += 1;
      this.maxConcurrentProcessors = Math.max(this.maxConcurrentProcessors, this.activeProcessors);

      let outcome: BatchItemOutcome | null = null;
      let thrown: unknown = null;
      try {
        outcome = await processFrame(item);
        return outcome;
      } catch (error) {
        thrown = error;
        throw error;
      } finally {
        this.activeProcessors = Math.max(0, this.activeProcessors - 1);
        const durationMs = Math.max(0, this.clock.nowMs() - startedMs);
        this.totalProcessorMs += durationMs;
        const afterMemory = this.sampleMemory();
        this.attemptSequence += 1;

        const record: P7RuntimeAttemptEvidence = {
          sequence: this.attemptSequence,
          frameIdAtStart: item.frameId,
          frameName: item.frameName,
          attempt: item.attempts,
          startedAt,
          durationMs,
          outcome: outcome?.status ?? 'THREW',
          committedFrameId: outcome?.status === 'CHECKPOINT_PENDING' ? outcome.committedFrameId : null,
          error: outcome?.status === 'FAILED'
            ? outcome.error
            : (thrown ? errorMessage(thrown) : null),
          usedJsHeapBytesBefore: beforeMemory,
          usedJsHeapBytesAfter: afterMemory,
        };

        if (this.attempts.length < this.maxAttemptRecords) {
          this.attempts.push(record);
        } else {
          this.attemptEvidenceTruncated = true;
        }
      }
    };
  }

  markCancellationRequested(
    state: BatchQueueState,
    activeFrameIdOverride?: string | null,
  ): void {
    if (this.cancellation) return;
    const activeFrameId = activeFrameIdOverride !== undefined
      ? activeFrameIdOverride
      : state.items.find((item) => item.status === 'RUNNING')?.frameId ?? null;
    this.cancellation = {
      requestedAt: this.clock.nowIso(),
      activeFrameIdAtRequest: activeFrameId,
      settledAt: null,
      finalStatus: null,
    };
    this.sampleMemory();
  }

  markCheckpointResolution(
    resolution: BatchCheckpointResolution,
    before: BatchQueueState,
    after: BatchQueueState,
  ): void {
    this.checkpointSequence += 1;
    const beforeItem = before.items.find((item) => item.status === 'AWAITING_CHECKPOINT') ?? null;
    const afterItem = beforeItem
      ? after.items.find((item) => item.frameName === beforeItem.frameName) ?? null
      : null;
    const record: P7RuntimeCheckpointEvidence = {
      sequence: this.checkpointSequence,
      at: this.clock.nowIso(),
      resolution,
      frameIdBefore: beforeItem?.frameId ?? null,
      frameIdAfter: afterItem?.frameId ?? null,
    };

    if (this.checkpointResolutions.length < this.maxCheckpointRecords) {
      this.checkpointResolutions.push(record);
    } else {
      this.checkpointEvidenceTruncated = true;
    }
    this.lastState = after;
    this.sampleMemory();
  }

  snapshot(state: BatchQueueState | null = this.lastState): P7RuntimeEvidenceSnapshot {
    return {
      schemaVersion: 1,
      runKey: this.runKey,
      startedAt: this.startedAtIso,
      elapsedMs: Math.max(0, this.clock.nowMs() - this.startedAtMs),
      segmentCount: this.segmentCount,
      stateTransitionCount: this.stateTransitionCount,
      checkpointPauseCount: this.checkpointPauseCount,
      totalProcessorMs: this.totalProcessorMs,
      maxConcurrentProcessors: this.maxConcurrentProcessors,
      attemptEvidenceTruncated: this.attemptEvidenceTruncated,
      attempts: this.attempts.map((item) => ({ ...item })),
      checkpointEvidenceTruncated: this.checkpointEvidenceTruncated,
      checkpointResolutions: this.checkpointResolutions.map((item) => ({ ...item })),
      cancellation: this.cancellation ? { ...this.cancellation } : null,
      memorySamplingSupported: this.memorySamplingSupported,
      memorySampleCount: this.memorySampleCount,
      observedPeakUsedJsHeapBytesAtSamplePoints: this.observedPeakUsedJsHeapBytes,
      finalStatus: state?.status ?? null,
      finalFinishedCount: state ? finishedCount(state) : null,
      finalTotalCount: state?.items.length ?? null,
    };
  }
}
