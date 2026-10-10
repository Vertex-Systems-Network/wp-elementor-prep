/**
 * Container border, corner radii and clipping, and their exact Elementor 4.2.4 encoding (recovery M2.4a).
 *
 * Source evidence (Elementor 4.2.4, tag commit 0e292207b5b45f0e22603967ae41c0374211160d):
 * - `includes/elements/container.php` (blob 3486766b9565af99536ae205ed1936bb155daed0): Border group `border`
 *   (`border_border` style, `border_width` dimensions → `border-width` + `--border-*-width`, `border_color`),
 *   responsive dimensions `border_radius` (`--border-radius: TOP RIGHT BOTTOM LEFT`, i.e. the CSS shorthand
 *   order top-left, top-right, bottom-right, bottom-left) and select `overflow` (`--overflow`: hidden).
 * - `assets/dev/scss/frontend/_global.scss` (blob c84412205989e9377233d21c2f7729379ff6d027): everything inside
 *   `.elementor` is `box-sizing: border-box`, so a border is inside the element's width and height.
 *
 * Figma draws an INSIDE stroke over the frame's content area without moving the content (unless
 * `strokesIncludedInLayout`), while a CSS border moves the content inward by its width. The exact mapping
 * therefore keeps the border and lowers the padding by the border width on each side; a stroke wider than
 * its padding cannot be reproduced and is REVIEW. Only one visible, opaque, solid INSIDE stroke maps; dashes,
 * CENTER/OUTSIDE alignment, gradients, translucency and several paints are REVIEW.
 *
 * Non-uniform corner radii map when no corner exceeds half the shorter side (beyond that, Figma clamps each
 * corner while CSS scales all of them, so they differ). `clipsContent` maps to `overflow: hidden` only when the
 * clip can be seen: a child extends past the frame, or the frame is rounded and has children.
 */
export const P15_NEUTRAL_EXPORT_MAX_BORDER_PX = 100;

export interface P15NeutralBoxPx {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface P15NeutralBorder {
  style: 'solid';
  widthPx: P15NeutralBoxPx;
  /** Lowercase `#rrggbb`, the colour vocabulary the Container border family accepts. */
  colorHex: string;
}

export interface P15NeutralCornerRadii {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

export interface P15VisualStyleProblem {
  path: string;
  message: string;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const hundredths = (value: number): boolean => Math.round(value * 100) / 100 === value;
const inRange = (value: unknown, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max && hundredths(value);
const exactKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean =>
  Object.keys(value).length === keys.length && keys.every((key) => key in value);

export function borderProblems(value: unknown, path: string): P15VisualStyleProblem[] {
  if (!record(value) || !exactKeys(value, ['style', 'widthPx', 'colorHex'])) {
    return [{ path, message: 'Border must have exactly style, widthPx and colorHex.' }];
  }
  const problems: P15VisualStyleProblem[] = [];
  if (value.style !== 'solid') problems.push({ path: `${path}.style`, message: 'Border style must be solid.' });
  const width = value.widthPx;
  if (!record(width) || !exactKeys(width, ['top', 'right', 'bottom', 'left'])
    || !Object.values(width).every((side) => inRange(side, P15_NEUTRAL_EXPORT_MAX_BORDER_PX))
    || Object.values(width).every((side) => side === 0)) {
    problems.push({ path: `${path}.widthPx`, message: `Border widths must be top/right/bottom/left 0-${P15_NEUTRAL_EXPORT_MAX_BORDER_PX}px, not all zero.` });
  }
  if (typeof value.colorHex !== 'string' || !/^#[0-9a-f]{6}$/.test(value.colorHex)) {
    problems.push({ path: `${path}.colorHex`, message: 'Border colour must be lowercase #rrggbb.' });
  }
  return problems;
}

export function cornerRadiiProblems(value: unknown, path: string, maxRadius: number): P15VisualStyleProblem[] {
  const keys = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
  if (!record(value) || !exactKeys(value, keys) || !keys.every((key) => inRange(value[key], maxRadius))) {
    return [{ path, message: `Corner radii must be topLeft/topRight/bottomRight/bottomLeft 0-${maxRadius}px.` }];
  }
  const values = keys.map((key) => value[key] as number);
  return values.every((radius) => radius === values[0])
    ? [{ path, message: 'Uniform corner radii use cornerRadiusPx.' }]
    : [];
}

export function canonicalBorder(border: P15NeutralBorder): Record<string, unknown> {
  return { style: border.style, widthPx: { top: border.widthPx.top, right: border.widthPx.right, bottom: border.widthPx.bottom, left: border.widthPx.left },
    colorHex: border.colorHex };
}

export function canonicalCornerRadii(radii: P15NeutralCornerRadii): Record<string, unknown> {
  return { topLeft: radii.topLeft, topRight: radii.topRight, bottomRight: radii.bottomRight, bottomLeft: radii.bottomLeft };
}

function dimensions(value: P15NeutralBoxPx): Record<string, unknown> {
  return {
    unit: 'px',
    top: String(value.top),
    right: String(value.right),
    bottom: String(value.bottom),
    left: String(value.left),
    isLinked: value.top === value.right && value.right === value.bottom && value.bottom === value.left,
  };
}

/** Elementor Container settings for the border, non-uniform radii and clip facts. */
export function containerVisualStyleSettings(node: { border?: P15NeutralBorder; cornerRadiiPx?: P15NeutralCornerRadii; clipsContent?: true }): Record<string, unknown> {
  const settings: Record<string, unknown> = {};
  if (node.border !== undefined) {
    settings.border_border = node.border.style;
    settings.border_width = dimensions(node.border.widthPx);
    settings.border_color = node.border.colorHex;
  }
  if (node.cornerRadiiPx !== undefined) {
    const radii = node.cornerRadiiPx;
    settings.border_radius = dimensions({ top: radii.topLeft, right: radii.topRight, bottom: radii.bottomRight, left: radii.bottomLeft });
  }
  if (node.clipsContent) settings.overflow = 'hidden';
  return settings;
}

/** The Figma stroke facts of one container. */
export interface P15StrokeFacts {
  /** Visible stroke paints as solid opaque lowercase hex, or null for any other paint; 'MIXED' when mixed. */
  paints: readonly (string | null)[] | 'MIXED';
  weight: unknown;
  topWeight: unknown;
  rightWeight: unknown;
  bottomWeight: unknown;
  leftWeight: unknown;
  align: unknown;
  dashPattern: unknown;
  includedInLayout: unknown;
}

export interface P15BorderDerivation {
  border?: P15NeutralBorder;
  /** CSS padding after subtracting the border, when the border moves content. */
  paddingPx?: P15NeutralBoxPx;
  review?: { reasonCode: string; detail: string };
}

const STROKE_REVIEW = 'STROKE_REQUIRES_REVIEW';

/** Derive the exact Container border from Figma stroke facts and the frame padding. */
export function deriveP15ContainerBorder(facts: P15StrokeFacts, padding: P15NeutralBoxPx): P15BorderDerivation {
  if (facts.paints !== 'MIXED' && facts.paints.length === 0) return {};
  const side = (individual: unknown): number | null => {
    const value = typeof individual === 'number' ? individual : facts.weight;
    return typeof value === 'number' && Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
  };
  const widths = { top: side(facts.topWeight), right: side(facts.rightWeight), bottom: side(facts.bottomWeight), left: side(facts.leftWeight) };
  const values = Object.values(widths);
  if (values.every((value) => value === 0)) return {};
  const fail = (detail: string): P15BorderDerivation => ({ review: { reasonCode: STROKE_REVIEW, detail } });

  if (facts.paints === 'MIXED' || facts.paints.length !== 1 || facts.paints[0] === null) {
    return fail('Only one visible opaque solid stroke maps to an Elementor border.');
  }
  if (facts.align !== 'INSIDE') return fail(`A ${String(facts.align)} stroke has no exact CSS border equivalent; only INSIDE strokes map.`);
  if (Array.isArray(facts.dashPattern) ? facts.dashPattern.length > 0 : facts.dashPattern !== undefined) {
    return fail('Dashed Figma strokes do not render like CSS dashed borders.');
  }
  if (values.some((value) => value === null || !inRange(value, P15_NEUTRAL_EXPORT_MAX_BORDER_PX))) {
    return fail(`Stroke weights must be 0-${P15_NEUTRAL_EXPORT_MAX_BORDER_PX}px.`);
  }
  const widthPx = widths as P15NeutralBoxPx;
  const border: P15NeutralBorder = { style: 'solid', widthPx, colorHex: facts.paints[0]! };
  if (facts.includedInLayout === true) return { border };
  const compensated = {
    top: Math.round((padding.top - widthPx.top) * 100) / 100,
    right: Math.round((padding.right - widthPx.right) * 100) / 100,
    bottom: Math.round((padding.bottom - widthPx.bottom) * 100) / 100,
    left: Math.round((padding.left - widthPx.left) * 100) / 100,
  };
  if (Object.values(compensated).some((value) => value < 0)) {
    return fail('The stroke is wider than the padding on one side, so the content overlaps it in Figma; a CSS border would move it.');
  }
  return { border, paddingPx: compensated };
}

/** Non-uniform corner radii, or REVIEW when Figma's per-corner clamping and CSS scaling would differ. */
export function deriveP15CornerRadii(radii: P15NeutralCornerRadii, width: number, height: number): { radii?: P15NeutralCornerRadii; review?: { reasonCode: string; detail: string } } {
  const limit = Math.min(width, height) / 2;
  if (!Number.isFinite(limit) || Object.values(radii).some((radius) => radius > limit)) {
    return { review: { reasonCode: 'NONUNIFORM_CORNER_RADIUS_REQUIRES_REVIEW',
      detail: 'A non-uniform corner radius larger than half the shorter side is clamped per corner in Figma but scaled in CSS.' } };
  }
  return { radii };
}
