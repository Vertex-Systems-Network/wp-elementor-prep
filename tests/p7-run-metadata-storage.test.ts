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

describe('P7 run metadata storage adapter', () => {
  it('hydrates queue inputs from compact persisted run keys', async () => {
    const memory = new MemoryStorage();
    memory.values.set(P7_BATCH_RUN_METADATA_STORAGE_KEY, {
      schemaVersion: 1,
      entries: {
        '1': { runKey: 'plugin-v1:recipes-v2', completedAt: '2026-09-08T00:00:00.000Z' },
      },
    });
    const storage = new P7RunMetadataStorage(memory);

    const inputs = await storage.hydrateInputs([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
    ]);

    expect(inputs[0]?.previousRunKey).toBe('plugin-v1:recipes-v2');
    expect(inputs[1]?.previousRunKey).toBeNull();
    expect(memory.writes).toBe(0);
  });

  it('fails closed to empty metadata when storage read throws', async () => {
    const memory = new MemoryStorage();
    memory.failReads = true;
    const storage = new P7RunMetadataStorage(memory);

    const inputs = await storage.hydrateInputs([{ frameId: '1', frameName: 'Home' }]);
    expect(inputs[0]?.previousRunKey).toBeNull();
    expect(memory.writes).toBe(0);
  });

  it('persists only successful frames after a batch state settles', async () => {
    const memory = new MemoryStorage();
    const storage = new P7RunMetadataStorage(memory);
    let queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
    ], 'plugin-v3:recipes-v4');

    queue = startNextBatchItem(queue);
    queue = finishRunningBatchItem(queue, { status: 'SUCCEEDED' });
    queue = startNextBatchItem(queue);
    queue = finishRunningBatchItem(queue, { status: 'FAILED', error: 'fixture failure' });

    const stored = await storage.recordSuccessfulState(queue, '2026-09-08T01:00:00.000Z');
    expect(stored.entries['1']?.runKey).toBe('plugin-v3:recipes-v4');
    expect(stored.entries['2']).toBeUndefined();
    expect(memory.writes).toBe(1);
  });

  it('respects the configured metadata cap', async () => {
    const memory = new MemoryStorage();
    memory.values.set(P7_BATCH_RUN_METADATA_STORAGE_KEY, {
      schemaVersion: 1,
      entries: {
        old: { runKey: 'old', completedAt: '2026-09-01T00:00:00.000Z' },
        recent: { runKey: 'recent', completedAt: '2026-09-07T00:00:00.000Z' },
      },
    });
    const storage = new P7RunMetadataStorage(memory, P7_BATCH_RUN_METADATA_STORAGE_KEY, 2);
    let queue = createBatchQueue([{ frameId: 'new', frameName: 'New' }], 'current');
    queue = startNextBatchItem(queue);
    queue = finishRunningBatchItem(queue, { status: 'SUCCEEDED' });

    const stored = await storage.recordSuccessfulState(queue, '2026-09-08T00:00:00.000Z');
    expect(Object.keys(stored.entries).sort()).toEqual(['new', 'recent']);
  });
});
