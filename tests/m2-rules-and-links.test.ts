import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const slider = (size: number) => ({ unit: 'px', size, sizes: [] });
const solid = (r: number, g: number, b: number, extra: Record<string, unknown> = {}) => ({ type: 'SOLID', visible: true, color: { r, g, b }, ...extra });
function frame(children: Record<string, unknown>[], layoutMode = 'VERTICAL'): FrameNode {
  return { id: 'f', name: 'Frame', type: 'FRAME', visible: true, layoutMode, layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO', itemSpacing: 0,
    paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN', fills: [], children } as unknown as FrameNode;
}
const kids = (document: P15NeutralExportDocumentV1) => (document.nodes[0] as { children: P15NeutralExportNode[] }).children;
const extract = (children: Record<string, unknown>[], layoutMode?: string) => kids(extractP15NeutralExportDocumentFromFigmaFrame(frame(children, layoutMode), 'section'));
const line = (extra: Record<string, unknown> = {}) => ({ id: 'l', name: 'Line', type: 'LINE', visible: true, width: 320, height: 0, strokeWeight: 2,
  strokes: [solid(0x33 / 255, 0x33 / 255, 0x33 / 255)], effects: [], ...extra });
const rect = (extra: Record<string, unknown> = {}) => ({ id: 'r', name: 'Rect', type: 'RECTANGLE', visible: true, width: 300, height: 1,
  fills: [solid(0, 0, 0)], strokes: [], effects: [], ...extra });

describe('recovery M2.2c — dividers and spacers', () => {
  it('maps a horizontal solid line and a thin solid rectangle to dividers', () => {
    expect(extract([line()])).toEqual([{ kind: 'divider', sourceNodeId: 'l', weightPx: 2, colorHex: '#333333', widthPx: 320 }]);
    expect(extract([rect()])).toEqual([{ kind: 'divider', sourceNodeId: 'r', weightPx: 1, colorHex: '#000000', widthPx: 300 }]);
  });

  it('maps an empty, unpainted leaf in a vertical layout to a spacer, but not in a row', () => {
    expect(extract([rect({ fills: [], height: 48 })])).toEqual([{ kind: 'spacer', sourceNodeId: 'r', heightPx: 48 }]);
    expect(extract([{ id: 'e', name: 'Gap', type: 'FRAME', visible: true, width: 10, height: 24, fills: [], strokes: [], effects: [], children: [] }]))
      .toEqual([{ kind: 'spacer', sourceNodeId: 'e', heightPx: 24 }]);
    expect(extract([rect({ fills: [], height: 48 })], 'HORIZONTAL')[0]?.kind).toBe('review');
  });

  it('a line that cannot map exactly becomes an explicit review', () => {
    for (const extra of [{ rotation: 90 }, { strokeWeight: 20 }, { strokes: [solid(0, 0, 0, { opacity: 0.5 })] }, { strokes: [] },
      { effects: [{ type: 'DROP_SHADOW', visible: true }] }]) {
      expect(extract([line(extra)])[0], JSON.stringify(extra)).toMatchObject({ kind: 'review', reasonCode: 'DIVIDER_REQUIRES_REVIEW' });
    }
    expect(extract([rect({ height: 12, width: 300 })])[0]?.kind).toBe('review');
  });

  it('generates Elementor divider and spacer widgets', () => {
    const document: P15NeutralExportDocumentV1 = { schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Rules', documentType: 'section',
      nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [
        { kind: 'divider', sourceNodeId: 'd', weightPx: 2, colorHex: '#333333', widthPx: 320 }, { kind: 'spacer', sourceNodeId: 's', heightPx: 48 }] }] };
    const generation = generateElementorV3TemplateCandidate(document);
    expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    const [divider, spacer] = generation.template!.content[0]!.elements;
    expect(divider).toMatchObject({ elType: 'widget', widgetType: 'divider', settings: { style: 'solid', weight: slider(2), color: '#333333', width: slider(320) } });
    expect(spacer).toMatchObject({ elType: 'widget', widgetType: 'spacer', settings: { space: slider(48) } });
  });

  it('validates divider and spacer bounds and keeps them in the identity', () => {
    const doc = (child: Record<string, unknown>) => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'x', documentType: 'section',
      nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [child] }] });
    for (const bad of [{ kind: 'divider', sourceNodeId: 'd', weightPx: 0, colorHex: '#000000' }, { kind: 'divider', sourceNodeId: 'd', weightPx: 1, colorHex: '#FFF' },
      { kind: 'spacer', sourceNodeId: 's', heightPx: 0 }, { kind: 'spacer', sourceNodeId: 's', heightPx: 10, extra: 1 }]) {
      expect(validateP15NeutralExportDocument(doc(bad)).valid, JSON.stringify(bad)).toBe(false);
    }
    expect(fingerprintP15NeutralExportDocument(doc({ kind: 'spacer', sourceNodeId: 's', heightPx: 10 })))
      .not.toBe(fingerprintP15NeutralExportDocument(doc({ kind: 'spacer', sourceNodeId: 's', heightPx: 11 })));
  });
});

describe('recovery M2.2c — hyperlinks', () => {
  const segment = (characters: string, hyperlink: unknown = null, size = 16) => ({ characters, fontName: { family: 'Inter', style: 'Regular' }, fontWeight: 400,
    fontStyle: 'REGULAR', fontSize: size, lineHeight: { unit: 'AUTO' }, letterSpacing: { unit: 'PIXELS', value: 0 }, textCase: 'ORIGINAL', textDecoration: 'NONE',
    fills: [], hyperlink });
  const textLayer = (id: string, segments: ReturnType<typeof segment>[], name = id) => ({ id, name, type: 'TEXT', visible: true,
    characters: segments.map((s) => s.characters).join(''), textAlignHorizontal: 'LEFT', fills: [], getStyledTextSegments: () => segments });
  const url = (value: string) => ({ type: 'URL', value });

  it('a fully linked text gets a node link, a partly linked one gets an <a> run', () => {
    const [whole, partial] = extract([textLayer('a', [segment('Read more', url('https://example.com/a'))]),
      textLayer('b', [segment('See '), segment('docs', url('/docs')), segment(' now')])]);
    expect(whole).toMatchObject({ kind: 'text', href: 'https://example.com/a' });
    expect(partial).toMatchObject({ kind: 'text', paragraphs: [{ spans: [{ text: 'See ' }, { text: 'docs', href: '/docs' }, { text: ' now' }] }] });
    const document = extractP15NeutralExportDocumentFromFigmaFrame(frame([textLayer('a', [segment('Read more', url('https://example.com/a'))]),
      textLayer('b', [segment('See '), segment('docs', url('/docs')), segment(' now')])]), 'section');
    const [wa, wb] = generateElementorV3TemplateCandidate(document).template!.content[0]!.elements;
    expect((wa!.settings as Record<string, unknown>).editor).toBe('<p><a href="https://example.com/a">Read more</a></p>');
    expect((wb!.settings as Record<string, unknown>).editor).toBe('<p>See <a href="/docs">docs</a> now</p>');
  });

  it('links to Figma nodes or unsafe URLs become reviews and are not exported', () => {
    const [node, unsafe] = extract([textLayer('a', [segment('Jump', { type: 'NODE', value: '1:2' })]), textLayer('b', [segment('Bad', url('javascript:alert(1)'))])]);
    expect(node).toMatchObject({ styleReviews: [{ reasonCode: 'LINK_TO_NODE_REQUIRES_REVIEW' }] });
    expect(unsafe).toMatchObject({ styleReviews: [{ reasonCode: 'LINK_URL_REQUIRES_REVIEW' }] });
    expect(JSON.stringify(unsafe)).not.toContain('javascript');
  });

  it('a linked heading writes the heading link, and a linked button label becomes the button URL', () => {
    const copy = textLayer('c', [segment('Body copy that is long enough to dominate the character count here.')]);
    const [heading] = extract([textLayer('h', [segment('Big title', url('https://example.com/'), 40)]), copy]);
    expect(heading).toMatchObject({ kind: 'heading', href: 'https://example.com/' });
    const generation = generateElementorV3TemplateCandidate(extractP15NeutralExportDocumentFromFigmaFrame(frame([textLayer('h', [segment('Big title', url('https://example.com/'), 40)]), copy]), 'section'));
    expect((generation.template!.content[0]!.elements[0]!.settings as Record<string, unknown>).link).toEqual({ url: 'https://example.com/', is_external: '', nofollow: '', custom_attributes: '' });
    const button = { id: 'btn', name: 'Button', type: 'FRAME', visible: true, layoutMode: 'HORIZONTAL', layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO', itemSpacing: 0,
      paddingTop: 10, paddingRight: 20, paddingBottom: 10, paddingLeft: 20, primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN', fills: [solid(0, 0, 0)],
      children: [textLayer('lbl', [segment('Buy', url('https://shop.example/'))])] };
    expect(extract([button])[0]).toMatchObject({ kind: 'button', text: 'Buy', url: 'https://shop.example/' });
  });
});

describe('recovery M2.2c — lowest covering capability registry version', () => {
  it('stamps v1 for v1-only templates (identity unchanged) and v2 only when divider or spacer is used', async () => {
    const { capabilityRegistryVersionFor } = await import('../src/targets/elementor/capability-registry');
    const { buildElementorTemplateCandidateIdentity } = await import('../src/targets/elementor/import-validation-contract');
    expect(capabilityRegistryVersionFor(['heading', 'text-editor', 'button', 'image'])).toBe('elementor-core-widget-capabilities-v1');
    expect(capabilityRegistryVersionFor(['heading', 'divider'])).toBe('elementor-core-widget-capabilities-v2');
    const base = (children: P15NeutralExportNode[]): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'R',
      documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children }] });
    const v1 = generateElementorV3TemplateCandidate(base([{ kind: 'text', sourceNodeId: 't', text: 'Hi' }])).candidate!;
    const v2 = generateElementorV3TemplateCandidate(base([{ kind: 'spacer', sourceNodeId: 's', heightPx: 8 }])).candidate!;
    expect(v1.capabilityRegistryVersion).toBe('elementor-core-widget-capabilities-v1');
    expect(buildElementorTemplateCandidateIdentity(v1).capabilityRegistryVersion).toBe('elementor-core-widget-capabilities-v1');
    expect(v2.capabilityRegistryVersion).toBe('elementor-core-widget-capabilities-v2');
    expect(buildElementorTemplateCandidateIdentity(v2).capabilityRegistryVersion).toBe('elementor-core-widget-capabilities-v2');
  });
});
