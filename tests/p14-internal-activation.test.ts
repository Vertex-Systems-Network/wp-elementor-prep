import { describe, expect, it } from 'vitest';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { createP14VerticalStackProductionRecipe } from '../src/core/p14-vertical-stack-qualification';
import { buildP14ProposedChangeReviewManifest } from '../src/plugin/p14-proposed-change-review';
import type { P14PlanPreviewV1 } from '../src/plugin/p14-plan-preview';
import {
  assessP14InternalActivationSession,
  buildP14InternalActivationSession,
} from '../src/plugin/p14-internal-activation';

const recipe = createP14VerticalStackProductionRecipe();
const context = { fileKey: 'file:r6', pageId: 'page:r6', frameId: 'frame:r6' };

function readyPreview(): P14PlanPreviewV1 {
  const plan = buildP14PreparationPlan({
    p13RunId: 'p13-r6-review',
    sourceNodeId: 'frame:r6',
    sourceFingerprint: 'r6-source-fingerprint',
    findings: [{
      findingId: 'r6-finding',
      sourceRuleId: 'BR_SAFE_VERTICAL_STACK_CANDIDATE',
      sourceRuleVersion: 1,
      targetNodeIds: ['r6-target'],
      targetAddresses: [{
        schemaVersion: 1,
        sourceRootNodeId: 'frame:r6',
        sourceRootFingerprint: 'r6-source-fingerprint',
        sourceRootCloneStableFingerprint: 'p14-clone-root',
        sourceTargetNodeId: 'r6-target',
        sourceTargetCloneStableFingerprint: 'p14-clone-target',
        childIndexPath: [0],
      }],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
  return {
    schemaVersion: 1,
    previewVersion: 1,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    mutationEnabled: false,
    confirmationEnabled: false,
    handoff: {
      valid: true,
      failures: [],
      p13RunId: plan.p13RunId,
      source: { ...plan.source },
      acceptedCandidateCount: 1,
      reviewOnlyCount: 0,
      registryValid: true,
    },
    summary: {
      status: plan.status,
      totalActions: plan.actions.length,
      eligible: plan.eligibleActionIds.length,
      noOp: 0,
      review: 0,
      refused: 0,
      blockers: plan.blockers.length,
    },
    reviewManifest: buildP14ProposedChangeReviewManifest(plan),
    plan,
  };
}

describe('P14 reviewed internal activation session', () => {
  it('pins exact reviewed context and plan identity without acceptance authority', () => {
    const session = buildP14InternalActivationSession(readyPreview(), context);

    expect(session).toMatchObject({
      schemaVersion: 1,
      activationVersion: 1,
      internalOnly: true,
      requiresExplicitConfirmation: true,
      runtimeMutationEnabled: true,
      confirmationEnabled: true,
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
      context,
    });
    expect(session.binding.eligibleActionIds).toHaveLength(1);
  });

  it('accepts only the same freshly rebuilt review identity', () => {
    const preview = readyPreview();
    const session = buildP14InternalActivationSession(preview, context);

    expect(assessP14InternalActivationSession(session, readyPreview(), context)).toEqual({
      valid: true,
      failures: [],
    });
  });

  it('fails closed when context or reviewed digest drifts', () => {
    const preview = readyPreview();
    const session = buildP14InternalActivationSession(preview, context);

    expect(assessP14InternalActivationSession(session, readyPreview(), {
      ...context,
      frameId: 'frame:other',
    }).valid).toBe(false);

    const changed = readyPreview();
    if (!changed.plan) throw new Error('Expected READY plan.');
    changed.plan.planDigest = 'p14-plan-forged';
    expect(assessP14InternalActivationSession(session, changed, context).valid).toBe(false);
  });

  it('refuses a review-only or capability-forged preview', () => {
    const blocked = readyPreview();
    if (!blocked.plan) throw new Error('Expected plan.');
    blocked.plan.status = 'BLOCKED';
    expect(() => buildP14InternalActivationSession(blocked, context)).toThrow(/READY reviewed plan/);

    const forged = readyPreview() as P14PlanPreviewV1 & { mutationEnabled: boolean };
    forged.mutationEnabled = true;
    expect(() => buildP14InternalActivationSession(forged, context)).toThrow(/non-authorizing read-only review preview/);
  });
});
