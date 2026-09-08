import { describe, expect, it } from 'vitest';
import { P5_RUNTIME_GATE_VERSION } from '../src/core/p5-runtime-gate';
import type { P6RuntimeEvidenceBundle } from '../src/plugin/p6-runtime-evidence';
import { assessP6PositiveCalibrationAcceptance } from '../src/plugin/p6-runtime-acceptance';

function passingEvidence(): P6RuntimeEvidenceBundle {
  return {
    schemaVersion: 1,
    capturedAt: '2026-09-08T10:00:00.000Z',
    pluginVersion: '0.1.0-alpha.1',
    p5RuntimeGateVersion: P5_RUNTIME_GATE_VERSION,
    p5RuntimeProofPassedAt: '2026-09-08T09:59:00.000Z',
    frame: { id: 'frame-1', name: 'Real page flow' },
    outcomeStatus: 'COMPLETED',
    reason: null,
    plan: {
      decision: 'CALIBRATE',
      recipe: 'page-vertical-flow',
      pattern: 'page-vertical-flow',
      confidence: 99,
      targetNodeId: 'frame-1',
      targetNodeName: 'Real page flow',
      targetPath: [],
      preserveNodeIds: [],
    },
    calibration: {
      calibrationId: 'p6-cal-real-1',
      status: 'PASSED',
      originalNodeId: 'frame-1',
      candidateNodeId: 'candidate-1',
      failureStage: null,
      error: null,
      leftoverCandidateRisk: false,
      productionCommitAttempted: false,
      validation: {
        passed: true,
        thresholdVersion: 'p3-v1',
        changedPixelPct: 0,
        meanChannelDelta: 0,
        maxChannelDelta: 0,
        maxTextPositionDriftPx: 0,
        maxImagePositionDriftPx: 0,
      },
      events: [
        { stage: 'CLONE' },
        { stage: 'TRANSFORM' },
        { stage: 'VALIDATE' },
        { stage: 'DISCARD' },
        { stage: 'DONE', detail: 'validation passed; candidate discarded' },
      ],
    },
  };
}

describe('P6 runtime acceptance assessor', () => {
  it('accepts complete positive imported-runtime page-flow evidence', () => {
    expect(assessP6PositiveCalibrationAcceptance(passingEvidence())).toEqual({ accepted: true, failures: [] });
  });

  it('fails closed without P5 proof, pixel evidence, cleanup, or discard evidence', () => {
    const evidence = passingEvidence();
    evidence.p5RuntimeProofPassedAt = null;
    if (!evidence.calibration) throw new Error('fixture');
    evidence.calibration.leftoverCandidateRisk = true;
    evidence.calibration.validation!.changedPixelPct = null;
    evidence.calibration.events = evidence.calibration.events.filter((event) => event.stage !== 'DISCARD');

    const assessment = assessP6PositiveCalibrationAcceptance(evidence);
    expect(assessment.accepted).toBe(false);
    expect(assessment.failures).toContain('P6 evidence was captured without a valid imported P5 runtime proof.');
    expect(assessment.failures).toContain('P6 calibration reports leftover candidate risk.');
    expect(assessment.failures).toContain('P6 calibration has no candidate-discard event.');
    expect(assessment.failures).toContain('P6 Full P3 changed-pixel evidence is missing/invalid.');
  });
});
