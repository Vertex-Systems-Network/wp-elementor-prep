import { describe, expect, it } from 'vitest';
import {
  generateBacklog,
  serializeBacklogJson,
  serializeBacklogMarkdown,
  type BacklogDocument,
} from '../src/core/backlog';
import type { AuditReport, AuditStats, SectionAudit } from '../src/core/types';

const STATS: AuditStats = {
  nodes: 10,
  containers: 5,
  autoLayoutContainers: 2,
  manualContainers: 3,
  autoLayoutCoveragePct: 40,
  textNodes: 3,
  autoHeightTextNodes: 1,
  genericNames: 1,
  absolutePositionedNodes: 0,
  imageLikeNodes: 1,
};

function section(id: string, name: string): SectionAudit {
  return {
    id,
    name,
    score: 62,
    status: 'NEEDS_WORK',
    stats: STATS,
    findings: [{
      code: 'TEXT_REFLOW_RISK',
      severity: 'warning',
      title: 'Text sizing may create reflow risk',
      detail: 'Fixed text requires review.',
      evidence: { textNodes: 3, autoHeightTextNodes: 1 },
    }],
    detection: {
      pattern: 'vertical-stack',
      confidence: 91,
      targetNodeId: `${id}-target`,
      targetNodeName: 'Content stack',
      evidence: { childCount: 4 },
      semanticHint: 'repeated-cards',
    },
    detections: [{
      pattern: 'vertical-stack',
      confidence: 91,
      targetNodeId: `${id}-target`,
      targetNodeName: 'Content stack',
      evidence: { childCount: 4 },
      semanticHint: 'repeated-cards',
    }],
    roleDetections: [],
    recommendedRecipe: 'Wrap repeated items in a vertical Auto Layout container.',
  };
}

function report(sections = [section('section-a', 'Cards A'), section('section-b', 'Cards B')]): AuditReport {
  return {
    schemaVersion: 1,
    pluginVersion: '0.1.0-alpha.1',
    root: { id: 'frame-1', name: 'Desktop', width: 1440, height: 5000 },
    score: 62,
    status: 'NEEDS_WORK',
    stats: STATS,
    findings: [{
      code: 'LOW_AUTO_LAYOUT_COVERAGE',
      severity: 'error',
      title: 'Normal layout is likely too manual',
      detail: 'Manual layout screening signal.',
      evidence: { autoLayoutCoveragePct: 40, manualContainers: 3 },
    }],
    sections,
    generatedAt: '2026-09-10T00:00:00.000Z',
  };
}

describe('P9 actionable backlog', () => {
  it('maps audit findings and recipe opportunities into required categories', () => {
    const backlog = generateBacklog(report(), {
      context: { fileKey: 'file-key', pageId: 'page-1', pageName: 'Home' },
    });

    expect(backlog.schemaVersion).toBe(1);
    expect(backlog.summary.byCategory.ERROR).toBe(1);
    expect(backlog.summary.byCategory.WARNING).toBe(1);
    expect(backlog.summary.byCategory.IMPROVEMENT).toBe(1);
    expect(backlog.summary.byCategory.INFO).toBe(0);

    const error = backlog.items.find((item) => item.category === 'ERROR');
    expect(error).toMatchObject({ priority: 'P1', severity: 'HIGH', autoFixEligible: false });
    expect(error?.contexts[0]).toMatchObject({ fileKey: 'file-key', pageId: 'page-1', frameId: 'frame-1' });

    const improvement = backlog.items.find((item) => item.category === 'IMPROVEMENT');
    expect(improvement).toMatchObject({
      code: 'ELEMENTOR_RECIPE_CANDIDATE',
      recipeCandidate: 'Wrap repeated items in a vertical Auto Layout container.',
      confidence: 91,
      autoFixEligible: false,
    });
  });

  it('deduplicates repeated semantic findings across section ids and retains occurrence contexts', () => {
    const backlog = generateBacklog(report());
    const warning = backlog.items.find((item) => item.code === 'TEXT_REFLOW_RISK');
    const improvement = backlog.items.find((item) => item.code === 'ELEMENTOR_RECIPE_CANDIDATE');

    expect(warning?.occurrences).toBe(2);
    expect(warning?.contexts.map((context) => context.sectionId)).toEqual(['section-a', 'section-b']);
    expect(warning?.evidence).toHaveLength(2);

    expect(improvement?.occurrences).toBe(2);
    expect(improvement?.contexts).toHaveLength(2);
  });

  it('keeps fingerprints stable when only volatile node and section ids change', () => {
    const first = generateBacklog(report([section('section-a', 'Cards A')]));
    const second = generateBacklog(report([section('different-section-id', 'Cards renamed instance')]));

    const firstWarning = first.items.find((item) => item.code === 'TEXT_REFLOW_RISK');
    const secondWarning = second.items.find((item) => item.code === 'TEXT_REFLOW_RISK');
    const firstImprovement = first.items.find((item) => item.code === 'ELEMENTOR_RECIPE_CANDIDATE');
    const secondImprovement = second.items.find((item) => item.code === 'ELEMENTOR_RECIPE_CANDIDATE');

    expect(secondWarning?.fingerprint).toBe(firstWarning?.fingerprint);
    expect(secondImprovement?.fingerprint).toBe(firstImprovement?.fingerprint);
    expect(secondImprovement?.id).toBe(firstImprovement?.id);
    expect(firstWarning?.fingerprint).toMatch(/^p9-[0-9a-f]{16}$/);
  });

  it('reports NEW, RESOLVED, REGRESSED and UNCHANGED across runs', () => {
    const first = generateBacklog(report([section('section-a', 'Cards')]));
    const firstWarning = first.items.find((item) => item.code === 'TEXT_REFLOW_RISK');
    expect(firstWarning?.delta).toBe('NEW');

    const withoutSection = generateBacklog(report([]), { previous: first });
    const resolved = withoutSection.items.find((item) => item.code === 'TEXT_REFLOW_RISK');
    expect(resolved).toMatchObject({ status: 'RESOLVED', delta: 'RESOLVED', occurrences: 0 });
    expect(withoutSection.summary.byDelta.RESOLVED).toBeGreaterThan(0);

    const reappeared = generateBacklog(report([section('section-c', 'Cards')]), { previous: withoutSection });
    const regressed = reappeared.items.find((item) => item.code === 'TEXT_REFLOW_RISK');
    expect(regressed).toMatchObject({ status: 'REGRESSED', delta: 'REGRESSED' });

    const unchanged = generateBacklog(report([section('section-d', 'Cards')]), { previous: reappeared });
    const current = unchanged.items.find((item) => item.code === 'TEXT_REFLOW_RISK');
    expect(current).toMatchObject({ status: 'OPEN', delta: 'UNCHANGED' });
    expect(current?.firstSeen).toBe(first.generatedAt);
  });

  it('retains resolved history across multiple clean runs so later return is REGRESSED', () => {
    const first = generateBacklog(report([section('section-a', 'Cards')]));
    const resolvedOnce = generateBacklog(report([]), { previous: first });
    const stillClean = generateBacklog(report([]), { previous: resolvedOnce });
    const retained = stillClean.items.find((item) => item.code === 'TEXT_REFLOW_RISK');

    expect(retained).toMatchObject({ status: 'RESOLVED', delta: 'UNCHANGED', occurrences: 0 });
    expect(stillClean.summary.active).toBe(1); // Root-level LOW_AUTO_LAYOUT_COVERAGE remains active.

    const returned = generateBacklog(report([section('section-z', 'Cards')]), { previous: stillClean });
    expect(returned.items.find((item) => item.code === 'TEXT_REFLOW_RISK')).toMatchObject({
      status: 'REGRESSED',
      delta: 'REGRESSED',
    });
  });

  it('preserves ACCEPTED_RISK for a finding that remains present', () => {
    const first = generateBacklog(report([section('section-a', 'Cards')]));
    const warning = first.items.find((item) => item.code === 'TEXT_REFLOW_RISK');
    if (!warning) throw new Error('warning fixture missing');

    const previous: BacklogDocument = {
      ...first,
      items: first.items.map((item) => item.fingerprint === warning.fingerprint
        ? { ...item, status: 'ACCEPTED_RISK' }
        : item),
    };
    const next = generateBacklog(report([section('section-b', 'Cards')]), { previous });
    expect(next.items.find((item) => item.fingerprint === warning.fingerprint)).toMatchObject({
      status: 'ACCEPTED_RISK',
      delta: 'UNCHANGED',
    });
  });

  it('accepts generic runtime findings through the same deterministic model', () => {
    const backlog = generateBacklog(report([]), {
      runtimeFindings: [{
        code: 'RUNTIME_CHECKPOINT_LEAK',
        title: 'Checkpoint cleanup failed',
        explanation: 'A runtime checkpoint remained after a transaction.',
        proposedAction: 'Block release and inspect transaction cleanup.',
        evidence: { leftovers: 1 },
        context: { nodeId: 'runtime-node', nodeName: 'Candidate' },
      }],
    });
    expect(backlog.items.find((item) => item.code === 'RUNTIME_CHECKPOINT_LEAK')).toMatchObject({
      category: 'ERROR',
      source: 'RUNTIME',
      autoFixEligible: false,
    });
  });

  it('serializes deterministic JSON and readable Markdown', () => {
    const backlog = generateBacklog(report([section('section-a', 'Cards')]));
    const json = serializeBacklogJson(backlog);
    const markdown = serializeBacklogMarkdown(backlog);

    expect(json).toBe(serializeBacklogJson(backlog));
    expect(JSON.parse(json)).toEqual(backlog);
    expect(markdown).toContain('# Elementor Prep Backlog');
    expect(markdown).toContain('| ID | Category | Priority | Status | Delta | Code | Occurrences | Title | Proposed action |');
    expect(markdown).toContain('ELEMENTOR_RECIPE_CANDIDATE');
    expect(markdown).toBe(serializeBacklogMarkdown(backlog));
  });
});
