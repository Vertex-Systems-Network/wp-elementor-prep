import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { deriveP15Grid, type P15GridChildFacts } from '../src/targets/elementor/container-grid';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const flex = { type: 'FLEX', value: 1 };
const cell = (index: number, columns: number, extra: Partial<P15GridChildFacts> = {}): P15GridChildFacts => ({ rowAnchor: Math.floor(index / columns),
  columnAnchor: index % columns, rowSpan: 1, columnSpan: 1, horizontalSizing: 'FILL', verticalSizing: 'FILL', horizontalAlign: 'AUTO', verticalAlign: 'AUTO', ...extra });
const facts = (extra: Record<string, unknown> = {}) => ({ rowCount: 2, columnCount: 3, rowGap: 16, columnGap: 24, rowSizes: [flex, flex],
  columnSizes: [flex, flex, flex], children: [0, 1, 2, 3].map((index) => cell(index, 3)), ...extra });

describe('recovery M2.6b — strict grid derivation', () => {
  it('maps FLEX, FIXED and HUG tracks and the gaps', () => {
    expect(deriveP15Grid(facts())).toEqual({ grid: { columns: [{ unit: 'fr', value: 1 }, { unit: 'fr', value: 1 }, { unit: 'fr', value: 1 }],
      rows: [{ unit: 'fr', value: 1 }, { unit: 'fr', value: 1 }], columnGapPx: 24, rowGapPx: 16 } });
    const mixed = deriveP15Grid(facts({ columnSizes: [{ type: 'FIXED', value: 200 }, { type: 'FLEX', value: 2 }, { type: 'HUG' }], rowSizes: [{ type: 'FLEX' }, flex] }));
    expect(mixed.grid?.columns).toEqual([{ unit: 'px', value: 200 }, { unit: 'fr', value: 2 }, { unit: 'hug' }]);
    expect(mixed.grid?.rows[0]).toEqual({ unit: 'fr', value: 1 });
  });

  it('spans, out-of-order or skipped cells, too many children and bad tracks are review', () => {
    for (const extra of [
      { children: [cell(0, 3, { columnSpan: 2 })] },
      { children: [cell(1, 3), cell(0, 3)] },
      { children: [cell(0, 3), cell(2, 3)] },
      { children: [0, 1, 2, 3, 4, 5, 6].map((index) => cell(index, 3)) },
      { rowSizes: [flex] }, { columnSizes: [flex, flex, { type: 'FIXED', value: 0 }] }, { columnSizes: [flex, flex, { type: 'AUTO' }] },
      { rowCount: 0 }, { columnGap: -1 }, { rowGap: null },
    ]) {
      expect(deriveP15Grid(facts(extra)).review?.reasonCode, JSON.stringify(extra)).toBe('GRID_LAYOUT_REQUIRES_REVIEW');
    }
  });

  it('children that do not fill their cell with AUTO alignment are a style review on a mapped grid', () => {
    for (const extra of [{ horizontalSizing: 'FIXED' }, { verticalSizing: 'HUG' }, { horizontalAlign: 'CENTER' }, { verticalAlign: 'MAX' }]) {
      const derived = deriveP15Grid(facts({ children: [cell(0, 3, extra)] }));
      expect(derived.grid).toBeDefined();
      expect(derived.childReview?.reasonCode, JSON.stringify(extra)).toBe('GRID_CHILD_PLACEMENT_REQUIRES_REVIEW');
    }
  });
});

const grid = { columns: [{ unit: 'fr', value: 1 }, { unit: 'fr', value: 1 }], rows: [{ unit: 'fr', value: 1 }], columnGapPx: 24, rowGapPx: 16 };
const doc = (container: Record<string, unknown>): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Grid',
  documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'row', grid, children: [], ...container } as unknown as P15NeutralExportNode] });

describe('recovery M2.6b — IR and Elementor settings', () => {
  const settings = (container: Record<string, unknown> = {}) => {
    const generation = generateElementorV3TemplateCandidate(doc(container));
    expect(generation.status, JSON.stringify(generation)).toBe('GENERATED_LOCAL_CANDIDATE');
    return generation.template!.content[0]!.settings;
  };

  it('writes the Grid Container group instead of the flex group', () => {
    expect(settings()).toEqual({ container_type: 'grid', grid_columns_grid: { unit: 'fr', size: 2, sizes: [] }, grid_rows_grid: { unit: 'fr', size: 1, sizes: [] },
      grid_gaps: { column: '24', row: '16', isLinked: false, unit: 'px' }, grid_justify_items: 'stretch', grid_align_items: 'stretch' });
    expect(settings({ grid: { ...grid, columns: [{ unit: 'px', value: 200 }, { unit: 'fr', value: 1.5 }, { unit: 'hug' }] } })).toMatchObject({
      grid_columns_grid: { unit: 'custom', size: '200px 1.5fr fit-content(100%)', sizes: [] } });
  });

  it('validates the grid and keeps it in the identity', () => {
    for (const bad of [{ gapPx: 8 }, { alignItems: 'start' }, { direction: 'column' }, { grid: { ...grid, columns: [] } },
      { grid: { ...grid, rows: [{ unit: 'fr', value: 0 }] } }, { grid: { ...grid, rows: [{ unit: 'hug', value: 1 }] } },
      { grid: { ...grid, columns: [{ unit: 'em', value: 1 }] } }, { grid: { ...grid, rowGapPx: -2 } }, { grid: { ...grid, extra: 1 } }]) {
      expect(validateP15NeutralExportDocument(doc(bad)).valid, JSON.stringify(bad)).toBe(false);
    }
    expect(validateP15NeutralExportDocument(doc({})).valid).toBe(true);
    expect(fingerprintP15NeutralExportDocument(doc({}))).not.toBe(fingerprintP15NeutralExportDocument(doc({ grid: { ...grid, rowGapPx: 17 } })));
  });
});

const frame = (id: string, extra: Record<string, unknown> = {}) => ({ id, name: id, type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP',
  layoutPositioning: 'AUTO', itemSpacing: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN',
  counterAxisAlignItems: 'MIN', fills: [], strokes: [], effects: [], children: [], ...extra });
const card = (index: number) => frame(`card-${index}`, { layoutSizingHorizontal: 'FILL', layoutSizingVertical: 'FILL', gridRowAnchorIndex: Math.floor(index / 2),
  gridColumnAnchorIndex: index % 2, gridRowSpan: 1, gridColumnSpan: 1, gridChildHorizontalAlign: 'AUTO', gridChildVerticalAlign: 'AUTO',
  children: [{ id: `t-${index}`, name: 't', type: 'TEXT', visible: true, characters: `Card ${index}`, textAlignHorizontal: 'LEFT', fills: [] }] });

describe('recovery M2.6b — Figma extraction end to end', () => {
  it('maps a 2x2 card grid with padding and stretching children', () => {
    const gridFrame = frame('cards', { layoutMode: 'GRID', gridRowCount: 2, gridColumnCount: 2, gridRowGap: 16, gridColumnGap: 24,
      gridRowSizes: [flex, flex], gridColumnSizes: [flex, flex], paddingTop: 32, paddingRight: 32, paddingBottom: 32, paddingLeft: 32,
      children: [0, 1, 2, 3].map(card) });
    const document = extractP15NeutralExportDocumentFromFigmaFrame(frame('page', { children: [gridFrame] }) as unknown as FrameNode, 'section');
    const node = (document.nodes[0] as unknown as { children: Record<string, unknown>[] }).children[0]!;
    expect(node).toMatchObject({ kind: 'container', direction: 'row', grid: { columnGapPx: 24, rowGapPx: 16 }, paddingPx: { top: 32, right: 32, bottom: 32, left: 32 } });
    expect(node).not.toHaveProperty('gapPx');
    expect(node.styleReviews).toBeUndefined();
    expect((node.children as unknown[]).length).toBe(4);
    expect(validateP15NeutralExportDocument(document).valid).toBe(true);
    const generated = generateElementorV3TemplateCandidate(document);
    expect(generated.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(generated.template!.content[0]!.elements[0]!.settings).toMatchObject({ container_type: 'grid' });
  });

  it('a grid whose children are not in row-major order stays review', () => {
    const cards = [0, 1, 2, 3].map(card);
    const gridFrame = frame('cards', { layoutMode: 'GRID', gridRowCount: 2, gridColumnCount: 2, gridRowGap: 0, gridColumnGap: 0,
      gridRowSizes: [flex, flex], gridColumnSizes: [flex, flex], children: [cards[1], cards[0], cards[2], cards[3]] });
    const document = extractP15NeutralExportDocumentFromFigmaFrame(frame('page', { children: [gridFrame] }) as unknown as FrameNode, 'section');
    expect((document.nodes[0] as unknown as { children: Record<string, unknown>[] }).children[0]).toMatchObject({ kind: 'review', reasonCode: 'GRID_LAYOUT_REQUIRES_REVIEW' });
  });
});
