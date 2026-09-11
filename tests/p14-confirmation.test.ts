import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import {
  buildP14PreparationConfirmation,
  validateP14PreparationConfirmation,
} from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import type { P14PreparationRecipeDefinition } from '../src/core/p14-preparation-types';

const RULE_ID = 'SYNTHETIC_CONFIRM_RULE';
const RECIPE: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_CONFIRM_RECIPE',
  version: 1,
  sourceRuleIds: [RULE_ID],
  minConfidence: 95,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_SYNTHETIC_CONFIRM_VALIDATE',
  conflictsWith: [],
  orderClass: '10-structure',
};

function readyPlan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-confirm-run',
    sourceNodeId: 'confirm:source',
    sourceFingerprint: 'confirm-source-fingerprint',
    findings: [{
      findingId: 'confirm-finding',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['confirm:target'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: RECIPE.id,
      acceptedRecipeVersion: RECIPE.version,
    }],
    recipes: [RECIPE],
  });
}

function noOpPlan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-confirm-noop',
    sourceNodeId: 'confirm:source',
    sourceFingerprint: 'confirm-source-fingerprint',
    findings: [{
      findingId: 'confirm-noop',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['confirm:target'],
      confidence: 100,
      remediationClass: 'P14_SAFE_NOOP',
    }],
    recipes: [],
  });
}

const CONFIRMED_AT = '2026-09-12T00:00:00.000Z';

describe('P14 preparation confirmation contract', () => {
  it('builds non-authorizing confirmation bound to the exact reviewed plan', () => {
    const plan = readyPlan();
    const confirmation = buildP14PreparationConfirmation(plan, CONFIRMED_AT);

    expect(confirmation.acceptanceAuthority).toBe(false);
    expect(confirmation.targetCompatibilityClaim).toBe(false);
    expect(confirmation.planDigest).toBe(plan.planDigest);
    expect(confirmation.p13RunId).toBe(plan.p13RunId);
    expect(confirmation.source).toEqual(plan.source);
    expect(confirmation.eligibleActionIds).toEqual(plan.eligibleActionIds);
    expect(validateP14PreparationConfirmation(confirmation, plan)).toEqual({ valid: true, failures: [] });
  });

  it('rejects forged authority and target compatibility claims', () => {
    const plan = readyPlan();
    const authority = { ...buildP14PreparationConfirmation(plan, CONFIRMED_AT), acceptanceAuthority: true };
    const target = { ...buildP14PreparationConfirmation(plan, CONFIRMED_AT), targetCompatibilityClaim: true };

    expect(validateP14PreparationConfirmation(authority, plan).failures.some((failure) => failure.includes('acceptanceAuthority=false'))).toBe(true);
    expect(validateP14PreparationConfirmation(target, plan).failures.some((failure) => failure.includes('targetCompatibilityClaim=false'))).toBe(true);
  });

  it('rejects stale digest, source, run and action-set bindings', () => {
    const plan = readyPlan();
    const base = buildP14PreparationConfirmation(plan, CONFIRMED_AT);

    const staleDigest = { ...base, planDigest: 'p14-plan-stale' };
    expect(validateP14PreparationConfirmation(staleDigest, plan).failures.some((failure) => failure.includes('planDigest does not match'))).toBe(true);

    const staleRun = { ...base, p13RunId: 'p13-other-run' };
    expect(validateP14PreparationConfirmation(staleRun, plan).failures.some((failure) => failure.includes('p13RunId does not match'))).toBe(true);

    const staleSource = { ...base, source: { ...base.source, fingerprint: 'other-fingerprint' } };
    expect(validateP14PreparationConfirmation(staleSource, plan).failures.some((failure) => failure.includes('source identity does not match'))).toBe(true);

    const staleActions = { ...base, eligibleActionIds: ['p14-action-other'] };
    expect(validateP14PreparationConfirmation(staleActions, plan).failures.some((failure) => failure.includes('eligibleActionIds do not match'))).toBe(true);
  });

  it('short-circuits oversized confirmation action lists without traversing their items', () => {
    const plan = readyPlan();
    const target = new Array(DEFAULT_P14_INPUT_BOUNDS.maxBucketActionIds + 1);
    const eligibleActionIds = new Proxy(target, {
      get(array, property, receiver) {
        if (property !== 'length') throw new Error(`oversized confirmation action content was touched: ${String(property)}`);
        return Reflect.get(array, property, receiver);
      },
    });
    const confirmation = {
      ...buildP14PreparationConfirmation(plan, CONFIRMED_AT),
      eligibleActionIds,
    };

    expect(() => validateP14PreparationConfirmation(confirmation, plan)).not.toThrow();
    const result = validateP14PreparationConfirmation(confirmation, plan);
    expect(result.valid).toBe(false);
    expect(result.failures.some((failure) => failure.includes('bounded action-ID limit'))).toBe(true);
  });

  it('does not create mutation confirmation for a no-op plan or invalid timestamp', () => {
    expect(() => buildP14PreparationConfirmation(noOpPlan(), CONFIRMED_AT)).toThrow(/only valid for READY plans/);
    expect(() => buildP14PreparationConfirmation(readyPlan(), 'not-a-time')).toThrow(/valid bounded timestamp/);
  });
});
