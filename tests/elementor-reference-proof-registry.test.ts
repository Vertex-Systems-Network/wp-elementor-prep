import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_REFERENCE_PROOF_ALIGNMENT_VERSION,
  P15_ELEMENTOR_REFERENCE_PROOF_REGISTRY_VERSION,
  P15_ELEMENTOR_WP68_E424_PROOF_ID,
  assessP15ElementorReferenceProofAlignment,
  serializeP15ElementorReferenceProofAlignment,
  type P15ElementorReferenceProofAlignmentV1,
} from '../src/targets/elementor/reference-proof-registry';
import { buildElementorTemplateCandidateArtifact } from '../src/targets/elementor/candidate-artifact';
import { buildP15ElementorFirstProofVector } from '../src/targets/elementor/first-proof-vector';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

describe('P15 retained Elementor reference-proof alignment', () => {
  it('reports one exact retained reference for declared WordPress 6.8 + Elementor 4.2.4 without granting authority', () => {
    const result = assessP15ElementorReferenceProofAlignment(
      buildElementorTargetProfile({ wordpressVersion: '6.8', elementorVersion: '4.2.4' }),
    );

    expect(result.reportVersion).toBe(P15_ELEMENTOR_REFERENCE_PROOF_ALIGNMENT_VERSION);
    expect(result.registryVersion).toBe(P15_ELEMENTOR_REFERENCE_PROOF_REGISTRY_VERSION);
    expect(result.status).toBe('EXACT_REFERENCE_PROFILE_MATCH');
    expect(result.exactVersionMatch).toBe(true);
    expect(result.referenceProof).toEqual(expect.objectContaining({
      proofId: P15_ELEMENTOR_WP68_E424_PROOF_ID,
      wordpressVersion: '6.8',
      elementorVersion: '4.2.4',
      architecture: 'CONTAINER',
      outputMode: 'TEMPLATE_JSON',
      documentDataVersion: '0.4',
      workflowRunId: 35403469986,
      artifactId: 10570709987,
      artifactDigest: 'sha256:206b703ab8185f1e5b1a83346074accb23cc458b9fdcb94f5eaad0c4752e33aa',
      retainedCandidateIdentityDigest: 'sha256:96ffe8a19b0c4d05eccd1e3d28d8b453f41464450ebd6c3f69decc1ab2543f26',
      retainedTargetProfileFingerprint: 'sha256:8c93e6c2c4635f7da845ef737bbce8810bbf4e46334f7496a54b682673a1b676',
      retainedTemplateSha256: 'sha256:bf2c229441f93486af7152f9196c265f09ee9e3cefab67d11ecb6765f583e4ad',
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
    }));
    expect(result.referenceProof?.verifiedScope).toEqual([
      'IMPORT',
      'EDITOR_OPEN',
      'RENDER',
      'FIDELITY_STRUCTURE',
      'FIDELITY_SOLID_BACKGROUND',
      'FIDELITY_UNIFORM_RADIUS',
    ]);
    expect(result.referenceProof?.excludedScope).toContain('GENERAL_VERSION_COMPATIBILITY');
    expect(result.candidateBinding).toBe('NOT_ASSESSED');
    expect(result.currentCandidateIdentityDigest).toBeNull();
    expect(result.environmentObserved).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.generationEnabled).toBe(false);
    expect(result.downloadEnabled).toBe(false);
    expect(result.internalReviewRequired).toBe(true);
  });

  it('binds the exact first-proof candidate identity to the retained reference profile', () => {
    const vector = buildP15ElementorFirstProofVector();
    const candidate = buildElementorTemplateCandidateArtifact(JSON.parse(vector.files['template.json']));
    const result = assessP15ElementorReferenceProofAlignment(vector.profile, candidate);

    expect(vector.candidateIdentity.digest)
      .toBe('sha256:96ffe8a19b0c4d05eccd1e3d28d8b453f41464450ebd6c3f69decc1ab2543f26');
    expect(vector.targetProfileFingerprint)
      .toBe('sha256:8c93e6c2c4635f7da845ef737bbce8810bbf4e46334f7496a54b682673a1b676');
    expect(result.status).toBe('EXACT_REFERENCE_PROFILE_MATCH');
    expect(result.candidateBinding).toBe('EXACT_REFERENCE_CANDIDATE_MATCH');
    expect(result.currentCandidateIdentityDigest).toBe(vector.candidateIdentity.digest);
    expect(result.referenceProof?.retainedCandidateIdentityDigest).toBe(vector.candidateIdentity.digest);
    expect(result.referenceProof?.retainedTargetProfileFingerprint).toBe(vector.targetProfileFingerprint);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
  });

  it('reports a different canonical candidate only as a retained-reference mismatch', () => {
    const vector = buildP15ElementorFirstProofVector();
    const template = JSON.parse(vector.files['template.json']) as Record<string, unknown>;
    template.title = 'Different canonical candidate';
    const candidate = buildElementorTemplateCandidateArtifact(template);
    const result = assessP15ElementorReferenceProofAlignment(vector.profile, candidate);

    expect(result.status).toBe('EXACT_REFERENCE_PROFILE_MATCH');
    expect(result.candidateBinding).toBe('REFERENCE_CANDIDATE_MISMATCH');
    expect(result.currentCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.currentCandidateIdentityDigest).not.toBe(vector.candidateIdentity.digest);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
  });

  it('treats a version mismatch only as absence of an exact retained reference', () => {
    const result = assessP15ElementorReferenceProofAlignment(
      buildElementorTargetProfile({ wordpressVersion: '6.8.1', elementorVersion: '4.2.4' }),
    );

    expect(result.status).toBe('NO_EXACT_REFERENCE_PROFILE');
    expect(result.exactVersionMatch).toBe(false);
    expect(result.referenceProof).toBeNull();
    expect(result.candidateBinding).toBe('NOT_ASSESSED');
    expect(result.currentCandidateIdentityDigest).toBeNull();
    expect(result.profileIssueCodes).toEqual([]);
    expect(result.targetCompatibilityClaim).toBe(false);
  });

  it('rejects authority-inflated or malformed declared profiles before reference lookup', () => {
    const profile = {
      ...buildElementorTargetProfile({ wordpressVersion: '6.8', elementorVersion: '4.2.4' }),
      targetCompatibilityClaim: true,
    };
    const result = assessP15ElementorReferenceProofAlignment(profile);

    expect(result.status).toBe('INVALID_DECLARED_PROFILE');
    expect(result.referenceProof).toBeNull();
    expect(result.exactVersionMatch).toBe(false);
    expect(result.profileIssueCodes).toContain('P15_PROFILE_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes deterministically and rejects authority-inflated output', () => {
    const result = assessP15ElementorReferenceProofAlignment(
      buildElementorTargetProfile({ wordpressVersion: '6.8', elementorVersion: '4.2.4' }),
    );

    expect(serializeP15ElementorReferenceProofAlignment(result))
      .toBe(serializeP15ElementorReferenceProofAlignment(result));

    const inflated = {
      ...result,
      productionAcceptance: true,
    } as unknown as P15ElementorReferenceProofAlignmentV1;
    expect(() => serializeP15ElementorReferenceProofAlignment(inflated))
      .toThrow(/authority-inflated/);

    const tampered = {
      ...result,
      referenceProof: result.referenceProof
        ? { ...result.referenceProof, workflowRunId: 1 }
        : null,
    } as P15ElementorReferenceProofAlignmentV1;
    expect(() => serializeP15ElementorReferenceProofAlignment(tampered))
      .toThrow(/authority-inflated/);

    const vector = buildP15ElementorFirstProofVector();
    const candidate = buildElementorTemplateCandidateArtifact(JSON.parse(vector.files['template.json']));
    const bound = assessP15ElementorReferenceProofAlignment(vector.profile, candidate);
    const tamperedBinding = {
      ...bound,
      currentCandidateIdentityDigest: 'sha256:' + '0'.repeat(64),
    } as P15ElementorReferenceProofAlignmentV1;
    expect(() => serializeP15ElementorReferenceProofAlignment(tamperedBinding))
      .toThrow(/authority-inflated/);
  });
});
