import { sha256Hex } from '../../core/sha256';
import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import type { ElementorTargetProfileV1 } from './target-profile';
import {
  assessElementorObservedAssetReferenceEvidence,
  serializeElementorObservedAssetReferenceEvidence,
  type ElementorObservedAssetReferenceEvidenceV1,
} from './observed-asset-reference-evidence';
import {
  serializeElementorTargetManagedMediaIntegrityEvidence,
  validateElementorTargetManagedMediaIntegrityEvidence,
  type ElementorTargetManagedMediaIntegrityEvidenceV1,
} from './target-managed-media-integrity-evidence';
import {
  serializeElementorAssetTargetProofEvidence,
  type ElementorAssetTargetProofEvidenceV1,
} from './asset-target-proof-evidence';

export const ELEMENTOR_TARGET_MANAGED_MEDIA_REVIEW_PREREQUISITE_VERSION =
  'elementor-target-managed-media-review-prerequisite-v1' as const;

export type ElementorTargetManagedMediaReviewPrerequisiteStatus =
  | 'READY_FOR_INTERNAL_REVIEW'
  | 'REJECTED_OBSERVED_EVIDENCE'
  | 'REJECTED_CONTENT_INTEGRITY'
  | 'REJECTED_CROSS_BINDING';

export type ElementorTargetManagedMediaReviewPrerequisiteIssueCode =
  | 'P15_MEDIA_REVIEW_OBSERVED_EVIDENCE_INVALID'
  | 'P15_MEDIA_REVIEW_CONTENT_INTEGRITY_INVALID'
  | 'P15_MEDIA_REVIEW_CANDIDATE_BINDING_MISMATCH'
  | 'P15_MEDIA_REVIEW_PROFILE_BINDING_MISMATCH'
  | 'P15_MEDIA_REVIEW_REFERENCE_BINDING_MISMATCH'
  | 'P15_MEDIA_REVIEW_TARGET_BINDING_MISMATCH'
  | 'P15_MEDIA_REVIEW_EVIDENCE_REFERENCE_BINDING_MISMATCH'
  | 'P15_MEDIA_REVIEW_SERIALIZATION_INVALID';

export interface ElementorTargetManagedMediaReviewPrerequisiteIssueV1 {
  code: ElementorTargetManagedMediaReviewPrerequisiteIssueCode;
  path: string;
  message: string;
}

export interface ElementorTargetManagedMediaReviewPrerequisiteV1 {
  schemaVersion: 1;
  prerequisiteVersion: typeof ELEMENTOR_TARGET_MANAGED_MEDIA_REVIEW_PREREQUISITE_VERSION;
  status: ElementorTargetManagedMediaReviewPrerequisiteStatus;
  observedAssetEvidenceBound: boolean;
  contentIntegrityPass: boolean;
  crossBindingMatches: boolean;
  candidateIdentityDigest: string | null;
  targetProfileFingerprint: string | null;
  referenceReviewIdentityDigest: string | null;
  sourceProofSha256: string | null;
  observedAssetEvidenceSha256: string | null;
  contentIntegrityEvidenceSha256: string | null;
  sourceEvidenceReferenceSha256: string | null;
  observedTarget: {
    wordpressVersion: string;
    elementorVersion: string;
    importSurface: 'TEMPLATE_LIBRARY_JSON';
  } | null;
  sourceAssetUrlFingerprint: string | null;
  targetManagedMediaUrlFingerprint: string | null;
  renderedImageUrlFingerprint: string | null;
  sourceFixtureSha256: string | null;
  targetFileSha256: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  evidenceAuthenticationStatus: 'OBSERVED_PROOF_VALIDATED' | 'NOT_READY';
  contentIntegrityStatus: 'TARGET_MANAGED_CONTENT_INTEGRITY_PASS' | 'NOT_READY';
  internalDecisionStatus: 'NOT_RUN';
  issues: ElementorTargetManagedMediaReviewPrerequisiteIssueV1[];
  authenticationAuthority: false;
  acceptanceAuthority: false;
  referenceClosureClaim: false;
  assetReferenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

function sha256(value: string): string {
  return `sha256:${sha256Hex(value)}`;
}

function emptyResult(
  status: ElementorTargetManagedMediaReviewPrerequisiteStatus,
  issues: ElementorTargetManagedMediaReviewPrerequisiteIssueV1[],
): ElementorTargetManagedMediaReviewPrerequisiteV1 {
  return {
    schemaVersion: 1,
    prerequisiteVersion: ELEMENTOR_TARGET_MANAGED_MEDIA_REVIEW_PREREQUISITE_VERSION,
    status,
    observedAssetEvidenceBound: false,
    contentIntegrityPass: false,
    crossBindingMatches: false,
    candidateIdentityDigest: null,
    targetProfileFingerprint: null,
    referenceReviewIdentityDigest: null,
    sourceProofSha256: null,
    observedAssetEvidenceSha256: null,
    contentIntegrityEvidenceSha256: null,
    sourceEvidenceReferenceSha256: null,
    observedTarget: null,
    sourceAssetUrlFingerprint: null,
    targetManagedMediaUrlFingerprint: null,
    renderedImageUrlFingerprint: null,
    sourceFixtureSha256: null,
    targetFileSha256: null,
    mimeType: null,
    width: null,
    height: null,
    evidenceAuthenticationStatus: 'NOT_READY',
    contentIntegrityStatus: 'NOT_READY',
    internalDecisionStatus: 'NOT_RUN',
    issues: issues.map((issue) => ({ ...issue })),
    authenticationAuthority: false,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    assetReferenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

function observedTargetMatches(
  observed: ElementorObservedAssetReferenceEvidenceV1['observedTarget'],
  integrity: ElementorTargetManagedMediaIntegrityEvidenceV1['observedTarget'],
): boolean {
  return integrity.source === 'OBSERVED'
    && observed.wordpressVersion === integrity.wordpressVersion
    && observed.elementorVersion === integrity.elementorVersion
    && observed.importSurface === integrity.importSurface;
}

/**
 * Build a sanitized prerequisite for a later human/internal reference-closure review.
 *
 * This does not consume or trust prior report outputs. Both observed-reference evidence and
 * target-managed content integrity are recomputed from the exact candidate/profile/proof inputs.
 * READY_FOR_INTERNAL_REVIEW means only that those two bounded evidence prerequisites are mutually
 * consistent. It never grants reference closure, compatibility, production, generation or download
 * authority, and internalDecisionStatus deliberately remains NOT_RUN.
 */
export function buildElementorTargetManagedMediaReviewPrerequisite(
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
  assetProofValue: unknown,
  integrityEvidenceValue: unknown,
): ElementorTargetManagedMediaReviewPrerequisiteV1 {
  const observed = assessElementorObservedAssetReferenceEvidence(
    assetProofValue,
    candidate,
    profile,
  );
  if (observed.status !== 'OBSERVED_ASSET_EVIDENCE_BOUND' || observed.evidence === null) {
    return emptyResult('REJECTED_OBSERVED_EVIDENCE', [{
      code: 'P15_MEDIA_REVIEW_OBSERVED_EVIDENCE_INVALID',
      path: '$.assetProof',
      message: 'Internal-review prerequisite requires exact OBSERVED_ASSET_EVIDENCE_BOUND evidence.',
    }]);
  }

  const integrity = validateElementorTargetManagedMediaIntegrityEvidence(
    integrityEvidenceValue,
    candidate,
    profile,
    assetProofValue,
  );
  if (!integrity.valid || integrity.classification !== 'TARGET_MANAGED_CONTENT_INTEGRITY_PASS') {
    return {
      ...emptyResult('REJECTED_CONTENT_INTEGRITY', [{
        code: 'P15_MEDIA_REVIEW_CONTENT_INTEGRITY_INVALID',
        path: '$.integrityEvidence',
        message: 'Internal-review prerequisite requires exact TARGET_MANAGED_CONTENT_INTEGRITY_PASS evidence.',
      }]),
      observedAssetEvidenceBound: true,
      candidateIdentityDigest: observed.evidence.candidateIdentityDigest,
      targetProfileFingerprint: observed.evidence.targetProfileFingerprint,
      referenceReviewIdentityDigest: observed.evidence.referenceReviewIdentityDigest,
      sourceProofSha256: observed.evidence.sourceProofSha256,
      sourceEvidenceReferenceSha256: observed.evidence.sourceEvidenceReferenceSha256,
      observedTarget: { ...observed.evidence.observedTarget },
      sourceAssetUrlFingerprint: observed.evidence.sourceAssetUrlFingerprint,
      targetManagedMediaUrlFingerprint: observed.evidence.targetManagedMediaUrlFingerprint,
      renderedImageUrlFingerprint: observed.evidence.renderedImageUrlFingerprint,
      evidenceAuthenticationStatus: 'OBSERVED_PROOF_VALIDATED',
    };
  }

  const integrityEvidence = integrityEvidenceValue as ElementorTargetManagedMediaIntegrityEvidenceV1;
  const crossIssues: ElementorTargetManagedMediaReviewPrerequisiteIssueV1[] = [];

  if (integrityEvidence.candidateIdentity.digest !== observed.evidence.candidateIdentityDigest) {
    crossIssues.push({
      code: 'P15_MEDIA_REVIEW_CANDIDATE_BINDING_MISMATCH',
      path: '$.integrityEvidence.candidateIdentity',
      message: 'Observed reference evidence and content integrity must bind the same candidate identity.',
    });
  }
  if (integrityEvidence.targetProfileIdentity.fingerprint !== observed.evidence.targetProfileFingerprint) {
    crossIssues.push({
      code: 'P15_MEDIA_REVIEW_PROFILE_BINDING_MISMATCH',
      path: '$.integrityEvidence.targetProfileIdentity',
      message: 'Observed reference evidence and content integrity must bind the same TargetProfile.',
    });
  }
  if (integrityEvidence.referenceReviewIdentity.digest !== observed.evidence.referenceReviewIdentityDigest) {
    crossIssues.push({
      code: 'P15_MEDIA_REVIEW_REFERENCE_BINDING_MISMATCH',
      path: '$.integrityEvidence.referenceReviewIdentity',
      message: 'Observed reference evidence and content integrity must bind the same reference-review identity.',
    });
  }
  if (!observedTargetMatches(observed.evidence.observedTarget, integrityEvidence.observedTarget)) {
    crossIssues.push({
      code: 'P15_MEDIA_REVIEW_TARGET_BINDING_MISMATCH',
      path: '$.integrityEvidence.observedTarget',
      message: 'Observed reference evidence and content integrity must bind the same observed target.',
    });
  }
  if (sha256(integrityEvidence.evidenceReference) !== observed.evidence.sourceEvidenceReferenceSha256) {
    crossIssues.push({
      code: 'P15_MEDIA_REVIEW_EVIDENCE_REFERENCE_BINDING_MISMATCH',
      path: '$.integrityEvidence.evidenceReference',
      message: 'Observed reference evidence and content integrity must bind the same retained evidence reference.',
    });
  }

  if (crossIssues.length > 0) {
    return {
      ...emptyResult('REJECTED_CROSS_BINDING', crossIssues),
      observedAssetEvidenceBound: true,
      contentIntegrityPass: true,
      candidateIdentityDigest: observed.evidence.candidateIdentityDigest,
      targetProfileFingerprint: observed.evidence.targetProfileFingerprint,
      referenceReviewIdentityDigest: observed.evidence.referenceReviewIdentityDigest,
      sourceProofSha256: observed.evidence.sourceProofSha256,
      sourceEvidenceReferenceSha256: observed.evidence.sourceEvidenceReferenceSha256,
      observedTarget: { ...observed.evidence.observedTarget },
      sourceAssetUrlFingerprint: observed.evidence.sourceAssetUrlFingerprint,
      targetManagedMediaUrlFingerprint: observed.evidence.targetManagedMediaUrlFingerprint,
      renderedImageUrlFingerprint: observed.evidence.renderedImageUrlFingerprint,
      sourceFixtureSha256: integrity.sourceFixtureSha256,
      targetFileSha256: integrity.targetFileSha256,
      mimeType: integrity.mimeType,
      width: integrity.width,
      height: integrity.height,
      evidenceAuthenticationStatus: 'OBSERVED_PROOF_VALIDATED',
      contentIntegrityStatus: 'TARGET_MANAGED_CONTENT_INTEGRITY_PASS',
    };
  }

  let observedSerialized: string;
  let integritySerialized: string;
  let proofSerialized: string;
  try {
    observedSerialized = serializeElementorObservedAssetReferenceEvidence(
      assetProofValue,
      candidate,
      profile,
    );
    integritySerialized = serializeElementorTargetManagedMediaIntegrityEvidence(
      integrityEvidence,
      candidate,
      profile,
      assetProofValue,
    );
    proofSerialized = serializeElementorAssetTargetProofEvidence(
      assetProofValue as ElementorAssetTargetProofEvidenceV1,
      candidate,
      profile,
    );
  } catch {
    return {
      ...emptyResult('REJECTED_CROSS_BINDING', [{
        code: 'P15_MEDIA_REVIEW_SERIALIZATION_INVALID',
        path: '$',
        message: 'Bound prerequisite evidence could not be deterministically serialized.',
      }]),
      observedAssetEvidenceBound: true,
      contentIntegrityPass: true,
    };
  }

  const sourceProofSha256 = sha256(proofSerialized);
  if (sourceProofSha256 !== observed.evidence.sourceProofSha256) {
    return {
      ...emptyResult('REJECTED_CROSS_BINDING', [{
        code: 'P15_MEDIA_REVIEW_SERIALIZATION_INVALID',
        path: '$.assetProof',
        message: 'Observed evidence source-proof digest does not match the exact canonical asset proof.',
      }]),
      observedAssetEvidenceBound: true,
      contentIntegrityPass: true,
    };
  }

  return {
    schemaVersion: 1,
    prerequisiteVersion: ELEMENTOR_TARGET_MANAGED_MEDIA_REVIEW_PREREQUISITE_VERSION,
    status: 'READY_FOR_INTERNAL_REVIEW',
    observedAssetEvidenceBound: true,
    contentIntegrityPass: true,
    crossBindingMatches: true,
    candidateIdentityDigest: observed.evidence.candidateIdentityDigest,
    targetProfileFingerprint: observed.evidence.targetProfileFingerprint,
    referenceReviewIdentityDigest: observed.evidence.referenceReviewIdentityDigest,
    sourceProofSha256,
    observedAssetEvidenceSha256: sha256(observedSerialized),
    contentIntegrityEvidenceSha256: sha256(integritySerialized),
    sourceEvidenceReferenceSha256: observed.evidence.sourceEvidenceReferenceSha256,
    observedTarget: { ...observed.evidence.observedTarget },
    sourceAssetUrlFingerprint: observed.evidence.sourceAssetUrlFingerprint,
    targetManagedMediaUrlFingerprint: observed.evidence.targetManagedMediaUrlFingerprint,
    renderedImageUrlFingerprint: observed.evidence.renderedImageUrlFingerprint,
    sourceFixtureSha256: integrity.sourceFixtureSha256,
    targetFileSha256: integrity.targetFileSha256,
    mimeType: integrity.mimeType,
    width: integrity.width,
    height: integrity.height,
    evidenceAuthenticationStatus: 'OBSERVED_PROOF_VALIDATED',
    contentIntegrityStatus: 'TARGET_MANAGED_CONTENT_INTEGRITY_PASS',
    internalDecisionStatus: 'NOT_RUN',
    issues: [],
    authenticationAuthority: false,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    assetReferenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

export function serializeElementorTargetManagedMediaReviewPrerequisite(
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
  assetProofValue: unknown,
  integrityEvidenceValue: unknown,
): string {
  return `${JSON.stringify(
    buildElementorTargetManagedMediaReviewPrerequisite(
      candidate,
      profile,
      assetProofValue,
      integrityEvidenceValue,
    ),
    null,
    2,
  )}\n`;
}
