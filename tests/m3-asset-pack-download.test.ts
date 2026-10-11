import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildP15ElementorPackFromFigmaFrame } from '../src/plugin/p15-elementor-pack-builder';
import { buildP15AssetPackDownloadResult } from '../src/plugin/p15-asset-pack-download';
import { landingPageFrame } from './fixtures/m2-landing-page';

const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 7, 7, 7]);
const api = { getImageByHash: (hash: string) => (hash === 'abc' ? { getBytesAsync: async () => PNG, getSizeAsync: async () => ({ width: 2560, height: 1280 }) } : null) };

function frameWithExports(): FrameNode {
  const frame = landingPageFrame();
  const shot = (frame.children as Array<Record<string, unknown>>).find((child) => child.id === 'product-shot')!;
  shot.exportAsync = async (settings: { constraint?: { value?: number } }) => Uint8Array.from([0x89, 0x50, 0x4e, 0x47, settings.constraint?.value ?? 0]);
  return frame as unknown as FrameNode;
}

describe('recovery M3.7 — asset-pack download envelope', () => {
  it('carries the manifest label and the ZIP bytes, never import readiness', async () => {
    const build = await buildP15ElementorPackFromFigmaFrame(frameWithExports(), api);
    const result = buildP15AssetPackDownloadResult(build);
    expect(result).toMatchObject({ status: 'PACK_READY', label: build.pack.manifest!.label, targetImportReady: false,
      fileName: build.pack.fileName, assetCount: 3, reviewCount: build.pack.manifest!.reviews.length });
    expect(result.label).toBe('REVIEW REQUIRED');
    expect(result.bytes).toBe(build.pack.bytes);
    expect(result.status === 'PACK_READY' && result.reviews.map((review) => review.reasonCode)).toContain('ASSET_UPLOAD_REQUIRED');
  });

  it('passes a blocked pack through as blocked, with no bytes', () => {
    const result = buildP15AssetPackDownloadResult({ pack: { status: 'PACK_BLOCKED', fileName: null, bytes: null, manifest: null, blockReason: 'nope' } });
    expect(result).toEqual({ version: 'p15-elementor-asset-pack-download-v1', status: 'PACK_BLOCKED', label: null,
      targetImportReady: false, fileName: null, bytes: null, blockReason: 'nope' });
  });

  it('refuses a pack whose file name or label breaks the contract', async () => {
    const build = await buildP15ElementorPackFromFigmaFrame(frameWithExports(), api);
    expect(buildP15AssetPackDownloadResult({ pack: { ...build.pack, fileName: '../evil.zip' } }).status).toBe('PACK_BLOCKED');
    const manifest = { ...build.pack.manifest!, label: 'READY' as unknown as 'LOCAL CANDIDATE' };
    expect(buildP15AssetPackDownloadResult({ pack: { ...build.pack, manifest } }).status).toBe('PACK_BLOCKED');
    expect(buildP15AssetPackDownloadResult({ pack: { ...build.pack, bytes: new Uint8Array() } }).status).toBe('PACK_BLOCKED');
  });

  it('the controller re-reads the selection per request and passes the figma API to the pack builder', () => {
    const controller = readFileSync('src/plugin/p15-asset-pack-download-controller.ts', 'utf8');
    expect(controller).toContain("type === 'p15-elementor-asset-pack-request'");
    expect(controller).toContain("type: 'p15-elementor-asset-pack-result'");
    expect(controller.indexOf('const frame = selectedFrame();')).toBeLessThan(controller.indexOf('buildP15ElementorPackFromFigmaFrame(frame, figma)'));
    expect(controller).not.toContain('clientStorage');
  });

});
