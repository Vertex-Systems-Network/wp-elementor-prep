import type { P7RuntimeEvidenceSnapshot } from '../core/batch-runtime-evidence';
import {
  loadAndAssessP7RuntimeAcceptance,
  type P7StoredRuntimeAcceptanceAssessment,
} from './p7-runtime-acceptance-loader';
import {
  loadLatestP7RuntimeEvidence,
  type P7EvidenceKeyValueStorage,
} from './p7-runtime-evidence-session';

export interface P7RuntimeEvidenceInspectionSummary {
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

export interface P7RuntimeAcceptanceExportBundle {
  schemaVersion: 1;
  accepted: boolean;
  failures: string[];
  stress: P7RuntimeEvidenceSnapshot | null;
  cancellation: P7RuntimeEvidenceSnapshot | null;
}

interface P7RuntimeEvidenceInspectionBase {
  acceptance: P7RuntimeAcceptanceInspectionSummary;
  acceptanceJson: string;
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

/**
 * Read-only inspector for the latest bounded P7 runtime-evidence snapshot plus the two retained
 * acceptance scenarios. It never creates, mutates or clears runtime state.
 *
 * Unknown/corrupt persisted evidence is represented as missing rather than guessed. The latest JSON
 * export remains backward-compatible, while acceptanceJson contains both retained closure scenarios.
 */
export async function inspectLatestP7RuntimeEvidence(
  storage: P7EvidenceKeyValueStorage,
): Promise<P7RuntimeEvidenceInspection> {
  const [snapshot, storedAcceptance] = await Promise.all([
    loadLatestP7RuntimeEvidence(storage),
    loadAndAssessP7RuntimeAcceptance(storage),
  ]);

  const acceptance: P7RuntimeAcceptanceInspectionSummary = {
    accepted: storedAcceptance.accepted,
    failures: [...storedAcceptance.failures],
    stressEvidenceAvailable: storedAcceptance.evidence.stress !== null,
    cancellationEvidenceAvailable: storedAcceptance.evidence.cancellation !== null,
  };
  const acceptanceJson = formatP7RuntimeAcceptanceJson(storedAcceptance);

  if (!snapshot) {
    return {
      status: 'EMPTY',
      message: 'No valid persisted P7 runtime evidence is available for inspection.',
      acceptance,
      acceptanceJson,
    };
  }

  return {
    status: 'AVAILABLE',
    summary: summarizeP7RuntimeEvidence(snapshot),
    acceptance,
    acceptanceJson,
    warnings: buildWarnings(snapshot),
    snapshot,
    json: formatP7RuntimeEvidenceJson(snapshot),
  };
}
