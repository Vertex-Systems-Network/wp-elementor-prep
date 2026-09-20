import { sha256Hex } from '../../core/sha256';
import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import type { ElementorTargetProfileV1 } from './target-profile';
import { P15_ELEMENTOR_ASSET_PROOF_FIXTURE_SHA256 } from './asset-proof-vector';
import {
  buildElementorTargetManagedMediaReviewPrerequisite,
} from './target-managed-media-review-prerequisite';

export const ELEMENTOR_TARGET_MANAGED_MEDIA_PORTABILITY_EVIDENCE_VERSION =
  'elementor-target-managed-media-portability-evidence-v1' as const;

export type ElementorTargetManagedMediaPortabilityStepResult = 'PASS' | 'FAIL' | 'NOT_RUN';
export type ElementorTargetManagedMediaPortabilityClassification =
  | 'CONTROLLED_CROSS_TARGET_MEDIA_PORTABILITY_PASS'
  | 'CONTROLLED_CROSS_TARGET_MEDIA_PORTABILITY_FAIL'
  | 'CONTROLLED_CROSS_TARGET_MEDIA_PORTABILITY_PARTIAL'
  | 'REJECTED';

export interface ElementorTargetManagedMediaPortabilityEvidenceV1 {
  schemaVersion: 1;
  evidenceVersion: typeof ELEMENTOR_TARGET_MANAGED_MEDIA_PORTABILITY_EVIDENCE_VERSION;
  exportedTemplateSha256: string;
  sourceTarget: {
    source: 'OBSERVED';
    wordpressVersion: string;
    elementorVersion: string;
    importSurface: 'TEMPLATE_LIBRARY_JSON';
  };
  destinationTarget: {
    source: 'OBSERVED';
    wordpressVersion: string;
    elementorVersion: string;
    importSurface: 'TEMPLATE_LIBRARY_JSON';
  };
  observedAt: string;
  evidenceReference: string;
  steps: {
    importResult: 'PASS' | 'FAIL';
    sourceProvenanceResult: ElementorTargetManagedMediaPortabilityStepResult;
    sourceManagedMediaUrlFingerprint: string | null;
    destinationSourceUrlFingerprint: string | null;
    destinationManagedMediaUrlFingerprint: string | null;
    destinationManagedMediaTargetLocal: boolean;
    renderResult: ElementorTargetManagedMediaPortabilityStepResult;
    renderedImageReferenceResult: ElementorTargetManagedMediaPortabilityStepResult;
    browserImageLoadResult: ElementorTargetManagedMediaPortabilityStepResult;
    renderedImageUrlFingerprint: string | null;
  };
  attachment: {
    sourceFixtureSha256: string | null;
    targetFileSha256: string | null;
    mimeType: string | null;
    width: number | null;
    height: number | null;
  };
  internalDecisionStatus: 'NOT_RUN';
  authenticationAuthority: false;
  acceptanceAuthority: false;
  referenceClosureClaim: false;
  assetReferenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

export type ElementorTargetManagedMediaPortabilityIssueCode =
  | 'P15_MEDIA_PORTABILITY_PREREQUISITE_NOT_READY'
  | 'P15_MEDIA_PORTABILITY_EXPORT_INVALID'
  | 'P15_MEDIA_PORTABILITY_EXPORT_SHA_MISMATCH'
  | 'P15_MEDIA_PORTABILITY_EXPORT_MEDIA_BINDING_INVALID'
  | 'P15_MEDIA_PORTABILITY_EVIDENCE_NOT_OBJECT'
  | 'P15_MEDIA_PORTABILITY_EVIDENCE_SHAPE_INVALID'
  | 'P15_MEDIA_PORTABILITY_EVIDENCE_VERSION_INVALID'
  | 'P15_MEDIA_PORTABILITY_SOURCE_TARGET_INVALID'
  | 'P15_MEDIA_PORTABILITY_DESTINATION_TARGET_INVALID'
  | 'P15_MEDIA_PORTABILITY_EVIDENCE_REFERENCE_INVALID'
  | 'P15_MEDIA_PORTABILITY_EVIDENCE_REFERENCE_MISMATCH'
  | 'P15_MEDIA_PORTABILITY_STEPS_INVALID'
  | 'P15_MEDIA_PORTABILITY_SEQUENCE_INVALID'
  | 'P15_MEDIA_PORTABILITY_SOURCE_PROVENANCE_INVALID'
  | 'P15_MEDIA_PORTABILITY_DESTINATION_MEDIA_INVALID'
  | 'P15_MEDIA_PORTABILITY_CONTENT_INTEGRITY_INVALID'
  | 'P15_MEDIA_PORTABILITY_AUTHORITY_FLAGS_INVALID';

export interface ElementorTargetManagedMediaPortabilityIssueV1 {
  code: ElementorTargetManagedMediaPortabilityIssueCode;
  path: string;
  message: string;
}

export interface ElementorTargetManagedMediaPortabilityValidationResultV1 {
  valid: boolean;
  classification: ElementorTargetManagedMediaPortabilityClassification;
  reviewPrerequisiteReady: boolean;
  exportBindingMatches: boolean;
  sourceTargetMatches: boolean;
  destinationTargetMatches: boolean;
  evidenceReferenceMatches: boolean;
  sourceProvenanceMatches: boolean;
  destinationMediaBindingMatches: boolean;
  contentIntegrityMatches: boolean;
  exportedTemplateSha256: string | null;
  exportedSourceMediaUrlFingerprint: string | null;
  sourceManagedMediaUrlFingerprint: string | null;
  destinationManagedMediaUrlFingerprint: string | null;
  renderedImageUrlFingerprint: string | null;
  destinationManagedMediaTargetLocal: boolean;
  sourceFixtureSha256: string | null;
  targetFileSha256: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  sourceTarget: ElementorTargetManagedMediaPortabilityEvidenceV1['sourceTarget'] | null;
  destinationTarget: ElementorTargetManagedMediaPortabilityEvidenceV1['destinationTarget'] | null;
  steps: ElementorTargetManagedMediaPortabilityEvidenceV1['steps'] | null;
  issues: ElementorTargetManagedMediaPortabilityIssueV1[];
  internalDecisionStatus: 'NOT_RUN';
  authenticationAuthority: false;
  acceptanceAuthority: false;
  referenceClosureClaim: false;
  assetReferenceClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const SHA256 = /^sha256:[0-9a-f]{64}$/;
const EVIDENCE_KEYS = [
  'acceptanceAuthority',
  'assetReferenceClosureClaim',
  'attachment',
  'authenticationAuthority',
  'destinationTarget',
  'downloadEnabled',
  'evidenceReference',
  'evidenceVersion',
  'exportedTemplateSha256',
  'generationEnabled',
  'internalDecisionStatus',
  'internalReviewRequired',
  'observedAt',
  'productionAcceptance',
  'referenceClosureClaim',
  'schemaVersion',
  'sourceTarget',
  'steps',
  'targetCompatibilityClaim',
] as const;
const TARGET_KEYS = ['elementorVersion', 'importSurface', 'source', 'wordpressVersion'] as const;
const STEP_KEYS = [
  'browserImageLoadResult',
  'destinationManagedMediaTargetLocal',
  'destinationManagedMediaUrlFingerprint',
  'destinationSourceUrlFingerprint',
  'importResult',
  'renderedImageReferenceResult',
  'renderedImageUrlFingerprint',
  'renderResult',
  'sourceManagedMediaUrlFingerprint',
  'sourceProvenanceResult',
] as const;
const ATTACHMENT_KEYS = [
  'height',
  'mimeType',
  'sourceFixtureSha256',
  'targetFileSha256',
  'width',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return actual.length === canonical.length
    && actual.every((key, index) => key === canonical[index]);
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && SHA256.test(value);
}

function boundedString(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function canonicalIso(value: unknown): boolean {
  if (typeof value !== 'string' || value.length > 64) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function sha256(value: string): string {
  return `sha256:${sha256Hex(value)}`;
}

function stepResult(value: unknown): value is ElementorTargetManagedMediaPortabilityStepResult {
  return value === 'PASS' || value === 'FAIL' || value === 'NOT_RUN';
}

function nullableSha(value: unknown): value is string | null {
  return value === null || isSha256(value);
}

function targetSnapshot(
  value: unknown,
): ElementorTargetManagedMediaPortabilityEvidenceV1['sourceTarget'] | null {
  if (!isRecord(value)
    || !exactKeys(value, TARGET_KEYS)
    || value.source !== 'OBSERVED'
    || !boundedString(value.wordpressVersion, 64)
    || !boundedString(value.elementorVersion, 64)
    || value.importSurface !== 'TEMPLATE_LIBRARY_JSON') {
    return null;
  }
  return {
    source: 'OBSERVED',
    wordpressVersion: value.wordpressVersion,
    elementorVersion: value.elementorVersion,
    importSurface: 'TEMPLATE_LIBRARY_JSON',
  };
}

function stepsSnapshot(
  value: unknown,
): ElementorTargetManagedMediaPortabilityEvidenceV1['steps'] | null {
  if (!isRecord(value)
    || !exactKeys(value, STEP_KEYS)
    || (value.importResult !== 'PASS' && value.importResult !== 'FAIL')
    || !stepResult(value.sourceProvenanceResult)
    || !nullableSha(value.sourceManagedMediaUrlFingerprint)
    || !nullableSha(value.destinationSourceUrlFingerprint)
    || !nullableSha(value.destinationManagedMediaUrlFingerprint)
    || typeof value.destinationManagedMediaTargetLocal !== 'boolean'
    || !stepResult(value.renderResult)
    || !stepResult(value.renderedImageReferenceResult)
    || !stepResult(value.browserImageLoadResult)
    || !nullableSha(value.renderedImageUrlFingerprint)) {
    return null;
  }
  return {
    importResult: value.importResult,
    sourceProvenanceResult: value.sourceProvenanceResult,
    sourceManagedMediaUrlFingerprint: value.sourceManagedMediaUrlFingerprint,
    destinationSourceUrlFingerprint: value.destinationSourceUrlFingerprint,
    destinationManagedMediaUrlFingerprint: value.destinationManagedMediaUrlFingerprint,
    destinationManagedMediaTargetLocal: value.destinationManagedMediaTargetLocal,
    renderResult: value.renderResult,
    renderedImageReferenceResult: value.renderedImageReferenceResult,
    browserImageLoadResult: value.browserImageLoadResult,
    renderedImageUrlFingerprint: value.renderedImageUrlFingerprint,
  };
}

function attachmentSnapshot(value: unknown): {
  valid: boolean;
  sourceFixtureSha256: string | null;
  targetFileSha256: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
} {
  if (!isRecord(value)
    || !exactKeys(value, ATTACHMENT_KEYS)
    || !nullableSha(value.sourceFixtureSha256)
    || !nullableSha(value.targetFileSha256)
    || !(value.mimeType === null || boundedString(value.mimeType, 128))
    || !(value.width === null || (Number.isSafeInteger(value.width) && (value.width as number) > 0))
    || !(value.height === null || (Number.isSafeInteger(value.height) && (value.height as number) > 0))) {
    return {
      valid: false,
      sourceFixtureSha256: null,
      targetFileSha256: null,
      mimeType: null,
      width: null,
      height: null,
    };
  }
  return {
    valid: true,
    sourceFixtureSha256: value.sourceFixtureSha256,
    targetFileSha256: value.targetFileSha256,
    mimeType: value.mimeType,
    width: value.width as number | null,
    height: value.height as number | null,
  };
}

function collectImageUrls(elements: unknown, urls: string[]): void {
  if (!Array.isArray(elements)) return;
  for (const element of elements) {
    if (!isRecord(element)) continue;
    if (element.widgetType === 'image' && isRecord(element.settings) && isRecord(element.settings.image)) {
      const url = element.settings.image.url;
      if (typeof url === 'string' && url.length > 0) urls.push(url);
    }
    collectImageUrls(element.elements, urls);
  }
}

function inspectExport(
  exportedTemplateValue: unknown,
  candidate: ElementorTemplateCandidateArtifactV1,
): {
  valid: boolean;
  mediaFingerprint: string | null;
} {
  if (!isRecord(exportedTemplateValue)
    || !Array.isArray(exportedTemplateValue.content)
    || !isRecord(exportedTemplateValue.page_settings)
    || !boundedString(exportedTemplateValue.version, 32)
    || !boundedString(exportedTemplateValue.title, 256)
    || exportedTemplateValue.type !== 'page'
    || typeof candidate.templateJson !== 'string') {
    return { valid: false, mediaFingerprint: null };
  }

  let sourceTemplate: unknown;
  try {
    sourceTemplate = JSON.parse(candidate.templateJson);
  } catch {
    return { valid: false, mediaFingerprint: null };
  }
  if (!isRecord(sourceTemplate)
    || sourceTemplate.type !== 'page'
    || sourceTemplate.title !== exportedTemplateValue.title
    || sourceTemplate.version !== exportedTemplateValue.version) {
    return { valid: false, mediaFingerprint: null };
  }

  const urls: string[] = [];
  collectImageUrls(exportedTemplateValue.content, urls);
  if (urls.length !== 1) return { valid: false, mediaFingerprint: null };
  return { valid: true, mediaFingerprint: sha256(urls[0]!) };
}

function sequenceValid(steps: ElementorTargetManagedMediaPortabilityEvidenceV1['steps']): boolean {
  if (steps.importResult === 'FAIL') {
    return steps.sourceProvenanceResult === 'NOT_RUN'
      && steps.sourceManagedMediaUrlFingerprint === null
      && steps.destinationSourceUrlFingerprint === null
      && steps.destinationManagedMediaUrlFingerprint === null
      && steps.destinationManagedMediaTargetLocal === false
      && steps.renderResult === 'NOT_RUN'
      && steps.renderedImageReferenceResult === 'NOT_RUN'
      && steps.browserImageLoadResult === 'NOT_RUN'
      && steps.renderedImageUrlFingerprint === null;
  }

  if (steps.sourceProvenanceResult !== 'PASS') {
    return steps.renderResult === 'NOT_RUN'
      && steps.renderedImageReferenceResult === 'NOT_RUN'
      && steps.browserImageLoadResult === 'NOT_RUN'
      && steps.renderedImageUrlFingerprint === null;
  }
  if (steps.sourceManagedMediaUrlFingerprint === null
    || steps.destinationSourceUrlFingerprint === null
    || steps.destinationManagedMediaUrlFingerprint === null) {
    return false;
  }
  if (steps.renderResult !== 'PASS') {
    return steps.renderedImageReferenceResult === 'NOT_RUN'
      && steps.browserImageLoadResult === 'NOT_RUN'
      && steps.renderedImageUrlFingerprint === null;
  }
  if (steps.renderedImageReferenceResult !== 'PASS') {
    return steps.browserImageLoadResult === 'NOT_RUN'
      && steps.renderedImageUrlFingerprint !== null;
  }
  return steps.renderedImageUrlFingerprint !== null
    && steps.browserImageLoadResult !== 'NOT_RUN';
}

function classify(
  valid: boolean,
  steps: ElementorTargetManagedMediaPortabilityEvidenceV1['steps'] | null,
  sourceProvenanceMatches: boolean,
  destinationMediaBindingMatches: boolean,
  contentIntegrityMatches: boolean,
): ElementorTargetManagedMediaPortabilityClassification {
  if (!valid || !steps) return 'REJECTED';
  if (steps.importResult === 'FAIL'
    || steps.sourceProvenanceResult === 'FAIL'
    || steps.renderResult === 'FAIL'
    || steps.renderedImageReferenceResult === 'FAIL'
    || steps.browserImageLoadResult === 'FAIL'
    || !contentIntegrityMatches) {
    return 'CONTROLLED_CROSS_TARGET_MEDIA_PORTABILITY_FAIL';
  }
  if (steps.importResult === 'PASS'
    && sourceProvenanceMatches
    && destinationMediaBindingMatches
    && contentIntegrityMatches
    && steps.browserImageLoadResult === 'PASS') {
    return 'CONTROLLED_CROSS_TARGET_MEDIA_PORTABILITY_PASS';
  }
  return 'CONTROLLED_CROSS_TARGET_MEDIA_PORTABILITY_PARTIAL';
}

export function validateElementorTargetManagedMediaPortabilityEvidence(
  evidenceValue: unknown,
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
  assetProofValue: unknown,
  integrityEvidenceValue: unknown,
  exportedTemplateValue: unknown,
  exportedTemplateSha256: string,
): ElementorTargetManagedMediaPortabilityValidationResultV1 {
  const issues: ElementorTargetManagedMediaPortabilityIssueV1[] = [];
  const prerequisite = buildElementorTargetManagedMediaReviewPrerequisite(
    candidate,
    profile,
    assetProofValue,
    integrityEvidenceValue,
  );
  const reviewPrerequisiteReady = prerequisite.status === 'READY_FOR_INTERNAL_REVIEW'
    && prerequisite.crossBindingMatches
    && prerequisite.internalDecisionStatus === 'NOT_RUN';
  if (!reviewPrerequisiteReady) {
    issues.push({
      code: 'P15_MEDIA_PORTABILITY_PREREQUISITE_NOT_READY',
      path: '$prerequisite',
      message: 'Cross-target portability requires the exact managed-media internal-review prerequisite to be ready first.',
    });
  }

  const exportInspection = inspectExport(exportedTemplateValue, candidate);
  if (!exportInspection.valid || exportInspection.mediaFingerprint === null) {
    issues.push({
      code: 'P15_MEDIA_PORTABILITY_EXPORT_INVALID',
      path: '$exportedTemplate',
      message: 'Portability requires one valid exported page template with exactly one core Image MEDIA URL.',
    });
  }
  const exportBindingMatches = reviewPrerequisiteReady
    && exportInspection.mediaFingerprint !== null
    && exportInspection.mediaFingerprint === prerequisite.targetManagedMediaUrlFingerprint;
  if (exportInspection.valid && !exportBindingMatches) {
    issues.push({
      code: 'P15_MEDIA_PORTABILITY_EXPORT_MEDIA_BINDING_INVALID',
      path: '$exportedTemplate.content',
      message: 'Exported template media URL is not the exact target-A managed-media reference.',
    });
  }

  let sourceTargetMatches = false;
  let destinationTargetMatches = false;
  let evidenceReferenceMatches = false;
  let sourceProvenanceMatches = false;
  let destinationMediaBindingMatches = false;
  let contentIntegrityMatches = false;
  let sourceTarget: ElementorTargetManagedMediaPortabilityEvidenceV1['sourceTarget'] | null = null;
  let destinationTarget: ElementorTargetManagedMediaPortabilityEvidenceV1['destinationTarget'] | null = null;
  let steps: ElementorTargetManagedMediaPortabilityEvidenceV1['steps'] | null = null;
  let attachment = attachmentSnapshot(null);

  if (!isRecord(evidenceValue)) {
    issues.push({
      code: 'P15_MEDIA_PORTABILITY_EVIDENCE_NOT_OBJECT',
      path: '$',
      message: 'Cross-target portability evidence must be an object.',
    });
  } else {
    if (!exactKeys(evidenceValue, EVIDENCE_KEYS)) {
      issues.push({
        code: 'P15_MEDIA_PORTABILITY_EVIDENCE_SHAPE_INVALID',
        path: '$',
        message: 'Cross-target portability evidence contains unknown or missing fields.',
      });
    }
    if (evidenceValue.schemaVersion !== 1
      || evidenceValue.evidenceVersion !== ELEMENTOR_TARGET_MANAGED_MEDIA_PORTABILITY_EVIDENCE_VERSION) {
      issues.push({
        code: 'P15_MEDIA_PORTABILITY_EVIDENCE_VERSION_INVALID',
        path: '$.evidenceVersion',
        message: 'Cross-target portability evidence schema/version is unsupported.',
      });
    }
    if (!isSha256(evidenceValue.exportedTemplateSha256)
      || !isSha256(exportedTemplateSha256)
      || evidenceValue.exportedTemplateSha256 !== exportedTemplateSha256) {
      issues.push({
        code: 'P15_MEDIA_PORTABILITY_EXPORT_SHA_MISMATCH',
        path: '$.exportedTemplateSha256',
        message: 'Portability evidence is not bound to the exact exported template bytes consumed by intake.',
      });
    }

    sourceTarget = targetSnapshot(evidenceValue.sourceTarget);
    if (!sourceTarget) {
      issues.push({
        code: 'P15_MEDIA_PORTABILITY_SOURCE_TARGET_INVALID',
        path: '$.sourceTarget',
        message: 'Source target observation is malformed.',
      });
    } else if (prerequisite.observedTarget) {
      sourceTargetMatches = sourceTarget.wordpressVersion === prerequisite.observedTarget.wordpressVersion
        && sourceTarget.elementorVersion === prerequisite.observedTarget.elementorVersion
        && sourceTarget.importSurface === prerequisite.observedTarget.importSurface;
      if (!sourceTargetMatches) {
        issues.push({
          code: 'P15_MEDIA_PORTABILITY_SOURCE_TARGET_INVALID',
          path: '$.sourceTarget',
          message: 'Source target does not match the exact target-A managed-media prerequisite.',
        });
      }
    }

    destinationTarget = targetSnapshot(evidenceValue.destinationTarget);
    if (!destinationTarget) {
      issues.push({
        code: 'P15_MEDIA_PORTABILITY_DESTINATION_TARGET_INVALID',
        path: '$.destinationTarget',
        message: 'Destination target observation is malformed.',
      });
    } else {
      destinationTargetMatches = destinationTarget.wordpressVersion === profile.environment.wordpressVersion
        && destinationTarget.elementorVersion === profile.environment.elementorVersion
        && destinationTarget.importSurface === 'TEMPLATE_LIBRARY_JSON';
      if (!destinationTargetMatches) {
        issues.push({
          code: 'P15_MEDIA_PORTABILITY_DESTINATION_TARGET_INVALID',
          path: '$.destinationTarget',
          message: 'Destination target must match the same exact declared WordPress/Elementor versions.',
        });
      }
    }

    if (!canonicalIso(evidenceValue.observedAt)
      || !boundedString(evidenceValue.evidenceReference, 1024)) {
      issues.push({
        code: 'P15_MEDIA_PORTABILITY_EVIDENCE_REFERENCE_INVALID',
        path: '$.evidenceReference',
        message: 'Portability evidence requires canonical observedAt and a bounded retained evidence reference.',
      });
    } else if (prerequisite.sourceEvidenceReferenceSha256) {
      evidenceReferenceMatches = sha256(evidenceValue.evidenceReference) === prerequisite.sourceEvidenceReferenceSha256;
      if (!evidenceReferenceMatches) {
        issues.push({
          code: 'P15_MEDIA_PORTABILITY_EVIDENCE_REFERENCE_MISMATCH',
          path: '$.evidenceReference',
          message: 'Portability evidence reference does not match the exact source proof run.',
        });
      }
    }

    steps = stepsSnapshot(evidenceValue.steps);
    if (!steps) {
      issues.push({
        code: 'P15_MEDIA_PORTABILITY_STEPS_INVALID',
        path: '$.steps',
        message: 'Cross-target portability step evidence is malformed.',
      });
    } else if (!sequenceValid(steps)) {
      issues.push({
        code: 'P15_MEDIA_PORTABILITY_SEQUENCE_INVALID',
        path: '$.steps',
        message: 'Cross-target portability step ordering is impossible or contradictory.',
      });
    } else {
      sourceProvenanceMatches = steps.importResult === 'PASS'
        && steps.sourceProvenanceResult === 'PASS'
        && prerequisite.targetManagedMediaUrlFingerprint !== null
        && exportInspection.mediaFingerprint !== null
        && steps.sourceManagedMediaUrlFingerprint === prerequisite.targetManagedMediaUrlFingerprint
        && steps.destinationSourceUrlFingerprint === exportInspection.mediaFingerprint;
      if (steps.sourceProvenanceResult === 'PASS' && !sourceProvenanceMatches) {
        issues.push({
          code: 'P15_MEDIA_PORTABILITY_SOURCE_PROVENANCE_INVALID',
          path: '$.steps.destinationSourceUrlFingerprint',
          message: 'Target-B source provenance is not bound to the exact exported target-A managed-media URL.',
        });
      }

      destinationMediaBindingMatches = steps.renderedImageReferenceResult === 'PASS'
        && steps.destinationManagedMediaTargetLocal === true
        && steps.destinationManagedMediaUrlFingerprint !== null
        && steps.destinationManagedMediaUrlFingerprint !== prerequisite.targetManagedMediaUrlFingerprint
        && steps.renderedImageUrlFingerprint === steps.destinationManagedMediaUrlFingerprint;
      if (steps.renderedImageReferenceResult === 'PASS' && !destinationMediaBindingMatches) {
        issues.push({
          code: 'P15_MEDIA_PORTABILITY_DESTINATION_MEDIA_INVALID',
          path: '$.steps.destinationManagedMediaUrlFingerprint',
          message: 'Target-B render must use its own target-local managed-media URL rather than target-A identity.',
        });
      }
    }

    attachment = attachmentSnapshot(evidenceValue.attachment);
    if (!attachment.valid) {
      issues.push({
        code: 'P15_MEDIA_PORTABILITY_CONTENT_INTEGRITY_INVALID',
        path: '$.attachment',
        message: 'Target-B attachment integrity metadata is malformed.',
      });
    } else {
      contentIntegrityMatches = attachment.sourceFixtureSha256 === P15_ELEMENTOR_ASSET_PROOF_FIXTURE_SHA256
        && attachment.targetFileSha256 === P15_ELEMENTOR_ASSET_PROOF_FIXTURE_SHA256
        && attachment.mimeType === 'image/png'
        && attachment.width !== null
        && attachment.height !== null;
      if (!contentIntegrityMatches) {
        issues.push({
          code: 'P15_MEDIA_PORTABILITY_CONTENT_INTEGRITY_INVALID',
          path: '$.attachment',
          message: 'Target-B attachment bytes/type/dimensions do not match the exact controlled PNG.',
        });
      }
    }

    if (evidenceValue.internalDecisionStatus !== 'NOT_RUN'
      || evidenceValue.authenticationAuthority !== false
      || evidenceValue.acceptanceAuthority !== false
      || evidenceValue.referenceClosureClaim !== false
      || evidenceValue.assetReferenceClosureClaim !== false
      || evidenceValue.targetCompatibilityClaim !== false
      || evidenceValue.productionAcceptance !== false
      || evidenceValue.generationEnabled !== false
      || evidenceValue.downloadEnabled !== false
      || evidenceValue.internalReviewRequired !== true) {
      issues.push({
        code: 'P15_MEDIA_PORTABILITY_AUTHORITY_FLAGS_INVALID',
        path: '$',
        message: 'Cross-target portability evidence cannot grant closure, decision, compatibility, production, generation or download authority.',
      });
    }
  }

  const structuralIssues = issues.filter((issue) => ![
    'P15_MEDIA_PORTABILITY_CONTENT_INTEGRITY_INVALID',
  ].includes(issue.code));
  const valid = structuralIssues.length === 0;
  const classification = classify(
    valid,
    steps,
    sourceProvenanceMatches,
    destinationMediaBindingMatches,
    contentIntegrityMatches,
  );

  return {
    valid,
    classification,
    reviewPrerequisiteReady,
    exportBindingMatches,
    sourceTargetMatches,
    destinationTargetMatches,
    evidenceReferenceMatches,
    sourceProvenanceMatches,
    destinationMediaBindingMatches,
    contentIntegrityMatches,
    exportedTemplateSha256: isSha256(exportedTemplateSha256) ? exportedTemplateSha256 : null,
    exportedSourceMediaUrlFingerprint: exportInspection.mediaFingerprint,
    sourceManagedMediaUrlFingerprint: steps?.sourceManagedMediaUrlFingerprint ?? null,
    destinationManagedMediaUrlFingerprint: steps?.destinationManagedMediaUrlFingerprint ?? null,
    renderedImageUrlFingerprint: steps?.renderedImageUrlFingerprint ?? null,
    destinationManagedMediaTargetLocal: steps?.destinationManagedMediaTargetLocal ?? false,
    sourceFixtureSha256: attachment.sourceFixtureSha256,
    targetFileSha256: attachment.targetFileSha256,
    mimeType: attachment.mimeType,
    width: attachment.width,
    height: attachment.height,
    sourceTarget,
    destinationTarget,
    steps,
    issues,
    internalDecisionStatus: 'NOT_RUN',
    authenticationAuthority: false,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    assetReferenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}
