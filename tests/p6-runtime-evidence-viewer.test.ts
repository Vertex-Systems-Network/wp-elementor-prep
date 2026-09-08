import { describe, expect, it } from 'vitest';
import type { P6RuntimeEvidenceBundle } from '../src/plugin/p6-runtime-evidence';
import { buildP6RuntimeEvidenceViewerHtml } from '../src/plugin/p6-runtime-evidence-viewer';
import { P6_TEST_BUILD, P6_TEST_PROOF_PASSED_AT } from './p6-provenance-fixture';

function evidence(overrides: Partial<P6RuntimeEvidenceBundle> = {}): P6RuntimeEvidenceBundle {
  return {
    schemaVersion: 2,
    capturedAt: '2026-09-08T01:00:00.000Z',
    pluginVersion: '0.1.0-alpha.1',
    build: { ...P6_TEST_BUILD },
    p5RuntimeGateVersion: 'p5-runtime-proof-v3',
    p5RuntimeProofPassedAt: P6_TEST_PROOF_PASSED_AT,
    p5RuntimeProofBuild: { ...P6_TEST_BUILD },
    frame: { id: 'frame-1', name: 'Desktop Page' },
    outcomeStatus: 'COMPLETED',
    reason: null,
    plan: {
      decision: 'CALIBRATE',
      recipe: 'page-vertical-flow',
      pattern: 'page-vertical-flow',
      confidence: 98,
      targetNodeId: 'frame-1',
      targetNodeName: 'Desktop Page',
      targetPath: [],
      preserveNodeIds: [],
    },
    calibration: {
      calibrationId: 'cal-1',
      status: 'PASSED',
      originalNodeId: 'frame-1',
      candidateNodeId: 'candidate-1',
      failureStage: null,
      error: null,
      leftoverCandidateRisk: false,
      productionCommitAttempted: false,
      validation: {
        passed: true,
        thresholdVersion: 'p3-test',
        changedPixelPct: 0.001,
        meanChannelDelta: 0.002,
        maxChannelDelta: 1,
        maxTextPositionDriftPx: 0.1,
        maxImagePositionDriftPx: 0.1,
      },
      events: [{ stage: 'DISCARD' }, { stage: 'DONE' }],
    },
    ...overrides,
  };
}

describe('P6 runtime evidence viewer', () => {
  it('renders bounded calibration facts, deterministic acceptance, and copyable JSON', () => {
    const html = buildP6RuntimeEvidenceViewerHtml(evidence());
    expect(html).toContain('P6 Clone Calibration Evidence');
    expect(html).toContain('Acceptance PASS');
    expect(html).toContain('page-vertical-flow');
    expect(html).toContain('Copy bounded JSON');
    expect(html).toContain('p5-runtime-proof-v3');
    expect(html).toContain('positive page-flow calibration only');
  });

  it('escapes evidence-controlled HTML before rendering', () => {
    const html = buildP6RuntimeEvidenceViewerHtml(evidence({
      frame: { id: 'frame-1', name: '</pre><script>bad()</script>' },
      reason: '<unsafe>',
    }));
    expect(html).not.toContain('</pre><script>bad()</script>');
    expect(html).toContain('&lt;/pre&gt;&lt;script&gt;bad()&lt;/script&gt;');
    expect(html).toContain('&lt;unsafe&gt;');
  });

  it('surfaces cleanup risk and acceptance failure without changing commit-impossible evidence', () => {
    const html = buildP6RuntimeEvidenceViewerHtml(evidence({
      calibration: {
        ...evidence().calibration!,
        status: 'FAILED',
        failureStage: 'discard',
        error: 'cleanup failed',
        leftoverCandidateRisk: true,
        productionCommitAttempted: false,
      },
    }));
    expect(html).toContain('Acceptance FAIL');
    expect(html).toContain('Candidate cleanup risk is present');
    expect(html).toContain('Acceptance: P6 calibration status is FAILED, not PASSED.');
    expect(html).toContain('false');
  });
});
