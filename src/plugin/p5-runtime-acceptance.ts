import type { P5RuntimeCalibrationResult } from './p5-runtime-calibration';

export interface P5RuntimeAcceptanceAssessment {
  accepted: boolean;
  failures: string[];
}

function requireCondition(failures: string[], condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

function hasPixelValue(value: number | null): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * Deterministically assesses captured evidence from the exact imported-plugin P5 v3 self-test.
 * This function cannot mint runtime proof; it only reviews a result that the real Figma runtime produced.
 */
export function assessP5RuntimeAcceptance(
  result: P5RuntimeCalibrationResult,
): P5RuntimeAcceptanceAssessment {
  const failures: string[] = [];

  requireCondition(failures, result.schemaVersion === 1, 'Unsupported P5 runtime evidence schema.');
  requireCondition(failures, result.passed === true, 'P5 runtime self-test did not report overall PASS.');

  requireCondition(failures, result.forcedReject.validationRejected, 'Forced-reject validation was not rejected.');
  requireCondition(failures, result.forcedReject.pixelEvidenceReturned, 'Forced-reject path returned no rendered-pixel evidence.');
  requireCondition(failures, hasPixelValue(result.forcedReject.changedPixelPct), 'Forced-reject path has no valid changed-pixel percentage.');
  requireCondition(failures, result.forcedReject.candidateDeleted, 'Forced-reject candidate was not deleted.');
  requireCondition(failures, result.forcedReject.originalUntouched, 'Forced-reject original was not preserved exactly.');

  requireCondition(failures, result.passRestore.validationPassed, 'Restore path Full P3 validation did not pass.');
  requireCondition(failures, result.passRestore.pixelEvidenceReturned, 'Restore path returned no rendered-pixel evidence.');
  requireCondition(failures, hasPixelValue(result.passRestore.changedPixelPct), 'Restore path has no valid changed-pixel percentage.');
  requireCondition(failures, result.passRestore.committed, 'Restore path did not commit the validated candidate.');
  requireCondition(failures, result.passRestore.restored, 'Restore path did not restore the retained approved original.');
  requireCondition(failures, result.passRestore.checkpointCleared, 'Restore path left a checkpoint pending.');

  requireCondition(failures, result.passFinalize.validationPassed, 'Finalize path Full P3 validation did not pass.');
  requireCondition(failures, result.passFinalize.pixelEvidenceReturned, 'Finalize path returned no rendered-pixel evidence.');
  requireCondition(failures, hasPixelValue(result.passFinalize.changedPixelPct), 'Finalize path has no valid changed-pixel percentage.');
  requireCondition(failures, result.passFinalize.committed, 'Finalize path did not commit the validated candidate.');
  requireCondition(failures, result.passFinalize.finalized, 'Finalize path did not finalize the checkpoint.');
  requireCondition(failures, result.passFinalize.candidateRetained, 'Finalize path did not retain the committed candidate.');
  requireCondition(failures, result.passFinalize.originalDiscarded, 'Finalize path did not discard the retained previous original.');
  requireCondition(failures, result.passFinalize.checkpointCleared, 'Finalize path left a checkpoint pending.');

  requireCondition(failures, result.leftovers === 0, `Runtime calibration left ${result.leftovers} temporary node(s).`);

  return { accepted: failures.length === 0, failures };
}
