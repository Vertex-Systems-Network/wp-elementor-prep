import { describe, expect, it } from 'vitest';
import { authorizeP14PreparationPlan } from '../src/core/p14-plan-authorization';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';
import type {
  P14CandidateHandle,
  P14PreparationAction,
  P14PreparationRecipeDefinition,
  P14RecipeExecutionResult,
  P14RescoreSummary,
  P14RetainedDuplicateAdapter,
  P14ValidationSummary,
} from '../src/core/p14-preparation-types';

const SOURCE_ID = 'auth:source';
const SOURCE_FP = 'auth-source-fingerprint';
const RULE_ID = 'SYNTHETIC_AUTH_RULE';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_AUTH_RECIPE',
  version: 1,
  sourceRuleIds: [RULE_ID],
  minConfidence: 95,
  prerequisites: [],
  mutationAllowlist: ['layoutMode', 'padding'],
  validationProfileId: 'P14_SYNTHETIC_AUTH_VALIDATE',
  conflictsWith: [],
  orderClass: '10-structure',
};

const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: RULE_ID, sourceRuleVersion: 1, recipe },
]);

function readyPlan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-auth-test-run',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'auth-finding',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['auth:target'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

class CountingAdapter implements P14RetainedDuplicateAdapter {
  calls = { fingerprint: 0, clone: 0, apply: 0, validate: 0, rescore: 0, retain: 0, discard: 0 };

  async fingerprintSource(): Promise<string> {
    this.calls.fingerprint += 1;
    return SOURCE_FP;
  }
  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    this.calls.clone += 1;
    return { sourceNodeId, candidateNodeId: 'auth:candidate' };
  }
  async applyRecipe(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    this.calls.apply += 1;
    return { actionId: action.actionId, recipeId: action.recipeId ?? 'missing', applied: true };
  }
  async validateCandidate(): Promise<P14ValidationSummary> {
    this.calls.validate += 1;
    return { passed: true, checks: [{ id: 'required', passed: true, required: true }] };
  }
  async rescoreCandidate(): Promise<P14RescoreSummary> {
    this.calls.rescore += 1;
    return {
      runId: 'p13-auth-rescore', score: 95, status: 'READY', blockerCount: 0,
      highRiskCount: 0, introducedBlockerOrHighCount: 0, reviewRequired: false,
    };
  }
  async retainCandidate(candidate: P14CandidateHandle, transactionId: string, preparedName: string) {
    this.calls.retain += 1;
    return { transactionId, sourceNodeId: candidate.sourceNodeId, retainedNodeId: candidate.candidateNodeId, preparedName };
  }
  async discardCandidate(): Promise<void> {
    this.calls.discard += 1;
  }
}

describe('P14 execution-boundary safe-recipe authorization', () => {
  it('authorizes an exact synthetic registry contract', () => {
    const plan = readyPlan();
    const result = authorizeP14PreparationPlan(plan, registry);
    expect(result).toEqual({
      authorized: true,
      failures: [],
      authorizedActionIds: plan.eligibleActionIds,
    });
  });

  it('rejects plan/registry contract drift independently of plan integrity', () => {
    const plan = readyPlan();
    const action = plan.actions.find((item) => item.decision === 'ELIGIBLE');
    if (!action) throw new Error('expected eligible action');
    action.validationProfileId = 'FORGED_PROFILE';
    action.mutationAllowlist = ['layoutMode'];

    const result = authorizeP14PreparationPlan(plan, registry);
    expect(result.authorized).toBe(false);
    expect(result.failures.some((failure) => failure.includes('validation profile'))).toBe(true);
    expect(result.failures.some((failure) => failure.includes('mutation allowlist'))).toBe(true);
  });

  it('blocks a self-consistent READY plan under the default empty production registry before adapter access', async () => {
    const adapter = new CountingAdapter();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan: readyPlan(),
      transactionId: 'p14-auth-default-block',
      now: () => '2026-09-12T00:00:00.000Z',
    }, adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.terminalState).toBe('BLOCKED');
    expect(receipt.errors[0]?.code).toBe('P14_RECIPE_UNAUTHORIZED');
    expect(receipt.source.beforeFingerprint).toBe('UNKNOWN');
    expect(receipt.source.afterFingerprint).toBe('UNKNOWN');
    expect(Object.values(adapter.calls).every((count) => count === 0)).toBe(true);
  });
});
