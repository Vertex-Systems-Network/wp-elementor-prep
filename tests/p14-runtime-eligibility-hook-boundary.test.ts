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
  P14RescoreSummary,
  P14RetainedDuplicateAdapter,
  P14ValidationSummary,
} from '../src/core/p14-preparation-types';

const SOURCE_ID = 'hook-source:1';
const SOURCE_FP = 'hook-source-fingerprint-v1';

const firstRecipe: P14PreparationRecipeDefinition = {
  id: 'P14_HOOK_FIRST_STRUCTURE',
  version: 1,
  sourceRuleIds: ['HOOK_RULE_FIRST'],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'HOOK_PROFILE_FIRST',
  conflictsWith: [],
  orderClass: '10-structure',
};

const secondRecipe: P14PreparationRecipeDefinition = {
  id: 'P14_HOOK_SECOND_SIZING',
  version: 1,
  sourceRuleIds: ['HOOK_RULE_SECOND'],
  minConfidence: 90,
  prerequisites: [firstRecipe.id],
  mutationAllowlist: ['layoutSizing'],
  validationProfileId: 'HOOK_PROFILE_SECOND',
  conflictsWith: [],
  orderClass: '20-sizing',
};

const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: 'HOOK_RULE_FIRST', sourceRuleVersion: 1, recipe: firstRecipe },
  { sourceRuleId: 'HOOK_RULE_SECOND', sourceRuleVersion: 1, recipe: secondRecipe },
]);

function plan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-runtime-hook-boundary',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [
      {
        findingId: 'hook-finding-first',
        sourceRuleId: 'HOOK_RULE_FIRST',
        sourceRuleVersion: 1,
        targetNodeIds: ['hook-node:first'],
        confidence: 99,
        remediationClass: 'P14_SAFE_CANDIDATE' as const,
        acceptedRecipeId: firstRecipe.id,
        acceptedRecipeVersion: 1,
      },
      {
        findingId: 'hook-finding-second',
        sourceRuleId: 'HOOK_RULE_SECOND',
        sourceRuleVersion: 1,
        targetNodeIds: ['hook-node:second'],
        confidence: 99,
        remediationClass: 'P14_SAFE_CANDIDATE' as const,
        acceptedRecipeId: secondRecipe.id,
        acceptedRecipeVersion: 1,
      },
    ],
    recipes: [secondRecipe, firstRecipe],
  });
}

class HookBoundaryAdapter implements P14RetainedDuplicateAdapter {
  applyCalls: string[] = [];
  eligibilityCalls: string[] = [];
  discarded = 0;
  retained = 0;
  discardFails = false;

  async fingerprintSource(): Promise<string> {
    return SOURCE_FP;
  }

  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    return { sourceNodeId, candidateNodeId: 'hook-candidate:1' };
  }

  async assessActionEligibility(
    _candidate: P14CandidateHandle,
    action: P14PreparationAction,
  ): Promise<unknown> {
    this.eligibilityCalls.push(action.actionId);
    return {
      actionId: action.actionId,
      recipeId: action.recipeId,
      checkedPrerequisiteRecipeIds: [...action.prerequisiteRecipeIds],
      eligible: true,
    };
  }

  async applyRecipe(
    _candidate: P14CandidateHandle,
    action: P14PreparationAction,
  ): Promise<P14RecipeExecutionResult> {
    this.applyCalls.push(action.actionId);
    return {
      actionId: action.actionId,
      recipeId: action.recipeId ?? 'missing',
      applied: true,
    };
  }

  async validateCandidate(): Promise<P14ValidationSummary> {
    return {
      passed: true,
      profileIdsRun: ['HOOK_PROFILE_FIRST', 'HOOK_PROFILE_SECOND'],
      checks: [{ id: 'hook-structure', passed: true, required: true }],
    };
  }

  async rescoreCandidate(): Promise<P14RescoreSummary> {
    return {
      runId: 'p13-hook-candidate',
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
    if (this.discardFails) throw new Error('forced hook-boundary discard failure');
  }
}

const now = () => '2026-09-12T00:00:00.000Z';

function run(adapter: P14RetainedDuplicateAdapter) {
  const currentPlan = plan();
  return runP14RetainedDuplicateTransaction({
    plan: currentPlan,
    registry,
    confirmation: buildP14PreparationConfirmation(currentPlan, now()),
    transactionId: 'p14-runtime-hook-boundary-tx',
    now,
  }, adapter);
}

function installThrowingEligibilityGetter(adapter: HookBoundaryAdapter): void {
  Object.defineProperty(adapter, 'assessActionEligibility', {
    configurable: true,
    get() {
      throw new Error('runtime eligibility hook getter exploded');
    },
  });
}

describe('P14 runtime eligibility adapter hook boundary', () => {
  it('turns a throwing eligibility-hook getter into structured transform cleanup', async () => {
    const adapter = new HookBoundaryAdapter();
    installThrowingEligibilityGetter(adapter);

    const result = await run(adapter);

    expect(result.status).toBe('REJECTED');
    expect(result.terminalState).toBe('REJECTED');
    expect(result.errors[0]?.code).toBe('P14_TRANSFORM_FAILED');
    expect(result.errors[0]?.stage).toBe('transform-recheck');
    expect(result.errors[0]?.detail).toContain('Unable to read runtime action eligibility adapter hook');
    expect(result.errors[0]?.detail).toContain('runtime eligibility hook getter exploded');
    expect(result.appliedActions).toHaveLength(1);
    expect(adapter.applyCalls).toHaveLength(1);
    expect(adapter.discarded).toBe(1);
    expect(adapter.retained).toBe(0);
  });

  it('preserves cleanup-required evidence if the hook getter and candidate discard both fail', async () => {
    const adapter = new HookBoundaryAdapter();
    adapter.discardFails = true;
    installThrowingEligibilityGetter(adapter);

    const result = await run(adapter);

    expect(result.status).toBe('CLEANUP_REQUIRED');
    expect(result.terminalState).toBe('CLEANUP_REQUIRED');
    expect(result.errors.map((error) => error.code)).toEqual([
      'P14_TRANSFORM_FAILED',
      'P14_DISCARD_FAILED',
    ]);
    expect(result.appliedActions).toHaveLength(1);
    expect(result.candidate).toEqual({ nodeId: 'hook-candidate:1', retained: false });
    expect(adapter.applyCalls).toHaveLength(1);
    expect(adapter.discarded).toBe(1);
    expect(adapter.retained).toBe(0);
  });

  it('preserves the existing readable non-function hook failure path', async () => {
    const adapter = new HookBoundaryAdapter();
    Object.defineProperty(adapter, 'assessActionEligibility', {
      configurable: true,
      value: 'not-callable',
    });

    const result = await run(adapter);

    expect(result.status).toBe('REJECTED');
    expect(result.errors[0]?.code).toBe('P14_TRANSFORM_FAILED');
    expect(result.errors[0]?.stage).toBe('transform-recheck');
    expect(result.errors[0]?.detail).toContain('Adapter cannot re-evaluate runtime eligibility');
    expect(adapter.applyCalls).toHaveLength(1);
    expect(adapter.discarded).toBe(1);
    expect(adapter.retained).toBe(0);
  });

  it('preserves valid hook execution with the original adapter as this', async () => {
    const adapter = new HookBoundaryAdapter();

    const result = await run(adapter);

    expect(result.status).toBe('PREPARED');
    expect(adapter.applyCalls).toHaveLength(2);
    expect(adapter.eligibilityCalls).toHaveLength(1);
    expect(adapter.discarded).toBe(0);
    expect(adapter.retained).toBe(1);
  });
});
