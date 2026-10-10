import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { deriveP15ContainerSizing, fillDistributionReview } from '../src/targets/elementor/container-sizing';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const slider = (size: number) => ({ unit: 'px', size, sizes: [] });
const facts = (extra: Partial<Parameters<typeof deriveP15ContainerSizing>[0]> = {}) => ({
  parent: { direction: 'row' as const, alignItems: 'start' },
  horizontal: 'HUG' as const, vertical: 'HUG' as const, width: 300, height: 200, ...extra,
});

describe('recovery M2.3a — sizing derivation', () => {
  it('the root frame width becomes the page content width', () => {
    expect(deriveP15ContainerSizing(facts({ parent: null, horizontal: 'HUG', width: 1440 }))).toEqual({ sizing: { widthPx: 1440 }, reviews: [] });
    expect(deriveP15ContainerSizing(facts({ parent: null, horizontal: 'FIXED', vertical: 'FIXED', width: 1440, height: 900 })))
      .toEqual({ sizing: { widthPx: 1440, minHeightPx: 900 }, reviews: [] });
  });

  it('FIXED on the main axis never grows or shrinks; FIXED on the cross axis only sizes', () => {
    expect(deriveP15ContainerSizing(facts({ horizontal: 'FIXED', width: 240.004 })).sizing).toEqual({ widthPx: 240, flex: 'fixed' });
    expect(deriveP15ContainerSizing(facts({ vertical: 'FIXED' })).sizing).toEqual({ minHeightPx: 200 });
    const column = { direction: 'column' as const, alignItems: 'start' };
    expect(deriveP15ContainerSizing(facts({ parent: column, vertical: 'FIXED' })).sizing).toEqual({ minHeightPx: 200, flex: 'fixed' });
    expect(deriveP15ContainerSizing(facts({ parent: column, horizontal: 'FIXED' })).sizing).toEqual({ widthPx: 300 });
  });

  it('FILL grows on a column main axis, keeps the filling default in a row, and stretches across a row', () => {
    const column = { direction: 'column' as const, alignItems: 'start' };
    expect(deriveP15ContainerSizing(facts({ parent: column, vertical: 'FILL' })).sizing).toEqual({ flex: 'grow' });
    expect(deriveP15ContainerSizing(facts({ parent: column, horizontal: 'FILL' })).sizing).toBeUndefined();
    expect(deriveP15ContainerSizing(facts({ horizontal: 'FILL' })).sizing).toBeUndefined();
    expect(deriveP15ContainerSizing(facts({ vertical: 'FILL' })).sizing).toEqual({ alignSelfStretch: true });
    expect(deriveP15ContainerSizing(facts({ vertical: 'FILL', parent: { direction: 'row', alignItems: 'stretch' } })).sizing).toBeUndefined();
  });

  it('a minimum height maps when the height is not fixed; other constraints are explicit review', () => {
    expect(deriveP15ContainerSizing(facts({ minHeight: 120 }))).toEqual({ sizing: { minHeightPx: 120 }, reviews: [] });
    expect(deriveP15ContainerSizing(facts({ vertical: 'FIXED', minHeight: 120 })).sizing).toEqual({ minHeightPx: 200 });
    const constrained = deriveP15ContainerSizing(facts({ minWidth: 100, maxWidth: 600, maxHeight: null }));
    expect(constrained.sizing).toBeUndefined();
    expect(constrained.reviews).toEqual([{ reasonCode: 'SIZE_CONSTRAINT_REQUIRES_REVIEW', detail: expect.stringContaining('minWidth, maxWidth') }]);
  });

  it('a missing dimension writes nothing; an out-of-range one is review', () => {
    expect(deriveP15ContainerSizing(facts({ horizontal: 'FIXED', width: Number.NaN }))).toEqual({ sizing: { flex: 'fixed' }, reviews: [] });
    expect(deriveP15ContainerSizing(facts({ horizontal: 'FIXED', width: 20_000 })).reviews[0]?.reasonCode).toBe('SIZE_OUT_OF_RANGE');
  });

  it('several FILL children in a column with free height need review', () => {
    expect(fillDistributionReview('column', 'FIXED', [{ flex: 'grow' }, { flex: 'grow' }])?.reasonCode).toBe('SIZE_FILL_DISTRIBUTION_REQUIRES_REVIEW');
    expect(fillDistributionReview('column', 'HUG', [{ flex: 'grow' }, { flex: 'grow' }])).toBeUndefined();
    expect(fillDistributionReview('column', 'FIXED', [{ flex: 'grow' }, undefined])).toBeUndefined();
    expect(fillDistributionReview('row', 'FIXED', [{ flex: 'grow' }, { flex: 'grow' }])).toBeUndefined();
  });
});

const doc = (sizing: unknown, childSizing?: unknown): P15NeutralExportDocumentV1 => ({
  schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Sizing', documentType: 'page',
  nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'row', ...(sizing === undefined ? {} : { sizing }),
    children: [{ kind: 'container', sourceNodeId: 'card', direction: 'column', ...(childSizing === undefined ? {} : { sizing: childSizing }), children: [] }] }],
} as P15NeutralExportDocumentV1);

describe('recovery M2.3a — sizing in the IR and Elementor', () => {
  it('writes content_width full, width, min_height, _flex_size and _flex_align_self', () => {
    const generation = generateElementorV3TemplateCandidate(doc({ widthPx: 1440, minHeightPx: 900 }, { widthPx: 240, flex: 'fixed', alignSelfStretch: true }));
    expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    const root = generation.template!.content[0]!;
    expect(root.settings).toMatchObject({ content_width: 'full', width: slider(1440), min_height: slider(900) });
    expect(root.elements[0]!.settings).toMatchObject({ content_width: 'full', width: slider(240), _flex_size: 'none', _flex_align_self: 'stretch' });
    const grow = generateElementorV3TemplateCandidate(doc(undefined, { flex: 'grow' })).template!.content[0]!.elements[0]!;
    expect(grow.settings).toEqual({ flex_direction: 'column', _flex_size: 'grow' });
  });

  it('absent sizing writes nothing new', () => {
    expect(generateElementorV3TemplateCandidate(doc(undefined)).template!.content[0]!.settings).toEqual({ flex_direction: 'row' });
  });

  it('validates sizing strictly', () => {
    for (const bad of [{}, { widthPx: 0 }, { widthPx: 1.234 }, { minHeightPx: -1 }, { flex: 'shrink' }, { alignSelfStretch: false }, { heightPx: 10 }]) {
      const validation = validateP15NeutralExportDocument(doc(bad));
      expect(validation.valid, JSON.stringify(bad)).toBe(false);
      expect(validation.issues.map((issue) => issue.code), JSON.stringify(bad)).toContain('P15_IR_SIZING_INVALID');
    }
    expect(validateP15NeutralExportDocument(doc({ widthPx: 1440.5, flex: 'grow' })).valid).toBe(true);
  });

  it('sizing is part of the source identity', () => {
    const base = fingerprintP15NeutralExportDocument(doc({ widthPx: 1440 }));
    expect(fingerprintP15NeutralExportDocument(doc({ widthPx: 1441 }))).not.toBe(base);
    expect(fingerprintP15NeutralExportDocument(doc({ widthPx: 1440 }, { flex: 'fixed' }))).not.toBe(base);
    expect(fingerprintP15NeutralExportDocument(doc(undefined))).not.toBe(base);
  });
});

describe('recovery M2.3a — Figma extraction end to end', () => {
  const frame = (id: string, extra: Record<string, unknown>, children: Record<string, unknown>[] = []) => ({
    id, name: id, type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO', itemSpacing: 0,
    paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN',
    fills: [], strokes: [], effects: [], children, ...extra,
  });

  it('reads Figma sizing into exact Elementor settings and keeps constraints as review', () => {
    const page = frame('page', { layoutMode: 'VERTICAL', layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'HUG', width: 1440, height: 1200 }, [
      frame('row', { layoutMode: 'HORIZONTAL', layoutSizingHorizontal: 'FILL', layoutSizingVertical: 'FIXED', width: 1440, height: 400, counterAxisAlignItems: 'CENTER' }, [
        frame('side', { layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FILL', width: 320, height: 400 }),
        frame('main', { layoutSizingHorizontal: 'FILL', layoutSizingVertical: 'HUG', width: 1120, height: 200, maxWidth: 960 }),
      ]),
    ]);
    const document = extractP15NeutralExportDocumentFromFigmaFrame(page as unknown as FrameNode, 'page');
    expect(validateP15NeutralExportDocument(document).valid).toBe(true);
    const root = document.nodes[0] as { sizing?: unknown; children: { sizing?: unknown; styleReviews?: unknown; children: { sizing?: unknown; styleReviews?: unknown }[] }[] };
    expect(root.sizing).toEqual({ widthPx: 1440 });
    expect(root.children[0]!.sizing).toEqual({ minHeightPx: 400, flex: 'fixed' });
    expect(root.children[0]!.children[0]!.sizing).toEqual({ widthPx: 320, flex: 'fixed', alignSelfStretch: true });
    expect(root.children[0]!.children[1]!.sizing).toBeUndefined();
    expect(root.children[0]!.children[1]!.styleReviews).toEqual([expect.objectContaining({ reasonCode: 'SIZE_CONSTRAINT_REQUIRES_REVIEW' })]);

    const generation = generateElementorV3TemplateCandidate(document);
    expect(generation.reviewEntries).toEqual([expect.objectContaining({ sourceNodeId: 'main', reasonCode: 'SIZE_CONSTRAINT_REQUIRES_REVIEW' })]);
    expect(generation.template).toBeNull();
  });

  it('without constraints the same page generates a candidate with the sizing settings', () => {
    const page = frame('page', { layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'HUG', width: 1440, height: 600 }, [
      frame('hero', { layoutSizingHorizontal: 'FILL', layoutSizingVertical: 'FIXED', width: 1440, height: 600,
        fills: [{ type: 'SOLID', visible: true, color: { r: 1, g: 1, b: 1 } }] }),
    ]);
    const generation = generateElementorV3TemplateCandidate(extractP15NeutralExportDocumentFromFigmaFrame(page as unknown as FrameNode, 'page'));
    expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    const root = generation.template!.content[0]!;
    expect(root.settings).toMatchObject({ content_width: 'full', width: slider(1440) });
    expect(root.elements[0]!.settings).toMatchObject({ min_height: slider(600), _flex_size: 'none' });
  });
});
