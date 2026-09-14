import { GUTENBERG_CAPABILITY_REGISTRY_VERSION } from './capability-registry';
import {
  GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
  serializeGutenbergNormalizedParsedBlockDocument,
  type GutenbergNormalizedParsedBlockDocumentV1,
} from './parsed-block';
import {
  GUTENBERG_TARGET_PROFILE_ASSESSMENT_VERSION,
  assessGutenbergTargetProfile,
  type GutenbergTargetProfileAssessmentV1,
} from './target-profile-assessment';
import {
  GUTENBERG_TARGET_PROFILE_VERSION,
  serializeGutenbergTargetProfile,
  validateGutenbergTargetProfile,
} from './target-profile';

export const GUTENBERG_NORMALIZED_CANDIDATE_VERSION = 'gutenberg-normalized-candidate-v1' as const;

export type GutenbergNormalizedCandidateStatus =
  | 'REJECTED_INVALID_PROFILE'
  | 'REJECTED_INVALID_DOCUMENT'
  | 'REVIEW_REQUIRED'
  | 'READY_FOR_NATIVE_SERIALIZATION_VALIDATION';

export interface GutenbergNormalizedCandidateArtifactV1 {
  schemaVersion: 1;
  candidateVersion: typeof GUTENBERG_NORMALIZED_CANDIDATE_VERSION;
  targetContractVersion: typeof GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION;
  capabilityRegistryVersion: typeof GUTENBERG_CAPABILITY_REGISTRY_VERSION;
  targetProfileVersion: typeof GUTENBERG_TARGET_PROFILE_VERSION;
  assessmentVersion: typeof GUTENBERG_TARGET_PROFILE_ASSESSMENT_VERSION;
  status: GutenbergNormalizedCandidateStatus;
  nativeSerializationValidationStatus: 'NOT_RUN';
  editorImportValidationStatus: 'NOT_RUN';
  renderValidationStatus: 'NOT_RUN';
  targetEnvironmentValidationStatus: 'NOT_RUN';
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  assessment: GutenbergTargetProfileAssessmentV1;
  profileJson: string | null;
  normalizedDocumentJson: string | null;
}

function candidateStatusFromAssessment(
  status: GutenbergTargetProfileAssessmentV1['status'],
): GutenbergNormalizedCandidateStatus {
  switch (status) {
    case 'BLOCKED_INVALID_PROFILE':
      return 'REJECTED_INVALID_PROFILE';
    case 'BLOCKED_INVALID_DOCUMENT':
      return 'REJECTED_INVALID_DOCUMENT';
    case 'REVIEW_REQUIRED':
      return 'REVIEW_REQUIRED';
    case 'PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING':
      return 'READY_FOR_NATIVE_SERIALIZATION_VALIDATION';
  }
}

/**
 * Build one deterministic, non-authorizing candidate envelope around the repository-owned normalized
 * Gutenberg document plus a declared target profile.
 *
 * `READY_FOR_NATIVE_SERIALIZATION_VALIDATION` means only that the normalized document/profile/capability
 * gates are clear enough to enter a future, separately implemented native-serialization validation step.
 * This artifact does not serialize Gutenberg post content, run WordPress, validate editor/import/render
 * behavior, establish target compatibility, or grant production/generation/download authority.
 */
export function buildGutenbergNormalizedCandidateArtifact(
  documentValue: unknown,
  profileValue: unknown,
): GutenbergNormalizedCandidateArtifactV1 {
  const assessment = assessGutenbergTargetProfile(documentValue, profileValue);
  const status = candidateStatusFromAssessment(assessment.status);

  let profileJson: string | null = null;
  if (assessment.status !== 'BLOCKED_INVALID_PROFILE') {
    const profileValidation = validateGutenbergTargetProfile(profileValue);
    if (!profileValidation.valid || profileValidation.profile === null) {
      throw new Error('Gutenberg candidate assessment contradicted successful target-profile validation.');
    }
    profileJson = serializeGutenbergTargetProfile(profileValidation.profile);
  }

  let normalizedDocumentJson: string | null = null;
  if (assessment.status === 'REVIEW_REQUIRED'
    || assessment.status === 'PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING') {
    normalizedDocumentJson = serializeGutenbergNormalizedParsedBlockDocument(
      documentValue as GutenbergNormalizedParsedBlockDocumentV1,
    );
  }

  return {
    schemaVersion: 1,
    candidateVersion: GUTENBERG_NORMALIZED_CANDIDATE_VERSION,
    targetContractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    capabilityRegistryVersion: GUTENBERG_CAPABILITY_REGISTRY_VERSION,
    targetProfileVersion: GUTENBERG_TARGET_PROFILE_VERSION,
    assessmentVersion: GUTENBERG_TARGET_PROFILE_ASSESSMENT_VERSION,
    status,
    nativeSerializationValidationStatus: 'NOT_RUN',
    editorImportValidationStatus: 'NOT_RUN',
    renderValidationStatus: 'NOT_RUN',
    targetEnvironmentValidationStatus: 'NOT_RUN',
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    assessment,
    profileJson,
    normalizedDocumentJson,
  };
}

/** Serialize only the normalized candidate JSON envelope. This is not Gutenberg post-content serialization. */
export function serializeGutenbergNormalizedCandidateArtifact(
  artifact: GutenbergNormalizedCandidateArtifactV1,
): string {
  return `${JSON.stringify(artifact, null, 2)}\n`;
}
