import { describe, expect, it } from 'vitest';
import { readP15Zip } from '../src/core/zip';
import { buildP15ElementorPackFromFigmaFrame } from '../src/plugin/p15-elementor-pack-builder';
import { verifyP15AssetPack } from '../src/targets/elementor/asset-pack';
import { landingPageFrame } from './fixtures/m2-landing-page';

const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 7, 7, 7]);
const api = { getImageByHash: (hash: string) => (hash === 'abc' ? { getBytesAsync: async () => PNG, getSizeAsync: async () => ({ width: 2560, height: 1280 }) } : null) };

function frameWithExports(): FrameNode {
  const frame = landingPageFrame();
  const shot = (frame.children as Array<Record<string, unknown>>).find((child) => child.id === 'product-shot')!;
  shot.exportAsync = async (settings: { constraint?: { value?: number } }) => Uint8Array.from([0x89, 0x50, 0x4e, 0x47, settings.constraint?.value ?? 0]);
  return frame as unknown as FrameNode;
}

describe('recovery M3.3/M3.4 — frame to asset pack (D-051)', () => {
  it('the landing page image becomes an Image widget on its pack asset, with an explicit upload review', async () => {
    const { preview, assets, pack } = await buildP15ElementorPackFromFigmaFrame(frameWithExports(), api);
    expect(assets.reviews).toEqual([]);
    expect(assets.assets.map((asset) => asset.assetId)).toEqual(['original-abc', 'render-product-shot@1x', 'render-product-shot@2x']);
    expect(preview.coverageAudit.status).toBe('COMPLETE');
    expect(preview.document.nodes[0]!.kind === 'container' && preview.document.nodes[0]!.children.find((child) => child.sourceNodeId === 'product-shot'))
      .toEqual({ kind: 'image', sourceNodeId: 'product-shot', assetPath: 'assets/render-product-shot@2x.png',
        sizing: { widthPx: 1280, flex: 'fixed' }, heightPx: 640 });
    expect(preview.generation.reviewEntries.map((entry) => [entry.sourceNodeId, entry.reasonCode])).toEqual([
      ['hero-secondary', 'BUTTON_DETECTION_REQUIRES_REVIEW'], ['product-shot', 'ASSET_UPLOAD_REQUIRED']]);

    expect(pack.status).toBe('PACK_READY');
    expect(pack.manifest).toMatchObject({ label: 'REVIEW REQUIRED', targetImportReady: false });
    expect(verifyP15AssetPack(pack.bytes!)).toBeNull();
    const files = new Map(readP15Zip(pack.bytes!).map((entry) => [entry.path, new TextDecoder().decode(entry.bytes)]));
    expect([...files.keys()]).toEqual(['manifest.json', 'template.json', 'IMPORT.md', 'assets/original-abc.png',
      'assets/render-product-shot@1x.png', 'assets/render-product-shot@2x.png']);
    const template = JSON.parse(files.get('template.json')!) as { content: Array<{ elements: Array<{ widgetType?: string; settings: Record<string, unknown> }> }> };
    const image = template.content[0]!.elements.find((element) => element.widgetType === 'image')!;
    // Recovery M3.4: the @2x render shown at exactly the layer size, full rendition after relinking.
    expect(image.settings).toEqual({ image: { id: 0, url: 'assets/render-product-shot@2x.png' }, image_size: 'full',
      width: { unit: 'px', size: 1280, sizes: [] }, height: { unit: 'px', size: 640, sizes: [] },
      _element_width: 'initial', _element_custom_width: { unit: 'px', size: 1280, sizes: [] }, _flex_size: 'none' });
    // No temporary Figma URL, and no URL at all, anywhere in the pack (root cause of #856).
    const urls = new TextDecoder().decode(pack.bytes!).match(/https?:\/\/[^\s"'<>)\\]+/g) ?? [];
    expect([...new Set(urls)]).toEqual(['https://example.com/privacy']); // only the design's own footer link
    expect(files.get('IMPORT.md')).toContain('ASSET_UPLOAD_REQUIRED (product-shot)');
  });

  it('without an image source the image stays a placeholder review and the pack still carries what exists', async () => {
    const { preview, pack } = await buildP15ElementorPackFromFigmaFrame(landingPageFrame() as unknown as FrameNode, { getImageByHash: () => null });
    expect(preview.generation.reviewEntries.map((entry) => entry.reasonCode)).toContain('IMAGE_ASSET_EXPORT_REQUIRED');
    expect(pack.manifest?.reviews.map((review) => review.reasonCode)).toEqual(expect.arrayContaining(['IMAGE_BYTES_UNAVAILABLE', 'ASSET_EXPORT_UNAVAILABLE']));
    expect(pack.manifest?.label).toBe('REVIEW REQUIRED');
  });
});
