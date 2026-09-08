import type { P7RuntimeEvidenceSnapshot } from '../core/batch-runtime-evidence';

export interface P7RuntimeAcceptanceAssessment {
  accepted: boolean;
  failures: string[];
}

export interface P7RuntimeAcceptanceEvidence {
  stress: P7RuntimeEvidenceSnapshot;
  cancellation: P7RuntimeEvidenceSnapshot;
}

function requireCondition(failures: string[], condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

function validIso(value: string | null): boolean {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

function assessMemoryTruthfulness(
  failures: string[],
  evidence: P7RuntimeEvidenceSnapshot,
  label: string,
): void {
  if (evidence.memorySamplingSupported) {
    requireCondition(failures, evidence.memorySampleCount > 0, `${label} reports memory support but has no samples.`);
    requireCondition(
      failures,
      typeof evidence.observedPeakUsedJsHeapBytesAtSamplePoints === 'number'
        && Number.isFinite(evidence.observedPeakUsedJsHeapBytesAtSamplePoints)
        && evidence.observedPeakUsedJsHeapBytesAtSamplePoints >= 0,
      `${label} reports memory support without a valid observed heap peak.`,
    );
  } else {
    requireCondition(failures, evidence.memorySampleCount === 0, `${label} reports unsupported memory sampling but has sample count ${evidence.memorySampleCount}.`);
    requireCondition(failures, evidence.observedPeakUsedJsHeapBytesAtSamplePoints === null, `${label} reports unsupported memory sampling but contains a heap peak.`);
  }
}

/**
 * Reviews two snapshots captured by the real imported P7 development plugin:
 * a completed realistic 60+ Frame stress run and a separate cancellation-during-active-work run.
 * It does not manufacture either observation.
 */
export function assessP7RuntimeAcceptance(
  evidence: P7RuntimeAcceptanceEvidence,
): P7RuntimeAcceptanceAssessment {
  const failures: string[] = [];
  const { stress, cancellation } = evidence;

  requireCondition(failures, stress.schemaVersion === 1, 'Unsupported P7 stress evidence schema.');
  requireCondition(failures, validIso(stress.startedAt), 'P7 stress evidence has no valid start timestamp.');
  requireCondition(failures, stress.finalStatus === 'COMPLETED', `P7 stress run final status is ${stress.finalStatus ?? 'null'}, not COMPLETED.`);
  requireCondition(failures, typeof stress.finalTotalCount === 'number' && stress.finalTotalCount >= 60, `P7 stress run contains ${stress.finalTotalCount ?? 0} Frames; at least 60 are required.`);
  requireCondition(failures, stress.finalFinishedCount === stress.finalTotalCount, 'P7 stress run did not finish every queued Frame.');
  requireCondition(failures, stress.maxConcurrentProcessors === 1, `P7 stress max processor concurrency is ${stress.maxConcurrentProcessors}, expected exactly 1.`);
  requireCondition(failures, stress.attemptEvidenceTruncated === false, 'P7 stress attempt evidence was truncated.');
  requireCondition(failures, stress.checkpointEvidenceTruncated === false, 'P7 stress checkpoint evidence was truncated.');
  requireCondition(failures, stress.attempts.length > 0, 'P7 stress run contains no processor attempts.');
  requireCondition(failures, stress.elapsedMs >= 0 && stress.totalProcessorMs >= 0, 'P7 stress timing evidence is invalid.');
  assessMemoryTruthfulness(failures, stress, 'P7 stress run');

  requireCondition(failures, cancellation.schemaVersion === 1, 'Unsupported P7 cancellation evidence schema.');
  requireCondition(failures, validIso(cancellation.startedAt), 'P7 cancellation evidence has no valid start timestamp.');
  requireCondition(failures, cancellation.finalStatus === 'CANCELLED', `P7 cancellation run final status is ${cancellation.finalStatus ?? 'null'}, not CANCELLED.`);
  requireCondition(failures, cancellation.maxConcurrentProcessors === 1, `P7 cancellation max processor concurrency is ${cancellation.maxConcurrentProcessors}, expected exactly 1.`);
  requireCondition(failures, cancellation.attemptEvidenceTruncated === false, 'P7 cancellation attempt evidence was truncated.');
  requireCondition(failures, cancellation.checkpointEvidenceTruncated === false, 'P7 cancellation checkpoint evidence was truncated.');
  requireCondition(failures, cancellation.cancellation !== null, 'P7 cancellation run contains no cancellation request evidence.');

  if (cancellation.cancellation) {
    requireCondition(failures, validIso(cancellation.cancellation.requestedAt), 'P7 cancellation request timestamp is invalid.');
    requireCondition(failures, cancellation.cancellation.activeFrameIdAtRequest !== null, 'P7 cancellation was not observed while a processor Frame was active.');
    requireCondition(failures, validIso(cancellation.cancellation.settledAt), 'P7 cancellation did not record post-transaction settlement.');
    requireCondition(failures, cancellation.cancellation.finalStatus === 'CANCELLED', `P7 cancellation evidence settled as ${cancellation.cancellation.finalStatus ?? 'null'}, not CANCELLED.`);
  }

  requireCondition(failures, cancellation.attempts.length > 0, 'P7 cancellation run contains no completed processor attempt.');
  requireCondition(
    failures,
    cancellation.cancellation?.activeFrameIdAtRequest !== null
      && cancellation.attempts.some((attempt) => attempt.frameIdAtStart === cancellation.cancellation?.activeFrameIdAtRequest),
    'P7 cancellation active Frame id is not represented by a recorded processor attempt.',
  );
  assessMemoryTruthfulness(failures, cancellation, 'P7 cancellation run');

  return { accepted: failures.length === 0, failures };
}
