import { describe, expect, it } from 'vitest';
import {
  createBatchQueue,
  finishRunningBatchItem,
  requestBatchCancel,
  resumeBatchQueue,
  startNextBatchItem,
  summarizeBatchQueue,
} from '../src/core/batch-queue';

describe('P7 bounded batch queue core', () => {
  it('deduplicates frame ids and skips frames already processed by the same versioned run key', () => {
    const queue = createBatchQueue([
      { frameId: '1', frameName: 'Home', previousRunKey: 'plugin-v7:recipes-v3' },
      { frameId: '1', frameName: 'Home duplicate' },
      { frameId: '2', frameName: 'About', previousRunKey: 'older-key' },
    ], 'plugin-v7:recipes-v3');

    expect(queue.items).toHaveLength(2);
    expect(queue.items[0]?.status).toBe('SKIPPED');
    expect(queue.items[0]?.skipReason).toBe('ALREADY_PROCESSED');
    expect(queue.items[1]?.status).toBe('PENDING');
  });

  it('runs only one frame at a time and isolates a failure from remaining frames', () => {
    let queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
      { frameId: '3', frameName: 'Contact' },
    ], 'run-1');

    queue = startNextBatchItem(queue);
    expect(queue.items.filter((item) => item.status === 'RUNNING')).toHaveLength(1);
    expect(queue.items[0]?.attempts).toBe(1);

    const unchanged = startNextBatchItem(queue);
    expect(unchanged.items.filter((item) => item.status === 'RUNNING')).toHaveLength(1);

    queue = finishRunningBatchItem(queue, { status: 'FAILED', error: 'validator rejected candidate' });
    expect(queue.items[0]?.status).toBe('FAILED');
    expect(queue.items[1]?.status).toBe('PENDING');
    expect(queue.status).toBe('IDLE');

    queue = startNextBatchItem(queue);
    expect(queue.items[1]?.status).toBe('RUNNING');
    queue = finishRunningBatchItem(queue, { status: 'SUCCEEDED' });
    expect(queue.items[1]?.status).toBe('SUCCEEDED');
    expect(queue.items[2]?.status).toBe('PENDING');
  });

  it('cancels pending work without interrupting the in-flight frame, then settles after it finishes', () => {
    let queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
      { frameId: '3', frameName: 'Contact' },
    ], 'run-1');

    queue = startNextBatchItem(queue);
    queue = requestBatchCancel(queue);
    expect(queue.status).toBe('CANCELLING');
    expect(queue.items[0]?.status).toBe('RUNNING');
    expect(queue.items[1]?.status).toBe('CANCELLED');
    expect(queue.items[2]?.status).toBe('CANCELLED');

    queue = finishRunningBatchItem(queue, { status: 'SUCCEEDED' });
    expect(queue.status).toBe('CANCELLED');
    expect(queue.items[0]?.status).toBe('SUCCEEDED');
  });

  it('resumes cancelled and failed frames without repeating successful or skipped work', () => {
    let queue = createBatchQueue([
      { frameId: '1', frameName: 'Home', previousRunKey: 'run-2' },
      { frameId: '2', frameName: 'About' },
      { frameId: '3', frameName: 'Contact' },
    ], 'run-2');

    queue = startNextBatchItem(queue);
    queue = finishRunningBatchItem(queue, { status: 'FAILED', error: 'temporary failure' });
    queue = startNextBatchItem(queue);
    queue = requestBatchCancel(queue);
    queue = finishRunningBatchItem(queue, { status: 'SUCCEEDED' });

    expect(queue.status).toBe('CANCELLED');
    const resumed = resumeBatchQueue(queue);
    expect(resumed.status).toBe('IDLE');
    expect(resumed.items[0]?.status).toBe('SKIPPED');
    expect(resumed.items[1]?.status).toBe('PENDING');
    expect(resumed.items[2]?.status).toBe('SUCCEEDED');
  });

  it('reports deterministic progress and treats an empty queue as complete', () => {
    let queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About', previousRunKey: 'run-3' },
      { frameId: '3', frameName: 'Contact' },
      { frameId: '4', frameName: 'Pricing' },
    ], 'run-3');

    queue = startNextBatchItem(queue);
    queue = finishRunningBatchItem(queue, { status: 'SUCCEEDED' });
    expect(summarizeBatchQueue(queue)).toMatchObject({
      total: 4,
      succeeded: 1,
      skipped: 1,
      finished: 2,
      progressPct: 50,
    });

    const empty = createBatchQueue([], 'run-empty');
    expect(empty.status).toBe('COMPLETED');
    expect(summarizeBatchQueue(empty).progressPct).toBe(100);
  });
});
