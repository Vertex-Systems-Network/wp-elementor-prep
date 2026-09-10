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

describe('P5 runtime acceptance assessor', () => {
  it('accepts only the complete v3 reject/restore/finalize contract', () => {
    expect(assessP5RuntimeAcceptance(passingEvidence())).toEqual({ accepted: true, failures: [] });
  });

  it('fails closed when overall PASS is inconsistent with missing pixel/checkpoint/cleanup evidence', () => {
    const evidence = passingEvidence();
    evidence.forcedReject.pixelEvidenceReturned = false;
    evidence.forcedReject.changedPixelPct = null;
    evidence.passRestore.checkpointCleared = false;
    evidence.passFinalize.originalDiscarded = false;
    evidence.leftovers = 2;

    const assessment = assessP5RuntimeAcceptance(evidence);
    expect(assessment.accepted).toBe(false);
    expect(assessment.failures).toContain('Forced-reject path returned no rendered-pixel evidence.');
    expect(assessment.failures).toContain('Forced-reject path has no valid changed-pixel percentage.');
    expect(assessment.failures).toContain('Restore path left a checkpoint pending.');
    expect(assessment.failures).toContain('Finalize path did not discard the retained previous original.');
    expect(assessment.failures).toContain('Runtime calibration left 2 temporary node(s).');
  });
});
