import { describe, expect, it } from 'vitest';
import type { AuditNode } from '../src/core/types';
import { detectBestPattern } from '../src/core/classifier';

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
