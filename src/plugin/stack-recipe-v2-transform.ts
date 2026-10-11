import { scanSceneNode } from '../core/scanner';
import { planStackRecipeV2, type StackLayoutPlan, type StackRecipeV2Plan } from '../core/stack-recipe-v2';
import { stackRecipeV2Signature } from '../core/stack-recipe-v2-safe';
import type { SafeRecipePlan } from '../core/safe-recipe-types';

/**
 * Apply a recipes v2 plan (recovery M5.2) to a staged candidate frame — never to the approved original.
 *
 * The plan is re-derived from the candidate's own geometry and must match the signature the user saw. Nested runs
 * get a transparent, non-clipping wrapper frame placed exactly over them (children keep their absolute positions).
 * After the mutation every original child must still sit within 0.5 px of where it was (absolute position and
 * size); otherwise the transform refuses and the transaction discards the candidate. The full P3 pixel validation
 * runs afterwards, before any commit.
 */
export interface StackRecipeV2TransformResult {
  applied: boolean;
  reason: string;
  targetNodeId?: string;
}

interface AbsoluteBox { id: string; x: number; y: number; width: number; height: number }

/** A node inside `root` by id (the manifest uses dynamic-page access, so the synchronous global lookup is unavailable). */
function findInside(root: SceneNode, id: string): SceneNode | null {
  if (root.id === id) return root;
  if (!('children' in root)) return null;
  for (const child of root.children) {
    const found = findInside(child, id);
    if (found) return found;
  }
  return null;
}

function absoluteBoxes(frame: FrameNode, ids: readonly string[]): AbsoluteBox[] {
  return ids.map((id) => {
    const node = findInside(frame, id);
    const box = node && 'absoluteBoundingBox' in node ? node.absoluteBoundingBox : null;
    return { id, x: box?.x ?? Number.NaN, y: box?.y ?? Number.NaN, width: node?.width ?? Number.NaN, height: node?.height ?? Number.NaN };
  });
}

function sameBoxes(before: AbsoluteBox[], after: AbsoluteBox[], tolerance = 0.5): boolean {
  return before.length === after.length && before.every((box, index) => {
    const next = after[index]!;
    return box.id === next.id && [box.x - next.x, box.y - next.y, box.width - next.width, box.height - next.height]
      .every((delta) => Number.isFinite(delta) && Math.abs(delta) <= tolerance);
  });
}

function applyLayout(frame: FrameNode, layout: StackLayoutPlan, width: number, height: number): void {
  frame.layoutMode = layout.direction;
  frame.primaryAxisSizingMode = 'FIXED';
  frame.counterAxisSizingMode = 'FIXED';
  frame.primaryAxisAlignItems = layout.primaryAlign;
  frame.counterAxisAlignItems = layout.crossAlign;
  frame.itemSpacing = layout.gap;
  frame.paddingTop = layout.paddingTop;
  frame.paddingRight = layout.paddingRight;
  frame.paddingBottom = layout.paddingBottom;
  frame.paddingLeft = layout.paddingLeft;
  frame.resize(width, height);
}

export function applyStackRecipeV2ToCandidate(target: FrameNode, safePlan: SafeRecipePlan): StackRecipeV2TransformResult {
  const decision = planStackRecipeV2(scanSceneNode(target));
  if (decision.decision !== 'ELIGIBLE') {
    return { applied: false, reason: `Recipes v2 no longer plans this candidate: ${decision.reason}`, targetNodeId: target.id };
  }
  const plan: StackRecipeV2Plan = decision.plan;
  if (stackRecipeV2Signature(plan) !== safePlan.evidence.signature) {
    return { applied: false, reason: 'The candidate re-plans to a different layout than the approved plan.', targetNodeId: target.id };
  }
  const childIds = target.children.map((child) => child.id);
  const before = absoluteBoxes(target, childIds);
  const width = target.width;
  const height = target.height;

  // 1. Wrappers for nested runs, placed exactly over their children (no visual change: transparent, not clipping).
  for (const wrapperPlan of plan.wrappers) {
    const first = target.children.findIndex((child) => child.id === wrapperPlan.childIds[0]);
    if (first < 0) return { applied: false, reason: 'A nested run no longer resolves on the candidate.', targetNodeId: target.id };
    const wrapper = figma.createFrame();
    wrapper.name = `${target.children[first]!.name} group`;
    wrapper.fills = [];
    wrapper.clipsContent = false;
    target.insertChild(first, wrapper);
    wrapper.x = wrapperPlan.x;
    wrapper.y = wrapperPlan.y;
    wrapper.resize(Math.max(0.01, wrapperPlan.width), Math.max(0.01, wrapperPlan.height));
    for (const id of wrapperPlan.childIds) {
      const child = target.children.find((node) => node.id === id);
      if (!child) return { applied: false, reason: 'A nested child no longer resolves on the candidate.', targetNodeId: target.id };
      const x = child.x - wrapperPlan.x;
      const y = child.y - wrapperPlan.y;
      wrapper.appendChild(child);
      child.x = x;
      child.y = y;
    }
    applyLayout(wrapper, wrapperPlan.layout, wrapperPlan.width, wrapperPlan.height);
  }

  // 2. The target's own Auto Layout, then per-child FILL (cross-axis stretch) and HUG (auto-resizing text).
  applyLayout(target, plan.layout, width, height);
  for (const childPlan of plan.children) {
    const node = findInside(target, childPlan.id);
    if (!node || !('layoutAlign' in node)) continue;
    if (childPlan.cross === 'FILL') node.layoutAlign = 'STRETCH';
    if (childPlan.primary === 'HUG' && node.type === 'TEXT') {
      if (plan.layout.direction === 'VERTICAL' && !plan.wrappers.some((w) => w.childIds.includes(node.id))) node.layoutSizingVertical = 'HUG';
      if (plan.layout.direction === 'HORIZONTAL' && !plan.wrappers.some((w) => w.childIds.includes(node.id))) node.layoutSizingHorizontal = 'HUG';
    }
  }

  if (!sameBoxes(before, absoluteBoxes(target, childIds))) {
    return { applied: false, reason: 'Recipes v2 moved a child on the candidate; it must be discarded before P3 commit.', targetNodeId: target.id };
  }
  return {
    applied: true,
    reason: `Applied recipes v2 ${plan.layout.direction.toLowerCase()} stack${plan.wrappers.length ? ` with ${plan.wrappers.length} nested sub-stack(s)` : ''} to the staged candidate.`,
    targetNodeId: target.id,
  };
}
