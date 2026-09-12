import { describe, expect, it } from 'vitest';
import { validateP14RuntimeActionEligibilityEvidence } from '../src/core/p14-runtime-action-eligibility';
import type { P14PreparationAction } from '../src/core/p14-preparation-types';

function plannedAction(overrides: Partial<P14PreparationAction> = {}): P14PreparationAction {
  return {
    actionId: 'action-snapshot',
    findingId: 'finding-snapshot',
    decision: 'ELIGIBLE',
    sourceRuleId: 'RULE_SNAPSHOT',
    sourceRuleVersion: 1,
    targetNodeIds: ['node-snapshot'],
    confidence: 100,
    recipeId: 'recipe-snapshot',
    recipeVersion: 1,
    orderClass: '10-snapshot',
    prerequisiteRecipeIds: ['recipe-prerequisite'],
    conflictsWithRecipeIds: [],
    mutationAllowlist: ['layoutMode'],
    validationProfileId: 'profile-snapshot',
    refusalCode: null,
    ...overrides,
  };
}

function eligibilityEvidence() {
  return {
    actionId: 'action-snapshot',
    recipeId: 'recipe-snapshot',
    checkedPrerequisiteRecipeIds: ['recipe-prerequisite'],
    eligible: true,
  };
}

describe('P14 runtime planned-action binding snapshot', () => {
  it('fails closed without throwing when the planned action proxy is revoked', () => {
    const revoked = Proxy.revocable(plannedAction() as unknown as object, {});
    revoked.revoke();

    let result;
    expect(() => {
      result = validateP14RuntimeActionEligibilityEvidence(
        eligibilityEvidence(),
        revoked.proxy as P14PreparationAction,
      );
    }).not.toThrow();
    expect(result!.valid).toBe(false);
    expect(result!.value).toBeNull();
    expect(result!.failures.some((failure: string) => failure.includes('P14 planned runtime action binding'))).toBe(true);
    expect(result!.failures.some((failure: string) => failure.includes('safely'))).toBe(true);
  });

  it('captures stateful planned identity getters exactly once', () => {
    const action = plannedAction() as any;
    let actionIdReads = 0;
    let recipeIdReads = 0;

    Object.defineProperty(action, 'actionId', {
      enumerable: true,
      configurable: true,
      get() {
        actionIdReads += 1;
        return actionIdReads === 1 ? 'action-snapshot' : 'forged-action';
      },
    });
    Object.defineProperty(action, 'recipeId', {
      enumerable: true,
      configurable: true,
      get() {
        recipeIdReads += 1;
        return recipeIdReads === 1 ? 'recipe-snapshot' : 'forged-recipe';
      },
    });

    expect(validateP14RuntimeActionEligibilityEvidence(eligibilityEvidence(), action).valid).toBe(true);
    expect(actionIdReads).toBe(1);
    expect(recipeIdReads).toBe(1);
  });

  it('captures the planned prerequisite collection getter exactly once', () => {
    const action = plannedAction() as any;
    const expected = ['recipe-prerequisite'];
    let prerequisiteReads = 0;

    Object.defineProperty(action, 'prerequisiteRecipeIds', {
      enumerable: true,
      configurable: true,
      get() {
        prerequisiteReads += 1;
        return prerequisiteReads === 1 ? expected : ['forged-prerequisite'];
      },
    });

    expect(validateP14RuntimeActionEligibilityEvidence(eligibilityEvidence(), action).valid).toBe(true);
    expect(prerequisiteReads).toBe(1);
  });

  it('copies planned prerequisite indices once before semantic comparison', () => {
    const action = plannedAction() as any;
    const sourcePrerequisites = action.prerequisiteRecipeIds;
    let indexReads = 0;
    action.prerequisiteRecipeIds = new Proxy(sourcePrerequisites, {
      get(target, property, receiver) {
        if (typeof property === 'string' && /^\d+$/.test(property)) {
          indexReads += 1;
          if (indexReads > target.length) throw new Error('planned prerequisites were re-read after capture');
        }
        return Reflect.get(target, property, receiver);
      },
    });

    expect(validateP14RuntimeActionEligibilityEvidence(eligibilityEvidence(), action).valid).toBe(true);
    expect(indexReads).toBe(sourcePrerequisites.length);
  });

  it('preserves exact canonical planned-action binding validation', () => {
    const result = validateP14RuntimeActionEligibilityEvidence(
      eligibilityEvidence(),
      plannedAction(),
    );
    expect(result.valid).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.value).toEqual({
      actionId: 'action-snapshot',
      recipeId: 'recipe-snapshot',
      checkedPrerequisiteRecipeIds: ['recipe-prerequisite'],
      eligible: true,
    });
  });
});
