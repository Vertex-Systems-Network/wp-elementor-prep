import { sha256Hex } from '../../core/sha256';
import {
  GUTENBERG_NORMALIZED_CANDIDATE_VERSION,
  buildGutenbergNormalizedCandidateArtifact,
  serializeGutenbergNormalizedCandidateArtifact,
  type GutenbergNormalizedCandidateArtifactV1,
} from './candidate-artifact';
import { GUTENBERG_CAPABILITY_REGISTRY_VERSION } from './capability-registry';
import { GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION } from './parsed-block';
import { GUTENBERG_TARGET_PROFILE_ASSESSMENT_VERSION } from './target-profile-assessment';
import { GUTENBERG_TARGET_PROFILE_VERSION } from './target-profile';

export const GUTENBERG_NORMALIZED_CANDIDATE_IDENTITY_VERSION = 'gutenberg-normalized-candidate-identity-v1' as const;

export interface GutenbergNormalizedCandidateIdentityV1 {
  schemaVersion: 1;
  identityVersion: typeof GUTENBERG_NORMALIZED_CANDIDATE_IDENTITY_VERSION;
  candidateVersion: typeof GUTENBERG_NORMALIZED_CANDIDATE_VERSION;
  targetContractVersion: typeof GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION;
  capabilityRegistryVersion: typeof GUTENBERG_CAPABILITY_REGISTRY_VERSION;
  targetProfileVersion: typeof GUTENBERG_TARGET_PROFILE_VERSION;
  assessmentVersion: typeof GUTENBERG_TARGET_PROFILE_ASSESSMENT_VERSION;
  algorithm: 'SHA-256';
  digest: string;
}

type CanonicalReadyInspection =
  | { status: 'READY'; serialized: string }
  | { status: 'NOT_READY'; serialized: null }
  | { status: 'NONCANONICAL'; serialized: null };

function inspectCanonicalReadyCandidate(
  candidate: GutenbergNormalizedCandidateArtifactV1,
): CanonicalReadyInspection {
  if (candidate.status !== 'READY_FOR_NATIVE_SERIALIZATION_VALIDATION'
    || typeof candidate.profileJson !== 'string'
    || typeof candidate.normalizedDocumentJson !== 'string') {
    return { status: 'NOT_READY', serialized: null };
  }

  try {
    const parsedProfile: unknown = JSON.parse(candidate.profileJson);
    const parsedDocument: unknown = JSON.parse(candidate.normalizedDocumentJson);
    const rebuilt = buildGutenbergNormalizedCandidateArtifact(parsedDocument, parsedProfile);

    if (rebuilt.status !== 'READY_FOR_NATIVE_SERIALIZATION_VALIDATION') {
      return { status: 'NONCANONICAL', serialized: null };
    }

    const serialized = serializeGutenbergNormalizedCandidateArtifact(candidate);
    const rebuiltSerialized = serializeGutenbergNormalizedCandidateArtifact(rebuilt);
    if (serialized !== rebuiltSerialized) {
      return { status: 'NONCANONICAL', serialized: null };
    }

    return { status: 'READY', serialized };
  } catch {
    return { status: 'NONCANONICAL', serialized: null };
  }
}

/**
 * Build a compact SHA-256 integrity identity for one exact canonical READY normalized Gutenberg candidate.
 *
 * The digest is not a signature, authentication proof, native-serialization proof, WordPress import/render
 * proof, compatibility claim, or authorization token. It only binds the exact canonical candidate bytes.
 */
export function buildGutenbergNormalizedCandidateIdentity(
  candidate: GutenbergNormalizedCandidateArtifactV1,
): GutenbergNormalizedCandidateIdentityV1 {
  const inspection = inspectCanonicalReadyCandidate(candidate);
  if (inspection.status === 'NOT_READY') {
    throw new Error('Gutenberg normalized candidate is not ready for native serialization validation.');
  }
  if (inspection.status !== 'READY') {
    throw new Error('Gutenberg normalized candidate is not the canonical artifact rebuilt from its embedded profile/document JSON.');
  }

  return {
    schemaVersion: 1,
    identityVersion: GUTENBERG_NORMALIZED_CANDIDATE_IDENTITY_VERSION,
    candidateVersion: GUTENBERG_NORMALIZED_CANDIDATE_VERSION,
    targetContractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    capabilityRegistryVersion: GUTENBERG_CAPABILITY_REGISTRY_VERSION,
    targetProfileVersion: GUTENBERG_TARGET_PROFILE_VERSION,
    assessmentVersion: GUTENBERG_TARGET_PROFILE_ASSESSMENT_VERSION,
    algorithm: 'SHA-256',
    digest: `sha256:${sha256Hex(inspection.serialized)}`,
  };
}

export function serializeGutenbergNormalizedCandidateIdentity(
  identity: GutenbergNormalizedCandidateIdentityV1,
): string {
  return `${JSON.stringify(identity, null, 2)}\n`;
}
