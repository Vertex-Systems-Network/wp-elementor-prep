import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  buildElementorTemplateCandidateIdentity,
  type ElementorTemplateCandidateIdentityV1,
} from './import-validation-contract';
import {
  ELEMENTOR_TARGET_PROFILE_VERSION,
  fingerprintElementorTargetProfile,
  validateElementorTargetProfile,
  type ElementorTargetProfileV1,
} from './target-profile';

export const ELEMENTOR_TARGET_PROOF_EVIDENCE_VERSION = 'elementor-target-proof-evidence-v1' as const;

export type ElementorTargetProofStepResult = 'PASS' | 'FAIL' | 'NOT_RUN';
export type ElementorTargetProofFidelityResult = 'PASS' | 'FAIL' | 'NOT_APPLICABLE' | 'NOT_RUN';
export type ElementorTargetProofClassification = 'BOUND_FULL_PASS' | 'BOUND_PARTIAL' | 'BOUND_FAIL' | 'REJECTED';

export interface ElementorTargetProofProfileIdentityV1 {
  profileVersion: typeof ELEMENTOR_TARGET_PROFILE_VERSION;
  fingerprint: string;
}

export interface ElementorTargetProofObservedTargetV1 {
  source: 'OBSERVED';
  wordpressVersion: string;
  elementorVersion: string;
  importSurface: 'TEMPLATE_LIBRARY_JSON';
}

export interface ElementorTargetProofStepsV1 {
  importResult: 'PASS' | 'FAIL';
  editorOpenResult: ElementorTargetProofStepResult;
  renderResult: ElementorTargetProofStepResult;
  fidelity: {
    structure: ElementorTargetProofFidelityResult;
    solidBackground: ElementorTargetProofFidelityResult;
    uniformRadius: ElementorTargetProofFidelityResult;
  };
}

export interface ElementorTargetProofEvidenceV1 {
  schemaVersion: 1;
  evidenceVersion: typeof ELEMENTOR_TARGET_PROOF_EVIDENCE_VERSION;
  candidateIdentity: ElementorTemplateCandidateIdentityV1;
  targetProfileIdentity: ElementorTargetProofProfileIdentityV1;
  observedTarget: ElementorTargetProofObservedTargetV1;
  observedAt: string;
  evidenceReference: string;
  steps: ElementorTargetProofStepsV1;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  internalReviewRequired: true;
}

export type ElementorTargetProofIssueCode =
  | 'P15_TARGET_PROOF_NOT_OBJECT'
  | 'P15_TARGET_PROOF_FIELDS_INVALID'
  | 'P15_TARGET_PROOF_CANDIDATE_INVALID'
  | 'P15_TARGET_PROOF_CANDIDATE_IDENTITY_INVALID'
  | 'P15_TARGET_PROOF_CANDIDATE_MISMATCH'
  | 'P15_TARGET_PROOF_PROFILE_INVALID'
  | 'P15_TARGET_PROOF_PROFILE_IDENTITY_INVALID'
  | 'P15_TARGET_PROOF_PROFILE_MISMATCH'
  | 'P15_TARGET_PROOF_OBSERVED_TARGET_INVALID'
  | 'P15_TARGET_PROOF_OBSERVED_AT_INVALID'
  | 'P15_TARGET_PROOF_EVIDENCE_REFERENCE_INVALID'
  | 'P15_TARGET_PROOF_STEPS_INVALID'
  | 'P15_TARGET_PROOF_SEQUENCE_INVALID'
  | 'P15_TARGET_PROOF_AUTHORITY_FLAGS_INVALID';

export type ElementorTargetProofReviewCode = 'P15_TARGET_PROOF_DECLARED_OBSERVED_MISMATCH';

export interface ElementorTargetProofIssue {
  code: ElementorTargetProofIssueCode;
  path: string;
  message: string;
}

export interface ElementorTargetProofValidationResult {
  valid: boolean;
  classification: ElementorTargetProofClassification;
  candidateBindingMatches: boolean;
  profileBindingMatches: boolean;
  declaredObservedEnvironmentMatches: boolean;
  candidateIdentity: ElementorTemplateCandidateIdentityV1 | null;
  targetProfileFingerprint: string | null;
  observedTarget: ElementorTargetProofObservedTargetV1 | null;
  steps: ElementorTargetProofStepsV1 | null;
  issues: ElementorTargetProofIssue[];
  reviewCodes: ElementorTargetProofReviewCode[];
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  internalReviewRequired: true;
}

const EVIDENCE_KEYS = [
  'acceptanceAuthority',
  'candidateIdentity',
  'evidenceReference',
  'evidenceVersion',
  'internalReviewRequired',
  'observedAt',
  'observedTarget',
  'productionAcceptance',
  'schemaVersion',
  'steps',
  'targetCompatibilityClaim',
  'targetProfileIdentity',
] as const;
const CANDIDATE_IDENTITY_KEYS = [
  'algorithm',
  'candidateVersion',
  'capabilityRegistryVersion',
  'digest',
  'identityVersion',
  'schemaVersion',
  'targetContractVersion',
] as const;
const PROFILE_IDENTITY_KEYS = ['fingerprint', 'profileVersion'] as const;
const OBSERVED_TARGET_KEYS = ['elementorVersion', 'importSurface', 'source', 'wordpressVersion'] as const;
const STEPS_KEYS = ['editorOpenResult', 'fidelity', 'importResult', 'renderResult'] as const;
const FIDELITY_KEYS = ['solidBackground', 'structure', 'uniformRadius'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonicalExpected = [...expected].sort();
  return actual.length === canonicalExpected.length
    && actual.every((key, index) => key === canonicalExpected[index]);
}

function isBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isCanonicalIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function candidateIdentityEquals(
  left: ElementorTemplateCandidateIdentityV1,
  right: ElementorTemplateCandidateIdentityV1,
): boolean {
  return left.schemaVersion === right.schemaVersion
    && left.identityVersion === right.identityVersion
    && left.candidateVersion === right.candidateVersion
    && left.targetContractVersion === right.targetContractVersion
    && left.capabilityRegistryVersion === right.capabilityRegistryVersion
    && left.algorithm === right.algorithm
    && left.digest === right.digest;
}

function snapshotCandidateIdentity(
  value: unknown,
  expected: ElementorTemplateCandidateIdentityV1 | null,
): ElementorTemplateCandidateIdentityV1 | null {
  if (!expected || !isRecord(value) || !exactKeys(value, CANDIDATE_IDENTITY_KEYS)) return null;
  const snapshot = value as unknown as ElementorTemplateCandidateIdentityV1;
  return candidateIdentityEquals(snapshot, expected) ? { ...expected } : null;
}

function snapshotProfileIdentity(value: unknown): ElementorTargetProofProfileIdentityV1 | null {
  if (!isRecord(value)
    || !exactKeys(value, PROFILE_IDENTITY_KEYS)
    || value.profileVersion !== ELEMENTOR_TARGET_PROFILE_VERSION
    || typeof value.fingerprint !== 'string'
    || !/^sha256:[0-9a-f]{64}$/.test(value.fingerprint)) {
    return null;
  }
  return {
    profileVersion: ELEMENTOR_TARGET_PROFILE_VERSION,
    fingerprint: value.fingerprint,
  };
}

function snapshotObservedTarget(value: unknown): ElementorTargetProofObservedTargetV1 | null {
  if (!isRecord(value)
    || !exactKeys(value, OBSERVED_TARGET_KEYS)
    || value.source !== 'OBSERVED'
    || !isBoundedString(value.wordpressVersion, 64)
    || !isBoundedString(value.elementorVersion, 64)
    || value.importSurface !== 'TEMPLATE_LIBRARY_JSON') {
    return null;
  }
  return {
    source: 'OBSERVED',
    wordpressVersion: value.wordpressVersion,
    elementorVersion: value.elementorVersion,
    importSurface: 'TEMPLATE_LIBRARY_JSON',
  };
}

function isStepResult(value: unknown): value is ElementorTargetProofStepResult {
  return value === 'PASS' || value === 'FAIL' || value === 'NOT_RUN';
}

function isFidelityResult(value: unknown): value is ElementorTargetProofFidelityResult {
  return value === 'PASS' || value === 'FAIL' || value === 'NOT_APPLICABLE' || value === 'NOT_RUN';
}

function snapshotSteps(value: unknown): ElementorTargetProofStepsV1 | null {
  if (!isRecord(value) || !exactKeys(value, STEPS_KEYS) || !isRecord(value.fidelity)
    || !exactKeys(value.fidelity, FIDELITY_KEYS)
    || (value.importResult !== 'PASS' && value.importResult !== 'FAIL')
    || !isStepResult(value.editorOpenResult)
    || !isStepResult(value.renderResult)
    || !isFidelityResult(value.fidelity.structure)
    || !isFidelityResult(value.fidelity.solidBackground)
    || !isFidelityResult(value.fidelity.uniformRadius)) {
    return null;
  }
  return {
    importResult: value.importResult,
    editorOpenResult: value.editorOpenResult,
    renderResult: value.renderResult,
    fidelity: {
      structure: value.fidelity.structure,
      solidBackground: value.fidelity.solidBackground,
      uniformRadius: value.fidelity.uniformRadius,
    },
  };
}

function sequenceIsValid(steps: ElementorTargetProofStepsV1): boolean {
  if (steps.importResult === 'FAIL') {
    return steps.editorOpenResult === 'NOT_RUN'
      && steps.renderResult === 'NOT_RUN'
      && Object.values(steps.fidelity).every((result) => result === 'NOT_RUN');
  }
  if (steps.editorOpenResult !== 'PASS') {
    return steps.renderResult === 'NOT_RUN'
      && Object.values(steps.fidelity).every((result) => result === 'NOT_RUN');
  }
  if (steps.renderResult !== 'PASS') {
    return Object.values(steps.fidelity).every((result) => result === 'NOT_RUN');
  }
  return true;
}

function classify(
  valid: boolean,
  steps: ElementorTargetProofStepsV1 | null,
  environmentMatches: boolean,
): ElementorTargetProofClassification {
  if (!valid || !steps) return 'REJECTED';
  if (steps.importResult === 'FAIL'
    || steps.editorOpenResult === 'FAIL'
    || steps.renderResult === 'FAIL'
    || Object.values(steps.fidelity).some((result) => result === 'FAIL')) {
    return 'BOUND_FAIL';
  }
  const fidelityComplete = Object.values(steps.fidelity)
    .every((result) => result === 'PASS' || result === 'NOT_APPLICABLE');
  if (environmentMatches
    && steps.importResult === 'PASS'
    && steps.editorOpenResult === 'PASS'
    && steps.renderResult === 'PASS'
    && fidelityComplete) {
    return 'BOUND_FULL_PASS';
  }
  return 'BOUND_PARTIAL';
}

export function validateElementorTargetProofEvidence(
  value: unknown,
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
): ElementorTargetProofValidationResult {
  const issues: ElementorTargetProofIssue[] = [];
  const reviewCodes: ElementorTargetProofReviewCode[] = [];

  let expectedCandidateIdentity: ElementorTemplateCandidateIdentityV1 | null = null;
  try {
    expectedCandidateIdentity = buildElementorTemplateCandidateIdentity(candidate);
  } catch {
    issues.push({
      code: 'P15_TARGET_PROOF_CANDIDATE_INVALID',
      path: '$candidate',
      message: 'Target proof requires one exact canonical candidate ready for target import validation.',
    });
  }

  const profileValidation = validateElementorTargetProfile(profile);
  const canonicalProfile = profileValidation.profile;
  const expectedProfileFingerprint = canonicalProfile
    ? fingerprintElementorTargetProfile(canonicalProfile)
    : null;
  if (!profileValidation.valid || !canonicalProfile || !expectedProfileFingerprint) {
    issues.push({
      code: 'P15_TARGET_PROOF_PROFILE_INVALID',
      path: '$profile',
      message: 'Target proof requires one exact canonical declared Elementor TargetProfile.',
    });
  }

  let candidateBindingMatches = false;
  let profileBindingMatches = false;
  let declaredObservedEnvironmentMatches = false;
  let observedTarget: ElementorTargetProofObservedTargetV1 | null = null;
  let steps: ElementorTargetProofStepsV1 | null = null;

  if (!isRecord(value)) {
    issues.push({
      code: 'P15_TARGET_PROOF_NOT_OBJECT',
      path: '$',
      message: 'Target proof evidence must be an object.',
    });
  } else {
    if (!exactKeys(value, EVIDENCE_KEYS)
      || value.schemaVersion !== 1
      || value.evidenceVersion !== ELEMENTOR_TARGET_PROOF_EVIDENCE_VERSION) {
      issues.push({
        code: 'P15_TARGET_PROOF_FIELDS_INVALID',
        path: '$',
        message: 'Target proof evidence contains unknown, missing or unsupported fields/version.',
      });
    }

    const candidateIdentity = snapshotCandidateIdentity(value.candidateIdentity, expectedCandidateIdentity);
    if (!candidateIdentity) {
      issues.push({
        code: expectedCandidateIdentity
          ? 'P15_TARGET_PROOF_CANDIDATE_MISMATCH'
          : 'P15_TARGET_PROOF_CANDIDATE_IDENTITY_INVALID',
        path: '$.candidateIdentity',
        message: 'Target proof is not bound to the exact current canonical candidate identity.',
      });
    } else {
      candidateBindingMatches = true;
    }

    const profileIdentity = snapshotProfileIdentity(value.targetProfileIdentity);
    if (!profileIdentity) {
      issues.push({
        code: 'P15_TARGET_PROOF_PROFILE_IDENTITY_INVALID',
        path: '$.targetProfileIdentity',
        message: 'Target proof TargetProfile identity is malformed or unsupported.',
      });
    } else if (expectedProfileFingerprint && profileIdentity.fingerprint === expectedProfileFingerprint) {
      profileBindingMatches = true;
    } else {
      issues.push({
        code: 'P15_TARGET_PROOF_PROFILE_MISMATCH',
        path: '$.targetProfileIdentity.fingerprint',
        message: 'Target proof is stale or bound to a different declared TargetProfile.',
      });
    }

    observedTarget = snapshotObservedTarget(value.observedTarget);
    if (!observedTarget) {
      issues.push({
        code: 'P15_TARGET_PROOF_OBSERVED_TARGET_INVALID',
        path: '$.observedTarget',
        message: 'Observed target must retain bounded WordPress/Elementor versions and TEMPLATE_LIBRARY_JSON surface.',
      });
    } else if (canonicalProfile) {
      declaredObservedEnvironmentMatches = observedTarget.wordpressVersion === canonicalProfile.environment.wordpressVersion
        && observedTarget.elementorVersion === canonicalProfile.environment.elementorVersion;
      if (!declaredObservedEnvironmentMatches) {
        reviewCodes.push('P15_TARGET_PROOF_DECLARED_OBSERVED_MISMATCH');
      }
    }

    if (!isCanonicalIsoTimestamp(value.observedAt)) {
      issues.push({
        code: 'P15_TARGET_PROOF_OBSERVED_AT_INVALID',
        path: '$.observedAt',
        message: 'observedAt must be a canonical ISO-8601 UTC timestamp.',
      });
    }

    if (!isBoundedString(value.evidenceReference, 1024)) {
      issues.push({
        code: 'P15_TARGET_PROOF_EVIDENCE_REFERENCE_INVALID',
        path: '$.evidenceReference',
        message: 'A bounded non-empty external evidence reference is required.',
      });
    }

    steps = snapshotSteps(value.steps);
    if (!steps) {
      issues.push({
        code: 'P15_TARGET_PROOF_STEPS_INVALID',
        path: '$.steps',
        message: 'Target proof steps are malformed or contain unsupported values.',
      });
    } else if (!sequenceIsValid(steps)) {
      issues.push({
        code: 'P15_TARGET_PROOF_SEQUENCE_INVALID',
        path: '$.steps',
        message: 'Target proof step ordering is impossible or claims downstream evidence after an unproven/failed prerequisite.',
      });
    }

    if (value.acceptanceAuthority !== false
      || value.targetCompatibilityClaim !== false
      || value.productionAcceptance !== false
      || value.internalReviewRequired !== true) {
      issues.push({
        code: 'P15_TARGET_PROOF_AUTHORITY_FLAGS_INVALID',
        path: '$',
        message: 'Target proof cannot grant acceptance, compatibility or production authority and must require internal review.',
      });
    }
  }

  const valid = issues.length === 0;
  return {
    valid,
    classification: classify(valid, steps, declaredObservedEnvironmentMatches),
    candidateBindingMatches,
    profileBindingMatches,
    declaredObservedEnvironmentMatches,
    candidateIdentity: expectedCandidateIdentity,
    targetProfileFingerprint: expectedProfileFingerprint,
    observedTarget,
    steps,
    issues,
    reviewCodes,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };
}

export function buildElementorTargetProofEvidence(input: {
  candidate: ElementorTemplateCandidateArtifactV1;
  profile: ElementorTargetProfileV1;
  observedTarget: ElementorTargetProofObservedTargetV1;
  observedAt: string;
  evidenceReference: string;
  steps: ElementorTargetProofStepsV1;
}): ElementorTargetProofEvidenceV1 {
  const profileValidation = validateElementorTargetProfile(input.profile);
  if (!profileValidation.valid || !profileValidation.profile) {
    throw new Error('Cannot build target proof for an invalid Elementor TargetProfile.');
  }
  const proof: ElementorTargetProofEvidenceV1 = {
    schemaVersion: 1,
    evidenceVersion: ELEMENTOR_TARGET_PROOF_EVIDENCE_VERSION,
    candidateIdentity: buildElementorTemplateCandidateIdentity(input.candidate),
    targetProfileIdentity: {
      profileVersion: ELEMENTOR_TARGET_PROFILE_VERSION,
      fingerprint: fingerprintElementorTargetProfile(profileValidation.profile),
    },
    observedTarget: { ...input.observedTarget },
    observedAt: input.observedAt,
    evidenceReference: input.evidenceReference,
    steps: {
      ...input.steps,
      fidelity: { ...input.steps.fidelity },
    },
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };
  const validation = validateElementorTargetProofEvidence(proof, input.candidate, profileValidation.profile);
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Elementor target proof: ${first.code} at ${first.path}`
      : 'Invalid Elementor target proof.');
  }
  return proof;
}

export function serializeElementorTargetProofEvidence(
  evidence: ElementorTargetProofEvidenceV1,
  candidate: ElementorTemplateCandidateArtifactV1,
  profile: ElementorTargetProfileV1,
): string {
  const validation = validateElementorTargetProofEvidence(evidence, candidate, profile);
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Elementor target proof: ${first.code} at ${first.path}`
      : 'Invalid Elementor target proof.');
  }
  return `${JSON.stringify(evidence, null, 2)}\n`;
}
