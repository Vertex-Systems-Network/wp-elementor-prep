import { describe, expect, it } from 'vitest';
import { bodyFontSize, detectP15Headings } from '../src/targets/elementor/semantic-detection';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode, type P15NeutralTypography } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';

const text = (id: string, value: string, typography?: P15NeutralTypography, extra: Record<string, unknown> = {}): P15NeutralExportNode =>
  ({ kind: 'text', sourceNodeId: id, text: value, align: 'start', ...(typography ? { typography } : {}), ...extra }) as P15NeutralExportNode;
const doc = (children: P15NeutralExportNode[]): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
  title: 'Semantic', documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children }] });
const body = 'Body copy that is long enough to dominate the character count of this section.';
const children = (document: P15NeutralExportDocumentV1) => (document.nodes[0] as { children: P15NeutralExportNode[] }).children;

describe('recovery M2.2a — deterministic heading detection', () => {
  it('finds the body size as the size covering most characters', () => {
    expect(bodyFontSize(doc([text('a', body, { fontSizePx: 16 }), text('b', 'Big', { fontSizePx: 40 })]))).toBe(16);
    expect(bodyFontSize(doc([text('a', 'plain')]))).toBeNull();
  });

  it('promotes larger or bold-and-larger uniform text, ranking levels by size, keeping typography', () => {
    const result = detectP15Headings(doc([
      text('hero', 'Welcome', { fontSizePx: 48, fontWeight: '700', colorHex: '#111111' }),
      text('section', 'Features', { fontSizePx: 32 }),
      text('card', 'Fast', { fontSizePx: 18, fontWeight: '600' }),
      text('copy', body, { fontSizePx: 16 }),
      text('label', 'Small bold', { fontSizePx: 16, fontWeight: '700' }),
    ]), new Map());
    expect(children(result).map((node) => [node.sourceNodeId, node.kind, node.kind === 'heading' ? node.level : null])).toEqual([
      ['hero', 'heading', 'h1'], ['section', 'heading', 'h2'], ['card', 'heading', 'h3'], ['copy', 'text', null], ['label', 'text', null]]);
    expect(children(result)[0]).toEqual({ kind: 'heading', sourceNodeId: 'hero', text: 'Welcome', level: 'h1', align: 'start',
      typography: { fontSizePx: 48, fontWeight: '700', colorHex: '#111111' } });
    expect(validateP15NeutralExportDocument(result).valid).toBe(true);
  });

  it('a layer name h1..h6 sets the level of a detected heading', () => {
    const result = detectP15Headings(doc([text('a', 'Title', { fontSizePx: 30 }), text('b', body, { fontSizePx: 16 })]), new Map([['a', 'H3 / Section']]));
    expect(children(result)[0]).toMatchObject({ kind: 'heading', level: 'h3' });
  });

  it('never promotes multi-paragraph, mixed, justified, reviewed or over-long text', () => {
    const big = { fontSizePx: 40 };
    const result = detectP15Headings(doc([
      text('multi', 'One\nTwo', big), text('mixed', 'Mixed', big, { paragraphs: [{ spans: [{ text: 'Mix' }, { text: 'ed', style: { fontWeight: '700' } }] }] }),
      text('justify', 'Justified', big, { align: 'justify' }), text('reviewed', 'Reviewed', big, { styleReviews: [{ reasonCode: 'STROKE_REQUIRES_REVIEW', detail: 'x' }] }),
      text('long', 'x'.repeat(161), big), text('copy', body.repeat(4), { fontSizePx: 16 }),
    ]), new Map());
    expect(children(result).every((node) => node.kind === 'text')).toBe(true);
  });

  it('a heading-named layer the size rule does not support gets an explicit review, unless there is no rank at all', () => {
    const contradicted = detectP15Headings(doc([text('a', 'Not big', { fontSizePx: 16 }), text('b', body, { fontSizePx: 16 }), text('c', 'Big', { fontSizePx: 30 })]),
      new Map([['a', 'Heading']]));
    expect(children(contradicted)[0]).toMatchObject({ kind: 'text', styleReviews: [{ reasonCode: 'HEADING_DETECTION_REQUIRES_REVIEW' }] });
    const flat = detectP15Headings(doc([text('a', 'Only', { fontSizePx: 16 }), text('b', body, { fontSizePx: 16 })]), new Map([['a', 'Title']]));
    expect(children(flat)[0]).toEqual(text('a', 'Only', { fontSizePx: 16 }));
  });

  it('text without typography is never touched', () => {
    const document = doc([text('a', 'Hello'), text('b', 'World')]);
    expect(detectP15Headings(document, new Map([['a', 'H1']]))).toBe(document);
  });
});

describe('recovery M2.2a — heading typography in Elementor', () => {
  it('writes the heading typography group and title_color', () => {
    const result = generateElementorV3TemplateCandidate(doc([{ kind: 'heading', sourceNodeId: 'h', text: 'Hello', level: 'h2',
      typography: { fontFamily: 'Inter', fontWeight: '700', fontSizePx: 32, colorHex: '#123456' } } as P15NeutralExportNode]));
    expect(result.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(result.template!.content[0]!.elements[0]!.settings).toEqual({ title: 'Hello', header_size: 'h2', typography_typography: 'custom',
      typography_font_family: 'Inter', typography_font_size: { unit: 'px', size: 32, sizes: [] }, typography_font_weight: '700', title_color: '#123456' });
  });

  it('the Figma extractor emits detected headings end to end', () => {
    const segment = (characters: string, fontSize: number, fontWeight = 400) => ({ characters, fontName: { family: 'Inter', style: 'Regular' }, fontWeight,
      fontStyle: 'REGULAR', fontSize, lineHeight: { unit: 'AUTO' }, letterSpacing: { unit: 'PIXELS', value: 0 }, textCase: 'ORIGINAL', textDecoration: 'NONE', fills: [] });
    const textLayer = (id: string, name: string, characters: string, size: number, weight?: number) => ({ id, name, type: 'TEXT', visible: true, characters,
      textAlignHorizontal: 'LEFT', fills: [], getStyledTextSegments: () => [segment(characters, size, weight)] });
    const frame = { id: 'f', name: 'Frame', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO', itemSpacing: 0,
      paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN', fills: [],
      children: [textLayer('t1', 'Hero title', 'Welcome', 40, 700), textLayer('t2', 'Copy', body, 16)] } as unknown as FrameNode;
    const document = extractP15NeutralExportDocumentFromFigmaFrame(frame, 'section');
    expect(children(document).map((node) => node.kind)).toEqual(['heading', 'text']);
    expect(generateElementorV3TemplateCandidate(document).status).toBe('GENERATED_LOCAL_CANDIDATE');
  });
});
