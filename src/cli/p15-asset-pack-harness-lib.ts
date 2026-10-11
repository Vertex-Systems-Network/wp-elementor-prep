import { deflateSync } from 'node:zlib';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { crc32, readP15Zip } from '../core/zip';
import { buildP15ElementorPackFromFigmaFrame } from '../plugin/p15-elementor-pack-builder';
import { relinkP15PackAssets, type P15UploadedAsset } from '../targets/elementor/asset-relink';

/**
 * Real-target asset harness helper (recovery M3.6b), used by `p15-real-target-proof.yml`:
 * - `fixture --out-dir <dir>`: build a controlled Figma-shaped frame (an image layer and a frame with a background image,
 *   both backed by real, valid PNG bytes), run the plugin's frame → asset-pack path, and write the pack, its extracted
 *   files and `harness-expectation.json` (every pack path the template references).
 * - `relink --pack-dir <dir> --uploads <uploads.json> --out <template.json>`: rewrite the pack template to the uploaded
 *   attachments with `relinkP15PackAssets`; exits non-zero unless every reference resolved.
 * Source values are authored by this harness; nothing here claims editor-generated serialization or compatibility.
 */
export function fail(message: string): never {
  process.stderr.write(`P15_ASSET_PACK_HARNESS_FAILED: ${message}\n`);
  process.exit(2);
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(new TextEncoder().encode(type), 4);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

/** A valid, deterministic RGB PNG of one colour. */
export function solidPng(width: number, height: number, rgb: [number, number, number]): Uint8Array {
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  header.set([8, 2, 0, 0, 0], 8);
  const row = new Uint8Array(1 + width * 3);
  for (let x = 0; x < width; x += 1) row.set(rgb, 1 + x * 3);
  const raw = new Uint8Array(row.length * height);
  for (let y = 0; y < height; y += 1) raw.set(row, y * row.length);
  const parts = [Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', new Uint8Array())];
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

const text = (id: string, characters: string) => ({ id, name: id, type: 'TEXT', visible: true, characters, textAlignHorizontal: 'LEFT', fills: [] });

export function harnessFrame(): Record<string, unknown> {
  const photo = { id: 'harness-photo', name: 'Product photo', type: 'RECTANGLE', visible: true, width: 320, height: 200,
    layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED', fills: [{ type: 'IMAGE', visible: true, imageHash: 'photo', scaleMode: 'FILL' }],
    strokes: [], effects: [],
    exportAsync: async (settings: { constraint?: { value?: number } }) => {
      const scale = settings.constraint?.value ?? 1;
      return solidPng(320 * scale, 200 * scale, [30, 99, 235]);
    } };
  const hero = { id: 'harness-hero', name: 'Hero banner', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP',
    layoutPositioning: 'AUTO', itemSpacing: 0, paddingTop: 48, paddingRight: 48, paddingBottom: 48, paddingLeft: 48, primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: 'MIN', width: 800, height: 240, fills: [{ type: 'IMAGE', visible: true, imageHash: 'hero', scaleMode: 'FILL' }],
    strokes: [], effects: [], children: [text('harness-hero-title', 'Asset pack harness')] };
  return { id: 'harness-page', name: 'P15 Asset Pack Harness', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP',
    layoutPositioning: 'AUTO', itemSpacing: 24, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: 'MIN', width: 800, height: 520, fills: [], strokes: [], effects: [], children: [hero, photo] };
}

const ORIGINALS: Record<string, { bytes: Uint8Array; width: number; height: number }> = {
  hero: { bytes: solidPng(1600, 480, [16, 185, 129]), width: 1600, height: 480 },
  photo: { bytes: solidPng(640, 400, [30, 99, 235]), width: 640, height: 400 },
};

export async function buildP15HarnessFixture(outDir: string): Promise<void> {
  const { pack, preview } = await buildP15ElementorPackFromFigmaFrame(harnessFrame() as unknown as FrameNode, {
    getImageByHash: (hash) => {
      const original = ORIGINALS[hash];
      return original ? { getBytesAsync: async () => original.bytes, getSizeAsync: async () => ({ width: original.width, height: original.height }) } : null;
    },
  });
  if (pack.status !== 'PACK_READY' || !pack.bytes || !pack.manifest) fail(`pack not built: ${pack.blockReason ?? 'unknown'}`);
  const unexpected = preview.generation.reviewEntries.filter((entry) => entry.reasonCode !== 'ASSET_UPLOAD_REQUIRED');
  if (unexpected.length > 0) fail(`unexpected reviews: ${unexpected.map((entry) => entry.reasonCode).join(', ')}`);
  const root = resolve(outDir);
  await mkdir(join(root, 'pack', 'assets'), { recursive: true });
  await writeFile(join(root, 'asset-pack.zip'), pack.bytes);
  for (const entry of readP15Zip(pack.bytes)) {
    await mkdir(dirname(join(root, 'pack', entry.path)), { recursive: true });
    await writeFile(join(root, 'pack', entry.path), entry.bytes);
  }
  const template = JSON.parse(new TextDecoder().decode(readP15Zip(pack.bytes).find((entry) => entry.path === 'template.json')!.bytes)) as unknown;
  const referenced = new Set<string>();
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (typeof value === 'object' && value !== null) {
      for (const [key, entry] of Object.entries(value)) {
        if ((key === 'image' || key === 'background_image') && typeof (entry as { url?: unknown })?.url === 'string') referenced.add((entry as { url: string }).url);
        else walk(entry);
      }
    }
  };
  walk(template);
  await writeFile(join(root, 'harness-expectation.json'), `${JSON.stringify({ schema: 'p15-asset-pack-harness-expectation-v1',
    label: pack.manifest.label, referencedAssetPaths: [...referenced].sort(), sourceValuesAuthoredByHarness: true }, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ outDir: root, label: pack.manifest.label, referencedAssetPaths: [...referenced].sort() })}\n`);
}

export async function relinkP15HarnessPack(packDir: string, uploadsPath: string, outPath: string): Promise<void> {
  const templateJson = await readFile(join(resolve(packDir), 'template.json'), 'utf8');
  const raw = JSON.parse(await readFile(resolve(uploadsPath), 'utf8')) as Record<string, P15UploadedAsset>;
  const result = relinkP15PackAssets(templateJson, new Map(Object.entries(raw)));
  await writeFile(resolve(outPath), result.templateJson);
  process.stdout.write(`${JSON.stringify({ status: result.status, relinked: result.relinked, unresolved: result.unresolved })}\n`);
  if (result.status !== 'RELINKED') process.exit(1);
}

