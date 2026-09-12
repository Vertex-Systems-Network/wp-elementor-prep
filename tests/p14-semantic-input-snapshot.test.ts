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
  P14PreparationPlanV1,
  P14PreparationRecipeDefinition,
  P14RecipeExecutionResult,
  P14RescoreSummary,
  P14RetainedDuplicateAdapter,
  P14ValidationSummary,
} from '../src/core/p14-preparation-types';

const SOURCE_ID = 'semantic-snapshot:source';
const SOURCE_FP = 'semantic-snapshot-source-fingerprint';
const RULE_ID = 'SYNTHETIC_SEMANTIC_SNAPSHOT_RULE';
const PROFILE_ID = 'P14_SYNTHETIC_SEMANTIC_SNAPSHOT_VALIDATE';
const NOW = '2026-09-12T00:00:00.000Z';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_SEMANTIC_SNAPSHOT_RECIPE',
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

function preparedPlan(): P14PreparationPlanV1 {
  return buildP14PreparationPlan({
    p13RunId: 'p13-semantic-snapshot-test',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'semantic-snapshot-finding',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['semantic-snapshot:target'],
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
    return { sourceNodeId, candidateNodeId: 'semantic-snapshot:candidate' };
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
      runId: 'p13-semantic-snapshot-rescore',
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

function expectPrepared(receipt: Awaited<ReturnType<typeof runP14RetainedDuplicateTransaction>>, adapter: Adapter) {
  expect(receipt.status).toBe('PREPARED');
  expect(adapter.calls).toMatchObject({
    fingerprint: 3,
    clone: 1,
    apply: 1,
    validate: 1,
    rescore: 1,
    retain: 1,
    discard: 0,
  });
  expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
}

describe('P14 nested semantic input snapshot', () => {
  it('does not re-enter a readable stateful nested action getter after semantic capture', async () => {
    const plainPlan = preparedPlan();
    const confirmation = buildP14PreparationConfirmation(plainPlan, NOW);
    const plainAction = plainPlan.actions[0];
    expect(plainAction).toBeDefined();

    let recipeReads = 0;
    const statefulAction = new Proxy(plainAction as P14PreparationAction, {
      get(target, property, receiver) {
        if (property === 'recipeId') {
          recipeReads += 1;
          if (recipeReads > 2) throw new Error('nested action getter re-entered after semantic snapshot');
        }
        return Reflect.get(target, property, receiver);
      },
    });
    const plan: P14PreparationPlanV1 = { ...plainPlan, actions: [statefulAction] };
    const adapter = new Adapter();
    const coordinator = new SpyCoordinator();

    const receipt = await runP14RetainedDuplicateTransaction({
      plan,
      registry,
      coordinator,
      confirmation,
      transactionId: 'tx:semantic-action-stable',
      now: () => NOW,
    }, adapter);

    expect(recipeReads).toBe(2);
    expect(coordinator.acquireCalls).toBe(1);
    expectPrepared(receipt, adapter);
  });

  it('does not re-enter a readable stateful confirmation getter after semantic capture', async () => {
    const plan = preparedPlan();
    const plainConfirmation = buildP14PreparationConfirmation(plan, NOW);
    let digestReads = 0;
    const confirmation = new Proxy(plainConfirmation as object, {
      get(target, property, receiver) {
        if (property === 'planDigest') {
          digestReads += 1;
          if (digestReads > 2) return 'p14-plan-state-changed-after-snapshot';
        }
        return Reflect.get(target, property, receiver);
      },
    });
    const adapter = new Adapter();
    const coordinator = new SpyCoordinator();

    const receipt = await runP14RetainedDuplicateTransaction({
      plan,
      registry,
      coordinator,
      confirmation,
      transactionId: 'tx:semantic-confirmation-stable',
      now: () => NOW,
    }, adapter);

    expect(digestReads).toBe(2);
    expect(coordinator.acquireCalls).toBe(1);
    expectPrepared(receipt, adapter);
  });

  it('preserves P14_INPUT_TOO_LARGE when readable plan evidence grows after the first bounds pass', async () => {
    const plainPlan = preparedPlan();
    const confirmation = buildP14PreparationConfirmation(plainPlan, NOW);
    let actionsReads = 0;
    let oversizedItemReads = 0;
    const oversizedActions = new Proxy([] as unknown[], {
      get(target, property, receiver) {
        if (property === 'length') return DEFAULT_P14_INPUT_BOUNDS.maxActions + 1;
        if (typeof property === 'string' && /^\d+$/.test(property)) {
          oversizedItemReads += 1;
          throw new Error('oversized actions must not be traversed');
        }
        return Reflect.get(target, property, receiver);
      },
    });
    const statefulPlan = new Proxy(plainPlan as object, {
      get(target, property, receiver) {
        if (property === 'actions') {
          actionsReads += 1;
          if (actionsReads === 1) return plainPlan.actions;
          return oversizedActions;
        }
        return Reflect.get(target, property, receiver);
      },
    });
    const adapter = new Adapter();
    const coordinator = new SpyCoordinator();

    const receipt = await runP14RetainedDuplicateTransaction({
      plan: statefulPlan,
      registry,
      coordinator,
      confirmation,
      transactionId: 'tx:semantic-grown-oversized',
      now: () => NOW,
    }, adapter);

    expect(actionsReads).toBe(2);
    expect(oversizedItemReads).toBe(0);
    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]).toMatchObject({ code: 'P14_INPUT_TOO_LARGE', stage: 'bounds' });
    expect(coordinator.acquireCalls).toBe(0);
    expect(Object.values(adapter.calls).every((count) => count === 0)).toBe(true);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('preserves ordinary plain-object preparation behavior', async () => {
    const plan = preparedPlan();
    const adapter = new Adapter();
    const coordinator = new SpyCoordinator();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan,
      registry,
      coordinator,
      confirmation: buildP14PreparationConfirmation(plan, NOW),
      transactionId: 'tx:semantic-plain',
      preparedName: 'Prepared Semantic Snapshot',
      now: () => NOW,
    }, adapter);

    expect(coordinator.acquireCalls).toBe(1);
    expectPrepared(receipt, adapter);
  });
});
