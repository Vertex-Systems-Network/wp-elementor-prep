import type {
  P7RuntimeBuildIdentity,
  P7RuntimeEvidenceSnapshot,
} from '../core/batch-runtime-evidence';
import { P7_BUILD_IDENTITY } from './build-info';
import {
  isTraceableP7BuildIdentity,
  sameP7BuildIdentity,
} from './p7-build-identity';
import { readP7P5BuildProofState } from './p7-p5-build-proof';
import {
  loadAndAssessP7RuntimeAcceptance,
  type P7StoredRuntimeAcceptanceAssessment,
} from './p7-runtime-acceptance-loader';
import {
  loadLatestP7RuntimeEvidence,
  type P7EvidenceKeyValueStorage,
} from './p7-runtime-evidence-session';

export interface P7RuntimeEvidenceInspectionSummary {
  buildSourceSha: string | null;
  buildRunId: string | null;
  buildRunNumber: string | null;
  runKey: string;
  startedAt: string;
  elapsedMs: number;
  segmentCount: number;
  recordedAttemptCount: number;
  totalProcessorMs: number;
  maxConcurrentProcessors: number;
  checkpointPauseCount: number;
  checkpointResolutionCount: number;
  cancellationRequested: boolean;
  cancellationSettled: boolean;
  finalStatus: P7RuntimeEvidenceSnapshot['finalStatus'];
  finalFinishedCount: number | null;
  finalTotalCount: number | null;
  memorySamplingSupported: boolean;
  memorySampleCount: number;
  observedPeakUsedJsHeapBytesAtSamplePoints: number | null;
  attemptEvidenceTruncated: boolean;
  checkpointEvidenceTruncated: boolean;
}

export interface P7RuntimeAcceptanceInspectionSummary {
  accepted: boolean;
  failures: string[];
  stressEvidenceAvailable: boolean;
  cancellationEvidenceAvailable: boolean;
}

export interface P7RuntimeClosureInspectionSummary {
  accepted: boolean;
  failures: string[];
  p5PrerequisiteValid: boolean;
  p5ProofPassedAt: string | null;
  currentBuildTraceable: boolean;
  runtimeEvidenceMatchesCurrentBuild: boolean;
}

export interface P7RuntimeAcceptanceExportBundle {
  schemaVersion: 1;
  accepted: boolean;
  failures: string[];
  stress: P7RuntimeEvidenceSnapshot | null;
  cancellation: P7RuntimeEvidenceSnapshot | null;
}

export interface P7RuntimeClosureExportBundle {
  schemaVersion: 1;
  accepted: boolean;
  failures: string[];
  currentBuild: P7RuntimeBuildIdentity;
  p5Prerequisite: {
    valid: boolean;
    passedAt: string | null;
  };
  runtimeAcceptance: {
    accepted: boolean;
    failures: string[];
  };
  stress: P7RuntimeEvidenceSnapshot | null;
  cancellation: P7RuntimeEvidenceSnapshot | null;
}

interface P7RuntimeEvidenceInspectionBase {
  acceptance: P7RuntimeAcceptanceInspectionSummary;
  acceptanceJson: string;
  closure: P7RuntimeClosureInspectionSummary;
  closureJson: string;
}

export type P7RuntimeEvidenceInspection =
  | (P7RuntimeEvidenceInspectionBase & {
    status: 'EMPTY';
    message: string;
  })
  | (P7RuntimeEvidenceInspectionBase & {
    status: 'AVAILABLE';
    summary: P7RuntimeEvidenceInspectionSummary;
    warnings: string[];
    snapshot: P7RuntimeEvidenceSnapshot;
    json: string;
  });

function buildWarnings(snapshot: P7RuntimeEvidenceSnapshot): string[] {
  const warnings: string[] = [];
  if (!snapshot.build) {
    warnings.push('Runtime evidence has no CI build provenance and cannot satisfy acceptance.');
  }
  if (snapshot.maxConcurrentProcessors > 1) {
    warnings.push(`Unexpected processor concurrency observed: ${snapshot.maxConcurrentProcessors}.`);
  }
  if (snapshot.attemptEvidenceTruncated) {
    warnings.push('Per-attempt evidence reached its configured bound and was truncated.');
  }
  if (snapshot.checkpointEvidenceTruncated) {
    warnings.push('Checkpoint-resolution evidence reached its configured bound and was truncated.');
  }
  if (
    snapshot.cancellation
    && snapshot.finalStatus === 'CANCELLED'
    && (!snapshot.cancellation.settledAt || snapshot.cancellation.finalStatus !== 'CANCELLED')
  ) {
    warnings.push('Batch is CANCELLED but cancellation evidence does not show a settled CANCELLED record.');
  }
  return warnings;
}

export function summarizeP7RuntimeEvidence(
  snapshot: P7RuntimeEvidenceSnapshot,
): P7RuntimeEvidenceInspectionSummary {
  return {
    buildSourceSha: snapshot.build?.sourceSha ?? null,
    buildRunId: snapshot.build?.runId ?? null,
    buildRunNumber: snapshot.build?.runNumber ?? null,
    runKey: snapshot.runKey,
    startedAt: snapshot.startedAt,
    elapsedMs: snapshot.elapsedMs,
    segmentCount: snapshot.segmentCount,
    recordedAttemptCount: snapshot.attempts.length,
    totalProcessorMs: snapshot.totalProcessorMs,
    maxConcurrentProcessors: snapshot.maxConcurrentProcessors,
    checkpointPauseCount: snapshot.checkpointPauseCount,
    checkpointResolutionCount: snapshot.checkpointResolutions.length,
    cancellationRequested: snapshot.cancellation !== null,
    cancellationSettled: Boolean(snapshot.cancellation?.settledAt),
    finalStatus: snapshot.finalStatus,
    finalFinishedCount: snapshot.finalFinishedCount,
    finalTotalCount: snapshot.finalTotalCount,
    memorySamplingSupported: snapshot.memorySamplingSupported,
    memorySampleCount: snapshot.memorySampleCount,
    observedPeakUsedJsHeapBytesAtSamplePoints: snapshot.observedPeakUsedJsHeapBytesAtSamplePoints,
    attemptEvidenceTruncated: snapshot.attemptEvidenceTruncated,
    checkpointEvidenceTruncated: snapshot.checkpointEvidenceTruncated,
  };
}

export function formatP7RuntimeEvidenceJson(snapshot: P7RuntimeEvidenceSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export function buildP7RuntimeAcceptanceExportBundle(
  assessment: P7StoredRuntimeAcceptanceAssessment,
): P7RuntimeAcceptanceExportBundle {
  return {
    schemaVersion: 1,
    accepted: assessment.accepted,
    failures: [...assessment.failures],
    stress: assessment.evidence.stress,
    cancellation: assessment.evidence.cancellation,
  };
}

export function formatP7RuntimeAcceptanceJson(
  assessment: P7StoredRuntimeAcceptanceAssessment,
): string {
  return JSON.stringify(buildP7RuntimeAcceptanceExportBundle(assessment), null, 2);
}

function evidenceMatchesBuild(
  snapshot: P7RuntimeEvidenceSnapshot | null,
  expectedBuild: P7RuntimeBuildIdentity,
): boolean {
  return Boolean(
    snapshot
    && isTraceableP7BuildIdentity(snapshot.build)
    && isTraceableP7BuildIdentity(expectedBuild)
    && sameP7BuildIdentity(snapshot.build, expectedBuild),
  );
}

export function assessP7RuntimeClosure(
  runtimeAssessment: P7StoredRuntimeAcceptanceAssessment,
  p5Prerequisite: { valid: boolean; passedAt: string | null },
  expectedBuild: P7RuntimeBuildIdentity,
): P7RuntimeClosureInspectionSummary {
  const failures: string[] = [];
  const currentBuildTraceable = isTraceableP7BuildIdentity(expectedBuild);
  const stressMatches = evidenceMatchesBuild(runtimeAssessment.evidence.stress, expectedBuild);
  const cancellationMatches = evidenceMatchesBuild(runtimeAssessment.evidence.cancellation, expectedBuild);
  const runtimeEvidenceMatchesCurrentBuild = stressMatches && cancellationMatches;

  if (!currentBuildTraceable) {
    failures.push('Current P7 plugin build is not traceable to a CI source/run identity.');
  }
  if (!p5Prerequisite.valid) {
    failures.push('P5 deterministic runtime proof is not bound to this exact P7 plugin build.');
  }
  failures.push(...runtimeAssessment.failures);

  if (runtimeAssessment.evidence.stress && !stressMatches) {
    failures.push('Retained P7 stress evidence was captured by a different build than the current plugin.');
  }
  if (runtimeAssessment.evidence.cancellation && !cancellationMatches) {
    failures.push('Retained P7 cancellation evidence was captured by a different build than the current plugin.');
  }

  return {
    accepted: failures.length === 0,
    failures,
    p5PrerequisiteValid: p5Prerequisite.valid,
    p5ProofPassedAt: p5Prerequisite.passedAt,
    currentBuildTraceable,
    runtimeEvidenceMatchesCurrentBuild,
  };
}

export function buildP7RuntimeClosureExportBundle(
  closure: P7RuntimeClosureInspectionSummary,
  runtimeAssessment: P7StoredRuntimeAcceptanceAssessment,
  expectedBuild: P7RuntimeBuildIdentity,
): P7RuntimeClosureExportBundle {
  return {
    schemaVersion: 1,
    accepted: closure.accepted,
    failures: [...closure.failures],
    currentBuild: { ...expectedBuild },
    p5Prerequisite: {
      valid: closure.p5PrerequisiteValid,
      passedAt: closure.p5ProofPassedAt,
    },
    runtimeAcceptance: {
      accepted: runtimeAssessment.accepted,
      failures: [...runtimeAssessment.failures],
    },
    stress: runtimeAssessment.evidence.stress,
    cancellation: runtimeAssessment.evidence.cancellation,
  };
}

export function formatP7RuntimeClosureJson(
  closure: P7RuntimeClosureInspectionSummary,
  runtimeAssessment: P7StoredRuntimeAcceptanceAssessment,
  expectedBuild: P7RuntimeBuildIdentity,
): string {
  return JSON.stringify(
    buildP7RuntimeClosureExportBundle(closure, runtimeAssessment, expectedBuild),
    null,
    2,
  );
}

/**
 * Read-only inspector for the latest bounded P7 runtime-evidence snapshot, the two retained runtime
 * scenarios and the exact-build P5 prerequisite. It never creates, mutates or clears runtime state.
 */
export async function inspectLatestP7RuntimeEvidence(
  storage: P7EvidenceKeyValueStorage,
  expectedBuild: P7RuntimeBuildIdentity = P7_BUILD_IDENTITY,
): Promise<P7RuntimeEvidenceInspection> {
  const [snapshot, storedAcceptance, p5Prerequisite] = await Promise.all([
    loadLatestP7RuntimeEvidence(storage),
    loadAndAssessP7RuntimeAcceptance(storage),
    readP7P5BuildProofState(storage, expectedBuild),
  ]);

  const acceptance: P7RuntimeAcceptanceInspectionSummary = {
    accepted: storedAcceptance.accepted,
    failures: [...storedAcceptance.failures],
    stressEvidenceAvailable: storedAcceptance.evidence.stress !== null,
    cancellationEvidenceAvailable: storedAcceptance.evidence.cancellation !== null,
  };
  const acceptanceJson = formatP7RuntimeAcceptanceJson(storedAcceptance);
  const closure = assessP7RuntimeClosure(storedAcceptance, p5Prerequisite, expectedBuild);
  const closureJson = formatP7RuntimeClosureJson(closure, storedAcceptance, expectedBuild);

  if (!snapshot) {
    return {
      status: 'EMPTY',
      message: 'No valid persisted P7 runtime evidence is available for inspection.',
      acceptance,
      acceptanceJson,
      closure,
      closureJson,
    };
  }

  return {
    status: 'AVAILABLE',
    summary: summarizeP7RuntimeEvidence(snapshot),
    acceptance,
    acceptanceJson,
    closure,
    closureJson,
    warnings: buildWarnings(snapshot),
    snapshot,
    json: formatP7RuntimeEvidenceJson(snapshot),
  };
}
