import { describe, expect, it } from 'vitest';
import { buildBuildReadyReport } from '../src/core/build-ready';
import type { AuditNode } from '../src/core/types';

function node(overrides: Partial<AuditNode> = {}): AuditNode {
  const children = overrides.children ?? [];
  return {
    id: '1:1',
    name: 'Node',
    type: 'FRAME',
    geometry: { x: 0, y: 0, width: 1000, height: 500 },
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
    ...overrides,
    children,
    childIds: overrides.childIds ?? children.map((child) => child.id),
  };
}

describe('P13 responsive-risk foundation', () => {
  it('finds horizontal contraction pressure against explicit reference widths', () => {
    const children = [0, 1, 2].map((index) => node({
      id: `child:${index}`,
      isContainer: false,
      layoutMode: 'NONE',
      isAutoLayout: false,
      geometry: { x: index * 300, y: 0, width: 300, height: 80 },
      children: [],
    }));
    const row = node({
      id: 'row',
      layoutMode: 'HORIZONTAL',
      geometry: { x: 0, y: 0, width: 1200, height: 100 },
      children,
    });
    const report = buildBuildReadyReport(node({ id: 'root', children: [row] }), {
      referenceWidths: [1024, 768, 390],
    }, '2026-09-11T00:00:00.000Z');

    const finding = report.findings.find((item) => item.ruleId === 'RR_HORIZONTAL_DENSITY');
    expect(finding).toBeTruthy();
    expect(String(finding?.evidence.triggeredReferenceWidths)).toContain('768');
    expect(report.responsiveRisk.triggeredReferenceWidths).toContain(768);
  });

  it('reports real clipping dependency when child geometry exceeds a clipping parent', () => {
    const overflowing = node({
      id: 'overflowing',
      isContainer: false,
      layoutMode: 'NONE',
      isAutoLayout: false,
      geometry: { x: 850, y: 0, width: 300, height: 100 },
      children: [],
    });
    const clip = node({
      id: 'clip',
      clipsContent: true,
      geometry: { x: 0, y: 0, width: 1000, height: 200 },
      children: [overflowing],
    });
    const report = buildBuildReadyReport(node({ id: 'root', children: [clip] }), {}, '2026-09-11T00:00:00.000Z');
    const finding = report.findings.find((item) => item.ruleId === 'RR_OVERFLOW_CLIP_DEPENDENCY');
    expect(finding?.severity).toBe('HIGH');
    expect(finding?.evidence.overflowPx).toBe(150);
  });

  it('flags non-overlay sibling collision but preserves decorative/absolute image overlays', () => {
    const a = node({
      id: 'a',
      geometry: { x: 0, y: 0, width: 500, height: 200 },
      children: [],
    });
    const b = node({
      id: 'b',
      geometry: { x: 350, y: 0, width: 500, height: 200 },
      children: [],
    });
    const decoration = node({
      id: 'decor',
      isContainer: false,
      layoutMode: 'NONE',
      isAutoLayout: false,
      isImageLike: true,
      absolutePositioned: true,
      opacity: 0.4,
      geometry: { x: 0, y: 0, width: 1000, height: 200 },
      children: [],
    });
    const parent = node({
      id: 'parent',
      geometry: { x: 0, y: 0, width: 1000, height: 220 },
      children: [a, b, decoration],
    });
    const report = buildBuildReadyReport(node({ id: 'root', children: [parent] }), {}, '2026-09-11T00:00:00.000Z');

    expect(report.findings.some((item) => item.ruleId === 'RR_OVERLAP_COLLISION')).toBe(true);
    expect(report.findings.some((item) =>
      item.ruleId === 'RR_ABSOLUTE_FLOW_DEPENDENCY' && item.nodeIds.includes('decor'))).toBe(false);
  });

  it('marks content-bearing absolute positioning as review evidence without claiming a responsive fix', () => {
    const text = node({
      id: 'absolute-text',
      name: 'Badge copy',
      type: 'TEXT',
      isContainer: false,
      isText: true,
      layoutMode: 'NONE',
      isAutoLayout: false,
      absolutePositioned: true,
      textLength: 24,
      textAutoResize: 'HEIGHT',
      geometry: { x: 700, y: 20, width: 180, height: 40 },
      children: [],
    });
    const report = buildBuildReadyReport(node({ id: 'root', children: [text] }), {}, '2026-09-11T00:00:00.000Z');
    const finding = report.findings.find((item) => item.ruleId === 'RR_ABSOLUTE_FLOW_DEPENDENCY');
    expect(finding?.severity).toBe('MEDIUM');
    expect(finding?.remediationClass).toBe('MANUAL_REVIEW');
    expect(finding?.penalty).toBeGreaterThan(0);
  });
});
