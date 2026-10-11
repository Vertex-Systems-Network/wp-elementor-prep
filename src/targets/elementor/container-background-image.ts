import { P15_ASSET_PATH_PATTERN } from './neutral-export-ir-asset-path';

/**
 * Container background images (recovery M3.4b) and their exact Elementor 4.2.4 encoding.
 *
 * Source evidence (Elementor 4.2.4, tag commit 0e292207b5b45f0e22603967ae41c0374211160d):
 * `includes/controls/groups/background.php` (blob ac8e1a510ec663f3f428c9f564dc2c5b727435e1): `image` MEDIA
 * (`background-image: url("{{URL}}")`), `position` (… `center center`, `top left` …), `repeat` (no-repeat | repeat | …),
 * `size` (auto | cover | contain | initial = Custom) and `bg_width` (`background-size: {{SIZE}}{{UNIT}} auto`, condition
 * size = initial), registered on the Container as the `background` group with `background_background: classic`.
 *
 * Figma image paint scale modes on a frame:
 * - FILL scales the image to cover the frame, centred → `cover`, `center center`, `no-repeat`;
 * - FIT scales it to fit inside, centred → `contain`, `center center`, `no-repeat`;
 * - TILE repeats it from the top-left at its natural size × `scalingFactor` → `initial` with `bg_width` px, `top left`,
 *   `repeat`.
 * The background uses the Stored Original (CSS does the scaling). CROP, a rotated paint, image filters, a translucent
 * or blended paint, and a missing original stay `CONTAINER_BACKGROUND_IMAGE_REQUIRES_REVIEW`.
 */
export const BACKGROUND_IMAGE_REVIEW = 'CONTAINER_BACKGROUND_IMAGE_REQUIRES_REVIEW';

export interface P15NeutralBackgroundImage {
  assetPath: string;
  fit: 'cover' | 'contain' | 'tile';
  /** Tile width in px; only for `tile`. */
  tileWidthPx?: number;
}

export interface P15BackgroundImageFacts {
  paint: Record<string, unknown>;
  /** Pack-relative path of the Stored Original for the paint's image hash, when collected. */
  originalPath: string | undefined;
  /** Natural width of that original in px. */
  originalWidthPx: number | undefined;
}

const round = (value: number): number => Math.round(value * 100) / 100;
const FILTER_KEYS = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'highlights', 'shadows'] as const;

export function deriveP15BackgroundImage(facts: P15BackgroundImageFacts): { backgroundImage?: P15NeutralBackgroundImage; review?: { reasonCode: string; detail: string } } {
  const fail = (detail: string) => ({ review: { reasonCode: BACKGROUND_IMAGE_REVIEW, detail } });
  const { paint } = facts;
  if (facts.originalPath === undefined) return fail('The background image original was not collected; export the asset pack to map it.');
  if (paint.opacity !== undefined && paint.opacity !== 1) return fail('A translucent background image has no exact Elementor mapping.');
  if (paint.blendMode !== undefined && paint.blendMode !== 'NORMAL' && paint.blendMode !== 'PASS_THROUGH') return fail(`Blend mode ${String(paint.blendMode)} has no exact Elementor mapping.`);
  if (paint.rotation !== undefined && paint.rotation !== 0) return fail('A rotated background image has no exact Elementor mapping.');
  const filters = (typeof paint.filters === 'object' && paint.filters !== null ? paint.filters : {}) as Record<string, unknown>;
  if (FILTER_KEYS.some((key) => filters[key] !== undefined && filters[key] !== 0)) return fail('Image filters have no exact Elementor background mapping.');
  if (paint.scaleMode === 'FILL') return { backgroundImage: { assetPath: facts.originalPath, fit: 'cover' } };
  if (paint.scaleMode === 'FIT') return { backgroundImage: { assetPath: facts.originalPath, fit: 'contain' } };
  if (paint.scaleMode === 'TILE') {
    const factor = typeof paint.scalingFactor === 'number' ? paint.scalingFactor : 1;
    const width = facts.originalWidthPx === undefined ? NaN : round(facts.originalWidthPx * factor);
    if (!Number.isFinite(width) || width <= 0 || width > 16_384) return fail('The tile size of a tiled background image is unknown or out of range.');
    return { backgroundImage: { assetPath: facts.originalPath, fit: 'tile', tileWidthPx: width } };
  }
  return fail(`The ${String(paint.scaleMode)} scale mode has no exact Elementor background mapping.`);
}

export function backgroundImageProblems(value: unknown, path: string): { path: string; message: string }[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return [{ path, message: 'backgroundImage must be an object.' }];
  const entry = value as Record<string, unknown>;
  const keys = Object.keys(entry);
  const tile = entry.fit === 'tile';
  if (keys.some((key) => !['assetPath', 'fit', 'tileWidthPx'].includes(key)) || typeof entry.assetPath !== 'string' || !P15_ASSET_PATH_PATTERN.test(entry.assetPath)
    || !['cover', 'contain', 'tile'].includes(entry.fit as string) || tile !== (entry.tileWidthPx !== undefined)
    || (tile && !(typeof entry.tileWidthPx === 'number' && entry.tileWidthPx > 0 && entry.tileWidthPx <= 16_384 && round(entry.tileWidthPx) === entry.tileWidthPx))) {
    return [{ path, message: 'backgroundImage is { assetPath: assets/…, fit: cover | contain | tile, tileWidthPx only for tile (px, two decimals) }.' }];
  }
  return [];
}

export function canonicalBackgroundImage(value: P15NeutralBackgroundImage): Record<string, unknown> {
  return { assetPath: value.assetPath, fit: value.fit, ...(value.tileWidthPx === undefined ? {} : { tileWidthPx: value.tileWidthPx }) };
}

export function backgroundImageSettings(value: P15NeutralBackgroundImage | undefined): Record<string, unknown> {
  if (value === undefined) return {};
  const base = { background_background: 'classic', background_image: { url: value.assetPath, id: 0 } };
  if (value.fit === 'tile') {
    return { ...base, background_position: 'top left', background_repeat: 'repeat', background_size: 'initial',
      background_bg_width: { unit: 'px', size: value.tileWidthPx, sizes: [] } };
  }
  return { ...base, background_position: 'center center', background_repeat: 'no-repeat', background_size: value.fit };
}
