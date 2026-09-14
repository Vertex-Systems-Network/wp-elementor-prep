import { sha256Hex } from '../../core/sha256';
import {
  ELEMENTOR_TEMPLATE_CANDIDATE_VERSION,
  buildElementorTemplateCandidateArtifact,
  serializeElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import { ELEMENTOR_CAPABILITY_REGISTRY_VERSION } from './capability-registry';
import { ELEMENTOR_TEMPLATE_CONTRACT_VERSION } from './template-v04';

export const ELEMENTOR_CANDIDATE_IDENTITY_VERSION = 'elementor-template-candidate-identity-v1' as const;
export const ELEMENTOR_IMPORT_VALIDATION_RECEIPT_VERSION = 'elementor-import-validation-receipt-v1' as const;

export interface ElementorTemplateCandidateIdentityV1 {
  schemaVersion: 1;
  identityVersion: typeof ELEMENTOR_CANDIDATE_IDENTITY_VERSION;
  candidateVersion: typeof ELEMENTOR_TEMPLATE_CANDIDATE_VERSION;
  targetContractVersion: typeof ELEMENTOR_TEMPLATE_CONTRACT_VERSION;
  capabilityRegistryVersion: typeof ELEMENTOR_CAPABILITY_REGISTRY_VERSION;
  algorithm: 'SHA-256';
  digest: string;
}

export interface ElementorImportValidationReceiptV1 {
  schemaVersion: 1;
  receiptVersion: typeof ELEMENTOR_IMPORT_VALIDATION_RECEIPT_VERSION;
  candidateIdentity: ElementorTemplateCandidateIdentityV1;
  target: {
    wordpressVersion: string;
    elementorVersion: string;
    importSurface: 'TEMPLATE_LIBRARY_JSON';
  };
  observedAt: string;
  observedResult: 'PASS' | 'FAIL';
  evidenceReference: string;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type ElementorImportValidationIssueCode =
  | 'P15_IMPORT_CANDIDATE_NOT_READY'
  | 'P15_IMPORT_CANDIDATE_NONCANONICAL'
  | 'P15_IMPORT_RECEIPT_NOT_OBJECT'
  | 'P15_IMPORT_RECEIPT_VERSION_INVALID'
  | 'P15_IMPORT_RECEIPT_IDENTITY_INVALID'
  | 'P15_IMPORT_RECEIPT_BINDING_MISMATCH'
  | 'P15_IMPORT_TARGET_INVALID'
  | 'P15_IMPORT_OBSERVED_AT_INVALID'
  | 'P15_IMPORT_RESULT_INVALID'
  | 'P15_IMPORT_EVIDENCE_REFERENCE_INVALID'
  | 'P15_IMPORT_AUTHORITY_FLAGS_INVALID';

export interface ElementorImportValidationIssue {
  code: ElementorImportValidationIssueCode;
  path: string;
  message: string;
}

export interface ElementorImportValidationReceiptResult {
  valid: boolean;
  bindingMatches: boolean;
  observedResult: 'PASS' | 'FAIL' | null;
  candidateIdentity: ElementorTemplateCandidateIdentityV1 | null;
  issues: ElementorImportValidationIssue[];
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isCanonicalIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function identityEquals(
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

function snapshotIdentity(value: unknown): ElementorTemplateCandidateIdentityV1 | null {
  if (!isRecord(value)) return null;
  if (value.schemaVersion !== 1
    || value.identityVersion !== ELEMENTOR_CANDIDATE_IDENTITY_VERSION
    || value.candidateVersion !== ELEMENTOR_TEMPLATE_CANDIDATE_VERSION
    || value.targetContractVersion !== ELEMENTOR_TEMPLATE_CONTRACT_VERSION
    || value.capabilityRegistryVersion !== ELEMENTOR_CAPABILITY_REGISTRY_VERSION
    || value.algorithm !== 'SHA-256'
    || typeof value.digest !== 'string'
    || !/^sha256:[0-9a-f]{64}$/.test(value.digest)) {
    return null;
  }

  return {
    schemaVersion: 1,
    identityVersion: ELEMENTOR_CANDIDATE_IDENTITY_VERSION,
    candidateVersion: ELEMENTOR_TEMPLATE_CANDIDATE_VERSION,
    targetContractVersion: ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
    capabilityRegistryVersion: ELEMENTOR_CAPABILITY_REGISTRY_VERSION,
    algorithm: 'SHA-256',
    digest: value.digest,
  };
}

function inspectCanonicalReadyCandidate(candidate: ElementorTemplateCandidateArtifactV1): {
  status: 'READY' | 'NOT_READY' | 'NONCANONICAL';
  serialized: string | null;
} {
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION' || typeof candidate.templateJson !== 'string') {
    return { status: 'NOT_READY', serialized: null };
  }

  try {
    const parsedTemplate: unknown = JSON.parse(candidate.templateJson);
    const rebuilt = buildElementorTemplateCandidateArtifact(parsedTemplate);
    if (rebuilt.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION') {
      return { status: 'NONCANONICAL', serialized: null };
    }

    const serialized = serializeElementorTemplateCandidateArtifact(candidate);
    const rebuiltSerialized = serializeElementorTemplateCandidateArtifact(rebuilt);
    if (serialized !== rebuiltSerialized) {
      return { status: 'NONCANONICAL', serialized: null };
    }

    return { status: 'READY', serialized };
  } catch {
    return { status: 'NONCANONICAL', serialized: null };
  }
}

/**
 * Build a compact integrity identity for one exact canonical candidate artifact.
 *
 * This SHA-256 digest is not a signature, authentication proof, import proof, or authorization token.
 */
export function buildElementorTemplateCandidateIdentity(
  candidate: ElementorTemplateCandidateArtifactV1,
): ElementorTemplateCandidateIdentityV1 {
  const inspection = inspectCanonicalReadyCandidate(candidate);
  if (inspection.status === 'NOT_READY') {
    throw new Error('Elementor candidate is not ready for target import validation.');
  }
  if (inspection.status !== 'READY' || inspection.serialized === null) {
    throw new Error('Elementor candidate is not the canonical artifact derived from its template JSON.');
  }

  return {
    schemaVersion: 1,
    identityVersion: ELEMENTOR_CANDIDATE_IDENTITY_VERSION,
    candidateVersion: ELEMENTOR_TEMPLATE_CANDIDATE_VERSION,
    targetContractVersion: ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
    capabilityRegistryVersion: ELEMENTOR_CAPABILITY_REGISTRY_VERSION,
    algorithm: 'SHA-256',
    digest: `sha256:${sha256Hex(inspection.serialized)}`,
  };
}

/**
 * Validate externally captured target-import evidence against one exact canonical candidate.
 *
 * A valid receipt means only that the receipt is well-formed and bound to these exact candidate bytes.
 * Even observedResult=PASS does not grant target compatibility, download authority, production acceptance,
 * authentication, or proof that the external observation itself is truthful.
 */
export function validateElementorImportValidationReceipt(
  value: unknown,
  candidate: ElementorTemplateCandidateArtifactV1,
): ElementorImportValidationReceiptResult {
  const issues: ElementorImportValidationIssue[] = [];
  const inspection = inspectCanonicalReadyCandidate(candidate);
  let expectedIdentity: ElementorTemplateCandidateIdentityV1 | null = null;

  if (inspection.status === 'NOT_READY') {
    issues.push({
      code: 'P15_IMPORT_CANDIDATE_NOT_READY',
      path: '$candidate.status',
      message: 'Only a canonical READY_FOR_TARGET_IMPORT_VALIDATION candidate can receive target-import evidence.',
    });
  } else if (inspection.status === 'NONCANONICAL' || inspection.serialized === null) {
    issues.push({
      code: 'P15_IMPORT_CANDIDATE_NONCANONICAL',
      path: '$candidate',
      message: 'Candidate envelope does not exactly match the artifact rebuilt from its embedded template JSON.',
    });
  } else {
    expectedIdentity = {
      schemaVersion: 1,
      identityVersion: ELEMENTOR_CANDIDATE_IDENTITY_VERSION,
      candidateVersion: ELEMENTOR_TEMPLATE_CANDIDATE_VERSION,
      targetContractVersion: ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
      capabilityRegistryVersion: ELEMENTOR_CAPABILITY_REGISTRY_VERSION,
      algorithm: 'SHA-256',
      digest: `sha256:${sha256Hex(inspection.serialized)}`,
    };
  }

  let bindingMatches = false;
  let observedResult: 'PASS' | 'FAIL' | null = null;

  if (!isRecord(value)) {
    issues.push({
      code: 'P15_IMPORT_RECEIPT_NOT_OBJECT',
      path: '$',
      message: 'Import-validation receipt must be an object.',
    });
  } else {
    if (value.schemaVersion !== 1 || value.receiptVersion !== ELEMENTOR_IMPORT_VALIDATION_RECEIPT_VERSION) {
      issues.push({
        code: 'P15_IMPORT_RECEIPT_VERSION_INVALID',
        path: '$.receiptVersion',
        message: 'Import-validation receipt schema/version is unsupported.',
      });
    }

    const receiptIdentity = snapshotIdentity(value.candidateIdentity);
    if (!receiptIdentity) {
      issues.push({
        code: 'P15_IMPORT_RECEIPT_IDENTITY_INVALID',
        path: '$.candidateIdentity',
        message: 'Receipt candidate identity is malformed or uses a different contract version.',
      });
    } else if (expectedIdentity && identityEquals(receiptIdentity, expectedIdentity)) {
      bindingMatches = true;
    } else {
      issues.push({
        code: 'P15_IMPORT_RECEIPT_BINDING_MISMATCH',
        path: '$.candidateIdentity.digest',
        message: 'Receipt is not bound to the exact current canonical candidate artifact.',
      });
    }

    const target = value.target;
    if (!isRecord(target)
      || !isBoundedString(target.wordpressVersion, 64)
      || !isBoundedString(target.elementorVersion, 64)
      || target.importSurface !== 'TEMPLATE_LIBRARY_JSON') {
      issues.push({
        code: 'P15_IMPORT_TARGET_INVALID',
        path: '$.target',
        message: 'Receipt must retain bounded WordPress/Elementor versions and the TEMPLATE_LIBRARY_JSON import surface.',
      });
    }

    if (!isCanonicalIsoTimestamp(value.observedAt)) {
      issues.push({
        code: 'P15_IMPORT_OBSERVED_AT_INVALID',
        path: '$.observedAt',
        message: 'observedAt must be a canonical ISO-8601 UTC timestamp.',
      });
    }

    if (value.observedResult === 'PASS' || value.observedResult === 'FAIL') {
      observedResult = value.observedResult;
    } else {
      issues.push({
        code: 'P15_IMPORT_RESULT_INVALID',
        path: '$.observedResult',
        message: 'observedResult must be PASS or FAIL.',
      });
    }

    if (!isBoundedString(value.evidenceReference, 1024)) {
      issues.push({
        code: 'P15_IMPORT_EVIDENCE_REFERENCE_INVALID',
        path: '$.evidenceReference',
        message: 'A bounded non-empty reference to retained external target evidence is required.',
      });
    }

    if (value.acceptanceAuthority !== false
      || value.targetCompatibilityClaim !== false
      || value.productionAcceptance !== false
      || value.downloadEnabled !== false) {
      issues.push({
        code: 'P15_IMPORT_AUTHORITY_FLAGS_INVALID',
        path: '$',
        message: 'Import-validation receipt cannot grant acceptance, compatibility, production or download authority.',
      });
    }
  }

  return {
    valid: issues.length === 0,
    bindingMatches,
    observedResult,
    candidateIdentity: expectedIdentity,
    issues,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
  };
}

export function serializeElementorImportValidationReceipt(
  receipt: ElementorImportValidationReceiptV1,
  candidate: ElementorTemplateCandidateArtifactV1,
): string {
  const validation = validateElementorImportValidationReceipt(receipt, candidate);
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Elementor import-validation receipt: ${first.code} at ${first.path}`
      : 'Invalid Elementor import-validation receipt.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    receiptVersion: ELEMENTOR_IMPORT_VALIDATION_RECEIPT_VERSION,
    candidateIdentity: receipt.candidateIdentity,
    target: {
      wordpressVersion: receipt.target.wordpressVersion,
      elementorVersion: receipt.target.elementorVersion,
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: receipt.observedAt,
    observedResult: receipt.observedResult,
    evidenceReference: receipt.evidenceReference,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
  }, null, 2)}\n`;
}
