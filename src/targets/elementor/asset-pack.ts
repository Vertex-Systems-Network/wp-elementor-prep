import { sha256BytesHex } from '../../core/sha256';
import { readP15Zip, writeP15Zip, type P15ZipEntry } from '../../core/zip';

/**
 * Atomic asset pack (recovery M3.2): one ZIP holding `template.json`, `assets/*` and `manifest.json`.
 *
 * The pack is built completely in memory, read back and verified (every path, byte, CRC and manifest SHA-256) before
 * its bytes are returned; any failure returns no bytes at all, so an incomplete pack is never exposed. The manifest
 * lists, per asset, its id, path, kind (stored original, rendered appearance or SVG), MIME type, SHA-256, byte length,
 * pixel size, alt text and the nodes that use it. A pack built from a D-049 review artifact keeps that label: it is
 * never presented as ready for import. No URL, no network.
 */
export const P15_ASSET_PACK_VERSION = 'p15-elementor-asset-pack-v1' as const;
export const ASSET_ALT_TEXT_REVIEW = 'ASSET_ALT_TEXT_MISSING';

export type P15AssetPackLabel = 'LOCAL CANDIDATE' | 'REVIEW REQUIRED';

/** Structural view of a collected asset (see `src/plugin/p15-asset-collector.ts`). */
export interface P15PackAsset {
  assetId: string;
  kind: 'stored-original' | 'rendered-appearance' | 'vector-svg';
  sourceNodeIds: string[];
  mimeType: string;
  sha256: string;
  byteLength: number;
  widthPx: number;
  heightPx: number;
  imageHash?: string;
  scale?: 1 | 2;
  bytes: Uint8Array;
}

export interface P15AssetPackManifestEntry {
  assetId: string;
  path: string;
  kind: P15PackAsset['kind'];
  mimeType: string;
  sha256: string;
  byteLength: number;
  widthPx: number;
  heightPx: number;
  altText: string;
  usage: string[];
  imageHash?: string;
  scale?: 1 | 2;
}

export interface P15AssetPackReview {
  sourceNodeId: string;
  reasonCode: string;
  detail: string;
}

export interface P15AssetPackManifestV1 {
  schemaVersion: 1;
  packVersion: typeof P15_ASSET_PACK_VERSION;
  label: P15AssetPackLabel;
  targetImportReady: false;
  template: { path: 'template.json'; sha256: string; byteLength: number };
  assets: P15AssetPackManifestEntry[];
  reviews: P15AssetPackReview[];
}

export interface P15AssetPackInput {
  title: string;
  templateJson: string;
  label: P15AssetPackLabel;
  assets: readonly P15PackAsset[];
  /** Figma layer names by node id, for alt text. */
  layerNames: ReadonlyMap<string, string>;
  /** Reviews carried in from asset collection or generation. */
  reviews?: readonly P15AssetPackReview[];
}

export interface P15AssetPackResultV1 {
  status: 'PACK_READY' | 'PACK_BLOCKED';
  fileName: string | null;
  bytes: Uint8Array | null;
  manifest: P15AssetPackManifestV1 | null;
  blockReason: string | null;
}

const EXTENSIONS: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg' };
/** Figma's default layer names describe the shape, not the picture, so they are not alt text. */
const GENERIC_NAME = /^(rectangle|image|frame|vector|group|ellipse|polygon|star|union|subtract|intersect|exclude|icon|shape|layer)(\s*\d+)?$/i;
const utf8 = (value: string): Uint8Array => new TextEncoder().encode(value);
const hash = (bytes: Uint8Array): string => `sha256:${sha256BytesHex(bytes)}`;

function slug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'design';
}

function blocked(reason: string): P15AssetPackResultV1 {
  return { status: 'PACK_BLOCKED', fileName: null, bytes: null, manifest: null, blockReason: reason };
}

export function buildP15AssetPack(input: P15AssetPackInput): P15AssetPackResultV1 {
  const reviews: P15AssetPackReview[] = [...(input.reviews ?? [])];
  const entries: P15AssetPackManifestEntry[] = [];
  const files: P15ZipEntry[] = [];
  for (const asset of input.assets) {
    const extension = EXTENSIONS[asset.mimeType];
    if (!extension || !/^[A-Za-z0-9@-]{1,80}$/.test(asset.assetId)) return blocked(`Asset ${asset.assetId} has an unsupported id or MIME type.`);
    if (asset.bytes.length !== asset.byteLength || hash(asset.bytes) !== asset.sha256) return blocked(`Asset ${asset.assetId} bytes do not match its recorded SHA-256 or length.`);
    const path = `assets/${asset.assetId}.${extension}`;
    const name = (input.layerNames.get(asset.sourceNodeIds[0] ?? '') ?? '').trim();
    const altText = asset.kind === 'vector-svg' || GENERIC_NAME.test(name) ? '' : name.slice(0, 250);
    // Icons are decorative by default; a picture without a descriptive layer name needs its alt text written.
    if (altText === '' && asset.kind === 'stored-original') {
      reviews.push({ sourceNodeId: asset.sourceNodeIds[0] ?? '', reasonCode: ASSET_ALT_TEXT_REVIEW,
        detail: `Image ${asset.assetId} has no descriptive layer name; write its alt text before publishing.` });
    }
    entries.push({ assetId: asset.assetId, path, kind: asset.kind, mimeType: asset.mimeType, sha256: asset.sha256, byteLength: asset.byteLength,
      widthPx: asset.widthPx, heightPx: asset.heightPx, altText, usage: [...asset.sourceNodeIds],
      ...(asset.imageHash === undefined ? {} : { imageHash: asset.imageHash }), ...(asset.scale === undefined ? {} : { scale: asset.scale }) });
    files.push({ path, bytes: asset.bytes });
  }
  const template = utf8(input.templateJson);
  const manifest: P15AssetPackManifestV1 = {
    schemaVersion: 1,
    packVersion: P15_ASSET_PACK_VERSION,
    label: input.label,
    targetImportReady: false,
    template: { path: 'template.json', sha256: hash(template), byteLength: template.length },
    assets: entries,
    reviews,
  };
  let archive: Uint8Array;
  try {
    archive = writeP15Zip([{ path: 'manifest.json', bytes: utf8(`${JSON.stringify(manifest, null, 2)}\n`) }, { path: 'template.json', bytes: template }, ...files]);
  } catch (error) {
    return blocked(error instanceof Error ? error.message : String(error));
  }
  const verdict = verifyP15AssetPack(archive);
  if (verdict !== null) return blocked(`The written pack failed verification: ${verdict}`);
  return { status: 'PACK_READY', fileName: `${slug(input.title)}-elementor-pack.zip`, bytes: archive, manifest, blockReason: null };
}

/** Re-read a pack and check it against its own manifest; returns null when it is complete and intact. */
export function verifyP15AssetPack(archive: Uint8Array): string | null {
  let entries: P15ZipEntry[];
  try {
    entries = readP15Zip(archive);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  const byPath = new Map(entries.map((entry) => [entry.path, entry.bytes]));
  const manifestBytes = byPath.get('manifest.json');
  if (!manifestBytes) return 'manifest.json is missing.';
  let manifest: P15AssetPackManifestV1;
  try {
    manifest = JSON.parse(new TextDecoder().decode(manifestBytes)) as P15AssetPackManifestV1;
  } catch {
    return 'manifest.json is not JSON.';
  }
  if (manifest.packVersion !== P15_ASSET_PACK_VERSION || manifest.targetImportReady !== false) return 'Unknown or authority-inflated manifest.';
  const template = byPath.get('template.json');
  if (!template || hash(template) !== manifest.template.sha256) return 'template.json does not match the manifest.';
  for (const asset of manifest.assets) {
    const bytes = byPath.get(asset.path);
    if (!bytes || bytes.length !== asset.byteLength || hash(bytes) !== asset.sha256) return `${asset.path} does not match the manifest.`;
  }
  if (entries.length !== manifest.assets.length + 2) return 'The pack holds files the manifest does not list.';
  return null;
}
