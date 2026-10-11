import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { collectP15Assets, P15_ASSET_LIMITS, sniffP15ImageMime, type P15AssetFigmaApi } from '../src/plugin/p15-asset-collector';

const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 9, 9]);
const sha = (bytes: Uint8Array) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;

function api(images: Record<string, Uint8Array>, calls: string[] = []): P15AssetFigmaApi {
  return {
    getImageByHash: (hash) => (images[hash] ? { getBytesAsync: async () => { calls.push(`bytes:${hash}`); return images[hash]!; },
      getSizeAsync: async () => ({ width: 800, height: 600 }) } : null),
  };
}
const exporter = (label: string, calls: string[] = []) => async (settings: Record<string, unknown>) => {
  const scale = (settings.constraint as { value?: number } | undefined)?.value;
  calls.push(`export:${label}:${String(settings.format)}${scale ? `@${scale}` : ''}`);
  return new TextEncoder().encode(settings.format === 'SVG' ? `<svg id="${label}"/>` : `png:${label}@${scale}`);
};
const image = (id: string, hash: string, calls?: string[]) => ({ id, type: 'RECTANGLE', visible: true, width: 400, height: 300,
  fills: [{ type: 'IMAGE', visible: true, imageHash: hash, scaleMode: 'FILL' }], exportAsync: exporter(id, calls) });

describe('recovery M3.1 — asset collection', () => {
  it('reads stored originals once per hash and renders every image layer at 1x and 2x', async () => {
    const calls: string[] = [];
    const frame = { id: 'page', type: 'FRAME', visible: true, children: [image('1:1', 'aaa', calls), image('1:2', 'aaa', calls), image('1:3', 'bbb', calls)] };
    const result = await collectP15Assets(frame, api({ aaa: PNG, bbb: JPEG }, calls));
    expect(result.reviews).toEqual([]);
    const originals = result.assets.filter((asset) => asset.kind === 'stored-original');
    expect(originals.map((asset) => [asset.assetId, asset.mimeType, asset.sourceNodeIds, asset.widthPx, asset.sha256])).toEqual([
      ['original-aaa', 'image/png', ['1:1', '1:2'], 800, sha(PNG)],
      ['original-bbb', 'image/jpeg', ['1:3'], 800, sha(JPEG)],
    ]);
    expect(calls.filter((call) => call.startsWith('bytes:'))).toEqual(['bytes:aaa', 'bytes:bbb']);
    const renders = result.assets.filter((asset) => asset.kind === 'rendered-appearance');
    expect(renders.map((asset) => [asset.assetId, asset.scale, asset.widthPx, asset.heightPx])).toEqual([
      ['render-1-1@1x', 1, 400, 300], ['render-1-1@2x', 2, 800, 600], ['render-1-2@1x', 1, 400, 300], ['render-1-2@2x', 2, 800, 600],
      ['render-1-3@1x', 1, 400, 300], ['render-1-3@2x', 2, 800, 600]]);
    expect(result.totalBytes).toBe(result.assets.reduce((sum, asset) => sum + asset.byteLength, 0));
  });

  it('exports vectors and pure-vector icon groups as one SVG each, and skips hidden layers', async () => {
    const vector = (id: string) => ({ id, type: 'VECTOR', visible: true, width: 24, height: 24, exportAsync: exporter(id) });
    const icon = { id: 'icon', type: 'FRAME', visible: true, width: 24, height: 24, fills: [], children: [vector('v1'), vector('v2')], exportAsync: exporter('icon') };
    const frame = { id: 'page', type: 'FRAME', visible: true, children: [icon, vector('star'), { ...vector('hidden'), visible: false },
      { id: 'mixed', type: 'FRAME', visible: true, fills: [], children: [vector('v3'), { id: 't', type: 'TEXT', visible: true }] }] };
    const result = await collectP15Assets(frame, api({}));
    expect(result.assets.map((asset) => [asset.assetId, asset.kind, asset.mimeType])).toEqual([
      ['svg-icon', 'vector-svg', 'image/svg+xml'], ['svg-star', 'vector-svg', 'image/svg+xml'], ['svg-v3', 'vector-svg', 'image/svg+xml']]);
  });

  it('anything unreadable becomes an explicit review', async () => {
    const failing = { ...image('2:1', 'ccc'), exportAsync: async () => { throw new Error('boom'); } };
    const frame = { id: 'page', type: 'FRAME', visible: true, children: [
      image('2:0', 'missing'), failing, image('2:2', 'gif'), { ...image('2:3', ''), fills: [{ type: 'IMAGE', visible: true }] }] };
    const result = await collectP15Assets(frame, api({ ccc: PNG, gif: Uint8Array.from([0x42, 0x4d, 0, 0]) }));
    expect(result.reviews.map((review) => [review.sourceNodeId, review.reasonCode])).toEqual([
      ['2:0', 'IMAGE_BYTES_UNAVAILABLE'], ['2:1', 'ASSET_EXPORT_FAILED'], ['2:1', 'ASSET_EXPORT_FAILED'],
      ['2:2', 'IMAGE_FORMAT_UNSUPPORTED'], ['2:3', 'IMAGE_HASH_MISSING']]);
  });

  it('enforces the per-asset limit and never emits a URL', async () => {
    const huge = new Uint8Array(P15_ASSET_LIMITS.maxAssetBytes + 1);
    huge.set(PNG);
    const result = await collectP15Assets({ id: 'page', type: 'FRAME', visible: true, children: [image('3:1', 'big')] }, api({ big: huge }));
    expect(result.reviews[0]).toMatchObject({ sourceNodeId: '3:1', reasonCode: 'ASSET_TOO_LARGE' });
    expect(JSON.stringify(result.assets.map(({ bytes: _bytes, ...rest }) => rest))).not.toMatch(/https?:/);
  });

  it('sniffs only PNG, JPEG, GIF and WebP signatures', () => {
    expect(sniffP15ImageMime(PNG)).toBe('image/png');
    expect(sniffP15ImageMime(JPEG)).toBe('image/jpeg');
    expect(sniffP15ImageMime(new TextEncoder().encode('GIF89a'))).toBe('image/gif');
    expect(sniffP15ImageMime(new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 '))).toBe('image/webp');
    expect(sniffP15ImageMime(new TextEncoder().encode('<svg/>'))).toBeNull();
  });
});
