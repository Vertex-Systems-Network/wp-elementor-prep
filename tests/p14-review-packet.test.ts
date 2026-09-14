import { describe, expect, it } from 'vitest';
import { buildBuildReadyReport } from '../src/core/build-ready';
import { buildAuditReport } from '../src/core/scoring';
import type { AuditNode } from '../src/core/types';
import { buildP13RuntimeEvidenceBundle } from '../src/plugin/p13-runtime-evidence';
import { buildP14PlanPreview } from '../src/plugin/p14-plan-preview';
import {
  buildP14ReviewPacket,
  serializeP14ReviewPacketJson,
} from '../src/plugin/p14-review-packet';

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

function fixture() {
  const root = node({
    children: [node({
      id: '2:1',
      name: 'Vertical Stack',
      geometry: { x: 0, y: 0, width: 1200, height: 400 },
      layoutMode: 'VERTICAL',
      children: [],
    })],
  });
  const capturedAt = '2026-09-14T10:50:00.000Z';
  const build = {
    sourceSha: '0123456789abcdef0123456789abcdef01234567',
    runId: '123456789',
    runNumber: '77',
  };
  const buildReady = buildBuildReadyReport(root, {}, capturedAt);
  const evidence = buildP13RuntimeEvidenceBundle({
    pluginVersion: '0.1.0-test',
    build,
    context: {
      fileKey: 'real-figma-file-key',
      pageId: '10:1',
      pageName: 'Landing',
      frameId: root.id,
      frameName: root.name,
    },
    audit: buildAuditReport(root, '0.1.0-test', capturedAt),
    buildReady,
    capturedAt,
  });
  const preview = buildP14PlanPreview(buildReady);
  return { build, evidence, preview };
}

describe('P14 deterministic review packet', () => {
  it('binds exact runtime, evidence, Figma context and analyzer identity without authority', () => {
    const { build, evidence, preview } = fixture();
    const packet = buildP14ReviewPacket({
      preview,
      evidence,
      pluginVersion: '0.1.0-test',
      runtimeBuild: build,
    });

    expect(packet.schemaVersion).toBe(1);
    expect(packet.packetVersion).toBe(1);
    expect(packet.acceptanceAuthority).toBe(false);
    expect(packet.targetCompatibilityClaim).toBe(false);
    expect(packet.mutationEnabled).toBe(false);
    expect(packet.confirmationEnabled).toBe(false);
    expect(packet.runtime).toEqual({ pluginVersion: '0.1.0-test', build });
    expect(packet.evidence.capturedAt).toBe('2026-09-14T10:50:00.000Z');
    expect(packet.context).toEqual({
      fileKey: 'real-figma-file-key',
      pageId: '10:1',
      pageName: 'Landing',
      frameId: '1:1',
      frameName: 'Desktop Original',
    });
    expect(packet.p13Identity).toEqual({
      runId: evidence.buildReady.runId,
      structuralHash: evidence.buildReady.source.structuralHash,
      configHash: evidence.buildReady.source.configHash,
      analyzerVersion: 'p13-core-v2',
    });
    expect(packet.preview.planDigest).toBe(preview.plan?.planDigest ?? null);
  });

  it('takes defensive snapshots and serializes deterministically', () => {
    const { build, evidence, preview } = fixture();
    const packet = buildP14ReviewPacket({
      preview,
      evidence,
      pluginVersion: '0.1.0-test',
      runtimeBuild: build,
    });
    const first = serializeP14ReviewPacketJson(packet);
    const second = serializeP14ReviewPacketJson(packet);

    evidence.context.pageName = 'Changed after packet';
    evidence.build.runNumber = '999';
    if (preview.reviewManifest?.actions[0]) {
      preview.reviewManifest.actions[0].targetNodeIds.push('forged:1');
    }

    expect(packet.context.pageName).toBe('Landing');
    expect(packet.evidence.build.runNumber).toBe('77');
    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
  });

  it('fails closed when runtime provenance no longer matches persisted evidence', () => {
    const { build, evidence, preview } = fixture();
    expect(() => buildP14ReviewPacket({
      preview,
      evidence,
      pluginVersion: '0.1.0-test',
      runtimeBuild: { ...build, runNumber: '78' },
    })).toThrow(/runtime build does not match persisted P13 evidence/);

    expect(() => buildP14ReviewPacket({
      preview,
      evidence,
      pluginVersion: '0.1.0-other',
      runtimeBuild: build,
    })).toThrow(/plugin version does not match persisted P13 evidence/);
  });
});
