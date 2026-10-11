import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const frame = (direction: 'HORIZONTAL' | 'VERTICAL', children: unknown[]) => ({ id: 'page', name: 'page', type: 'FRAME', visible: true, layoutMode: direction,
  layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO', itemSpacing: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
  primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN', fills: [], width: 800, height: 600, children });
const photo = (extra: Record<string, unknown> = {}) => ({ id: 'photo', name: 'Photo', type: 'RECTANGLE', visible: true, width: 400, height: 300,
  fills: [{ type: 'IMAGE', visible: true, imageHash: 'h' }], layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED', ...extra });
const paths = new Map([['photo', 'assets/render-photo@2x.png']]);
const extractPhoto = (direction: 'HORIZONTAL' | 'VERTICAL', extra?: Record<string, unknown>) =>
  (extractP15NeutralExportDocumentFromFigmaFrame(frame(direction, [photo(extra)]) as unknown as FrameNode, 'section', paths).nodes[0] as unknown as { children: unknown[] }).children[0];

describe('recovery M3.4a — image widget sizing', () => {
  it('a FIXED image gets its exact width and height', () => {
    expect(extractPhoto('VERTICAL')).toEqual({ kind: 'image', sourceNodeId: 'photo', assetPath: 'assets/render-photo@2x.png',
      sizing: { widthPx: 400, flex: 'fixed' }, heightPx: 300 });
  });

  it('a FILL width takes 100% with object-fit cover; the widget fills its row share', () => {
    expect(extractPhoto('HORIZONTAL', { layoutSizingHorizontal: 'FILL' })).toEqual({ kind: 'image', sourceNodeId: 'photo', assetPath: 'assets/render-photo@2x.png',
      sizing: { fillWidth: true }, heightPx: 300, objectFit: 'cover' });
  });

  it('a FILL height, a size constraint or a visual effect keeps the image a review', () => {
    for (const extra of [{ layoutSizingVertical: 'FILL' }, { maxWidth: 200 }, { opacity: 0.5 }]) {
      expect(extractPhoto('HORIZONTAL', extra), JSON.stringify(extra)).toMatchObject({ kind: 'review', reasonCode: 'IMAGE_ASSET_EXPORT_REQUIRED' });
    }
  });

  it('writes width %, height px and object-fit, and validates the new fields', () => {
    const doc = (image: Record<string, unknown>): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Img',
      documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'row', children: [{ kind: 'image', sourceNodeId: 'photo',
        assetPath: 'assets/render-photo@2x.png', ...image }] } as unknown as P15NeutralExportNode] });
    const generation = generateElementorV3TemplateCandidate(doc({ sizing: { fillWidth: true }, heightPx: 300, objectFit: 'cover' }));
    expect(generation.reviewArtifact!.template.content[0]!.elements[0]!.settings).toMatchObject({ image_size: 'full',
      width: { unit: '%', size: 100, sizes: [] }, height: { unit: 'px', size: 300, sizes: [] }, 'object-fit': 'cover',
      _element_custom_width: { unit: '%', size: 100 } });
    for (const bad of [{ heightPx: 0 }, { heightPx: 1.234 }, { objectFit: 'contain' }, { sizing: {} }]) {
      expect(validateP15NeutralExportDocument(doc(bad)).valid, JSON.stringify(bad)).toBe(false);
    }
    expect(validateP15NeutralExportDocument(doc({ url: 'https://example.com/a.png' })).valid).toBe(false);
  });
});
