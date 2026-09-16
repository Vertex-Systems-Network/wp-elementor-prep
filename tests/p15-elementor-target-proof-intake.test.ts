import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildElementorTemplateCandidateArtifact,
  serializeElementorTemplateCandidateArtifact,
} from '../src/targets/elementor/candidate-artifact';
import {
  buildElementorTargetProfile,
  serializeElementorTargetProfile,
} from '../src/targets/elementor/target-profile';
import {
  buildElementorTargetProofEvidence,
  serializeElementorTargetProofEvidence,
} from '../src/targets/elementor/target-proof-evidence';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-elementor-target-proof-test-'));
  tempDirs.push(dir);
  return dir;
}

function fixture(observedElementorVersion = '3.31.2') {
  const candidate = buildElementorTemplateCandidateArtifact({
    title: 'Sensitive target proof fixture',
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
          background_color: '#445566',
        },
        elements: [
          {
            id: 'heading-1',
            elType: 'widget',
            widgetType: 'heading',
            isInner: false,
            settings: { title: 'DO-NOT-LEAK-CANDIDATE-CONTENT' },
            elements: [],
          },
        ],
      },
    ],
  });
  const profile = buildElementorTargetProfile({
    wordpressVersion: '6.8.2',
    elementorVersion: '3.31.2',
  });
  const proof = buildElementorTargetProofEvidence({
    candidate,
    profile,
    observedTarget: {
      source: 'OBSERVED',
      wordpressVersion: '6.8.2',
      elementorVersion: observedElementorVersion,
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: '2026-09-16T11:45:00.000Z',
    evidenceReference: 'retained-evidence://elementor/operator-proof/test',
    steps: {
      importResult: 'PASS',
      editorOpenResult: 'PASS',
      renderResult: 'PASS',
      fidelity: {
        structure: 'PASS',
        solidBackground: 'PASS',
        uniformRadius: 'NOT_APPLICABLE',
      },
    },
  });
  return { candidate, profile, proof };
}

function runIntake(candidatePath: string, profilePath: string, proofPath: string, outPath: string) {
  return spawnSync(process.execPath, [
    'scripts/p15-elementor-target-proof-intake.mjs',
    '--candidate', candidatePath,
    '--profile', profilePath,
    '--proof', proofPath,
    '--out', outPath,
  ], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

describe('P15 Elementor target-proof operator intake', () => {
  it('emits a sanitized BOUND_FULL_PASS report for exact-bound complete observations', () => {
    const dir = fixtureDir();
    const { candidate, profile, proof } = fixture();
    const candidatePath = join(dir, 'candidate.json');
    const profilePath = join(dir, 'profile.json');
    const proofPath = join(dir, 'proof.json');
    const outPath = join(dir, 'report.json');

    writeFileSync(candidatePath, serializeElementorTemplateCandidateArtifact(candidate));
    writeFileSync(profilePath, serializeElementorTargetProfile(profile));
    writeFileSync(proofPath, serializeElementorTargetProofEvidence(proof, candidate, profile));

    const run = runIntake(candidatePath, profilePath, proofPath, outPath);
    expect(run.status).toBe(0);
    const raw = readFileSync(outPath, 'utf8');
    const report = JSON.parse(raw) as Record<string, unknown>;

    expect(report.classification).toBe('BOUND_FULL_PASS');
    expect(report.proofValid).toBe(true);
    expect(report.candidateBindingMatches).toBe(true);
    expect(report.profileBindingMatches).toBe(true);
    expect(report.declaredObservedEnvironmentMatches).toBe(true);
    expect(report.acceptanceAuthority).toBe(false);
    expect(report.targetCompatibilityClaim).toBe(false);
    expect(report.productionAcceptance).toBe(false);
    expect(report.internalReviewRequired).toBe(true);
    expect(raw).not.toContain('DO-NOT-LEAK-CANDIDATE-CONTENT');
    expect(raw).not.toContain('templateJson');
    expect(raw).toMatch(/"candidateSha256": "sha256:[0-9a-f]{64}"/);
    expect(raw).toMatch(/"profileSha256": "sha256:[0-9a-f]{64}"/);
    expect(raw).toMatch(/"proofSha256": "sha256:[0-9a-f]{64}"/);
  });

  it('retains a declared/observed version mismatch as nonzero BOUND_PARTIAL review evidence', () => {
    const dir = fixtureDir();
    const { candidate, profile, proof } = fixture('3.31.3');
    const candidatePath = join(dir, 'candidate.json');
    const profilePath = join(dir, 'profile.json');
    const proofPath = join(dir, 'proof.json');
    const outPath = join(dir, 'report.json');

    writeFileSync(candidatePath, serializeElementorTemplateCandidateArtifact(candidate));
    writeFileSync(profilePath, serializeElementorTargetProfile(profile));
    writeFileSync(proofPath, serializeElementorTargetProofEvidence(proof, candidate, profile));

    const run = runIntake(candidatePath, profilePath, proofPath, outPath);
    expect(run.status).toBe(2);
    const report = JSON.parse(readFileSync(outPath, 'utf8')) as Record<string, unknown>;
    expect(report.classification).toBe('BOUND_PARTIAL');
    expect(report.proofValid).toBe(true);
    expect(report.declaredObservedEnvironmentMatches).toBe(false);
    expect(report.reviewCodes).toEqual(['P15_TARGET_PROOF_DECLARED_OBSERVED_MISMATCH']);
  });
});
