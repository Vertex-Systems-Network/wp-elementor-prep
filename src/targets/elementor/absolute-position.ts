import { elementorPxSlider } from './mapping-engine/codecs';
import type { P15NeutralBoxPx } from './container-visual-style';

/**
 * Absolute positioning and layer stacking, with their exact Elementor 4.2.4 encoding (recovery M2.5).
 *
 * Source evidence (Elementor 4.2.4, tag commit 0e292207b5b45f0e22603967ae41c0374211160d):
 * - `includes/elements/container.php` (blob 3486766b9565af99536ae205ed1936bb155daed0): select `position`
 *   ('' | absolute | fixed, `--position: {{VALUE}}`), `_offset_orientation_h`/`_offset_orientation_v`
 *   (start | end, default start), responsive sliders `_offset_x` (left), `_offset_x_end` (right), `_offset_y`
 *   (top), `_offset_y_end` (bottom), and responsive number `z_index` (`--z-index`).
 * - `includes/widgets/common-base.php` (blob 77c497bfa4a3b7bb283c585e87efb06c590cb0c1): the same offset
 *   controls on every widget, with select `_position` (prefix class `elementor-`) and number `_z_index`
 *   (`z-index: {{VALUE}}`).
 * - `assets/dev/scss/frontend/_container.scss` (blob d6c65cb86810634c55c8b9e65aef8e9b9ef439e8): every `.e-con`
 *   is `position: var(--position)` with `--position: relative` and `z-index: var(--z-index)` (`revert`), so each
 *   Container is the containing block of its absolute children.
 * - `assets/dev/scss/frontend/_global.scss` (blob c84412205989e9377233d21c2f7729379ff6d027):
 *   `.e-con > .elementor-element.elementor-absolute { position: absolute }`, and absolute widgets get
 *   `z-index: 1` by default.
 *
 * Mapping:
 * - A Figma child with `layoutPositioning: ABSOLUTE` is placed from its parent's top-left. A CSS absolute box is
 *   placed from its containing block's padding box, which starts inside the parent's border, so a mapped parent
 *   border width is subtracted. Constraint MIN → start offset (left/top); MAX → end offset (right/bottom).
 *   CENTER, STRETCH and SCALE have no single-offset equivalent → REVIEW. A rotated child → REVIEW.
 * - Stacking: Figma paints later siblings on top. In a flex Container every child is a flex item, for which
 *   `z-index` applies even when it is not positioned. Siblings before the first absolute child keep the default
 *   painting order; from the first absolute child on, every child gets z-index 1, 2, 3… in layer order, which
 *   also overrides the default `z-index: 1` of absolute widgets. The parent gets z-index 0 so the stack stays
 *   inside it, as Figma's does, unless its own parent gives it a higher one.
 */
export const P15_NEUTRAL_EXPORT_MAX_OFFSET_PX = 16_384;
export const P15_NEUTRAL_EXPORT_MAX_Z_INDEX = 10_000;
export const ABSOLUTE_POSITION_REVIEW = 'ABSOLUTE_POSITION_REQUIRES_REVIEW';
export const ABSOLUTE_STACKING_REVIEW = 'ABSOLUTE_STACKING_REQUIRES_REVIEW';

export interface P15NeutralAxisOffset {
  /** `start` = left/top, `end` = right/bottom. */
  edge: 'start' | 'end';
  offsetPx: number;
}

export interface P15NeutralAbsolutePosition {
  horizontal: P15NeutralAxisOffset;
  vertical: P15NeutralAxisOffset;
}

export interface P15AbsolutePositionFacts {
  x: unknown;
  y: unknown;
  width: unknown;
  height: unknown;
  rotation: unknown;
  constraints: unknown;
  parentWidth: unknown;
  parentHeight: unknown;
  /** Border widths of the parent when they are written as a CSS border. */
  parentBorderPx?: P15NeutralBoxPx;
}

export interface P15AbsolutePositionDerivation {
  position?: P15NeutralAbsolutePosition;
  review?: { reasonCode: string; detail: string };
}

export interface P15PositionProblem {
  path: string;
  message: string;
}

const round = (value: number): number => Math.round(value * 100) / 100;
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const validOffset = (value: unknown): value is number => finite(value) && Math.abs(value) <= P15_NEUTRAL_EXPORT_MAX_OFFSET_PX && round(value) === value;

function axis(constraint: unknown, start: number, size: number, parentSize: number, borderStart: number, borderEnd: number): P15NeutralAxisOffset | string {
  if (constraint === 'MIN') return { edge: 'start', offsetPx: round(start - borderStart) };
  if (constraint === 'MAX') return { edge: 'end', offsetPx: round(parentSize - start - size - borderEnd) };
  return `The ${String(constraint)} constraint has no single-offset Elementor equivalent; only MIN (left/top) and MAX (right/bottom) map.`;
}

/** Derive the exact absolute placement of one Figma child, or an explicit review. */
export function deriveP15AbsolutePosition(facts: P15AbsolutePositionFacts): P15AbsolutePositionDerivation {
  const fail = (detail: string): P15AbsolutePositionDerivation => ({ review: { reasonCode: ABSOLUTE_POSITION_REVIEW, detail } });
  const { x, y, width, height, parentWidth, parentHeight } = facts;
  if (!finite(x) || !finite(y) || !finite(width) || !finite(height) || !finite(parentWidth) || !finite(parentHeight)) {
    return fail('Absolute placement needs finite child and parent geometry.');
  }
  if (facts.rotation !== undefined && facts.rotation !== 0) return fail('A rotated absolute child has no exact offset mapping.');
  const constraints = (typeof facts.constraints === 'object' && facts.constraints !== null ? facts.constraints : {}) as Record<string, unknown>;
  const border = facts.parentBorderPx ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const horizontal = axis(constraints.horizontal, x, width, parentWidth, border.left, border.right);
  if (typeof horizontal === 'string') return fail(`Horizontal: ${horizontal}`);
  const vertical = axis(constraints.vertical, y, height, parentHeight, border.top, border.bottom);
  if (typeof vertical === 'string') return fail(`Vertical: ${vertical}`);
  if (!validOffset(horizontal.offsetPx) || !validOffset(vertical.offsetPx)) {
    return fail(`Absolute offsets must be within ±${P15_NEUTRAL_EXPORT_MAX_OFFSET_PX}px.`);
  }
  return { position: { horizontal, vertical } };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function absolutePositionProblems(value: unknown, path: string): P15PositionProblem[] {
  if (!record(value) || Object.keys(value).length !== 2 || !record(value.horizontal) || !record(value.vertical)) {
    return [{ path, message: 'Position must hold exactly horizontal and vertical offsets.' }];
  }
  const problems: P15PositionProblem[] = [];
  for (const key of ['horizontal', 'vertical'] as const) {
    const entry = value[key] as Record<string, unknown>;
    if (Object.keys(entry).length !== 2 || (entry.edge !== 'start' && entry.edge !== 'end') || !validOffset(entry.offsetPx)) {
      problems.push({ path: `${path}.${key}`, message: `An offset is { edge: start | end, offsetPx } within ±${P15_NEUTRAL_EXPORT_MAX_OFFSET_PX}px with at most two decimals.` });
    }
  }
  return problems;
}

export function zIndexProblems(value: unknown, path: string): P15PositionProblem[] {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= P15_NEUTRAL_EXPORT_MAX_Z_INDEX
    ? []
    : [{ path, message: `Z-index must be an integer 0-${P15_NEUTRAL_EXPORT_MAX_Z_INDEX}.` }];
}

export function canonicalAbsolutePosition(position: P15NeutralAbsolutePosition): Record<string, unknown> {
  return {
    horizontal: { edge: position.horizontal.edge, offsetPx: position.horizontal.offsetPx },
    vertical: { edge: position.vertical.edge, offsetPx: position.vertical.offsetPx },
  };
}

/** Elementor settings for an absolute placement; containers use `position`, widgets `_position`. */
export function absolutePositionSettings(position: P15NeutralAbsolutePosition | undefined, element: 'container' | 'widget'): Record<string, unknown> {
  if (position === undefined) return {};
  const { horizontal, vertical } = position;
  return {
    [element === 'container' ? 'position' : '_position']: 'absolute',
    _offset_orientation_h: horizontal.edge,
    [horizontal.edge === 'start' ? '_offset_x' : '_offset_x_end']: elementorPxSlider(horizontal.offsetPx),
    _offset_orientation_v: vertical.edge,
    [vertical.edge === 'start' ? '_offset_y' : '_offset_y_end']: elementorPxSlider(vertical.offsetPx),
  };
}

export function zIndexSettings(zIndex: number | undefined, element: 'container' | 'widget'): Record<string, unknown> {
  return zIndex === undefined ? {} : { [element === 'container' ? 'z_index' : '_z_index']: zIndex };
}

type Stackable = { kind: string; position?: P15NeutralAbsolutePosition; zIndex?: number };
const STACK_CARRIERS = new Set(['container', 'text', 'heading', 'button', 'divider']);
/** Kinds that paint nothing in the target, so their order does not matter. */
const UNPAINTED = new Set(['spacer', 'review']);

/**
 * Give siblings from the first absolute child on z-index 1, 2, 3… in layer order. A painted sibling that
 * cannot carry a z-index makes the stack a review instead of a guess.
 */
export function assignP15StackOrder<T extends Stackable>(children: readonly T[]): { children: T[]; stacked: boolean; review?: { reasonCode: string; detail: string } } {
  const first = children.findIndex((child) => child.position !== undefined);
  if (first < 0) return { children: [...children], stacked: false };
  if (children.slice(first).some((child) => !STACK_CARRIERS.has(child.kind) && !UNPAINTED.has(child.kind))) {
    return { children: [...children], stacked: false, review: { reasonCode: ABSOLUTE_STACKING_REVIEW,
      detail: 'A sibling painted above an absolute child cannot carry a z-index, so the layer order needs review.' } };
  }
  return {
    children: children.map((child, index) => (index >= first && STACK_CARRIERS.has(child.kind) ? { ...child, zIndex: index - first + 1 } : child)),
    stacked: true,
  };
}
