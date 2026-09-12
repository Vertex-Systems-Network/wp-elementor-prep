import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import { assessP14RunControlEvidence } from '../src/core/p14-run-control-evidence';
import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';
import { P14SourceTransactionCoordinator } from '../src/core/p14-transaction-coordinator';
import type {
  P14CandidateHandle,
  P14PreparationAction,
  P14PreparationRecipeDefinition,
  P14RecipeExecutionResult,
  P14RescoreSummary,
  P14RetainedDuplicateAdapter,
  P14ValidationSummary,
} from '../src/core/p14-preparation-types';

const SOURCE_ID = 'run-control:source';
const SOURCE_FP = 'run-control-source-fingerprint';
const RULE_ID = 'SYNTHETIC_RUN_CONTROL_RULE';
const PROFILE_ID = 'P14_SYNTHETIC_RUN_CONTROL_VALIDATE';
const NOW = '2026-09-12T00:00:00.000Z';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_RUN_CONTROL_RECIPE',
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
    p13RunId: 'p13-run-control-test',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'run-control-finding',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['run-control:target'],
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
  reviewRequired = false;
  cloneTransactionId: string | null = null;
  retainedTransactionId: string | null = null;
  retainedPreparedName: string | null = null;

  async fingerprintSource(): Promise<string> {
    this.calls.fingerprint += 1;
    return SOURCE_FP;
  }

  async cloneSource(sourceNodeId: string, transactionId: string): Promise<P14CandidateHandle> {
    this.calls.clone += 1;
    this.cloneTransactionId = transactionId;
    return { sourceNodeId, candidateNodeId: 'run-control:candidate' };
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
      runId: 'p13-run-control-rescore',
      score: 96,
      status: 'READY',
      blockerCount: 0,
      highRiskCount: 0,
      introducedBlockerOrHighCount: 0,
      reviewRequired: this.reviewRequired,
    };
  }

  async retainCandidate(candidate: P14CandidateHandle, transactionId: string, preparedName: string) {
    this.calls.retain += 1;
    this.retainedTransactionId = transactionId;
    this.retainedPreparedName = preparedName;
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

class SpyCoordinator extends P14SourceTransactionCoordinator {
  acquireCalls = 0;
  lastTransactionId: string | null = null;

  override tryAcquire(sourceScope: string, transactionId: string) {
    this.acquireCalls += 1;
    this.lastTransactionId = transactionId;
    return super.tryAcquire(sourceScope, transactionId);
  }
}

function allAdapterCallsAreZero(adapter: Adapter): boolean {
  return Object.values(adapter.calls).every((count) => count === 0);
}

async function runWithControls(overrides: Record<string, unknown>, adapter = new Adapter(), coordinator = new SpyCoordinator()) {
  const preparedPlan = plan();
  const input: any = {
    plan: preparedPlan,
    registry,
    coordinator,
    confirmation: buildP14PreparationConfirmation(preparedPlan, NOW),
    transactionId: 'tx:run-control',
    preparedName: 'Prepared',
    now: () => NOW,
    ...overrides,
  };
  const receipt = await runP14RetainedDuplicateTransaction(input, adapter);
  return { receipt, adapter, coordinator };
}

describe('P14 run-control runtime evidence', () => {
  it('normalizes valid controls and snapshots stricter input bounds', () => {
    const result = assessP14RunControlEvidence({
      transactionId: '  tx:normalized  ',
      preparedName: '  Prepared Normalized  ',
      allowPreparedWithReview: true,
      inputBounds: { maxActions: 4, maxIdentityLength: 128 },
    });

    expect(result).toMatchObject({
      valid: true,
      failures: [],
      safeTransactionId: 'tx:normalized',
      value: {
        transactionId: 'tx:normalized',
        rawTransactionId: '  tx:normalized  ',
        preparedName: 'Prepared Normalized',
        rawPreparedName: '  Prepared Normalized  ',
        allowPreparedWithReview: true,
        inputBounds: { maxActions: 4, maxIdentityLength: 128 },
      },
    });
  });

  it('fails closed when an input-bound getter throws', async () => {
    const hostileBounds = new Proxy({}, {
      get() {
        throw new Error('hostile input-bound getter');
      },
    });
    const { receipt, adapter, coordinator } = await runWithControls({ inputBounds: hostileBounds });

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]).toMatchObject({ code: 'P14_INTERNAL_INVARIANT_FAILED', stage: 'run-control' });
    expect(coordinator.acquireCalls).toBe(0);
    expect(allAdapterCallsAreZero(adapter)).toBe(true);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it.each([
    ['string review policy', { allowPreparedWithReview: 'yes' }],
    ['numeric prepared name', { preparedName: 42 }],
    ['numeric transaction id', { transactionId: 42 }],
    ['whitespace transaction id', { transactionId: '   ' }],
    ['string bound', { inputBounds: { maxActions: '1' } }],
    ['zero bound', { inputBounds: { maxActions: 0 } }],
    ['non-object bounds', { inputBounds: 'strict' }],
  ])('blocks malformed %s before coordinator or adapter access', async (_label, controls) => {
    const { receipt, adapter, coordinator } = await runWithControls(controls);
    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.terminalState).toBe('BLOCKED');
    expect(receipt.errors[0]).toMatchObject({ code: 'P14_INTERNAL_INVARIANT_FAILED', stage: 'run-control' });
    expect(coordinator.acquireCalls).toBe(0);
    expect(allAdapterCallsAreZero(adapter)).toBe(true);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('does not let a truthy non-boolean review policy authorize retention', async () => {
    const adapter = new Adapter();
    adapter.reviewRequired = true;
    const { receipt, coordinator } = await runWithControls({ allowPreparedWithReview: 'true' }, adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]?.stage).toBe('run-control');
    expect(coordinator.acquireCalls).toBe(0);
    expect(adapter.calls.rescore).toBe(0);
    expect(adapter.calls.retain).toBe(0);
  });

  it('normalizes transaction and prepared-name identities once before coordinator and adapter use', async () => {
    const { receipt, adapter, coordinator } = await runWithControls({
      transactionId: '  tx:normalized-runtime  ',
      preparedName: '  Prepared Normalized Runtime  ',
    });

    expect(receipt.status).toBe('PREPARED');
    expect(receipt.transactionId).toBe('tx:normalized-runtime');
    expect(coordinator.lastTransactionId).toBe('tx:normalized-runtime');
    expect(adapter.cloneTransactionId).toBe('tx:normalized-runtime');
    expect(adapter.retainedTransactionId).toBe('tx:normalized-runtime');
    expect(adapter.retainedPreparedName).toBe('Prepared Normalized Runtime');
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('preserves explicit boolean review authorization', async () => {
    const adapter = new Adapter();
    adapter.reviewRequired = true;
    const { receipt } = await runWithControls({ allowPreparedWithReview: true }, adapter);

    expect(receipt.status).toBe('PREPARED_WITH_REVIEW');
    expect(adapter.calls.retain).toBe(1);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('preserves the existing P14_INPUT_TOO_LARGE outcome for valid oversized string controls', async () => {
    const { receipt, adapter, coordinator } = await runWithControls({
      transactionId: 't'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1),
    });

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]).toMatchObject({ code: 'P14_INPUT_TOO_LARGE', stage: 'bounds' });
    expect(receipt.transactionId).toBe('p14-transaction-invalid');
    expect(coordinator.acquireCalls).toBe(0);
    expect(allAdapterCallsAreZero(adapter)).toBe(true);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });
});
