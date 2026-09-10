import { describe, expect, it } from 'vitest';
import type { P7RuntimeEvidenceSnapshot } from '../src/core/batch-runtime-evidence';
import {
  loadLatestP7RuntimeEvidence,
  loadP7RuntimeAcceptanceEvidence,
  persistP7RuntimeEvidenceBestEffort,
  P7_RUNTIME_CANCELLATION_EVIDENCE_STORAGE_KEY,
  P7_RUNTIME_EVIDENCE_STORAGE_KEY,
  P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY,
  type P7EvidenceKeyValueStorage,
} from '../src/plugin/p7-runtime-evidence-session';

class MemoryStorage implements P7EvidenceKeyValueStorage {
  values = new Map<string, unknown>();
  failOnKey: string | null = null;

  async getAsync(key: string): Promise<unknown> {
    return this.values.get(key);
  }

  async setAsync(key: string, value: unknown): Promise<void> {
    if (key === this.failOnKey) throw new Error(`write failed for ${key}`);
    this.values.set(key, value);
  }
}

function snapshot(overrides: Partial<P7RuntimeEvidenceSnapshot> = {}): P7RuntimeEvidenceSnapshot {
  return {
    schemaVersion: 1,
    runKey: 'run-key',
    startedAt: '2026-09-08T10:00:00.000Z',
    elapsedMs: 100,
    segmentCount: 1,
    stateTransitionCount: 2,
    checkpointPauseCount: 0,
    totalProcessorMs: 80,
    maxConcurrentProcessors: 1,
    attemptEvidenceTruncated: false,
    attempts: [],
    checkpointEvidenceTruncated: false,
    checkpointResolutions: [],
    cancellation: null,
    memorySamplingSupported: false,
    memorySampleCount: 0,
    observedPeakUsedJsHeapBytesAtSamplePoints: null,
    finalStatus: 'COMPLETED',
    finalFinishedCount: 1,
    finalTotalCount: 1,
    ...overrides,
  };
}

function stressSnapshot(label: string): P7RuntimeEvidenceSnapshot {
  return snapshot({
    runKey: `stress-${label}`,
    finalStatus: 'COMPLETED',
    finalFinishedCount: 60,
    finalTotalCount: 60,
  });
}

function activeCancellation(label: string): P7RuntimeEvidenceSnapshot {
  return snapshot({
    runKey: `cancel-${label}`,
    finalStatus: 'CANCELLED',
    finalFinishedCount: 2,
    finalTotalCount: 2,
    cancellation: {
      requestedAt: '2026-09-08T10:00:00.050Z',
      activeFrameIdAtRequest: 'frame-1',
      settledAt: '2026-09-08T10:00:00.100Z',
      finalStatus: 'CANCELLED',
    },
  });
}

describe('P7 retained runtime acceptance evidence', () => {
  it('retains a 60+ completed stress run while later small runs only replace the legacy latest slot', async () => {
    const storage = new MemoryStorage();
    const stress = stressSnapshot('good');
    const small = snapshot({ runKey: 'small-later' });

    expect(await persistP7RuntimeEvidenceBestEffort(storage, stress)).toBe(true);
    expect(await persistP7RuntimeEvidenceBestEffort(storage, small)).toBe(true);

    expect(await loadLatestP7RuntimeEvidence(storage)).toEqual(small);
    expect(await loadLatestP7RuntimeEvidence(storage, P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY)).toEqual(stress);
  });

  it('retains active-frame cancellation evidence while an inter-frame cancellation cannot overwrite it', async () => {
    const storage = new MemoryStorage();
    const active = activeCancellation('active');
    const interFrame = snapshot({
      runKey: 'cancel-interframe',
      finalStatus: 'CANCELLED',
      finalFinishedCount: 2,
      finalTotalCount: 2,
      cancellation: {
        requestedAt: '2026-09-08T10:01:00.000Z',
        activeFrameIdAtRequest: null,
        settledAt: '2026-09-08T10:01:00.010Z',
        finalStatus: 'CANCELLED',
      },
    });

    expect(await persistP7RuntimeEvidenceBestEffort(storage, active)).toBe(true);
    expect(await persistP7RuntimeEvidenceBestEffort(storage, interFrame)).toBe(true);

    expect(await loadLatestP7RuntimeEvidence(storage)).toEqual(interFrame);
    expect(await loadLatestP7RuntimeEvidence(storage, P7_RUNTIME_CANCELLATION_EVIDENCE_STORAGE_KEY)).toEqual(active);
  });

  it('loads stress and cancellation acceptance scenarios together', async () => {
    const storage = new MemoryStorage();
    const stress = stressSnapshot('pair');
    const cancellation = activeCancellation('pair');

    await persistP7RuntimeEvidenceBestEffort(storage, stress);
    await persistP7RuntimeEvidenceBestEffort(storage, cancellation);

    expect(await loadP7RuntimeAcceptanceEvidence(storage)).toEqual({ stress, cancellation });
    expect(storage.values.get(P7_RUNTIME_EVIDENCE_STORAGE_KEY)).toEqual(cancellation);
  });

  it('reports false if a qualifying secondary-slot write fails but never throws', async () => {
    const storage = new MemoryStorage();
    storage.failOnKey = P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY;
    const stress = stressSnapshot('failure');

    await expect(persistP7RuntimeEvidenceBestEffort(storage, stress)).resolves.toBe(false);
    expect(storage.values.get(P7_RUNTIME_EVIDENCE_STORAGE_KEY)).toEqual(stress);
    expect(storage.values.has(P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY)).toBe(false);
  });
});
