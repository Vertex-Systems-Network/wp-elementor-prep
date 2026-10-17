import { compareTiledPixelBuffers, type PixelBuffer, type TiledPixelDiffMetrics } from './pixel-diff';

/**
 * Round-trip report (recovery M7.2): per breakpoint, compare the target render with the reference render pixel by pixel
 * (tiled, per section) and structurally (each reference section box against the same section in the target render).
 *
 * Pure and runtime-neutral. Without calibrated thresholds (M7.3) the verdict is `UNCALIBRATED`: the report carries the
 * metrics and diff regions only and never claims a verified round trip.
 */
export const P15_ROUND_TRIP_REPORT_VERSION = 'p15-round-trip-report-v1' as const;

export interface P15Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface P15RoundTripSectionInput {
  id: string;
  reference: P15Box;
  /** The same section in the target render; null when the target has no such element. */
  render: P15Box | null;
}

export interface P15RoundTripBreakpointInput {
  device: string;
  widthPx: number;
  reference: PixelBuffer;
  render: PixelBuffer;
  sections: readonly P15RoundTripSectionInput[];
}

export interface P15RoundTripThresholds {
  channelTolerance: number;
  tileSize: number;
  /** Whole-frame changed-pixel budget, percent. */
  maxChangedPct: number;
  /** Per-section changed-pixel budget, percent. */
  maxSectionChangedPct: number;
  /** Largest allowed edge offset of a section box, px. */
  maxEdgeDeltaPx: number;
  /** Smallest allowed intersection-over-union of a section box. */
  minIou: number;
}

/** Comparison settings used when no calibrated thresholds are supplied; they shape the metrics, not a verdict. */
export const P15_ROUND_TRIP_METRIC_DEFAULTS = Object.freeze({ channelTolerance: 16, tileSize: 32 });

export interface P15RoundTripStructuralSection {
  id: string;
  present: boolean;
  /** Largest absolute difference between the four edges, px; null when missing. */
  maxEdgeDeltaPx: number | null;
  iou: number | null;
}

export interface P15RoundTripDiffRegion extends P15Box {
  sectionId: string | null;
  reason: 'PIXEL_SECTION_OVER_BUDGET' | 'PIXEL_WORST_TILE' | 'STRUCTURE_MISSING' | 'STRUCTURE_OFFSET';
}

export interface P15RoundTripBreakpointReport {
  device: string;
  widthPx: number;
  pixel: TiledPixelDiffMetrics;
  structural: P15RoundTripStructuralSection[];
  diffRegions: P15RoundTripDiffRegion[];
  verdict: 'UNCALIBRATED' | 'ROUND_TRIP_VERIFIED' | 'REVIEW';
}

export interface P15RoundTripReportV1 {
  version: typeof P15_ROUND_TRIP_REPORT_VERSION;
  referenceSource: string;
  calibrated: boolean;
  breakpoints: P15RoundTripBreakpointReport[];
  verdict: 'UNCALIBRATED' | 'ROUND_TRIP_VERIFIED' | 'REVIEW';
  targetCompatibilityClaim: false;
}

const round = (value: number): number => Math.round(value * 10_000) / 10_000;

export function boxIou(a: P15Box, b: P15Box): number {
  const ix = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const iy = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const intersection = ix * iy;
  const union = a.width * a.height + b.width * b.height - intersection;
  return union <= 0 ? 0 : round(intersection / union);
}

export function boxEdgeDelta(a: P15Box, b: P15Box): number {
  return round(Math.max(
    Math.abs(a.x - b.x), Math.abs(a.y - b.y),
    Math.abs(a.x + a.width - (b.x + b.width)), Math.abs(a.y + a.height - (b.y + b.height)),
  ));
}

/** Crop or pad (transparent) an RGBA buffer to an exact size, so a taller or shorter render still compares. */
export function fitPixelBuffer(buffer: PixelBuffer, width: number, height: number): PixelBuffer {
  const data = new Uint8Array(width * height * 4);
  const rows = Math.min(height, buffer.height);
  const columns = Math.min(width, buffer.width);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns * 4; x += 1) data[y * width * 4 + x] = Number(buffer.data[y * buffer.width * 4 + x] ?? 0);
  }
  return { width, height, data };
}

function breakpointReport(input: P15RoundTripBreakpointInput, thresholds: P15RoundTripThresholds | null): P15RoundTripBreakpointReport {
  const { width, height } = input.reference;
  const render = input.render.width === width && input.render.height === height ? input.render : fitPixelBuffer(input.render, width, height);
  const settings = thresholds ?? { ...P15_ROUND_TRIP_METRIC_DEFAULTS, maxChangedPct: 100, maxSectionChangedPct: 100 };
  const pixel = compareTiledPixelBuffers(
    input.reference, render, settings.channelTolerance, settings.tileSize,
    input.sections.map((section) => ({ id: section.id, ...section.reference, maxChangedPct: settings.maxSectionChangedPct })),
    settings.maxChangedPct,
  );
  const structural = input.sections.map((section): P15RoundTripStructuralSection => (section.render
    ? { id: section.id, present: true, maxEdgeDeltaPx: boxEdgeDelta(section.reference, section.render), iou: boxIou(section.reference, section.render) }
    : { id: section.id, present: false, maxEdgeDeltaPx: null, iou: null }));

  const diffRegions: P15RoundTripDiffRegion[] = [];
  input.sections.forEach((section, index) => {
    const pixelSection = pixel.sections[index]!;
    const shape = structural[index]!;
    if (!shape.present) diffRegions.push({ ...section.reference, sectionId: section.id, reason: 'STRUCTURE_MISSING' });
    else if (thresholds && (shape.maxEdgeDeltaPx! > thresholds.maxEdgeDeltaPx || shape.iou! < thresholds.minIou)) {
      diffRegions.push({ ...section.reference, sectionId: section.id, reason: 'STRUCTURE_OFFSET' });
    }
    if (thresholds && !pixelSection.pass) diffRegions.push({ ...section.reference, sectionId: section.id, reason: 'PIXEL_SECTION_OVER_BUDGET' });
  });
  if (pixel.worstTile) {
    diffRegions.push({ x: pixel.worstTile.x, y: pixel.worstTile.y, width: pixel.tileSize, height: pixel.tileSize, sectionId: null, reason: 'PIXEL_WORST_TILE' });
  }
  const failing = diffRegions.some((region) => region.reason !== 'PIXEL_WORST_TILE') || !pixel.pass;
  const verdict = thresholds === null ? 'UNCALIBRATED' : failing ? 'REVIEW' : 'ROUND_TRIP_VERIFIED';
  return { device: input.device, widthPx: input.widthPx, pixel, structural, diffRegions, verdict };
}

export function buildP15RoundTripReport(
  breakpoints: readonly P15RoundTripBreakpointInput[],
  referenceSource: string,
  thresholds: P15RoundTripThresholds | null = null,
): P15RoundTripReportV1 {
  const reports = breakpoints.map((input) => breakpointReport(input, thresholds));
  const verdict = thresholds === null
    ? 'UNCALIBRATED'
    : reports.length > 0 && reports.every((report) => report.verdict === 'ROUND_TRIP_VERIFIED') ? 'ROUND_TRIP_VERIFIED' : 'REVIEW';
  return { version: P15_ROUND_TRIP_REPORT_VERSION, referenceSource, calibrated: thresholds !== null, breakpoints: reports, verdict, targetCompatibilityClaim: false };
}
