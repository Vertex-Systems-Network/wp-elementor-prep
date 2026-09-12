import { describe, expect, it } from 'vitest';
import { buildBuildReadyReport } from '../src/core/build-ready';
import { buildAuditReport } from '../src/core/scoring';
import type { AuditNode } from '../src/core/types';
import { buildP13RuntimeEvidenceBundle } from '../src/plugin/p13-runtime-evidence';
import { buildP13RuntimeEvidenceViewerHtml } from '../src/plugin/p13-runtime-evidence-viewer';

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

function bundle() {
  const root = node({
    children: [node({
      id: '2:1',
      name: 'Feature Row',
      layoutMode: 'HORIZONTAL',
      geometry: { x: 0, y: 0, width: 1200, height: 200 },
      children: [],
    })],
  });
  const generatedAt = '2026-09-13T00:00:00.000Z';
  const audit = buildAuditReport(root, '0.1.0-test', generatedAt);
  const buildReady = buildBuildReadyReport(root, {}, generatedAt);
  buildReady.findings.push({
    id: 'viewer-safe-candidate',
    ruleId: 'P14_VIEWER_UNREGISTERED_RULE',
    ruleVersion: 1,
    category: 'STRUCTURE',
    relatedCategories: ['HANDOFF_READINESS'],
    severity: 'MEDIUM',
    confidence: 99,
    title: 'Viewer safe candidate',
    detail: 'Must remain review-only while production recipe authority is empty.',
    nodeIds: ['2:1'],
    evidence: { synthetic: true },
    penalty: 0,
    remediationClass: 'P14_SAFE_CANDIDATE',
    targetAgnostic: true,
  });

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
      frameId: root.id,
      frameName: root.name,
    },
    audit,
    buildReady,
    capturedAt: generatedAt,
  });
}

describe('P14 runtime preview in persisted P13 evidence viewer', () => {
  it('renders the target-neutral Guided Prepare plan as locked read-only evidence', () => {
    const html = buildP13RuntimeEvidenceViewerHtml(bundle());

    expect(html).toContain('P14 Guided Prepare Preview');
    expect(html).toContain('READ-ONLY / LOCKED');
    expect(html).toContain('acceptanceAuthority=false');
    expect(html).toContain('targetCompatibilityClaim=false');
    expect(html).toContain('mutationEnabled=false');
    expect(html).toContain('confirmationEnabled=false');
    expect(html).toContain('Copy P14 plan preview JSON');
  });

  it('shows unregistered production recipes as review-only instead of executable controls', () => {
    const html = buildP13RuntimeEvidenceViewerHtml(bundle());

    expect(html).toContain('Review only');
    expect(html).toContain('P14_SAFE_BINDING_REQUIRED');
    expect(html).not.toContain('Create Prepared Duplicate');
    expect(html).not.toContain('Apply this P14');
  });

  it('keeps genuinely empty evidence fail-closed without fabricating a rejection reason or P14 plan', () => {
    const html = buildP13RuntimeEvidenceViewerHtml(null, {
      status: 'EMPTY',
      evidence: null,
      reason: null,
    });

    expect(html).toContain('No persisted P13 runtime evidence');
    expect(html).not.toContain('P13 Runtime Evidence Unavailable');
    expect(html).not.toContain('P14 Guided Prepare Preview');
  });

  it('shows the exact bounded rejection status/reason for stale or invalid persisted evidence', () => {
    const html = buildP13RuntimeEvidenceViewerHtml(null, {
      status: 'INVALID',
      evidence: null,
      reason: 'Unsupported Build-Ready analyzer version; expected p13-core-v2.',
    });

    expect(html).toContain('P13 Runtime Evidence Unavailable');
    expect(html).toContain('INVALID');
    expect(html).toContain('Unsupported Build-Ready analyzer version; expected p13-core-v2.');
    expect(html).toContain('Run Audit on exactly one current Frame');
    expect(html).not.toContain('P14 Guided Prepare Preview');
  });
});
