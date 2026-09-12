import { buildP14PreparationPlanFromBuildReady } from '../core/p13-p14-handoff';
import type { P14PlanDecision, P14PreparationPlanV1 } from '../core/p14-preparation-types';

export const P14_PLAN_PREVIEW_SCHEMA_VERSION = 1 as const;
export const P14_PLAN_PREVIEW_VERSION = 1 as const;

export interface P14PlanPreviewSummaryV1 {
  status: P14PreparationPlanV1['status'] | 'INVALID_HANDOFF';
  totalActions: number;
  eligible: number;
  noOp: number;
  review: number;
  refused: number;
  blockers: number;
}

export interface P14PlanPreviewV1 {
  schemaVersion: typeof P14_PLAN_PREVIEW_SCHEMA_VERSION;
  previewVersion: typeof P14_PLAN_PREVIEW_VERSION;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  mutationEnabled: false;
  confirmationEnabled: false;
  handoff: {
    valid: boolean;
    failures: string[];
    p13RunId: string | null;
    source: { nodeId: string; fingerprint: string } | null;
    acceptedCandidateCount: number;
    reviewOnlyCount: number;
    registryValid: boolean;
  };
  summary: P14PlanPreviewSummaryV1;
  plan: P14PreparationPlanV1 | null;
}

const DECISIONS: readonly P14PlanDecision[] = ['ELIGIBLE', 'NOOP', 'REVIEW', 'REFUSED'];

function decisionCount(plan: P14PreparationPlanV1, decision: P14PlanDecision): number {
  return plan.actions.reduce((count, action) => count + (action.decision === decision ? 1 : 0), 0);
}

/**
 * Builds a target-neutral, read-only P14 preview from current P13 Build-Ready evidence.
 * This surface deliberately cannot create confirmation evidence or authorize mutation.
 */
export function buildP14PlanPreview(reportValue: unknown): P14PlanPreviewV1 {
  const result = buildP14PreparationPlanFromBuildReady(reportValue);
  const plan = result.plan;
  const summary: P14PlanPreviewSummaryV1 = plan
    ? {
        status: plan.status,
        totalActions: plan.actions.length,
        eligible: decisionCount(plan, DECISIONS[0]),
        noOp: decisionCount(plan, DECISIONS[1]),
        review: decisionCount(plan, DECISIONS[2]),
        refused: decisionCount(plan, DECISIONS[3]),
        blockers: plan.blockers.length,
      }
    : {
        status: 'INVALID_HANDOFF',
        totalActions: 0,
        eligible: 0,
        noOp: 0,
        review: 0,
        refused: 0,
        blockers: 0,
      };

  return {
    schemaVersion: P14_PLAN_PREVIEW_SCHEMA_VERSION,
    previewVersion: P14_PLAN_PREVIEW_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    mutationEnabled: false,
    confirmationEnabled: false,
    handoff: {
      valid: result.handoff.valid,
      failures: [...result.handoff.failures],
      p13RunId: result.handoff.p13RunId,
      source: result.handoff.source ? { ...result.handoff.source } : null,
      acceptedCandidateCount: result.handoff.acceptedCandidateCount,
      reviewOnlyCount: result.handoff.reviewOnlyCount,
      registryValid: result.handoff.registryValid,
    },
    summary,
    plan,
  };
}
