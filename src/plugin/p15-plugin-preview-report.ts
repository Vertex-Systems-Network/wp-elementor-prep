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
 * Deliberately omits template/candidate JSON and review detail text so the normal plugin UI cannot
 * accidentally become a file-transfer/import surface or expose future target-specific values.
 */
export function buildP15PluginPreviewReport(
  frame: P15PluginPreviewFrameIdentity,
  result: P15FigmaNeutralExtractionResult,
): P15PluginPreviewReportV1 {
  const candidate = result.generation.candidate;
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
