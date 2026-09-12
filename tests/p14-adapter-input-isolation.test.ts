import { describe, expect, it } from 'vitest';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';
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

const SOURCE_ID = 'adapter-input-isolation:source';
const SOURCE_FP = 'adapter-input-isolation-source-fingerprint';
const CANDIDATE_ID = 'adapter-input-isolation:candidate';
const RULE_A = 'SYNTHETIC_ADAPTER_INPUT_RULE_A';
const RULE_B = 'SYNTHETIC_ADAPTER_INPUT_RULE_B';
const PROFILE_A = 'P14_SYNTHETIC_ADAPTER_INPUT_VALIDATE_A';
const PROFILE_B = 'P14_SYNTHETIC_ADAPTER_INPUT_VALIDATE_B';
const NOW = '2026-09-12T00:00:00.000Z';

const recipeA: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_ADAPTER_INPUT_RECIPE_A',
  version: 1,
  sourceRuleIds: [RULE_A],
  minConfidence: 95,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: PROFILE_A,
  conflictsWith: [],
  orderClass: '10-structure',
};

const recipeB: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_ADAPTER_INPUT_RECIPE_B',
  version: 1,
  sourceRuleIds: [RULE_B],
  minConfidence: 95,
  prerequisites: [recipeA.id],
  mutationAllowlist: ['layoutGrow'],
  validationProfileId: PROFILE_B,
  conflictsWith: [],
  orderClass: '20-layout',
};

function registry() {
  return createP14SafeRecipeRegistry([
    { sourceRuleId: RULE_A, sourceRuleVersion: 1, recipe: recipeA },
    { sourceRuleId: RULE_B, sourceRuleVersion: 1, recipe: recipeB },
  ]);
}

function twoActionPlan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-adapter-input-isolation',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [
      {
        findingId: 'adapter-input-finding-a',
        sourceRuleId: RULE_A,
        sourceRuleVersion: 1,
        targetNodeIds: ['adapter-input:target-a'],
        confidence: 99,
        remediationClass: 'P14_SAFE_CANDIDATE',
        acceptedRecipeId: recipeA.id,
        acceptedRecipeVersion: recipeA.version,
      },
      {
        findingId: 'adapter-input-finding-b',
        sourceRuleId: RULE_B,
        sourceRuleVersion: 1,
        targetNodeIds: ['adapter-input:target-b'],
        confidence: 99,
        remediationClass: 'P14_SAFE_CANDIDATE',
        acceptedRecipeId: recipeB.id,
        acceptedRecipeVersion: recipeB.version,
      },
    ],
    recipes: [recipeA, recipeB],
  });
}

function oneActionPlan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-adapter-input-isolation-cleanup',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'adapter-input-cleanup-finding',
      sourceRuleId: RULE_A,
      sourceRuleVersion: 1,
      targetNodeIds: ['adapter-input:cleanup-target'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipeA.id,
      acceptedRecipeVersion: recipeA.version,
    }],
    recipes: [recipeA],
  });
}

class MutatingAdapter implements P14RetainedDuplicateAdapter {
  candidateRefs: P14CandidateHandle[] = [];
  actionRefs: P14PreparationAction[] = [];
  planRefs: P14PreparationPlanV1[] = [];
  observed: string[] = [];

  async fingerprintSource(sourceNodeId: string): Promise<string> {
    this.observed.push(`fingerprint:${sourceNodeId}`);
    return SOURCE_FP;
  }

  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    return { sourceNodeId, candidateNodeId: CANDIDATE_ID };
  }

  async assessActionEligibility(
    candidate: P14CandidateHandle,
    action: P14PreparationAction,
  ): Promise<unknown> {
    this.candidateRefs.push(candidate);
    this.actionRefs.push(action);
    const actionId = action.actionId;
    const recipeId = action.recipeId ?? 'missing';
    const prerequisites = [...action.prerequisiteRecipeIds];
    this.observed.push(`eligibility:${candidate.candidateNodeId}:${actionId}:${recipeId}`);

    candidate.candidateNodeId = 'poisoned-by-eligibility';
    action.actionId = 'poisoned-action-by-eligibility';
    action.recipeId = 'poisoned-recipe-by-eligibility';
    action.prerequisiteRecipeIds.splice(0, action.prerequisiteRecipeIds.length, 'poisoned-prerequisite');

    return {
      actionId,
      recipeId,
      checkedPrerequisiteRecipeIds: prerequisites,
      eligible: true,
    };
  }

  async applyRecipe(
    candidate: P14CandidateHandle,
    action: P14PreparationAction,
  ): Promise<P14RecipeExecutionResult> {
    this.candidateRefs.push(candidate);
    this.actionRefs.push(action);
    const actionId = action.actionId;
    const recipeId = action.recipeId ?? 'missing';
    this.observed.push(`apply:${candidate.candidateNodeId}:${actionId}:${recipeId}`);

    candidate.sourceNodeId = 'poisoned-source-by-apply';
    candidate.candidateNodeId = 'poisoned-candidate-by-apply';
    action.actionId = 'poisoned-action-by-apply';
    action.recipeId = 'poisoned-recipe-by-apply';
    action.targetNodeIds.push('poisoned-target');
    action.mutationAllowlist.splice(0, action.mutationAllowlist.length);

    return { actionId, recipeId, applied: true };
  }

  async validateCandidate(
    candidate: P14CandidateHandle,
    plan: P14PreparationPlanV1,
  ): Promise<P14ValidationSummary> {
    this.candidateRefs.push(candidate);
    this.planRefs.push(plan);
    this.observed.push(`validate:${candidate.candidateNodeId}:${plan.source.nodeId}:${plan.actions[0]?.actionId}`);

    candidate.candidateNodeId = 'poisoned-by-validation';
    plan.source.nodeId = 'poisoned-plan-source-by-validation';
    plan.source.fingerprint = 'poisoned-plan-fingerprint-by-validation';
    if (plan.actions[0]) {
      plan.actions[0].actionId = 'poisoned-plan-action-by-validation';
      plan.actions[0].targetNodeIds.push('poisoned-plan-target-by-validation');
    }
    plan.eligibleActionIds.splice(0, plan.eligibleActionIds.length, 'poisoned-eligible-id');

    return {
      passed: true,
      profileIdsRun: [PROFILE_A, PROFILE_B],
      checks: [{ id: 'required', passed: true, required: true }],
    };
  }

  async rescoreCandidate(
    candidate: P14CandidateHandle,
    plan: P14PreparationPlanV1,
  ): Promise<P14RescoreSummary> {
    this.candidateRefs.push(candidate);
    this.planRefs.push(plan);
    this.observed.push(`rescore:${candidate.candidateNodeId}:${plan.source.nodeId}:${plan.actions[0]?.actionId}`);

    candidate.candidateNodeId = 'poisoned-by-rescore';
    plan.planDigest = 'p14-plan-poisoned-by-rescore';
    plan.p13RunId = 'poisoned-p13-run-by-rescore';

    return {
      runId: 'p13-adapter-input-isolation-rescore',
      score: 98,
      status: 'READY',
      blockerCount: 0,
      highRiskCount: 0,
      introducedBlockerOrHighCount: 0,
      reviewRequired: false,
    };
  }

  async retainCandidate(candidate: P14CandidateHandle, transactionId: string, preparedName: string) {
    this.candidateRefs.push(candidate);
    const sourceNodeId = candidate.sourceNodeId;
    const retainedNodeId = candidate.candidateNodeId;
    this.observed.push(`retain:${sourceNodeId}:${retainedNodeId}`);
    candidate.sourceNodeId = 'poisoned-source-by-retain';
    candidate.candidateNodeId = 'poisoned-candidate-by-retain';
    return { transactionId, sourceNodeId, retainedNodeId, preparedName };
  }

  async discardCandidate(candidate: P14CandidateHandle): Promise<void> {
    this.candidateRefs.push(candidate);
    candidate.candidateNodeId = 'poisoned-by-unexpected-discard';
    throw new Error('discard should not run in successful isolation test');
  }
}

class ThrowingMutatingDiscardAdapter implements P14RetainedDuplicateAdapter {
  discardReceivedId = '';

  async fingerprintSource(): Promise<string> {
    return SOURCE_FP;
  }

  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    return { sourceNodeId, candidateNodeId: CANDIDATE_ID };
  }

  async applyRecipe(
    candidate: P14CandidateHandle,
    action: P14PreparationAction,
  ): Promise<P14RecipeExecutionResult> {
    candidate.candidateNodeId = 'poisoned-before-throw';
    action.actionId = 'poisoned-action-before-throw';
    throw new Error('synthetic transform failure');
  }

  async validateCandidate(): Promise<P14ValidationSummary> {
    throw new Error('validate should not run');
  }

  async rescoreCandidate(): Promise<P14RescoreSummary> {
    throw new Error('rescore should not run');
  }

  async retainCandidate(): Promise<never> {
    throw new Error('retain should not run');
  }

  async discardCandidate(candidate: P14CandidateHandle): Promise<void> {
    this.discardReceivedId = candidate.candidateNodeId;
    candidate.candidateNodeId = 'poisoned-by-discard';
    throw new Error('synthetic discard failure');
  }
}

describe('P14 adapter callback input isolation', () => {
  it('keeps internal candidate/action/plan state stable when successful adapter callbacks mutate their arguments', async () => {
    const plan = twoActionPlan();
    const originalActionIds = plan.actions.map((action) => action.actionId);
    const adapter = new MutatingAdapter();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan,
      registry: registry(),
      confirmation: buildP14PreparationConfirmation(plan, NOW),
      transactionId: 'tx:adapter-input-isolation-success',
      now: () => NOW,
    }, adapter);

    expect(receipt.status).toBe('PREPARED');
    expect(receipt.source.nodeId).toBe(SOURCE_ID);
    expect(receipt.source.beforeFingerprint).toBe(SOURCE_FP);
    expect(receipt.source.afterFingerprint).toBe(SOURCE_FP);
    expect(receipt.candidate).toEqual({ nodeId: CANDIDATE_ID, retained: true });
    expect(receipt.p13RunId).toBe('p13-adapter-input-isolation');
    expect(receipt.planDigest).toBe(plan.planDigest);
    expect(receipt.retention).toMatchObject({
      sourceNodeId: SOURCE_ID,
      retainedNodeId: CANDIDATE_ID,
    });
    expect(receipt.appliedActions.map((result) => result.actionId)).toEqual(originalActionIds);

    expect(adapter.observed).toContain(`eligibility:${CANDIDATE_ID}:${originalActionIds[1]}:${recipeB.id}`);
    expect(adapter.observed).toContain(`validate:${CANDIDATE_ID}:${SOURCE_ID}:${originalActionIds[0]}`);
    expect(adapter.observed).toContain(`rescore:${CANDIDATE_ID}:${SOURCE_ID}:${originalActionIds[0]}`);
    expect(adapter.observed).toContain(`retain:${SOURCE_ID}:${CANDIDATE_ID}`);
    expect(adapter.observed.filter((value) => value.startsWith('fingerprint:'))).toEqual([
      `fingerprint:${SOURCE_ID}`,
      `fingerprint:${SOURCE_ID}`,
      `fingerprint:${SOURCE_ID}`,
    ]);

    expect(new Set(adapter.candidateRefs).size).toBe(adapter.candidateRefs.length);
    expect(new Set(adapter.actionRefs).size).toBe(adapter.actionRefs.length);
    expect(new Set(adapter.planRefs).size).toBe(adapter.planRefs.length);
  });

  it('keeps cleanup receipt candidate identity stable when transform and discard callbacks mutate their copies', async () => {
    const plan = oneActionPlan();
    const adapter = new ThrowingMutatingDiscardAdapter();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan,
      registry: createP14SafeRecipeRegistry([
        { sourceRuleId: RULE_A, sourceRuleVersion: 1, recipe: recipeA },
      ]),
      confirmation: buildP14PreparationConfirmation(plan, NOW),
      transactionId: 'tx:adapter-input-isolation-cleanup',
      now: () => NOW,
    }, adapter);

    expect(receipt.status).toBe('CLEANUP_REQUIRED');
    expect(receipt.terminalState).toBe('CLEANUP_REQUIRED');
    expect(receipt.candidate).toEqual({ nodeId: CANDIDATE_ID, retained: false });
    expect(receipt.source.nodeId).toBe(SOURCE_ID);
    expect(adapter.discardReceivedId).toBe(CANDIDATE_ID);
    expect(receipt.errors.map((error) => error.code)).toEqual([
      'P14_TRANSFORM_FAILED',
      'P14_DISCARD_FAILED',
    ]);
    expect(receipt.errors[1]?.recovery).toContain(CANDIDATE_ID);
    expect(receipt.errors[1]?.recovery).not.toContain('poisoned-by-discard');
  });
});
