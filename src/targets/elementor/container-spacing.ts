import type { P15NeutralBoxPx } from './container-visual-style';

/**
 * Main-axis spacing details (recovery M2.7).
 *
 * Source evidence (Elementor 4.2.4, tag commit 0e292207b5b45f0e22603967ae41c0374211160d):
 * - `includes/controls/groups/flex-container.php` (blob ce9e412e31b7710f33129ae35634ecb51e580d38):
 *   `justify_content` offers flex-start | center | flex-end | space-between | space-around | space-evenly;
 *   `align_items` offers flex-start | center | flex-end | stretch (no baseline); `gap` has no negative values.
 * - `includes/elements/container.php` (blob 3486766b9565af99536ae205ed1936bb155daed0): Container `margin`
 *   DIMENSIONS writes `--margin-*` variables, which `_container.scss` (blob d6c65cb) applies to the Container box.
 * - `includes/widgets/common-base.php` (blob 77c497bfa4a3b7bb283c585e87efb06c590cb0c1): widget `_margin` targets
 *   `{{WRAPPER}} > .elementor-widget-container`, an inner box, so it cannot pull the next sibling closer.
 * - Figma (`@figma/plugin-typings` 1.140.0): SPACE_BETWEEN / SPACE_EVENLY / SPACE_AROUND distribute the extra
 *   space (the item spacing shows as Auto), exactly as CSS does with no gap; `layoutGrow` / `layoutAlign: STRETCH`
 *   are the older names of FILL along / across the parent; `itemReverseZIndex` paints the first child on top.
 *
 * Mapping:
 * - A distributed main axis writes gap 0, so CSS divides exactly the free space Figma divides.
 * - Negative item spacing (overlap) writes gap 0 and a negative leading Container margin on every in-flow
 *   sibling after the first; later siblings paint on top, as in Figma. A wrapped row, reversed stacking or any
 *   overlapping widget → `NEGATIVE_SPACING_REQUIRES_REVIEW` (the layout is kept with gap 0).
 * - BASELINE counter alignment has no Elementor option → `BASELINE_ALIGNMENT_REQUIRES_REVIEW`, laid out as start.
 */
export const NEGATIVE_SPACING_REVIEW = 'NEGATIVE_SPACING_REQUIRES_REVIEW';
export const BASELINE_REVIEW = 'BASELINE_ALIGNMENT_REQUIRES_REVIEW';
export const DISTRIBUTED_JUSTIFICATIONS: readonly string[] = ['space-between', 'space-around', 'space-evenly'];
const MAX_MARGIN_PX = 4_096;

type Overlappable = { kind: string; position?: unknown; marginPx?: P15NeutralBoxPx };

/**
 * Apply negative item spacing as leading Container margins. Returns the children unchanged with a review when
 * the overlap cannot be reproduced exactly.
 */
export function assignP15Overlap<T extends Overlappable>(
  children: readonly T[],
  spacingPx: number,
  options: { direction: 'row' | 'column'; wrapped: boolean; reverseZIndex: boolean },
): { children: T[]; review?: { reasonCode: string; detail: string } } {
  const fail = (detail: string) => ({ children: [...children], review: { reasonCode: NEGATIVE_SPACING_REVIEW, detail } });
  if (options.wrapped) return fail('Negative spacing in a wrapped row has no CSS equivalent.');
  if (options.reverseZIndex) return fail('Overlapping children with the first child on top need reversed stacking, which is not mapped.');
  const flow = children.map((child, index) => ({ child, index })).filter(({ child }) => child.position === undefined && child.kind !== 'review');
  if (flow.slice(1).some(({ child }) => child.kind !== 'container')) {
    return fail('Only Containers can carry the negative margin that reproduces an overlap; a widget margin moves only its inner box.');
  }
  const lead = new Set(flow.slice(1).map(({ index }) => index));
  const margin: P15NeutralBoxPx = { top: options.direction === 'column' ? spacingPx : 0, right: 0, bottom: 0, left: options.direction === 'row' ? spacingPx : 0 };
  return { children: children.map((child, index) => (lead.has(index) ? { ...child, marginPx: margin } : child)) };
}

const validMargin = (value: unknown): boolean => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= MAX_MARGIN_PX
  && Math.round(value * 100) / 100 === value;

export function marginProblems(value: unknown, path: string): { path: string; message: string }[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return [{ path, message: 'Margin must be an object.' }];
  const entry = value as Record<string, unknown>;
  const sides = ['top', 'right', 'bottom', 'left'];
  return Object.keys(entry).length === 4 && sides.every((side) => validMargin(entry[side]))
    ? []
    : [{ path, message: `Margin holds top, right, bottom and left within ±${MAX_MARGIN_PX}px with at most two decimals.` }];
}

export function canonicalMargin(margin: P15NeutralBoxPx): Record<string, unknown> {
  return { top: margin.top, right: margin.right, bottom: margin.bottom, left: margin.left };
}

export function containerMarginSettings(margin: P15NeutralBoxPx | undefined): Record<string, unknown> {
  if (margin === undefined) return {};
  const linked = margin.top === margin.right && margin.right === margin.bottom && margin.bottom === margin.left;
  return { margin: { unit: 'px', top: String(margin.top), right: String(margin.right), bottom: String(margin.bottom), left: String(margin.left), isLinked: linked } };
}
