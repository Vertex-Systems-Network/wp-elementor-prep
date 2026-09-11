import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
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

const SOURCE_ID = 'adapter:source';
const SOURCE_FP = 'adapter-source-fingerprint';
const NOW = '2026-09-12T00:00:00.000Z';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_ADAPTER_TEST_RECIPE',
  version: 1,
  sourceRuleIds: ['ADAPTER_TEST_RULE'],
  minConfidence: 95,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'ADAPTER_TEST_PROFILE',
  conflictsWith: [],
  orderClass: '10-structure',
};
const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: 'ADAPTER_TEST_RULE', sourceRuleVersion: 1, recipe },
]);

function plan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-adapter-evidence',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'adapter-finding',
      sourceRuleId: 'ADAPTER_TEST_RULE',
      sourceRuleVersion: 1,
      targetNodeIds: ['adapter:target'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE' as const,
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

class Adapter implements P14RetainedDuplicateAdapter {
  calls = { clone: 0, apply: 0, validate: 0, rescore: 0, retain: 0, discard: 0 };

  async fingerprintSource(): Promise<string> { return SOURCE_FP; }
  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    this.calls.clone += 1;
    return { sourceNodeId, candidateNodeId: 'adapter:candidate' };
  }
  async applyRecipe(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    this.calls.apply += 1;
    return { actionId: action.actionId, recipeId: action.recipeId ?? 'missing', applied: true };
  }
  async validateCandidate(): Promise<P14ValidationSummary> {
    this.calls.validate += 1;
    return {
      passed: true,
      profileIdsRun: ['ADAPTER_TEST_PROFILE'],
      checks: [{ id: 'required', passed: true, required: true }],
    };
  }
  async rescoreCandidate(): Promise<P14RescoreSummary> {
    this.calls.rescore += 1;
    return {
      runId: 'p13-adapter-rescore', score: 95, status: 'READY', blockerCount: 0,
      highRiskCount: 0, introducedBlockerOrHighCount: 0, reviewRequired: false,
    };
  }
  async retainCandidate(candidate: P14CandidateHandle, transactionId: string, preparedName: string) {
    this.calls.retain += 1;
    return { transactionId, sourceNodeId: candidate.sourceNodeId, retainedNodeId: candidate.candidateNodeId, preparedName };
  }
  async discardCandidate(): Promise<void> { this.calls.discard += 1; }
}

function run(adapter: Adapter) {
  const current = plan();
  return runP14RetainedDuplicateTransaction({
    plan: current,
    registry,
    confirmation: buildP14PreparationConfirmation(current, NOW),
    transactionId: 'p14-adapter-evidence-tx',
    preparedName: 'Prepared Duplicate',
    now: () => NOW,
  }, adapter);
}

describe('P14 adapter runtime evidence boundary', () => {
  it('retains a candidate with exact bounded adapter evidence', async () => {
    const adapter = new Adapter();
    const receipt = await run(adapter);
    expect(receipt.status).toBe('PREPARED');
    expect(adapter.calls.apply).toBe(1);
    expect(adapter.calls.retain).toBe(1);
    expect(adapter.calls.discard).toBe(0);
  });

  it.each([
    null,
    { sourceNodeId: SOURCE_ID, candidateNodeId: '' },
    { sourceNodeId: SOURCE_ID, candidateNodeId: 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1) },
    { sourceNodeId: 'other-source', candidateNodeId: 'adapter:candidate' },
  ])('rejects malformed clone evidence before recipe mutation %#', async (cloneEvidence) => {
    const adapter = new Adapter();
    (adapter as unknown as { cloneSource: () => Promise<unknown> }).cloneSource = async () => {
      adapter.calls.clone += 1;
      return cloneEvidence;
    };
    const receipt = await run(adapter);
    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_CLONE_FAILED');
    expect(adapter.calls.apply).toBe(0);
    expect(adapter.calls.retain).toBe(0);
    expect(adapter.calls.discard).toBe(0);
    expect(receipt.candidate).toBeUndefined();
  });

  it.each([
    null,
    { actionId: 'stale-action', recipeId: recipe.id, applied: true },
    { actionId: 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1), recipeId: recipe.id, applied: true },
    { actionId: 'placeholder', recipeId: recipe.id, applied: true, detail: 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1) },
  ])('rejects malformed recipe-result evidence and discards the candidate %#', async (executionEvidence) => {
    const adapter = new Adapter();
    (adapter as unknown as { applyRecipe: (candidate: P14CandidateHandle, action: P14PreparationAction) => Promise<unknown> }).applyRecipe = async (_candidate, action) => {
      adapter.calls.apply += 1;
      if (executionEvidence && typeof executionEvidence === 'object' && !Array.isArray(executionEvidence)
        && (executionEvidence as Record<string, unknown>).actionId === 'placeholder') {
        return { ...(executionEvidence as Record<string, unknown>), actionId: action.actionId };
      }
      return executionEvidence;
    };
    const receipt = await run(adapter);
    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_TRANSFORM_FAILED');
    expect(adapter.calls.discard).toBe(1);
    expect(adapter.calls.validate).toBe(0);
    expect(adapter.calls.retain).toBe(0);
    expect(receipt.appliedActions).toEqual([]);
    expect(JSON.stringify(receipt).length).toBeLessThan(20000);
  });

  it.each([
    null,
    { transactionId: 'wrong', sourceNodeId: SOURCE_ID, retainedNodeId: 'adapter:candidate', preparedName: 'Prepared Duplicate' },
    { transactionId: 'p14-adapter-evidence-tx', sourceNodeId: SOURCE_ID, retainedNodeId: 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1), preparedName: 'Prepared Duplicate' },
    { transactionId: 'p14-adapter-evidence-tx', sourceNodeId: SOURCE_ID, retainedNodeId: 'adapter:candidate', preparedName: 'Other Name' },
  ])('rejects malformed retention evidence and cannot report PREPARED %#', async (retentionEvidence) => {
    const adapter = new Adapter();
    (adapter as unknown as { retainCandidate: () => Promise<unknown> }).retainCandidate = async () => {
      adapter.calls.retain += 1;
      return retentionEvidence;
    };
    const receipt = await run(adapter);
    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_FINALIZE_FAILED');
    expect(adapter.calls.discard).toBe(1);
    expect(receipt.retention).toBeUndefined();
    expect(receipt.candidate?.retained).not.toBe(true);
    expect(JSON.stringify(receipt).length).toBeLessThan(20000);
  });
});
