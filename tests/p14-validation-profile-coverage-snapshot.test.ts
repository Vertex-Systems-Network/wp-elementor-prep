import { describe, expect, it } from 'vitest';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import {
  assessP14ValidationProfileCoverage,
  requiredP14ValidationProfileIds,
} from '../src/core/p14-validation-profile-coverage';
import type {
  P14PreparationPlanV1,
  P14PreparationRecipeDefinition,
} from '../src/core/p14-preparation-types';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_PROFILE_SNAPSHOT',
  version: 1,
  sourceRuleIds: ['RULE_PROFILE_SNAPSHOT'],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'PROFILE_SNAPSHOT_REQUIRED',
  conflictsWith: [],
  orderClass: '01-profile-snapshot',
};

function validPlan(): P14PreparationPlanV1 {
  return buildP14PreparationPlan({
    p13RunId: 'p13-profile-snapshot',
    sourceNodeId: '1:1',
    sourceFingerprint: 'source-profile-snapshot',
    findings: [{
      findingId: 'finding-profile-snapshot',
      sourceRuleId: 'RULE_PROFILE_SNAPSHOT',
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

describe('P14 validation-profile coverage snapshots', () => {
  it('fails closed without throwing when plan evidence is revoked', () => {
    const revoked = Proxy.revocable(validPlan() as unknown as object, {});
    revoked.revoke();

    expect(() => requiredP14ValidationProfileIds(revoked.proxy as P14PreparationPlanV1)).not.toThrow();
    expect(requiredP14ValidationProfileIds(revoked.proxy as P14PreparationPlanV1)).toEqual([]);

    let result;
    expect(() => {
      result = assessP14ValidationProfileCoverage(
        revoked.proxy as P14PreparationPlanV1,
        ['PROFILE_SNAPSHOT_REQUIRED'],
      );
    }).not.toThrow();
    expect(result!.valid).toBe(false);
    expect(result!.requiredProfileIds).toEqual([]);
    expect(result!.observedProfileIds).toEqual([]);
    expect(result!.failures.some((failure: string) => failure.includes('Invalid P14 validation coverage plan evidence'))).toBe(true);
  });

  it('captures stateful eligible-action profile semantics exactly once', () => {
    const plan = validPlan() as any;
    const action = plan.actions.find((item: any) => item.decision === 'ELIGIBLE');
    if (!action) throw new Error('expected eligible action');
    let decisionReads = 0;
    let profileReads = 0;

    Object.defineProperty(action, 'decision', {
      enumerable: true,
      configurable: true,
      get() {
        decisionReads += 1;
        return decisionReads === 1 ? 'ELIGIBLE' : 'REFUSED';
      },
    });
    Object.defineProperty(action, 'validationProfileId', {
      enumerable: true,
      configurable: true,
      get() {
        profileReads += 1;
        return profileReads === 1 ? 'PROFILE_SNAPSHOT_REQUIRED' : 'PROFILE_FORGED';
      },
    });

    const result = assessP14ValidationProfileCoverage(plan, ['PROFILE_SNAPSHOT_REQUIRED']);
    expect(result.valid).toBe(true);
    expect(result.requiredProfileIds).toEqual(['PROFILE_SNAPSHOT_REQUIRED']);
    expect(decisionReads).toBe(1);
    expect(profileReads).toBe(1);
  });

  it('fails closed without throwing when observed profile evidence is revoked', () => {
    const revoked = Proxy.revocable(['PROFILE_SNAPSHOT_REQUIRED'], {});
    revoked.revoke();

    let result;
    expect(() => {
      result = assessP14ValidationProfileCoverage(validPlan(), revoked.proxy);
    }).not.toThrow();
    expect(result!.valid).toBe(false);
    expect(result!.observedProfileIds).toEqual([]);
    expect(result!.failures.some((failure: string) => failure.includes('Validation profile evidence'))).toBe(true);
    expect(result!.failures.some((failure: string) => failure.includes('safely'))).toBe(true);
  });

  it('copies observed profile indices once before coverage semantics', () => {
    const profiles = ['PROFILE_SNAPSHOT_REQUIRED', 'OPTIONAL_PROFILE'];
    let indexReads = 0;
    const evidence = new Proxy(profiles, {
      get(target, property, receiver) {
        if (typeof property === 'string' && /^\d+$/.test(property)) {
          indexReads += 1;
          if (indexReads > target.length) throw new Error('observed profiles were re-read after capture');
        }
        return Reflect.get(target, property, receiver);
      },
    });

    const result = assessP14ValidationProfileCoverage(validPlan(), evidence);
    expect(result.valid).toBe(true);
    expect(result.observedProfileIds).toEqual(['OPTIONAL_PROFILE', 'PROFILE_SNAPSHOT_REQUIRED']);
    expect(indexReads).toBe(profiles.length);
  });

  it('preserves canonical required-profile derivation and exact coverage', () => {
    const plan = validPlan();
    expect(requiredP14ValidationProfileIds(plan)).toEqual(['PROFILE_SNAPSHOT_REQUIRED']);
    expect(assessP14ValidationProfileCoverage(plan, ['PROFILE_SNAPSHOT_REQUIRED'])).toEqual({
      version: 1,
      valid: true,
      failures: [],
      requiredProfileIds: ['PROFILE_SNAPSHOT_REQUIRED'],
      observedProfileIds: ['PROFILE_SNAPSHOT_REQUIRED'],
    });
  });
});
