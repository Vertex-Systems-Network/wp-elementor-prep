import { authorizeP14PreparationPlan } from '../core/p14-plan-authorization';
import type { P14PlanPreviewV1 } from './p14-plan-preview';

export const P14_INTERNAL_ACTIVATION_SCHEMA_VERSION = 1 as const;
export const P14_INTERNAL_ACTIVATION_VERSION = 1 as const;

export interface P14InternalActivationContext {
  fileKey: string;
  pageId: string;
  frameId: string;
}

export interface P14InternalActivationSessionV1 {
  schemaVersion: typeof P14_INTERNAL_ACTIVATION_SCHEMA_VERSION;
  activationVersion: typeof P14_INTERNAL_ACTIVATION_VERSION;
  internalOnly: true;
  requiresExplicitConfirmation: true;
  runtimeMutationEnabled: true;
  confirmationEnabled: true;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  context: P14InternalActivationContext;
  binding: {
    p13RunId: string;
    sourceNodeId: string;
    sourceFingerprint: string;
    planDigest: string;
    eligibleActionIds: string[];
  };
}

export interface P14InternalActivationAssessment {
  valid: boolean;
  failures: string[];
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function sameContext(left: P14InternalActivationContext, right: P14InternalActivationContext): boolean {
  return left.fileKey === right.fileKey
    && left.pageId === right.pageId
    && left.frameId === right.frameId;
}

function assertReadOnlyReviewSurface(preview: P14PlanPreviewV1): void {
  if (preview.acceptanceAuthority !== false
    || preview.targetCompatibilityClaim !== false
    || preview.mutationEnabled !== false
    || preview.confirmationEnabled !== false) {
    throw new Error('P14 internal activation requires a non-authorizing read-only review preview.');
  }
}

/**
 * Creates the plugin-side activation identity after an exact review preview has been rendered.
 *
 * This object is not a confirmation and is never accepted from the UI as authority. It pins the
 * exact reviewed context and plan identity so a later explicit user confirm intent can be checked
 * against a freshly rebuilt plan before the existing confirmation/transaction boundary is invoked.
 */
export function buildP14InternalActivationSession(
  preview: P14PlanPreviewV1,
  context: P14InternalActivationContext,
): P14InternalActivationSessionV1 {
  assertReadOnlyReviewSurface(preview);
  const plan = preview.plan;
  if (!plan || plan.status !== 'READY' || plan.eligibleActionIds.length === 0) {
    throw new Error('P14 internal activation requires a READY reviewed plan with eligible actions.');
  }
  const review = preview.reviewManifest;
  if (!review) {
    throw new Error('P14 internal activation requires the exact proposed-change review manifest.');
  }
  if (review.binding.p13RunId !== plan.p13RunId
    || review.binding.source.nodeId !== plan.source.nodeId
    || review.binding.source.fingerprint !== plan.source.fingerprint
    || review.binding.planDigest !== plan.planDigest
    || !sameStrings(review.binding.eligibleActionIds, plan.eligibleActionIds)) {
    throw new Error('P14 internal activation review binding does not match the reviewed plan.');
  }

  const authorization = authorizeP14PreparationPlan(plan);
  if (!authorization.authorized
    || !sameStrings(authorization.authorizedActionIds, plan.eligibleActionIds)) {
    throw new Error(
      `P14 internal activation plan is not authorized by the current production registry: ${authorization.failures.join(' | ')}`,
    );
  }

  return {
    schemaVersion: P14_INTERNAL_ACTIVATION_SCHEMA_VERSION,
    activationVersion: P14_INTERNAL_ACTIVATION_VERSION,
    internalOnly: true,
    requiresExplicitConfirmation: true,
    runtimeMutationEnabled: true,
    confirmationEnabled: true,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    context: { ...context },
    binding: {
      p13RunId: plan.p13RunId,
      sourceNodeId: plan.source.nodeId,
      sourceFingerprint: plan.source.fingerprint,
      planDigest: plan.planDigest,
      eligibleActionIds: [...plan.eligibleActionIds],
    },
  };
}

/**
 * Validates a previously reviewed plugin-side activation session against a freshly rebuilt preview.
 * Any context, source, plan, action or registry drift invalidates the session and requires review again.
 */
export function assessP14InternalActivationSession(
  reviewed: P14InternalActivationSessionV1,
  currentPreview: P14PlanPreviewV1,
  currentContext: P14InternalActivationContext,
): P14InternalActivationAssessment {
  const failures: string[] = [];

  if (reviewed.schemaVersion !== P14_INTERNAL_ACTIVATION_SCHEMA_VERSION
    || reviewed.activationVersion !== P14_INTERNAL_ACTIVATION_VERSION
    || reviewed.internalOnly !== true
    || reviewed.requiresExplicitConfirmation !== true
    || reviewed.runtimeMutationEnabled !== true
    || reviewed.confirmationEnabled !== true
    || reviewed.acceptanceAuthority !== false
    || reviewed.targetCompatibilityClaim !== false) {
    failures.push('P14 reviewed activation capability evidence is invalid.');
  }
  if (!sameContext(reviewed.context, currentContext)) {
    failures.push('P14 reviewed activation context changed after review.');
  }

  let expected: P14InternalActivationSessionV1 | null = null;
  try {
    expected = buildP14InternalActivationSession(currentPreview, currentContext);
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }

  if (expected) {
    if (reviewed.binding.p13RunId !== expected.binding.p13RunId) {
      failures.push('P14 reviewed activation P13 run changed after review.');
    }
    if (reviewed.binding.sourceNodeId !== expected.binding.sourceNodeId
      || reviewed.binding.sourceFingerprint !== expected.binding.sourceFingerprint) {
      failures.push('P14 reviewed activation source identity changed after review.');
    }
    if (reviewed.binding.planDigest !== expected.binding.planDigest) {
      failures.push('P14 reviewed activation plan digest changed after review.');
    }
    if (!sameStrings(reviewed.binding.eligibleActionIds, expected.binding.eligibleActionIds)) {
      failures.push('P14 reviewed activation eligible actions changed after review.');
    }
  }

  return { valid: failures.length === 0, failures };
}
