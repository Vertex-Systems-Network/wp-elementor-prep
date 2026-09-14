import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const roots = [];
const CURRENT_ANALYZER_VERSION = 'p13-core-v2';

function runIdFor(report) {
  return `p13-${report.source.structuralHash}-${report.source.configHash}-${report.source.analyzerVersion}`;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

function buildReady(generatedAt = '2026-09-12T00:00:00.000Z', analyzerVersion = CURRENT_ANALYZER_VERSION) {
  const report = {
    schemaVersion: 1,
    buildReadyScoreVersion: 2,
    responsiveRiskVersion: 1,
    runId: '',
    generatedAt,
    source: {
      rootId: '3434:8258',
      rootName: 'Desktop — Original',
      structuralHash: 'aaaaaaaa',
      configHash: 'bbbbbbbb',
      analyzerVersion,
    },
    config: {
      referenceWidths: [1440, 1024, 768, 390],
      minOverallCoverage: 0.8,
      maxCollisionChildren: 24,
      maxFindingsPerRule: 20,
      maxNodes: 10000,
    },
    score: { score: 85, status: 'REVIEW', hasHighRisk: true, blockerCount: 0 },
    categories: [],
    responsiveRisk: { level: 'MEDIUM', findingCount: 20, highRiskCount: 0, triggeredReferenceWidths: [] },
    findings: [],
    coverage: {
      scannedNodes: 1152,
      eligibleNodes: 1152,
      analyzedNodes: 1152,
      unsupportedNodes: 0,
      unknownGeometryNodes: 0,
      categoryCoverage: {},
      overallCoverage: 1,
    },
    limitations: [],
  };
  report.runId = runIdFor(report);
  return report;
}

function evidence({ fileKey = '01SIsqGVDm32KsaZnxHPR9', traceable = true, analyzerVersion = CURRENT_ANALYZER_VERSION } = {}) {
  const report = buildReady('2026-09-12T00:00:01.000Z', analyzerVersion);
  const realFigmaContext = fileKey !== 'local-file';
  return {
    schemaVersion: 1,
    acceptanceAuthority: false,
    capturedAt: '2026-09-12T00:00:02.000Z',
    pluginVersion: '0.1.0-alpha.1',
    build: traceable
      ? { sourceSha: '0123456789abcdef0123456789abcdef01234567', runId: '123456789', runNumber: '99' }
      : { sourceSha: 'local', runId: 'local', runNumber: 'local' },
    traceableBuild: traceable,
    realFigmaContext,
    context: {
      fileKey,
      pageId: '3434:1',
      pageName: 'Nova',
      frameId: report.source.rootId,
      frameName: report.source.rootName,
    },
    audit: {
      schemaVersion: 1,
      generatedAt: report.generatedAt,
      score: 75,
      status: 'REVIEW',
      root: { id: report.source.rootId, name: report.source.rootName, width: 1920, height: 1080 },
      stats: {},
      findingCodes: [],
    },
    buildReady: report,
    buildReadyJson: `${JSON.stringify(report, null, 2)}\n`,
  };
}

async function writeFixture({ plugin = evidence(), cli = buildReady() } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'p13-parity-'));
  roots.push(root);
  const pluginPath = join(root, 'plugin.json');
  const cliPath = join(root, 'build-ready-report.json');
  const outPath = join(root, 'receipt.json');
  await writeFile(pluginPath, `${JSON.stringify(plugin, null, 2)}\n`);
  await writeFile(cliPath, `${JSON.stringify(cli, null, 2)}\n`);
  return { pluginPath, cliPath, outPath };
}

function invokeFixture(paths) {
  return spawnSync(process.execPath, [
    'scripts/p13-runtime-parity-intake.mjs',
    `--plugin-evidence=${paths.pluginPath}`,
    `--cli-report=${paths.cliPath}`,
    `--out=${paths.outPath}`,
  ], { cwd: process.cwd(), encoding: 'utf8' });
}

async function runFixture({ plugin = evidence(), cli = buildReady(), expectedExit = 0 } = {}) {
  const paths = await writeFixture({ plugin, cli });
  const result = invokeFixture(paths);
  expect(result.status).toBe(expectedExit);
  return JSON.parse(await readFile(paths.outPath, 'utf8'));
}

async function runRejectedFixture({ plugin = evidence(), cli = buildReady(), stderr }) {
  const paths = await writeFixture({ plugin, cli });
  const result = invokeFixture(paths);
  expect(result.status).toBe(2);
  expect(result.stderr).toMatch(stderr);
  await expect(readFile(paths.outPath, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
}

describe('P13 runtime parity intake CLI', () => {
  it('accepts exact analyzer-v2 semantic parity from a traceable real-Figma plugin run', async () => {
    const receipt = await runFixture();
    expect(receipt.gate).toBe('p13-runtime-plugin-cli-parity');
    expect(receipt.acceptanceAuthority).toBe(false);
    expect(receipt.productionAcceptance).toBe(false);
    expect(receipt.targetCompatibilityClaim).toBe(false);
    expect(receipt.currentAnalyzerVersion).toBe(CURRENT_ANALYZER_VERSION);
    expect(receipt.pluginEvidence.traceableBuild).toBe(true);
    expect(receipt.pluginEvidence.realFigmaContext).toBe(true);
    expect(receipt.pluginEvidence.buildReadyRunIdentity).toEqual({
      runId: 'p13-aaaaaaaa-bbbbbbbb-p13-core-v2',
      structuralHash: 'aaaaaaaa',
      configHash: 'bbbbbbbb',
      analyzerVersion: CURRENT_ANALYZER_VERSION,
    });
    expect(receipt.cliReport.buildReadyRunIdentity.analyzerVersion).toBe(CURRENT_ANALYZER_VERSION);
    expect(receipt.sameRunIdentity).toBe(true);
    expect(receipt.mismatchCount).toBe(0);
    expect(receipt.parityCandidateAccepted).toBe(true);
  });

  it('keeps generatedAt as ignored runtime metadata', async () => {
    const plugin = evidence();
    const cli = buildReady('2026-09-14T10:30:00.000Z');
    const receipt = await runFixture({ plugin, cli });
    expect(plugin.buildReady.generatedAt).not.toBe(cli.generatedAt);
    expect(receipt.mismatchCount).toBe(0);
    expect(receipt.parityCandidateAccepted).toBe(true);
  });

  it('writes a non-authorizing rejection receipt for local-file evidence', async () => {
    const receipt = await runFixture({ plugin: evidence({ fileKey: 'local-file' }), expectedExit: 2 });
    expect(receipt.pluginEvidence.traceableBuild).toBe(true);
    expect(receipt.pluginEvidence.realFigmaContext).toBe(false);
    expect(receipt.mismatchCount).toBe(0);
    expect(receipt.parityCandidateAccepted).toBe(false);
  });

  it('reports field-level mismatches and fails closed', async () => {
    const cli = buildReady();
    cli.score.score = 84;
    const receipt = await runFixture({ cli, expectedExit: 2 });
    expect(receipt.parityCandidateAccepted).toBe(false);
    expect(receipt.mismatchCount).toBeGreaterThan(0);
    expect(receipt.mismatches.some((item) => item.path === 'buildReady.score.score')).toBe(true);
  });

  it('rejects stale analyzer-v1 plugin evidence before writing a receipt', async () => {
    await runRejectedFixture({
      plugin: evidence({ analyzerVersion: 'p13-core-v1' }),
      stderr: /Plugin evidence Build-Ready analyzerVersion is unsupported: p13-core-v1\. Expected p13-core-v2/,
    });
  });

  it('rejects a forged analyzer-v2 runId before writing a receipt', async () => {
    const cli = buildReady();
    cli.runId = 'p13-forged-run';
    await runRejectedFixture({
      cli,
      stderr: /CLI report Build-Ready runId does not match exact structural\/config\/analyzer identity/,
    });
  });

  it('rejects analyzer mismatch instead of treating it as ordinary parity drift', async () => {
    const cli = buildReady('2026-09-12T00:00:00.000Z', 'p13-core-v3');
    await runRejectedFixture({
      cli,
      stderr: /CLI report Build-Ready analyzerVersion is unsupported: p13-core-v3\. Expected p13-core-v2/,
    });
  });

  it('keeps the offline analyzer constant aligned with the core identity contract', async () => {
    const [coreSource, intakeSource] = await Promise.all([
      readFile('src/core/build-ready-identity.ts', 'utf8'),
      readFile('scripts/p13-runtime-parity-intake.mjs', 'utf8'),
    ]);
    const coreVersion = coreSource.match(/BUILD_READY_ANALYZER_VERSION\s*=\s*'([^']+)'/)?.[1];
    const intakeVersion = intakeSource.match(/CURRENT_BUILD_READY_ANALYZER_VERSION\s*=\s*'([^']+)'/)?.[1];
    expect(coreVersion).toBeTruthy();
    expect(intakeVersion).toBe(coreVersion);
  });
});
