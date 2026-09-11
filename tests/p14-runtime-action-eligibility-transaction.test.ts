import { describe, expect, it } from 'vitest';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import type {
  P14CandidateHandle,
  P14PreparationAction,
  P14PreparationRecipeDefinition,
  P14RecipeExecutionResult,
  P14RetainedDuplicateAdapter,
  P14ValidationSummary,
  P14RescoreSummary,
} from '../src/core/p14-preparation-types';

const SOURCE_ID = 'source:1';
const SOURCE_FP = 'source-fingerprint-v1';

const firstRecipe: P14PreparationRecipeDefinition = {
  id: 'P14_FIRST_STRUCTURE',
  version: 1,
  sourceRuleIds: ['RULE_FIRST'],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'PROFILE_FIRST',
  conflictsWith: [],
  orderClass: '10-structure',
};

const secondRecipe: P14PreparationRecipeDefinition = {
  id: 'P14_SECOND_SIZING',
  version: 1,
  sourceRuleIds: ['RULE_SECOND'],
  minConfidence: 90,
  prerequisites: [firstRecipe.id],
  mutationAllowlist: ['layoutSizing'],
  validationProfileId: 'PROFILE_SECOND',
  conflictsWith: [],
  orderClass: '20-sizing',
};

const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: 'RULE_FIRST', sourceRuleVersion: 1, recipe: firstRecipe },
  { sourceRuleId: 'RULE_SECOND', sourceRuleVersion: 1, recipe: secondRecipe },
]);

function plan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-runtime-recheck',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [
      {
        findingId: 'finding-first',
        sourceRuleId: 'RULE_FIRST',
        sourceRuleVersion: 1,
        targetNodeIds: ['node:first'],
        confidence: 99,
        remediationClass: 'P14_SAFE_CANDIDATE' as const,
        acceptedRecipeId: firstRecipe.id,
        acceptedRecipeVersion: 1,
      },
      {
        findingId: 'finding-second',
        sourceRuleId: 'RULE_SECOND',
        sourceRuleVersion: 1,
        targetNodeIds: ['node:second'],
        confidence: 99,
        remediationClass: 'P14_SAFE_CANDIDATE' as const,
        acceptedRecipeId: secondRecipe.id,
        acceptedRecipeVersion: 1,
      },
    ],
    recipes: [secondRecipe, firstRecipe],
  });
}

class RuntimeEligibilityAdapter implements P14RetainedDuplicateAdapter {
  applyCalls: string[] = [];
  eligibilityCalls: string[] = [];
  discarded = 0;
  retained = 0;
  assessment: unknown | undefined;

  async fingerprintSource(): Promise<string> {
    return SOURCE_FP;
  }

  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    return { sourceNodeId, candidateNodeId: 'candidate:1' };
  }

  async assessActionEligibility(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<unknown> {
    this.eligibilityCalls.push(action.actionId);
    if (this.assessment !== undefined) return this.assessment;
    return {
      actionId: action.actionId,
      recipeId: action.recipeId,
      checkedPrerequisiteRecipeIds: [...action.prerequisiteRecipeIds],
      eligible: true,
    };
  }

  async applyRecipe(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    this.applyCalls.push(action.actionId);
    return { actionId: action.actionId, recipeId: action.recipeId ?? 'missing', applied: true };
  }

  async validateCandidate(): Promise<P14ValidationSummary> {
    return {
      passed: true,
      profileIdsRun: ['PROFILE_FIRST', 'PROFILE_SECOND'],
      checks: [{ id: 'structure', passed: true, required: true }],
    };
  }

  async rescoreCandidate(): Promise<P14RescoreSummary> {
    return {
      runId: 'p13-candidate',
      score: 92,
      status: 'REVIEW',
      blockerCount: 0,
      highRiskCount: 0,
      introducedBlockerOrHighCount: 0,
      reviewRequired: false,
    };
  }

  async retainCandidate(candidate: P14CandidateHandle, transactionId: string, preparedName: string) {
    this.retained += 1;
    return {
      transactionId,
      sourceNodeId: candidate.sourceNodeId,
      retainedNodeId: candidate.candidateNodeId,
      preparedName,
    };
  }

  async discardCandidate(): Promise<void> {
    this.discarded += 1;
  }
}

const now = () => '2026-09-12T00:00:00.000Z';

function run(adapter: RuntimeEligibilityAdapter) {
  const currentPlan = plan();
  return runP14RetainedDuplicateTransaction({
    plan: currentPlan,
    registry,
    confirmation: buildP14PreparationConfirmation(currentPlan, now()),
    transactionId: 'p14-runtime-recheck-tx',
    now,
  }, adapter);
}

function secondAction() {
  const current = plan();
  const action = current.actions.find((item) => item.recipeId === secondRecipe.id);
  if (!action) throw new Error('second action missing');
  return action;
}

describe('P14 sequential runtime action eligibility gate', () => {
  it('rechecks the later action against the current candidate before applying it', async () => {
    const adapter = new RuntimeEligibilityAdapter();
    const current = plan();
    const second = current.actions.find((item) => item.recipeId === secondRecipe.id);
    const result = await run(adapter);

    expect(result.status).toBe('PREPARED');
    expect(adapter.applyCalls).toHaveLength(2);
    expect(adapter.eligibilityCalls).toEqual([second?.actionId]);
    expect(adapter.discarded).toBe(0);
    expect(adapter.retained).toBe(1);
  });

  it('rejects and replans when the later action is no longer eligible', async () => {
    const adapter = new RuntimeEligibilityAdapter();
    const second = secondAction();
    adapter.assessment = {
      actionId: second.actionId,
      recipeId: second.recipeId,
      checkedPrerequisiteRecipeIds: [...second.prerequisiteRecipeIds],
      eligible: false,
      detail: 'candidate structure changed after the first recipe',
    };

    const result = await run(adapter);

    expect(result.status).toBe('REJECTED');
    expect(result.errors[0]?.code).toBe('P14_RECIPE_PREREQUISITE_MISSING');
    expect(adapter.applyCalls).toHaveLength(1);
    expect(adapter.discarded).toBe(1);
    expect(adapter.retained).toBe(0);
  });

  it.each([
    null,
    {
      actionId: 'stale-action',
      recipeId: secondRecipe.id,
      checkedPrerequisiteRecipeIds: [firstRecipe.id],
      eligible: true,
    },
    {
      actionId: secondAction().actionId,
      recipeId: secondRecipe.id,
      checkedPrerequisiteRecipeIds: [],
      eligible: true,
    },
  ])('rejects malformed or mismatched reassessment evidence %#', async (assessment) => {
    const adapter = new RuntimeEligibilityAdapter();
    adapter.assessment = assessment;

    const result = await run(adapter);

    expect(result.status).toBe('REJECTED');
    expect(result.errors[0]?.code).toBe('P14_TRANSFORM_FAILED');
    expect(adapter.applyCalls).toHaveLength(1);
    expect(adapter.discarded).toBe(1);
    expect(adapter.retained).toBe(0);
  });

  it('fails closed if a multi-action adapter omits the runtime reassessment capability', async () => {
    const adapter = new RuntimeEligibilityAdapter();
    (adapter as unknown as { assessActionEligibility?: unknown }).assessActionEligibility = undefined;

    const result = await run(adapter);

    expect(result.status).toBe('REJECTED');
    expect(result.errors[0]?.code).toBe('P14_TRANSFORM_FAILED');
    expect(adapter.applyCalls).toHaveLength(1);
    expect(adapter.discarded).toBe(1);
    expect(adapter.retained).toBe(0);
  });
});
