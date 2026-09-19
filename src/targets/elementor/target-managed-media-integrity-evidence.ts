import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  validateElementorAssetTargetProofEvidence,
  type ElementorAssetTargetProofEvidenceV1,
} from './asset-target-proof-evidence';
import {
  ELEMENTOR_REFERENCE_REVIEW_IDENTITY_VERSION,
} from './reference-review-identity';
import {
  ELEMENTOR_TARGET_PROFILE_VERSION,
  type ElementorTargetProfileV1,
} from './target-profile';
import {
  ELEMENTOR_CANDIDATE_IDENTITY_VERSION,
  type ElementorTemplateCandidateIdentityV1,
} from './import-validation-contract';

export const ELEMENTOR_TARGET_MANAGED_MEDIA_INTEGRITY_EVIDENCE_VERSION =
  'elementor-target-managed-media-integrity-evidence-v1' as const;

export type ElementorTargetManagedMediaIntegrityClassification =
  | 'TARGET_MANAGED_CONTENT_INTEGRITY_PASS'
  | 'TARGET_MANAGED_CONTENT_INTEGRITY_FAIL'
  | 'REJECTED';

export interface ElementorTargetManagedMediaIntegrityEvidenceV1 {
  schemaVersion: 1;
  evidenceVersion: typeof ELEMENTOR_TARGET_MANAGED_MEDIA_INTEGRITY_EVIDENCE_VERSION;
  candidateIdentity: ElementorTemplateCandidateIdentityV1;
  targetProfileIdentity: {
    profileVersion: typeof ELEMENTOR_TARGET_PROFILE_VERSION;
    fingerprint: string;
  };
  referenceReviewIdentity: {
    identityVersion: typeof ELEMENTOR_REFERENCE_REVIEW_IDENTITY_VERSION;
    digest: string;
  };
  observedTarget: {
    source: 'OBSERVED';
    wordpressVersion: string;
    elementorVersion: string;
    importSurface: 'TEMPLATE_LIBRARY_JSON';
  };
  observedAt: string;
  evidenceReference: string;
  attachment: {
    postType: 'attachment';
    sourceFixtureSha256: string;
    targetFileSha256: string;
    mimeType: string;
    width: number;
    height: number;
  };
  assetReferenceClosureClaim: false;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

export type ElementorTargetManagedMediaIntegrityIssueCode =
  | 'P15_MEDIA_INTEGRITY_PROOF_INVALID'
  | 'P15_MEDIA_INTEGRITY_PROOF_NOT_FULL_PASS'
  | 'P15_MEDIA_INTEGRITY_EVIDENCE_NOT_OBJECT'
  | 'P15_MEDIA_INTEGRITY_EVIDENCE_SHAPE_INVALID'
  | 'P15_MEDIA_INTEGRITY_EVIDENCE_VERSION_INVALID'
  | 'P15_MEDIA_INTEGRITY_CANDIDATE_BINDING_INVALID'
  | 'P15_MEDIA_INTEGRITY_PROFILE_BINDING_INVALID'
  | 'P15_MEDIA_INTEGRITY_REFERENCE_BINDING_INVALID'
  | 'P15_MEDIA_INTEGRITY_TARGET_BINDING_INVALID'
  | 'P15_MEDIA_INTEGRITY_OBSERVED_AT_INVALID'
  | 'P15_MEDIA_INTEGRITY_EVIDENCE_REFERENCE_INVALID'
  | 'P15_MEDIA_INTEGRITY_EVIDENCE_REFERENCE_MISMATCH'
  | 'P15_MEDIA_INTEGRITY_ATTACHMENT_INVALID'
  | 'P15_MEDIA_INTEGRITY_CONTENT_MISMATCH'
  | 'P15_MEDIA_INTEGRITY_AUTHORITY_FLAGS_INVALID';

export interface ElementorTargetManagedMediaIntegrityIssueV1 {
  code: ElementorTargetManagedMediaIntegrityIssueCode;
  path: string;
  message: string;
}

export interface ElementorTargetManagedMediaIntegrityValidationResultV1 {
  valid: boolean;
  classification: ElementorTargetManagedMediaIntegrityClassification;
  assetProofValid: boolean;
  assetProofClassification: ReturnType<typeof validateElementorAssetTargetProofEvidence>['classification'];
  candidateBindingMatches: boolean;
  profileBindingMatches: boolean;
  referenceReviewBindingMatches: boolean;
  observedTargetMatches: boolean;
  evidenceReferenceMatches: boolean;
  contentDigestMatches: boolean;
  attachmentMetadataValid: boolean;
  sourceFixtureSha256: string | null;
  targetFileSha256: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  issues: ElementorTargetManagedMediaIntegrityIssueV1[];
  assetReferenceClosureClaim: false;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const EVIDENCE_KEYS = [
  'acceptanceAuthority',
  'assetReferenceClosureClaim',
  'attachment',
  'candidateIdentity',
  'downloadEnabled',
  'evidenceReference',
  'evidenceVersion',
  'generationEnabled',
  'internalReviewRequired',
  'observedAt',
  'observedTarget',
  'productionAcceptance',
  'referenceReviewIdentity',
  'schemaVersion',
  'targetCompatibilityClaim',
  'targetProfileIdentity',
] as const;
const CANDIDATE_KEYS = [
  'algorithm',
  'candidateVersion',
  'capabilityRegistryVersion',
  'digest',
  'identityVersion',
  'schemaVersion',
  'targetContractVersion',
] as const;
const PROFILE_KEYS = ['fingerprint', 'profileVersion'] as const;
const REFERENCE_KEYS = ['digest', 'identityVersion'] as const;
const TARGET_KEYS = ['elementorVersion', 'importSurface', 'source', 'wordpressVersion'] as const;
const ATTACHMENT_KEYS = [
  'height',
  'mimeType',
  'postType',
  'sourceFixtureSha256',
  'targetFileSha256',
  'width',
] as const;
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return actual.length === canonical.length
    && actual.every((key, index) => key === canonical[index]);
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && SHA256_PATTERN.test(value);
}

function boundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function canonicalIso(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function expectedProofReference(proofValue: unknown): string | null {
  if (!isRecord(proofValue) || !boundedString(proofValue.evidenceReference, 1024)) return null;
  return proofValue.evidenceReference;
}

function snapshotAttachment(value: unknown): {
  valid: boolean;
  sourceFixtureSha256: string | null;
  targetFileSha256: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
} {
  if (!isRecord(value)
    || !exactKeys(value, ATTACHMENT_KEYS)
    || value.postType !== 'attachment'
    || !isSha256(value.sourceFixtureSha256)
    || !isSha256(value.targetFileSha256)
    || !boundedString(value.mimeType, 128)
    || !Number.isSafeInteger(value.width)
    || !Number.isSafeInteger(value.height)
    || (value.width as number) <= 0
    || (value.height as number) <= 0) {
    return {
      valid: false,
      sourceFixtureSha256: null,
      targetFileSha256: null,
      mimeType: null,
      width: null,
      height: null,
    };
  }

  return {
    valid: true,
    sourceFixtureSha256: value.sourceFixtureSha256,
    targetFileSha256: value.targetFileSha256,
    mimeType: value.mimeType,
    width: value.width as number,
    height: value.height as number,
  };
}

function expectedCandidateIdentity(
  proof: ReturnType<typeof validateElementorAssetTargetProofEvidence>,
): ElementorTemplateCandidateIdentityV1 | null {
  return proof.candidateIdentity;
}

export function validateElementorTargetManagedMediaIntegrityEvidence(
  evidenceValue: unknown,
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
  assetProofValue: unknown,
): ElementorTargetManagedMediaIntegrityValidationResultV1 {
  const issues: ElementorTargetManagedMediaIntegrityIssueV1[] = [];
  const assetProof = validateElementorAssetTargetProofEvidence(assetProofValue, candidate, profile);

  if (!assetProof.valid) {
    issues.push({
      code: 'P15_MEDIA_INTEGRITY_PROOF_INVALID',
      path: '$assetProof',
      message: 'Target-managed media integrity requires one valid exact-bound asset target proof.',
    });
  } else if (assetProof.classification !== 'ASSET_BOUND_FULL_PASS') {
    issues.push({
      code: 'P15_MEDIA_INTEGRITY_PROOF_NOT_FULL_PASS',
      path: '$assetProof',
      message: 'Target-managed media integrity requires ASSET_BOUND_FULL_PASS exactly.',
    });
  }

  let candidateBindingMatches = false;
  let profileBindingMatches = false;
  let referenceReviewBindingMatches = false;
  let observedTargetMatches = false;
  let evidenceReferenceMatches = false;
  let contentDigestMatches = false;
  let attachmentMetadataValid = false;
  let sourceFixtureSha256: string | null = null;
  let targetFileSha256: string | null = null;
  let mimeType: string | null = null;
  let width: number | null = null;
  let height: number | null = null;

  if (!isRecord(evidenceValue)) {
    issues.push({
      code: 'P15_MEDIA_INTEGRITY_EVIDENCE_NOT_OBJECT',
      path: '$',
      message: 'Target-managed media integrity evidence must be an object.',
    });
  } else {
    if (!exactKeys(evidenceValue, EVIDENCE_KEYS)) {
      issues.push({
        code: 'P15_MEDIA_INTEGRITY_EVIDENCE_SHAPE_INVALID',
        path: '$',
        message: 'Target-managed media integrity evidence contains unknown or missing fields.',
      });
    }

    if (evidenceValue.schemaVersion !== 1
      || evidenceValue.evidenceVersion !== ELEMENTOR_TARGET_MANAGED_MEDIA_INTEGRITY_EVIDENCE_VERSION) {
      issues.push({
        code: 'P15_MEDIA_INTEGRITY_EVIDENCE_VERSION_INVALID',
        path: '$.evidenceVersion',
        message: 'Target-managed media integrity evidence schema/version is unsupported.',
      });
    }

    const expectedCandidate = expectedCandidateIdentity(assetProof);
    const actualCandidate = evidenceValue.candidateIdentity;
    candidateBindingMatches = expectedCandidate !== null
      && isRecord(actualCandidate)
      && exactKeys(actualCandidate, CANDIDATE_KEYS)
      && actualCandidate.identityVersion === ELEMENTOR_CANDIDATE_IDENTITY_VERSION
      && sameJson(actualCandidate, expectedCandidate);
    if (!candidateBindingMatches) {
      issues.push({
        code: 'P15_MEDIA_INTEGRITY_CANDIDATE_BINDING_INVALID',
        path: '$.candidateIdentity',
        message: 'Integrity evidence is not bound to the exact asset-proof candidate identity.',
      });
    }

    const actualProfile = evidenceValue.targetProfileIdentity;
    profileBindingMatches = assetProof.targetProfileFingerprint !== null
      && isRecord(actualProfile)
      && exactKeys(actualProfile, PROFILE_KEYS)
      && actualProfile.profileVersion === ELEMENTOR_TARGET_PROFILE_VERSION
      && actualProfile.fingerprint === assetProof.targetProfileFingerprint;
    if (!profileBindingMatches) {
      issues.push({
        code: 'P15_MEDIA_INTEGRITY_PROFILE_BINDING_INVALID',
        path: '$.targetProfileIdentity',
        message: 'Integrity evidence is not bound to the exact asset-proof TargetProfile.',
      });
    }

    const actualReference = evidenceValue.referenceReviewIdentity;
    referenceReviewBindingMatches = assetProof.referenceReviewIdentityDigest !== null
      && isRecord(actualReference)
      && exactKeys(actualReference, REFERENCE_KEYS)
      && actualReference.identityVersion === ELEMENTOR_REFERENCE_REVIEW_IDENTITY_VERSION
      && actualReference.digest === assetProof.referenceReviewIdentityDigest;
    if (!referenceReviewBindingMatches) {
      issues.push({
        code: 'P15_MEDIA_INTEGRITY_REFERENCE_BINDING_INVALID',
        path: '$.referenceReviewIdentity',
        message: 'Integrity evidence is not bound to the exact asset-proof reference-review identity.',
      });
    }

    const actualTarget = evidenceValue.observedTarget;
    observedTargetMatches = assetProof.observedTarget !== null
      && isRecord(actualTarget)
      && exactKeys(actualTarget, TARGET_KEYS)
      && sameJson(actualTarget, assetProof.observedTarget);
    if (!observedTargetMatches) {
      issues.push({
        code: 'P15_MEDIA_INTEGRITY_TARGET_BINDING_INVALID',
        path: '$.observedTarget',
        message: 'Integrity evidence observed target must exactly match the bound asset proof.',
      });
    }

    if (!canonicalIso(evidenceValue.observedAt)) {
      issues.push({
        code: 'P15_MEDIA_INTEGRITY_OBSERVED_AT_INVALID',
        path: '$.observedAt',
        message: 'observedAt must be a canonical ISO-8601 UTC timestamp.',
      });
    }

    if (!boundedString(evidenceValue.evidenceReference, 1024)) {
      issues.push({
        code: 'P15_MEDIA_INTEGRITY_EVIDENCE_REFERENCE_INVALID',
        path: '$.evidenceReference',
        message: 'A bounded non-empty retained evidence reference is required.',
      });
    } else {
      const expectedReference = expectedProofReference(assetProofValue);
      evidenceReferenceMatches = expectedReference !== null
        && evidenceValue.evidenceReference === expectedReference;
      if (!evidenceReferenceMatches) {
        issues.push({
          code: 'P15_MEDIA_INTEGRITY_EVIDENCE_REFERENCE_MISMATCH',
          path: '$.evidenceReference',
          message: 'Integrity evidence must reuse the exact retained asset-proof evidence reference.',
        });
      }
    }

    const attachment = snapshotAttachment(evidenceValue.attachment);
    sourceFixtureSha256 = attachment.sourceFixtureSha256;
    targetFileSha256 = attachment.targetFileSha256;
    mimeType = attachment.mimeType;
    width = attachment.width;
    height = attachment.height;
    attachmentMetadataValid = attachment.valid && attachment.mimeType === 'image/png';
    if (!attachmentMetadataValid) {
      issues.push({
        code: 'P15_MEDIA_INTEGRITY_ATTACHMENT_INVALID',
        path: '$.attachment',
        message: 'Target-managed attachment must be an observed image/png attachment with positive bounded dimensions and SHA-256 digests.',
      });
    } else {
      contentDigestMatches = attachment.sourceFixtureSha256 === attachment.targetFileSha256;
    }

    if (attachment.valid && !contentDigestMatches) {
      issues.push({
        code: 'P15_MEDIA_INTEGRITY_CONTENT_MISMATCH',
        path: '$.attachment.targetFileSha256',
        message: 'Imported target-managed attachment bytes do not match the exact controlled source fixture bytes.',
      });
    }

    if (evidenceValue.assetReferenceClosureClaim !== false
      || evidenceValue.acceptanceAuthority !== false
      || evidenceValue.targetCompatibilityClaim !== false
      || evidenceValue.productionAcceptance !== false
      || evidenceValue.generationEnabled !== false
      || evidenceValue.downloadEnabled !== false
      || evidenceValue.internalReviewRequired !== true) {
      issues.push({
        code: 'P15_MEDIA_INTEGRITY_AUTHORITY_FLAGS_INVALID',
        path: '$',
        message: 'Content-integrity evidence cannot grant asset closure, compatibility, production, generation or download authority.',
      });
    }
  }

  const valid = issues.length === 0;
  const classification: ElementorTargetManagedMediaIntegrityClassification = !valid
    ? (assetProof.valid
        && assetProof.classification === 'ASSET_BOUND_FULL_PASS'
        && candidateBindingMatches
        && profileBindingMatches
        && referenceReviewBindingMatches
        && observedTargetMatches
        && evidenceReferenceMatches
        && attachmentMetadataValid
        && !contentDigestMatches
      ? 'TARGET_MANAGED_CONTENT_INTEGRITY_FAIL'
      : 'REJECTED')
    : 'TARGET_MANAGED_CONTENT_INTEGRITY_PASS';

  return {
    valid,
    classification,
    assetProofValid: assetProof.valid,
    assetProofClassification: assetProof.classification,
    candidateBindingMatches,
    profileBindingMatches,
    referenceReviewBindingMatches,
    observedTargetMatches,
    evidenceReferenceMatches,
    contentDigestMatches,
    attachmentMetadataValid,
    sourceFixtureSha256,
    targetFileSha256,
    mimeType,
    width,
    height,
    issues,
    assetReferenceClosureClaim: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

export function serializeElementorTargetManagedMediaIntegrityEvidence(
  evidence: ElementorTargetManagedMediaIntegrityEvidenceV1,
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
  assetProofValue: unknown,
): string {
  const validation = validateElementorTargetManagedMediaIntegrityEvidence(
    evidence,
    candidate,
    profile,
    assetProofValue,
  );
  if (!validation.valid || validation.classification !== 'TARGET_MANAGED_CONTENT_INTEGRITY_PASS') {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid target-managed media integrity evidence: ${first.code} at ${first.path}`
      : 'Invalid target-managed media integrity evidence.');
  }
  return `${JSON.stringify(evidence, null, 2)}\n`;
}
