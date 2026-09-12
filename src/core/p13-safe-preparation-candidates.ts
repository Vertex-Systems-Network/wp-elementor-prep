import { detectPatterns } from './classification';
import { detectSpecialRoles } from './roles';
import { planSafeRecipes } from './safe-recipe-planner';
import type {
  BuildReadyFinding,
  BuildReadyRuleDefinition,
} from './build-ready-types';
import type { AuditNode } from './types';

export const P13_SAFE_PREPARATION_RULES: Record<string, BuildReadyRuleDefinition> = {
  BR_SAFE_PREP_VERTICAL_STACK: {
    id: 'BR_SAFE_PREP_VERTICAL_STACK',
    version: 1,
    category: 'HANDOFF_READINESS',
    severity: 'LOW',
    confidencePolicy: 'HIGH_ONLY',
    maxPenalty: 0,
    dedupeKeyStrategy: 'target-node-id',
    remediationClass: 'P14_SAFE_CANDIDATE',
  },
};

/**
 * Reuses the already accepted P2/P5 classifier + Safe Fix planner as read-only evidence for P13.
 *
 * This first bridge is intentionally narrow: only an existing P5 `ELIGIBLE` vertical-stack plan
 * becomes a P14 safe-preparation candidate. The finding is score-neutral and does not itself grant
 * P14 recipe authorization or mutation authority.
 */
export function analyzeP13SafePreparationCandidates(root: AuditNode): BuildReadyFinding[] {
  const detections = detectPatterns(root);
  const roles = detectSpecialRoles(root);
  const plans = planSafeRecipes(root, detections, roles);
  const rule = P13_SAFE_PREPARATION_RULES.BR_SAFE_PREP_VERTICAL_STACK;
  if (!rule) return [];

  const byTarget = new Map<string, BuildReadyFinding>();
  for (const plan of plans) {
    if (plan.decision !== 'ELIGIBLE' || plan.recipe !== 'vertical-stack') continue;

    const evidence: Record<string, string | number | boolean> = {
      safeRecipe: plan.recipe,
      safeReasonCode: plan.reasonCode,
      pattern: plan.pattern,
      minConfidence: plan.minConfidence ?? 90,
      targetPath: plan.targetPath.join('.'),
    };
    if (plan.semanticHint) evidence.semanticHint = plan.semanticHint;

    byTarget.set(plan.targetNodeId, {
      id: `${rule.id}:${plan.targetNodeId}`,
      ruleId: rule.id,
      ruleVersion: rule.version,
      category: rule.category,
      relatedCategories: ['STRUCTURE'],
      severity: rule.severity,
      confidence: plan.confidence,
      title: 'High-confidence vertical stack can enter safe preparation review',
      detail: 'The accepted P5 Safe Fix planner classified this exact target as an eligible vertical-stack candidate. P13 records the opportunity without mutating the source; P14 still requires an explicit production recipe binding before execution.',
      nodeIds: [plan.targetNodeId],
      evidence,
      penalty: 0,
      remediationClass: 'P14_SAFE_CANDIDATE',
      targetAgnostic: true,
    });
  }

  return [...byTarget.values()].sort((a, b) => a.nodeIds[0]!.localeCompare(b.nodeIds[0]!));
}
