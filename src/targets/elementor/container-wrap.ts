/**
 * Wrapped Auto Layout and its exact Elementor 4.2.4 encoding (recovery M2.6a).
 *
 * Source evidence (Elementor 4.2.4, tag commit 0e292207b5b45f0e22603967ae41c0374211160d):
 * - `includes/controls/groups/flex-container.php` (blob ce9e412e31b7710f33129ae35634ecb51e580d38): `wrap`
 *   (nowrap | wrap → `--flex-wrap`), `gap` GAPS (`--row-gap` / `--column-gap`) and `align_content`
 *   (flex-start | center | flex-end | space-between | space-around | space-evenly → `--align-content`,
 *   condition `wrap = wrap`). The Container registers the group as `flex`, so the keys are `flex_wrap`,
 *   `flex_gap` and `flex_align_content`.
 * - `assets/dev/scss/frontend/_container.scss` (blob d6c65cb86810634c55c8b9e65aef8e9b9ef439e8): a flex
 *   Container applies `flex-wrap: var(--flex-wrap)` and `align-content: var(--align-content)`; with no value the
 *   browser default `align-content: normal` stretches the lines, so the value is always written.
 * - Figma (`@figma/plugin-typings` 1.140.0, `counterAxisAlignContent`): `AUTO` sizes each line to its largest
 *   child and aligns the lines by `counterAxisAlignItems` "like flexbox `align-content: start | center | end`",
 *   unless every child stretches; `SPACE_BETWEEN` divides the free space between the lines.
 *   `counterAxisSpacing` is the gap between lines.
 *
 * Mapping: a horizontal wrapped frame → `flex_wrap: wrap`, column gap = item spacing, row gap = line spacing,
 * and `flex_align_content` from the rule above. Every child stretching (CSS `stretch`, not an Elementor option),
 * a missing line spacing, and FILL-width children (each would take a whole line in CSS) are REVIEW.
 */
export const WRAP_REVIEW = 'WRAPPED_AUTO_LAYOUT_REQUIRES_REVIEW';
/** Same bound as the Auto Layout item spacing (`P15_NEUTRAL_EXPORT_MAX_SPACING_PX`). */
const P15_NEUTRAL_EXPORT_MAX_SPACING_PX = 4_096;

export type P15NeutralAlignContent = 'start' | 'center' | 'end' | 'space-between';

export interface P15NeutralWrap {
  /** Gap between wrapped lines in px. */
  rowGapPx: number;
  alignContent: P15NeutralAlignContent;
}

export interface P15WrapFacts {
  layoutMode: unknown;
  counterAxisSpacing: unknown;
  counterAxisAlignContent: unknown;
  /** The container's mapped counter-axis alignment. */
  alignItems: string;
  /** `layoutAlign` of each visible in-flow child. */
  childLayoutAligns: readonly unknown[];
}

export interface P15WrapDerivation {
  wrap?: P15NeutralWrap;
  review?: { reasonCode: string; detail: string };
}

const validGap = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0
  && value <= P15_NEUTRAL_EXPORT_MAX_SPACING_PX && Math.round(value * 100) / 100 === value;

export function deriveP15Wrap(facts: P15WrapFacts): P15WrapDerivation {
  const fail = (detail: string): P15WrapDerivation => ({ review: { reasonCode: WRAP_REVIEW, detail } });
  if (facts.layoutMode !== 'HORIZONTAL') return fail('Only horizontal Auto Layout wraps.');
  const rowGap = typeof facts.counterAxisSpacing === 'number' ? Math.round(facts.counterAxisSpacing * 100) / 100 : facts.counterAxisSpacing;
  if (!validGap(rowGap)) return fail(`The line spacing must be a fixed value within 0-${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}px.`);
  if (facts.counterAxisAlignContent === 'SPACE_BETWEEN') return { wrap: { rowGapPx: rowGap, alignContent: 'space-between' } };
  if (facts.counterAxisAlignContent !== 'AUTO') return fail(`Unknown line distribution ${String(facts.counterAxisAlignContent)}.`);
  if (facts.childLayoutAligns.length > 0 && facts.childLayoutAligns.every((align) => align === 'STRETCH')) {
    return fail('When every child stretches, Figma stretches the lines, which no Elementor align-content option reproduces.');
  }
  if (facts.alignItems !== 'start' && facts.alignItems !== 'center' && facts.alignItems !== 'end') {
    return fail(`Lines cannot be aligned by the ${facts.alignItems} counter alignment.`);
  }
  return { wrap: { rowGapPx: rowGap, alignContent: facts.alignItems } };
}

export function wrapProblems(value: unknown, path: string, direction: unknown): { path: string; message: string }[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return [{ path, message: 'Wrap must be an object.' }];
  const entry = value as Record<string, unknown>;
  const problems: { path: string; message: string }[] = [];
  if (Object.keys(entry).some((key) => key !== 'rowGapPx' && key !== 'alignContent')) problems.push({ path, message: 'Wrap holds only rowGapPx and alignContent.' });
  if (!validGap(entry.rowGapPx)) problems.push({ path: `${path}.rowGapPx`, message: `The line gap must be 0-${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}px with at most two decimals.` });
  if (!['start', 'center', 'end', 'space-between'].includes(entry.alignContent as string)) {
    problems.push({ path: `${path}.alignContent`, message: 'alignContent must be start, center, end or space-between.' });
  }
  if (direction !== 'row') problems.push({ path, message: 'Only a row container wraps.' });
  return problems;
}

export function canonicalWrap(wrap: P15NeutralWrap): Record<string, unknown> {
  return { rowGapPx: wrap.rowGapPx, alignContent: wrap.alignContent };
}

const ALIGN_CONTENT: Record<P15NeutralAlignContent, string> = { start: 'flex-start', center: 'center', end: 'flex-end', 'space-between': 'space-between' };

/** `flex_wrap`, the split `flex_gap` and `flex_align_content` for a wrapped container with column gap `gapPx`. */
export function wrapSettings(wrap: P15NeutralWrap | undefined, gapPx: number | undefined): Record<string, unknown> {
  if (wrap === undefined) return {};
  const column = gapPx ?? 0;
  return {
    flex_wrap: 'wrap',
    flex_gap: { column: String(column), row: String(wrap.rowGapPx), isLinked: column === wrap.rowGapPx, unit: 'px' },
    flex_align_content: ALIGN_CONTENT[wrap.alignContent],
  };
}
