import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
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

const SOURCE_ID = 'confirm-tx:source';
const SOURCE_FP = 'confirm-tx-source-fingerprint';
const RULE_ID = 'SYNTHETIC_CONFIRM_TX_RULE';
const NOW = '2026-09-12T00:00:00.000Z';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_CONFIRM_TX_RECIPE',
  version: 1,
  sourceRuleIds: [RULE_ID],
  minConfidence: 95,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_SYNTHETIC_CONFIRM_TX_VALIDATE',
  conflictsWith: [],
  orderClass: '10-structure',
};

const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: RULE_ID, sourceRuleVersion: 1, recipe },
]);

function plan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-confirm-tx-run',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'confirm-tx-finding',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['confirm-tx:target'],
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
    return { sourceNodeId, candidateNodeId: 'confirm-tx:candidate' };
  }
  async applyRecipe(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    this.calls.apply += 1;
    return { actionId: action.actionId, recipeId: action.recipeId ?? 'missing', applied: true };
  }
  async validateCandidate(): Promise<P14ValidationSummary> {
    this.calls.validate += 1;
    return {
      passed: true,
      profileIdsRun: ['P14_SYNTHETIC_CONFIRM_TX_VALIDATE'],
      checks: [{ id: 'required', passed: true, required: true }],
    };
  }
  async rescoreCandidate(): Promise<P14RescoreSummary> {
    this.calls.rescore += 1;
    return {
      runId: 'p13-confirm-tx-rescore',
      score: 96,
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

class SpyCoordinator extends P14SourceTransactionCoordinator {
  acquireCalls = 0;
  override tryAcquire(sourceScope: string, transactionId: string) {
    this.acquireCalls += 1;
    return super.tryAcquire(sourceScope, transactionId);
  }
}

function untouched(adapter: CountingAdapter): boolean {
  return Object.values(adapter.calls).every((count) => count === 0);
}

describe('P14 explicit confirmation execution boundary', () => {
  it('blocks an authorized READY plan when explicit confirmation is missing', async () => {
    const value = plan();
    const adapter = new CountingAdapter();
    const coordinator = new SpyCoordinator();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan: value,
      registry,
      coordinator,
      transactionId: 'p14-confirm-required',
      now: () => NOW,
    }, adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]?.code).toBe('P14_CONFIRMATION_REQUIRED');
    expect(receipt.source.beforeFingerprint).toBe('UNKNOWN');
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
    expect(coordinator.acquireCalls).toBe(0);
    expect(untouched(adapter)).toBe(true);
  });

  it('blocks stale plan-bound confirmation before source coordination or adapter access', async () => {
    const value = plan();
    const confirmation = {
      ...buildP14PreparationConfirmation(value, NOW),
      planDigest: 'p14-plan-stale-confirmation',
    };
    const adapter = new CountingAdapter();
    const coordinator = new SpyCoordinator();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan: value,
      registry,
      confirmation,
      coordinator,
      transactionId: 'p14-confirm-mismatch',
      now: () => NOW,
    }, adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]?.code).toBe('P14_CONFIRMATION_MISMATCH');
    expect(receipt.source.beforeFingerprint).toBe('UNKNOWN');
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
    expect(coordinator.acquireCalls).toBe(0);
    expect(untouched(adapter)).toBe(true);
  });

  it('allows the exact reviewed confirmation to reach the retained-duplicate path', async () => {
    const value = plan();
    const adapter = new CountingAdapter();
    const coordinator = new SpyCoordinator();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan: value,
      registry,
      confirmation: buildP14PreparationConfirmation(value, NOW),
      coordinator,
      transactionId: 'p14-confirm-exact',
      preparedName: 'Prepared',
      now: () => NOW,
    }, adapter);

    expect(receipt.status).toBe('PREPARED');
    expect(receipt.acceptanceAuthority).toBe(false);
    expect(receipt.targetCompatibilityClaim).toBe(false);
    expect(coordinator.acquireCalls).toBe(1);
    expect(adapter.calls.clone).toBe(1);
    expect(adapter.calls.apply).toBe(1);
    expect(adapter.calls.retain).toBe(1);
  });

  it('rejects oversized confirmation action evidence in the first bounded-input gate', async () => {
    const value = plan();
    const target = new Array(DEFAULT_P14_INPUT_BOUNDS.maxBucketActionIds + 1);
    const eligibleActionIds = new Proxy(target, {
      get(array, property, receiver) {
        if (property !== 'length') throw new Error(`oversized confirmation action content was touched: ${String(property)}`);
        return Reflect.get(array, property, receiver);
      },
    });
    const confirmation = {
      ...buildP14PreparationConfirmation(value, NOW),
      eligibleActionIds,
    };
    const adapter = new CountingAdapter();
    const coordinator = new SpyCoordinator();

    const run = () => runP14RetainedDuplicateTransaction({
      plan: value,
      registry,
      confirmation,
      coordinator,
      transactionId: 'p14-confirm-bounded',
      now: () => NOW,
    }, adapter);

    await expect(run()).resolves.toMatchObject({
      status: 'BLOCKED',
      errors: [expect.objectContaining({ code: 'P14_INPUT_TOO_LARGE' })],
    });
    expect(coordinator.acquireCalls).toBe(0);
    expect(untouched(adapter)).toBe(true);
  });
});
