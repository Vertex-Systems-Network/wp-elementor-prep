/**
 * Container drop and inner shadow and its exact Elementor 4.2.4 encoding (recovery M2.4b).
 *
 * Source evidence (Elementor 4.2.4, tag commit 0e292207b5b45f0e22603967ae41c0374211160d), the same sources the
 * M1 Container box-shadow family proves:
 * - `includes/elements/container.php` (blob 3486766b9565af99536ae205ed1936bb155daed0): Box Shadow group `box_shadow`.
 * - `includes/controls/groups/box-shadow.php` (blob 1c068c900db0ff2593089028d67fb6d897dbaa33): starter
 *   `box_shadow_box_shadow_type: 'yes'`, `box_shadow_box_shadow` → `box-shadow: {{HORIZONTAL}}px {{VERTICAL}}px
 *   {{BLUR}}px {{SPREAD}}px {{COLOR}} {{box_shadow_position.VALUE}}`, position `' '` (outline) or `inset`.
 * - `includes/controls/box-shadow.php` (blob e55cf9af34db5cc3e73dc295cd9f35b437da6fa7): the stored colour is a CSS
 *   colour string (its own default is `rgba(0,0,0,0.5)`), so a translucent Figma shadow colour is written as rgba.
 *
 * Figma's shadow offset, blur and spread are the CSS box-shadow lengths. Exactly one visible DROP_SHADOW or
 * INNER_SHADOW with normal blending maps; several shadows (the control holds one), layer/background blurs, other
 * blend modes, `showShadowBehindNode` and values outside the control ranges stay `EFFECT_REQUIRES_REVIEW`.
 */
export interface P15NeutralBoxShadow {
  xPx: number;
  yPx: number;
  blurPx: number;
  spreadPx: number;
  /** Lowercase `#rrggbb`. */
  colorHex: string;
  /** 0 < alpha <= 1, at most two decimals. */
  alpha: number;
  inset?: true;
}

const SHADOW_KEYS = ['xPx', 'yPx', 'blurPx', 'spreadPx', 'colorHex', 'alpha', 'inset'] as const;
const hundredths = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && Math.round(value * 100) / 100 === value;
const within = (value: unknown, min: number, max: number): value is number => hundredths(value) && value >= min && value <= max;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function boxShadowProblems(value: unknown, path: string): { path: string; message: string }[] {
  if (!record(value) || Object.keys(value).some((key) => !(SHADOW_KEYS as readonly string[]).includes(key))
    || !within(value.xPx, -100, 100) || !within(value.yPx, -100, 100) || !within(value.blurPx, 0, 100) || !within(value.spreadPx, -100, 100)
    || typeof value.colorHex !== 'string' || !/^#[0-9a-f]{6}$/.test(value.colorHex)
    || !within(value.alpha, 0.01, 1) || (value.inset !== undefined && value.inset !== true)) {
    return [{ path, message: 'Box shadow must be x/y/spread -100..100px, blur 0..100px, lowercase #rrggbb, alpha 0.01..1 and optional inset true.' }];
  }
  return [];
}

export function canonicalBoxShadow(shadow: P15NeutralBoxShadow): Record<string, unknown> {
  return { xPx: shadow.xPx, yPx: shadow.yPx, blurPx: shadow.blurPx, spreadPx: shadow.spreadPx, colorHex: shadow.colorHex, alpha: shadow.alpha,
    ...(shadow.inset ? { inset: true } : {}) };
}

function cssColor(shadow: P15NeutralBoxShadow): string {
  if (shadow.alpha === 1) return shadow.colorHex;
  const [r, g, b] = [1, 3, 5].map((offset) => Number.parseInt(shadow.colorHex.slice(offset, offset + 2), 16));
  return `rgba(${r},${g},${b},${shadow.alpha})`;
}

export function boxShadowSettings(shadow: P15NeutralBoxShadow | undefined): Record<string, unknown> {
  if (shadow === undefined) return {};
  return {
    box_shadow_box_shadow_type: 'yes',
    box_shadow_box_shadow: { horizontal: shadow.xPx, vertical: shadow.yPx, blur: shadow.blurPx, spread: shadow.spreadPx, color: cssColor(shadow) },
    box_shadow_box_shadow_position: shadow.inset ? 'inset' : ' ',
  };
}

const channel = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1 ? value : null);
const round = (value: number): number => Math.round(value * 100) / 100;

/** Derive one exact container shadow from the Figma effect list (visible effects only). */
export function deriveP15BoxShadow(effects: readonly Record<string, unknown>[] | 'MIXED'): { shadow?: P15NeutralBoxShadow; review?: { reasonCode: string; detail: string } } {
  if (effects !== 'MIXED' && effects.length === 0) return {};
  const fail = (detail: string) => ({ review: { reasonCode: 'EFFECT_REQUIRES_REVIEW', detail } });
  if (effects === 'MIXED' || effects.length !== 1) {
    const types = effects === 'MIXED' ? 'MIXED' : [...new Set(effects.map((effect) => String(effect.type ?? 'UNKNOWN')))].sort().join(', ');
    return fail(`Only one drop or inner shadow maps to an Elementor box shadow; observed ${types}.`);
  }
  const effect = effects[0]!;
  if (effect.type !== 'DROP_SHADOW' && effect.type !== 'INNER_SHADOW') return fail(`${String(effect.type)} has no exact Elementor equivalent.`);
  if (effect.blendMode !== undefined && effect.blendMode !== 'NORMAL') return fail(`Shadow blend mode ${String(effect.blendMode)} has no Elementor equivalent.`);
  if (effect.showShadowBehindNode === true) return fail('A shadow shown behind a translucent node has no CSS equivalent.');
  const offset = record(effect.offset) ? effect.offset : {};
  const color = record(effect.color) ? effect.color : {};
  const [r, g, b, a] = ['r', 'g', 'b', 'a'].map((key) => channel(color[key]));
  const values = [offset.x, offset.y, effect.radius, effect.spread ?? 0].map((value) => (typeof value === 'number' && Number.isFinite(value) ? round(value) : null));
  if (r === null || g === null || b === null || a === null || values.some((value) => value === null)) return fail('The shadow has a non-finite offset, blur, spread or colour.');
  const [xPx, yPx, blurPx, spreadPx] = values as number[];
  const shadow: P15NeutralBoxShadow = {
    xPx: xPx!, yPx: yPx!, blurPx: blurPx!, spreadPx: spreadPx!,
    colorHex: `#${[r, g, b].map((value) => Math.round(value! * 255).toString(16).padStart(2, '0')).join('')}`,
    alpha: round(a!),
    ...(effect.type === 'INNER_SHADOW' ? { inset: true as const } : {}),
  };
  if (shadow.alpha === 0) return {};
  return boxShadowProblems(shadow, '').length === 0 ? { shadow } : fail('Shadow values are outside the Elementor box shadow control range.');
}
