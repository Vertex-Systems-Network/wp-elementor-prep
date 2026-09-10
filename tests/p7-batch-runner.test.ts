import { describe, expect, it } from 'vitest';
import { createBatchQueue } from '../src/core/batch-queue';
import { runBatchQueue } from '../src/core/batch-runner';

describe('P7 sequential batch runner', () => {
  it('processes frames strictly in queue order with at most one active processor call', async () => {
    const queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
      { frameId: '3', frameName: 'Contact' },
    ], 'run-1');

    const order: string[] = [];
    let active = 0;
    let maxActive = 0;
    const result = await runBatchQueue(queue, async (item) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      order.push(item.frameId);
      await Promise.resolve();
      active -= 1;
      return { status: 'SUCCEEDED' };
    });

    expect(order).toEqual(['1', '2', '3']);
    expect(maxActive).toBe(1);
    expect(result.status).toBe('COMPLETED');
    expect(result.items.every((item) => item.status === 'SUCCEEDED')).toBe(true);
  });

  it('converts a thrown processor error into one frame failure and continues the batch', async () => {
    const queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
      { frameId: '3', frameName: 'Contact' },
    ], 'run-2');

    const visited: string[] = [];
    const result = await runBatchQueue(queue, async (item) => {
      visited.push(item.frameId);
      if (item.frameId === '2') throw new Error('candidate rejected');
      return { status: 'SUCCEEDED' };
    });

    expect(visited).toEqual(['1', '2', '3']);
    expect(result.status).toBe('COMPLETED');
    expect(result.items[0]?.status).toBe('SUCCEEDED');
    expect(result.items[1]?.status).toBe('FAILED');
    expect(result.items[1]?.error).toBe('candidate rejected');
    expect(result.items[2]?.status).toBe('SUCCEEDED');
  });

  it('observes cancellation only after the in-flight processor settles', async () => {
    const queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
      { frameId: '3', frameName: 'Contact' },
    ], 'run-3');

    let cancel = false;
    const visited: string[] = [];
    const result = await runBatchQueue(queue, async (item) => {
      visited.push(item.frameId);
      cancel = true;
      return { status: 'SUCCEEDED' };
    }, {
      shouldCancel: () => cancel,
    });

    expect(visited).toEqual(['1']);
    expect(result.status).toBe('CANCELLED');
    expect(result.items[0]?.status).toBe('SUCCEEDED');
    expect(result.items[1]?.status).toBe('CANCELLED');
    expect(result.items[2]?.status).toBe('CANCELLED');
  });

  it('emits copied state snapshots so observer mutation cannot corrupt runner state', async () => {
    const queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
    ], 'run-4');

    const snapshots: string[][] = [];
    const result = await runBatchQueue(queue, async () => ({ status: 'SUCCEEDED' }), {
      onState: (state) => {
        snapshots.push(state.items.map((item) => item.status));
        if (state.items[0]) state.items[0].status = 'FAILED';
      },
    });

    expect(snapshots.some((statuses) => statuses.includes('RUNNING'))).toBe(true);
    expect(result.items.map((item) => item.status)).toEqual(['SUCCEEDED', 'SUCCEEDED']);
  });
});
