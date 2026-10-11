import { P15_ASSET_PATH_PATTERN } from './neutral-export-ir-asset-path';

/**
 * Asset relink (recovery M3.6a, D-051): after the pack's `assets/*` were uploaded to a site's Media Library, rewrite
 * every pack-relative media reference in the template to the uploaded attachment (`id` + `url`). This is the step a
 * person performs by hand from `IMPORT.md`, and the step the M3.6 real-target harness (and a future WordPress companion)
 * performs automatically. Pure and network-free: it only rewrites JSON with the uploads it is given.
 *
 * Rewritten values: the Image widget `image` and the Container `background_image` (`{ url, id }` MEDIA values) whose
 * `url` is a pack path. The result lists every pack path still unresolved; a relink is complete only when none is left.
 */
export interface P15UploadedAsset {
  /** WordPress attachment id. */
  id: number;
  /** Absolute http(s) URL of the uploaded original. */
  url: string;
}

export interface P15AssetRelinkResultV1 {
  status: 'RELINKED' | 'INCOMPLETE';
  templateJson: string;
  relinked: string[];
  unresolved: string[];
}

const MEDIA_KEYS = new Set(['image', 'background_image']);

function validUpload(upload: P15UploadedAsset | undefined): upload is P15UploadedAsset {
  if (upload === undefined || !Number.isSafeInteger(upload.id) || upload.id <= 0) return false;
  try {
    const parsed = new URL(upload.url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function relinkP15PackAssets(templateJson: string, uploads: ReadonlyMap<string, P15UploadedAsset>): P15AssetRelinkResultV1 {
  const relinked = new Set<string>();
  const unresolved = new Set<string>();
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(visit);
    if (typeof value !== 'object' || value === null) return value;
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      const media = entry as { url?: unknown } | null;
      if (MEDIA_KEYS.has(key) && typeof media === 'object' && media !== null && typeof media.url === 'string' && P15_ASSET_PATH_PATTERN.test(media.url)) {
        const upload = uploads.get(media.url);
        if (validUpload(upload)) {
          out[key] = { ...(entry as Record<string, unknown>), id: upload.id, url: upload.url };
          relinked.add(media.url);
        } else {
          out[key] = entry;
          unresolved.add(media.url);
        }
        continue;
      }
      out[key] = visit(entry);
    }
    return out;
  };
  const rewritten = visit(JSON.parse(templateJson));
  return {
    status: unresolved.size === 0 ? 'RELINKED' : 'INCOMPLETE',
    templateJson: `${JSON.stringify(rewritten, null, 2)}\n`,
    relinked: [...relinked].sort(),
    unresolved: [...unresolved].sort(),
  };
}
