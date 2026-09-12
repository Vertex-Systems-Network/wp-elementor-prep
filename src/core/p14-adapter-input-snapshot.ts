import type {
  P14CandidateHandle,
  P14PreparationAction,
  P14PreparationPlanV1,
} from './p14-preparation-types';

/**
 * Adapter callbacks receive detached value copies so runtime adapter code cannot mutate the
 * transaction core's already-accepted candidate/plan/action state by reference.
 *
 * These helpers intentionally copy only the known P14 schemas. Their collection sizes are already
 * bounded by the transaction's accepted P14 input contract before adapter access; this is not a
 * generic recursive deep clone and it grants no new adapter or mutation authority.
 */
export function snapshotP14AdapterCandidate(
  candidate: P14CandidateHandle,
): P14CandidateHandle {
  return {
    sourceNodeId: candidate.sourceNodeId,
    candidateNodeId: candidate.candidateNodeId,
  };
}

export function snapshotP14AdapterAction(
  action: P14PreparationAction,
): P14PreparationAction {
  return {
    actionId: action.actionId,
    findingId: action.findingId,
    decision: action.decision,
    sourceRuleId: action.sourceRuleId,
    sourceRuleVersion: action.sourceRuleVersion,
    targetNodeIds: [...action.targetNodeIds],
    confidence: action.confidence,
    recipeId: action.recipeId,
    recipeVersion: action.recipeVersion,
    orderClass: action.orderClass,
    prerequisiteRecipeIds: [...action.prerequisiteRecipeIds],
    conflictsWithRecipeIds: [...action.conflictsWithRecipeIds],
    mutationAllowlist: [...action.mutationAllowlist],
    validationProfileId: action.validationProfileId,
    refusalCode: action.refusalCode,
  };
}

export function snapshotP14AdapterPlan(
  plan: P14PreparationPlanV1,
): P14PreparationPlanV1 {
  return {
    schemaVersion: plan.schemaVersion,
    engineVersion: plan.engineVersion,
    p13RunId: plan.p13RunId,
    source: {
      nodeId: plan.source.nodeId,
      fingerprint: plan.source.fingerprint,
    },
    status: plan.status,
    actions: plan.actions.map(snapshotP14AdapterAction),
    blockers: plan.blockers.map((blocker) => ({
      code: blocker.code,
      detail: blocker.detail,
      actionIds: [...blocker.actionIds],
    })),
    eligibleActionIds: [...plan.eligibleActionIds],
    noOpActionIds: [...plan.noOpActionIds],
    reviewActionIds: [...plan.reviewActionIds],
    refusedActionIds: [...plan.refusedActionIds],
    planDigest: plan.planDigest,
  };
}
