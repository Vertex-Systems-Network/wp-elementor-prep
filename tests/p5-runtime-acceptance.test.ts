import { describe, expect, it } from 'vitest';
import type { P5RuntimeCalibrationResult } from '../src/plugin/p5-runtime-calibration';
import { assessP5RuntimeAcceptance } from '../src/plugin/p5-runtime-acceptance';

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

describe('embedded P5 runtime acceptance assessor on P7', () => {
  it('accepts only the complete reject/restore/finalize contract', () => {
    expect(assessP5RuntimeAcceptance(passingEvidence())).toEqual({ accepted: true, failures: [] });
  });

  it('fails closed on invalid rendered-pixel values even when top-level PASS is true', () => {
    const evidence = passingEvidence();
    evidence.forcedReject.changedPixelPct = Number.NaN;
    evidence.passRestore.changedPixelPct = -1;
    evidence.passFinalize.changedPixelPct = null;

    const assessment = assessP5RuntimeAcceptance(evidence);
    expect(assessment.accepted).toBe(false);
    expect(assessment.failures).toContain('Forced-reject path has no valid changed-pixel percentage.');
    expect(assessment.failures).toContain('Restore path has no valid changed-pixel percentage.');
    expect(assessment.failures).toContain('Finalize path has no valid changed-pixel percentage.');
  });
});
