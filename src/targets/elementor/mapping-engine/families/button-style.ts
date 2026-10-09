import { lowerHexColorCodec, type ValueCodec } from '../codecs';
import { exactKeys, isRecord } from '../shared-validation';

/**
 * Value codecs for Button style families (recovery M1.4c): bounded text/box shadows and an explicit
 * desktop/tablet/mobile radius triple. Snapshots keep the manifest's own key order, as the original
 * contracts copied these objects verbatim; encodings are the exact Elementor control values.
 */
function integerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && Number.isInteger(value)
    && value >= min
    && value <= max;
}

export interface TextShadowValue {
  horizontal: number;
  vertical: number;
  blur: number;
  color: string;
}

export interface BoxShadowValue {
  horizontal: number;
  vertical: number;
  blur: number;
  spread: number;
  color: string;
  position: 'outline' | 'inset';
}

export interface ResponsiveRadiusValue {
  desktop: number;
  tablet: number;
  mobile: number;
}

/** Text shadow: integer offsets -100..100, blur 0..100, lowercase hex colour. */
export function textShadowValueCodec(): ValueCodec<TextShadowValue, Record<string, unknown>> {
  return {
    id: 'text-shadow:bounded',
    is: (value): value is TextShadowValue => isRecord(value)
      && exactKeys(value, ['blur', 'color', 'horizontal', 'vertical'])
      && integerInRange(value.horizontal, -100, 100)
      && integerInRange(value.vertical, -100, 100)
      && integerInRange(value.blur, 0, 100)
      && lowerHexColorCodec.is(value.color),
    snapshot: (value) => ({ ...value }),
    encode: (value) => ({ horizontal: value.horizontal, vertical: value.vertical, blur: value.blur, color: value.color }),
  };
}

/** Box shadow: integer offsets/spread -100..100, blur 0..100, lowercase hex colour, outline|inset. */
export function boxShadowValueCodec(): ValueCodec<BoxShadowValue, Record<string, unknown>> {
  return {
    id: 'box-shadow:bounded',
    is: (value): value is BoxShadowValue => isRecord(value)
      && exactKeys(value, ['blur', 'color', 'horizontal', 'position', 'spread', 'vertical'])
      && integerInRange(value.horizontal, -100, 100)
      && integerInRange(value.vertical, -100, 100)
      && integerInRange(value.blur, 0, 100)
      && integerInRange(value.spread, -100, 100)
      && lowerHexColorCodec.is(value.color)
      && (value.position === 'outline' || value.position === 'inset'),
    snapshot: (value) => ({ ...value }),
    encode: (value) => ({
      horizontal: value.horizontal,
      vertical: value.vertical,
      blur: value.blur,
      spread: value.spread,
      color: value.color,
    }),
  };
}

/** Elementor stores the box-shadow position as `inset`, or a single space for the default outline. */
export function elementorBoxShadowPosition(value: BoxShadowValue): 'inset' | ' ' {
  return value.position === 'inset' ? 'inset' : ' ';
}

/** Explicit integer desktop/tablet/mobile radius from 0 through `maxPx`. */
export function responsiveRadiusCodec(maxPx: number): ValueCodec<ResponsiveRadiusValue> {
  return {
    id: `responsive-radius:0..${maxPx}`,
    is: (value): value is ResponsiveRadiusValue => isRecord(value)
      && exactKeys(value, ['desktop', 'mobile', 'tablet'])
      && integerInRange(value.desktop, 0, maxPx)
      && integerInRange(value.tablet, 0, maxPx)
      && integerInRange(value.mobile, 0, maxPx),
    snapshot: (value) => ({ ...value }),
    encode: (value) => value,
  };
}
