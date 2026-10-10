import { elementorPxSlider } from './mapping-engine/codecs';

/**
 * Container and widget sizing and its exact Elementor 4.2.4 encoding (recovery M2.3a/M2.3b).
 *
 * Source evidence (Elementor 4.2.4, tag commit 0e292207b5b45f0e22603967ae41c0374211160d):
 * - `includes/elements/container.php` (blob 3486766b9565af99536ae205ed1936bb155daed0): `content_width`
 *   (boxed | full), responsive slider `width` (`--width`, condition `content_width=full`, units include
 *   `custom`), responsive slider `min_height` (`--min-height`), and the `_flex` Flex Item group (selector
 *   `{{WRAPPER}}.e-con`) including `align_self`, `size`, `grow` and `shrink` but not `basis`.
 * - `includes/controls/groups/flex-item.php` (blob dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a): `size`
 *   dictionary none → `--flex-grow: 0; --flex-shrink: 0`, grow → `--flex-grow: 1; --flex-shrink: 0`.
 * - `includes/controls/base-units.php` (blob 6ec6d40f5a7609114f0ceaa9b2f7250cc945823d): the `custom` unit
 *   renders `{{UNIT}}` empty, so a custom slider writes its size verbatim (here only `fit-content`).
 * - `includes/base/widget/common-base.php` (blob 77c497bfa4a3b7bb283c585e87efb06c590cb0c1): widget
 *   `_element_width` (initial = Custom) and `_element_custom_width` (`width` + `max-width`, setting
 *   `--container-widget-flex-grow: 0`), and the widget `_flex` group (selector `{{WRAPPER}}.elementor-element`).
 * - `assets/dev/scss/frontend/_container.scss` (blob d6c65cb86810634c55c8b9e65aef8e9b9ef439e8): `.e-con`
 *   defaults `--width: 100%`, `flex: 0 1 auto`, `min-width: 0`; a top-level Container is centred with
 *   `max-width: min(100%, var(--width))`; widgets in a Container have `min-width: 0`.
 * - `assets/dev/scss/frontend/_global.scss` (blob c84412205989e9377233d21c2f7729379ff6d027): every element
 *   is a flex item with `flex-grow/shrink/basis: initial` (0 1 auto) unless its `_flex` group says otherwise.
 * - Heading and text-editor widget styles (`assets/dev/scss/frontend/widgets/heading.scss` blob
 *   1becba2bb0a80e7b9b0a7715f15e56512a7e5f7e, `text-editor.scss` blob 30188ed4532b56f7553db644d041c68965d2d7a7)
 *   set no container width, so by default they size to their content in a row.
 *
 * Containers (M2.3a, HUG added in M2.3b):
 * - Root frame width → `content_width: full` + `width` px: a centred block exactly the frame width.
 * - FIXED width → `content_width: full` + `width` px; HUG width → `content_width: full` + `width: fit-content`.
 * - FIXED height, or a minimum height on a non-fixed height → `min_height` px.
 * - FIXED or HUG on the parent's main axis → `_flex_size: none` (Figma never shrinks either).
 * - FILL on a column's main axis → `_flex_size: grow`. FILL on a row's main axis keeps the default
 *   `width: 100%; flex: 0 1 auto`: every FILL item has the same basis and shrink, so they split what the
 *   non-shrinking siblings leave equally, exactly as Figma does.
 * - FILL across a row under a non-stretch parent → `_flex_align_self: stretch`.
 * Heading and text widgets (M2.3b):
 * - FIXED width → `_element_width: initial` + `_element_custom_width` px; FILL along a row →
 *   `_element_custom_width: 100%` (the same equal-split basis as FILL containers).
 * - FIXED or HUG on the main axis → `_flex_size: none`; FILL on a column's main axis → `_flex_size: grow`;
 *   FILL across the parent under a non-stretch parent → `_flex_align_self: stretch`.
 * - A FIXED widget height has no widget control → REVIEW.
 * Min width, max width/height (and any widget min height) become explicit REVIEW.
 */
export const P15_NEUTRAL_EXPORT_MAX_SIZE_PX = 16_384;

export interface P15NeutralContainerSizing {
  /** Exact container width in px. */
  widthPx?: number;
  /** Width hugs the content (`fit-content`); exclusive with `widthPx`. */
  hugWidth?: true;
  /** Minimum container height in px. */
  minHeightPx?: number;
  /** Behaviour along the parent's main axis: `fixed` keeps its own size, `grow` takes free space. */
  flex?: 'fixed' | 'grow';
  /** Stretch across the parent's cross axis. */
  alignSelfStretch?: true;
}

export interface P15NeutralWidgetSizing {
  /** Exact widget width in px. */
  widthPx?: number;
  /** FILL along a row: the widget takes an equal share of the free width; exclusive with `widthPx`. */
  fillWidth?: true;
  /** Behaviour along the parent's main axis: `fixed` keeps its own size, `grow` takes free space. */
  flex?: 'fixed' | 'grow';
  /** Stretch across the parent's cross axis. */
  alignSelfStretch?: true;
}

export interface P15ContainerSizingProblem {
  path: string;
  message: string;
}

const CONTAINER_KEYS = ['widthPx', 'hugWidth', 'minHeightPx', 'flex', 'alignSelfStretch'] as const;
const WIDGET_KEYS = ['widthPx', 'fillWidth', 'flex', 'alignSelfStretch'] as const;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validSize(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= P15_NEUTRAL_EXPORT_MAX_SIZE_PX
    && Math.round(value * 100) / 100 === value;
}

function sizingProblems(value: unknown, path: string, keys: readonly string[], widthFlag: 'hugWidth' | 'fillWidth'): P15ContainerSizingProblem[] {
  if (!record(value) || Object.keys(value).length === 0 || Object.keys(value).some((key) => !keys.includes(key))) {
    return [{ path, message: `Sizing must be a non-empty object with only ${keys.join(', ')}.` }];
  }
  const problems: P15ContainerSizingProblem[] = [];
  const bad = (key: string, message: string) => problems.push({ path: `${path}.${key}`, message });
  const sizeMessage = `must be 0-${P15_NEUTRAL_EXPORT_MAX_SIZE_PX}px, non-zero, with at most two decimals.`;
  if (value.widthPx !== undefined && !validSize(value.widthPx)) bad('widthPx', `Width ${sizeMessage}`);
  if (value.minHeightPx !== undefined && !validSize(value.minHeightPx)) bad('minHeightPx', `Minimum height ${sizeMessage}`);
  if (value[widthFlag] !== undefined && value[widthFlag] !== true) bad(widthFlag, `${widthFlag} must be true when provided.`);
  if (value[widthFlag] !== undefined && value.widthPx !== undefined) bad(widthFlag, `${widthFlag} and widthPx are exclusive.`);
  if (value.flex !== undefined && value.flex !== 'fixed' && value.flex !== 'grow') bad('flex', 'Flex behaviour must be fixed or grow.');
  if (value.alignSelfStretch !== undefined && value.alignSelfStretch !== true) bad('alignSelfStretch', 'alignSelfStretch must be true when provided.');
  return problems;
}

export function containerSizingProblems(value: unknown, path: string): P15ContainerSizingProblem[] {
  return sizingProblems(value, path, CONTAINER_KEYS, 'hugWidth');
}

export function widgetSizingProblems(value: unknown, path: string): P15ContainerSizingProblem[] {
  return sizingProblems(value, path, WIDGET_KEYS, 'fillWidth');
}

export function canonicalContainerSizing(sizing: P15NeutralContainerSizing | P15NeutralWidgetSizing): Record<string, unknown> {
  const value: Record<string, unknown> = {};
  for (const key of [...CONTAINER_KEYS, 'fillWidth'] as const) {
    const entry = (sizing as Record<string, unknown>)[key];
    if (entry !== undefined) value[key] = entry;
  }
  return value;
}

function flexItemSettings(sizing: P15NeutralContainerSizing | P15NeutralWidgetSizing, settings: Record<string, unknown>): void {
  if (sizing.flex === 'fixed') settings._flex_size = 'none';
  if (sizing.flex === 'grow') settings._flex_size = 'grow';
  if (sizing.alignSelfStretch) settings._flex_align_self = 'stretch';
}

/** Elementor settings for one container's sizing; empty when sizing is absent. */
export function containerSizingSettings(sizing: P15NeutralContainerSizing | undefined): Record<string, unknown> {
  const settings: Record<string, unknown> = {};
  if (sizing === undefined) return settings;
  if (sizing.widthPx !== undefined) {
    settings.content_width = 'full';
    settings.width = elementorPxSlider(sizing.widthPx);
  }
  if (sizing.hugWidth) {
    settings.content_width = 'full';
    settings.width = { unit: 'custom', size: 'fit-content', sizes: [] };
  }
  if (sizing.minHeightPx !== undefined) settings.min_height = elementorPxSlider(sizing.minHeightPx);
  flexItemSettings(sizing, settings);
  return settings;
}

/** Elementor settings for one heading/text widget's sizing; empty when sizing is absent. */
export function widgetSizingSettings(sizing: P15NeutralWidgetSizing | undefined): Record<string, unknown> {
  const settings: Record<string, unknown> = {};
  if (sizing === undefined) return settings;
  if (sizing.widthPx !== undefined) {
    settings._element_width = 'initial';
    settings._element_custom_width = elementorPxSlider(sizing.widthPx);
  }
  if (sizing.fillWidth) {
    settings._element_width = 'initial';
    settings._element_custom_width = { unit: '%', size: 100, sizes: [] };
  }
  flexItemSettings(sizing, settings);
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

export interface P15SizingDerivation<Sizing> {
  sizing?: Sizing;
  reviews: { reasonCode: string; detail: string }[];
}
export type P15ContainerSizingDerivation = P15SizingDerivation<P15NeutralContainerSizing>;

const round = (value: number): number => Math.round(value * 100) / 100;

function sizeReader(reviews: P15SizingDerivation<unknown>['reviews']) {
  // A missing dimension is no fact (nothing is written); a present out-of-range one is REVIEW.
  return (value: number, label: string): number | undefined => {
    if (!Number.isFinite(value)) return undefined;
    const rounded = round(value);
    if (validSize(rounded)) return rounded;
    reviews.push({ reasonCode: 'SIZE_OUT_OF_RANGE', detail: `${label} ${String(value)}px is outside 0-${P15_NEUTRAL_EXPORT_MAX_SIZE_PX}px.` });
    return undefined;
  };
}

function axes(facts: P15ContainerSizingFacts) {
  const row = facts.parent?.direction === 'row';
  return {
    row,
    main: row ? facts.horizontal : facts.vertical,
    cross: row ? facts.vertical : facts.horizontal,
    parentStretches: facts.parent?.alignItems === undefined || facts.parent.alignItems === 'stretch',
  };
}

function constraintReview(facts: P15ContainerSizingFacts, keys: readonly ('minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight')[]) {
  const present = keys.filter((key) => typeof facts[key] === 'number');
  return present.length > 0
    ? [{ reasonCode: 'SIZE_CONSTRAINT_REQUIRES_REVIEW', detail: `Figma ${present.join(', ')} constraints have no exact mapping yet and were not written.` }]
    : [];
}

/** Derive the exact sizing facts for one Auto Layout container; anything without an exact mapping is REVIEW. */
export function deriveP15ContainerSizing(facts: P15ContainerSizingFacts): P15ContainerSizingDerivation {
  const reviews: P15ContainerSizingDerivation['reviews'] = [];
  const size = sizeReader(reviews);
  const sizing: P15NeutralContainerSizing = {};

  // The root frame is the page: its width is always the page content width.
  if (facts.parent === null || facts.horizontal === 'FIXED') {
    const width = size(facts.width, 'Width');
    if (width !== undefined) sizing.widthPx = width;
  } else if (facts.horizontal === 'HUG') {
    sizing.hugWidth = true;
  }
  if (facts.vertical === 'FIXED') {
    const height = size(facts.height, 'Height');
    if (height !== undefined) sizing.minHeightPx = height;
  } else if (typeof facts.minHeight === 'number' && facts.minHeight > 0) {
    const minHeight = size(facts.minHeight, 'Minimum height');
    if (minHeight !== undefined) sizing.minHeightPx = minHeight;
  }

  if (facts.parent !== null) {
    const { row, main, cross, parentStretches } = axes(facts);
    if (main === 'FIXED' || main === 'HUG') sizing.flex = 'fixed';
    if (main === 'FILL' && !row) sizing.flex = 'grow';
    if (cross === 'FILL' && row && !parentStretches) sizing.alignSelfStretch = true;
  }

  reviews.push(...constraintReview(facts, ['minWidth', 'maxWidth', 'maxHeight']));
  return { ...(Object.keys(sizing).length > 0 ? { sizing } : {}), reviews };
}

/** Derive the exact sizing facts for one heading/text widget inside an Auto Layout parent. */
export function deriveP15WidgetSizing(facts: P15ContainerSizingFacts): P15SizingDerivation<P15NeutralWidgetSizing> {
  const reviews: P15SizingDerivation<P15NeutralWidgetSizing>['reviews'] = [];
  if (facts.parent === null) return { reviews };
  const size = sizeReader(reviews);
  const sizing: P15NeutralWidgetSizing = {};
  const { row, main, cross, parentStretches } = axes(facts);

  if (facts.horizontal === 'FIXED') {
    const width = size(facts.width, 'Width');
    if (width !== undefined) sizing.widthPx = width;
  }
  if (row && main === 'FILL') sizing.fillWidth = true;
  if (main === 'FIXED' || main === 'HUG') sizing.flex = 'fixed';
  if (main === 'FILL' && !row) sizing.flex = 'grow';
  if (cross === 'FILL' && !parentStretches) sizing.alignSelfStretch = true;
  if (facts.vertical === 'FIXED') {
    reviews.push({ reasonCode: 'SIZE_WIDGET_HEIGHT_REQUIRES_REVIEW', detail: 'A fixed text height has no Elementor widget height control; set the text to hug its height.' });
  }

  reviews.push(...constraintReview(facts, ['minWidth', 'maxWidth', 'minHeight', 'maxHeight']));
  return { ...(Object.keys(sizing).length > 0 ? { sizing } : {}), reviews };
}

/**
 * More than one FILL child along a column's main axis shares free space by content-relative basis in
 * Elementor (`flex: 1 0 auto`) but equally in Figma; the parent needs review unless it hugs its content.
 * Rows need no review: every FILL item there has the same 100% basis and shrink, which splits equally.
 */
export function fillDistributionReview(
  direction: 'row' | 'column',
  mainAxisSizing: P15FigmaSizingMode | undefined,
  childSizings: readonly ({ flex?: 'fixed' | 'grow' } | undefined)[],
): { reasonCode: string; detail: string } | undefined {
  if (direction !== 'column' || mainAxisSizing === 'HUG') return undefined;
  const fills = childSizings.filter((sizing) => sizing?.flex === 'grow').length;
  return fills > 1
    ? { reasonCode: 'SIZE_FILL_DISTRIBUTION_REQUIRES_REVIEW', detail: `${fills} FILL children share free height; Elementor grows them from their content height, Figma divides it equally.` }
    : undefined;
}
