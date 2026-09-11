import { describe, expect, it } from 'vitest';
import { buildBuildReadyReport } from '../src/core/build-ready';
import { buildAuditReport } from '../src/core/scoring';
import type { AuditNode } from '../src/core/types';
import {
  P13_RUNTIME_EVIDENCE_STORAGE_KEY,
  buildP13RuntimeEvidenceBundle,
  isTraceableP13BuildIdentity,
  serializeP13RuntimeEvidenceJson,
  validateP13RuntimeEvidence,
  type P13RuntimeEvidenceBundle,
} from '../src/plugin/p13-runtime-evidence';
import {
  loadLatestP13RuntimeEvidence,
  persistP13RuntimeEvidenceBestEffort,
  type P13RuntimeEvidenceClientStorage,
} from '../src/plugin/p13-runtime-evidence-storage';
import { compareP13PluginEvidenceToCli } from '../src/plugin/p13-runtime-parity';

function node(overrides: Partial<AuditNode> = {}): AuditNode {
  const children = overrides.children ?? [];
  return {
    id: '1:1',
    name: 'Desktop Original',
    type: 'FRAME',
    geometry: { x: 0, y: 0, width: 1200, height: 900 },
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

function reports(generatedAt = '2026-09-11T00:00:00.000Z') {
  const root = node({
    children: [
      node({
        id: '2:1',
        name: 'Feature Row',
        layoutMode: 'HORIZONTAL',
        geometry: { x: 0, y: 0, width: 1200, height: 200 },
        children: [],
      }),
    ],
  });
  return {
    audit: buildAuditReport(root, '0.1.0-test', generatedAt),
    buildReady: buildBuildReadyReport(root, {}, generatedAt),
    root,
  };
}

function evidence(buildSourceSha = '0123456789abcdef0123456789abcdef01234567'): P13RuntimeEvidenceBundle {
  const { audit, buildReady, root } = reports();
  return buildP13RuntimeEvidenceBundle({
    pluginVersion: '0.1.0-test',
    build: { sourceSha: buildSourceSha, runId: '123456789', runNumber: '42' },
    context: {
      fileKey: 'file-key',
      pageId: '0:1',
      pageName: 'Page 1',
      frameId: root.id,
      frameName: root.name,
    },
    audit,
    buildReady,
    capturedAt: '2026-09-11T01:00:00.000Z',
  });
}

class MemoryStorage implements P13RuntimeEvidenceClientStorage {
  readonly values = new Map<string, unknown>();
  async getAsync(key: string): Promise<unknown> { return this.values.get(key); }
  async setAsync(key: string, value: unknown): Promise<void> { this.values.set(key, value); }
}

describe('P13 plugin runtime evidence', () => {
  it('binds a read-only evidence bundle to exact runtime/build/frame context', () => {
    const bundle = evidence();
    expect(bundle.schemaVersion).toBe(1);
    expect(bundle.acceptanceAuthority).toBe(false);
    expect(bundle.traceableBuild).toBe(true);
    expect(bundle.context.frameId).toBe('1:1');
    expect(bundle.buildReady.runId).toMatch(/^p13-/);
    expect(bundle.buildReadyJson).toContain('"buildReadyScoreVersion": 2');
    expect(validateP13RuntimeEvidence(bundle)).toEqual({ valid: true, reason: null });
    expect(serializeP13RuntimeEvidenceJson(bundle).endsWith('\n')).toBe(true);
  });

  it('distinguishes traceable CI identities from local/untraceable builds', () => {
    expect(isTraceableP13BuildIdentity({
      sourceSha: '0123456789abcdef0123456789abcdef01234567',
      runId: '123',
      runNumber: '9',
    })).toBe(true);
    expect(isTraceableP13BuildIdentity({ sourceSha: 'local', runId: 'local', runNumber: 'local' })).toBe(false);
    expect(evidence('local').traceableBuild).toBe(false);
  });

  it('fails closed on contradictory authority, frame identity, serialized report or oversized evidence', () => {
    const authority = JSON.parse(JSON.stringify(evidence())) as Record<string, unknown>;
    authority.acceptanceAuthority = true;
    expect(validateP13RuntimeEvidence(authority).valid).toBe(false);

    const frame = JSON.parse(JSON.stringify(evidence())) as any;
    frame.context.frameId = 'wrong-frame';
    expect(validateP13RuntimeEvidence(frame).reason).toContain('source identity');

    const serialized = JSON.parse(JSON.stringify(evidence())) as any;
    serialized.buildReadyJson = '{}\n';
    expect(validateP13RuntimeEvidence(serialized).reason).toContain('contradicts');

    const oversized = evidence();
    oversized.pluginVersion = 'x'.repeat(520_000);
    expect(validateP13RuntimeEvidence(oversized).reason).toContain('byte bound');
  });

  it('persists and reloads only valid bounded evidence', async () => {
    const storage = new MemoryStorage();
    const bundle = evidence();
    const result = await persistP13RuntimeEvidenceBestEffort(storage, bundle);
    expect(result.persisted).toBe(true);
    expect(result.byteLength).toBeGreaterThan(0);
    expect(storage.values.has(P13_RUNTIME_EVIDENCE_STORAGE_KEY)).toBe(true);
    expect(await loadLatestP13RuntimeEvidence(storage)).toEqual(bundle);

    storage.values.set(P13_RUNTIME_EVIDENCE_STORAGE_KEY, { schemaVersion: 999 });
    expect(await loadLatestP13RuntimeEvidence(storage)).toBeNull();
  });

  it('accepts semantic plugin/CLI parity when only generatedAt differs', () => {
    const bundle = evidence();
    const { buildReady: cli } = reports('2026-09-12T12:34:56.000Z');
    const assessment = compareP13PluginEvidenceToCli(bundle, cli);
    expect(assessment.acceptanceAuthority).toBe(false);
    expect(assessment.parityCandidateAccepted).toBe(true);
    expect(assessment.sameRunIdentity).toBe(true);
    expect(assessment.mismatches).toEqual([]);
  });

  it('reports field-level semantic mismatches and refuses untraceable parity candidates', () => {
    const bundle = evidence();
    const { buildReady } = reports('2026-09-12T12:34:56.000Z');
    const changed = JSON.parse(JSON.stringify(buildReady)) as typeof buildReady;
    changed.score.score = (changed.score.score ?? 0) - 1;
    const mismatch = compareP13PluginEvidenceToCli(bundle, changed);
    expect(mismatch.parityCandidateAccepted).toBe(false);
    expect(mismatch.mismatches.some((item) => item.path === 'buildReady.score.score')).toBe(true);

    const localBundle = evidence('local');
    const exact = compareP13PluginEvidenceToCli(localBundle, buildReady);
    expect(exact.mismatchCount).toBe(0);
    expect(exact.traceablePluginBuild).toBe(false);
    expect(exact.parityCandidateAccepted).toBe(false);
  });
});
