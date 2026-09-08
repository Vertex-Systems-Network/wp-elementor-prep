import { describe, expect, it } from 'vitest';
import type { P7RuntimeEvidenceSnapshot } from '../src/core/batch-runtime-evidence';
import { loadAndAssessP7RuntimeAcceptance } from '../src/plugin/p7-runtime-acceptance-loader';
import {
  P7_RUNTIME_CANCELLATION_EVIDENCE_STORAGE_KEY,
  P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY,
  type P7EvidenceKeyValueStorage,
} from '../src/plugin/p7-runtime-evidence-session';

const BUILD = {
  sourceSha: '0123456789abcdef0123456789abcdef01234567',
  runId: '34217708751',
  runNumber: '292',
};

class MemoryStorage implements P7EvidenceKeyValueStorage {
  values = new Map<string, unknown>();
  async getAsync(key: string): Promise<unknown> { return this.values.get(key); }
  async setAsync(key: string, value: unknown): Promise<void> { this.values.set(key, value); }
}

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

function cancellationSnapshot(): P7RuntimeEvidenceSnapshot {
  const value = baseSnapshot();
  value.finalStatus = 'CANCELLED';
  value.finalFinishedCount = 2;
  value.finalTotalCount = 2;
  value.cancellation = {
    requestedAt: '2026-09-08T10:00:00.500Z',
    activeFrameIdAtRequest: 'frame-1',
    settledAt: '2026-09-08T10:00:01.000Z',
    finalStatus: 'CANCELLED',
  };
  return value;
}

describe('P7 stored runtime acceptance loader', () => {
  it('fails closed and identifies both missing retained scenarios', async () => {
    const result = await loadAndAssessP7RuntimeAcceptance(new MemoryStorage());
    expect(result.accepted).toBe(false);
    expect(result.failures).toEqual([
      'No retained 60+ Frame completed stress-run evidence is available.',
      'No retained active-frame cancellation evidence is available.',
    ]);
  });

  it('reports which individual scenario is missing', async () => {
    const storage = new MemoryStorage();
    storage.values.set(P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY, baseSnapshot());

    const result = await loadAndAssessP7RuntimeAcceptance(storage);
    expect(result.accepted).toBe(false);
    expect(result.failures).toEqual(['No retained active-frame cancellation evidence is available.']);
  });

  it('accepts when both retained scenarios satisfy the deterministic runtime contract from the same build', async () => {
    const storage = new MemoryStorage();
    storage.values.set(P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY, baseSnapshot());
    storage.values.set(P7_RUNTIME_CANCELLATION_EVIDENCE_STORAGE_KEY, cancellationSnapshot());

    const result = await loadAndAssessP7RuntimeAcceptance(storage);
    expect(result.accepted).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.evidence.stress?.finalTotalCount).toBe(60);
    expect(result.evidence.cancellation?.finalStatus).toBe('CANCELLED');
  });
});
