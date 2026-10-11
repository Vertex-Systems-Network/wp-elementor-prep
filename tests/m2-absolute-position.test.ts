import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { assignP15StackOrder, deriveP15AbsolutePosition } from '../src/targets/elementor/absolute-position';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const facts = (extra: Record<string, unknown> = {}) => ({ x: 20, y: 30, width: 100, height: 40, rotation: 0,
  constraints: { horizontal: 'MIN', vertical: 'MIN' }, parentWidth: 400, parentHeight: 300, ...extra });

describe('recovery M2.5 — absolute placement derivation', () => {
  it('MIN maps to left/top and MAX to right/bottom offsets', () => {
    expect(deriveP15AbsolutePosition(facts())).toEqual({ position: { horizontal: { edge: 'start', offsetPx: 20 }, vertical: { edge: 'start', offsetPx: 30 } } });
    expect(deriveP15AbsolutePosition(facts({ constraints: { horizontal: 'MAX', vertical: 'MAX' } })))
      .toEqual({ position: { horizontal: { edge: 'end', offsetPx: 280 }, vertical: { edge: 'end', offsetPx: 230 } } });
    // Negative offsets (content hanging outside the frame) are exact too.
    expect(deriveP15AbsolutePosition(facts({ x: -12.346, y: -8 })).position?.horizontal).toEqual({ edge: 'start', offsetPx: -12.35 });
  });

  it('subtracts a mapped parent border, because CSS offsets start inside it', () => {
    const parentBorderPx = { top: 2, right: 3, bottom: 4, left: 5 };
    expect(deriveP15AbsolutePosition(facts({ parentBorderPx })).position)
      .toEqual({ horizontal: { edge: 'start', offsetPx: 15 }, vertical: { edge: 'start', offsetPx: 28 } });
    expect(deriveP15AbsolutePosition(facts({ parentBorderPx, constraints: { horizontal: 'MAX', vertical: 'MAX' } })).position)
      .toEqual({ horizontal: { edge: 'end', offsetPx: 277 }, vertical: { edge: 'end', offsetPx: 226 } });
  });

  it('CENTER, STRETCH, SCALE, rotation, missing geometry and huge offsets are review', () => {
    for (const extra of [{ constraints: { horizontal: 'CENTER', vertical: 'MIN' } }, { constraints: { horizontal: 'MIN', vertical: 'STRETCH' } },
      { constraints: { horizontal: 'SCALE', vertical: 'MIN' } }, { constraints: undefined }, { rotation: 15 }, { x: undefined }, { parentWidth: NaN },
      { x: 20_000 }]) {
      expect(deriveP15AbsolutePosition(facts(extra)).review?.reasonCode, JSON.stringify(extra)).toBe('ABSOLUTE_POSITION_REQUIRES_REVIEW');
    }
  });

  it('stacks siblings from the first absolute child on, in layer order', () => {
    const position = { horizontal: { edge: 'start' as const, offsetPx: 0 }, vertical: { edge: 'start' as const, offsetPx: 0 } };
    const stack = assignP15StackOrder([{ kind: 'text' }, { kind: 'container', position }, { kind: 'spacer' }, { kind: 'divider' }, { kind: 'review' }, { kind: 'heading' }]);
    expect(stack.stacked).toBe(true);
    expect(stack.children.map((child) => (child as { zIndex?: number }).zIndex)).toEqual([undefined, 1, undefined, 3, undefined, 5]);
    expect(assignP15StackOrder([{ kind: 'text' }]).stacked).toBe(false);
    const image = assignP15StackOrder([{ kind: 'text', position }, { kind: 'image' }]);
    expect(image.review?.reasonCode).toBe('ABSOLUTE_STACKING_REQUIRES_REVIEW');
    expect(image.children[0]).not.toHaveProperty('zIndex');
  });
});

const position = { horizontal: { edge: 'end', offsetPx: 12 }, vertical: { edge: 'start', offsetPx: -4 } };
const doc = (child: Record<string, unknown>, root: Record<string, unknown> = {}): P15NeutralExportDocumentV1 => ({ schemaVersion: 1,
  irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Absolute', documentType: 'section',
  nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', ...root, children: [child] } as unknown as P15NeutralExportNode] });

describe('recovery M2.5 — IR and Elementor settings', () => {
  const generate = (document: P15NeutralExportDocumentV1) => {
    const generation = generateElementorV3TemplateCandidate(document);
    expect(generation.status, JSON.stringify(generation)).toBe('GENERATED_LOCAL_CANDIDATE');
    return generation.template!.content[0]!;
  };

  it('a container uses `position` and `z_index`; widgets use `_position` and `_z_index`', () => {
    const root = generate(doc({ kind: 'container', sourceNodeId: 'badge', direction: 'row', sizing: { widthPx: 80 }, position, zIndex: 2, children: [] }, { zIndex: 0 }));
    expect(root.settings).toMatchObject({ z_index: 0 });
    expect(root.elements[0]!.settings).toMatchObject({ position: 'absolute', _offset_orientation_h: 'end', _offset_x_end: { unit: 'px', size: 12, sizes: [] },
      _offset_orientation_v: 'start', _offset_y: { unit: 'px', size: -4, sizes: [] }, z_index: 2 });
    expect(root.elements[0]!.settings).not.toHaveProperty('_offset_x');

    const text = generate(doc({ kind: 'text', sourceNodeId: 't', text: 'New', position, zIndex: 1 })).elements[0]!.settings;
    expect(text).toMatchObject({ _position: 'absolute', _offset_x_end: { size: 12 }, _offset_y: { size: -4 }, _z_index: 1 });
    expect(text).not.toHaveProperty('position');
    const heading = generate(doc({ kind: 'heading', sourceNodeId: 'h', text: 'Title', level: 'h2', position, zIndex: 1 })).elements[0]!.settings;
    expect(heading).toMatchObject({ _position: 'absolute', _z_index: 1 });
    const button = generate(doc({ kind: 'button', sourceNodeId: 'b', text: 'Go', position })).elements[0]!.settings;
    expect(button).toMatchObject({ _position: 'absolute', _offset_orientation_h: 'end' });
    const divider = generate(doc({ kind: 'divider', sourceNodeId: 'd', weightPx: 1, colorHex: '#000000', zIndex: 3 })).elements[0]!.settings;
    expect(divider).toMatchObject({ _z_index: 3 });
  });

  it('validates placement and keeps it in the identity', () => {
    const text = { kind: 'text', sourceNodeId: 't', text: 'New' };
    for (const bad of [{ ...text, position: { horizontal: { edge: 'left', offsetPx: 1 }, vertical: position.vertical } },
      { ...text, position: { horizontal: position.horizontal } }, { ...text, position: { ...position, extra: 1 } },
      { ...text, position: { ...position, vertical: { edge: 'start', offsetPx: 1.234 } } }, { ...text, zIndex: -1 }, { ...text, zIndex: 1.5 },
      { kind: 'divider', sourceNodeId: 'd', weightPx: 1, colorHex: '#000000', position }]) {
      expect(validateP15NeutralExportDocument(doc(bad)).valid, JSON.stringify(bad)).toBe(false);
    }
    expect(validateP15NeutralExportDocument(doc({ ...text, position, zIndex: 1 })).valid).toBe(true);
    const plain = fingerprintP15NeutralExportDocument(doc(text));
    expect(fingerprintP15NeutralExportDocument(doc({ ...text, position }))).not.toBe(plain);
    expect(fingerprintP15NeutralExportDocument(doc({ ...text, zIndex: 1 }))).not.toBe(plain);
  });
});

const frame = (id: string, extra: Record<string, unknown> = {}) => ({ id, name: id, type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP',
  layoutPositioning: 'AUTO', itemSpacing: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN',
  counterAxisAlignItems: 'MIN', fills: [], strokes: [], effects: [], children: [], ...extra });
const text = (id: string, extra: Record<string, unknown> = {}) => ({ id, name: id, type: 'TEXT', visible: true, characters: id, textAlignHorizontal: 'LEFT', fills: [], ...extra });
const absolute = { layoutPositioning: 'ABSOLUTE', rotation: 0, constraints: { horizontal: 'MAX', vertical: 'MIN' } };

describe('recovery M2.5 — Figma extraction end to end', () => {
  const extract = (page: Record<string, unknown>) => extractP15NeutralExportDocumentFromFigmaFrame(page as unknown as FrameNode, 'section');

  it('places an absolute badge and stacks it above the content', () => {
    const badge = frame('badge', { ...absolute, x: 300, y: 8, width: 80, height: 24, layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED',
      children: [text('NEW')] });
    const card = frame('card', { width: 400, height: 200, layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED',
      strokes: [{ type: 'SOLID', visible: true, color: { r: 0, g: 0, b: 0 } }], strokeWeight: 2, strokeAlign: 'INSIDE', paddingTop: 16, paddingRight: 16,
      paddingBottom: 16, paddingLeft: 16, children: [text('Body'), badge, text('Caption')] });
    const document = extract(frame('page', { width: 400, height: 200, children: [card] }));
    const extracted = (document.nodes[0] as unknown as { children: Record<string, unknown>[] }).children[0] as { children: Record<string, unknown>[]; zIndex?: number };
    expect(extracted.zIndex).toBe(0);
    // 400 - 300 - 80 - 2px border = 18px from the right; 8 - 2px border from the top.
    expect(extracted.children[1]).toMatchObject({ kind: 'container', position: { horizontal: { edge: 'end', offsetPx: 18 }, vertical: { edge: 'start', offsetPx: 6 } }, zIndex: 1 });
    expect(extracted.children[0]).not.toHaveProperty('zIndex');
    expect(extracted.children[2]).toMatchObject({ kind: 'text', zIndex: 2 });
    expect(validateP15NeutralExportDocument(document).valid).toBe(true);
    expect(generateElementorV3TemplateCandidate(document).status).toBe('GENERATED_LOCAL_CANDIDATE');
  });

  it('an absolute text keeps its offsets, also when promoted to a heading', () => {
    const page = frame('page', { width: 400, height: 300, children: [text('Body copy', { fontSize: 16 }),
      text('h1 Big', { ...absolute, constraints: { horizontal: 'MIN', vertical: 'MAX' }, x: 10, y: 250, width: 120, height: 40 })] });
    const children = (extract(page).nodes[0] as unknown as { children: Record<string, unknown>[] }).children;
    expect(children[1]).toMatchObject({ position: { horizontal: { edge: 'start', offsetPx: 10 }, vertical: { edge: 'end', offsetPx: 10 } }, zIndex: 1 });
  });

  it('unmappable absolute content stays an explicit review', () => {
    const cases = [
      text('centred', { ...absolute, constraints: { horizontal: 'CENTER', vertical: 'MIN' }, x: 0, y: 0, width: 10, height: 10 }),
      text('rotated', { ...absolute, rotation: 45, x: 0, y: 0, width: 10, height: 10 }),
      { ...absolute, id: 'vector', name: 'vector', type: 'VECTOR', visible: true, x: 0, y: 0, width: 10, height: 10 },
      // An absolute frame without a fixed or hugging width would stretch to its parent's width.
      frame('stretchy', { ...absolute, x: 0, y: 0, width: 10, height: 10 }),
    ];
    for (const child of cases) {
      const children = (extract(frame('page', { width: 400, height: 300, children: [child] })).nodes[0] as unknown as { children: Record<string, unknown>[] }).children;
      expect(children[0], String(child.id)).toMatchObject({ kind: 'review', reasonCode: 'ABSOLUTE_POSITION_REQUIRES_REVIEW' });
    }
  });

  it('a button-named absolute frame becomes a positioned button', () => {
    const button = frame('Button', { ...absolute, x: 280, y: 20, width: 100, height: 40, layoutSizingHorizontal: 'HUG', layoutSizingVertical: 'HUG',
      paddingTop: 10, paddingRight: 20, paddingBottom: 10, paddingLeft: 20, fills: [{ type: 'SOLID', visible: true, color: { r: 0, g: 0, b: 1 } }], children: [text('Go')] });
    const children = (extract(frame('page', { width: 400, height: 300, children: [button] })).nodes[0] as unknown as { children: Record<string, unknown>[] }).children;
    expect(children[0]).toMatchObject({ kind: 'button', position: { horizontal: { edge: 'end', offsetPx: 20 }, vertical: { edge: 'start', offsetPx: 20 } }, zIndex: 1 });
  });
});
