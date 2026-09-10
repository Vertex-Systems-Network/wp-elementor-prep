import { describe, expect, it } from 'vitest';
import { detectAdvancedPatterns } from '../src/core/advanced-patterns';
import type { AuditNode } from '../src/core/types';

let idCounter = 0;
function node(overrides: Partial<AuditNode> = {}): AuditNode {
  idCounter += 1;
  return {
    id: `p6:${idCounter}`,
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

function text(id: string, x = 0, y = 0): AuditNode {
  return node({
    id,
    name: 'Text',
    type: 'TEXT',
    geometry: { x, y, width: 220, height: 28 },
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

function findPattern(root: AuditNode, pattern: string) {
  return detectAdvancedPatterns(root).find((detection) => detection.pattern === pattern);
}

describe('P6 advanced read-only classifier', () => {
  it('preserves a clipped wider carousel track instead of recommending overflow compression', () => {
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

    const detection = findPattern(viewport, 'carousel-viewport-track');
    expect(detection?.decision).toBe('PRESERVE');
    expect(detection?.evidence.clipsContent).toBe(true);
    expect(detection?.evidence.blindOverflowCompression).toBe(false);
  });

  it('surfaces fragmented grid cells as REVIEW-only synthesis evidence', () => {
    const anchors = [
      [0, 0], [500, 0],
      [0, 180], [500, 180],
      [0, 360],
    ].map(([x, y], index) => node({
      id: `anchor-${index}`,
      geometry: { x: x ?? 0, y: y ?? 0, width: 500, height: 180 },
    }));
    const fragments = [
      node({ id: 'frag-value', geometry: { x: 540, y: 385, width: 100, height: 55 } }),
      node({ id: 'frag-unit', geometry: { x: 650, y: 420, width: 40, height: 18 } }),
      node({ id: 'frag-title', geometry: { x: 540, y: 455, width: 420, height: 28 } }),
      node({ id: 'frag-copy', geometry: { x: 540, y: 495, width: 420, height: 22 } }),
      node({ id: 'frag-accent', geometry: { x: 500, y: 360, width: 3, height: 36 } }),
    ];
    const grid = withChildren(node({
      id: 'fragmented-grid',
      name: 'Projects Grid',
      geometry: { x: 0, y: 0, width: 1000, height: 540 },
    }), [...anchors, ...fragments]);

    const detection = findPattern(grid, 'fragmented-card-synthesis');
    expect(detection?.decision).toBe('REVIEW');
    expect(detection?.evidence.missingSlots).toBe(1);
    expect(detection?.evidence.autoSynthesisEnabled).toBe(false);
  });

  it('detects an alternating journey sequence while preserving nested decorative overlays', () => {
    const chapters = Array.from({ length: 5 }, (_, index) => {
      const left = index % 2 === 0;
      const children = [
        text(`chapter-${index}-title`, 0, 20),
        text(`chapter-${index}-copy`, 0, 70),
      ];
      if (index === 0) {
        children.push(node({
          id: 'year-overlay',
          name: 'Background Year',
          geometry: { x: 180, y: 10, width: 160, height: 90 },
          absolutePositioned: true,
          opacity: 0.2,
        }));
      }
      return withChildren(node({
        id: `chapter-${index}`,
        name: `Journey Chapter ${index + 1}`,
        geometry: { x: left ? 80 : 560, y: index * 220, width: 360, height: 180 },
      }), children);
    });
    const journey = withChildren(node({
      id: 'journey',
      name: 'Career Journey Timeline',
      geometry: { x: 0, y: 0, width: 1000, height: 1100 },
    }), chapters);

    const detections = detectAdvancedPatterns(journey);
    const sequence = detections.find((item) => item.pattern === 'timeline-sequence');
    const alternating = detections.find((item) => item.pattern === 'alternating-timeline');
    const decoration = detections.find((item) => item.pattern === 'timeline-decoration-overlay');

    expect(sequence?.decision).toBe('REVIEW');
    expect(sequence?.evidence.chapterCount).toBe(5);
    expect(alternating?.decision).toBe('REVIEW');
    expect(alternating?.evidence.alternationPct).toBe(100);
    expect(decoration?.decision).toBe('PRESERVE');
    expect(decoration?.relatedNodeIds).toContain('year-overlay');
    expect(decoration?.evidence.flattenIntoNormalFlow).toBe(false);
  });

  it('preserves a named header/hero overlap while still identifying page vertical-flow normalization', () => {
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
    const overlay = detections.find((item) => item.pattern === 'header-hero-overlay');
    const flow = detections.find((item) => item.pattern === 'page-vertical-flow');

    expect(overlay?.decision).toBe('PRESERVE');
    expect(overlay?.relatedNodeIds).toEqual(['header', 'hero']);
    expect(flow?.decision).toBe('CANDIDATE');
    expect(flow?.evidence.allowedHeaderHeroOverlayPairs).toBe(1);
    expect(flow?.evidence.mutationEnabled).toBe(false);
  });

  it('returns NOOP when an already-structured page root is vertical Auto Layout', () => {
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

    expect(findPattern(page, 'page-vertical-flow')?.decision).toBe('NOOP');
  });

  it('classifies an explicitly named milestone grid but not a generic card grid', () => {
    const makeCards = () => [
      [0, 0], [500, 0],
      [0, 180], [500, 180],
      [0, 360], [500, 360],
    ].map(([x, y], index) => node({
      id: `milestone-card-${idCounter}-${index}`,
      geometry: { x: x ?? 0, y: y ?? 0, width: 500, height: 180 },
    }));

    const milestone = withChildren(node({
      id: 'milestone-grid',
      name: 'Milestone Grid',
      geometry: { x: 0, y: 0, width: 1000, height: 540 },
    }), makeCards());
    const generic = withChildren(node({
      id: 'generic-grid',
      name: 'Project Cards',
      geometry: { x: 0, y: 0, width: 1000, height: 540 },
    }), makeCards());

    expect(findPattern(milestone, 'milestone-grid')?.decision).toBe('REVIEW');
    expect(findPattern(generic, 'milestone-grid')).toBeUndefined();
  });
});
