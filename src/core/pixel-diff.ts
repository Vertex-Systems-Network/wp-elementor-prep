import type { PixelDiffMetrics } from './validation-types';

export interface PixelBuffer {
  width: number;
  height: number;
  data: ArrayLike<number>;
}

function round(value: number, digits = 4): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

/**
 * Deterministic raw RGBA comparison. Canvas decoding stays in plugin UI; this pure function is
 * independently unit-testable and defines the metrics contract used by the plugin runtime.
 */
export function comparePixelBuffers(
  before: PixelBuffer,
  after: PixelBuffer,
  channelTolerance: number,
): PixelDiffMetrics {
  const sameDimensions = before.width === after.width && before.height === after.height;
  const totalPixels = sameDimensions ? Math.max(0, before.width * before.height) : 0;

  if (!sameDimensions) {
    return {
      sameDimensions: false,
      widthBefore: before.width,
      heightBefore: before.height,
      widthAfter: after.width,
      heightAfter: after.height,
      totalPixels,
      changedPixels: 0,
      changedPixelPct: 100,
      meanChannelDelta: 255,
      maxChannelDelta: 255,
      channelTolerance,
    };
  }

  const expectedLength = totalPixels * 4;
  if (before.data.length < expectedLength || after.data.length < expectedLength) {
    throw new Error('Pixel buffer length does not match RGBA dimensions.');
  }

  let changedPixels = 0;
  let sumChannelDelta = 0;
  let maxChannelDelta = 0;

  for (let pixel = 0; pixel < totalPixels; pixel += 1) {
    const offset = pixel * 4;
    let changed = false;

    for (let channel = 0; channel < 4; channel += 1) {
      const delta = Math.abs(Number(before.data[offset + channel] ?? 0) - Number(after.data[offset + channel] ?? 0));
      sumChannelDelta += delta;
      maxChannelDelta = Math.max(maxChannelDelta, delta);
      if (delta > channelTolerance) changed = true;
    }

    if (changed) changedPixels += 1;
  }

  return {
    sameDimensions: true,
    widthBefore: before.width,
    heightBefore: before.height,
    widthAfter: after.width,
    heightAfter: after.height,
    totalPixels,
    changedPixels,
    changedPixelPct: totalPixels === 0 ? 0 : round((changedPixels / totalPixels) * 100),
    meanChannelDelta: expectedLength === 0 ? 0 : round(sumChannelDelta / expectedLength),
    maxChannelDelta,
    channelTolerance,
  };
}

/** One section of the frame (e.g. a top-level child) with its own changed-pixel budget, in render pixels. */
export interface PixelSectionBudget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Maximum changed pixels in this section, in percent of its pixels. */
  maxChangedPct: number;
}

export interface TiledPixelSectionResult {
  id: string;
  totalPixels: number;
  changedPixels: number;
  changedPct: number;
  maxChangedPct: number;
  pass: boolean;
}

export interface TiledPixelDiffMetrics {
  /** The whole-frame metrics, exactly as `comparePixelBuffers` computes them. */
  metrics: PixelDiffMetrics;
  tileSize: number;
  tiles: number;
  changedTiles: number;
  /** The tile with the highest changed-pixel share (origin in render pixels), or null when nothing changed. */
  worstTile: { x: number; y: number; changedPct: number } | null;
  sections: TiledPixelSectionResult[];
  /** Whole frame within `maxChangedPct` and every section within its budget; false on any dimension change. */
  pass: boolean;
}

/**
 * Full-resolution tiled comparison (recovery M5.4): the same per-pixel rule as `comparePixelBuffers`, accumulated per
 * square tile and per section, so a localized change cannot hide inside a large frame's global percentage. Pure;
 * compiled into the plugin UI together with `comparePixelBuffers`.
 */
export function compareTiledPixelBuffers(
  before: PixelBuffer,
  after: PixelBuffer,
  channelTolerance: number,
  tileSize: number,
  sections: readonly PixelSectionBudget[],
  maxChangedPct: number,
): TiledPixelDiffMetrics {
  const metrics = comparePixelBuffers(before, after, channelTolerance);
  const size = Math.max(1, Math.floor(tileSize));
  if (!metrics.sameDimensions) {
    return { metrics, tileSize: size, tiles: 0, changedTiles: 0, worstTile: null,
      sections: sections.map((section) => ({ id: section.id, totalPixels: 0, changedPixels: 0, changedPct: 100, maxChangedPct: section.maxChangedPct, pass: false })),
      pass: false };
  }
  const { width, height } = before;
  const columns = Math.ceil(width / size);
  const rows = Math.ceil(height / size);
  const tileChanged = new Array<number>(columns * rows).fill(0);
  const clamp = (section: PixelSectionBudget) => ({
    x0: Math.max(0, Math.floor(section.x)), y0: Math.max(0, Math.floor(section.y)),
    x1: Math.min(width, Math.ceil(section.x + section.width)), y1: Math.min(height, Math.ceil(section.y + section.height)),
  });
  const boxes = sections.map(clamp);
  const sectionChanged = new Array<number>(sections.length).fill(0);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      let changed = false;
      for (let channel = 0; channel < 4; channel += 1) {
        if (Math.abs(Number(before.data[offset + channel] ?? 0) - Number(after.data[offset + channel] ?? 0)) > channelTolerance) {
          changed = true;
          break;
        }
      }
      if (!changed) continue;
      const tile = Math.floor(y / size) * columns + Math.floor(x / size);
      tileChanged[tile] = (tileChanged[tile] ?? 0) + 1;
      boxes.forEach((box, index) => {
        if (x >= box.x0 && x < box.x1 && y >= box.y0 && y < box.y1) sectionChanged[index] = (sectionChanged[index] ?? 0) + 1;
      });
    }
  }
  let worstTile: TiledPixelDiffMetrics['worstTile'] = null;
  let changedTiles = 0;
  tileChanged.forEach((count, index) => {
    if (count === 0) return;
    changedTiles += 1;
    const tx = (index % columns) * size;
    const ty = Math.floor(index / columns) * size;
    const pixels = Math.min(size, width - tx) * Math.min(size, height - ty);
    const pct = round((count / pixels) * 100);
    if (!worstTile || pct > worstTile.changedPct) worstTile = { x: tx, y: ty, changedPct: pct };
  });
  const sectionResults = sections.map((section, index): TiledPixelSectionResult => {
    const box = boxes[index]!;
    const total = Math.max(0, box.x1 - box.x0) * Math.max(0, box.y1 - box.y0);
    const changedPct = total === 0 ? 0 : round((sectionChanged[index]! / total) * 100);
    return { id: section.id, totalPixels: total, changedPixels: sectionChanged[index]!, changedPct, maxChangedPct: section.maxChangedPct,
      pass: changedPct <= section.maxChangedPct };
  });
  return { metrics, tileSize: size, tiles: columns * rows, changedTiles, worstTile, sections: sectionResults,
    pass: metrics.changedPixelPct <= maxChangedPct && sectionResults.every((section) => section.pass) };
}
