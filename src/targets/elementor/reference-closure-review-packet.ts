import { sha256Hex } from '../../core/sha256';
import {
  serializeElementorReferenceClosureEvidenceReceipt,
  validateElementorReferenceClosureEvidenceReceipt,
  type ElementorReferenceClosureEvidenceIssue,
  type ElementorReferenceClosureEvidenceReceiptV1,
  type ElementorReferenceClosureReportedResult,
} from './reference-closure-evidence';
import type { ElementorReferenceReviewIdentityV1 } from './reference-review-identity';

export const ELEMENTOR_REFERENCE_CLOSURE_REVIEW_PACKET_VERSION = 'elementor-reference-closure-review-packet-v1' as const;

export type ElementorReferenceClosureReviewPacketStatus =
  | 'REJECTED_INVALID_RECEIPT'
  | 'REPORTED_FAIL_REVIEW_REQUIRED'
  | 'REPORTED_PASS_AUTHENTICATION_REQUIRED';

export type ElementorReferenceClosureReviewNextAction =
  | 'FIX_OR_RECAPTURE_EVIDENCE'
  | 'REVIEW_REPORTED_FAILURES'
  | 'AUTHENTICATE_EVIDENCE_THEN_INTERNAL_REVIEW';

export interface ElementorReferenceClosureReviewPacketV1 {
  schemaVersion: 1;
  packetVersion: typeof ELEMENTOR_REFERENCE_CLOSURE_REVIEW_PACKET_VERSION;
  status: ElementorReferenceClosureReviewPacketStatus;
  receiptValid: boolean;
  bindingMatches: boolean;
  currentReferenceReviewIdentity: ElementorReferenceReviewIdentityV1;
  reportedResults: {
    global: ElementorReferenceClosureReportedResult | null;
    asset: ElementorReferenceClosureReportedResult | null;
  };
  allRequiredEvidenceReportsPass: boolean;
  canonicalReceiptSha256: string | null;
  reviewNextAction: ElementorReferenceClosureReviewNextAction;
  evidenceAuthenticationStatus: 'NOT_RUN';
  internalDecisionStatus: 'NOT_RUN';
  issues: ElementorReferenceClosureEvidenceIssue[];
  acceptanceAuthority: false;
  referenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

function packetStatus(valid: boolean, allPass: boolean): ElementorReferenceClosureReviewPacketStatus {
  if (!valid) return 'REJECTED_INVALID_RECEIPT';
  return allPass ? 'REPORTED_PASS_AUTHENTICATION_REQUIRED' : 'REPORTED_FAIL_REVIEW_REQUIRED';
}

function nextAction(status: ElementorReferenceClosureReviewPacketStatus): ElementorReferenceClosureReviewNextAction {
  if (status === 'REJECTED_INVALID_RECEIPT') return 'FIX_OR_RECAPTURE_EVIDENCE';
  if (status === 'REPORTED_FAIL_REVIEW_REQUIRED') return 'REVIEW_REPORTED_FAILURES';
  return 'AUTHENTICATE_EVIDENCE_THEN_INTERNAL_REVIEW';
}

/**
 * Build a deterministic, sanitized pre-decision review packet for externally reported P15 reference-closure evidence.
 *
 * The packet deliberately does not authenticate evidence references and cannot create reference closure,
 * target compatibility, production acceptance, generation or download authority. A reported PASS only advances
 * the next action to evidence authentication followed by a separate internal review.
 */
export function buildElementorReferenceClosureReviewPacket(
  templateValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
): ElementorReferenceClosureReviewPacketV1 {
  const validation = validateElementorReferenceClosureEvidenceReceipt(
    receiptValue,
    templateValue,
    profileValue,
  );
  const status = packetStatus(validation.valid, validation.allRequiredEvidenceReportsPass);

  let canonicalReceiptSha256: string | null = null;
  if (validation.valid) {
    const canonicalReceipt = serializeElementorReferenceClosureEvidenceReceipt(
      receiptValue as ElementorReferenceClosureEvidenceReceiptV1,
      templateValue,
      profileValue,
    );
    canonicalReceiptSha256 = `sha256:${sha256Hex(canonicalReceipt)}`;
  }

  return {
    schemaVersion: 1,
    packetVersion: ELEMENTOR_REFERENCE_CLOSURE_REVIEW_PACKET_VERSION,
    status,
    receiptValid: validation.valid,
    bindingMatches: validation.bindingMatches,
    currentReferenceReviewIdentity: validation.currentIdentity,
    reportedResults: {
      global: validation.globalReportedResult,
      asset: validation.assetReportedResult,
    },
    allRequiredEvidenceReportsPass: validation.allRequiredEvidenceReportsPass,
    canonicalReceiptSha256,
    reviewNextAction: nextAction(status),
    evidenceAuthenticationStatus: 'NOT_RUN',
    internalDecisionStatus: 'NOT_RUN',
    issues: validation.issues.map((issue) => ({ ...issue })),
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

export function serializeElementorReferenceClosureReviewPacket(
  templateValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
): string {
  return `${JSON.stringify(
    buildElementorReferenceClosureReviewPacket(templateValue, profileValue, receiptValue),
    null,
    2,
  )}\n`;
}
