import { describe, expect, it } from 'vitest';
import { planSafeRecipe } from '../src/core/safe-recipe-planner';
import type { AuditNode, PatternDetection, RoleDetection } from '../src/core/types';

function node(id: string, overrides: Partial<AuditNode> = {}): AuditNode {
  return {
    id,
    name: id,
    type: 'FRAME',
    geometry: { x: 0, y: 0, width: 400, height: 300 },
    layoutMode: 'NONE',
    isAutoLayout: false,
    isContainer: true,
    isText: false,
    isImageLike: false,
    isGenericName: false,
    textLength: 0,
    textAutoResize: null,
    absolutePositioned: false,
    clipsContent: false,
    opacity: 1,
    visible: true,
    childIds: [],
    children: [],
    ...overrides,
  };
}

function withChildren(parent: AuditNode, children: AuditNode[]): AuditNode {
  return { ...parent, childIds: children.map((child) => child.id), children };
}

function detection(overrides: Partial<PatternDetection> = {}): PatternDetection {
  return {
    pattern: 'vertical-stack',
    confidence: 96,
    targetNodeId: 'target',
    targetNodeName: 'Target',
    evidence: { itemCount: 3, overlapPairs: 0 },
    ...overrides,
  };
}

function sectionWithTarget(targetOverrides: Partial<AuditNode> = {}): AuditNode {
  const target = withChildren(node('target', targetOverrides), [node('a'), node('b'), node('c')]);
  const wrapper = withChildren(node('wrapper'), [node('other'), target]);
  return withChildren(node('section'), [wrapper]);
}

describe('planSafeRecipe', () => {
  it('allows a high-confidence vertical stack and records a clone-stable child-index path', () => {
    const plan = planSafeRecipe(sectionWithTarget(), detection());
    expect(plan.decision).toBe('ELIGIBLE');
    expect(plan.recipe).toBe('vertical-stack');
    expect(plan.targetPath).toEqual([0, 1]);
    expect(plan.minConfidence).toBe(90);
  });

  it('defaults to REVIEW below the recipe confidence gate', () => {
    const plan = planSafeRecipe(sectionWithTarget(), detection({ confidence: 89 }));
    expect(plan.decision).toBe('REVIEW');
    expect(plan.reasonCode).toBe('BELOW_CONFIDENCE_GATE');
    expect(plan.recipe).toBe('vertical-stack');
  });

  it('returns NOOP when the target already has the matching Auto Layout direction', () => {
    const section = sectionWithTarget({ isAutoLayout: true, layoutMode: 'VERTICAL' });
    const plan = planSafeRecipe(section, detection());
    expect(plan.decision).toBe('NOOP');
    expect(plan.reasonCode).toBe('TARGET_ALREADY_STRUCTURED');
  });

  it('blocks targets containing visible absolute-positioned direct children', () => {
    const absolute = node('abs', { absolutePositioned: true });
    const target = withChildren(node('target'), [node('a'), absolute]);
    const section = withChildren(node('section'), [target]);
    const plan = planSafeRecipe(section, detection());
    expect(plan.decision).toBe('REVIEW');
    expect(plan.reasonCode).toBe('ABSOLUTE_CHILD_PRESENT');
  });

  it('blocks a target associated with a preservation role', () => {
    const role: RoleDetection = {
      role: 'decorative-overlay',
      confidence: 95,
      targetNodeId: 'decor',
      targetNodeName: 'Decor',
      parentNodeId: 'target',
      evidence: {},
    };
    const plan = planSafeRecipe(sectionWithTarget(), detection(), [role]);
    expect(plan.decision).toBe('REVIEW');
    expect(plan.reasonCode).toBe('SPECIAL_VISUAL_ROLE_PRESENT');
  });

  it('permits only non-fragmented repeated-card grids in the first grid recipe', () => {
    const cardGrid = detection({
      pattern: 'grid',
      semanticHint: 'repeated-cards',
      confidence: 96,
      evidence: { itemCount: 6, fragmentedCellCandidate: false },
    });
    const eligible = planSafeRecipe(sectionWithTarget(), cardGrid);
    expect(eligible.decision).toBe('ELIGIBLE');
    expect(eligible.recipe).toBe('simple-card-grid');
    expect(eligible.minConfidence).toBe(94);

    const fragmented = planSafeRecipe(sectionWithTarget(), {
      ...cardGrid,
      evidence: { itemCount: 8, fragmentedCellCandidate: true },
    });
    expect(fragmented.decision).toBe('REVIEW');
    expect(fragmented.reasonCode).toBe('FRAGMENTED_GRID_UNSAFE');
  });

  it('keeps a geometric grid without conservative semantics in REVIEW', () => {
    const plan = planSafeRecipe(sectionWithTarget(), detection({ pattern: 'grid', confidence: 98 }));
    expect(plan.decision).toBe('REVIEW');
    expect(plan.reasonCode).toBe('AMBIGUOUS_GRID_SEMANTICS');
  });

  it('defers carousel and timeline structures to P6', () => {
    const carousel = planSafeRecipe(sectionWithTarget(), detection({ pattern: 'carousel-track', confidence: 99 }));
    expect(carousel.decision).toBe('UNSUPPORTED');
    expect(carousel.reasonCode).toBe('ADVANCED_PATTERN_DEFERRED');

    const timeline = planSafeRecipe(sectionWithTarget(), detection({ semanticHint: 'timeline-chapter', confidence: 99 }));
    expect(timeline.decision).toBe('UNSUPPORTED');
    expect(timeline.reasonCode).toBe('ADVANCED_PATTERN_DEFERRED');
  });

  it('registers facts-list and footer-columns only at high confidence', () => {
    const facts = planSafeRecipe(sectionWithTarget(), detection({ semanticHint: 'facts-list', confidence: 95 }));
    expect(facts.decision).toBe('ELIGIBLE');
    expect(facts.recipe).toBe('facts-list');

    const footer = planSafeRecipe(sectionWithTarget(), detection({
      pattern: 'horizontal-row',
      semanticHint: 'footer-columns',
      confidence: 91,
    }));
    expect(footer.decision).toBe('REVIEW');
    expect(footer.recipe).toBe('footer-columns');
  });

  it('refuses mutation when the classifier target cannot be resolved', () => {
    const plan = planSafeRecipe(sectionWithTarget(), detection({ targetNodeId: 'missing' }));
    expect(plan.decision).toBe('REVIEW');
    expect(plan.reasonCode).toBe('TARGET_NOT_FOUND');
    expect(plan.targetPath).toEqual([]);
  });
});
