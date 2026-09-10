import type { P7RuntimeBuildIdentity } from '../core/batch-runtime-evidence';

/** A real acceptance-capable build must be traceable to one GitHub Actions source/run tuple. */
export function isTraceableP7BuildIdentity(
  build: P7RuntimeBuildIdentity | null | undefined,
): build is P7RuntimeBuildIdentity {
  return Boolean(
    build
    && /^[0-9a-f]{40}$/i.test(build.sourceSha)
    && /^\d+$/.test(build.runId)
    && /^\d+$/.test(build.runNumber),
  );
}

export function sameP7BuildIdentity(
  a: P7RuntimeBuildIdentity,
  b: P7RuntimeBuildIdentity,
): boolean {
  return a.sourceSha === b.sourceSha
    && a.runId === b.runId
    && a.runNumber === b.runNumber;
}
