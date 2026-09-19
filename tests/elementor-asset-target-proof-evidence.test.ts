import { describe, expect, it } from 'vitest';
import {
  ELEMENTOR_ASSET_TARGET_PROOF_EVIDENCE_VERSION,
  serializeElementorAssetTargetProofEvidence,
  validateElementorAssetTargetProofEvidence,
  type ElementorAssetTargetProofEvidenceV1,
} from '../src/targets/elementor/asset-target-proof-evidence';
import {
  P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL,
  buildP15ElementorAssetProofVector,
} from '../src/targets/elementor/asset-proof-vector';
import type { ElementorTemplateCandidateArtifactV1 } from '../src/targets/elementor/candidate-artifact';
import type { ElementorTargetProfileV1 } from '../src/targets/elementor/target-profile';

function fixture() {
  const vector = buildP15ElementorAssetProofVector();
  const candidate = JSON.parse(vector.files['candidate.json']) as ElementorTemplateCandidateArtifactV1;
  const profile = JSON.parse(vector.files['target-profile.json']) as ElementorTargetProfileV1;
  const proof: ElementorAssetTargetProofEvidenceV1 = {
    schemaVersion: 1,
    evidenceVersion: ELEMENTOR_ASSET_TARGET_PROOF_EVIDENCE_VERSION,
    candidateIdentity: vector.candidateIdentity,
    targetProfileIdentity: {
      profileVersion: profile.profileVersion,
      fingerprint: vector.targetProfileFingerprint,
    },
    referenceReviewIdentityDigest: vector.referenceReviewIdentityDigest,
    observedTarget: {
      source: 'OBSERVED',
      wordpressVersion: '6.8',
      elementorVersion: '4.2.4',
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: '2026-09-19T08:30:00.000Z',
    evidenceReference: 'https://github.com/Vertex-Systems-Network/wp-elementor-prep/actions/runs/123',
    assetReference: {
      path: vector.manifest.assetReference.path,
      widgetId: vector.manifest.assetReference.widgetId,
      referenceMode: 'URL_ONLY',
      expectedUrlFingerprint: vector.manifest.assetReference.urlFingerprint,
      renderedUrlFingerprint: vector.manifest.assetReference.urlFingerprint,
    },
    steps: {
      importResult: 'PASS',
      renderResult: 'PASS',
      renderedReferenceResult: 'PASS',
      browserLoadResult: 'PASS',
    },
    acceptanceAuthority: false,
    assetReferenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };
  return { vector, candidate, profile, proof };
}

describe('P15 exact controlled URL-only asset target proof evidence', () => {
  it('classifies one exact observed candidate/profile/reference full pass without closure authority', () => {
    const { candidate, profile, proof } = fixture();
    const result = validateElementorAssetTargetProofEvidence(proof, candidate, profile);

    expect(result.valid).toBe(true);
    expect(result.classification).toBe('ASSET_BOUND_FULL_PASS');
    expect(result.candidateBindingMatches).toBe(true);
    expect(result.profileBindingMatches).toBe(true);
    expect(result.referenceReviewBindingMatches).toBe(true);
    expect(result.assetReferenceBindingMatches).toBe(true);
    expect(result.declaredObservedEnvironmentMatches).toBe(true);
    expect(result.renderedReferenceMatches).toBe(true);
    expect(result.assetReferenceClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);

    const serialized = serializeElementorAssetTargetProofEvidence(proof, candidate, profile);
    expect(serialized).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
  });

  it('reports an observed asset failure as bound failure rather than invalid evidence', () => {
    const { candidate, profile, proof } = fixture();
    const failed = {
      ...proof,
      assetReference: {
        ...proof.assetReference,
        renderedUrlFingerprint: `sha256:${'0'.repeat(64)}`,
      },
      steps: {
        ...proof.steps,
        renderedReferenceResult: 'FAIL' as const,
      },
    };
    const result = validateElementorAssetTargetProofEvidence(failed, candidate, profile);
    expect(result.valid).toBe(true);
    expect(result.classification).toBe('ASSET_BOUND_FAIL');
    expect(result.renderedReferenceMatches).toBe(false);
  });

  it('rejects stale candidate, profile, reference-review and expected asset bindings', () => {
    const { candidate, profile, proof } = fixture();

    const staleCandidate = validateElementorAssetTargetProofEvidence({
      ...proof,
      candidateIdentity: { ...proof.candidateIdentity, digest: `sha256:${'1'.repeat(64)}` },
    }, candidate, profile);
    expect(staleCandidate.valid).toBe(false);
    expect(staleCandidate.issues.some((issue) => issue.code === 'P15_ASSET_PROOF_CANDIDATE_MISMATCH')).toBe(true);

    const staleProfile = validateElementorAssetTargetProofEvidence({
      ...proof,
      targetProfileIdentity: { ...proof.targetProfileIdentity, fingerprint: `sha256:${'2'.repeat(64)}` },
    }, candidate, profile);
    expect(staleProfile.valid).toBe(false);
    expect(staleProfile.issues.some((issue) => issue.code === 'P15_ASSET_PROOF_PROFILE_MISMATCH')).toBe(true);

    const staleReview = validateElementorAssetTargetProofEvidence({
      ...proof,
      referenceReviewIdentityDigest: `sha256:${'3'.repeat(64)}`,
    }, candidate, profile);
    expect(staleReview.valid).toBe(false);
    expect(staleReview.issues.some((issue) => issue.code === 'P15_ASSET_PROOF_REFERENCE_REVIEW_MISMATCH')).toBe(true);

    const staleReference = validateElementorAssetTargetProofEvidence({
      ...proof,
      assetReference: {
        ...proof.assetReference,
        expectedUrlFingerprint: `sha256:${'4'.repeat(64)}`,
      },
    }, candidate, profile);
    expect(staleReference.valid).toBe(false);
    expect(staleReference.issues.some((issue) => issue.code === 'P15_ASSET_PROOF_ASSET_REFERENCE_MISMATCH')).toBe(true);
  });

  it('rejects impossible step ordering and PASS with a mismatched rendered URL fingerprint', () => {
    const { candidate, profile, proof } = fixture();
    const impossible = validateElementorAssetTargetProofEvidence({
      ...proof,
      steps: {
        importResult: 'FAIL',
        renderResult: 'PASS',
        renderedReferenceResult: 'PASS',
        browserLoadResult: 'PASS',
      },
    }, candidate, profile);
    expect(impossible.valid).toBe(false);
    expect(impossible.issues.some((issue) => issue.code === 'P15_ASSET_PROOF_SEQUENCE_INVALID')).toBe(true);

    const mismatchedPass = validateElementorAssetTargetProofEvidence({
      ...proof,
      assetReference: {
        ...proof.assetReference,
        renderedUrlFingerprint: `sha256:${'5'.repeat(64)}`,
      },
    }, candidate, profile);
    expect(mismatchedPass.valid).toBe(false);
    expect(mismatchedPass.issues.some((issue) => issue.code === 'P15_ASSET_PROOF_ASSET_REFERENCE_MISMATCH')).toBe(true);
  });

  it('rejects authority inflation', () => {
    const { candidate, profile, proof } = fixture();
    const inflated = {
      ...proof,
      assetReferenceClosureClaim: true,
    } as unknown as ElementorAssetTargetProofEvidenceV1;
    const result = validateElementorAssetTargetProofEvidence(inflated, candidate, profile);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'P15_ASSET_PROOF_AUTHORITY_FLAGS_INVALID')).toBe(true);
    expect(() => serializeElementorAssetTargetProofEvidence(inflated, candidate, profile))
      .toThrow(/Invalid Elementor asset target proof/);
  });
});
