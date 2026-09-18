import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  buildElementorTemplateCandidateIdentity,
  type ElementorTemplateCandidateIdentityV1,
} from './import-validation-contract';
import {
  fingerprintElementorTargetProfile,
  validateElementorTargetProfile,
  type ElementorTargetProfileIssueCode,
  type ElementorTargetProfileV1,
} from './target-profile';

export const P15_ELEMENTOR_REFERENCE_PROOF_REGISTRY_VERSION = 'p15-elementor-reference-proof-registry-v2' as const;
export const P15_ELEMENTOR_REFERENCE_PROOF_ALIGNMENT_VERSION = 'p15-elementor-reference-proof-alignment-v2' as const;
export const P15_ELEMENTOR_WP68_E424_PROOF_ID = 'p15-wp6.8-elementor4.2.4-container-proof-v1' as const;

export type P15ElementorReferenceProofScope =
  | 'IMPORT'
  | 'EDITOR_OPEN'
  | 'RENDER'
  | 'FIDELITY_STRUCTURE'
  | 'FIDELITY_SOLID_BACKGROUND'
  | 'FIDELITY_UNIFORM_RADIUS';

export type P15ElementorReferenceProofExcludedScope =
  | 'ATOMIC_V4'
  | 'ELEMENTOR_PRO'
  | 'THIRD_PARTY_ADDONS'
  | 'RESPONSIVE_MAPPING'
  | 'MEDIA_ASSET_CLOSURE'
  | 'GENERAL_VERSION_COMPATIBILITY';

export interface P15ElementorReferenceProofV1 {
  proofId: typeof P15_ELEMENTOR_WP68_E424_PROOF_ID;
  architecture: 'CONTAINER';
  outputMode: 'TEMPLATE_JSON';
  documentDataVersion: '0.4';
  wordpressVersion: '6.8';
  elementorVersion: '4.2.4';
  retainedBinding: {
    candidateIdentity: ElementorTemplateCandidateIdentityV1;
    targetProfileFingerprint: 'sha256:8c93e6c2c4635f7da845ef737bbce8810bbf4e46334f7496a54b682673a1b676';
    templateSha256: 'sha256:bf2c229441f93486af7152f9196c265f09ee9e3cefab67d11ecb6765f583e4ad';
  };
  evidence: {
    exactHeadSha: '4f09efda101e5a2771df9bfc3ac8960a43655e96';
    workflowRunId: 35403469986;
    artifactId: 10570709987;
    artifactDigest: 'sha256:206b703ab8185f1e5b1a83346074accb23cc458b9fdcb94f5eaad0c4752e33aa';
    evidenceReference: 'https://github.com/Vertex-Systems-Network/wp-elementor-prep/actions/runs/35403469986';
  };
  classifications: {
    environment: 'QUALIFIED_FOR_BOUND_TARGET_PROOF';
    standaloneProof: 'BOUND_FULL_PASS';
    chain: 'CHAIN_FULL_PASS';
  };
  verifiedScope: readonly P15ElementorReferenceProofScope[];
  excludedScope: readonly P15ElementorReferenceProofExcludedScope[];
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
}

const REFERENCE_PROOF: P15ElementorReferenceProofV1 = Object.freeze({
  proofId: P15_ELEMENTOR_WP68_E424_PROOF_ID,
  architecture: 'CONTAINER',
  outputMode: 'TEMPLATE_JSON',
  documentDataVersion: '0.4',
  wordpressVersion: '6.8',
  elementorVersion: '4.2.4',
  retainedBinding: Object.freeze({
    candidateIdentity: Object.freeze({
      schemaVersion: 1,
      identityVersion: 'elementor-template-candidate-identity-v1',
      candidateVersion: 'elementor-template-candidate-v1',
      targetContractVersion: 'elementor-template-v0.4-container-v1',
      capabilityRegistryVersion: 'elementor-core-widget-capabilities-v1',
      algorithm: 'SHA-256',
      digest: 'sha256:96ffe8a19b0c4d05eccd1e3d28d8b453f41464450ebd6c3f69decc1ab2543f26',
    }),
    targetProfileFingerprint: 'sha256:8c93e6c2c4635f7da845ef737bbce8810bbf4e46334f7496a54b682673a1b676',
    templateSha256: 'sha256:bf2c229441f93486af7152f9196c265f09ee9e3cefab67d11ecb6765f583e4ad',
  }),
  evidence: Object.freeze({
    exactHeadSha: '4f09efda101e5a2771df9bfc3ac8960a43655e96',
    workflowRunId: 35403469986,
    artifactId: 10570709987,
    artifactDigest: 'sha256:206b703ab8185f1e5b1a83346074accb23cc458b9fdcb94f5eaad0c4752e33aa',
    evidenceReference: 'https://github.com/Vertex-Systems-Network/wp-elementor-prep/actions/runs/35403469986',
  }),
  classifications: Object.freeze({
    environment: 'QUALIFIED_FOR_BOUND_TARGET_PROOF',
    standaloneProof: 'BOUND_FULL_PASS',
    chain: 'CHAIN_FULL_PASS',
  }),
  verifiedScope: Object.freeze([
    'IMPORT',
    'EDITOR_OPEN',
    'RENDER',
    'FIDELITY_STRUCTURE',
    'FIDELITY_SOLID_BACKGROUND',
    'FIDELITY_UNIFORM_RADIUS',
  ] as P15ElementorReferenceProofScope[]),
  excludedScope: Object.freeze([
    'ATOMIC_V4',
    'ELEMENTOR_PRO',
    'THIRD_PARTY_ADDONS',
    'RESPONSIVE_MAPPING',
    'MEDIA_ASSET_CLOSURE',
    'GENERAL_VERSION_COMPATIBILITY',
  ] as P15ElementorReferenceProofExcludedScope[]),
  acceptanceAuthority: false,
  targetCompatibilityClaim: false,
  productionAcceptance: false,
});

export const P15_ELEMENTOR_REFERENCE_PROOFS_V1: readonly P15ElementorReferenceProofV1[] = Object.freeze([
  REFERENCE_PROOF,
]);

export type P15ElementorReferenceProofAlignmentStatus =
  | 'INVALID_DECLARED_PROFILE'
  | 'EXACT_REFERENCE_PROFILE_MATCH'
  | 'NO_EXACT_REFERENCE_PROFILE';

export interface P15ElementorReferenceProofSummaryV1 {
  proofId: P15ElementorReferenceProofV1['proofId'];
  wordpressVersion: string;
  elementorVersion: string;
  architecture: 'CONTAINER';
  outputMode: 'TEMPLATE_JSON';
  documentDataVersion: '0.4';
  workflowRunId: number;
  artifactId: number;
  artifactDigest: string;
  evidenceReference: string;
  retainedCandidateIdentityDigest: string;
  retainedTargetProfileFingerprint: string;
  retainedTemplateSha256: string;
  verifiedScope: P15ElementorReferenceProofScope[];
  excludedScope: P15ElementorReferenceProofExcludedScope[];
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
}

export interface P15ElementorReferenceProofAlignmentV1 {
  schemaVersion: 1;
  reportVersion: typeof P15_ELEMENTOR_REFERENCE_PROOF_ALIGNMENT_VERSION;
  registryVersion: typeof P15_ELEMENTOR_REFERENCE_PROOF_REGISTRY_VERSION;
  status: P15ElementorReferenceProofAlignmentStatus;
  declaredTarget: {
    source: 'DECLARED';
    wordpressVersion: string | null;
    elementorVersion: string | null;
  };
  profileIssueCodes: ElementorTargetProfileIssueCode[];
  exactVersionMatch: boolean;
  referenceProof: P15ElementorReferenceProofSummaryV1 | null;
  candidateBinding:
    | 'NOT_ASSESSED'
    | 'EXACT_REFERENCE_CANDIDATE_MATCH'
    | 'REFERENCE_CANDIDATE_MISMATCH'
    | 'CURRENT_CANDIDATE_NOT_READY';
  currentCandidateIdentityDigest: string | null;
  environmentObserved: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

function matchesReference(
  profile: ElementorTargetProfileV1,
  proof: P15ElementorReferenceProofV1,
): boolean {
  return profile.architecture === proof.architecture
    && profile.outputMode === proof.outputMode
    && profile.documentDataVersion === proof.documentDataVersion
    && profile.environment.wordpressVersion === proof.wordpressVersion
    && profile.environment.elementorVersion === proof.elementorVersion
    && fingerprintElementorTargetProfile(profile) === proof.retainedBinding.targetProfileFingerprint;
}

function summary(proof: P15ElementorReferenceProofV1): P15ElementorReferenceProofSummaryV1 {
  return {
    proofId: proof.proofId,
    wordpressVersion: proof.wordpressVersion,
    elementorVersion: proof.elementorVersion,
    architecture: proof.architecture,
    outputMode: proof.outputMode,
    documentDataVersion: proof.documentDataVersion,
    workflowRunId: proof.evidence.workflowRunId,
    artifactId: proof.evidence.artifactId,
    artifactDigest: proof.evidence.artifactDigest,
    evidenceReference: proof.evidence.evidenceReference,
    retainedCandidateIdentityDigest: proof.retainedBinding.candidateIdentity.digest,
    retainedTargetProfileFingerprint: proof.retainedBinding.targetProfileFingerprint,
    retainedTemplateSha256: proof.retainedBinding.templateSha256,
    verifiedScope: [...proof.verifiedScope],
    excludedScope: [...proof.excludedScope],
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
  };
}

/**
 * Compare one immutable DECLARED profile to retained reference proof records.
 *
 * An exact profile match means only that the same immutable declared TargetProfile fingerprint
 * belongs to one retained proof run. When a canonical current candidate is supplied, its existing
 * candidate identity is compared to the exact retained proof identity. Candidate mismatch means only
 * that this is not the exact candidate observed by that proof; it is not an incompatibility verdict.
 * Neither profile nor candidate binding observes the user's target environment or grants
 * compatibility/production authority.
 */
export function assessP15ElementorReferenceProofAlignment(
  profileValue: unknown,
  candidate?: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorReferenceProofAlignmentV1 {
  const validation = validateElementorTargetProfile(profileValue);
  if (!validation.valid || validation.profile === null) {
    return {
      schemaVersion: 1,
      reportVersion: P15_ELEMENTOR_REFERENCE_PROOF_ALIGNMENT_VERSION,
      registryVersion: P15_ELEMENTOR_REFERENCE_PROOF_REGISTRY_VERSION,
      status: 'INVALID_DECLARED_PROFILE',
      declaredTarget: {
        source: 'DECLARED',
        wordpressVersion: null,
        elementorVersion: null,
      },
      profileIssueCodes: validation.issues.map((issue) => issue.code),
      exactVersionMatch: false,
      referenceProof: null,
      candidateBinding: 'NOT_ASSESSED',
      currentCandidateIdentityDigest: null,
      environmentObserved: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      generationEnabled: false,
      downloadEnabled: false,
      internalReviewRequired: true,
    };
  }

  const profile = validation.profile;
  const match = P15_ELEMENTOR_REFERENCE_PROOFS_V1.find((proof) => matchesReference(profile, proof)) ?? null;

  let candidateBinding: P15ElementorReferenceProofAlignmentV1['candidateBinding'] = 'NOT_ASSESSED';
  let currentCandidateIdentityDigest: string | null = null;
  if (match && candidate) {
    try {
      const currentIdentity = buildElementorTemplateCandidateIdentity(candidate);
      currentCandidateIdentityDigest = currentIdentity.digest;
      const retainedIdentity = match.retainedBinding.candidateIdentity;
      const exactIdentityMatch = currentIdentity.schemaVersion === retainedIdentity.schemaVersion
        && currentIdentity.identityVersion === retainedIdentity.identityVersion
        && currentIdentity.candidateVersion === retainedIdentity.candidateVersion
        && currentIdentity.targetContractVersion === retainedIdentity.targetContractVersion
        && currentIdentity.capabilityRegistryVersion === retainedIdentity.capabilityRegistryVersion
        && currentIdentity.algorithm === retainedIdentity.algorithm
        && currentIdentity.digest === retainedIdentity.digest;
      candidateBinding = exactIdentityMatch
        ? 'EXACT_REFERENCE_CANDIDATE_MATCH'
        : 'REFERENCE_CANDIDATE_MISMATCH';
    } catch {
      candidateBinding = 'CURRENT_CANDIDATE_NOT_READY';
    }
  }

  return {
    schemaVersion: 1,
    reportVersion: P15_ELEMENTOR_REFERENCE_PROOF_ALIGNMENT_VERSION,
    registryVersion: P15_ELEMENTOR_REFERENCE_PROOF_REGISTRY_VERSION,
    status: match ? 'EXACT_REFERENCE_PROFILE_MATCH' : 'NO_EXACT_REFERENCE_PROFILE',
    declaredTarget: {
      source: 'DECLARED',
      wordpressVersion: profile.environment.wordpressVersion,
      elementorVersion: profile.environment.elementorVersion,
    },
    profileIssueCodes: [],
    exactVersionMatch: match !== null,
    referenceProof: match ? summary(match) : null,
    candidateBinding,
    currentCandidateIdentityDigest,
    environmentObserved: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

function serializable(value: P15ElementorReferenceProofAlignmentV1): boolean {
  if (value.schemaVersion !== 1
    || value.reportVersion !== P15_ELEMENTOR_REFERENCE_PROOF_ALIGNMENT_VERSION
    || value.registryVersion !== P15_ELEMENTOR_REFERENCE_PROOF_REGISTRY_VERSION
    || ![
      'NOT_ASSESSED',
      'EXACT_REFERENCE_CANDIDATE_MATCH',
      'REFERENCE_CANDIDATE_MISMATCH',
      'CURRENT_CANDIDATE_NOT_READY',
    ].includes(value.candidateBinding)
    || value.environmentObserved !== false
    || value.targetCompatibilityClaim !== false
    || value.productionAcceptance !== false
    || value.generationEnabled !== false
    || value.downloadEnabled !== false
    || value.internalReviewRequired !== true) {
    return false;
  }

  if (value.status === 'EXACT_REFERENCE_PROFILE_MATCH') {
    if (value.exactVersionMatch !== true || value.referenceProof === null || value.profileIssueCodes.length !== 0) {
      return false;
    }
    const proof = P15_ELEMENTOR_REFERENCE_PROOFS_V1.find(
      (entry) => entry.proofId === value.referenceProof?.proofId,
    );
    if (proof === undefined
      || value.declaredTarget.source !== 'DECLARED'
      || value.declaredTarget.wordpressVersion !== proof.wordpressVersion
      || value.declaredTarget.elementorVersion !== proof.elementorVersion
      || JSON.stringify(value.referenceProof) !== JSON.stringify(summary(proof))) {
      return false;
    }

    if (value.candidateBinding === 'NOT_ASSESSED' || value.candidateBinding === 'CURRENT_CANDIDATE_NOT_READY') {
      return value.currentCandidateIdentityDigest === null;
    }
    if (typeof value.currentCandidateIdentityDigest !== 'string'
      || !/^sha256:[0-9a-f]{64}$/.test(value.currentCandidateIdentityDigest)) {
      return false;
    }
    if (value.candidateBinding === 'EXACT_REFERENCE_CANDIDATE_MATCH') {
      return value.currentCandidateIdentityDigest === proof.retainedBinding.candidateIdentity.digest;
    }
    return value.candidateBinding === 'REFERENCE_CANDIDATE_MISMATCH'
      && value.currentCandidateIdentityDigest !== proof.retainedBinding.candidateIdentity.digest;
  }

  if (value.status === 'NO_EXACT_REFERENCE_PROFILE') {
    return value.exactVersionMatch === false
      && value.referenceProof === null
      && value.candidateBinding === 'NOT_ASSESSED'
      && value.currentCandidateIdentityDigest === null
      && value.profileIssueCodes.length === 0
      && value.declaredTarget.source === 'DECLARED'
      && typeof value.declaredTarget.wordpressVersion === 'string'
      && typeof value.declaredTarget.elementorVersion === 'string';
  }

  if (value.status === 'INVALID_DECLARED_PROFILE') {
    return value.exactVersionMatch === false
      && value.referenceProof === null
      && value.candidateBinding === 'NOT_ASSESSED'
      && value.currentCandidateIdentityDigest === null
      && value.profileIssueCodes.length > 0
      && value.declaredTarget.source === 'DECLARED'
      && value.declaredTarget.wordpressVersion === null
      && value.declaredTarget.elementorVersion === null;
  }

  return false;
}

export function serializeP15ElementorReferenceProofAlignment(
  value: P15ElementorReferenceProofAlignmentV1,
): string {
  if (!serializable(value)) {
    throw new Error('Invalid or authority-inflated P15 Elementor reference-proof alignment.');
  }
  return JSON.stringify(value, null, 2) + '\n';
}
