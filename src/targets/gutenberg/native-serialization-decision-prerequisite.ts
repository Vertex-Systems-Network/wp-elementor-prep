import { sha256Hex } from '../../core/sha256';
import type { GutenbergNormalizedCandidateIdentityV1 } from './candidate-identity';
import {
  serializeGutenbergNativeSerializationAuthenticationReport,
  validateGutenbergNativeSerializationAuthenticationReport,
  type GutenbergNativeSerializationAuthenticationIssue,
  type GutenbergNativeSerializationAuthenticationReportV1,
} from './native-serialization-authentication-report';

export const GUTENBERG_NATIVE_SERIALIZATION_DECISION_PREREQUISITE_VERSION =
  'gutenberg-native-serialization-decision-prerequisite-v1' as const;

export type GutenbergNativeSerializationDecisionPrerequisiteStatus =
  | 'REJECTED_INVALID_AUTHENTICATION_REPORT'
  | 'EXTERNAL_AUTH_FAIL_REVIEW_REQUIRED'
  | 'GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED';

export type GutenbergNativeSerializationDecisionPrerequisiteNextAction =
  | 'FIX_OR_RECAPTURE_AUTHENTICATION_REPORT'
  | 'REVIEW_REPORTED_AUTHENTICATION_FAILURE'
  | 'RETAIN_GENUINE_AUTHENTICATED_EVIDENCE_BEFORE_INTERNAL_DECISION';

export interface GutenbergNativeSerializationDecisionPrerequisiteV1 {
  schemaVersion: 1;
  packetVersion: typeof GUTENBERG_NATIVE_SERIALIZATION_DECISION_PREREQUISITE_VERSION;
  status: GutenbergNativeSerializationDecisionPrerequisiteStatus;
  authenticationReportValid: boolean;
  authenticationBindingMatches: boolean;
  currentCandidateIdentity: GutenbergNormalizedCandidateIdentityV1 | null;
  canonicalReceiptSha256: string | null;
  canonicalAuthenticationReportSha256: string | null;
  externalAuthenticationReportedResult: 'PASS' | 'FAIL' | null;
  nextAction: GutenbergNativeSerializationDecisionPrerequisiteNextAction;
  issues: GutenbergNativeSerializationAuthenticationIssue[];
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
  internalReviewRequired: true;
}

function statusFromAuthentication(
  valid: boolean,
  reportedResult: 'PASS' | 'FAIL' | null,
): GutenbergNativeSerializationDecisionPrerequisiteStatus {
  if (!valid) return 'REJECTED_INVALID_AUTHENTICATION_REPORT';
  return reportedResult === 'PASS'
    ? 'GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED'
    : 'EXTERNAL_AUTH_FAIL_REVIEW_REQUIRED';
}

function nextActionFromStatus(
  status: GutenbergNativeSerializationDecisionPrerequisiteStatus,
): GutenbergNativeSerializationDecisionPrerequisiteNextAction {
  if (status === 'REJECTED_INVALID_AUTHENTICATION_REPORT') {
    return 'FIX_OR_RECAPTURE_AUTHENTICATION_REPORT';
  }
  if (status === 'EXTERNAL_AUTH_FAIL_REVIEW_REQUIRED') {
    return 'REVIEW_REPORTED_AUTHENTICATION_FAILURE';
  }
  return 'RETAIN_GENUINE_AUTHENTICATED_EVIDENCE_BEFORE_INTERNAL_DECISION';
}

/**
 * Build a deterministic, sanitized prerequisite packet for a future authority-bearing internal decision.
 *
 * The strongest state is deliberately GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED. A structurally valid,
 * exact-bound EXTERNALLY_REPORTED_PASS is caller-supplied reporting only and cannot trigger or resolve an
 * internal decision. This packet never authenticates evidence, executes WordPress, or grants target authority.
 */
export function buildGutenbergNativeSerializationDecisionPrerequisite(
  documentValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
  authenticationReportValue: unknown,
): GutenbergNativeSerializationDecisionPrerequisiteV1 {
  const validation = validateGutenbergNativeSerializationAuthenticationReport(
    authenticationReportValue,
    documentValue,
    profileValue,
    receiptValue,
  );

  const status = statusFromAuthentication(
    validation.valid,
    validation.evidenceAuthenticationReportedResult,
  );

  let canonicalAuthenticationReportSha256: string | null = null;
  if (validation.valid) {
    const canonical = serializeGutenbergNativeSerializationAuthenticationReport(
      authenticationReportValue as GutenbergNativeSerializationAuthenticationReportV1,
      documentValue,
      profileValue,
      receiptValue,
    );
    canonicalAuthenticationReportSha256 = `sha256:${sha256Hex(canonical)}`;
  }

  return {
    schemaVersion: 1,
    packetVersion: GUTENBERG_NATIVE_SERIALIZATION_DECISION_PREREQUISITE_VERSION,
    status,
    authenticationReportValid: validation.valid,
    authenticationBindingMatches: validation.bindingMatches,
    currentCandidateIdentity: validation.currentCandidateIdentity
      ? { ...validation.currentCandidateIdentity }
      : null,
    canonicalReceiptSha256: validation.canonicalReceiptSha256,
    canonicalAuthenticationReportSha256,
    externalAuthenticationReportedResult: validation.evidenceAuthenticationReportedResult,
    nextAction: nextActionFromStatus(status),
    issues: validation.issues.map((issue) => ({ ...issue })),
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
    internalReviewRequired: true,
  };
}

export function serializeGutenbergNativeSerializationDecisionPrerequisite(
  documentValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
  authenticationReportValue: unknown,
): string {
  return `${JSON.stringify(
    buildGutenbergNativeSerializationDecisionPrerequisite(
      documentValue,
      profileValue,
      receiptValue,
      authenticationReportValue,
    ),
    null,
    2,
  )}\n`;
}
