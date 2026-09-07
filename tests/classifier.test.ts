import { describe, expect, it } from 'vitest';
import type { AuditNode } from '../src/core/types';
import { detectBestPattern, detectPatterns } from '../src/core/classifier';

let idCounter = 0;
function node(overrides: Partial<AuditNode> = {}): AuditNode {
  idCounter += 1;
  return {
    id: `test:${idCounter}`,
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

function withChildren(parent: AuditNode, children: AuditNode[]): AuditNode {
  return { ...parent, children, childIds: children.map((child) => child.id) };
}

describe('detectBestPattern', () => {
  it('detects a two-column composition', () => {
    const left = node({ id: 'left', geometry: { x: 0, y: 0, width: 580, height: 600 } });
    const right = node({ id: 'right', geometry: { x: 580, y: 0, width: 420, height: 600 } });
    const section = withChildren(node({ id: 'section', name: 'About', geometry: { x: 0, y: 0, width: 1000, height: 600 } }), [left, right]);

    const detection = detectBestPattern(section);
    expect(detection?.pattern).toBe('two-column');
    expect(detection?.confidence).toBeGreaterThanOrEqual(90);
  });

  it('does not call two tiny aligned objects a primary two-column layout', () => {
    const a = node({ geometry: { x: 0, y: 0, width: 90, height: 80 } });
    const b = node({ geometry: { x: 110, y: 0, width: 90, height: 80 } });
    const section = withChildren(node({ geometry: { x: 0, y: 0, width: 1000, height: 500 } }), [a, b]);

    expect(detectBestPattern(section)?.pattern).not.toBe('two-column');
  });

  it('detects a two by three grid', () => {
    const cards = [
      [0, 0], [500, 0],
      [0, 180], [500, 180],
      [0, 360], [500, 360],
    ].map(([x, y], index) => node({
      id: `card-${index}`,
      geometry: { x: x ?? 0, y: y ?? 0, width: 500, height: 180 },
    }));
    const section = withChildren(node({ id: 'grid', geometry: { x: 0, y: 0, width: 1000, height: 540 } }), cards);

    const detection = detectBestPattern(section);
    expect(detection?.pattern).toBe('grid');
    expect(detection?.evidence.columns).toBe(2);
    expect(detection?.evidence.rows).toBe(3);
  });

  it('detects a fragmented final grid cell using dominant card anchors', () => {
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
    const section = withChildren(node({ id: 'fragmented-grid', geometry: { x: 0, y: 0, width: 1000, height: 540 } }), [...anchors, ...fragments]);

    const detection = detectBestPattern(section);
    expect(detection?.pattern).toBe('grid');
    expect(detection?.evidence.fragmentedCellCandidate).toBe(true);
    expect(detection?.evidence.columns).toBe(2);
    expect(detection?.evidence.rows).toBe(3);
    expect(detection?.evidence.missingSlots).toBe(1);
  });

  it('ignores a full-size background sibling when detecting a grid', () => {
    const background = node({ id: 'bg', name: 'Background', geometry: { x: 0, y: 0, width: 1000, height: 600 } });
    const cards = [
      [0, 100], [500, 100], [0, 300], [500, 300],
    ].map(([x, y], index) => node({
      id: `card-${index}`,
      geometry: { x: x ?? 0, y: y ?? 0, width: 500, height: 180 },
    }));
    const section = withChildren(node({ id: 'section', geometry: { x: 0, y: 0, width: 1000, height: 600 } }), [background, ...cards]);

    expect(detectBestPattern(section)?.pattern).toBe('grid');
  });

  it('detects a horizontal carousel track without treating overflow as an error', () => {
    const cards = [0, 270, 540, 810].map((x, index) => node({
      id: `card-${index}`,
      geometry: { x, y: 0, width: 250, height: 300 },
    }));
    const viewport = withChildren(node({
      id: 'viewport',
      geometry: { x: 0, y: 0, width: 800, height: 300 },
      clipsContent: true,
    }), cards);

    const detection = detectBestPattern(viewport);
    expect(detection?.pattern).toBe('carousel-track');
    expect(detection?.evidence.overflowPx).toBeGreaterThan(0);
  });
});

describe('detectPatterns', () => {
  it('reports grid and two-column targets in a Numbers-like complex section', () => {
    const anchors = [
      [0, 0], [500, 0],
      [0, 180], [500, 180],
      [0, 360],
    ].map(([x, y], index) => node({
      id: `metric-anchor-${index}`,
      geometry: { x: x ?? 0, y: y ?? 0, width: 500, height: 180 },
    }));
    const fragments = [
      node({ id: 'metric-frag-1', geometry: { x: 540, y: 385, width: 100, height: 55 } }),
      node({ id: 'metric-frag-2', geometry: { x: 650, y: 420, width: 40, height: 18 } }),
      node({ id: 'metric-frag-3', geometry: { x: 540, y: 455, width: 420, height: 28 } }),
      node({ id: 'metric-frag-4', geometry: { x: 540, y: 495, width: 420, height: 22 } }),
      node({ id: 'metric-frag-5', geometry: { x: 500, y: 360, width: 3, height: 36 } }),
    ];
    const metricGrid = withChildren(node({
      id: 'metric-grid',
      name: 'Metric Grid',
      geometry: { x: 0, y: 0, width: 1000, height: 540 },
    }), [...anchors, ...fragments]);

    const lowerLeft = node({ id: 'lower-left', geometry: { x: 0, y: 0, width: 480, height: 300 } });
    const lowerRight = node({ id: 'lower-right', geometry: { x: 520, y: 0, width: 480, height: 300 } });
    const lower = withChildren(node({
      id: 'lower',
      name: 'Recognition Area',
      geometry: { x: 0, y: 600, width: 1000, height: 300 },
    }), [lowerLeft, lowerRight]);

    const section = withChildren(node({
      id: 'numbers',
      name: 'Numbers',
      geometry: { x: 0, y: 0, width: 1000, height: 900 },
    }), [metricGrid, lower]);

    const detections = detectPatterns(section);
    expect(detections.some((item) => item.pattern === 'grid' && item.targetNodeId === 'metric-grid')).toBe(true);
    expect(detections.some((item) => item.pattern === 'two-column' && item.targetNodeId === 'lower')).toBe(true);
  });

  it('recognizes a split-header-style pair without needing semantic names', () => {
    const heading = node({ id: 'heading-wrap', geometry: { x: 0, y: 0, width: 470, height: 120 } });
    const intro = node({ id: 'intro-wrap', geometry: { x: 530, y: 0, width: 470, height: 120 } });
    const header = withChildren(node({ id: 'split-header', geometry: { x: 0, y: 0, width: 1000, height: 150 } }), [heading, intro]);

    const detections = detectPatterns(header);
    expect(detections.some((item) => item.pattern === 'two-column' && item.targetNodeId === 'split-header')).toBe(true);
  });

  it('exposes timeline/chapter structure as separate stack and chapter targets', () => {
    const chapters = Array.from({ length: 3 }, (_, index) => {
      const content = node({ id: `chapter-${index}-content`, geometry: { x: 0, y: 0, width: 480, height: 500 } });
      const media = node({ id: `chapter-${index}-media`, geometry: { x: 520, y: 0, width: 480, height: 500 } });
      return withChildren(node({
        id: `chapter-${index}`,
        name: `Chapter ${index + 1}`,
        geometry: { x: 0, y: index * 520, width: 1000, height: 500 },
      }), [content, media]);
    });
    const timeline = withChildren(node({
      id: 'timeline',
      name: 'Journey',
      geometry: { x: 0, y: 0, width: 1000, height: 1540 },
    }), chapters);

    const detections = detectPatterns(timeline);
    expect(detections.some((item) => item.pattern === 'vertical-stack' && item.targetNodeId === 'timeline')).toBe(true);
    expect(detections.some((item) => item.pattern === 'two-column' && item.targetNodeId.startsWith('chapter-'))).toBe(true);
  });
});
