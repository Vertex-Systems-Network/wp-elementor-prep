import {
  assessElementorTargetProfileCompatibility,
  type ElementorTargetProfileCompatibilityAssessmentV1,
} from '../targets/elementor/target-profile-assessment';
import { buildElementorTargetProfile } from '../targets/elementor/target-profile';
import type { P15FigmaNeutralExtractionResult } from './p15-neutral-export-extractor';
import type { P15PluginPreviewFrameIdentity, P15PluginPreviewReviewEntry } from './p15-plugin-preview-report';

export const P15_TARGET_PROFILE_PREVIEW_REPORT_VERSION = 'p15-elementor-target-profile-preview-report-v1' as const;
export const P15_DECLARED_VERSION_MAX_LENGTH = 64 as const;

export type P15TargetProfilePreviewStatus =
  | 'INVALID_DECLARED_PROFILE'
  | 'EXTRACTION_REVIEW_REQUIRED'
  | 'ASSESSMENT_READY';

export interface P15DeclaredTargetProfileInput {
  wordpressVersion: unknown;
  elementorVersion: unknown;
}

export interface P15TargetProfileAssessmentSummary {
  status: ElementorTargetProfileCompatibilityAssessmentV1['status'];
  profileFingerprint: string;
  candidateFingerprint: string;
  candidateStatus: NonNullable<ElementorTargetProfileCompatibilityAssessmentV1['candidateStatus']>;
  alignment: ElementorTargetProfileCompatibilityAssessmentV1['alignment'];
  capabilitySummary: NonNullable<ElementorTargetProfileCompatibilityAssessmentV1['capabilitySummary']>;
  reviewWidgetTypes: string[];
  profileIssueCodes: string[];
  templateIssueCodes: string[];
  referenceClosureStatus: 'NOT_RUN';
  targetEnvironmentValidationStatus: 'NOT_RUN';
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

export interface P15TargetProfilePreviewReportV1 {
  schemaVersion: 1;
  reportVersion: typeof P15_TARGET_PROFILE_PREVIEW_REPORT_VERSION;
  readOnly: true;
  frame: P15PluginPreviewFrameIdentity;
  status: P15TargetProfilePreviewStatus;
  declaredTarget: {
    source: 'DECLARED';
    wordpressVersion: string | null;
    elementorVersion: string | null;
    inputIssueCodes: string[];
  };
  extractionReviewEntries: P15PluginPreviewReviewEntry[];
  assessment: P15TargetProfileAssessmentSummary | null;
  authority: {
    environmentObserved: false;
    figmaMutation: false;
    networkAccess: false;
    wordpressConnection: false;
    targetImport: false;
    fileDownload: false;
    sectionTransfer: false;
    targetCompatibilityClaim: false;
    productionAcceptance: false;
  };
}

function validDeclaredVersion(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= P15_DECLARED_VERSION_MAX_LENGTH
    && value.trim() === value;
}

function inputIssueCodes(input: P15DeclaredTargetProfileInput): string[] {
  const issues: string[] = [];
  if (!validDeclaredVersion(input.wordpressVersion)) issues.push('P15_DECLARED_WORDPRESS_VERSION_INVALID');
  if (!validDeclaredVersion(input.elementorVersion)) issues.push('P15_DECLARED_ELEMENTOR_VERSION_INVALID');
  return issues;
}

function authority(): P15TargetProfilePreviewReportV1['authority'] {
  return {
    environmentObserved: false,
    figmaMutation: false,
    networkAccess: false,
    wordpressConnection: false,
    targetImport: false,
    fileDownload: false,
    sectionTransfer: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
  };
}

function reviewEntries(result: P15FigmaNeutralExtractionResult): P15PluginPreviewReviewEntry[] {
  return result.generation.reviewEntries.map((entry) => ({
    sourceNodeId: entry.sourceNodeId,
    reasonCode: entry.reasonCode,
  }));
}

/**
 * Build one sanitized, non-authorizing compatibility preview from current selected-frame extraction.
 * Declared versions are user input only; this function never promotes them to observed target evidence.
 */
export function buildP15TargetProfilePreviewReport(
  frame: P15PluginPreviewFrameIdentity,
  result: P15FigmaNeutralExtractionResult,
  input: P15DeclaredTargetProfileInput,
): P15TargetProfilePreviewReportV1 {
  const issues = inputIssueCodes(input);
  if (issues.length > 0) {
    return {
      schemaVersion: 1,
      reportVersion: P15_TARGET_PROFILE_PREVIEW_REPORT_VERSION,
      readOnly: true,
      frame: { ...frame },
      status: 'INVALID_DECLARED_PROFILE',
      declaredTarget: {
        source: 'DECLARED',
        wordpressVersion: validDeclaredVersion(input.wordpressVersion) ? input.wordpressVersion : null,
        elementorVersion: validDeclaredVersion(input.elementorVersion) ? input.elementorVersion : null,
        inputIssueCodes: issues,
      },
      extractionReviewEntries: [],
      assessment: null,
      authority: authority(),
    };
  }

  const wordpressVersion = input.wordpressVersion as string;
  const elementorVersion = input.elementorVersion as string;
  const template = result.generation.template;
  if (!template) {
    return {
      schemaVersion: 1,
      reportVersion: P15_TARGET_PROFILE_PREVIEW_REPORT_VERSION,
      readOnly: true,
      frame: { ...frame },
      status: 'EXTRACTION_REVIEW_REQUIRED',
      declaredTarget: {
        source: 'DECLARED',
        wordpressVersion,
        elementorVersion,
        inputIssueCodes: [],
      },
      extractionReviewEntries: reviewEntries(result),
      assessment: null,
      authority: authority(),
    };
  }

  const profile = buildElementorTargetProfile({ wordpressVersion, elementorVersion });
  const assessment = assessElementorTargetProfileCompatibility(template, profile);
  if (!assessment.profileIdentity
    || !assessment.candidateFingerprint
    || !assessment.candidateStatus
    || !assessment.capabilitySummary) {
    throw new Error('Elementor target-profile assessment did not return the required bounded identity summary.');
  }

  return {
    schemaVersion: 1,
    reportVersion: P15_TARGET_PROFILE_PREVIEW_REPORT_VERSION,
    readOnly: true,
    frame: { ...frame },
    status: 'ASSESSMENT_READY',
    declaredTarget: {
      source: 'DECLARED',
      wordpressVersion,
      elementorVersion,
      inputIssueCodes: [],
    },
    extractionReviewEntries: [],
    assessment: {
      status: assessment.status,
      profileFingerprint: assessment.profileIdentity.fingerprint,
      candidateFingerprint: assessment.candidateFingerprint,
      candidateStatus: assessment.candidateStatus,
      alignment: { ...assessment.alignment },
      capabilitySummary: { ...assessment.capabilitySummary },
      reviewWidgetTypes: [...assessment.reviewWidgetTypes],
      profileIssueCodes: assessment.profileIssues.map((issue) => issue.code),
      templateIssueCodes: assessment.templateIssues.map((issue) => issue.code),
      referenceClosureStatus: 'NOT_RUN',
      targetEnvironmentValidationStatus: 'NOT_RUN',
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      generationEnabled: false,
      downloadEnabled: false,
      internalReviewRequired: true,
    },
    authority: authority(),
  };
}
