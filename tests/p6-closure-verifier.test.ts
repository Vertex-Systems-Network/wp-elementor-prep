import { describe, expect, it } from 'vitest';
import type { P5RuntimeCalibrationResult } from '../src/plugin/p5-runtime-calibration';
import { buildP5RuntimeEvidenceBundle } from '../src/plugin/p5-runtime-evidence';
import type { P6PreservationRefusalEvidenceBundle } from '../src/plugin/p6-refusal-evidence';
import type { P6RuntimeEvidenceBundle } from '../src/plugin/p6-runtime-evidence';
import { buildP6ClosureExportBundle } from '../src/plugin/p6-closure-inspector';
import { verifyP6ClosureExportBundle } from '../src/plugin/p6-closure-verifier';
import { P6_TEST_BUILD, P6_TEST_PROOF_PASSED_AT } from './p6-provenance-fixture';

function passingP5Result(): P5RuntimeCalibrationResult {
  return {
    schemaVersion: 1,
    passed: true,
    forcedReject: {
      state: 'REJECTED',
      validationRejected: true,
      pixelEvidenceReturned: true,
      changedPixelPct: 1,
      candidateDeleted: true,
      originalUntouched: true,
    },
    passRestore: {
      state: 'COMMITTED',
      validationPassed: true,
      pixelEvidenceReturned: true,
      changedPixelPct: 0,
      committed: true,
      restored: true,
      checkpointCleared: true,
    },
    passFinalize: {
      state: 'COMMITTED',
      validationPassed: true,
      pixelEvidenceReturned: true,
      changedPixelPct: 0,
      committed: true,
      finalized: true,
      candidateRetained: true,
      originalDiscarded: true,
      checkpointCleared: true,
    },
    leftovers: 0,
  };
}

function p5Evidence() {
  return buildP5RuntimeEvidenceBundle({
    pluginVersion: '0.1.0-alpha.1',
    build: P6_TEST_BUILD,
    result: passingP5Result(),
    runtimeProofPassedAt: P6_TEST_PROOF_PASSED_AT,
    capturedAt: '2026-09-08T10:00:00.000Z',
  });
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
    plan: { decision: 'CALIBRATE', recipe: 'page-vertical-flow', pattern: 'page-vertical-flow', confidence: 99, targetNodeId: 'page', targetNodeName: 'Image Page', targetPath: [], preserveNodeIds: [] },
    calibration: {
      calibrationId: 'cal-1', status: 'PASSED', originalNodeId: 'page', candidateNodeId: 'candidate', failureStage: null, error: null,
      leftoverCandidateRisk: false, productionCommitAttempted: false,
      validation: { passed: true, thresholdVersion: 'p3-v1', changedPixelPct: 0, meanChannelDelta: 0, maxChannelDelta: 0, maxTextPositionDriftPx: 0, maxImagePositionDriftPx: 0, imageAnchorCountBefore: 2, imageAnchorCountAfter: 2 },
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
    plans: [{ decision: 'PRESERVE', recipe: null, reasonCode: 'PRESERVATION_RELATIONSHIP_REQUIRED', reason: 'Keep overlay relationship.', pattern: 'header-hero-overlay', confidence: 99, targetNodeId: 'overlay', targetNodeName: 'Overlay', targetPath: [0], preserveNodeIds: ['hero'], mutationEnabled: false, futureMutationRequiresFullP3: true, futureMutationRequiresP4Rollback: true }],
  };
}

function passingBundle() {
  return buildP6ClosureExportBundle(
    P6_TEST_BUILD,
    { positive: positive(), refusal: refusal() },
    p5Evidence(),
  );
}

describe('P6 offline closure verifier', () => {
  it('accepts untampered closure from the exact verifier build', () => {
    const bundle = passingBundle();
    expect(bundle.schemaVersion).toBe(2);
    expect(verifyP6ClosureExportBundle(bundle, P6_TEST_BUILD)).toEqual({ accepted: true, failures: [] });
  });

  it('rejects otherwise-valid closure from another artifact build', () => {
    const otherBuild = { ...P6_TEST_BUILD, sourceSha: 'fedcba9876543210fedcba9876543210fedcba98' };
    const result = verifyP6ClosureExportBundle(passingBundle(), otherBuild);
    expect(result.accepted).toBe(false);
    expect(result.failures).toContain('P6 closure bundle belongs to a different build than this verifier artifact.');
    expect(result.failures).toContain('Embedded P5 prerequisite does not reconstruct a valid exact-build runtime proof.');
  });

  it('rejects a tampered stored closure verdict', () => {
    const bundle = passingBundle();
    bundle.acceptance = { ...bundle.acceptance, accepted: true, failures: ['manual edit'] };
    const result = verifyP6ClosureExportBundle(bundle, P6_TEST_BUILD);
    expect(result.accepted).toBe(false);
    expect(result.failures).toContain('Stored P6 closure verdict does not match the canonical recomputed assessment.');
  });

  it('rejects tampered positive calibration through canonical recomputation', () => {
    const bundle = passingBundle();
    bundle.evidence.positive!.calibration!.leftoverCandidateRisk = true;
    const result = verifyP6ClosureExportBundle(bundle, P6_TEST_BUILD);
    expect(result.accepted).toBe(false);
    expect(result.failures.some((failure) => failure.includes('Positive evidence:'))).toBe(true);
  });

  it('rejects scenario proof timestamp forgery against the embedded P5 evidence', () => {
    const bundle = passingBundle();
    bundle.evidence.positive!.p5RuntimeProofPassedAt = '2026-09-08T09:00:00.000Z';
    const result = verifyP6ClosureExportBundle(bundle, P6_TEST_BUILD);
    expect(result.accepted).toBe(false);
    expect(result.failures).toContain('Positive evidence P5 proof timestamp does not match exported P5 prerequisite evidence.');
  });

  it('rejects tampered embedded P5 calibration even if P6 scenarios still claim a valid proof', () => {
    const bundle = passingBundle();
    bundle.p5Evidence!.calibration.passFinalize.checkpointCleared = false;
    const result = verifyP6ClosureExportBundle(bundle, P6_TEST_BUILD);
    expect(result.accepted).toBe(false);
    expect(result.failures).toContain('Finalize path left a checkpoint pending.');
  });

  it('rejects embedded P5 proof timestamp later than its evidence capture', () => {
    const bundle = passingBundle();
    bundle.p5Evidence!.runtimeProofPassedAt = '2026-09-08T10:00:01.000Z';
    bundle.evidence.positive!.p5RuntimeProofPassedAt = '2026-09-08T10:00:01.000Z';
    bundle.evidence.refusal!.p5RuntimeProofPassedAt = '2026-09-08T10:00:01.000Z';
    const result = verifyP6ClosureExportBundle(bundle, P6_TEST_BUILD);
    expect(result.accepted).toBe(false);
    expect(result.failures).toContain('Embedded P5 runtime proof timestamp is later than its evidence capture timestamp.');
  });

  it('rejects missing P5 prerequisite evidence', () => {
    const bundle = passingBundle();
    bundle.p5Evidence = null;
    const result = verifyP6ClosureExportBundle(bundle, P6_TEST_BUILD);
    expect(result.accepted).toBe(false);
    expect(result.failures).toContain('P6 closure export contains no P5 runtime evidence prerequisite.');
  });

  it('rejects legacy v1 or malformed closure without throwing', () => {
    expect(verifyP6ClosureExportBundle({ schemaVersion: 1 }, P6_TEST_BUILD)).toEqual({
      accepted: false,
      failures: ['Malformed or unsupported P6 closure export bundle.'],
    });
  });
});
