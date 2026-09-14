import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  serializeElementorImportValidationReceipt,
  validateElementorImportValidationReceipt,
  type ElementorImportValidationReceiptV1,
} from './import-validation-contract';
import {
  ELEMENTOR_TARGET_PROFILE_VERSION,
  fingerprintElementorTargetProfile,
  validateElementorTargetProfile,
  type ElementorTargetProfileV1,
} from './target-profile';

export const ELEMENTOR_PROFILE_BOUND_IMPORT_EVIDENCE_VERSION = 'elementor-profile-bound-import-evidence-v1' as const;

export interface ElementorTargetProfileIdentityV1 {
  profileVersion: typeof ELEMENTOR_TARGET_PROFILE_VERSION;
  fingerprint: string;
}

export interface ElementorProfileBoundImportEvidenceV1 {
  schemaVersion: 1;
  evidenceVersion: typeof ELEMENTOR_PROFILE_BOUND_IMPORT_EVIDENCE_VERSION;
  targetProfileIdentity: ElementorTargetProfileIdentityV1;
  importReceipt: ElementorImportValidationReceiptV1;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

export type ElementorProfileBoundImportEvidenceIssueCode =
  | 'P15_PROFILE_BOUND_EVIDENCE_NOT_OBJECT'
  | 'P15_PROFILE_BOUND_EVIDENCE_FIELDS_INVALID'
  | 'P15_PROFILE_BOUND_PROFILE_INVALID'
  | 'P15_PROFILE_BOUND_PROFILE_IDENTITY_INVALID'
  | 'P15_PROFILE_BOUND_PROFILE_MISMATCH'
  | 'P15_PROFILE_BOUND_RECEIPT_INVALID'
  | 'P15_PROFILE_BOUND_TARGET_VERSION_MISMATCH'
  | 'P15_PROFILE_BOUND_IMPORT_SURFACE_MISMATCH'
  | 'P15_PROFILE_BOUND_AUTHORITY_FLAGS_INVALID';

export interface ElementorProfileBoundImportEvidenceIssue {
  code: ElementorProfileBoundImportEvidenceIssueCode;
  path: string;
  message: string;
}

export interface ElementorProfileBoundImportEvidenceResult {
  valid: boolean;
  candidateBindingMatches: boolean;
  profileBindingMatches: boolean;
  observedResult: 'PASS' | 'FAIL' | null;
  targetProfileFingerprint: string | null;
  issues: ElementorProfileBoundImportEvidenceIssue[];
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const EVIDENCE_KEYS = [
  'acceptanceAuthority',
  'downloadEnabled',
  'evidenceVersion',
  'importReceipt',
  'internalReviewRequired',
  'productionAcceptance',
  'schemaVersion',
  'targetCompatibilityClaim',
  'targetProfileIdentity',
] as const;

const PROFILE_IDENTITY_KEYS = ['fingerprint', 'profileVersion'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonicalExpected = [...expected].sort();
  return actual.length === canonicalExpected.length
    && actual.every((key, index) => key === canonicalExpected[index]);
}

function snapshotTargetProfileIdentity(value: unknown): ElementorTargetProfileIdentityV1 | null {
  if (!isRecord(value)
    || !exactKeys(value, PROFILE_IDENTITY_KEYS)
    || value.profileVersion !== ELEMENTOR_TARGET_PROFILE_VERSION
    || typeof value.fingerprint !== 'string'
    || !/^sha256:[0-9a-f]{64}$/.test(value.fingerprint)) {
    return null;
  }

  return {
    profileVersion: ELEMENTOR_TARGET_PROFILE_VERSION,
    fingerprint: value.fingerprint,
  };
}

/**
 * Validate one already-captured import receipt against both the exact candidate bytes and one immutable
 * declared target profile. This is evidence binding only and grants no compatibility or release authority.
 */
export function validateElementorProfileBoundImportEvidence(
  value: unknown,
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
): ElementorProfileBoundImportEvidenceResult {
  const issues: ElementorProfileBoundImportEvidenceIssue[] = [];
  const profileValidation = validateElementorTargetProfile(profile);
  const canonicalProfile = profileValidation.profile;
  const expectedProfileFingerprint = canonicalProfile
    ? fingerprintElementorTargetProfile(canonicalProfile)
    : null;

  if (!profileValidation.valid || canonicalProfile === null || expectedProfileFingerprint === null) {
    issues.push({
      code: 'P15_PROFILE_BOUND_PROFILE_INVALID',
      path: '$profile',
      message: 'Current declared Elementor target profile is invalid or non-canonical.',
    });
  }

  let candidateBindingMatches = false;
  let profileBindingMatches = false;
  let observedResult: 'PASS' | 'FAIL' | null = null;

  if (!isRecord(value)) {
    issues.push({
      code: 'P15_PROFILE_BOUND_EVIDENCE_NOT_OBJECT',
      path: '$',
      message: 'Profile-bound import evidence must be an object.',
    });
  } else {
    if (!exactKeys(value, EVIDENCE_KEYS)
      || value.schemaVersion !== 1
      || value.evidenceVersion !== ELEMENTOR_PROFILE_BOUND_IMPORT_EVIDENCE_VERSION) {
      issues.push({
        code: 'P15_PROFILE_BOUND_EVIDENCE_FIELDS_INVALID',
        path: '$',
        message: 'Profile-bound evidence contains unknown, missing or unsupported fields/version.',
      });
    }

    const profileIdentity = snapshotTargetProfileIdentity(value.targetProfileIdentity);
    if (!profileIdentity) {
      issues.push({
        code: 'P15_PROFILE_BOUND_PROFILE_IDENTITY_INVALID',
        path: '$.targetProfileIdentity',
        message: 'Target-profile identity is malformed or unsupported.',
      });
    } else if (expectedProfileFingerprint && profileIdentity.fingerprint === expectedProfileFingerprint) {
      profileBindingMatches = true;
    } else {
      issues.push({
        code: 'P15_PROFILE_BOUND_PROFILE_MISMATCH',
        path: '$.targetProfileIdentity.fingerprint',
        message: 'Evidence is stale or bound to a different declared target profile.',
      });
    }

    const receiptValidation = validateElementorImportValidationReceipt(value.importReceipt, candidate);
    candidateBindingMatches = receiptValidation.bindingMatches;
    observedResult = receiptValidation.observedResult;
    if (!receiptValidation.valid) {
      issues.push({
        code: 'P15_PROFILE_BOUND_RECEIPT_INVALID',
        path: '$.importReceipt',
        message: 'Nested import receipt is invalid or is not bound to the exact current candidate.',
      });
    }

    if (receiptValidation.valid && canonicalProfile && isRecord(value.importReceipt)) {
      const target = value.importReceipt.target;
      if (!isRecord(target)
        || target.wordpressVersion !== canonicalProfile.environment.wordpressVersion
        || target.elementorVersion !== canonicalProfile.environment.elementorVersion) {
        issues.push({
          code: 'P15_PROFILE_BOUND_TARGET_VERSION_MISMATCH',
          path: '$.importReceipt.target',
          message: 'Observed target versions do not match the exact declared target profile.',
        });
      }

      if (!isRecord(target)
        || canonicalProfile.outputMode !== 'TEMPLATE_JSON'
        || target.importSurface !== 'TEMPLATE_LIBRARY_JSON') {
        issues.push({
          code: 'P15_PROFILE_BOUND_IMPORT_SURFACE_MISMATCH',
          path: '$.importReceipt.target.importSurface',
          message: 'Observed import surface is incompatible with the declared target profile output mode.',
        });
      }
    }

    if (value.acceptanceAuthority !== false
      || value.targetCompatibilityClaim !== false
      || value.productionAcceptance !== false
      || value.downloadEnabled !== false
      || value.internalReviewRequired !== true) {
      issues.push({
        code: 'P15_PROFILE_BOUND_AUTHORITY_FLAGS_INVALID',
        path: '$',
        message: 'Profile-bound evidence cannot grant acceptance, compatibility, production or download authority and must require internal review.',
      });
    }
  }

  return {
    valid: issues.length === 0,
    candidateBindingMatches,
    profileBindingMatches,
    observedResult,
    targetProfileFingerprint: expectedProfileFingerprint,
    issues,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

export function buildElementorProfileBoundImportEvidence(
  importReceipt: ElementorImportValidationReceiptV1,
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
): ElementorProfileBoundImportEvidenceV1 {
  const profileValidation = validateElementorTargetProfile(profile);
  if (!profileValidation.valid || profileValidation.profile === null) {
    throw new Error('Cannot bind import evidence to an invalid Elementor target profile.');
  }

  const canonicalReceipt = JSON.parse(
    serializeElementorImportValidationReceipt(importReceipt, candidate),
  ) as ElementorImportValidationReceiptV1;
  const canonicalProfile = profileValidation.profile;
  const evidence: ElementorProfileBoundImportEvidenceV1 = {
    schemaVersion: 1,
    evidenceVersion: ELEMENTOR_PROFILE_BOUND_IMPORT_EVIDENCE_VERSION,
    targetProfileIdentity: {
      profileVersion: ELEMENTOR_TARGET_PROFILE_VERSION,
      fingerprint: fingerprintElementorTargetProfile(canonicalProfile),
    },
    importReceipt: canonicalReceipt,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };

  const validation = validateElementorProfileBoundImportEvidence(evidence, candidate, canonicalProfile);
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid profile-bound import evidence: ${first.code} at ${first.path}`
      : 'Invalid profile-bound import evidence.');
  }

  return evidence;
}

export function serializeElementorProfileBoundImportEvidence(
  evidence: ElementorProfileBoundImportEvidenceV1,
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
): string {
  const validation = validateElementorProfileBoundImportEvidence(evidence, candidate, profile);
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid profile-bound import evidence: ${first.code} at ${first.path}`
      : 'Invalid profile-bound import evidence.');
  }

  const canonicalReceipt = JSON.parse(
    serializeElementorImportValidationReceipt(evidence.importReceipt, candidate),
  ) as ElementorImportValidationReceiptV1;

  return `${JSON.stringify({
    schemaVersion: 1,
    evidenceVersion: ELEMENTOR_PROFILE_BOUND_IMPORT_EVIDENCE_VERSION,
    targetProfileIdentity: evidence.targetProfileIdentity,
    importReceipt: canonicalReceipt,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  }, null, 2)}\n`;
}
