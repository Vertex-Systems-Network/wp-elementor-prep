import {
  isTraceableP5RuntimeBuildIdentity,
  isValidP5RuntimeProof,
  P5_RUNTIME_GATE_VERSION,
  sameP5RuntimeBuildIdentity,
  type P5RuntimeBuildIdentity,
} from '../core/p5-runtime-gate';
import {
  assessP5RuntimeAcceptance,
  type P5RuntimeAcceptanceAssessment,
} from './p5-runtime-acceptance';
import type { P5RuntimeEvidenceBundle } from './p5-runtime-evidence';
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

function sameAcceptance(left: P5RuntimeAcceptanceAssessment, right: P5RuntimeAcceptanceAssessment): boolean {
  return left.accepted === right.accepted
    && left.failures.length === right.failures.length
    && left.failures.every((value, index) => value === right.failures[index]);
}

function validIso(value: string | null): value is string {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

function looksLikeP5Evidence(value: unknown): value is P5RuntimeEvidenceBundle {
  const evidence = objectValue(value);
  if (!evidence) return false;
  const acceptance = objectValue(evidence.acceptance);
  return Boolean(
    evidence.schemaVersion === 2
    && typeof evidence.capturedAt === 'string'
    && typeof evidence.pluginVersion === 'string'
    && typeof evidence.runtimeGateVersion === 'string'
    && objectValue(evidence.build)
    && (evidence.runtimeProofPassedAt === null || typeof evidence.runtimeProofPassedAt === 'string')
    && acceptance
    && typeof acceptance.accepted === 'boolean'
    && stringArray(acceptance.failures)
    && objectValue(evidence.calibration),
  );
}

function assessP5Prerequisite(
  evidence: P5RuntimeEvidenceBundle | null,
  expectedBuild: P5RuntimeBuildIdentity,
): P5RuntimeAcceptanceAssessment {
  const failures: string[] = [];
  if (!evidence) {
    return { accepted: false, failures: ['P6 closure export contains no P5 runtime evidence prerequisite.'] };
  }

  if (evidence.runtimeGateVersion !== P5_RUNTIME_GATE_VERSION) {
    failures.push('P6 closure P5 evidence uses a different runtime-gate version.');
  }
  if (!isTraceableP5RuntimeBuildIdentity(evidence.build) || !sameP5RuntimeBuildIdentity(evidence.build, expectedBuild)) {
    failures.push('P6 closure P5 evidence belongs to a different build than this verifier artifact.');
  }

  const calibration = assessP5RuntimeAcceptance(evidence.calibration);
  failures.push(...calibration.failures);
  const recomputed: P5RuntimeAcceptanceAssessment = { accepted: failures.length === 0, failures: [...failures] };

  if (!sameAcceptance(evidence.acceptance, recomputed)) {
    failures.push('Stored P5 prerequisite acceptance does not match canonical recomputation.');
  }

  const capturedAtValid = validIso(evidence.capturedAt);
  if (!capturedAtValid) {
    failures.push('P5 prerequisite evidence has no valid capture timestamp.');
  }

  if (recomputed.accepted) {
    if (!validIso(evidence.runtimeProofPassedAt)) {
      failures.push('Accepted P5 prerequisite evidence has no valid runtime proof timestamp.');
    } else {
      const reconstructedProof = {
        schemaVersion: 1 as const,
        gateVersion: evidence.runtimeGateVersion,
        passedAt: evidence.runtimeProofPassedAt,
        build: { ...evidence.build },
      };
      if (!isValidP5RuntimeProof(reconstructedProof, expectedBuild)) {
        failures.push('Embedded P5 prerequisite does not reconstruct a valid exact-build runtime proof.');
      }
      if (capturedAtValid && Date.parse(evidence.runtimeProofPassedAt) > Date.parse(evidence.capturedAt)) {
        failures.push('Embedded P5 runtime proof timestamp is later than its evidence capture timestamp.');
      }
    }
  }

  return { accepted: failures.length === 0, failures };
}

function checkScenarioP5Binding(
  failures: string[],
  scenario: P6ClosureEvidencePair['positive'] | P6ClosureEvidencePair['refusal'],
  p5Evidence: P5RuntimeEvidenceBundle | null,
  label: string,
): void {
  if (!scenario || !p5Evidence) return;
  if (scenario.p5RuntimeGateVersion !== p5Evidence.runtimeGateVersion) {
    failures.push(`${label} P5 gate does not match exported P5 prerequisite evidence.`);
  }
  if (scenario.p5RuntimeProofPassedAt !== p5Evidence.runtimeProofPassedAt) {
    failures.push(`${label} P5 proof timestamp does not match exported P5 prerequisite evidence.`);
  }
  if (
    !scenario.p5RuntimeProofBuild
    || !sameP5RuntimeBuildIdentity(scenario.p5RuntimeProofBuild, p5Evidence.build)
  ) {
    failures.push(`${label} P5 proof build does not match exported P5 prerequisite evidence.`);
  }
}

/** Recomputes P6 closure and its P5 prerequisite from exported evidence, bound to this artifact. */
export function verifyP6ClosureExportBundle(
  value: unknown,
  expectedBuild: P5RuntimeBuildIdentity,
): P6ClosureVerification {
  const failures: string[] = [];
  const bundle = objectValue(value);
  if (
    !bundle
    || bundle.schemaVersion !== 2
    || !isBuildIdentity(bundle.currentBuild)
    || (bundle.p5Evidence !== null && !looksLikeP5Evidence(bundle.p5Evidence))
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

  const p5Evidence = bundle.p5Evidence as P5RuntimeEvidenceBundle | null;
  const p5Assessment = assessP5Prerequisite(p5Evidence, expectedBuild);
  if (!p5Assessment.accepted) failures.push(...p5Assessment.failures);

  checkScenarioP5Binding(failures, bundle.evidence.positive, p5Evidence, 'Positive evidence');
  checkScenarioP5Binding(failures, bundle.evidence.refusal, p5Evidence, 'Refusal evidence');

  let recomputed: P6ClosureAcceptanceAssessment;
  try {
    recomputed = assessP6ClosureAcceptance(expectedBuild, bundle.evidence);
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
    && bundle.schemaVersion === 2
    && isBuildIdentity(bundle.currentBuild)
    && (bundle.p5Evidence === null || looksLikeP5Evidence(bundle.p5Evidence))
    && looksLikeAssessment(bundle.acceptance)
    && looksLikeEvidencePair(bundle.evidence)
    ? bundle as unknown as P6ClosureExportBundle
    : null;
}
