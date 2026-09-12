import { describe, expect, it } from 'vitest';
import {
  validateP14CandidateHandleEvidence,
  validateP14RecipeExecutionResultEvidence,
  validateP14RetentionEvidence,
} from '../src/core/p14-adapter-evidence';
import { validateP14RescoreEvidence } from '../src/core/p14-rescore-evidence';
import { validateP14RuntimeActionEligibilityEvidence } from '../src/core/p14-runtime-action-eligibility';
import { validateP14ValidationEvidence } from '../src/core/p14-validation-evidence';
import type { P14PreparationAction } from '../src/core/p14-preparation-types';

function plannedAction(overrides: Partial<P14PreparationAction> = {}): P14PreparationAction {
  return {
    actionId: 'action-1',
    findingId: 'finding-1',
    decision: 'ELIGIBLE',
    sourceRuleId: 'RULE_ONE',
    sourceRuleVersion: 1,
    targetNodeIds: ['node-1'],
    confidence: 100,
    recipeId: 'recipe-one',
    recipeVersion: 1,
    orderClass: '10-structure',
    prerequisiteRecipeIds: ['recipe-prerequisite'],
    conflictsWithRecipeIds: [],
    mutationAllowlist: ['layoutMode'],
    validationProfileId: 'profile-one',
    refusalCode: null,
    ...overrides,
  };
}

describe('P14 adapter output semantic snapshots', () => {
  it('reads candidate, recipe and retention record fields once before accepting plain evidence', () => {
    let sourceReads = 0;
    let candidateReads = 0;
    const candidateEvidence = {
      get sourceNodeId() {
        sourceReads += 1;
        return sourceReads === 1 ? 'source:1' : 'source:mutated';
      },
      get candidateNodeId() {
        candidateReads += 1;
        return candidateReads === 1 ? 'candidate:1' : 'candidate:mutated';
      },
    };

    const candidate = validateP14CandidateHandleEvidence(candidateEvidence, 'source:1');
    expect(candidate.valid).toBe(true);
    expect(candidate.value).toEqual({ sourceNodeId: 'source:1', candidateNodeId: 'candidate:1' });
    expect(sourceReads).toBe(1);
    expect(candidateReads).toBe(1);

    let actionReads = 0;
    const action = plannedAction({ prerequisiteRecipeIds: [] });
    const recipe = validateP14RecipeExecutionResultEvidence({
      get actionId() {
        actionReads += 1;
        return actionReads === 1 ? action.actionId : 'action:mutated';
      },
      recipeId: action.recipeId,
      applied: true,
    }, action);
    expect(recipe.valid).toBe(true);
    expect(recipe.value?.actionId).toBe(action.actionId);
    expect(actionReads).toBe(1);

    let retainedReads = 0;
    const expectedRetention = {
      transactionId: 'tx-1',
      sourceNodeId: 'source:1',
      retainedNodeId: 'candidate:1',
      preparedName: 'Prepared Duplicate',
    };
    const retention = validateP14RetentionEvidence({
      transactionId: expectedRetention.transactionId,
      sourceNodeId: expectedRetention.sourceNodeId,
      get retainedNodeId() {
        retainedReads += 1;
        return retainedReads === 1 ? expectedRetention.retainedNodeId : 'candidate:mutated';
      },
      preparedName: expectedRetention.preparedName,
    }, expectedRetention);
    expect(retention.valid).toBe(true);
    expect(retention.value).toEqual(expectedRetention);
    expect(retainedReads).toBe(1);
  });

  it('copies runtime eligibility prerequisite evidence through one bounded index read', () => {
    const action = plannedAction();
    let prerequisiteReads = 0;
    const prerequisiteTarget = ['recipe-prerequisite'];
    const prerequisites = new Proxy(prerequisiteTarget, {
      get(target, property, receiver) {
        if (property === '0') {
          prerequisiteReads += 1;
          return prerequisiteReads === 1 ? 'recipe-prerequisite' : 'recipe-mutated';
        }
        return Reflect.get(target, property, receiver);
      },
    });

    const result = validateP14RuntimeActionEligibilityEvidence({
      actionId: action.actionId,
      recipeId: action.recipeId,
      checkedPrerequisiteRecipeIds: prerequisites,
      eligible: true,
    }, action);

    expect(result.valid).toBe(true);
    expect(result.value?.checkedPrerequisiteRecipeIds).toEqual(['recipe-prerequisite']);
    expect(prerequisiteReads).toBe(1);

    prerequisiteTarget[0] = 'recipe-mutated-after-validation';
    expect(result.value?.checkedPrerequisiteRecipeIds).toEqual(['recipe-prerequisite']);
  });

  it('detaches validation profile/check collections and reads nested check fields once', () => {
    let profileReads = 0;
    const profileTarget = ['profile-one'];
    const profileIdsRun = new Proxy(profileTarget, {
      get(target, property, receiver) {
        if (property === '0') {
          profileReads += 1;
          return profileReads === 1 ? 'profile-one' : 'profile-mutated';
        }
        return Reflect.get(target, property, receiver);
      },
    });

    let checkIdReads = 0;
    const check = {
      get id() {
        checkIdReads += 1;
        return checkIdReads === 1 ? 'structure' : 'structure-mutated';
      },
      passed: true,
      required: true,
      detail: 'ok',
    };
    const checksTarget: Array<{
      readonly id: string;
      passed: boolean;
      required: boolean;
      detail: string;
    }> = [check];
    const checks = new Proxy(checksTarget, {
      get(target, property, receiver) {
        return Reflect.get(target, property, receiver);
      },
    });

    const result = validateP14ValidationEvidence({
      passed: true,
      profileIdsRun,
      checks,
    });

    expect(result.valid).toBe(true);
    expect(result.value?.profileIdsRun).toEqual(['profile-one']);
    expect(result.value?.checks).toEqual([
      { id: 'structure', passed: true, required: true, detail: 'ok' },
    ]);
    expect(profileReads).toBe(1);
    expect(checkIdReads).toBe(1);

    profileTarget[0] = 'profile-mutated-after-validation';
    checksTarget[0] = { id: 'other', passed: false, required: true, detail: 'changed' };
    expect(result.value?.profileIdsRun).toEqual(['profile-one']);
    expect(result.value?.checks[0]?.id).toBe('structure');
  });

  it('reads re-score fields once and keeps the accepted summary detached', () => {
    let statusReads = 0;
    const result = validateP14RescoreEvidence({
      runId: 'run-1',
      get status() {
        statusReads += 1;
        return statusReads === 1 ? 'READY' : 'NOT_A_REAL_STATUS';
      },
      score: 100,
      blockerCount: 0,
      highRiskCount: 0,
      introducedBlockerOrHighCount: 0,
      reviewRequired: false,
    });

    expect(result.valid).toBe(true);
    expect(result.value?.status).toBe('READY');
    expect(statusReads).toBe(1);
  });

  it('fails closed instead of throwing when adapter output getters are unreadable', () => {
    const hostile = {
      get sourceNodeId(): string {
        throw new Error('unreadable adapter evidence');
      },
      candidateNodeId: 'candidate:1',
    };

    expect(() => validateP14CandidateHandleEvidence(hostile, 'source:1')).not.toThrow();
    const result = validateP14CandidateHandleEvidence(hostile, 'source:1');
    expect(result.valid).toBe(false);
    expect(result.value).toBeNull();
    expect(result.failures.some((failure) => failure.includes('could not be read safely'))).toBe(true);
  });
});
