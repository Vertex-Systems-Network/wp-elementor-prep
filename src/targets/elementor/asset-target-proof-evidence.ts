import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  buildElementorTemplateCandidateIdentity,
  type ElementorTemplateCandidateIdentityV1,
} from './import-validation-contract';
import {
  ELEMENTOR_TARGET_PROFILE_VERSION,
  fingerprintElementorTargetProfile,
  validateElementorTargetProfile,
  type ElementorTargetProfileV1,
} from './target-profile';
import {
  reviewElementorAssetReferences,
  type ElementorAssetReferenceEntryV1,
} from './asset-reference-review';
import { buildElementorReferenceReviewIdentity } from './reference-review-identity';
import type { ElementorTemplateV04 } from './template-v04';

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

export interface ElementorAssetTargetProofObservedTargetV1 {
  source: 'OBSERVED';
  wordpressVersion: string;
  elementorVersion: string;
  importSurface: 'TEMPLATE_LIBRARY_JSON';
}

export interface ElementorAssetTargetProofReferenceV1 {
  path: string;
  widgetId: string;
  referenceMode: 'URL_ONLY';
  expectedUrlFingerprint: string;
  renderedUrlFingerprint: string | null;
}

export interface ElementorAssetTargetProofStepsV1 {
  importResult: 'PASS' | 'FAIL';
  renderResult: ElementorAssetTargetProofStepResult;
  renderedReferenceResult: ElementorAssetTargetProofStepResult;
  browserLoadResult: ElementorAssetTargetProofStepResult;
}

export interface ElementorAssetTargetProofEvidenceV1 {
  schemaVersion: 1;
  evidenceVersion: typeof ELEMENTOR_ASSET_TARGET_PROOF_EVIDENCE_VERSION;
  candidateIdentity: ElementorTemplateCandidateIdentityV1;
  targetProfileIdentity: ElementorAssetTargetProofProfileIdentityV1;
  referenceReviewIdentityDigest: string;
  observedTarget: ElementorAssetTargetProofObservedTargetV1;
  observedAt: string;
  evidenceReference: string;
  assetReference: ElementorAssetTargetProofReferenceV1;
  steps: ElementorAssetTargetProofStepsV1;
  acceptanceAuthority: false;
  assetReferenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  internalReviewRequired: true;
}

export type ElementorAssetTargetProofIssueCode =
  | 'P15_ASSET_PROOF_NOT_OBJECT'
  | 'P15_ASSET_PROOF_FIELDS_INVALID'
  | 'P15_ASSET_PROOF_CANDIDATE_INVALID'
  | 'P15_ASSET_PROOF_CANDIDATE_MISMATCH'
  | 'P15_ASSET_PROOF_PROFILE_INVALID'
  | 'P15_ASSET_PROOF_PROFILE_IDENTITY_INVALID'
  | 'P15_ASSET_PROOF_PROFILE_MISMATCH'
  | 'P15_ASSET_PROOF_REFERENCE_STATE_INELIGIBLE'
  | 'P15_ASSET_PROOF_REFERENCE_REVIEW_MISMATCH'
  | 'P15_ASSET_PROOF_OBSERVED_TARGET_INVALID'
  | 'P15_ASSET_PROOF_OBSERVED_AT_INVALID'
  | 'P15_ASSET_PROOF_EVIDENCE_REFERENCE_INVALID'
  | 'P15_ASSET_PROOF_ASSET_REFERENCE_INVALID'
  | 'P15_ASSET_PROOF_ASSET_REFERENCE_MISMATCH'
  | 'P15_ASSET_PROOF_STEPS_INVALID'
  | 'P15_ASSET_PROOF_SEQUENCE_INVALID'
  | 'P15_ASSET_PROOF_AUTHORITY_FLAGS_INVALID';

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
  assetReferenceBindingMatches: boolean;
  declaredObservedEnvironmentMatches: boolean;
  renderedReferenceMatches: boolean;
  candidateIdentity: ElementorTemplateCandidateIdentityV1 | null;
  targetProfileFingerprint: string | null;
  referenceReviewIdentityDigest: string | null;
  expectedAssetReference: {
    path: string;
    widgetId: string;
    referenceMode: 'URL_ONLY';
    urlFingerprint: string;
  } | null;
  observedTarget: ElementorAssetTargetProofObservedTargetV1 | null;
  steps: ElementorAssetTargetProofStepsV1 | null;
  issues: ElementorAssetTargetProofIssueV1[];
  acceptanceAuthority: false;
  assetReferenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  internalReviewRequired: true;
}

const EVIDENCE_KEYS = [
  'acceptanceAuthority',
  'assetReference',
  'assetReferenceClosureClaim',
  'candidateIdentity',
  'evidenceReference',
  'evidenceVersion',
  'internalReviewRequired',
  'observedAt',
  'observedTarget',
  'productionAcceptance',
  'referenceReviewIdentityDigest',
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
const OBSERVED_TARGET_KEYS = ['elementorVersion', 'importSurface', 'source', 'wordpressVersion'] as const;
const ASSET_REFERENCE_KEYS = [
  'expectedUrlFingerprint',
  'path',
  'referenceMode',
  'renderedUrlFingerprint',
  'widgetId',
] as const;
const STEPS_KEYS = [
  'browserLoadResult',
  'importResult',
  'renderedReferenceResult',
  'renderResult',
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

function boundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function validSha256(value: unknown): value is string {
  return typeof value === 'string' && SHA256_PATTERN.test(value);
}

function canonicalIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function candidateIdentityEquals(
  left: ElementorTemplateCandidateIdentityV1,
  right: ElementorTemplateCandidateIdentityV1,
): boolean {
  return left.schemaVersion === right.schemaVersion
    && left.identityVersion === right.identityVersion
    && left.candidateVersion === right.candidateVersion
    && left.targetContractVersion === right.targetContractVersion
    && left.capabilityRegistryVersion === right.capabilityRegistryVersion
    && left.algorithm === right.algorithm
    && left.digest === right.digest;
}

function snapshotCandidateIdentity(
  value: unknown,
  expected: ElementorTemplateCandidateIdentityV1 | null,
): ElementorTemplateCandidateIdentityV1 | null {
  if (!expected || !isRecord(value) || !exactKeys(value, CANDIDATE_IDENTITY_KEYS)) return null;
  const snapshot = value as unknown as ElementorTemplateCandidateIdentityV1;
  return candidateIdentityEquals(snapshot, expected) ? { ...expected } : null;
}

function snapshotProfileIdentity(value: unknown): ElementorAssetTargetProofProfileIdentityV1 | null {
  if (!isRecord(value)
    || !exactKeys(value, PROFILE_IDENTITY_KEYS)
    || value.profileVersion !== ELEMENTOR_TARGET_PROFILE_VERSION
    || !validSha256(value.fingerprint)) {
    return null;
  }
  return {
    profileVersion: ELEMENTOR_TARGET_PROFILE_VERSION,
    fingerprint: value.fingerprint,
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

function stepResult(value: unknown): value is ElementorAssetTargetProofStepResult {
  return value === 'PASS' || value === 'FAIL' || value === 'NOT_RUN';
}

function snapshotSteps(value: unknown): ElementorAssetTargetProofStepsV1 | null {
  if (!isRecord(value)
    || !exactKeys(value, STEPS_KEYS)
    || (value.importResult !== 'PASS' && value.importResult !== 'FAIL')
    || !stepResult(value.renderResult)
    || !stepResult(value.renderedReferenceResult)
    || !stepResult(value.browserLoadResult)) {
    return null;
  }
  return {
    importResult: value.importResult,
    renderResult: value.renderResult,
    renderedReferenceResult: value.renderedReferenceResult,
    browserLoadResult: value.browserLoadResult,
  };
}

function sequenceValid(steps: ElementorAssetTargetProofStepsV1): boolean {
  if (steps.importResult === 'FAIL') {
    return steps.renderResult === 'NOT_RUN'
      && steps.renderedReferenceResult === 'NOT_RUN'
      && steps.browserLoadResult === 'NOT_RUN';
  }
  if (steps.renderResult !== 'PASS') {
    return steps.renderedReferenceResult === 'NOT_RUN'
      && steps.browserLoadResult === 'NOT_RUN';
  }
  return steps.renderedReferenceResult !== 'NOT_RUN'
    && steps.browserLoadResult !== 'NOT_RUN';
}

function expectedUrlOnlyReference(
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
): {
  referenceReviewIdentityDigest: string;
  reference: ElementorAssetReferenceEntryV1;
} | null {
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION' || typeof candidate.templateJson !== 'string') {
    return null;
  }

  let template: ElementorTemplateV04;
  try {
    template = JSON.parse(candidate.templateJson) as ElementorTemplateV04;
  } catch {
    return null;
  }

  const assetReview = reviewElementorAssetReferences(template, profile);
  const referenceReviewIdentity = buildElementorReferenceReviewIdentity(template, profile);
  const reference = assetReview.references[0];

  if (assetReview.status !== 'EXTERNAL_ASSET_CLOSURE_REQUIRED'
    || assetReview.assetReferenceStatus !== 'NOT_VERIFIED'
    || assetReview.references.length !== 1
    || !reference
    || reference.referenceMode !== 'URL_ONLY'
    || reference.mediaId !== null
    || !reference.urlPresent
    || !validSha256(reference.urlFingerprint)
    || referenceReviewIdentity.disposition !== 'EXTERNAL_CLOSURE_REQUIRED'
    || referenceReviewIdentity.assetReferenceReviewStatus !== 'EXTERNAL_ASSET_CLOSURE_REQUIRED'
    || referenceReviewIdentity.assetReferenceStatus !== 'NOT_VERIFIED'
    || referenceReviewIdentity.globalReferenceClosureStatus !== 'NOT_REQUIRED') {
    return null;
  }

  return {
    referenceReviewIdentityDigest: referenceReviewIdentity.digest,
    reference,
  };
}

function snapshotAssetReference(value: unknown): ElementorAssetTargetProofReferenceV1 | null {
  if (!isRecord(value)
    || !exactKeys(value, ASSET_REFERENCE_KEYS)
    || !boundedString(value.path, 1024)
    || !boundedString(value.widgetId, 128)
    || value.referenceMode !== 'URL_ONLY'
    || !validSha256(value.expectedUrlFingerprint)
    || (value.renderedUrlFingerprint !== null && !validSha256(value.renderedUrlFingerprint))) {
    return null;
  }
  return {
    path: value.path,
    widgetId: value.widgetId,
    referenceMode: 'URL_ONLY',
    expectedUrlFingerprint: value.expectedUrlFingerprint,
    renderedUrlFingerprint: value.renderedUrlFingerprint,
  };
}

function classify(
  valid: boolean,
  environmentMatches: boolean,
  renderedReferenceMatches: boolean,
  steps: ElementorAssetTargetProofStepsV1 | null,
): ElementorAssetTargetProofClassification {
  if (!valid || !steps) return 'REJECTED';
  if (steps.importResult === 'FAIL'
    || steps.renderResult === 'FAIL'
    || steps.renderedReferenceResult === 'FAIL'
    || steps.browserLoadResult === 'FAIL') {
    return 'ASSET_BOUND_FAIL';
  }
  if (environmentMatches
    && renderedReferenceMatches
    && steps.importResult === 'PASS'
    && steps.renderResult === 'PASS'
    && steps.renderedReferenceResult === 'PASS'
    && steps.browserLoadResult === 'PASS') {
    return 'ASSET_BOUND_FULL_PASS';
  }
  return 'ASSET_BOUND_PARTIAL';
}

/**
 * Validate one genuine target observation for an exact canonical URL_ONLY Image candidate.
 *
 * Even ASSET_BOUND_FULL_PASS is only consistency + observation evidence for this exact candidate/profile.
 * It never grants general asset portability, reference closure, target compatibility or production authority.
 */
export function validateElementorAssetTargetProofEvidence(
  value: unknown,
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
): ElementorAssetTargetProofValidationResultV1 {
  const issues: ElementorAssetTargetProofIssueV1[] = [];

  let expectedCandidateIdentity: ElementorTemplateCandidateIdentityV1 | null = null;
  try {
    expectedCandidateIdentity = buildElementorTemplateCandidateIdentity(candidate);
  } catch {
    issues.push({
      code: 'P15_ASSET_PROOF_CANDIDATE_INVALID',
      path: '$candidate',
      message: 'Asset target proof requires one exact canonical candidate ready for target import validation.',
    });
  }

  const profileValidation = validateElementorTargetProfile(profile);
  const canonicalProfile = profileValidation.profile;
  const targetProfileFingerprint = canonicalProfile
    ? fingerprintElementorTargetProfile(canonicalProfile)
    : null;
  if (!profileValidation.valid || !canonicalProfile || !targetProfileFingerprint) {
    issues.push({
      code: 'P15_ASSET_PROOF_PROFILE_INVALID',
      path: '$profile',
      message: 'Asset target proof requires one exact canonical declared Elementor TargetProfile.',
    });
  }

  const expectedReference = canonicalProfile
    ? expectedUrlOnlyReference(candidate, canonicalProfile)
    : null;
  if (!expectedReference) {
    issues.push({
      code: 'P15_ASSET_PROOF_REFERENCE_STATE_INELIGIBLE',
      path: '$candidate',
      message: 'Asset target proof requires exactly one current URL_ONLY documented Image MEDIA reference and no global-reference closure requirement.',
    });
  }

  let candidateBindingMatches = false;
  let profileBindingMatches = false;
  let referenceReviewBindingMatches = false;
  let assetReferenceBindingMatches = false;
  let declaredObservedEnvironmentMatches = false;
  let renderedReferenceMatches = false;
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
        message: 'Asset target proof evidence contains unknown, missing or unsupported fields/version.',
      });
    }

    const candidateIdentity = snapshotCandidateIdentity(value.candidateIdentity, expectedCandidateIdentity);
    if (!candidateIdentity) {
      issues.push({
        code: 'P15_ASSET_PROOF_CANDIDATE_MISMATCH',
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
    } else if (targetProfileFingerprint && profileIdentity.fingerprint === targetProfileFingerprint) {
      profileBindingMatches = true;
    } else {
      issues.push({
        code: 'P15_ASSET_PROOF_PROFILE_MISMATCH',
        path: '$.targetProfileIdentity.fingerprint',
        message: 'Asset target proof is stale or bound to a different declared TargetProfile.',
      });
    }

    if (!validSha256(value.referenceReviewIdentityDigest)
      || !expectedReference
      || value.referenceReviewIdentityDigest !== expectedReference.referenceReviewIdentityDigest) {
      issues.push({
        code: 'P15_ASSET_PROOF_REFERENCE_REVIEW_MISMATCH',
        path: '$.referenceReviewIdentityDigest',
        message: 'Asset target proof is not bound to the exact current reference-review identity.',
      });
    } else {
      referenceReviewBindingMatches = true;
    }

    observedTarget = snapshotObservedTarget(value.observedTarget);
    if (!observedTarget) {
      issues.push({
        code: 'P15_ASSET_PROOF_OBSERVED_TARGET_INVALID',
        path: '$.observedTarget',
        message: 'Observed asset target must retain bounded WordPress/Elementor versions and TEMPLATE_LIBRARY_JSON surface.',
      });
    } else if (canonicalProfile) {
      declaredObservedEnvironmentMatches =
        observedTarget.wordpressVersion === canonicalProfile.environment.wordpressVersion
        && observedTarget.elementorVersion === canonicalProfile.environment.elementorVersion;
    }

    if (!canonicalIsoTimestamp(value.observedAt)) {
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
        message: 'A bounded non-empty retained workflow evidence reference is required.',
      });
    }

    const assetReference = snapshotAssetReference(value.assetReference);
    if (!assetReference) {
      issues.push({
        code: 'P15_ASSET_PROOF_ASSET_REFERENCE_INVALID',
        path: '$.assetReference',
        message: 'Observed asset reference metadata is malformed.',
      });
    } else if (expectedReference
      && assetReference.path === expectedReference.reference.path
      && assetReference.widgetId === expectedReference.reference.widgetId
      && assetReference.referenceMode === 'URL_ONLY'
      && assetReference.expectedUrlFingerprint === expectedReference.reference.urlFingerprint) {
      assetReferenceBindingMatches = true;
    } else {
      issues.push({
        code: 'P15_ASSET_PROOF_ASSET_REFERENCE_MISMATCH',
        path: '$.assetReference',
        message: 'Observed asset reference is not bound to the exact current URL_ONLY Image MEDIA reference.',
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
        message: 'Asset target proof step ordering is impossible or claims downstream evidence after a failed/unrun prerequisite.',
      });
    }

    if (assetReference && steps) {
      if (steps.renderedReferenceResult === 'PASS') {
        renderedReferenceMatches =
          assetReference.renderedUrlFingerprint === assetReference.expectedUrlFingerprint;
        if (!renderedReferenceMatches) {
          issues.push({
            code: 'P15_ASSET_PROOF_ASSET_REFERENCE_MISMATCH',
            path: '$.assetReference.renderedUrlFingerprint',
            message: 'PASS rendered-reference evidence must retain the exact expected URL fingerprint.',
          });
        }
      } else if (steps.renderedReferenceResult === 'NOT_RUN'
        && assetReference.renderedUrlFingerprint !== null) {
        issues.push({
          code: 'P15_ASSET_PROOF_ASSET_REFERENCE_INVALID',
          path: '$.assetReference.renderedUrlFingerprint',
          message: 'renderedUrlFingerprint must be null when rendered-reference comparison was not run.',
        });
      }
    }

    if (value.acceptanceAuthority !== false
      || value.assetReferenceClosureClaim !== false
      || value.targetCompatibilityClaim !== false
      || value.productionAcceptance !== false
      || value.internalReviewRequired !== true) {
      issues.push({
        code: 'P15_ASSET_PROOF_AUTHORITY_FLAGS_INVALID',
        path: '$',
        message: 'Controlled asset proof cannot grant reference closure, compatibility, production or acceptance authority.',
      });
    }
  }

  const valid = issues.length === 0;
  const expectedAssetReference = expectedReference
    ? {
        path: expectedReference.reference.path,
        widgetId: expectedReference.reference.widgetId,
        referenceMode: 'URL_ONLY' as const,
        urlFingerprint: expectedReference.reference.urlFingerprint as string,
      }
    : null;

  return {
    valid,
    classification: classify(
      valid,
      declaredObservedEnvironmentMatches,
      renderedReferenceMatches,
      steps,
    ),
    candidateBindingMatches,
    profileBindingMatches,
    referenceReviewBindingMatches,
    assetReferenceBindingMatches,
    declaredObservedEnvironmentMatches,
    renderedReferenceMatches,
    candidateIdentity: expectedCandidateIdentity,
    targetProfileFingerprint,
    referenceReviewIdentityDigest: expectedReference?.referenceReviewIdentityDigest ?? null,
    expectedAssetReference,
    observedTarget,
    steps,
    issues,
    acceptanceAuthority: false,
    assetReferenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };
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
