import { describe, expect, it } from 'vitest';
import type { ElementorTemplateCandidateArtifactV1 } from '../src/targets/elementor/candidate-artifact';
import {
  buildElementorAssetTargetProofEvidence,
  validateElementorAssetTargetProofEvidence,
  serializeElementorAssetTargetProofEvidence,
  type ElementorAssetTargetProofEvidenceV1,
  type ElementorAssetTargetProofStepsV1,
} from '../src/targets/elementor/asset-target-proof-evidence';
import { buildP15ElementorAssetProofVector } from '../src/targets/elementor/asset-proof-vector';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

function vectorInputs() {
  const vector = buildP15ElementorAssetProofVector();
  return {
    vector,
    candidate: JSON.parse(vector.files['candidate.json']) as ElementorTemplateCandidateArtifactV1,
    profile: vector.profile,
  };
}

function fullPassSteps(assetUrlFingerprint: string): ElementorAssetTargetProofStepsV1 {
  const targetManagedFingerprint = 'sha256:' + 'a'.repeat(64);
  return {
    importResult: 'PASS',
    targetManagedMediaResult: 'PASS',
    sourceProvenanceResult: 'PASS',
    sourceAssetUrlFingerprint: assetUrlFingerprint,
    targetManagedMediaUrlFingerprint: targetManagedFingerprint,
    renderResult: 'PASS',
    renderedImageReferenceResult: 'PASS',
    browserImageLoadResult: 'PASS',
    renderedImageUrlFingerprint: targetManagedFingerprint,
  };
}

function proof() {
  const { vector, candidate, profile } = vectorInputs();
  const evidence = buildElementorAssetTargetProofEvidence({
    candidate,
    profile,
    observedTarget: {
      source: 'OBSERVED',
      wordpressVersion: '6.8',
      elementorVersion: '4.2.4',
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: '2026-09-19T08:45:00.000Z',
    evidenceReference: 'retained-evidence://p15/controlled-url-only-image',
    steps: fullPassSteps(vector.assetUrlFingerprint),
  });
  return { vector, candidate, profile, evidence };
}

describe('P15 controlled URL-only Image asset target proof evidence', () => {
  it('classifies only exact candidate/profile/reference/image binding as ASSET_BOUND_FULL_PASS', () => {
    const { vector, candidate, profile, evidence } = proof();
    const validation = validateElementorAssetTargetProofEvidence(evidence, candidate, profile);

    expect(validation.valid).toBe(true);
    expect(validation.classification).toBe('ASSET_BOUND_FULL_PASS');
    expect(validation.candidateBindingMatches).toBe(true);
    expect(validation.profileBindingMatches).toBe(true);
    expect(validation.referenceReviewBindingMatches).toBe(true);
    expect(validation.declaredObservedEnvironmentMatches).toBe(true);
    expect(validation.sourceAssetBindingMatches).toBe(true);
    expect(validation.targetManagedRenderBindingMatches).toBe(true);
    expect(validation.imageReferenceBindingMatches).toBe(true);
    expect(validation.referenceReviewIdentityDigest)
      .toBe(vector.referenceReviewIdentity.digest);
    expect(validation.expectedAssetUrlFingerprint).toBe(vector.assetUrlFingerprint);
    expect(validation.assetReferenceClosureClaim).toBe(false);
    expect(validation.targetCompatibilityClaim).toBe(false);
    expect(validation.productionAcceptance).toBe(false);
    expect(JSON.parse(
      serializeElementorAssetTargetProofEvidence(evidence, candidate, profile),
    )).toEqual(evidence);
  });

  it('rejects stale candidate, profile and reference-review identities', () => {
    const { candidate, profile, evidence } = proof();

    const staleCandidate = structuredClone(evidence) as ElementorAssetTargetProofEvidenceV1;
    staleCandidate.candidateIdentity.digest = 'sha256:' + '0'.repeat(64);
    const candidateValidation = validateElementorAssetTargetProofEvidence(staleCandidate, candidate, profile);
    expect(candidateValidation.valid).toBe(false);
    expect(candidateValidation.issues.map((issue) => issue.code))
      .toContain('P15_ASSET_PROOF_CANDIDATE_MISMATCH');

    const otherProfile = buildElementorTargetProfile({
      wordpressVersion: '6.8',
      elementorVersion: '4.2.5',
    });
    const profileValidation = validateElementorAssetTargetProofEvidence(evidence, candidate, otherProfile);
    expect(profileValidation.valid).toBe(false);
    expect(profileValidation.issues.map((issue) => issue.code))
      .toContain('P15_ASSET_PROOF_PROFILE_MISMATCH');

    const staleReview = structuredClone(evidence) as ElementorAssetTargetProofEvidenceV1;
    staleReview.referenceReviewIdentity.digest = 'sha256:' + '1'.repeat(64);
    const reviewValidation = validateElementorAssetTargetProofEvidence(staleReview, candidate, profile);
    expect(reviewValidation.valid).toBe(false);
    expect(reviewValidation.issues.map((issue) => issue.code))
      .toContain('P15_ASSET_PROOF_REFERENCE_REVIEW_MISMATCH');
  });

  it('rejects malformed or contradictory image URL fingerprint PASS claims', () => {
    const { candidate, profile, evidence } = proof();

    const malformed = structuredClone(evidence) as unknown as Record<string, unknown>;
    const malformedSteps = malformed.steps as Record<string, unknown>;
    malformedSteps.renderedImageUrlFingerprint = 'not-a-fingerprint';
    const malformedValidation = validateElementorAssetTargetProofEvidence(malformed, candidate, profile);
    expect(malformedValidation.valid).toBe(false);
    expect(malformedValidation.issues.map((issue) => issue.code))
      .toContain('P15_ASSET_PROOF_STEPS_INVALID');

    const mismatch = structuredClone(evidence) as ElementorAssetTargetProofEvidenceV1;
    mismatch.steps.renderedImageUrlFingerprint = 'sha256:' + '2'.repeat(64);
    const mismatchValidation = validateElementorAssetTargetProofEvidence(mismatch, candidate, profile);
    expect(mismatchValidation.valid).toBe(false);
    expect(mismatchValidation.issues.map((issue) => issue.code))
      .toContain('P15_ASSET_PROOF_TARGET_MANAGED_BINDING_INVALID');
  });

  it('rejects a PASS source-provenance claim bound to a different candidate URL fingerprint', () => {
    const { candidate, profile, evidence } = proof();
    const mismatch = structuredClone(evidence) as ElementorAssetTargetProofEvidenceV1;
    mismatch.steps.sourceAssetUrlFingerprint = 'sha256:' + '3'.repeat(64);
    const validation = validateElementorAssetTargetProofEvidence(mismatch, candidate, profile);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code))
      .toContain('P15_ASSET_PROOF_SOURCE_REFERENCE_BINDING_INVALID');
  });

  it('rejects impossible step ordering after failed/unproven prerequisites', () => {
    const { candidate, profile, evidence } = proof();
    const impossible = structuredClone(evidence) as ElementorAssetTargetProofEvidenceV1;
    impossible.steps.importResult = 'FAIL';
    const validation = validateElementorAssetTargetProofEvidence(impossible, candidate, profile);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code))
      .toContain('P15_ASSET_PROOF_SEQUENCE_INVALID');
  });

  it('retains genuine bounded failure without granting closure authority', () => {
    const { vector, candidate, profile } = vectorInputs();
    const evidence = buildElementorAssetTargetProofEvidence({
      candidate,
      profile,
      observedTarget: {
        source: 'OBSERVED',
        wordpressVersion: '6.8',
        elementorVersion: '4.2.4',
        importSurface: 'TEMPLATE_LIBRARY_JSON',
      },
      observedAt: '2026-09-19T08:45:00.000Z',
      evidenceReference: 'retained-evidence://p15/controlled-url-only-image-fail',
      steps: {
        ...fullPassSteps(vector.assetUrlFingerprint),
        browserImageLoadResult: 'FAIL',
      },
    });
    const validation = validateElementorAssetTargetProofEvidence(evidence, candidate, profile);
    expect(validation.valid).toBe(true);
    expect(validation.classification).toBe('ASSET_BOUND_FAIL');
    expect(validation.assetReferenceClosureClaim).toBe(false);
  });

  it('rejects authority inflation and unknown evidence fields', () => {
    const { candidate, profile, evidence } = proof();
    const inflated = {
      ...evidence,
      assetReferenceClosureClaim: true,
    };
    expect(validateElementorAssetTargetProofEvidence(inflated, candidate, profile).issues
      .map((issue) => issue.code)).toContain('P15_ASSET_PROOF_AUTHORITY_FLAGS_INVALID');

    const unknown = {
      ...evidence,
      portableEverywhere: true,
    };
    expect(validateElementorAssetTargetProofEvidence(unknown, candidate, profile).issues
      .map((issue) => issue.code)).toContain('P15_ASSET_PROOF_FIELDS_INVALID');
  });
});
