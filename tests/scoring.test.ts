import { describe, expect, it } from 'vitest';
import type { AuditNode, AuditStats } from '../src/core/types';
import { buildAuditReport, scoreStats } from '../src/core/scoring';

function stats(overrides: Partial<AuditStats> = {}): AuditStats {
  return {
    nodes: 100,
    containers: 50,
    autoLayoutContainers: 40,
    manualContainers: 10,
    autoLayoutCoveragePct: 80,
    textNodes: 20,
    autoHeightTextNodes: 18,
    genericNames: 10,
    absolutePositionedNodes: 1,
    imageLikeNodes: 5,
    ...overrides,
  };
}

export function node(overrides: Partial<AuditNode> = {}): AuditNode {
  return {
    id: '1:1',
    name: 'Desktop',
    type: 'FRAME',
    geometry: { x: 0, y: 0, width: 1200, height: 4000 },
    layoutMode: 'VERTICAL',
    isAutoLayout: true,
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

describe('scoreStats', () => {
  it('scores a structured section higher than a manual one', () => {
    const strong = scoreStats(stats());
    const weak = scoreStats(stats({
      autoLayoutContainers: 5,
      manualContainers: 45,
      autoLayoutCoveragePct: 10,
      autoHeightTextNodes: 5,
      genericNames: 70,
      absolutePositionedNodes: 15,
    }));

    expect(strong).toBeGreaterThan(weak);
    expect(strong).toBeGreaterThanOrEqual(70);
    expect(weak).toBeLessThan(50);
  });
});

describe('buildAuditReport', () => {
  it('produces a serializable report for an empty-ish root', () => {
    const root = node();
    const report = buildAuditReport(root, 'test');

    expect(report.schemaVersion).toBe(1);
    expect(report.pluginVersion).toBe('test');
    expect(report.root.name).toBe('Desktop');
    expect(report.sections).toEqual([]);
  });

  it('discovers a likely multi-section content wrapper', () => {
    const sections = Array.from({ length: 5 }, (_, index) => node({
      id: `2:${index}`,
      name: `Section ${index + 1}`,
      geometry: { x: 0, y: index * 700, width: 1200, height: 700 },
      children: [node({ id: `3:${index}`, name: 'Content', geometry: { x: 40, y: 40, width: 1120, height: 620 } })],
      childIds: [`3:${index}`],
    }));

    const wrapper = node({
      id: '1:2',
      name: 'App',
      geometry: { x: 0, y: 0, width: 1200, height: 3500 },
      children: sections,
      childIds: sections.map((section) => section.id),
    });

    const root = node({
      geometry: { x: 0, y: 0, width: 1200, height: 4000 },
      children: [wrapper],
      childIds: [wrapper.id],
    });

    const report = buildAuditReport(root, 'test');
    expect(report.sections).toHaveLength(5);
  });
});
