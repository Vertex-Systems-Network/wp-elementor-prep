import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';
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

const SOURCE_ID = 'validation-evidence:source';
const SOURCE_FP = 'validation-evidence-source-fingerprint';
const NOW = '2026-09-12T00:00:00.000Z';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_VALIDATION_EVIDENCE_RECIPE',
  version: 1,
  sourceRuleIds: ['VALIDATION_EVIDENCE_RULE'],
  minConfidence: 95,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'VALIDATION_EVIDENCE_PROFILE',
  conflictsWith: [],
  orderClass: '10-structure',
};
const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: 'VALIDATION_EVIDENCE_RULE', sourceRuleVersion: 1, recipe },
]);

function plan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-validation-evidence',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'validation-evidence-finding',
      sourceRuleId: 'VALIDATION_EVIDENCE_RULE',
      sourceRuleVersion: 1,
      targetNodeIds: ['validation-evidence:target'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE' as const,
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

class Adapter implements P14RetainedDuplicateAdapter {
  calls = { validate: 0, rescore: 0, retain: 0, discard: 0 };

  async fingerprintSource(): Promise<string> { return SOURCE_FP; }
  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    return { sourceNodeId, candidateNodeId: 'validation-evidence:candidate' };
  }
  async applyRecipe(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    return { actionId: action.actionId, recipeId: action.recipeId ?? 'missing', applied: true };
  }
  async validateCandidate(): Promise<P14ValidationSummary> {
    this.calls.validate += 1;
    return {
      passed: true,
      profileIdsRun: ['VALIDATION_EVIDENCE_PROFILE'],
      checks: [{ id: 'required', passed: true, required: true }],
    };
  }
  async rescoreCandidate(): Promise<P14RescoreSummary> {
    this.calls.rescore += 1;
    return {
      runId: 'p13-validation-rescore', score: 95, status: 'READY', blockerCount: 0,
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
    transactionId: 'p14-validation-evidence-tx',
    preparedName: 'Prepared Duplicate',
    now: () => NOW,
  }, adapter);
}

describe('P14 validation evidence transaction boundary', () => {
  it('keeps valid bounded validation evidence behavior unchanged', async () => {
    const adapter = new Adapter();
    const receipt = await run(adapter);
    expect(receipt.status).toBe('PREPARED');
    expect(adapter.calls.rescore).toBe(1);
    expect(adapter.calls.retain).toBe(1);
    expect(adapter.calls.discard).toBe(0);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('rejects oversized validation check evidence before rescore/retention and discards candidate', async () => {
    const adapter = new Adapter();
    const checks = new Array(DEFAULT_P14_INPUT_BOUNDS.maxActions + 1).fill(null);
    (adapter as unknown as { validateCandidate: () => Promise<unknown> }).validateCandidate = async () => {
      adapter.calls.validate += 1;
      return {
        passed: true,
        profileIdsRun: ['VALIDATION_EVIDENCE_PROFILE'],
        checks,
      };
    };

    const receipt = await run(adapter);
    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_VALIDATION_FAILED');
    expect(adapter.calls.discard).toBe(1);
    expect(adapter.calls.rescore).toBe(0);
    expect(adapter.calls.retain).toBe(0);
    expect(receipt.validation).toBeUndefined();
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('rejects oversized check detail without echoing raw hostile evidence', async () => {
    const adapter = new Adapter();
    const hostile = 'z'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1);
    (adapter as unknown as { validateCandidate: () => Promise<unknown> }).validateCandidate = async () => {
      adapter.calls.validate += 1;
      return {
        passed: true,
        profileIdsRun: ['VALIDATION_EVIDENCE_PROFILE'],
        checks: [{ id: 'required', passed: true, required: true, detail: hostile }],
      };
    };

    const receipt = await run(adapter);
    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_VALIDATION_FAILED');
    expect(adapter.calls.discard).toBe(1);
    expect(adapter.calls.rescore).toBe(0);
    expect(adapter.calls.retain).toBe(0);
    expect(JSON.stringify(receipt)).not.toContain(hostile);
    expect(JSON.stringify(receipt).length).toBeLessThan(20000);
  });
});
