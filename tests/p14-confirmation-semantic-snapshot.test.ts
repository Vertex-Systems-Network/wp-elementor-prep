import { describe, expect, it } from 'vitest';
import {
  buildP14PreparationConfirmation,
  validateP14PreparationConfirmation,
} from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import type {
  P14PreparationPlanV1,
  P14PreparationRecipeDefinition,
} from '../src/core/p14-preparation-types';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_CONFIRMATION_SNAPSHOT',
  version: 1,
  sourceRuleIds: ['RULE_CONFIRMATION_SNAPSHOT'],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_VALIDATE_CONFIRMATION_SNAPSHOT',
  conflictsWith: [],
  orderClass: '01-confirmation-snapshot',
};

const confirmedAt = '2026-09-12T00:00:00.000Z';

function validPlan(): P14PreparationPlanV1 {
  return buildP14PreparationPlan({
    p13RunId: 'p13-confirmation-snapshot',
    sourceNodeId: '1:1',
    sourceFingerprint: 'source-confirmation-snapshot',
    findings: [{
      findingId: 'finding-confirmation-snapshot',
      sourceRuleId: 'RULE_CONFIRMATION_SNAPSHOT',
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

describe('P14 standalone confirmation semantic snapshot', () => {
  it('fails closed when the top-level confirmation proxy is revoked', () => {
    const plan = validPlan();
    const confirmation = buildP14PreparationConfirmation(plan, confirmedAt);
    const revoked = Proxy.revocable(confirmation as unknown as object, {});
    revoked.revoke();

    let result;
    expect(() => {
      result = validateP14PreparationConfirmation(revoked.proxy, plan);
    }).not.toThrow();
    expect(result!.valid).toBe(false);
    expect(result!.failures.some((failure: string) => failure.includes('confirmation could not be classified safely'))).toBe(true);
  });

  it('fails closed when the reviewed plan proxy is revoked', () => {
    const plan = validPlan();
    const confirmation = buildP14PreparationConfirmation(plan, confirmedAt);
    const revoked = Proxy.revocable(plan as unknown as object, {});
    revoked.revoke();

    let result;
    expect(() => {
      result = validateP14PreparationConfirmation(confirmation, revoked.proxy as P14PreparationPlanV1);
    }).not.toThrow();
    expect(result!.valid).toBe(false);
    expect(result!.failures.some((failure: string) => failure.includes('plan could not be classified safely'))).toBe(true);
  });

  it('captures stateful confirmation semantic getters exactly once', () => {
    const plan = validPlan();
    const confirmation = buildP14PreparationConfirmation(plan, confirmedAt) as any;
    const expectedDigest = confirmation.planDigest;
    let digestReads = 0;
    let sourceReads = 0;

    Object.defineProperty(confirmation, 'planDigest', {
      enumerable: true,
      configurable: true,
      get() {
        digestReads += 1;
        return digestReads === 1 ? expectedDigest : 'p14-plan-forged';
      },
    });
    Object.defineProperty(confirmation.source, 'nodeId', {
      enumerable: true,
      configurable: true,
      get() {
        sourceReads += 1;
        return sourceReads === 1 ? plan.source.nodeId : 'forged-source';
      },
    });

    expect(validateP14PreparationConfirmation(confirmation, plan)).toEqual({ valid: true, failures: [] });
    expect(digestReads).toBe(1);
    expect(sourceReads).toBe(1);
  });

  it('copies confirmation action-ID indices once before binding semantics', () => {
    const plan = validPlan();
    const confirmation = buildP14PreparationConfirmation(plan, confirmedAt) as any;
    const sourceActionIds = confirmation.eligibleActionIds;
    let indexReads = 0;
    confirmation.eligibleActionIds = new Proxy(sourceActionIds, {
      get(target, property, receiver) {
        if (typeof property === 'string' && /^\d+$/.test(property)) {
          indexReads += 1;
          if (indexReads > target.length) throw new Error('confirmation action IDs were re-read after semantic capture');
        }
        return Reflect.get(target, property, receiver);
      },
    });

    expect(validateP14PreparationConfirmation(confirmation, plan)).toEqual({ valid: true, failures: [] });
    expect(indexReads).toBe(sourceActionIds.length);
  });

  it('captures reviewed-plan binding evidence exactly once', () => {
    const plan = validPlan() as any;
    const confirmation = buildP14PreparationConfirmation(plan, confirmedAt);
    let statusReads = 0;
    let fingerprintReads = 0;

    Object.defineProperty(plan, 'status', {
      enumerable: true,
      configurable: true,
      get() {
        statusReads += 1;
        return statusReads === 1 ? 'READY' : 'BLOCKED';
      },
    });
    Object.defineProperty(plan.source, 'fingerprint', {
      enumerable: true,
      configurable: true,
      get() {
        fingerprintReads += 1;
        return fingerprintReads === 1 ? confirmation.source.fingerprint : 'forged-fingerprint';
      },
    });

    expect(validateP14PreparationConfirmation(confirmation, plan)).toEqual({ valid: true, failures: [] });
    expect(statusReads).toBe(1);
    expect(fingerprintReads).toBe(1);
  });

  it('preserves canonical confirmation validation', () => {
    const plan = validPlan();
    const confirmation = buildP14PreparationConfirmation(plan, confirmedAt);
    expect(validateP14PreparationConfirmation(confirmation, plan)).toEqual({ valid: true, failures: [] });
  });
});
