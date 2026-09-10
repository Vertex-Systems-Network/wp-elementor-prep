import { describe, expect, it } from 'vitest';
import { detectAdvancedPatterns } from '../src/core/advanced-patterns';
import { planAdvancedRecipe, planAdvancedRecipes } from '../src/core/advanced-recipe-planner';
import type { AdvancedPatternDetection } from '../src/core/advanced-types';
import type { AuditNode } from '../src/core/types';

let idCounter = 0;
function node(overrides: Partial<AuditNode> = {}): AuditNode {
  idCounter += 1;
  return {
    id: `p6-plan:${idCounter}`,
    name: 'Container',
    type: 'FRAME',
    geometry: { x: 0, y: 0, width: 1000, height: 600 },
    layoutMode: 'NONE',
    isAutoLayout: false,
    isContainer: true,
    isText: false,
    isImageLike: false,
    isGenericName: true,
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
    name: 'Text',
    type: 'TEXT',
    geometry: { x: 0, y: 0, width: 220, height: 28 },
    isContainer: false,
    isText: true,
    isGenericName: false,
    textLength: 20,
    textAutoResize: 'HEIGHT',
  });
}

function withChildren(parent: AuditNode, children: AuditNode[]): AuditNode {
  return { ...parent, children, childIds: children.map((child) => child.id) };
}

describe('P6 advanced recipe planner', () => {
  it('promotes only a strong page-flow candidate into clone-only CALIBRATE while carrying header/hero preservation', () => {
    const header = node({
      id: 'header',
      name: 'Header',
      geometry: { x: 0, y: 0, width: 1440, height: 100 },
      absolutePositioned: true,
    });
    const hero = node({ id: 'hero', name: 'Hero', geometry: { x: 0, y: 0, width: 1440, height: 650 } });
    const sections = [650, 1250, 1850, 2450].map((y, index) => node({
      id: `section-${index}`,
      name: `Section ${index + 1}`,
      geometry: { x: 0, y, width: 1440, height: 600 },
    }));
    const page = withChildren(node({
      id: 'desktop-page',
      name: 'Desktop Page',
      geometry: { x: 0, y: 0, width: 1440, height: 3050 },
    }), [header, hero, ...sections]);

    const detections = detectAdvancedPatterns(page);
    const plans = planAdvancedRecipes(page, detections);
    const flow = plans.find((plan) => plan.pattern === 'page-vertical-flow');

    expect(flow?.decision).toBe('CALIBRATE');
    expect(flow?.recipe).toBe('page-vertical-flow');
    expect(flow?.targetPath).toEqual([]);
    expect(flow?.preserveNodeIds).toEqual(expect.arrayContaining(['header', 'hero']));
    expect(flow?.mutationEnabled).toBe(false);
    expect(flow?.futureMutationRequiresFullP3).toBe(true);
    expect(flow?.futureMutationRequiresP4Rollback).toBe(true);
  });

  it('keeps clipped carousel overflow in PRESERVE even at high confidence', () => {
    const cards = [0, 270, 540, 810].map((x, index) => node({
      id: `carousel-card-${index}`,
      geometry: { x, y: 0, width: 250, height: 300 },
    }));
    const viewport = withChildren(node({
      id: 'carousel-viewport',
      name: 'Media Carousel',
      geometry: { x: 0, y: 0, width: 800, height: 300 },
      clipsContent: true,
    }), cards);

    const detection = detectAdvancedPatterns(viewport)
      .find((item) => item.pattern === 'carousel-viewport-track');
    expect(detection).toBeDefined();
    if (!detection) return;

    const plan = planAdvancedRecipe(viewport, detection);
    expect(plan.decision).toBe('PRESERVE');
    expect(plan.recipe).toBe('carousel-viewport-track');
    expect(plan.preserveNodeIds).toContain('carousel-viewport');
    expect(plan.mutationEnabled).toBe(false);
  });

  it('does not promote a timeline REVIEW detection solely because confidence is high', () => {
    const chapters = Array.from({ length: 5 }, (_, index) => withChildren(node({
      id: `chapter-${index}`,
      name: `Journey Chapter ${index + 1}`,
      geometry: { x: index % 2 === 0 ? 80 : 560, y: index * 220, width: 360, height: 180 },
    }), [text(`chapter-${index}-title`), text(`chapter-${index}-copy`)]));
    const journey = withChildren(node({
      id: 'journey',
      name: 'Career Journey Timeline',
      geometry: { x: 0, y: 0, width: 1000, height: 1100 },
    }), chapters);

    const detection = detectAdvancedPatterns(journey)
      .find((item) => item.pattern === 'alternating-timeline');
    expect(detection).toBeDefined();
    if (!detection) return;

    const plan = planAdvancedRecipe(journey, detection);
    expect(detection.confidence).toBeGreaterThanOrEqual(90);
    expect(plan.decision).toBe('REVIEW');
    expect(plan.reasonCode).toBe('DETECTION_REQUIRES_REVIEW');
    expect(plan.mutationEnabled).toBe(false);
  });

  it('keeps an already vertical page as NOOP', () => {
    const children = Array.from({ length: 5 }, (_, index) => node({
      id: `flow-${index}`,
      name: index === 0 ? 'Hero' : `Section ${index}`,
      geometry: { x: 0, y: index * 500, width: 1200, height: 500 },
    }));
    const page = withChildren(node({
      id: 'app-page',
      name: 'App Desktop',
      geometry: { x: 0, y: 0, width: 1200, height: 2500 },
      isAutoLayout: true,
      layoutMode: 'VERTICAL',
    }), children);

    const detection = detectAdvancedPatterns(page)
      .find((item) => item.pattern === 'page-vertical-flow');
    expect(detection).toBeDefined();
    if (!detection) return;

    const plan = planAdvancedRecipe(page, detection);
    expect(plan.decision).toBe('NOOP');
    expect(plan.reasonCode).toBe('TARGET_ALREADY_STRUCTURED');
  });

  it('records clone-stable child-index paths and fails closed when the target is absent', () => {
    const target = node({ id: 'nested-target', name: 'Nested Page' });
    const root = withChildren(node({ id: 'root' }), [
      node({ id: 'sibling' }),
      withChildren(node({ id: 'wrapper' }), [target]),
    ]);
    const detection: AdvancedPatternDetection = {
      pattern: 'page-vertical-flow',
      decision: 'CANDIDATE',
      confidence: 99,
      targetNodeId: 'nested-target',
      targetNodeName: 'Nested Page',
      relatedNodeIds: [],
      evidence: {},
    };

    const plan = planAdvancedRecipe(root, detection);
    expect(plan.targetPath).toEqual([1, 0]);
    expect(plan.decision).toBe('CALIBRATE');

    const missing = planAdvancedRecipe(root, { ...detection, targetNodeId: 'missing' });
    expect(missing.decision).toBe('REVIEW');
    expect(missing.reasonCode).toBe('TARGET_NOT_FOUND');
    expect(missing.targetPath).toEqual([]);
  });
});
