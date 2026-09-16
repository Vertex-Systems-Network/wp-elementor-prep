import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  validateElementorTargetEnvironmentEvidence,
  type ElementorTargetEnvironmentEvidenceV1,
  type ElementorTargetEnvironmentFailureCode,
  type ElementorTargetEnvironmentReviewCode,
} from './target-environment-evidence';
import type { ElementorTargetProfileV1 } from './target-profile';
import {
  validateElementorTargetProofEvidence,
  type ElementorTargetProofEvidenceV1,
  type ElementorTargetProofIssue,
  type ElementorTargetProofReviewCode,
} from './target-proof-evidence';

export const ELEMENTOR_TARGET_PROOF_CHAIN_VERSION = 'elementor-target-proof-chain-v1' as const;

export type ElementorTargetProofChainClassification =
  | 'CHAIN_FULL_PASS'
  | 'CHAIN_PARTIAL'
  | 'CHAIN_FAIL'
  | 'CHAIN_BLOCKED'
  | 'REJECTED';

export type ElementorTargetProofChainIssueCode =
  | 'P15_TARGET_PROOF_CHAIN_ENVIRONMENT_INVALID'
  | 'P15_TARGET_PROOF_CHAIN_PROOF_INVALID'
  | 'P15_TARGET_PROOF_CHAIN_RUNTIME_MISMATCH'
  | 'P15_TARGET_PROOF_CHAIN_EVIDENCE_REFERENCE_MISMATCH'
  | 'P15_TARGET_PROOF_CHAIN_CHRONOLOGY_INVALID';

export interface ElementorTargetProofChainIssue {
  code: ElementorTargetProofChainIssueCode;
  path: string;
  message: string;
}

export interface ElementorTargetProofChainValidationResult {
  chainVersion: typeof ELEMENTOR_TARGET_PROOF_CHAIN_VERSION;
  valid: boolean;
  classification: ElementorTargetProofChainClassification;
  environmentClassification: ReturnType<typeof validateElementorTargetEnvironmentEvidence>['classification'];
  proofClassification: ReturnType<typeof validateElementorTargetProofEvidence>['classification'];
  environmentQualified: boolean;
  runtimeBindingMatches: boolean;
  evidenceReferenceMatches: boolean;
  chronologyValid: boolean;
  candidateBindingMatches: boolean;
  profileBindingMatches: boolean;
  candidateIdentity: ReturnType<typeof validateElementorTargetProofEvidence>['candidateIdentity'];
  targetProfileFingerprint: string | null;
  observedTarget: ReturnType<typeof validateElementorTargetProofEvidence>['observedTarget'];
  steps: ReturnType<typeof validateElementorTargetProofEvidence>['steps'];
  environmentFailures: ElementorTargetEnvironmentFailureCode[];
  environmentReviewCodes: ElementorTargetEnvironmentReviewCode[];
  proofReviewCodes: ElementorTargetProofReviewCode[];
  chainIssues: ElementorTargetProofChainIssue[];
  proofIssues: ElementorTargetProofIssue[];
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  internalReviewRequired: true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function classify(
  valid: boolean,
  environmentQualified: boolean,
  proofClassification: ReturnType<typeof validateElementorTargetProofEvidence>['classification'],
): ElementorTargetProofChainClassification {
  if (!valid) return 'REJECTED';
  if (!environmentQualified) return 'CHAIN_BLOCKED';
  if (proofClassification === 'BOUND_FULL_PASS') return 'CHAIN_FULL_PASS';
  if (proofClassification === 'BOUND_PARTIAL') return 'CHAIN_PARTIAL';
  if (proofClassification === 'BOUND_FAIL') return 'CHAIN_FAIL';
  return 'REJECTED';
}

/**
 * Bind one already-observed target environment to one already-observed Elementor proof.
 *
 * This is a deterministic evidence-chain gate only. It does not observe WordPress/Elementor,
 * authorize compatibility, or promote a proof to production acceptance.
 */
export function validateElementorTargetProofChain(input: {
  candidate: ElementorTemplateCandidateArtifactV1;
  profile: ElementorTargetProfileV1;
  environment: unknown;
  proof: unknown;
}): ElementorTargetProofChainValidationResult {
  const chainIssues: ElementorTargetProofChainIssue[] = [];
  const environmentValidation = validateElementorTargetEnvironmentEvidence(input.environment);
  const proofValidation = validateElementorTargetProofEvidence(
    input.proof,
    input.candidate,
    input.profile,
  );

  if (!environmentValidation.valid || !environmentValidation.environment) {
    chainIssues.push({
      code: 'P15_TARGET_PROOF_CHAIN_ENVIRONMENT_INVALID',
      path: '$environment',
      message: 'Proof chain requires structurally valid observed target-environment evidence.',
    });
  }
  if (!proofValidation.valid) {
    chainIssues.push({
      code: 'P15_TARGET_PROOF_CHAIN_PROOF_INVALID',
      path: '$proof',
      message: 'Proof chain requires a structurally valid exact-bound Elementor target proof.',
    });
  }

  let runtimeBindingMatches = false;
  let evidenceReferenceMatches = false;
  let chronologyValid = false;

  if (environmentValidation.valid
    && environmentValidation.environment
    && proofValidation.valid
    && proofValidation.observedTarget
    && isRecord(input.proof)) {
    const environment = environmentValidation.environment;
    const observedTarget = proofValidation.observedTarget;

    runtimeBindingMatches = observedTarget.wordpressVersion === environment.wordpressVersion
      && observedTarget.elementorVersion === environment.elementorVersion;
    if (!runtimeBindingMatches) {
      chainIssues.push({
        code: 'P15_TARGET_PROOF_CHAIN_RUNTIME_MISMATCH',
        path: '$proof.observedTarget',
        message: 'Proof WordPress/Elementor identity does not match the qualified environment evidence.',
      });
    }

    evidenceReferenceMatches = typeof input.proof.evidenceReference === 'string'
      && input.proof.evidenceReference === environment.evidenceReference;
    if (!evidenceReferenceMatches) {
      chainIssues.push({
        code: 'P15_TARGET_PROOF_CHAIN_EVIDENCE_REFERENCE_MISMATCH',
        path: '$proof.evidenceReference',
        message: 'Environment and proof must reference the same retained operator evidence bundle/run.',
      });
    }

    const proofObservedAt = typeof input.proof.observedAt === 'string'
      ? Date.parse(input.proof.observedAt)
      : Number.NaN;
    const environmentObservedAt = Date.parse(environment.observedAt);
    chronologyValid = Number.isFinite(proofObservedAt)
      && Number.isFinite(environmentObservedAt)
      && proofObservedAt >= environmentObservedAt;
    if (!chronologyValid) {
      chainIssues.push({
        code: 'P15_TARGET_PROOF_CHAIN_CHRONOLOGY_INVALID',
        path: '$proof.observedAt',
        message: 'Target proof observation cannot precede the environment observation it is bound to.',
      });
    }
  }

  const valid = chainIssues.length === 0;
  const environmentQualified = environmentValidation.valid
    && environmentValidation.classification === 'QUALIFIED_FOR_BOUND_TARGET_PROOF';

  return {
    chainVersion: ELEMENTOR_TARGET_PROOF_CHAIN_VERSION,
    valid,
    classification: classify(valid, environmentQualified, proofValidation.classification),
    environmentClassification: environmentValidation.classification,
    proofClassification: proofValidation.classification,
    environmentQualified,
    runtimeBindingMatches,
    evidenceReferenceMatches,
    chronologyValid,
    candidateBindingMatches: proofValidation.candidateBindingMatches,
    profileBindingMatches: proofValidation.profileBindingMatches,
    candidateIdentity: proofValidation.candidateIdentity,
    targetProfileFingerprint: proofValidation.targetProfileFingerprint,
    observedTarget: proofValidation.observedTarget,
    steps: proofValidation.steps,
    environmentFailures: [...environmentValidation.failures],
    environmentReviewCodes: [...environmentValidation.reviewCodes],
    proofReviewCodes: [...proofValidation.reviewCodes],
    chainIssues,
    proofIssues: proofValidation.issues.map((issue) => ({ ...issue })),
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };
}

export type { ElementorTargetEnvironmentEvidenceV1, ElementorTargetProofEvidenceV1 };
