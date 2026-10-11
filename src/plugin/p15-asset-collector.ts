import { sha256BytesHex } from '../core/sha256';

/**
 * Asset collection (recovery M3.1): read-only bytes for every image and vector a selected frame shows.
 *
 * Engineering rule: Figma image export distinguishes the **Stored Original** (the uploaded file, through
 * `figma.getImageByHash(hash).getBytesAsync()`, deduplicated by image hash) from the **Rendered Appearance** (what the
 * layer looks like after crop, scale mode, filters and effects, through `node.exportAsync` as PNG @1x and @2x).
 * Vector layers, and frames or groups made only of vector layers (icons), are exported once as SVG.
 *
 * The collector never mutates Figma, never reaches the network and never emits a temporary Figma URL. Anything it
 * cannot read within its bounds becomes an explicit review, never a silent gap. The Figma API is injected so the
 * collector runs the same way in the plugin and in tests.
 */
export const P15_ASSET_COLLECTOR_VERSION = 'p15-asset-collector-v1' as const;
export const P15_ASSET_LIMITS = Object.freeze({ maxAssets: 500, maxAssetBytes: 20 * 1024 * 1024, maxTotalBytes: 200 * 1024 * 1024 });

export type P15AssetKind = 'stored-original' | 'rendered-appearance' | 'vector-svg';
export type P15AssetMimeType = 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' | 'image/svg+xml';

export interface P15AssetRecord {
  /** Stable pack-relative id: content-addressed for originals, node-addressed for renders and SVGs. */
  assetId: string;
  kind: P15AssetKind;
  /** Nodes that use this asset, in document order. */
  sourceNodeIds: string[];
  mimeType: P15AssetMimeType;
  sha256: string;
  byteLength: number;
  widthPx: number;
  heightPx: number;
  /** Stored originals only. */
  imageHash?: string;
  /** Rendered appearances only. */
  scale?: 1 | 2;
  bytes: Uint8Array;
}

export interface P15AssetReview {
  sourceNodeId: string;
  reasonCode: string;
  detail: string;
}

export interface P15AssetCollectionV1 {
  collectorVersion: typeof P15_ASSET_COLLECTOR_VERSION;
  assets: P15AssetRecord[];
  reviews: P15AssetReview[];
  totalBytes: number;
}

/** The slice of the Figma Plugin API the collector uses. */
export interface P15AssetFigmaApi {
  getImageByHash(hash: string): { getBytesAsync(): Promise<Uint8Array>; getSizeAsync(): Promise<{ width: number; height: number }> } | null;
}

type Node = Record<string, unknown> & {
  exportAsync?: (settings: Record<string, unknown>) => Promise<Uint8Array>;
};

const VECTOR_TYPES = new Set(['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON']);
const CONTAINER_TYPES = new Set(['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE']);

const children = (node: Node): Node[] => (Array.isArray(node.children) ? node.children as Node[] : []);
const visible = (node: Node): boolean => node.visible !== false;

function imagePaints(node: Node): Record<string, unknown>[] {
  const fills = node.fills;
  if (!Array.isArray(fills)) return [];
  return fills.filter((paint) => typeof paint === 'object' && paint !== null && (paint as Record<string, unknown>).type === 'IMAGE'
    && (paint as Record<string, unknown>).visible !== false) as Record<string, unknown>[];
}

/** A frame or group whose visible content is only vector layers: an icon, exported as one SVG. */
function isVectorIcon(node: Node): boolean {
  if (!CONTAINER_TYPES.has(String(node.type)) || imagePaints(node).length > 0) return false;
  const content = children(node).filter(visible);
  return content.length > 0 && content.every((child) => VECTOR_TYPES.has(String(child.type)) || isVectorIcon(child));
}

/** MIME type from the file signature; null for anything else. */
export function sniffP15ImageMime(bytes: Uint8Array): Exclude<P15AssetMimeType, 'image/svg+xml'> | null {
  const at = (index: number, ...values: number[]) => values.every((value, offset) => bytes[index + offset] === value);
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  if (at(0, 0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (at(0, 0x47, 0x49, 0x46, 0x38)) return 'image/gif';
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return 'image/webp';
  return null;
}

/** Node ids such as `12:34` or `I1:2;3:4` become a safe id fragment. */
const safeId = (value: string): string => value.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'node';

class Collector {
  readonly assets: P15AssetRecord[] = [];
  readonly reviews: P15AssetReview[] = [];
  private readonly originals = new Map<string, P15AssetRecord>();
  totalBytes = 0;

  constructor(private readonly api: P15AssetFigmaApi) {}

  private review(sourceNodeId: string, reasonCode: string, detail: string): void {
    this.reviews.push({ sourceNodeId, reasonCode, detail });
  }

  private admit(record: Omit<P15AssetRecord, 'sha256' | 'byteLength'>): P15AssetRecord | null {
    const [sourceNodeId] = record.sourceNodeIds;
    if (record.bytes.length === 0) {
      this.review(sourceNodeId!, 'ASSET_EMPTY', `${record.assetId} has no bytes.`);
      return null;
    }
    if (record.bytes.length > P15_ASSET_LIMITS.maxAssetBytes) {
      this.review(sourceNodeId!, 'ASSET_TOO_LARGE', `${record.assetId} is ${record.bytes.length} bytes; the limit is ${P15_ASSET_LIMITS.maxAssetBytes}.`);
      return null;
    }
    if (this.assets.length >= P15_ASSET_LIMITS.maxAssets || this.totalBytes + record.bytes.length > P15_ASSET_LIMITS.maxTotalBytes) {
      this.review(sourceNodeId!, 'ASSET_PACK_LIMIT_EXCEEDED', `The asset pack would exceed ${P15_ASSET_LIMITS.maxAssets} assets or ${P15_ASSET_LIMITS.maxTotalBytes} bytes.`);
      return null;
    }
    if (this.assets.some((asset) => asset.assetId === record.assetId)) {
      this.review(sourceNodeId!, 'ASSET_ID_COLLISION', `Two layers map to the asset id ${record.assetId}.`);
      return null;
    }
    const admitted: P15AssetRecord = { ...record, sha256: `sha256:${sha256BytesHex(record.bytes)}`, byteLength: record.bytes.length };
    this.assets.push(admitted);
    this.totalBytes += admitted.byteLength;
    return admitted;
  }

  private async original(node: Node, id: string, paint: Record<string, unknown>): Promise<void> {
    const hash = paint.imageHash;
    if (typeof hash !== 'string' || hash.length === 0) {
      this.review(id, 'IMAGE_HASH_MISSING', 'The image fill has no image hash, so its original bytes cannot be read.');
      return;
    }
    const known = this.originals.get(hash);
    if (known) {
      if (!known.sourceNodeIds.includes(id)) known.sourceNodeIds.push(id);
      return;
    }
    const image = this.api.getImageByHash(hash);
    if (!image) {
      this.review(id, 'IMAGE_BYTES_UNAVAILABLE', `Figma has no image for hash ${hash}.`);
      return;
    }
    let bytes: Uint8Array;
    let size: { width: number; height: number };
    try {
      [bytes, size] = await Promise.all([image.getBytesAsync(), image.getSizeAsync()]);
    } catch (error) {
      this.review(id, 'IMAGE_BYTES_UNAVAILABLE', `Reading image ${hash} failed: ${error instanceof Error ? error.message : String(error)}.`);
      return;
    }
    const mimeType = sniffP15ImageMime(bytes);
    if (mimeType === null) {
      this.review(id, 'IMAGE_FORMAT_UNSUPPORTED', `Image ${hash} is not PNG, JPEG, GIF or WebP.`);
      return;
    }
    const record = this.admit({ assetId: `original-${safeId(hash).slice(0, 40)}`, kind: 'stored-original', sourceNodeIds: [id], mimeType,
      widthPx: size.width, heightPx: size.height, imageHash: hash, bytes });
    if (record) this.originals.set(hash, record);
  }

  private async rendered(node: Node, id: string, format: 'PNG' | 'SVG', scale?: 1 | 2): Promise<void> {
    if (typeof node.exportAsync !== 'function') {
      this.review(id, 'ASSET_EXPORT_UNAVAILABLE', `The ${String(node.type)} layer cannot be exported.`);
      return;
    }
    let bytes: Uint8Array;
    try {
      bytes = await node.exportAsync(format === 'SVG' ? { format: 'SVG' } : { format: 'PNG', constraint: { type: 'SCALE', value: scale } });
    } catch (error) {
      this.review(id, 'ASSET_EXPORT_FAILED', `Exporting ${format}${scale ? ` @${scale}x` : ''} failed: ${error instanceof Error ? error.message : String(error)}.`);
      return;
    }
    const width = typeof node.width === 'number' ? node.width : 0;
    const height = typeof node.height === 'number' ? node.height : 0;
    this.admit(format === 'SVG'
      ? { assetId: `svg-${safeId(id)}`, kind: 'vector-svg', sourceNodeIds: [id], mimeType: 'image/svg+xml', widthPx: width, heightPx: height, bytes }
      : { assetId: `render-${safeId(id)}@${scale}x`, kind: 'rendered-appearance', sourceNodeIds: [id], mimeType: 'image/png',
        widthPx: Math.round(width * scale!), heightPx: Math.round(height * scale!), scale: scale!, bytes });
  }

  async walk(node: Node): Promise<void> {
    if (!visible(node)) return;
    const id = String(node.id);
    if (VECTOR_TYPES.has(String(node.type)) || isVectorIcon(node)) {
      await this.rendered(node, id, 'SVG');
      return;
    }
    const images = imagePaints(node);
    if (images.length > 0) {
      for (const paint of images) await this.original(node, id, paint);
      // A frame with content uses its original as a background (M3.4b); only image leaves need their appearance.
      if (!children(node).some(visible)) {
        await this.rendered(node, id, 'PNG', 1);
        await this.rendered(node, id, 'PNG', 2);
      }
    }
    for (const child of children(node)) await this.walk(child);
  }
}

/** Collect the assets of one selected frame. Sequential reads keep memory and Figma load bounded. */
export async function collectP15Assets(frame: unknown, api: P15AssetFigmaApi): Promise<P15AssetCollectionV1> {
  const collector = new Collector(api);
  await collector.walk(frame as Node);
  return { collectorVersion: P15_ASSET_COLLECTOR_VERSION, assets: collector.assets, reviews: collector.reviews, totalBytes: collector.totalBytes };
}
