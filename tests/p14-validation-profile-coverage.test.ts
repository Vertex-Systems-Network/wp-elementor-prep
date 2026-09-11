import { describe, expect, it } from 'vitest';
import { buildP14PreparationConfirmation } from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import { createP14SafeRecipeRegistry } from '../src/core/p14-safe-recipe-registry';
import {
  assessP14ValidationProfileCoverage,
  requiredP14ValidationProfileIds,
} from '../src/core/p14-validation-profile-coverage';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import type {
  P14CandidateHandle,
  P14PreparationAction,
  P14PreparationRecipeDefinition,
  P14RecipeExecutionResult,
  P14RescoreSummary,
  P14RetainedDuplicateAdapter,
  P14ValidationSummary,
} from '../src/core/p14-preparation-types';

const NOW = '2026-09-12T00:00:00.000Z';
const SOURCE_ID = 'profiles:source';
const SOURCE_FP = 'profiles-source-fingerprint';

const parentRecipe: P14PreparationRecipeDefinition = {
  id: 'P14_PROFILE_PARENT', version: 1, sourceRuleIds: ['PROFILE_PARENT_RULE'], minConfidence: 95,
  prerequisites: [], mutationAllowlist: ['layoutMode'], validationProfileId: 'PROFILE_VALIDATE_STRUCTURE',
  conflictsWith: [], orderClass: '10-structure',
};
const childRecipe: P14PreparationRecipeDefinition = {
  id: 'P14_PROFILE_CHILD', version: 1, sourceRuleIds: ['PROFILE_CHILD_RULE'], minConfidence: 95,
  prerequisites: ['P14_PROFILE_PARENT'], mutationAllowlist: ['layoutSizing'], validationProfileId: 'PROFILE_VALIDATE_GEOMETRY',
  conflictsWith: [], orderClass: '20-sizing',
};
const registry = createP14SafeRecipeRegistry([
  { sourceRuleId: 'PROFILE_PARENT_RULE', sourceRuleVersion: 1, recipe: parentRecipe },
  { sourceRuleId: 'PROFILE_CHILD_RULE', sourceRuleVersion: 1, recipe: childRecipe },
]);

function plan() {
  return buildP14PreparationPlan({
    p13RunId: 'p13-profile-run', sourceNodeId: SOURCE_ID, sourceFingerprint: SOURCE_FP,
    findings: [
      {
        findingId: 'profile-parent', sourceRuleId: 'PROFILE_PARENT_RULE', sourceRuleVersion: 1,
        targetNodeIds: ['2:1'], confidence: 99, remediationClass: 'P14_SAFE_CANDIDATE',
        acceptedRecipeId: parentRecipe.id, acceptedRecipeVersion: parentRecipe.version,
      },
      {
        findingId: 'profile-child', sourceRuleId: 'PROFILE_CHILD_RULE', sourceRuleVersion: 1,
        targetNodeIds: ['3:1'], confidence: 99, remediationClass: 'P14_SAFE_CANDIDATE',
        acceptedRecipeId: childRecipe.id, acceptedRecipeVersion: childRecipe.version,
      },
    ],
    recipes: [childRecipe, parentRecipe],
  });
}

class Adapter implements P14RetainedDuplicateAdapter {
  calls = { fingerprint: 0, clone: 0, apply: 0, validate: 0, rescore: 0, retain: 0, discard: 0 };
  validation: P14ValidationSummary = {
    passed: true,
    profileIdsRun: ['PROFILE_VALIDATE_STRUCTURE', 'PROFILE_VALIDATE_GEOMETRY'],
    checks: [{ id: 'required', passed: true, required: true }],
  };
  async fingerprintSource(): Promise<string> { this.calls.fingerprint += 1; return SOURCE_FP; }
  async cloneSource(sourceNodeId: string): Promise<P14CandidateHandle> { this.calls.clone += 1; return { sourceNodeId, candidateNodeId: 'profiles:candidate' }; }
  async applyRecipe(_candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    this.calls.apply += 1; return { actionId: action.actionId, recipeId: action.recipeId ?? 'missing', applied: true };
  }
  async validateCandidate(): Promise<P14ValidationSummary> { this.calls.validate += 1; return this.validation; }
  async rescoreCandidate(): Promise<P14RescoreSummary> {
    this.calls.rescore += 1;
    return { runId: 'p13-profile-rescore', score: 96, status: 'READY', blockerCount: 0, highRiskCount: 0, introducedBlockerOrHighCount: 0, reviewRequired: false };
  }
  async retainCandidate(candidate: P14CandidateHandle, transactionId: string, preparedName: string) {
    this.calls.retain += 1; return { transactionId, sourceNodeId: candidate.sourceNodeId, retainedNodeId: candidate.candidateNodeId, preparedName };
  }
  async discardCandidate(): Promise<void> { this.calls.discard += 1; }
}

async function run(adapter: Adapter) {
  const value = plan();
  return runP14RetainedDuplicateTransaction({
    plan: value,
    registry,
    confirmation: buildP14PreparationConfirmation(value, NOW),
    transactionId: 'p14-profile-tx',
    preparedName: 'Prepared',
    now: () => NOW,
  }, adapter);
}

describe('P14 validation-profile coverage', () => {
  it('derives deterministic required profiles and allows explicit extras', () => {
    const value = plan();
    expect(requiredP14ValidationProfileIds(value)).toEqual(['PROFILE_VALIDATE_GEOMETRY', 'PROFILE_VALIDATE_STRUCTURE']);
    const result = assessP14ValidationProfileCoverage(value, [
      'PROFILE_VALIDATE_STRUCTURE', 'OPTIONAL_EXTRA_PROFILE', 'PROFILE_VALIDATE_GEOMETRY',
    ]);
    expect(result.valid).toBe(true);
    expect(result.observedProfileIds).toEqual(['OPTIONAL_EXTRA_PROFILE', 'PROFILE_VALIDATE_GEOMETRY', 'PROFILE_VALIDATE_STRUCTURE']);
  });

  it('fails closed when a required profile is missing or duplicated', () => {
    const value = plan();
    const missing = assessP14ValidationProfileCoverage(value, ['PROFILE_VALIDATE_STRUCTURE']);
    expect(missing.valid).toBe(false);
    expect(missing.failures.some((failure) => failure.includes('PROFILE_VALIDATE_GEOMETRY did not run'))).toBe(true);

    const duplicate = assessP14ValidationProfileCoverage(value, [
      'PROFILE_VALIDATE_STRUCTURE', 'PROFILE_VALIDATE_STRUCTURE', 'PROFILE_VALIDATE_GEOMETRY',
    ]);
    expect(duplicate.valid).toBe(false);
    expect(duplicate.failures.some((failure) => failure.includes('duplicate profile IDs'))).toBe(true);
    expect(duplicate.observedProfileIds).toEqual(['PROFILE_VALIDATE_GEOMETRY', 'PROFILE_VALIDATE_STRUCTURE']);
  });

  it('bounds oversized profile evidence without traversing its contents', () => {
    const target = new Array(DEFAULT_P14_INPUT_BOUNDS.maxActions + 1);
    const profileIdsRun = new Proxy(target, {
      get(array, property, receiver) {
        if (property !== 'length') throw new Error(`oversized profile evidence was touched: ${String(property)}`);
        return Reflect.get(array, property, receiver);
      },
    });
    expect(() => assessP14ValidationProfileCoverage(plan(), profileIdsRun)).not.toThrow();
    const result = assessP14ValidationProfileCoverage(plan(), profileIdsRun);
    expect(result.valid).toBe(false);
    expect(result.observedProfileIds).toEqual([]);
    expect(result.failures.some((failure) => failure.includes('bounded profile count'))).toBe(true);
  });

  it('rejects generic passed=true when an active recipe profile did not run, before rescore/retain', async () => {
    const adapter = new Adapter();
    adapter.validation = {
      passed: true,
      profileIdsRun: ['PROFILE_VALIDATE_STRUCTURE'],
      checks: [{ id: 'required', passed: true, required: true }],
    };
    const receipt = await run(adapter);
    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_VALIDATION_FAILED');
    expect(adapter.calls.discard).toBe(1);
    expect(adapter.calls.rescore).toBe(0);
    expect(adapter.calls.retain).toBe(0);
    expect(receipt.validation?.profileIdsRun).toEqual(['PROFILE_VALIDATE_STRUCTURE']);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('rejects duplicate adapter profile evidence but emits bounded normalized rejection evidence', async () => {
    const adapter = new Adapter();
    adapter.validation = {
      passed: true,
      profileIdsRun: ['PROFILE_VALIDATE_STRUCTURE', 'PROFILE_VALIDATE_STRUCTURE', 'PROFILE_VALIDATE_GEOMETRY'],
      checks: [{ id: 'required', passed: true, required: true }],
    };
    const receipt = await run(adapter);
    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_VALIDATION_FAILED');
    expect(adapter.calls.rescore).toBe(0);
    expect(adapter.calls.retain).toBe(0);
    expect(receipt.validation?.profileIdsRun).toEqual(['PROFILE_VALIDATE_GEOMETRY', 'PROFILE_VALIDATE_STRUCTURE']);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

  it('rejects malformed runtime validation evidence through cleanup instead of throwing', async () => {
    const adapter = new Adapter();
    (adapter as unknown as { validateCandidate: () => Promise<unknown> }).validateCandidate = async () => {
      adapter.calls.validate += 1;
      return null;
    };
    const receipt = await run(adapter);
    expect(receipt.status).toBe('REJECTED');
    expect(receipt.errors[0]?.code).toBe('P14_VALIDATION_FAILED');
    expect(receipt.errors[0]?.detail).toContain('malformed evidence');
    expect(adapter.calls.discard).toBe(1);
    expect(adapter.calls.rescore).toBe(0);
    expect(adapter.calls.retain).toBe(0);
    expect(validateP14PreparationReceipt(receipt).valid).toBe(true);
  });

});
