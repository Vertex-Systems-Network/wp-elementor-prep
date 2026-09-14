import { sha256Hex } from '../../core/sha256';
import {
  buildElementorReferenceClosureReviewPacket,
  type ElementorReferenceClosureReviewPacketV1,
} from './reference-closure-review-packet';
import type { ElementorReferenceClosureEvidenceReceiptV1 } from './reference-closure-evidence';
import type { ElementorReferenceReviewIdentityV1 } from './reference-review-identity';

export const ELEMENTOR_REFERENCE_CLOSURE_AUTHENTICATION_REPORT_VERSION =
  'elementor-reference-closure-authentication-report-v1' as const;

export type ElementorReferenceClosureAuthenticationReportedResult = 'PASS' | 'FAIL';
export type ElementorReferenceClosureAuthenticationStatus =
  | 'REJECTED'
  | 'EXTERNALLY_REPORTED_PASS'
  | 'EXTERNALLY_REPORTED_FAIL';

export interface ElementorReferenceClosureClassAuthenticationV1 {
  result: ElementorReferenceClosureAuthenticationReportedResult;
  sourceEvidenceReferenceSha256: string;
}

export interface ElementorReferenceClosureAuthenticationReportV1 {
  schemaVersion: 1;
  reportVersion: typeof ELEMENTOR_REFERENCE_CLOSURE_AUTHENTICATION_REPORT_VERSION;
  referenceReviewIdentityDigest: string;
  canonicalReceiptSha256: string;
  reportedAt: string;
  globalAuthentication: ElementorReferenceClosureClassAuthenticationV1 | null;
  assetAuthentication: ElementorReferenceClosureClassAuthenticationV1 | null;
  authenticationAuthority: false;
  acceptanceAuthority: false;
  referenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalDecisionStatus: 'NOT_RUN';
  internalReviewRequired: true;
}

export type ElementorReferenceClosureAuthenticationIssueCode =
  | 'P15_REFERENCE_AUTH_PREREQUISITE_NOT_READY'
  | 'P15_REFERENCE_AUTH_REPORT_NOT_OBJECT'
  | 'P15_REFERENCE_AUTH_REPORT_SHAPE_INVALID'
  | 'P15_REFERENCE_AUTH_REPORT_VERSION_INVALID'
  | 'P15_REFERENCE_AUTH_BINDING_INVALID'
  | 'P15_REFERENCE_AUTH_REPORTED_AT_INVALID'
  | 'P15_REFERENCE_AUTH_GLOBAL_REQUIRED'
  | 'P15_REFERENCE_AUTH_GLOBAL_UNEXPECTED'
  | 'P15_REFERENCE_AUTH_GLOBAL_INVALID'
  | 'P15_REFERENCE_AUTH_ASSET_REQUIRED'
  | 'P15_REFERENCE_AUTH_ASSET_UNEXPECTED'
  | 'P15_REFERENCE_AUTH_ASSET_INVALID'
  | 'P15_REFERENCE_AUTH_AUTHORITY_FLAGS_INVALID';

export interface ElementorReferenceClosureAuthenticationIssue {
  code: ElementorReferenceClosureAuthenticationIssueCode;
  path: string;
  message: string;
}

export interface ElementorReferenceClosureAuthenticationValidationResult {
  valid: boolean;
  bindingMatches: boolean;
  status: ElementorReferenceClosureAuthenticationStatus;
  currentReferenceReviewIdentity: ElementorReferenceReviewIdentityV1;
  canonicalReceiptSha256: string | null;
  globalAuthenticationReportedResult: ElementorReferenceClosureAuthenticationReportedResult | null;
  assetAuthenticationReportedResult: ElementorReferenceClosureAuthenticationReportedResult | null;
  allRequiredAuthenticationReportsPass: boolean;
  issues: ElementorReferenceClosureAuthenticationIssue[];
  authenticationAuthority: false;
  acceptanceAuthority: false;
  referenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalDecisionStatus: 'NOT_RUN';
  internalReviewRequired: true;
}

const REPORT_KEYS = [
  'schemaVersion',
  'reportVersion',
  'referenceReviewIdentityDigest',
  'canonicalReceiptSha256',
  'reportedAt',
  'globalAuthentication',
  'assetAuthentication',
  'authenticationAuthority',
  'acceptanceAuthority',
  'referenceClosureClaim',
  'targetCompatibilityClaim',
  'productionAcceptance',
  'generationEnabled',
  'downloadEnabled',
  'internalDecisionStatus',
  'internalReviewRequired',
] as const;

const CLASS_AUTH_KEYS = ['result', 'sourceEvidenceReferenceSha256'] as const;
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expectedKeys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function isCanonicalIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && SHA256_PATTERN.test(value);
}

function evidenceReferenceSha256(reference: string): string {
  return `sha256:${sha256Hex(reference)}`;
}

function classRequired(identity: ElementorReferenceReviewIdentityV1): {
  globalRequired: boolean;
  assetRequired: boolean;
} {
  return {
    globalRequired: identity.globalReferenceReviewStatus === 'EXTERNAL_CLOSURE_REQUIRED',
    assetRequired: identity.assetReferenceReviewStatus === 'EXTERNAL_ASSET_CLOSURE_REQUIRED',
  };
}

function expectedReferenceHash(
  receipt: ElementorReferenceClosureEvidenceReceiptV1,
  className: 'global' | 'asset',
): string | null {
  const evidence = className === 'global' ? receipt.globalClosureEvidence : receipt.assetClosureEvidence;
  return evidence ? evidenceReferenceSha256(evidence.evidenceReference) : null;
}

function inspectClassAuthentication(
  value: unknown,
  expectedHash: string,
): {
  valid: boolean;
  hashMatches: boolean;
  result: ElementorReferenceClosureAuthenticationReportedResult | null;
  snapshot: ElementorReferenceClosureClassAuthenticationV1 | null;
} {
  if (!isRecord(value) || !exactKeys(value, CLASS_AUTH_KEYS)) {
    return { valid: false, hashMatches: false, result: null, snapshot: null };
  }
  if ((value.result !== 'PASS' && value.result !== 'FAIL') || !isSha256(value.sourceEvidenceReferenceSha256)) {
    return { valid: false, hashMatches: false, result: null, snapshot: null };
  }
  const hashMatches = value.sourceEvidenceReferenceSha256 === expectedHash;
  return {
    valid: hashMatches,
    hashMatches,
    result: value.result,
    snapshot: hashMatches
      ? { result: value.result, sourceEvidenceReferenceSha256: value.sourceEvidenceReferenceSha256 }
      : null,
  };
}

function authenticationReady(packet: ElementorReferenceClosureReviewPacketV1): boolean {
  return packet.status === 'REPORTED_PASS_AUTHENTICATION_REQUIRED'
    && packet.receiptValid
    && packet.bindingMatches
    && packet.allRequiredEvidenceReportsPass
    && packet.canonicalReceiptSha256 !== null;
}

/**
 * Validate a caller-supplied report that says an external authenticator reviewed the exact closure evidence.
 *
 * This function does not fetch evidence, identify an authenticator, verify signatures, or authenticate anything
 * by itself. It only verifies that the supplied PASS|FAIL report is structurally bounded and exactly tied to the
 * current reference-review identity, canonical closure receipt, and SHA-256 of each required evidence reference.
 */
export function validateElementorReferenceClosureAuthenticationReport(
  reportValue: unknown,
  templateValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
): ElementorReferenceClosureAuthenticationValidationResult {
  const issues: ElementorReferenceClosureAuthenticationIssue[] = [];
  const packet = buildElementorReferenceClosureReviewPacket(templateValue, profileValue, receiptValue);
  const ready = authenticationReady(packet);
  const currentIdentity = packet.currentReferenceReviewIdentity;
  const canonicalReceiptSha256 = packet.canonicalReceiptSha256;
  const { globalRequired, assetRequired } = classRequired(currentIdentity);

  if (!ready) {
    issues.push({
      code: 'P15_REFERENCE_AUTH_PREREQUISITE_NOT_READY',
      path: '$prerequisite',
      message: 'External authentication reporting requires an exact current REPORTED_PASS_AUTHENTICATION_REQUIRED pre-decision packet.',
    });
  }

  const receipt = ready
    ? receiptValue as ElementorReferenceClosureEvidenceReceiptV1
    : null;
  const expectedGlobalHash = receipt ? expectedReferenceHash(receipt, 'global') : null;
  const expectedAssetHash = receipt ? expectedReferenceHash(receipt, 'asset') : null;

  let bindingMatches = false;
  let globalAuthenticationReportedResult: ElementorReferenceClosureAuthenticationReportedResult | null = null;
  let assetAuthenticationReportedResult: ElementorReferenceClosureAuthenticationReportedResult | null = null;
  let globalHashMatches = !globalRequired;
  let assetHashMatches = !assetRequired;

  if (!isRecord(reportValue)) {
    issues.push({
      code: 'P15_REFERENCE_AUTH_REPORT_NOT_OBJECT',
      path: '$',
      message: 'Reference-closure authentication report must be an object.',
    });
  } else {
    if (!exactKeys(reportValue, REPORT_KEYS)) {
      issues.push({
        code: 'P15_REFERENCE_AUTH_REPORT_SHAPE_INVALID',
        path: '$',
        message: 'Reference-closure authentication report must contain exactly the versioned report fields.',
      });
    }

    if (reportValue.schemaVersion !== 1
      || reportValue.reportVersion !== ELEMENTOR_REFERENCE_CLOSURE_AUTHENTICATION_REPORT_VERSION) {
      issues.push({
        code: 'P15_REFERENCE_AUTH_REPORT_VERSION_INVALID',
        path: '$.reportVersion',
        message: 'Reference-closure authentication report schema/version is unsupported.',
      });
    }

    const baseBindingMatches = ready
      && canonicalReceiptSha256 !== null
      && reportValue.referenceReviewIdentityDigest === currentIdentity.digest
      && reportValue.canonicalReceiptSha256 === canonicalReceiptSha256;
    if (!baseBindingMatches) {
      issues.push({
        code: 'P15_REFERENCE_AUTH_BINDING_INVALID',
        path: '$',
        message: 'Authentication report is stale, malformed, forged, or not bound to the exact current identity and closure receipt.',
      });
    }

    if (!isCanonicalIsoTimestamp(reportValue.reportedAt)) {
      issues.push({
        code: 'P15_REFERENCE_AUTH_REPORTED_AT_INVALID',
        path: '$.reportedAt',
        message: 'reportedAt must be a canonical ISO-8601 UTC timestamp.',
      });
    }

    if (globalRequired) {
      if (reportValue.globalAuthentication === null || reportValue.globalAuthentication === undefined || expectedGlobalHash === null) {
        issues.push({
          code: 'P15_REFERENCE_AUTH_GLOBAL_REQUIRED',
          path: '$.globalAuthentication',
          message: 'Current global-reference closure evidence requires an exact-bound external authentication report.',
        });
      } else {
        const inspection = inspectClassAuthentication(reportValue.globalAuthentication, expectedGlobalHash);
        globalHashMatches = inspection.hashMatches;
        if (!inspection.valid || !inspection.snapshot) {
          issues.push({
            code: 'P15_REFERENCE_AUTH_GLOBAL_INVALID',
            path: '$.globalAuthentication',
            message: 'Global authentication must contain exactly PASS|FAIL and the SHA-256 of the exact source evidenceReference.',
          });
        } else {
          globalAuthenticationReportedResult = inspection.result;
        }
      }
    } else if (reportValue.globalAuthentication !== null) {
      issues.push({
        code: 'P15_REFERENCE_AUTH_GLOBAL_UNEXPECTED',
        path: '$.globalAuthentication',
        message: 'Global authentication must be null when global reference closure evidence is not required.',
      });
    }

    if (assetRequired) {
      if (reportValue.assetAuthentication === null || reportValue.assetAuthentication === undefined || expectedAssetHash === null) {
        issues.push({
          code: 'P15_REFERENCE_AUTH_ASSET_REQUIRED',
          path: '$.assetAuthentication',
          message: 'Current asset-reference closure evidence requires an exact-bound external authentication report.',
        });
      } else {
        const inspection = inspectClassAuthentication(reportValue.assetAuthentication, expectedAssetHash);
        assetHashMatches = inspection.hashMatches;
        if (!inspection.valid || !inspection.snapshot) {
          issues.push({
            code: 'P15_REFERENCE_AUTH_ASSET_INVALID',
            path: '$.assetAuthentication',
            message: 'Asset authentication must contain exactly PASS|FAIL and the SHA-256 of the exact source evidenceReference.',
          });
        } else {
          assetAuthenticationReportedResult = inspection.result;
        }
      }
    } else if (reportValue.assetAuthentication !== null) {
      issues.push({
        code: 'P15_REFERENCE_AUTH_ASSET_UNEXPECTED',
        path: '$.assetAuthentication',
        message: 'Asset authentication must be null when asset reference closure evidence is not required.',
      });
    }

    if (reportValue.authenticationAuthority !== false
      || reportValue.acceptanceAuthority !== false
      || reportValue.referenceClosureClaim !== false
      || reportValue.targetCompatibilityClaim !== false
      || reportValue.productionAcceptance !== false
      || reportValue.generationEnabled !== false
      || reportValue.downloadEnabled !== false
      || reportValue.internalDecisionStatus !== 'NOT_RUN'
      || reportValue.internalReviewRequired !== true) {
      issues.push({
        code: 'P15_REFERENCE_AUTH_AUTHORITY_FLAGS_INVALID',
        path: '$',
        message: 'Externally reported authentication cannot grant authentication authority, closure, compatibility, production, generation, download, or an internal decision.',
      });
    }

    bindingMatches = baseBindingMatches && globalHashMatches && assetHashMatches;
  }

  const valid = issues.length === 0;
  const allRequiredAuthenticationReportsPass = valid
    && (!globalRequired || globalAuthenticationReportedResult === 'PASS')
    && (!assetRequired || assetAuthenticationReportedResult === 'PASS');
  const status: ElementorReferenceClosureAuthenticationStatus = !valid
    ? 'REJECTED'
    : allRequiredAuthenticationReportsPass
      ? 'EXTERNALLY_REPORTED_PASS'
      : 'EXTERNALLY_REPORTED_FAIL';

  return {
    valid,
    bindingMatches,
    status,
    currentReferenceReviewIdentity: currentIdentity,
    canonicalReceiptSha256,
    globalAuthenticationReportedResult,
    assetAuthenticationReportedResult,
    allRequiredAuthenticationReportsPass,
    issues,
    authenticationAuthority: false,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalDecisionStatus: 'NOT_RUN',
    internalReviewRequired: true,
  };
}

export function serializeElementorReferenceClosureAuthenticationReport(
  report: ElementorReferenceClosureAuthenticationReportV1,
  templateValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
): string {
  const validation = validateElementorReferenceClosureAuthenticationReport(
    report,
    templateValue,
    profileValue,
    receiptValue,
  );
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Elementor reference-closure authentication report: ${first.code} at ${first.path}`
      : 'Invalid Elementor reference-closure authentication report.');
  }

  const normalized = {
    schemaVersion: 1,
    reportVersion: ELEMENTOR_REFERENCE_CLOSURE_AUTHENTICATION_REPORT_VERSION,
    referenceReviewIdentityDigest: report.referenceReviewIdentityDigest,
    canonicalReceiptSha256: report.canonicalReceiptSha256,
    reportedAt: report.reportedAt,
    globalAuthentication: report.globalAuthentication
      ? {
        result: report.globalAuthentication.result,
        sourceEvidenceReferenceSha256: report.globalAuthentication.sourceEvidenceReferenceSha256,
      }
      : null,
    assetAuthentication: report.assetAuthentication
      ? {
        result: report.assetAuthentication.result,
        sourceEvidenceReferenceSha256: report.assetAuthentication.sourceEvidenceReferenceSha256,
      }
      : null,
    authenticationAuthority: false,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalDecisionStatus: 'NOT_RUN',
    internalReviewRequired: true,
  } satisfies ElementorReferenceClosureAuthenticationReportV1;

  return `${JSON.stringify(normalized, null, 2)}\n`;
}
