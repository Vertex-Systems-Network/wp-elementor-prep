import type { SafeRecipePlan } from '../core/safe-recipe-types';
import {
  analyzeLinearLayoutGeometry,
  type LinearLayoutDirection,
} from '../core/linear-layout-analysis';

export interface SafeRecipeTransformResult {
  applied: boolean;
  reason: string;
  targetNodeId?: string;
}

function resolveFrameByPath(root: FrameNode, path: number[]): FrameNode | null {
  let current: SceneNode = root;
  for (const index of path) {
    if (!('children' in current)) return null;
    const childNodes: readonly SceneNode[] = (current as SceneNode & ChildrenMixin).children as readonly SceneNode[];
    const child: SceneNode | undefined = childNodes[index];
    if (!child) return null;
    current = child;
  }
  return current.type === 'FRAME' ? current : null;
}

function applyLinearAutoLayout(frame: FrameNode, direction: LinearLayoutDirection): SafeRecipeTransformResult {
  const analysis = analyzeLinearLayoutGeometry(
    {
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
    },
    direction,
  );

  if (!analysis.ok) return { applied: false, reason: analysis.reason, targetNodeId: frame.id };

  const geometry = analysis.plan;

  // Figma can temporarily switch a manual Frame's primary axis to content-driven sizing when
  // layoutMode changes. Record the approved candidate bounds and restore them after configuring
  // fixed sizing/padding so P3 sees no root shrink.
  const originalWidth = frame.width;
  const originalHeight = frame.height;

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

  frame.resize(originalWidth, originalHeight);

  return {
    applied: true,
    reason: `Applied strict ${direction.toLowerCase()} Auto Layout to staged candidate.`,
    targetNodeId: frame.id,
  };
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
