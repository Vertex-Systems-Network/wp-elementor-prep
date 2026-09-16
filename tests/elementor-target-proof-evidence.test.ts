import { describe, expect, it } from 'vitest';
import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from '../src/targets/elementor/candidate-artifact';
import {
  buildElementorTargetProfile,
  type ElementorTargetProfileV1,
} from '../src/targets/elementor/target-profile';
import {
  buildElementorTargetProofEvidence,
  serializeElementorTargetProofEvidence,
  validateElementorTargetProofEvidence,
  type ElementorTargetProofEvidenceV1,
  type ElementorTargetProofStepsV1,
} from '../src/targets/elementor/target-proof-evidence';

function candidate(title = 'Target proof candidate'): ElementorTemplateCandidateArtifactV1 {
  const artifact = buildElementorTemplateCandidateArtifact({
    title: 'Target proof fixture',
    type: 'page',
    version: '0.4',
    page_settings: [],
    content: [
      {
        id: 'container-1',
        elType: 'container',
        isInner: false,
        settings: {
          background_background: 'classic',
          background_color: '#112233',
          border_radius: {
            unit: 'px',
            top: '12',
            right: '12',
            bottom: '12',
            left: '12',
            isLinked: true,
          },
        },
        elements: [
          {
            id: 'heading-1',
            elType: 'widget',
            widgetType: 'heading',
            isInner: false,
            settings: { title },
            elements: [],
          },
        ],
      },
    ],
  });
  expect(artifact.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
  return artifact;
}

function profile(
  wordpressVersion = '6.8.2',
  elementorVersion = '3.31.2',
): ElementorTargetProfileV1 {
  return buildElementorTargetProfile({ wordpressVersion, elementorVersion });
}

function fullPassSteps(): ElementorTargetProofStepsV1 {
  return {
    importResult: 'PASS',
    editorOpenResult: 'PASS',
    renderResult: 'PASS',
    fidelity: {
      structure: 'PASS',
      solidBackground: 'PASS',
      uniformRadius: 'PASS',
    },
  };
}

function proof(
  artifact: ElementorTemplateCandidateArtifactV1,
  targetProfile: ElementorTargetProfileV1,
  overrides: {
    wordpressVersion?: string;
    elementorVersion?: string;
    steps?: ElementorTargetProofStepsV1;
  } = {},
): ElementorTargetProofEvidenceV1 {
  return buildElementorTargetProofEvidence({
    candidate: artifact,
    profile: targetProfile,
    observedTarget: {
      source: 'OBSERVED',
      wordpressVersion: overrides.wordpressVersion ?? targetProfile.environment.wordpressVersion,
      elementorVersion: overrides.elementorVersion ?? targetProfile.environment.elementorVersion,
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: '2026-09-16T11:30:00.000Z',
    evidenceReference: 'retained-evidence://elementor/controlled-target-proof-fixture',
    steps: overrides.steps ?? fullPassSteps(),
  });
}

describe('P15 Elementor controlled target proof evidence', () => {
  it('binds a full observed import/editor/render pass to the exact candidate and declared profile', () => {
    const artifact = candidate();
    const targetProfile = profile();
    const evidence = proof(artifact, targetProfile);
    const validation = validateElementorTargetProofEvidence(evidence, artifact, targetProfile);

    expect(validation.valid).toBe(true);
    expect(validation.classification).toBe('BOUND_FULL_PASS');
    expect(validation.candidateBindingMatches).toBe(true);
    expect(validation.profileBindingMatches).toBe(true);
    expect(validation.declaredObservedEnvironmentMatches).toBe(true);
    expect(validation.reviewCodes).toEqual([]);
    expect(validation.issues).toEqual([]);
    expect(validation.acceptanceAuthority).toBe(false);
    expect(validation.targetCompatibilityClaim).toBe(false);
    expect(validation.productionAcceptance).toBe(false);
    expect(validation.internalReviewRequired).toBe(true);
    expect(JSON.parse(serializeElementorTargetProofEvidence(evidence, artifact, targetProfile))).toEqual(evidence);
  });

  it('retains observed environment separately and makes a declared/observed mismatch partial review evidence', () => {
    const artifact = candidate();
    const targetProfile = profile('6.8.2', '3.31.2');
    const evidence = proof(artifact, targetProfile, {
      wordpressVersion: '6.8.3',
      elementorVersion: '3.31.3',
    });
    const validation = validateElementorTargetProofEvidence(evidence, artifact, targetProfile);

    expect(validation.valid).toBe(true);
    expect(validation.classification).toBe('BOUND_PARTIAL');
    expect(validation.declaredObservedEnvironmentMatches).toBe(false);
    expect(validation.observedTarget).toEqual({
      source: 'OBSERVED',
      wordpressVersion: '6.8.3',
      elementorVersion: '3.31.3',
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    });
    expect(validation.reviewCodes).toEqual(['P15_TARGET_PROOF_DECLARED_OBSERVED_MISMATCH']);
  });

  it('keeps a review-free but incomplete observation sequence as BOUND_PARTIAL', () => {
    const artifact = candidate();
    const targetProfile = profile();
    const evidence = proof(artifact, targetProfile, {
      steps: {
        importResult: 'PASS',
        editorOpenResult: 'NOT_RUN',
        renderResult: 'NOT_RUN',
        fidelity: {
          structure: 'NOT_RUN',
          solidBackground: 'NOT_RUN',
          uniformRadius: 'NOT_RUN',
        },
      },
    });
    const validation = validateElementorTargetProofEvidence(evidence, artifact, targetProfile);

    expect(validation.valid).toBe(true);
    expect(validation.classification).toBe('BOUND_PARTIAL');
    expect(validation.issues).toEqual([]);
  });

  it('retains observed failure without promoting downstream target authority', () => {
    const artifact = candidate();
    const targetProfile = profile();
    const evidence = proof(artifact, targetProfile, {
      steps: {
        importResult: 'PASS',
        editorOpenResult: 'PASS',
        renderResult: 'FAIL',
        fidelity: {
          structure: 'NOT_RUN',
          solidBackground: 'NOT_RUN',
          uniformRadius: 'NOT_RUN',
        },
      },
    });
    const validation = validateElementorTargetProofEvidence(evidence, artifact, targetProfile);

    expect(validation.valid).toBe(true);
    expect(validation.classification).toBe('BOUND_FAIL');
    expect(validation.targetCompatibilityClaim).toBe(false);
    expect(validation.productionAcceptance).toBe(false);
  });

  it('rejects impossible downstream PASS claims after an import failure', () => {
    const artifact = candidate();
    const targetProfile = profile();
    const evidence = proof(artifact, targetProfile);
    const invalid = structuredClone(evidence) as ElementorTargetProofEvidenceV1;
    invalid.steps.importResult = 'FAIL';

    const validation = validateElementorTargetProofEvidence(invalid, artifact, targetProfile);
    expect(validation.valid).toBe(false);
    expect(validation.classification).toBe('REJECTED');
    expect(validation.issues.map((issue) => issue.code)).toContain('P15_TARGET_PROOF_SEQUENCE_INVALID');
  });

  it('rejects render PASS when editor-open was not proven', () => {
    const artifact = candidate();
    const targetProfile = profile();
    const evidence = proof(artifact, targetProfile);
    const invalid = structuredClone(evidence) as ElementorTargetProofEvidenceV1;
    invalid.steps.editorOpenResult = 'NOT_RUN';

    const validation = validateElementorTargetProofEvidence(invalid, artifact, targetProfile);
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain('P15_TARGET_PROOF_SEQUENCE_INVALID');
  });

  it('rejects candidate and profile replay against different current identities', () => {
    const originalCandidate = candidate('Original candidate');
    const originalProfile = profile('6.8.2', '3.31.2');
    const evidence = proof(originalCandidate, originalProfile);

    const candidateReplay = validateElementorTargetProofEvidence(
      evidence,
      candidate('Different candidate'),
      originalProfile,
    );
    expect(candidateReplay.valid).toBe(false);
    expect(candidateReplay.candidateBindingMatches).toBe(false);
    expect(candidateReplay.issues.map((issue) => issue.code)).toContain('P15_TARGET_PROOF_CANDIDATE_MISMATCH');

    const profileReplay = validateElementorTargetProofEvidence(
      evidence,
      originalCandidate,
      profile('6.8.4', '3.31.2'),
    );
    expect(profileReplay.valid).toBe(false);
    expect(profileReplay.profileBindingMatches).toBe(false);
    expect(profileReplay.issues.map((issue) => issue.code)).toContain('P15_TARGET_PROOF_PROFILE_MISMATCH');
  });

  it('fails closed on unknown fields and elevated authority flags', () => {
    const artifact = candidate();
    const targetProfile = profile();
    const evidence = proof(artifact, targetProfile);

    const unknownField = { ...evidence, hiddenAuthority: true };
    expect(validateElementorTargetProofEvidence(unknownField, artifact, targetProfile).issues
      .map((issue) => issue.code)).toContain('P15_TARGET_PROOF_FIELDS_INVALID');

    const elevated = { ...evidence, targetCompatibilityClaim: true };
    expect(validateElementorTargetProofEvidence(elevated, artifact, targetProfile).issues
      .map((issue) => issue.code)).toContain('P15_TARGET_PROOF_AUTHORITY_FLAGS_INVALID');
  });
});
