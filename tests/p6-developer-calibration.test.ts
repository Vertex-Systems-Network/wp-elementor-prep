import { describe, expect, it } from 'vitest';
import type { AdvancedCalibrationResult } from '../src/core/advanced-calibration';
import type { AdvancedRecipePlan } from '../src/core/advanced-recipe-types';
import {
  runP6DeveloperPageFlowCalibration,
} from '../src/plugin/p6-developer-calibration';

function pageFlowPlan(overrides: Partial<AdvancedRecipePlan> = {}): AdvancedRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'CALIBRATE',
    recipe: 'page-vertical-flow',
    reasonCode: 'CANDIDATE_READY_FOR_CALIBRATION',
    reason: 'fixture',
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
    ...overrides,
  };
}

function passedResult(plan: AdvancedRecipePlan): AdvancedCalibrationResult {
  return {
    schemaVersion: 1,
    calibrationId: 'cal-1',
    status: 'PASSED',
    originalNodeId: 'frame',
    candidateNodeId: 'candidate',
    plan,
    leftoverCandidateRisk: false,
    productionCommitAttempted: false,
    events: [{ stage: 'DONE', detail: 'validation passed; candidate discarded' }],
  };
}

const frame = { id: 'frame' } as FrameNode;
const unusedValidator = async () => {
  throw new Error('validator should not be reached by orchestration fixture');
};

describe('P6 developer page-flow calibration orchestration', () => {
  it('requires the imported-build P5 runtime proof before analysis/calibration', async () => {
    let planned = false;
    const outcome = await runP6DeveloperPageFlowCalibration(frame, {
      runtimeProofValid: async () => false,
      hasPendingCheckpoint: async () => false,
      validateFullP3: unusedValidator,
      overrides: {
        plan: async () => {
          planned = true;
          return [pageFlowPlan()];
        },
      },
    });

    expect(outcome.status).toBe('BLOCKED');
    expect(planned).toBe(false);
  });

  it('refuses calibration while a P5 checkpoint is pending', async () => {
    let planned = false;
    const outcome = await runP6DeveloperPageFlowCalibration(frame, {
      runtimeProofValid: async () => true,
      hasPendingCheckpoint: async () => true,
      validateFullP3: unusedValidator,
      overrides: {
        plan: async () => {
          planned = true;
          return [pageFlowPlan()];
        },
      },
    });

    expect(outcome.status).toBe('BLOCKED');
    expect(planned).toBe(false);
  });

  it('returns NO_CANDIDATE when fresh planning does not authorize page-flow calibration', async () => {
    const reviewPlan = pageFlowPlan({ decision: 'REVIEW', reasonCode: 'DETECTION_REQUIRES_REVIEW' });
    const outcome = await runP6DeveloperPageFlowCalibration(frame, {
      runtimeProofValid: async () => true,
      hasPendingCheckpoint: async () => false,
      validateFullP3: unusedValidator,
      overrides: { plan: async () => [reviewPlan] },
    });

    expect(outcome.status).toBe('NO_CANDIDATE');
  });

  it('fails closed when fresh planning produces more than one page-flow calibration plan', async () => {
    let calibrated = false;
    const outcome = await runP6DeveloperPageFlowCalibration(frame, {
      runtimeProofValid: async () => true,
      hasPendingCheckpoint: async () => false,
      validateFullP3: unusedValidator,
      overrides: {
        plan: async () => [pageFlowPlan(), pageFlowPlan({ targetNodeId: 'other', targetPath: [1] })],
        calibrate: async () => {
          calibrated = true;
          return passedResult(pageFlowPlan());
        },
      },
    });

    expect(outcome.status).toBe('NO_CANDIDATE');
    expect(calibrated).toBe(false);
  });

  it('runs exactly one commitless calibration after fresh proof/checkpoint/plan gates pass', async () => {
    const plan = pageFlowPlan();
    const calls: string[] = [];
    const outcome = await runP6DeveloperPageFlowCalibration(frame, {
      runtimeProofValid: async () => {
        calls.push('proof');
        return true;
      },
      hasPendingCheckpoint: async () => {
        calls.push('checkpoint');
        return false;
      },
      validateFullP3: unusedValidator,
      overrides: {
        plan: async () => {
          calls.push('plan');
          return [plan];
        },
        calibrate: async (target, selectedPlan) => {
          calls.push(`calibrate:${target.id}:${selectedPlan.recipe}`);
          return passedResult(selectedPlan);
        },
      },
    });

    expect(calls).toEqual(['proof', 'checkpoint', 'plan', 'calibrate:frame:page-vertical-flow']);
    expect(outcome.status).toBe('COMPLETED');
    if (outcome.status !== 'COMPLETED') return;
    expect(outcome.result.status).toBe('PASSED');
    expect(outcome.result.productionCommitAttempted).toBe(false);
    expect(outcome.result.leftoverCandidateRisk).toBe(false);
  });
});
