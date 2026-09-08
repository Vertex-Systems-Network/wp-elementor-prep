import { describe, expect, it } from 'vitest';
import { P5_RUNTIME_PROOF_STORAGE_KEY } from '../src/core/p5-runtime-gate';
import type { P5RuntimeCalibrationResult } from '../src/plugin/p5-runtime-calibration';
import { updateP5RuntimeProofFromCalibration } from '../src/plugin/p5-runtime-proof-storage';
import { buildP5RuntimeEvidenceBundle } from '../src/plugin/p5-runtime-evidence';
import {
  loadLatestP5RuntimeEvidence,
  persistP5RuntimeEvidenceBestEffort,
  P5_RUNTIME_EVIDENCE_STORAGE_KEY,
} from '../src/plugin/p5-runtime-evidence-storage';
import { buildP5RuntimeEvidenceViewerHtml } from '../src/plugin/p5-runtime-evidence-viewer';

class MemoryStorage {
  values = new Map<string, unknown>();
  async getAsync(key: string): Promise<unknown> { return this.values.get(key); }
  async setAsync(key: string, value: unknown): Promise<void> { this.values.set(key, value); }
  async deleteAsync(key: string): Promise<void> { this.values.delete(key); }
}

function passingResult(): P5RuntimeCalibrationResult {
  return {
    schemaVersion: 1,
    passed: true,
    forcedReject: { state: 'REJECTED', validationRejected: true, pixelEvidenceReturned: true, changedPixelPct: 1, candidateDeleted: true, originalUntouched: true },
    passRestore: { state: 'COMMITTED', validationPassed: true, pixelEvidenceReturned: true, changedPixelPct: 0, committed: true, restored: true, checkpointCleared: true },
    passFinalize: { state: 'COMMITTED', validationPassed: true, pixelEvidenceReturned: true, changedPixelPct: 0, committed: true, finalized: true, candidateRetained: true, originalDiscarded: true, checkpointCleared: true },
    leftovers: 0,
  };
}

describe('P7 embedded P5 proof/evidence integration', () => {
  it('mints proof only after deterministic acceptance', async () => {
    const storage = new MemoryStorage();
    const accepted = await updateP5RuntimeProofFromCalibration(storage, passingResult());
    expect(accepted.accepted).toBe(true);
    expect(storage.values.has(P5_RUNTIME_PROOF_STORAGE_KEY)).toBe(true);

    const inconsistent = passingResult();
    inconsistent.passFinalize.checkpointCleared = false;
    const rejected = await updateP5RuntimeProofFromCalibration(storage, inconsistent);
    expect(rejected.accepted).toBe(false);
    expect(storage.values.has(P5_RUNTIME_PROOF_STORAGE_KEY)).toBe(false);
  });

  it('rejects invalid pixel evidence even when top-level self-test says PASS', async () => {
    const storage = new MemoryStorage();
    const inconsistent = passingResult();
    inconsistent.forcedReject.changedPixelPct = Number.NaN;
    const assessment = await updateP5RuntimeProofFromCalibration(storage, inconsistent);
    expect(assessment.accepted).toBe(false);
    expect(storage.values.has(P5_RUNTIME_PROOF_STORAGE_KEY)).toBe(false);
  });

  it('persists and reloads bounded accepted evidence with a minted proof timestamp', async () => {
    const storage = new MemoryStorage();
    const evidence = buildP5RuntimeEvidenceBundle({
      pluginVersion: '0.1.0-alpha.1',
      result: passingResult(),
      runtimeProofPassedAt: '2026-09-08T12:00:00.000Z',
      capturedAt: '2026-09-08T12:00:01.000Z',
    });
    expect(await persistP5RuntimeEvidenceBestEffort(storage, evidence)).toBe(true);
    expect(await loadLatestP5RuntimeEvidence(storage)).toEqual(evidence);
    expect(storage.values.has(P5_RUNTIME_EVIDENCE_STORAGE_KEY)).toBe(true);
    expect(buildP5RuntimeEvidenceViewerHtml(evidence)).toContain('Acceptance: PASS');
  });

  it('refuses malformed or contradictory persisted evidence', async () => {
    const storage = new MemoryStorage();
    storage.values.set(P5_RUNTIME_EVIDENCE_STORAGE_KEY, {
      schemaVersion: 1,
      capturedAt: 'x',
      pluginVersion: 'x',
      runtimeGateVersion: 'p5-runtime-proof-v3',
      runtimeProofPassedAt: null,
      acceptance: { accepted: true, failures: [] },
      calibration: { schemaVersion: 1 },
    });
    expect(await loadLatestP5RuntimeEvidence(storage)).toBeNull();
  });
});
