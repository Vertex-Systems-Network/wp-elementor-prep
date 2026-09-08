import { describe, expect, it } from 'vitest';
import { P5_RUNTIME_PROOF_STORAGE_KEY, createP5RuntimeProof } from '../src/core/p5-runtime-gate';
import type { P7RuntimeBuildIdentity, P7RuntimeEvidenceSnapshot } from '../src/core/batch-runtime-evidence';
import { createP7P5BuildProofReceipt, P7_P5_BUILD_PROOF_STORAGE_KEY } from '../src/plugin/p7-p5-build-proof';
import { inspectLatestP7RuntimeEvidence } from '../src/plugin/p7-runtime-evidence-inspector';
import {
  P7_RUNTIME_CANCELLATION_EVIDENCE_STORAGE_KEY,
  P7_RUNTIME_EVIDENCE_STORAGE_KEY,
  P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY,
} from '../src/plugin/p7-runtime-evidence-session';

const BUILD_A: P7RuntimeBuildIdentity = {
  sourceSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  runId: '390001',
  runNumber: '390',
};
const BUILD_B: P7RuntimeBuildIdentity = {
  sourceSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  runId: '391001',
  runNumber: '391',
};

function baseSnapshot(
  build: P7RuntimeBuildIdentity,
  overrides: Partial<P7RuntimeEvidenceSnapshot> = {},
): P7RuntimeEvidenceSnapshot {
  return {
    schemaVersion: 1,
    build: { ...build },
    runKey: `plugin:0.1.0-alpha.1|safe-recipe-schema:1|batch-schema:1|runtime-proof:p5-runtime-proof-v3|build-source:${build.sourceSha}`,
    startedAt: '2026-09-08T12:00:00.000Z',
    elapsedMs: 12_000,
    segmentCount: 1,
    stateTransitionCount: 4,
    checkpointPauseCount: 0,
    totalProcessorMs: 10_000,
    maxConcurrentProcessors: 1,
    attemptEvidenceTruncated: false,
    attempts: [{
      sequence: 1,
      frameIdAtStart: 'frame-1',
      frameName: 'Frame One',
      attempt: 1,
      startedAt: '2026-09-08T12:00:01.000Z',
      durationMs: 10_000,
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
    ...overrides,
  };
}

function acceptanceScenarios(build: P7RuntimeBuildIdentity) {
  const stress = baseSnapshot(build);
  const cancellation = baseSnapshot(build, {
    finalStatus: 'CANCELLED',
    finalFinishedCount: 1,
    finalTotalCount: 2,
    cancellation: {
      requestedAt: '2026-09-08T12:00:05.000Z',
      activeFrameIdAtRequest: 'frame-1',
      settledAt: '2026-09-08T12:00:12.000Z',
      finalStatus: 'CANCELLED',
    },
  });
  return { stress, cancellation };
}

function storage(values: Map<string, unknown>) {
  let writes = 0;
  return {
    async getAsync(key: string): Promise<unknown> { return values.get(key); },
    async setAsync(): Promise<void> { writes += 1; },
    writes: () => writes,
  };
}

function valuesForRuntime(build: P7RuntimeBuildIdentity): Map<string, unknown> {
  const { stress, cancellation } = acceptanceScenarios(build);
  return new Map<string, unknown>([
    [P7_RUNTIME_EVIDENCE_STORAGE_KEY, cancellation],
    [P7_RUNTIME_STRESS_EVIDENCE_STORAGE_KEY, stress],
    [P7_RUNTIME_CANCELLATION_EVIDENCE_STORAGE_KEY, cancellation],
  ]);
}

function addP5Receipt(values: Map<string, unknown>, build: P7RuntimeBuildIdentity): void {
  const proof = createP5RuntimeProof('2026-09-08T11:59:00.000Z');
  values.set(P5_RUNTIME_PROOF_STORAGE_KEY, proof);
  values.set(P7_P5_BUILD_PROOF_STORAGE_KEY, createP7P5BuildProofReceipt(proof, build));
}

describe('P7 runtime closure inspector', () => {
  it('passes only when P5 prerequisite + stress + cancellation all belong to the exact current build', async () => {
    const values = valuesForRuntime(BUILD_A);
    addP5Receipt(values, BUILD_A);
    const store = storage(values);

    const result = await inspectLatestP7RuntimeEvidence(store, BUILD_A);
    expect(result.acceptance.accepted).toBe(true);
    expect(result.closure).toEqual({
      accepted: true,
      failures: [],
      p5PrerequisiteValid: true,
      p5ProofPassedAt: '2026-09-08T11:59:00.000Z',
      currentBuildTraceable: true,
      runtimeEvidenceMatchesCurrentBuild: true,
    });
    const closureBundle = JSON.parse(result.closureJson) as Record<string, unknown>;
    expect(closureBundle).toEqual(expect.objectContaining({
      schemaVersion: 1,
      accepted: true,
      currentBuild: BUILD_A,
    }));
    expect(store.writes()).toBe(0);
  });

  it('fails closure when runtime acceptance passes but the retained scenarios came from an older build', async () => {
    const values = valuesForRuntime(BUILD_B);
    addP5Receipt(values, BUILD_A);

    const result = await inspectLatestP7RuntimeEvidence(storage(values), BUILD_A);
    expect(result.acceptance.accepted).toBe(true);
    expect(result.closure.accepted).toBe(false);
    expect(result.closure.p5PrerequisiteValid).toBe(true);
    expect(result.closure.runtimeEvidenceMatchesCurrentBuild).toBe(false);
    expect(result.closure.failures).toContain('Retained P7 stress evidence was captured by a different build than the current plugin.');
    expect(result.closure.failures).toContain('Retained P7 cancellation evidence was captured by a different build than the current plugin.');
  });

  it('fails closure when P7 runtime scenarios pass but the exact-build P5 prerequisite is missing', async () => {
    const values = valuesForRuntime(BUILD_A);
    const result = await inspectLatestP7RuntimeEvidence(storage(values), BUILD_A);

    expect(result.acceptance.accepted).toBe(true);
    expect(result.closure.accepted).toBe(false);
    expect(result.closure.p5PrerequisiteValid).toBe(false);
    expect(result.closure.runtimeEvidenceMatchesCurrentBuild).toBe(true);
    expect(result.closure.failures).toContain('P5 deterministic runtime proof is not bound to this exact P7 plugin build.');
  });
});
