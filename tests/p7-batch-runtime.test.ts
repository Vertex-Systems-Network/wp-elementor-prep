import { describe, expect, it } from 'vitest';
import { createBatchQueue } from '../src/core/batch-queue';
import { runP7BatchRuntime } from '../src/plugin/p7-batch-runtime';

describe('P7 runtime composition', () => {
  it('uses the checkpoint gate between frames before starting another processor call', async () => {
    const queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
    ], 'run-runtime-gate');

    let checkpointPending = false;
    const visited: string[] = [];
    const result = await runP7BatchRuntime(queue, async (item) => {
      visited.push(item.frameId);
      checkpointPending = true;
      return { status: 'SUCCEEDED' };
    }, {
      checkpointPauseReason: async () => checkpointPending ? 'P5 checkpoint pending' : null,
    });

    expect(visited).toEqual(['1']);
    expect(result.status).toBe('PAUSED');
    expect(result.pauseReason).toBe('P5 checkpoint pending');
    expect(result.items[0]?.status).toBe('SUCCEEDED');
    expect(result.items[1]?.status).toBe('PENDING');
  });

  it('continues normally when checkpoint and additional safety gates are clear', async () => {
    const queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
    ], 'run-runtime-clear');

    const visited: string[] = [];
    const result = await runP7BatchRuntime(queue, async (item) => {
      visited.push(item.frameId);
      return { status: 'SUCCEEDED' };
    }, {
      checkpointPauseReason: async () => null,
      additionalPauseReason: async () => null,
    });

    expect(visited).toEqual(['1', '2']);
    expect(result.status).toBe('COMPLETED');
  });
});
