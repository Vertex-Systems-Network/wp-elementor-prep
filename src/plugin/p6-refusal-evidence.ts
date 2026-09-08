import {
  P5_RUNTIME_GATE_VERSION,
  type P5RuntimeBuildIdentity,
} from '../core/p5-runtime-gate';
import type { AdvancedRecipePlan } from '../core/advanced-recipe-types';
import type { P6DeveloperCalibrationOutcome } from './p6-developer-calibration';

export const P6_REFUSAL_EVIDENCE_SCHEMA_VERSION = 2 as const;
export const P6_REFUSAL_EVIDENCE_MAX_PLANS = 25 as const;

export interface P6RefusalPlanSummary {
  decision: AdvancedRecipePlan['decision'];
  recipe: AdvancedRecipePlan['recipe'];
  reasonCode: AdvancedRecipePlan['reasonCode'];
  reason: string;
  pattern: AdvancedRecipePlan['pattern'];
  confidence: number;
  targetNodeId: string;
  targetNodeName: string;
  targetPath: number[];
  preserveNodeIds: string[];
  mutationEnabled: false;
  futureMutationRequiresFullP3: true;
  futureMutationRequiresP4Rollback: true;
}

export interface P6PreservationRefusalEvidenceBundle {
  schemaVersion: typeof P6_REFUSAL_EVIDENCE_SCHEMA_VERSION;
  capturedAt: string;
  pluginVersion: string;
  build: P5RuntimeBuildIdentity;
  p5RuntimeGateVersion: string;
  p5RuntimeProofPassedAt: string | null;
  frame: { id: string; name: string };
  outcomeStatus: P6DeveloperCalibrationOutcome['status'];
  reason: string | null;
  totalPlanCount: number;
  plansTruncated: boolean;
  plans: P6RefusalPlanSummary[];
}

function summarizePlan(plan: AdvancedRecipePlan): P6RefusalPlanSummary {
  return {
    decision: plan.decision,
    recipe: plan.recipe,
    reasonCode: plan.reasonCode,
    reason: plan.reason,
    pattern: plan.pattern,
    confidence: plan.confidence,
    targetNodeId: plan.targetNodeId,
    targetNodeName: plan.targetNodeName,
    targetPath: [...plan.targetPath],
    preserveNodeIds: [...plan.preserveNodeIds],
    mutationEnabled: false,
    futureMutationRequiresFullP3: true,
    futureMutationRequiresP4Rollback: true,
  };
}

/**
 * Captures a bounded, serializable NO_CANDIDATE plan set from the real imported P6 developer flow.
 * The bundle deliberately excludes AuditNode trees, PNG bytes and candidate objects. It is intended
 * to prove that preservation-sensitive pages were refused rather than silently normalized.
 */
export function buildP6PreservationRefusalEvidenceBundle(input: {
  pluginVersion: string;
  build: P5RuntimeBuildIdentity;
  p5RuntimeProofPassedAt: string | null;
  frame: Pick<FrameNode, 'id' | 'name'>;
  outcome: P6DeveloperCalibrationOutcome;
  capturedAt?: string;
  maxPlans?: number;
}): P6PreservationRefusalEvidenceBundle {
  const plans = input.outcome.status === 'NO_CANDIDATE' ? input.outcome.plans : [];
  const maxPlans = Math.max(1, Math.floor(input.maxPlans ?? P6_REFUSAL_EVIDENCE_MAX_PLANS));
  const boundedPlans = plans.slice(0, maxPlans).map(summarizePlan);

  return {
    schemaVersion: P6_REFUSAL_EVIDENCE_SCHEMA_VERSION,
    capturedAt: input.capturedAt ?? new Date().toISOString(),
    pluginVersion: input.pluginVersion,
    build: { ...input.build },
    p5RuntimeGateVersion: P5_RUNTIME_GATE_VERSION,
    p5RuntimeProofPassedAt: input.p5RuntimeProofPassedAt,
    frame: { id: input.frame.id, name: input.frame.name },
    outcomeStatus: input.outcome.status,
    reason: input.outcome.status === 'COMPLETED' ? null : input.outcome.reason,
    totalPlanCount: plans.length,
    plansTruncated: plans.length > boundedPlans.length,
    plans: boundedPlans,
  };
}
