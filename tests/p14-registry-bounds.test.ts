import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { assessP14SafeRecipeRegistryBounds } from '../src/core/p14-registry-bounds';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import {
  PRODUCTION_P14_SAFE_RECIPE_REGISTRY,
  createP14SafeRecipeRegistry,
  validateP14SafeRecipeRegistry,
  type P14SafeRecipeRegistryV1,
} from '../src/core/p14-safe-recipe-registry';
import {
  P14SourceTransactionCoordinator,
  type P14TransactionLeaseResult,
} from '../src/core/p14-transaction-coordinator';
import type {
  P14CandidateHandle,
  P14PreparationAction,
  P14PreparationRecipeDefinition,
  P14RecipeExecutionResult,
  P14RescoreSummary,
  P14RetainedDuplicateAdapter,
  P14ValidationSummary,
} from '../src/core/p14-preparation-types';

const SOURCE_ID = 'registry:source';
const SOURCE_FP = 'registry-source-fingerprint';
const RULE_ID = 'SYNTHETIC_REGISTRY_BOUND_RULE';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_REGISTRY_BOUND',
  version: 1,
  sourceRuleIds: [RULE_ID],
  minConfidence: 95,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_SYNTHETIC_REGISTRY_BOUND_VALIDATE',
  conflictsWith: [],
  orderClass: '10-structure',
};

function readyPlan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-registry-bound-run',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'registry-bound-finding',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['registry:target'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

function rawBinding(overrides: Record<string, unknown> = {}) {
  return {
    sourceRuleId: RULE_ID,
    sourceRuleVersion: 1,
    recipe: {
      ...recipe,
      sourceRuleIds: [...recipe.sourceRuleIds],
      prerequisites: [...recipe.prerequisites],
      mutationAllowlist: [...recipe.mutationAllowlist],
      conflictsWith: [...recipe.conflictsWith],
    },
    ...overrides,
  };
}

function hostileOversizedArray(length: number): unknown[] {
  return new Proxy(new Array(length), {
    get(target, property, receiver) {
      if (property === 'length') return Reflect.get(target, property, receiver);
      throw new Error(`oversized registry array must not be traversed (${String(property)})`);
    },
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
    return { sourceNodeId, candidateNodeId: 'registry:candidate' };
  }

  async applyRecipe(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    this.calls.apply += 1;
    return { actionId: action.actionId, recipeId: action.recipeId ?? 'missing', applied: true };
  }

  async validateCandidate(): Promise<P14ValidationSummary> {
    this.calls.validate += 1;
    return {
      passed: true,
      profileIdsRun: [recipe.validationProfileId],
      checks: [{ id: 'required', passed: true, required: true }],
    };
  }

  async rescoreCandidate(): Promise<P14RescoreSummary> {
    this.calls.rescore += 1;
    return {
      runId: 'p13-registry-rescore',
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

class CountingCoordinator extends P14SourceTransactionCoordinator {
  acquireCalls = 0;

  override tryAcquire(sourceScopeInput: string, transactionIdInput: string): P14TransactionLeaseResult {
    this.acquireCalls += 1;
    return super.tryAcquire(sourceScopeInput, transactionIdInput);
  }
}

describe('P14 safe-recipe registry bounds', () => {
  it('accepts exact collection and identity boundaries', () => {
    const exactBindings = Array.from(
      { length: DEFAULT_P14_INPUT_BOUNDS.maxActions },
      (_, index) => rawBinding({ sourceRuleId: `RULE_${index}` }),
    );
    const exactIdentity = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength);
    const exactPrerequisites = Array.from(
      { length: DEFAULT_P14_INPUT_BOUNDS.maxPrerequisitesPerAction },
      (_, index) => `P${index}`,
    );

    expect(assessP14SafeRecipeRegistryBounds({ schemaVersion: 1, bindings: exactBindings }).allowed).toBe(true);
    expect(assessP14SafeRecipeRegistryBounds({
      schemaVersion: 1,
      bindings: [rawBinding({
        sourceRuleId: exactIdentity,
        recipe: { ...recipe, sourceRuleIds: [exactIdentity], prerequisites: exactPrerequisites },
      })],
    }).allowed).toBe(true);
  });

  it('rejects oversized top-level bindings from length without traversing contents', () => {
    const bindings = hostileOversizedArray(DEFAULT_P14_INPUT_BOUNDS.maxActions + 1);
    const registry = { schemaVersion: 1, bindings };

    expect(() => assessP14SafeRecipeRegistryBounds(registry)).not.toThrow();
    const bounds = assessP14SafeRecipeRegistryBounds(registry);
    expect(bounds.allowed).toBe(false);
    expect(bounds.failures).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'registry.bindings', code: 'P14_BOUND_MAX_ACTIONS' }),
    ]));

    expect(() => validateP14SafeRecipeRegistry(registry)).not.toThrow();
    expect(validateP14SafeRecipeRegistry(registry).failures.some((failure) => failure.includes('bounded safety limits'))).toBe(true);
  });

  it('rejects oversized nested arrays from length without traversing contents', () => {
    const sourceRuleIds = hostileOversizedArray(DEFAULT_P14_INPUT_BOUNDS.maxActions + 1);
    const registry = {
      schemaVersion: 1,
      bindings: [rawBinding({ recipe: { ...recipe, sourceRuleIds } })],
    };

    expect(() => validateP14SafeRecipeRegistry(registry)).not.toThrow();
    const validation = validateP14SafeRecipeRegistry(registry);
    expect(validation.valid).toBe(false);
    expect(validation.failures.some((failure) => failure.includes('recipe.sourceRuleIds'))).toBe(true);
  });

  it('rejects oversized registry identities before semantic authorization validation', () => {
    const oversized = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    const registry = {
      schemaVersion: 1,
      bindings: [rawBinding({
        sourceRuleId: oversized,
        recipe: {
          ...recipe,
          id: oversized,
          sourceRuleIds: [oversized],
          validationProfileId: oversized,
          orderClass: oversized,
        },
      })],
    };

    const bounds = assessP14SafeRecipeRegistryBounds(registry);
    expect(bounds.allowed).toBe(false);
    expect(bounds.failures.filter((failure) => failure.code === 'P14_BOUND_MAX_IDENTITY_LENGTH').length).toBeGreaterThanOrEqual(4);

    const validation = validateP14SafeRecipeRegistry(registry);
    expect(validation.valid).toBe(false);
    expect(validation.failures.every((failure) => failure.includes('bounded safety limits'))).toBe(true);
  });

  it('preserves bounded malformed-registry semantic validation', () => {
    const malformed = {
      schemaVersion: 1,
      bindings: [{ sourceRuleId: RULE_ID, sourceRuleVersion: 1, recipe: null }],
    };

    expect(assessP14SafeRecipeRegistryBounds(malformed).allowed).toBe(true);
    const validation = validateP14SafeRecipeRegistry(malformed);
    expect(validation.valid).toBe(false);
    expect(validation.failures).toContain('bindings[0].recipe must be an object.');
  });

  it('keeps the production registry empty and valid', () => {
    expect(PRODUCTION_P14_SAFE_RECIPE_REGISTRY.bindings).toEqual([]);
    expect(validateP14SafeRecipeRegistry(PRODUCTION_P14_SAFE_RECIPE_REGISTRY)).toEqual({ valid: true, failures: [] });
  });
});

describe('P14 transaction registry-bound failure', () => {
  it('blocks oversized registry evidence before coordinator or adapter access', async () => {
    const adapter = new CountingAdapter();
    const coordinator = new CountingCoordinator();
    const bindings = hostileOversizedArray(DEFAULT_P14_INPUT_BOUNDS.maxActions + 1);
    const oversizedRegistry = { schemaVersion: 1, bindings } as unknown as P14SafeRecipeRegistryV1;

    const receipt = await runP14RetainedDuplicateTransaction({
      plan: readyPlan(),
      registry: oversizedRegistry,
      coordinator,
      transactionId: 'p14-registry-bounds-block',
      now: () => '2026-09-12T00:00:00.000Z',
    }, adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.terminalState).toBe('BLOCKED');
    expect(receipt.errors[0]?.code).toBe('P14_RECIPE_UNAUTHORIZED');
    expect(receipt.errors[0]?.detail).toContain('bounded safety limits');
    expect(receipt.source.beforeFingerprint).toBe('UNKNOWN');
    expect(receipt.source.afterFingerprint).toBe('UNKNOWN');
    expect(coordinator.acquireCalls).toBe(0);
    expect(coordinator.activeCount).toBe(0);
    expect(Object.values(adapter.calls).every((count) => count === 0)).toBe(true);
  });

  it('keeps bounded malformed registry evidence on the existing unauthorized path', async () => {
    const adapter = new CountingAdapter();
    const coordinator = new CountingCoordinator();
    const malformedRegistry = {
      schemaVersion: 1,
      bindings: [{ sourceRuleId: RULE_ID, sourceRuleVersion: 1, recipe: null }],
    } as unknown as P14SafeRecipeRegistryV1;

    const receipt = await runP14RetainedDuplicateTransaction({
      plan: readyPlan(),
      registry: malformedRegistry,
      coordinator,
      transactionId: 'p14-registry-malformed-block',
      now: () => '2026-09-12T00:00:00.000Z',
    }, adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]?.code).toBe('P14_RECIPE_UNAUTHORIZED');
    expect(receipt.errors[0]?.detail).toContain('recipe must be an object');
    expect(coordinator.acquireCalls).toBe(0);
    expect(Object.values(adapter.calls).every((count) => count === 0)).toBe(true);
  });

  it('does not change exact valid authorization behavior', () => {
    const registry = createP14SafeRecipeRegistry([
      { sourceRuleId: RULE_ID, sourceRuleVersion: 1, recipe },
    ]);
    expect(validateP14SafeRecipeRegistry(registry)).toEqual({ valid: true, failures: [] });
  });
});
