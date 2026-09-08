import { describe, expect, it } from 'vitest';
import { createP5RuntimeProof } from '../src/core/p5-runtime-gate';
import type { P7RuntimeEvidenceSnapshot } from '../src/core/batch-runtime-evidence';
import { verifyP7ClosureExportBundle } from '../src/plugin/p7-closure-verifier';
import { createP7P5BuildProofReceipt } from '../src/plugin/p7-p5-build-proof';
import { assessP7RuntimeAcceptance } from '../src/plugin/p7-runtime-acceptance';
import type { P7StoredRuntimeAcceptanceAssessment } from '../src/plugin/p7-runtime-acceptance-loader';
import {
  assessP7RuntimeClosure,
  buildP7RuntimeClosureExportBundle,
} from '../src/plugin/p7-runtime-evidence-inspector';

const BUILD = {
  sourceSha: '0123456789abcdef0123456789abcdef01234567',
  runId: '34217708751',
  runNumber: '292',
};

function stress(): P7RuntimeEvidenceSnapshot {
  return {
    schemaVersion: 1,
    build: { ...BUILD },
    runKey: 'stress-run',
    startedAt: '2026-09-08T10:00:00.000Z',
    elapsedMs: 1000,
    segmentCount: 1,
    stateTransitionCount: 2,
    checkpointPauseCount: 0,
    totalProcessorMs: 900,
    maxConcurrentProcessors: 1,
    attemptEvidenceTruncated: false,
    attempts: [{
      sequence: 1,
      frameIdAtStart: 'frame-1',
      frameName: 'One',
      attempt: 1,
      startedAt: '2026-09-08T10:00:00.100Z',
      durationMs: 900,
      outcome: 'SUCCEEDED',
      committedFrameId: null,
      error: null,
      usedJsHeapBytesBefore: null,
      usedJsHeapBytesAfter: null,
    }],
    checkpointEvidenceTruncated: false,
    checkpointResolutions: [],
    cancellation: null,
    memorySamplingSupported: false,
    memorySampleCount: 0,
    observedPeakUsedJsHeapBytesAtSamplePoints: null,
    finalStatus: 'COMPLETED',
    finalFinishedCount: 60,
    finalTotalCount: 60,
  };
}

function cancellation(): P7RuntimeEvidenceSnapshot {
  const snapshot = stress();
  snapshot.runKey = 'cancel-run';
  snapshot.finalStatus = 'CANCELLED';
  snapshot.finalFinishedCount = 2;
  snapshot.finalTotalCount = 2;
  snapshot.cancellation = {
    requestedAt: '2026-09-08T10:00:00.500Z',
    activeFrameIdAtRequest: 'frame-1',
    settledAt: '2026-09-08T10:00:01.000Z',
    finalStatus: 'CANCELLED',
  };
  return snapshot;
}

function passingBundle() {
  const evidence = { stress: stress(), cancellation: cancellation() };
  const runtimeAssessment: P7StoredRuntimeAcceptanceAssessment = {
    ...assessP7RuntimeAcceptance(evidence),
    evidence,
  };
  const coreProof = createP5RuntimeProof('2026-09-08T09:59:59.000Z');
  const p5Evidence = {
    state: { valid: true, passedAt: coreProof.passedAt },
    coreProof,
    receipt: createP7P5BuildProofReceipt(coreProof, BUILD),
  };
  const closure = assessP7RuntimeClosure(runtimeAssessment, p5Evidence.state, BUILD);
  return buildP7RuntimeClosureExportBundle(closure, runtimeAssessment, BUILD, p5Evidence);
}

describe('P7 offline closure verifier', () => {
  it('accepts canonical closure evidence from the exact verifier build', () => {
    const bundle = passingBundle();
    expect(bundle.schemaVersion).toBe(2);
    expect(verifyP7ClosureExportBundle(bundle, BUILD)).toEqual({
      accepted: true,
      failures: [],
    });
  });

  it('rejects otherwise-valid closure evidence from a different artifact build', () => {
    const otherBuild = { ...BUILD, runNumber: '293' };
    const result = verifyP7ClosureExportBundle(passingBundle(), otherBuild);
    expect(result.accepted).toBe(false);
    expect(result.failures).toContain('P7 closure bundle belongs to a different build than this verifier artifact.');
  });

  it('rejects a tampered stored runtime-acceptance verdict', () => {
    const bundle = passingBundle();
    bundle.runtimeAcceptance = { accepted: true, failures: ['manually edited'] };
    const result = verifyP7ClosureExportBundle(bundle, BUILD);
    expect(result.accepted).toBe(false);
    expect(result.failures).toContain('Stored P7 runtime-acceptance verdict does not match canonical recomputation.');
  });

  it('rejects tampered runtime evidence even when stored closure still says PASS', () => {
    const bundle = passingBundle();
    bundle.stress!.maxConcurrentProcessors = 2;
    const result = verifyP7ClosureExportBundle(bundle, BUILD);
    expect(result.accepted).toBe(false);
    expect(result.failures).toContain('P7 stress max processor concurrency is 2, expected exactly 1.');
  });

  it('rejects a forged P5 prerequisite boolean when proof/receipt do not support it', () => {
    const bundle = passingBundle();
    bundle.p5Prerequisite.receipt = {
      ...bundle.p5Prerequisite.receipt!,
      proofPassedAt: '2026-09-08T09:00:00.000Z',
    };
    const result = verifyP7ClosureExportBundle(bundle, BUILD);
    expect(result.accepted).toBe(false);
    expect(result.failures).toContain('Stored P7 P5-prerequisite verdict does not match canonical proof/receipt recomputation.');
    expect(result.failures).toContain('P5 deterministic runtime proof is not bound to this exact P7 plugin build.');
  });

  it('fails closed for legacy v1 or malformed input', () => {
    expect(verifyP7ClosureExportBundle({ schemaVersion: 1 }, BUILD)).toEqual({
      accepted: false,
      failures: ['Malformed or unsupported P7 closure export bundle.'],
    });
  });
});
