import { describe, expect, it } from 'vitest';
import type { P7RuntimeEvidenceSnapshot } from '../src/core/batch-runtime-evidence';
import { assessP7RuntimeAcceptance } from '../src/plugin/p7-runtime-acceptance';

const BUILD = {
  sourceSha: '0123456789abcdef0123456789abcdef01234567',
  runId: '34217708751',
  runNumber: '292',
};

function baseSnapshot(): P7RuntimeEvidenceSnapshot {
  return {
    schemaVersion: 1,
    build: { ...BUILD },
    runKey: 'run-key',
    startedAt: '2026-09-08T10:00:00.000Z',
    elapsedMs: 1000,
    segmentCount: 1,
    stateTransitionCount: 2,
    checkpointPauseCount: 0,
    totalProcessorMs: 900,
    maxConcurrentProcessors: 1,
    attemptEvidenceTruncated: false,
    attempts: [{
      sequence: 1,
      frameIdAtStart: 'frame-1',
      frameName: 'One',
      attempt: 1,
      startedAt: '2026-09-08T10:00:00.100Z',
      durationMs: 900,
      outcome: 'SUCCEEDED',
      committedFrameId: null,
      error: null,
      usedJsHeapBytesBefore: null,
      usedJsHeapBytesAfter: null,
    }],
    checkpointEvidenceTruncated: false,
    checkpointResolutions: [],
    cancellation: null,
    memorySamplingSupported: false,
    memorySampleCount: 0,
    observedPeakUsedJsHeapBytesAtSamplePoints: null,
    finalStatus: 'COMPLETED',
    finalFinishedCount: 60,
    finalTotalCount: 60,
  };
}

function passingCancellation(): P7RuntimeEvidenceSnapshot {
  const snapshot = baseSnapshot();
  snapshot.finalStatus = 'CANCELLED';
  snapshot.finalFinishedCount = 2;
  snapshot.finalTotalCount = 2;
  snapshot.cancellation = {
    requestedAt: '2026-09-08T10:00:00.500Z',
    activeFrameIdAtRequest: 'frame-1',
    settledAt: '2026-09-08T10:00:01.000Z',
    finalStatus: 'CANCELLED',
  };
  return snapshot;
}

describe('P7 runtime acceptance assessor', () => {
  it('accepts a completed 60+ Frame run plus active-frame cancellation from the same traceable build', () => {
    const assessment = assessP7RuntimeAcceptance({
      stress: baseSnapshot(),
      cancellation: passingCancellation(),
    });
    expect(assessment).toEqual({ accepted: true, failures: [] });
  });

  it('fails closed on missing or mismatched build provenance', () => {
    const stress = baseSnapshot();
    stress.build = null;
    const cancellation = passingCancellation();
    cancellation.build = { ...BUILD, runNumber: '293' };

    let assessment = assessP7RuntimeAcceptance({ stress, cancellation });
    expect(assessment.accepted).toBe(false);
    expect(assessment.failures).toContain('P7 stress evidence is not bound to a traceable CI build.');

    stress.build = { ...BUILD };
    assessment = assessP7RuntimeAcceptance({ stress, cancellation });
    expect(assessment.accepted).toBe(false);
    expect(assessment.failures).toContain('P7 stress and cancellation evidence were captured by different plugin builds.');
  });

  it('fails closed on concurrency, undersized stress, truncated evidence, or inter-frame cancellation', () => {
    const stress = baseSnapshot();
    stress.finalTotalCount = 59;
    stress.finalFinishedCount = 59;
    stress.maxConcurrentProcessors = 2;
    stress.attemptEvidenceTruncated = true;

    const cancellation = passingCancellation();
    cancellation.cancellation!.activeFrameIdAtRequest = null;

    const assessment = assessP7RuntimeAcceptance({ stress, cancellation });
    expect(assessment.accepted).toBe(false);
    expect(assessment.failures).toContain('P7 stress run contains 59 Frames; at least 60 are required.');
    expect(assessment.failures).toContain('P7 stress max processor concurrency is 2, expected exactly 1.');
    expect(assessment.failures).toContain('P7 stress attempt evidence was truncated.');
    expect(assessment.failures).toContain('P7 cancellation was not observed while a processor Frame was active.');
  });

  it('accepts truthful supported memory samples and rejects contradictory unsupported memory data', () => {
    const stress = baseSnapshot();
    stress.memorySamplingSupported = true;
    stress.memorySampleCount = 4;
    stress.observedPeakUsedJsHeapBytesAtSamplePoints = 123456;

    const cancellation = passingCancellation();
    cancellation.memorySampleCount = 1;

    const assessment = assessP7RuntimeAcceptance({ stress, cancellation });
    expect(assessment.accepted).toBe(false);
    expect(assessment.failures).toContain('P7 cancellation run reports unsupported memory sampling but has sample count 1.');
  });
});
