import { describe, expect, it } from 'vitest';
import {
  createBatchQueue,
  finishRunningBatchItem,
  startNextBatchItem,
  type BatchQueueState,
} from '../src/core/batch-queue';
import {
  P7RuntimeEvidenceRecorder,
  type P7RuntimeEvidenceClock,
} from '../src/core/batch-runtime-evidence';
import { runP7BatchRuntime } from '../src/plugin/p7-batch-runtime';

function manualClock(start = 1_000): P7RuntimeEvidenceClock & { advance(ms: number): void } {
  let now = start;
  return {
    nowMs: () => now,
    nowIso: () => new Date(now).toISOString(),
    advance(ms: number) {
      now += ms;
    },
  };
}

function runningQueue(frameId = 'frame-1'): BatchQueueState {
  return startNextBatchItem(createBatchQueue([{ frameId, frameName: 'Frame' }], 'run-key'));
}

describe('P7 runtime evidence recorder', () => {
  it('observes one processor attempt without changing its checkpoint outcome', async () => {
    const clock = manualClock();
    const memorySamples = [100, 120, 180, 160];
    const recorder = new P7RuntimeEvidenceRecorder('run-key', {
      clock,
      memorySampler: () => memorySamples.shift() ?? 160,
    });

    const processor = recorder.wrapProcessor(async (item) => {
      clock.advance(25);
      return {
        status: 'CHECKPOINT_PENDING',
        committedFrameId: `${item.frameId}-committed`,
      };
    });

    const item = runningQueue().items.find((candidate) => candidate.status === 'RUNNING');
    if (!item) throw new Error('fixture running item missing');
    const outcome = await processor(item);
    const evidence = recorder.snapshot();

    expect(outcome).toEqual({ status: 'CHECKPOINT_PENDING', committedFrameId: 'frame-1-committed' });
    expect(evidence.attempts).toHaveLength(1);
    expect(evidence.attempts[0]).toMatchObject({
      frameIdAtStart: 'frame-1',
      outcome: 'CHECKPOINT_PENDING',
      committedFrameId: 'frame-1-committed',
      durationMs: 25,
    });
    expect(evidence.maxConcurrentProcessors).toBe(1);
    expect(evidence.memorySamplingSupported).toBe(true);
    expect(evidence.observedPeakUsedJsHeapBytesAtSamplePoints).toBe(120);
  });

  it('records a thrown processor as evidence while preserving the throw', async () => {
    const clock = manualClock();
    const recorder = new P7RuntimeEvidenceRecorder('run-key', { clock });
    const processor = recorder.wrapProcessor(async () => {
      clock.advance(10);
      throw new Error('synthetic validator crash');
    });
    const item = runningQueue().items.find((candidate) => candidate.status === 'RUNNING');
    if (!item) throw new Error('fixture running item missing');

    await expect(processor(item)).rejects.toThrow('synthetic validator crash');
    const attempt = recorder.snapshot().attempts[0];
    expect(attempt?.outcome).toBe('THREW');
    expect(attempt?.error).toBe('synthetic validator crash');
    expect(attempt?.durationMs).toBe(10);
  });

  it('counts one checkpoint pause transition rather than duplicate paused snapshots', () => {
    const recorder = new P7RuntimeEvidenceRecorder('run-key');
    let state = runningQueue();
    state = finishRunningBatchItem(state, {
      status: 'CHECKPOINT_PENDING',
      committedFrameId: 'committed',
    });

    recorder.observeState(state);
    recorder.observeState({ ...state, items: state.items.map((item) => ({ ...item })) });

    expect(recorder.snapshot(state).checkpointPauseCount).toBe(1);
  });

  it('records cancellation requested during an active frame and final cancelled settlement', () => {
    const clock = manualClock();
    const recorder = new P7RuntimeEvidenceRecorder('run-key', { clock });
    const active = runningQueue();

    recorder.markCancellationRequested(active);
    clock.advance(40);
    const cancelled: BatchQueueState = {
      ...active,
      status: 'CANCELLED',
      cancelRequested: true,
      items: active.items.map((item) => ({ ...item, status: 'CANCELLED' as const })),
    };
    recorder.observeState(cancelled);

    expect(recorder.snapshot(cancelled).cancellation).toEqual({
      requestedAt: new Date(1_000).toISOString(),
      activeFrameIdAtRequest: 'frame-1',
      settledAt: new Date(1_040).toISOString(),
      finalStatus: 'CANCELLED',
    });
  });

  it('bounds per-attempt evidence while retaining aggregate processor time', async () => {
    const clock = manualClock();
    const recorder = new P7RuntimeEvidenceRecorder('run-key', {
      clock,
      maxAttemptRecords: 2,
    });
    const processor = recorder.wrapProcessor(async () => {
      clock.advance(5);
      return { status: 'SUCCEEDED' } as const;
    });

    for (let index = 0; index < 3; index += 1) {
      const item = {
        frameId: `frame-${index}`,
        frameName: `Frame ${index}`,
        status: 'RUNNING' as const,
        attempts: 1,
        error: null,
        skipReason: null,
      };
      await processor(item);
    }

    const evidence = recorder.snapshot();
    expect(evidence.attempts).toHaveLength(2);
    expect(evidence.attemptEvidenceTruncated).toBe(true);
    expect(evidence.totalProcessorMs).toBe(15);
  });

  it('composes with the P7 runtime without altering sequential completion', async () => {
    const clock = manualClock();
    const recorder = new P7RuntimeEvidenceRecorder('run-key', { clock });
    const queue = createBatchQueue([
      { frameId: '1', frameName: 'One' },
      { frameId: '2', frameName: 'Two' },
      { frameId: '3', frameName: 'Three' },
    ], 'run-key');

    const result = await runP7BatchRuntime(queue, async () => {
      clock.advance(7);
      return { status: 'SUCCEEDED' };
    }, {
      checkpointPauseReason: async () => null,
      evidenceRecorder: recorder,
    });

    const evidence = recorder.snapshot(result);
    expect(result.status).toBe('COMPLETED');
    expect(result.items.every((item) => item.status === 'SUCCEEDED')).toBe(true);
    expect(evidence.segmentCount).toBe(1);
    expect(evidence.attempts).toHaveLength(3);
    expect(evidence.totalProcessorMs).toBe(21);
    expect(evidence.maxConcurrentProcessors).toBe(1);
    expect(evidence.finalStatus).toBe('COMPLETED');
    expect(evidence.finalFinishedCount).toBe(3);
    expect(evidence.finalTotalCount).toBe(3);
  });

  it('records checkpoint resolution live-id handoff without changing state', () => {
    const recorder = new P7RuntimeEvidenceRecorder('run-key');
    let before = runningQueue('source');
    before = finishRunningBatchItem(before, {
      status: 'CHECKPOINT_PENDING',
      committedFrameId: 'candidate',
    });
    const after: BatchQueueState = {
      ...before,
      status: 'IDLE',
      pauseReason: null,
      items: before.items.map((item) => ({
        ...item,
        frameId: 'candidate',
        status: 'PENDING' as const,
      })),
    };

    recorder.markCheckpointResolution('FINALIZED_CONTINUE', before, after);
    expect(recorder.snapshot(after).checkpointResolutions[0]).toMatchObject({
      resolution: 'FINALIZED_CONTINUE',
      frameIdBefore: 'candidate',
      frameIdAfter: 'candidate',
    });
  });

  it('tracks checkpoint live-id handoff by stable queue index when frame names duplicate', () => {
    const recorder = new P7RuntimeEvidenceRecorder('run-key');
    let before = createBatchQueue([
      { frameId: 'first', frameName: 'Duplicate' },
      { frameId: 'second', frameName: 'Duplicate' },
    ], 'run-key');
    before = startNextBatchItem(before);
    before = finishRunningBatchItem(before, { status: 'SUCCEEDED' });
    before = startNextBatchItem(before);
    before = finishRunningBatchItem(before, {
      status: 'CHECKPOINT_PENDING',
      committedFrameId: 'second-candidate',
    });

    const after: BatchQueueState = {
      ...before,
      status: 'IDLE',
      pauseReason: null,
      items: before.items.map((item, index) => index === 1
        ? { ...item, frameId: 'second-candidate', status: 'PENDING' as const }
        : { ...item }),
    };

    recorder.markCheckpointResolution('FINALIZED_CONTINUE', before, after);
    expect(recorder.snapshot(after).checkpointResolutions[0]).toMatchObject({
      resolution: 'FINALIZED_CONTINUE',
      frameIdBefore: 'second-candidate',
      frameIdAfter: 'second-candidate',
    });
  });
});
