import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import {
  validateP14CandidateHandleEvidence,
  validateP14RecipeExecutionResultEvidence,
  validateP14RetentionEvidence,
} from '../src/core/p14-adapter-evidence';
import type { P14PreparationAction } from '../src/core/p14-preparation-types';

const action: P14PreparationAction = {
  actionId: 'action-1',
  findingId: 'finding-1',
  decision: 'ELIGIBLE',
  sourceRuleId: 'RULE_ONE',
  sourceRuleVersion: 1,
  targetNodeIds: ['node-1'],
  confidence: 100,
  recipeId: 'recipe-one',
  recipeVersion: 1,
  orderClass: '10-structure',
  prerequisiteRecipeIds: [],
  conflictsWithRecipeIds: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'profile-one',
  refusalCode: null,
};

describe('P14 adapter evidence validators', () => {
  it('accepts an exact bounded candidate handle', () => {
    const result = validateP14CandidateHandleEvidence({
      sourceNodeId: 'source:1',
      candidateNodeId: 'candidate:1',
    }, 'source:1');
    expect(result.valid).toBe(true);
    expect(result.value).toEqual({ sourceNodeId: 'source:1', candidateNodeId: 'candidate:1' });
  });

  it.each([null, [], 'invalid'])('rejects non-object candidate evidence %#', (value) => {
    expect(validateP14CandidateHandleEvidence(value, 'source:1').valid).toBe(false);
  });

  it('rejects oversized, mismatched or source-equal candidate IDs', () => {
    const huge = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    for (const value of [
      { sourceNodeId: huge, candidateNodeId: 'candidate:1' },
      { sourceNodeId: 'other-source', candidateNodeId: 'candidate:1' },
      { sourceNodeId: 'source:1', candidateNodeId: huge },
      { sourceNodeId: 'source:1', candidateNodeId: 'source:1' },
    ]) {
      expect(validateP14CandidateHandleEvidence(value, 'source:1').valid).toBe(false);
    }
  });

  it('accepts exact applied and idempotent no-op recipe results', () => {
    expect(validateP14RecipeExecutionResultEvidence({
      actionId: action.actionId,
      recipeId: action.recipeId,
      applied: true,
    }, action).valid).toBe(true);
    expect(validateP14RecipeExecutionResultEvidence({
      actionId: action.actionId,
      recipeId: action.recipeId,
      applied: false,
      becameNoOp: true,
      detail: 'already satisfied',
    }, action).valid).toBe(true);
  });

  it('rejects malformed, mismatched, dual-outcome and oversized recipe results', () => {
    const huge = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    const hugeDetail = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1);
    const values = [
      null,
      { actionId: 'stale', recipeId: action.recipeId, applied: true },
      { actionId: action.actionId, recipeId: 'stale', applied: true },
      { actionId: huge, recipeId: action.recipeId, applied: true },
      { actionId: action.actionId, recipeId: action.recipeId, applied: true, becameNoOp: true },
      { actionId: action.actionId, recipeId: action.recipeId, applied: false },
      { actionId: action.actionId, recipeId: action.recipeId, applied: true, detail: hugeDetail },
    ];
    for (const value of values) {
      expect(validateP14RecipeExecutionResultEvidence(value, action).valid).toBe(false);
    }
  });

  it('accepts exact bounded retention evidence', () => {
    const expected = {
      transactionId: 'tx-1',
      sourceNodeId: 'source:1',
      retainedNodeId: 'candidate:1',
      preparedName: 'Prepared Duplicate',
    };
    const result = validateP14RetentionEvidence({ ...expected }, expected);
    expect(result.valid).toBe(true);
    expect(result.value).toEqual(expected);
  });

  it('rejects malformed, oversized or identity-mismatched retention evidence', () => {
    const expected = {
      transactionId: 'tx-1',
      sourceNodeId: 'source:1',
      retainedNodeId: 'candidate:1',
      preparedName: 'Prepared Duplicate',
    };
    const huge = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    for (const value of [
      null,
      { ...expected, transactionId: 'other' },
      { ...expected, sourceNodeId: 'other-source' },
      { ...expected, retainedNodeId: 'other-candidate' },
      { ...expected, preparedName: 'Other name' },
      { ...expected, retainedNodeId: huge },
    ]) {
      expect(validateP14RetentionEvidence(value, expected).valid).toBe(false);
    }
  });
});
