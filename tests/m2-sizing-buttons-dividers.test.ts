import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { deriveP15ButtonSizing, type P15ButtonFrameFacts, type P15ContainerSizingFacts } from '../src/targets/elementor/container-sizing';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { detectP15Buttons } from '../src/targets/elementor/semantic-detection';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const slider = (size: number) => ({ unit: 'px', size, sizes: [] });
const column = { direction: 'column' as const, alignItems: 'start' };
const row = { direction: 'row' as const, alignItems: 'center' };
const facts = (extra: Partial<P15ContainerSizingFacts> = {}): P15ContainerSizingFacts =>
  ({ parent: column, horizontal: 'HUG', vertical: 'HUG', width: 160, height: 48, ...extra });
const frame = (extra: Partial<P15ButtonFrameFacts> = {}): P15ButtonFrameFacts =>
  ({ direction: 'row', justifyContent: 'center', alignItems: 'center', labelAlign: 'center', paddingTopPx: 12, paddingBottomPx: 12, lineHeightPx: 24, ...extra });

describe('recovery M2.3d — button sizing derivation', () => {
  it('a HUG button keeps its natural size and never shrinks', () => {
    expect(deriveP15ButtonSizing(facts(), frame())).toEqual({ sizing: { flex: 'fixed' }, reviews: [] });
  });

  it('a FIXED or FILL width fills the widget with align justify and keeps the label alignment', () => {
    expect(deriveP15ButtonSizing(facts({ horizontal: 'FIXED', width: 240 }), frame()).sizing).toEqual({ widthPx: 240, flex: 'fixed', fullWidth: true });
    expect(deriveP15ButtonSizing(facts({ horizontal: 'FILL' }), frame({ justifyContent: 'start' })).sizing)
      .toEqual({ flex: 'fixed', alignSelfStretch: true, fullWidth: true, contentAlign: 'start' });
    expect(deriveP15ButtonSizing(facts({ parent: row, horizontal: 'FILL' }), frame({ justifyContent: 'end' })).sizing)
      .toEqual({ fillWidth: true, fullWidth: true, contentAlign: 'end' });
    expect(deriveP15ButtonSizing(facts({ horizontal: 'FILL' }), frame({ direction: 'column', alignItems: 'stretch', labelAlign: 'end' })).sizing?.contentAlign).toBe('end');
    expect(deriveP15ButtonSizing(facts({ horizontal: 'FILL' }), frame({ direction: 'column', alignItems: 'stretch', labelAlign: 'justify' })).reviews[0]?.reasonCode)
      .toBe('BUTTON_LABEL_ALIGNMENT_REQUIRES_REVIEW');
  });

  it('a fixed height must equal padding plus line height; a FILL height and constraints are review', () => {
    expect(deriveP15ButtonSizing(facts({ vertical: 'FIXED', height: 48 }), frame()).reviews).toEqual([]);
    const codes = (extra: Partial<P15ContainerSizingFacts>, frameExtra: Partial<P15ButtonFrameFacts> = {}) =>
      deriveP15ButtonSizing(facts(extra), frame(frameExtra)).reviews.map((review) => review.reasonCode);
    expect(codes({ vertical: 'FIXED', height: 56 })).toEqual(['SIZE_BUTTON_HEIGHT_REQUIRES_REVIEW']);
    expect(codes({ vertical: 'FIXED', height: 48 }, { lineHeightPx: undefined })).toEqual(['SIZE_BUTTON_HEIGHT_REQUIRES_REVIEW']);
    expect(codes({ parent: row, vertical: 'FILL' })).toEqual(['SIZE_BUTTON_HEIGHT_REQUIRES_REVIEW']);
    expect(codes({ maxWidth: 300 })).toEqual(['SIZE_CONSTRAINT_REQUIRES_REVIEW']);
  });
});

const padding = { top: 12, right: 24, bottom: 12, left: 24 };
const label: P15NeutralExportNode = { kind: 'text', sourceNodeId: 'label', text: 'Go', align: 'center', typography: { fontSizePx: 16, lineHeightPx: 24 } };
const cta = (extra: Record<string, unknown> = {}): P15NeutralExportNode =>
  ({ kind: 'container', sourceNodeId: 'cta', direction: 'row', justifyContent: 'center', alignItems: 'center', paddingPx: padding,
    backgroundColorHex: '#1A2B3C', children: [label], ...extra }) as P15NeutralExportNode;
const doc = (child: P15NeutralExportNode): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Buttons',
  documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', alignItems: 'start', children: [child] }] });
const first = (document: P15NeutralExportDocumentV1) => (document.nodes[0] as { children: P15NeutralExportNode[] }).children[0]!;
const named = new Map([['cta', 'Button']]);

describe('recovery M2.3d — buttons carry their frame sizing', () => {
  it('detection derives button sizing from the frame facts and generation writes it', () => {
    const detected = detectP15Buttons(doc(cta()), named, new Map([['cta', facts({ horizontal: 'FIXED', width: 240, vertical: 'FIXED', height: 48 })]]));
    expect(first(detected)).toMatchObject({ kind: 'button', sizing: { widthPx: 240, flex: 'fixed', fullWidth: true } });
    expect(validateP15NeutralExportDocument(detected).valid).toBe(true);
    const generation = generateElementorV3TemplateCandidate(detected);
    expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(generation.template!.content[0]!.elements[0]!.settings).toMatchObject({
      _element_width: 'initial', _element_custom_width: slider(240), _flex_size: 'none', align: 'justify' });
  });

  it('a button whose sizing has no exact equivalent stays a button with an explicit review', () => {
    const detected = detectP15Buttons(doc(cta({ styleReviews: [{ reasonCode: 'SIZE_CONSTRAINT_REQUIRES_REVIEW', detail: 'x' }] })), named,
      new Map([['cta', facts({ vertical: 'FIXED', height: 60, maxWidth: 300 })]]));
    const button = first(detected);
    expect(button).toMatchObject({ kind: 'button' });
    expect((button as { styleReviews?: { reasonCode: string }[] }).styleReviews?.map((review) => review.reasonCode))
      .toEqual(['SIZE_BUTTON_HEIGHT_REQUIRES_REVIEW', 'SIZE_CONSTRAINT_REQUIRES_REVIEW']);
    const generation = generateElementorV3TemplateCandidate(detected);
    expect(generation.reviewEntries.map((entry) => `${entry.sourceNodeId}:${entry.reasonCode}`))
      .toEqual(['cta:SIZE_BUTTON_HEIGHT_REQUIRES_REVIEW', 'cta:SIZE_CONSTRAINT_REQUIRES_REVIEW']);
  });

  it('validates button sizing and keeps it in the identity', () => {
    const button = (extra: Record<string, unknown>) => doc({ kind: 'button', sourceNodeId: 'b', text: 'Go', ...extra } as P15NeutralExportNode);
    for (const bad of [{ sizing: { widthPx: 10 } }, { sizing: { contentAlign: 'start' } }, { sizing: { fullWidth: true, contentAlign: 'center' } },
      { sizing: { fullWidth: true }, align: 'center' }, { sizing: { hugWidth: true } }]) {
      expect(validateP15NeutralExportDocument(button(bad)).valid, JSON.stringify(bad)).toBe(false);
    }
    expect(validateP15NeutralExportDocument(button({ sizing: { fillWidth: true, fullWidth: true, contentAlign: 'end' } })).valid).toBe(true);
    expect(fingerprintP15NeutralExportDocument(button({ sizing: { fullWidth: true } })))
      .not.toBe(fingerprintP15NeutralExportDocument(button({ sizing: { fullWidth: true, contentAlign: 'end' } })));
    expect(fingerprintP15NeutralExportDocument(button({ styleReviews: [{ reasonCode: 'SIZE_BUTTON_HEIGHT_REQUIRES_REVIEW', detail: 'x' }] })))
      .not.toBe(fingerprintP15NeutralExportDocument(button({})));
  });

  it('a Figma button frame is extracted end to end with its sizing', () => {
    const segment = { characters: 'Go', fontName: { family: 'Inter', style: 'Regular' }, fontWeight: 400, fontStyle: 'REGULAR', fontSize: 16,
      lineHeight: { unit: 'PIXELS', value: 24 }, letterSpacing: { unit: 'PIXELS', value: 0 }, textCase: 'ORIGINAL', textDecoration: 'NONE', fills: [], hyperlink: null };
    const base = { visible: true, layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO', itemSpacing: 0, strokes: [], effects: [] };
    const page = { ...base, id: 'page', name: 'Page', type: 'FRAME', layoutMode: 'VERTICAL', paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
      primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN', fills: [], width: 800, height: 200, layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'HUG',
      children: [{ ...base, id: 'cta', name: 'Button', type: 'FRAME', layoutMode: 'HORIZONTAL', paddingTop: 12, paddingRight: 24, paddingBottom: 12, paddingLeft: 24,
        primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER', fills: [{ type: 'SOLID', visible: true, color: { r: 0, g: 0, b: 0 } }],
        width: 800, height: 48, layoutSizingHorizontal: 'FILL', layoutSizingVertical: 'FIXED',
        children: [{ id: 'label', name: 'Label', type: 'TEXT', visible: true, characters: 'Go', textAlignHorizontal: 'CENTER', fills: [], width: 20, height: 24,
          layoutSizingHorizontal: 'HUG', layoutSizingVertical: 'HUG', getStyledTextSegments: () => [segment] }] }] };
    const document = extractP15NeutralExportDocumentFromFigmaFrame(page as unknown as FrameNode, 'section');
    expect(first(document)).toMatchObject({ kind: 'button', sizing: { flex: 'fixed', alignSelfStretch: true, fullWidth: true } });
    expect((first(document) as { styleReviews?: unknown }).styleReviews).toBeUndefined();
    expect(generateElementorV3TemplateCandidate(document).status).toBe('GENERATED_LOCAL_CANDIDATE');
  });
});

describe('recovery M2.3d — divider placement and gap repair', () => {
  const solid = { type: 'SOLID', visible: true, color: { r: 0, g: 0, b: 0 } };
  const line = (extra: Record<string, unknown> = {}) => ({ id: 'l', name: 'Line', type: 'LINE', visible: true, width: 320, height: 0, strokeWeight: 1,
    strokes: [solid], effects: [], ...extra });
  const layout = (children: Record<string, unknown>[], extra: Record<string, unknown> = {}) => ({ id: 'f', name: 'F', type: 'FRAME', visible: true,
    layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO', itemSpacing: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
    primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN', fills: [], children, ...extra });
  const extracted = (children: Record<string, unknown>[], extra?: Record<string, unknown>) =>
    first(extractP15NeutralExportDocumentFromFigmaFrame(layout(children, extra) as unknown as FrameNode, 'section'));

  it('a divider takes its column cross alignment, a FILL line keeps 100% width, a row divider is review', () => {
    expect(extracted([line()])).toEqual({ kind: 'divider', sourceNodeId: 'l', weightPx: 1, colorHex: '#000000', widthPx: 320 });
    expect(extracted([line()], { counterAxisAlignItems: 'CENTER' })).toMatchObject({ widthPx: 320, align: 'center' });
    expect(extracted([line()], { counterAxisAlignItems: 'MAX' })).toMatchObject({ align: 'end' });
    expect(extracted([line({ layoutSizingHorizontal: 'FILL' })], { counterAxisAlignItems: 'CENTER' }))
      .toEqual({ kind: 'divider', sourceNodeId: 'l', weightPx: 1, colorHex: '#000000' });
    expect(extracted([line()], { layoutMode: 'HORIZONTAL' })).toMatchObject({ kind: 'review', reasonCode: 'DIVIDER_IN_ROW_REQUIRES_REVIEW' });
  });

  it('writes gap 0 and the Elementor divider align', () => {
    const generation = generateElementorV3TemplateCandidate(doc({ kind: 'divider', sourceNodeId: 'd', weightPx: 1, colorHex: '#000000', widthPx: 320, align: 'end' }));
    expect(generation.template!.content[0]!.elements[0]!.settings).toEqual({ style: 'solid', weight: slider(1), color: '#000000', width: slider(320),
      gap: slider(0), align: 'right' });
    expect(validateP15NeutralExportDocument(doc({ kind: 'divider', sourceNodeId: 'd', weightPx: 1, colorHex: '#000000', align: 'left' } as never)).valid).toBe(false);
  });
});
