import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inflateSync } from 'node:zlib';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { HARNESS_SVG, buildP15HarnessFixture, relinkP15HarnessPack, solidPng } from '../src/cli/p15-asset-pack-harness-lib';
import { verifyP15AssetPack } from '../src/targets/elementor/asset-pack';

const dir = mkdtempSync(join(tmpdir(), 'm3-harness-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('recovery M3.6b — asset-pack harness helper', () => {
  it('encodes valid deterministic PNGs', () => {
    const png = solidPng(3, 2, [1, 2, 3]);
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const view = new DataView(png.buffer, png.byteOffset);
    expect([view.getUint32(16), view.getUint32(20)]).toEqual([3, 2]);
    const idatLength = view.getUint32(33);
    const raw = inflateSync(png.subarray(41, 41 + idatLength));
    expect([...raw]).toEqual([0, 1, 2, 3, 1, 2, 3, 1, 2, 3, 0, 1, 2, 3, 1, 2, 3, 1, 2, 3]);
    expect(solidPng(3, 2, [1, 2, 3])).toEqual(png);
  });

  it('builds the fixture pack: an image widget, a background image and an SVG icon, upload reviews only', async () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    try {
      await buildP15HarnessFixture(join(dir, 'out'));
    } finally {
      write.mockRestore();
    }
    expect(verifyP15AssetPack(readFileSync(join(dir, 'out', 'asset-pack.zip')))).toBeNull();
    const expectation = JSON.parse(readFileSync(join(dir, 'out', 'harness-expectation.json'), 'utf8'));
    expect(expectation).toEqual({ schema: 'p15-asset-pack-harness-expectation-v1', label: 'REVIEW REQUIRED',
      referencedAssetPaths: ['assets/original-hero.png', 'assets/render-harness-photo@2x.png', 'assets/svg-harness-icon.svg'], sourceValuesAuthoredByHarness: true });
    expect(readFileSync(join(dir, 'out', 'pack', 'assets', 'original-hero.png')).subarray(1, 4).toString()).toBe('PNG');
    expect(readFileSync(join(dir, 'out', 'pack', 'assets', 'svg-harness-icon.svg'), 'utf8')).toBe(HARNESS_SVG);
  });

  it('relinks the fixture template to uploads and fails closed when one is missing', async () => {
    const uploads = { 'assets/original-hero.png': { id: 7, url: 'http://127.0.0.1:8080/wp-content/uploads/original-hero.png' },
      'assets/render-harness-photo@2x.png': { id: 8, url: 'http://127.0.0.1:8080/wp-content/uploads/render-harness-photo@2x.png' },
      'assets/svg-harness-icon.svg': { id: 9, url: 'http://127.0.0.1:8080/wp-content/uploads/svg-harness-icon.svg' } };
    writeFileSync(join(dir, 'uploads.json'), JSON.stringify(uploads));
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    try {
      await relinkP15HarnessPack(join(dir, 'out', 'pack'), join(dir, 'uploads.json'), join(dir, 'relinked.json'));
    } finally {
      write.mockRestore();
    }
    const relinked = readFileSync(join(dir, 'relinked.json'), 'utf8');
    expect(relinked).toContain('"url": "http://127.0.0.1:8080/wp-content/uploads/original-hero.png"');
    expect(relinked).not.toContain('"assets/');
  });
});
