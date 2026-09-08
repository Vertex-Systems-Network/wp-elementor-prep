// Bump this whenever a material P5 mutation/validation/runtime-safety change requires the
// imported development plugin to prove the compiled path again before mutation can unlock.
export const P5_RUNTIME_GATE_VERSION = 'p5-runtime-proof-v3';
export const P5_RUNTIME_PROOF_STORAGE_KEY = 'pella-elementor-prep:p5-runtime-proof';

export interface P5RuntimeBuildIdentity {
  sourceSha: string;
  runId: string;
  runNumber: string;
}

export interface P5RuntimeProof {
  schemaVersion: 1;
  gateVersion: string;
  passedAt: string;
  build: P5RuntimeBuildIdentity;
}

export function isTraceableP5RuntimeBuildIdentity(value: unknown): value is P5RuntimeBuildIdentity {
  if (typeof value !== 'object' || value === null) return false;
  const build = value as Partial<P5RuntimeBuildIdentity>;
  return (
    typeof build.sourceSha === 'string'
    && /^[0-9a-f]{40}$/i.test(build.sourceSha)
    && typeof build.runId === 'string'
    && /^[1-9][0-9]*$/.test(build.runId)
    && typeof build.runNumber === 'string'
    && /^[1-9][0-9]*$/.test(build.runNumber)
  );
}

export function sameP5RuntimeBuildIdentity(
  left: P5RuntimeBuildIdentity,
  right: P5RuntimeBuildIdentity,
): boolean {
  return (
    left.sourceSha === right.sourceSha
    && left.runId === right.runId
    && left.runNumber === right.runNumber
  );
}

export function createP5RuntimeProof(
  build: P5RuntimeBuildIdentity,
  passedAt = new Date().toISOString(),
): P5RuntimeProof {
  return {
    schemaVersion: 1,
    gateVersion: P5_RUNTIME_GATE_VERSION,
    passedAt,
    build: { ...build },
  };
}

export function isValidP5RuntimeProof(
  value: unknown,
  expectedBuild?: P5RuntimeBuildIdentity,
): value is P5RuntimeProof {
  if (typeof value !== 'object' || value === null) return false;
  const proof = value as Partial<P5RuntimeProof>;
  if (
    proof.schemaVersion !== 1
    || proof.gateVersion !== P5_RUNTIME_GATE_VERSION
    || typeof proof.passedAt !== 'string'
    || proof.passedAt.length === 0
    || !isTraceableP5RuntimeBuildIdentity(proof.build)
  ) {
    return false;
  }

  if (expectedBuild !== undefined) {
    if (!isTraceableP5RuntimeBuildIdentity(expectedBuild)) return false;
    if (!sameP5RuntimeBuildIdentity(proof.build, expectedBuild)) return false;
  }

  return true;
}
