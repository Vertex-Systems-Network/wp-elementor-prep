import { lowerHexColorCodec, type ValueCodec } from '../codecs';
import type { FamilySettingWrite } from '../property-family';
import { hasOwn, isRecord, onlyAllowedKeys } from '../shared-validation';

/**
 * Two-colour Button gradient profiles (recovery M1.4d) for the Elementor `background` group, normal or
 * hover. A linear profile carries optional angles; a radial profile carries a required position with
 * optional tablet/mobile positions. Stops are integer percentages in order, with optional tablet/mobile
 * stop pairs. The codec and writes reproduce the original linear/radial contracts exactly.
 */
export type GradientKind = 'linear' | 'radial';

export interface GradientProfile {
  colorA: string;
  colorB: string;
  stopA: number;
  stopB: number;
  tabletStopA?: number;
  tabletStopB?: number;
  mobileStopA?: number;
  mobileStopB?: number;
  angleDeg?: number;
  tabletAngleDeg?: number;
  mobileAngleDeg?: number;
  position?: string;
  tabletPosition?: string;
  mobilePosition?: string;
}

const COMMON_KEYS = ['colorA', 'colorB', 'mobileStopA', 'mobileStopB', 'stopA', 'stopB', 'tabletStopA', 'tabletStopB'];
const KIND_KEYS: Readonly<Record<GradientKind, readonly string[]>> = {
  linear: ['angleDeg', 'mobileAngleDeg', 'tabletAngleDeg'],
  radial: ['mobilePosition', 'position', 'tabletPosition'],
};

function safeIntegerIn(value: unknown, min: number, max: number): value is number {
  return Number.isSafeInteger(value) && Number(value) >= min && Number(value) <= max;
}

function validStopPair(a: unknown, b: unknown): boolean {
  if ((a !== undefined) !== (b !== undefined)) return false;
  return a === undefined || (safeIntegerIn(a, 0, 100) && safeIntegerIn(b, 0, 100) && Number(a) <= Number(b));
}

export function gradientProfileCodec(kind: GradientKind, positions: readonly string[] = []): ValueCodec<GradientProfile> {
  const keys = [...COMMON_KEYS, ...KIND_KEYS[kind]];
  const validPosition = (value: unknown): boolean => typeof value === 'string' && positions.includes(value);
  return {
    id: `button-${kind}-gradient-profile`,
    is: (value): value is GradientProfile => {
      if (!isRecord(value) || !onlyAllowedKeys(value, keys)) return false;
      const required = ['colorA', 'colorB', 'stopA', 'stopB', ...(kind === 'radial' ? ['position'] : [])];
      if (!required.every((key) => hasOwn(value, key))) return false;
      if (!lowerHexColorCodec.is(value.colorA) || !lowerHexColorCodec.is(value.colorB)) return false;
      if (!safeIntegerIn(value.stopA, 0, 100) || !safeIntegerIn(value.stopB, 0, 100) || Number(value.stopA) > Number(value.stopB)) return false;
      if (!validStopPair(value.tabletStopA, value.tabletStopB) || !validStopPair(value.mobileStopA, value.mobileStopB)) return false;
      if (kind === 'linear') {
        return ['angleDeg', 'tabletAngleDeg', 'mobileAngleDeg'].every((key) => value[key] === undefined || safeIntegerIn(value[key], 0, 360));
      }
      if (!validPosition(value.position)) return false;
      return ['tabletPosition', 'mobilePosition'].every((key) => value[key] === undefined || validPosition(value[key]));
    },
    snapshot: (value) => ({
      colorA: value.colorA,
      colorB: value.colorB,
      stopA: value.stopA,
      stopB: value.stopB,
      ...(value.tabletStopA === undefined ? {} : { tabletStopA: value.tabletStopA, tabletStopB: value.tabletStopB }),
      ...(value.mobileStopA === undefined ? {} : { mobileStopA: value.mobileStopA, mobileStopB: value.mobileStopB }),
      ...(kind === 'linear'
        ? {
          ...(value.angleDeg === undefined ? {} : { angleDeg: value.angleDeg }),
          ...(value.tabletAngleDeg === undefined ? {} : { tabletAngleDeg: value.tabletAngleDeg }),
          ...(value.mobileAngleDeg === undefined ? {} : { mobileAngleDeg: value.mobileAngleDeg }),
        }
        : {
          position: value.position as string,
          ...(value.tabletPosition === undefined ? {} : { tabletPosition: value.tabletPosition }),
          ...(value.mobilePosition === undefined ? {} : { mobilePosition: value.mobilePosition }),
        }),
    }),
    encode: (value) => value,
  };
}

const slider = (unit: '%' | 'deg', size: number) => ({ unit, size, sizes: [] });

/**
 * Setting writes for one gradient state under `prefix` (`background` or `button_background_hover`).
 * Writes keep the original order (stops before `gradient_type`); `rankBase` plus the original
 * requested-key order (type keys before responsive stops) decides which conflict is reported first.
 */
export function gradientWrites(kind: GradientKind, prefix: string, gradient: GradientProfile, rankBase: number): FamilySettingWrite[] {
  const requested = ['background', 'color', 'color_stop', 'color_b', 'color_b_stop', 'gradient_type'];
  if (kind === 'radial') requested.push('gradient_position');
  if (gradient.tabletStopA !== undefined) requested.push('color_stop_tablet', 'color_b_stop_tablet');
  if (gradient.mobileStopA !== undefined) requested.push('color_stop_mobile', 'color_b_stop_mobile');
  if (kind === 'linear') {
    if (gradient.angleDeg !== undefined) requested.push('gradient_angle');
    if (gradient.tabletAngleDeg !== undefined) requested.push('gradient_angle_tablet');
    if (gradient.mobileAngleDeg !== undefined) requested.push('gradient_angle_mobile');
  } else {
    if (gradient.tabletPosition !== undefined) requested.push('gradient_position_tablet');
    if (gradient.mobilePosition !== undefined) requested.push('gradient_position_mobile');
  }
  const write = (suffix: string, value: unknown): FamilySettingWrite => {
    const settingKey = `${prefix}_${suffix}`;
    return {
      settingKey,
      value,
      conflictSubject: settingKey,
      conflictMessage: `Generated base candidate already contains requested Button gradient setting ${settingKey}.`,
      conflictRank: rankBase + requested.indexOf(suffix),
    };
  };
  const writes = [
    write('background', 'gradient'),
    write('color', gradient.colorA),
    write('color_stop', slider('%', gradient.stopA)),
    write('color_b', gradient.colorB),
    write('color_b_stop', slider('%', gradient.stopB)),
  ];
  if (gradient.tabletStopA !== undefined && gradient.tabletStopB !== undefined) {
    writes.push(write('color_stop_tablet', slider('%', gradient.tabletStopA)), write('color_b_stop_tablet', slider('%', gradient.tabletStopB)));
  }
  if (gradient.mobileStopA !== undefined && gradient.mobileStopB !== undefined) {
    writes.push(write('color_stop_mobile', slider('%', gradient.mobileStopA)), write('color_b_stop_mobile', slider('%', gradient.mobileStopB)));
  }
  writes.push(write('gradient_type', kind));
  if (kind === 'linear') {
    if (gradient.angleDeg !== undefined) writes.push(write('gradient_angle', slider('deg', gradient.angleDeg)));
    if (gradient.tabletAngleDeg !== undefined) writes.push(write('gradient_angle_tablet', slider('deg', gradient.tabletAngleDeg)));
    if (gradient.mobileAngleDeg !== undefined) writes.push(write('gradient_angle_mobile', slider('deg', gradient.mobileAngleDeg)));
  } else {
    writes.push(write('gradient_position', gradient.position));
    if (gradient.tabletPosition !== undefined) writes.push(write('gradient_position_tablet', gradient.tabletPosition));
    if (gradient.mobilePosition !== undefined) writes.push(write('gradient_position_mobile', gradient.mobilePosition));
  }
  return writes;
}
