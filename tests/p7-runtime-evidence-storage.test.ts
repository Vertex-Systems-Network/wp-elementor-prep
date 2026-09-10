import { describe, expect, it } from 'vitest';
import type { P7RuntimeEvidenceSnapshot } from '../src/core/batch-runtime-evidence';
import {
  loadLatestP7RuntimeEvidence,
  persistP7RuntimeEvidenceBestEffort,
  P7_RUNTIME_EVIDENCE_STORAGE_KEY,
  type P7EvidenceKeyValueStorage,
} from '../src/plugin/p7-runtime-evidence-session';

class MemoryStorage implements P7EvidenceKeyValueStorage {
  values = new Map<string, unknown>();
  failReads = false;
  failWrites = false;
  writes = 0;

  async getAsync(key: string): Promise<unknown> {
    if (this.failReads) throw new Error('read failed');
    return this.values.get(key);
  }

  async setAsync(key: string, value: unknown): Promise<void> {
    this.writes += 1;
    if (this.failWrites) throw new Error('write failed');
    this.values.set(key, value);
  }
}

function snapshot(): P7RuntimeEvidenceSnapshot {
  return {
    schemaVersion: 1,
    runKey: 'run-key',
    startedAt: '2026-09-08T00:00:00.000Z',
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
  };
}

describe('P7 runtime evidence storage', () => {
  it('persists and reloads a valid bounded snapshot', async () => {
    const storage = new MemoryStorage();
    const evidence = snapshot();

    expect(await persistP7RuntimeEvidenceBestEffort(storage, evidence)).toBe(true);
    expect(storage.writes).toBe(1);
    expect(await loadLatestP7RuntimeEvidence(storage)).toEqual(evidence);
  });

  it('returns false rather than throwing when evidence persistence fails', async () => {
    const storage = new MemoryStorage();
    storage.failWrites = true;

    await expect(persistP7RuntimeEvidenceBestEffort(storage, snapshot())).resolves.toBe(false);
    expect(storage.writes).toBe(1);
  });

  it('returns null on storage read failure or corrupt evidence', async () => {
    const storage = new MemoryStorage();
    storage.failReads = true;
    await expect(loadLatestP7RuntimeEvidence(storage)).resolves.toBeNull();

    storage.failReads = false;
    storage.values.set(P7_RUNTIME_EVIDENCE_STORAGE_KEY, { schemaVersion: 99, runKey: 'future' });
    await expect(loadLatestP7RuntimeEvidence(storage)).resolves.toBeNull();
  });
});
