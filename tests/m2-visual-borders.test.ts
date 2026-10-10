import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { deriveP15ContainerBorder, deriveP15CornerRadii, type P15StrokeFacts } from '../src/targets/elementor/container-visual-style';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { detectP15Buttons } from '../src/targets/elementor/semantic-detection';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const padding = { top: 16, right: 16, bottom: 16, left: 16 };
const stroke = (extra: Partial<P15StrokeFacts> = {}): P15StrokeFacts => ({ paints: ['#112233'], weight: 2, topWeight: undefined, rightWeight: undefined,
  bottomWeight: undefined, leftWeight: undefined, align: 'INSIDE', dashPattern: [], includedInLayout: false, ...extra });
const dims = (top: number, right = top, bottom = top, left = right) =>
  ({ unit: 'px', top: String(top), right: String(right), bottom: String(bottom), left: String(left), isLinked: top === right && right === bottom && bottom === left });

describe('recovery M2.4a — container border derivation', () => {
  it('an INSIDE solid stroke becomes a border and lowers the padding by its width', () => {
    expect(deriveP15ContainerBorder(stroke(), padding)).toEqual({
      border: { style: 'solid', widthPx: { top: 2, right: 2, bottom: 2, left: 2 }, colorHex: '#112233' },
      paddingPx: { top: 14, right: 14, bottom: 14, left: 14 },
    });
    expect(deriveP15ContainerBorder(stroke({ includedInLayout: true }), padding)).toEqual({
      border: { style: 'solid', widthPx: { top: 2, right: 2, bottom: 2, left: 2 }, colorHex: '#112233' } });
  });

  it('individual stroke weights map per side; all-zero or no stroke is nothing', () => {
    expect(deriveP15ContainerBorder(stroke({ topWeight: 0, rightWeight: 0, bottomWeight: 1, leftWeight: 0 }), padding)).toMatchObject({
      border: { widthPx: { top: 0, right: 0, bottom: 1, left: 0 } }, paddingPx: { top: 16, right: 16, bottom: 15, left: 16 } });
    expect(deriveP15ContainerBorder(stroke({ weight: 0 }), padding)).toEqual({});
    expect(deriveP15ContainerBorder(stroke({ paints: [] }), padding)).toEqual({});
  });

  it('anything without an exact CSS border is review', () => {
    for (const extra of [{ align: 'OUTSIDE' }, { align: 'CENTER' }, { dashPattern: [4, 4] }, { paints: [null] }, { paints: ['#000000', '#ffffff'] },
      { paints: 'MIXED' as const }, { weight: 101 }, { weight: 20 }]) {
      expect(deriveP15ContainerBorder(stroke(extra as Partial<P15StrokeFacts>), padding).review?.reasonCode, JSON.stringify(extra)).toBe('STROKE_REQUIRES_REVIEW');
    }
  });

  it('non-uniform radii map unless a corner exceeds half the shorter side', () => {
    const radii = { topLeft: 8, topRight: 8, bottomRight: 0, bottomLeft: 0 };
    expect(deriveP15CornerRadii(radii, 200, 100)).toEqual({ radii });
    expect(deriveP15CornerRadii({ ...radii, topLeft: 60 }, 200, 100).review?.reasonCode).toBe('NONUNIFORM_CORNER_RADIUS_REQUIRES_REVIEW');
  });
});

const doc = (container: Record<string, unknown>): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Styles',
  documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [], ...container } as P15NeutralExportNode] });

describe('recovery M2.4a — IR and Elementor settings', () => {
  it('writes border_border, border_width, border_color, border_radius and overflow', () => {
    const generation = generateElementorV3TemplateCandidate(doc({
      border: { style: 'solid', widthPx: { top: 1, right: 0, bottom: 1, left: 0 }, colorHex: '#112233' },
      cornerRadiiPx: { topLeft: 8, topRight: 4, bottomRight: 2, bottomLeft: 0 }, clipsContent: true }));
    expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(generation.template!.content[0]!.settings).toEqual({ flex_direction: 'column', border_border: 'solid', border_width: dims(1, 0, 1, 0),
      border_color: '#112233', border_radius: dims(8, 4, 2, 0), overflow: 'hidden' });
  });

  it('validates the new facts strictly and keeps them in the identity', () => {
    const border = { style: 'solid', widthPx: { top: 1, right: 1, bottom: 1, left: 1 }, colorHex: '#112233' };
    for (const bad of [{ border: { ...border, style: 'dashed' } }, { border: { ...border, colorHex: '#AABBCC' } },
      { border: { ...border, widthPx: { top: 0, right: 0, bottom: 0, left: 0 } } }, { border: { ...border, widthPx: { top: 101, right: 1, bottom: 1, left: 1 } } },
      { cornerRadiiPx: { topLeft: 1, topRight: 1, bottomRight: 1, bottomLeft: 1 } }, { cornerRadiiPx: { topLeft: 1, topRight: 2, bottomRight: 1, bottomLeft: 1 }, cornerRadiusPx: 4 },
      { clipsContent: false }]) {
      const validation = validateP15NeutralExportDocument(doc(bad));
      expect(validation.valid, JSON.stringify(bad)).toBe(false);
      expect(validation.issues.map((issue) => issue.code), JSON.stringify(bad)).toContain('P15_IR_STYLE_INVALID');
    }
    const base = fingerprintP15NeutralExportDocument(doc({ border }));
    expect(fingerprintP15NeutralExportDocument(doc({ border: { ...border, colorHex: '#112234' } }))).not.toBe(base);
    expect(fingerprintP15NeutralExportDocument(doc({ border, clipsContent: true }))).not.toBe(base);
    expect(fingerprintP15NeutralExportDocument(doc({ border, cornerRadiiPx: { topLeft: 1, topRight: 2, bottomRight: 1, bottomLeft: 1 } }))).not.toBe(base);
  });

  it('a bordered button-named frame stays an exact container with a semantic review', () => {
    const label: P15NeutralExportNode = { kind: 'text', sourceNodeId: 'label', text: 'Go', align: 'center' };
    const detected = detectP15Buttons(doc({ children: [{ kind: 'container', sourceNodeId: 'cta', direction: 'row', paddingPx: { top: 10, right: 20, bottom: 10, left: 20 },
      backgroundColorHex: '#000000', border: { style: 'solid', widthPx: { top: 1, right: 1, bottom: 1, left: 1 }, colorHex: '#ffffff' }, children: [label] }] }),
    new Map([['cta', 'Button']]));
    const cta = (detected.nodes[0] as { children: P15NeutralExportNode[] }).children[0]!;
    expect(cta).toMatchObject({ kind: 'container', border: { colorHex: '#ffffff' }, styleReviews: [{ reasonCode: 'BUTTON_DETECTION_REQUIRES_REVIEW' }] });
  });
});

describe('recovery M2.4a — Figma extraction end to end', () => {
  const card = (extra: Record<string, unknown>) => ({ id: 'card', name: 'Card', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP',
    layoutPositioning: 'AUTO', itemSpacing: 0, paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24, primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: 'MIN', fills: [{ type: 'SOLID', visible: true, color: { r: 1, g: 1, b: 1 } }], effects: [], width: 300, height: 200,
    children: [{ id: 't', name: 't', type: 'TEXT', visible: true, characters: 'Hi', textAlignHorizontal: 'LEFT', fills: [], x: 24, y: 24, width: 20, height: 20 }], ...extra });
  const page = (child: Record<string, unknown>) => ({ ...card({}), id: 'page', name: 'Page', fills: [], paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
    width: 800, height: 600, strokes: [], children: [child] });
  const extracted = (extra: Record<string, unknown>) =>
    (extractP15NeutralExportDocumentFromFigmaFrame(page(card(extra)) as unknown as FrameNode, 'section').nodes[0] as unknown as { children: Record<string, unknown>[] }).children[0]!;

  it('extracts a bordered, rounded, clipping card into exact facts', () => {
    const node = extracted({ strokes: [{ type: 'SOLID', visible: true, color: { r: 0, g: 0, b: 0 } }], strokeWeight: 1, strokeAlign: 'INSIDE',
      dashPattern: [], strokesIncludedInLayout: false, topLeftRadius: 12, topRightRadius: 12, bottomRightRadius: 0, bottomLeftRadius: 0, clipsContent: true });
    expect(node).toMatchObject({ kind: 'container', paddingPx: { top: 23, right: 23, bottom: 23, left: 23 },
      border: { style: 'solid', widthPx: { top: 1, right: 1, bottom: 1, left: 1 }, colorHex: '#000000' },
      cornerRadiiPx: { topLeft: 12, topRight: 12, bottomRight: 0, bottomLeft: 0 }, clipsContent: true });
    expect(node.styleReviews).toBeUndefined();
  });

  it('an invisible clip writes nothing; an outside stroke stays review', () => {
    expect(extracted({ clipsContent: true }).clipsContent).toBeUndefined();
    const outside = extracted({ strokes: [{ type: 'SOLID', visible: true, color: { r: 0, g: 0, b: 0 } }], strokeWeight: 1, strokeAlign: 'OUTSIDE' });
    expect(outside.border).toBeUndefined();
    expect(outside.styleReviews).toEqual([expect.objectContaining({ reasonCode: 'STROKE_REQUIRES_REVIEW' })]);
  });
});
