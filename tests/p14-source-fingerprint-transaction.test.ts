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

const SOURCE_ID = 'fingerprint:source';
const SOURCE_FP = 'source-fingerprint-v1';
const RULE_ID = 'SYNTHETIC_FINGERPRINT_RULE';
const PROFILE_ID = 'P14_SYNTHETIC_FINGERPRINT_VALIDATE';
const NOW = '2026-09-12T00:00:00.000Z';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_FINGERPRINT_RECIPE',
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

function readyPlan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-fingerprint-run',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'fingerprint-finding',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['fingerprint:target'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

function noOpPlan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-fingerprint-noop-run',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'fingerprint-noop',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['fingerprint:target'],
      confidence: 100,
      remediationClass: 'P14_SAFE_NOOP',
    }],
    recipes: [recipe],
  });
}

class Adapter implements P14RetainedDuplicateAdapter {
  calls = { fingerprint: 0, clone: 0, apply: 0, validate: 0, rescore: 0, retain: 0, discard: 0 };
  fingerprints: unknown[] = [SOURCE_FP, SOURCE_FP, SOURCE_FP];

  async fingerprintSource(): Promise<string> {
    this.calls.fingerprint += 1;
    return (this.fingerprints.shift() ?? SOURCE_FP) as string;
  }

  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    this.calls.clone += 1;
    return { sourceNodeId, candidateNodeId: 'fingerprint:candidate' };
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
    return {
      runId: 'p13-fingerprint-candidate-run',
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

async function runReady(adapter: Adapter) {
  const plan = readyPlan();
  return runP14RetainedDuplicateTransaction({
    plan,
    registry,
    confirmation: buildP14PreparationConfirmation(plan, NOW),
    transactionId: 'p14-fingerprint-tx',
    preparedName: 'Prepared',
    now: () => NOW,
  }, adapter);
}

async function runNoOp(adapter: Adapter) {
  return runP14RetainedDuplicateTransaction({
    plan: noOpPlan(),
    registry,
    transactionId: 'p14-fingerprint-noop-tx',
    now: () => NOW,
  }, adapter);
}

describe('P14 runtime source fingerprint evidence boundary', () => {
  it.each([null, '', '   '])('blocks malformed initial fingerprint %# before clone/mutation', async (value) => {
    const adapter = new Adapter();
    adapter.fingerprints = [value];
    const receipt = await runReady(adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.source.beforeFingerprint).toBe('UNKNOWN');
    expect(receipt.source.afterFingerprint).toBe('UNKNOWN');
    expect(adapter.calls.clone).toBe(0);
    expect(adapter.calls.apply).toBe(0);
    expect(adapter.calls.retain).toBe(0);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('uses a valid bounded changed fingerprint as stale-source evidence', async () => {
    const adapter = new Adapter();
    adapter.fingerprints = ['source-fingerprint-v2'];
    const receipt = await runReady(adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.terminalState).toBe('SOURCE_STALE');
    expect(receipt.source.beforeFingerprint).toBe('source-fingerprint-v2');
    expect(receipt.source.afterFingerprint).toBe('source-fingerprint-v2');
    expect(adapter.calls.clone).toBe(0);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('does not report NO_CHANGES_NEEDED when the no-op recheck fingerprint is malformed', async () => {
    const adapter = new Adapter();
    adapter.fingerprints = [SOURCE_FP, null];
    const receipt = await runNoOp(adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.source.beforeFingerprint).toBe(SOURCE_FP);
    expect(receipt.source.afterFingerprint).toBe('UNKNOWN');
    expect(adapter.calls.clone).toBe(0);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('discards before retention when pre-retain fingerprint evidence is malformed', async () => {
    const adapter = new Adapter();
    adapter.fingerprints = [SOURCE_FP, null];
    const receipt = await runReady(adapter);

    expect(receipt.status).toBe('REJECTED');
    expect(receipt.terminalState).toBe('SOURCE_STALE');
    expect(receipt.errors[0]?.code).toBe('P14_SOURCE_CHANGED_DURING_RUN');
    expect(receipt.source.afterFingerprint).toBe('UNKNOWN');
    expect(adapter.calls.discard).toBe(1);
    expect(adapter.calls.retain).toBe(0);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('cannot report PREPARED when post-retain fingerprint evidence is malformed', async () => {
    const adapter = new Adapter();
    adapter.fingerprints = [SOURCE_FP, SOURCE_FP, null];
    const receipt = await runReady(adapter);

    expect(receipt.status).toBe('REJECTED');
    expect(receipt.terminalState).toBe('SOURCE_STALE');
    expect(receipt.errors[0]?.code).toBe('P14_SOURCE_CHANGED_DURING_RUN');
    expect(receipt.source.afterFingerprint).toBe('UNKNOWN');
    expect(adapter.calls.retain).toBe(1);
    expect(adapter.calls.discard).toBe(1);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });
});
