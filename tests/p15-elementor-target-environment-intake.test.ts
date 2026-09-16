import { spawnSync } from 'node:child_process';
import { existsSync, linkSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildElementorTargetEnvironmentEvidence,
  serializeElementorTargetEnvironmentEvidence,
} from '../src/targets/elementor/target-environment-evidence';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-elementor-target-environment-test-'));
  tempDirs.push(dir);
  return dir;
}

function qualifiedEvidence(databaseEngine: 'MYSQL' | 'MARIADB' | 'SQLITE' = 'MYSQL') {
  return buildElementorTargetEnvironmentEvidence({
    wordpressVersion: '6.8.2',
    elementorVersion: '4.2.4',
    phpVersion: '8.3.5',
    database: {
      engine: databaseEngine,
      version: databaseEngine === 'MARIADB' ? '10.6.20' : databaseEngine === 'SQLITE' ? '3.46.0' : '8.0.40',
    },
    wordpressMemoryLimitMb: 512,
    browser: {
      family: 'CHROME',
      version: '148.0.1',
    },
    elementorProActive: false,
    thirdPartyElementorAddonsActive: false,
    observedAt: '2026-09-16T13:55:00.000Z',
    evidenceReference: 'retained-evidence://elementor/environment/operator-run-001',
  });
}

function runIntake(evidencePath: string, outPath: string) {
  return spawnSync(process.execPath, [
    'scripts/p15-elementor-target-environment-intake.mjs',
    '--evidence', evidencePath,
    '--out', outPath,
  ], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

describe('P15 Elementor target-environment operator intake', () => {
  it('emits a sanitized qualified report without inventing import/editor/render observations', () => {
    const dir = fixtureDir();
    const evidencePath = join(dir, 'environment.json');
    const outPath = join(dir, 'report.json');
    writeFileSync(evidencePath, serializeElementorTargetEnvironmentEvidence(qualifiedEvidence()));

    const run = runIntake(evidencePath, outPath);
    expect(run.status).toBe(0);
    const raw = readFileSync(outPath, 'utf8');
    const report = JSON.parse(raw) as Record<string, unknown>;

    expect(report.classification).toBe('QUALIFIED_FOR_BOUND_TARGET_PROOF');
    expect(report.evidenceValid).toBe(true);
    expect(report.acceptanceAuthority).toBe(false);
    expect(report.targetCompatibilityClaim).toBe(false);
    expect(report.productionAcceptance).toBe(false);
    expect(report.internalReviewRequired).toBe(true);
    expect(report.importObserved).toBe(false);
    expect(report.editorObserved).toBe(false);
    expect(report.renderObserved).toBe(false);
    expect(raw).toMatch(/"evidenceSha256": "sha256:[0-9a-f]{64}"/);
  });

  it('returns nonzero NOT_QUALIFIED for SQLite evidence while retaining the observed runtime facts', () => {
    const dir = fixtureDir();
    const evidencePath = join(dir, 'environment.json');
    const outPath = join(dir, 'report.json');
    writeFileSync(evidencePath, serializeElementorTargetEnvironmentEvidence(qualifiedEvidence('SQLITE')));

    const run = runIntake(evidencePath, outPath);
    expect(run.status).toBe(2);
    const report = JSON.parse(readFileSync(outPath, 'utf8')) as Record<string, unknown>;
    expect(report.classification).toBe('NOT_QUALIFIED');
    expect(report.evidenceValid).toBe(true);
    expect(report.failures).toEqual(['P15_TARGET_ENVIRONMENT_DATABASE_ENGINE_UNSUPPORTED']);
  });

  it('rejects unknown arbitrary fields without echoing their contents into the sanitized report', () => {
    const dir = fixtureDir();
    const evidencePath = join(dir, 'environment.json');
    const outPath = join(dir, 'report.json');
    const invalid = {
      ...qualifiedEvidence(),
      operatorNote: 'DO-NOT-ECHO-PRIVATE-OPERATOR-NOTE',
    };
    writeFileSync(evidencePath, `${JSON.stringify(invalid, null, 2)}\n`);

    const run = runIntake(evidencePath, outPath);
    expect(run.status).toBe(2);
    const raw = readFileSync(outPath, 'utf8');
    const report = JSON.parse(raw) as Record<string, unknown>;
    expect(report.classification).toBe('REJECTED');
    expect(report.evidenceValid).toBe(false);
    expect(raw).not.toContain('DO-NOT-ECHO-PRIVATE-OPERATOR-NOTE');
  });

  it('rejects duplicate options instead of silently using the last value', () => {
    const dir = fixtureDir();
    const evidencePath = join(dir, 'environment.json');
    const outPath = join(dir, 'report.json');
    writeFileSync(evidencePath, serializeElementorTargetEnvironmentEvidence(qualifiedEvidence()));

    const run = spawnSync(process.execPath, [
      'scripts/p15-elementor-target-environment-intake.mjs',
      '--evidence', evidencePath,
      '--evidence', evidencePath,
      '--out', outPath,
    ], { cwd: process.cwd(), encoding: 'utf8' });

    expect(run.status).toBe(2);
    expect(run.stderr).toContain('Duplicate option: --evidence.');
    expect(existsSync(outPath)).toBe(false);
  });

  it('rejects an output path that resolves to the evidence input and preserves the input bytes', () => {
    const dir = fixtureDir();
    const evidencePath = join(dir, 'environment.json');
    const aliasOutPath = `${dir}${sep}.${sep}environment.json`;
    const original = serializeElementorTargetEnvironmentEvidence(qualifiedEvidence());
    writeFileSync(evidencePath, original);

    const run = runIntake(evidencePath, aliasOutPath);
    expect(run.status).toBe(2);
    expect(run.stderr).toContain('--out must not overwrite or alias the evidence input file.');
    expect(readFileSync(evidencePath, 'utf8')).toBe(original);
  });

  it('rejects an existing hardlink output to the evidence input and preserves evidence bytes', () => {
    const dir = fixtureDir();
    const evidencePath = join(dir, 'environment.json');
    const hardlinkOut = join(dir, 'hardlink-report.json');
    const original = serializeElementorTargetEnvironmentEvidence(qualifiedEvidence());
    writeFileSync(evidencePath, original);
    linkSync(evidencePath, hardlinkOut);

    const run = runIntake(evidencePath, hardlinkOut);
    expect(run.status).toBe(2);
    expect(run.stderr).toContain('--out must not overwrite or alias the evidence input file.');
    expect(readFileSync(evidencePath, 'utf8')).toBe(original);
  });

  it('allows replacing an unrelated existing output file', () => {
    const dir = fixtureDir();
    const evidencePath = join(dir, 'environment.json');
    const outPath = join(dir, 'report.json');
    writeFileSync(evidencePath, serializeElementorTargetEnvironmentEvidence(qualifiedEvidence()));
    writeFileSync(outPath, 'old-report');

    const run = runIntake(evidencePath, outPath);
    expect(run.status).toBe(0);
    expect(JSON.parse(readFileSync(outPath, 'utf8')).classification).toBe('QUALIFIED_FOR_BOUND_TARGET_PROOF');
  });
});
