import { describe, expect, it } from 'vitest';
import type { P6PreservationRefusalEvidenceBundle } from '../src/plugin/p6-refusal-evidence';
import type { P6RuntimeEvidenceBundle } from '../src/plugin/p6-runtime-evidence';
import { assessP6ClosureAcceptance } from '../src/plugin/p6-closure-acceptance';
import {
  loadP6StoredClosureEvidence,
  persistP6ClosureEvidenceBestEffort,
  P6_POSITIVE_CLOSURE_EVIDENCE_STORAGE_KEY,
  P6_REFUSAL_CLOSURE_EVIDENCE_STORAGE_KEY,
} from '../src/plugin/p6-closure-evidence-storage';
import { inspectP6ClosureEvidence } from '../src/plugin/p6-closure-inspector';
import { buildP6ClosureViewerHtml } from '../src/plugin/p6-closure-viewer';
import { P6_TEST_BUILD, P6_TEST_PROOF_PASSED_AT } from './p6-provenance-fixture';

class MemoryStorage {
  values = new Map<string, unknown>();
  async getAsync(key: string): Promise<unknown> { return this.values.get(key); }
  async setAsync(key: string, value: unknown): Promise<void> { this.values.set(key, value); }
}

function positive(build = P6_TEST_BUILD): P6RuntimeEvidenceBundle {
  return {
    schemaVersion: 2,
    capturedAt: '2026-09-08T10:01:00.000Z',
    pluginVersion: '0.1.0-alpha.1',
    build: { ...build },
    p5RuntimeGateVersion: 'p5-runtime-proof-v3',
    p5RuntimeProofPassedAt: P6_TEST_PROOF_PASSED_AT,
    p5RuntimeProofBuild: { ...build },
    frame: { id: 'page', name: 'Image Page' },
    outcomeStatus: 'COMPLETED',
    reason: null,
    plan: {
      decision: 'CALIBRATE', recipe: 'page-vertical-flow', pattern: 'page-vertical-flow', confidence: 99,
      targetNodeId: 'page', targetNodeName: 'Image Page', targetPath: [], preserveNodeIds: [],
    },
    calibration: {
      calibrationId: 'cal-1', status: 'PASSED', originalNodeId: 'page', candidateNodeId: 'candidate',
      failureStage: null, error: null, leftoverCandidateRisk: false, productionCommitAttempted: false,
      validation: {
        passed: true, thresholdVersion: 'p3-v1', changedPixelPct: 0, meanChannelDelta: 0,
        maxChannelDelta: 0, maxTextPositionDriftPx: 0, maxImagePositionDriftPx: 0,
      },
      events: [{ stage: 'DISCARD' }, { stage: 'DONE' }],
    },
  };
}

function refusal(build = P6_TEST_BUILD): P6PreservationRefusalEvidenceBundle {
  return {
    schemaVersion: 2,
    capturedAt: '2026-09-08T10:02:00.000Z',
    pluginVersion: '0.1.0-alpha.1',
    build: { ...build },
    p5RuntimeGateVersion: 'p5-runtime-proof-v3',
    p5RuntimeProofPassedAt: P6_TEST_PROOF_PASSED_AT,
    p5RuntimeProofBuild: { ...build },
    frame: { id: 'preserve', name: 'Preserve Page' },
    outcomeStatus: 'NO_CANDIDATE',
    reason: 'Preservation relationship required.',
    totalPlanCount: 1,
    plansTruncated: false,
    plans: [{
      decision: 'PRESERVE', recipe: null, reasonCode: 'PRESERVATION_RELATIONSHIP_REQUIRED',
      reason: 'Keep overlay relationship.', pattern: 'header-hero-overlay', confidence: 99,
      targetNodeId: 'overlay', targetNodeName: 'Overlay', targetPath: [0], preserveNodeIds: ['hero'],
      mutationEnabled: false, futureMutationRequiresFullP3: true, futureMutationRequiresP4Rollback: true,
    }],
  };
}

describe('P6 exact-build closure evidence', () => {
  it('retains accepted positive and refusal evidence in independent slots', async () => {
    const storage = new MemoryStorage();
    expect(await persistP6ClosureEvidenceBestEffort(storage, { kind: 'CALIBRATION', evidence: positive(), html: '' })).toBe(true);
    expect(await persistP6ClosureEvidenceBestEffort(storage, { kind: 'PRESERVATION_REFUSAL', evidence: refusal(), html: '' })).toBe(true);
    const stored = await loadP6StoredClosureEvidence(storage);
    expect(stored.positive?.frame.id).toBe('page');
    expect(stored.refusal?.frame.id).toBe('preserve');
  });

  it('does not overwrite accepted evidence with a later rejected scenario', async () => {
    const storage = new MemoryStorage();
    const good = positive();
    await persistP6ClosureEvidenceBestEffort(storage, { kind: 'CALIBRATION', evidence: good, html: '' });
    const bad = positive();
    bad.calibration!.leftoverCandidateRisk = true;
    expect(await persistP6ClosureEvidenceBestEffort(storage, { kind: 'CALIBRATION', evidence: bad, html: '' })).toBe(false);
    expect(storage.values.get(P6_POSITIVE_CLOSURE_EVIDENCE_STORAGE_KEY)).toEqual(good);
    expect(storage.values.has(P6_REFUSAL_CLOSURE_EVIDENCE_STORAGE_KEY)).toBe(false);
  });

  it('passes closure only when both accepted scenarios match the current exact build', () => {
    expect(assessP6ClosureAcceptance(P6_TEST_BUILD, { positive: positive(), refusal: refusal() })).toEqual(expect.objectContaining({
      accepted: true,
      failures: [],
      positiveMatchesCurrentBuild: true,
      refusalMatchesCurrentBuild: true,
    }));

    const otherBuild = { ...P6_TEST_BUILD, sourceSha: 'fedcba9876543210fedcba9876543210fedcba98' };
    const assessment = assessP6ClosureAcceptance(P6_TEST_BUILD, { positive: positive(otherBuild), refusal: refusal() });
    expect(assessment.accepted).toBe(false);
    expect(assessment.failures).toContain('Retained P6 positive calibration evidence was captured by a different plugin build.');
  });

  it('fails closed when either scenario is absent or storage is malformed', async () => {
    const missing = assessP6ClosureAcceptance(P6_TEST_BUILD, { positive: positive(), refusal: null });
    expect(missing.accepted).toBe(false);
    expect(missing.failures).toContain('No retained accepted P6 preservation-refusal evidence is available.');

    const storage = new MemoryStorage();
    storage.values.set(P6_POSITIVE_CLOSURE_EVIDENCE_STORAGE_KEY, { schemaVersion: 999 });
    storage.values.set(P6_REFUSAL_CLOSURE_EVIDENCE_STORAGE_KEY, { schemaVersion: 999 });
    expect(await loadP6StoredClosureEvidence(storage)).toEqual({ positive: null, refusal: null });
  });

  it('inspects and exports read-only closure evidence with HTML escaping', async () => {
    const storage = new MemoryStorage();
    const positiveEvidence = positive();
    positiveEvidence.frame.name = '</pre><script>bad()</script>';
    await persistP6ClosureEvidenceBestEffort(storage, { kind: 'CALIBRATION', evidence: positiveEvidence, html: '' });
    await persistP6ClosureEvidenceBestEffort(storage, { kind: 'PRESERVATION_REFUSAL', evidence: refusal(), html: '' });
    const inspection = await inspectP6ClosureEvidence(storage, P6_TEST_BUILD);
    expect(inspection.acceptance.accepted).toBe(true);
    const html = buildP6ClosureViewerHtml(inspection);
    expect(html).toContain('P6 Closure acceptance: PASS');
    expect(html).toContain('Copy P6 closure bundle');
    expect(html).not.toContain('</pre><script>bad()</script>');
    expect(html).toContain('&lt;/pre&gt;&lt;script&gt;bad()&lt;/script&gt;');
  });
});
