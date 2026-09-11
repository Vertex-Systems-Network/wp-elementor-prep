import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const roots = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

function buildReady(generatedAt = '2026-09-12T00:00:00.000Z') {
  return {
    schemaVersion: 1,
    buildReadyScoreVersion: 2,
    responsiveRiskVersion: 1,
    runId: 'p13-aaaaaaaa-bbbbbbbb',
    generatedAt,
    source: {
      rootId: '3434:8258',
      rootName: 'Desktop — Original',
      structuralHash: 'aaaaaaaa',
      configHash: 'bbbbbbbb',
      analyzerVersion: 'p13-core-v1',
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
}

function evidence({ fileKey = '01SIsqGVDm32KsaZnxHPR9', traceable = true } = {}) {
  const report = buildReady('2026-09-12T00:00:01.000Z');
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

async function runFixture({ plugin = evidence(), cli = buildReady(), expectedExit = 0 } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'p13-parity-'));
  roots.push(root);
  const pluginPath = join(root, 'plugin.json');
  const cliPath = join(root, 'build-ready-report.json');
  const outPath = join(root, 'receipt.json');
  await writeFile(pluginPath, `${JSON.stringify(plugin, null, 2)}\n`);
  await writeFile(cliPath, `${JSON.stringify(cli, null, 2)}\n`);

  const result = spawnSync(process.execPath, [
    'scripts/p13-runtime-parity-intake.mjs',
    `--plugin-evidence=${pluginPath}`,
    `--cli-report=${cliPath}`,
    `--out=${outPath}`,
  ], { cwd: process.cwd(), encoding: 'utf8' });

  expect(result.status).toBe(expectedExit);
  return JSON.parse(await readFile(outPath, 'utf8'));
}

describe('P13 runtime parity intake CLI', () => {
  it('accepts exact semantic parity from a traceable real-Figma plugin run', async () => {
    const receipt = await runFixture();
    expect(receipt.gate).toBe('p13-runtime-plugin-cli-parity');
    expect(receipt.acceptanceAuthority).toBe(false);
    expect(receipt.productionAcceptance).toBe(false);
    expect(receipt.pluginEvidence.traceableBuild).toBe(true);
    expect(receipt.pluginEvidence.realFigmaContext).toBe(true);
    expect(receipt.sameRunIdentity).toBe(true);
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
});
