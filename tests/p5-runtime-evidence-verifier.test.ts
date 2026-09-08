import { describe, expect, it } from 'vitest';
import type { P5RuntimeCalibrationResult } from '../src/plugin/p5-runtime-calibration';
import { buildP5RuntimeEvidenceBundle } from '../src/plugin/p5-runtime-evidence';
import { verifyP5RuntimeEvidence } from '../src/plugin/p5-runtime-evidence-verifier';

const BUILD = {
  sourceSha: '0123456789abcdef0123456789abcdef01234567',
  runId: '34219111842',
  runNumber: '309',
};

function passingResult(): P5RuntimeCalibrationResult {
  return {
    schemaVersion: 1,
    passed: true,
    forcedReject: {
      state: 'REJECTED',
      validationRejected: true,
      pixelEvidenceReturned: true,
      changedPixelPct: 1.5,
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

function passingBundle() {
  return buildP5RuntimeEvidenceBundle({
    pluginVersion: '0.1.0-alpha.1',
    build: BUILD,
    result: passingResult(),
    runtimeProofPassedAt: '2026-09-08T12:00:00.000Z',
    capturedAt: '2026-09-08T12:00:01.000Z',
  });
}

describe('P5 offline runtime evidence verifier', () => {
  it('accepts an untampered provenance-bound PASS bundle', () => {
    expect(verifyP5RuntimeEvidence(passingBundle())).toEqual({ accepted: true, failures: [] });
  });

  it('rejects a tampered stored acceptance verdict', () => {
    const bundle = passingBundle();
    bundle.acceptance = { accepted: false, failures: ['manually edited'] };
    const result = verifyP5RuntimeEvidence(bundle);
    expect(result.accepted).toBe(false);
    expect(result.failures).toContain('Stored acceptance verdict does not match the canonical recomputed assessment.');
  });

  it('rejects calibration tampering even if the stored verdict still says PASS', () => {
    const bundle = passingBundle();
    bundle.calibration.passFinalize.checkpointCleared = false;
    const result = verifyP5RuntimeEvidence(bundle);
    expect(result.accepted).toBe(false);
    expect(result.failures).toContain('Finalize path left a checkpoint pending.');
  });

  it('rejects a runtime gate mismatch', () => {
    const bundle = passingBundle();
    bundle.runtimeGateVersion = 'stale-gate';
    const result = verifyP5RuntimeEvidence(bundle);
    expect(result.accepted).toBe(false);
    expect(result.failures.some((failure) => failure.startsWith('Runtime gate mismatch:'))).toBe(true);
  });

  it('rejects malformed evidence without throwing', () => {
    expect(verifyP5RuntimeEvidence({ schemaVersion: 2 })).toEqual({
      accepted: false,
      failures: ['Malformed or unsupported P5 runtime evidence bundle.'],
    });
  });
});
