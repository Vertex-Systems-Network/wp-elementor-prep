import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const cliSource = readFileSync(join(repoRoot, 'src/cli/index.ts'), 'utf8');
const pluginSource = readFileSync(join(repoRoot, 'src/plugin/main.ts'), 'utf8');
const uiSource = readFileSync(join(repoRoot, 'src/ui/ui.html'), 'utf8');

function auditNode(overrides = {}) {
  const children = overrides.children ?? [];
  return {
    id: '1:1',
    name: 'Frame',
    type: 'FRAME',
    geometry: { x: 0, y: 0, width: 1200, height: 800 },
    layoutMode: 'VERTICAL',
    isAutoLayout: true,
    isContainer: true,
    isText: false,
    isImageLike: false,
    isGenericName: false,
    textLength: 0,
    textAutoResize: null,
    absolutePositioned: false,
    clipsContent: false,
    opacity: 1,
    visible: true,
    ...overrides,
    children,
    childIds: children.map((child) => child.id),
  };
}

describe('P13 plugin + CLI Build-Ready integration', () => {
  it('binds both product paths to the same shared deterministic core', () => {
    expect(cliSource).toContain("buildBuildReadyReport(snapshot.root, {}, report.generatedAt)");
    expect(pluginSource).toContain("buildBuildReadyReport(root, {}, report.generatedAt)");
    expect(cliSource).toContain('serializeBuildReadyReportJson(buildReady)');
    expect(pluginSource).toContain('serializeBuildReadyReportJson(buildReady)');
  });

  it('retains audit v1/backlog outputs while adding a separate Build-Ready artifact', () => {
    expect(cliSource).toContain("'audit-report.json'");
    expect(cliSource).toContain("'audit-report.md'");
    expect(cliSource).toContain("'backlog.json'");
    expect(cliSource).toContain("'backlog.md'");
    expect(cliSource).toContain("'build-ready-report.json'");
    expect(cliSource).toContain('return thresholdExit(backlog, parseFailOn(args));');
  });

  it('exposes the separate Build-Ready JSON in the plugin UI without mutation authority', () => {
    expect(pluginSource).toContain("type: 'audit-result'");
    expect(pluginSource).toContain('buildReadyJson: serializeBuildReadyReportJson(buildReady)');
    expect(uiSource).toContain('export-build-ready-json');
    expect(uiSource).toContain("downloadText('build-ready-report.json', latestBuildReadyJson");
    expect(uiSource).toContain('P13 IMPLEMENTATION CANDIDATE');
    expect(uiSource).toContain('target-agnostic read-only analysis');
    expect(uiSource).not.toContain('P13 PRODUCTION ACCEPTED');
  });

  it('executes audit:snapshot and writes a versioned machine-readable Build-Ready report', () => {
    const dir = mkdtempSync(join(tmpdir(), 'wpep-p13-cli-'));
    try {
      const input = join(dir, 'snapshot.json');
      const out = join(dir, 'out');
      const copy = auditNode({
        id: '2:1',
        name: 'Hero Copy',
        type: 'TEXT',
        geometry: { x: 40, y: 40, width: 640, height: 120 },
        layoutMode: 'NONE',
        isAutoLayout: false,
        isContainer: false,
        isText: true,
        textLength: 48,
        textAutoResize: 'HEIGHT',
        children: [],
      });
      const image = auditNode({
        id: '2:2',
        name: 'Hero Image',
        type: 'RECTANGLE',
        geometry: { x: 720, y: 40, width: 400, height: 360 },
        layoutMode: 'NONE',
        isAutoLayout: false,
        isContainer: false,
        isImageLike: true,
        children: [],
      });
      const snapshot = {
        schemaVersion: 1,
        capturedAt: '2026-09-11T00:00:00.000Z',
        source: { kind: 'adapter-export', fileKey: 'P13FixtureFile', nodeId: '1:1' },
        root: auditNode({ id: '1:1', name: 'P13 Fixture', children: [copy, image] }),
      };
      writeFileSync(input, `${JSON.stringify(snapshot, null, 2)}\n`);

      const run = spawnSync(
        process.execPath,
        [join(repoRoot, 'scripts/run-cli.mjs'), 'audit:snapshot', '--input', input, '--out', out],
        { cwd: repoRoot, encoding: 'utf8', timeout: 60_000 },
      );

      expect(run.status, `${run.stderr}\n${run.stdout}`).toBe(0);
      expect(existsSync(join(out, 'audit-report.json'))).toBe(true);
      expect(existsSync(join(out, 'backlog.json'))).toBe(true);
      expect(existsSync(join(out, 'build-ready-report.json'))).toBe(true);

      const buildReady = JSON.parse(readFileSync(join(out, 'build-ready-report.json'), 'utf8'));
      expect(buildReady.buildReadyScoreVersion).toBe(2);
      expect(buildReady.responsiveRiskVersion).toBe(1);
      expect(buildReady.source.rootId).toBe('1:1');
      expect(buildReady.score.status).not.toBe('INSUFFICIENT_EVIDENCE');
      expect(buildReady.coverage.overallCoverage).toBe(1);

      const stdout = JSON.parse(run.stdout);
      expect(stdout.buildReady.buildReadyScoreVersion).toBe(2);
      expect(stdout.buildReady.responsiveRiskVersion).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
