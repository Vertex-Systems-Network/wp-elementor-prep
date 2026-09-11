import { describe, expect, it } from 'vitest';
import {
  DEFAULT_P14_INPUT_BOUNDS,
  HARD_P14_INPUT_BOUNDS,
  assessP14PreparationInputBounds,
  resolveP14InputBounds,
} from '../src/core/p14-input-bounds';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
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

const RULE_ID = 'SYNTHETIC_BOUNDS_RULE';
const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_BOUNDS_RECIPE',
  version: 1,
  sourceRuleIds: [RULE_ID],
  minConfidence: 95,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_SYNTHETIC_BOUNDS_VALIDATE',
  conflictsWith: [],
  orderClass: '10-structure',
};

const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: RULE_ID, sourceRuleVersion: 1, recipe },
]);

function plan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-bounds-run',
    sourceNodeId: 'bounds:source',
    sourceFingerprint: 'bounds-source-fingerprint',
    findings: [{
      findingId: 'bounds-finding',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['bounds:target'],
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
  async fingerprintSource(): Promise<string> { this.calls.fingerprint += 1; return 'bounds-source-fingerprint'; }
  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    this.calls.clone += 1;
    return { sourceNodeId, candidateNodeId: 'bounds:candidate' };
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
    return { runId: 'rescore', score: 95, status: 'READY', blockerCount: 0, highRiskCount: 0, introducedBlockerOrHighCount: 0, reviewRequired: false };
  }
  async retainCandidate(candidate: P14CandidateHandle, transactionId: string, preparedName: string) {
    this.calls.retain += 1;
    return { transactionId, sourceNodeId: candidate.sourceNodeId, retainedNodeId: candidate.candidateNodeId, preparedName };
  }
  async discardCandidate(): Promise<void> { this.calls.discard += 1; }
}

class SpyCoordinator extends P14SourceTransactionCoordinator {
  acquireCalls = 0;
  override tryAcquire(sourceScope: string, transactionId: string) {
    this.acquireCalls += 1;
    return super.tryAcquire(sourceScope, transactionId);
  }
}

describe('P14 bounded input preflight', () => {
  it('accepts a normal canonical preparation plan', () => {
    const result = assessP14PreparationInputBounds(plan());
    expect(result.allowed).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.observed.actionCount).toBe(1);
    expect(result.observed.totalTargetReferences).toBe(1);
  });

  it('rejects oversized top-level action arrays without traversing their contents', () => {
    const target = new Array(DEFAULT_P14_INPUT_BOUNDS.maxActions + 1);
    const actions = new Proxy(target, {
      get(array, property, receiver) {
        if (property !== 'length') throw new Error(`oversized actions content was touched: ${String(property)}`);
        return Reflect.get(array, property, receiver);
      },
    });
    const value = { actions };
    expect(() => assessP14PreparationInputBounds(value)).not.toThrow();
    const result = assessP14PreparationInputBounds(value);
    expect(result.allowed).toBe(false);
    expect(result.failures).toContainEqual(expect.objectContaining({ code: 'P14_BOUND_MAX_ACTIONS', path: 'actions' }));
  });

  it('rejects an oversized target array without iterating target items', () => {
    const target = new Array(DEFAULT_P14_INPUT_BOUNDS.maxTargetsPerAction + 1);
    const targetNodeIds = new Proxy(target, {
      get(array, property, receiver) {
        if (property !== 'length') throw new Error(`oversized target content was touched: ${String(property)}`);
        return Reflect.get(array, property, receiver);
      },
    });
    const value = {
      actions: [{ targetNodeIds, prerequisiteRecipeIds: [], conflictsWithRecipeIds: [], mutationAllowlist: [] }],
      blockers: [], eligibleActionIds: [], noOpActionIds: [], reviewActionIds: [], refusedActionIds: [],
    };
    expect(() => assessP14PreparationInputBounds(value)).not.toThrow();
    const result = assessP14PreparationInputBounds(value);
    expect(result.allowed).toBe(false);
    expect(result.failures.some((failure) => failure.code === 'P14_BOUND_MAX_TARGETS_PER_ACTION')).toBe(true);
  });

  it('rejects oversized identity strings and supports stricter injected limits', () => {
    const value = plan() as any;
    value.p13RunId = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    const identity = assessP14PreparationInputBounds(value);
    expect(identity.allowed).toBe(false);
    expect(identity.failures.some((failure) => failure.code === 'P14_BOUND_MAX_IDENTITY_LENGTH')).toBe(true);

    const strict = assessP14PreparationInputBounds(plan(), { maxActions: 1, maxTotalTargetReferences: 1 });
    expect(strict.allowed).toBe(true);
    const tooStrict = assessP14PreparationInputBounds(plan(), { maxActions: 1, maxTotalTargetReferences: 1, maxTargetsPerAction: 1 });
    expect(tooStrict.allowed).toBe(true);
  });

  it('never allows injected limits to loosen default or hard safety limits', () => {
    const resolved = resolveP14InputBounds({
      maxActions: HARD_P14_INPUT_BOUNDS.maxActions + 1000,
      maxIdentityLength: HARD_P14_INPUT_BOUNDS.maxIdentityLength + 1000,
    });
    expect(resolved.maxActions).toBeLessThanOrEqual(DEFAULT_P14_INPUT_BOUNDS.maxActions);
    expect(resolved.maxIdentityLength).toBeLessThanOrEqual(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength);
  });

  it('blocks oversized input before coordinator or adapter access', async () => {
    const value = plan() as any;
    value.actions = new Array(DEFAULT_P14_INPUT_BOUNDS.maxActions + 1).fill(null);
    const adapter = new CountingAdapter();
    const coordinator = new SpyCoordinator();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan: value,
      registry,
      coordinator,
      transactionId: 'p14-bounds-block',
      now: () => '2026-09-12T00:00:00.000Z',
    }, adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]?.code).toBe('P14_INPUT_TOO_LARGE');
    expect(receipt.source.beforeFingerprint).toBe('UNKNOWN');
    expect(receipt.source.afterFingerprint).toBe('UNKNOWN');
    expect(coordinator.acquireCalls).toBe(0);
    expect(Object.values(adapter.calls).every((count) => count === 0)).toBe(true);
  });

  it('honors a custom stricter transaction bound before adapter access', async () => {
    const adapter = new CountingAdapter();
    const coordinator = new SpyCoordinator();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan: plan(),
      registry,
      coordinator,
      inputBounds: { maxActions: 1, maxTotalTargetReferences: 1, maxIdentityLength: 8 },
      transactionId: 'p14-strict-bound',
      now: () => '2026-09-12T00:00:00.000Z',
    }, adapter);
    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]?.code).toBe('P14_INPUT_TOO_LARGE');
    expect(coordinator.acquireCalls).toBe(0);
    expect(Object.values(adapter.calls).every((count) => count === 0)).toBe(true);
  });
});
