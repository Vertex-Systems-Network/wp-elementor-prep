import { describe, expect, it } from 'vitest';
import { P5_RUNTIME_PROOF_STORAGE_KEY } from '../src/core/p5-runtime-gate';
import type { P5RuntimeCalibrationResult } from '../src/plugin/p5-runtime-calibration';
import {
  updateP5RuntimeProofFromCalibration,
  type P5RuntimeProofStorage,
} from '../src/plugin/p5-runtime-proof-storage';

const BUILD = {
  sourceSha: '0123456789abcdef0123456789abcdef01234567',
  runId: '34219111842',
  runNumber: '309',
};

function passingEvidence(): P5RuntimeCalibrationResult {
  return {
    schemaVersion: 1,
    passed: true,
    forcedReject: {
      state: 'REJECTED',
      validationRejected: true,
      pixelEvidenceReturned: true,
      changedPixelPct: 2.5,
      candidateDeleted: true,
      originalUntouched: true,
    },
    passRestore: {
      state: 'COMMITTED',
      validationPassed: true,
      pixelEvidenceReturned: true,
      changedPixelPct: 0,
      committed: true,
      restored: true,
      checkpointCleared: true,
    },
    passFinalize: {
      state: 'COMMITTED',
      validationPassed: true,
      pixelEvidenceReturned: true,
      changedPixelPct: 0,
      committed: true,
      finalized: true,
      candidateRetained: true,
      originalDiscarded: true,
      checkpointCleared: true,
    },
    leftovers: 0,
  };
}

class MemoryStorage implements P5RuntimeProofStorage {
  values = new Map<string, unknown>();
  setCalls = 0;
  deleteCalls = 0;

  async setAsync(key: string, value: unknown): Promise<void> {
    this.setCalls += 1;
    this.values.set(key, value);
  }

  async deleteAsync(key: string): Promise<void> {
    this.deleteCalls += 1;
    this.values.delete(key);
  }
}

describe('P5 runtime proof storage', () => {
  it('mints proof only when deterministic acceptance passes in a traceable CI build', async () => {
    const storage = new MemoryStorage();
    const assessment = await updateP5RuntimeProofFromCalibration(storage, passingEvidence(), BUILD);

    expect(assessment).toEqual({ accepted: true, failures: [] });
    expect(storage.setCalls).toBe(1);
    expect(storage.deleteCalls).toBe(0);
    expect(storage.values.get(P5_RUNTIME_PROOF_STORAGE_KEY)).toEqual(expect.objectContaining({
      schemaVersion: 1,
      gateVersion: 'p5-runtime-proof-v3',
      build: BUILD,
    }));
  });

  it('revokes proof when the top-level PASS conflicts with missing sub-evidence', async () => {
    const storage = new MemoryStorage();
    storage.values.set(P5_RUNTIME_PROOF_STORAGE_KEY, { stale: true });
    const evidence = passingEvidence();
    evidence.passFinalize.checkpointCleared = false;
    evidence.leftovers = 1;

    const assessment = await updateP5RuntimeProofFromCalibration(storage, evidence, BUILD);

    expect(assessment.accepted).toBe(false);
    expect(assessment.failures).toContain('Finalize path left a checkpoint pending.');
    expect(assessment.failures).toContain('Runtime calibration left 1 temporary node(s).');
    expect(storage.setCalls).toBe(0);
    expect(storage.deleteCalls).toBe(1);
    expect(storage.values.has(P5_RUNTIME_PROOF_STORAGE_KEY)).toBe(false);
  });

  it('refuses proof minting for a local or otherwise untraceable build', async () => {
    const storage = new MemoryStorage();
    const assessment = await updateP5RuntimeProofFromCalibration(storage, passingEvidence(), {
      sourceSha: 'local',
      runId: 'local',
      runNumber: 'local',
    });

    expect(assessment.accepted).toBe(false);
    expect(assessment.failures).toContain('P5 runtime self-test build is not bound to a traceable CI artifact.');
    expect(storage.setCalls).toBe(0);
    expect(storage.deleteCalls).toBe(1);
    expect(storage.values.has(P5_RUNTIME_PROOF_STORAGE_KEY)).toBe(false);
  });
});
