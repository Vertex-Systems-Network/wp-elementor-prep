import { describe, expect, it } from 'vitest';
import type { P7RuntimeEvidenceSnapshot } from '../src/core/batch-runtime-evidence';
import {
  inspectLatestP7RuntimeEvidence,
  summarizeP7RuntimeEvidence,
} from '../src/plugin/p7-runtime-evidence-inspector';
import {
  P7_RUNTIME_CANCELLATION_EVIDENCE_STORAGE_KEY,
  P7_RUNTIME_EVIDENCE_STORAGE_KEY,
  P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY,
} from '../src/plugin/p7-runtime-evidence-session';

function snapshot(overrides: Partial<P7RuntimeEvidenceSnapshot> = {}): P7RuntimeEvidenceSnapshot {
  return {
    schemaVersion: 1,
    runKey: 'plugin=0.1.0-alpha.1|safe=1|batch=1|proof=p5-runtime-proof-v3',
    startedAt: '2026-09-08T01:00:00.000Z',
    elapsedMs: 12_000,
    segmentCount: 2,
    stateTransitionCount: 10,
    checkpointPauseCount: 1,
    totalProcessorMs: 9_500,
    maxConcurrentProcessors: 1,
    attemptEvidenceTruncated: false,
    attempts: [
      {
        sequence: 1,
        frameIdAtStart: 'frame-1',
        frameName: 'Frame One',
        attempt: 1,
        startedAt: '2026-09-08T01:00:01.000Z',
        durationMs: 9_500,
        outcome: 'SUCCEEDED',
        committedFrameId: null,
        error: null,
        usedJsHeapBytesBefore: 100,
        usedJsHeapBytesAfter: 120,
      },
    ],
    checkpointEvidenceTruncated: false,
    checkpointResolutions: [
      {
        sequence: 1,
        at: '2026-09-08T01:00:11.000Z',
        resolution: 'FINALIZED',
        frameIdBefore: 'candidate-1',
        frameIdAfter: 'candidate-1',
      },
    ],
    cancellation: null,
    memorySamplingSupported: true,
    memorySampleCount: 4,
    observedPeakUsedJsHeapBytesAtSamplePoints: 140,
    finalStatus: 'COMPLETED',
    finalFinishedCount: 1,
    finalTotalCount: 1,
    ...overrides,
  };
}

function storageWithLatest(value: unknown, extra: Record<string, unknown> = {}) {
  const values = new Map<string, unknown>([
    [P7_RUNTIME_EVIDENCE_STORAGE_KEY, value],
    ...Object.entries(extra),
  ]);
  return {
    async getAsync(key: string): Promise<unknown> {
      return values.get(key);
    },
    async setAsync(): Promise<void> {
      throw new Error('inspector must never write');
    },
  };
}

const missingAcceptance = {
  accepted: false,
  failures: [
    'No retained 60+ Frame completed stress-run evidence is available.',
    'No retained active-frame cancellation evidence is available.',
  ],
  stressEvidenceAvailable: false,
  cancellationEvidenceAvailable: false,
};

describe('P7 runtime evidence inspector', () => {
  it('returns EMPTY for absent or corrupt persisted evidence without writing', async () => {
    await expect(inspectLatestP7RuntimeEvidence(storageWithLatest(undefined))).resolves.toEqual({
      status: 'EMPTY',
      message: 'No valid persisted P7 runtime evidence is available for inspection.',
      acceptance: missingAcceptance,
    });

    await expect(inspectLatestP7RuntimeEvidence(storageWithLatest({ schemaVersion: 999 }))).resolves.toEqual({
      status: 'EMPTY',
      message: 'No valid persisted P7 runtime evidence is available for inspection.',
      acceptance: missingAcceptance,
    });
  });

  it('summarizes the bounded snapshot and emits reviewable pretty JSON', async () => {
    const persisted = snapshot();
    const result = await inspectLatestP7RuntimeEvidence(storageWithLatest(persisted));
    expect(result.status).toBe('AVAILABLE');
    if (result.status !== 'AVAILABLE') throw new Error('expected available evidence');

    expect(result.summary).toEqual({
      runKey: persisted.runKey,
      startedAt: persisted.startedAt,
      elapsedMs: 12_000,
      segmentCount: 2,
      recordedAttemptCount: 1,
      totalProcessorMs: 9_500,
      maxConcurrentProcessors: 1,
      checkpointPauseCount: 1,
      checkpointResolutionCount: 1,
      cancellationRequested: false,
      cancellationSettled: false,
      finalStatus: 'COMPLETED',
      finalFinishedCount: 1,
      finalTotalCount: 1,
      memorySamplingSupported: true,
      memorySampleCount: 4,
      observedPeakUsedJsHeapBytesAtSamplePoints: 140,
      attemptEvidenceTruncated: false,
      checkpointEvidenceTruncated: false,
    });
    expect(result.acceptance).toEqual(missingAcceptance);
    expect(result.warnings).toEqual([]);
    expect(JSON.parse(result.json)).toEqual(persisted);
    expect(result.json).toContain('\n  "runKey"');
  });

  it('reports retained acceptance PASS when both real-runtime scenario slots satisfy the contract', async () => {
    const stress = snapshot({ finalFinishedCount: 60, finalTotalCount: 60 });
    const cancellation = snapshot({
      finalStatus: 'CANCELLED',
      finalFinishedCount: 2,
      finalTotalCount: 2,
      cancellation: {
        requestedAt: '2026-09-08T01:00:05.000Z',
        activeFrameIdAtRequest: 'frame-1',
        settledAt: '2026-09-08T01:00:12.000Z',
        finalStatus: 'CANCELLED',
      },
    });

    const result = await inspectLatestP7RuntimeEvidence(storageWithLatest(cancellation, {
      [P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY]: stress,
      [P7_RUNTIME_CANCELLATION_EVIDENCE_STORAGE_KEY]: cancellation,
    }));
    expect(result.status).toBe('AVAILABLE');
    if (result.status !== 'AVAILABLE') throw new Error('expected available evidence');
    expect(result.acceptance).toEqual({
      accepted: true,
      failures: [],
      stressEvidenceAvailable: true,
      cancellationEvidenceAvailable: true,
    });
  });

  it('surfaces concurrency, truncation and unsettled-cancellation anomalies without changing evidence', () => {
    const persisted = snapshot({
      maxConcurrentProcessors: 2,
      attemptEvidenceTruncated: true,
      checkpointEvidenceTruncated: true,
      finalStatus: 'CANCELLED',
      cancellation: {
        requestedAt: '2026-09-08T01:00:05.000Z',
        activeFrameIdAtRequest: 'frame-1',
        settledAt: null,
        finalStatus: null,
      },
    });

    expect(summarizeP7RuntimeEvidence(persisted).maxConcurrentProcessors).toBe(2);
  });

  it('reports truthful unsupported-memory state rather than inventing a value', async () => {
    const result = await inspectLatestP7RuntimeEvidence(storageWithLatest(snapshot({
      memorySamplingSupported: false,
      memorySampleCount: 0,
      observedPeakUsedJsHeapBytesAtSamplePoints: null,
    })));
    expect(result.status).toBe('AVAILABLE');
    if (result.status !== 'AVAILABLE') throw new Error('expected available evidence');
    expect(result.summary.memorySamplingSupported).toBe(false);
    expect(result.summary.memorySampleCount).toBe(0);
    expect(result.summary.observedPeakUsedJsHeapBytesAtSamplePoints).toBeNull();
  });
});
