import { describe, expect, it } from 'vitest';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';
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

const SOURCE_ID = 'rescore:source';
const SOURCE_FP = 'rescore-source-fingerprint';
const RULE_ID = 'SYNTHETIC_RESCORE_RULE';
const PROFILE_ID = 'P14_SYNTHETIC_RESCORE_VALIDATE';
const NOW = '2026-09-12T00:00:00.000Z';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_RESCORE_RECIPE',
  version: 1,
  sourceRuleIds: [RULE_ID],
  minConfidence: 95,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: PROFILE_ID,
  conflictsWith: [],
  orderClass: '10-structure',
};

const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: RULE_ID, sourceRuleVersion: 1, recipe },
]);

function plan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-rescore-source-run',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'rescore-finding',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['rescore:target'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

class Adapter implements P14RetainedDuplicateAdapter {
  calls = { fingerprint: 0, clone: 0, apply: 0, validate: 0, rescore: 0, retain: 0, discard: 0 };
  rescore: unknown = {
    runId: 'p13-rescore-candidate-run',
    score: 94,
    status: 'READY',
    blockerCount: 0,
    highRiskCount: 0,
    introducedBlockerOrHighCount: 0,
    reviewRequired: false,
  } satisfies P14RescoreSummary;

  async fingerprintSource(): Promise<string> {
    this.calls.fingerprint += 1;
    return SOURCE_FP;
  }

  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    this.calls.clone += 1;
    return { sourceNodeId, candidateNodeId: 'rescore:candidate' };
  }

  async applyRecipe(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    this.calls.apply += 1;
    return { actionId: action.actionId, recipeId: action.recipeId ?? 'missing', applied: true };
  }

  async validateCandidate(): Promise<P14ValidationSummary> {
    this.calls.validate += 1;
    return {
      passed: true,
      profileIdsRun: [PROFILE_ID],
      checks: [{ id: 'required', passed: true, required: true }],
    };
  }

  async rescoreCandidate(): Promise<P14RescoreSummary> {
    this.calls.rescore += 1;
    return this.rescore as P14RescoreSummary;
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

async function run(adapter: Adapter) {
  const preparedPlan = plan();
  return runP14RetainedDuplicateTransaction({
    plan: preparedPlan,
    registry,
    confirmation: buildP14PreparationConfirmation(preparedPlan, NOW),
    transactionId: 'p14-rescore-tx',
    preparedName: 'Prepared',
    now: () => NOW,
  }, adapter);
}

describe('P14 candidate re-score runtime boundary', () => {
  it.each([
    ['null evidence', null],
    ['NaN score', { runId: 'run', score: Number.NaN, status: 'READY', blockerCount: 0, highRiskCount: 0, introducedBlockerOrHighCount: 0, reviewRequired: false }],
    ['negative count', { runId: 'run', score: 90, status: 'READY', blockerCount: -1, highRiskCount: 0, introducedBlockerOrHighCount: 0, reviewRequired: false }],
    ['insufficient numeric evidence', { runId: 'run', score: 90, status: 'INSUFFICIENT_EVIDENCE', blockerCount: 0, highRiskCount: 0, introducedBlockerOrHighCount: 0, reviewRequired: false }],
  ])('discards the candidate on malformed %s before retention', async (_label, evidence) => {
    const adapter = new Adapter();
    adapter.rescore = evidence;
    const receipt = await run(adapter);

    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_RESCORE_FAILED');
    expect(adapter.calls.discard).toBe(1);
    expect(adapter.calls.retain).toBe(0);
    expect(receipt.rescore).toBeUndefined();
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('keeps valid introduced HIGH/BLOCKER evidence as a separate validation-policy failure', async () => {
    const adapter = new Adapter();
    adapter.rescore = {
      runId: 'p13-rescore-candidate-run',
      score: 96,
      status: 'READY',
      blockerCount: 0,
      highRiskCount: 0,
      introducedBlockerOrHighCount: 1,
      reviewRequired: false,
    } satisfies P14RescoreSummary;

    const receipt = await run(adapter);
    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_VALIDATION_FAILED');
    expect(receipt.rescore?.introducedBlockerOrHighCount).toBe(1);
    expect(adapter.calls.discard).toBe(1);
    expect(adapter.calls.retain).toBe(0);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });
});
