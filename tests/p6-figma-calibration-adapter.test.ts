import { describe, expect, it } from 'vitest';
import type { AdvancedRecipePlan } from '../src/core/advanced-recipe-types';
import type { ValidationReport } from '../src/core/validation-types';
import { FigmaAdvancedCalibrationAdapter } from '../src/plugin/figma-advanced-calibration-adapter';

function plan(overrides: Partial<AdvancedRecipePlan> = {}): AdvancedRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'CALIBRATE',
    recipe: 'page-vertical-flow',
    reasonCode: 'CANDIDATE_READY_FOR_CALIBRATION',
    reason: 'fixture',
    confidence: 98,
    minConfidence: 94,
    pattern: 'page-vertical-flow',
    targetNodeId: 'target',
    targetNodeName: 'Desktop Page',
    targetPath: [0, 2],
    preserveNodeIds: [],
    mutationEnabled: false,
    futureMutationRequiresFullP3: true,
    futureMutationRequiresP4Rollback: true,
    evidence: {},
    ...overrides,
  };
}

function passingValidation(): ValidationReport {
  return {
    schemaVersion: 1,
    passed: true,
    thresholdVersion: 'fixture',
    thresholds: {
      version: 'fixture',
      rootSizePx: 0,
      anchorPositionPx: 0,
      anchorSizePx: 0,
      pixelChannelDelta: 0,
      maxChangedPixelPct: 0,
      maxMeanChannelDelta: 0,
    },
    findings: [],
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

function fakeLifecycle() {
  const calls: string[] = [];
  return {
    calls,
    adapter: {
      async cloneOriginal(originalNodeId: string) {
        calls.push('clone');
        return { originalNodeId, candidateNodeId: 'candidate' };
      },
      async transformCandidate() {
        calls.push('transform');
      },
      async validateCandidate() {
        calls.push('validate');
        return passingValidation();
      },
      async discardCandidate() {
        calls.push('discard');
      },
    },
  };
}

describe('P6 Figma advanced calibration adapter', () => {
  it('delegates only the clone/transform/validate/discard calibration lifecycle', async () => {
    const fixture = fakeLifecycle();
    const calibrationPlan = plan();
    const adapter = new FigmaAdvancedCalibrationAdapter(calibrationPlan, {
      transform: () => undefined,
      validate: async () => passingValidation(),
      lifecycleAdapter: fixture.adapter,
    });

    const handle = await adapter.cloneOriginal('original', 'cal-1');
    await adapter.transformCandidate(handle, calibrationPlan);
    const validation = await adapter.validateCandidate(handle);
    await adapter.discardCandidate(handle);

    expect(validation.passed).toBe(true);
    expect(fixture.calls).toEqual(['clone', 'transform', 'validate', 'discard']);
    expect('commitCandidate' in adapter).toBe(false);
  });

  it('refuses a stale/different plan before delegating transform', async () => {
    const fixture = fakeLifecycle();
    const calibrationPlan = plan();
    const adapter = new FigmaAdvancedCalibrationAdapter(calibrationPlan, {
      transform: () => undefined,
      validate: async () => passingValidation(),
      lifecycleAdapter: fixture.adapter,
    });
    const handle = await adapter.cloneOriginal('original', 'cal-2');

    await expect(adapter.transformCandidate(handle, plan({ targetNodeId: 'other-target' })))
      .rejects.toThrow('Calibration plan changed');
    expect(fixture.calls).toEqual(['clone']);
  });

  it('refuses construction for REVIEW/NOOP/PRESERVE plans', () => {
    const fixture = fakeLifecycle();
    expect(() => new FigmaAdvancedCalibrationAdapter(plan({ decision: 'REVIEW' }), {
      transform: () => undefined,
      validate: async () => passingValidation(),
      lifecycleAdapter: fixture.adapter,
    })).toThrow('requires a CALIBRATE recipe plan');
  });
});
