import { describe, expect, it } from 'vitest';
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

const SOURCE_ID = 'run-input:source';
const SOURCE_FP = 'run-input-source-fingerprint';
const RULE_ID = 'SYNTHETIC_RUN_INPUT_RULE';
const PROFILE_ID = 'P14_SYNTHETIC_RUN_INPUT_VALIDATE';
const NOW = '2026-09-12T00:00:00.000Z';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_RUN_INPUT_RECIPE',
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

function preparedPlan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-run-input-test',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'run-input-finding',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['run-input:target'],
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

  async fingerprintSource(): Promise<string> {
    this.calls.fingerprint += 1;
    return SOURCE_FP;
  }

  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    this.calls.clone += 1;
    return { sourceNodeId, candidateNodeId: 'run-input:candidate' };
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
      runId: 'p13-run-input-rescore',
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

function baseInput(coordinator = new SpyCoordinator()) {
  const plan = preparedPlan();
  return {
    input: {
      plan,
      registry,
      coordinator,
      confirmation: buildP14PreparationConfirmation(plan, NOW),
      transactionId: 'tx:run-input',
      preparedName: 'Prepared Run Input',
      now: () => NOW,
    },
    coordinator,
  };
}

function adapterWasUntouched(adapter: Adapter): boolean {
  return Object.values(adapter.calls).every((count) => count === 0);
}

function expectValidRunInputBlockedReceipt(receipt: Awaited<ReturnType<typeof runP14RetainedDuplicateTransaction>>) {
  expect(receipt.status).toBe('BLOCKED');
  expect(receipt.terminalState).toBe('BLOCKED');
  expect(receipt.errors[0]).toMatchObject({
    code: 'P14_INTERNAL_INVARIANT_FAILED',
    stage: 'run-input',
  });
  expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
}

describe('P14 top-level run-input snapshot boundary', () => {
  it.each([
    ['null', null],
    ['string', 'invalid-run-input'],
    ['array', []],
  ])('fails closed for a non-object %s input', async (_label, rawInput) => {
    const adapter = new Adapter();
    const receipt = await runP14RetainedDuplicateTransaction(rawInput as any, adapter);

    expectValidRunInputBlockedReceipt(receipt);
    expect(receipt.transactionId).toBe('p14-transaction-invalid');
    expect(adapterWasUntouched(adapter)).toBe(true);
  });

  it.each([
    'plan',
    'confirmation',
    'registry',
    'coordinator',
    'shouldCancel',
    'transactionId',
    'preparedName',
    'allowPreparedWithReview',
    'inputBounds',
  ] as const)('fails closed when the top-level %s getter throws', async (key) => {
    const adapter = new Adapter();
    const { input, coordinator } = baseInput();
    Object.defineProperty(input, key, {
      configurable: true,
      enumerable: true,
      get() {
        throw new Error(`hostile ${key} getter`);
      },
    });

    const receipt = await runP14RetainedDuplicateTransaction(input as any, adapter);

    expectValidRunInputBlockedReceipt(receipt);
    expect(coordinator.acquireCalls).toBe(0);
    expect(adapterWasUntouched(adapter)).toBe(true);
  });

  it('keeps a throwing now getter on the fail-soft UNKNOWN timestamp contract', async () => {
    const adapter = new Adapter();
    const { input } = baseInput();
    Object.defineProperty(input, 'now', {
      configurable: true,
      enumerable: true,
      get() {
        throw new Error('hostile now getter');
      },
    });

    const receipt = await runP14RetainedDuplicateTransaction(input as any, adapter);

    expect(receipt.status).toBe('PREPARED');
    expect(receipt.events.every((event) => event.at === 'UNKNOWN')).toBe(true);
    expect(adapter.calls.retain).toBe(1);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('reads every snapshotted top-level input property exactly once before a successful transaction', async () => {
    const adapter = new Adapter();
    const coordinator = new SpyCoordinator();
    const plan = preparedPlan();
    const values: Record<string, unknown> = {
      plan,
      registry,
      coordinator,
      inputBounds: undefined,
      confirmation: buildP14PreparationConfirmation(plan, NOW),
      transactionId: 'tx:one-shot-run-input',
      preparedName: 'Prepared One Shot',
      allowPreparedWithReview: false,
      shouldCancel: undefined,
    };
    const reads = new Map<string, number>();
    const input: Record<string, unknown> = { now: () => NOW };

    for (const [key, value] of Object.entries(values)) {
      Object.defineProperty(input, key, {
        configurable: true,
        enumerable: true,
        get() {
          const count = (reads.get(key) ?? 0) + 1;
          reads.set(key, count);
          if (count > 1) throw new Error(`${key} was read more than once`);
          return value;
        },
      });
    }

    const receipt = await runP14RetainedDuplicateTransaction(input as any, adapter);

    expect(receipt.status).toBe('PREPARED');
    expect(receipt.transactionId).toBe('tx:one-shot-run-input');
    expect(adapter.calls.retain).toBe(1);
    expect(coordinator.acquireCalls).toBe(1);
    for (const key of Object.keys(values)) {
      expect(reads.get(key)).toBe(1);
    }
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('preserves the normal prepared path with readable plain input', async () => {
    const adapter = new Adapter();
    const { input, coordinator } = baseInput();

    const receipt = await runP14RetainedDuplicateTransaction(input, adapter);

    expect(receipt.status).toBe('PREPARED');
    expect(receipt.transactionId).toBe('tx:run-input');
    expect(adapter.calls.retain).toBe(1);
    expect(coordinator.acquireCalls).toBe(1);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });
});
