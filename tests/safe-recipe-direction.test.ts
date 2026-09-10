import { describe, expect, it } from 'vitest';
import { linearDirectionForSafeRecipe } from '../src/plugin/safe-recipe-transform';
import type { SafeRecipePlan } from '../src/core/safe-recipe-types';

function plan(overrides: Partial<SafeRecipePlan> = {}): SafeRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'ELIGIBLE',
    recipe: 'vertical-stack',
    reasonCode: 'SUPPORTED_HIGH_CONFIDENCE',
    reason: 'fixture',
    confidence: 99,
    minConfidence: 90,
    pattern: 'vertical-stack',
    targetNodeId: 'target',
    targetNodeName: 'Target',
    targetPath: [],
    evidence: {},
    ...overrides,
  };
}

describe('linearDirectionForSafeRecipe', () => {
  it('maps the three base linear recipes to their expected Auto Layout direction', () => {
    expect(linearDirectionForSafeRecipe(plan())).toBe('VERTICAL');
    expect(linearDirectionForSafeRecipe(plan({ recipe: 'horizontal-row', pattern: 'horizontal-row' }))).toBe('HORIZONTAL');
    expect(linearDirectionForSafeRecipe(plan({ recipe: 'two-column', pattern: 'two-column' }))).toBe('HORIZONTAL');
  });

  it('enables facts-list only for facts-list semantics on an underlying vertical stack', () => {
    expect(linearDirectionForSafeRecipe(plan({
      recipe: 'facts-list',
      pattern: 'vertical-stack',
      semanticHint: 'facts-list',
      minConfidence: 92,
    }))).toBe('VERTICAL');

    expect(linearDirectionForSafeRecipe(plan({
      recipe: 'facts-list',
      pattern: 'horizontal-row',
      semanticHint: 'facts-list',
    }))).toBeNull();

    expect(linearDirectionForSafeRecipe(plan({
      recipe: 'facts-list',
      pattern: 'vertical-stack',
    }))).toBeNull();
  });

  it('enables footer-columns only for footer semantics on an underlying horizontal row', () => {
    expect(linearDirectionForSafeRecipe(plan({
      recipe: 'footer-columns',
      pattern: 'horizontal-row',
      semanticHint: 'footer-columns',
      minConfidence: 92,
    }))).toBe('HORIZONTAL');

    expect(linearDirectionForSafeRecipe(plan({
      recipe: 'footer-columns',
      pattern: 'two-column',
      semanticHint: 'footer-columns',
    }))).toBeNull();
  });

  it('keeps non-linear recipes out of the linear transformer', () => {
    expect(linearDirectionForSafeRecipe(plan({
      recipe: 'simple-card-grid',
      pattern: 'grid',
      semanticHint: 'repeated-cards',
    }))).toBeNull();
  });
});
