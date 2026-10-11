import { describe, expect, it } from 'vitest';
import { deriveP15ContainerBorder } from '../src/targets/elementor/container-visual-style';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

/** Extractor gaps found by the M2.9c golden landing page. */
describe('recovery M2.9c — span resets', () => {
  const doc = (spanStyle: Record<string, unknown>, typography: Record<string, unknown> = { fontStyle: 'italic', textTransform: 'uppercase' }): P15NeutralExportDocumentV1 => ({
    schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Reset', documentType: 'section',
    nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [{ kind: 'text', sourceNodeId: 'q', text: 'Quote by Jane',
      typography, paragraphs: [{ spans: [{ text: 'Quote by ' }, { text: 'Jane', style: spanStyle }] }] }] } as unknown as P15NeutralExportNode] });

  it('a span may reset italic and case; the CSS is the exact inherited reset', () => {
    const generation = generateElementorV3TemplateCandidate(doc({ fontStyle: 'normal', textTransform: 'none' }));
    expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect((generation.template!.content[0]!.elements[0]!.settings as Record<string, unknown>).editor).toBe('<p>Quote by <span style="font-style: normal; text-transform: none">Jane</span></p>');
  });

  it('resets are span-only, and an underline reset stays invalid (decorations propagate)', () => {
    expect(validateP15NeutralExportDocument(doc({ textDecoration: 'none' })).valid).toBe(false);
    const nodeLevel = doc({ fontWeight: '700' }, { fontStyle: 'normal' });
    expect(validateP15NeutralExportDocument(nodeLevel).valid).toBe(false);
    expect(validateP15NeutralExportDocument(doc({ fontWeight: '700' }, { textTransform: 'none' })).valid).toBe(false);
  });
});

describe('recovery M2.9c — border on an empty fixed box', () => {
  const facts = (extra: Record<string, unknown> = {}) => ({ paints: ['#ffffff'], weight: 2, topWeight: undefined, rightWeight: undefined, bottomWeight: undefined,
    leftWeight: undefined, align: 'INSIDE', dashPattern: [], includedInLayout: false, ...extra });
  const zero = { top: 0, right: 0, bottom: 0, left: 0 };

  it('clamps the padding at 0 only for an empty FIXED box', () => {
    expect(deriveP15ContainerBorder(facts({ emptyFixedBox: true }), zero)).toEqual({ border: { style: 'solid', widthPx: { top: 2, right: 2, bottom: 2, left: 2 }, colorHex: '#ffffff' },
      paddingPx: zero });
    expect(deriveP15ContainerBorder(facts(), zero).review?.reasonCode).toBe('STROKE_REQUIRES_REVIEW');
    expect(deriveP15ContainerBorder(facts({ emptyFixedBox: false }), zero).review?.reasonCode).toBe('STROKE_REQUIRES_REVIEW');
  });
});
