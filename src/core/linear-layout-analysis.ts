export type LinearLayoutDirection = 'VERTICAL' | 'HORIZONTAL';

export interface LinearLayoutItemGeometry {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  absolutePositioned: boolean;
}

export interface LinearLayoutFrameGeometry {
  width: number;
  height: number;
  children: LinearLayoutItemGeometry[];
}

export interface LinearLayoutGeometryPlan {
  gap: number;
  startPadding: number;
  endPadding: number;
  crossStartPadding: number;
  crossEndPadding: number;
}

export type LinearLayoutAnalysis =
  | { ok: true; plan: LinearLayoutGeometryPlan }
  | { ok: false; reason: string };

interface AxisGeometry {
  start: number;
  end: number;
  crossStart: number;
  crossEnd: number;
}

function axisGeometry(item: LinearLayoutItemGeometry, direction: LinearLayoutDirection): AxisGeometry {
  if (direction === 'VERTICAL') {
    return {
      start: item.y,
      end: item.y + item.height,
      crossStart: item.x,
      crossEnd: item.x + item.width,
    };
  }

  return {
    start: item.x,
    end: item.x + item.width,
    crossStart: item.y,
    crossEnd: item.y + item.height,
  };
}

function near(a: number, b: number, tolerance = 1): boolean {
  return Math.abs(a - b) <= tolerance;
}

/**
 * Pure, deterministic preflight for the first P5 linear recipes.
 *
 * It intentionally refuses to infer or reorder anything. A target is safe only when its current
 * manual geometry already describes one unambiguous linear flow that Auto Layout can reproduce.
 */
export function analyzeLinearLayoutGeometry(
  frame: LinearLayoutFrameGeometry,
  direction: LinearLayoutDirection,
): LinearLayoutAnalysis {
  if (!Number.isFinite(frame.width) || !Number.isFinite(frame.height) || frame.width <= 0 || frame.height <= 0) {
    return { ok: false, reason: 'Candidate frame has invalid bounds.' };
  }

  const children = frame.children.filter((child) => child.visible);
  if (children.length < 2) return { ok: false, reason: 'At least two visible direct children are required.' };

  if (children.some((child) => child.absolutePositioned)) {
    return { ok: false, reason: 'Visible absolute-positioned child blocks the simple Auto Layout recipe.' };
  }

  if (children.some((child) => ![child.x, child.y, child.width, child.height].every(Number.isFinite) || child.width < 0 || child.height < 0)) {
    return { ok: false, reason: 'Visible child has invalid geometry.' };
  }

  const visuallySorted = [...children].sort((a, b) => {
    const left = axisGeometry(a, direction);
    const right = axisGeometry(b, direction);
    return left.start - right.start;
  });

  if (children.some((child, index) => child.id !== visuallySorted[index]?.id)) {
    return { ok: false, reason: 'Layer order differs from visual flow order; automatic reordering is intentionally refused.' };
  }

  const geometry = children.map((child) => axisGeometry(child, direction));
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
    plan: {
      gap: Math.max(0, gap),
      startPadding: Math.max(0, startPadding),
      endPadding: Math.max(0, endPadding),
      crossStartPadding: Math.max(0, crossStartPadding),
      crossEndPadding: Math.max(0, crossEndPadding),
    },
  };
}
