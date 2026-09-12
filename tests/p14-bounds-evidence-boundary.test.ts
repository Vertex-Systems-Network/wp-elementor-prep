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

const SOURCE_ID = 'bounds-evidence:source';
const SOURCE_FP = 'bounds-evidence-source-fingerprint';
const RULE_ID = 'SYNTHETIC_BOUNDS_EVIDENCE_RULE';
const PROFILE_ID = 'P14_SYNTHETIC_BOUNDS_EVIDENCE_VALIDATE';
const NOW = '2026-09-12T00:00:00.000Z';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_BOUNDS_EVIDENCE_RECIPE',
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
    p13RunId: 'p13-bounds-evidence-test',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'bounds-evidence-finding',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['bounds-evidence:target'],
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
    return { sourceNodeId, candidateNodeId: 'bounds-evidence:candidate' };
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
      runId: 'p13-bounds-evidence-rescore',
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

function adapterUntouched(adapter: Adapter): boolean {
  return Object.values(adapter.calls).every((count) => count === 0);
}

describe('P14 nested bounded-input evidence boundary', () => {
  it('fails closed when nested confirmation evidence throws on the public bounds traversal', async () => {
    const plan = preparedPlan();
    const confirmation = buildP14PreparationConfirmation(plan, NOW);
    const hostileConfirmation = new Proxy(confirmation as object, {
      get(target, property, receiver) {
        if (property === 'confirmedAt') throw new Error('hostile confirmation getter');
        return Reflect.get(target, property, receiver);
      },
    });
    const adapter = new Adapter();
    const coordinator = new SpyCoordinator();

    const receipt = await runP14RetainedDuplicateTransaction({
      plan,
      registry,
      coordinator,
      confirmation: hostileConfirmation,
      transactionId: 'tx:bounds-evidence-first-pass',
      now: () => NOW,
    }, adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.terminalState).toBe('BLOCKED');
    expect(receipt.errors[0]).toMatchObject({
      code: 'P14_INTERNAL_INVARIANT_FAILED',
      stage: 'bounds-evidence',
    });
    expect(receipt.errors[0]?.detail).toContain('hostile confirmation getter');
    expect(coordinator.acquireCalls).toBe(0);
    expect(adapterUntouched(adapter)).toBe(true);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('fails closed when nested plan evidence becomes unreadable on the core bounds traversal', async () => {
    const plan = preparedPlan();
    const confirmation = buildP14PreparationConfirmation(plan, NOW);
    let actionReads = 0;
    const hostilePlan = new Proxy(plan as object, {
      get(target, property, receiver) {
        if (property === 'actions') {
          actionReads += 1;
          if (actionReads === 2) throw new Error('second-pass actions getter');
        }
        return Reflect.get(target, property, receiver);
      },
    });
    const adapter = new Adapter();
    const coordinator = new SpyCoordinator();

    const receipt = await runP14RetainedDuplicateTransaction({
      plan: hostilePlan,
      registry,
      coordinator,
      confirmation,
      transactionId: 'tx:bounds-evidence-second-pass',
      now: () => NOW,
    }, adapter);

    expect(actionReads).toBe(2);
    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.terminalState).toBe('BLOCKED');
    expect(receipt.errors[0]).toMatchObject({
      code: 'P14_INTERNAL_INVARIANT_FAILED',
      stage: 'bounds-evidence',
    });
    expect(receipt.errors[0]?.detail).toContain('second-pass actions getter');
    expect(receipt.source.nodeId).toBe('UNKNOWN');
    expect(receipt.p13RunId).toBe('UNKNOWN');
    expect(receipt.planDigest).toBe('p14-plan-invalid');
    expect(coordinator.acquireCalls).toBe(0);
    expect(adapterUntouched(adapter)).toBe(true);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('preserves the existing readable oversized-input outcome', async () => {
    const adapter = new Adapter();
    const coordinator = new SpyCoordinator();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan: preparedPlan(),
      registry,
      coordinator,
      transactionId: 't'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1),
      now: () => NOW,
    }, adapter);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]).toMatchObject({ code: 'P14_INPUT_TOO_LARGE', stage: 'bounds' });
    expect(coordinator.acquireCalls).toBe(0);
    expect(adapterUntouched(adapter)).toBe(true);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('preserves normal readable preparation behavior', async () => {
    const plan = preparedPlan();
    const adapter = new Adapter();
    const coordinator = new SpyCoordinator();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan,
      registry,
      coordinator,
      confirmation: buildP14PreparationConfirmation(plan, NOW),
      transactionId: 'tx:bounds-evidence-normal',
      preparedName: 'Prepared Bounds Evidence',
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
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });
});
