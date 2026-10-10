import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { deriveP15ContainerSizing, deriveP15WidgetSizing, fillDistributionReview } from '../src/targets/elementor/container-sizing';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const slider = (size: number) => ({ unit: 'px', size, sizes: [] });
const facts = (extra: Partial<Parameters<typeof deriveP15ContainerSizing>[0]> = {}) => ({
  parent: { direction: 'row' as const, alignItems: 'start' },
  horizontal: undefined, vertical: undefined, width: 300, height: 200, ...extra,
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

describe('recovery M2.3b — HUG containers', () => {
  it('a HUG width fits its content and HUG on the main axis never shrinks', () => {
    expect(deriveP15ContainerSizing(facts({ horizontal: 'HUG', vertical: 'HUG' })).sizing).toEqual({ hugWidth: true, flex: 'fixed' });
    const column = { direction: 'column' as const, alignItems: 'center' };
    expect(deriveP15ContainerSizing(facts({ parent: column, horizontal: 'HUG', vertical: 'HUG' })).sizing).toEqual({ hugWidth: true, flex: 'fixed' });
    expect(deriveP15ContainerSizing(facts({ parent: null, horizontal: 'HUG', width: 800 })).sizing).toEqual({ widthPx: 800 });
  });

  it('writes content_width full and a fit-content custom width', () => {
    const generation = generateElementorV3TemplateCandidate(doc(undefined, { hugWidth: true, flex: 'fixed' }));
    expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(generation.template!.content[0]!.elements[0]!.settings).toEqual({ flex_direction: 'column', content_width: 'full',
      width: { unit: 'custom', size: 'fit-content', sizes: [] }, _flex_size: 'none' });
    expect(validateP15NeutralExportDocument(doc(undefined, { hugWidth: true, widthPx: 10 })).valid).toBe(false);
  });
});

describe('recovery M2.3b — heading and text widget sizing', () => {
  const row = { direction: 'row' as const, alignItems: 'start' };
  const column = { direction: 'column' as const, alignItems: 'start' };

  it('maps widths along a row: FIXED px, HUG keeps its size, FILL takes an equal share', () => {
    expect(deriveP15WidgetSizing(facts({ parent: row, horizontal: 'FIXED', vertical: 'HUG', width: 180 })))
      .toEqual({ sizing: { widthPx: 180, flex: 'fixed' }, reviews: [] });
    expect(deriveP15WidgetSizing(facts({ parent: row, horizontal: 'HUG', vertical: 'HUG' })).sizing).toEqual({ flex: 'fixed' });
    expect(deriveP15WidgetSizing(facts({ parent: row, horizontal: 'FILL', vertical: 'FILL' })).sizing).toEqual({ fillWidth: true, alignSelfStretch: true });
  });

  it('maps widths across a column: FIXED px, FILL stretches, HUG fits', () => {
    expect(deriveP15WidgetSizing(facts({ parent: column, horizontal: 'FIXED', vertical: 'HUG', width: 320 })).sizing).toEqual({ widthPx: 320, flex: 'fixed' });
    expect(deriveP15WidgetSizing(facts({ parent: column, horizontal: 'FILL', vertical: 'HUG' })).sizing).toEqual({ alignSelfStretch: true, flex: 'fixed' });
    expect(deriveP15WidgetSizing(facts({ parent: { direction: 'column', alignItems: 'stretch' }, horizontal: 'FILL', vertical: 'HUG' })).sizing).toEqual({ flex: 'fixed' });
    expect(deriveP15WidgetSizing(facts({ parent: column, horizontal: 'HUG', vertical: 'FILL' })).sizing).toEqual({ flex: 'grow' });
  });

  it('a fixed text height and any constraint are review', () => {
    expect(deriveP15WidgetSizing(facts({ parent: column, horizontal: 'FILL', vertical: 'FIXED' })).reviews.map((review) => review.reasonCode))
      .toEqual(['SIZE_WIDGET_HEIGHT_REQUIRES_REVIEW']);
    expect(deriveP15WidgetSizing(facts({ parent: column, horizontal: 'HUG', vertical: 'HUG', minHeight: 10 })).reviews.map((review) => review.reasonCode))
      .toEqual(['SIZE_CONSTRAINT_REQUIRES_REVIEW']);
    expect(deriveP15WidgetSizing(facts({ parent: null }))).toEqual({ reviews: [] });
  });

  it('writes _element_width, _element_custom_width and the flex-item settings', () => {
    const page = (child: Record<string, unknown>): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'w', documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'row', children: [child] }] } as unknown as P15NeutralExportDocumentV1);
    const widget = (child: Record<string, unknown>) => {
      const generation = generateElementorV3TemplateCandidate(page(child));
      expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
      return generation.template!.content[0]!.elements[0]!.settings;
    };
    expect(widget({ kind: 'text', sourceNodeId: 't', text: 'Hi', sizing: { widthPx: 180, flex: 'fixed' } }))
      .toMatchObject({ _element_width: 'initial', _element_custom_width: slider(180), _flex_size: 'none' });
    expect(widget({ kind: 'heading', sourceNodeId: 'h', text: 'Hi', level: 'h2', sizing: { fillWidth: true, alignSelfStretch: true } }))
      .toMatchObject({ _element_width: 'initial', _element_custom_width: { unit: '%', size: 100, sizes: [] }, _flex_align_self: 'stretch' });
    expect(widget({ kind: 'text', sourceNodeId: 't', text: 'Hi', sizing: { flex: 'grow' } })).toMatchObject({ _flex_size: 'grow' });
    for (const bad of [{ fillWidth: true, widthPx: 10 }, { hugWidth: true }, { minHeightPx: 10 }]) {
      expect(validateP15NeutralExportDocument(page({ kind: 'text', sourceNodeId: 't', text: 'Hi', sizing: bad })).valid, JSON.stringify(bad)).toBe(false);
    }
  });

  it('sizing follows a text into its detected heading and stays in the identity', () => {
    const segment = (size: number) => ({ characters: 'x', fontName: { family: 'Inter', style: 'Regular' }, fontWeight: 400, fontStyle: 'REGULAR', fontSize: size,
      lineHeight: { unit: 'AUTO' }, letterSpacing: { unit: 'PIXELS', value: 0 }, textCase: 'ORIGINAL', textDecoration: 'NONE', fills: [], hyperlink: null });
    const text = (id: string, size: number, sizing: Record<string, unknown>) => ({ id, name: id, type: 'TEXT', visible: true, characters: 'x',
      textAlignHorizontal: 'LEFT', fills: [], width: 200, height: 20, getStyledTextSegments: () => [{ ...segment(size), characters: 'x' }], ...sizing });
    const root = { id: 'page', name: 'page', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO', itemSpacing: 0,
      paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN', fills: [], strokes: [], effects: [],
      children: [text('title', 40, { layoutSizingHorizontal: 'FILL', layoutSizingVertical: 'HUG' }), text('body', 16, { layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'HUG' })] };
    const document = extractP15NeutralExportDocumentFromFigmaFrame(root as unknown as FrameNode, 'section');
    const [title, body] = (document.nodes[0] as { children: { kind: string; sizing?: unknown }[] }).children;
    expect(title).toMatchObject({ kind: 'heading', sizing: { alignSelfStretch: true, flex: 'fixed' } });
    expect(body).toMatchObject({ kind: 'text', sizing: { widthPx: 200, flex: 'fixed' } });
    const other = JSON.parse(JSON.stringify(document)) as P15NeutralExportDocumentV1;
    (other.nodes[0] as { children: { sizing?: unknown }[] }).children[1]!.sizing = { widthPx: 201, flex: 'fixed' };
    expect(fingerprintP15NeutralExportDocument(other)).not.toBe(fingerprintP15NeutralExportDocument(document));
  });
});
