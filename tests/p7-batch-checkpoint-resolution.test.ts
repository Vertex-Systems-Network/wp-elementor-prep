import { describe, expect, it } from 'vitest';
import {
  createBatchQueue,
  finishRunningBatchItem,
  requestBatchCancel,
  resolveBatchCheckpoint,
  resumeBatchQueue,
  startNextBatchItem,
  summarizeBatchQueue,
} from '../src/core/batch-queue';
import { emptyBatchRunMetadata, recordSuccessfulBatchRun } from '../src/core/batch-run-metadata';

describe('P7 bounded checkpoint resolution semantics', () => {
  function committedQueue() {
    let queue = createBatchQueue([
      { frameId: '1', frameName: 'Home' },
      { frameId: '2', frameName: 'About' },
    ], 'plugin-v4:recipes-v5');
    queue = startNextBatchItem(queue);
    return finishRunningBatchItem(queue, {
      status: 'CHECKPOINT_PENDING',
      committedFrameId: 'candidate-1',
      reason: 'Resolve P5 checkpoint.',
    });
  }

  it('does not treat a committed-but-unresolved checkpoint as durable success', () => {
    const queue = committedQueue();
    const summary = summarizeBatchQueue(queue);

    expect(queue.status).toBe('PAUSED');
    expect(queue.items[0]?.frameId).toBe('candidate-1');
    expect(queue.items[0]?.status).toBe('AWAITING_CHECKPOINT');
    expect(queue.items[1]?.status).toBe('PENDING');
    expect(summary.awaitingCheckpoint).toBe(1);
    expect(summary.succeeded).toBe(0);
    expect(summary.finished).toBe(0);
    expect(summary.progressPct).toBe(0);

    const metadata = recordSuccessfulBatchRun(
      emptyBatchRunMetadata(),
      queue,
      '2026-09-08T01:00:00.000Z',
    );
    expect(metadata.entries['candidate-1']).toBeUndefined();
  });

  it('FINALIZED keeps the committed live id and enables run-key persistence for that node', () => {
    const resolved = resolveBatchCheckpoint(committedQueue(), 'FINALIZED');
    expect(resolved.items[0]?.frameId).toBe('candidate-1');
    expect(resolved.items[0]?.status).toBe('SUCCEEDED');
    expect(resolved.status).toBe('IDLE');
    expect(resolved.pauseReason).toBeNull();

    const metadata = recordSuccessfulBatchRun(
      emptyBatchRunMetadata(),
      resolved,
      '2026-09-08T01:00:00.000Z',
    );
    expect(metadata.entries['candidate-1']?.runKey).toBe('plugin-v4:recipes-v5');
    expect(metadata.entries['1']).toBeUndefined();
  });

  it('FINALIZED_CONTINUE retains committed identity and returns it to pending for fresh re-audit', () => {
    const resolved = resolveBatchCheckpoint(committedQueue(), 'FINALIZED_CONTINUE');
    expect(resolved.items[0]?.frameId).toBe('candidate-1');
    expect(resolved.items[0]?.status).toBe('PENDING');
    expect(resolved.items[0]?.attempts).toBe(1);
    expect(resolved.items[1]?.status).toBe('PENDING');
    expect(resolved.status).toBe('IDLE');
    expect(resolved.pauseReason).toBeNull();

    const metadata = recordSuccessfulBatchRun(
      emptyBatchRunMetadata(),
      resolved,
      '2026-09-08T01:00:00.000Z',
    );
    expect(metadata.entries['candidate-1']).toBeUndefined();

    const restarted = startNextBatchItem(resolved);
    expect(restarted.items[0]?.frameId).toBe('candidate-1');
    expect(restarted.items[0]?.status).toBe('RUNNING');
    expect(restarted.items[0]?.attempts).toBe(2);
  });

  it('RESTORED switches identity back to the restored original and never receives the run key', () => {
    const resolved = resolveBatchCheckpoint(committedQueue(), 'RESTORED', { resolvedFrameId: '1' });
    expect(resolved.items[0]?.frameId).toBe('1');
    expect(resolved.items[0]?.status).toBe('SKIPPED');
    expect(resolved.items[0]?.skipReason).toBe('RESTORED_CHECKPOINT');
    expect(resolved.status).toBe('IDLE');

    const metadata = recordSuccessfulBatchRun(
      emptyBatchRunMetadata(),
      resolved,
      '2026-09-08T01:00:00.000Z',
    );
    expect(metadata.entries['1']).toBeUndefined();
    expect(metadata.entries['candidate-1']).toBeUndefined();
  });

  it('resume cannot bypass an unresolved checkpoint', () => {
    const queue = committedQueue();
    const resumed = resumeBatchQueue(queue);
    expect(resumed.status).toBe('PAUSED');
    expect(resumed.items[0]?.frameId).toBe('candidate-1');
    expect(resumed.items[0]?.status).toBe('AWAITING_CHECKPOINT');
    expect(resumed.items[1]?.status).toBe('PENDING');
  });

  it('cancellation waits for explicit checkpoint resolution before settling cancelled', () => {
    const cancelling = requestBatchCancel(committedQueue());
    expect(cancelling.status).toBe('PAUSED');
    expect(cancelling.cancelRequested).toBe(true);
    expect(cancelling.items[0]?.frameId).toBe('candidate-1');
    expect(cancelling.items[0]?.status).toBe('AWAITING_CHECKPOINT');
    expect(cancelling.items[1]?.status).toBe('CANCELLED');

    const restored = resolveBatchCheckpoint(cancelling, 'RESTORED', { resolvedFrameId: '1' });
    expect(restored.status).toBe('CANCELLED');
    expect(restored.items[0]?.frameId).toBe('1');
    expect(restored.items[0]?.skipReason).toBe('RESTORED_CHECKPOINT');
  });
});
