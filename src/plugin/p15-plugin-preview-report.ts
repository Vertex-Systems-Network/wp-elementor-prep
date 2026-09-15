import {
  assessP15ElementorCompatibilityReadiness,
  type P15ElementorCompatibilityCountsV1,
  type P15ElementorCompatibilityFindingV1,
  type P15ElementorTargetReadyStatus,
} from '../targets/elementor/compatibility-readiness';
import type { P15FigmaNeutralExtractionResult } from './p15-neutral-export-extractor';

export const P15_PLUGIN_PREVIEW_REPORT_VERSION = 'p15-elementor-plugin-preview-report-v1' as const;

export interface P15PluginPreviewFrameIdentity {
  id: string;
  name: string;
}

export interface P15PluginPreviewReviewEntry {
  sourceNodeId: string;
  reasonCode: string;
}

export interface P15PluginPreviewReportV1 {
  schemaVersion: 1;
  reportVersion: typeof P15_PLUGIN_PREVIEW_REPORT_VERSION;
  readOnly: true;
  frame: P15PluginPreviewFrameIdentity;
  extraction: {
    extractorVersion: P15FigmaNeutralExtractionResult['extractorVersion'];
    valid: boolean;
    nodeCount: number;
    reviewNodeCount: number;
    validationIssueCodes: string[];
  };
  compatibility: {
    status: P15ElementorTargetReadyStatus;
    compatibilityCoverage: number;
    eligibleNodeCount: number;
    counts: P15ElementorCompatibilityCountsV1;
    blockers: P15ElementorCompatibilityFindingV1[];
    reviewItems: P15ElementorCompatibilityFindingV1[];
    targetCompatibilityClaim: false;
    productionAcceptance: false;
    importValidationStatus: 'NOT_RUN';
    targetEnvironmentValidationStatus: 'NOT_RUN';
    downloadEnabled: false;
  };
  generation: {
    generatorVersion: P15FigmaNeutralExtractionResult['generation']['generatorVersion'];
    status: P15FigmaNeutralExtractionResult['generation']['status'];
    candidateStatus: string | null;
    widgetTypes: string[];
    reviewWidgetTypes: string[];
    reviewEntries: P15PluginPreviewReviewEntry[];
    targetCompatibilityClaim: false;
    productionAcceptance: false;
    downloadEnabled: false;
    importValidationStatus: 'NOT_RUN';
  };
  authority: {
    figmaMutation: false;
    networkAccess: false;
    wordpressConnection: false;
    targetImport: false;
    fileDownload: false;
    sectionTransfer: false;
  };
}

/**
 * Build the bounded plugin-facing P15 inspection payload.
 *
 * Deliberately omits template/candidate JSON, neutral source content and review detail text so the normal
 * plugin UI cannot accidentally become a file-transfer/import surface or expose target-specific values.
 */
export function buildP15PluginPreviewReport(
  frame: P15PluginPreviewFrameIdentity,
  result: P15FigmaNeutralExtractionResult,
): P15PluginPreviewReportV1 {
  const candidate = result.generation.candidate;
  const compatibility = assessP15ElementorCompatibilityReadiness(result.document);
  return {
    schemaVersion: 1,
    reportVersion: P15_PLUGIN_PREVIEW_REPORT_VERSION,
    readOnly: true,
    frame: { ...frame },
    extraction: {
      extractorVersion: result.extractorVersion,
      valid: result.validation.valid,
      nodeCount: result.validation.nodeCount,
      reviewNodeCount: result.validation.reviewNodeCount,
      validationIssueCodes: result.validation.issues.map((issue) => issue.code),
    },
    compatibility: {
      status: compatibility.status,
      compatibilityCoverage: compatibility.compatibilityCoverage,
      eligibleNodeCount: compatibility.eligibleNodeCount,
      counts: { ...compatibility.counts },
      blockers: compatibility.blockers.map((finding) => ({ ...finding })),
      reviewItems: compatibility.reviewItems.map((finding) => ({ ...finding })),
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      importValidationStatus: 'NOT_RUN',
      targetEnvironmentValidationStatus: 'NOT_RUN',
      downloadEnabled: false,
    },
    generation: {
      generatorVersion: result.generation.generatorVersion,
      status: result.generation.status,
      candidateStatus: candidate?.status ?? null,
      widgetTypes: candidate ? [...candidate.validation.widgetTypes] : [],
      reviewWidgetTypes: candidate ? [...candidate.reviewWidgetTypes] : [],
      reviewEntries: result.generation.reviewEntries.map((entry) => ({
        sourceNodeId: entry.sourceNodeId,
        reasonCode: entry.reasonCode,
      })),
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      downloadEnabled: false,
      importValidationStatus: 'NOT_RUN',
    },
    authority: {
      figmaMutation: false,
      networkAccess: false,
      wordpressConnection: false,
      targetImport: false,
      fileDownload: false,
      sectionTransfer: false,
    },
  };
}
