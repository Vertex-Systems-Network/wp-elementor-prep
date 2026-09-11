import { describe, expect, it } from 'vitest';
import { buildBuildReadyReport, serializeBuildReadyReportJson } from '../src/core/build-ready';
import type { AuditNode } from '../src/core/types';

function node(overrides: Partial<AuditNode> = {}): AuditNode {
  const children = overrides.children ?? [];
  return {
    id: '1:1',
    name: 'Hero',
    type: 'FRAME',
    geometry: { x: 0, y: 0, width: 1200, height: 600 },
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

function structuredRoot(): AuditNode {
  const cards = Array.from({ length: 4 }, (_, index) => node({
    id: `3:${index}`,
    name: `Feature Card ${index + 1}`,
    geometry: { x: index * 260, y: 0, width: 240, height: 220 },
    layoutMode: 'VERTICAL',
    children: [
      node({
        id: `4:${index}`,
        name: `Feature copy ${index + 1}`,
        type: 'TEXT',
        geometry: { x: 16, y: 20, width: 208, height: 80 },
        layoutMode: 'NONE',
        isAutoLayout: false,
        isContainer: false,
        isText: true,
        textLength: 50,
        textAutoResize: 'HEIGHT',
        children: [],
      }),
    ],
  }));
  const row = node({
    id: '2:1',
    name: 'Feature Row',
    layoutMode: 'HORIZONTAL',
    geometry: { x: 0, y: 0, width: 1200, height: 240 },
    children: cards,
  });
  return node({
    id: '1:0',
    name: 'Desktop Original',
    geometry: { x: 0, y: 0, width: 1200, height: 900 },
    children: [row],
  });
}

describe('P13 Build-Ready Score 2.0 core', () => {
  it('keeps score versions explicit and emits a deterministic fingerprint/run id', () => {
    const root = structuredRoot();
    const first = buildBuildReadyReport(root, {}, '2026-09-11T00:00:00.000Z');
    const second = buildBuildReadyReport(root, {}, '2026-09-12T00:00:00.000Z');

    expect(first.buildReadyScoreVersion).toBe(2);
    expect(first.responsiveRiskVersion).toBe(1);
    expect(first.source.structuralHash).toBe(second.source.structuralHash);
    expect(first.source.configHash).toBe(second.source.configHash);
    expect(first.runId).toBe(second.runId);
    expect(first.generatedAt).not.toBe(second.generatedAt);
    expect(first.score.score).not.toBeNull();
  });

  it('is read-only and does not mutate normalized audit input', () => {
    const root = structuredRoot();
    const before = JSON.stringify(root);
    buildBuildReadyReport(root, {}, '2026-09-11T00:00:00.000Z');
    expect(JSON.stringify(root)).toBe(before);
  });

  it('fails closed when usable evidence coverage is insufficient', () => {
    const root = node({
      id: 'x:0',
      layoutMode: 'UNKNOWN',
      geometry: { x: 0, y: 0, width: 0, height: 0 },
    });
    const report = buildBuildReadyReport(root, {}, '2026-09-11T00:00:00.000Z');
    expect(report.score.status).toBe('INSUFFICIENT_EVIDENCE');
    expect(report.score.score).toBeNull();
  });

  it('bounds repeated penalties by rule instead of allowing unbounded score collapse', () => {
    const rows = Array.from({ length: 12 }, (_, rowIndex) => {
      const children = Array.from({ length: 4 }, (_, childIndex) => node({
        id: `dense:${rowIndex}:${childIndex}`,
        name: `Item ${childIndex}`,
        geometry: { x: childIndex * 290, y: 0, width: 280, height: 80 },
        layoutMode: 'NONE',
        isAutoLayout: false,
        isContainer: false,
        children: [],
      }));
      return node({
        id: `row:${rowIndex}`,
        name: `Dense Row ${rowIndex}`,
        geometry: { x: 0, y: rowIndex * 100, width: 900, height: 80 },
        layoutMode: 'HORIZONTAL',
        children,
      });
    });
    const root = node({
      id: 'dense-root',
      name: 'Dense',
      geometry: { x: 0, y: 0, width: 1200, height: 1600 },
      children: rows,
    });

    const report = buildBuildReadyReport(root, {}, '2026-09-11T00:00:00.000Z');
    const responsive = report.categories.find((category) => category.category === 'RESPONSIVE_RISK');
    expect(responsive?.penaltiesApplied).toBeLessThanOrEqual(20);
    expect(report.score.score === null || (report.score.score >= 0 && report.score.score <= 100)).toBe(true);
    expect(report.findings.some((finding) => finding.ruleId === 'RR_HORIZONTAL_DENSITY')).toBe(true);
  });

  it('does not turn advisory fixed-text evidence into a blocker', () => {
    const text = node({
      id: 'text:1',
      name: 'Long Copy',
      type: 'TEXT',
      geometry: { x: 0, y: 0, width: 480, height: 60 },
      layoutMode: 'NONE',
      isAutoLayout: false,
      isContainer: false,
      isText: true,
      textLength: 220,
      textAutoResize: 'NONE',
      children: [],
    });
    const root = node({ id: 'copy-root', name: 'Copy', children: [text] });
    const report = buildBuildReadyReport(root, {}, '2026-09-11T00:00:00.000Z');
    const finding = report.findings.find((item) => item.ruleId === 'RR_FIXED_HEIGHT_TEXT_CLIP');

    expect(finding?.severity).toBe('LOW');
    expect(finding?.penalty).toBe(0);
    expect(report.score.blockerCount).toBe(0);
  });

  it('retains explicit limitations instead of pretending unsupported rules ran', () => {
    const report = buildBuildReadyReport(structuredRoot(), {}, '2026-09-11T00:00:00.000Z');
    const codes = report.limitations.map((limitation) => limitation.code);
    expect(codes).toContain('P13_DEFER_LONG_UNBREAKABLE_CONTENT');
    expect(codes).toContain('P13_DEFER_SPACING_PRESSURE');
    expect(codes).toContain('P13_DEFER_MIN_WIDTH_STACK_PRESSURE');
  });

  it('serializes a stable machine-readable version contract', () => {
    const report = buildBuildReadyReport(structuredRoot(), {}, '2026-09-11T00:00:00.000Z');
    const serialized = serializeBuildReadyReportJson(report);
    expect(serialized.endsWith('\n')).toBe(true);
    expect(JSON.parse(serialized).buildReadyScoreVersion).toBe(2);
  });
});
