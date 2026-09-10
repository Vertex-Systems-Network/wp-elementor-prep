import { describe, expect, it } from 'vitest';
import {
  runAdvancedCloneCalibration,
  type AdvancedCalibrationAdapter,
} from '../src/core/advanced-calibration';
import type { AdvancedRecipePlan } from '../src/core/advanced-recipe-types';
import type { ValidationReport } from '../src/core/validation-types';

function plan(decision: AdvancedRecipePlan['decision'] = 'CALIBRATE'): AdvancedRecipePlan {
  return {
    schemaVersion: 1,
    decision,
    recipe: 'page-vertical-flow',
    reasonCode: decision === 'CALIBRATE' ? 'CANDIDATE_READY_FOR_CALIBRATION' : 'DETECTION_REQUIRES_REVIEW',
    reason: 'fixture',
    confidence: 98,
    minConfidence: 94,
    pattern: 'page-vertical-flow',
    targetNodeId: 'target',
    targetNodeName: 'Desktop Page',
    targetPath: [0],
    preserveNodeIds: [],
    mutationEnabled: false,
    futureMutationRequiresFullP3: true,
    futureMutationRequiresP4Rollback: true,
    evidence: {},
  };
}

function validation(passed: boolean): ValidationReport {
  return {
    schemaVersion: 1,
    passed,
    thresholdVersion: 'test',
    thresholds: {
      version: 'test',
      rootSizePx: 0,
      anchorPositionPx: 0,
      anchorSizePx: 0,
      pixelChannelDelta: 0,
      maxChangedPixelPct: 0,
      maxMeanChannelDelta: 0,
    },
    findings: passed ? [] : [{
      code: 'PIXEL_DIFF_EXCEEDED',
      severity: 'error',
      title: 'fixture rejection',
      detail: 'fixture rejection',
      evidence: {},
    }],
    metrics: {
      textAnchorCountBefore: 0,
      textAnchorCountAfter: 0,
      imageAnchorCountBefore: 0,
      imageAnchorCountAfter: 0,
      maxRootSizeDriftPx: 0,
      maxTextPositionDriftPx: 0,
      maxTextSizeDriftPx: 0,
      maxImagePositionDriftPx: 0,
      maxImageSizeDriftPx: 0,
      visibleNodeCountBefore: 0,
      visibleNodeCountAfter: 0,
    },
  };
}

function adapter(options: {
  validationPasses?: boolean;
  transformError?: string;
  validationError?: string;
  discardError?: string;
} = {}) {
  const calls: string[] = [];
  const implementation: AdvancedCalibrationAdapter = {
    async cloneOriginal(originalNodeId) {
      calls.push('clone');
      return { originalNodeId, candidateNodeId: 'candidate' };
    },
    async transformCandidate() {
      calls.push('transform');
      if (options.transformError) throw new Error(options.transformError);
    },
    async validateCandidate() {
      calls.push('validate');
      if (options.validationError) throw new Error(options.validationError);
      return validation(options.validationPasses ?? true);
    },
    async discardCandidate() {
      calls.push('discard');
      if (options.discardError) throw new Error(options.discardError);
    },
  };
  return { implementation, calls };
}

describe('P6 clone-only advanced calibration', () => {
  it('skips non-CALIBRATE plans without cloning anything', async () => {
    const fixture = adapter();
    const result = await runAdvancedCloneCalibration('original', plan('REVIEW'), fixture.implementation, 'cal-review');

    expect(result.status).toBe('SKIPPED');
    expect(result.productionCommitAttempted).toBe(false);
    expect(result.leftoverCandidateRisk).toBe(false);
    expect(fixture.calls).toEqual([]);
  });

  it('passes clone-only calibration and always discards the validated candidate', async () => {
    const fixture = adapter({ validationPasses: true });
    const result = await runAdvancedCloneCalibration('original', plan(), fixture.implementation, 'cal-pass');

    expect(result.status).toBe('PASSED');
    expect(result.productionCommitAttempted).toBe(false);
    expect(result.leftoverCandidateRisk).toBe(false);
    expect(result.candidateNodeId).toBe('candidate');
    expect(fixture.calls).toEqual(['clone', 'transform', 'validate', 'discard']);
  });

  it('records a rejected validation as evidence and still discards the candidate', async () => {
    const fixture = adapter({ validationPasses: false });
    const result = await runAdvancedCloneCalibration('original', plan(), fixture.implementation, 'cal-reject');

    expect(result.status).toBe('REJECTED');
    expect(result.validation?.passed).toBe(false);
    expect(result.leftoverCandidateRisk).toBe(false);
    expect(fixture.calls).toEqual(['clone', 'transform', 'validate', 'discard']);
  });

  it('cleans up after transform failure and reports the correct failure stage', async () => {
    const fixture = adapter({ transformError: 'transform refused' });
    const result = await runAdvancedCloneCalibration('original', plan(), fixture.implementation, 'cal-transform-fail');

    expect(result.status).toBe('FAILED');
    expect(result.failureStage).toBe('transform');
    expect(result.error).toContain('transform refused');
    expect(result.leftoverCandidateRisk).toBe(false);
    expect(fixture.calls).toEqual(['clone', 'transform', 'discard']);
  });

  it('fails closed with explicit leftover risk when candidate cleanup fails', async () => {
    const fixture = adapter({ validationPasses: true, discardError: 'remove failed' });
    const result = await runAdvancedCloneCalibration('original', plan(), fixture.implementation, 'cal-discard-fail');

    expect(result.status).toBe('FAILED');
    expect(result.failureStage).toBe('discard');
    expect(result.leftoverCandidateRisk).toBe(true);
    expect(result.productionCommitAttempted).toBe(false);
    expect(result.error).toContain('remove failed');
    expect(fixture.calls).toEqual(['clone', 'transform', 'validate', 'discard']);
  });
});
