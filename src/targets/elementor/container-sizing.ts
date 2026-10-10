import { elementorPxSlider } from './mapping-engine/codecs';

/**
 * Container sizing and its exact Elementor 4.2.4 v3 Container encoding (recovery M2.3a).
 *
 * Source evidence (Elementor 4.2.4, tag commit 0e292207b5b45f0e22603967ae41c0374211160d):
 * - `includes/elements/container.php` (blob 3486766b9565af99536ae205ed1936bb155daed0): `content_width`
 *   (boxed | full), responsive slider `width` (`--width`, condition `content_width=full`), responsive slider
 *   `min_height` (`--min-height`), and the `_flex` Flex Item group (selector `{{WRAPPER}}.e-con`) including
 *   `align_self`, `size`, `grow` and `shrink` but not `basis`.
 * - `includes/controls/groups/flex-item.php` (blob dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a): `size`
 *   dictionary none → `--flex-grow: 0; --flex-shrink: 0`, grow → `--flex-grow: 1; --flex-shrink: 0`.
 * - `assets/dev/scss/frontend/_container.scss` (blob d6c65cb86810634c55c8b9e65aef8e9b9ef439e8): `.e-con`
 *   defaults `--width: 100%`, `flex: 0 1 auto`, `width: var(--width)`, `min-height: var(--min-height)`; a
 *   top-level Container is centred with `max-width: min(100%, var(--width))`.
 *
 * Only cases with an exact CSS equivalent are written:
 * - FIXED width → `content_width: full` + `width` px. On the root frame this is the page content width:
 *   a centred block exactly the frame width, which keeps the frame's own background bounds.
 * - FIXED height, or a minimum height on a non-fixed height → `min_height` px.
 * - FIXED on the parent's main axis → `_flex_size: none` (no grow, no shrink).
 * - FILL on a column parent's main axis → `_flex_size: grow`. FILL on a row parent's main axis keeps the
 *   default `width: 100%; flex: 0 1 auto`, which fills what fixed siblings leave.
 * - FILL on a row parent's cross axis under a non-stretch parent → `_flex_align_self: stretch`.
 * HUG, min width and max width/height are not mapped here; min/max constraints become explicit REVIEW.
 */
export const P15_NEUTRAL_EXPORT_MAX_SIZE_PX = 16_384;

export interface P15NeutralContainerSizing {
  /** Exact container width in px. */
  widthPx?: number;
  /** Minimum container height in px. */
  minHeightPx?: number;
  /** Behaviour along the parent's main axis: `fixed` never grows or shrinks, `grow` takes free space. */
  flex?: 'fixed' | 'grow';
  /** Stretch across the parent's cross axis. */
  alignSelfStretch?: true;
}

export interface P15ContainerSizingProblem {
  path: string;
  message: string;
}

const SIZING_KEYS = ['widthPx', 'minHeightPx', 'flex', 'alignSelfStretch'] as const;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validSize(value: unknown, allowZero: boolean): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value <= P15_NEUTRAL_EXPORT_MAX_SIZE_PX
    && (allowZero ? value >= 0 : value > 0) && Math.round(value * 100) / 100 === value;
}

export function containerSizingProblems(value: unknown, path: string): P15ContainerSizingProblem[] {
  if (!record(value) || Object.keys(value).length === 0 || Object.keys(value).some((key) => !(SIZING_KEYS as readonly string[]).includes(key))) {
    return [{ path, message: `Sizing must be a non-empty object with only ${SIZING_KEYS.join(', ')}.` }];
  }
  const problems: P15ContainerSizingProblem[] = [];
  const bad = (key: string, message: string) => problems.push({ path: `${path}.${key}`, message });
  if (value.widthPx !== undefined && !validSize(value.widthPx, false)) bad('widthPx', `Width must be 0-${P15_NEUTRAL_EXPORT_MAX_SIZE_PX}px, non-zero, with at most two decimals.`);
  if (value.minHeightPx !== undefined && !validSize(value.minHeightPx, false)) bad('minHeightPx', `Minimum height must be 0-${P15_NEUTRAL_EXPORT_MAX_SIZE_PX}px, non-zero, with at most two decimals.`);
  if (value.flex !== undefined && value.flex !== 'fixed' && value.flex !== 'grow') bad('flex', 'Flex behaviour must be fixed or grow.');
  if (value.alignSelfStretch !== undefined && value.alignSelfStretch !== true) bad('alignSelfStretch', 'alignSelfStretch must be true when provided.');
  return problems;
}

export function canonicalContainerSizing(sizing: P15NeutralContainerSizing): Record<string, unknown> {
  const value: Record<string, unknown> = {};
  if (sizing.widthPx !== undefined) value.widthPx = sizing.widthPx;
  if (sizing.minHeightPx !== undefined) value.minHeightPx = sizing.minHeightPx;
  if (sizing.flex !== undefined) value.flex = sizing.flex;
  if (sizing.alignSelfStretch !== undefined) value.alignSelfStretch = sizing.alignSelfStretch;
  return value;
}

/** Elementor settings for one container's sizing; empty when sizing is absent. */
export function containerSizingSettings(sizing: P15NeutralContainerSizing | undefined): Record<string, unknown> {
  const settings: Record<string, unknown> = {};
  if (sizing === undefined) return settings;
  if (sizing.widthPx !== undefined) {
    settings.content_width = 'full';
    settings.width = elementorPxSlider(sizing.widthPx);
  }
  if (sizing.minHeightPx !== undefined) settings.min_height = elementorPxSlider(sizing.minHeightPx);
  if (sizing.flex === 'fixed') settings._flex_size = 'none';
  if (sizing.flex === 'grow') settings._flex_size = 'grow';
  if (sizing.alignSelfStretch) settings._flex_align_self = 'stretch';
  return settings;
}

export type P15FigmaSizingMode = 'FIXED' | 'HUG' | 'FILL';

/** The Figma facts sizing is derived from; `parent` is null for the root frame. */
export interface P15ContainerSizingFacts {
  parent: { direction: 'row' | 'column'; alignItems: string | undefined } | null;
  horizontal: P15FigmaSizingMode | undefined;
  vertical: P15FigmaSizingMode | undefined;
  width: number;
  height: number;
  minWidth?: number | null;
  maxWidth?: number | null;
  minHeight?: number | null;
  maxHeight?: number | null;
}

export interface P15ContainerSizingDerivation {
  sizing?: P15NeutralContainerSizing;
  reviews: { reasonCode: string; detail: string }[];
}

const round = (value: number): number => Math.round(value * 100) / 100;

/** Derive the exact sizing facts for one Auto Layout container; anything without an exact mapping is REVIEW. */
export function deriveP15ContainerSizing(facts: P15ContainerSizingFacts): P15ContainerSizingDerivation {
  const reviews: P15ContainerSizingDerivation['reviews'] = [];
  const sizing: P15NeutralContainerSizing = {};
  // A missing dimension is no fact (nothing is written); a present out-of-range one is REVIEW.
  const size = (value: number, label: string): number | undefined => {
    if (!Number.isFinite(value)) return undefined;
    const rounded = round(value);
    if (validSize(rounded, false)) return rounded;
    reviews.push({ reasonCode: 'SIZE_OUT_OF_RANGE', detail: `${label} ${String(value)}px is outside 0-${P15_NEUTRAL_EXPORT_MAX_SIZE_PX}px.` });
    return undefined;
  };

  // The root frame is the page: its width is always the page content width.
  const fixedWidth = facts.parent === null || facts.horizontal === 'FIXED';
  if (fixedWidth) {
    const width = size(facts.width, 'Width');
    if (width !== undefined) sizing.widthPx = width;
  }
  if (facts.vertical === 'FIXED') {
    const height = size(facts.height, 'Height');
    if (height !== undefined) sizing.minHeightPx = height;
  } else if (typeof facts.minHeight === 'number' && facts.minHeight > 0) {
    const minHeight = size(facts.minHeight, 'Minimum height');
    if (minHeight !== undefined) sizing.minHeightPx = minHeight;
  }

  if (facts.parent !== null) {
    const row = facts.parent.direction === 'row';
    const main = row ? facts.horizontal : facts.vertical;
    const cross = row ? facts.vertical : facts.horizontal;
    if (main === 'FIXED') sizing.flex = 'fixed';
    if (main === 'FILL' && !row) sizing.flex = 'grow';
    if (cross === 'FILL' && row && facts.parent.alignItems !== undefined && facts.parent.alignItems !== 'stretch') sizing.alignSelfStretch = true;
  }

  const constraints = (['minWidth', 'maxWidth', 'maxHeight'] as const)
    .filter((key) => typeof facts[key] === 'number');
  if (constraints.length > 0) {
    reviews.push({
      reasonCode: 'SIZE_CONSTRAINT_REQUIRES_REVIEW',
      detail: `Figma ${constraints.join(', ')} constraints have no exact mapping yet and were not written.`,
    });
  }
  return { ...(Object.keys(sizing).length > 0 ? { sizing } : {}), reviews };
}

/**
 * More than one FILL child along a column's main axis shares free space by content-relative basis in
 * Elementor (`flex: 1 0 auto`) but equally in Figma; the parent needs review unless it hugs its content.
 */
export function fillDistributionReview(
  direction: 'row' | 'column',
  mainAxisSizing: P15FigmaSizingMode | undefined,
  childSizings: readonly (P15NeutralContainerSizing | undefined)[],
): { reasonCode: string; detail: string } | undefined {
  if (direction !== 'column' || mainAxisSizing === 'HUG') return undefined;
  const fills = childSizings.filter((sizing) => sizing?.flex === 'grow').length;
  return fills > 1
    ? { reasonCode: 'SIZE_FILL_DISTRIBUTION_REQUIRES_REVIEW', detail: `${fills} FILL children share free height; Elementor grows them from their content height, Figma divides it equally.` }
    : undefined;
}
