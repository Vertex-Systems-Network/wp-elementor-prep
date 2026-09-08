import { describe, expect, it } from 'vitest';
import type { P6PreservationRefusalEvidenceBundle } from '../src/plugin/p6-refusal-evidence';
import { buildP6PreservationRefusalEvidenceViewerHtml } from '../src/plugin/p6-refusal-evidence-viewer';
import { P6_TEST_BUILD, P6_TEST_PROOF_PASSED_AT } from './p6-provenance-fixture';

function evidence(): P6PreservationRefusalEvidenceBundle {
  return {
    schemaVersion: 2,
    capturedAt: '2026-09-08T10:01:00.000Z',
    pluginVersion: '0.1.0-alpha.1',
    build: { ...P6_TEST_BUILD },
    p5RuntimeGateVersion: 'p5-runtime-proof-v3',
    p5RuntimeProofPassedAt: P6_TEST_PROOF_PASSED_AT,
    p5RuntimeProofBuild: { ...P6_TEST_BUILD },
    frame: { id: 'frame', name: 'Preservation <Page>' },
    outcomeStatus: 'NO_CANDIDATE',
    reason: 'Overlay <must> remain preserved.',
    totalPlanCount: 1,
    plansTruncated: false,
    plans: [{
      decision: 'PRESERVE',
      recipe: null,
      reasonCode: 'PRESERVATION_RELATIONSHIP_REQUIRED',
      reason: 'Overlay relationship must remain absolute and layered.',
      pattern: 'header-hero-overlay',
      confidence: 99,
      targetNodeId: 'overlay',
      targetNodeName: 'Header Hero Overlay',
      targetPath: [0],
      preserveNodeIds: ['badge'],
      mutationEnabled: false,
      futureMutationRequiresFullP3: true,
      futureMutationRequiresP4Rollback: true,
    }],
  };
}

describe('P6 preservation refusal evidence viewer', () => {
  it('shows deterministic PASS and a copyable bounded refusal bundle', () => {
    const html = buildP6PreservationRefusalEvidenceViewerHtml(evidence());
    expect(html).toContain('Preservation refusal acceptance: PASS');
    expect(html).toContain('P6 Preservation Refusal Evidence');
    expect(html).toContain('Copy refusal acceptance bundle');
    expect(html).toContain('PRESERVE');
    expect(html).toContain('header-hero-overlay');
    expect(html).toContain('Preservation &lt;Page&gt;');
    expect(html).toContain('Overlay &lt;must&gt; remain preserved.');
  });

  it('shows exact fail-closed reasons for incomplete or unsafe refusal evidence', () => {
    const unsafe = evidence();
    unsafe.p5RuntimeProofPassedAt = null;
    unsafe.p5RuntimeProofBuild = null;
    unsafe.plansTruncated = true;
    const html = buildP6PreservationRefusalEvidenceViewerHtml(unsafe);

    expect(html).toContain('Preservation refusal acceptance: FAIL');
    expect(html).toContain('captured without a valid imported P5 runtime proof');
    expect(html).toContain('plan evidence was truncated');
  });
});
