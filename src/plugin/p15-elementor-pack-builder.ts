import { buildP15AssetPack, type P15AssetPackResultV1 } from '../targets/elementor/asset-pack';
import type { P15NeutralDocumentType } from '../targets/elementor/neutral-export-ir';
import { collectP15Assets, type P15AssetCollectionV1, type P15AssetFigmaApi } from './p15-asset-collector';
import { buildP15ElementorV1PreviewFromFigmaFrame, type P15FigmaNeutralExtractionResult } from './p15-neutral-export-extractor';

/**
 * One selected frame → one Elementor asset pack (recovery M3.3, D-051). Read-only and network-free:
 * 1. collect assets (stored originals, @1x/@2x renders, SVG icons);
 * 2. extract with the @1x render of each image layer as its pack-relative Image widget source;
 * 3. generate through the shared export path (coverage audit included);
 * 4. pack the ready candidate as `LOCAL CANDIDATE`, or the D-049 review artifact as `REVIEW REQUIRED`.
 * Images always add `ASSET_UPLOAD_REQUIRED`, so a pack with images is a review pack until M3.6 proves upload.
 */
export interface P15ElementorPackBuildV1 {
  preview: P15FigmaNeutralExtractionResult;
  assets: P15AssetCollectionV1;
  pack: P15AssetPackResultV1;
}

const EXTENSIONS: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg' };

function layerNames(node: unknown, names: Map<string, string>): void {
  if (typeof node !== 'object' || node === null) return;
  const record = node as Record<string, unknown>;
  if (typeof record.id === 'string' && typeof record.name === 'string') names.set(record.id, record.name);
  if (Array.isArray(record.children)) for (const child of record.children) layerNames(child, names);
}

export async function buildP15ElementorPackFromFigmaFrame(
  frame: FrameNode,
  api: P15AssetFigmaApi,
  documentType: P15NeutralDocumentType = 'page',
): Promise<P15ElementorPackBuildV1> {
  const assets = await collectP15Assets(frame, api);
  const assetPaths = new Map<string, string>();
  for (const asset of assets.assets) {
    if (asset.kind === 'rendered-appearance' && asset.scale === 1 && asset.sourceNodeIds[0] !== undefined) {
      assetPaths.set(asset.sourceNodeIds[0], `assets/${asset.assetId}.${EXTENSIONS[asset.mimeType]}`);
    }
  }
  const preview = buildP15ElementorV1PreviewFromFigmaFrame(frame, documentType, assetPaths);
  const names = new Map<string, string>();
  layerNames(frame, names);
  const { generation } = preview;
  const source = generation.status === 'GENERATED_LOCAL_CANDIDATE' && generation.candidate?.templateJson
    ? { label: 'LOCAL CANDIDATE' as const, templateJson: generation.candidate.templateJson }
    : generation.reviewArtifact
      ? { label: 'REVIEW REQUIRED' as const, templateJson: `${JSON.stringify(generation.reviewArtifact.template, null, 2)}\n` }
      : null;
  const pack: P15AssetPackResultV1 = source === null
    ? { status: 'PACK_BLOCKED', fileName: null, bytes: null, manifest: null, blockReason: `Generation produced no template (${generation.status}).` }
    : buildP15AssetPack({ title: preview.document.title, ...source, assets: assets.assets, layerNames: names,
      reviews: [...assets.reviews, ...generation.reviewEntries] });
  return { preview, assets, pack };
}
