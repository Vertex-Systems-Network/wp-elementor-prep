// Bump this whenever a material P5 mutation/validation/runtime-safety change requires the
// imported development plugin to prove the compiled path again before mutation can unlock.
export const P5_RUNTIME_GATE_VERSION = 'p5-runtime-proof-v2';

export interface P5RuntimeProof {
  schemaVersion: 1;
  gateVersion: string;
  passedAt: string;
}

export function createP5RuntimeProof(passedAt = new Date().toISOString()): P5RuntimeProof {
  return {
    schemaVersion: 1,
    gateVersion: P5_RUNTIME_GATE_VERSION,
    passedAt,
  };
}

export function isValidP5RuntimeProof(value: unknown): value is P5RuntimeProof {
  if (typeof value !== 'object' || value === null) return false;
  const proof = value as Partial<P5RuntimeProof>;
  return (
    proof.schemaVersion === 1
    && proof.gateVersion === P5_RUNTIME_GATE_VERSION
    && typeof proof.passedAt === 'string'
    && proof.passedAt.length > 0
  );
}
