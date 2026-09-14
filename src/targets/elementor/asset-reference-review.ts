import { sha256Hex } from '../../core/sha256';
import {
  reviewElementorGlobalReferences,
  type ElementorGlobalReferenceReviewV1,
} from './global-reference-review';
import {
  type ElementorElementV04,
  type ElementorSettingsV04,
  type ElementorTemplateV04,
} from './template-v04';

export const ELEMENTOR_ASSET_CONTROL_REGISTRY_VERSION = 'elementor-asset-control-registry-v1' as const;
export const ELEMENTOR_ASSET_REFERENCE_REVIEW_VERSION = 'elementor-asset-reference-review-v1' as const;
export const ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA = '4ee26420a83b32ba48b2faf576b91029d083bb64' as const;

export interface ElementorDocumentedAssetControlV1 {
  widgetType: 'image';
  settingKey: 'image';
  controlType: 'MEDIA';
  evidence: 'ELEMENTOR_CORE_IMAGE_WIDGET_SOURCE';
  sourcePath: 'includes/widgets/image.php';
  sourceSha: typeof ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA;
}

export const ELEMENTOR_DOCUMENTED_ASSET_CONTROLS_V1: readonly ElementorDocumentedAssetControlV1[] = Object.freeze([
  Object.freeze({
    widgetType: 'image',
    settingKey: 'image',
    controlType: 'MEDIA',
    evidence: 'ELEMENTOR_CORE_IMAGE_WIDGET_SOURCE',
    sourcePath: 'includes/widgets/image.php',
    sourceSha: ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA,
  }),
]);

export type ElementorAssetReferenceReviewStatus =
  | 'BLOCKED_UPSTREAM'
  | 'NO_DOCUMENTED_ASSET_REFERENCES'
  | 'EXTERNAL_ASSET_CLOSURE_REQUIRED'
  | 'REVIEW_REQUIRED_UNSUPPORTED_ASSET_SHAPE';

export type ElementorAssetReferenceMode = 'MEDIA_ID_AND_URL' | 'MEDIA_ID_ONLY' | 'URL_ONLY';

export interface ElementorAssetReferenceEntryV1 {
  path: string;
  widgetId: string;
  widgetType: 'image';
  settingKey: 'image';
  controlType: 'MEDIA';
  mediaId: number | null;
  urlPresent: boolean;
  urlFingerprint: string | null;
  referenceMode: ElementorAssetReferenceMode;
}

export type ElementorAssetReferenceIssueCode =
  | 'P15_ASSET_MEDIA_VALUE_NOT_OBJECT'
  | 'P15_ASSET_MEDIA_VALUE_UNKNOWN_FIELD'
  | 'P15_ASSET_MEDIA_ID_INVALID'
  | 'P15_ASSET_MEDIA_URL_INVALID';

export interface ElementorAssetReferenceIssueV1 {
  code: ElementorAssetReferenceIssueCode;
  path: string;
  message: string;
}

export interface ElementorAssetReferenceReviewV1 {
  schemaVersion: 1;
  reviewVersion: typeof ELEMENTOR_ASSET_REFERENCE_REVIEW_VERSION;
  controlRegistryVersion: typeof ELEMENTOR_ASSET_CONTROL_REGISTRY_VERSION;
  evidenceSourceSha: typeof ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA;
  status: ElementorAssetReferenceReviewStatus;
  upstreamAssessmentStatus: ElementorGlobalReferenceReviewV1['upstreamAssessmentStatus'];
  upstreamReviewRequired: boolean;
  globalReferenceReviewStatus: ElementorGlobalReferenceReviewV1['status'];
  globalReferenceClosureStatus: ElementorGlobalReferenceReviewV1['globalReferenceClosureStatus'];
  globalReferenceClosureClaim: false;
  profileFingerprint: string | null;
  candidateFingerprint: string | null;
  references: ElementorAssetReferenceEntryV1[];
  issues: ElementorAssetReferenceIssueV1[];
  referencedWidgetCount: number;
  assetReferenceStatus: 'BLOCKED' | 'NOT_REQUIRED' | 'NOT_VERIFIED' | 'REVIEW_REQUIRED';
  assetReferenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validFingerprint(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}

function inspectMediaValue(
  value: unknown,
  path: string,
): { reference: Omit<ElementorAssetReferenceEntryV1, 'path' | 'widgetId' | 'widgetType'> | null; issues: ElementorAssetReferenceIssueV1[] } {
  if (!isRecord(value)) {
    return {
      reference: null,
      issues: [{
        code: 'P15_ASSET_MEDIA_VALUE_NOT_OBJECT',
        path,
        message: 'Documented Elementor MEDIA control data must be an object when present.',
      }],
    };
  }

  const unknownKeys = Object.keys(value).filter((key) => key !== 'id' && key !== 'url').sort();
  if (unknownKeys.length > 0) {
    return {
      reference: null,
      issues: [{
        code: 'P15_ASSET_MEDIA_VALUE_UNKNOWN_FIELD',
        path,
        message: `Documented Elementor MEDIA control data contains unsupported fields: ${unknownKeys.join(', ')}.`,
      }],
    };
  }

  let mediaId: number | null = null;
  if (value.id !== undefined && value.id !== '' && value.id !== 0) {
    if (typeof value.id !== 'number' || !Number.isSafeInteger(value.id) || value.id < 0) {
      return {
        reference: null,
        issues: [{
          code: 'P15_ASSET_MEDIA_ID_INVALID',
          path: `${path}.id`,
          message: 'Documented Elementor MEDIA id must be an empty value, zero, or a non-negative safe integer.',
        }],
      };
    }
    mediaId = value.id;
  }

  let url: string | null = null;
  if (value.url !== undefined && value.url !== '') {
    if (typeof value.url !== 'string' || value.url.trim().length === 0 || value.url.length > 8192) {
      return {
        reference: null,
        issues: [{
          code: 'P15_ASSET_MEDIA_URL_INVALID',
          path: `${path}.url`,
          message: 'Documented Elementor MEDIA url must be empty or a bounded non-empty string.',
        }],
      };
    }
    url = value.url;
  }

  if (mediaId === null && url === null) {
    return { reference: null, issues: [] };
  }

  const referenceMode: ElementorAssetReferenceMode = mediaId !== null && url !== null
    ? 'MEDIA_ID_AND_URL'
    : mediaId !== null
      ? 'MEDIA_ID_ONLY'
      : 'URL_ONLY';

  return {
    reference: {
      settingKey: 'image',
      controlType: 'MEDIA',
      mediaId,
      urlPresent: url !== null,
      urlFingerprint: url === null ? null : `sha256:${sha256Hex(url)}`,
      referenceMode,
    },
    issues: [],
  };
}

function collectImageAssetReferences(
  elements: ElementorElementV04[],
  parentPath: string,
  references: ElementorAssetReferenceEntryV1[],
  issues: ElementorAssetReferenceIssueV1[],
): void {
  for (let index = 0; index < elements.length; index += 1) {
    const element = elements[index];
    if (!element) continue;
    const elementPath = `${parentPath}[${index}]`;

    if (element.elType === 'widget' && element.widgetType === 'image') {
      const settings: ElementorSettingsV04 = element.settings;
      if (isRecord(settings) && Object.prototype.hasOwnProperty.call(settings, 'image')) {
        const controlPath = `${elementPath}.settings.image`;
        const inspection = inspectMediaValue(settings.image, controlPath);
        issues.push(...inspection.issues);
        if (inspection.reference) {
          references.push({
            path: controlPath,
            widgetId: element.id,
            widgetType: 'image',
            ...inspection.reference,
          });
        }
      }
    }

    if (element.elements.length > 0) {
      collectImageAssetReferences(element.elements, `${elementPath}.elements`, references, issues);
    }
  }
}

function cloneReferences(references: ElementorAssetReferenceEntryV1[]): ElementorAssetReferenceEntryV1[] {
  return references.map((entry) => ({ ...entry }));
}

function cloneIssues(issues: ElementorAssetReferenceIssueV1[]): ElementorAssetReferenceIssueV1[] {
  return issues.map((issue) => ({ ...issue }));
}

function validReference(entry: ElementorAssetReferenceEntryV1): boolean {
  if (entry.widgetType !== 'image'
    || entry.settingKey !== 'image'
    || entry.controlType !== 'MEDIA'
    || typeof entry.path !== 'string'
    || entry.path.length === 0
    || typeof entry.widgetId !== 'string'
    || entry.widgetId.length === 0
    || (entry.mediaId !== null && (!Number.isSafeInteger(entry.mediaId) || entry.mediaId < 0))
    || typeof entry.urlPresent !== 'boolean') {
    return false;
  }

  if (entry.urlPresent !== (entry.urlFingerprint !== null)) return false;
  if (entry.urlFingerprint !== null && !validFingerprint(entry.urlFingerprint)) return false;

  if (entry.referenceMode === 'MEDIA_ID_AND_URL') {
    return entry.mediaId !== null && entry.urlPresent;
  }
  if (entry.referenceMode === 'MEDIA_ID_ONLY') {
    return entry.mediaId !== null && !entry.urlPresent;
  }
  if (entry.referenceMode === 'URL_ONLY') {
    return entry.mediaId === null && entry.urlPresent;
  }
  return false;
}

function serializableReview(review: ElementorAssetReferenceReviewV1): boolean {
  if (review.schemaVersion !== 1
    || review.reviewVersion !== ELEMENTOR_ASSET_REFERENCE_REVIEW_VERSION
    || review.controlRegistryVersion !== ELEMENTOR_ASSET_CONTROL_REGISTRY_VERSION
    || review.evidenceSourceSha !== ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA
    || review.globalReferenceClosureClaim !== false
    || review.assetReferenceClosureClaim !== false
    || review.targetCompatibilityClaim !== false
    || review.productionAcceptance !== false
    || review.generationEnabled !== false
    || review.downloadEnabled !== false
    || review.internalReviewRequired !== true
    || review.referencedWidgetCount !== review.references.length
    || !review.references.every(validReference)) {
    return false;
  }

  if (review.status === 'BLOCKED_UPSTREAM') {
    return review.assetReferenceStatus === 'BLOCKED'
      && review.references.length === 0
      && review.issues.length === 0
      && review.globalReferenceReviewStatus === 'BLOCKED_UPSTREAM'
      && review.globalReferenceClosureStatus === 'BLOCKED';
  }

  if (!validFingerprint(review.profileFingerprint) || !validFingerprint(review.candidateFingerprint)) return false;

  if (review.status === 'NO_DOCUMENTED_ASSET_REFERENCES') {
    return review.assetReferenceStatus === 'NOT_REQUIRED'
      && review.references.length === 0
      && review.issues.length === 0;
  }
  if (review.status === 'EXTERNAL_ASSET_CLOSURE_REQUIRED') {
    return review.assetReferenceStatus === 'NOT_VERIFIED'
      && review.references.length > 0
      && review.issues.length === 0;
  }
  if (review.status === 'REVIEW_REQUIRED_UNSUPPORTED_ASSET_SHAPE') {
    return review.assetReferenceStatus === 'REVIEW_REQUIRED' && review.issues.length > 0;
  }
  return false;
}

/**
 * Review only the explicitly documented core Image widget MEDIA control.
 *
 * This gate intentionally does not shape-sniff arbitrary settings. It never downloads, resolves, rewrites,
 * checks reachability of, or emits raw media URLs. Attachment IDs are retained only as source evidence and
 * are not treated as portable target IDs. Global-reference state remains a separate upstream review result.
 */
export function reviewElementorAssetReferences(
  templateValue: unknown,
  profileValue: unknown,
): ElementorAssetReferenceReviewV1 {
  const globalReview = reviewElementorGlobalReferences(templateValue, profileValue);

  if (globalReview.status === 'BLOCKED_UPSTREAM') {
    return {
      schemaVersion: 1,
      reviewVersion: ELEMENTOR_ASSET_REFERENCE_REVIEW_VERSION,
      controlRegistryVersion: ELEMENTOR_ASSET_CONTROL_REGISTRY_VERSION,
      evidenceSourceSha: ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA,
      status: 'BLOCKED_UPSTREAM',
      upstreamAssessmentStatus: globalReview.upstreamAssessmentStatus,
      upstreamReviewRequired: globalReview.upstreamReviewRequired,
      globalReferenceReviewStatus: globalReview.status,
      globalReferenceClosureStatus: globalReview.globalReferenceClosureStatus,
      globalReferenceClosureClaim: false,
      profileFingerprint: globalReview.profileFingerprint,
      candidateFingerprint: globalReview.candidateFingerprint,
      references: [],
      issues: [],
      referencedWidgetCount: 0,
      assetReferenceStatus: 'BLOCKED',
      assetReferenceClosureClaim: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      generationEnabled: false,
      downloadEnabled: false,
      internalReviewRequired: true,
    };
  }

  const document = templateValue as ElementorTemplateV04;
  const references: ElementorAssetReferenceEntryV1[] = [];
  const issues: ElementorAssetReferenceIssueV1[] = [];
  collectImageAssetReferences(document.content, '$.content', references, issues);
  references.sort((left, right) => left.path.localeCompare(right.path) || left.widgetId.localeCompare(right.widgetId));
  issues.sort((left, right) => left.path.localeCompare(right.path) || left.code.localeCompare(right.code));

  const status: ElementorAssetReferenceReviewStatus = issues.length > 0
    ? 'REVIEW_REQUIRED_UNSUPPORTED_ASSET_SHAPE'
    : references.length > 0
      ? 'EXTERNAL_ASSET_CLOSURE_REQUIRED'
      : 'NO_DOCUMENTED_ASSET_REFERENCES';
  const assetReferenceStatus: ElementorAssetReferenceReviewV1['assetReferenceStatus'] = issues.length > 0
    ? 'REVIEW_REQUIRED'
    : references.length > 0
      ? 'NOT_VERIFIED'
      : 'NOT_REQUIRED';

  return {
    schemaVersion: 1,
    reviewVersion: ELEMENTOR_ASSET_REFERENCE_REVIEW_VERSION,
    controlRegistryVersion: ELEMENTOR_ASSET_CONTROL_REGISTRY_VERSION,
    evidenceSourceSha: ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA,
    status,
    upstreamAssessmentStatus: globalReview.upstreamAssessmentStatus,
    upstreamReviewRequired: globalReview.upstreamReviewRequired,
    globalReferenceReviewStatus: globalReview.status,
    globalReferenceClosureStatus: globalReview.globalReferenceClosureStatus,
    globalReferenceClosureClaim: false,
    profileFingerprint: globalReview.profileFingerprint,
    candidateFingerprint: globalReview.candidateFingerprint,
    references,
    issues,
    referencedWidgetCount: references.length,
    assetReferenceStatus,
    assetReferenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

export function serializeElementorAssetReferenceReview(review: ElementorAssetReferenceReviewV1): string {
  if (!serializableReview(review)) {
    throw new Error('Invalid or authority-inflated Elementor asset-reference review.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    reviewVersion: ELEMENTOR_ASSET_REFERENCE_REVIEW_VERSION,
    controlRegistryVersion: ELEMENTOR_ASSET_CONTROL_REGISTRY_VERSION,
    evidenceSourceSha: ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA,
    status: review.status,
    upstreamAssessmentStatus: review.upstreamAssessmentStatus,
    upstreamReviewRequired: review.upstreamReviewRequired,
    globalReferenceReviewStatus: review.globalReferenceReviewStatus,
    globalReferenceClosureStatus: review.globalReferenceClosureStatus,
    globalReferenceClosureClaim: false,
    profileFingerprint: review.profileFingerprint,
    candidateFingerprint: review.candidateFingerprint,
    references: cloneReferences(review.references),
    issues: cloneIssues(review.issues),
    referencedWidgetCount: review.referencedWidgetCount,
    assetReferenceStatus: review.assetReferenceStatus,
    assetReferenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  }, null, 2)}\n`;
}
