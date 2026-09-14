import { sha256Hex } from '../../core/sha256';
import {
  buildElementorTemplateCandidateArtifact,
  serializeElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateStatus,
} from './candidate-artifact';
import type { ElementorTemplateValidationIssue } from './template-v04';
import {
  ELEMENTOR_TARGET_PROFILE_VERSION,
  fingerprintElementorTargetProfile,
  validateElementorTargetProfile,
  type ElementorTargetProfileIssue,
} from './target-profile';

export const ELEMENTOR_TARGET_PROFILE_ASSESSMENT_VERSION = 'elementor-target-profile-assessment-v1' as const;

export type ElementorTargetProfileAssessmentStatus =
  | 'BLOCKED_INVALID_PROFILE'
  | 'BLOCKED_INVALID_TEMPLATE'
  | 'REVIEW_REQUIRED'
  | 'PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING';

export interface ElementorTargetProfileCompatibilityAssessmentV1 {
  schemaVersion: 1;
  assessmentVersion: typeof ELEMENTOR_TARGET_PROFILE_ASSESSMENT_VERSION;
  status: ElementorTargetProfileAssessmentStatus;
  profileIdentity: {
    profileVersion: typeof ELEMENTOR_TARGET_PROFILE_VERSION;
    fingerprint: string;
  } | null;
  candidateFingerprint: string | null;
  candidateStatus: ElementorTemplateCandidateStatus | null;
  alignment: {
    adapterContract: boolean;
    capabilityRegistry: boolean;
    documentDataVersion: boolean;
    architecture: boolean;
    outputMode: boolean;
    responsiveMode: boolean;
  };
  capabilitySummary: {
    totalWidgets: number;
    documentedCoreWidgets: number;
    reviewRequiredWidgets: number;
    widgetsWithResponsiveSettings: number;
    widgetsWithGlobalReferences: number;
  } | null;
  reviewWidgetTypes: string[];
  profileIssues: ElementorTargetProfileIssue[];
  templateIssues: ElementorTemplateValidationIssue[];
  referenceClosureStatus: 'NOT_RUN';
  targetEnvironmentValidationStatus: 'NOT_RUN';
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

function emptyAlignment(): ElementorTargetProfileCompatibilityAssessmentV1['alignment'] {
  return {
    adapterContract: false,
    capabilityRegistry: false,
    documentDataVersion: false,
    architecture: false,
    outputMode: false,
    responsiveMode: false,
  };
}

function cloneProfileIssues(issues: ElementorTargetProfileIssue[]): ElementorTargetProfileIssue[] {
  return issues.map((issue) => ({ ...issue }));
}

function cloneTemplateIssues(issues: ElementorTemplateValidationIssue[]): ElementorTemplateValidationIssue[] {
  return issues.map((issue) => ({ ...issue }));
}

function validFingerprint(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}

function serializableAssessment(assessment: ElementorTargetProfileCompatibilityAssessmentV1): boolean {
  const validStatus = assessment.status === 'BLOCKED_INVALID_PROFILE'
    || assessment.status === 'BLOCKED_INVALID_TEMPLATE'
    || assessment.status === 'REVIEW_REQUIRED'
    || assessment.status === 'PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING';
  if (!validStatus
    || assessment.schemaVersion !== 1
    || assessment.assessmentVersion !== ELEMENTOR_TARGET_PROFILE_ASSESSMENT_VERSION
    || assessment.referenceClosureStatus !== 'NOT_RUN'
    || assessment.targetEnvironmentValidationStatus !== 'NOT_RUN'
    || assessment.targetCompatibilityClaim !== false
    || assessment.productionAcceptance !== false
    || assessment.generationEnabled !== false
    || assessment.downloadEnabled !== false
    || assessment.internalReviewRequired !== true) {
    return false;
  }

  if (assessment.status === 'BLOCKED_INVALID_PROFILE') {
    return assessment.profileIdentity === null
      && assessment.candidateFingerprint === null
      && assessment.candidateStatus === null;
  }

  return assessment.profileIdentity !== null
    && assessment.profileIdentity.profileVersion === ELEMENTOR_TARGET_PROFILE_VERSION
    && validFingerprint(assessment.profileIdentity.fingerprint)
    && validFingerprint(assessment.candidateFingerprint)
    && assessment.candidateStatus !== null;
}

/**
 * Assess untrusted Elementor template input against one immutable declared target profile.
 *
 * `PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING` means only that the bounded schema/capability metadata aligns
 * with the declared profile. Reference closure and real target-environment validation remain NOT_RUN, and
 * this assessment never grants compatibility, generation, production or download authority.
 */
export function assessElementorTargetProfileCompatibility(
  templateValue: unknown,
  profileValue: unknown,
): ElementorTargetProfileCompatibilityAssessmentV1 {
  const profileValidation = validateElementorTargetProfile(profileValue);
  if (!profileValidation.valid || profileValidation.profile === null) {
    return {
      schemaVersion: 1,
      assessmentVersion: ELEMENTOR_TARGET_PROFILE_ASSESSMENT_VERSION,
      status: 'BLOCKED_INVALID_PROFILE',
      profileIdentity: null,
      candidateFingerprint: null,
      candidateStatus: null,
      alignment: emptyAlignment(),
      capabilitySummary: null,
      reviewWidgetTypes: [],
      profileIssues: cloneProfileIssues(profileValidation.issues),
      templateIssues: [],
      referenceClosureStatus: 'NOT_RUN',
      targetEnvironmentValidationStatus: 'NOT_RUN',
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      generationEnabled: false,
      downloadEnabled: false,
      internalReviewRequired: true,
    };
  }

  const profile = profileValidation.profile;
  const candidate = buildElementorTemplateCandidateArtifact(templateValue);
  const serializedCandidate = serializeElementorTemplateCandidateArtifact(candidate);
  const alignment = {
    adapterContract: candidate.targetContractVersion === profile.adapterContractVersion,
    capabilityRegistry: candidate.capabilityRegistryVersion === profile.capabilityRegistryVersion,
    documentDataVersion: candidate.validation.valid
      && candidate.validation.documentVersion === profile.documentDataVersion,
    architecture: candidate.validation.valid && profile.architecture === 'CONTAINER',
    outputMode: profile.outputMode === 'TEMPLATE_JSON',
    responsiveMode: profile.responsiveMode === 'SOURCE_ONLY',
  };
  const allMetadataAligned = Object.values(alignment).every((value) => value === true);

  let status: ElementorTargetProfileAssessmentStatus;
  if (candidate.status === 'REJECTED_INVALID_TEMPLATE') {
    status = 'BLOCKED_INVALID_TEMPLATE';
  } else if (!allMetadataAligned || candidate.status === 'REVIEW_REQUIRED') {
    status = 'REVIEW_REQUIRED';
  } else {
    status = 'PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING';
  }

  const summary = candidate.capabilityReport?.summary ?? null;
  return {
    schemaVersion: 1,
    assessmentVersion: ELEMENTOR_TARGET_PROFILE_ASSESSMENT_VERSION,
    status,
    profileIdentity: {
      profileVersion: ELEMENTOR_TARGET_PROFILE_VERSION,
      fingerprint: fingerprintElementorTargetProfile(profile),
    },
    candidateFingerprint: `sha256:${sha256Hex(serializedCandidate)}`,
    candidateStatus: candidate.status,
    alignment,
    capabilitySummary: summary
      ? {
        totalWidgets: summary.totalWidgets,
        documentedCoreWidgets: summary.documentedCoreWidgets,
        reviewRequiredWidgets: summary.reviewRequiredWidgets,
        widgetsWithResponsiveSettings: summary.widgetsWithResponsiveSettings,
        widgetsWithGlobalReferences: summary.widgetsWithGlobalReferences,
      }
      : null,
    reviewWidgetTypes: [...candidate.reviewWidgetTypes],
    profileIssues: [],
    templateIssues: cloneTemplateIssues(candidate.validation.issues),
    referenceClosureStatus: 'NOT_RUN',
    targetEnvironmentValidationStatus: 'NOT_RUN',
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

export function serializeElementorTargetProfileCompatibilityAssessment(
  assessment: ElementorTargetProfileCompatibilityAssessmentV1,
): string {
  if (!serializableAssessment(assessment)) {
    throw new Error('Invalid or authority-inflated Elementor target-profile compatibility assessment.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    assessmentVersion: ELEMENTOR_TARGET_PROFILE_ASSESSMENT_VERSION,
    status: assessment.status,
    profileIdentity: assessment.profileIdentity,
    candidateFingerprint: assessment.candidateFingerprint,
    candidateStatus: assessment.candidateStatus,
    alignment: { ...assessment.alignment },
    capabilitySummary: assessment.capabilitySummary ? { ...assessment.capabilitySummary } : null,
    reviewWidgetTypes: [...assessment.reviewWidgetTypes],
    profileIssues: cloneProfileIssues(assessment.profileIssues),
    templateIssues: cloneTemplateIssues(assessment.templateIssues),
    referenceClosureStatus: 'NOT_RUN',
    targetEnvironmentValidationStatus: 'NOT_RUN',
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  }, null, 2)}\n`;
}
