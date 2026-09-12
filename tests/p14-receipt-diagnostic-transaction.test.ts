import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';
import type {
  P14CandidateHandle,
  P14PreparationAction,
  P14PreparationRecipeDefinition,
  P14RecipeExecutionResult,
  P14RescoreSummary,
  P14RetainedDuplicateAdapter,
  P14ValidationSummary,
} from '../src/core/p14-preparation-types';

const SOURCE_ID = 'receipt-diagnostic:source';
const SOURCE_FP = 'receipt-diagnostic-source-fingerprint';
const NOW = '2026-09-12T00:00:00.000Z';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_RECEIPT_DIAGNOSTIC_RECIPE', version: 1,
  sourceRuleIds: ['RECEIPT_DIAGNOSTIC_RULE'], minConfidence: 95,
  prerequisites: [], mutationAllowlist: ['layoutMode'],
  validationProfileId: 'RECEIPT_DIAGNOSTIC_PROFILE', conflictsWith: [], orderClass: '10-structure',
};
const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: 'RECEIPT_DIAGNOSTIC_RULE', sourceRuleVersion: 1, recipe },
]);

function plan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-receipt-diagnostic', sourceNodeId: SOURCE_ID, sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'receipt-diagnostic-finding', sourceRuleId: 'RECEIPT_DIAGNOSTIC_RULE', sourceRuleVersion: 1,
      targetNodeIds: ['receipt-diagnostic:target'], confidence: 99, remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id, acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

type Mode = 'valid' | 'clone-huge' | 'clone-hostile' | 'apply-and-discard-huge';

class Adapter implements P14RetainedDuplicateAdapter {
  calls = { clone: 0, apply: 0, discard: 0, rescore: 0, retain: 0 };
  constructor(private readonly mode: Mode) {}

  async fingerprintSource(): Promise<string> { return SOURCE_FP; }
  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> {
    this.calls.clone += 1;
    if (this.mode === 'clone-huge') {
      throw new Error('x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1000));
    }
    if (this.mode === 'clone-hostile') {
      const hostile = new Proxy({}, {
        get(_target, property) {
          if (property === Symbol.toPrimitive || property === 'toString') throw new Error('hostile stringify');
          return undefined;
        },
      });
      throw hostile;
    }
    return { sourceNodeId, candidateNodeId: 'receipt-diagnostic:candidate' };
  }
  async applyRecipe(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    this.calls.apply += 1;
    if (this.mode === 'apply-and-discard-huge') throw new Error('apply failed');
    return { actionId: action.actionId, recipeId: action.recipeId ?? 'missing', applied: true };
  }
  async validateCandidate(): Promise<P14ValidationSummary> {
    return {
      passed: true,
      profileIdsRun: ['RECEIPT_DIAGNOSTIC_PROFILE'],
      checks: [{ id: 'required', passed: true, required: true }],
    };
  }
  async rescoreCandidate(): Promise<P14RescoreSummary> {
    this.calls.rescore += 1;
    return {
      runId: 'p13-receipt-diagnostic-rescore', score: 95, status: 'READY', blockerCount: 0,
      highRiskCount: 0, introducedBlockerOrHighCount: 0, reviewRequired: false,
    };
  }
  async retainCandidate(candidate: P14CandidateHandle, transactionId: string, preparedName: string) {
    this.calls.retain += 1;
    return { transactionId, sourceNodeId: candidate.sourceNodeId, retainedNodeId: candidate.candidateNodeId, preparedName };
  }
  async discardCandidate(): Promise<void> {
    this.calls.discard += 1;
    if (this.mode === 'apply-and-discard-huge') {
      throw new Error('z'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1000));
    }
  }
}

async function run(adapter: Adapter) {
  const current = plan();
  return runP14RetainedDuplicateTransaction({
    plan: current,
    registry,
    confirmation: buildP14PreparationConfirmation(current, NOW),
    transactionId: 'p14-receipt-diagnostic-tx',
    preparedName: 'Prepared Duplicate',
    now: () => NOW,
  }, adapter);
}

function expectBoundedDiagnostics(receipt: Awaited<ReturnType<typeof run>>) {
  for (const error of receipt.errors) {
    expect(error.stage.length).toBeLessThanOrEqual(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength);
    expect(error.detail.length).toBeLessThanOrEqual(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);
    if (error.recovery !== undefined) {
      expect(error.recovery.length).toBeLessThanOrEqual(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);
    }
  }
  for (const item of receipt.events) {
    if (item.detail !== undefined) expect(item.detail.length).toBeLessThanOrEqual(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);
  }
}

describe('P14 runtime receipt diagnostic bounds', () => {
  it('bounds a huge clone exception before receipt emission', async () => {
    const adapter = new Adapter('clone-huge');
    const hostile = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1000);
    const receipt = await run(adapter);
    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_CLONE_FAILED');
    expect(JSON.stringify(receipt)).not.toContain(hostile);
    expectBoundedDiagnostics(receipt);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('does not let hostile thrown-object stringification escape the transaction', async () => {
    const adapter = new Adapter('clone-hostile');
    await expect(run(adapter)).resolves.toMatchObject({ status: 'REJECTED' });
    const receipt = await run(new Adapter('clone-hostile'));
    expect(receipt.errors[0]?.detail).toContain('Unprintable runtime error');
    expectBoundedDiagnostics(receipt);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('bounds discard failure diagnostics while preserving CLEANUP_REQUIRED', async () => {
    const adapter = new Adapter('apply-and-discard-huge');
    const hostile = 'z'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1000);
    const receipt = await run(adapter);
    expect(receipt.status).toBe('CLEANUP_REQUIRED');
    expect(receipt.errors.some((error) => error.code === 'P14_TRANSFORM_FAILED')).toBe(true);
    expect(receipt.errors.some((error) => error.code === 'P14_DISCARD_FAILED')).toBe(true);
    expect(JSON.stringify(receipt)).not.toContain(hostile);
    expectBoundedDiagnostics(receipt);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });
});
