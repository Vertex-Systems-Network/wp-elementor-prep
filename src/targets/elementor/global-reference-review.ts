import { buildElementorTemplateCandidateArtifact } from './candidate-artifact';
import {
  assessElementorTargetProfileCompatibility,
  type ElementorTargetProfileAssessmentStatus,
} from './target-profile-assessment';

export const ELEMENTOR_GLOBAL_REFERENCE_REVIEW_VERSION = 'elementor-global-reference-review-v1' as const;

export type ElementorGlobalReferenceReviewStatus =
  | 'BLOCKED_UPSTREAM'
  | 'NO_GLOBAL_REFERENCES'
  | 'EXTERNAL_CLOSURE_REQUIRED';

export interface ElementorGlobalReferenceReviewEntryV1 {
  path: string;
  id: string;
  widgetType: string;
  settingKeys: string[];
}

export interface ElementorGlobalReferenceReviewV1 {
  schemaVersion: 1;
  reviewVersion: typeof ELEMENTOR_GLOBAL_REFERENCE_REVIEW_VERSION;
  status: ElementorGlobalReferenceReviewStatus;
  upstreamAssessmentStatus: ElementorTargetProfileAssessmentStatus;
  upstreamReviewRequired: boolean;
  profileFingerprint: string | null;
  candidateFingerprint: string | null;
  references: ElementorGlobalReferenceReviewEntryV1[];
  referencedWidgetCount: number;
  globalReferenceClosureStatus: 'BLOCKED' | 'NOT_REQUIRED' | 'NOT_VERIFIED';
  globalReferenceClosureClaim: false;
  assetReferenceStatus: 'NOT_RUN';
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

function cloneEntries(entries: ElementorGlobalReferenceReviewEntryV1[]): ElementorGlobalReferenceReviewEntryV1[] {
  return entries.map((entry) => ({
    ...entry,
    settingKeys: [...entry.settingKeys],
  }));
}

function validFingerprint(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}

function serializableReview(review: ElementorGlobalReferenceReviewV1): boolean {
  if (review.schemaVersion !== 1
    || review.reviewVersion !== ELEMENTOR_GLOBAL_REFERENCE_REVIEW_VERSION
    || review.globalReferenceClosureClaim !== false
    || review.assetReferenceStatus !== 'NOT_RUN'
    || review.targetCompatibilityClaim !== false
    || review.productionAcceptance !== false
    || review.generationEnabled !== false
    || review.downloadEnabled !== false
    || review.internalReviewRequired !== true
    || review.referencedWidgetCount !== review.references.length) {
    return false;
  }

  if (review.status === 'BLOCKED_UPSTREAM') {
    return review.globalReferenceClosureStatus === 'BLOCKED';
  }
  if (!validFingerprint(review.profileFingerprint) || !validFingerprint(review.candidateFingerprint)) {
    return false;
  }
  if (review.status === 'NO_GLOBAL_REFERENCES') {
    return review.references.length === 0 && review.globalReferenceClosureStatus === 'NOT_REQUIRED';
  }
  if (review.status === 'EXTERNAL_CLOSURE_REQUIRED') {
    return review.references.length > 0 && review.globalReferenceClosureStatus === 'NOT_VERIFIED';
  }
  return false;
}

/**
 * Inventory only global-reference setting keys already exposed by the bounded capability report.
 *
 * Raw `settings.__globals__` values are intentionally not retained or interpreted. A detected key means
 * external closure/review is still required; this gate never proves that a global style/class/variable exists
 * on a target site and never grants compatibility, generation or download authority.
 */
export function reviewElementorGlobalReferences(
  templateValue: unknown,
  profileValue: unknown,
): ElementorGlobalReferenceReviewV1 {
  const upstream = assessElementorTargetProfileCompatibility(templateValue, profileValue);
  const upstreamReviewRequired = upstream.status === 'REVIEW_REQUIRED';

  if (upstream.status === 'BLOCKED_INVALID_PROFILE' || upstream.status === 'BLOCKED_INVALID_TEMPLATE') {
    return {
      schemaVersion: 1,
      reviewVersion: ELEMENTOR_GLOBAL_REFERENCE_REVIEW_VERSION,
      status: 'BLOCKED_UPSTREAM',
      upstreamAssessmentStatus: upstream.status,
      upstreamReviewRequired,
      profileFingerprint: upstream.profileIdentity?.fingerprint ?? null,
      candidateFingerprint: upstream.candidateFingerprint,
      references: [],
      referencedWidgetCount: 0,
      globalReferenceClosureStatus: 'BLOCKED',
      globalReferenceClosureClaim: false,
      assetReferenceStatus: 'NOT_RUN',
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      generationEnabled: false,
      downloadEnabled: false,
      internalReviewRequired: true,
    };
  }

  const candidate = buildElementorTemplateCandidateArtifact(templateValue);
  if (!candidate.capabilityReport) {
    throw new Error('Global-reference review expected a capability report for a valid upstream candidate.');
  }

  const references = candidate.capabilityReport.entries
    .filter((entry) => entry.globalReferenceKeys.length > 0)
    .map((entry): ElementorGlobalReferenceReviewEntryV1 => ({
      path: entry.path,
      id: entry.id,
      widgetType: entry.widgetType,
      settingKeys: [...entry.globalReferenceKeys].sort(),
    }))
    .sort((left, right) => left.path.localeCompare(right.path)
      || left.widgetType.localeCompare(right.widgetType)
      || left.id.localeCompare(right.id));

  const hasReferences = references.length > 0;
  return {
    schemaVersion: 1,
    reviewVersion: ELEMENTOR_GLOBAL_REFERENCE_REVIEW_VERSION,
    status: hasReferences ? 'EXTERNAL_CLOSURE_REQUIRED' : 'NO_GLOBAL_REFERENCES',
    upstreamAssessmentStatus: upstream.status,
    upstreamReviewRequired,
    profileFingerprint: upstream.profileIdentity?.fingerprint ?? null,
    candidateFingerprint: upstream.candidateFingerprint,
    references,
    referencedWidgetCount: references.length,
    globalReferenceClosureStatus: hasReferences ? 'NOT_VERIFIED' : 'NOT_REQUIRED',
    globalReferenceClosureClaim: false,
    assetReferenceStatus: 'NOT_RUN',
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

export function serializeElementorGlobalReferenceReview(review: ElementorGlobalReferenceReviewV1): string {
  if (!serializableReview(review)) {
    throw new Error('Invalid or authority-inflated Elementor global-reference review.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    reviewVersion: ELEMENTOR_GLOBAL_REFERENCE_REVIEW_VERSION,
    status: review.status,
    upstreamAssessmentStatus: review.upstreamAssessmentStatus,
    upstreamReviewRequired: review.upstreamReviewRequired,
    profileFingerprint: review.profileFingerprint,
    candidateFingerprint: review.candidateFingerprint,
    references: cloneEntries(review.references),
    referencedWidgetCount: review.referencedWidgetCount,
    globalReferenceClosureStatus: review.globalReferenceClosureStatus,
    globalReferenceClosureClaim: false,
    assetReferenceStatus: 'NOT_RUN',
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  }, null, 2)}\n`;
}
