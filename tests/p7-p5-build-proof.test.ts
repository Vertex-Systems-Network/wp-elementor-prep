import { describe, expect, it } from 'vitest';
import {
  createP5RuntimeProof,
  P5_RUNTIME_PROOF_STORAGE_KEY,
} from '../src/core/p5-runtime-gate';
import type { P7RuntimeBuildIdentity } from '../src/core/batch-runtime-evidence';
import {
  createP7P5BuildProofReceipt,
  isValidP7P5BuildProofReceipt,
  P7_P5_BUILD_PROOF_STORAGE_KEY,
  readP7P5BuildProofState,
  syncP7P5BuildProofReceipt,
} from '../src/plugin/p7-p5-build-proof';

const BUILD_A: P7RuntimeBuildIdentity = {
  sourceSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  runId: '1001',
  runNumber: '77',
};
const BUILD_B: P7RuntimeBuildIdentity = {
  sourceSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  runId: '1002',
  runNumber: '78',
};

class MemoryStorage {
  values = new Map<string, unknown>();
  failReads = false;

  async getAsync(key: string): Promise<unknown> {
    if (this.failReads) throw new Error('read failed');
    return this.values.get(key);
  }

  async setAsync(key: string, value: unknown): Promise<void> {
    this.values.set(key, value);
  }

  async deleteAsync(key: string): Promise<void> {
    this.values.delete(key);
  }
}

describe('P7 build-bound P5 runtime proof', () => {
  it('accepts only the exact core proof timestamp and exact traceable build', async () => {
    const storage = new MemoryStorage();
    const proof = createP5RuntimeProof('2026-09-08T12:00:00.000Z');
    storage.values.set(P5_RUNTIME_PROOF_STORAGE_KEY, proof);
    expect(await syncP7P5BuildProofReceipt(storage, proof, BUILD_A)).toBe(true);

    await expect(readP7P5BuildProofState(storage, BUILD_A)).resolves.toEqual({
      valid: true,
      passedAt: proof.passedAt,
    });
    await expect(readP7P5BuildProofState(storage, BUILD_B)).resolves.toEqual({
      valid: false,
      passedAt: null,
    });
  });

  it('rejects a receipt when the core proof was regenerated later', () => {
    const oldProof = createP5RuntimeProof('2026-09-08T12:00:00.000Z');
    const newProof = createP5RuntimeProof('2026-09-08T12:05:00.000Z');
    const receipt = createP7P5BuildProofReceipt(oldProof, BUILD_A);
    expect(isValidP7P5BuildProofReceipt(newProof, receipt, BUILD_A)).toBe(false);
  });

  it('refuses local/untraceable builds and deletes any stale receipt', async () => {
    const storage = new MemoryStorage();
    const proof = createP5RuntimeProof('2026-09-08T12:00:00.000Z');
    storage.values.set(P5_RUNTIME_PROOF_STORAGE_KEY, proof);
    storage.values.set(P7_P5_BUILD_PROOF_STORAGE_KEY, createP7P5BuildProofReceipt(proof, BUILD_A));

    expect(await syncP7P5BuildProofReceipt(
      storage,
      proof,
      { sourceSha: 'local', runId: 'local', runNumber: 'local' },
    )).toBe(false);
    expect(storage.values.has(P7_P5_BUILD_PROOF_STORAGE_KEY)).toBe(false);
  });

  it('fails closed on corrupt receipt and storage read errors', async () => {
    const storage = new MemoryStorage();
    const proof = createP5RuntimeProof('2026-09-08T12:00:00.000Z');
    storage.values.set(P5_RUNTIME_PROOF_STORAGE_KEY, proof);
    storage.values.set(P7_P5_BUILD_PROOF_STORAGE_KEY, { schemaVersion: 1, gateVersion: proof.gateVersion });
    await expect(readP7P5BuildProofState(storage, BUILD_A)).resolves.toEqual({ valid: false, passedAt: null });

    storage.failReads = true;
    await expect(readP7P5BuildProofState(storage, BUILD_A)).resolves.toEqual({ valid: false, passedAt: null });
  });
});
