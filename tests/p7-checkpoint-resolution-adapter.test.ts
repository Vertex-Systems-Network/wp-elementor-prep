import { describe, expect, it } from 'vitest';
import {
  createBatchQueue,
  finishRunningBatchItem,
  startNextBatchItem,
} from '../src/core/batch-queue';
import {
  finalizeAndContinueP7BatchCheckpoint,
  finalizeP7BatchCheckpoint,
  restoreP7BatchCheckpoint,
  type P7CheckpointActions,
} from '../src/plugin/p7-checkpoint-resolution';

function awaitingState() {
  let state = createBatchQueue([{ frameId: 'frame-1', frameName: 'Home' }], 'run-v1');
  state = startNextBatchItem(state);
  return finishRunningBatchItem(state, {
    status: 'CHECKPOINT_PENDING',
    committedFrameId: 'candidate-1',
  });
}

describe('P7 checkpoint action adapter', () => {
  it('preserves FINALIZED_CONTINUE and committed identity after the real finalize action succeeds', async () => {
    let finalizeCalls = 0;
    const actions: P7CheckpointActions = {
      restore: async () => null,
      finalize: async () => {
        finalizeCalls += 1;
        return true;
      },
    };

    const result = await finalizeAndContinueP7BatchCheckpoint(awaitingState(), actions);
    expect(finalizeCalls).toBe(1);
    expect(result.resolution).toBe('FINALIZED_CONTINUE');
    expect(result.proof.resolution).toBe('FINALIZED_CONTINUE');
    expect(result.state.items[0]?.frameId).toBe('candidate-1');
    expect(result.state.items[0]?.status).toBe('PENDING');
  });

  it('keeps ordinary FINALIZED as durable success on the committed id', async () => {
    const actions: P7CheckpointActions = {
      restore: async () => null,
      finalize: async () => true,
    };
    const result = await finalizeP7BatchCheckpoint(awaitingState(), actions);
    expect(result.resolution).toBe('FINALIZED');
    expect(result.state.items[0]?.frameId).toBe('candidate-1');
    expect(result.state.items[0]?.status).toBe('SUCCEEDED');
  });

  it('restores only after real P5 restore evidence exists and adopts restored id', async () => {
    const actions: P7CheckpointActions = {
      restore: async () => ({
        transactionId: 'tx-1',
        originalNodeId: 'candidate-1',
        committedNodeId: 'frame-1',
      }),
      finalize: async () => false,
    };
    const result = await restoreP7BatchCheckpoint(awaitingState(), actions);
    expect(result.resolution).toBe('RESTORED');
    expect(result.state.items[0]?.frameId).toBe('frame-1');
    expect(result.state.items[0]?.status).toBe('SKIPPED');
    expect(result.state.items[0]?.skipReason).toBe('RESTORED_CHECKPOINT');
  });

  it('does not advance bookkeeping when finalize fails', async () => {
    const state = awaitingState();
    const actions: P7CheckpointActions = {
      restore: async () => null,
      finalize: async () => false,
    };
    await expect(finalizeAndContinueP7BatchCheckpoint(state, actions)).rejects.toThrow(/finalize returned false/i);
    expect(state.items[0]?.frameId).toBe('candidate-1');
    expect(state.items[0]?.status).toBe('AWAITING_CHECKPOINT');
  });
});
