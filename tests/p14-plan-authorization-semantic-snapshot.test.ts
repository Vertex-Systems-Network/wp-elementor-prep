import { describe, expect, it } from 'vitest';
import { authorizeP14PreparationPlan } from '../src/core/p14-plan-authorization';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';
import type {
  P14PreparationPlanV1,
  P14PreparationRecipeDefinition,
} from '../src/core/p14-preparation-types';

const ruleId = 'RULE_AUTH_SNAPSHOT';
const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_AUTH_SNAPSHOT',
  version: 1,
  sourceRuleIds: [ruleId],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode', 'padding'],
  validationProfileId: 'P14_VALIDATE_AUTH_SNAPSHOT',
  conflictsWith: [],
  orderClass: '01-auth-snapshot',
};

const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: ruleId, sourceRuleVersion: 1, recipe },
]);

function validPlan(): P14PreparationPlanV1 {
  return buildP14PreparationPlan({
    p13RunId: 'p13-auth-snapshot',
    sourceNodeId: '1:1',
    sourceFingerprint: 'source-auth-snapshot',
    findings: [{
      findingId: 'finding-auth-snapshot',
      sourceRuleId: ruleId,
      sourceRuleVersion: 1,
      targetNodeIds: ['2:1'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

describe('P14 execution authorization semantic snapshot', () => {
  it('fails closed without throwing when the plan proxy is revoked', () => {
    const revoked = Proxy.revocable(validPlan() as unknown as object, {});
    revoked.revoke();

    let result;
    expect(() => {
      result = authorizeP14PreparationPlan(revoked.proxy as P14PreparationPlanV1, registry);
    }).not.toThrow();
    expect(result!.authorized).toBe(false);
    expect(result!.authorizedActionIds).toEqual([]);
    expect(result!.failures.some((failure: string) => failure.includes('Invalid P14 plan evidence'))).toBe(true);
    expect(result!.failures.some((failure: string) => failure.includes('plan could not be classified safely'))).toBe(true);
  });

  it('captures stateful action authorization fields exactly once', () => {
    const plan = validPlan() as any;
    const action = plan.actions.find((item: any) => item.decision === 'ELIGIBLE');
    if (!action) throw new Error('expected eligible action');
    const expectedProfile = action.validationProfileId;
    const expectedAllowlist = [...action.mutationAllowlist];
    let profileReads = 0;
    let allowlistReads = 0;

    Object.defineProperty(action, 'validationProfileId', {
      enumerable: true,
      configurable: true,
      get() {
        profileReads += 1;
        return profileReads === 1 ? expectedProfile : 'FORGED_PROFILE';
      },
    });
    Object.defineProperty(action, 'mutationAllowlist', {
      enumerable: true,
      configurable: true,
      get() {
        allowlistReads += 1;
        return allowlistReads === 1 ? expectedAllowlist : [];
      },
    });

    const result = authorizeP14PreparationPlan(plan, registry);
    expect(result).toEqual({
      authorized: true,
      failures: [],
      authorizedActionIds: plan.eligibleActionIds,
    });
    expect(profileReads).toBe(1);
    expect(allowlistReads).toBe(1);
  });

  it('captures the eligibility decision exactly once before authorization', () => {
    const plan = validPlan() as any;
    const action = plan.actions.find((item: any) => item.decision === 'ELIGIBLE');
    if (!action) throw new Error('expected eligible action');
    let decisionReads = 0;

    Object.defineProperty(action, 'decision', {
      enumerable: true,
      configurable: true,
      get() {
        decisionReads += 1;
        return decisionReads === 1 ? 'ELIGIBLE' : 'REFUSED';
      },
    });

    const result = authorizeP14PreparationPlan(plan, registry);
    expect(result.authorized).toBe(true);
    expect(result.authorizedActionIds).toEqual(plan.eligibleActionIds);
    expect(decisionReads).toBe(1);
  });

  it('copies plan action indices once before authorization semantics', () => {
    const plan = validPlan() as any;
    const sourceActions = plan.actions;
    let indexReads = 0;
    plan.actions = new Proxy(sourceActions, {
      get(target, property, receiver) {
        if (typeof property === 'string' && /^\d+$/.test(property)) {
          indexReads += 1;
          if (indexReads > target.length) throw new Error('plan actions were re-read after authorization capture');
        }
        return Reflect.get(target, property, receiver);
      },
    });

    const result = authorizeP14PreparationPlan(plan, registry);
    expect(result.authorized).toBe(true);
    expect(result.authorizedActionIds).toEqual(plan.eligibleActionIds);
    expect(indexReads).toBe(sourceActions.length);
  });

  it('preserves canonical exact-contract authorization', () => {
    const plan = validPlan();
    expect(authorizeP14PreparationPlan(plan, registry)).toEqual({
      authorized: true,
      failures: [],
      authorizedActionIds: plan.eligibleActionIds,
    });
  });
});
