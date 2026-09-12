import { describe, expect, it } from 'vitest';
import {
  buildBuildReadyReport,
  serializeBuildReadyReportJson,
} from '../src/core/build-ready';
import { buildP14PreparationPlanFromBuildReady } from '../src/core/p13-p14-handoff';
import { analyzeSafePreparationCandidates } from '../src/core/safe-preparation-candidates';
import type { AuditNode } from '../src/core/types';

function node(overrides: Partial<AuditNode> = {}): AuditNode {
  const children = overrides.children ?? [];
  return {
    id: 'node',
    name: 'Container',
    type: 'FRAME',
    geometry: { x: 0, y: 0, width: 1000, height: 1000 },
    layoutMode: 'NONE',
    isAutoLayout: false,
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

function verticalStackRoot(overrides: Partial<AuditNode> = {}): AuditNode {
  const children = Array.from({ length: 10 }, (_, index) => node({
    id: `item-${index}`,
    name: `Content ${index + 1}`,
    geometry: { x: 100, y: index * 90, width: 800, height: 70 },
    children: [],
  }));
  return node({
    id: 'vertical-root',
    name: 'Vertical Content Stack',
    geometry: { x: 0, y: 0, width: 1000, height: 900 },
    children,
    ...overrides,
  });
}

function candidateFrom(report: ReturnType<typeof buildBuildReadyReport>) {
  return report.findings.find((finding) => finding.ruleId === 'BR_SAFE_VERTICAL_STACK_CANDIDATE');
}

describe('P13/P14 vertical-stack safe-preparation candidate', () => {
  it('emits a target-neutral zero-penalty candidate only from the accepted P5 vertical-stack plan', () => {
    const root = verticalStackRoot();
    const candidates = analyzeSafePreparationCandidates(root);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      ruleId: 'BR_SAFE_VERTICAL_STACK_CANDIDATE',
      ruleVersion: 1,
      category: 'STRUCTURE',
      severity: 'LOW',
      confidence: 90,
      nodeIds: ['vertical-root'],
      penalty: 0,
      remediationClass: 'P14_SAFE_CANDIDATE',
      targetAgnostic: true,
      evidence: {
        p5Decision: 'ELIGIBLE',
        p5ReasonCode: 'SUPPORTED_HIGH_CONFIDENCE',
        recipe: 'vertical-stack',
        pattern: 'vertical-stack',
        minConfidence: 90,
        targetNodeName: 'Vertical Content Stack',
        targetPath: '',
      },
    });
  });

  it('does not emit a candidate when the vertical target is already correctly structured', () => {
    const root = verticalStackRoot({
      layoutMode: 'VERTICAL',
      isAutoLayout: true,
    });

    expect(analyzeSafePreparationCandidates(root)).toEqual([]);
  });

  it('does not emit a candidate when the existing P5 role/refusal gate blocks the target', () => {
    const root = verticalStackRoot();
    const first = root.children[0];
    if (!first) throw new Error('Fixture must contain a first child.');
    first.absolutePositioned = true;

    expect(analyzeSafePreparationCandidates(root)).toEqual([]);
  });

  it('keeps the preparation opportunity score-neutral in the Build-Ready report', () => {
    const report = buildBuildReadyReport(verticalStackRoot(), {}, '2026-09-13T00:00:00.000Z');
    const candidate = candidateFrom(report);
    const structure = report.categories.find((category) => category.category === 'STRUCTURE');

    expect(candidate).toBeDefined();
    expect(candidate?.penalty).toBe(0);
    expect(candidate?.severity).toBe('LOW');
    expect(structure?.penaltiesApplied).toBe(18);
    expect(report.score.blockerCount).toBe(0);
  });

  it('emits deterministic candidate evidence and serialization for the same source', () => {
    const root = verticalStackRoot();
    const first = buildBuildReadyReport(root, {}, '2026-09-13T00:00:00.000Z');
    const second = buildBuildReadyReport(root, {}, '2026-09-14T00:00:00.000Z');

    expect(candidateFrom(first)).toEqual(candidateFrom(second));
    expect(first.runId).toBe(second.runId);
    expect(serializeBuildReadyReportJson(first)).toContain('BR_SAFE_VERTICAL_STACK_CANDIDATE');
  });

  it('keeps the candidate non-executable under the empty production P14 recipe registry', () => {
    const report = buildBuildReadyReport(verticalStackRoot(), {}, '2026-09-13T00:00:00.000Z');
    const result = buildP14PreparationPlanFromBuildReady(report);
    const action = result.plan?.actions.find((item) => item.sourceRuleId === 'BR_SAFE_VERTICAL_STACK_CANDIDATE');

    expect(result.handoff.valid).toBe(true);
    expect(result.handoff.acceptedCandidateCount).toBe(0);
    expect(action?.decision).toBe('REVIEW');
    expect(action?.refusalCode).toBe('P14_SAFE_BINDING_REQUIRED');
    expect(result.plan?.eligibleActionIds).toEqual([]);
    expect(result.plan?.status).toBe('BLOCKED');
  });
});
