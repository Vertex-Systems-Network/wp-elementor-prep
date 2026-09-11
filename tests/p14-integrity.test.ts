import { describe, expect, it } from 'vitest';
import {
  computeP14PlanDigest,
  validateP14PreparationPlan,
} from '../src/core/p14-plan-integrity';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';
import {
  serializeP14PreparationReceiptJson,
  validateP14PreparationReceipt,
} from '../src/core/p14-preparation-receipt';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import type {
  P14CandidateHandle,
  P14PreparationAction,
  P14PreparationPlanV1,
  P14PreparationRecipeDefinition,
  P14RecipeExecutionResult,
  P14RescoreSummary,
  P14RetainedDuplicateAdapter,
  P14ValidationSummary,
} from '../src/core/p14-preparation-types';

const SOURCE_ID = '1:1';
const SOURCE_FP = 'source-fp';

const parentRecipe: P14PreparationRecipeDefinition = {
  id: 'P14_PARENT',
  version: 1,
  sourceRuleIds: ['RULE_PARENT'],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_VALIDATE_PARENT',
  conflictsWith: [],
  orderClass: '99-label-late',
};

const childRecipe: P14PreparationRecipeDefinition = {
  id: 'P14_CHILD',
  version: 1,
  sourceRuleIds: ['RULE_CHILD'],
  minConfidence: 90,
  prerequisites: ['P14_PARENT'],
  mutationAllowlist: ['layoutSizing'],
  validationProfileId: 'P14_VALIDATE_CHILD',
  conflictsWith: [],
  orderClass: '01-label-early',
};

const testRegistry = createP14SafeRecipeRegistry([
  { sourceRuleId: 'RULE_PARENT', sourceRuleVersion: 1, recipe: parentRecipe },
  { sourceRuleId: 'RULE_CHILD', sourceRuleVersion: 1, recipe: childRecipe },
]);

function plan(): P14PreparationPlanV1 {
  return buildP14PreparationPlan({
    p13RunId: 'p13-integrity-run',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [
      {
        findingId: 'child', sourceRuleId: 'RULE_CHILD', sourceRuleVersion: 1,
        targetNodeIds: ['3:1'], confidence: 99, remediationClass: 'P14_SAFE_CANDIDATE',
        acceptedRecipeId: childRecipe.id, acceptedRecipeVersion: 1,
      },
      {
        findingId: 'parent', sourceRuleId: 'RULE_PARENT', sourceRuleVersion: 1,
        targetNodeIds: ['2:1'], confidence: 99, remediationClass: 'P14_SAFE_CANDIDATE',
        acceptedRecipeId: parentRecipe.id, acceptedRecipeVersion: 1,
      },
    ],
    recipes: [childRecipe, parentRecipe],
  });
}

class CountingAdapter implements P14RetainedDuplicateAdapter {
  calls = {
    fingerprint: 0,
    clone: 0,
    apply: 0,
    validate: 0,
    rescore: 0,
    retain: 0,
    discard: 0,
  };
  becomeNoOp = false;
  bothOutcomes = false;

  async fingerprintSource(): Promise<string> {
    this.calls.fingerprint += 1;
    return SOURCE_FP;
  }

  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    this.calls.clone += 1;
    return { sourceNodeId, candidateNodeId: 'candidate:1' };
  }

  async assessActionEligibility(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<unknown> {
    return {
      actionId: action.actionId,
      recipeId: action.recipeId,
      checkedPrerequisiteRecipeIds: [...action.prerequisiteRecipeIds],
      eligible: true,
    };
  }

  async applyRecipe(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    this.calls.apply += 1;
    return {
      actionId: action.actionId,
      recipeId: action.recipeId ?? 'missing',
      applied: this.bothOutcomes || !this.becomeNoOp,
      ...((this.becomeNoOp || this.bothOutcomes) ? { becameNoOp: true } : {}),
    };
  }

  async validateCandidate(): Promise<P14ValidationSummary> {
    this.calls.validate += 1;
    return {
      passed: true,
      profileIdsRun: ['P14_VALIDATE_PARENT', 'P14_VALIDATE_CHILD'],
      checks: [{ id: 'required', passed: true, required: true }],
    };
  }

  async rescoreCandidate(): Promise<P14RescoreSummary> {
    this.calls.rescore += 1;
    return {
      runId: 'p13-candidate',
      score: 95,
      status: 'READY',
      blockerCount: 0,
      highRiskCount: 0,
      introducedBlockerOrHighCount: 0,
      reviewRequired: false,
    };
  }

  async retainCandidate(candidate: P14CandidateHandle, transactionId: string, preparedName: string) {
    this.calls.retain += 1;
    return {
      transactionId,
      sourceNodeId: candidate.sourceNodeId,
      retainedNodeId: candidate.candidateNodeId,
      preparedName,
    };
  }

  async discardCandidate(): Promise<void> {
    this.calls.discard += 1;
  }
}

function clonePlan(source: P14PreparationPlanV1): P14PreparationPlanV1 {
  return JSON.parse(JSON.stringify(source)) as P14PreparationPlanV1;
}

const fixedNow = () => '2026-09-12T00:00:00.000Z';

describe('P14 preparation plan integrity', () => {
  it('validates the canonical planner output and reproduces its exact digest', () => {
    const value = plan();
    expect(validateP14PreparationPlan(value)).toEqual({ valid: true, failures: [] });
    expect(value.planDigest).toBe(computeP14PlanDigest({
      p13RunId: value.p13RunId,
      sourceNodeId: value.source.nodeId,
      sourceFingerprint: value.source.fingerprint,
      actions: value.actions,
    }));
    expect(value.actions.filter((action) => action.decision === 'ELIGIBLE').map((action) => action.recipeId)).toEqual([
      'P14_PARENT',
      'P14_CHILD',
    ]);
  });

  it('rejects forged digest, bucket manipulation, duplicate IDs and fake READY state', () => {
    const digest = clonePlan(plan());
    digest.planDigest = 'p14-plan-deadbeef';
    expect(validateP14PreparationPlan(digest).failures.some((failure) => failure.includes('planDigest'))).toBe(true);

    const bucket = clonePlan(plan());
    bucket.eligibleActionIds = [...bucket.eligibleActionIds].reverse();
    expect(validateP14PreparationPlan(bucket).failures.some((failure) => failure.includes('eligibleActionIds'))).toBe(true);

    const duplicate = clonePlan(plan());
    duplicate.actions[1]!.actionId = duplicate.actions[0]!.actionId;
    duplicate.planDigest = computeP14PlanDigest({
      p13RunId: duplicate.p13RunId,
      sourceNodeId: duplicate.source.nodeId,
      sourceFingerprint: duplicate.source.fingerprint,
      actions: duplicate.actions,
    });
    expect(validateP14PreparationPlan(duplicate).failures.some((failure) => failure.includes('duplicate action IDs'))).toBe(true);

    const blocked = buildP14PreparationPlan({
      p13RunId: 'p13-blocked',
      sourceNodeId: SOURCE_ID,
      sourceFingerprint: SOURCE_FP,
      findings: [{
        findingId: 'review', sourceRuleId: 'RULE_REVIEW', sourceRuleVersion: 1,
        targetNodeIds: ['4:1'], confidence: 50, remediationClass: 'MANUAL_REVIEW',
      }],
      recipes: [],
    });
    const fakeReady = clonePlan(blocked);
    fakeReady.status = 'READY';
    expect(validateP14PreparationPlan(fakeReady).failures.some((failure) => failure.includes('status contradicts'))).toBe(true);
  });

  it('rejects dependency-order tampering even if the attacker recomputes the digest', () => {
    const tampered = clonePlan(plan());
    tampered.actions = [...tampered.actions].reverse();
    tampered.eligibleActionIds = tampered.actions.filter((action) => action.decision === 'ELIGIBLE').map((action) => action.actionId);
    tampered.planDigest = computeP14PlanDigest({
      p13RunId: tampered.p13RunId,
      sourceNodeId: tampered.source.nodeId,
      sourceFingerprint: tampered.source.fingerprint,
      actions: tampered.actions,
    });

    const result = validateP14PreparationPlan(tampered);
    expect(result.valid).toBe(false);
    expect(result.failures.some((failure) => failure.includes('canonical dependency/topological order'))).toBe(true);
  });

  it('blocks a malformed plan before touching any runtime adapter operation', async () => {
    const tampered = clonePlan(plan());
    tampered.planDigest = 'p14-plan-forged';
    const adapter = new CountingAdapter();

    const receipt = await runP14RetainedDuplicateTransaction({
      plan: tampered,
      transactionId: 'p14-invalid-plan',
      now: fixedNow,
    }, adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.acceptanceAuthority).toBe(false);
    expect(receipt.targetCompatibilityClaim).toBe(false);
    expect(Object.values(adapter.calls).every((count) => count === 0)).toBe(true);
    expect(receipt.errors[0]?.code).toBe('P14_INTERNAL_INVARIANT_FAILED');
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });
});

describe('P14 receipt integrity', () => {
  it('accepts a generated PREPARED receipt and canonical serialization', async () => {
    const adapter = new CountingAdapter();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan: plan(),
      confirmation: buildP14PreparationConfirmation(plan(), fixedNow()),
      registry: testRegistry,
      transactionId: 'p14-valid',
      preparedName: 'Desktop — Prepared',
      now: fixedNow,
    }, adapter);

    expect(receipt.status).toBe('PREPARED');
    expect(receipt.acceptanceAuthority).toBe(false);
    expect(receipt.targetCompatibilityClaim).toBe(false);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
    expect(serializeP14PreparationReceiptJson(receipt).endsWith('\n')).toBe(true);
  });

  it('accepts an idempotent recipe result that becomes a proven no-op', async () => {
    const adapter = new CountingAdapter();
    adapter.becomeNoOp = true;
    const receipt = await runP14RetainedDuplicateTransaction({
      plan: plan(),
      confirmation: buildP14PreparationConfirmation(plan(), fixedNow()),
      registry: testRegistry,
      transactionId: 'p14-idempotent-noop',
      now: fixedNow,
    }, adapter);

    expect(receipt.status).toBe('PREPARED');
    expect(receipt.appliedActions).toHaveLength(2);
    expect(receipt.appliedActions.every((action) => action.applied === false && action.becameNoOp === true)).toBe(true);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('rejects contradictory dual recipe outcomes and discards the candidate', async () => {
    const adapter = new CountingAdapter();
    adapter.bothOutcomes = true;
    const receipt = await runP14RetainedDuplicateTransaction({
      plan: plan(),
      confirmation: buildP14PreparationConfirmation(plan(), fixedNow()),
      registry: testRegistry,
      transactionId: 'p14-dual-outcome',
      now: fixedNow,
    }, adapter);

    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_TRANSFORM_FAILED');
    expect(adapter.calls.discard).toBe(1);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('rejects malformed error, event and validation-check evidence', async () => {
    const receipt = await runP14RetainedDuplicateTransaction({
      plan: plan(),
      confirmation: buildP14PreparationConfirmation(plan(), fixedNow()),
      registry: testRegistry,
      transactionId: 'p14-shape-source',
      now: fixedNow,
    }, new CountingAdapter());

    const badError = JSON.parse(JSON.stringify(receipt)) as any;
    badError.status = 'REJECTED';
    badError.terminalState = 'REJECTED';
    badError.candidate.retained = false;
    delete badError.retention;
    badError.errors = ['not-an-error-object'];
    badError.events[badError.events.length - 1] = { state: 'REJECTED', at: fixedNow() };
    expect(validateP14PreparationReceipt(badError).failures.some((failure) => failure.includes('errors[0]'))).toBe(true);

    const badEvent = JSON.parse(JSON.stringify(receipt)) as any;
    badEvent.events[1].at = 'not-a-timestamp';
    expect(validateP14PreparationReceipt(badEvent).failures.some((failure) => failure.includes('events[1]'))).toBe(true);

    const badCheck = JSON.parse(JSON.stringify(receipt)) as any;
    badCheck.validation.checks[0] = { id: 'required', passed: true };
    expect(validateP14PreparationReceipt(badCheck).failures.some((failure) => failure.includes('validation.checks[0]'))).toBe(true);
  });

  it('fails closed on forged authority, target compatibility and retention identity', async () => {
    const receipt = await runP14RetainedDuplicateTransaction({
      plan: plan(),
      confirmation: buildP14PreparationConfirmation(plan(), fixedNow()),
      registry: testRegistry,
      transactionId: 'p14-forgery-source',
      now: fixedNow,
    }, new CountingAdapter());

    const authority = JSON.parse(JSON.stringify(receipt)) as any;
    authority.acceptanceAuthority = true;
    expect(validateP14PreparationReceipt(authority).failures.some((failure) => failure.includes('acceptanceAuthority=false'))).toBe(true);

    const target = JSON.parse(JSON.stringify(receipt)) as any;
    target.targetCompatibilityClaim = true;
    expect(validateP14PreparationReceipt(target).failures.some((failure) => failure.includes('targetCompatibilityClaim=false'))).toBe(true);

    const retention = JSON.parse(JSON.stringify(receipt)) as any;
    retention.retention.retainedNodeId = 'other-node';
    expect(validateP14PreparationReceipt(retention).failures.some((failure) => failure.includes('retainedNodeId contradicts'))).toBe(true);
  });
});
