import { describe, expect, it } from 'vitest';
import { createBatchQueue, finishRunningBatchItem, startNextBatchItem } from '../src/core/batch-queue';
import {
  P7_BATCH_RUN_METADATA_STORAGE_KEY,
  P7RunMetadataStorage,
  type AsyncKeyValueStorage,
} from '../src/plugin/p7-run-metadata-storage';

class MemoryStorage implements AsyncKeyValueStorage {
  values = new Map<string, unknown>();
  reads = 0;
  writes = 0;
  failReads = false;

  async getAsync(key: string): Promise<unknown> {
    this.reads += 1;
    if (this.failReads) throw new Error('read failed');
    return this.values.get(key);
  }

  async setAsync(key: string, value: unknown): Promise<void> {
    this.writes += 1;
    this.values.set(key, value);
  }
}

function successfulQueue(frameId = 'frame-1', runKey = 'run-current') {
  let state = createBatchQueue([{ frameId, frameName: 'Frame' }], runKey);
  state = startNextBatchItem(state);
  return finishRunningBatchItem(state, { status: 'SUCCEEDED' });
}

describe('P7 run metadata write safety', () => {
  it('does not write an empty-derived replacement when the pre-write read fails', async () => {
    const memory = new MemoryStorage();
    const existing = {
      schemaVersion: 1,
      entries: {
        existing: { runKey: 'old-run', completedAt: '2026-09-01T00:00:00.000Z' },
      },
    };
    memory.values.set(P7_BATCH_RUN_METADATA_STORAGE_KEY, existing);
    memory.failReads = true;
    const storage = new P7RunMetadataStorage(memory);

    await expect(storage.recordSuccessfulState(successfulQueue())).rejects.toThrow('read failed');

    expect(memory.reads).toBe(1);
    expect(memory.writes).toBe(0);
    expect(memory.values.get(P7_BATCH_RUN_METADATA_STORAGE_KEY)).toEqual(existing);
  });

  it('keeps hydration fail-closed to re-audit when a read fails', async () => {
    const memory = new MemoryStorage();
    memory.failReads = true;
    const storage = new P7RunMetadataStorage(memory);

    const hydrated = await storage.hydrateInputs([{ frameId: 'frame-1', frameName: 'Frame' }]);

    expect(hydrated[0]?.previousRunKey).toBeNull();
    expect(memory.writes).toBe(0);
  });

  it('refuses to overwrite a present metadata payload from a newer schema', async () => {
    const memory = new MemoryStorage();
    const futurePayload = {
      schemaVersion: 2,
      entries: {
        future: { runKey: 'future-run', completedAt: '2026-09-08T02:00:00.000Z' },
      },
      futureField: true,
    };
    memory.values.set(P7_BATCH_RUN_METADATA_STORAGE_KEY, futurePayload);
    const storage = new P7RunMetadataStorage(memory);

    const hydrated = await storage.hydrateInputs([{ frameId: 'frame-1', frameName: 'Frame' }]);
    expect(hydrated[0]?.previousRunKey).toBeNull();

    await expect(storage.recordSuccessfulState(successfulQueue())).rejects.toThrow('unsupported or malformed');
    expect(memory.writes).toBe(0);
    expect(memory.values.get(P7_BATCH_RUN_METADATA_STORAGE_KEY)).toEqual(futurePayload);
  });

  it('refuses to overwrite a malformed present metadata envelope', async () => {
    const memory = new MemoryStorage();
    memory.values.set(P7_BATCH_RUN_METADATA_STORAGE_KEY, 'legacy-or-corrupt-payload');
    const storage = new P7RunMetadataStorage(memory);

    await expect(storage.recordSuccessfulState(successfulQueue())).rejects.toThrow('malformed');
    expect(memory.writes).toBe(0);
    expect(memory.values.get(P7_BATCH_RUN_METADATA_STORAGE_KEY)).toBe('legacy-or-corrupt-payload');
  });

  it('preserves the first completion timestamp for an already-recorded identical run key', async () => {
    const memory = new MemoryStorage();
    memory.values.set(P7_BATCH_RUN_METADATA_STORAGE_KEY, {
      schemaVersion: 1,
      entries: {
        'frame-1': { runKey: 'run-current', completedAt: '2026-09-08T01:00:00.000Z' },
      },
    });
    const storage = new P7RunMetadataStorage(memory);

    const metadata = await storage.recordSuccessfulState(
      successfulQueue('frame-1', 'run-current'),
      '2026-09-08T05:00:00.000Z',
    );

    expect(metadata.entries['frame-1']?.completedAt).toBe('2026-09-08T01:00:00.000Z');
    expect(memory.writes).toBe(0);
  });

  it('writes once when the same live frame completes under a new compatibility run key', async () => {
    const memory = new MemoryStorage();
    memory.values.set(P7_BATCH_RUN_METADATA_STORAGE_KEY, {
      schemaVersion: 1,
      entries: {
        'frame-1': { runKey: 'run-old', completedAt: '2026-09-08T01:00:00.000Z' },
        other: { runKey: 'other-run', completedAt: '2026-09-07T01:00:00.000Z' },
      },
    });
    const storage = new P7RunMetadataStorage(memory);

    const metadata = await storage.recordSuccessfulState(
      successfulQueue('frame-1', 'run-new'),
      '2026-09-08T05:00:00.000Z',
    );

    expect(metadata.entries['frame-1']).toEqual({
      runKey: 'run-new',
      completedAt: '2026-09-08T05:00:00.000Z',
    });
    expect(metadata.entries.other?.runKey).toBe('other-run');
    expect(memory.writes).toBe(1);
  });
});
