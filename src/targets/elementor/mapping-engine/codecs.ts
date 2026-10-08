import { exactKeys, isRecord } from './shared-validation';

/**
 * Value codecs for Elementor property families. A codec validates an explicit neutral value
 * (fail closed: no coercion, no unit conversion, no inference), snapshots it so callers cannot
 * mutate stored evidence, and encodes it into the exact Elementor setting value shape.
 *
 * Codecs for typography groups, box shadows, gradients and borders are added with the families
 * that consume them (recovery M1.3d / M1.4), so each encoding is proven by golden equivalence.
 */
export interface ValueCodec<Neutral, Encoded = unknown> {
  readonly id: string;
  is(value: unknown): value is Neutral;
  snapshot(value: Neutral): Neutral;
  encode(value: Neutral): Encoded;
}

export interface PxRange {
  min: number;
  max: number;
}

export function isFinitePxInRange(value: unknown, range: PxRange): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= range.min
    && value <= range.max;
}

/** A single px number; encodes to the plain number. */
export function pxNumberCodec(range: PxRange): ValueCodec<number, number> {
  return {
    id: `px-number:${range.min}..${range.max}`,
    is: (value): value is number => isFinitePxInRange(value, range),
    snapshot: (value) => value,
    encode: (value) => value,
  };
}

export interface BoxPx {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const BOX_SIDES = ['top', 'right', 'bottom', 'left'] as const;
const BOX_KEYS = ['bottom', 'left', 'right', 'top'] as const;

export interface ElementorDimensionsValue {
  unit: 'px';
  top: string;
  right: string;
  bottom: string;
  left: string;
  isLinked: boolean;
}

/** Exact top/right/bottom/left px box (padding, margin, radius); Elementor `dimensions` control value. */
export function dimensionsBoxCodec(range: PxRange): ValueCodec<BoxPx, ElementorDimensionsValue> {
  return {
    id: `dimensions-box:${range.min}..${range.max}`,
    is: (value): value is BoxPx => isRecord(value)
      && exactKeys(value, BOX_KEYS)
      && BOX_SIDES.every((side) => isFinitePxInRange(value[side], range)),
    snapshot: (value) => ({ top: value.top, right: value.right, bottom: value.bottom, left: value.left }),
    encode: (value) => ({
      unit: 'px',
      top: String(value.top),
      right: String(value.right),
      bottom: String(value.bottom),
      left: String(value.left),
      isLinked: value.top === value.right
        && value.right === value.bottom
        && value.bottom === value.left,
    }),
  };
}

export interface GapAxesPx {
  row: number;
  column: number;
  isLinked: boolean;
}

export interface ElementorGapValue {
  unit: 'px';
  column: string;
  row: string;
  isLinked: boolean;
}

/** Elementor flex `gap` control value: linked (row = column) or explicit row/column axes. */
export function gapAxesCodec(range: PxRange): ValueCodec<GapAxesPx, ElementorGapValue> {
  return {
    id: `gap-axes:${range.min}..${range.max}`,
    is: (value): value is GapAxesPx => isRecord(value)
      && exactKeys(value, ['column', 'isLinked', 'row'])
      && isFinitePxInRange(value.row, range)
      && isFinitePxInRange(value.column, range)
      && typeof value.isLinked === 'boolean'
      && (!value.isLinked || value.row === value.column),
    snapshot: (value) => ({ row: value.row, column: value.column, isLinked: value.isLinked }),
    encode: (value) => ({
      unit: 'px',
      column: String(value.column),
      row: String(value.row),
      isLinked: value.isLinked,
    }),
  };
}

/** Canonical uppercase `#RRGGBB`, the neutral IR colour form. */
export const hexColorCodec: ValueCodec<string, string> = {
  id: 'hex-color-rrggbb',
  is: (value): value is string => typeof value === 'string' && /^#[0-9A-F]{6}$/.test(value),
  snapshot: (value) => value,
  encode: (value) => value,
};

/** Lowercase `#rrggbb`, the explicit manifest colour form of the container style contracts. */
export const lowerHexColorCodec: ValueCodec<string, string> = {
  id: 'hex-color-lower-rrggbb',
  is: (value): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/.test(value),
  snapshot: (value) => value,
  encode: (value) => value,
};

export function enumCodec<T extends string>(values: readonly T[]): ValueCodec<T, T> {
  return {
    id: `enum:${values.join('|')}`,
    is: (value): value is T => typeof value === 'string' && (values as readonly string[]).includes(value),
    snapshot: (value) => value,
    encode: (value) => value,
  };
}

/** Elementor switcher controls store `'yes'` / `''`. */
export const switcherCodec: ValueCodec<boolean, 'yes' | ''> = {
  id: 'switcher-yes-empty',
  is: (value): value is boolean => typeof value === 'boolean',
  snapshot: (value) => value,
  encode: (value) => (value ? 'yes' : ''),
};

/** Finite integer within an inclusive range (z-index, min height, widths, flex order/basis). */
export function intRangeCodec(range: PxRange): ValueCodec<number, number> {
  return {
    id: `int:${range.min}..${range.max}`,
    is: (value): value is number => typeof value === 'number'
      && Number.isFinite(value)
      && Number.isInteger(value)
      && value >= range.min
      && value <= range.max,
    snapshot: (value) => value,
    encode: (value) => value,
  };
}

/** Exactly one literal value (e.g. `true` for an explicit "custom" selection). */
export function literalCodec<T extends string | number | boolean>(literal: T): ValueCodec<T, T> {
  return {
    id: `literal:${String(literal)}`,
    is: (value): value is T => value === literal,
    snapshot: (value) => value,
    encode: (value) => value,
  };
}

export function numberEnumCodec<T extends number>(values: readonly T[]): ValueCodec<T, T> {
  return {
    id: `number-enum:${values.join('|')}`,
    is: (value): value is T => typeof value === 'number' && (values as readonly number[]).includes(value),
    snapshot: (value) => value,
    encode: (value) => value,
  };
}

export interface ElementorSliderValue {
  unit: 'px';
  size: number;
  sizes: [];
}

/** Elementor `slider` control px value as stored by the editor. */
export function elementorPxSlider(size: number): ElementorSliderValue {
  return { unit: 'px', size, sizes: [] };
}

/** Elementor `dimensions` control px value with all four sides equal (linked). */
export function elementorLinkedDimensionsPx(value: number): ElementorDimensionsValue {
  return { unit: 'px', top: String(value), right: String(value), bottom: String(value), left: String(value), isLinked: true };
}

/** Integer opacity in hundredths (0..100); encodes to an Elementor px slider of size value/100. */
export const hundredthsOpacityCodec: ValueCodec<number, ElementorSliderValue> = {
  id: 'opacity-hundredths:0..100',
  is: (value): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 100,
  snapshot: (value) => value,
  encode: (value) => elementorPxSlider(value / 100),
};
