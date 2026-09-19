import { sha256Hex } from '../../core/sha256';
import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  serializeElementorAssetTargetProofEvidence,
  validateElementorAssetTargetProofEvidence,
  type ElementorAssetTargetProofEvidenceV1,
} from './asset-target-proof-evidence';
import { buildElementorReferenceReviewIdentity } from './reference-review-identity';
import type { ElementorTargetProfileV1 } from './target-profile';

export const ELEMENTOR_OBSERVED_ASSET_REFERENCE_EVIDENCE_VERSION =
  'elementor-observed-asset-reference-evidence-v1' as const;

export type ElementorObservedAssetReferenceEvidenceStatus =
  | 'OBSERVED_ASSET_EVIDENCE_BOUND'
  | 'REJECTED_PROOF'
  | 'REJECTED_REFERENCE_SCOPE';

export type ElementorObservedAssetReferenceEvidenceIssueCode =
  | 'P15_OBSERVED_ASSET_PROOF_INVALID'
  | 'P15_OBSERVED_ASSET_PROOF_NOT_FULL_PASS'
  | 'P15_OBSERVED_ASSET_REFERENCE_SCOPE_INVALID'
  | 'P15_OBSERVED_ASSET_REFERENCE_BINDING_INVALID'
  | 'P15_OBSERVED_ASSET_PROOF_SERIALIZATION_INVALID';

export interface ElementorObservedAssetReferenceEvidenceIssueV1 {
  code: ElementorObservedAssetReferenceEvidenceIssueCode;
  path: string;
  message: string;
}

export interface ElementorObservedAssetReferenceEvidenceV1 {
  schemaVersion: 1;
  evidenceVersion: typeof ELEMENTOR_OBSERVED_ASSET_REFERENCE_EVIDENCE_VERSION;
  status: 'OBSERVED_ASSET_EVIDENCE_BOUND';
  referenceReviewIdentityDigest: string;
  candidateIdentityDigest: string;
  targetProfileFingerprint: string;
  sourceProofSha256: string;
  sourceEvidenceReferenceSha256: string;
  proofClassification: 'ASSET_BOUND_FULL_PASS';
  observedAt: string;
  observedTarget: {
    wordpressVersion: string;
    elementorVersion: string;
    importSurface: 'TEMPLATE_LIBRARY_JSON';
  };
  sourceAssetUrlFingerprint: string;
  targetManagedMediaUrlFingerprint: string;
  renderedImageUrlFingerprint: string;
  evidenceAuthenticationStatus: 'OBSERVED_PROOF_VALIDATED';
  internalDecisionStatus: 'NOT_RUN';
  authenticationAuthority: false;
  acceptanceAuthority: false;
  referenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

export interface ElementorObservedAssetReferenceEvidenceAssessmentV1 {
  schemaVersion: 1;
  assessmentVersion: typeof ELEMENTOR_OBSERVED_ASSET_REFERENCE_EVIDENCE_VERSION;
  status: ElementorObservedAssetReferenceEvidenceStatus;
  proofValid: boolean;
  proofClassification:
    | 'ASSET_BOUND_FULL_PASS'
    | 'ASSET_BOUND_PARTIAL'
    | 'ASSET_BOUND_FAIL'
    | 'REJECTED';
  referenceScopeEligible: boolean;
  referenceBindingMatches: boolean;
  evidence: ElementorObservedAssetReferenceEvidenceV1 | null;
  issues: ElementorObservedAssetReferenceEvidenceIssueV1[];
  authenticationAuthority: false;
  acceptanceAuthority: false;
  referenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

function sha256(value: string): string {
  return `sha256:${sha256Hex(value)}`;
}

function assetOnlyScopeEligible(candidate: ElementorTemplateCandidateArtifactV1, profile: ElementorTargetProfileV1): {
  eligible: boolean;
  digest: string | null;
} {
  if (typeof candidate.templateJson !== 'string') return { eligible: false, digest: null };
  try {
    const identity = buildElementorReferenceReviewIdentity(JSON.parse(candidate.templateJson), profile);
    const eligible = identity.disposition === 'EXTERNAL_CLOSURE_REQUIRED'
      && identity.assetReferenceReviewStatus === 'EXTERNAL_ASSET_CLOSURE_REQUIRED'
      && identity.globalReferenceReviewStatus !== 'EXTERNAL_CLOSURE_REQUIRED'
      && identity.externalClosureRequired === true
      && identity.referenceClosureClaim === false;
    return { eligible, digest: identity.digest };
  } catch {
    return { eligible: false, digest: null };
  }
}

function baseAssessment(
  status: ElementorObservedAssetReferenceEvidenceStatus,
  proofValid: boolean,
  proofClassification: ElementorObservedAssetReferenceEvidenceAssessmentV1['proofClassification'],
  referenceScopeEligible: boolean,
  referenceBindingMatches: boolean,
  evidence: ElementorObservedAssetReferenceEvidenceV1 | null,
  issues: ElementorObservedAssetReferenceEvidenceIssueV1[],
): ElementorObservedAssetReferenceEvidenceAssessmentV1 {
  return {
    schemaVersion: 1,
    assessmentVersion: ELEMENTOR_OBSERVED_ASSET_REFERENCE_EVIDENCE_VERSION,
    status,
    proofValid,
    proofClassification,
    referenceScopeEligible,
    referenceBindingMatches,
    evidence,
    issues: issues.map((issue) => ({ ...issue })),
    authenticationAuthority: false,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

/**
 * Convert one exact observed asset target proof into sanitized asset-reference evidence.
 *
 * This bridge does not trust caller-reported PASS. It accepts only the existing exact-bound
 * ASSET_BOUND_FULL_PASS proof for an asset-only EXTERNAL_CLOSURE_REQUIRED identity.
 * The derived evidence is authenticated only as "this repository validated that observed proof";
 * it does not grant reference closure, target compatibility, production acceptance, generation,
 * download, arbitrary-host portability, or attachment-ID portability.
 */
export function assessElementorObservedAssetReferenceEvidence(
  proofValue: unknown,
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
): ElementorObservedAssetReferenceEvidenceAssessmentV1 {
  const proof = validateElementorAssetTargetProofEvidence(proofValue, candidate, profile);
  const scope = assetOnlyScopeEligible(candidate, profile);
  const issues: ElementorObservedAssetReferenceEvidenceIssueV1[] = [];

  if (!proof.valid) {
    issues.push({
      code: 'P15_OBSERVED_ASSET_PROOF_INVALID',
      path: '$.proof',
      message: 'Observed asset reference evidence requires one valid exact-bound asset target proof.',
    });
  } else if (proof.classification !== 'ASSET_BOUND_FULL_PASS') {
    issues.push({
      code: 'P15_OBSERVED_ASSET_PROOF_NOT_FULL_PASS',
      path: '$.proof',
      message: 'Observed asset reference evidence requires ASSET_BOUND_FULL_PASS exactly.',
    });
  }

  if (!scope.eligible || scope.digest === null) {
    issues.push({
      code: 'P15_OBSERVED_ASSET_REFERENCE_SCOPE_INVALID',
      path: '$.referenceScope',
      message: 'Observed asset evidence bridge currently accepts asset-only EXTERNAL_CLOSURE_REQUIRED identities.',
    });
  }

  const referenceBindingMatches = proof.valid
    && scope.digest !== null
    && proof.referenceReviewBindingMatches
    && proof.referenceReviewIdentityDigest === scope.digest;

  if (proof.valid && scope.eligible && !referenceBindingMatches) {
    issues.push({
      code: 'P15_OBSERVED_ASSET_REFERENCE_BINDING_INVALID',
      path: '$.proof.referenceReviewIdentity',
      message: 'Observed asset proof is not bound to the exact current asset-only reference-review identity.',
    });
  }

  if (issues.length > 0
    || !proof.valid
    || proof.classification !== 'ASSET_BOUND_FULL_PASS'
    || !scope.eligible
    || !referenceBindingMatches
    || proof.candidateIdentity === null
    || proof.targetProfileFingerprint === null
    || proof.observedTarget === null
    || proof.steps === null
    || proof.steps.sourceAssetUrlFingerprint === null
    || proof.steps.targetManagedMediaUrlFingerprint === null
    || proof.steps.renderedImageUrlFingerprint === null) {
    return baseAssessment(
      proof.valid && !scope.eligible ? 'REJECTED_REFERENCE_SCOPE' : 'REJECTED_PROOF',
      proof.valid,
      proof.classification,
      scope.eligible,
      referenceBindingMatches,
      null,
      issues,
    );
  }

  const referenceReviewIdentityDigest = scope.digest;
  if (referenceReviewIdentityDigest === null) {
    return baseAssessment(
      'REJECTED_REFERENCE_SCOPE',
      proof.valid,
      proof.classification,
      false,
      false,
      null,
      [{
        code: 'P15_OBSERVED_ASSET_REFERENCE_SCOPE_INVALID',
        path: '$.referenceScope',
        message: 'Observed asset evidence bridge requires an exact current reference-review digest.',
      }],
    );
  }

  let serializedProof: string;
  try {
    serializedProof = serializeElementorAssetTargetProofEvidence(
      proofValue as ElementorAssetTargetProofEvidenceV1,
      candidate,
      profile,
    );
  } catch {
    return baseAssessment(
      'REJECTED_PROOF',
      proof.valid,
      proof.classification,
      scope.eligible,
      referenceBindingMatches,
      null,
      [{
        code: 'P15_OBSERVED_ASSET_PROOF_SERIALIZATION_INVALID',
        path: '$.proof',
        message: 'Observed asset proof could not be canonicalized for evidence binding.',
      }],
    );
  }

  const typedProof = proofValue as ElementorAssetTargetProofEvidenceV1;
  const evidence: ElementorObservedAssetReferenceEvidenceV1 = {
    schemaVersion: 1,
    evidenceVersion: ELEMENTOR_OBSERVED_ASSET_REFERENCE_EVIDENCE_VERSION,
    status: 'OBSERVED_ASSET_EVIDENCE_BOUND',
    referenceReviewIdentityDigest,
    candidateIdentityDigest: proof.candidateIdentity.digest,
    targetProfileFingerprint: proof.targetProfileFingerprint,
    sourceProofSha256: sha256(serializedProof),
    sourceEvidenceReferenceSha256: sha256(typedProof.evidenceReference),
    proofClassification: 'ASSET_BOUND_FULL_PASS',
    observedAt: typedProof.observedAt,
    observedTarget: {
      wordpressVersion: proof.observedTarget.wordpressVersion,
      elementorVersion: proof.observedTarget.elementorVersion,
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    sourceAssetUrlFingerprint: proof.steps.sourceAssetUrlFingerprint,
    targetManagedMediaUrlFingerprint: proof.steps.targetManagedMediaUrlFingerprint,
    renderedImageUrlFingerprint: proof.steps.renderedImageUrlFingerprint,
    evidenceAuthenticationStatus: 'OBSERVED_PROOF_VALIDATED',
    internalDecisionStatus: 'NOT_RUN',
    authenticationAuthority: false,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };

  return baseAssessment(
    'OBSERVED_ASSET_EVIDENCE_BOUND',
    true,
    'ASSET_BOUND_FULL_PASS',
    true,
    true,
    evidence,
    [],
  );
}

export function serializeElementorObservedAssetReferenceEvidence(
  proofValue: unknown,
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
): string {
  const assessment = assessElementorObservedAssetReferenceEvidence(proofValue, candidate, profile);
  if (assessment.status !== 'OBSERVED_ASSET_EVIDENCE_BOUND' || assessment.evidence === null) {
    const first = assessment.issues[0];
    throw new Error(first
      ? `Invalid observed Elementor asset-reference evidence: ${first.code} at ${first.path}`
      : 'Invalid observed Elementor asset-reference evidence.');
  }
  return `${JSON.stringify(assessment.evidence, null, 2)}\n`;
}
