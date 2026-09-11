import { describe, expect, it } from 'vitest';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import type {
  P14CandidateHandle,
  P14PreparationAction,
  P14PreparationPlanV1,
  P14PreparationRecipeDefinition,
  P14RecipeExecutionResult,
  P14RetainedDuplicateAdapter,
  P14ValidationSummary,
  P14RescoreSummary,
} from '../src/core/p14-preparation-types';

const SOURCE_ID = '1:1';
const SOURCE_FP = 'source-fingerprint-v1';

const rowRecipe: P14PreparationRecipeDefinition = {
  id: 'P14_ROW_NORMALIZE',
  version: 1,
  sourceRuleIds: ['BR_ROW_MANUAL_FLOW'],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode', 'itemSpacing', 'padding'],
  validationProfileId: 'P14_STRUCTURAL_PRESERVATION_V1',
  conflictsWith: [],
  orderClass: '10-container-structure',
};

const textRecipe: P14PreparationRecipeDefinition = {
  id: 'P14_TEXT_AUTO_HEIGHT',
  version: 1,
  sourceRuleIds: ['BR_TEXT_FIXED_HEIGHT'],
  minConfidence: 95,
  prerequisites: ['P14_ROW_NORMALIZE'],
  mutationAllowlist: ['textAutoResize'],
  validationProfileId: 'P14_TEXT_GEOMETRY_V1',
  conflictsWith: [],
  orderClass: '20-child-sizing',
};

const testRegistry = createP14SafeRecipeRegistry([
  { sourceRuleId: 'BR_ROW_MANUAL_FLOW', sourceRuleVersion: 1, recipe: rowRecipe },
  { sourceRuleId: 'BR_TEXT_FIXED_HEIGHT', sourceRuleVersion: 1, recipe: textRecipe },
]);

function readyPlan(findingsOrder: 'normal' | 'reverse' = 'normal'): P14PreparationPlanV1 {
  const findings = [
    {
      findingId: 'finding-row',
      sourceRuleId: 'BR_ROW_MANUAL_FLOW',
      sourceRuleVersion: 1,
      targetNodeIds: ['2:2', '2:1'],
      confidence: 98,
      remediationClass: 'P14_SAFE_CANDIDATE' as const,
      acceptedRecipeId: rowRecipe.id,
      acceptedRecipeVersion: rowRecipe.version,
    },
    {
      findingId: 'finding-text',
      sourceRuleId: 'BR_TEXT_FIXED_HEIGHT',
      sourceRuleVersion: 1,
      targetNodeIds: ['3:1'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE' as const,
      acceptedRecipeId: textRecipe.id,
      acceptedRecipeVersion: textRecipe.version,
    },
  ];
  return buildP14PreparationPlan({
    p13RunId: 'p13-test-run',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: findingsOrder === 'reverse' ? [...findings].reverse() : findings,
    recipes: [textRecipe, rowRecipe],
  });
}

function noopPlan(): P14PreparationPlanV1 {
  return buildP14PreparationPlan({
    p13RunId: 'p13-noop-run',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'noop-row',
      sourceRuleId: 'BR_ROW_MANUAL_FLOW',
      sourceRuleVersion: 1,
      targetNodeIds: ['2:1'],
      confidence: 100,
      remediationClass: 'P14_SAFE_NOOP',
    }],
    recipes: [rowRecipe],
  });
}

class MemoryAdapter implements P14RetainedDuplicateAdapter {
  fingerprints: string[] = [SOURCE_FP, SOURCE_FP, SOURCE_FP];
  cloneCalls = 0;
  applyCalls: Array<{ candidate: P14CandidateHandle; action: P14PreparationAction }> = [];
  discarded: string[] = [];
  retained: string[] = [];
  transformFailureActionId: string | null = null;
  validation: P14ValidationSummary = {
    passed: true,
    checks: [
      { id: 'structure', passed: true, required: true },
      { id: 'content', passed: true, required: true },
      { id: 'geometry', passed: true, required: true },
    ],
  };
  rescore: P14RescoreSummary = {
    runId: 'p13-candidate-run',
    score: 92,
    status: 'REVIEW',
    blockerCount: 0,
    highRiskCount: 0,
    introducedBlockerOrHighCount: 0,
    reviewRequired: false,
  };
  failDiscard = false;
  failRetain = false;

  async fingerprintSource(): Promise<string> {
    return this.fingerprints.length > 1 ? (this.fingerprints.shift() ?? SOURCE_FP) : (this.fingerprints[0] ?? SOURCE_FP);
  }

  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    this.cloneCalls += 1;
    return { sourceNodeId, candidateNodeId: 'candidate:1' };
  }

  async applyRecipe(candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    this.applyCalls.push({ candidate: { ...candidate }, action });
    if (action.actionId === this.transformFailureActionId) throw new Error('forced transform failure');
    return {
      actionId: action.actionId,
      recipeId: action.recipeId ?? 'missing-recipe',
      applied: true,
    };
  }

  async validateCandidate(): Promise<P14ValidationSummary> {
    return this.validation;
  }

  async rescoreCandidate(): Promise<P14RescoreSummary> {
    return this.rescore;
  }

  async retainCandidate(candidate: P14CandidateHandle, transactionId: string, preparedName: string) {
    if (this.failRetain) throw new Error('forced retain failure');
    this.retained.push(candidate.candidateNodeId);
    return {
      transactionId,
      sourceNodeId: candidate.sourceNodeId,
      retainedNodeId: candidate.candidateNodeId,
      preparedName,
    };
  }

  async discardCandidate(candidate: P14CandidateHandle): Promise<void> {
    if (this.failDiscard) throw new Error('forced discard failure');
    this.discarded.push(candidate.candidateNodeId);
  }
}

const fixedNow = () => '2026-09-12T00:00:00.000Z';

function run(plan: P14PreparationPlanV1, adapter: MemoryAdapter, overrides: Record<string, unknown> = {}) {
  return runP14RetainedDuplicateTransaction({
    plan,
    registry: testRegistry,
    transactionId: 'p14-tx-test',
    preparedName: 'Desktop — Prepared',
    now: fixedNow,
    ...overrides,
  }, adapter);
}

describe('P14 deterministic preparation planning', () => {
  it('produces a stable topological-friendly plan and digest independent of input order', () => {
    const normal = readyPlan('normal');
    const reverse = readyPlan('reverse');

    expect(normal.status).toBe('READY');
    expect(normal.blockers).toEqual([]);
    expect(normal.actions.map((action) => action.recipeId)).toEqual([
      'P14_ROW_NORMALIZE',
      'P14_TEXT_AUTO_HEIGHT',
    ]);
    expect(normal.actions[0]?.targetNodeIds).toEqual(['2:1', '2:2']);
    expect(normal.planDigest).toBe(reverse.planDigest);
    expect(normal.eligibleActionIds).toHaveLength(2);
  });

  it('fails closed on recipe version mismatch, missing prerequisites and recipe conflicts', () => {
    const versionMismatch = buildP14PreparationPlan({
      p13RunId: 'p13-version',
      sourceNodeId: SOURCE_ID,
      sourceFingerprint: SOURCE_FP,
      findings: [{
        findingId: 'bad-version',
        sourceRuleId: 'BR_ROW_MANUAL_FLOW',
        sourceRuleVersion: 1,
        targetNodeIds: ['2:1'],
        confidence: 99,
        remediationClass: 'P14_SAFE_CANDIDATE',
        acceptedRecipeId: rowRecipe.id,
        acceptedRecipeVersion: 999,
      }],
      recipes: [rowRecipe],
    });
    expect(versionMismatch.status).toBe('BLOCKED');
    expect(versionMismatch.actions[0]?.decision).toBe('REFUSED');
    expect(versionMismatch.actions[0]?.refusalCode).toBe('P14_RECIPE_VERSION_MISMATCH');

    const missingPrerequisite = buildP14PreparationPlan({
      p13RunId: 'p13-prereq',
      sourceNodeId: SOURCE_ID,
      sourceFingerprint: SOURCE_FP,
      findings: [{
        findingId: 'text-only',
        sourceRuleId: 'BR_TEXT_FIXED_HEIGHT',
        sourceRuleVersion: 1,
        targetNodeIds: ['3:1'],
        confidence: 99,
        remediationClass: 'P14_SAFE_CANDIDATE',
        acceptedRecipeId: textRecipe.id,
        acceptedRecipeVersion: 1,
      }],
      recipes: [textRecipe, rowRecipe],
    });
    expect(missingPrerequisite.status).toBe('BLOCKED');
    expect(missingPrerequisite.blockers.some((item) => item.code === 'P14_RECIPE_PREREQUISITE_MISSING')).toBe(true);

    const conflictRecipe: P14PreparationRecipeDefinition = {
      ...textRecipe,
      id: 'P14_CONFLICTING_TEXT',
      prerequisites: [],
      conflictsWith: [rowRecipe.id],
    };
    const conflict = buildP14PreparationPlan({
      p13RunId: 'p13-conflict',
      sourceNodeId: SOURCE_ID,
      sourceFingerprint: SOURCE_FP,
      findings: [
        {
          findingId: 'row', sourceRuleId: 'BR_ROW_MANUAL_FLOW', sourceRuleVersion: 1,
          targetNodeIds: ['2:1'], confidence: 99, remediationClass: 'P14_SAFE_CANDIDATE',
          acceptedRecipeId: rowRecipe.id, acceptedRecipeVersion: 1,
        },
        {
          findingId: 'text', sourceRuleId: 'BR_TEXT_FIXED_HEIGHT', sourceRuleVersion: 1,
          targetNodeIds: ['3:1'], confidence: 99, remediationClass: 'P14_SAFE_CANDIDATE',
          acceptedRecipeId: conflictRecipe.id, acceptedRecipeVersion: 1,
        },
      ],
      recipes: [rowRecipe, conflictRecipe],
    });
    expect(conflict.status).toBe('BLOCKED');
    expect(conflict.blockers.some((item) => item.code === 'P14_RECIPE_CONFLICT')).toBe(true);
  });

  it('classifies only explicit no-op evidence as NO_CHANGES_NEEDED', () => {
    const plan = noopPlan();
    expect(plan.status).toBe('NO_CHANGES_NEEDED');
    expect(plan.noOpActionIds).toHaveLength(1);
    expect(plan.eligibleActionIds).toEqual([]);
  });
});

describe('P14 retained duplicate transaction', () => {
  it('retains a validated duplicate while keeping recipe mutation candidate-only', async () => {
    const adapter = new MemoryAdapter();
    const result = await run(readyPlan(), adapter);

    expect(result.status).toBe('PREPARED');
    expect(result.terminalState).toBe('COMPLETE');
    expect(result.source.beforeFingerprint).toBe(SOURCE_FP);
    expect(result.source.afterFingerprint).toBe(SOURCE_FP);
    expect(result.candidate).toEqual({ nodeId: 'candidate:1', retained: true });
    expect(result.retention?.retainedNodeId).toBe('candidate:1');
    expect(adapter.applyCalls).toHaveLength(2);
    expect(adapter.applyCalls.every((call) => call.candidate.candidateNodeId === 'candidate:1')).toBe(true);
    expect(adapter.applyCalls.every((call) => call.candidate.sourceNodeId === SOURCE_ID)).toBe(true);
    expect(adapter.discarded).toEqual([]);
  });

  it('completes a no-op plan without cloning or mutating a candidate', async () => {
    const adapter = new MemoryAdapter();
    const result = await run(noopPlan(), adapter);

    expect(result.status).toBe('NO_CHANGES_NEEDED');
    expect(result.terminalState).toBe('COMPLETE');
    expect(adapter.cloneCalls).toBe(0);
    expect(adapter.applyCalls).toEqual([]);
    expect(adapter.retained).toEqual([]);
  });

  it('blocks before clone when the P13-bound source fingerprint is stale', async () => {
    const adapter = new MemoryAdapter();
    adapter.fingerprints = ['changed-source'];
    const result = await run(readyPlan(), adapter);

    expect(result.status).toBe('BLOCKED');
    expect(result.terminalState).toBe('SOURCE_STALE');
    expect(result.errors[0]?.code).toBe('P14_P13_REPORT_STALE');
    expect(adapter.cloneCalls).toBe(0);
  });

  it('rejects and discards on transform or mandatory validation failure', async () => {
    const transformAdapter = new MemoryAdapter();
    transformAdapter.transformFailureActionId = readyPlan().eligibleActionIds[0] ?? null;
    const transform = await run(readyPlan(), transformAdapter);
    expect(transform.status).toBe('REJECTED');
    expect(transform.errors[0]?.code).toBe('P14_TRANSFORM_FAILED');
    expect(transform.source.afterFingerprint).toBe('UNKNOWN');
    expect(transformAdapter.discarded).toEqual(['candidate:1']);

    const validationAdapter = new MemoryAdapter();
    validationAdapter.validation = {
      passed: false,
      checks: [{ id: 'content', passed: false, required: true, detail: 'text changed' }],
    };
    const validation = await run(readyPlan(), validationAdapter);
    expect(validation.status).toBe('REJECTED');
    expect(validation.errors[0]?.code).toBe('P14_VALIDATION_FAILED');
    expect(validationAdapter.discarded).toEqual(['candidate:1']);
  });

  it('rejects a candidate when re-score introduces a HIGH/BLOCKER', async () => {
    const adapter = new MemoryAdapter();
    adapter.rescore = { ...adapter.rescore, introducedBlockerOrHighCount: 1, highRiskCount: 1 };
    const result = await run(readyPlan(), adapter);

    expect(result.status).toBe('REJECTED');
    expect(result.errors[0]?.code).toBe('P14_VALIDATION_FAILED');
    expect(adapter.discarded).toEqual(['candidate:1']);
    expect(adapter.retained).toEqual([]);
  });

  it('requires explicit policy before retaining a PREPARED_WITH_REVIEW candidate', async () => {
    const blockedAdapter = new MemoryAdapter();
    blockedAdapter.rescore = { ...blockedAdapter.rescore, reviewRequired: true };
    const blocked = await run(readyPlan(), blockedAdapter);
    expect(blocked.status).toBe('REJECTED');
    expect(blockedAdapter.retained).toEqual([]);

    const allowedAdapter = new MemoryAdapter();
    allowedAdapter.rescore = { ...allowedAdapter.rescore, reviewRequired: true };
    const allowed = await run(readyPlan(), allowedAdapter, { allowPreparedWithReview: true });
    expect(allowed.status).toBe('PREPARED_WITH_REVIEW');
    expect(allowed.candidate?.retained).toBe(true);
  });

  it('cancels cooperatively between recipes and discards the candidate', async () => {
    const adapter = new MemoryAdapter();
    let checks = 0;
    const result = await run(readyPlan(), adapter, {
      shouldCancel: () => {
        checks += 1;
        return checks === 3;
      },
    });

    expect(result.status).toBe('CANCELLED');
    expect(result.errors[0]?.code).toBe('P14_CANCELLED');
    expect(adapter.applyCalls).toHaveLength(1);
    expect(adapter.discarded).toEqual(['candidate:1']);
  });

  it('rejects source drift before or after retain instead of claiming the original is unchanged', async () => {
    const beforeRetain = new MemoryAdapter();
    beforeRetain.fingerprints = [SOURCE_FP, 'source-drifted'];
    const pre = await run(readyPlan(), beforeRetain);
    expect(pre.status).toBe('REJECTED');
    expect(pre.terminalState).toBe('SOURCE_STALE');
    expect(pre.errors[0]?.code).toBe('P14_SOURCE_CHANGED_DURING_RUN');
    expect(beforeRetain.retained).toEqual([]);
    expect(beforeRetain.discarded).toEqual(['candidate:1']);

    const afterRetain = new MemoryAdapter();
    afterRetain.fingerprints = [SOURCE_FP, SOURCE_FP, 'source-drifted-after-retain'];
    const post = await run(readyPlan(), afterRetain);
    expect(post.status).toBe('REJECTED');
    expect(post.terminalState).toBe('SOURCE_STALE');
    expect(post.retention?.retainedNodeId).toBe('candidate:1');
    expect(afterRetain.discarded).toEqual(['candidate:1']);
  });

  it('turns cleanup failure into CLEANUP_REQUIRED with candidate identity', async () => {
    const adapter = new MemoryAdapter();
    adapter.transformFailureActionId = readyPlan().eligibleActionIds[0] ?? null;
    adapter.failDiscard = true;
    const result = await run(readyPlan(), adapter);

    expect(result.status).toBe('CLEANUP_REQUIRED');
    expect(result.terminalState).toBe('CLEANUP_REQUIRED');
    expect(result.candidate).toEqual({ nodeId: 'candidate:1', retained: false });
    expect(result.errors.map((error) => error.code)).toEqual(['P14_TRANSFORM_FAILED', 'P14_DISCARD_FAILED']);
    expect(result.errors[1]?.recovery).toContain('candidate:1');
  });

  it('discards when duplicate retention/finalization fails', async () => {
    const adapter = new MemoryAdapter();
    adapter.failRetain = true;
    const result = await run(readyPlan(), adapter);

    expect(result.status).toBe('REJECTED');
    expect(result.errors[0]?.code).toBe('P14_FINALIZE_FAILED');
    expect(adapter.discarded).toEqual(['candidate:1']);
  });
});
