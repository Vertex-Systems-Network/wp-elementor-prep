import { describe, expect, it } from 'vitest';
import { createBatchQueue } from '../src/core/batch-queue';
import { runBatchQueue } from '../src/core/batch-runner';

describe('P7 async inter-frame safety gate', () => {
  it('awaits an async pause check after the active frame settles', async () => {
    const queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
    ], 'run-async-gate');

    let checkpointPending = false;
    let pauseChecks = 0;
    const visited: string[] = [];

    const result = await runBatchQueue(queue, async (item) => {
      visited.push(item.frameId);
      checkpointPending = true;
      return { status: 'SUCCEEDED' };
    }, {
      shouldPause: async () => {
        pauseChecks += 1;
        await Promise.resolve();
        return checkpointPending ? 'async checkpoint pending' : null;
      },
    });

    expect(visited).toEqual(['1']);
    expect(pauseChecks).toBeGreaterThanOrEqual(2);
    expect(result.status).toBe('PAUSED');
    expect(result.pauseReason).toBe('async checkpoint pending');
    expect(result.items[0]?.status).toBe('SUCCEEDED');
    expect(result.items[1]?.status).toBe('PENDING');
  });
});
