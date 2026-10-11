import { describe, expect, it } from 'vitest';
import { buildP15ElementorPackFromFigmaFrame } from '../src/plugin/p15-elementor-pack-builder';
import { deriveP15BackgroundImage } from '../src/targets/elementor/container-background-image';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const paint = (extra: Record<string, unknown> = {}) => ({ type: 'IMAGE', visible: true, imageHash: 'h', scaleMode: 'FILL', ...extra });
const facts = (extra: Record<string, unknown> = {}) => ({ paint: paint(extra), originalPath: 'assets/original-h.jpg', originalWidthPx: 400 });

describe('recovery M3.4b — background image derivation', () => {
  it('FILL → cover, FIT → contain, TILE → natural width × scaling factor', () => {
    expect(deriveP15BackgroundImage(facts())).toEqual({ backgroundImage: { assetPath: 'assets/original-h.jpg', fit: 'cover' } });
    expect(deriveP15BackgroundImage(facts({ scaleMode: 'FIT' })).backgroundImage?.fit).toBe('contain');
    expect(deriveP15BackgroundImage(facts({ scaleMode: 'TILE', scalingFactor: 0.5 })).backgroundImage).toEqual({ assetPath: 'assets/original-h.jpg', fit: 'tile', tileWidthPx: 200 });
  });

  it('CROP, rotation, filters, translucency, blending and a missing original are review', () => {
    for (const extra of [{ scaleMode: 'CROP' }, { rotation: 90 }, { filters: { exposure: 0.2 } }, { opacity: 0.5 }, { blendMode: 'MULTIPLY' }]) {
      expect(deriveP15BackgroundImage(facts(extra)).review?.reasonCode, JSON.stringify(extra)).toBe('CONTAINER_BACKGROUND_IMAGE_REQUIRES_REVIEW');
    }
    expect(deriveP15BackgroundImage({ paint: paint(), originalPath: undefined, originalWidthPx: undefined }).review?.reasonCode).toBe('CONTAINER_BACKGROUND_IMAGE_REQUIRES_REVIEW');
    expect(deriveP15BackgroundImage(facts({ filters: { exposure: 0, contrast: 0 } })).backgroundImage).toBeDefined();
  });
});

const doc = (root: Record<string, unknown>): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Bg',
  documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'hero', direction: 'column', children: [], ...root } as unknown as P15NeutralExportNode] });

describe('recovery M3.4b — IR and Elementor settings', () => {
  it('writes the classic background group and an upload review', () => {
    const cover = generateElementorV3TemplateCandidate(doc({ backgroundImage: { assetPath: 'assets/original-h.jpg', fit: 'cover' } }));
    expect(cover.reviewEntries.map((entry) => entry.reasonCode)).toEqual(['ASSET_UPLOAD_REQUIRED']);
    expect(cover.reviewArtifact!.template.content[0]!.settings).toMatchObject({ background_background: 'classic',
      background_image: { url: 'assets/original-h.jpg', id: 0 }, background_position: 'center center', background_repeat: 'no-repeat', background_size: 'cover' });
    const tile = generateElementorV3TemplateCandidate(doc({ backgroundImage: { assetPath: 'assets/original-h.jpg', fit: 'tile', tileWidthPx: 200 } }));
    expect(tile.reviewArtifact!.template.content[0]!.settings).toMatchObject({ background_position: 'top left', background_repeat: 'repeat',
      background_size: 'initial', background_bg_width: { unit: 'px', size: 200, sizes: [] } });
  });

  it('validates the background image and keeps it in the identity', () => {
    const ok = { assetPath: 'assets/original-h.jpg', fit: 'cover' };
    for (const bad of [{ ...ok, fit: 'stretch' }, { ...ok, assetPath: 'https://x.y/a.jpg' }, { ...ok, tileWidthPx: 10 }, { assetPath: ok.assetPath, fit: 'tile' }]) {
      expect(validateP15NeutralExportDocument(doc({ backgroundImage: bad })).valid, JSON.stringify(bad)).toBe(false);
    }
    expect(validateP15NeutralExportDocument(doc({ backgroundImage: ok, backgroundColorHex: '#ffffff' })).valid).toBe(false);
    expect(fingerprintP15NeutralExportDocument(doc({ backgroundImage: ok }))).not.toBe(fingerprintP15NeutralExportDocument(doc({ backgroundImage: { ...ok, fit: 'contain' } })));
  });
});

describe('recovery M3.4b — frame to pack', () => {
  it('a hero frame with an image fill and content gets its original as background; no render of the frame', async () => {
    const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 1]);
    const hero = { id: 'hero', name: 'Hero', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO',
      itemSpacing: 0, paddingTop: 40, paddingRight: 40, paddingBottom: 40, paddingLeft: 40, primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN',
      width: 1200, height: 600, fills: [paint()], strokes: [], effects: [], exportAsync: async () => { throw new Error('the frame must not be rendered'); },
      children: [{ id: 't', name: 't', type: 'TEXT', visible: true, characters: 'Welcome', textAlignHorizontal: 'LEFT', fills: [] }] };
    const { assets, preview, pack } = await buildP15ElementorPackFromFigmaFrame(hero as unknown as FrameNode,
      { getImageByHash: () => ({ getBytesAsync: async () => JPEG, getSizeAsync: async () => ({ width: 2400, height: 1200 }) }) });
    expect(assets.assets.map((asset) => asset.assetId)).toEqual(['original-h']);
    expect(assets.reviews).toEqual([]);
    expect(preview.document.nodes[0]).toMatchObject({ kind: 'container', backgroundImage: { assetPath: 'assets/original-h.jpg', fit: 'cover' } });
    expect(preview.coverageAudit.status).toBe('COMPLETE');
    expect(pack.manifest).toMatchObject({ label: 'REVIEW REQUIRED', assets: [{ path: 'assets/original-h.jpg', altText: 'Hero' }] });
  });
});
