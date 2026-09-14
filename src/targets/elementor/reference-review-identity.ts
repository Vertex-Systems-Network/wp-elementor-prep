import { sha256Hex } from '../../core/sha256';
import {
  ELEMENTOR_GLOBAL_REFERENCE_REVIEW_VERSION,
  reviewElementorGlobalReferences,
  serializeElementorGlobalReferenceReview,
  type ElementorGlobalReferenceReviewV1,
} from './global-reference-review';
import {
  ELEMENTOR_ASSET_CONTROL_REGISTRY_VERSION,
  ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA,
  ELEMENTOR_ASSET_REFERENCE_REVIEW_VERSION,
  reviewElementorAssetReferences,
  serializeElementorAssetReferenceReview,
  type ElementorAssetReferenceReviewV1,
} from './asset-reference-review';

export const ELEMENTOR_REFERENCE_REVIEW_IDENTITY_VERSION = 'elementor-reference-review-identity-v1' as const;

export type ElementorReferenceReviewDisposition =
  | 'BLOCKED_UPSTREAM'
  | 'REVIEW_REQUIRED'
  | 'EXTERNAL_CLOSURE_REQUIRED'
  | 'NO_EXTERNAL_REFERENCE_CLOSURE_REQUIRED';

export interface ElementorReferenceReviewIdentityV1 {
  schemaVersion: 1;
  identityVersion: typeof ELEMENTOR_REFERENCE_REVIEW_IDENTITY_VERSION;
  globalReviewVersion: typeof ELEMENTOR_GLOBAL_REFERENCE_REVIEW_VERSION;
  assetReviewVersion: typeof ELEMENTOR_ASSET_REFERENCE_REVIEW_VERSION;
  assetControlRegistryVersion: typeof ELEMENTOR_ASSET_CONTROL_REGISTRY_VERSION;
  assetEvidenceSourceSha: typeof ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA;
  disposition: ElementorReferenceReviewDisposition;
  upstreamAssessmentStatus: ElementorGlobalReferenceReviewV1['upstreamAssessmentStatus'];
  upstreamReviewRequired: boolean;
  profileFingerprint: string | null;
  candidateFingerprint: string | null;
  globalReferenceReviewStatus: ElementorGlobalReferenceReviewV1['status'];
  globalReferenceClosureStatus: ElementorGlobalReferenceReviewV1['globalReferenceClosureStatus'];
  assetReferenceReviewStatus: ElementorAssetReferenceReviewV1['status'];
  assetReferenceStatus: ElementorAssetReferenceReviewV1['assetReferenceStatus'];
  externalClosureRequired: boolean;
  algorithm: 'SHA-256';
  digest: string;
  referenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const IDENTITY_KEYS = [
  'schemaVersion',
  'identityVersion',
  'globalReviewVersion',
  'assetReviewVersion',
  'assetControlRegistryVersion',
  'assetEvidenceSourceSha',
  'disposition',
  'upstreamAssessmentStatus',
  'upstreamReviewRequired',
  'profileFingerprint',
  'candidateFingerprint',
  'globalReferenceReviewStatus',
  'globalReferenceClosureStatus',
  'assetReferenceReviewStatus',
  'assetReferenceStatus',
  'externalClosureRequired',
  'algorithm',
  'digest',
  'referenceClosureClaim',
  'targetCompatibilityClaim',
  'productionAcceptance',
  'generationEnabled',
  'downloadEnabled',
  'internalReviewRequired',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sameNullableBinding(left: string | null, right: string | null): boolean {
  return left === right;
}

function assertReviewBindings(
  globalReview: ElementorGlobalReferenceReviewV1,
  assetReview: ElementorAssetReferenceReviewV1,
): void {
  if (!sameNullableBinding(globalReview.profileFingerprint, assetReview.profileFingerprint)
    || !sameNullableBinding(globalReview.candidateFingerprint, assetReview.candidateFingerprint)
    || globalReview.upstreamAssessmentStatus !== assetReview.upstreamAssessmentStatus
    || globalReview.upstreamReviewRequired !== assetReview.upstreamReviewRequired
    || globalReview.status !== assetReview.globalReferenceReviewStatus
    || globalReview.globalReferenceClosureStatus !== assetReview.globalReferenceClosureStatus) {
    throw new Error('Elementor global/asset reference reviews are not bound to the same upstream evidence.');
  }
}

function deriveDisposition(
  globalReview: ElementorGlobalReferenceReviewV1,
  assetReview: ElementorAssetReferenceReviewV1,
): { disposition: ElementorReferenceReviewDisposition; externalClosureRequired: boolean } {
  const externalClosureRequired = globalReview.status === 'EXTERNAL_CLOSURE_REQUIRED'
    || assetReview.status === 'EXTERNAL_ASSET_CLOSURE_REQUIRED';

  if (globalReview.status === 'BLOCKED_UPSTREAM' || assetReview.status === 'BLOCKED_UPSTREAM') {
    return { disposition: 'BLOCKED_UPSTREAM', externalClosureRequired: false };
  }

  if (globalReview.upstreamReviewRequired
    || assetReview.upstreamReviewRequired
    || assetReview.status === 'REVIEW_REQUIRED_UNSUPPORTED_ASSET_SHAPE') {
    return { disposition: 'REVIEW_REQUIRED', externalClosureRequired };
  }

  if (externalClosureRequired) {
    return { disposition: 'EXTERNAL_CLOSURE_REQUIRED', externalClosureRequired: true };
  }

  return { disposition: 'NO_EXTERNAL_REFERENCE_CLOSURE_REQUIRED', externalClosureRequired: false };
}

function digestMaterial(
  globalReview: ElementorGlobalReferenceReviewV1,
  assetReview: ElementorAssetReferenceReviewV1,
): string {
  const globalReviewJson = serializeElementorGlobalReferenceReview(globalReview);
  const assetReviewJson = serializeElementorAssetReferenceReview(assetReview);
  return JSON.stringify({
    identityVersion: ELEMENTOR_REFERENCE_REVIEW_IDENTITY_VERSION,
    globalReviewVersion: ELEMENTOR_GLOBAL_REFERENCE_REVIEW_VERSION,
    assetReviewVersion: ELEMENTOR_ASSET_REFERENCE_REVIEW_VERSION,
    assetControlRegistryVersion: ELEMENTOR_ASSET_CONTROL_REGISTRY_VERSION,
    assetEvidenceSourceSha: ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA,
    profileFingerprint: globalReview.profileFingerprint,
    candidateFingerprint: globalReview.candidateFingerprint,
    globalReviewJson,
    assetReviewJson,
  });
}

/**
 * Build one exact, non-authorizing identity for the current global + documented asset review state.
 *
 * The digest binds candidate/profile identity plus canonical sanitized review evidence. Raw global-reference
 * values and raw asset URLs are absent from both canonical review serializers, while candidate fingerprints
 * still make source-setting changes stale. This identity is not a closure receipt or compatibility proof.
 */
export function buildElementorReferenceReviewIdentity(
  templateValue: unknown,
  profileValue: unknown,
): ElementorReferenceReviewIdentityV1 {
  const globalReview = reviewElementorGlobalReferences(templateValue, profileValue);
  const assetReview = reviewElementorAssetReferences(templateValue, profileValue);
  assertReviewBindings(globalReview, assetReview);

  const { disposition, externalClosureRequired } = deriveDisposition(globalReview, assetReview);
  const digest = `sha256:${sha256Hex(digestMaterial(globalReview, assetReview))}`;

  return {
    schemaVersion: 1,
    identityVersion: ELEMENTOR_REFERENCE_REVIEW_IDENTITY_VERSION,
    globalReviewVersion: ELEMENTOR_GLOBAL_REFERENCE_REVIEW_VERSION,
    assetReviewVersion: ELEMENTOR_ASSET_REFERENCE_REVIEW_VERSION,
    assetControlRegistryVersion: ELEMENTOR_ASSET_CONTROL_REGISTRY_VERSION,
    assetEvidenceSourceSha: ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA,
    disposition,
    upstreamAssessmentStatus: globalReview.upstreamAssessmentStatus,
    upstreamReviewRequired: globalReview.upstreamReviewRequired,
    profileFingerprint: globalReview.profileFingerprint,
    candidateFingerprint: globalReview.candidateFingerprint,
    globalReferenceReviewStatus: globalReview.status,
    globalReferenceClosureStatus: globalReview.globalReferenceClosureStatus,
    assetReferenceReviewStatus: assetReview.status,
    assetReferenceStatus: assetReview.assetReferenceStatus,
    externalClosureRequired,
    algorithm: 'SHA-256',
    digest,
    referenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

function exactIdentityKeys(value: Record<string, unknown>): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...IDENTITY_KEYS].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function callerIdentitySnapshot(identity: ElementorReferenceReviewIdentityV1): ElementorReferenceReviewIdentityV1 {
  return {
    schemaVersion: identity.schemaVersion,
    identityVersion: identity.identityVersion,
    globalReviewVersion: identity.globalReviewVersion,
    assetReviewVersion: identity.assetReviewVersion,
    assetControlRegistryVersion: identity.assetControlRegistryVersion,
    assetEvidenceSourceSha: identity.assetEvidenceSourceSha,
    disposition: identity.disposition,
    upstreamAssessmentStatus: identity.upstreamAssessmentStatus,
    upstreamReviewRequired: identity.upstreamReviewRequired,
    profileFingerprint: identity.profileFingerprint,
    candidateFingerprint: identity.candidateFingerprint,
    globalReferenceReviewStatus: identity.globalReferenceReviewStatus,
    globalReferenceClosureStatus: identity.globalReferenceClosureStatus,
    assetReferenceReviewStatus: identity.assetReferenceReviewStatus,
    assetReferenceStatus: identity.assetReferenceStatus,
    externalClosureRequired: identity.externalClosureRequired,
    algorithm: identity.algorithm,
    digest: identity.digest,
    referenceClosureClaim: identity.referenceClosureClaim,
    targetCompatibilityClaim: identity.targetCompatibilityClaim,
    productionAcceptance: identity.productionAcceptance,
    generationEnabled: identity.generationEnabled,
    downloadEnabled: identity.downloadEnabled,
    internalReviewRequired: identity.internalReviewRequired,
  };
}

/**
 * Serialize only an identity that exactly matches a fresh rebuild from the supplied template/profile.
 * This makes stale, authority-inflated or forged identity evidence fail closed before any future
 * closure-intake layer can reuse it.
 */
export function serializeElementorReferenceReviewIdentity(
  value: unknown,
  templateValue: unknown,
  profileValue: unknown,
): string {
  if (!isRecord(value) || !exactIdentityKeys(value)) {
    throw new Error('Invalid or stale Elementor reference-review identity.');
  }

  const expected = buildElementorReferenceReviewIdentity(templateValue, profileValue);
  const actual = callerIdentitySnapshot(value as unknown as ElementorReferenceReviewIdentityV1);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('Invalid or stale Elementor reference-review identity.');
  }

  return `${JSON.stringify(expected, null, 2)}\n`;
}
