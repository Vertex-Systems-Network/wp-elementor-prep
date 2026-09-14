import { sha256Hex } from '../../core/sha256';
import type { GutenbergNormalizedCandidateIdentityV1 } from './candidate-identity';
import type { GutenbergNativeSerializationValidationReceiptV1 } from './native-serialization-validation-contract';
import {
  buildGutenbergNativeSerializationReviewPacket,
  type GutenbergNativeSerializationReviewPacketV1,
} from './native-serialization-review-packet';

export const GUTENBERG_NATIVE_SERIALIZATION_AUTHENTICATION_REPORT_VERSION =
  'gutenberg-native-serialization-authentication-report-v1' as const;

export type GutenbergNativeSerializationAuthenticationReportedResult = 'PASS' | 'FAIL';
export type GutenbergNativeSerializationAuthenticationStatus =
  | 'REJECTED'
  | 'EXTERNALLY_REPORTED_PASS'
  | 'EXTERNALLY_REPORTED_FAIL';

export interface GutenbergNativeSerializationEvidenceAuthenticationV1 {
  result: GutenbergNativeSerializationAuthenticationReportedResult;
  sourceEvidenceReferenceSha256: string;
}

export interface GutenbergNativeSerializationAuthenticationReportV1 {
  schemaVersion: 1;
  reportVersion: typeof GUTENBERG_NATIVE_SERIALIZATION_AUTHENTICATION_REPORT_VERSION;
  candidateIdentityDigest: string;
  canonicalReceiptSha256: string;
  reportedAt: string;
  evidenceAuthentication: GutenbergNativeSerializationEvidenceAuthenticationV1;
  authenticationAuthority: false;
  nativeSerializationAuthority: false;
  targetEnvironmentValidated: false;
  editorImportValidated: false;
  renderValidated: false;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalDecisionStatus: 'NOT_RUN';
  internalReviewRequired: true;
}

export type GutenbergNativeSerializationAuthenticationIssueCode =
  | 'P16_NATIVE_AUTH_PREREQUISITE_NOT_READY'
  | 'P16_NATIVE_AUTH_REPORT_NOT_OBJECT'
  | 'P16_NATIVE_AUTH_REPORT_SHAPE_INVALID'
  | 'P16_NATIVE_AUTH_REPORT_VERSION_INVALID'
  | 'P16_NATIVE_AUTH_BINDING_INVALID'
  | 'P16_NATIVE_AUTH_REPORTED_AT_INVALID'
  | 'P16_NATIVE_AUTH_EVIDENCE_INVALID'
  | 'P16_NATIVE_AUTH_AUTHORITY_FLAGS_INVALID';

export interface GutenbergNativeSerializationAuthenticationIssue {
  code: GutenbergNativeSerializationAuthenticationIssueCode;
  path: string;
  message: string;
}

export interface GutenbergNativeSerializationAuthenticationValidationResult {
  valid: boolean;
  bindingMatches: boolean;
  status: GutenbergNativeSerializationAuthenticationStatus;
  currentCandidateIdentity: GutenbergNormalizedCandidateIdentityV1 | null;
  canonicalReceiptSha256: string | null;
  evidenceAuthenticationReportedResult: GutenbergNativeSerializationAuthenticationReportedResult | null;
  evidenceReferenceHashMatches: boolean;
  allRequiredAuthenticationReportsPass: boolean;
  issues: GutenbergNativeSerializationAuthenticationIssue[];
  authenticationAuthority: false;
  nativeSerializationAuthority: false;
  targetEnvironmentValidated: false;
  editorImportValidated: false;
  renderValidated: false;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalDecisionStatus: 'NOT_RUN';
  internalReviewRequired: true;
}

const REPORT_KEYS = [
  'acceptanceAuthority',
  'authenticationAuthority',
  'candidateIdentityDigest',
  'canonicalReceiptSha256',
  'downloadEnabled',
  'editorImportValidated',
  'evidenceAuthentication',
  'generationEnabled',
  'internalDecisionStatus',
  'internalReviewRequired',
  'nativeSerializationAuthority',
  'productionAcceptance',
  'renderValidated',
  'reportedAt',
  'reportVersion',
  'schemaVersion',
  'targetCompatibilityClaim',
  'targetEnvironmentValidated',
] as const;
const EVIDENCE_AUTH_KEYS = ['result', 'sourceEvidenceReferenceSha256'] as const;
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expectedKeys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && SHA256_PATTERN.test(value);
}

function isCanonicalIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function authenticationReady(packet: GutenbergNativeSerializationReviewPacketV1): boolean {
  return packet.status === 'REPORTED_PASS_AUTHENTICATION_REQUIRED'
    && packet.receiptValid
    && packet.bindingMatches
    && packet.reportedResult === 'PASS'
    && packet.currentCandidateIdentity !== null
    && packet.canonicalReceiptSha256 !== null;
}

function evidenceReferenceSha256(reference: string): string {
  return `sha256:${sha256Hex(reference)}`;
}

/**
 * Validate a caller-supplied report claiming an external party authenticated the exact native-serialization evidence.
 *
 * This function does not fetch evidence, identify an authenticator, verify signatures, authenticate evidence itself,
 * execute WordPress, or make an internal acceptance decision. It validates only bounded report structure and exact
 * binding to the current candidate identity, canonical receipt hash, and SHA-256 of the receipt evidenceReference.
 */
export function validateGutenbergNativeSerializationAuthenticationReport(
  reportValue: unknown,
  documentValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
): GutenbergNativeSerializationAuthenticationValidationResult {
  const issues: GutenbergNativeSerializationAuthenticationIssue[] = [];
  const packet = buildGutenbergNativeSerializationReviewPacket(
    documentValue,
    profileValue,
    receiptValue,
  );
  const ready = authenticationReady(packet);
  const currentCandidateIdentity = packet.currentCandidateIdentity;
  const canonicalReceiptSha256 = packet.canonicalReceiptSha256;

  if (!ready) {
    issues.push({
      code: 'P16_NATIVE_AUTH_PREREQUISITE_NOT_READY',
      path: '$prerequisite',
      message: 'External authentication reporting requires an exact current REPORTED_PASS_AUTHENTICATION_REQUIRED pre-decision packet.',
    });
  }

  const receipt = ready
    ? receiptValue as GutenbergNativeSerializationValidationReceiptV1
    : null;
  const expectedEvidenceReferenceHash = receipt
    ? evidenceReferenceSha256(receipt.evidenceReference)
    : null;

  let bindingMatches = false;
  let evidenceReferenceHashMatches = false;
  let evidenceAuthenticationReportedResult: GutenbergNativeSerializationAuthenticationReportedResult | null = null;

  if (!isRecord(reportValue)) {
    issues.push({
      code: 'P16_NATIVE_AUTH_REPORT_NOT_OBJECT',
      path: '$',
      message: 'Native-serialization authentication report must be an object.',
    });
  } else {
    if (!exactKeys(reportValue, REPORT_KEYS)) {
      issues.push({
        code: 'P16_NATIVE_AUTH_REPORT_SHAPE_INVALID',
        path: '$',
        message: 'Native-serialization authentication report must contain exactly the versioned report fields.',
      });
    }

    if (reportValue.schemaVersion !== 1
      || reportValue.reportVersion !== GUTENBERG_NATIVE_SERIALIZATION_AUTHENTICATION_REPORT_VERSION) {
      issues.push({
        code: 'P16_NATIVE_AUTH_REPORT_VERSION_INVALID',
        path: '$.reportVersion',
        message: 'Native-serialization authentication report schema/version is unsupported.',
      });
    }

    const baseBindingMatches = ready
      && currentCandidateIdentity !== null
      && canonicalReceiptSha256 !== null
      && reportValue.candidateIdentityDigest === currentCandidateIdentity.digest
      && reportValue.canonicalReceiptSha256 === canonicalReceiptSha256;
    if (!baseBindingMatches) {
      issues.push({
        code: 'P16_NATIVE_AUTH_BINDING_INVALID',
        path: '$',
        message: 'Authentication report is stale, malformed, forged, or not bound to the exact current candidate identity and canonical receipt.',
      });
    }

    if (!isCanonicalIsoTimestamp(reportValue.reportedAt)) {
      issues.push({
        code: 'P16_NATIVE_AUTH_REPORTED_AT_INVALID',
        path: '$.reportedAt',
        message: 'reportedAt must be a canonical ISO-8601 UTC timestamp.',
      });
    }

    if (isRecord(reportValue.evidenceAuthentication)
      && exactKeys(reportValue.evidenceAuthentication, EVIDENCE_AUTH_KEYS)
      && (reportValue.evidenceAuthentication.result === 'PASS'
        || reportValue.evidenceAuthentication.result === 'FAIL')
      && isSha256(reportValue.evidenceAuthentication.sourceEvidenceReferenceSha256)
      && expectedEvidenceReferenceHash !== null) {
      evidenceReferenceHashMatches = reportValue.evidenceAuthentication.sourceEvidenceReferenceSha256
        === expectedEvidenceReferenceHash;
      if (evidenceReferenceHashMatches) {
        evidenceAuthenticationReportedResult = reportValue.evidenceAuthentication.result;
      } else {
        issues.push({
          code: 'P16_NATIVE_AUTH_EVIDENCE_INVALID',
          path: '$.evidenceAuthentication',
          message: 'Evidence authentication must bind to SHA-256 of the exact source evidenceReference.',
        });
      }
    } else {
      issues.push({
        code: 'P16_NATIVE_AUTH_EVIDENCE_INVALID',
        path: '$.evidenceAuthentication',
        message: 'Evidence authentication must contain exactly PASS|FAIL and SHA-256 of the exact source evidenceReference.',
      });
    }

    if (reportValue.authenticationAuthority !== false
      || reportValue.nativeSerializationAuthority !== false
      || reportValue.targetEnvironmentValidated !== false
      || reportValue.editorImportValidated !== false
      || reportValue.renderValidated !== false
      || reportValue.acceptanceAuthority !== false
      || reportValue.targetCompatibilityClaim !== false
      || reportValue.productionAcceptance !== false
      || reportValue.generationEnabled !== false
      || reportValue.downloadEnabled !== false
      || reportValue.internalDecisionStatus !== 'NOT_RUN'
      || reportValue.internalReviewRequired !== true) {
      issues.push({
        code: 'P16_NATIVE_AUTH_AUTHORITY_FLAGS_INVALID',
        path: '$',
        message: 'Externally reported authentication cannot grant authentication, serialization, environment, import/render, compatibility, production, generation, download, or internal-decision authority.',
      });
    }

    bindingMatches = baseBindingMatches && evidenceReferenceHashMatches;
  }

  const valid = issues.length === 0;
  const allRequiredAuthenticationReportsPass = valid
    && evidenceAuthenticationReportedResult === 'PASS';
  const status: GutenbergNativeSerializationAuthenticationStatus = !valid
    ? 'REJECTED'
    : allRequiredAuthenticationReportsPass
      ? 'EXTERNALLY_REPORTED_PASS'
      : 'EXTERNALLY_REPORTED_FAIL';

  return {
    valid,
    bindingMatches,
    status,
    currentCandidateIdentity,
    canonicalReceiptSha256,
    evidenceAuthenticationReportedResult,
    evidenceReferenceHashMatches,
    allRequiredAuthenticationReportsPass,
    issues,
    authenticationAuthority: false,
    nativeSerializationAuthority: false,
    targetEnvironmentValidated: false,
    editorImportValidated: false,
    renderValidated: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalDecisionStatus: 'NOT_RUN',
    internalReviewRequired: true,
  };
}

export function serializeGutenbergNativeSerializationAuthenticationReport(
  report: GutenbergNativeSerializationAuthenticationReportV1,
  documentValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
): string {
  const validation = validateGutenbergNativeSerializationAuthenticationReport(
    report,
    documentValue,
    profileValue,
    receiptValue,
  );
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Gutenberg native-serialization authentication report: ${first.code} at ${first.path}`
      : 'Invalid Gutenberg native-serialization authentication report.');
  }

  const normalized = {
    schemaVersion: 1,
    reportVersion: GUTENBERG_NATIVE_SERIALIZATION_AUTHENTICATION_REPORT_VERSION,
    candidateIdentityDigest: report.candidateIdentityDigest,
    canonicalReceiptSha256: report.canonicalReceiptSha256,
    reportedAt: report.reportedAt,
    evidenceAuthentication: {
      result: report.evidenceAuthentication.result,
      sourceEvidenceReferenceSha256: report.evidenceAuthentication.sourceEvidenceReferenceSha256,
    },
    authenticationAuthority: false,
    nativeSerializationAuthority: false,
    targetEnvironmentValidated: false,
    editorImportValidated: false,
    renderValidated: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalDecisionStatus: 'NOT_RUN',
    internalReviewRequired: true,
  } satisfies GutenbergNativeSerializationAuthenticationReportV1;

  return `${JSON.stringify(normalized, null, 2)}\n`;
}
