import { sha256Hex } from '../../core/sha256';
import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import type { ElementorTargetProfileV1 } from './target-profile';
import {
  buildElementorTargetManagedMediaReviewPrerequisite,
  serializeElementorTargetManagedMediaReviewPrerequisite,
} from './target-managed-media-review-prerequisite';
import {
  validateElementorTargetManagedMediaPortabilityEvidence,
  type ElementorTargetManagedMediaPortabilityEvidenceV1,
} from './target-managed-media-portability-evidence';

export const ELEMENTOR_TARGET_MANAGED_MEDIA_INTERNAL_DECISION_VERSION =
  'elementor-target-managed-media-internal-decision-v1' as const;

export type ElementorTargetManagedMediaInternalDecisionOutcome =
  | 'APPROVE_BOUNDED_ASSET_REFERENCE_CLOSURE'
  | 'REJECT_BOUNDED_ASSET_REFERENCE_CLOSURE'
  | 'DEFER_BOUNDED_ASSET_REFERENCE_CLOSURE';

export type ElementorTargetManagedMediaInternalDecisionClassification =
  | 'BOUNDED_ASSET_REFERENCE_CLOSURE_APPROVED'
  | 'BOUNDED_ASSET_REFERENCE_CLOSURE_REJECTED'
  | 'BOUNDED_ASSET_REFERENCE_CLOSURE_DEFERRED'
  | 'REJECTED';

export interface ElementorTargetManagedMediaInternalDecisionRecordV1 {
  schemaVersion: 1;
  decisionVersion: typeof ELEMENTOR_TARGET_MANAGED_MEDIA_INTERNAL_DECISION_VERSION;
  outcome: ElementorTargetManagedMediaInternalDecisionOutcome;
  decidedAt: string;
  decisionReference: string;
  candidateIdentityDigest: string;
  targetProfileFingerprint: string;
  reviewPrerequisiteSha256: string;
  portabilityEvidenceSha256: string;
  exportedTemplateSha256: string;
  sourceEvidenceReferenceSha256: string;
  authorityBoundary: {
    globalReferenceClosureClaim: false;
    arbitraryHostPortabilityClaim: false;
    attachmentIdPortabilityClaim: false;
    targetCompatibilityClaim: false;
    productionAcceptance: false;
    generationEnabled: false;
    downloadEnabled: false;
  };
}

export type ElementorTargetManagedMediaInternalDecisionIssueCode =
  | 'P15_MEDIA_DECISION_PREREQUISITE_NOT_READY'
  | 'P15_MEDIA_DECISION_PORTABILITY_NOT_READY'
  | 'P15_MEDIA_DECISION_PORTABILITY_SHA_INVALID'
  | 'P15_MEDIA_DECISION_NOT_OBJECT'
  | 'P15_MEDIA_DECISION_SHAPE_INVALID'
  | 'P15_MEDIA_DECISION_VERSION_INVALID'
  | 'P15_MEDIA_DECISION_OUTCOME_INVALID'
  | 'P15_MEDIA_DECISION_TIMESTAMP_INVALID'
  | 'P15_MEDIA_DECISION_CHRONOLOGY_INVALID'
  | 'P15_MEDIA_DECISION_REFERENCE_INVALID'
  | 'P15_MEDIA_DECISION_BINDING_INVALID'
  | 'P15_MEDIA_DECISION_AUTHORITY_BOUNDARY_INVALID';

export interface ElementorTargetManagedMediaInternalDecisionIssueV1 {
  code: ElementorTargetManagedMediaInternalDecisionIssueCode;
  path: string;
  message: string;
}

export interface ElementorTargetManagedMediaInternalDecisionResultV1 {
  valid: boolean;
  classification: ElementorTargetManagedMediaInternalDecisionClassification;
  reviewPrerequisiteReady: boolean;
  portabilityPass: boolean;
  decisionBindingMatches: boolean;
  candidateIdentityDigest: string | null;
  targetProfileFingerprint: string | null;
  reviewPrerequisiteSha256: string | null;
  portabilityEvidenceSha256: string | null;
  exportedTemplateSha256: string | null;
  sourceEvidenceReferenceSha256: string | null;
  decisionReferenceSha256: string | null;
  decidedAt: string | null;
  portabilityObservedAt: string | null;
  outcome: ElementorTargetManagedMediaInternalDecisionOutcome | null;
  internalDecisionStatus: 'NOT_RUN' | 'APPROVED' | 'REJECTED' | 'DEFERRED';
  boundedAssetReferenceClosureAuthority: boolean;
  authenticationAuthority: false;
  acceptanceAuthority: false;
  referenceClosureClaim: false;
  assetReferenceClosureClaim: boolean;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: boolean;
  issues: ElementorTargetManagedMediaInternalDecisionIssueV1[];
}

const RECORD_KEYS = [
  'schemaVersion',
  'decisionVersion',
  'outcome',
  'decidedAt',
  'decisionReference',
  'candidateIdentityDigest',
  'targetProfileFingerprint',
  'reviewPrerequisiteSha256',
  'portabilityEvidenceSha256',
  'exportedTemplateSha256',
  'sourceEvidenceReferenceSha256',
  'authorityBoundary',
] as const;

const AUTHORITY_BOUNDARY_KEYS = [
  'globalReferenceClosureClaim',
  'arbitraryHostPortabilityClaim',
  'attachmentIdPortabilityClaim',
  'targetCompatibilityClaim',
  'productionAcceptance',
  'generationEnabled',
  'downloadEnabled',
] as const;

const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/;

function sha256(value: string): string {
  return `sha256:${sha256Hex(value)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actualKeys = Object.keys(value).sort();
  const expectedKeys = [...expected].sort();
  return actualKeys.length === expectedKeys.length
    && actualKeys.every((key, index) => key === expectedKeys[index]);
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && SHA256_PATTERN.test(value);
}

function isCanonicalIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function isDecisionReference(value: unknown): value is string {
  return typeof value === 'string'
    && value.length >= 1
    && value.length <= 512
    && value.trim() === value
    && !/[\u0000-\u001f\u007f]/.test(value);
}

function isOutcome(value: unknown): value is ElementorTargetManagedMediaInternalDecisionOutcome {
  return value === 'APPROVE_BOUNDED_ASSET_REFERENCE_CLOSURE'
    || value === 'REJECT_BOUNDED_ASSET_REFERENCE_CLOSURE'
    || value === 'DEFER_BOUNDED_ASSET_REFERENCE_CLOSURE';
}

function authorityBoundaryValid(value: unknown): boolean {
  return isRecord(value)
    && exactKeys(value, AUTHORITY_BOUNDARY_KEYS)
    && value.globalReferenceClosureClaim === false
    && value.arbitraryHostPortabilityClaim === false
    && value.attachmentIdPortabilityClaim === false
    && value.targetCompatibilityClaim === false
    && value.productionAcceptance === false
    && value.generationEnabled === false
    && value.downloadEnabled === false;
}

function rejectedResult(
  issues: ElementorTargetManagedMediaInternalDecisionIssueV1[],
  facts: Partial<Pick<
    ElementorTargetManagedMediaInternalDecisionResultV1,
    | 'reviewPrerequisiteReady'
    | 'portabilityPass'
    | 'candidateIdentityDigest'
    | 'targetProfileFingerprint'
    | 'reviewPrerequisiteSha256'
    | 'portabilityEvidenceSha256'
    | 'exportedTemplateSha256'
    | 'sourceEvidenceReferenceSha256'
    | 'portabilityObservedAt'
  >> = {},
): ElementorTargetManagedMediaInternalDecisionResultV1 {
  return {
    valid: false,
    classification: 'REJECTED',
    reviewPrerequisiteReady: facts.reviewPrerequisiteReady ?? false,
    portabilityPass: facts.portabilityPass ?? false,
    decisionBindingMatches: false,
    candidateIdentityDigest: facts.candidateIdentityDigest ?? null,
    targetProfileFingerprint: facts.targetProfileFingerprint ?? null,
    reviewPrerequisiteSha256: facts.reviewPrerequisiteSha256 ?? null,
    portabilityEvidenceSha256: facts.portabilityEvidenceSha256 ?? null,
    exportedTemplateSha256: facts.exportedTemplateSha256 ?? null,
    sourceEvidenceReferenceSha256: facts.sourceEvidenceReferenceSha256 ?? null,
    decisionReferenceSha256: null,
    decidedAt: null,
    portabilityObservedAt: facts.portabilityObservedAt ?? null,
    outcome: null,
    internalDecisionStatus: 'NOT_RUN',
    boundedAssetReferenceClosureAuthority: false,
    authenticationAuthority: false,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    assetReferenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
    issues: issues.map((issue) => ({ ...issue })),
  };
}

/**
 * Validate one explicit operator-supplied internal decision against the exact bounded P15
 * target-managed-media evidence chain.
 *
 * This validator never manufactures a decision. CI/tests may exercise synthetic records, but
 * repository/runtime evidence remains NOT_RUN until a separate operator supplies a record.
 *
 * A valid APPROVE result can close only the exact bounded asset-reference question represented
 * by these inputs. It does not grant global reference closure, arbitrary-host or attachment-ID
 * portability, broad target compatibility, production acceptance, generation or download authority.
 */
export function validateElementorTargetManagedMediaInternalDecision(
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
  assetProofValue: unknown,
  integrityEvidenceValue: unknown,
  exportedTemplateValue: unknown,
  exportedTemplateSha256: string,
  portabilityEvidenceValue: unknown,
  portabilityEvidenceContentSha256: string,
  decisionValue: unknown,
): ElementorTargetManagedMediaInternalDecisionResultV1 {
  const prerequisite = buildElementorTargetManagedMediaReviewPrerequisite(
    candidate,
    profile,
    assetProofValue,
    integrityEvidenceValue,
  );
  const reviewPrerequisiteReady = prerequisite.status === 'READY_FOR_INTERNAL_REVIEW'
    && prerequisite.crossBindingMatches
    && prerequisite.candidateIdentityDigest !== null
    && prerequisite.targetProfileFingerprint !== null
    && prerequisite.sourceEvidenceReferenceSha256 !== null;

  if (!reviewPrerequisiteReady) {
    return rejectedResult([{
      code: 'P15_MEDIA_DECISION_PREREQUISITE_NOT_READY',
      path: '$prerequisite',
      message: 'Internal decision requires the exact READY_FOR_INTERNAL_REVIEW prerequisite.',
    }]);
  }

  let reviewPrerequisiteSha256: string;
  try {
    reviewPrerequisiteSha256 = sha256(serializeElementorTargetManagedMediaReviewPrerequisite(
      candidate,
      profile,
      assetProofValue,
      integrityEvidenceValue,
    ));
  } catch {
    return rejectedResult([{
      code: 'P15_MEDIA_DECISION_PREREQUISITE_NOT_READY',
      path: '$prerequisite',
      message: 'Internal decision prerequisite could not be serialized deterministically.',
    }], { reviewPrerequisiteReady: true });
  }

  if (!isSha256(portabilityEvidenceContentSha256)) {
    return rejectedResult([{
      code: 'P15_MEDIA_DECISION_PORTABILITY_SHA_INVALID',
      path: '$portabilityEvidenceSha256',
      message: 'Portability evidence content SHA-256 must bind the exact consumed evidence bytes.',
    }], {
      reviewPrerequisiteReady: true,
      candidateIdentityDigest: prerequisite.candidateIdentityDigest,
      targetProfileFingerprint: prerequisite.targetProfileFingerprint,
      reviewPrerequisiteSha256,
      exportedTemplateSha256: isSha256(exportedTemplateSha256) ? exportedTemplateSha256 : null,
      sourceEvidenceReferenceSha256: prerequisite.sourceEvidenceReferenceSha256,
    });
  }

  const portability = validateElementorTargetManagedMediaPortabilityEvidence(
    portabilityEvidenceValue,
    candidate,
    profile,
    assetProofValue,
    integrityEvidenceValue,
    exportedTemplateValue,
    exportedTemplateSha256,
  );
  const portabilityPass = portability.valid
    && portability.classification === 'CONTROLLED_CROSS_TARGET_MEDIA_PORTABILITY_PASS'
    && portability.reviewPrerequisiteReady
    && portability.exportBindingMatches
    && portability.sourceTargetMatches
    && portability.destinationTargetMatches
    && portability.evidenceReferenceMatches
    && portability.sourceProvenanceMatches
    && portability.destinationMediaBindingMatches
    && portability.contentIntegrityMatches;

  const portabilityEvidence = portabilityPass && isRecord(portabilityEvidenceValue)
    ? portabilityEvidenceValue as unknown as ElementorTargetManagedMediaPortabilityEvidenceV1
    : null;
  const portabilityObservedAt = portabilityEvidence?.observedAt ?? null;

  const facts = {
    reviewPrerequisiteReady: true,
    portabilityPass,
    candidateIdentityDigest: prerequisite.candidateIdentityDigest,
    targetProfileFingerprint: prerequisite.targetProfileFingerprint,
    reviewPrerequisiteSha256,
    portabilityEvidenceSha256: portabilityEvidenceContentSha256,
    exportedTemplateSha256: isSha256(exportedTemplateSha256) ? exportedTemplateSha256 : null,
    sourceEvidenceReferenceSha256: prerequisite.sourceEvidenceReferenceSha256,
    portabilityObservedAt,
  } as const;

  if (!portabilityPass) {
    return rejectedResult([{
      code: 'P15_MEDIA_DECISION_PORTABILITY_NOT_READY',
      path: '$portabilityEvidence',
      message: 'Internal decision requires exact CONTROLLED_CROSS_TARGET_MEDIA_PORTABILITY_PASS evidence.',
    }], facts);
  }

  const issues: ElementorTargetManagedMediaInternalDecisionIssueV1[] = [];
  if (!isRecord(decisionValue)) {
    return rejectedResult([{
      code: 'P15_MEDIA_DECISION_NOT_OBJECT',
      path: '$',
      message: 'Internal decision record must be an object.',
    }], facts);
  }

  if (!exactKeys(decisionValue, RECORD_KEYS)) {
    issues.push({
      code: 'P15_MEDIA_DECISION_SHAPE_INVALID',
      path: '$',
      message: 'Internal decision record must contain exactly the versioned decision fields.',
    });
  }
  if (decisionValue.schemaVersion !== 1
    || decisionValue.decisionVersion !== ELEMENTOR_TARGET_MANAGED_MEDIA_INTERNAL_DECISION_VERSION) {
    issues.push({
      code: 'P15_MEDIA_DECISION_VERSION_INVALID',
      path: '$.decisionVersion',
      message: 'Internal decision record schema/version is unsupported.',
    });
  }
  if (!isOutcome(decisionValue.outcome)) {
    issues.push({
      code: 'P15_MEDIA_DECISION_OUTCOME_INVALID',
      path: '$.outcome',
      message: 'Internal decision outcome must be explicit bounded APPROVE, REJECT or DEFER.',
    });
  }
  if (!isCanonicalIsoTimestamp(decisionValue.decidedAt)) {
    issues.push({
      code: 'P15_MEDIA_DECISION_TIMESTAMP_INVALID',
      path: '$.decidedAt',
      message: 'decidedAt must be a canonical ISO-8601 UTC timestamp.',
    });
  } else if (portabilityObservedAt !== null
    && Date.parse(decisionValue.decidedAt) < Date.parse(portabilityObservedAt)) {
    issues.push({
      code: 'P15_MEDIA_DECISION_CHRONOLOGY_INVALID',
      path: '$.decidedAt',
      message: 'Internal decision cannot predate the exact portability observation it reviews.',
    });
  }
  if (!isDecisionReference(decisionValue.decisionReference)) {
    issues.push({
      code: 'P15_MEDIA_DECISION_REFERENCE_INVALID',
      path: '$.decisionReference',
      message: 'decisionReference must be a bounded opaque operator reference without control characters.',
    });
  }

  const bindingMatches = decisionValue.candidateIdentityDigest === prerequisite.candidateIdentityDigest
    && decisionValue.targetProfileFingerprint === prerequisite.targetProfileFingerprint
    && decisionValue.reviewPrerequisiteSha256 === reviewPrerequisiteSha256
    && decisionValue.portabilityEvidenceSha256 === portabilityEvidenceContentSha256
    && decisionValue.exportedTemplateSha256 === exportedTemplateSha256
    && decisionValue.sourceEvidenceReferenceSha256 === prerequisite.sourceEvidenceReferenceSha256;
  if (!bindingMatches) {
    issues.push({
      code: 'P15_MEDIA_DECISION_BINDING_INVALID',
      path: '$',
      message: 'Internal decision record is stale or not bound to the exact current review/evidence chain.',
    });
  }

  if (!authorityBoundaryValid(decisionValue.authorityBoundary)) {
    issues.push({
      code: 'P15_MEDIA_DECISION_AUTHORITY_BOUNDARY_INVALID',
      path: '$.authorityBoundary',
      message: 'Internal decision must explicitly preserve all authority outside the bounded asset-reference closure scope.',
    });
  }

  if (issues.length > 0 || !isOutcome(decisionValue.outcome) || !isDecisionReference(decisionValue.decisionReference)) {
    return rejectedResult(issues, facts);
  }

  const outcome = decisionValue.outcome;
  const approved = outcome === 'APPROVE_BOUNDED_ASSET_REFERENCE_CLOSURE';
  const rejected = outcome === 'REJECT_BOUNDED_ASSET_REFERENCE_CLOSURE';
  const classification: ElementorTargetManagedMediaInternalDecisionClassification = approved
    ? 'BOUNDED_ASSET_REFERENCE_CLOSURE_APPROVED'
    : rejected
      ? 'BOUNDED_ASSET_REFERENCE_CLOSURE_REJECTED'
      : 'BOUNDED_ASSET_REFERENCE_CLOSURE_DEFERRED';

  return {
    valid: true,
    classification,
    reviewPrerequisiteReady: true,
    portabilityPass: true,
    decisionBindingMatches: true,
    candidateIdentityDigest: prerequisite.candidateIdentityDigest,
    targetProfileFingerprint: prerequisite.targetProfileFingerprint,
    reviewPrerequisiteSha256,
    portabilityEvidenceSha256: portabilityEvidenceContentSha256,
    exportedTemplateSha256,
    sourceEvidenceReferenceSha256: prerequisite.sourceEvidenceReferenceSha256,
    decisionReferenceSha256: sha256(decisionValue.decisionReference),
    decidedAt: decisionValue.decidedAt as string,
    portabilityObservedAt,
    outcome,
    internalDecisionStatus: approved ? 'APPROVED' : rejected ? 'REJECTED' : 'DEFERRED',
    boundedAssetReferenceClosureAuthority: approved,
    authenticationAuthority: false,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    assetReferenceClosureClaim: approved,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: !approved && !rejected,
    issues: [],
  };
}
