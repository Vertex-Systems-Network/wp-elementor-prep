import { describe, expect, it } from 'vitest';
import type { P5RuntimeCalibrationResult } from '../src/plugin/p5-runtime-calibration';
import { buildP5RuntimeEvidenceBundle } from '../src/plugin/p5-runtime-evidence';

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

describe('P5 runtime evidence bundle', () => {
  it('recomputes deterministic acceptance and binds accepted evidence to the exact CI build', () => {
    const bundle = buildP5RuntimeEvidenceBundle({
      pluginVersion: '0.1.0-alpha.1',
      build: BUILD,
      result: passingResult(),
      runtimeProofPassedAt: '2026-09-08T12:00:00.000Z',
      capturedAt: '2026-09-08T12:00:01.000Z',
    });

    expect(bundle.schemaVersion).toBe(2);
    expect(bundle.acceptance).toEqual({ accepted: true, failures: [] });
    expect(bundle.runtimeGateVersion).toBe('p5-runtime-proof-v3');
    expect(bundle.runtimeProofPassedAt).toBe('2026-09-08T12:00:00.000Z');
    expect(bundle.build).toEqual(BUILD);
    expect(bundle.calibration).toEqual(passingResult());
  });

  it('cannot retain a proof timestamp when captured evidence fails deterministic acceptance', () => {
    const result = passingResult();
    result.passFinalize.checkpointCleared = false;

    const bundle = buildP5RuntimeEvidenceBundle({
      pluginVersion: '0.1.0-alpha.1',
      build: BUILD,
      result,
      runtimeProofPassedAt: 'should-not-survive',
    });

    expect(bundle.acceptance.accepted).toBe(false);
    expect(bundle.runtimeProofPassedAt).toBeNull();
    expect(bundle.acceptance.failures).toContain('Finalize path left a checkpoint pending.');
  });

  it('rejects invalid rendered-pixel numbers through the canonical assessor', () => {
    const result = passingResult();
    result.forcedReject.changedPixelPct = Number.NaN;
    const bundle = buildP5RuntimeEvidenceBundle({
      pluginVersion: '0.1.0-alpha.1',
      build: BUILD,
      result,
      runtimeProofPassedAt: 'should-not-survive',
    });
    expect(bundle.acceptance.accepted).toBe(false);
    expect(bundle.runtimeProofPassedAt).toBeNull();
  });

  it('fails closed for local/untraceable build provenance even when calibration passes', () => {
    const bundle = buildP5RuntimeEvidenceBundle({
      pluginVersion: '0.1.0-alpha.1',
      build: { sourceSha: 'local', runId: 'local', runNumber: 'local' },
      result: passingResult(),
      runtimeProofPassedAt: 'should-not-survive',
    });
    expect(bundle.acceptance.accepted).toBe(false);
    expect(bundle.acceptance.failures).toContain('P5 runtime evidence is not bound to a traceable CI artifact.');
    expect(bundle.runtimeProofPassedAt).toBeNull();
  });
});
