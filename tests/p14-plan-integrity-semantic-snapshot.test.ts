import { describe, expect, it } from 'vitest';
import { validateP14PreparationPlan } from '../src/core/p14-plan-integrity';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import type {
  P14PreparationPlanV1,
  P14PreparationRecipeDefinition,
} from '../src/core/p14-preparation-types';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_PLAN_SNAPSHOT',
  version: 1,
  sourceRuleIds: ['RULE_PLAN_SNAPSHOT'],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_VALIDATE_PLAN_SNAPSHOT',
  conflictsWith: [],
  orderClass: '01-plan-snapshot',
};

function validPlan(): P14PreparationPlanV1 {
  return buildP14PreparationPlan({
    p13RunId: 'p13-plan-snapshot',
    sourceNodeId: '1:1',
    sourceFingerprint: 'source-plan-snapshot',
    findings: [{
      findingId: 'finding-plan-snapshot',
      sourceRuleId: 'RULE_PLAN_SNAPSHOT',
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

describe('P14 standalone plan-integrity semantic snapshot', () => {
  it('fails closed when the top-level plan proxy is revoked', () => {
    const revoked = Proxy.revocable(validPlan() as unknown as object, {});
    revoked.revoke();

    let result;
    expect(() => {
      result = validateP14PreparationPlan(revoked.proxy);
    }).not.toThrow();
    expect(result!.valid).toBe(false);
    expect(result!.failures.some((failure: string) => failure.includes('plan could not be classified safely'))).toBe(true);
  });

  it('captures a stateful top-level semantic field exactly once', () => {
    const plan = validPlan() as any;
    let statusReads = 0;
    Object.defineProperty(plan, 'status', {
      enumerable: true,
      configurable: true,
      get() {
        statusReads += 1;
        return statusReads === 1 ? 'READY' : 'BLOCKED';
      },
    });

    expect(validateP14PreparationPlan(plan)).toEqual({ valid: true, failures: [] });
    expect(statusReads).toBe(1);
  });

  it('captures source and action semantic getters exactly once', () => {
    const plan = validPlan() as any;
    const expectedActionId = plan.actions[0].actionId;
    let sourceReads = 0;
    let actionReads = 0;

    Object.defineProperty(plan.source, 'nodeId', {
      enumerable: true,
      configurable: true,
      get() {
        sourceReads += 1;
        return sourceReads === 1 ? '1:1' : 'forged-source';
      },
    });
    Object.defineProperty(plan.actions[0], 'actionId', {
      enumerable: true,
      configurable: true,
      get() {
        actionReads += 1;
        return actionReads === 1 ? expectedActionId : 'forged-action';
      },
    });

    expect(validateP14PreparationPlan(plan)).toEqual({ valid: true, failures: [] });
    expect(sourceReads).toBe(1);
    expect(actionReads).toBe(1);
  });

  it('copies action-array indices once before integrity semantics', () => {
    const plan = validPlan() as any;
    const sourceActions = plan.actions;
    let indexReads = 0;
    plan.actions = new Proxy(sourceActions, {
      get(target, property, receiver) {
        if (typeof property === 'string' && /^\\d+$/.test(property)) {
          indexReads += 1;
          if (indexReads > target.length) throw new Error('actions were re-read after semantic capture');
        }
        return Reflect.get(target, property, receiver);
      },
    });

    expect(validateP14PreparationPlan(plan)).toEqual({ valid: true, failures: [] });
    expect(indexReads).toBe(sourceActions.length);
  });

  it('fails closed for revoked action collection evidence', () => {
    const plan = validPlan() as any;
    const revoked = Proxy.revocable([...plan.actions], {});
    revoked.revoke();
    plan.actions = revoked.proxy;

    let result;
    expect(() => {
      result = validateP14PreparationPlan(plan);
    }).not.toThrow();
    expect(result!.valid).toBe(false);
    expect(result!.failures.some((failure: string) => failure.includes('plan.actions could not be classified safely'))).toBe(true);
  });

  it('fails closed for revoked nested action evidence', () => {
    const plan = validPlan() as any;
    const revoked = Proxy.revocable(plan.actions[0] as object, {});
    revoked.revoke();
    plan.actions[0] = revoked.proxy;

    let result;
    expect(() => {
      result = validateP14PreparationPlan(plan);
    }).not.toThrow();
    expect(result!.valid).toBe(false);
    expect(result!.failures.some((failure: string) => failure.includes('plan.actions[0] could not be classified safely'))).toBe(true);
  });

  it('preserves canonical planner output integrity', () => {
    expect(validateP14PreparationPlan(validPlan())).toEqual({ valid: true, failures: [] });
  });
});
