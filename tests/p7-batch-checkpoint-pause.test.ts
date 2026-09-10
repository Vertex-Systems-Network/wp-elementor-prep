import { describe, expect, it } from 'vitest';
import {
  createBatchQueue,
  requestBatchPause,
  resumeBatchQueue,
  startNextBatchItem,
} from '../src/core/batch-queue';
import { runBatchQueue } from '../src/core/batch-runner';

describe('P7 inter-frame checkpoint safety pause', () => {
  it('keeps pending frames untouched while paused and resumes without repeating success', () => {
    let queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
    ], 'run-checkpoint');

    queue = requestBatchPause(queue, 'Resolve P5 restore/finalize checkpoint.');
    expect(queue.status).toBe('PAUSED');
    expect(queue.pauseReason).toContain('checkpoint');
    expect(queue.items.map((item) => item.status)).toEqual(['PENDING', 'PENDING']);

    const stillPaused = startNextBatchItem(queue);
    expect(stillPaused.items.some((item) => item.status === 'RUNNING')).toBe(false);

    const resumed = resumeBatchQueue(queue);
    expect(resumed.status).toBe('IDLE');
    expect(resumed.pauseReason).toBeNull();
    expect(resumed.items.map((item) => item.status)).toEqual(['PENDING', 'PENDING']);
  });

  it('pauses immediately after a successful frame when a bounded checkpoint becomes pending', async () => {
    const queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
      { frameId: '3', frameName: 'Contact' },
    ], 'run-checkpoint');

    const visited: string[] = [];
    let checkpointPending = false;
    const result = await runBatchQueue(queue, async (item) => {
      visited.push(item.frameId);
      checkpointPending = true;
      return { status: 'SUCCEEDED' };
    }, {
      shouldPause: () => checkpointPending ? 'Resolve P5 restore/finalize checkpoint before continuing batch mutation.' : null,
    });

    expect(visited).toEqual(['1']);
    expect(result.status).toBe('PAUSED');
    expect(result.pauseReason).toContain('restore/finalize');
    expect(result.items[0]?.status).toBe('SUCCEEDED');
    expect(result.items[1]?.status).toBe('PENDING');
    expect(result.items[2]?.status).toBe('PENDING');
  });

  it('does not interrupt the in-flight frame when the pause condition appears during processing', async () => {
    const queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
    ], 'run-checkpoint');

    const events: string[] = [];
    let checkpointPending = false;
    const result = await runBatchQueue(queue, async (item) => {
      events.push(`start:${item.frameId}`);
      checkpointPending = true;
      await Promise.resolve();
      events.push(`finish:${item.frameId}`);
      return { status: 'SUCCEEDED' };
    }, {
      shouldPause: () => checkpointPending ? 'checkpoint pending' : null,
    });

    expect(events).toEqual(['start:1', 'finish:1']);
    expect(result.status).toBe('PAUSED');
    expect(result.items[0]?.status).toBe('SUCCEEDED');
    expect(result.items[1]?.status).toBe('PENDING');
  });
});
