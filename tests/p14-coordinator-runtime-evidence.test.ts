import { describe, expect, it } from 'vitest';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';
import {
  P14SourceTransactionCoordinator,
  assessP14TransactionLeaseResultEvidence,
  type P14TransactionLease,
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

const SOURCE_ID = 'coord-runtime:source';
const SOURCE_FP = 'coord-runtime-source-fingerprint';
const RULE_ID = 'SYNTHETIC_COORD_RUNTIME_RULE';
const NOW = '2026-09-12T00:00:00.000Z';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_COORD_RUNTIME_RECIPE',
  version: 1,
  sourceRuleIds: [RULE_ID],
  minConfidence: 95,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_SYNTHETIC_COORD_RUNTIME_VALIDATE',
  conflictsWith: [],
  orderClass: '10-structure',
};

const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: RULE_ID, sourceRuleVersion: 1, recipe },
]);

function readyPlan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-coord-runtime-test',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'coord-runtime-finding',
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: ['coord-runtime:target'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

function noOpPlan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-coord-runtime-noop',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'coord-runtime-noop-finding',
      sourceRuleId: 'SYNTHETIC_NOOP',
      sourceRuleVersion: 1,
      targetNodeIds: ['coord-runtime:noop-target'],
      confidence: 99,
      remediationClass: 'P14_SAFE_NOOP',
    }],
    recipes: [],
  });
}

class Adapter implements P14RetainedDuplicateAdapter {
  calls = { fingerprint: 0, clone: 0, apply: 0, validate: 0, rescore: 0, retain: 0, discard: 0 };
  failFingerprint = false;

  async fingerprintSource(): Promise<string> {
    this.calls.fingerprint += 1;
    if (this.failFingerprint) throw new Error('forced fingerprint failure');
    return SOURCE_FP;
  }

  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    this.calls.clone += 1;
    return { sourceNodeId, candidateNodeId: 'coord-runtime:candidate' };
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
      runId: 'p13-coord-runtime-rescore',
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

function runWith(coordinator: P14SourceTransactionCoordinator, adapter = new Adapter(), transactionId = 'tx:coord-runtime') {
  const plan = readyPlan();
  return runP14RetainedDuplicateTransaction({
    plan,
    registry,
    confirmation: buildP14PreparationConfirmation(plan, NOW),
    coordinator,
    transactionId,
    preparedName: 'Prepared',
    now: () => NOW,
  }, adapter);
}

class ThrowAcquireCoordinator extends P14SourceTransactionCoordinator {
  override tryAcquire(): P14TransactionLeaseResult {
    throw new Error('hostile acquire');
  }
}

class ProxyAcquireCoordinator extends P14SourceTransactionCoordinator {
  override tryAcquire(): P14TransactionLeaseResult {
    return new Proxy({} as P14TransactionLeaseResult, {
      get() {
        throw new Error('hostile lease getter');
      },
    });
  }
}

class MalformedAcquiredCoordinator extends P14SourceTransactionCoordinator {
  releaseCalls = 0;

  override tryAcquire(sourceScope: string, transactionId: string): P14TransactionLeaseResult {
    const acquired = super.tryAcquire(sourceScope, transactionId);
    if (!acquired.acquired) return acquired;
    return {
      acquired: true,
      lease: { sourceScope: 'wrong-source', transactionId },
    };
  }

  override release(lease: P14TransactionLease): boolean {
    this.releaseCalls += 1;
    return super.release(lease);
  }
}

class OversizedOwnerCoordinator extends P14SourceTransactionCoordinator {
  override tryAcquire(): P14TransactionLeaseResult {
    return {
      acquired: false,
      reason: 'SOURCE_BUSY',
      ownerTransactionId: 'x'.repeat(2049),
      ownerSourceScope: SOURCE_ID,
    };
  }
}

class FalseReleaseCoordinator extends P14SourceTransactionCoordinator {
  releaseCalls = 0;

  override release(): boolean {
    this.releaseCalls += 1;
    return false;
  }
}

class ThrowReleaseCoordinator extends P14SourceTransactionCoordinator {
  releaseCalls = 0;

  override release(): boolean {
    this.releaseCalls += 1;
    throw new Error('hostile release');
  }
}

class CountingCoordinator extends P14SourceTransactionCoordinator {
  acquireCalls = 0;
  releaseCalls = 0;

  override tryAcquire(sourceScope: string, transactionId: string): P14TransactionLeaseResult {
    this.acquireCalls += 1;
    return super.tryAcquire(sourceScope, transactionId);
  }

  override release(lease: P14TransactionLease): boolean {
    this.releaseCalls += 1;
    return super.release(lease);
  }
}

describe('P14 coordinator runtime evidence', () => {
  it('accepts and normalizes exact acquired/refused evidence', () => {
    expect(assessP14TransactionLeaseResultEvidence(
      { acquired: true, lease: { sourceScope: SOURCE_ID, transactionId: 'tx:a' } },
      SOURCE_ID,
      'tx:a',
    )).toMatchObject({
      valid: true,
      claimedAcquired: true,
      value: { acquired: true, lease: { sourceScope: SOURCE_ID, transactionId: 'tx:a' } },
    });

    expect(assessP14TransactionLeaseResultEvidence(
      { acquired: false, reason: 'SOURCE_BUSY', ownerTransactionId: 'tx:owner', ownerSourceScope: SOURCE_ID },
      SOURCE_ID,
      'tx:b',
    )).toMatchObject({
      valid: true,
      claimedAcquired: false,
      value: { acquired: false, reason: 'SOURCE_BUSY', ownerTransactionId: 'tx:owner', ownerSourceScope: SOURCE_ID },
    });
  });

  it('blocks throwing acquisition before any adapter access', async () => {
    const adapter = new Adapter();
    const receipt = await runWith(new ThrowAcquireCoordinator(), adapter);
    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]).toMatchObject({ code: 'P14_INTERNAL_INVARIANT_FAILED', stage: 'coordination' });
    expect(Object.values(adapter.calls).every((count) => count === 0)).toBe(true);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('blocks unreadable proxy acquisition evidence before adapter access', async () => {
    const adapter = new Adapter();
    const receipt = await runWith(new ProxyAcquireCoordinator(), adapter);
    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]?.detail).toContain('invalid acquisition evidence');
    expect(Object.values(adapter.calls).every((count) => count === 0)).toBe(true);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('attempts exact expected-lease release when malformed evidence claims acquisition', async () => {
    const coordinator = new MalformedAcquiredCoordinator();
    const adapter = new Adapter();
    const receipt = await runWith(coordinator, adapter);
    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]?.stage).toBe('coordination');
    expect(coordinator.releaseCalls).toBe(1);
    expect(coordinator.activeCount).toBe(0);
    expect(Object.values(adapter.calls).every((count) => count === 0)).toBe(true);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('rejects oversized owner identity instead of copying it into conflict evidence', async () => {
    const adapter = new Adapter();
    const receipt = await runWith(new OversizedOwnerCoordinator(), adapter);
    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.errors[0]).toMatchObject({ code: 'P14_INTERNAL_INVARIANT_FAILED', stage: 'coordination' });
    expect(receipt.errors[0]?.detail.length).toBeLessThan(2049);
    expect(Object.values(adapter.calls).every((count) => count === 0)).toBe(true);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('turns release=false after a prepared candidate into valid coordinator CLEANUP_REQUIRED evidence', async () => {
    const coordinator = new FalseReleaseCoordinator();
    const receipt = await runWith(coordinator);
    expect(receipt.status).toBe('CLEANUP_REQUIRED');
    expect(receipt.terminalState).toBe('CLEANUP_REQUIRED');
    expect(receipt.candidate).toMatchObject({ retained: true });
    expect(receipt.retention).toBeDefined();
    expect(receipt.errors.some((error) => error.stage === 'coordination-release')).toBe(true);
    expect(receipt.events.at(-1)?.state).toBe('CLEANUP_REQUIRED');
    expect(coordinator.releaseCalls).toBe(1);
    expect(coordinator.ownerOf(SOURCE_ID)).toBe('tx:coord-runtime');
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('turns a throwing release into bounded coordinator CLEANUP_REQUIRED evidence instead of rejecting the promise', async () => {
    const coordinator = new ThrowReleaseCoordinator();
    const receipt = await runWith(coordinator);
    expect(receipt.status).toBe('CLEANUP_REQUIRED');
    expect(receipt.errors.at(-1)).toMatchObject({
      code: 'P14_INTERNAL_INVARIANT_FAILED',
      stage: 'coordination-release',
    });
    expect(receipt.errors.at(-1)?.detail).toContain('hostile release');
    expect(coordinator.releaseCalls).toBe(1);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('allows coordinator cleanup evidence without a candidate when execution failed before clone', async () => {
    const coordinator = new FalseReleaseCoordinator();
    const adapter = new Adapter();
    adapter.failFingerprint = true;
    const receipt = await runWith(coordinator, adapter, 'tx:preclone-release-failure');
    expect(receipt.status).toBe('CLEANUP_REQUIRED');
    expect(receipt.candidate).toBeUndefined();
    expect(receipt.errors.some((error) => error.stage === 'coordination-release')).toBe(true);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('preserves default coordinator success and releases the lease exactly once', async () => {
    const coordinator = new CountingCoordinator();
    const receipt = await runWith(coordinator);
    expect(receipt.status).toBe('PREPARED');
    expect(coordinator.acquireCalls).toBe(1);
    expect(coordinator.releaseCalls).toBe(1);
    expect(coordinator.activeCount).toBe(0);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('does not acquire or release a lease for a NO_CHANGES_NEEDED plan', async () => {
    const coordinator = new CountingCoordinator();
    const adapter = new Adapter();
    const receipt = await runP14RetainedDuplicateTransaction({
      plan: noOpPlan(),
      coordinator,
      transactionId: 'tx:noop',
      now: () => NOW,
    }, adapter);
    expect(receipt.status).toBe('NO_CHANGES_NEEDED');
    expect(coordinator.acquireCalls).toBe(0);
    expect(coordinator.releaseCalls).toBe(0);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });
});
