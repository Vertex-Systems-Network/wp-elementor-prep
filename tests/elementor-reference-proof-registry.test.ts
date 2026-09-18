import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_REFERENCE_PROOF_ALIGNMENT_VERSION,
  P15_ELEMENTOR_REFERENCE_PROOF_REGISTRY_VERSION,
  P15_ELEMENTOR_WP68_E424_PROOF_ID,
  assessP15ElementorReferenceProofAlignment,
  serializeP15ElementorReferenceProofAlignment,
  type P15ElementorReferenceProofAlignmentV1,
} from '../src/targets/elementor/reference-proof-registry';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

describe('P15 retained Elementor reference-proof alignment', () => {
  it('reports one exact retained reference for declared WordPress 6.8 + Elementor 4.2.4 without granting authority', () => {
    const result = assessP15ElementorReferenceProofAlignment(
      buildElementorTargetProfile({ wordpressVersion: '6.8', elementorVersion: '4.2.4' }),
    );

    expect(result.reportVersion).toBe(P15_ELEMENTOR_REFERENCE_PROOF_ALIGNMENT_VERSION);
    expect(result.registryVersion).toBe(P15_ELEMENTOR_REFERENCE_PROOF_REGISTRY_VERSION);
    expect(result.status).toBe('EXACT_REFERENCE_PROOF_MATCH');
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
    expect(result.environmentObserved).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.generationEnabled).toBe(false);
    expect(result.downloadEnabled).toBe(false);
    expect(result.internalReviewRequired).toBe(true);
  });

  it('treats a version mismatch only as absence of an exact retained reference', () => {
    const result = assessP15ElementorReferenceProofAlignment(
      buildElementorTargetProfile({ wordpressVersion: '6.8.1', elementorVersion: '4.2.4' }),
    );

    expect(result.status).toBe('NO_EXACT_REFERENCE_PROOF');
    expect(result.exactVersionMatch).toBe(false);
    expect(result.referenceProof).toBeNull();
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
  });
});
