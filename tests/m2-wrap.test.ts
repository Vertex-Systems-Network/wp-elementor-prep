import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { deriveP15Wrap } from '../src/targets/elementor/container-wrap';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const facts = (extra: Record<string, unknown> = {}) => ({ layoutMode: 'HORIZONTAL', counterAxisSpacing: 24, counterAxisAlignContent: 'AUTO',
  alignItems: 'start', childLayoutAligns: ['INHERIT', 'INHERIT'], ...extra });

describe('recovery M2.6a — wrap derivation', () => {
  it('AUTO aligns the lines by the counter alignment; SPACE_BETWEEN spreads them', () => {
    expect(deriveP15Wrap(facts())).toEqual({ wrap: { rowGapPx: 24, alignContent: 'start' } });
    expect(deriveP15Wrap(facts({ alignItems: 'center' })).wrap?.alignContent).toBe('center');
    expect(deriveP15Wrap(facts({ alignItems: 'end', counterAxisSpacing: 7.255 })).wrap).toEqual({ rowGapPx: 7.26, alignContent: 'end' });
    expect(deriveP15Wrap(facts({ counterAxisAlignContent: 'SPACE_BETWEEN', childLayoutAligns: ['STRETCH'] })).wrap?.alignContent).toBe('space-between');
  });

  it('vertical wrap, missing line spacing, all-stretch lines and unknown values are review', () => {
    for (const extra of [{ layoutMode: 'VERTICAL' }, { counterAxisSpacing: null }, { counterAxisSpacing: -1 }, { counterAxisSpacing: 5000 },
      { childLayoutAligns: ['STRETCH', 'STRETCH'] }, { counterAxisAlignContent: 'SPACE_AROUND' }, { alignItems: 'stretch' }]) {
      expect(deriveP15Wrap(facts(extra)).review?.reasonCode, JSON.stringify(extra)).toBe('WRAPPED_AUTO_LAYOUT_REQUIRES_REVIEW');
    }
  });
});

const doc = (container: Record<string, unknown>): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Wrap',
  documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'row', gapPx: 16, children: [], ...container } as unknown as P15NeutralExportNode] });

describe('recovery M2.6a — IR and Elementor settings', () => {
  it('writes flex_wrap, split gaps and align-content', () => {
    const generation = generateElementorV3TemplateCandidate(doc({ wrap: { rowGapPx: 24, alignContent: 'space-between' } }));
    expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(generation.template!.content[0]!.settings).toMatchObject({ flex_direction: 'row', flex_wrap: 'wrap',
      flex_gap: { column: '16', row: '24', isLinked: false, unit: 'px' }, flex_align_content: 'space-between' });
    const linked = generateElementorV3TemplateCandidate(doc({ wrap: { rowGapPx: 16, alignContent: 'start' } })).template!.content[0]!.settings;
    expect(linked).toMatchObject({ flex_gap: { column: '16', row: '16', isLinked: true }, flex_align_content: 'flex-start' });
  });

  it('validates the wrap and keeps it in the identity', () => {
    for (const bad of [{ wrap: { rowGapPx: -1, alignContent: 'start' } }, { wrap: { rowGapPx: 1, alignContent: 'stretch' } },
      { wrap: { rowGapPx: 1, alignContent: 'start', extra: 1 } }, { direction: 'column', wrap: { rowGapPx: 1, alignContent: 'start' } }]) {
      expect(validateP15NeutralExportDocument(doc(bad)).valid, JSON.stringify(bad)).toBe(false);
    }
    expect(fingerprintP15NeutralExportDocument(doc({ wrap: { rowGapPx: 1, alignContent: 'start' } })))
      .not.toBe(fingerprintP15NeutralExportDocument(doc({ wrap: { rowGapPx: 2, alignContent: 'start' } })));
  });
});

const frame = (id: string, extra: Record<string, unknown> = {}) => ({ id, name: id, type: 'FRAME', visible: true, layoutMode: 'HORIZONTAL', layoutWrap: 'NO_WRAP',
  layoutPositioning: 'AUTO', itemSpacing: 12, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN',
  counterAxisAlignItems: 'MIN', fills: [], strokes: [], effects: [], children: [], ...extra });
const chip = (id: string, extra: Record<string, unknown> = {}) => frame(id, { width: 80, height: 32, layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED', ...extra });

describe('recovery M2.6a — Figma extraction end to end', () => {
  const extract = (wrapped: Record<string, unknown>) => {
    const document = extractP15NeutralExportDocumentFromFigmaFrame(frame('page', { layoutMode: 'VERTICAL', children: [wrapped] }) as unknown as FrameNode, 'section');
    return { document, node: (document.nodes[0] as unknown as { children: Record<string, unknown>[] }).children[0]! };
  };

  it('maps a wrapped chip row', () => {
    const { document, node } = extract(frame('chips', { layoutWrap: 'WRAP', counterAxisSpacing: 8, counterAxisAlignContent: 'AUTO', counterAxisAlignItems: 'CENTER',
      children: [chip('a'), chip('b'), chip('c')] }));
    expect(node).toMatchObject({ kind: 'container', direction: 'row', gapPx: 12, wrap: { rowGapPx: 8, alignContent: 'center' } });
    expect(node.styleReviews).toBeUndefined();
    expect(generateElementorV3TemplateCandidate(document).status).toBe('GENERATED_LOCAL_CANDIDATE');
  });

  it('a FILL child in a wrapped row is a style review; unmappable wraps stay review', () => {
    const { node } = extract(frame('chips', { layoutWrap: 'WRAP', counterAxisSpacing: 8, counterAxisAlignContent: 'AUTO',
      children: [chip('a'), chip('b', { layoutSizingHorizontal: 'FILL' })] }));
    expect(node.styleReviews).toEqual([expect.objectContaining({ reasonCode: 'SIZE_FILL_IN_WRAP_REQUIRES_REVIEW' })]);
    const missing = extract(frame('chips', { layoutWrap: 'WRAP', counterAxisSpacing: null, counterAxisAlignContent: 'AUTO', children: [chip('a')] })).node;
    expect(missing).toMatchObject({ kind: 'review', reasonCode: 'WRAPPED_AUTO_LAYOUT_REQUIRES_REVIEW' });
  });
});
