import { describe, expect, it } from 'vitest';
import type { P5RuntimeCalibrationResult } from '../src/plugin/p5-runtime-calibration';
import { buildP5RuntimeEvidenceBundle } from '../src/plugin/p5-runtime-evidence';
import {
  loadLatestP5RuntimeEvidence,
  persistP5RuntimeEvidenceBestEffort,
  P5_RUNTIME_EVIDENCE_STORAGE_KEY,
  type P5EvidenceKeyValueStorage,
} from '../src/plugin/p5-runtime-evidence-storage';
import { buildP5RuntimeEvidenceViewerHtml } from '../src/plugin/p5-runtime-evidence-viewer';

class MemoryStorage implements P5EvidenceKeyValueStorage {
  values = new Map<string, unknown>();
  failReads = false;
  failWrites = false;

  async getAsync(key: string): Promise<unknown> {
    if (this.failReads) throw new Error('read failed');
    return this.values.get(key);
  }

  async setAsync(key: string, value: unknown): Promise<void> {
    if (this.failWrites) throw new Error('write failed');
    this.values.set(key, value);
  }
}

function result(): P5RuntimeCalibrationResult {
  return {
    schemaVersion: 1,
    passed: true,
    forcedReject: { state: 'REJECTED', validationRejected: true, pixelEvidenceReturned: true, changedPixelPct: 1, candidateDeleted: true, originalUntouched: true },
    passRestore: { state: 'COMMITTED', validationPassed: true, pixelEvidenceReturned: true, changedPixelPct: 0, committed: true, restored: true, checkpointCleared: true },
    passFinalize: { state: 'COMMITTED', validationPassed: true, pixelEvidenceReturned: true, changedPixelPct: 0, committed: true, finalized: true, candidateRetained: true, originalDiscarded: true, checkpointCleared: true },
    leftovers: 0,
  };
}

function evidence() {
  return buildP5RuntimeEvidenceBundle({
    pluginVersion: '0.1.0-alpha.1',
    result: result(),
    runtimeProofPassedAt: '2026-09-08T12:00:00.000Z',
    capturedAt: '2026-09-08T12:00:01.000Z',
  });
}

describe('P5 runtime evidence storage/viewer', () => {
  it('persists and reloads valid bounded evidence', async () => {
    const storage = new MemoryStorage();
    const bundle = evidence();
    expect(await persistP5RuntimeEvidenceBestEffort(storage, bundle)).toBe(true);
    expect(await loadLatestP5RuntimeEvidence(storage)).toEqual(bundle);
  });

  it('fails observationally on storage errors and ignores corrupt payloads', async () => {
    const storage = new MemoryStorage();
    storage.failWrites = true;
    await expect(persistP5RuntimeEvidenceBestEffort(storage, evidence())).resolves.toBe(false);

    storage.failWrites = false;
    storage.values.set(P5_RUNTIME_EVIDENCE_STORAGE_KEY, { schemaVersion: 99 });
    await expect(loadLatestP5RuntimeEvidence(storage)).resolves.toBeNull();

    storage.failReads = true;
    await expect(loadLatestP5RuntimeEvidence(storage)).resolves.toBeNull();
  });

  it('refuses superficially versioned but malformed nested evidence', async () => {
    const storage = new MemoryStorage();
    const malformed = evidence() as unknown as Record<string, unknown>;
    malformed.calibration = {
      schemaVersion: 1,
      passed: true,
      leftovers: 0,
      forcedReject: { state: 'REJECTED' },
      passRestore: {},
      passFinalize: {},
    };
    storage.values.set(P5_RUNTIME_EVIDENCE_STORAGE_KEY, malformed);
    await expect(loadLatestP5RuntimeEvidence(storage)).resolves.toBeNull();
  });

  it('refuses contradictory accepted evidence without a minted proof timestamp', async () => {
    const storage = new MemoryStorage();
    const contradictory = evidence();
    contradictory.runtimeProofPassedAt = null;
    storage.values.set(P5_RUNTIME_EVIDENCE_STORAGE_KEY, contradictory);
    await expect(loadLatestP5RuntimeEvidence(storage)).resolves.toBeNull();
  });

  it('renders acceptance status and escaped copyable bounded JSON', () => {
    const bundle = evidence();
    const html = buildP5RuntimeEvidenceViewerHtml(bundle);
    expect(html).toContain('P5 Compiled Runtime Acceptance');
    expect(html).toContain('Acceptance: PASS');
    expect(html).toContain('Copy bounded acceptance JSON');
    expect(html).toContain('p5-runtime-proof-v3');
  });

  it('escapes failure text before rendering', () => {
    const bundle = evidence();
    bundle.acceptance = { accepted: false, failures: ['<script>bad()</script>'] };
    bundle.runtimeProofPassedAt = null;
    const html = buildP5RuntimeEvidenceViewerHtml(bundle);
    expect(html).not.toContain('<script>bad()</script>');
    expect(html).toContain('&lt;script&gt;bad()&lt;/script&gt;');
  });
});
