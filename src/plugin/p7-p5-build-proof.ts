import {
  isValidP5RuntimeProof,
  P5_RUNTIME_GATE_VERSION,
  P5_RUNTIME_PROOF_STORAGE_KEY,
  type P5RuntimeProof,
} from '../core/p5-runtime-gate';
import type { P7RuntimeBuildIdentity } from '../core/batch-runtime-evidence';
import {
  isTraceableP7BuildIdentity,
  sameP7BuildIdentity,
} from './p7-build-identity';

export const P7_P5_BUILD_PROOF_STORAGE_KEY = 'pella-elementor-prep:p7-p5-build-proof-v1';

export interface P7P5BuildProofReceipt {
  schemaVersion: 1;
  gateVersion: string;
  proofPassedAt: string;
  build: P7RuntimeBuildIdentity;
}

export interface P7P5BuildProofStorage {
  getAsync(key: string): Promise<unknown>;
  setAsync(key: string, value: unknown): Promise<void>;
  deleteAsync(key: string): Promise<void>;
}

export interface P7P5BuildProofState {
  valid: boolean;
  passedAt: string | null;
}

export function createP7P5BuildProofReceipt(
  proof: P5RuntimeProof,
  build: P7RuntimeBuildIdentity,
): P7P5BuildProofReceipt {
  if (!isTraceableP7BuildIdentity(build)) {
    throw new Error('P7 P5 proof receipt requires a traceable CI build identity.');
  }
  return {
    schemaVersion: 1,
    gateVersion: proof.gateVersion,
    proofPassedAt: proof.passedAt,
    build: { ...build },
  };
}

export function isValidP7P5BuildProofReceipt(
  coreProof: unknown,
  receipt: unknown,
  expectedBuild: P7RuntimeBuildIdentity,
): receipt is P7P5BuildProofReceipt {
  if (!isValidP5RuntimeProof(coreProof) || !isTraceableP7BuildIdentity(expectedBuild)) return false;
  if (!receipt || typeof receipt !== 'object') return false;
  const candidate = receipt as Partial<P7P5BuildProofReceipt>;
  const build = candidate.build;
  return candidate.schemaVersion === 1
    && candidate.gateVersion === P5_RUNTIME_GATE_VERSION
    && candidate.gateVersion === coreProof.gateVersion
    && candidate.proofPassedAt === coreProof.passedAt
    && isTraceableP7BuildIdentity(build)
    && sameP7BuildIdentity(build, expectedBuild);
}

/**
 * After deterministic P5 acceptance, bind the resulting core proof to this exact compiled P7 CI build.
 * A local/untraceable build is deliberately refused so stale proof cannot unlock batch mutation.
 */
export async function syncP7P5BuildProofReceipt(
  storage: P7P5BuildProofStorage,
  coreProof: unknown,
  build: P7RuntimeBuildIdentity,
): Promise<boolean> {
  if (!isValidP5RuntimeProof(coreProof) || !isTraceableP7BuildIdentity(build)) {
    await storage.deleteAsync(P7_P5_BUILD_PROOF_STORAGE_KEY);
    return false;
  }
  await storage.setAsync(
    P7_P5_BUILD_PROOF_STORAGE_KEY,
    createP7P5BuildProofReceipt(coreProof, build),
  );
  return true;
}

/** Read-side failures and stale/mismatched receipts fail closed. */
export async function readP7P5BuildProofState(
  storage: P7P5BuildProofStorage,
  expectedBuild: P7RuntimeBuildIdentity,
): Promise<P7P5BuildProofState> {
  try {
    const [coreProof, receipt] = await Promise.all([
      storage.getAsync(P5_RUNTIME_PROOF_STORAGE_KEY),
      storage.getAsync(P7_P5_BUILD_PROOF_STORAGE_KEY),
    ]);
    if (
      !isValidP5RuntimeProof(coreProof)
      || !isValidP7P5BuildProofReceipt(coreProof, receipt, expectedBuild)
    ) {
      return { valid: false, passedAt: null };
    }
    return { valid: true, passedAt: coreProof.passedAt };
  } catch {
    return { valid: false, passedAt: null };
  }
}

export async function clearP7P5BuildProofReceipt(storage: P7P5BuildProofStorage): Promise<void> {
  await storage.deleteAsync(P7_P5_BUILD_PROOF_STORAGE_KEY);
}
