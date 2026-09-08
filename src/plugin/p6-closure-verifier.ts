import {
  isTraceableP5RuntimeBuildIdentity,
  sameP5RuntimeBuildIdentity,
  type P5RuntimeBuildIdentity,
} from '../core/p5-runtime-gate';
import {
  assessP6ClosureAcceptance,
  type P6ClosureAcceptanceAssessment,
  type P6ClosureEvidencePair,
} from './p6-closure-acceptance';
import type { P6ClosureExportBundle } from './p6-closure-inspector';

export interface P6ClosureVerification {
  accepted: boolean;
  failures: string[];
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function stringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isBuildIdentity(value: unknown): value is P5RuntimeBuildIdentity {
  return isTraceableP5RuntimeBuildIdentity(value);
}

function looksLikeEvidencePair(value: unknown): value is P6ClosureEvidencePair {
  const pair = objectValue(value);
  return Boolean(
    pair
    && (pair.positive === null || objectValue(pair.positive))
    && (pair.refusal === null || objectValue(pair.refusal)),
  );
}

function looksLikeAssessment(value: unknown): value is P6ClosureAcceptanceAssessment {
  const assessment = objectValue(value);
  if (!assessment || typeof assessment.accepted !== 'boolean' || !stringArray(assessment.failures)) return false;
  return [
    'positiveAvailable',
    'refusalAvailable',
    'positiveAccepted',
    'refusalAccepted',
    'imageBearingPositiveEvidence',
    'currentBuildTraceable',
    'positiveMatchesCurrentBuild',
    'refusalMatchesCurrentBuild',
  ].every((key) => typeof assessment[key] === 'boolean');
}

function sameAssessment(
  left: P6ClosureAcceptanceAssessment,
  right: P6ClosureAcceptanceAssessment,
): boolean {
  return left.accepted === right.accepted
    && left.failures.length === right.failures.length
    && left.failures.every((value, index) => value === right.failures[index])
    && left.positiveAvailable === right.positiveAvailable
    && left.refusalAvailable === right.refusalAvailable
    && left.positiveAccepted === right.positiveAccepted
    && left.refusalAccepted === right.refusalAccepted
    && left.imageBearingPositiveEvidence === right.imageBearingPositiveEvidence
    && left.currentBuildTraceable === right.currentBuildTraceable
    && left.positiveMatchesCurrentBuild === right.positiveMatchesCurrentBuild
    && left.refusalMatchesCurrentBuild === right.refusalMatchesCurrentBuild;
}

/** Recomputes P6 closure from exported evidence and binds it to the exact packaged artifact. */
export function verifyP6ClosureExportBundle(
  value: unknown,
  expectedBuild: P5RuntimeBuildIdentity,
): P6ClosureVerification {
  const failures: string[] = [];
  const bundle = objectValue(value);
  if (
    !bundle
    || bundle.schemaVersion !== 1
    || !isBuildIdentity(bundle.currentBuild)
    || !looksLikeAssessment(bundle.acceptance)
    || !looksLikeEvidencePair(bundle.evidence)
  ) {
    return { accepted: false, failures: ['Malformed or unsupported P6 closure export bundle.'] };
  }

  if (!isTraceableP5RuntimeBuildIdentity(expectedBuild)) {
    failures.push('Offline verifier artifact is not bound to a traceable CI build.');
  } else if (!sameP5RuntimeBuildIdentity(bundle.currentBuild, expectedBuild)) {
    failures.push('P6 closure bundle belongs to a different build than this verifier artifact.');
  }

  let recomputed: P6ClosureAcceptanceAssessment;
  try {
    recomputed = assessP6ClosureAcceptance(bundle.currentBuild, bundle.evidence);
  } catch {
    return { accepted: false, failures: [...failures, 'P6 closure evidence could not be evaluated by the canonical assessor.'] };
  }

  if (!sameAssessment(bundle.acceptance, recomputed)) {
    failures.push('Stored P6 closure verdict does not match the canonical recomputed assessment.');
  }
  if (!recomputed.accepted) failures.push(...recomputed.failures);

  return { accepted: failures.length === 0, failures };
}

export function asP6ClosureExportBundle(value: unknown): P6ClosureExportBundle | null {
  const bundle = objectValue(value);
  return bundle
    && bundle.schemaVersion === 1
    && isBuildIdentity(bundle.currentBuild)
    && looksLikeAssessment(bundle.acceptance)
    && looksLikeEvidencePair(bundle.evidence)
    ? bundle as unknown as P6ClosureExportBundle
    : null;
}
