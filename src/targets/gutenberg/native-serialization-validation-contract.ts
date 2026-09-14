import {
  buildGutenbergNormalizedCandidateIdentity,
  GUTENBERG_NORMALIZED_CANDIDATE_IDENTITY_VERSION,
  type GutenbergNormalizedCandidateIdentityV1,
} from './candidate-identity';
import type { GutenbergNormalizedCandidateArtifactV1 } from './candidate-artifact';
import {
  validateGutenbergTargetProfile,
  type GutenbergTargetProfileV1,
} from './target-profile';

export const GUTENBERG_NATIVE_SERIALIZATION_VALIDATION_RECEIPT_VERSION =
  'gutenberg-native-serialization-validation-receipt-v1' as const;

export interface GutenbergNativeSerializationValidationReceiptV1 {
  schemaVersion: 1;
  receiptVersion: typeof GUTENBERG_NATIVE_SERIALIZATION_VALIDATION_RECEIPT_VERSION;
  candidateIdentity: GutenbergNormalizedCandidateIdentityV1;
  target: {
    wordpressVersion: string;
    validationSurface: 'WORDPRESS_BLOCK_PARSE_SERIALIZE_ROUND_TRIP';
  };
  observedAt: string;
  observedResult: 'PASS' | 'FAIL';
  checks: {
    parseSucceeded: boolean;
    serializeSucceeded: boolean;
    roundTripStable: boolean;
    invalidBlockWarningsObserved: boolean;
  };
  nativeOutput: {
    sha256: string | null;
    byteLength: number | null;
  };
  evidenceReference: string;
  nativeSerializationAuthority: false;
  targetEnvironmentValidated: false;
  editorImportValidated: false;
  renderValidated: false;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
}

export type GutenbergNativeSerializationValidationIssueCode =
  | 'P16_NATIVE_RECEIPT_CANDIDATE_NOT_READY'
  | 'P16_NATIVE_RECEIPT_CANDIDATE_NONCANONICAL'
  | 'P16_NATIVE_RECEIPT_NOT_OBJECT'
  | 'P16_NATIVE_RECEIPT_SHAPE_INVALID'
  | 'P16_NATIVE_RECEIPT_VERSION_INVALID'
  | 'P16_NATIVE_RECEIPT_IDENTITY_INVALID'
  | 'P16_NATIVE_RECEIPT_BINDING_MISMATCH'
  | 'P16_NATIVE_RECEIPT_TARGET_INVALID'
  | 'P16_NATIVE_RECEIPT_OBSERVED_AT_INVALID'
  | 'P16_NATIVE_RECEIPT_RESULT_INVALID'
  | 'P16_NATIVE_RECEIPT_CHECKS_INVALID'
  | 'P16_NATIVE_RECEIPT_PASS_INCONSISTENT'
  | 'P16_NATIVE_RECEIPT_OUTPUT_INVALID'
  | 'P16_NATIVE_RECEIPT_EVIDENCE_REFERENCE_INVALID'
  | 'P16_NATIVE_RECEIPT_AUTHORITY_FLAGS_INVALID';

export interface GutenbergNativeSerializationValidationIssue {
  code: GutenbergNativeSerializationValidationIssueCode;
  path: string;
  message: string;
}

export interface GutenbergNativeSerializationValidationResult {
  valid: boolean;
  bindingMatches: boolean;
  reportedResult: 'PASS' | 'FAIL' | null;
  candidateIdentity: GutenbergNormalizedCandidateIdentityV1 | null;
  reportedChecks: GutenbergNativeSerializationValidationReceiptV1['checks'] | null;
  nativeOutput: GutenbergNativeSerializationValidationReceiptV1['nativeOutput'] | null;
  issues: GutenbergNativeSerializationValidationIssue[];
  nativeSerializationAuthority: false;
  targetEnvironmentValidated: false;
  editorImportValidated: false;
  renderValidated: false;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
}

const RECEIPT_KEYS = [
  'acceptanceAuthority',
  'candidateIdentity',
  'checks',
  'downloadEnabled',
  'editorImportValidated',
  'evidenceReference',
  'generationEnabled',
  'nativeOutput',
  'nativeSerializationAuthority',
  'observedAt',
  'observedResult',
  'productionAcceptance',
  'receiptVersion',
  'renderValidated',
  'schemaVersion',
  'target',
  'targetCompatibilityClaim',
  'targetEnvironmentValidated',
] as const;
const IDENTITY_KEYS = [
  'algorithm',
  'assessmentVersion',
  'candidateVersion',
  'capabilityRegistryVersion',
  'digest',
  'identityVersion',
  'schemaVersion',
  'targetContractVersion',
  'targetProfileVersion',
] as const;
const TARGET_KEYS = ['validationSurface', 'wordpressVersion'] as const;
const CHECK_KEYS = [
  'invalidBlockWarningsObserved',
  'parseSucceeded',
  'roundTripStable',
  'serializeSucceeded',
] as const;
const OUTPUT_KEYS = ['byteLength', 'sha256'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonicalExpected = [...expected].sort();
  return actual.length === canonicalExpected.length
    && actual.every((key, index) => key === canonicalExpected[index]);
}

function boundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function canonicalIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function snapshotIdentity(value: unknown): GutenbergNormalizedCandidateIdentityV1 | null {
  if (!isRecord(value) || !exactKeys(value, IDENTITY_KEYS)) return null;
  if (value.schemaVersion !== 1
    || value.identityVersion !== GUTENBERG_NORMALIZED_CANDIDATE_IDENTITY_VERSION
    || value.candidateVersion !== 'gutenberg-normalized-candidate-v1'
    || value.targetContractVersion !== 'gutenberg-normalized-parsed-block-v1'
    || value.capabilityRegistryVersion !== 'gutenberg-documented-core-block-capabilities-v1'
    || value.targetProfileVersion !== 'gutenberg-target-profile-v1'
    || value.assessmentVersion !== 'gutenberg-target-profile-assessment-v1'
    || value.algorithm !== 'SHA-256'
    || typeof value.digest !== 'string'
    || !/^sha256:[0-9a-f]{64}$/.test(value.digest)) {
    return null;
  }

  return {
    schemaVersion: 1,
    identityVersion: GUTENBERG_NORMALIZED_CANDIDATE_IDENTITY_VERSION,
    candidateVersion: 'gutenberg-normalized-candidate-v1',
    targetContractVersion: 'gutenberg-normalized-parsed-block-v1',
    capabilityRegistryVersion: 'gutenberg-documented-core-block-capabilities-v1',
    targetProfileVersion: 'gutenberg-target-profile-v1',
    assessmentVersion: 'gutenberg-target-profile-assessment-v1',
    algorithm: 'SHA-256',
    digest: value.digest,
  };
}

function identityEquals(
  left: GutenbergNormalizedCandidateIdentityV1,
  right: GutenbergNormalizedCandidateIdentityV1,
): boolean {
  return left.schemaVersion === right.schemaVersion
    && left.identityVersion === right.identityVersion
    && left.candidateVersion === right.candidateVersion
    && left.targetContractVersion === right.targetContractVersion
    && left.capabilityRegistryVersion === right.capabilityRegistryVersion
    && left.targetProfileVersion === right.targetProfileVersion
    && left.assessmentVersion === right.assessmentVersion
    && left.algorithm === right.algorithm
    && left.digest === right.digest;
}

function declaredProfileFromCandidate(
  candidate: GutenbergNormalizedCandidateArtifactV1,
): GutenbergTargetProfileV1 | null {
  if (typeof candidate.profileJson !== 'string') return null;
  try {
    const parsed: unknown = JSON.parse(candidate.profileJson);
    const validation = validateGutenbergTargetProfile(parsed);
    return validation.valid ? validation.profile : null;
  } catch {
    return null;
  }
}

function cloneChecks(
  value: GutenbergNativeSerializationValidationReceiptV1['checks'],
): GutenbergNativeSerializationValidationReceiptV1['checks'] {
  return { ...value };
}

function cloneOutput(
  value: GutenbergNativeSerializationValidationReceiptV1['nativeOutput'],
): GutenbergNativeSerializationValidationReceiptV1['nativeOutput'] {
  return { ...value };
}

/**
 * Validate caller-supplied external Gutenberg native-serialization evidence against one exact canonical candidate.
 *
 * This function validates only receipt structure, logical consistency, declared-target binding and exact candidate
 * identity. It does not execute WordPress, fetch/authenticate evidenceReference, identify a verifier, or establish
 * truth of the external observation. Even a valid reported PASS grants no serialization/compatibility authority.
 */
export function validateGutenbergNativeSerializationValidationReceipt(
  value: unknown,
  candidate: GutenbergNormalizedCandidateArtifactV1,
): GutenbergNativeSerializationValidationResult {
  const issues: GutenbergNativeSerializationValidationIssue[] = [];
  let expectedIdentity: GutenbergNormalizedCandidateIdentityV1 | null = null;
  let declaredProfile: GutenbergTargetProfileV1 | null = null;

  if (candidate.status !== 'READY_FOR_NATIVE_SERIALIZATION_VALIDATION') {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_CANDIDATE_NOT_READY',
      path: '$candidate.status',
      message: 'Only a canonical READY_FOR_NATIVE_SERIALIZATION_VALIDATION candidate can receive native-serialization evidence.',
    });
  } else {
    try {
      expectedIdentity = buildGutenbergNormalizedCandidateIdentity(candidate);
      declaredProfile = declaredProfileFromCandidate(candidate);
      if (declaredProfile === null) {
        throw new Error('Canonical candidate did not contain a valid declared target profile.');
      }
    } catch {
      issues.push({
        code: 'P16_NATIVE_RECEIPT_CANDIDATE_NONCANONICAL',
        path: '$candidate',
        message: 'Candidate is not the exact canonical READY artifact derived from its embedded normalized document/profile evidence.',
      });
    }
  }

  if (!isRecord(value)) {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_NOT_OBJECT',
      path: '$',
      message: 'Native-serialization validation receipt must be an object.',
    });
    return {
      valid: false,
      bindingMatches: false,
      reportedResult: null,
      candidateIdentity: null,
      reportedChecks: null,
      nativeOutput: null,
      issues,
      nativeSerializationAuthority: false,
      targetEnvironmentValidated: false,
      editorImportValidated: false,
      renderValidated: false,
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      generationEnabled: false,
      downloadEnabled: false,
    };
  }

  if (!exactKeys(value, RECEIPT_KEYS)) {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_SHAPE_INVALID',
      path: '$',
      message: 'Receipt contains unknown or missing fields.',
    });
  }

  if (value.schemaVersion !== 1
    || value.receiptVersion !== GUTENBERG_NATIVE_SERIALIZATION_VALIDATION_RECEIPT_VERSION) {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_VERSION_INVALID',
      path: '$.receiptVersion',
      message: `Receipt must use ${GUTENBERG_NATIVE_SERIALIZATION_VALIDATION_RECEIPT_VERSION} with schemaVersion 1.`,
    });
  }

  const receiptIdentity = snapshotIdentity(value.candidateIdentity);
  if (receiptIdentity === null) {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_IDENTITY_INVALID',
      path: '$.candidateIdentity',
      message: 'Receipt candidate identity is malformed or uses unsupported contract versions.',
    });
  }

  const bindingMatches = expectedIdentity !== null
    && receiptIdentity !== null
    && identityEquals(expectedIdentity, receiptIdentity);
  if (receiptIdentity !== null && expectedIdentity !== null && !bindingMatches) {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_BINDING_MISMATCH',
      path: '$.candidateIdentity',
      message: 'Receipt candidate identity does not match the exact current canonical candidate.',
    });
  }

  const target = value.target;
  const targetValid = isRecord(target)
    && exactKeys(target, TARGET_KEYS)
    && boundedString(target.wordpressVersion, 64)
    && target.validationSurface === 'WORDPRESS_BLOCK_PARSE_SERIALIZE_ROUND_TRIP'
    && declaredProfile !== null
    && target.wordpressVersion === declaredProfile.environment.wordpressVersion;
  if (!targetValid) {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_TARGET_INVALID',
      path: '$.target',
      message: 'Receipt target must exactly match the candidate declared WordPress version and supported validation surface.',
    });
  }

  if (!canonicalIsoTimestamp(value.observedAt)) {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_OBSERVED_AT_INVALID',
      path: '$.observedAt',
      message: 'observedAt must be a canonical ISO timestamp.',
    });
  }

  const reportedResult = value.observedResult === 'PASS' || value.observedResult === 'FAIL'
    ? value.observedResult
    : null;
  if (reportedResult === null) {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_RESULT_INVALID',
      path: '$.observedResult',
      message: 'observedResult must be PASS or FAIL.',
    });
  }

  let reportedChecks: GutenbergNativeSerializationValidationReceiptV1['checks'] | null = null;
  if (isRecord(value.checks)
    && exactKeys(value.checks, CHECK_KEYS)
    && typeof value.checks.parseSucceeded === 'boolean'
    && typeof value.checks.serializeSucceeded === 'boolean'
    && typeof value.checks.roundTripStable === 'boolean'
    && typeof value.checks.invalidBlockWarningsObserved === 'boolean') {
    reportedChecks = {
      parseSucceeded: value.checks.parseSucceeded,
      serializeSucceeded: value.checks.serializeSucceeded,
      roundTripStable: value.checks.roundTripStable,
      invalidBlockWarningsObserved: value.checks.invalidBlockWarningsObserved,
    };
  } else {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_CHECKS_INVALID',
      path: '$.checks',
      message: 'checks must contain exactly four reported boolean validation outcomes.',
    });
  }

  let nativeOutput: GutenbergNativeSerializationValidationReceiptV1['nativeOutput'] | null = null;
  if (isRecord(value.nativeOutput) && exactKeys(value.nativeOutput, OUTPUT_KEYS)) {
    const digest = value.nativeOutput.sha256;
    const byteLength = value.nativeOutput.byteLength;
    const bothAbsent = digest === null && byteLength === null;
    const bothPresent = typeof digest === 'string'
      && /^sha256:[0-9a-f]{64}$/.test(digest)
      && typeof byteLength === 'number'
      && Number.isSafeInteger(byteLength)
      && byteLength >= 0;
    if (bothAbsent || bothPresent) {
      nativeOutput = {
        sha256: digest as string | null,
        byteLength: byteLength as number | null,
      };
    } else {
      issues.push({
        code: 'P16_NATIVE_RECEIPT_OUTPUT_INVALID',
        path: '$.nativeOutput',
        message: 'Native output evidence must use either a null/null pair or a valid sha256 digest with non-negative safe-integer byte length.',
      });
    }
  } else {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_OUTPUT_INVALID',
      path: '$.nativeOutput',
      message: 'nativeOutput must contain exactly sha256 and byteLength.',
    });
  }

  if (reportedResult === 'PASS'
    && (reportedChecks === null
      || !reportedChecks.parseSucceeded
      || !reportedChecks.serializeSucceeded
      || !reportedChecks.roundTripStable
      || reportedChecks.invalidBlockWarningsObserved
      || nativeOutput === null
      || nativeOutput.sha256 === null
      || nativeOutput.byteLength === null)) {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_PASS_INCONSISTENT',
      path: '$',
      message: 'Reported PASS requires parse/serialize/round-trip success, no invalid-block warnings, and present native-output digest evidence.',
    });
  }

  if (!boundedString(value.evidenceReference, 2_048)) {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_EVIDENCE_REFERENCE_INVALID',
      path: '$.evidenceReference',
      message: 'evidenceReference must be a non-empty bounded string.',
    });
  }

  if (value.nativeSerializationAuthority !== false
    || value.targetEnvironmentValidated !== false
    || value.editorImportValidated !== false
    || value.renderValidated !== false
    || value.acceptanceAuthority !== false
    || value.targetCompatibilityClaim !== false
    || value.productionAcceptance !== false
    || value.generationEnabled !== false
    || value.downloadEnabled !== false) {
    issues.push({
      code: 'P16_NATIVE_RECEIPT_AUTHORITY_FLAGS_INVALID',
      path: '$',
      message: 'External native-serialization receipt cannot grant serialization, environment, import/render, compatibility, production, generation or download authority.',
    });
  }

  return {
    valid: issues.length === 0,
    bindingMatches,
    reportedResult,
    candidateIdentity: receiptIdentity,
    reportedChecks: reportedChecks ? cloneChecks(reportedChecks) : null,
    nativeOutput: nativeOutput ? cloneOutput(nativeOutput) : null,
    issues,
    nativeSerializationAuthority: false,
    targetEnvironmentValidated: false,
    editorImportValidated: false,
    renderValidated: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
  };
}
