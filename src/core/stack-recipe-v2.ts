import type { AuditNode } from './types';

/**
 * Classifier v2 + Recipes v2 for linear stacks (recovery M5.1–M5.2). Pure and deterministic.
 *
 * Classifier v2 (M5.1):
 * - counts every visible ordinary-flow child — containers, text, images and vectors — not only containers;
 * - confidence comes from how exactly the geometry fits the recipe (worst deviation within the 1 px tolerance), not
 *   from the number of children: a clean 2-child stack is as certain as a clean 12-child one;
 * - detects cross-axis MIN / CENTER / MAX alignment and SPACE_BETWEEN distribution.
 *
 * Recipes v2 (M5.2):
 * - Auto Layout direction, primary distribution (MIN with paddings, or SPACE_BETWEEN), cross alignment, gap and
 *   paddings, all read from the geometry;
 * - per-child cross-axis FILL (`layoutAlign: STRETCH`) where the child spans the whole padded cross axis, and HUG
 *   only for auto-width/auto-height text whose box already hugs (`textAutoResize`); everything else stays FIXED;
 * - non-uniform gaps: when consecutive children form runs with their own uniform gap, and the runs are separated by
 *   one uniform outer gap, each run becomes a nested sub-stack (a wrapper frame); otherwise REVIEW;
 * - every plan is proved by `simulateStackRecipeV2` (an Auto Layout simulation) before it may mutate: each child
 *   must land within 0.5 px of where it is now. The plugin then still runs the full P3 pixel validation and rolls
 *   back on any violation.
 *
 * The v1 classifier and Safe Fix recipes are unchanged; v2 only plans targets v1 does not make eligible.
 */
export const STACK_RECIPE_V2_VERSION = 'stack-recipe-v2' as const;
export const STACK_RECIPE_V2_MIN_CONFIDENCE = 90;
const TOLERANCE = 1;
const PROOF_TOLERANCE = 0.5;

export type StackDirection = 'VERTICAL' | 'HORIZONTAL';
export type StackCrossAlign = 'MIN' | 'CENTER' | 'MAX';
export type StackPrimaryAlign = 'MIN' | 'SPACE_BETWEEN';
export type StackChildKind = 'container' | 'text' | 'image' | 'vector' | 'other';

export interface StackChildPlan {
  id: string;
  kind: StackChildKind;
  /** Cross-axis FILL (STRETCH) or FIXED. */
  cross: 'FILL' | 'FIXED';
  /** Primary-axis HUG only for text that already auto-resizes on that axis. */
  primary: 'HUG' | 'FIXED';
}

export interface StackLayoutPlan {
  direction: StackDirection;
  primaryAlign: StackPrimaryAlign;
  crossAlign: StackCrossAlign;
  gap: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

export interface StackWrapperPlan {
  /** Child ids wrapped, in order. */
  childIds: string[];
  layout: StackLayoutPlan;
  /** Wrapper box in the target's coordinates. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StackRecipeV2Plan {
  version: typeof STACK_RECIPE_V2_VERSION;
  targetNodeId: string;
  layout: StackLayoutPlan;
  children: StackChildPlan[];
  /** Nested sub-stacks for non-uniform gaps (empty when the gaps are uniform). */
  wrappers: StackWrapperPlan[];
  confidence: number;
  /** Worst simulated displacement of any child, in px (the proof). */
  maxDisplacementPx: number;
}

export type StackRecipeV2Decision =
  | { decision: 'ELIGIBLE'; plan: StackRecipeV2Plan }
  | { decision: 'NOOP' | 'REVIEW'; targetNodeId: string; reason: string; confidence?: number };

interface Box { id: string; x: number; y: number; width: number; height: number }

export function stackChildKind(node: AuditNode): StackChildKind {
  if (node.isText) return 'text';
  if (node.isImageLike) return 'image';
  if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION' || node.type === 'STAR' || node.type === 'POLYGON' || node.type === 'LINE') return 'vector';
  if (node.isContainer) return 'container';
  return 'other';
}

const axis = (box: Box, direction: StackDirection) => direction === 'VERTICAL'
  ? { start: box.y, end: box.y + box.height, size: box.height, crossStart: box.x, crossEnd: box.x + box.width, crossSize: box.width }
  : { start: box.x, end: box.x + box.width, size: box.width, crossStart: box.y, crossEnd: box.y + box.height, crossSize: box.height };

/** Worst deviation of `values` from their first value, or Infinity when they differ beyond the tolerance. */
function spread(values: number[]): number {
  if (values.length === 0) return 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return max - min;
}

/** Direction in which the boxes, in layer order, flow without overlap; null when neither or both are ambiguous. */
function flowDirection(boxes: Box[]): StackDirection | null {
  const flows = (direction: StackDirection): boolean => boxes.every((box, index) => index === 0
    || axis(box, direction).start >= axis(boxes[index - 1]!, direction).end - PROOF_TOLERANCE);
  const vertical = flows('VERTICAL');
  const horizontal = flows('HORIZONTAL');
  if (vertical === horizontal) return null;
  return vertical ? 'VERTICAL' : 'HORIZONTAL';
}

interface CrossFit { align: StackCrossAlign; deviation: number; fill: boolean[] }

/** Cross alignment that fits every non-stretched child; children spanning the whole padded cross axis may STRETCH. */
function crossFit(boxes: Box[], direction: StackDirection, crossSize: number): CrossFit | null {
  const geometry = boxes.map((box) => axis(box, direction));
  const candidates: Array<{ align: StackCrossAlign; values: number[] }> = [
    { align: 'MIN', values: geometry.map((g) => g.crossStart) },
    { align: 'CENTER', values: geometry.map((g) => (g.crossStart + g.crossEnd) / 2) },
    { align: 'MAX', values: geometry.map((g) => g.crossEnd) },
  ];
  for (const candidate of candidates) {
    const deviation = spread(candidate.values);
    if (deviation <= TOLERANCE) {
      const crossStart = Math.min(...geometry.map((g) => g.crossStart));
      const crossEnd = Math.max(...geometry.map((g) => g.crossEnd));
      // A child spanning exactly the content's cross extent, while others are narrower, is a FILL child.
      const anyNarrower = geometry.some((g) => g.crossSize < crossEnd - crossStart - TOLERANCE);
      const fill = geometry.map((g) => anyNarrower && Math.abs(g.crossStart - crossStart) <= TOLERANCE && Math.abs(g.crossEnd - crossEnd) <= TOLERANCE);
      // FILL is only meaningful (and simulated) for MIN alignment with a symmetric layout of the stretched children.
      return { align: candidate.align, deviation, fill: candidate.align === 'MIN' ? fill : geometry.map(() => false) };
    }
  }
  // Mixed alignment: children that span the full content cross extent can STRETCH; the rest must share one alignment.
  const crossStart = Math.min(...geometry.map((g) => g.crossStart));
  const crossEnd = Math.max(...geometry.map((g) => g.crossEnd));
  const spanning = geometry.map((g) => Math.abs(g.crossStart - crossStart) <= TOLERANCE && Math.abs(g.crossEnd - crossEnd) <= TOLERANCE);
  const rest = geometry.filter((_, index) => !spanning[index]);
  if (rest.length === 0 || rest.length === geometry.length) return null;
  const restFit = crossFit(boxes.filter((_, index) => !spanning[index]), direction, crossSize);
  if (!restFit) return null;
  // The rest must line up with the stretched children's edges for MIN/MAX, or their centre for CENTER.
  const reference = restFit.align === 'MIN' ? crossStart : restFit.align === 'MAX' ? crossEnd : (crossStart + crossEnd) / 2;
  const sample = rest[0]!;
  const actual = restFit.align === 'MIN' ? sample.crossStart : restFit.align === 'MAX' ? sample.crossEnd : (sample.crossStart + sample.crossEnd) / 2;
  if (Math.abs(actual - reference) > TOLERANCE) return null;
  return { align: restFit.align, deviation: restFit.deviation, fill: spanning };
}

interface LayoutFit { layout: StackLayoutPlan; deviation: number; fill: boolean[] }

function layoutFor(boxes: Box[], direction: StackDirection, width: number, height: number, allowSpaceBetween: boolean): LayoutFit | { reason: string } {
  const geometry = boxes.map((box) => axis(box, direction));
  const gaps = geometry.slice(1).map((g, index) => g.start - geometry[index]!.end);
  if (gaps.some((gap) => gap < -PROOF_TOLERANCE)) return { reason: 'Children overlap on the primary axis.' };
  const gapDeviation = spread(gaps);
  if (gapDeviation > TOLERANCE) return { reason: 'NON_UNIFORM_GAPS' };
  const gap = gaps.length === 0 ? 0 : Math.max(0, gaps.reduce((sum, value) => sum + value, 0) / gaps.length);
  const primarySize = direction === 'VERTICAL' ? height : width;
  const crossSize = direction === 'VERTICAL' ? width : height;
  const cross = crossFit(boxes, direction, crossSize);
  if (!cross) return { reason: 'Cross-axis alignment is mixed (not MIN, CENTER or MAX within 1 px).' };
  const startPadding = geometry[0]!.start;
  const endPadding = primarySize - geometry.at(-1)!.end;
  const crossStart = Math.min(...geometry.map((g) => g.crossStart));
  const crossEnd = Math.max(...geometry.map((g) => g.crossEnd));
  let crossStartPadding = crossStart;
  let crossEndPadding = crossSize - crossEnd;
  if ([startPadding, endPadding, crossStartPadding, crossEndPadding].some((value) => value < -PROOF_TOLERANCE)) {
    return { reason: 'Child geometry extends outside the frame.' };
  }
  // CENTER / MAX: the padding on the free side is irrelevant to the positions; keep it symmetric where possible.
  if (cross.align === 'CENTER') {
    const inset = Math.min(crossStartPadding, crossEndPadding);
    crossStartPadding = inset;
    crossEndPadding = inset;
  }
  // SPACE_BETWEEN: symmetric primary insets and a gap larger than them (the distributed-row pattern, e.g. a nav bar).
  const spaceBetween = allowSpaceBetween && boxes.length >= 2 && Math.abs(startPadding - endPadding) <= TOLERANCE && gap > startPadding + TOLERANCE;
  const pad = (value: number) => Math.max(0, Math.round(value * 100) / 100);
  const [pStart, pEnd, cStart, cEnd] = [startPadding, endPadding, crossStartPadding, crossEndPadding].map(pad) as [number, number, number, number];
  const layout: StackLayoutPlan = direction === 'VERTICAL'
    ? { direction, primaryAlign: spaceBetween ? 'SPACE_BETWEEN' : 'MIN', crossAlign: cross.align, gap: pad(gap),
      paddingTop: pStart, paddingBottom: pEnd, paddingLeft: cStart, paddingRight: cEnd }
    : { direction, primaryAlign: spaceBetween ? 'SPACE_BETWEEN' : 'MIN', crossAlign: cross.align, gap: pad(gap),
      paddingLeft: pStart, paddingRight: pEnd, paddingTop: cStart, paddingBottom: cEnd };
  return { layout, deviation: Math.max(gapDeviation, cross.deviation), fill: cross.fill };
}

/**
 * Simulate Figma Auto Layout for a FIXED-size frame: returns each child's box. Children keep their own sizes, except
 * FILL children, which take the padded cross extent. SPACE_BETWEEN distributes the free primary space evenly.
 */
export function simulateStackLayout(layout: StackLayoutPlan, width: number, height: number,
  children: Array<{ id: string; width: number; height: number; fill: boolean }>): Box[] {
  const vertical = layout.direction === 'VERTICAL';
  const primarySize = vertical ? height : width;
  const crossSize = vertical ? width : height;
  const [pStart, pEnd, cStart, cEnd] = vertical
    ? [layout.paddingTop, layout.paddingBottom, layout.paddingLeft, layout.paddingRight]
    : [layout.paddingLeft, layout.paddingRight, layout.paddingTop, layout.paddingBottom];
  const sizes = children.map((child) => (vertical ? child.height : child.width));
  const content = sizes.reduce((sum, size) => sum + size, 0);
  const gap = layout.primaryAlign === 'SPACE_BETWEEN' && children.length > 1
    ? (primarySize - pStart - pEnd - content) / (children.length - 1)
    : layout.gap;
  const innerCross = crossSize - cStart - cEnd;
  let cursor = pStart;
  return children.map((child, index) => {
    const crossChild = child.fill ? innerCross : (vertical ? child.width : child.height);
    const crossOffset = child.fill || layout.crossAlign === 'MIN' ? cStart
      : layout.crossAlign === 'MAX' ? crossSize - cEnd - crossChild
        : cStart + (innerCross - crossChild) / 2;
    const start = cursor;
    cursor += sizes[index]! + gap;
    return vertical
      ? { id: child.id, x: crossOffset, y: start, width: crossChild, height: sizes[index]! }
      : { id: child.id, x: start, y: crossOffset, width: sizes[index]!, height: crossChild };
  });
}

function displacement(actual: Box[], simulated: Box[]): number {
  return Math.max(0, ...actual.map((box, index) => {
    const sim = simulated[index]!;
    return Math.max(Math.abs(box.x - sim.x), Math.abs(box.y - sim.y), Math.abs(box.width - sim.width), Math.abs(box.height - sim.height));
  }));
}

const confidenceFrom = (deviation: number, wrapped: boolean): number =>
  Math.max(0, Math.round(100 - 10 * Math.min(1, deviation / TOLERANCE) - (wrapped ? 5 : 0)));

/**
 * Split boxes into nested runs: the largest gap (within 1 px) separates runs, every other gap is internal to a run.
 * Valid only when each run's internal gaps are uniform and at least one run has two or more children.
 */
function runsFor(boxes: Box[], direction: StackDirection): Box[][] | null {
  const geometry = boxes.map((box) => axis(box, direction));
  const gaps = geometry.slice(1).map((g, index) => g.start - geometry[index]!.end);
  const outerGap = Math.max(...gaps);
  const runs: Box[][] = [[boxes[0]!]];
  const inner: number[][] = [[]];
  gaps.forEach((gap, index) => {
    if (outerGap - gap <= TOLERANCE) {
      runs.push([boxes[index + 1]!]);
      inner.push([]);
    } else {
      runs.at(-1)!.push(boxes[index + 1]!);
      inner.at(-1)!.push(gap);
    }
  });
  if (runs.length < 2 || runs.every((run) => run.length === 1) || inner.some((list) => spread(list) > TOLERANCE)) return null;
  return runs;
}

/** Classifier v2 + recipe v2 for one target frame. */
export function planStackRecipeV2(target: AuditNode): StackRecipeV2Decision {
  const id = target.id;
  if (target.type !== 'FRAME' && target.type !== 'COMPONENT') return { decision: 'REVIEW', targetNodeId: id, reason: 'Only frames and components take Auto Layout.' };
  if (target.isAutoLayout) return { decision: 'NOOP', targetNodeId: id, reason: 'The frame already uses Auto Layout.' };
  const visible = target.children.filter((child) => child.visible);
  if (visible.some((child) => child.absolutePositioned)) return { decision: 'REVIEW', targetNodeId: id, reason: 'An absolute-positioned child is present.' };
  if (visible.length < 2) return { decision: 'REVIEW', targetNodeId: id, reason: 'At least two visible children are required.' };
  if (visible.length !== target.children.length) return { decision: 'REVIEW', targetNodeId: id, reason: 'Hidden children would join the Auto Layout flow.' };
  const boxes: Box[] = visible.map((child) => ({ id: child.id, ...child.geometry }));
  if (boxes.some((box) => ![box.x, box.y, box.width, box.height].every(Number.isFinite) || box.width < 0 || box.height < 0)) {
    return { decision: 'REVIEW', targetNodeId: id, reason: 'A child has invalid geometry.' };
  }
  const direction = flowDirection(boxes);
  if (!direction) return { decision: 'REVIEW', targetNodeId: id, reason: 'Layer order does not describe one linear flow (or both axes fit).' };
  const { width, height } = target.geometry;
  const childPlan = (child: AuditNode, fill: boolean): StackChildPlan => {
    const autoAxis = direction === 'VERTICAL' ? ['HEIGHT', 'WIDTH_AND_HEIGHT'] : ['WIDTH_AND_HEIGHT'];
    return { id: child.id, kind: stackChildKind(child), cross: fill ? 'FILL' : 'FIXED',
      primary: child.isText && child.textAutoResize !== null && autoAxis.includes(child.textAutoResize) ? 'HUG' : 'FIXED' };
  };
  const fit = layoutFor(boxes, direction, width, height, true);
  if ('layout' in fit) {
    const simulated = simulateStackLayout(fit.layout, width, height, boxes.map((box, index) => ({ ...box, fill: fit.fill[index]! })));
    const maxDisplacementPx = round2(displacement(boxes, simulated));
    if (maxDisplacementPx > PROOF_TOLERANCE) {
      return { decision: 'REVIEW', targetNodeId: id, reason: `The Auto Layout simulation moves a child by ${maxDisplacementPx}px.` };
    }
    return { decision: 'ELIGIBLE', plan: { version: STACK_RECIPE_V2_VERSION, targetNodeId: id, layout: fit.layout,
      children: visible.map((child, index) => childPlan(child, fit.fill[index]!)), wrappers: [], confidence: confidenceFrom(fit.deviation, false), maxDisplacementPx } };
  }
  if (fit.reason !== 'NON_UNIFORM_GAPS') return { decision: 'REVIEW', targetNodeId: id, reason: fit.reason };
  // Nested sub-stacks: each run becomes a wrapper with its own uniform gap; wrappers form the outer stack.
  const runs = runsFor(boxes, direction);
  if (!runs) return { decision: 'REVIEW', targetNodeId: id, reason: 'Primary-axis gaps are not uniform and do not form nested runs with one outer gap.' };
  const wrappers: StackWrapperPlan[] = [];
  const outerBoxes: Box[] = [];
  let deviation = 0;
  let worst = 0;
  for (const run of runs) {
    const x = Math.min(...run.map((box) => box.x));
    const y = Math.min(...run.map((box) => box.y));
    const box = { id: `wrapper:${run[0]!.id}`, x, y, width: Math.max(...run.map((b) => b.x + b.width)) - x, height: Math.max(...run.map((b) => b.y + b.height)) - y };
    outerBoxes.push(box);
    if (run.length === 1) continue;
    const local = run.map((b) => ({ ...b, x: b.x - x, y: b.y - y }));
    const inner = layoutFor(local, direction, box.width, box.height, false);
    if (!('layout' in inner)) return { decision: 'REVIEW', targetNodeId: id, reason: `A nested run cannot be a sub-stack: ${inner.reason}` };
    const simulated = simulateStackLayout(inner.layout, box.width, box.height, local.map((b, index) => ({ ...b, fill: inner.fill[index]! })));
    worst = Math.max(worst, displacement(local, simulated));
    deviation = Math.max(deviation, inner.deviation);
    wrappers.push({ childIds: run.map((b) => b.id), layout: inner.layout, x, y, width: box.width, height: box.height });
  }
  const outer = layoutFor(outerBoxes, direction, width, height, false);
  if (!('layout' in outer)) return { decision: 'REVIEW', targetNodeId: id, reason: `The nested runs do not form an outer stack: ${outer.reason}` };
  const simulatedOuter = simulateStackLayout(outer.layout, width, height, outerBoxes.map((b, index) => ({ ...b, fill: outer.fill[index]! })));
  worst = round2(Math.max(worst, displacement(outerBoxes, simulatedOuter)));
  if (worst > PROOF_TOLERANCE) return { decision: 'REVIEW', targetNodeId: id, reason: `The nested Auto Layout simulation moves a child by ${worst}px.` };
  return { decision: 'ELIGIBLE', plan: { version: STACK_RECIPE_V2_VERSION, targetNodeId: id, layout: outer.layout,
    children: visible.map((child) => childPlan(child, false)), wrappers, confidence: confidenceFrom(Math.max(deviation, outer.deviation), true), maxDisplacementPx: worst } };
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

export interface StackRecipeV2Survey {
  /** Frames without Auto Layout that have at least two visible children: the eligible population. */
  candidates: number;
  eligible: StackRecipeV2Plan[];
  review: Array<{ targetNodeId: string; reason: string }>;
  noop: number;
}

/** Survey every frame of a section (M5.6 metric): which non-Auto-Layout containers recipes v2 can convert. */
export function surveyStackRecipesV2(section: AuditNode, minConfidence = STACK_RECIPE_V2_MIN_CONFIDENCE): StackRecipeV2Survey {
  const survey: StackRecipeV2Survey = { candidates: 0, eligible: [], review: [], noop: 0 };
  const visit = (node: AuditNode): void => {
    if ((node.type === 'FRAME' || node.type === 'COMPONENT') && node.visible) {
      const decision = planStackRecipeV2(node);
      if (decision.decision === 'NOOP') survey.noop += 1;
      else if (node.children.filter((child) => child.visible).length >= 2) {
        survey.candidates += 1;
        if (decision.decision === 'ELIGIBLE' && decision.plan.confidence >= minConfidence) survey.eligible.push(decision.plan);
        else survey.review.push({ targetNodeId: node.id, reason: decision.decision === 'ELIGIBLE'
          ? `Confidence ${decision.plan.confidence}% is below the ${minConfidence}% gate.` : decision.reason });
      }
    }
    for (const child of node.children) visit(child);
  };
  visit(section);
  return survey;
}
