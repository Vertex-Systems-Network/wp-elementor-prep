import { describe, expect, it } from 'vitest';
import {
  dimensionsBoxCodec,
  enumCodec,
  gapAxesCodec,
  hexColorCodec,
  pxNumberCodec,
  switcherCodec,
} from '../src/targets/elementor/mapping-engine/codecs';
import { responsiveSettingKey } from '../src/targets/elementor/mapping-engine/property-family';
import { exactKeys, onlyAllowedKeys, validFingerprint, validSourceNodeId } from '../src/targets/elementor/mapping-engine/shared-validation';

const RANGE = { min: 0, max: 4096 };

describe('recovery M1.1 — mapping-engine value codecs', () => {
  it('px numbers accept only finite in-range values', () => {
    const codec = pxNumberCodec(RANGE);
    expect([0, 12.5, 4096].every((value) => codec.is(value))).toBe(true);
    expect([-1, 4097, Number.NaN, Number.POSITIVE_INFINITY, '8', null].some((value) => codec.is(value))).toBe(false);
    expect(codec.encode(8)).toBe(8);
  });

  it('dimension boxes require exact sides and encode the Elementor dimensions value with derived isLinked', () => {
    const codec = dimensionsBoxCodec(RANGE);
    expect(codec.is({ top: 1, right: 2, bottom: 3, left: 4 })).toBe(true);
    expect(codec.is({ top: 1, right: 2, bottom: 3 })).toBe(false);
    expect(codec.is({ top: 1, right: 2, bottom: 3, left: 4, unit: 'px' })).toBe(false);
    expect(codec.is({ top: 1, right: 2, bottom: 3, left: -1 })).toBe(false);
    expect(codec.encode({ top: 1, right: 2, bottom: 3, left: 4 })).toEqual({ unit: 'px', top: '1', right: '2', bottom: '3', left: '4', isLinked: false });
    expect(codec.encode({ top: 5, right: 5, bottom: 5, left: 5 }).isLinked).toBe(true);
    expect(Object.keys(codec.encode({ top: 5, right: 5, bottom: 5, left: 5 }))).toEqual(['unit', 'top', 'right', 'bottom', 'left', 'isLinked']);
    const original = { top: 1, right: 2, bottom: 3, left: 4 };
    const snapshot = codec.snapshot(original);
    original.top = 99;
    expect(snapshot.top).toBe(1);
  });

  it('gap axes encode linked and split Elementor gap values and reject inconsistent links', () => {
    const codec = gapAxesCodec(RANGE);
    expect(codec.encode({ row: 8, column: 8, isLinked: true })).toEqual({ unit: 'px', column: '8', row: '8', isLinked: true });
    expect(Object.keys(codec.encode({ row: 4, column: 12, isLinked: false }))).toEqual(['unit', 'column', 'row', 'isLinked']);
    expect(codec.is({ row: 4, column: 12, isLinked: true })).toBe(false);
    expect(codec.is({ row: 4, column: 12, isLinked: false })).toBe(true);
  });

  it('colour, enum and switcher codecs fail closed on non-canonical input', () => {
    expect(hexColorCodec.is('#A1B2C3')).toBe(true);
    expect(['#a1b2c3', '#ABC', 'red', 7].some((value) => hexColorCodec.is(value))).toBe(false);
    const direction = enumCodec(['row', 'column'] as const);
    expect(direction.is('row')).toBe(true);
    expect(direction.is('ROW')).toBe(false);
    expect(switcherCodec.encode(true)).toBe('yes');
    expect(switcherCodec.encode(false)).toBe('');
    expect(switcherCodec.is('yes')).toBe(false);
  });

  it('derives Elementor responsive setting keys and keeps shared envelope helper semantics', () => {
    expect(responsiveSettingKey('flex_gap', 'desktop')).toBe('flex_gap');
    expect(responsiveSettingKey('flex_gap', 'tablet')).toBe('flex_gap_tablet');
    expect(responsiveSettingKey('padding', 'mobile')).toBe('padding_mobile');
    expect(exactKeys({ b: 1, a: 2 }, ['a', 'b'])).toBe(true);
    expect(exactKeys({ a: 2 }, ['a', 'b'])).toBe(false);
    expect(onlyAllowedKeys({ a: 2 }, ['a', 'b'])).toBe(true);
    expect(onlyAllowedKeys({ c: 2 }, ['a', 'b'])).toBe(false);
    expect(validFingerprint(`sha256:${'a'.repeat(64)}`)).toBe(true);
    expect(validFingerprint(`sha256:${'A'.repeat(64)}`)).toBe(false);
    expect(validSourceNodeId('1:2')).toBe(true);
    expect([' 1:2', '', 'x'.repeat(513), 5].some((value) => validSourceNodeId(value))).toBe(false);
  });
});
