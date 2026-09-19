import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  buildElementorTemplateCandidateIdentity,
  type ElementorTemplateCandidateIdentityV1,
} from './import-validation-contract';
import {
  buildElementorReferenceReviewIdentity,
  ELEMENTOR_REFERENCE_REVIEW_IDENTITY_VERSION,
} from './reference-review-identity';
import { reviewElementorAssetReferences } from './asset-reference-review';
import {
  ELEMENTOR_TARGET_PROFILE_VERSION,
  fingerprintElementorTargetProfile,
  validateElementorTargetProfile,
  type ElementorTargetProfileV1,
} from './target-profile';

export const ELEMENTOR_ASSET_TARGET_PROOF_EVIDENCE_VERSION =
  'elementor-asset-target-proof-evidence-v1' as const;

export type ElementorAssetTargetProofStepResult = 'PASS' | 'FAIL' | 'NOT_RUN';
export type ElementorAssetTargetProofClassification =
  | 'ASSET_BOUND_FULL_PASS'
  | 'ASSET_BOUND_PARTIAL'
  | 'ASSET_BOUND_FAIL'
  | 'REJECTED';

export interface ElementorAssetTargetProofProfileIdentityV1 {
  profileVersion: typeof ELEMENTOR_TARGET_PROFILE_VERSION;
  fingerprint: string;
}

export interface ElementorAssetTargetProofReferenceReviewIdentityV1 {
  identityVersion: typeof ELEMENTOR_REFERENCE_REVIEW_IDENTITY_VERSION;
  digest: string;
}

export interface ElementorAssetTargetProofObservedTargetV1 {
  source: 'OBSERVED';
  wordpressVersion: string;
  elementorVersion: string;
  importSurface: 'TEMPLATE_LIBRARY_JSON';
}

export interface ElementorAssetTargetProofStepsV1 {
  importResult: 'PASS' | 'FAIL';
  renderResult: ElementorAssetTargetProofStepResult;
  renderedImageReferenceResult: ElementorAssetTargetProofStepResult;
  browserImageLoadResult: ElementorAssetTargetProofStepResult;
  renderedImageUrlFingerprint: string | null;
}

export interface ElementorAssetTargetProofEvidenceV1 {
  schemaVersion: 1;
  evidenceVersion: typeof ELEMENTOR_ASSET_TARGET_PROOF_EVIDENCE_VERSION;
  candidateIdentity: ElementorTemplateCandidateIdentityV1;
  targetProfileIdentity: ElementorAssetTargetProofProfileIdentityV1;
  referenceReviewIdentity: ElementorAssetTargetProofReferenceReviewIdentityV1;
  observedTarget: ElementorAssetTargetProofObservedTargetV1;
  observedAt: string;
  evidenceReference: string;
  steps: ElementorAssetTargetProofStepsV1;
  assetReferenceClosureClaim: false;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  internalReviewRequired: true;
}

export type ElementorAssetTargetProofIssueCode =
  | 'P15_ASSET_PROOF_NOT_OBJECT'
  | 'P15_ASSET_PROOF_FIELDS_INVALID'
  | 'P15_ASSET_PROOF_CANDIDATE_INVALID'
  | 'P15_ASSET_PROOF_CANDIDATE_IDENTITY_INVALID'
  | 'P15_ASSET_PROOF_CANDIDATE_MISMATCH'
  | 'P15_ASSET_PROOF_PROFILE_INVALID'
  | 'P15_ASSET_PROOF_PROFILE_IDENTITY_INVALID'
  | 'P15_ASSET_PROOF_PROFILE_MISMATCH'
  | 'P15_ASSET_PROOF_REFERENCE_REVIEW_INVALID'
  | 'P15_ASSET_PROOF_REFERENCE_REVIEW_IDENTITY_INVALID'
  | 'P15_ASSET_PROOF_REFERENCE_REVIEW_MISMATCH'
  | 'P15_ASSET_PROOF_OBSERVED_TARGET_INVALID'
  | 'P15_ASSET_PROOF_OBSERVED_AT_INVALID'
  | 'P15_ASSET_PROOF_EVIDENCE_REFERENCE_INVALID'
  | 'P15_ASSET_PROOF_STEPS_INVALID'
  | 'P15_ASSET_PROOF_SEQUENCE_INVALID'
  | 'P15_ASSET_PROOF_IMAGE_REFERENCE_BINDING_INVALID'
  | 'P15_ASSET_PROOF_AUTHORITY_FLAGS_INVALID';

export type ElementorAssetTargetProofReviewCode =
  'P15_ASSET_PROOF_DECLARED_OBSERVED_MISMATCH';

export interface ElementorAssetTargetProofIssueV1 {
  code: ElementorAssetTargetProofIssueCode;
  path: string;
  message: string;
}

export interface ElementorAssetTargetProofValidationResultV1 {
  valid: boolean;
  classification: ElementorAssetTargetProofClassification;
  candidateBindingMatches: boolean;
  profileBindingMatches: boolean;
  referenceReviewBindingMatches: boolean;
  declaredObservedEnvironmentMatches: boolean;
  imageReferenceBindingMatches: boolean;
  candidateIdentity: ElementorTemplateCandidateIdentityV1 | null;
  targetProfileFingerprint: string | null;
  referenceReviewIdentityDigest: string | null;
  expectedAssetUrlFingerprint: string | null;
  observedTarget: ElementorAssetTargetProofObservedTargetV1 | null;
  steps: ElementorAssetTargetProofStepsV1 | null;
  issues: ElementorAssetTargetProofIssueV1[];
  reviewCodes: ElementorAssetTargetProofReviewCode[];
  assetReferenceClosureClaim: false;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  internalReviewRequired: true;
}

const EVIDENCE_KEYS = [
  'acceptanceAuthority',
  'assetReferenceClosureClaim',
  'candidateIdentity',
  'evidenceReference',
  'evidenceVersion',
  'internalReviewRequired',
  'observedAt',
  'observedTarget',
  'productionAcceptance',
  'referenceReviewIdentity',
  'schemaVersion',
  'steps',
  'targetCompatibilityClaim',
  'targetProfileIdentity',
] as const;
const CANDIDATE_IDENTITY_KEYS = [
  'algorithm',
  'candidateVersion',
  'capabilityRegistryVersion',
  'digest',
  'identityVersion',
  'schemaVersion',
  'targetContractVersion',
] as const;
const PROFILE_IDENTITY_KEYS = ['fingerprint', 'profileVersion'] as const;
const REFERENCE_REVIEW_IDENTITY_KEYS = ['digest', 'identityVersion'] as const;
const OBSERVED_TARGET_KEYS = ['elementorVersion', 'importSurface', 'source', 'wordpressVersion'] as const;
const STEPS_KEYS = [
  'browserImageLoadResult',
  'importResult',
  'renderedImageReferenceResult',
  'renderedImageUrlFingerprint',
  'renderResult',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return actual.length === canonical.length
    && actual.every((key, index) => key === canonical[index]);
}

function validFingerprint(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}

function boundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function canonicalIso(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function sameCandidateIdentity(
  left: ElementorTemplateCandidateIdentityV1,
  right: ElementorTemplateCandidateIdentityV1,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function snapshotCandidateIdentity(
  value: unknown,
  expected: ElementorTemplateCandidateIdentityV1 | null,
): ElementorTemplateCandidateIdentityV1 | null {
  if (!expected || !isRecord(value) || !exactKeys(value, CANDIDATE_IDENTITY_KEYS)) return null;
  const candidate = value as unknown as ElementorTemplateCandidateIdentityV1;
  return sameCandidateIdentity(candidate, expected) ? { ...expected } : null;
}

function snapshotProfileIdentity(value: unknown): ElementorAssetTargetProofProfileIdentityV1 | null {
  if (!isRecord(value)
    || !exactKeys(value, PROFILE_IDENTITY_KEYS)
    || value.profileVersion !== ELEMENTOR_TARGET_PROFILE_VERSION
    || !validFingerprint(value.fingerprint)) {
    return null;
  }
  return {
    profileVersion: ELEMENTOR_TARGET_PROFILE_VERSION,
    fingerprint: value.fingerprint,
  };
}

function snapshotReferenceReviewIdentity(
  value: unknown,
): ElementorAssetTargetProofReferenceReviewIdentityV1 | null {
  if (!isRecord(value)
    || !exactKeys(value, REFERENCE_REVIEW_IDENTITY_KEYS)
    || value.identityVersion !== ELEMENTOR_REFERENCE_REVIEW_IDENTITY_VERSION
    || !validFingerprint(value.digest)) {
    return null;
  }
  return {
    identityVersion: ELEMENTOR_REFERENCE_REVIEW_IDENTITY_VERSION,
    digest: value.digest,
  };
}

function snapshotObservedTarget(value: unknown): ElementorAssetTargetProofObservedTargetV1 | null {
  if (!isRecord(value)
    || !exactKeys(value, OBSERVED_TARGET_KEYS)
    || value.source !== 'OBSERVED'
    || !boundedString(value.wordpressVersion, 64)
    || !boundedString(value.elementorVersion, 64)
    || value.importSurface !== 'TEMPLATE_LIBRARY_JSON') {
    return null;
  }
  return {
    source: 'OBSERVED',
    wordpressVersion: value.wordpressVersion,
    elementorVersion: value.elementorVersion,
    importSurface: 'TEMPLATE_LIBRARY_JSON',
  };
}

function isStepResult(value: unknown): value is ElementorAssetTargetProofStepResult {
  return value === 'PASS' || value === 'FAIL' || value === 'NOT_RUN';
}

function snapshotSteps(value: unknown): ElementorAssetTargetProofStepsV1 | null {
  if (!isRecord(value)
    || !exactKeys(value, STEPS_KEYS)
    || (value.importResult !== 'PASS' && value.importResult !== 'FAIL')
    || !isStepResult(value.renderResult)
    || !isStepResult(value.renderedImageReferenceResult)
    || !isStepResult(value.browserImageLoadResult)
    || !(value.renderedImageUrlFingerprint === null || validFingerprint(value.renderedImageUrlFingerprint))) {
    return null;
  }
  return {
    importResult: value.importResult,
    renderResult: value.renderResult,
    renderedImageReferenceResult: value.renderedImageReferenceResult,
    browserImageLoadResult: value.browserImageLoadResult,
    renderedImageUrlFingerprint: value.renderedImageUrlFingerprint,
  };
}

function sequenceValid(steps: ElementorAssetTargetProofStepsV1): boolean {
  if (steps.importResult === 'FAIL') {
    return steps.renderResult === 'NOT_RUN'
      && steps.renderedImageReferenceResult === 'NOT_RUN'
      && steps.browserImageLoadResult === 'NOT_RUN'
      && steps.renderedImageUrlFingerprint === null;
  }
  if (steps.renderResult !== 'PASS') {
    return steps.renderedImageReferenceResult === 'NOT_RUN'
      && steps.browserImageLoadResult === 'NOT_RUN'
      && steps.renderedImageUrlFingerprint === null;
  }
  if (steps.renderedImageReferenceResult === 'NOT_RUN') {
    return steps.browserImageLoadResult === 'NOT_RUN'
      && steps.renderedImageUrlFingerprint === null;
  }
  if (steps.renderedImageReferenceResult === 'FAIL') {
    return steps.browserImageLoadResult === 'NOT_RUN';
  }
  return steps.renderedImageUrlFingerprint !== null;
}

function classify(
  valid: boolean,
  steps: ElementorAssetTargetProofStepsV1 | null,
  environmentMatches: boolean,
  imageReferenceMatches: boolean,
): ElementorAssetTargetProofClassification {
  if (!valid || !steps) return 'REJECTED';
  if (steps.importResult === 'FAIL'
    || steps.renderResult === 'FAIL'
    || steps.renderedImageReferenceResult === 'FAIL'
    || steps.browserImageLoadResult === 'FAIL') {
    return 'ASSET_BOUND_FAIL';
  }
  if (environmentMatches
    && imageReferenceMatches
    && steps.importResult === 'PASS'
    && steps.renderResult === 'PASS'
    && steps.renderedImageReferenceResult === 'PASS'
    && steps.browserImageLoadResult === 'PASS') {
    return 'ASSET_BOUND_FULL_PASS';
  }
  return 'ASSET_BOUND_PARTIAL';
}

function inspectExpectedAssetReference(
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
): {
  referenceReviewDigest: string;
  assetUrlFingerprint: string;
} | null {
  if (typeof candidate.templateJson !== 'string') return null;
  try {
    const template: unknown = JSON.parse(candidate.templateJson);
    const referenceIdentity = buildElementorReferenceReviewIdentity(template, profile);
    const assetReview = reviewElementorAssetReferences(template, profile);
    const reference = assetReview.references[0];
    if (referenceIdentity.disposition !== 'EXTERNAL_CLOSURE_REQUIRED'
      || referenceIdentity.assetReferenceReviewStatus !== 'EXTERNAL_ASSET_CLOSURE_REQUIRED'
      || referenceIdentity.assetReferenceStatus !== 'NOT_VERIFIED'
      || referenceIdentity.referenceClosureClaim !== false
      || assetReview.references.length !== 1
      || reference?.referenceMode !== 'URL_ONLY'
      || reference.mediaId !== null
      || reference.urlPresent !== true
      || !validFingerprint(reference.urlFingerprint)) {
      return null;
    }
    return {
      referenceReviewDigest: referenceIdentity.digest,
      assetUrlFingerprint: reference.urlFingerprint,
    };
  } catch {
    return null;
  }
}

export function validateElementorAssetTargetProofEvidence(
  value: unknown,
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
): ElementorAssetTargetProofValidationResultV1 {
  const issues: ElementorAssetTargetProofIssueV1[] = [];
  const reviewCodes: ElementorAssetTargetProofReviewCode[] = [];

  let expectedCandidateIdentity: ElementorTemplateCandidateIdentityV1 | null = null;
  try {
    expectedCandidateIdentity = buildElementorTemplateCandidateIdentity(candidate);
  } catch {
    issues.push({
      code: 'P15_ASSET_PROOF_CANDIDATE_INVALID',
      path: '$candidate',
      message: 'Asset proof requires one exact canonical candidate ready for target import validation.',
    });
  }

  const profileValidation = validateElementorTargetProfile(profile);
  const canonicalProfile = profileValidation.profile;
  const expectedProfileFingerprint = canonicalProfile
    ? fingerprintElementorTargetProfile(canonicalProfile)
    : null;
  if (!profileValidation.valid || !canonicalProfile || !expectedProfileFingerprint) {
    issues.push({
      code: 'P15_ASSET_PROOF_PROFILE_INVALID',
      path: '$profile',
      message: 'Asset proof requires one exact canonical declared Elementor TargetProfile.',
    });
  }

  const expectedReference = canonicalProfile
    ? inspectExpectedAssetReference(candidate, canonicalProfile)
    : null;
  if (!expectedReference) {
    issues.push({
      code: 'P15_ASSET_PROOF_REFERENCE_REVIEW_INVALID',
      path: '$candidate',
      message: 'Asset proof candidate must retain exactly one documented URL-only Image MEDIA reference.',
    });
  }

  let candidateBindingMatches = false;
  let profileBindingMatches = false;
  let referenceReviewBindingMatches = false;
  let declaredObservedEnvironmentMatches = false;
  let imageReferenceBindingMatches = false;
  let observedTarget: ElementorAssetTargetProofObservedTargetV1 | null = null;
  let steps: ElementorAssetTargetProofStepsV1 | null = null;

  if (!isRecord(value)) {
    issues.push({
      code: 'P15_ASSET_PROOF_NOT_OBJECT',
      path: '$',
      message: 'Asset target proof evidence must be an object.',
    });
  } else {
    if (!exactKeys(value, EVIDENCE_KEYS)
      || value.schemaVersion !== 1
      || value.evidenceVersion !== ELEMENTOR_ASSET_TARGET_PROOF_EVIDENCE_VERSION) {
      issues.push({
        code: 'P15_ASSET_PROOF_FIELDS_INVALID',
        path: '$',
        message: 'Asset target proof contains unknown, missing or unsupported fields/version.',
      });
    }

    const candidateIdentity = snapshotCandidateIdentity(value.candidateIdentity, expectedCandidateIdentity);
    if (!candidateIdentity) {
      issues.push({
        code: expectedCandidateIdentity
          ? 'P15_ASSET_PROOF_CANDIDATE_MISMATCH'
          : 'P15_ASSET_PROOF_CANDIDATE_IDENTITY_INVALID',
        path: '$.candidateIdentity',
        message: 'Asset target proof is not bound to the exact current canonical candidate identity.',
      });
    } else {
      candidateBindingMatches = true;
    }

    const profileIdentity = snapshotProfileIdentity(value.targetProfileIdentity);
    if (!profileIdentity) {
      issues.push({
        code: 'P15_ASSET_PROOF_PROFILE_IDENTITY_INVALID',
        path: '$.targetProfileIdentity',
        message: 'Asset target proof TargetProfile identity is malformed or unsupported.',
      });
    } else if (expectedProfileFingerprint && profileIdentity.fingerprint === expectedProfileFingerprint) {
      profileBindingMatches = true;
    } else {
      issues.push({
        code: 'P15_ASSET_PROOF_PROFILE_MISMATCH',
        path: '$.targetProfileIdentity.fingerprint',
        message: 'Asset target proof is stale or bound to a different declared TargetProfile.',
      });
    }

    const referenceIdentity = snapshotReferenceReviewIdentity(value.referenceReviewIdentity);
    if (!referenceIdentity) {
      issues.push({
        code: 'P15_ASSET_PROOF_REFERENCE_REVIEW_IDENTITY_INVALID',
        path: '$.referenceReviewIdentity',
        message: 'Asset target proof reference-review identity is malformed or unsupported.',
      });
    } else if (expectedReference && referenceIdentity.digest === expectedReference.referenceReviewDigest) {
      referenceReviewBindingMatches = true;
    } else {
      issues.push({
        code: 'P15_ASSET_PROOF_REFERENCE_REVIEW_MISMATCH',
        path: '$.referenceReviewIdentity.digest',
        message: 'Asset target proof is stale or bound to a different exact reference-review identity.',
      });
    }

    observedTarget = snapshotObservedTarget(value.observedTarget);
    if (!observedTarget) {
      issues.push({
        code: 'P15_ASSET_PROOF_OBSERVED_TARGET_INVALID',
        path: '$.observedTarget',
        message: 'Observed target must retain bounded WordPress/Elementor versions and TEMPLATE_LIBRARY_JSON surface.',
      });
    } else if (canonicalProfile) {
      declaredObservedEnvironmentMatches = observedTarget.wordpressVersion === canonicalProfile.environment.wordpressVersion
        && observedTarget.elementorVersion === canonicalProfile.environment.elementorVersion;
      if (!declaredObservedEnvironmentMatches) {
        reviewCodes.push('P15_ASSET_PROOF_DECLARED_OBSERVED_MISMATCH');
      }
    }

    if (!canonicalIso(value.observedAt)) {
      issues.push({
        code: 'P15_ASSET_PROOF_OBSERVED_AT_INVALID',
        path: '$.observedAt',
        message: 'observedAt must be a canonical ISO-8601 UTC timestamp.',
      });
    }

    if (!boundedString(value.evidenceReference, 1024)) {
      issues.push({
        code: 'P15_ASSET_PROOF_EVIDENCE_REFERENCE_INVALID',
        path: '$.evidenceReference',
        message: 'A bounded non-empty external evidence reference is required.',
      });
    }

    steps = snapshotSteps(value.steps);
    if (!steps) {
      issues.push({
        code: 'P15_ASSET_PROOF_STEPS_INVALID',
        path: '$.steps',
        message: 'Asset target proof steps are malformed or contain unsupported values.',
      });
    } else if (!sequenceValid(steps)) {
      issues.push({
        code: 'P15_ASSET_PROOF_SEQUENCE_INVALID',
        path: '$.steps',
        message: 'Asset proof ordering is impossible or claims downstream evidence after an unproven/failed prerequisite.',
      });
    } else if (steps.renderedImageReferenceResult === 'PASS') {
      imageReferenceBindingMatches = expectedReference !== null
        && steps.renderedImageUrlFingerprint === expectedReference.assetUrlFingerprint;
      if (!imageReferenceBindingMatches) {
        issues.push({
          code: 'P15_ASSET_PROOF_IMAGE_REFERENCE_BINDING_INVALID',
          path: '$.steps.renderedImageUrlFingerprint',
          message: 'PASS image-reference observation must exactly match the candidate URL-only MEDIA fingerprint.',
        });
      }
    } else if (steps.renderedImageUrlFingerprint !== null && expectedReference) {
      imageReferenceBindingMatches = steps.renderedImageUrlFingerprint === expectedReference.assetUrlFingerprint;
    }

    if (value.assetReferenceClosureClaim !== false
      || value.acceptanceAuthority !== false
      || value.targetCompatibilityClaim !== false
      || value.productionAcceptance !== false
      || value.internalReviewRequired !== true) {
      issues.push({
        code: 'P15_ASSET_PROOF_AUTHORITY_FLAGS_INVALID',
        path: '$',
        message: 'Asset target proof cannot grant asset closure, acceptance, compatibility or production authority.',
      });
    }
  }

  const valid = issues.length === 0;
  return {
    valid,
    classification: classify(
      valid,
      steps,
      declaredObservedEnvironmentMatches,
      imageReferenceBindingMatches,
    ),
    candidateBindingMatches,
    profileBindingMatches,
    referenceReviewBindingMatches,
    declaredObservedEnvironmentMatches,
    imageReferenceBindingMatches,
    candidateIdentity: expectedCandidateIdentity,
    targetProfileFingerprint: expectedProfileFingerprint,
    referenceReviewIdentityDigest: expectedReference?.referenceReviewDigest ?? null,
    expectedAssetUrlFingerprint: expectedReference?.assetUrlFingerprint ?? null,
    observedTarget,
    steps,
    issues,
    reviewCodes,
    assetReferenceClosureClaim: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };
}

export function buildElementorAssetTargetProofEvidence(input: {
  candidate: ElementorTemplateCandidateArtifactV1;
  profile: ElementorTargetProfileV1;
  observedTarget: ElementorAssetTargetProofObservedTargetV1;
  observedAt: string;
  evidenceReference: string;
  steps: ElementorAssetTargetProofStepsV1;
}): ElementorAssetTargetProofEvidenceV1 {
  const profileValidation = validateElementorTargetProfile(input.profile);
  if (!profileValidation.valid || !profileValidation.profile) {
    throw new Error('Cannot build asset target proof for an invalid Elementor TargetProfile.');
  }
  const reference = inspectExpectedAssetReference(input.candidate, profileValidation.profile);
  if (!reference) {
    throw new Error('Cannot build asset target proof without one exact URL-only Image reference review.');
  }

  const proof: ElementorAssetTargetProofEvidenceV1 = {
    schemaVersion: 1,
    evidenceVersion: ELEMENTOR_ASSET_TARGET_PROOF_EVIDENCE_VERSION,
    candidateIdentity: buildElementorTemplateCandidateIdentity(input.candidate),
    targetProfileIdentity: {
      profileVersion: ELEMENTOR_TARGET_PROFILE_VERSION,
      fingerprint: fingerprintElementorTargetProfile(profileValidation.profile),
    },
    referenceReviewIdentity: {
      identityVersion: ELEMENTOR_REFERENCE_REVIEW_IDENTITY_VERSION,
      digest: reference.referenceReviewDigest,
    },
    observedTarget: { ...input.observedTarget },
    observedAt: input.observedAt,
    evidenceReference: input.evidenceReference,
    steps: { ...input.steps },
    assetReferenceClosureClaim: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };

  const validation = validateElementorAssetTargetProofEvidence(
    proof,
    input.candidate,
    profileValidation.profile,
  );
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Elementor asset target proof: ${first.code} at ${first.path}`
      : 'Invalid Elementor asset target proof.');
  }
  return proof;
}

export function serializeElementorAssetTargetProofEvidence(
  evidence: ElementorAssetTargetProofEvidenceV1,
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
): string {
  const validation = validateElementorAssetTargetProofEvidence(evidence, candidate, profile);
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Elementor asset target proof: ${first.code} at ${first.path}`
      : 'Invalid Elementor asset target proof.');
  }
  return `${JSON.stringify(evidence, null, 2)}\n`;
}
