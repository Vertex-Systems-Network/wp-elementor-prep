import { describe, expect, it } from 'vitest';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
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

const RULE_ID = 'SYNTHETIC_COORDINATOR_RULE';
const SOURCE_ID = 'coord:source';
const SOURCE_FP = 'coord-source-fingerprint';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_SYNTHETIC_COORDINATOR_RECIPE',
  version: 1,
  sourceRuleIds: [RULE_ID],
  minConfidence: 95,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_SYNTHETIC_COORDINATOR_VALIDATE',
  conflictsWith: [],
  orderClass: '10-structure',
};

const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: RULE_ID, sourceRuleVersion: 1, recipe },
]);

function readyPlan(sourceNodeId = SOURCE_ID, sourceFingerprint = SOURCE_FP) {
  return buildP14PreparationPlan({
    p13RunId: `p13-coordinator-${sourceNodeId}`,
    sourceNodeId,
    sourceFingerprint,
    findings: [{
      findingId: `finding-${sourceNodeId}`,
      sourceRuleId: RULE_ID,
      sourceRuleVersion: 1,
      targetNodeIds: [`${sourceNodeId}:target`],
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
  failFingerprint = false;
  private holdFirst = false;
  private held = false;
  private enteredResolve: (() => void) | null = null;
  private releaseResolve: (() => void) | null = null;
  readonly entered = new Promise<void>((resolve) => { this.enteredResolve = resolve; });
  private readonly released = new Promise<void>((resolve) => { this.releaseResolve = resolve; });

  constructor(private readonly sourceFingerprint = SOURCE_FP) {}

  holdFirstFingerprint(): void {
    this.holdFirst = true;
  }

  releaseFirstFingerprint(): void {
    this.releaseResolve?.();
  }

  async fingerprintSource(): Promise<string> {
    this.calls.fingerprint += 1;
    if (this.failFingerprint) throw new Error('forced fingerprint failure');
    if (this.holdFirst && !this.held) {
      this.held = true;
      this.enteredResolve?.();
      await this.released;
    }
    return this.sourceFingerprint;
  }

  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    this.calls.clone += 1;
    return { sourceNodeId, candidateNodeId: `${sourceNodeId}:candidate` };
  }

  async applyRecipe(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    this.calls.apply += 1;
    return { actionId: action.actionId, recipeId: action.recipeId ?? 'missing', applied: true };
  }

  async validateCandidate(): Promise<P14ValidationSummary> {
    this.calls.validate += 1;
    return {
      passed: true,
      profileIdsRun: ['P14_SYNTHETIC_COORDINATOR_VALIDATE'],
      checks: [{ id: 'required', passed: true, required: true }],
    };
  }

  async rescoreCandidate(): Promise<P14RescoreSummary> {
    this.calls.rescore += 1;
    return {
      runId: 'p13-coordinator-rescore',
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

function run(
  coordinator: P14SourceTransactionCoordinator,
  transactionId: string,
  adapter: Adapter,
  sourceNodeId = SOURCE_ID,
  sourceFingerprint = SOURCE_FP,
) {
  const preparedPlan = readyPlan(sourceNodeId, sourceFingerprint);
  return runP14RetainedDuplicateTransaction({
    plan: preparedPlan,
    registry,
    confirmation: buildP14PreparationConfirmation(preparedPlan, '2026-09-12T00:00:00.000Z'),
    coordinator,
    transactionId,
    preparedName: 'Prepared',
    now: () => '2026-09-12T00:00:00.000Z',
  }, adapter);
}

describe('P14SourceTransactionCoordinator', () => {
  it('allows independent sources but rejects active source and transaction reuse', () => {
    const coordinator = new P14SourceTransactionCoordinator();
    const first = coordinator.tryAcquire('source:a', 'tx:a');
    expect(first.acquired).toBe(true);
    expect(coordinator.tryAcquire('source:a', 'tx:b')).toMatchObject({
      acquired: false,
      reason: 'SOURCE_BUSY',
      ownerTransactionId: 'tx:a',
    });
    expect(coordinator.tryAcquire('source:b', 'tx:a')).toMatchObject({
      acquired: false,
      reason: 'TRANSACTION_ID_BUSY',
      ownerSourceScope: 'source:a',
    });
    expect(coordinator.tryAcquire('source:b', 'tx:b').acquired).toBe(true);
    expect(coordinator.activeCount).toBe(2);
  });

  it('does not let a stale/non-owner lease release a current owner', () => {
    const coordinator = new P14SourceTransactionCoordinator();
    const first = coordinator.tryAcquire('source:a', 'tx:a');
    if (!first.acquired) throw new Error('first lease expected');
    expect(coordinator.release(first.lease)).toBe(true);

    const second = coordinator.tryAcquire('source:a', 'tx:b');
    if (!second.acquired) throw new Error('second lease expected');
    expect(coordinator.release(first.lease)).toBe(false);
    expect(coordinator.ownerOf('source:a')).toBe('tx:b');
    expect(coordinator.release(second.lease)).toBe(true);
    expect(coordinator.activeCount).toBe(0);
  });

  it('fails closed on invalid source or transaction identity', () => {
    const coordinator = new P14SourceTransactionCoordinator();
    expect(coordinator.tryAcquire(' ', 'tx')).toEqual({ acquired: false, reason: 'INVALID_SCOPE' });
    expect(coordinator.tryAcquire('source', ' ')).toEqual({ acquired: false, reason: 'INVALID_TRANSACTION_ID' });
    expect(coordinator.activeCount).toBe(0);
  });
});

describe('P14 transaction source-scope coordination', () => {
  it('blocks a concurrent same-source run before adapter access and releases after completion', async () => {
    const coordinator = new P14SourceTransactionCoordinator();
    const firstAdapter = new Adapter();
    firstAdapter.holdFirstFingerprint();
    const firstPromise = run(coordinator, 'tx:first', firstAdapter);
    await firstAdapter.entered;

    const secondAdapter = new Adapter();
    const second = await run(coordinator, 'tx:second', secondAdapter);
    expect(second.status).toBe('BLOCKED');
    expect(second.errors[0]?.code).toBe('P14_TRANSACTION_CONFLICT');
    expect(second.source.beforeFingerprint).toBe('UNKNOWN');
    expect(Object.values(secondAdapter.calls).every((count) => count === 0)).toBe(true);
    expect(coordinator.ownerOf(SOURCE_ID)).toBe('tx:first');

    firstAdapter.releaseFirstFingerprint();
    const first = await firstPromise;
    expect(first.status).toBe('PREPARED');
    expect(coordinator.activeCount).toBe(0);

    const retryAdapter = new Adapter();
    const retry = await run(coordinator, 'tx:retry', retryAdapter);
    expect(retry.status).toBe('PREPARED');
    expect(retryAdapter.calls.fingerprint).toBeGreaterThan(0);
    expect(coordinator.activeCount).toBe(0);
  });

  it('releases the lease through failure paths so a retry is not orphan-blocked', async () => {
    const coordinator = new P14SourceTransactionCoordinator();
    const failing = new Adapter();
    failing.failFingerprint = true;
    const failed = await run(coordinator, 'tx:failure', failing);
    expect(failed.status).toBe('BLOCKED');
    expect(failed.errors[0]?.code).not.toBe('P14_TRANSACTION_CONFLICT');
    expect(coordinator.activeCount).toBe(0);

    const retryAdapter = new Adapter();
    const retry = await run(coordinator, 'tx:after-failure', retryAdapter);
    expect(retry.status).toBe('PREPARED');
    expect(coordinator.activeCount).toBe(0);
  });
});
