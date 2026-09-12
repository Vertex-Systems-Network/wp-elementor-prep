import { describe, expect, it } from 'vitest';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import type {
  P14PreparationPlanV1,
  P14PreparationRecipeDefinition,
} from '../src/core/p14-preparation-types';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_CONFIRMATION_BUILD_SNAPSHOT',
  version: 1,
  sourceRuleIds: ['RULE_CONFIRMATION_BUILD_SNAPSHOT'],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_VALIDATE_CONFIRMATION_BUILD_SNAPSHOT',
  conflictsWith: [],
  orderClass: '01-confirmation-build-snapshot',
};

const confirmedAt = '2026-09-12T00:00:00.000Z';

function validPlan(): P14PreparationPlanV1 {
  return buildP14PreparationPlan({
    p13RunId: 'p13-confirmation-build-snapshot',
    sourceNodeId: '1:1',
    sourceFingerprint: 'source-confirmation-build-snapshot',
    findings: [{
      findingId: 'finding-confirmation-build-snapshot',
      sourceRuleId: 'RULE_CONFIRMATION_BUILD_SNAPSHOT',
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

describe('P14 confirmation builder semantic snapshot', () => {
  it('fails closed with a deterministic construction error when the reviewed plan proxy is revoked', () => {
    const revoked = Proxy.revocable(validPlan() as unknown as object, {});
    revoked.revoke();

    expect(() => buildP14PreparationConfirmation(
      revoked.proxy as P14PreparationPlanV1,
      confirmedAt,
    )).toThrow(/captured safely/);
  });

  it('captures stateful top-level plan semantics exactly once before construction', () => {
    const plan = validPlan() as any;
    const expectedDigest = plan.planDigest;
    let statusReads = 0;
    let digestReads = 0;

    Object.defineProperty(plan, 'status', {
      enumerable: true,
      configurable: true,
      get() {
        statusReads += 1;
        return statusReads === 1 ? 'READY' : 'BLOCKED';
      },
    });
    Object.defineProperty(plan, 'planDigest', {
      enumerable: true,
      configurable: true,
      get() {
        digestReads += 1;
        return digestReads === 1 ? expectedDigest : 'p14-plan-forged';
      },
    });

    const confirmation = buildP14PreparationConfirmation(plan, confirmedAt);
    expect(confirmation.planDigest).toBe(expectedDigest);
    expect(statusReads).toBe(1);
    expect(digestReads).toBe(1);
  });

  it('captures nested source evidence exactly once before construction', () => {
    const plan = validPlan() as any;
    const expectedFingerprint = plan.source.fingerprint;
    let fingerprintReads = 0;

    Object.defineProperty(plan.source, 'fingerprint', {
      enumerable: true,
      configurable: true,
      get() {
        fingerprintReads += 1;
        return fingerprintReads === 1 ? expectedFingerprint : 'forged-fingerprint';
      },
    });

    const confirmation = buildP14PreparationConfirmation(plan, confirmedAt);
    expect(confirmation.source.fingerprint).toBe(expectedFingerprint);
    expect(fingerprintReads).toBe(1);
  });

  it('copies reviewed eligible-action indices once before construction semantics', () => {
    const plan = validPlan() as any;
    const sourceActionIds = plan.eligibleActionIds;
    let indexReads = 0;
    plan.eligibleActionIds = new Proxy(sourceActionIds, {
      get(target, property, receiver) {
        if (typeof property === 'string' && /^\d+$/.test(property)) {
          indexReads += 1;
          if (indexReads > target.length) throw new Error('eligible action IDs were re-read after semantic capture');
        }
        return Reflect.get(target, property, receiver);
      },
    });

    const confirmation = buildP14PreparationConfirmation(plan, confirmedAt);
    expect(confirmation.eligibleActionIds).toEqual(sourceActionIds);
    expect(indexReads).toBe(sourceActionIds.length);
  });

  it('preserves canonical confirmation construction', () => {
    const plan = validPlan();
    const confirmation = buildP14PreparationConfirmation(plan, confirmedAt);
    expect(confirmation.planDigest).toBe(plan.planDigest);
    expect(confirmation.p13RunId).toBe(plan.p13RunId);
    expect(confirmation.source).toEqual(plan.source);
    expect(confirmation.eligibleActionIds).toEqual(plan.eligibleActionIds);
  });
});
