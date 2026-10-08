import { describe, expect, it } from 'vitest';
import { buildBuildReadyReport, computeBuildReadyContentHash, computeBuildReadyStructuralHash } from '../src/core/build-ready';
import { scanSceneNode } from '../src/core/scanner';
import { assessP14PreviewFreshness } from '../src/plugin/p14-preview-freshness';
import { compareP13PluginEvidenceToCli, normalizeBuildReadyForParity } from '../src/plugin/p13-runtime-parity';

const BUILD = { sourceSha: 'a'.repeat(40), runId: '1', runNumber: '1' };

function textNode(characters: string, color = { r: 0, g: 0, b: 0 }): Record<string, unknown> {
  return {
    id: '1:3', name: 'Title', type: 'TEXT', visible: true, x: 0, y: 0, width: 200, height: 40,
    characters, textAutoResize: 'HEIGHT', opacity: 1,
    fills: [{ type: 'SOLID', visible: true, color }],
    fontName: { family: 'Inter', style: 'Bold' }, fontSize: 32,
  };
}

function frame(text: Record<string, unknown>, extra: Record<string, unknown> = {}): SceneNode {
  return {
    id: '1:2', name: 'Hero', type: 'FRAME', visible: true, x: 0, y: 0, width: 1200, height: 600,
    layoutMode: 'VERTICAL', opacity: 1, clipsContent: false, fills: [], effects: [],
    children: [text], ...extra,
  } as unknown as SceneNode;
}

function freshness(before: SceneNode, after: SceneNode) {
  const persisted = buildBuildReadyReport(scanSceneNode(before));
  const current = buildBuildReadyReport(scanSceneNode(after));
  return assessP14PreviewFreshness({ pluginVersion: '1', build: BUILD, buildReady: persisted }, current, '1', BUILD);
}

describe('recovery M0.8 — Build-Ready visual-content freshness', () => {
  it('keeps the structural hash parity-stable but detects a same-length text edit as stale', () => {
    const before = frame(textNode('Welcome'));
    const after = frame(textNode('Wolcome'));
    expect(computeBuildReadyStructuralHash(scanSceneNode(before))).toBe(computeBuildReadyStructuralHash(scanSceneNode(after)));
    expect(computeBuildReadyContentHash(scanSceneNode(before))).not.toBe(computeBuildReadyContentHash(scanSceneNode(after)));
    const result = freshness(before, after);
    expect(result.valid).toBe(false);
    expect(result.failures.join(' ')).toMatch(/content changed/);
  });

  it('detects colour, font and effect edits and accepts an unchanged frame', () => {
    expect(freshness(frame(textNode('Welcome')), frame(textNode('Welcome', { r: 1, g: 0, b: 0 }))).valid).toBe(false);
    expect(freshness(frame(textNode('Welcome')), frame({ ...textNode('Welcome'), fontName: { family: 'Inter', style: 'Regular' } })).valid).toBe(false);
    expect(freshness(frame(textNode('Welcome')), frame(textNode('Welcome'), { effects: [{ type: 'DROP_SHADOW', visible: true }] })).valid).toBe(false);
    expect(freshness(frame(textNode('Welcome')), frame(textNode('Welcome')))).toEqual({ valid: true, failures: [] });
  });

  it('treats persisted evidence without a content hash as stale for a plugin scan', () => {
    const current = buildBuildReadyReport(scanSceneNode(frame(textNode('Welcome'))));
    const legacy = JSON.parse(JSON.stringify(current));
    delete legacy.source.contentHash;
    const result = assessP14PreviewFreshness({ pluginVersion: '1', build: BUILD, buildReady: legacy }, current, '1', BUILD);
    expect(result.valid).toBe(false);
    expect(result.failures.join(' ')).toMatch(/predates visual-content fingerprinting/);
  });

  it('excludes the plugin-only content hash from P13 REST/CLI parity', () => {
    const plugin = buildBuildReadyReport(scanSceneNode(frame(textNode('Welcome'))), {}, '2026-10-08T00:00:00.000Z');
    expect(plugin.source.contentHash).toMatch(/^content-/);
    const cli = JSON.parse(JSON.stringify(plugin));
    delete cli.source.contentHash;
    expect(normalizeBuildReadyForParity(plugin)).toEqual(normalizeBuildReadyForParity(cli));
    const evidence = { buildReady: plugin } as unknown as Parameters<typeof compareP13PluginEvidenceToCli>[0];
    expect(compareP13PluginEvidenceToCli(evidence, cli).mismatches).toEqual([]);
  });
});
