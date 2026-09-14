import { sha256Hex } from '../../core/sha256';
import {
  buildGutenbergNormalizedCandidateArtifact,
  type GutenbergNormalizedCandidateArtifactV1,
  type GutenbergNormalizedCandidateStatus,
} from './candidate-artifact';
import {
  buildGutenbergNormalizedCandidateIdentity,
  type GutenbergNormalizedCandidateIdentityV1,
} from './candidate-identity';
import {
  validateGutenbergNativeSerializationValidationReceipt,
  type GutenbergNativeSerializationValidationIssue,
  type GutenbergNativeSerializationValidationReceiptV1,
} from './native-serialization-validation-contract';

export const GUTENBERG_NATIVE_SERIALIZATION_INTAKE_VERSION =
  'gutenberg-native-serialization-intake-v1' as const;

export type GutenbergNativeSerializationIntakeStatus =
  | 'BOUND_REPORTED_PASS'
  | 'BOUND_REPORTED_FAIL'
  | 'REJECTED';

export interface GutenbergNativeSerializationIntakeReportV1 {
  schemaVersion: 1;
  gate: typeof GUTENBERG_NATIVE_SERIALIZATION_INTAKE_VERSION;
  status: GutenbergNativeSerializationIntakeStatus;
  candidateStatus: GutenbergNormalizedCandidateStatus;
  receiptValid: boolean;
  bindingMatches: boolean;
  currentCandidateIdentity: GutenbergNormalizedCandidateIdentityV1 | null;
  reportedResult: 'PASS' | 'FAIL' | null;
  reportedChecks: GutenbergNativeSerializationValidationReceiptV1['checks'] | null;
  nativeOutput: GutenbergNativeSerializationValidationReceiptV1['nativeOutput'] | null;
  inputs: {
    documentSha256: string;
    profileSha256: string;
    receiptSha256: string;
  };
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
  internalReviewRequired: true;
}

export interface GutenbergNativeSerializationIntakeInput {
  documentRaw: string;
  documentValue: unknown;
  profileRaw: string;
  profileValue: unknown;
  receiptRaw: string;
  receiptValue: unknown;
}

function currentIdentity(
  candidate: GutenbergNormalizedCandidateArtifactV1,
): GutenbergNormalizedCandidateIdentityV1 | null {
  if (candidate.status !== 'READY_FOR_NATIVE_SERIALIZATION_VALIDATION') return null;
  try {
    return buildGutenbergNormalizedCandidateIdentity(candidate);
  } catch {
    return null;
  }
}

/**
 * Rebuild the current normalized Gutenberg candidate and validate one external native-serialization receipt.
 *
 * The resulting intake report is sanitized: it does not include the raw evidenceReference or any raw native
 * Gutenberg post-content bytes. BOUND_REPORTED_PASS means exact-bound caller-supplied evidence only and never
 * grants repository native-serialization, environment, compatibility, production, generation or download authority.
 */
export function buildGutenbergNativeSerializationIntakeReport(
  input: GutenbergNativeSerializationIntakeInput,
): GutenbergNativeSerializationIntakeReportV1 {
  const candidate = buildGutenbergNormalizedCandidateArtifact(
    input.documentValue,
    input.profileValue,
  );
  const identity = currentIdentity(candidate);
  const validation = validateGutenbergNativeSerializationValidationReceipt(
    input.receiptValue,
    candidate,
  );

  const status: GutenbergNativeSerializationIntakeStatus = validation.valid
    && validation.reportedResult === 'PASS'
    ? 'BOUND_REPORTED_PASS'
    : validation.valid && validation.reportedResult === 'FAIL'
      ? 'BOUND_REPORTED_FAIL'
      : 'REJECTED';

  return {
    schemaVersion: 1,
    gate: GUTENBERG_NATIVE_SERIALIZATION_INTAKE_VERSION,
    status,
    candidateStatus: candidate.status,
    receiptValid: validation.valid,
    bindingMatches: validation.bindingMatches,
    currentCandidateIdentity: identity ? { ...identity } : null,
    reportedResult: validation.reportedResult,
    reportedChecks: validation.reportedChecks ? { ...validation.reportedChecks } : null,
    nativeOutput: validation.nativeOutput ? { ...validation.nativeOutput } : null,
    inputs: {
      documentSha256: `sha256:${sha256Hex(input.documentRaw)}`,
      profileSha256: `sha256:${sha256Hex(input.profileRaw)}`,
      receiptSha256: `sha256:${sha256Hex(input.receiptRaw)}`,
    },
    issues: validation.issues.map((issue) => ({ ...issue })),
    nativeSerializationAuthority: false,
    targetEnvironmentValidated: false,
    editorImportValidated: false,
    renderValidated: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

export function serializeGutenbergNativeSerializationIntakeReport(
  report: GutenbergNativeSerializationIntakeReportV1,
): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
