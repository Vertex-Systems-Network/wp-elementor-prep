import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
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

const SOURCE_ID = 'cancel:source';
const SOURCE_FP = 'cancel-source-fingerprint';
const NOW = '2026-09-12T00:00:00.000Z';

const firstRecipe: P14PreparationRecipeDefinition = {
  id: 'P14_CANCEL_FIRST',
  version: 1,
  sourceRuleIds: ['CANCEL_FIRST_RULE'],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'CANCEL_FIRST_PROFILE',
  conflictsWith: [],
  orderClass: '10-structure',
};

const secondRecipe: P14PreparationRecipeDefinition = {
  id: 'P14_CANCEL_SECOND',
  version: 1,
  sourceRuleIds: ['CANCEL_SECOND_RULE'],
  minConfidence: 90,
  prerequisites: [firstRecipe.id],
  mutationAllowlist: ['layoutSizing'],
  validationProfileId: 'CANCEL_SECOND_PROFILE',
  conflictsWith: [],
  orderClass: '20-sizing',
};

const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: 'CANCEL_FIRST_RULE', sourceRuleVersion: 1, recipe: firstRecipe },
  { sourceRuleId: 'CANCEL_SECOND_RULE', sourceRuleVersion: 1, recipe: secondRecipe },
]);

function plan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-cancellation-check',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [
      {
        findingId: 'cancel-first-finding',
        sourceRuleId: 'CANCEL_FIRST_RULE',
        sourceRuleVersion: 1,
        targetNodeIds: ['cancel:first'],
        confidence: 99,
        remediationClass: 'P14_SAFE_CANDIDATE' as const,
        acceptedRecipeId: firstRecipe.id,
        acceptedRecipeVersion: 1,
      },
      {
        findingId: 'cancel-second-finding',
        sourceRuleId: 'CANCEL_SECOND_RULE',
        sourceRuleVersion: 1,
        targetNodeIds: ['cancel:second'],
        confidence: 99,
        remediationClass: 'P14_SAFE_CANDIDATE' as const,
        acceptedRecipeId: secondRecipe.id,
        acceptedRecipeVersion: 1,
      },
    ],
    recipes: [secondRecipe, firstRecipe],
  });
}

class CancellationAdapter implements P14RetainedDuplicateAdapter {
  calls = { clone: 0, apply: 0, assess: 0, validate: 0, rescore: 0, retain: 0, discard: 0 };
  failDiscard = false;

  async fingerprintSource(): Promise<string> { return SOURCE_FP; }
  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    this.calls.clone += 1;
    return { sourceNodeId, candidateNodeId: 'cancel:candidate' };
  }
  async assessActionEligibility(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<unknown> {
    this.calls.assess += 1;
    return {
      actionId: action.actionId,
      recipeId: action.recipeId,
      checkedPrerequisiteRecipeIds: [...action.prerequisiteRecipeIds],
      eligible: true,
    };
  }
  async applyRecipe(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    this.calls.apply += 1;
    return { actionId: action.actionId, recipeId: action.recipeId ?? 'missing', applied: true };
  }
  async validateCandidate(): Promise<P14ValidationSummary> {
    this.calls.validate += 1;
    return {
      passed: true,
      profileIdsRun: ['CANCEL_FIRST_PROFILE', 'CANCEL_SECOND_PROFILE'],
      checks: [{ id: 'required', passed: true, required: true }],
    };
  }
  async rescoreCandidate(): Promise<P14RescoreSummary> {
    this.calls.rescore += 1;
    return {
      runId: 'p13-cancel-candidate',
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
    if (this.failDiscard) throw new Error('discard failed during cancellation probe recovery');
  }
}

function throwingCheck(options: { failAt: number; asyncReject?: boolean; detail?: string }) {
  let calls = 0;
  return () => {
    calls += 1;
    if (calls !== options.failAt) return false;
    const error = new Error(options.detail ?? `cancellation check failed at call ${calls}`);
    if (options.asyncReject) return Promise.reject(error);
    throw error;
  };
}

async function run(
  adapter: CancellationAdapter,
  shouldCancel: () => boolean | Promise<boolean>,
  transactionId = 'p14-cancellation-check-tx',
  coordinator = new P14SourceTransactionCoordinator(),
) {
  const current = plan();
  const receipt = await runP14RetainedDuplicateTransaction({
    plan: current,
    registry,
    coordinator,
    confirmation: buildP14PreparationConfirmation(current, NOW),
    transactionId,
    now: () => NOW,
    shouldCancel,
  }, adapter);
  return { receipt, coordinator };
}

describe('P14 cancellation check failure boundary', () => {
  it('blocks a synchronous pre-clone check failure without cloning or reporting cancellation', async () => {
    const adapter = new CancellationAdapter();
    const { receipt, coordinator } = await run(adapter, throwingCheck({ failAt: 1 }));

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.terminalState).toBe('BLOCKED');
    expect(receipt.errors[0]?.code).toBe('P14_INTERNAL_INVARIANT_FAILED');
    expect(receipt.errors.some((error) => error.code === 'P14_CANCELLED')).toBe(false);
    expect(adapter.calls.clone).toBe(0);
    expect(adapter.calls.apply).toBe(0);
    expect(adapter.calls.discard).toBe(0);
    expect(coordinator.activeCount).toBe(0);
  });

  it('cleans up when the check asynchronously rejects between sequential recipes', async () => {
    const adapter = new CancellationAdapter();
    const { receipt, coordinator } = await run(adapter, throwingCheck({ failAt: 3, asyncReject: true }));

    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_INTERNAL_INVARIANT_FAILED');
    expect(receipt.errors.some((error) => error.code === 'P14_CANCELLED')).toBe(false);
    expect(adapter.calls.apply).toBe(1);
    expect(adapter.calls.discard).toBe(1);
    expect(adapter.calls.validate).toBe(0);
    expect(adapter.calls.retain).toBe(0);
    expect(coordinator.activeCount).toBe(0);
  });

  it('cleans up a pre-validation check failure after both recipe mutations', async () => {
    const adapter = new CancellationAdapter();
    const { receipt } = await run(adapter, throwingCheck({ failAt: 4 }));

    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_INTERNAL_INVARIANT_FAILED');
    expect(adapter.calls.apply).toBe(2);
    expect(adapter.calls.validate).toBe(0);
    expect(adapter.calls.discard).toBe(1);
    expect(adapter.calls.retain).toBe(0);
  });

  it('cleans up a pre-finalize check failure after validation and re-score', async () => {
    const adapter = new CancellationAdapter();
    const { receipt } = await run(adapter, throwingCheck({ failAt: 5, asyncReject: true }));

    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_INTERNAL_INVARIANT_FAILED');
    expect(adapter.calls.validate).toBe(1);
    expect(adapter.calls.rescore).toBe(1);
    expect(adapter.calls.retain).toBe(0);
    expect(adapter.calls.discard).toBe(1);
    expect(receipt.validation).toBeDefined();
    expect(receipt.rescore).toBeDefined();
  });

  it('escalates to CLEANUP_REQUIRED when discard also fails', async () => {
    const adapter = new CancellationAdapter();
    adapter.failDiscard = true;
    const { receipt, coordinator } = await run(adapter, throwingCheck({ failAt: 4 }));

    expect(receipt.status).toBe('CLEANUP_REQUIRED');
    expect(receipt.terminalState).toBe('CLEANUP_REQUIRED');
    expect(receipt.errors[0]?.code).toBe('P14_INTERNAL_INVARIANT_FAILED');
    expect(receipt.errors.some((error) => error.code === 'P14_DISCARD_FAILED')).toBe(true);
    expect(receipt.candidate?.retained).toBe(false);
    expect(coordinator.activeCount).toBe(0);
  });

  it('bounds hostile callback failure detail in the receipt', async () => {
    const adapter = new CancellationAdapter();
    const hostile = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength * 4);
    const { receipt } = await run(adapter, throwingCheck({ failAt: 1, detail: hostile }));

    expect(receipt.errors[0]?.detail.length).toBeLessThanOrEqual(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);
    expect(JSON.stringify(receipt).length).toBeLessThan(20000);
  });

  it('releases the source lease so the same source can be retried after a check failure', async () => {
    const coordinator = new P14SourceTransactionCoordinator();
    const firstAdapter = new CancellationAdapter();
    const first = await run(firstAdapter, throwingCheck({ failAt: 4 }), 'cancel-failed-tx', coordinator);
    expect(first.receipt.status).toBe('REJECTED');
    expect(coordinator.activeCount).toBe(0);

    const secondAdapter = new CancellationAdapter();
    const second = await run(secondAdapter, () => false, 'cancel-retry-tx', coordinator);
    expect(second.receipt.status).toBe('PREPARED');
    expect(coordinator.activeCount).toBe(0);
  });
});
