import { describe, expect, it } from 'vitest';
import { boxEdgeDelta, boxIou, buildP15RoundTripReport, fitPixelBuffer } from '../src/core/round-trip-report';
import { buildP15IrCssReference } from '../src/targets/elementor/ir-css-reference';

const solid = (width: number, height: number, rgba = [255, 255, 255, 255]) => {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i += 1) data.set(rgba, i * 4);
  return { width, height, data };
};

describe('recovery M7.2 — round-trip report', () => {
  it('box metrics are exact', () => {
    expect(boxIou({ x: 0, y: 0, width: 10, height: 10 }, { x: 0, y: 0, width: 10, height: 10 })).toBe(1);
    expect(boxIou({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 0, width: 10, height: 10 })).toBeCloseTo(50 / 150, 4);
    expect(boxEdgeDelta({ x: 0, y: 0, width: 10, height: 10 }, { x: 2, y: 1, width: 10, height: 12 })).toBe(3);
  });

  it('fits a taller or shorter render to the reference size', () => {
    const fitted = fitPixelBuffer(solid(4, 2, [1, 2, 3, 4]), 4, 3);
    expect(fitted.height).toBe(3);
    expect(Array.from(fitted.data).slice(0, 4)).toEqual([1, 2, 3, 4]);
    expect(Array.from(fitted.data).slice(32, 36)).toEqual([0, 0, 0, 0]);
  });

  it('reports per-breakpoint, per-section pixel and structural metrics; uncalibrated never verifies', () => {
    const reference = solid(20, 20);
    const render = solid(20, 20);
    for (let y = 0; y < 10; y += 1) for (let x = 0; x < 10; x += 1) render.data.set([0, 0, 0, 255], (y * 20 + x) * 4);
    const report = buildP15RoundTripReport([{
      device: 'desktop', widthPx: 20, reference, render,
      sections: [
        { id: 'a', reference: { x: 0, y: 0, width: 10, height: 10 }, render: { x: 0, y: 0, width: 10, height: 10 } },
        { id: 'b', reference: { x: 10, y: 10, width: 10, height: 10 }, render: null },
      ],
    }], 'IR_CSS_REFERENCE');
    expect(report.verdict).toBe('UNCALIBRATED');
    expect(report.calibrated).toBe(false);
    const bp = report.breakpoints[0]!;
    expect(bp.pixel.metrics.changedPixelPct).toBe(25);
    expect(bp.pixel.sections.map((s) => s.changedPct)).toEqual([100, 0]);
    expect(bp.structural).toEqual([
      { id: 'a', present: true, maxEdgeDeltaPx: 0, iou: 1, referenceBox: { x: 0, y: 0, width: 10, height: 10 }, renderBox: { x: 0, y: 0, width: 10, height: 10 } },
      { id: 'b', present: false, maxEdgeDeltaPx: null, iou: null, referenceBox: { x: 10, y: 10, width: 10, height: 10 }, renderBox: null },
    ]);
    expect(bp.diffRegions.map((r) => r.reason)).toEqual(['STRUCTURE_MISSING', 'PIXEL_WORST_TILE']);
    expect(report.targetCompatibilityClaim).toBe(false);
  });

  it('with thresholds: identical renders verify, a moved section is REVIEW with a diff region', () => {
    const thresholds = { channelTolerance: 16, tileSize: 8, maxChangedPct: 1, maxSectionChangedPct: 2, maxEdgeDeltaPx: 2, minIou: 0.9 };
    const box = { x: 0, y: 0, width: 10, height: 10 };
    const same = buildP15RoundTripReport([{ device: 'd', widthPx: 20, reference: solid(20, 20), render: solid(20, 20), sections: [{ id: 'a', reference: box, render: box }] }], 'r', thresholds);
    expect(same.verdict).toBe('ROUND_TRIP_VERIFIED');
    const moved = buildP15RoundTripReport([{ device: 'd', widthPx: 20, reference: solid(20, 20), render: solid(20, 20), sections: [{ id: 'a', reference: box, render: { ...box, x: 6 } }] }], 'r', thresholds);
    expect(moved.verdict).toBe('REVIEW');
    expect(moved.breakpoints[0]!.diffRegions[0]).toEqual(expect.objectContaining({ sectionId: 'a', reason: 'STRUCTURE_OFFSET' }));
  });
});

describe('recovery M7.2 — IR→CSS reference', () => {
  it('renders containers and text with escaped content, lists sections and unrendered facts', () => {
    const reference = buildP15IrCssReference({
      schemaVersion: 1, irVersion: 'p15-neutral-export-ir-v2', title: 'T<1>', documentType: 'section',
      nodes: [{ kind: 'container', sourceNodeId: 'p', direction: 'column', children: [
        { kind: 'container', sourceNodeId: 'h', direction: 'row', gapPx: 8, paddingPx: { top: 1, right: 2, bottom: 3, left: 4 }, backgroundColorHex: '#112233',
          boxShadow: { kind: 'drop' } as never, children: [{ kind: 'heading', sourceNodeId: 't', text: '<b>Hi</b>', level: 'h1', typography: { fontSizePx: 40 } }] },
      ] }],
    }, 1440);
    expect(reference.sectionIds).toEqual(['h', 't']);
    expect(reference.html).toContain('data-source="h" style="display:flex;flex-direction:row;gap:8px;padding:1px 2px 3px 4px;background:#112233');
    expect(reference.html).toContain('&lt;b&gt;Hi&lt;/b&gt;');
    expect(reference.html).toContain('font-size:40px');
    expect(reference.html).toContain('id="p15-reference-root" style="width:1440px"');
    expect(reference.unrendered).toEqual([{ sourceNodeId: 'h', fact: 'boxShadow' }]);
  });
});

describe('recovery M7.3 — provisional thresholds', () => {
  it('are frozen and strict; an identical render verifies, the first real-run gap does not', async () => {
    const { P15_ROUND_TRIP_PROVISIONAL_THRESHOLDS: t } = await import('../src/core/round-trip-report');
    expect(Object.isFrozen(t)).toBe(true);
    expect(t).toEqual({ channelTolerance: 16, tileSize: 32, maxChangedPct: 2, maxSectionChangedPct: 5, maxEdgeDeltaPx: 4, minIou: 0.9 });
    const box = { x: 0, y: 0, width: 10, height: 10 };
    const ok = buildP15RoundTripReport([{ device: 'd', widthPx: 20, reference: solid(20, 20), render: solid(20, 20), sections: [{ id: 'a', reference: box, render: box }] }], 'r', t);
    expect(ok.verdict).toBe('ROUND_TRIP_VERIFIED');
    const gap = buildP15RoundTripReport([{ device: 'd', widthPx: 20, reference: solid(20, 20), render: solid(20, 20), sections: [{ id: 'a', reference: box, render: { ...box, x: 704 } }] }], 'r', t);
    expect(gap.verdict).toBe('REVIEW');
  });
});
