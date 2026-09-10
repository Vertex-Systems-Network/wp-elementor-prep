import { describe, expect, it } from 'vitest';
import { linearDirectionForSafeRecipe } from '../src/plugin/safe-recipe-transform';
import type { SafeRecipePlan } from '../src/core/safe-recipe-types';

function plan(overrides: Partial<SafeRecipePlan> = {}): SafeRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'ELIGIBLE',
    recipe: 'social-link-strip',
    reasonCode: 'SUPPORTED_HIGH_CONFIDENCE',
    reason: 'fixture',
    confidence: 99,
    minConfidence: 95,
    pattern: 'horizontal-row',
    semanticHint: 'social-link-strip',
    targetNodeId: 'target',
    targetNodeName: 'Social Connect',
    targetPath: [],
    evidence: {},
    ...overrides,
  };
}

describe('P5 semantic recipe transform contracts', () => {
  it('maps social-link-strip only from matching horizontal-row semantics', () => {
    expect(linearDirectionForSafeRecipe(plan())).toBe('HORIZONTAL');
    expect(linearDirectionForSafeRecipe(plan({ pattern: 'vertical-stack' }))).toBeNull();
    expect(linearDirectionForSafeRecipe(plan({ semanticHint: 'footer-columns' }))).toBeNull();
  });

  it('keeps metric-grid out of the linear transformer', () => {
    expect(linearDirectionForSafeRecipe(plan({
      recipe: 'metric-grid',
      pattern: 'grid',
      semanticHint: 'metric-grid',
    }))).toBeNull();
  });
});
