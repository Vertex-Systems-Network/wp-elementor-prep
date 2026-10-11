import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { crc32, readP15Zip, validP15ZipPath, writeP15Zip } from '../src/core/zip';
import { buildP15AssetPack, verifyP15AssetPack, type P15PackAsset } from '../src/targets/elementor/asset-pack';

const bytes = (text: string) => new TextEncoder().encode(text);
const sha = (value: Uint8Array) => `sha256:${createHash('sha256').update(value).digest('hex')}`;
const asset = (assetId: string, kind: P15PackAsset['kind'], mimeType: string, content: string, nodeId: string): P15PackAsset => {
  const data = bytes(content);
  return { assetId, kind, mimeType, sourceNodeIds: [nodeId], sha256: sha(data), byteLength: data.length, widthPx: 10, heightPx: 20, bytes: data };
};

describe('recovery M3.2 — deterministic ZIP', () => {
  it('round-trips entries, matches the reference CRC-32 and is byte-identical for identical input', () => {
    expect(crc32(bytes('123456789'))).toBe(0xcbf43926);
    const entries = [{ path: 'a.txt', bytes: bytes('hello') }, { path: 'dir/ü.bin', bytes: Uint8Array.from([0, 255, 7]) }];
    const zip = writeP15Zip(entries);
    expect(readP15Zip(zip)).toEqual(entries);
    expect(writeP15Zip(entries)).toEqual(zip);
  });

  it('refuses unsafe or duplicate paths and detects corruption', () => {
    for (const path of ['', '/abs', '../up', 'a/../b', 'a//b', 'c:\\x', 'a\\b']) expect(validP15ZipPath(path), path).toBe(false);
    expect(() => writeP15Zip([{ path: 'a', bytes: bytes('1') }, { path: 'a', bytes: bytes('2') }])).toThrow();
    const zip = writeP15Zip([{ path: 'a.txt', bytes: bytes('hello') }]);
    zip[35] = zip[35]! ^ 0xff; // first data byte, after the 30-byte header and the 5-byte name
    expect(() => readP15Zip(zip)).toThrow(/CRC/);
  });

  it('is a standard archive (cross-checked with Python zipfile when available)', () => {
    const probe = spawnSync('python3', ['--version']);
    if (probe.status !== 0) return;
    const dir = mkdtempSync(join(tmpdir(), 'm3-zip-'));
    try {
      const file = join(dir, 'pack.zip');
      writeFileSync(file, writeP15Zip([{ path: 'x/y.txt', bytes: bytes('payload') }]));
      const run = spawnSync('python3', ['-I', '-c', 'import sys,zipfile;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;print(z.read("x/y.txt").decode())', file], { encoding: 'utf8' });
      expect(run.status, run.stderr).toBe(0);
      expect(run.stdout.trim()).toBe('payload');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('recovery M3.2 — atomic asset pack', () => {
  const input = () => ({
    title: 'Landing Page!',
    templateJson: '{"content":[]}',
    label: 'LOCAL CANDIDATE' as const,
    assets: [asset('original-abc', 'stored-original', 'image/png', 'png-bytes', '1:1'), asset('render-1-1@1x', 'rendered-appearance', 'image/png', 'r1', '1:1'),
      asset('svg-2-2', 'vector-svg', 'image/svg+xml', '<svg/>', '2:2'), asset('original-def', 'stored-original', 'image/jpeg', 'jpg', '3:3')],
    layerNames: new Map([['1:1', 'Team photo'], ['2:2', 'Arrow icon'], ['3:3', 'Rectangle 12']]),
  });

  it('writes template, assets and a manifest, verified before it is returned', () => {
    const pack = buildP15AssetPack(input());
    expect(pack.status).toBe('PACK_READY');
    expect(pack.fileName).toBe('landing-page-elementor-pack.zip');
    expect(verifyP15AssetPack(pack.bytes!)).toBeNull();
    expect(readP15Zip(pack.bytes!).map((entry) => entry.path)).toEqual(['manifest.json', 'template.json', 'assets/original-abc.png',
      'assets/render-1-1@1x.png', 'assets/svg-2-2.svg', 'assets/original-def.jpg']);
    expect(pack.manifest).toMatchObject({ label: 'LOCAL CANDIDATE', targetImportReady: false, template: { path: 'template.json', sha256: sha(bytes('{"content":[]}')) } });
    expect(pack.manifest!.assets.map((entry) => [entry.assetId, entry.altText, entry.usage])).toEqual([
      ['original-abc', 'Team photo', ['1:1']], ['render-1-1@1x', 'Team photo', ['1:1']], ['svg-2-2', '', ['2:2']], ['original-def', '', ['3:3']]]);
    // A picture with a default layer name needs alt text; an icon is decorative.
    expect(pack.manifest!.reviews).toEqual([expect.objectContaining({ sourceNodeId: '3:3', reasonCode: 'ASSET_ALT_TEXT_MISSING' })]);
    expect(new TextDecoder().decode(pack.bytes!)).not.toMatch(/https?:\/\//);
    expect(buildP15AssetPack(input()).bytes).toEqual(pack.bytes);
  });

  it('keeps a review label and never exposes a pack whose bytes do not match', () => {
    expect(buildP15AssetPack({ ...input(), label: 'REVIEW REQUIRED' }).manifest?.label).toBe('REVIEW REQUIRED');
    const tampered = input();
    tampered.assets[0] = { ...tampered.assets[0]!, bytes: bytes('other') };
    expect(buildP15AssetPack(tampered)).toEqual({ status: 'PACK_BLOCKED', fileName: null, bytes: null, manifest: null,
      blockReason: 'Asset original-abc bytes do not match its recorded SHA-256 or length.' });
    const badId = input();
    badId.assets[0] = { ...badId.assets[0]!, assetId: '../evil' };
    expect(buildP15AssetPack(badId).status).toBe('PACK_BLOCKED');
  });

  it('verification rejects a pack with an unlisted or altered file', () => {
    const pack = buildP15AssetPack(input()).bytes!;
    const entries = readP15Zip(pack);
    expect(verifyP15AssetPack(writeP15Zip([...entries, { path: 'assets/extra.png', bytes: bytes('x') }]))).toMatch(/does not list/);
    expect(verifyP15AssetPack(writeP15Zip(entries.map((entry) => (entry.path === 'template.json' ? { ...entry, bytes: bytes('{}') } : entry))))).toMatch(/template/);
  });
});
