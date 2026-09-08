import { describe, expect, it } from 'vitest';
import {
  createBatchQueue,
  finishRunningBatchItem,
  requestBatchCancel,
  resolveBatchCheckpoint,
  startNextBatchItem,
} from '../src/core/batch-queue';
import {
  P7RuntimeEvidenceSession,
  serializeP7RuntimeEvidence,
  summarizeP7RuntimeEvidence,
} from '../src/plugin/p7-runtime-evidence-session';

function runningQueue() {
  return startNextBatchItem(createBatchQueue([
    { frameId: 'frame-1', frameName: 'Frame 1' },
  ], 'run-key'));
}

describe('P7 runtime evidence plugin session', () => {
  it('injects the same observational recorder into runtime options without inventing an onState callback', () => {
    const session = new P7RuntimeEvidenceSession('run-key', { memorySampler: () => null });
    const withoutState = session.runtimeOptions();
    expect(withoutState.evidenceRecorder).toBe(session.recorder);
    expect('onState' in withoutState).toBe(false);

    const onState = () => undefined;
    const withState = session.runtimeOptions(onState);
    expect(withState.evidenceRecorder).toBe(session.recorder);
    expect(withState.onState).toBe(onState);
  });

  it('records cancellation request and final cancelled settlement without changing queue state itself', () => {
    const running = runningQueue();
    const session = new P7RuntimeEvidenceSession('run-key', { memorySampler: () => null });

    session.markCancellationRequested(running);
    const settled = finishRunningBatchItem(running, { status: 'SUCCEEDED' });
    const cancelled = requestBatchCancel(settled);
    session.recorder.observeState(cancelled);
    const snapshot = session.snapshot(cancelled);

    expect(snapshot.cancellation?.activeFrameIdAtRequest).toBe('frame-1');
    expect(snapshot.cancellation?.finalStatus).toBe('CANCELLED');
    expect(snapshot.memorySamplingSupported).toBe(false);
  });

  it('records checkpoint live-id continuity through restore', () => {
    const running = runningQueue();
    const awaiting = finishRunningBatchItem(running, {
      status: 'CHECKPOINT_PENDING',
      committedFrameId: 'frame-committed',
    });
    const restored = resolveBatchCheckpoint(awaiting, 'RESTORED', {
      resolvedFrameId: 'frame-restored',
    });
    const session = new P7RuntimeEvidenceSession('run-key', { memorySampler: () => null });

    session.markCheckpointResolution('RESTORED', awaiting, restored);
    const evidence = session.snapshot(restored);

    expect(evidence.checkpointResolutions).toHaveLength(1);
    expect(evidence.checkpointResolutions[0]).toMatchObject({
      resolution: 'RESTORED',
      frameIdBefore: 'frame-committed',
      frameIdAfter: 'frame-restored',
    });
  });

  it('formats explicit unsupported memory state and serializes the same evidence', () => {
    const state = createBatchQueue([], 'run-key');
    const session = new P7RuntimeEvidenceSession('run-key', { memorySampler: () => null });
    const snapshot = session.snapshot(state);

    expect(summarizeP7RuntimeEvidence(snapshot)).toContain('JS-heap sampling unsupported');
    expect(JSON.parse(serializeP7RuntimeEvidence(snapshot))).toMatchObject({
      schemaVersion: 1,
      runKey: 'run-key',
      memorySamplingSupported: false,
    });
  });

  it('reports only an actually sampled heap value as the sample-point peak', () => {
    let sample = 100;
    const session = new P7RuntimeEvidenceSession('run-key', {
      memorySampler: () => {
        sample += 50;
        return sample;
      },
    });
    session.recorder.beginSegment(createBatchQueue([], 'run-key'));
    const snapshot = session.snapshot();

    expect(snapshot.memorySamplingSupported).toBe(true);
    expect(snapshot.observedPeakUsedJsHeapBytesAtSamplePoints).toBeGreaterThanOrEqual(150);
    expect(summarizeP7RuntimeEvidence(snapshot)).toContain('sampled JS-heap peak');
  });
});
