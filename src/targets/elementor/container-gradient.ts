/**
 * Container linear and radial gradient backgrounds and their exact Elementor 4.2.4 encoding (recovery M2.4c).
 *
 * Source evidence (Elementor 4.2.4, tag commit 0e292207b5b45f0e22603967ae41c0374211160d), the sources the
 * repaired M1.5e Container gradient families prove:
 * - `includes/controls/groups/background.php` (blob ac8e1a510ec663f3f428c9f564dc2c5b727435e1): `background:
 *   gradient`, `color`/`color_b`, `%` sliders `color_stop`/`color_b_stop`, `gradient_type` linear|radial; linear →
 *   `linear-gradient({{angle}}, color stop, color_b stop_b)`, radial → `radial-gradient(at {{position}}, …)` with
 *   CSS's default `ellipse farthest-corner` shape.
 *
 * Elementor holds exactly two colour stops, so only two-stop Figma gradients map, with opaque stop colours and
 * an opaque paint. Figma's `gradientTransform` maps the frame's normalised (0..1) space to gradient space,
 * where the gradient runs along x from 0 to 1 (linear) or outward from (0.5, 0.5) with radius 0.5 (radial).
 * - Linear maps exactly when the gradient runs along one axis (CSS 180/0deg vertically, 90/270deg
 *   horizontally): every Figma stop then sits at a linear position along that axis, which is the CSS stop.
 *   Diagonal gradients depend on the aspect ratio in CSS and are REVIEW.
 * - Radial maps exactly for the default (identity) transform: Figma's ellipse touches the edges and CSS's
 *   farthest-corner ellipse is the same shape √2 larger, so each stop is divided by √2. Anything else is REVIEW.
 */
export interface P15NeutralGradient {
  type: 'linear' | 'radial';
  /** Lowercase `#rrggbb`. */
  colorA: string;
  colorB: string;
  /** 0..100 %, two decimals, stopA <= stopB. */
  stopA: number;
  stopB: number;
  /** Linear only: 0, 90, 180 or 270. */
  angleDeg?: number;
}

const ANGLES = [0, 90, 180, 270];
const hex = /^#[0-9a-f]{6}$/;
const stop = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
  && Math.round(value * 100) / 100 === value;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function gradientProblems(value: unknown, path: string): { path: string; message: string }[] {
  const keys = record(value) ? Object.keys(value) : [];
  const allowed = ['type', 'colorA', 'colorB', 'stopA', 'stopB', 'angleDeg'];
  if (!record(value) || keys.some((key) => !allowed.includes(key))
    || (value.type !== 'linear' && value.type !== 'radial')
    || typeof value.colorA !== 'string' || !hex.test(value.colorA) || typeof value.colorB !== 'string' || !hex.test(value.colorB)
    || !stop(value.stopA) || !stop(value.stopB) || value.stopA > value.stopB
    || (value.type === 'linear' ? !ANGLES.includes(value.angleDeg as number) : value.angleDeg !== undefined)) {
    return [{ path, message: 'Gradient must be linear (angle 0/90/180/270) or radial, two lowercase #rrggbb colours and ordered 0..100% stops.' }];
  }
  return [];
}

export function canonicalGradient(gradient: P15NeutralGradient): Record<string, unknown> {
  return { type: gradient.type, colorA: gradient.colorA, colorB: gradient.colorB, stopA: gradient.stopA, stopB: gradient.stopB,
    ...(gradient.angleDeg === undefined ? {} : { angleDeg: gradient.angleDeg }) };
}

export function gradientSettings(gradient: P15NeutralGradient | undefined): Record<string, unknown> {
  if (gradient === undefined) return {};
  const percent = (size: number) => ({ unit: '%', size, sizes: [] });
  return {
    background_background: 'gradient',
    background_color: gradient.colorA,
    background_color_stop: percent(gradient.stopA),
    background_color_b: gradient.colorB,
    background_color_b_stop: percent(gradient.stopB),
    background_gradient_type: gradient.type,
    ...(gradient.type === 'linear'
      ? { background_gradient_angle: { unit: 'deg', size: gradient.angleDeg, sizes: [] } }
      : { background_gradient_position: 'center center' }),
  };
}

const round = (value: number): number => Math.round(value * 100) / 100;
const near = (value: number, target: number): boolean => Math.abs(value - target) < 1e-6;

function opaqueHex(color: unknown): string | null {
  if (!record(color)) return null;
  const channels = ['r', 'g', 'b'].map((key) => color[key]);
  if (channels.some((value) => typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1)) return null;
  if (color.a !== undefined && color.a !== 1) return null;
  return `#${channels.map((value) => Math.round((value as number) * 255).toString(16).padStart(2, '0')).join('')}`;
}

/** Derive one exact gradient from a visible Figma GRADIENT_LINEAR / GRADIENT_RADIAL paint. */
export function deriveP15Gradient(paint: Record<string, unknown>): { gradient?: P15NeutralGradient; review?: { reasonCode: string; detail: string } } {
  const fail = (detail: string) => ({ review: { reasonCode: 'GRADIENT_REQUIRES_REVIEW', detail } });
  if (paint.type !== 'GRADIENT_LINEAR' && paint.type !== 'GRADIENT_RADIAL') return fail(`${String(paint.type)} gradients have no Elementor equivalent.`);
  if (paint.opacity !== undefined && paint.opacity !== 1) return fail('A translucent gradient paint has no exact Elementor gradient.');
  if (paint.blendMode !== undefined && paint.blendMode !== 'NORMAL') return fail(`Gradient blend mode ${String(paint.blendMode)} has no Elementor equivalent.`);
  const stops = Array.isArray(paint.gradientStops) ? paint.gradientStops : [];
  if (stops.length !== 2) return fail(`Elementor gradients hold exactly two colour stops; observed ${stops.length}.`);
  const parsed = stops.map((entry) => (record(entry) ? { color: opaqueHex(entry.color), position: entry.position } : null));
  if (parsed.some((entry) => entry === null || entry.color === null || typeof entry.position !== 'number' || !Number.isFinite(entry.position))) {
    return fail('Gradient stops must be opaque colours with finite positions.');
  }
  const [first, second] = parsed as { color: string; position: number }[];
  const transform = Array.isArray(paint.gradientTransform) ? paint.gradientTransform : null;
  const row = (index: number): number[] | null => {
    const value = transform?.[index];
    return Array.isArray(value) && value.length === 3 && value.every((entry) => typeof entry === 'number' && Number.isFinite(entry)) ? value as number[] : null;
  };
  const [x, y] = [row(0), row(1)];
  if (x === null || y === null) return fail('The gradient transform is not a readable 2x3 matrix.');

  let positions: [number, number];
  let angleDeg: number | undefined;
  if (paint.type === 'GRADIENT_LINEAR') {
    // t = x[0]·px + x[1]·py + x[2]; one axis term must be zero for an exact CSS angle.
    const [a, b, c] = x as [number, number, number];
    if (near(a, 0) === near(b, 0)) return fail('Only vertical or horizontal linear gradients map exactly; a diagonal depends on the box aspect ratio in CSS.');
    const scale = near(a, 0) ? b : a;
    angleDeg = near(a, 0) ? (scale > 0 ? 180 : 0) : (scale > 0 ? 90 : 270);
    // CSS position along the gradient direction: (t - c) / scale for a positive direction, mirrored otherwise.
    const css = (t: number) => (scale > 0 ? (t - c) / scale : 1 - (t - c) / scale);
    positions = [css(first!.position), css(second!.position)];
  } else {
    if (!(near(x[0]!, 1) && near(x[1]!, 0) && near(x[2]!, 0) && near(y[0]!, 0) && near(y[1]!, 1) && near(y[2]!, 0))) {
      return fail('Only the default centred radial gradient maps exactly to an Elementor radial gradient.');
    }
    positions = [first!.position / Math.SQRT2, second!.position / Math.SQRT2];
  }
  const [stopA, stopB] = positions.map((value) => round(value * 100)) as [number, number];
  const gradient: P15NeutralGradient = {
    type: paint.type === 'GRADIENT_LINEAR' ? 'linear' : 'radial',
    colorA: first!.color, colorB: second!.color, stopA, stopB,
    ...(angleDeg === undefined ? {} : { angleDeg }),
  };
  return gradientProblems(gradient, '').length === 0 ? { gradient } : fail('Gradient stops fall outside the box or out of order, which Elementor stops cannot express.');
}
