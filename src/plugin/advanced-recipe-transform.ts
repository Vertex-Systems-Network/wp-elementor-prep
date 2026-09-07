import { analyzeAdvancedPageFlowCalibration } from '../core/advanced-page-flow-analysis';
import type { AdvancedRecipePlan } from '../core/advanced-recipe-types';

export interface AdvancedRecipeTransformResult {
  applied: boolean;
  reason: string;
  targetNodeId?: string;
}

interface DirectGeometry {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function resolveFrameByPath(root: FrameNode, path: number[]): FrameNode | null {
  let current: SceneNode = root;
  for (const index of path) {
    if (!('children' in current)) return null;
    const children = (current as SceneNode & ChildrenMixin).children as readonly SceneNode[];
    const child = children[index];
    if (!child) return null;
    current = child;
  }
  return current.type === 'FRAME' ? current : null;
}

function directGeometry(frame: FrameNode): DirectGeometry[] {
  return frame.children.map((child) => ({
    id: child.id,
    x: child.x,
    y: child.y,
    width: child.width,
    height: child.height,
  }));
}

function sameGeometry(before: DirectGeometry[], after: DirectGeometry[], tolerance = 0.5): boolean {
  if (before.length !== after.length) return false;
  return before.every((item, index) => {
    const next = after[index];
    return Boolean(
      next
      && next.id === item.id
      && Math.abs(next.x - item.x) <= tolerance
      && Math.abs(next.y - item.y) <= tolerance
      && Math.abs(next.width - item.width) <= tolerance
      && Math.abs(next.height - item.height) <= tolerance
    );
  });
}

function applyPageVerticalFlow(frame: FrameNode, plan: AdvancedRecipePlan): AdvancedRecipeTransformResult {
  if (frame.layoutMode !== 'NONE') {
    return {
      applied: false,
      reason: 'First P6 page-flow calibration only supports manual-layout Frames.',
      targetNodeId: frame.id,
    };
  }

  if (frame.children.some((child) => !child.visible)) {
    return {
      applied: false,
      reason: 'Hidden direct children are not supported by the first page-flow calibration recipe.',
      targetNodeId: frame.id,
    };
  }

  const beforeChildren = directGeometry(frame);
  const analysis = analyzeAdvancedPageFlowCalibration(plan, {
    width: frame.width,
    height: frame.height,
    children: frame.children.map((child) => ({
      id: child.id,
      x: child.x,
      y: child.y,
      width: child.width,
      height: child.height,
      visible: child.visible,
      absolutePositioned: 'layoutPositioning' in child && child.layoutPositioning === 'ABSOLUTE',
    })),
  });

  if (!analysis.ok) return { applied: false, reason: analysis.reason, targetNodeId: frame.id };

  const originalWidth = frame.width;
  const originalHeight = frame.height;
  const geometry = analysis.plan;

  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisSizingMode = 'FIXED';
  frame.counterAxisSizingMode = 'FIXED';
  frame.primaryAxisAlignItems = 'MIN';
  frame.counterAxisAlignItems = 'MIN';
  frame.itemSpacing = geometry.gap;
  frame.paddingTop = geometry.startPadding;
  frame.paddingBottom = geometry.endPadding;
  frame.paddingLeft = geometry.crossStartPadding;
  frame.paddingRight = geometry.crossEndPadding;
  frame.resize(originalWidth, originalHeight);

  if (!sameGeometry(beforeChildren, directGeometry(frame))) {
    return {
      applied: false,
      reason: 'Page vertical Auto Layout changed direct-child geometry; calibration candidate must be discarded.',
      targetNodeId: frame.id,
    };
  }

  return {
    applied: true,
    reason: 'Applied strict page vertical-flow Auto Layout to clone-only calibration candidate.',
    targetNodeId: frame.id,
  };
}

/**
 * P6 clone-calibration transformer. It is intentionally not connected to the production P4 commit
 * runtime. Unsupported or preservation-sensitive advanced recipes fail closed.
 */
export function applyAdvancedRecipeToCalibrationCandidate(
  candidateRoot: FrameNode,
  plan: AdvancedRecipePlan,
): AdvancedRecipeTransformResult {
  if (plan.decision !== 'CALIBRATE' || !plan.recipe) {
    return { applied: false, reason: `Advanced plan is ${plan.decision}; clone calibration mutation is not permitted.` };
  }

  const target = resolveFrameByPath(candidateRoot, plan.targetPath);
  if (!target) return { applied: false, reason: 'Calibration candidate target path no longer resolves to a Frame.' };

  if (plan.recipe === 'page-vertical-flow' && plan.pattern === 'page-vertical-flow') {
    return applyPageVerticalFlow(target, plan);
  }

  return {
    applied: false,
    reason: `${plan.recipe} does not yet have a calibrated P6 clone transformer.`,
    targetNodeId: target.id,
  };
}

/** Throws on refusal so the clone-only calibration harness performs guaranteed candidate cleanup. */
export function transformAdvancedCalibrationCandidate(
  candidateRoot: FrameNode,
  plan: AdvancedRecipePlan,
): void {
  const result = applyAdvancedRecipeToCalibrationCandidate(candidateRoot, plan);
  if (!result.applied) throw new Error(`Advanced calibration transform refused: ${result.reason}`);
}
