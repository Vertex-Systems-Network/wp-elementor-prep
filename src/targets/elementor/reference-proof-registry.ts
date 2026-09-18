import {
  validateElementorTargetProfile,
  type ElementorTargetProfileIssueCode,
  type ElementorTargetProfileV1,
} from './target-profile';

export const P15_ELEMENTOR_REFERENCE_PROOF_REGISTRY_VERSION = 'p15-elementor-reference-proof-registry-v1' as const;
export const P15_ELEMENTOR_REFERENCE_PROOF_ALIGNMENT_VERSION = 'p15-elementor-reference-proof-alignment-v1' as const;
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
  candidateBinding: 'NOT_ASSESSED';
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
    && profile.environment.elementorVersion === proof.elementorVersion;
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
 * An exact profile match means only that the same declared WordPress/Elementor/container envelope has
 * one retained proof run. This function does not compare the current candidate to the retained proof
 * candidate, so candidateBinding remains NOT_ASSESSED. A profile mismatch means only that this registry
 * has no exact retained reference profile. Neither state observes the user's target environment or
 * grants compatibility/production authority.
 */
export function assessP15ElementorReferenceProofAlignment(
  profileValue: unknown,
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
    candidateBinding: 'NOT_ASSESSED',
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
    || value.candidateBinding !== 'NOT_ASSESSED'
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
    return proof !== undefined
      && value.declaredTarget.source === 'DECLARED'
      && value.declaredTarget.wordpressVersion === proof.wordpressVersion
      && value.declaredTarget.elementorVersion === proof.elementorVersion
      && JSON.stringify(value.referenceProof) === JSON.stringify(summary(proof));
  }

  if (value.status === 'NO_EXACT_REFERENCE_PROFILE') {
    return value.exactVersionMatch === false
      && value.referenceProof === null
      && value.profileIssueCodes.length === 0
      && value.declaredTarget.source === 'DECLARED'
      && typeof value.declaredTarget.wordpressVersion === 'string'
      && typeof value.declaredTarget.elementorVersion === 'string';
  }

  if (value.status === 'INVALID_DECLARED_PROFILE') {
    return value.exactVersionMatch === false
      && value.referenceProof === null
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
