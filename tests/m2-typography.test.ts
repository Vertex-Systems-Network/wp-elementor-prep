import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralTextNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';
import { textEditorBaseSettingsMatch } from '../src/targets/elementor/mapping-engine/widget-binding';

const slider = (size: number) => ({ unit: 'px', size, sizes: [] });
const solid = (r: number, g: number, b: number, extra: Record<string, unknown> = {}) => ({ type: 'SOLID', visible: true, color: { r, g, b }, ...extra });

interface Seg { characters: string; family?: string; weight?: number; italic?: boolean; size?: number; lineHeight?: unknown; letterSpacing?: unknown;
  textCase?: string; textDecoration?: string; fills?: unknown[] }
function segment(seg: Seg) {
  return { characters: seg.characters, fontName: { family: seg.family ?? 'Inter', style: seg.italic ? 'Italic' : 'Regular' },
    fontWeight: seg.weight ?? 400, fontStyle: seg.italic ? 'ITALIC' : 'REGULAR', fontSize: seg.size ?? 16,
    lineHeight: seg.lineHeight ?? { unit: 'AUTO' }, letterSpacing: seg.letterSpacing ?? { unit: 'PIXELS', value: 0 },
    textCase: seg.textCase ?? 'ORIGINAL', textDecoration: seg.textDecoration ?? 'NONE', fills: seg.fills ?? [solid(0x11 / 255, 0x22 / 255, 0x33 / 255)] };
}
function frameWithText(segments: Seg[], extra: Record<string, unknown> = {}): FrameNode {
  const characters = segments.map((seg) => seg.characters).join('');
  const text = { id: 't1', name: 't1', type: 'TEXT', visible: true, characters, textAlignHorizontal: 'LEFT', fills: [],
    getStyledTextSegments: () => segments.map(segment), ...extra };
  return { id: 'f1', name: 'Frame', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO',
    itemSpacing: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: 'MIN', fills: [], children: [text] } as unknown as FrameNode;
}
function textOf(document: P15NeutralExportDocumentV1): P15NeutralTextNode {
  const root = document.nodes[0];
  if (root?.kind !== 'container' || root.children[0]?.kind !== 'text') throw new Error('expected container > text');
  return root.children[0];
}
function source(text: Partial<P15NeutralTextNode> & { text: string }): P15NeutralExportDocumentV1 {
  return { schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Typography', documentType: 'section',
    nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [{ kind: 'text', sourceNodeId: 'copy', ...text }] }] };
}
function widgetSettings(document: P15NeutralExportDocumentV1): Record<string, unknown> {
  const result = generateElementorV3TemplateCandidate(document);
  expect(result.status).toBe('GENERATED_LOCAL_CANDIDATE');
  return result.template!.content[0]!.elements[0]!.settings as Record<string, unknown>;
}

describe('recovery M2.1 — typography extraction', () => {
  it('reads uniform styled text as node typography, converting percent line height and letter spacing to px', () => {
    const document = extractP15NeutralExportDocumentFromFigmaFrame(frameWithText([{ characters: 'Hello world', family: 'Open Sans', weight: 700, italic: true,
      size: 20, lineHeight: { unit: 'PERCENT', value: 150 }, letterSpacing: { unit: 'PERCENT', value: 5 }, textCase: 'UPPER', textDecoration: 'UNDERLINE' }]),
    'section');
    const text = textOf(document);
    expect(text.typography).toEqual({ fontFamily: 'Open Sans', fontWeight: '700', fontStyle: 'italic', fontSizePx: 20, lineHeightPx: 30, letterSpacingPx: 1,
      textTransform: 'uppercase', textDecoration: 'underline', colorHex: '#112233' });
    expect(text.paragraphs).toBeUndefined();
    expect(text.styleReviews).toBeUndefined();
    expect(validateP15NeutralExportDocument(document).valid).toBe(true);
  });

  it('keeps mixed runs as spans that carry only their differences, and newlines as separate paragraphs', () => {
    const document = extractP15NeutralExportDocumentFromFigmaFrame(frameWithText([
      { characters: 'Plain then ' }, { characters: 'bold', weight: 700 }, { characters: ' text\n\nSecond line' },
    ], { paragraphSpacing: 12 }), 'section');
    const text = textOf(document);
    expect(text.typography).toMatchObject({ fontFamily: 'Inter', fontWeight: '400', fontSizePx: 16, colorHex: '#112233' });
    expect(text.paragraphs).toEqual([
      { spans: [{ text: 'Plain then ' }, { text: 'bold', style: { fontWeight: '700' } }, { text: ' text' }] },
      { spans: [] },
      { spans: [{ text: 'Second line' }] },
    ]);
    expect(text.paragraphSpacingPx).toBe(12);
    expect(validateP15NeutralExportDocument(document).valid).toBe(true);
  });

  it('flags what it cannot map instead of guessing', () => {
    const cases: Array<[Seg[], string]> = [
      [[{ characters: 'Caps', textCase: 'SMALL_CAPS' }], 'TEXT_CASE_REQUIRES_REVIEW'],
      [[{ characters: 'Fill', fills: [{ type: 'GRADIENT_LINEAR', visible: true }] }], 'TEXT_FILL_REQUIRES_REVIEW'],
      [[{ characters: 'Glass', fills: [solid(1, 1, 1, { opacity: 0.5 })] }], 'TEXT_FILL_REQUIRES_REVIEW'],
      [[{ characters: 'Two', fills: [solid(1, 0, 0), solid(0, 0, 1)] }], 'TEXT_FILL_REQUIRES_REVIEW'],
      [[{ characters: 'Variable', weight: 450 }], 'FONT_WEIGHT_REQUIRES_REVIEW'],
      [[{ characters: 'Mostly underlined text', textDecoration: 'UNDERLINE' }, { characters: 'x' }], 'MIXED_TYPOGRAPHY_REQUIRES_REVIEW'],
      [[{ characters: 'Huge', size: 900 }], 'TYPOGRAPHY_OUT_OF_RANGE'],
      [[{ characters: 'Quote', family: "Evil'; color: red" }], 'TYPOGRAPHY_OUT_OF_RANGE'],
    ];
    for (const [segments, reasonCode] of cases) {
      const text = textOf(extractP15NeutralExportDocumentFromFigmaFrame(frameWithText(segments), 'section'));
      expect(text.styleReviews?.map((review) => review.reasonCode), reasonCode).toContain(reasonCode);
    }
  });

  it('plain mock text without segment access is unchanged', () => {
    const frame = frameWithText([{ characters: 'Hi' }]);
    delete (frame.children[0] as unknown as Record<string, unknown>).getStyledTextSegments;
    const text = textOf(extractP15NeutralExportDocumentFromFigmaFrame(frame, 'section'));
    expect(text).toEqual({ kind: 'text', sourceNodeId: 't1', text: 'Hi', align: 'start' });
  });
});

describe('recovery M2.1 — neutral IR typography validation', () => {
  it('accepts bounded typography and refuses invalid values, unknown keys and paragraph/text mismatch', () => {
    expect(validateP15NeutralExportDocument(source({ text: 'a\nb', typography: { fontFamily: 'Roboto', fontSizePx: 18.5, colorHex: '#abcdef' },
      paragraphs: [{ spans: [{ text: 'a' }] }, { spans: [{ text: 'b', style: { fontWeight: '700' } }] }], paragraphSpacingPx: 0 })).valid).toBe(true);
    const invalid: Array<Partial<P15NeutralTextNode>> = [
      { typography: {} }, { typography: { fontWeight: '450' as never } }, { typography: { fontSizePx: 0 } }, { typography: { fontSizePx: 16.123 } },
      { typography: { colorHex: '#ABCDEF' } }, { typography: { fontFamily: 'Inter, Arial' } }, { typography: { fontFamily: "x'; color: red" } },
      { typography: { textTransform: 'none' as never } }, { typography: { lineHeight: 2 } as never },
      { paragraphs: [{ spans: [{ text: 'wrong' }] }] }, { paragraphs: [{ spans: [{ text: 'a\nb' }] }] }, { paragraphs: [] },
      { paragraphSpacingPx: -1 },
    ];
    for (const extra of invalid) {
      const result = validateP15NeutralExportDocument(source({ text: 'a\nb', ...extra }));
      expect(result.valid, JSON.stringify(extra)).toBe(false);
      expect(result.issues.map((issue) => issue.code), JSON.stringify(extra)).toContain('P15_IR_TYPOGRAPHY_INVALID');
    }
  });
});

describe('recovery M2.1 — Elementor text-editor typography', () => {
  it('writes the typography group, text colour and paragraph spacing with slider encoding', () => {
    const settings = widgetSettings(source({ text: 'Hello', typography: { fontFamily: 'Open Sans', fontWeight: '600', fontStyle: 'italic', fontSizePx: 20,
      lineHeightPx: 30, letterSpacingPx: -0.5, textTransform: 'capitalize', textDecoration: 'line-through', colorHex: '#112233' }, paragraphSpacingPx: 8 }));
    expect(settings).toEqual({ editor: '<p>Hello</p>', typography_typography: 'custom', typography_font_family: 'Open Sans',
      typography_font_size: slider(20), typography_font_weight: '600', typography_text_transform: 'capitalize', typography_font_style: 'italic',
      typography_text_decoration: 'line-through', typography_line_height: slider(30), typography_letter_spacing: slider(-0.5),
      text_color: '#112233', paragraph_spacing: slider(8) });
  });

  it('colour-only typography writes text_color without the typography starter', () => {
    expect(widgetSettings(source({ text: 'Hi', typography: { colorHex: '#000000' } }))).toEqual({ editor: '<p>Hi</p>', text_color: '#000000' });
  });

  it('renders paragraphs as <p> and styled runs as escaped <span style>, matching the family binding helper', () => {
    const document = source({ text: 'A <b> & bold\n\nEnd\u2028line', paragraphs: [
      { spans: [{ text: 'A <b> & ' }, { text: 'bold', style: { fontWeight: '700', colorHex: '#ff0000' } }] }, { spans: [] }, { spans: [{ text: 'End\u2028line' }] },
    ] });
    const settings = widgetSettings(document);
    expect(settings.editor).toBe('<p>A &lt;b&gt; &amp; <span style="font-weight: 700; color: #ff0000">bold</span></p><p></p><p>End<br>line</p>');
    expect(textEditorBaseSettingsMatch(textOf(document), settings)).toBe(true);
  });

  it('text without typography generates exactly what it did before', () => {
    expect(widgetSettings(source({ text: 'Line one\nLine two', align: 'center' }))).toEqual({ editor: '<p>Line one<br>Line two</p>', align: 'center' });
  });
});
