import type { P15ElementorPackBuildV1 } from './p15-elementor-pack-builder';

/**
 * Asset-pack download envelope (recovery M3.7, D-051). The plugin UI receives the ZIP bytes together with the label
 * the pack's own manifest carries (`LOCAL CANDIDATE` / `REVIEW REQUIRED`). The envelope never claims import readiness:
 * `targetImportReady` is always false, because a pack still needs its assets uploaded and relinked (IMPORT.md).
 */
export const P15_ASSET_PACK_DOWNLOAD_VERSION = 'p15-elementor-asset-pack-download-v1' as const;
export const P15_ASSET_PACK_FILE_NAME = /^[a-z0-9-]{1,60}-elementor-pack\.zip$/;
const MAX_LISTED_REVIEWS = 50;

export interface P15AssetPackDownloadReview {
  sourceNodeId: string;
  reasonCode: string;
  detail: string;
}

export type P15AssetPackDownloadResultV1 =
  | {
    version: typeof P15_ASSET_PACK_DOWNLOAD_VERSION;
    status: 'PACK_READY';
    label: 'LOCAL CANDIDATE' | 'REVIEW REQUIRED';
    targetImportReady: false;
    fileName: string;
    bytes: Uint8Array;
    assetCount: number;
    reviewCount: number;
    /** The first reviews, for the list beside the download; the full list is in the pack manifest. */
    reviews: P15AssetPackDownloadReview[];
  }
  | {
    version: typeof P15_ASSET_PACK_DOWNLOAD_VERSION;
    status: 'PACK_BLOCKED';
    label: null;
    targetImportReady: false;
    fileName: null;
    bytes: null;
    blockReason: string;
  };

function blocked(blockReason: string): P15AssetPackDownloadResultV1 {
  return { version: P15_ASSET_PACK_DOWNLOAD_VERSION, status: 'PACK_BLOCKED', label: null, targetImportReady: false, fileName: null, bytes: null, blockReason };
}

export function buildP15AssetPackDownloadResult(build: Pick<P15ElementorPackBuildV1, 'pack'>): P15AssetPackDownloadResultV1 {
  const { pack } = build;
  if (pack.status !== 'PACK_READY') return blocked(pack.blockReason ?? 'Asset pack was not built.');
  const { manifest, bytes, fileName } = pack;
  if (manifest === null || bytes === null || bytes.length === 0 || fileName === null || !P15_ASSET_PACK_FILE_NAME.test(fileName)) {
    return blocked('Asset pack failed the download contract (manifest, bytes or file name).');
  }
  if (manifest.targetImportReady !== false || (manifest.label !== 'LOCAL CANDIDATE' && manifest.label !== 'REVIEW REQUIRED')) {
    return blocked('Asset pack manifest carries an unexpected readiness label.');
  }
  return {
    version: P15_ASSET_PACK_DOWNLOAD_VERSION,
    status: 'PACK_READY',
    label: manifest.label,
    targetImportReady: false,
    fileName,
    bytes,
    assetCount: manifest.assets.length,
    reviewCount: manifest.reviews.length,
    reviews: manifest.reviews.slice(0, MAX_LISTED_REVIEWS).map(({ sourceNodeId, reasonCode, detail }) => ({ sourceNodeId, reasonCode, detail })),
  };
}
