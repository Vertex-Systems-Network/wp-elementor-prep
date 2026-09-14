import { sha256Hex } from '../../core/sha256';
import {
  GUTENBERG_DOCUMENTED_CORE_API_VERSION,
  assessGutenbergNormalizedBlockCapabilities,
} from './capability-registry';
import {
  serializeGutenbergNormalizedParsedBlockDocument,
  type GutenbergNormalizedParsedBlockDocumentV1,
  type GutenbergParsedBlockValidationIssue,
} from './parsed-block';
import {
  GUTENBERG_TARGET_PROFILE_VERSION,
  fingerprintGutenbergTargetProfile,
  validateGutenbergTargetProfile,
  type GutenbergTargetProfileIssue,
} from './target-profile';

export const GUTENBERG_TARGET_PROFILE_ASSESSMENT_VERSION = 'gutenberg-target-profile-assessment-v1' as const;

export type GutenbergTargetProfileAssessmentStatus =
  | 'BLOCKED_INVALID_PROFILE'
  | 'BLOCKED_INVALID_DOCUMENT'
  | 'REVIEW_REQUIRED'
  | 'PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING';

export interface GutenbergTargetProfileAssessmentV1 {
  schemaVersion: 1;
  assessmentVersion: typeof GUTENBERG_TARGET_PROFILE_ASSESSMENT_VERSION;
  status: GutenbergTargetProfileAssessmentStatus;
  profileIdentity: {
    profileVersion: typeof GUTENBERG_TARGET_PROFILE_VERSION;
    fingerprint: string;
  } | null;
  documentFingerprint: string | null;
  alignment: {
    adapterContract: boolean;
    capabilityRegistry: boolean;
    documentedCoreApiVersion: boolean;
    outputMode: boolean;
    serializationMode: boolean;
    responsiveMode: boolean;
  };
  capabilitySummary: {
    totalBlocks: number;
    namedBlocks: number;
    freeformBlocks: number;
    documentedCoreBlocks: number;
    reviewRequiredBlocks: number;
  } | null;
  reviewRequiredBlockInventory: Array<{
    blockName: string | null;
    count: number;
  }>;
  profileIssues: GutenbergTargetProfileIssue[];
  documentIssues: GutenbergParsedBlockValidationIssue[];
  nativeSerializationStatus: 'NOT_RUN';
  editorImportValidationStatus: 'NOT_RUN';
  renderValidationStatus: 'NOT_RUN';
  targetEnvironmentValidationStatus: 'NOT_RUN';
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

function emptyAlignment(): GutenbergTargetProfileAssessmentV1['alignment'] {
  return {
    adapterContract: false,
    capabilityRegistry: false,
    documentedCoreApiVersion: false,
    outputMode: false,
    serializationMode: false,
    responsiveMode: false,
  };
}

function cloneProfileIssues(issues: GutenbergTargetProfileIssue[]): GutenbergTargetProfileIssue[] {
  return issues.map((issue) => ({ ...issue }));
}

function cloneDocumentIssues(
  issues: GutenbergParsedBlockValidationIssue[],
): GutenbergParsedBlockValidationIssue[] {
  return issues.map((issue) => ({ ...issue }));
}

function validFingerprint(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}

function validAlignment(value: GutenbergTargetProfileAssessmentV1['alignment']): boolean {
  return typeof value.adapterContract === 'boolean'
    && typeof value.capabilityRegistry === 'boolean'
    && typeof value.documentedCoreApiVersion === 'boolean'
    && typeof value.outputMode === 'boolean'
    && typeof value.serializationMode === 'boolean'
    && typeof value.responsiveMode === 'boolean';
}

function serializableAssessment(assessment: GutenbergTargetProfileAssessmentV1): boolean {
  const validStatus = assessment.status === 'BLOCKED_INVALID_PROFILE'
    || assessment.status === 'BLOCKED_INVALID_DOCUMENT'
    || assessment.status === 'REVIEW_REQUIRED'
    || assessment.status === 'PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING';

  if (!validStatus
    || assessment.schemaVersion !== 1
    || assessment.assessmentVersion !== GUTENBERG_TARGET_PROFILE_ASSESSMENT_VERSION
    || !validAlignment(assessment.alignment)
    || assessment.nativeSerializationStatus !== 'NOT_RUN'
    || assessment.editorImportValidationStatus !== 'NOT_RUN'
    || assessment.renderValidationStatus !== 'NOT_RUN'
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
      && assessment.documentFingerprint === null
      && assessment.capabilitySummary === null
      && assessment.profileIssues.length > 0
      && assessment.documentIssues.length === 0;
  }

  const profileIdentityValid = assessment.profileIdentity !== null
    && assessment.profileIdentity.profileVersion === GUTENBERG_TARGET_PROFILE_VERSION
    && validFingerprint(assessment.profileIdentity.fingerprint);
  if (!profileIdentityValid) return false;

  if (assessment.status === 'BLOCKED_INVALID_DOCUMENT') {
    return assessment.documentFingerprint === null
      && assessment.capabilitySummary === null
      && assessment.profileIssues.length === 0
      && assessment.documentIssues.length > 0;
  }

  if (!validFingerprint(assessment.documentFingerprint)
    || assessment.capabilitySummary === null
    || assessment.profileIssues.length !== 0
    || assessment.documentIssues.length !== 0) {
    return false;
  }

  if (assessment.status === 'PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING') {
    return Object.values(assessment.alignment).every((value) => value === true)
      && assessment.capabilitySummary.reviewRequiredBlocks === 0
      && assessment.reviewRequiredBlockInventory.length === 0;
  }

  return true;
}

/**
 * Bind one repository-normalized Gutenberg document/capability assessment to one exact declared target profile.
 *
 * The strongest result, `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING`, means only that repository-owned normalized
 * metadata and the documented-core capability registry align with the declared profile. Native serialization,
 * WordPress editor/import/render validation and target-environment validation remain NOT_RUN, so this assessment
 * never grants compatibility, production, generation or download authority.
 */
export function assessGutenbergTargetProfile(
  documentValue: unknown,
  profileValue: unknown,
): GutenbergTargetProfileAssessmentV1 {
  const profileValidation = validateGutenbergTargetProfile(profileValue);
  if (!profileValidation.valid || profileValidation.profile === null) {
    return {
      schemaVersion: 1,
      assessmentVersion: GUTENBERG_TARGET_PROFILE_ASSESSMENT_VERSION,
      status: 'BLOCKED_INVALID_PROFILE',
      profileIdentity: null,
      documentFingerprint: null,
      alignment: emptyAlignment(),
      capabilitySummary: null,
      reviewRequiredBlockInventory: [],
      profileIssues: cloneProfileIssues(profileValidation.issues),
      documentIssues: [],
      nativeSerializationStatus: 'NOT_RUN',
      editorImportValidationStatus: 'NOT_RUN',
      renderValidationStatus: 'NOT_RUN',
      targetEnvironmentValidationStatus: 'NOT_RUN',
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      generationEnabled: false,
      downloadEnabled: false,
      internalReviewRequired: true,
    };
  }

  const profile = profileValidation.profile;
  const capabilityReport = assessGutenbergNormalizedBlockCapabilities(documentValue);
  const profileIdentity = {
    profileVersion: GUTENBERG_TARGET_PROFILE_VERSION,
    fingerprint: fingerprintGutenbergTargetProfile(profile),
  };

  if (!capabilityReport.documentValid || capabilityReport.status === 'INVALID_DOCUMENT') {
    return {
      schemaVersion: 1,
      assessmentVersion: GUTENBERG_TARGET_PROFILE_ASSESSMENT_VERSION,
      status: 'BLOCKED_INVALID_DOCUMENT',
      profileIdentity,
      documentFingerprint: null,
      alignment: emptyAlignment(),
      capabilitySummary: null,
      reviewRequiredBlockInventory: [],
      profileIssues: [],
      documentIssues: cloneDocumentIssues(capabilityReport.validationIssues),
      nativeSerializationStatus: 'NOT_RUN',
      editorImportValidationStatus: 'NOT_RUN',
      renderValidationStatus: 'NOT_RUN',
      targetEnvironmentValidationStatus: 'NOT_RUN',
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      generationEnabled: false,
      downloadEnabled: false,
      internalReviewRequired: true,
    };
  }

  const document = documentValue as GutenbergNormalizedParsedBlockDocumentV1;
  const serializedDocument = serializeGutenbergNormalizedParsedBlockDocument(document);
  const alignment = {
    adapterContract: capabilityReport.targetContractVersion === profile.adapterContractVersion,
    capabilityRegistry: capabilityReport.registryVersion === profile.capabilityRegistryVersion,
    documentedCoreApiVersion: profile.documentedCoreApiVersion === GUTENBERG_DOCUMENTED_CORE_API_VERSION,
    outputMode: profile.outputMode === 'NORMALIZED_REVIEW_ONLY',
    serializationMode: profile.serializationMode === 'UNWIRED',
    responsiveMode: profile.responsiveMode === 'SOURCE_ONLY',
  };
  const allMetadataAligned = Object.values(alignment).every((value) => value === true);
  const reviewRequiredBlockInventory = capabilityReport.blockInventory
    .filter((entry) => entry.classification === 'REVIEW_REQUIRED')
    .map((entry) => ({
      blockName: entry.blockName,
      count: entry.count,
    }));

  const status: GutenbergTargetProfileAssessmentStatus = !allMetadataAligned
    || capabilityReport.summary.reviewRequiredBlocks > 0
    ? 'REVIEW_REQUIRED'
    : 'PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING';

  return {
    schemaVersion: 1,
    assessmentVersion: GUTENBERG_TARGET_PROFILE_ASSESSMENT_VERSION,
    status,
    profileIdentity,
    documentFingerprint: `sha256:${sha256Hex(serializedDocument)}`,
    alignment,
    capabilitySummary: {
      totalBlocks: capabilityReport.summary.totalBlocks,
      namedBlocks: capabilityReport.summary.namedBlocks,
      freeformBlocks: capabilityReport.summary.freeformBlocks,
      documentedCoreBlocks: capabilityReport.summary.documentedCoreBlocks,
      reviewRequiredBlocks: capabilityReport.summary.reviewRequiredBlocks,
    },
    reviewRequiredBlockInventory,
    profileIssues: [],
    documentIssues: [],
    nativeSerializationStatus: 'NOT_RUN',
    editorImportValidationStatus: 'NOT_RUN',
    renderValidationStatus: 'NOT_RUN',
    targetEnvironmentValidationStatus: 'NOT_RUN',
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

export function serializeGutenbergTargetProfileAssessment(
  assessment: GutenbergTargetProfileAssessmentV1,
): string {
  if (!serializableAssessment(assessment)) {
    throw new Error('Invalid or authority-inflated Gutenberg target-profile assessment.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    assessmentVersion: GUTENBERG_TARGET_PROFILE_ASSESSMENT_VERSION,
    status: assessment.status,
    profileIdentity: assessment.profileIdentity ? { ...assessment.profileIdentity } : null,
    documentFingerprint: assessment.documentFingerprint,
    alignment: { ...assessment.alignment },
    capabilitySummary: assessment.capabilitySummary ? { ...assessment.capabilitySummary } : null,
    reviewRequiredBlockInventory: assessment.reviewRequiredBlockInventory.map((entry) => ({ ...entry })),
    profileIssues: cloneProfileIssues(assessment.profileIssues),
    documentIssues: cloneDocumentIssues(assessment.documentIssues),
    nativeSerializationStatus: 'NOT_RUN',
    editorImportValidationStatus: 'NOT_RUN',
    renderValidationStatus: 'NOT_RUN',
    targetEnvironmentValidationStatus: 'NOT_RUN',
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  }, null, 2)}\n`;
}
