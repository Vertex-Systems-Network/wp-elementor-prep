import { describe, expect, it } from 'vitest';
import { buildBuildReadyReport, serializeBuildReadyReportJson } from '../src/core/build-ready';
import {
  BUILD_READY_ANALYZER_VERSION,
  buildBuildReadyRunId,
  matchesCurrentBuildReadyRunIdentity,
} from '../src/core/build-ready-identity';
import { buildP13P14Handoff } from '../src/core/p13-p14-handoff';
import { buildAuditReport } from '../src/core/scoring';
import type { AuditNode } from '../src/core/types';
import {
  buildP13RuntimeEvidenceBundle,
  validateP13RuntimeEvidence,
} from '../src/plugin/p13-runtime-evidence';
import { compareP13PluginEvidenceToCli } from '../src/plugin/p13-runtime-parity';

function node(overrides: Partial<AuditNode> = {}): AuditNode {
  const children = overrides.children ?? [];
  return {
    id: 'identity:root',
    name: 'Identity Root',
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
    childIds: overrides.childIds ?? children.map((child) => child.id),
  };
}

function root(): AuditNode {
  return node({
    children: [
      node({
        id: 'identity:child',
        name: 'Content',
        geometry: { x: 0, y: 0, width: 1200, height: 300 },
      }),
    ],
  });
}

function runtimeEvidence() {
  const scene = root();
  const generatedAt = '2026-09-13T00:00:00.000Z';
  return buildP13RuntimeEvidenceBundle({
    pluginVersion: '0.1.0-test',
    build: {
      sourceSha: '0123456789abcdef0123456789abcdef01234567',
      runId: '123456789',
      runNumber: '42',
    },
    context: {
      fileKey: 'real-figma-file-key',
      pageId: '0:1',
      pageName: 'Page 1',
      frameId: scene.id,
      frameName: scene.name,
    },
    audit: buildAuditReport(scene, '0.1.0-test', generatedAt),
    buildReady: buildBuildReadyReport(scene, {}, generatedAt),
    capturedAt: '2026-09-13T00:01:00.000Z',
  });
}

describe('P13 analyzer-bound Build-Ready identity', () => {
  it('uses the current analyzer version in the deterministic run identity while ignoring generatedAt', () => {
    const scene = root();
    const first = buildBuildReadyReport(scene, {}, '2026-09-13T00:00:00.000Z');
    const second = buildBuildReadyReport(scene, {}, '2026-09-13T01:00:00.000Z');

    expect(first.source.analyzerVersion).toBe(BUILD_READY_ANALYZER_VERSION);
    expect(BUILD_READY_ANALYZER_VERSION).toBe('p13-core-v2');
    expect(first.runId).toBe(second.runId);
    expect(first.runId).toBe(buildBuildReadyRunId({
      structuralHash: first.source.structuralHash,
      configHash: first.source.configHash,
      analyzerVersion: first.source.analyzerVersion,
    }));
    expect(matchesCurrentBuildReadyRunIdentity({
      runId: first.runId,
      structuralHash: first.source.structuralHash,
      configHash: first.source.configHash,
      analyzerVersion: first.source.analyzerVersion,
    })).toBe(true);
  });

  it('uses the same analyzer-bound identity contract for insufficient-evidence reports', () => {
    const report = buildBuildReadyReport(node({
      id: 'identity:insufficient',
      layoutMode: 'UNKNOWN',
      geometry: { x: 0, y: 0, width: 0, height: 0 },
    }), {}, '2026-09-13T00:00:00.000Z');

    expect(report.score.status).toBe('INSUFFICIENT_EVIDENCE');
    expect(report.source.analyzerVersion).toBe(BUILD_READY_ANALYZER_VERSION);
    expect(matchesCurrentBuildReadyRunIdentity({
      runId: report.runId,
      structuralHash: report.source.structuralHash,
      configHash: report.source.configHash,
      analyzerVersion: report.source.analyzerVersion,
    })).toBe(true);
  });

  it('rejects stale v1 and contradictory run identities in persisted runtime evidence', () => {
    const stale = JSON.parse(JSON.stringify(runtimeEvidence())) as any;
    stale.buildReady.source.analyzerVersion = 'p13-core-v1';
    stale.buildReady.runId = `p13-${stale.buildReady.source.structuralHash}-${stale.buildReady.source.configHash}`;
    stale.buildReadyJson = serializeBuildReadyReportJson(stale.buildReady);
    expect(validateP13RuntimeEvidence(stale).reason).toContain('Unsupported Build-Ready analyzer version');

    const forged = JSON.parse(JSON.stringify(runtimeEvidence())) as any;
    forged.buildReady.runId = 'p13-forged-current-analyzer-run';
    forged.buildReadyJson = serializeBuildReadyReportJson(forged.buildReady);
    expect(validateP13RuntimeEvidence(forged).reason).toContain('source/config/analyzer identity');
  });

  it('rejects stale analyzer evidence before P13-to-P14 planning', () => {
    const current = buildBuildReadyReport(root(), {}, '2026-09-13T00:00:00.000Z');
    const stale = JSON.parse(JSON.stringify(current)) as typeof current;
    stale.source.analyzerVersion = 'p13-core-v1';
    stale.runId = `p13-${stale.source.structuralHash}-${stale.source.configHash}`;

    const result = buildP13P14Handoff(stale);
    expect(result.valid).toBe(false);
    expect(result.failures.some((failure) => failure.includes('Unsupported Build-Ready analyzer version'))).toBe(true);
    expect(result.failures.some((failure) => failure.includes('source/config/analyzer fingerprint binding'))).toBe(true);
  });

  it('treats analyzer version as part of plugin/CLI parity run identity', () => {
    const evidence = runtimeEvidence();
    const cli = JSON.parse(JSON.stringify(evidence.buildReady)) as typeof evidence.buildReady;
    cli.source.analyzerVersion = 'p13-core-v1';

    const assessment = compareP13PluginEvidenceToCli(evidence, cli);
    expect(assessment.sameRunIdentity).toBe(false);
    expect(assessment.parityCandidateAccepted).toBe(false);
    expect(assessment.mismatches.some((item) => item.path === 'buildReady.runIdentity')).toBe(true);
    expect(assessment.mismatches.some((item) => item.path === 'buildReady.source.analyzerVersion')).toBe(true);
  });
});
