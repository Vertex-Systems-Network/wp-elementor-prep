import type { P7RuntimeEvidenceSnapshot } from '../core/batch-runtime-evidence';
import type { P7RuntimeClosureExportBundle } from './p7-runtime-evidence-inspector';
import { assessP7RuntimeAcceptance } from './p7-runtime-acceptance';
import { assessP7RuntimeClosure } from './p7-runtime-evidence-inspector';
import {
  isTraceableP7BuildIdentity,
  sameP7BuildIdentity,
  type P7BuildIdentity,
} from './p7-build-identity';
import type { P7StoredRuntimeAcceptanceAssessment } from './p7-runtime-acceptance-loader';

export interface P7ClosureVerification {
  accepted: boolean;
  failures: string[];
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function stringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function sameFailures(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function looksLikeBundle(value: unknown): value is P7RuntimeClosureExportBundle {
  const bundle = objectValue(value);
  if (!bundle || bundle.schemaVersion !== 1 || !objectValue(bundle.currentBuild)) return false;
  const prerequisite = objectValue(bundle.p5Prerequisite);
  const runtimeAcceptance = objectValue(bundle.runtimeAcceptance);
  return Boolean(
    prerequisite
    && typeof prerequisite.valid === 'boolean'
    && (prerequisite.passedAt === null || typeof prerequisite.passedAt === 'string')
    && runtimeAcceptance
    && typeof runtimeAcceptance.accepted === 'boolean'
    && stringArray(runtimeAcceptance.failures)
    && typeof bundle.accepted === 'boolean'
    && stringArray(bundle.failures)
    && (bundle.stress === null || objectValue(bundle.stress))
    && (bundle.cancellation === null || objectValue(bundle.cancellation)),
  );
}

function recomputeRuntime(
  stress: P7RuntimeEvidenceSnapshot | null,
  cancellation: P7RuntimeEvidenceSnapshot | null,
): P7StoredRuntimeAcceptanceAssessment {
  const evidence = { stress, cancellation };
  const failures: string[] = [];
  if (!stress) failures.push('No retained 60+ Frame completed stress-run evidence is available.');
  if (!cancellation) failures.push('No retained active-frame cancellation evidence is available.');
  if (!stress || !cancellation) return { accepted: false, failures, evidence };
  const assessment = assessP7RuntimeAcceptance({ stress, cancellation });
  return { ...assessment, evidence };
}

/** Recomputes exported P7 closure and binds it to the exact packaged verifier artifact. */
export function verifyP7ClosureExportBundle(
  value: unknown,
  expectedBuild: P7BuildIdentity,
): P7ClosureVerification {
  const failures: string[] = [];
  if (!looksLikeBundle(value)) {
    return { accepted: false, failures: ['Malformed or unsupported P7 closure export bundle.'] };
  }

  if (!isTraceableP7BuildIdentity(expectedBuild)) {
    failures.push('Offline verifier artifact is not bound to a traceable CI build.');
  } else if (!isTraceableP7BuildIdentity(value.currentBuild) || !sameP7BuildIdentity(value.currentBuild, expectedBuild)) {
    failures.push('P7 closure bundle belongs to a different build than this verifier artifact.');
  }

  let runtimeAssessment: P7StoredRuntimeAcceptanceAssessment;
  try {
    runtimeAssessment = recomputeRuntime(value.stress, value.cancellation);
  } catch {
    return { accepted: false, failures: [...failures, 'P7 runtime evidence could not be evaluated by the canonical assessor.'] };
  }

  if (
    value.runtimeAcceptance.accepted !== runtimeAssessment.accepted
    || !sameFailures(value.runtimeAcceptance.failures, runtimeAssessment.failures)
  ) {
    failures.push('Stored P7 runtime-acceptance verdict does not match canonical recomputation.');
  }

  let closure;
  try {
    closure = assessP7RuntimeClosure(runtimeAssessment, value.p5Prerequisite, value.currentBuild);
  } catch {
    return { accepted: false, failures: [...failures, 'P7 closure could not be evaluated by the canonical assessor.'] };
  }

  if (value.accepted !== closure.accepted || !sameFailures(value.failures, closure.failures)) {
    failures.push('Stored P7 closure verdict does not match canonical recomputation.');
  }
  if (!closure.accepted) failures.push(...closure.failures);

  return { accepted: failures.length === 0, failures };
}
