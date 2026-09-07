import { describe, expect, it } from 'vitest';
import { createBatchQueue, finishRunningBatchItem, startNextBatchItem } from '../src/core/batch-queue';
import type { CommitEvidence } from '../src/core/transaction-types';
import {
  finalizeP7BatchCheckpoint,
  restoreP7BatchCheckpoint,
  type P7CheckpointActions,
} from '../src/plugin/p7-checkpoint-resolution';

function evidence(): CommitEvidence {
  return {
    transactionId: 'tx-1',
    originalNodeId: 'original',
    committedNodeId: 'committed',
    parentNodeId: 'parent',
    siblingIndex: 0,
    undoToken: 'undo',
  };
}

function committedQueue() {
  let queue = createBatchQueue([
    { frameId: '1', frameName: 'Home' },
    { frameId: '2', frameName: 'About' },
  ], 'run-1');
  queue = startNextBatchItem(queue);
  return finishRunningBatchItem(queue, { status: 'CHECKPOINT_PENDING' });
}

function actions(options: { restore?: CommitEvidence | null; finalize?: boolean } = {}) {
  const calls: string[] = [];
  const adapter: P7CheckpointActions = {
    async restore() {
      calls.push('restore');
      return options.restore === undefined ? evidence() : options.restore;
    },
    async finalize() {
      calls.push('finalize');
      return options.finalize ?? true;
    },
  };
  return { adapter, calls };
}

describe('P7 real checkpoint action composition', () => {
  it('marks durable success only after P5 finalize returns true', async () => {
    const fixture = actions();
    const result = await finalizeP7BatchCheckpoint(committedQueue(), fixture.adapter);

    expect(fixture.calls).toEqual(['finalize']);
    expect(result.resolution).toBe('FINALIZED');
    expect(result.proof).toEqual({ resolution: 'FINALIZED', finalized: true });
    expect(result.state.items[0]?.status).toBe('SUCCEEDED');
    expect(result.state.status).toBe('IDLE');
  });

  it('marks restored skip only after P5 restore returns evidence', async () => {
    const fixture = actions();
    const result = await restoreP7BatchCheckpoint(committedQueue(), fixture.adapter);

    expect(fixture.calls).toEqual(['restore']);
    expect(result.resolution).toBe('RESTORED');
    expect(result.proof.resolution).toBe('RESTORED');
    expect(result.state.items[0]?.status).toBe('SKIPPED');
    expect(result.state.items[0]?.skipReason).toBe('RESTORED_CHECKPOINT');
  });

  it('fails closed when P5 finalize returns false', async () => {
    const fixture = actions({ finalize: false });
    const queue = committedQueue();

    await expect(finalizeP7BatchCheckpoint(queue, fixture.adapter)).rejects.toThrow('returned false');
    expect(queue.items[0]?.status).toBe('AWAITING_CHECKPOINT');
    expect(queue.status).toBe('PAUSED');
  });

  it('fails closed when P5 restore returns no evidence', async () => {
    const fixture = actions({ restore: null });
    const queue = committedQueue();

    await expect(restoreP7BatchCheckpoint(queue, fixture.adapter)).rejects.toThrow('returned no evidence');
    expect(queue.items[0]?.status).toBe('AWAITING_CHECKPOINT');
    expect(queue.status).toBe('PAUSED');
  });

  it('does not call P5 actions when no batch item owns a checkpoint', async () => {
    const fixture = actions();
    const queue = createBatchQueue([{ frameId: '1', frameName: 'Home' }], 'run-2');

    await expect(finalizeP7BatchCheckpoint(queue, fixture.adapter)).rejects.toThrow('no frame awaiting');
    expect(fixture.calls).toEqual([]);
  });
});
