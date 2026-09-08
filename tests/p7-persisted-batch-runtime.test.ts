import { describe, expect, it } from 'vitest';
import {
  createBatchQueue,
  finishRunningBatchItem,
  startNextBatchItem,
  type BatchQueueState,
} from '../src/core/batch-queue';
import type { CommitEvidence } from '../src/core/transaction-types';
import {
  createPersistedP7Queue,
  finalizeFigmaP7PersistedCheckpoint,
  persistP7DurableSuccesses,
  restoreFigmaP7PersistedCheckpoint,
  runPersistedP7Batch,
} from '../src/plugin/p7-persisted-batch-runtime';
import {
  P7_BATCH_RUN_METADATA_STORAGE_KEY,
  P7RunMetadataStorage,
  type AsyncKeyValueStorage,
} from '../src/plugin/p7-run-metadata-storage';
import type { P7CheckpointActions } from '../src/plugin/p7-checkpoint-resolution';

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

function successfulQueue(frameId = 'frame-1', runKey = 'run-current'): BatchQueueState {
  let state = createBatchQueue([{ frameId, frameName: 'Frame' }], runKey);
  state = startNextBatchItem(state);
  return finishRunningBatchItem(state, { status: 'SUCCEEDED' });
}

function checkpointQueue(): BatchQueueState {
  let state = createBatchQueue([{ frameId: 'source-frame', frameName: 'Frame' }], 'run-current');
  state = startNextBatchItem(state);
  return finishRunningBatchItem(state, {
    status: 'CHECKPOINT_PENDING',
    committedFrameId: 'committed-frame',
  });
}

function checkpointActions(options: { finalize?: boolean; restoredId?: string } = {}): P7CheckpointActions {
  return {
    async finalize() {
      return options.finalize ?? true;
    },
    async restore(): Promise<CommitEvidence> {
      return {
        transactionId: 'restore',
        originalNodeId: 'committed-frame',
        committedNodeId: options.restoredId ?? 'restored-frame',
      };
    },
  };
}

describe('P7 metadata write safety', () => {
  it('never writes from an empty fallback when the pre-write storage read fails', async () => {
    const memory = new MemoryStorage();
    memory.values.set(P7_BATCH_RUN_METADATA_STORAGE_KEY, {
      schemaVersion: 1,
      entries: {
        existing: { runKey: 'old-run', completedAt: '2026-09-01T00:00:00.000Z' },
      },
    });
    memory.failReads = true;
    const storage = new P7RunMetadataStorage(memory);

    await expect(storage.recordSuccessfulState(successfulQueue())).rejects.toThrow('read failed');
    expect(memory.writes).toBe(0);
    expect(memory.values.get(P7_BATCH_RUN_METADATA_STORAGE_KEY)).toEqual({
      schemaVersion: 1,
      entries: {
        existing: { runKey: 'old-run', completedAt: '2026-09-01T00:00:00.000Z' },
      },
    });
  });

  it('preserves the first completion timestamp and avoids duplicate writes for the same run key', async () => {
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

  it('reports persistence failure separately from the already-settled batch state', async () => {
    const memory = new MemoryStorage();
    memory.failReads = true;
    const storage = new P7RunMetadataStorage(memory);
    const state = successfulQueue();

    const persistence = await persistP7DurableSuccesses(state, storage);
    expect(persistence.ok).toBe(false);
    expect(persistence.error).toContain('read failed');
    expect(state.items[0]?.status).toBe('SUCCEEDED');
    expect(memory.writes).toBe(0);
  });
});

describe('P7 persisted lifecycle', () => {
  it('hydrates current-version successes before queue creation', async () => {
    const memory = new MemoryStorage();
    memory.values.set(P7_BATCH_RUN_METADATA_STORAGE_KEY, {
      schemaVersion: 1,
      entries: {
        done: { runKey: 'run-current', completedAt: '2026-09-08T01:00:00.000Z' },
      },
    });
    const storage = new P7RunMetadataStorage(memory);

    const state = await createPersistedP7Queue([
      { frameId: 'done', frameName: 'Done' },
      { frameId: 'todo', frameName: 'Todo' },
    ], 'run-current', storage);

    expect(state.items.map((item) => item.status)).toEqual(['SKIPPED', 'PENDING']);
    expect(memory.writes).toBe(0);
  });

  it('persists durable success after the injected batch executor settles', async () => {
    const memory = new MemoryStorage();
    const storage = new P7RunMetadataStorage(memory);
    const initial = createBatchQueue([{ frameId: 'frame-1', frameName: 'Frame' }], 'run-current');

    const result = await runPersistedP7Batch(initial, async (state) => {
      let next = startNextBatchItem(state);
      next = finishRunningBatchItem(next, { status: 'SUCCEEDED' });
      return next;
    }, storage);

    expect(result.state.items[0]?.status).toBe('SUCCEEDED');
    expect(result.persistence.ok).toBe(true);
    expect(result.persistence.metadata?.entries['frame-1']?.runKey).toBe('run-current');
    expect(memory.writes).toBe(1);
  });

  it('does not persist a reversible checkpoint as success', async () => {
    const memory = new MemoryStorage();
    const storage = new P7RunMetadataStorage(memory);
    const state = checkpointQueue();

    const persistence = await persistP7DurableSuccesses(state, storage);
    expect(state.items[0]?.status).toBe('AWAITING_CHECKPOINT');
    expect(persistence.ok).toBe(true);
    expect(persistence.metadata).toBeNull();
    expect(memory.reads).toBe(0);
    expect(memory.writes).toBe(0);
  });

  it('persists only after checkpoint re-audit proves final completion', async () => {
    const memory = new MemoryStorage();
    const storage = new P7RunMetadataStorage(memory);

    const result = await finalizeFigmaP7PersistedCheckpoint(
      checkpointQueue(),
      storage,
      async () => false,
      checkpointActions(),
    );

    expect(result.state.items[0]?.status).toBe('SUCCEEDED');
    expect(result.state.items[0]?.frameId).toBe('committed-frame');
    expect(result.persistence.metadata?.entries['committed-frame']?.runKey).toBe('run-current');
    expect(memory.writes).toBe(1);
  });

  it('withholds success metadata when finalize-and-continue returns the same live frame to pending', async () => {
    const memory = new MemoryStorage();
    const storage = new P7RunMetadataStorage(memory);

    const result = await finalizeFigmaP7PersistedCheckpoint(
      checkpointQueue(),
      storage,
      async () => true,
      checkpointActions(),
    );

    expect(result.state.items[0]?.status).toBe('PENDING');
    expect(result.state.items[0]?.frameId).toBe('committed-frame');
    expect(result.persistence.metadata).toBeNull();
    expect(memory.writes).toBe(0);
  });

  it('never records restored checkpoint work as success and tracks the restored live frame id', async () => {
    const memory = new MemoryStorage();
    const storage = new P7RunMetadataStorage(memory);

    const result = await restoreFigmaP7PersistedCheckpoint(
      checkpointQueue(),
      storage,
      checkpointActions({ restoredId: 'restored-original' }),
    );

    expect(result.state.items[0]?.status).toBe('SKIPPED');
    expect(result.state.items[0]?.frameId).toBe('restored-original');
    expect(result.persistence.metadata).toBeNull();
    expect(memory.writes).toBe(0);
  });
});
