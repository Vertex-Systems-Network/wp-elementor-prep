import { describe, expect, it } from 'vitest';
import {
  applyBatchRunMetadata,
  emptyBatchRunMetadata,
  parseBatchRunMetadata,
  previousRunKeyForFrame,
  recordSuccessfulBatchRun,
} from '../src/core/batch-run-metadata';
import {
  createBatchQueue,
  finishRunningBatchItem,
  startNextBatchItem,
} from '../src/core/batch-queue';

describe('P7 versioned batch run metadata', () => {
  it('fails closed on unknown schema and ignores malformed entries', () => {
    expect(parseBatchRunMetadata({ schemaVersion: 2, entries: { a: {} } })).toEqual(emptyBatchRunMetadata());

    const parsed = parseBatchRunMetadata({
      schemaVersion: 1,
      entries: {
        good: { runKey: 'plugin-1:recipe-2', completedAt: '2026-09-08T00:00:00.000Z' },
        badKey: { runKey: '', completedAt: '2026-09-08T00:00:00.000Z' },
        badDate: { runKey: 'x', completedAt: 'not-a-date' },
      },
    });

    expect(Object.keys(parsed.entries)).toEqual(['good']);
    expect(previousRunKeyForFrame(parsed, 'good')).toBe('plugin-1:recipe-2');
    expect(previousRunKeyForFrame(parsed, 'missing')).toBeNull();
  });

  it('hydrates previous run keys without overriding an explicit caller value', () => {
    const metadata = parseBatchRunMetadata({
      schemaVersion: 1,
      entries: {
        '1': { runKey: 'persisted', completedAt: '2026-09-08T00:00:00.000Z' },
        '2': { runKey: 'persisted-2', completedAt: '2026-09-08T00:00:01.000Z' },
      },
    });

    const inputs = applyBatchRunMetadata([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About', previousRunKey: 'explicit' },
    ], metadata);

    expect(inputs[0]?.previousRunKey).toBe('persisted');
    expect(inputs[1]?.previousRunKey).toBe('explicit');
  });

  it('records only successful frames with the current run key', () => {
    let queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
      { frameId: '3', frameName: 'Contact' },
    ], 'plugin-v8:recipes-v4');

    queue = startNextBatchItem(queue);
    queue = finishRunningBatchItem(queue, { status: 'SUCCEEDED' });
    queue = startNextBatchItem(queue);
    queue = finishRunningBatchItem(queue, { status: 'FAILED', error: 'fixture failure' });

    const metadata = recordSuccessfulBatchRun(
      emptyBatchRunMetadata(),
      queue,
      '2026-09-08T00:05:00.000Z',
    );

    expect(previousRunKeyForFrame(metadata, '1')).toBe('plugin-v8:recipes-v4');
    expect(previousRunKeyForFrame(metadata, '2')).toBeNull();
    expect(previousRunKeyForFrame(metadata, '3')).toBeNull();
  });

  it('bounds storage by pruning the oldest completion records', () => {
    const metadata = parseBatchRunMetadata({
      schemaVersion: 1,
      entries: {
        old: { runKey: 'old', completedAt: '2026-09-01T00:00:00.000Z' },
        recent: { runKey: 'recent', completedAt: '2026-09-07T00:00:00.000Z' },
      },
    });

    let queue = createBatchQueue([{ frameId: 'new', frameName: 'New' }], 'current');
    queue = startNextBatchItem(queue);
    queue = finishRunningBatchItem(queue, { status: 'SUCCEEDED' });

    const bounded = recordSuccessfulBatchRun(metadata, queue, '2026-09-08T00:00:00.000Z', 2);
    expect(Object.keys(bounded.entries).sort()).toEqual(['new', 'recent']);
    expect(bounded.entries.old).toBeUndefined();
  });
});
