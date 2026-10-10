import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { deriveP15BoxShadow } from '../src/targets/elementor/container-shadow';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const drop = (extra: Record<string, unknown> = {}) => ({ type: 'DROP_SHADOW', visible: true, blendMode: 'NORMAL', showShadowBehindNode: false,
  offset: { x: 0, y: 4 }, radius: 12, spread: 0, color: { r: 0, g: 0, b: 0, a: 0.25 }, ...extra });

describe('recovery M2.4b — shadow derivation', () => {
  it('one drop shadow maps with its translucent colour; an inner shadow is inset', () => {
    expect(deriveP15BoxShadow([drop()])).toEqual({ shadow: { xPx: 0, yPx: 4, blurPx: 12, spreadPx: 0, colorHex: '#000000', alpha: 0.25 } });
    expect(deriveP15BoxShadow([drop({ type: 'INNER_SHADOW', spread: 2, color: { r: 1, g: 0, b: 0, a: 1 } })]))
      .toEqual({ shadow: { xPx: 0, yPx: 4, blurPx: 12, spreadPx: 2, colorHex: '#ff0000', alpha: 1, inset: true } });
    expect(deriveP15BoxShadow([])).toEqual({});
    expect(deriveP15BoxShadow([drop({ color: { r: 0, g: 0, b: 0, a: 0 } })])).toEqual({});
  });

  it('anything without an exact box shadow is review', () => {
    for (const effects of [[drop(), drop()], [{ type: 'LAYER_BLUR', visible: true, radius: 4 }], [{ type: 'BACKGROUND_BLUR', visible: true, radius: 4 }],
      [drop({ blendMode: 'MULTIPLY' })], [drop({ showShadowBehindNode: true })], [drop({ radius: 150 })], [drop({ offset: { x: 0, y: -200 } })]]) {
      expect(deriveP15BoxShadow(effects).review?.reasonCode, JSON.stringify(effects)).toBe('EFFECT_REQUIRES_REVIEW');
    }
    expect(deriveP15BoxShadow('MIXED').review?.reasonCode).toBe('EFFECT_REQUIRES_REVIEW');
  });
});

const doc = (boxShadow: unknown): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Shadow',
  documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [], boxShadow } as unknown as P15NeutralExportNode] });

describe('recovery M2.4b — IR and Elementor settings', () => {
  it('writes the box shadow group with an rgba colour, or hex when opaque', () => {
    const settings = (shadow: Record<string, unknown>) => {
      const generation = generateElementorV3TemplateCandidate(doc(shadow));
      expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
      return generation.template!.content[0]!.settings;
    };
    expect(settings({ xPx: 0, yPx: 4, blurPx: 12, spreadPx: 0, colorHex: '#102030', alpha: 0.25 })).toEqual({ flex_direction: 'column',
      box_shadow_box_shadow_type: 'yes', box_shadow_box_shadow: { horizontal: 0, vertical: 4, blur: 12, spread: 0, color: 'rgba(16,32,48,0.25)' },
      box_shadow_box_shadow_position: ' ' });
    expect(settings({ xPx: 1, yPx: 1, blurPx: 0, spreadPx: 0, colorHex: '#102030', alpha: 1, inset: true })).toMatchObject({
      box_shadow_box_shadow: { color: '#102030' }, box_shadow_box_shadow_position: 'inset' });
  });

  it('validates the shadow and keeps it in the identity', () => {
    const base = { xPx: 0, yPx: 4, blurPx: 12, spreadPx: 0, colorHex: '#000000', alpha: 0.25 };
    for (const bad of [{ ...base, blurPx: -1 }, { ...base, alpha: 0 }, { ...base, alpha: 0.255 }, { ...base, colorHex: '#FFFFFF' }, { ...base, inset: false }, { ...base, extra: 1 }]) {
      expect(validateP15NeutralExportDocument(doc(bad)).valid, JSON.stringify(bad)).toBe(false);
    }
    expect(fingerprintP15NeutralExportDocument(doc(base))).not.toBe(fingerprintP15NeutralExportDocument(doc({ ...base, alpha: 0.3 })));
  });

  it('extracts a Figma card shadow end to end without a review', () => {
    const card = { id: 'card', name: 'Card', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO', itemSpacing: 0,
      paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN',
      fills: [{ type: 'SOLID', visible: true, color: { r: 1, g: 1, b: 1 } }], strokes: [], effects: [drop()],
      children: [{ id: 't', name: 't', type: 'TEXT', visible: true, characters: 'Hi', textAlignHorizontal: 'LEFT', fills: [] }] };
    const page = { ...card, id: 'page', name: 'Page', fills: [], effects: [], children: [card] };
    const document = extractP15NeutralExportDocumentFromFigmaFrame(page as unknown as FrameNode, 'section');
    const extracted = (document.nodes[0] as unknown as { children: Record<string, unknown>[] }).children[0]!;
    expect(extracted).toMatchObject({ boxShadow: { xPx: 0, yPx: 4, blurPx: 12, spreadPx: 0, colorHex: '#000000', alpha: 0.25 } });
    expect(extracted.styleReviews).toBeUndefined();
    expect(generateElementorV3TemplateCandidate(document).status).toBe('GENERATED_LOCAL_CANDIDATE');
  });
});
