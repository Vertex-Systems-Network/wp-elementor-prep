import { describe, expect, it } from 'vitest';
import type { AdvancedCalibrationResult } from '../src/core/advanced-calibration';
import type { AdvancedRecipePlan } from '../src/core/advanced-recipe-types';
import type { ValidationReport } from '../src/core/validation-types';
import { buildP6DeveloperEvidenceView } from '../src/plugin/p6-developer-evidence-view';
import { P6_TEST_BUILD, P6_TEST_PROOF_PASSED_AT } from './p6-provenance-fixture';

function preservePlan(): AdvancedRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'PRESERVE',
    recipe: null,
    reasonCode: 'PRESERVATION_RELATIONSHIP_REQUIRED',
    reason: 'Keep overlay relationship intact.',
    confidence: 99,
    minConfidence: null,
    pattern: 'header-hero-overlay',
    targetNodeId: 'overlay',
    targetNodeName: 'Header Hero Overlay',
    targetPath: [0],
    preserveNodeIds: ['badge'],
    mutationEnabled: false,
    futureMutationRequiresFullP3: true,
    futureMutationRequiresP4Rollback: true,
    evidence: {},
  };
}

function calibratePlan(): AdvancedRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'CALIBRATE',
    recipe: 'page-vertical-flow',
    reasonCode: 'CANDIDATE_READY_FOR_CALIBRATION',
    reason: 'Ready for clone calibration.',
    confidence: 99,
    minConfidence: 94,
    pattern: 'page-vertical-flow',
    targetNodeId: 'frame',
    targetNodeName: 'Desktop Page',
    targetPath: [],
    preserveNodeIds: [],
    mutationEnabled: false,
    futureMutationRequiresFullP3: true,
    futureMutationRequiresP4Rollback: true,
    evidence: {},
  };
}

function validation(): ValidationReport {
  return {
    schemaVersion: 1,
    passed: true,
    thresholdVersion: 'p3-test',
    thresholds: {
      version: 'p3-test',
      rootSizePx: 0.5,
      anchorPositionPx: 0.5,
      anchorSizePx: 0.5,
      pixelChannelDelta: 0,
      maxChangedPixelPct: 0.01,
      maxMeanChannelDelta: 0.01,
    },
    findings: [],
    metrics: {
      textAnchorCountBefore: 1,
      textAnchorCountAfter: 1,
      imageAnchorCountBefore: 0,
      imageAnchorCountAfter: 0,
      maxRootSizeDriftPx: 0,
      maxTextPositionDriftPx: 0,
      maxTextSizeDriftPx: 0,
      maxImagePositionDriftPx: 0,
      maxImageSizeDriftPx: 0,
      visibleNodeCountBefore: 2,
      visibleNodeCountAfter: 2,
      pixel: {
        sameDimensions: true,
        widthBefore: 100,
        heightBefore: 100,
        widthAfter: 100,
        heightAfter: 100,
        totalPixels: 10_000,
        changedPixels: 0,
        changedPixelPct: 0,
        meanChannelDelta: 0,
        maxChannelDelta: 0,
        channelTolerance: 0,
      },
    },
  };
}

function completedResult(plan: AdvancedRecipePlan): AdvancedCalibrationResult {
  return {
    schemaVersion: 1,
    calibrationId: 'cal',
    status: 'PASSED',
    originalNodeId: 'frame',
    candidateNodeId: 'candidate',
    plan,
    validation: validation(),
    leftoverCandidateRisk: false,
    productionCommitAttempted: false,
    events: [{ stage: 'DISCARD' }, { stage: 'DONE' }],
  };
}

const base = {
  pluginVersion: '0.1.0-alpha.1',
  build: P6_TEST_BUILD,
  p5RuntimeProofPassedAt: P6_TEST_PROOF_PASSED_AT,
  p5RuntimeProofBuild: P6_TEST_BUILD,
  frame: { id: 'frame', name: 'Desktop Page' } as FrameNode,
  capturedAt: '2026-09-08T10:01:00.000Z',
};

describe('P6 developer evidence view', () => {
  it('routes NO_CANDIDATE to preservation refusal evidence without losing the bounded plan set', () => {
    const view = buildP6DeveloperEvidenceView({
      ...base,
      outcome: {
        status: 'NO_CANDIDATE',
        reason: 'No unambiguous page-flow calibration candidate.',
        plans: [preservePlan()],
      },
    });

    expect(view.kind).toBe('PRESERVATION_REFUSAL');
    if (view.kind !== 'PRESERVATION_REFUSAL') throw new Error('expected refusal view');
    expect(view.evidence.plans).toHaveLength(1);
    expect(view.html).toContain('Preservation refusal acceptance: PASS');
  });

  it('routes COMPLETED to the existing calibration evidence viewer', () => {
    const plan = calibratePlan();
    const view = buildP6DeveloperEvidenceView({
      ...base,
      outcome: {
        status: 'COMPLETED',
        plan,
        result: completedResult(plan),
      },
    });

    expect(view.kind).toBe('CALIBRATION');
    if (view.kind !== 'CALIBRATION') throw new Error('expected calibration view');
    expect(view.evidence.calibration?.status).toBe('PASSED');
    expect(view.html).toContain('P6 Clone Calibration Evidence');
  });

  it('routes BLOCKED to calibration evidence without inventing refusal plans', () => {
    const view = buildP6DeveloperEvidenceView({
      ...base,
      p5RuntimeProofPassedAt: null,
      p5RuntimeProofBuild: null,
      outcome: {
        status: 'BLOCKED',
        reason: 'P5 imported-plugin runtime proof is not valid for this build.',
      },
    });

    expect(view.kind).toBe('CALIBRATION');
    if (view.kind !== 'CALIBRATION') throw new Error('expected calibration view');
    expect(view.evidence.outcomeStatus).toBe('BLOCKED');
    expect(view.evidence.plan).toBeNull();
  });
});
