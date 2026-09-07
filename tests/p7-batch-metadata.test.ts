import { describe, expect, it } from 'vitest';
import {
  BatchMetadataRepository,
  markBatchFrameFinalized,
  parseBatchProcessingMetadata,
  previousRunKeyForFrame,
  removeBatchFrameMetadata,
  type BatchProcessingMetadata,
} from '../src/core/batch-metadata';

describe('P7 batch processing metadata', () => {
  it('fails closed on unknown schema versions and malformed records', () => {
    expect(parseBatchProcessingMetadata({ schemaVersion: 2, records: { a: {} } })).toEqual({
      schemaVersion: 1,
      records: {},
    });

    const parsed = parseBatchProcessingMetadata({
      schemaVersion: 1,
      records: {
        good: { schemaVersion: 1, frameId: 'good', runKey: 'plugin@1:recipes@2', finalizedAt: '2026-09-08T00:00:00.000Z' },
        mismatch: { schemaVersion: 1, frameId: 'other', runKey: 'x', finalizedAt: 'now' },
        emptyKey: { schemaVersion: 1, frameId: 'emptyKey', runKey: '', finalizedAt: 'now' },
      },
    });

    expect(Object.keys(parsed.records)).toEqual(['good']);
    expect(previousRunKeyForFrame(parsed, 'good')).toBe('plugin@1:recipes@2');
    expect(previousRunKeyForFrame(parsed, 'missing')).toBeNull();
  });

  it('records durable metadata only through explicit finalized success calls', () => {
    const empty: BatchProcessingMetadata = { schemaVersion: 1, records: {} };
    const finalized = markBatchFrameFinalized(
      empty,
      'frame-1',
      'plugin@1:recipes@2',
      '2026-09-08T00:00:00.000Z',
    );

    expect(finalized.records['frame-1']).toEqual({
      schemaVersion: 1,
      frameId: 'frame-1',
      runKey: 'plugin@1:recipes@2',
      finalizedAt: '2026-09-08T00:00:00.000Z',
    });

    const cleared = removeBatchFrameMetadata(finalized, 'frame-1');
    expect(cleared.records['frame-1']).toBeUndefined();
    expect(finalized.records['frame-1']).toBeDefined();
  });

  it('validates persisted data on read and writes finalized records atomically', async () => {
    let stored: unknown = {
      schemaVersion: 1,
      records: {
        invalid: { schemaVersion: 1, frameId: 'wrong-id', runKey: 'stale', finalizedAt: 'old' },
      },
    };
    const repository = new BatchMetadataRepository({
      get: async () => stored,
      set: async (value) => { stored = value; },
    });

    expect((await repository.read()).records).toEqual({});

    await repository.finalized('frame-2', 'run-v3', '2026-09-08T01:00:00.000Z');
    const afterFinalize = await repository.read();
    expect(previousRunKeyForFrame(afterFinalize, 'frame-2')).toBe('run-v3');

    await repository.clearFrame('frame-2');
    expect(previousRunKeyForFrame(await repository.read(), 'frame-2')).toBeNull();
  });
});
