import { describe, expect, it } from 'vitest';
import { enrichSemanticHints } from '../src/core/semantics';
import { planSafeRecipe } from '../src/core/safe-recipe-planner';
import type { AuditNode, PatternDetection } from '../src/core/types';

let counter = 0;
function node(overrides: Partial<AuditNode> = {}): AuditNode {
  counter += 1;
  return {
    id: `p5-sem:${counter}`,
    name: 'Frame',
    type: 'FRAME',
    geometry: { x: 0, y: 0, width: 1000, height: 600 },
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

function text(id: string): AuditNode {
  return node({
    id,
    type: 'TEXT',
    name: 'Text',
    isContainer: false,
    isText: true,
    textLength: 8,
    children: [],
    childIds: [],
  });
}

function withChildren(parent: AuditNode, children: AuditNode[]): AuditNode {
  return { ...parent, children, childIds: children.map((child) => child.id) };
}

function detection(overrides: Partial<PatternDetection>): PatternDetection {
  return {
    pattern: 'grid',
    confidence: 96,
    targetNodeId: 'target',
    targetNodeName: 'Target',
    evidence: { itemCount: 4, widthConsistencyPct: 100, occupancyPct: 100, fragmentedCellCandidate: false },
    ...overrides,
  };
}

function metricSection(targetName = 'KPI Metrics'): AuditNode {
  const items = Array.from({ length: 4 }, (_, index) => withChildren(
    node({ id: `metric-${index}`, geometry: { x: (index % 2) * 250, y: Math.floor(index / 2) * 110, width: 220, height: 90 } }),
    [text(`metric-${index}-value`), text(`metric-${index}-label`)],
  ));
  const target = withChildren(node({ id: 'target', name: targetName, geometry: { x: 0, y: 200, width: 500, height: 220 } }), items);
  return withChildren(node({ id: 'section', name: 'Numbers', geometry: { x: 0, y: 0, width: 1000, height: 1000 } }), [target]);
}

describe('P5 metric/social semantics', () => {
  it('uses an explicit metric/stat naming signal plus simple text-only cells for metric-grid semantics', () => {
    const section = metricSection();
    const result = enrichSemanticHints(section, [detection({ targetNodeId: 'target' })]);
    expect(result[0]?.semanticHint).toBe('metric-grid');
    expect(result[0]?.evidence.semanticMetricNameEvidence).toBe(true);
  });

  it('keeps the same unnamed/simple grid as repeated cards instead of guessing metric semantics', () => {
    const section = metricSection('Services Grid');
    const result = enrichSemanticHints(section, [detection({ targetNodeId: 'target' })]);
    expect(result[0]?.semanticHint).toBe('repeated-cards');
  });

  it('uses explicit social/follow/connect naming plus a compact row for social-link-strip semantics', () => {
    const items = Array.from({ length: 4 }, (_, index) => withChildren(
      node({ id: `social-${index}`, geometry: { x: index * 110, y: 0, width: 80, height: 44 } }),
      [text(`social-${index}-label`)],
    ));
    const target = withChildren(node({ id: 'social-target', name: 'Social Connect', geometry: { x: 0, y: 300, width: 440, height: 60 } }), items);
    const section = withChildren(node({ id: 'social-section', name: 'Contact', geometry: { x: 0, y: 0, width: 1000, height: 1000 } }), [target]);
    const result = enrichSemanticHints(section, [detection({
      pattern: 'horizontal-row',
      targetNodeId: 'social-target',
      targetNodeName: 'Social Connect',
      evidence: { itemCount: 4, overlapPairs: 0, yClusterCount: 1 },
    })]);

    expect(result[0]?.semanticHint).toBe('social-link-strip');
    expect(result[0]?.evidence.semanticSocialNameEvidence).toBe(true);
  });

  it('does not infer social semantics from a generic compact navigation row', () => {
    const items = Array.from({ length: 4 }, (_, index) => withChildren(
      node({ id: `nav-${index}`, geometry: { x: index * 110, y: 0, width: 80, height: 44 } }),
      [text(`nav-${index}-label`)],
    ));
    const target = withChildren(node({ id: 'nav-target', name: 'Header Navigation', geometry: { x: 0, y: 40, width: 440, height: 60 } }), items);
    const section = withChildren(node({ id: 'nav-section', name: 'Header', geometry: { x: 0, y: 0, width: 1000, height: 1000 } }), [target]);
    const result = enrichSemanticHints(section, [detection({
      pattern: 'horizontal-row',
      targetNodeId: 'nav-target',
      targetNodeName: 'Header Navigation',
      evidence: { itemCount: 4, overlapPairs: 0, yClusterCount: 1 },
    })]);

    expect(result[0]?.semanticHint).not.toBe('social-link-strip');
  });

  it('confidence-gates metric-grid and social-link-strip plans at 95%', () => {
    const metric = metricSection();
    const metricDetection = detection({ semanticHint: 'metric-grid', targetNodeId: 'target', confidence: 96 });
    const metricPlan = planSafeRecipe(metric, metricDetection);
    expect(metricPlan.decision).toBe('ELIGIBLE');
    expect(metricPlan.recipe).toBe('metric-grid');
    expect(metricPlan.minConfidence).toBe(95);

    const socialTarget = withChildren(node({ id: 'social-plan-target' }), [node({ id: 'a' }), node({ id: 'b' })]);
    const socialSection = withChildren(node({ id: 'social-plan-section' }), [socialTarget]);
    const socialPlan = planSafeRecipe(socialSection, detection({
      pattern: 'horizontal-row',
      semanticHint: 'social-link-strip',
      targetNodeId: 'social-plan-target',
      confidence: 95,
      evidence: { itemCount: 2 },
    }));
    expect(socialPlan.decision).toBe('ELIGIBLE');
    expect(socialPlan.recipe).toBe('social-link-strip');

    const lowSocial = planSafeRecipe(socialSection, detection({
      pattern: 'horizontal-row',
      semanticHint: 'social-link-strip',
      targetNodeId: 'social-plan-target',
      confidence: 94,
      evidence: { itemCount: 2 },
    }));
    expect(lowSocial.decision).toBe('REVIEW');
    expect(lowSocial.reasonCode).toBe('BELOW_CONFIDENCE_GATE');
  });
});
