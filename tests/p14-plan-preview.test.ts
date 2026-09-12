import { describe, expect, it } from 'vitest';
import { buildBuildReadyReport } from '../src/core/build-ready';
import type { AuditNode } from '../src/core/types';
import { buildP14PlanPreview } from '../src/plugin/p14-plan-preview';

function node(overrides: Partial<AuditNode> = {}): AuditNode {
  const children = overrides.children ?? [];
  return {
    id: '1:1',
    name: 'Preview Root',
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

function buildReportWithSafeCandidate() {
  const cards = Array.from({ length: 4 }, (_, index) => node({
    id: `card:${index}`,
    name: `Card ${index + 1}`,
    geometry: { x: index * 260, y: 0, width: 240, height: 220 },
    layoutMode: 'VERTICAL',
    children: [],
  }));
  const root = node({
    id: 'preview:root',
    children: [node({
      id: 'preview:row',
      name: 'Feature Row',
      geometry: { x: 0, y: 0, width: 1200, height: 240 },
      layoutMode: 'HORIZONTAL',
      children: cards,
    })],
  });
  const report = buildBuildReadyReport(root, {}, '2026-09-13T00:00:00.000Z');
  report.findings.push({
    id: 'preview-safe-candidate',
    ruleId: 'P14_PREVIEW_UNREGISTERED_RULE',
    ruleVersion: 1,
    category: 'STRUCTURE',
    relatedCategories: ['HANDOFF_READINESS'],
    severity: 'MEDIUM',
    confidence: 99,
    title: 'Synthetic safe candidate for preview contract',
    detail: 'The production P14 registry is intentionally empty, so this must remain review-only.',
    nodeIds: ['preview:row'],
    evidence: { synthetic: true },
    penalty: 0,
    remediationClass: 'P14_SAFE_CANDIDATE',
    targetAgnostic: true,
  });
  return report;
}

describe('P14 Guided Prepare plan preview', () => {
  it('is explicitly read-only and non-authorizing', () => {
    const preview = buildP14PlanPreview(buildReportWithSafeCandidate());

    expect(preview.acceptanceAuthority).toBe(false);
    expect(preview.targetCompatibilityClaim).toBe(false);
    expect(preview.mutationEnabled).toBe(false);
    expect(preview.confirmationEnabled).toBe(false);
    expect(preview.handoff.valid).toBe(true);
    expect(preview.plan).not.toBeNull();
    expect(preview.reviewManifest).not.toBeNull();
    expect(preview.reviewManifest).toMatchObject({
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
      mutationEnabled: false,
      confirmationEnabled: false,
    });
  });

  it('binds the review manifest to the exact preview plan without creating confirmation authority', () => {
    const preview = buildP14PlanPreview(buildReportWithSafeCandidate());
    expect(preview.plan).not.toBeNull();
    expect(preview.reviewManifest).not.toBeNull();

    expect(preview.reviewManifest?.binding).toEqual({
      p13RunId: preview.plan?.p13RunId,
      source: preview.plan?.source,
      planDigest: preview.plan?.planDigest,
      eligibleActionIds: preview.plan?.eligibleActionIds,
    });
    expect(preview.reviewManifest?.actions).toEqual([]);
    expect(preview.confirmationEnabled).toBe(false);
  });

  it('keeps an unregistered safe candidate review-only under the empty production registry', () => {
    const preview = buildP14PlanPreview(buildReportWithSafeCandidate());
    const action = preview.plan?.actions.find((item) => item.findingId === 'preview-safe-candidate');

    expect(action?.decision).toBe('REVIEW');
    expect(action?.refusalCode).toBe('P14_SAFE_BINDING_REQUIRED');
    expect(preview.summary.eligible).toBe(0);
    expect(preview.summary.review).toBeGreaterThan(0);
    expect(preview.plan?.status).toBe('BLOCKED');
  });

  it('fails closed for malformed Build-Ready evidence without granting controls', () => {
    expect(() => buildP14PlanPreview(null)).not.toThrow();
    const preview = buildP14PlanPreview(null);

    expect(preview.handoff.valid).toBe(false);
    expect(preview.plan).toBeNull();
    expect(preview.reviewManifest).toBeNull();
    expect(preview.summary.status).toBe('INVALID_HANDOFF');
    expect(preview.mutationEnabled).toBe(false);
    expect(preview.confirmationEnabled).toBe(false);
  });

  it('produces deterministic plan and review identity for the same current Build-Ready evidence', () => {
    const report = buildReportWithSafeCandidate();
    const first = buildP14PlanPreview(report);
    const second = buildP14PlanPreview(report);

    expect(first.summary).toEqual(second.summary);
    expect(first.plan?.planDigest).toBe(second.plan?.planDigest);
    expect(first.plan?.actions).toEqual(second.plan?.actions);
    expect(first.reviewManifest).toEqual(second.reviewManifest);
  });
});
