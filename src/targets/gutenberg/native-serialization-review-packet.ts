import { sha256Hex } from '../../core/sha256';
import { buildGutenbergNormalizedCandidateArtifact } from './candidate-artifact';
import {
  buildGutenbergNormalizedCandidateIdentity,
  type GutenbergNormalizedCandidateIdentityV1,
} from './candidate-identity';
import {
  GUTENBERG_NATIVE_SERIALIZATION_VALIDATION_RECEIPT_VERSION,
  validateGutenbergNativeSerializationValidationReceipt,
  type GutenbergNativeSerializationValidationIssue,
  type GutenbergNativeSerializationValidationReceiptV1,
} from './native-serialization-validation-contract';

export const GUTENBERG_NATIVE_SERIALIZATION_REVIEW_PACKET_VERSION =
  'gutenberg-native-serialization-review-packet-v1' as const;

export type GutenbergNativeSerializationReviewPacketStatus =
  | 'REJECTED_INVALID_RECEIPT'
  | 'REPORTED_FAIL_REVIEW_REQUIRED'
  | 'REPORTED_PASS_AUTHENTICATION_REQUIRED';

export type GutenbergNativeSerializationReviewNextAction =
  | 'FIX_OR_RECAPTURE_EVIDENCE'
  | 'REVIEW_REPORTED_FAILURES'
  | 'AUTHENTICATE_EVIDENCE_THEN_INTERNAL_REVIEW';

export interface GutenbergNativeSerializationReviewPacketV1 {
  schemaVersion: 1;
  packetVersion: typeof GUTENBERG_NATIVE_SERIALIZATION_REVIEW_PACKET_VERSION;
  status: GutenbergNativeSerializationReviewPacketStatus;
  candidateStatus: ReturnType<typeof buildGutenbergNormalizedCandidateArtifact>['status'];
  receiptValid: boolean;
  bindingMatches: boolean;
  currentCandidateIdentity: GutenbergNormalizedCandidateIdentityV1 | null;
  reportedResult: 'PASS' | 'FAIL' | null;
  reportedChecks: GutenbergNativeSerializationValidationReceiptV1['checks'] | null;
  nativeOutput: GutenbergNativeSerializationValidationReceiptV1['nativeOutput'] | null;
  canonicalReceiptSha256: string | null;
  reviewNextAction: GutenbergNativeSerializationReviewNextAction;
  evidenceAuthenticationStatus: 'NOT_RUN';
  internalDecisionStatus: 'NOT_RUN';
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

function packetStatus(
  valid: boolean,
  reportedResult: 'PASS' | 'FAIL' | null,
): GutenbergNativeSerializationReviewPacketStatus {
  if (!valid) return 'REJECTED_INVALID_RECEIPT';
  return reportedResult === 'PASS'
    ? 'REPORTED_PASS_AUTHENTICATION_REQUIRED'
    : 'REPORTED_FAIL_REVIEW_REQUIRED';
}

function nextAction(
  status: GutenbergNativeSerializationReviewPacketStatus,
): GutenbergNativeSerializationReviewNextAction {
  if (status === 'REJECTED_INVALID_RECEIPT') return 'FIX_OR_RECAPTURE_EVIDENCE';
  if (status === 'REPORTED_FAIL_REVIEW_REQUIRED') return 'REVIEW_REPORTED_FAILURES';
  return 'AUTHENTICATE_EVIDENCE_THEN_INTERNAL_REVIEW';
}

function canonicalReceiptJson(receipt: GutenbergNativeSerializationValidationReceiptV1): string {
  const canonical = {
    schemaVersion: 1,
    receiptVersion: GUTENBERG_NATIVE_SERIALIZATION_VALIDATION_RECEIPT_VERSION,
    candidateIdentity: {
      schemaVersion: 1,
      identityVersion: receipt.candidateIdentity.identityVersion,
      candidateVersion: receipt.candidateIdentity.candidateVersion,
      targetContractVersion: receipt.candidateIdentity.targetContractVersion,
      capabilityRegistryVersion: receipt.candidateIdentity.capabilityRegistryVersion,
      targetProfileVersion: receipt.candidateIdentity.targetProfileVersion,
      assessmentVersion: receipt.candidateIdentity.assessmentVersion,
      algorithm: 'SHA-256' as const,
      digest: receipt.candidateIdentity.digest,
    },
    target: {
      wordpressVersion: receipt.target.wordpressVersion,
      validationSurface: 'WORDPRESS_BLOCK_PARSE_SERIALIZE_ROUND_TRIP' as const,
    },
    observedAt: receipt.observedAt,
    observedResult: receipt.observedResult,
    checks: {
      parseSucceeded: receipt.checks.parseSucceeded,
      serializeSucceeded: receipt.checks.serializeSucceeded,
      roundTripStable: receipt.checks.roundTripStable,
      invalidBlockWarningsObserved: receipt.checks.invalidBlockWarningsObserved,
    },
    nativeOutput: {
      sha256: receipt.nativeOutput.sha256,
      byteLength: receipt.nativeOutput.byteLength,
    },
    evidenceReference: receipt.evidenceReference,
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

  return `${JSON.stringify(canonical, null, 2)}\n`;
}

/**
 * Build a deterministic, sanitized pre-decision packet for externally reported P16 native-serialization evidence.
 *
 * A reported PASS only advances to evidence authentication followed by a separate internal review. This function
 * does not execute WordPress, authenticate evidence, identify a verifier, validate a target environment, or grant
 * native-serialization, compatibility, production, generation or download authority.
 */
export function buildGutenbergNativeSerializationReviewPacket(
  documentValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
): GutenbergNativeSerializationReviewPacketV1 {
  const candidate = buildGutenbergNormalizedCandidateArtifact(documentValue, profileValue);
  const validation = validateGutenbergNativeSerializationValidationReceipt(receiptValue, candidate);
  const status = packetStatus(validation.valid, validation.reportedResult);

  let currentCandidateIdentity: GutenbergNormalizedCandidateIdentityV1 | null = null;
  if (candidate.status === 'READY_FOR_NATIVE_SERIALIZATION_VALIDATION') {
    try {
      currentCandidateIdentity = buildGutenbergNormalizedCandidateIdentity(candidate);
    } catch {
      currentCandidateIdentity = null;
    }
  }

  const canonicalReceiptSha256 = validation.valid
    ? `sha256:${sha256Hex(canonicalReceiptJson(receiptValue as GutenbergNativeSerializationValidationReceiptV1))}`
    : null;

  return {
    schemaVersion: 1,
    packetVersion: GUTENBERG_NATIVE_SERIALIZATION_REVIEW_PACKET_VERSION,
    status,
    candidateStatus: candidate.status,
    receiptValid: validation.valid,
    bindingMatches: validation.bindingMatches,
    currentCandidateIdentity,
    reportedResult: validation.reportedResult,
    reportedChecks: validation.reportedChecks ? { ...validation.reportedChecks } : null,
    nativeOutput: validation.nativeOutput ? { ...validation.nativeOutput } : null,
    canonicalReceiptSha256,
    reviewNextAction: nextAction(status),
    evidenceAuthenticationStatus: 'NOT_RUN',
    internalDecisionStatus: 'NOT_RUN',
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

export function serializeGutenbergNativeSerializationReviewPacket(
  documentValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
): string {
  return `${JSON.stringify(
    buildGutenbergNativeSerializationReviewPacket(documentValue, profileValue, receiptValue),
    null,
    2,
  )}\n`;
}
