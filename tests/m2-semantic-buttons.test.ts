import { describe, expect, it } from 'vitest';
import { detectP15Buttons, detectP15Headings } from '../src/targets/elementor/semantic-detection';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const padding = { top: 12, right: 24, bottom: 12, left: 24 };
const label = (text = 'Get started', extra: Record<string, unknown> = {}): P15NeutralExportNode =>
  ({ kind: 'text', sourceNodeId: 'label', text, align: 'center', typography: { fontWeight: '600', fontSizePx: 16, colorHex: '#ffffff' }, ...extra }) as P15NeutralExportNode;
const frame = (children: P15NeutralExportNode[], extra: Record<string, unknown> = {}): P15NeutralExportNode =>
  ({ kind: 'container', sourceNodeId: 'cta', direction: 'row', paddingPx: padding, backgroundColorHex: '#1A2B3C', cornerRadiusPx: 8, children, ...extra }) as P15NeutralExportNode;
const doc = (child: P15NeutralExportNode): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Buttons',
  documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [child] }] });
const first = (document: P15NeutralExportDocumentV1) => (document.nodes[0] as { children: P15NeutralExportNode[] }).children[0]!;
const named = new Map([['cta', 'Button / Primary']]);

describe('recovery M2.2b — deterministic button detection', () => {
  it('a button-named solid padded frame around one line of text becomes a native button with its style', () => {
    const result = detectP15Buttons(doc(frame([label()])), named);
    expect(first(result)).toEqual({ kind: 'button', sourceNodeId: 'cta', text: 'Get started',
      typography: { fontWeight: '600', fontSizePx: 16, colorHex: '#ffffff' }, backgroundColorHex: '#1A2B3C', paddingPx: padding, cornerRadiusPx: 8 });
    expect(validateP15NeutralExportDocument(result).valid).toBe(true);
    for (const name of ['btn', 'CTA', 'Primary button']) expect(first(detectP15Buttons(doc(frame([label()])), new Map([['cta', name]]))).kind).toBe('button');
  });

  it('without the name hint the frame and text are left exactly as they are', () => {
    const document = doc(frame([label()]));
    expect(detectP15Buttons(document, new Map([['cta', 'Badge']]))).toBe(document);
    expect(detectP15Buttons(document, new Map())).toBe(document);
  });

  it('a button-named frame that does not match the shape keeps its content and gets an explicit review', () => {
    const bad: P15NeutralExportNode[] = [
      frame([label(), label('Second', { sourceNodeId: 'second' })]),
      frame([label()], { backgroundColorHex: undefined }),
      frame([label()], { paddingPx: { top: 0, right: 0, bottom: 0, left: 0 } }),
      frame([label('Two\nlines')]),
      frame([label('x'.repeat(81))]),
      frame([label(undefined, { styleReviews: [{ reasonCode: 'TEXT_FILL_REQUIRES_REVIEW', detail: 'x' }] })]),
    ];
    for (const node of bad) {
      const result = first(detectP15Buttons(doc(JSON.parse(JSON.stringify(node)) as P15NeutralExportNode), named));
      expect(result.kind).toBe('container');
      expect(result.kind === 'container' && result.styleReviews?.map((review) => review.reasonCode)).toEqual(['BUTTON_DETECTION_REQUIRES_REVIEW']);
    }
  });

  it('runs before heading detection, so a big button label stays the button text', () => {
    const big = label('Buy', { typography: { fontSizePx: 40, fontWeight: '700' } });
    const document = doc({ kind: 'container', sourceNodeId: 'wrap', direction: 'column', children: [frame([big]),
      { kind: 'text', sourceNodeId: 'copy', text: 'Body copy that dominates the character count here.', typography: { fontSizePx: 16 } }] } as P15NeutralExportNode);
    const result = detectP15Headings(detectP15Buttons(document, named), named);
    const wrap = first(result);
    expect(wrap.kind === 'container' && wrap.children.map((node) => node.kind)).toEqual(['button', 'text']);
  });

  it('writes the button style with the Button families\' exact keys', () => {
    const generation = generateElementorV3TemplateCandidate(detectP15Buttons(doc(frame([label()])), named));
    expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(generation.template!.content[0]!.elements[0]!.settings).toEqual({ text: 'Get started', typography_typography: 'custom',
      typography_font_size: { unit: 'px', size: 16, sizes: [] }, typography_font_weight: '600', button_text_color: '#ffffff',
      background_background: 'classic', background_color: '#1A2B3C',
      text_padding: { unit: 'px', top: '12', right: '24', bottom: '12', left: '24', isLinked: false },
      border_radius: { unit: 'px', top: '8', right: '8', bottom: '8', left: '8', isLinked: true } });
  });
});
