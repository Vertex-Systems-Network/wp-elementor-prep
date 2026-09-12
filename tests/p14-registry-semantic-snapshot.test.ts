import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { authorizeP14PreparationPlan } from '../src/core/p14-plan-authorization';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import {
  assessP14SafeRecipeRegistryEvidence,
  createP14SafeRecipeRegistry,
  resolveP14SafeRecipe,
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

const SOURCE_ID = 'registry-snapshot:source';
const SOURCE_FP = 'registry-snapshot-source-fingerprint';
const RULE_ID = 'SYNTHETIC_REGISTRY_SNAPSHOT_RULE';
const PROFILE_ID = 'P14_SYNTHETIC_REGISTRY_SNAPSHOT_VALIDATE';
const NOW = '2026-09-12T00:00:00.000Z';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_REGISTRY_SNAPSHOT_RECIPE',
  version: 1,
  sourceRuleIds: [RULE_ID],
  minConfidence: 95,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: PROFILE_ID,
  conflictsWith: [],
  orderClass: '10-structure',
};

function plainRegistry(): P14SafeRecipeRegistryV1 {
  return createP14SafeRecipeRegistry([
    { sourceRuleId: RULE_ID, sourceRuleVersion: 1, recipe },
  ]);
}

function readyPlan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-registry-snapshot-test',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'registry-snapshot-finding',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['registry-snapshot:target'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

function hostileOversizedArray(length: number): unknown[] {
  return new Proxy(new Array(length), {
    get(target, property, receiver) {
      if (property === 'length') return Reflect.get(target, property, receiver);
      throw new Error(`oversized registry snapshot array must not be traversed (${String(property)})`);
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
    return { sourceNodeId, candidateNodeId: 'registry-snapshot:candidate' };
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
      runId: 'p13-registry-snapshot-rescore',
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

class CountingCoordinator extends P14SourceTransactionCoordinator {
  acquireCalls = 0;

  override tryAcquire(sourceScopeInput: string, transactionIdInput: string): P14TransactionLeaseResult {
    this.acquireCalls += 1;
    return super.tryAcquire(sourceScopeInput, transactionIdInput);
  }
}

function untouched(adapter: CountingAdapter): boolean {
  return Object.values(adapter.calls).every((count) => count === 0);
}

describe('P14 safe-recipe registry semantic snapshot', () => {
  it('does not re-enter a readable stateful top-level bindings getter after bounded capture', () => {
    const original = plainRegistry();
    let reads = 0;
    const stateful = new Proxy(original, {
      get(target, property, receiver) {
        if (property === 'bindings') {
          reads += 1;
          if (reads > 2) throw new Error('registry bindings getter re-entered after semantic capture');
        }
        return Reflect.get(target, property, receiver);
      },
    });

    const result = authorizeP14PreparationPlan(readyPlan(), stateful);

    expect(result.authorized).toBe(true);
    expect(reads).toBe(2);
  });

  it('does not re-enter readable stateful nested recipe evidence after bounded capture', () => {
    const original = plainRegistry();
    const binding = original.bindings[0];
    if (!binding) throw new Error('expected synthetic registry binding');
    let allowlistReads = 0;
    const statefulRecipe = new Proxy(binding.recipe, {
      get(target, property, receiver) {
        if (property === 'mutationAllowlist') {
          allowlistReads += 1;
          if (allowlistReads > 2) throw new Error('recipe mutationAllowlist getter re-entered after semantic capture');
        }
        return Reflect.get(target, property, receiver);
      },
    });
    const stateful = {
      schemaVersion: 1 as const,
      bindings: [{ ...binding, recipe: statefulRecipe }],
    };

    const resolution = resolveP14SafeRecipe(stateful, RULE_ID, 1);

    expect(resolution.status).toBe('MATCH');
    expect(allowlistReads).toBe(2);
  });

  it('rejects registry evidence that grows oversized after the first bounds pass without item traversal', () => {
    const original = plainRegistry();
    const oversized = hostileOversizedArray(DEFAULT_P14_INPUT_BOUNDS.maxActions + 1);
    let reads = 0;
    const stateful = new Proxy(original, {
      get(target, property, receiver) {
        if (property === 'bindings') {
          reads += 1;
          if (reads === 2) return oversized;
        }
        return Reflect.get(target, property, receiver);
      },
    });

    const evidence = assessP14SafeRecipeRegistryEvidence(stateful);

    expect(evidence.valid).toBe(false);
    expect(evidence.failures.some((failure) => failure.includes('bounded safety limits'))).toBe(true);
    expect(evidence.failures.some((failure) => failure.includes('registry.bindings'))).toBe(true);
    expect(reads).toBe(2);
  });

  it('fails closed before coordinator/adapter access when registry evidence becomes unreadable during capture', async () => {
    const plan = readyPlan();
    const original = plainRegistry();
    let reads = 0;
    const stateful = new Proxy(original, {
      get(target, property, receiver) {
        if (property === 'bindings') {
          reads += 1;
          if (reads === 2) throw new Error('registry bindings unreadable during semantic capture');
        }
        return Reflect.get(target, property, receiver);
      },
    });
    const adapter = new CountingAdapter();
    const coordinator = new CountingCoordinator();

    const receipt = await runP14RetainedDuplicateTransaction({
      plan,
      registry: stateful,
      coordinator,
      confirmation: buildP14PreparationConfirmation(plan, NOW),
      transactionId: 'tx:registry-semantic-unreadable',
      now: () => NOW,
    }, adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.terminalState).toBe('BLOCKED');
    expect(receipt.errors[0]?.code).toBe('P14_RECIPE_UNAUTHORIZED');
    expect(receipt.errors[0]?.detail).toContain('could not be read safely');
    expect(receipt.errors[0]?.detail).toContain('registry bindings unreadable during semantic capture');
    expect(reads).toBe(2);
    expect(coordinator.acquireCalls).toBe(0);
    expect(coordinator.activeCount).toBe(0);
    expect(untouched(adapter)).toBe(true);
  });

  it('preserves normal synthetic transaction authorization and preparation', async () => {
    const plan = readyPlan();
    const adapter = new CountingAdapter();
    const coordinator = new CountingCoordinator();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan,
      registry: plainRegistry(),
      coordinator,
      confirmation: buildP14PreparationConfirmation(plan, NOW),
      transactionId: 'tx:registry-semantic-normal',
      now: () => NOW,
    }, adapter);

    expect(receipt.status).toBe('PREPARED');
    expect(coordinator.acquireCalls).toBe(1);
    expect(adapter.calls).toMatchObject({
      fingerprint: 3,
      clone: 1,
      apply: 1,
      validate: 1,
      rescore: 1,
      retain: 1,
      discard: 0,
    });
  });
});
