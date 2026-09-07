import type { SafeRecipePlan } from '../core/safe-recipe-types';

export interface SafeRecipeTransformResult {
  applied: boolean;
  reason: string;
  targetNodeId?: string;
}

interface AxisGeometry {
  start: number;
  end: number;
  crossStart: number;
  crossEnd: number;
}

function resolveFrameByPath(root: FrameNode, path: number[]): FrameNode | null {
  let current: SceneNode = root;
  for (const index of path) {
    if (!('children' in current)) return null;
    const child = current.children[index];
    if (!child) return null;
    current = child;
  }
  return current.type === 'FRAME' ? current : null;
}

function visibleChildren(frame: FrameNode): readonly SceneNode[] {
  return frame.children.filter((child) => child.visible);
}

function childAxisGeometry(child: SceneNode, direction: 'VERTICAL' | 'HORIZONTAL'): AxisGeometry {
  if (direction === 'VERTICAL') {
    return {
      start: child.y,
      end: child.y + child.height,
      crossStart: child.x,
      crossEnd: child.x + child.width,
    };
  }
  return {
    start: child.x,
    end: child.x + child.width,
    crossStart: child.y,
    crossEnd: child.y + child.height,
  };
}

function near(a: number, b: number, tolerance = 1): boolean {
  return Math.abs(a - b) <= tolerance;
}

function strictUniformGeometry(
  frame: FrameNode,
  direction: 'VERTICAL' | 'HORIZONTAL',
): { ok: true; gap: number; startPadding: number; endPadding: number; crossStartPadding: number; crossEndPadding: number }
  | { ok: false; reason: string } {
  const children = [...visibleChildren(frame)];
  if (children.length < 2) return { ok: false, reason: 'At least two visible direct children are required.' };

  for (const child of children) {
    if ('layoutPositioning' in child && child.layoutPositioning === 'ABSOLUTE') {
      return { ok: false, reason: 'Visible absolute-positioned child blocks the simple Auto Layout recipe.' };
    }
  }

  const visuallySorted = [...children].sort((a, b) => {
    const ga = childAxisGeometry(a, direction);
    const gb = childAxisGeometry(b, direction);
    return ga.start - gb.start;
  });

  if (children.some((child, index) => child.id !== visuallySorted[index]?.id)) {
    return { ok: false, reason: 'Layer order differs from visual flow order; automatic reordering is intentionally refused.' };
  }

  const geometry = children.map((child) => childAxisGeometry(child, direction));
  const crossStart = geometry[0]?.crossStart ?? 0;
  if (!geometry.every((item) => near(item.crossStart, crossStart))) {
    return { ok: false, reason: 'Cross-axis origins are not aligned within 1 px.' };
  }

  const gaps: number[] = [];
  for (let index = 1; index < geometry.length; index += 1) {
    const previous = geometry[index - 1];
    const current = geometry[index];
    if (!previous || !current) continue;
    const gap = current.start - previous.end;
    if (gap < -0.5) return { ok: false, reason: 'Children overlap on the primary axis.' };
    gaps.push(gap);
  }

  const gap = gaps[0] ?? 0;
  if (!gaps.every((value) => near(value, gap))) {
    return { ok: false, reason: 'Primary-axis gaps are not uniform within 1 px.' };
  }

  const first = geometry[0];
  const last = geometry.at(-1);
  if (!first || !last) return { ok: false, reason: 'Visible child geometry is unavailable.' };

  const framePrimarySize = direction === 'VERTICAL' ? frame.height : frame.width;
  const frameCrossSize = direction === 'VERTICAL' ? frame.width : frame.height;
  const maxCrossEnd = Math.max(...geometry.map((item) => item.crossEnd));

  const startPadding = first.start;
  const endPadding = framePrimarySize - last.end;
  const crossStartPadding = crossStart;
  const crossEndPadding = frameCrossSize - maxCrossEnd;

  if ([startPadding, endPadding, crossStartPadding, crossEndPadding].some((value) => value < -0.5)) {
    return { ok: false, reason: 'Child geometry extends outside the candidate frame bounds.' };
  }

  return {
    ok: true,
    gap: Math.max(0, gap),
    startPadding: Math.max(0, startPadding),
    endPadding: Math.max(0, endPadding),
    crossStartPadding: Math.max(0, crossStartPadding),
    crossEndPadding: Math.max(0, crossEndPadding),
  };
}

function applyLinearAutoLayout(frame: FrameNode, direction: 'VERTICAL' | 'HORIZONTAL'): SafeRecipeTransformResult {
  const geometry = strictUniformGeometry(frame, direction);
  if (!geometry.ok) return { applied: false, reason: geometry.reason, targetNodeId: frame.id };

  frame.layoutMode = direction;
  frame.primaryAxisSizingMode = 'FIXED';
  frame.counterAxisSizingMode = 'FIXED';
  frame.primaryAxisAlignItems = 'MIN';
  frame.counterAxisAlignItems = 'MIN';
  frame.itemSpacing = geometry.gap;

  if (direction === 'VERTICAL') {
    frame.paddingTop = geometry.startPadding;
    frame.paddingBottom = geometry.endPadding;
    frame.paddingLeft = geometry.crossStartPadding;
    frame.paddingRight = geometry.crossEndPadding;
  } else {
    frame.paddingLeft = geometry.startPadding;
    frame.paddingRight = geometry.endPadding;
    frame.paddingTop = geometry.crossStartPadding;
    frame.paddingBottom = geometry.crossEndPadding;
  }

  return { applied: true, reason: `Applied strict ${direction.toLowerCase()} Auto Layout to staged candidate.`, targetNodeId: frame.id };
}

/**
 * Apply only an already-approved P5 plan to a staged P4 candidate root.
 * This function never receives the approved original root.
 * Full P3 validation must run after this function and before any P4 commit.
 */
export function applySafeRecipeToCandidate(candidateRoot: FrameNode, plan: SafeRecipePlan): SafeRecipeTransformResult {
  if (plan.decision !== 'ELIGIBLE' || !plan.recipe) {
    return { applied: false, reason: `Recipe plan is ${plan.decision}; candidate mutation is not permitted.` };
  }

  const target = resolveFrameByPath(candidateRoot, plan.targetPath);
  if (!target) return { applied: false, reason: 'Candidate target path no longer resolves to a Frame.' };

  if (plan.recipe === 'vertical-stack') return applyLinearAutoLayout(target, 'VERTICAL');
  if (plan.recipe === 'horizontal-row' || plan.recipe === 'two-column') return applyLinearAutoLayout(target, 'HORIZONTAL');

  return {
    applied: false,
    reason: `${plan.recipe} planning is enabled, but its Figma mutation recipe is not enabled yet.`,
    targetNodeId: target.id,
  };
}
