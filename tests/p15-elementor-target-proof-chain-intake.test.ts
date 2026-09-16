import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildElementorTemplateCandidateArtifact } from '../src/targets/elementor/candidate-artifact';
import {
  buildElementorTargetEnvironmentEvidence,
  serializeElementorTargetEnvironmentEvidence,
} from '../src/targets/elementor/target-environment-evidence';
import {
  buildElementorTargetProfile,
  serializeElementorTargetProfile,
} from '../src/targets/elementor/target-profile';
import {
  buildElementorTargetProofEvidence,
  serializeElementorTargetProofEvidence,
} from '../src/targets/elementor/target-proof-evidence';

const tempDirs: string[] = [];
const RUN_REFERENCE = 'retained-evidence://elementor/chain-cli-run-001';

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-elementor-proof-chain-test-'));
  tempDirs.push(dir);
  return dir;
}

function fixtures(databaseEngine: 'MYSQL' | 'SQLITE' = 'MYSQL') {
  const candidate = buildElementorTemplateCandidateArtifact({
    title: 'Chain CLI fixture',
    type: 'page',
    version: '0.4',
    page_settings: [],
    content: [{
      id: 'container-secret',
      elType: 'container',
      isInner: false,
      settings: {},
      elements: [{
        id: 'heading-secret',
        elType: 'widget',
        widgetType: 'heading',
        isInner: false,
        settings: { title: 'DO-NOT-LEAK-CANDIDATE-CONTENT' },
        elements: [],
      }],
    }],
  });
  const profile = buildElementorTargetProfile({ wordpressVersion: '6.8.2', elementorVersion: '3.31.2' });
  const environment = buildElementorTargetEnvironmentEvidence({
    wordpressVersion: '6.8.2',
    elementorVersion: '3.31.2',
    phpVersion: '8.3.5',
    database: { engine: databaseEngine, version: databaseEngine === 'SQLITE' ? '3.46.0' : '8.0.40' },
    wordpressMemoryLimitMb: 512,
    browser: { family: 'CHROME', version: '148.0.1' },
    elementorProActive: false,
    thirdPartyElementorAddonsActive: false,
    observedAt: '2026-09-16T14:00:00.000Z',
    evidenceReference: RUN_REFERENCE,
  });
  const proof = buildElementorTargetProofEvidence({
    candidate,
    profile,
    observedTarget: {
      source: 'OBSERVED',
      wordpressVersion: '6.8.2',
      elementorVersion: '3.31.2',
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: '2026-09-16T14:30:00.000Z',
    evidenceReference: RUN_REFERENCE,
    steps: {
      importResult: 'PASS',
      editorOpenResult: 'PASS',
      renderResult: 'PASS',
      fidelity: { structure: 'PASS', solidBackground: 'PASS', uniformRadius: 'PASS' },
    },
  });
  return { candidate, profile, environment, proof };
}

function writeFixtures(dir: string, databaseEngine: 'MYSQL' | 'SQLITE' = 'MYSQL') {
  const values = fixtures(databaseEngine);
  const paths = {
    candidate: join(dir, 'candidate.json'),
    profile: join(dir, 'profile.json'),
    environment: join(dir, 'environment.json'),
    proof: join(dir, 'proof.json'),
    out: join(dir, 'chain-report.json'),
  };
  writeFileSync(paths.candidate, `${JSON.stringify(values.candidate, null, 2)}\n`);
  writeFileSync(paths.profile, serializeElementorTargetProfile(values.profile));
  writeFileSync(paths.environment, serializeElementorTargetEnvironmentEvidence(values.environment));
  writeFileSync(paths.proof, serializeElementorTargetProofEvidence(values.proof, values.candidate, values.profile));
  return paths;
}

function run(paths: ReturnType<typeof writeFixtures>, outPath = paths.out) {
  return spawnSync(process.execPath, [
    'scripts/p15-elementor-target-proof-chain-intake.mjs',
    '--candidate', paths.candidate,
    '--profile', paths.profile,
    '--environment', paths.environment,
    '--proof', paths.proof,
    '--out', outPath,
  ], { cwd: process.cwd(), encoding: 'utf8' });
}

describe('P15 Elementor target proof chain intake CLI', () => {
  it('emits a sanitized CHAIN_FULL_PASS report with four exact input fingerprints', () => {
    const paths = writeFixtures(fixtureDir());
    const result = run(paths);
    expect(result.status).toBe(0);

    const raw = readFileSync(paths.out, 'utf8');
    const report = JSON.parse(raw) as Record<string, unknown>;
    expect(report.classification).toBe('CHAIN_FULL_PASS');
    expect(report.chainValid).toBe(true);
    expect(report.acceptanceAuthority).toBe(false);
    expect(report.targetCompatibilityClaim).toBe(false);
    expect(report.productionAcceptance).toBe(false);
    expect(raw).not.toContain('DO-NOT-LEAK-CANDIDATE-CONTENT');
    expect(raw.match(/sha256:[0-9a-f]{64}/g)?.length).toBeGreaterThanOrEqual(6);
  });

  it('returns nonzero CHAIN_BLOCKED for a structurally valid SQLite environment', () => {
    const paths = writeFixtures(fixtureDir(), 'SQLITE');
    const result = run(paths);
    expect(result.status).toBe(2);
    const report = JSON.parse(readFileSync(paths.out, 'utf8')) as Record<string, unknown>;
    expect(report.classification).toBe('CHAIN_BLOCKED');
    expect(report.environmentClassification).toBe('NOT_QUALIFIED');
  });

  it('returns nonzero REJECTED when the proof points at a different retained run', () => {
    const dir = fixtureDir();
    const paths = writeFixtures(dir);
    const proof = JSON.parse(readFileSync(paths.proof, 'utf8')) as { evidenceReference: string };
    proof.evidenceReference = 'retained-evidence://elementor/other-run';
    writeFileSync(paths.proof, `${JSON.stringify(proof, null, 2)}\n`);

    const result = run(paths);
    expect(result.status).toBe(2);
    const report = JSON.parse(readFileSync(paths.out, 'utf8')) as Record<string, unknown>;
    expect(report.classification).toBe('REJECTED');
  });

  it('rejects duplicate proof options before writing any report', () => {
    const paths = writeFixtures(fixtureDir());
    const result = spawnSync(process.execPath, [
      'scripts/p15-elementor-target-proof-chain-intake.mjs',
      '--candidate', paths.candidate,
      '--profile', paths.profile,
      '--environment', paths.environment,
      '--proof', paths.proof,
      '--proof', paths.proof,
      '--out', paths.out,
    ], { cwd: process.cwd(), encoding: 'utf8' });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('Duplicate option: --proof.');
    expect(existsSync(paths.out)).toBe(false);
  });

  it('rejects output aliasing the environment evidence and preserves its bytes', () => {
    const paths = writeFixtures(fixtureDir());
    const original = readFileSync(paths.environment, 'utf8');
    const aliasOut = paths.environment.replace('/environment.json', '/./environment.json');

    const result = run(paths, aliasOut);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('--out must not overwrite a candidate, profile, environment, or proof input file.');
    expect(readFileSync(paths.environment, 'utf8')).toBe(original);
  });
});
