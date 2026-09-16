import { describe, expect, it } from 'vitest';
import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from '../src/targets/elementor/candidate-artifact';
import {
  buildElementorTargetEnvironmentEvidence,
  type ElementorTargetEnvironmentEvidenceV1,
} from '../src/targets/elementor/target-environment-evidence';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';
import { validateElementorTargetProofChain } from '../src/targets/elementor/target-proof-chain';
import {
  buildElementorTargetProofEvidence,
  type ElementorTargetProofEvidenceV1,
  type ElementorTargetProofStepsV1,
} from '../src/targets/elementor/target-proof-evidence';

const RUN_REFERENCE = 'retained-evidence://elementor/controlled-run-001';

function candidate(title = 'Proof chain candidate'): ElementorTemplateCandidateArtifactV1 {
  const artifact = buildElementorTemplateCandidateArtifact({
    title: 'Proof chain fixture',
    type: 'page',
    version: '0.4',
    page_settings: [],
    content: [{
      id: 'container-1',
      elType: 'container',
      isInner: false,
      settings: {
        background_background: 'classic',
        background_color: '#112233',
        border_radius: {
          unit: 'px', top: '12', right: '12', bottom: '12', left: '12', isLinked: true,
        },
      },
      elements: [{
        id: 'heading-1',
        elType: 'widget',
        widgetType: 'heading',
        isInner: false,
        settings: { title },
        elements: [],
      }],
    }],
  });
  expect(artifact.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
  return artifact;
}

function environment(overrides: Partial<{
  databaseEngine: 'MYSQL' | 'MARIADB' | 'SQLITE' | 'OTHER';
  elementorProActive: boolean;
  thirdPartyElementorAddonsActive: boolean;
  evidenceReference: string;
}> = {}): ElementorTargetEnvironmentEvidenceV1 {
  return buildElementorTargetEnvironmentEvidence({
    wordpressVersion: '6.8.2',
    elementorVersion: '3.31.2',
    phpVersion: '8.3.5',
    database: {
      engine: overrides.databaseEngine ?? 'MYSQL',
      version: overrides.databaseEngine === 'SQLITE' ? '3.46.0' : '8.0.40',
    },
    wordpressMemoryLimitMb: 512,
    browser: { family: 'CHROME', version: '148.0.1' },
    elementorProActive: overrides.elementorProActive ?? false,
    thirdPartyElementorAddonsActive: overrides.thirdPartyElementorAddonsActive ?? false,
    observedAt: '2026-09-16T14:00:00.000Z',
    evidenceReference: overrides.evidenceReference ?? RUN_REFERENCE,
  });
}

function fullPassSteps(): ElementorTargetProofStepsV1 {
  return {
    importResult: 'PASS',
    editorOpenResult: 'PASS',
    renderResult: 'PASS',
    fidelity: { structure: 'PASS', solidBackground: 'PASS', uniformRadius: 'PASS' },
  };
}

function proof(
  artifact: ElementorTemplateCandidateArtifactV1,
  steps: ElementorTargetProofStepsV1 = fullPassSteps(),
): ElementorTargetProofEvidenceV1 {
  const profile = buildElementorTargetProfile({ wordpressVersion: '6.8.2', elementorVersion: '3.31.2' });
  return buildElementorTargetProofEvidence({
    candidate: artifact,
    profile,
    observedTarget: {
      source: 'OBSERVED',
      wordpressVersion: '6.8.2',
      elementorVersion: '3.31.2',
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: '2026-09-16T14:30:00.000Z',
    evidenceReference: RUN_REFERENCE,
    steps,
  });
}

function chain(
  artifact: ElementorTemplateCandidateArtifactV1,
  environmentEvidence: unknown,
  proofEvidence: unknown,
  targetProfile = buildElementorTargetProfile({ wordpressVersion: '6.8.2', elementorVersion: '3.31.2' }),
) {
  return validateElementorTargetProofChain({
    candidate: artifact,
    profile: targetProfile,
    environment: environmentEvidence,
    proof: proofEvidence,
  });
}

describe('P15 Elementor target proof chain', () => {
  it('accepts one exact qualified environment + full proof as CHAIN_FULL_PASS without authority', () => {
    const artifact = candidate();
    const result = chain(artifact, environment(), proof(artifact));

    expect(result.valid).toBe(true);
    expect(result.classification).toBe('CHAIN_FULL_PASS');
    expect(result.environmentQualified).toBe(true);
    expect(result.runtimeBindingMatches).toBe(true);
    expect(result.evidenceReferenceMatches).toBe(true);
    expect(result.chronologyValid).toBe(true);
    expect(result.candidateBindingMatches).toBe(true);
    expect(result.profileBindingMatches).toBe(true);
    expect(result.acceptanceAuthority).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.internalReviewRequired).toBe(true);
  });

  it('maps a matching incomplete proof to CHAIN_PARTIAL', () => {
    const artifact = candidate();
    const partial = proof(artifact, {
      importResult: 'PASS', editorOpenResult: 'NOT_RUN', renderResult: 'NOT_RUN',
      fidelity: { structure: 'NOT_RUN', solidBackground: 'NOT_RUN', uniformRadius: 'NOT_RUN' },
    });
    expect(chain(artifact, environment(), partial).classification).toBe('CHAIN_PARTIAL');
  });

  it('maps a matching observed target failure to CHAIN_FAIL', () => {
    const artifact = candidate();
    const failed = proof(artifact, {
      importResult: 'PASS', editorOpenResult: 'PASS', renderResult: 'FAIL',
      fidelity: { structure: 'NOT_RUN', solidBackground: 'NOT_RUN', uniformRadius: 'NOT_RUN' },
    });
    expect(chain(artifact, environment(), failed).classification).toBe('CHAIN_FAIL');
  });

  it('blocks structurally valid SQLite and review-required environments', () => {
    const artifact = candidate();
    const targetProof = proof(artifact);

    const sqlite = chain(artifact, environment({ databaseEngine: 'SQLITE' }), targetProof);
    expect(sqlite.valid).toBe(true);
    expect(sqlite.classification).toBe('CHAIN_BLOCKED');
    expect(sqlite.environmentClassification).toBe('NOT_QUALIFIED');

    const pro = chain(artifact, environment({ elementorProActive: true }), targetProof);
    expect(pro.valid).toBe(true);
    expect(pro.classification).toBe('CHAIN_BLOCKED');
    expect(pro.environmentClassification).toBe('REVIEW_REQUIRED');
  });

  it.each([
    ['WordPress', 'wordpressVersion', '6.8.3'],
    ['Elementor', 'elementorVersion', '3.31.3'],
  ] as const)('rejects %s identity substitution between environment and proof', (_label, key, value) => {
    const artifact = candidate();
    const targetProof = structuredClone(proof(artifact)) as ElementorTargetProofEvidenceV1;
    targetProof.observedTarget[key] = value;
    const result = chain(artifact, environment(), targetProof);

    expect(result.valid).toBe(false);
    expect(result.classification).toBe('REJECTED');
    expect(result.chainIssues.map((issue) => issue.code)).toContain('P15_TARGET_PROOF_CHAIN_RUNTIME_MISMATCH');
  });

  it('rejects a proof from a different retained evidence bundle even when versions match', () => {
    const artifact = candidate();
    const targetProof = structuredClone(proof(artifact)) as ElementorTargetProofEvidenceV1;
    targetProof.evidenceReference = 'retained-evidence://elementor/different-run';
    const result = chain(artifact, environment(), targetProof);

    expect(result.classification).toBe('REJECTED');
    expect(result.chainIssues.map((issue) => issue.code))
      .toContain('P15_TARGET_PROOF_CHAIN_EVIDENCE_REFERENCE_MISMATCH');
  });

  it('rejects proof chronology that precedes the bound environment observation', () => {
    const artifact = candidate();
    const targetProof = structuredClone(proof(artifact)) as ElementorTargetProofEvidenceV1;
    targetProof.observedAt = '2026-09-16T13:59:59.000Z';
    const result = chain(artifact, environment(), targetProof);

    expect(result.classification).toBe('REJECTED');
    expect(result.chainIssues.map((issue) => issue.code))
      .toContain('P15_TARGET_PROOF_CHAIN_CHRONOLOGY_INVALID');
  });

  it('rejects candidate replay and TargetProfile replay through the existing exact proof validator', () => {
    const original = candidate('Original');
    const targetProof = proof(original);

    const candidateReplay = chain(candidate('Different'), environment(), targetProof);
    expect(candidateReplay.classification).toBe('REJECTED');
    expect(candidateReplay.proofIssues.map((issue) => issue.code)).toContain('P15_TARGET_PROOF_CANDIDATE_MISMATCH');

    const differentProfile = buildElementorTargetProfile({ wordpressVersion: '6.8.2', elementorVersion: '3.31.3' });
    const profileReplay = chain(original, environment(), targetProof, differentProfile);
    expect(profileReplay.classification).toBe('REJECTED');
    expect(profileReplay.proofIssues.map((issue) => issue.code)).toContain('P15_TARGET_PROOF_PROFILE_MISMATCH');
  });

  it('rejects malformed/elevated environment authority evidence', () => {
    const artifact = candidate();
    const elevated = {
      ...environment(),
      targetCompatibilityClaim: true,
    };
    const result = chain(artifact, elevated, proof(artifact));

    expect(result.classification).toBe('REJECTED');
    expect(result.chainIssues.map((issue) => issue.code)).toContain('P15_TARGET_PROOF_CHAIN_ENVIRONMENT_INVALID');
  });
});
