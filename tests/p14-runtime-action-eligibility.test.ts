import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { validateP14RuntimeActionEligibilityEvidence } from '../src/core/p14-runtime-action-eligibility';
import type { P14PreparationAction } from '../src/core/p14-preparation-types';

function action(overrides: Partial<P14PreparationAction> = {}): P14PreparationAction {
  return {
    actionId: 'action-2',
    findingId: 'finding-2',
    decision: 'ELIGIBLE',
    sourceRuleId: 'RULE_TWO',
    sourceRuleVersion: 1,
    targetNodeIds: ['node-2'],
    confidence: 100,
    recipeId: 'recipe-two',
    recipeVersion: 1,
    orderClass: '20-child',
    prerequisiteRecipeIds: ['recipe-one'],
    conflictsWithRecipeIds: [],
    mutationAllowlist: ['layoutSizing'],
    validationProfileId: 'profile-two',
    refusalCode: null,
    ...overrides,
  };
}

describe('P14 runtime action eligibility evidence', () => {
  it('accepts exact bounded evidence and canonicalizes prerequisite IDs', () => {
    const planned = action({ prerequisiteRecipeIds: ['recipe-z', 'recipe-a'] });
    const result = validateP14RuntimeActionEligibilityEvidence({
      actionId: planned.actionId,
      recipeId: planned.recipeId,
      checkedPrerequisiteRecipeIds: ['recipe-z', 'recipe-a'],
      eligible: true,
      detail: 'candidate still satisfies the planned recipe assumptions',
    }, planned);

    expect(result.valid).toBe(true);
    expect(result.value?.checkedPrerequisiteRecipeIds).toEqual(['recipe-a', 'recipe-z']);
    expect(result.value?.eligible).toBe(true);
  });

  it.each([
    null,
    [],
    'invalid',
  ])('rejects non-object evidence %#', (value) => {
    expect(validateP14RuntimeActionEligibilityEvidence(value, action()).valid).toBe(false);
  });

  it('rejects mismatched action or recipe identity', () => {
    expect(validateP14RuntimeActionEligibilityEvidence({
      actionId: 'stale-action',
      recipeId: 'recipe-two',
      checkedPrerequisiteRecipeIds: ['recipe-one'],
      eligible: true,
    }, action()).valid).toBe(false);

    expect(validateP14RuntimeActionEligibilityEvidence({
      actionId: 'action-2',
      recipeId: 'stale-recipe',
      checkedPrerequisiteRecipeIds: ['recipe-one'],
      eligible: true,
    }, action()).valid).toBe(false);
  });

  it('rejects missing, extra and duplicate prerequisite evidence', () => {
    for (const checkedPrerequisiteRecipeIds of [
      [],
      ['recipe-one', 'extra-recipe'],
      ['recipe-one', 'recipe-one'],
    ]) {
      const result = validateP14RuntimeActionEligibilityEvidence({
        actionId: 'action-2',
        recipeId: 'recipe-two',
        checkedPrerequisiteRecipeIds,
        eligible: true,
      }, action());
      expect(result.valid).toBe(false);
    }
  });

  it('rejects oversized prerequisite arrays without accepting them as exact evidence', () => {
    const oversized = Array.from(
      { length: DEFAULT_P14_INPUT_BOUNDS.maxPrerequisitesPerAction + 1 },
      (_, index) => `recipe-${index}`,
    );
    const result = validateP14RuntimeActionEligibilityEvidence({
      actionId: 'action-2',
      recipeId: 'recipe-two',
      checkedPrerequisiteRecipeIds: oversized,
      eligible: true,
    }, action({ prerequisiteRecipeIds: oversized.slice(0, DEFAULT_P14_INPUT_BOUNDS.maxPrerequisitesPerAction) }));

    expect(result.valid).toBe(false);
    expect(result.failures.some((failure) => failure.includes('bounded prerequisite count'))).toBe(true);
  });

  it('rejects oversized identities and detail', () => {
    const huge = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    const hugeDetail = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1);

    expect(validateP14RuntimeActionEligibilityEvidence({
      actionId: huge,
      recipeId: 'recipe-two',
      checkedPrerequisiteRecipeIds: ['recipe-one'],
      eligible: true,
    }, action()).valid).toBe(false);

    expect(validateP14RuntimeActionEligibilityEvidence({
      actionId: 'action-2',
      recipeId: 'recipe-two',
      checkedPrerequisiteRecipeIds: ['recipe-one'],
      eligible: true,
      detail: hugeDetail,
    }, action()).valid).toBe(false);
  });

  it('accepts explicit ineligible evidence when identity and prerequisite coverage are exact', () => {
    const result = validateP14RuntimeActionEligibilityEvidence({
      actionId: 'action-2',
      recipeId: 'recipe-two',
      checkedPrerequisiteRecipeIds: ['recipe-one'],
      eligible: false,
      detail: 'candidate state changed after the prior recipe',
    }, action());

    expect(result.valid).toBe(true);
    expect(result.value?.eligible).toBe(false);
  });
});
