import {
  isTraceableP5RuntimeBuildIdentity,
  P5_RUNTIME_GATE_VERSION,
  sameP5RuntimeBuildIdentity,
  type P5RuntimeBuildIdentity,
} from '../core/p5-runtime-gate';
import { assessP5RuntimeAcceptance } from './p5-runtime-acceptance';
import { isP5RuntimeEvidenceBundle } from './p5-runtime-evidence-storage';

export interface P5RuntimeEvidenceVerification {
  accepted: boolean;
  failures: string[];
}

function sameFailures(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function validIsoTimestamp(value: string): boolean {
  return value.length > 0 && Number.isFinite(Date.parse(value));
}

/**
 * Re-verifies exported P5 closure evidence without trusting the stored acceptance verdict.
 * When expectedBuild is supplied, evidence must also match the exact packaged CI artifact.
 * This is pure/read-only and cannot mint proof or mutate Figma state.
 */
export function verifyP5RuntimeEvidence(
  value: unknown,
  expectedBuild?: P5RuntimeBuildIdentity,
): P5RuntimeEvidenceVerification {
  const failures: string[] = [];

  if (!isP5RuntimeEvidenceBundle(value)) {
    return { accepted: false, failures: ['Malformed or unsupported P5 runtime evidence bundle.'] };
  }

  if (value.runtimeGateVersion !== P5_RUNTIME_GATE_VERSION) {
    failures.push(`Runtime gate mismatch: expected ${P5_RUNTIME_GATE_VERSION}, got ${value.runtimeGateVersion}.`);
  }
  if (!isTraceableP5RuntimeBuildIdentity(value.build)) {
    failures.push('Evidence build provenance is not a traceable CI artifact.');
  }
  if (expectedBuild !== undefined) {
    if (!isTraceableP5RuntimeBuildIdentity(expectedBuild)) {
      failures.push('Offline verifier artifact is not bound to a traceable CI build.');
    } else if (!sameP5RuntimeBuildIdentity(value.build, expectedBuild)) {
      failures.push('Evidence was captured by a different build than this offline verifier artifact.');
    }
  }
  if (!validIsoTimestamp(value.capturedAt)) failures.push('Evidence capturedAt is not a valid timestamp.');
  if (!value.pluginVersion) failures.push('Evidence pluginVersion is empty.');

  const recomputed = assessP5RuntimeAcceptance(value.calibration);
  if (!recomputed.accepted) failures.push(...recomputed.failures);

  if (
    value.acceptance.accepted !== recomputed.accepted
    || !sameFailures(value.acceptance.failures, recomputed.failures)
  ) {
    failures.push('Stored acceptance verdict does not match the canonical recomputed assessment.');
  }

  if (recomputed.accepted) {
    if (value.runtimeProofPassedAt === null || !validIsoTimestamp(value.runtimeProofPassedAt)) {
      failures.push('Accepted evidence has no valid runtime proof timestamp.');
    }
  } else if (value.runtimeProofPassedAt !== null) {
    failures.push('Rejected evidence must not retain a runtime proof timestamp.');
  }

  return { accepted: failures.length === 0, failures };
}
