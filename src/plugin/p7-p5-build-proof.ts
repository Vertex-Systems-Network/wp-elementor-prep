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

export interface P7P5BuildProofReadStorage {
  getAsync(key: string): Promise<unknown>;
}

export interface P7P5BuildProofStorage extends P7P5BuildProofReadStorage {
  setAsync(key: string, value: unknown): Promise<void>;
  deleteAsync(key: string): Promise<void>;
}

export interface P7P5BuildProofState {
  valid: boolean;
  passedAt: string | null;
}

export interface P7P5BuildProofEvidence {
  state: P7P5BuildProofState;
  coreProof: P5RuntimeProof | null;
  receipt: P7P5BuildProofReceipt | null;
}

function isP7P5BuildProofReceiptShape(value: unknown): value is P7P5BuildProofReceipt {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<P7P5BuildProofReceipt>;
  return candidate.schemaVersion === 1
    && typeof candidate.gateVersion === 'string'
    && typeof candidate.proofPassedAt === 'string'
    && candidate.proofPassedAt.length > 0
    && isTraceableP7BuildIdentity(candidate.build);
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
  if (!isP7P5BuildProofReceiptShape(receipt)) return false;
  return receipt.gateVersion === P5_RUNTIME_GATE_VERSION
    && receipt.gateVersion === coreProof.gateVersion
    && receipt.proofPassedAt === coreProof.passedAt
    && sameP7BuildIdentity(receipt.build, expectedBuild);
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

/**
 * Returns the verifiable prerequisite inputs alongside the recomputed state. Structurally valid but
 * stale/mismatched evidence is retained in the read-only export so offline review can reject it itself.
 */
export async function readP7P5BuildProofEvidence(
  storage: P7P5BuildProofReadStorage,
  expectedBuild: P7RuntimeBuildIdentity,
): Promise<P7P5BuildProofEvidence> {
  try {
    const [rawCoreProof, rawReceipt] = await Promise.all([
      storage.getAsync(P5_RUNTIME_PROOF_STORAGE_KEY),
      storage.getAsync(P7_P5_BUILD_PROOF_STORAGE_KEY),
    ]);
    const coreProof = isValidP5RuntimeProof(rawCoreProof) ? rawCoreProof : null;
    const receipt = isP7P5BuildProofReceiptShape(rawReceipt) ? rawReceipt : null;
    const valid = Boolean(
      coreProof
      && receipt
      && isValidP7P5BuildProofReceipt(coreProof, receipt, expectedBuild),
    );
    return {
      state: {
        valid,
        passedAt: valid && coreProof ? coreProof.passedAt : null,
      },
      coreProof,
      receipt,
    };
  } catch {
    return {
      state: { valid: false, passedAt: null },
      coreProof: null,
      receipt: null,
    };
  }
}

/** Read-side failures and stale/mismatched receipts fail closed. */
export async function readP7P5BuildProofState(
  storage: P7P5BuildProofReadStorage,
  expectedBuild: P7RuntimeBuildIdentity,
): Promise<P7P5BuildProofState> {
  return (await readP7P5BuildProofEvidence(storage, expectedBuild)).state;
}

export async function clearP7P5BuildProofReceipt(storage: P7P5BuildProofStorage): Promise<void> {
  await storage.deleteAsync(P7_P5_BUILD_PROOF_STORAGE_KEY);
}
