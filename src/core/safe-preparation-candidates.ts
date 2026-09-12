import { detectPatterns } from './classification';
import { detectSpecialRoles } from './roles';
import { planSafeRecipes } from './safe-recipe-planner';
import type {
  BuildReadyFinding,
  BuildReadyRuleDefinition,
} from './build-ready-types';
import type { AuditNode } from './types';

export const SAFE_PREPARATION_CANDIDATE_RULES: Record<string, BuildReadyRuleDefinition> = {
  BR_SAFE_VERTICAL_STACK_CANDIDATE: {
    id: 'BR_SAFE_VERTICAL_STACK_CANDIDATE',
    version: 1,
    category: 'STRUCTURE',
    severity: 'LOW',
    confidencePolicy: 'HIGH_ONLY',
    maxPenalty: 0,
    dedupeKeyStrategy: 'target-node',
    remediationClass: 'P14_SAFE_CANDIDATE',
  },
};

const VERTICAL_STACK_RULE = SAFE_PREPARATION_CANDIDATE_RULES.BR_SAFE_VERTICAL_STACK_CANDIDATE;

/**
 * Projects an already-accepted P5 vertical-stack plan into target-neutral P13 evidence.
 * No parallel eligibility logic lives here: classification, role preservation, absolute-child
 * refusal and the 90% confidence gate all remain owned by the existing P2/P5 planner pipeline.
 */
export function analyzeSafePreparationCandidates(root: AuditNode): BuildReadyFinding[] {
  const detections = detectPatterns(root);
  const roles = detectSpecialRoles(root);
  const plans = planSafeRecipes(root, detections, roles);

  return plans
    .filter((plan) => (
      plan.decision === 'ELIGIBLE'
      && plan.recipe === 'vertical-stack'
      && plan.pattern === 'vertical-stack'
    ))
    .map((plan) => ({
      id: `${VERTICAL_STACK_RULE.id}:${plan.targetNodeId}`,
      ruleId: VERTICAL_STACK_RULE.id,
      ruleVersion: VERTICAL_STACK_RULE.version,
      category: VERTICAL_STACK_RULE.category,
      relatedCategories: ['HANDOFF_READINESS'],
      severity: VERTICAL_STACK_RULE.severity,
      confidence: plan.confidence,
      title: 'High-confidence vertical stack is safe-preparation eligible',
      detail: 'The existing P5 planner accepts this target for candidate-only vertical-stack preparation. P13 records the opportunity without authorizing P14 mutation.',
      nodeIds: [plan.targetNodeId],
      evidence: {
        ...plan.evidence,
        p5Decision: plan.decision,
        p5ReasonCode: plan.reasonCode,
        recipe: plan.recipe,
        pattern: plan.pattern,
        minConfidence: plan.minConfidence ?? 90,
        targetNodeName: plan.targetNodeName,
        targetPath: plan.targetPath.join('.'),
      },
      penalty: 0,
      remediationClass: VERTICAL_STACK_RULE.remediationClass,
      targetAgnostic: true,
    }));
}
