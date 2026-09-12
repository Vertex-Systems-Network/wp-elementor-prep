import { DEFAULT_P14_INPUT_BOUNDS } from '../core/p14-input-bounds';
import { validateP14PreparationPlan } from '../core/p14-plan-integrity';
import type {
  P14MutationField,
  P14PreparationPlanV1,
} from '../core/p14-preparation-types';
import { snapshotP14SemanticInputEvidence } from '../core/p14-semantic-input-snapshot';

export const P14_PROPOSED_CHANGE_REVIEW_SCHEMA_VERSION = 1 as const;
export const P14_PROPOSED_CHANGE_REVIEW_VERSION = 1 as const;

export interface P14ProposedChangeReviewActionV1 {
  actionId: string;
  sourceRuleId: string;
  sourceRuleVersion: number;
  recipeId: string;
  recipeVersion: number;
  confidence: number;
  targetNodeIds: string[];
  prerequisiteRecipeIds: string[];
  mutationAllowlist: P14MutationField[];
  validationProfileId: string;
}

export interface P14ProposedChangeReviewManifestV1 {
  schemaVersion: typeof P14_PROPOSED_CHANGE_REVIEW_SCHEMA_VERSION;
  reviewVersion: typeof P14_PROPOSED_CHANGE_REVIEW_VERSION;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  mutationEnabled: false;
  confirmationEnabled: false;
  binding: {
    p13RunId: string;
    source: {
      nodeId: string;
      fingerprint: string;
    };
    planDigest: string;
    eligibleActionIds: string[];
  };
  actions: P14ProposedChangeReviewActionV1[];
}

/**
 * Creates a detached, human-review-oriented representation of the exact mutating action binding.
 * The caller-owned plan is snapshotted through the established bounded P14 semantic evidence
 * boundary before validation or reuse. This deliberately does not create confirmation evidence
 * and cannot authorize mutation.
 */
export function buildP14ProposedChangeReviewManifest(
  plan: P14PreparationPlanV1 | null,
): P14ProposedChangeReviewManifestV1 | null {
  if (!plan) return null;

  const snapshot = snapshotP14SemanticInputEvidence(plan, undefined, DEFAULT_P14_INPUT_BOUNDS);
  if (!snapshot.valid) return null;

  const reviewedPlan = snapshot.plan as P14PreparationPlanV1;
  const integrity = validateP14PreparationPlan(reviewedPlan);
  if (!integrity.valid) return null;

  const actionsById = new Map(reviewedPlan.actions.map((action) => [action.actionId, action]));
  const actions: P14ProposedChangeReviewActionV1[] = [];

  for (const actionId of reviewedPlan.eligibleActionIds) {
    const action = actionsById.get(actionId);
    if (!action
      || action.decision !== 'ELIGIBLE'
      || typeof action.recipeId !== 'string'
      || typeof action.recipeVersion !== 'number'
      || typeof action.validationProfileId !== 'string') {
      return null;
    }
    actions.push({
      actionId: action.actionId,
      sourceRuleId: action.sourceRuleId,
      sourceRuleVersion: action.sourceRuleVersion,
      recipeId: action.recipeId,
      recipeVersion: action.recipeVersion,
      confidence: action.confidence,
      targetNodeIds: [...action.targetNodeIds],
      prerequisiteRecipeIds: [...action.prerequisiteRecipeIds],
      mutationAllowlist: [...action.mutationAllowlist],
      validationProfileId: action.validationProfileId,
    });
  }

  return {
    schemaVersion: P14_PROPOSED_CHANGE_REVIEW_SCHEMA_VERSION,
    reviewVersion: P14_PROPOSED_CHANGE_REVIEW_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    mutationEnabled: false,
    confirmationEnabled: false,
    binding: {
      p13RunId: reviewedPlan.p13RunId,
      source: {
        nodeId: reviewedPlan.source.nodeId,
        fingerprint: reviewedPlan.source.fingerprint,
      },
      planDigest: reviewedPlan.planDigest,
      eligibleActionIds: [...reviewedPlan.eligibleActionIds],
    },
    actions,
  };
}
