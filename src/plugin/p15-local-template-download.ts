import { sha256Hex } from '../core/sha256';
import {
  buildElementorTemplateCandidateArtifact,
  serializeElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateStatus,
} from '../targets/elementor/candidate-artifact';
import {
  assessP15ElementorCompatibilityReadiness,
  type P15ElementorTargetReadyStatus,
} from '../targets/elementor/compatibility-readiness';
import type { P15FigmaNeutralExtractionResult } from './p15-neutral-export-extractor';

export const P15_LOCAL_TEMPLATE_DOWNLOAD_RESULT_VERSION = 'p15-elementor-local-template-download-result-v1' as const;
export const P15_LOCAL_TEMPLATE_DOWNLOAD_RECEIPT_VERSION = 'p15-elementor-local-template-download-receipt-v1' as const;

export type P15LocalTemplateDownloadStatus =
  | 'LOCAL_ARTIFACT_VALIDATED'
  | 'DOWNLOAD_BLOCKED';

export type P15LocalTemplateDownloadBlockReasonCode =
  | 'P15_DOWNLOAD_EXTRACTION_INVALID'
  | 'P15_DOWNLOAD_MAPPING_NOT_READY'
  | 'P15_DOWNLOAD_MAPPING_REVIEW_PRESENT'
  | 'P15_DOWNLOAD_GENERATION_NOT_READY'
  | 'P15_DOWNLOAD_CANDIDATE_NOT_READY'
  | 'P15_DOWNLOAD_LOCAL_REVALIDATION_FAILED'
  | 'P15_DOWNLOAD_CANDIDATE_REVALIDATION_MISMATCH';

export interface P15LocalTemplateDownloadReceiptV1 {
  schemaVersion: 1;
  receiptVersion: typeof P15_LOCAL_TEMPLATE_DOWNLOAD_RECEIPT_VERSION;
  sourceFrameId: string;
  extractorVersion: P15FigmaNeutralExtractionResult['extractorVersion'];
  generatorVersion: P15FigmaNeutralExtractionResult['generation']['generatorVersion'];
  candidateStatus: 'READY_FOR_TARGET_IMPORT_VALIDATION';
  candidateFingerprint: string;
  artifactFingerprint: string;
  fileName: string;
  localValidationStatus: 'PASS';
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  importValidationStatus: 'NOT_RUN';
  targetEnvironmentValidationStatus: 'NOT_RUN';
  environmentObserved: false;
}

export interface P15LocalTemplateDownloadResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_LOCAL_TEMPLATE_DOWNLOAD_RESULT_VERSION;
  status: P15LocalTemplateDownloadStatus;
  source: {
    frameId: string;
    extractorVersion: P15FigmaNeutralExtractionResult['extractorVersion'];
    generatorVersion: P15FigmaNeutralExtractionResult['generation']['generatorVersion'];
  };
  compatibility: {
    status: P15ElementorTargetReadyStatus;
    compatibilityCoverage: number;
    eligibleNodeCount: number;
    blockerCount: number;
    reviewItemCount: number;
  };
  generation: {
    status: P15FigmaNeutralExtractionResult['generation']['status'];
    candidateStatus: ElementorTemplateCandidateStatus | null;
  };
  blockReasonCodes: P15LocalTemplateDownloadBlockReasonCode[];
  receipt: P15LocalTemplateDownloadReceiptV1 | null;
  templateJson: string | null;
  authority: {
    fileDownload: boolean;
    figmaMutation: false;
    networkAccess: false;
    wordpressConnection: false;
    targetImport: false;
    sectionTransfer: false;
    targetCompatibilityClaim: false;
    productionAcceptance: false;
    importValidationStatus: 'NOT_RUN';
    targetEnvironmentValidationStatus: 'NOT_RUN';
    environmentObserved: false;
  };
}

function authority(fileDownload: boolean): P15LocalTemplateDownloadResultV1['authority'] {
  return {
    fileDownload,
    figmaMutation: false,
    networkAccess: false,
    wordpressConnection: false,
    targetImport: false,
    sectionTransfer: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    importValidationStatus: 'NOT_RUN',
    targetEnvironmentValidationStatus: 'NOT_RUN',
    environmentObserved: false,
  };
}

function uniqueReasons(
  reasons: readonly P15LocalTemplateDownloadBlockReasonCode[],
): P15LocalTemplateDownloadBlockReasonCode[] {
  return [...new Set(reasons)];
}

function safeFileName(templateJson: string): string {
  return `wp-builders-elementor-${sha256Hex(templateJson).slice(0, 16)}.json`;
}

/**
 * Convert one freshly extracted P15 selected-Frame result into an explicit local-download result.
 *
 * The caller is responsible for obtaining `extraction` from the current selection for this request.
 * This function intentionally revalidates the generated template immediately before artifact exposure,
 * never promotes local validation to target/import authority, and never changes the normal preview contract.
 */
export function buildP15LocalTemplateDownloadResult(
  frame: { id: string },
  extraction: P15FigmaNeutralExtractionResult,
): P15LocalTemplateDownloadResultV1 {
  const compatibility = assessP15ElementorCompatibilityReadiness(extraction.document);
  const generationCandidate = extraction.generation.candidate;
  const reasons: P15LocalTemplateDownloadBlockReasonCode[] = [];

  if (!extraction.validation.valid || extraction.validation.reviewNodeCount > 0) {
    reasons.push('P15_DOWNLOAD_EXTRACTION_INVALID');
  }
  if (compatibility.status !== 'READY') reasons.push('P15_DOWNLOAD_MAPPING_NOT_READY');
  if (compatibility.blockers.length > 0 || compatibility.reviewItems.length > 0) {
    reasons.push('P15_DOWNLOAD_MAPPING_REVIEW_PRESENT');
  }
  if (extraction.generation.status !== 'GENERATED_LOCAL_CANDIDATE' || extraction.generation.template === null) {
    reasons.push('P15_DOWNLOAD_GENERATION_NOT_READY');
  }
  if (!generationCandidate
    || generationCandidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION'
    || !generationCandidate.validation.valid
    || generationCandidate.templateJson === null) {
    reasons.push('P15_DOWNLOAD_CANDIDATE_NOT_READY');
  }

  let freshCandidate: ReturnType<typeof buildElementorTemplateCandidateArtifact> | null = null;
  if (reasons.length === 0 && extraction.generation.template !== null) {
    freshCandidate = buildElementorTemplateCandidateArtifact(extraction.generation.template);
    if (freshCandidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION'
      || !freshCandidate.validation.valid
      || freshCandidate.reviewWidgetTypes.length > 0
      || freshCandidate.templateJson === null) {
      reasons.push('P15_DOWNLOAD_LOCAL_REVALIDATION_FAILED');
    } else if (freshCandidate.templateJson !== generationCandidate?.templateJson) {
      reasons.push('P15_DOWNLOAD_CANDIDATE_REVALIDATION_MISMATCH');
    }
  }

  const base = {
    schemaVersion: 1 as const,
    resultVersion: P15_LOCAL_TEMPLATE_DOWNLOAD_RESULT_VERSION,
    source: {
      frameId: frame.id,
      extractorVersion: extraction.extractorVersion,
      generatorVersion: extraction.generation.generatorVersion,
    },
    compatibility: {
      status: compatibility.status,
      compatibilityCoverage: compatibility.compatibilityCoverage,
      eligibleNodeCount: compatibility.eligibleNodeCount,
      blockerCount: compatibility.blockers.length,
      reviewItemCount: compatibility.reviewItems.length,
    },
    generation: {
      status: extraction.generation.status,
      candidateStatus: generationCandidate?.status ?? null,
    },
  };

  if (reasons.length > 0 || !freshCandidate?.templateJson) {
    return {
      ...base,
      status: 'DOWNLOAD_BLOCKED',
      blockReasonCodes: uniqueReasons(reasons.length > 0 ? reasons : ['P15_DOWNLOAD_LOCAL_REVALIDATION_FAILED']),
      receipt: null,
      templateJson: null,
      authority: authority(false),
    };
  }

  const templateJson = freshCandidate.templateJson;
  const serializedCandidate = serializeElementorTemplateCandidateArtifact(freshCandidate);
  const receipt: P15LocalTemplateDownloadReceiptV1 = {
    schemaVersion: 1,
    receiptVersion: P15_LOCAL_TEMPLATE_DOWNLOAD_RECEIPT_VERSION,
    sourceFrameId: frame.id,
    extractorVersion: extraction.extractorVersion,
    generatorVersion: extraction.generation.generatorVersion,
    candidateStatus: 'READY_FOR_TARGET_IMPORT_VALIDATION',
    candidateFingerprint: `sha256:${sha256Hex(serializedCandidate)}`,
    artifactFingerprint: `sha256:${sha256Hex(templateJson)}`,
    fileName: safeFileName(templateJson),
    localValidationStatus: 'PASS',
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    importValidationStatus: 'NOT_RUN',
    targetEnvironmentValidationStatus: 'NOT_RUN',
    environmentObserved: false,
  };

  return {
    ...base,
    status: 'LOCAL_ARTIFACT_VALIDATED',
    blockReasonCodes: [],
    receipt,
    templateJson,
    authority: authority(true),
  };
}
