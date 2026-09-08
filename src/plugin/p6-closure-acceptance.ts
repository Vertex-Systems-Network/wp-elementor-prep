import {
  isTraceableP5RuntimeBuildIdentity,
  sameP5RuntimeBuildIdentity,
  type P5RuntimeBuildIdentity,
} from '../core/p5-runtime-gate';
import { assessP6PreservationRefusalAcceptance } from './p6-refusal-acceptance';
import type { P6PreservationRefusalEvidenceBundle } from './p6-refusal-evidence';
import { assessP6PositiveCalibrationAcceptance } from './p6-runtime-acceptance';
import type { P6RuntimeEvidenceBundle } from './p6-runtime-evidence';

export interface P6ClosureEvidencePair {
  positive: P6RuntimeEvidenceBundle | null;
  refusal: P6PreservationRefusalEvidenceBundle | null;
}

export interface P6ClosureAcceptanceAssessment {
  accepted: boolean;
  failures: string[];
  positiveAvailable: boolean;
  refusalAvailable: boolean;
  positiveAccepted: boolean;
  refusalAccepted: boolean;
  currentBuildTraceable: boolean;
  positiveMatchesCurrentBuild: boolean;
  refusalMatchesCurrentBuild: boolean;
}

function requireCondition(failures: string[], condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

export function assessP6ClosureAcceptance(
  currentBuild: P5RuntimeBuildIdentity,
  evidence: P6ClosureEvidencePair,
): P6ClosureAcceptanceAssessment {
  const failures: string[] = [];
  const currentBuildTraceable = isTraceableP5RuntimeBuildIdentity(currentBuild);
  const positiveAvailable = evidence.positive !== null;
  const refusalAvailable = evidence.refusal !== null;
  const positiveAssessment = evidence.positive
    ? assessP6PositiveCalibrationAcceptance(evidence.positive)
    : { accepted: false, failures: ['No retained accepted P6 positive calibration evidence is available.'] };
  const refusalAssessment = evidence.refusal
    ? assessP6PreservationRefusalAcceptance(evidence.refusal)
    : { accepted: false, failures: ['No retained accepted P6 preservation-refusal evidence is available.'] };
  const positiveMatchesCurrentBuild = Boolean(
    evidence.positive
    && currentBuildTraceable
    && isTraceableP5RuntimeBuildIdentity(evidence.positive.build)
    && sameP5RuntimeBuildIdentity(evidence.positive.build, currentBuild),
  );
  const refusalMatchesCurrentBuild = Boolean(
    evidence.refusal
    && currentBuildTraceable
    && isTraceableP5RuntimeBuildIdentity(evidence.refusal.build)
    && sameP5RuntimeBuildIdentity(evidence.refusal.build, currentBuild),
  );

  requireCondition(failures, currentBuildTraceable, 'The currently loaded P6 plugin is not a traceable CI-built artifact.');
  if (!positiveAvailable) failures.push(...positiveAssessment.failures);
  else if (!positiveAssessment.accepted) failures.push(...positiveAssessment.failures.map((failure) => `Positive evidence: ${failure}`));
  if (!refusalAvailable) failures.push(...refusalAssessment.failures);
  else if (!refusalAssessment.accepted) failures.push(...refusalAssessment.failures.map((failure) => `Refusal evidence: ${failure}`));
  requireCondition(failures, !positiveAvailable || positiveMatchesCurrentBuild, 'Retained P6 positive calibration evidence was captured by a different plugin build.');
  requireCondition(failures, !refusalAvailable || refusalMatchesCurrentBuild, 'Retained P6 preservation-refusal evidence was captured by a different plugin build.');

  return {
    accepted: failures.length === 0,
    failures,
    positiveAvailable,
    refusalAvailable,
    positiveAccepted: positiveAssessment.accepted,
    refusalAccepted: refusalAssessment.accepted,
    currentBuildTraceable,
    positiveMatchesCurrentBuild,
    refusalMatchesCurrentBuild,
  };
}
