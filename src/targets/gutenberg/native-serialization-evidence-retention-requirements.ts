import { sha256Hex } from '../../core/sha256';
import type { GutenbergNormalizedCandidateIdentityV1 } from './candidate-identity';
import {
  buildGutenbergNativeSerializationDecisionPrerequisite,
  type GutenbergNativeSerializationDecisionPrerequisiteStatus,
} from './native-serialization-decision-prerequisite';
import { validateGutenbergTargetProfile } from './target-profile';

export const GUTENBERG_NATIVE_SERIALIZATION_EVIDENCE_RETENTION_REQUIREMENTS_VERSION =
  'gutenberg-native-serialization-evidence-retention-requirements-v1' as const;

export const GUTENBERG_NATIVE_SERIALIZATION_EVIDENCE_RETENTION_PROFILE_VERSION =
  'gutenberg-native-serialization-evidence-retention-profile-v1' as const;

export type GutenbergNativeSerializationEvidenceRetentionRequirementsStatus =
  | 'REJECTED_PREREQUISITE_NOT_READY'
  | 'EVIDENCE_RETENTION_REQUIREMENTS_READY';

export type GutenbergNativeSerializationEvidenceRetentionRequirementsNextAction =
  | 'FIX_PREREQUISITE_CHAIN_BEFORE_EVIDENCE_RETENTION'
  | 'RETAIN_GENUINE_AUTHENTICATED_EVIDENCE_USING_REQUIREMENTS';

export interface GutenbergNativeSerializationEvidenceRetentionProfileV1 {
  schemaVersion: 1;
  profileVersion: typeof GUTENBERG_NATIVE_SERIALIZATION_EVIDENCE_RETENTION_PROFILE_VERSION;
  digestAlgorithm: 'SHA-256';
  requiredBindings: readonly [
    'candidateIdentityDigest',
    'canonicalReceiptSha256',
    'canonicalAuthenticationReportSha256',
    'declaredWordpressVersion',
  ];
  authenticatedEvidenceArtifact: {
    sha256Required: true;
    byteLengthRequired: true;
    rawArtifactForbiddenInManifest: true;
  };
  authenticatorIdentity: {
    referenceSha256Required: true;
    rawIdentityReferenceForbiddenInManifest: true;
  };
  authenticationMethod: {
    boundedIdentifierRequired: true;
    maxLength: 64;
  };
  authenticatedAt: {
    canonicalIso8601UtcRequired: true;
  };
  targetBinding: {
    exactDeclaredWordpressVersionRequired: true;
    observedTargetValidationNotImplied: true;
  };
}

export interface GutenbergNativeSerializationEvidenceRetentionRequirementsV1 {
  schemaVersion: 1;
  manifestVersion: typeof GUTENBERG_NATIVE_SERIALIZATION_EVIDENCE_RETENTION_REQUIREMENTS_VERSION;
  status: GutenbergNativeSerializationEvidenceRetentionRequirementsStatus;
  prerequisiteStatus: GutenbergNativeSerializationDecisionPrerequisiteStatus;
  currentCandidateIdentity: GutenbergNormalizedCandidateIdentityV1 | null;
  canonicalReceiptSha256: string | null;
  canonicalAuthenticationReportSha256: string | null;
  declaredWordpressVersion: string | null;
  requirementsProfile: GutenbergNativeSerializationEvidenceRetentionProfileV1 | null;
  requirementsProfileSha256: string | null;
  nextAction: GutenbergNativeSerializationEvidenceRetentionRequirementsNextAction;
  evidenceAuthenticationStatus: 'NOT_RUN';
  authenticationAuthority: false;
  nativeSerializationAuthority: false;
  targetEnvironmentValidated: false;
  editorImportValidated: false;
  renderValidated: false;
  decisionAuthority: false;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalDecisionStatus: 'NOT_RUN';
  internalDecisionEligible: false;
  internalReviewRequired: true;
}

const REQUIREMENTS_PROFILE: GutenbergNativeSerializationEvidenceRetentionProfileV1 = {
  schemaVersion: 1,
  profileVersion: GUTENBERG_NATIVE_SERIALIZATION_EVIDENCE_RETENTION_PROFILE_VERSION,
  digestAlgorithm: 'SHA-256',
  requiredBindings: [
    'candidateIdentityDigest',
    'canonicalReceiptSha256',
    'canonicalAuthenticationReportSha256',
    'declaredWordpressVersion',
  ],
  authenticatedEvidenceArtifact: {
    sha256Required: true,
    byteLengthRequired: true,
    rawArtifactForbiddenInManifest: true,
  },
  authenticatorIdentity: {
    referenceSha256Required: true,
    rawIdentityReferenceForbiddenInManifest: true,
  },
  authenticationMethod: {
    boundedIdentifierRequired: true,
    maxLength: 64,
  },
  authenticatedAt: {
    canonicalIso8601UtcRequired: true,
  },
  targetBinding: {
    exactDeclaredWordpressVersionRequired: true,
    observedTargetValidationNotImplied: true,
  },
};

function snapshotRequirementsProfile(): GutenbergNativeSerializationEvidenceRetentionProfileV1 {
  return {
    ...REQUIREMENTS_PROFILE,
    requiredBindings: [...REQUIREMENTS_PROFILE.requiredBindings],
    authenticatedEvidenceArtifact: { ...REQUIREMENTS_PROFILE.authenticatedEvidenceArtifact },
    authenticatorIdentity: { ...REQUIREMENTS_PROFILE.authenticatorIdentity },
    authenticationMethod: { ...REQUIREMENTS_PROFILE.authenticationMethod },
    authenticatedAt: { ...REQUIREMENTS_PROFILE.authenticatedAt },
    targetBinding: { ...REQUIREMENTS_PROFILE.targetBinding },
  };
}

export function serializeGutenbergNativeSerializationEvidenceRetentionProfile(
  profile: GutenbergNativeSerializationEvidenceRetentionProfileV1 = REQUIREMENTS_PROFILE,
): string {
  return `${JSON.stringify(profile, null, 2)}\n`;
}

export function fingerprintGutenbergNativeSerializationEvidenceRetentionProfile(
  profile: GutenbergNativeSerializationEvidenceRetentionProfileV1 = REQUIREMENTS_PROFILE,
): string {
  return `sha256:${sha256Hex(serializeGutenbergNativeSerializationEvidenceRetentionProfile(profile))}`;
}

/**
 * Build requirements metadata for future genuinely retained authenticated evidence.
 *
 * This manifest deliberately accepts no evidence artifact, authenticator assertion, PASS|FAIL authentication
 * result, or internal decision. READY means only that the current deterministic prerequisite chain is exact and
 * the repository can state what a future separate trusted intake must bind and retain.
 */
export function buildGutenbergNativeSerializationEvidenceRetentionRequirements(
  documentValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
  authenticationReportValue: unknown,
): GutenbergNativeSerializationEvidenceRetentionRequirementsV1 {
  const prerequisite = buildGutenbergNativeSerializationDecisionPrerequisite(
    documentValue,
    profileValue,
    receiptValue,
    authenticationReportValue,
  );
  const profileValidation = validateGutenbergTargetProfile(profileValue);
  const ready = prerequisite.status === 'GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED'
    && prerequisite.authenticationReportValid
    && prerequisite.authenticationBindingMatches
    && prerequisite.currentCandidateIdentity !== null
    && prerequisite.canonicalReceiptSha256 !== null
    && prerequisite.canonicalAuthenticationReportSha256 !== null
    && profileValidation.valid
    && profileValidation.profile !== null;

  const requirementsProfile = ready ? snapshotRequirementsProfile() : null;

  return {
    schemaVersion: 1,
    manifestVersion: GUTENBERG_NATIVE_SERIALIZATION_EVIDENCE_RETENTION_REQUIREMENTS_VERSION,
    status: ready
      ? 'EVIDENCE_RETENTION_REQUIREMENTS_READY'
      : 'REJECTED_PREREQUISITE_NOT_READY',
    prerequisiteStatus: prerequisite.status,
    currentCandidateIdentity: ready && prerequisite.currentCandidateIdentity
      ? { ...prerequisite.currentCandidateIdentity }
      : null,
    canonicalReceiptSha256: ready ? prerequisite.canonicalReceiptSha256 : null,
    canonicalAuthenticationReportSha256: ready
      ? prerequisite.canonicalAuthenticationReportSha256
      : null,
    declaredWordpressVersion: ready && profileValidation.profile
      ? profileValidation.profile.environment.wordpressVersion
      : null,
    requirementsProfile,
    requirementsProfileSha256: requirementsProfile
      ? fingerprintGutenbergNativeSerializationEvidenceRetentionProfile(requirementsProfile)
      : null,
    nextAction: ready
      ? 'RETAIN_GENUINE_AUTHENTICATED_EVIDENCE_USING_REQUIREMENTS'
      : 'FIX_PREREQUISITE_CHAIN_BEFORE_EVIDENCE_RETENTION',
    evidenceAuthenticationStatus: 'NOT_RUN',
    authenticationAuthority: false,
    nativeSerializationAuthority: false,
    targetEnvironmentValidated: false,
    editorImportValidated: false,
    renderValidated: false,
    decisionAuthority: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalDecisionStatus: 'NOT_RUN',
    internalDecisionEligible: false,
    internalReviewRequired: true,
  };
}

export function serializeGutenbergNativeSerializationEvidenceRetentionRequirements(
  documentValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
  authenticationReportValue: unknown,
): string {
  return `${JSON.stringify(
    buildGutenbergNativeSerializationEvidenceRetentionRequirements(
      documentValue,
      profileValue,
      receiptValue,
      authenticationReportValue,
    ),
    null,
    2,
  )}\n`;
}
