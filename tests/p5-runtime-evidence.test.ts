import { describe, expect, it } from 'vitest';
import type { P5RuntimeCalibrationResult } from '../src/plugin/p5-runtime-calibration';
import { buildP5RuntimeEvidenceBundle } from '../src/plugin/p5-runtime-evidence';

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

describe('embedded P5 runtime evidence bundle', () => {
  it('recomputes acceptance and retains proof timestamp only for accepted evidence', () => {
    const bundle = buildP5RuntimeEvidenceBundle({
      pluginVersion: '0.1.0-alpha.1',
      result: passingResult(),
      runtimeProofPassedAt: '2026-09-08T12:00:00.000Z',
      capturedAt: '2026-09-08T12:00:01.000Z',
    });
    expect(bundle.acceptance).toEqual({ accepted: true, failures: [] });
    expect(bundle.runtimeGateVersion).toBe('p5-runtime-proof-v3');
    expect(bundle.runtimeProofPassedAt).toBe('2026-09-08T12:00:00.000Z');
  });

  it('clears proof timestamp when deterministic acceptance fails', () => {
    const result = passingResult();
    result.passFinalize.checkpointCleared = false;
    const bundle = buildP5RuntimeEvidenceBundle({
      pluginVersion: '0.1.0-alpha.1',
      result,
      runtimeProofPassedAt: 'should-not-survive',
    });
    expect(bundle.acceptance.accepted).toBe(false);
    expect(bundle.runtimeProofPassedAt).toBeNull();
  });

  it('rejects invalid rendered-pixel evidence', () => {
    const result = passingResult();
    result.forcedReject.changedPixelPct = Number.NaN;
    const bundle = buildP5RuntimeEvidenceBundle({
      pluginVersion: '0.1.0-alpha.1',
      result,
      runtimeProofPassedAt: 'should-not-survive',
    });
    expect(bundle.acceptance.accepted).toBe(false);
    expect(bundle.runtimeProofPassedAt).toBeNull();
  });
});
