import { describe, expect, it } from 'vitest';
import type { AdvancedCalibrationResult } from '../src/core/advanced-calibration';
import type { AdvancedRecipePlan } from '../src/core/advanced-recipe-types';
import { P5_RUNTIME_GATE_VERSION } from '../src/core/p5-runtime-gate';
import type { ValidationReport } from '../src/core/validation-types';
import {
  buildP6RuntimeEvidenceBundle,
  P6_RUNTIME_EVIDENCE_SCHEMA_VERSION,
} from '../src/plugin/p6-runtime-evidence';

function plan(): AdvancedRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'CALIBRATE',
    recipe: 'page-vertical-flow',
    reasonCode: 'CANDIDATE_READY_FOR_CALIBRATION',
    reason: 'fixture',
    confidence: 98,
    minConfidence: 94,
    pattern: 'page-vertical-flow',
    targetNodeId: 'frame',
    targetNodeName: 'Desktop Page',
    targetPath: [],
    preserveNodeIds: [],
    mutationEnabled: false,
    futureMutationRequiresFullP3: true,
    futureMutationRequiresP4Rollback: true,
    evidence: { largeDiagnosticBlobShouldNotBeCopied: 'omitted-by-summary' },
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
      maxChangedPixelPct: 0,
      maxMeanChannelDelta: 0,
    },
    findings: [],
    metrics: {
      textAnchorCountBefore: 8,
      textAnchorCountAfter: 8,
      imageAnchorCountBefore: 2,
      imageAnchorCountAfter: 2,
      maxRootSizeDriftPx: 0,
      maxTextPositionDriftPx: 0.2,
      maxTextSizeDriftPx: 0,
      maxImagePositionDriftPx: 0.1,
      maxImageSizeDriftPx: 0,
      visibleNodeCountBefore: 21,
      visibleNodeCountAfter: 21,
      pixel: {
        sameDimensions: true,
        widthBefore: 1000,
        heightBefore: 2000,
        widthAfter: 1000,
        heightAfter: 2000,
        totalPixels: 2_000_000,
        changedPixels: 12,
        changedPixelPct: 0.0006,
        meanChannelDelta: 0.0002,
        maxChannelDelta: 2,
        channelTolerance: 0,
      },
    },
  };
}

function completedResult(selectedPlan: AdvancedRecipePlan): AdvancedCalibrationResult {
  return {
    schemaVersion: 1,
    calibrationId: 'p6-cal-real-1',
    status: 'PASSED',
    originalNodeId: 'frame',
    candidateNodeId: 'candidate',
    plan: selectedPlan,
    validation: validation(),
    leftoverCandidateRisk: false,
    productionCommitAttempted: false,
    events: [
      { stage: 'CLONE' },
      { stage: 'TRANSFORM' },
      { stage: 'VALIDATE' },
      { stage: 'DISCARD' },
      { stage: 'DONE', detail: 'validation passed; candidate discarded' },
    ],
  };
}

describe('P6 runtime evidence bundle', () => {
  it('captures bounded PASS evidence without AuditNode trees or PNG bytes', () => {
    const selectedPlan = plan();
    const evidence = buildP6RuntimeEvidenceBundle({
      pluginVersion: '0.1.0-alpha.1',
      p5RuntimeProofPassedAt: '2026-09-08T00:00:00.000Z',
      frame: { id: 'frame', name: 'Desktop Page' } as FrameNode,
      outcome: {
        status: 'COMPLETED',
        plan: selectedPlan,
        result: completedResult(selectedPlan),
      },
      capturedAt: '2026-09-08T00:01:00.000Z',
    });

    expect(evidence.schemaVersion).toBe(P6_RUNTIME_EVIDENCE_SCHEMA_VERSION);
    expect(evidence.p5RuntimeGateVersion).toBe(P5_RUNTIME_GATE_VERSION);
    expect(evidence.outcomeStatus).toBe('COMPLETED');
    expect(evidence.plan?.recipe).toBe('page-vertical-flow');
    expect(evidence.calibration?.status).toBe('PASSED');
    expect(evidence.calibration?.productionCommitAttempted).toBe(false);
    expect(evidence.calibration?.leftoverCandidateRisk).toBe(false);
    expect(evidence.calibration?.validation).toMatchObject({
      passed: true,
      thresholdVersion: 'p3-test',
      changedPixelPct: 0.0006,
      maxChannelDelta: 2,
    });

    const serialized = JSON.stringify(evidence);
    expect(serialized).not.toContain('largeDiagnosticBlobShouldNotBeCopied');
    expect(serialized).not.toContain('beforePng');
    expect(serialized).not.toContain('afterPng');
  });

  it('records a blocked run without inventing plan, calibration, or proof timestamp evidence', () => {
    const evidence = buildP6RuntimeEvidenceBundle({
      pluginVersion: '0.1.0-alpha.1',
      p5RuntimeProofPassedAt: null,
      frame: { id: 'frame', name: 'Desktop Page' } as FrameNode,
      outcome: {
        status: 'BLOCKED',
        reason: 'P5 imported-plugin runtime proof is not valid for this build.',
      },
      capturedAt: '2026-09-08T00:01:00.000Z',
    });

    expect(evidence.outcomeStatus).toBe('BLOCKED');
    expect(evidence.reason).toContain('runtime proof');
    expect(evidence.p5RuntimeProofPassedAt).toBeNull();
    expect(evidence.plan).toBeNull();
    expect(evidence.calibration).toBeNull();
  });

  it('preserves cleanup-risk and failure-stage evidence without claiming a commit', () => {
    const selectedPlan = plan();
    const result: AdvancedCalibrationResult = {
      schemaVersion: 1,
      calibrationId: 'p6-cal-cleanup-fail',
      status: 'FAILED',
      originalNodeId: 'frame',
      candidateNodeId: 'candidate',
      plan: selectedPlan,
      failureStage: 'discard',
      error: 'candidate cleanup failed',
      leftoverCandidateRisk: true,
      productionCommitAttempted: false,
      events: [{ stage: 'FAIL', detail: 'discard failed' }],
    };

    const evidence = buildP6RuntimeEvidenceBundle({
      pluginVersion: '0.1.0-alpha.1',
      p5RuntimeProofPassedAt: '2026-09-08T00:00:00.000Z',
      frame: { id: 'frame', name: 'Desktop Page' } as FrameNode,
      outcome: { status: 'COMPLETED', plan: selectedPlan, result },
    });

    expect(evidence.calibration).toMatchObject({
      status: 'FAILED',
      failureStage: 'discard',
      leftoverCandidateRisk: true,
      productionCommitAttempted: false,
    });
  });
});
