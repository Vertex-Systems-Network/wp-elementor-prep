import {
  buildElementorReferenceReviewIdentity,
  serializeElementorReferenceReviewIdentity,
  type ElementorReferenceReviewIdentityV1,
} from './reference-review-identity';

export const ELEMENTOR_REFERENCE_CLOSURE_EVIDENCE_RECEIPT_VERSION = 'elementor-reference-closure-evidence-receipt-v1' as const;

export type ElementorReferenceClosureReportedResult = 'PASS' | 'FAIL';

export interface ElementorReferenceClosureClassEvidenceV1 {
  result: ElementorReferenceClosureReportedResult;
  evidenceReference: string;
}

export interface ElementorReferenceClosureEvidenceReceiptV1 {
  schemaVersion: 1;
  receiptVersion: typeof ELEMENTOR_REFERENCE_CLOSURE_EVIDENCE_RECEIPT_VERSION;
  referenceReviewIdentity: ElementorReferenceReviewIdentityV1;
  observedAt: string;
  globalClosureEvidence: ElementorReferenceClosureClassEvidenceV1 | null;
  assetClosureEvidence: ElementorReferenceClosureClassEvidenceV1 | null;
  acceptanceAuthority: false;
  referenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

export type ElementorReferenceClosureEvidenceIssueCode =
  | 'P15_REFERENCE_CLOSURE_RECEIPT_NOT_OBJECT'
  | 'P15_REFERENCE_CLOSURE_RECEIPT_SHAPE_INVALID'
  | 'P15_REFERENCE_CLOSURE_RECEIPT_VERSION_INVALID'
  | 'P15_REFERENCE_CLOSURE_IDENTITY_NOT_ELIGIBLE'
  | 'P15_REFERENCE_CLOSURE_IDENTITY_INVALID'
  | 'P15_REFERENCE_CLOSURE_OBSERVED_AT_INVALID'
  | 'P15_REFERENCE_CLOSURE_GLOBAL_EVIDENCE_REQUIRED'
  | 'P15_REFERENCE_CLOSURE_GLOBAL_EVIDENCE_UNEXPECTED'
  | 'P15_REFERENCE_CLOSURE_GLOBAL_EVIDENCE_INVALID'
  | 'P15_REFERENCE_CLOSURE_ASSET_EVIDENCE_REQUIRED'
  | 'P15_REFERENCE_CLOSURE_ASSET_EVIDENCE_UNEXPECTED'
  | 'P15_REFERENCE_CLOSURE_ASSET_EVIDENCE_INVALID'
  | 'P15_REFERENCE_CLOSURE_AUTHORITY_FLAGS_INVALID';

export interface ElementorReferenceClosureEvidenceIssue {
  code: ElementorReferenceClosureEvidenceIssueCode;
  path: string;
  message: string;
}

export interface ElementorReferenceClosureEvidenceValidationResult {
  valid: boolean;
  bindingMatches: boolean;
  currentIdentity: ElementorReferenceReviewIdentityV1;
  globalReportedResult: ElementorReferenceClosureReportedResult | null;
  assetReportedResult: ElementorReferenceClosureReportedResult | null;
  allRequiredEvidenceReportsPass: boolean;
  issues: ElementorReferenceClosureEvidenceIssue[];
  acceptanceAuthority: false;
  referenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const RECEIPT_KEYS = [
  'schemaVersion',
  'receiptVersion',
  'referenceReviewIdentity',
  'observedAt',
  'globalClosureEvidence',
  'assetClosureEvidence',
  'acceptanceAuthority',
  'referenceClosureClaim',
  'targetCompatibilityClaim',
  'productionAcceptance',
  'generationEnabled',
  'downloadEnabled',
  'internalReviewRequired',
] as const;

const CLASS_EVIDENCE_KEYS = ['result', 'evidenceReference'] as const;

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

function isBoundedEvidenceReference(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 1024;
}

function inspectClassEvidence(
  value: unknown,
): { valid: boolean; result: ElementorReferenceClosureReportedResult | null; snapshot: ElementorReferenceClosureClassEvidenceV1 | null } {
  if (!isRecord(value) || !exactKeys(value, CLASS_EVIDENCE_KEYS)) {
    return { valid: false, result: null, snapshot: null };
  }
  if ((value.result !== 'PASS' && value.result !== 'FAIL') || !isBoundedEvidenceReference(value.evidenceReference)) {
    return { valid: false, result: null, snapshot: null };
  }
  return {
    valid: true,
    result: value.result,
    snapshot: {
      result: value.result,
      evidenceReference: value.evidenceReference,
    },
  };
}

function classEvidenceRequired(identity: ElementorReferenceReviewIdentityV1): {
  globalRequired: boolean;
  assetRequired: boolean;
} {
  return {
    globalRequired: identity.globalReferenceReviewStatus === 'EXTERNAL_CLOSURE_REQUIRED',
    assetRequired: identity.assetReferenceReviewStatus === 'EXTERNAL_ASSET_CLOSURE_REQUIRED',
  };
}

/**
 * Validate externally captured class-specific closure evidence against the exact current reference-review identity.
 *
 * A valid receipt proves only that reported PASS/FAIL evidence is well-formed and exactly bound to the current
 * sanitized review identity. Evidence references are not fetched/authenticated and PASS is not an independent
 * closure, compatibility, import, generation, download or production-acceptance claim.
 */
export function validateElementorReferenceClosureEvidenceReceipt(
  value: unknown,
  templateValue: unknown,
  profileValue: unknown,
): ElementorReferenceClosureEvidenceValidationResult {
  const issues: ElementorReferenceClosureEvidenceIssue[] = [];
  const currentIdentity = buildElementorReferenceReviewIdentity(templateValue, profileValue);
  const eligible = currentIdentity.disposition === 'EXTERNAL_CLOSURE_REQUIRED';
  const { globalRequired, assetRequired } = classEvidenceRequired(currentIdentity);

  if (!eligible) {
    issues.push({
      code: 'P15_REFERENCE_CLOSURE_IDENTITY_NOT_ELIGIBLE',
      path: '$identity.disposition',
      message: 'External closure receipt intake requires current disposition EXTERNAL_CLOSURE_REQUIRED exactly.',
    });
  }

  let bindingMatches = false;
  let globalReportedResult: ElementorReferenceClosureReportedResult | null = null;
  let assetReportedResult: ElementorReferenceClosureReportedResult | null = null;
  let globalSnapshot: ElementorReferenceClosureClassEvidenceV1 | null = null;
  let assetSnapshot: ElementorReferenceClosureClassEvidenceV1 | null = null;

  if (!isRecord(value)) {
    issues.push({
      code: 'P15_REFERENCE_CLOSURE_RECEIPT_NOT_OBJECT',
      path: '$',
      message: 'Reference-closure evidence receipt must be an object.',
    });
  } else {
    if (!exactKeys(value, RECEIPT_KEYS)) {
      issues.push({
        code: 'P15_REFERENCE_CLOSURE_RECEIPT_SHAPE_INVALID',
        path: '$',
        message: 'Reference-closure evidence receipt must contain exactly the versioned receipt fields.',
      });
    }

    if (value.schemaVersion !== 1 || value.receiptVersion !== ELEMENTOR_REFERENCE_CLOSURE_EVIDENCE_RECEIPT_VERSION) {
      issues.push({
        code: 'P15_REFERENCE_CLOSURE_RECEIPT_VERSION_INVALID',
        path: '$.receiptVersion',
        message: 'Reference-closure evidence receipt schema/version is unsupported.',
      });
    }

    try {
      serializeElementorReferenceReviewIdentity(value.referenceReviewIdentity, templateValue, profileValue);
      bindingMatches = true;
    } catch {
      issues.push({
        code: 'P15_REFERENCE_CLOSURE_IDENTITY_INVALID',
        path: '$.referenceReviewIdentity',
        message: 'Receipt reference-review identity is stale, malformed, forged or not bound to the exact current template/profile.',
      });
    }

    if (!isCanonicalIsoTimestamp(value.observedAt)) {
      issues.push({
        code: 'P15_REFERENCE_CLOSURE_OBSERVED_AT_INVALID',
        path: '$.observedAt',
        message: 'observedAt must be a canonical ISO-8601 UTC timestamp.',
      });
    }

    if (globalRequired) {
      if (value.globalClosureEvidence === null || value.globalClosureEvidence === undefined) {
        issues.push({
          code: 'P15_REFERENCE_CLOSURE_GLOBAL_EVIDENCE_REQUIRED',
          path: '$.globalClosureEvidence',
          message: 'Current global-reference review requires externally captured closure evidence.',
        });
      } else {
        const inspection = inspectClassEvidence(value.globalClosureEvidence);
        if (!inspection.valid || !inspection.snapshot) {
          issues.push({
            code: 'P15_REFERENCE_CLOSURE_GLOBAL_EVIDENCE_INVALID',
            path: '$.globalClosureEvidence',
            message: 'Global closure evidence must contain exactly PASS|FAIL result and a bounded non-empty evidenceReference.',
          });
        } else {
          globalReportedResult = inspection.result;
          globalSnapshot = inspection.snapshot;
        }
      }
    } else if (value.globalClosureEvidence !== null) {
      issues.push({
        code: 'P15_REFERENCE_CLOSURE_GLOBAL_EVIDENCE_UNEXPECTED',
        path: '$.globalClosureEvidence',
        message: 'Global closure evidence must be null when current global references do not require external closure.',
      });
    }

    if (assetRequired) {
      if (value.assetClosureEvidence === null || value.assetClosureEvidence === undefined) {
        issues.push({
          code: 'P15_REFERENCE_CLOSURE_ASSET_EVIDENCE_REQUIRED',
          path: '$.assetClosureEvidence',
          message: 'Current documented asset-reference review requires externally captured closure evidence.',
        });
      } else {
        const inspection = inspectClassEvidence(value.assetClosureEvidence);
        if (!inspection.valid || !inspection.snapshot) {
          issues.push({
            code: 'P15_REFERENCE_CLOSURE_ASSET_EVIDENCE_INVALID',
            path: '$.assetClosureEvidence',
            message: 'Asset closure evidence must contain exactly PASS|FAIL result and a bounded non-empty evidenceReference.',
          });
        } else {
          assetReportedResult = inspection.result;
          assetSnapshot = inspection.snapshot;
        }
      }
    } else if (value.assetClosureEvidence !== null) {
      issues.push({
        code: 'P15_REFERENCE_CLOSURE_ASSET_EVIDENCE_UNEXPECTED',
        path: '$.assetClosureEvidence',
        message: 'Asset closure evidence must be null when current documented assets do not require external closure.',
      });
    }

    if (value.acceptanceAuthority !== false
      || value.referenceClosureClaim !== false
      || value.targetCompatibilityClaim !== false
      || value.productionAcceptance !== false
      || value.generationEnabled !== false
      || value.downloadEnabled !== false
      || value.internalReviewRequired !== true) {
      issues.push({
        code: 'P15_REFERENCE_CLOSURE_AUTHORITY_FLAGS_INVALID',
        path: '$',
        message: 'Reference-closure evidence cannot grant acceptance, closure, compatibility, production, generation or download authority.',
      });
    }
  }

  const valid = issues.length === 0;
  const allRequiredEvidenceReportsPass = valid
    && (!globalRequired || globalReportedResult === 'PASS')
    && (!assetRequired || assetReportedResult === 'PASS');

  void globalSnapshot;
  void assetSnapshot;

  return {
    valid,
    bindingMatches,
    currentIdentity,
    globalReportedResult,
    assetReportedResult,
    allRequiredEvidenceReportsPass,
    issues,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

export function serializeElementorReferenceClosureEvidenceReceipt(
  receipt: ElementorReferenceClosureEvidenceReceiptV1,
  templateValue: unknown,
  profileValue: unknown,
): string {
  const validation = validateElementorReferenceClosureEvidenceReceipt(receipt, templateValue, profileValue);
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Elementor reference-closure evidence receipt: ${first.code} at ${first.path}`
      : 'Invalid Elementor reference-closure evidence receipt.');
  }

  const globalEvidence = receipt.globalClosureEvidence
    ? { result: receipt.globalClosureEvidence.result, evidenceReference: receipt.globalClosureEvidence.evidenceReference }
    : null;
  const assetEvidence = receipt.assetClosureEvidence
    ? { result: receipt.assetClosureEvidence.result, evidenceReference: receipt.assetClosureEvidence.evidenceReference }
    : null;

  return `${JSON.stringify({
    schemaVersion: 1,
    receiptVersion: ELEMENTOR_REFERENCE_CLOSURE_EVIDENCE_RECEIPT_VERSION,
    referenceReviewIdentity: validation.currentIdentity,
    observedAt: receipt.observedAt,
    globalClosureEvidence: globalEvidence,
    assetClosureEvidence: assetEvidence,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  }, null, 2)}\n`;
}
