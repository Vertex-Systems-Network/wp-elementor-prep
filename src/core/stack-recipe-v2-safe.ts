import type { SafeRecipePlan } from './safe-recipe-types';
import { STACK_RECIPE_V2_MIN_CONFIDENCE, surveyStackRecipesV2, type StackRecipeV2Plan } from './stack-recipe-v2';
import type { AuditNode } from './types';

/**
 * Recipes v2 in the P5 Safe Fix list (recovery M5.2). Adds one `stack-v2` plan per frame recipes v2 can convert that
 * no v1 plan already makes ELIGIBLE (v1 stays authoritative where it applies). The plan carries no mutation data:
 * the transformer re-plans on the staged candidate and refuses unless it reproduces the same layout, and the
 * candidate still passes the full P3 pixel validation before any commit.
 */
function pathTo(root: AuditNode, id: string, path: number[] = []): number[] | null {
  if (root.id === id) return path;
  for (let index = 0; index < root.children.length; index += 1) {
    const found = pathTo(root.children[index]!, id, [...path, index]);
    if (found) return found;
  }
  return null;
}

function findById(root: AuditNode, id: string): AuditNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
}

/** Stable digest of a v2 layout plan, carried in the Safe Fix evidence and re-checked on the candidate. */
export function stackRecipeV2Signature(plan: StackRecipeV2Plan): string {
  return JSON.stringify({ layout: plan.layout, children: plan.children, wrappers: plan.wrappers.map((wrapper) => ({ childIds: wrapper.childIds, layout: wrapper.layout })) });
}

export function stackRecipeV2SafePlans(root: AuditNode, v1Plans: readonly SafeRecipePlan[]): SafeRecipePlan[] {
  const covered = new Set(v1Plans.filter((plan) => plan.decision === 'ELIGIBLE').map((plan) => plan.targetNodeId));
  return surveyStackRecipesV2(root).eligible
    .filter((plan) => !covered.has(plan.targetNodeId))
    .flatMap((plan): SafeRecipePlan[] => {
      const path = pathTo(root, plan.targetNodeId);
      const target = findById(root, plan.targetNodeId);
      if (!path || !target) return [];
      return [{
        schemaVersion: 1,
        decision: 'ELIGIBLE',
        recipe: 'stack-v2',
        reasonCode: 'SUPPORTED_HIGH_CONFIDENCE',
        reason: `Recipes v2: ${plan.layout.direction.toLowerCase()} stack (${plan.layout.primaryAlign}, cross ${plan.layout.crossAlign}`
          + `${plan.wrappers.length ? `, ${plan.wrappers.length} nested sub-stack(s)` : ''}) proven by simulation; candidate-only, then full P3 validation.`,
        confidence: plan.confidence,
        minConfidence: STACK_RECIPE_V2_MIN_CONFIDENCE,
        pattern: plan.layout.direction === 'VERTICAL' ? 'vertical-stack' : 'horizontal-row',
        targetNodeId: plan.targetNodeId,
        targetNodeName: target.name,
        targetPath: path,
        evidence: {
          recipeVersion: plan.version,
          direction: plan.layout.direction,
          primaryAlign: plan.layout.primaryAlign,
          crossAlign: plan.layout.crossAlign,
          wrappers: plan.wrappers.length,
          fillChildren: plan.children.filter((child) => child.cross === 'FILL').length,
          maxDisplacementPx: plan.maxDisplacementPx,
          signature: stackRecipeV2Signature(plan),
        },
      }];
    });
}
