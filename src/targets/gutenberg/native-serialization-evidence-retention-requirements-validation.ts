import { sha256Hex } from '../../core/sha256';
import {
  buildGutenbergNativeSerializationEvidenceRetentionRequirements,
  type GutenbergNativeSerializationEvidenceRetentionRequirementsStatus,
} from './native-serialization-evidence-retention-requirements';

export const GUTENBERG_NATIVE_SERIALIZATION_EVIDENCE_RETENTION_REQUIREMENTS_VALIDATION_VERSION =
  'gutenberg-native-serialization-evidence-retention-requirements-validation-v1' as const;

export type GutenbergNativeSerializationEvidenceRetentionRequirementsValidationStatus =
  | 'REJECTED_CURRENT_CHAIN_NOT_READY'
  | 'REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE'
  | 'CURRENT_REQUIREMENTS_MANIFEST_VALID';

export type GutenbergNativeSerializationEvidenceRetentionRequirementsValidationNextAction =
  | 'FIX_CURRENT_PREREQUISITE_CHAIN'
  | 'REEXPORT_CURRENT_RETENTION_REQUIREMENTS_MANIFEST'
  | 'RETAIN_VALIDATED_MANIFEST_AS_NON_AUTHORIZING_METADATA';

export type GutenbergNativeSerializationEvidenceRetentionRequirementsValidationIssueCode =
  | 'P16_RETENTION_MANIFEST_CURRENT_CHAIN_NOT_READY'
  | 'P16_RETENTION_MANIFEST_NOT_OBJECT'
  | 'P16_RETENTION_MANIFEST_INVALID_OR_STALE';

export interface GutenbergNativeSerializationEvidenceRetentionRequirementsValidationIssue {
  code: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationIssueCode;
  message: string;
}

export interface GutenbergNativeSerializationEvidenceRetentionRequirementsValidationV1 {
  schemaVersion: 1;
  validationVersion: typeof GUTENBERG_NATIVE_SERIALIZATION_EVIDENCE_RETENTION_REQUIREMENTS_VALIDATION_VERSION;
  status: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationStatus;
  currentRequirementsStatus: GutenbergNativeSerializationEvidenceRetentionRequirementsStatus;
  providedManifestObject: boolean;
  exactSemanticMatch: boolean;
  canonicalExpectedManifestSha256: string;
  canonicalProvidedManifestSha256: string | null;
  nextAction: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationNextAction;
  issues: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationIssue[];
  evidenceAuthenticationStatus: 'NOT_RUN';
  authenticationAuthority: false;
  nativeSerializationAuthority: false;
  targetEnvironmentValidated: false;
  editorImportValidated: false;
  renderValidated: false;
  decisionAuthority: false;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalDecisionStatus: 'NOT_RUN';
  internalDecisionEligible: false;
  internalReviewRequired: true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => canonicalize(item));
  if (!isRecord(value)) return value;

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) {
    result[key] = canonicalize(value[key]);
  }
  return result;
}

function canonicalJson(value: unknown): string | null {
  try {
    const serialized = JSON.stringify(canonicalize(value));
    return typeof serialized === 'string' ? serialized : null;
  } catch {
    return null;
  }
}

function sha256CanonicalJson(value: unknown): string | null {
  const serialized = canonicalJson(value);
  return serialized === null ? null : `sha256:${sha256Hex(serialized)}`;
}

/**
 * Validate one previously exported retention-requirements manifest against the current exact P16 chain.
 *
 * Validation is semantic and key-order independent. A VALID result means only that the supplied sanitized
 * requirements metadata exactly matches what the repository currently rebuilds. It does not authenticate
 * evidence, validate WordPress, create an internal decision, or grant any compatibility/production authority.
 */
export function validateGutenbergNativeSerializationEvidenceRetentionRequirements(
  manifestValue: unknown,
  documentValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
  authenticationReportValue: unknown,
): GutenbergNativeSerializationEvidenceRetentionRequirementsValidationV1 {
  const expected = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
    documentValue,
    profileValue,
    receiptValue,
    authenticationReportValue,
  );

  const expectedCanonical = canonicalJson(expected);
  if (expectedCanonical === null) {
    throw new Error('Repository-generated P16 retention requirements manifest is not canonically serializable.');
  }

  const expectedSha256 = `sha256:${sha256Hex(expectedCanonical)}`;
  const providedObject = isRecord(manifestValue);
  const providedCanonical = providedObject ? canonicalJson(manifestValue) : null;
  const providedSha256 = providedCanonical === null
    ? null
    : `sha256:${sha256Hex(providedCanonical)}`;
  const currentReady = expected.status === 'EVIDENCE_RETENTION_REQUIREMENTS_READY';
  const exactSemanticMatch = currentReady
    && providedCanonical !== null
    && providedCanonical === expectedCanonical;

  const issues: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationIssue[] = [];
  let status: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationStatus;
  let nextAction: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationNextAction;

  if (!currentReady) {
    status = 'REJECTED_CURRENT_CHAIN_NOT_READY';
    nextAction = 'FIX_CURRENT_PREREQUISITE_CHAIN';
    issues.push({
      code: 'P16_RETENTION_MANIFEST_CURRENT_CHAIN_NOT_READY',
      message: 'Current exact P16 prerequisite chain is not ready for retention requirements validation.',
    });
  } else if (!providedObject) {
    status = 'REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE';
    nextAction = 'REEXPORT_CURRENT_RETENTION_REQUIREMENTS_MANIFEST';
    issues.push({
      code: 'P16_RETENTION_MANIFEST_NOT_OBJECT',
      message: 'Provided retention requirements manifest must be a JSON object.',
    });
  } else if (!exactSemanticMatch) {
    status = 'REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE';
    nextAction = 'REEXPORT_CURRENT_RETENTION_REQUIREMENTS_MANIFEST';
    issues.push({
      code: 'P16_RETENTION_MANIFEST_INVALID_OR_STALE',
      message: 'Provided retention requirements manifest does not exactly match the current deterministic manifest.',
    });
  } else {
    status = 'CURRENT_REQUIREMENTS_MANIFEST_VALID';
    nextAction = 'RETAIN_VALIDATED_MANIFEST_AS_NON_AUTHORIZING_METADATA';
  }

  return {
    schemaVersion: 1,
    validationVersion:
      GUTENBERG_NATIVE_SERIALIZATION_EVIDENCE_RETENTION_REQUIREMENTS_VALIDATION_VERSION,
    status,
    currentRequirementsStatus: expected.status,
    providedManifestObject: providedObject,
    exactSemanticMatch,
    canonicalExpectedManifestSha256: expectedSha256,
    canonicalProvidedManifestSha256: providedSha256,
    nextAction,
    issues,
    evidenceAuthenticationStatus: 'NOT_RUN',
    authenticationAuthority: false,
    nativeSerializationAuthority: false,
    targetEnvironmentValidated: false,
    editorImportValidated: false,
    renderValidated: false,
    decisionAuthority: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalDecisionStatus: 'NOT_RUN',
    internalDecisionEligible: false,
    internalReviewRequired: true,
  };
}

export function serializeGutenbergNativeSerializationEvidenceRetentionRequirementsValidation(
  manifestValue: unknown,
  documentValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
  authenticationReportValue: unknown,
): string {
  return `${JSON.stringify(
    validateGutenbergNativeSerializationEvidenceRetentionRequirements(
      manifestValue,
      documentValue,
      profileValue,
      receiptValue,
      authenticationReportValue,
    ),
    null,
    2,
  )}\n`;
}

export function fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(
  manifestValue: unknown,
): string | null {
  return sha256CanonicalJson(manifestValue);
}
