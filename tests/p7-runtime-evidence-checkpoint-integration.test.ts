import { describe, expect, it } from 'vitest';
import {
  createBatchQueue,
  finishRunningBatchItem,
  startNextBatchItem,
} from '../src/core/batch-queue';
import type { CommitEvidence } from '../src/core/transaction-types';
import {
  finalizeAndContinueP7BatchCheckpoint,
  restoreP7BatchCheckpoint,
  type P7CheckpointActions,
} from '../src/plugin/p7-checkpoint-resolution';
import {
  currentFigmaP7RuntimeEvidence,
  getOrCreateFigmaP7RuntimeEvidenceRecorder,
} from '../src/plugin/p7-runtime-evidence-session';

function awaitingState(runKey: string, committedFrameId: string) {
  let state = createBatchQueue([{ frameId: 'original', frameName: 'Home' }], runKey);
  state = startNextBatchItem(state);
  return finishRunningBatchItem(state, {
    status: 'CHECKPOINT_PENDING',
    committedFrameId,
  });
}

function actions(restoredId = 'restored-original'): P7CheckpointActions {
  return {
    async restore(): Promise<CommitEvidence> {
      return {
        transactionId: 'restore',
        originalNodeId: 'candidate',
        committedNodeId: restoredId,
        parentNodeId: 'parent',
        siblingIndex: 0,
      };
    },
    async finalize() {
      return true;
    },
  };
}

describe('P7 checkpoint runtime evidence integration', () => {
  it('records FINALIZED_CONTINUE without making missing Figma storage fatal in unit context', async () => {
    const state = awaitingState('checkpoint-run-continue', 'candidate-1');
    getOrCreateFigmaP7RuntimeEvidenceRecorder(state);

    const result = await finalizeAndContinueP7BatchCheckpoint(state, actions());
    const evidence = currentFigmaP7RuntimeEvidence(result.state);

    expect(result.resolution).toBe('FINALIZED_CONTINUE');
    expect(result.state.items[0]?.status).toBe('PENDING');
    expect(evidence?.checkpointResolutions.at(-1)).toMatchObject({
      resolution: 'FINALIZED_CONTINUE',
      frameIdBefore: 'candidate-1',
      frameIdAfter: 'candidate-1',
    });
  });

  it('records RESTORED with the live restored-original frame id', async () => {
    const state = awaitingState('checkpoint-run-restore', 'candidate-2');
    getOrCreateFigmaP7RuntimeEvidenceRecorder(state);

    const result = await restoreP7BatchCheckpoint(state, actions('original-restored'));
    const evidence = currentFigmaP7RuntimeEvidence(result.state);

    expect(result.resolution).toBe('RESTORED');
    expect(result.state.items[0]?.frameId).toBe('original-restored');
    expect(evidence?.checkpointResolutions.at(-1)).toMatchObject({
      resolution: 'RESTORED',
      frameIdBefore: 'candidate-2',
      frameIdAfter: 'original-restored',
    });
  });
});
