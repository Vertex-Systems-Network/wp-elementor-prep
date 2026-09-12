import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import {
  assessP14ReceiptCollection,
  P14_RECEIPT_COLLECTION_LIMIT,
} from '../src/core/p14-receipt-evidence';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';
import {
  P14_PREPARATION_ENGINE_VERSION,
  type P14CandidateHandle,
  type P14PreparationAction,
  type P14PreparationPlanV1,
  type P14PreparationRecipeDefinition,
  type P14PreparationReceiptV1,
  type P14RecipeExecutionResult,
  type P14RescoreSummary,
  type P14RetainedDuplicateAdapter,
  type P14ValidationSummary,
} from '../src/core/p14-preparation-types';

const fixedNow = () => '2026-09-12T00:00:00.000Z';

function noopReceipt(): P14PreparationReceiptV1 {
  return {
    schemaVersion: 1,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    transactionId: 'tx',
    status: 'NO_CHANGES_NEEDED',
    terminalState: 'COMPLETE',
    source: {
      nodeId: '1:1',
      beforeFingerprint: 'fp',
      afterFingerprint: 'fp',
    },
    p13RunId: 'p13-run',
    planDigest: 'p14-plan-test',
    appliedActions: [],
    errors: [],
    events: [
      { state: 'IDLE', at: fixedNow() },
      { state: 'COMPLETE', at: fixedNow() },
    ],
  };
}

function blockedReceipt(): P14PreparationReceiptV1 {
  return {
    ...noopReceipt(),
    status: 'BLOCKED',
    terminalState: 'BLOCKED',
    errors: [{
      code: 'P14_INTERNAL_INVARIANT_FAILED',
      stage: 'stage',
      detail: 'detail',
      recovery: 'recovery',
    }],
    events: [
      { state: 'IDLE', at: fixedNow() },
      { state: 'BLOCKED', at: fixedNow(), detail: 'blocked' },
    ],
  };
}

function noTraversalOversizedArray(): unknown[] {
  const target = Array.from({ length: P14_RECEIPT_COLLECTION_LIMIT + 1 }, () => ({ forged: true }));
  return new Proxy(target, {
    get(array, property, receiver) {
      if (property !== 'length') {
        throw new Error(`oversized receipt collection was traversed through ${String(property)}`);
      }
      return Reflect.get(array, property, receiver);
    },
  });
}

describe('P14 receipt envelope bounds', () => {
  it('accepts exact collection, identity and diagnostic boundaries', () => {
    const exactCollection = Array.from({ length: P14_RECEIPT_COLLECTION_LIMIT }, () => null);
    expect(assessP14ReceiptCollection(exactCollection)).toMatchObject({
      failure: null,
      actualLength: P14_RECEIPT_COLLECTION_LIMIT,
      limit: P14_RECEIPT_COLLECTION_LIMIT,
    });

    const receipt = blockedReceipt();
    receipt.transactionId = 't'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength);
    receipt.p13RunId = 'r'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength);
    receipt.planDigest = `p14-plan-${'p'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength - 'p14-plan-'.length)}`;
    receipt.source.nodeId = 'n'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength);
    receipt.source.beforeFingerprint = 'f'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength);
    receipt.source.afterFingerprint = receipt.source.beforeFingerprint;
    receipt.errors[0]!.stage = 's'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength);
    receipt.errors[0]!.detail = 'd'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);
    receipt.errors[0]!.recovery = 'r'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);
    receipt.events[1]!.detail = 'e'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);

    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('rejects oversized collections from length before traversing forged contents', () => {
    for (const field of ['appliedActions', 'errors', 'events'] as const) {
      const receipt = noopReceipt() as any;
      receipt[field] = noTraversalOversizedArray();
      let result;
      expect(() => {
        result = validateP14PreparationReceipt(receipt);
      }).not.toThrow();
      expect(result!.valid).toBe(false);
      expect(result!.failures.some((failure: string) => failure.includes(`${field} exceeds the bounded receipt collection limit`))).toBe(true);
    }
  });

  it('rejects oversized top-level identities and error/event diagnostics', () => {
    const cases: Array<{ mutate: (receipt: P14PreparationReceiptV1) => void; expected: string }> = [
      {
        mutate: (receipt) => { receipt.transactionId = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1); },
        expected: 'transactionId',
      },
      {
        mutate: (receipt) => { receipt.p13RunId = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1); },
        expected: 'p13RunId',
      },
      {
        mutate: (receipt) => { receipt.planDigest = `p14-plan-${'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength)}`; },
        expected: 'planDigest',
      },
      {
        mutate: (receipt) => { receipt.source.nodeId = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1); },
        expected: 'source fingerprint evidence',
      },
      {
        mutate: (receipt) => { receipt.errors[0]!.stage = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1); },
        expected: 'errors[0]',
      },
      {
        mutate: (receipt) => { receipt.errors[0]!.detail = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1); },
        expected: 'errors[0]',
      },
      {
        mutate: (receipt) => { receipt.errors[0]!.recovery = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1); },
        expected: 'errors[0]',
      },
      {
        mutate: (receipt) => { receipt.events[1]!.detail = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1); },
        expected: 'events[1]',
      },
    ];

    for (const testCase of cases) {
      const receipt = blockedReceipt();
      testCase.mutate(receipt);
      const result = validateP14PreparationReceipt(receipt);
      expect(result.valid).toBe(false);
      expect(result.failures.some((failure) => failure.includes(testCase.expected))).toBe(true);
    }
  });
});

const sourceId = '1:1';
const sourceFingerprint = 'source-fingerprint';
const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_RECEIPT_BOUND_TEST',
  version: 1,
  sourceRuleIds: ['BR_RECEIPT_BOUND_TEST'],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_RECEIPT_BOUND_VALIDATION',
  conflictsWith: [],
  orderClass: '10-test',
};
const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: 'BR_RECEIPT_BOUND_TEST', sourceRuleVersion: 1, recipe },
]);

function readyPlan(): P14PreparationPlanV1 {
  return buildP14PreparationPlan({
    p13RunId: 'p13-receipt-bound-run',
    sourceNodeId: sourceId,
    sourceFingerprint,
    findings: [{
      findingId: 'receipt-bound-finding',
      sourceRuleId: 'BR_RECEIPT_BOUND_TEST',
      sourceRuleVersion: 1,
      targetNodeIds: ['2:1'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

class RuntimeFailureAdapter implements P14RetainedDuplicateAdapter {
  constructor(
    private readonly applyFailure: unknown,
    private readonly discardFailure: unknown = null,
  ) {}

  async fingerprintSource(): Promise<string> {
    return sourceFingerprint;
  }

  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    return { sourceNodeId, candidateNodeId: 'candidate:receipt-bound' };
  }

  async assessActionEligibility(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<unknown> {
    return {
      actionId: action.actionId,
      recipeId: action.recipeId,
      checkedPrerequisiteRecipeIds: [],
      eligible: true,
    };
  }

  async applyRecipe(_candidate: P14CandidateHandle, _action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    throw this.applyFailure;
  }

  async validateCandidate(): Promise<P14ValidationSummary> {
    return {
      passed: true,
      profileIdsRun: [recipe.validationProfileId],
      checks: [{ id: 'required', passed: true, required: true }],
    };
  }

  async rescoreCandidate(): Promise<P14RescoreSummary> {
    return {
      runId: 'p13-rescore',
      score: 95,
      status: 'READY',
      blockerCount: 0,
      highRiskCount: 0,
      introducedBlockerOrHighCount: 0,
      reviewRequired: false,
    };
  }

  async retainCandidate(candidate: P14CandidateHandle, transactionId: string, preparedName: string) {
    return {
      transactionId,
      sourceNodeId: candidate.sourceNodeId,
      retainedNodeId: candidate.candidateNodeId,
      preparedName,
    };
  }

  async discardCandidate(): Promise<void> {
    if (this.discardFailure !== null) throw this.discardFailure;
  }
}

function runFailure(adapter: P14RetainedDuplicateAdapter) {
  const plan = readyPlan();
  return runP14RetainedDuplicateTransaction({
    plan,
    registry,
    confirmation: buildP14PreparationConfirmation(plan, fixedNow()),
    transactionId: 'p14-receipt-bound-transaction',
    now: fixedNow,
  }, adapter);
}

describe('P14 bounded runtime exception evidence', () => {
  it('bounds long adapter and discard exception messages by construction', async () => {
    const receipt = await runFailure(new RuntimeFailureAdapter(
      new Error('A'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength * 4)),
      new Error('D'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength * 4)),
    ));

    expect(receipt.status).toBe('CLEANUP_REQUIRED');
    expect(receipt.errors).toHaveLength(2);
    expect(receipt.errors[0]!.detail.length).toBe(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);
    expect(receipt.errors[1]!.detail.length).toBe(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);
    expect(receipt.events.every((item) => (item.detail?.length ?? 0) <= DEFAULT_P14_INPUT_BOUNDS.maxDetailLength)).toBe(true);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('falls back safely when hostile exception stringification throws', async () => {
    const hostile = {
      toString(): string {
        throw new Error('hostile toString');
      },
    };
    const receipt = await runFailure(new RuntimeFailureAdapter(hostile));

    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]!.detail).toBe('Unknown P14 runtime failure.');
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });
});
