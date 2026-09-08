import type { P7RuntimeEvidenceSnapshot } from '../core/batch-runtime-evidence';
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

export type P7RuntimeEvidenceInspection =
  | {
    status: 'EMPTY';
    message: string;
  }
  | {
    status: 'AVAILABLE';
    summary: P7RuntimeEvidenceInspectionSummary;
    warnings: string[];
    snapshot: P7RuntimeEvidenceSnapshot;
    json: string;
  };

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

/**
 * Read-only inspector for the latest bounded P7 runtime-evidence snapshot.
 *
 * It never creates, mutates or clears runtime state. Unknown/corrupt persisted evidence is already
 * rejected by the canonical loader and is therefore represented as EMPTY rather than guessed.
 */
export async function inspectLatestP7RuntimeEvidence(
  storage: P7EvidenceKeyValueStorage,
): Promise<P7RuntimeEvidenceInspection> {
  const snapshot = await loadLatestP7RuntimeEvidence(storage);
  if (!snapshot) {
    return {
      status: 'EMPTY',
      message: 'No valid persisted P7 runtime evidence is available for inspection.',
    };
  }

  return {
    status: 'AVAILABLE',
    summary: summarizeP7RuntimeEvidence(snapshot),
    warnings: buildWarnings(snapshot),
    snapshot,
    json: formatP7RuntimeEvidenceJson(snapshot),
  };
}
