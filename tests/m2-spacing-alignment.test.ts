import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { assignP15Overlap } from '../src/targets/elementor/container-spacing';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

describe('recovery M2.7 — overlap derivation', () => {
  const options = { direction: 'row' as const, wrapped: false, reverseZIndex: false };

  it('gives every in-flow Container after the first a negative leading margin', () => {
    const position = {};
    const result = assignP15Overlap([{ kind: 'container' }, { kind: 'review' }, { kind: 'container' }, { kind: 'text', position }, { kind: 'container' }], -12, options);
    expect(result.review).toBeUndefined();
    expect(result.children.map((child) => (child as { marginPx?: unknown }).marginPx)).toEqual([undefined, undefined,
      { top: 0, right: 0, bottom: 0, left: -12 }, undefined, { top: 0, right: 0, bottom: 0, left: -12 }]);
    expect(assignP15Overlap([{ kind: 'container' }, { kind: 'container' }], -4, { ...options, direction: 'column' }).children[1])
      .toMatchObject({ marginPx: { top: -4, left: 0 } });
    // The first in-flow child may be anything; it carries no margin.
    expect(assignP15Overlap([{ kind: 'text' }, { kind: 'container' }], -4, options).review).toBeUndefined();
  });

  it('overlapping widgets, wrapped rows and reversed stacking are review', () => {
    for (const [children, extra] of [
      [[{ kind: 'container' }, { kind: 'text' }], {}],
      [[{ kind: 'container' }, { kind: 'container' }], { wrapped: true }],
      [[{ kind: 'container' }, { kind: 'container' }], { reverseZIndex: true }],
    ] as const) {
      const result = assignP15Overlap(children, -4, { ...options, ...extra });
      expect(result.review?.reasonCode).toBe('NEGATIVE_SPACING_REQUIRES_REVIEW');
      expect(result.children.every((child) => !('marginPx' in child))).toBe(true);
    }
  });
});

const doc = (child: Record<string, unknown>): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Spacing',
  documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'row', gapPx: 0, children: [child] } as unknown as P15NeutralExportNode] });

describe('recovery M2.7 — IR and Elementor settings', () => {
  it('writes the Container margin and validates it', () => {
    const child = { kind: 'container', sourceNodeId: 'c', direction: 'row', marginPx: { top: 0, right: 0, bottom: 0, left: -12 }, children: [] };
    const generation = generateElementorV3TemplateCandidate(doc(child));
    expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(generation.template!.content[0]!.elements[0]!.settings).toMatchObject({ margin: { unit: 'px', top: '0', right: '0', bottom: '0', left: '-12', isLinked: false } });
    for (const bad of [{ top: 0, right: 0, bottom: 0 }, { top: 0, right: 0, bottom: 0, left: -5000 }, { top: 0, right: 0, bottom: 0, left: 1.234 }]) {
      expect(validateP15NeutralExportDocument(doc({ ...child, marginPx: bad })).valid, JSON.stringify(bad)).toBe(false);
    }
    expect(fingerprintP15NeutralExportDocument(doc(child))).not.toBe(fingerprintP15NeutralExportDocument(doc({ ...child, marginPx: undefined })));
  });
});

const frame = (id: string, extra: Record<string, unknown> = {}) => ({ id, name: id, type: 'FRAME', visible: true, layoutMode: 'HORIZONTAL', layoutWrap: 'NO_WRAP',
  layoutPositioning: 'AUTO', itemSpacing: 16, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN',
  counterAxisAlignItems: 'MIN', fills: [], strokes: [], effects: [], children: [], ...extra });
const avatar = (id: string, extra: Record<string, unknown> = {}) => frame(id, { width: 40, height: 40, layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED', ...extra });
const text = (id: string, extra: Record<string, unknown> = {}) => ({ id, name: id, type: 'TEXT', visible: true, characters: id, textAlignHorizontal: 'LEFT', fills: [], ...extra });
const extractChild = (child: Record<string, unknown>) => {
  const document = extractP15NeutralExportDocumentFromFigmaFrame(frame('page', { layoutMode: 'VERTICAL', children: [child] }) as unknown as FrameNode, 'section');
  return { document, node: (document.nodes[0] as unknown as { children: Record<string, unknown>[] }).children[0]! };
};

describe('recovery M2.7 — Figma extraction end to end', () => {
  it('distributed main axes write gap 0; SPACE_EVENLY and SPACE_AROUND map', () => {
    for (const [figma, css] of [['SPACE_BETWEEN', 'space-between'], ['SPACE_EVENLY', 'space-evenly'], ['SPACE_AROUND', 'space-around']] as const) {
      const { node } = extractChild(frame('row', { primaryAxisAlignItems: figma, children: [avatar('a'), avatar('b')] }));
      expect(node).toMatchObject({ justifyContent: css, gapPx: 0 });
    }
  });

  it('negative spacing between frames becomes an overlap; with widgets it is a style review', () => {
    const stacked = extractChild(frame('avatars', { itemSpacing: -8, children: [avatar('a'), avatar('b'), avatar('c')] }));
    const children = stacked.node.children as Record<string, unknown>[];
    expect(stacked.node).toMatchObject({ gapPx: 0 });
    expect(stacked.node.styleReviews).toBeUndefined();
    expect(children[0]).not.toHaveProperty('marginPx');
    expect(children[1]).toMatchObject({ marginPx: { top: 0, right: 0, bottom: 0, left: -8 } });
    expect(validateP15NeutralExportDocument(stacked.document).valid).toBe(true);
    expect(generateElementorV3TemplateCandidate(stacked.document).status).toBe('GENERATED_LOCAL_CANDIDATE');

    const mixed = extractChild(frame('mixed', { itemSpacing: -8, children: [avatar('a'), text('b')] })).node;
    expect(mixed).toMatchObject({ gapPx: 0, styleReviews: [expect.objectContaining({ reasonCode: 'NEGATIVE_SPACING_REQUIRES_REVIEW' })] });
    expect(extractChild(frame('far', { itemSpacing: -5000, children: [] })).node).toMatchObject({ kind: 'review', reasonCode: 'SPACING_OUT_OF_RANGE' });
  });

  it('baseline keeps the layout as start with a style review', () => {
    const { node } = extractChild(frame('row', { counterAxisAlignItems: 'BASELINE', children: [text('a'), text('b')] }));
    expect(node).toMatchObject({ kind: 'container', alignItems: 'start', styleReviews: [expect.objectContaining({ reasonCode: 'BASELINE_ALIGNMENT_REQUIRES_REVIEW' })] });
    expect((node.children as unknown[]).length).toBe(2);
  });

  it('older layoutGrow / layoutAlign STRETCH still mean FILL when layoutSizing is absent', () => {
    const legacy = { width: 100, height: 50, layoutGrow: 1, layoutAlign: 'STRETCH', children: [text('inside')] };
    // Along a column, layoutGrow 1 grows; across it, a Container already fills the width by default.
    const column = extractChild(frame('column', { layoutMode: 'VERTICAL', counterAxisAlignItems: 'CENTER', children: [frame('grow', legacy)] })).node;
    expect((column.children as Record<string, unknown>[])[0]).toMatchObject({ sizing: { flex: 'grow' } });
    // Across a row under a non-stretch parent, layoutAlign STRETCH stretches.
    const row = extractChild(frame('row', { counterAxisAlignItems: 'CENTER', children: [frame('grow', { ...legacy, layoutGrow: 0 })] })).node;
    expect((row.children as Record<string, unknown>[])[0]).toMatchObject({ sizing: { alignSelfStretch: true } });
  });

});
