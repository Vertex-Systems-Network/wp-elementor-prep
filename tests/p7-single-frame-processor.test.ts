import { describe, expect, it } from 'vitest';
import type { SafeRecipePlan, SafeRecipeKind } from '../src/core/safe-recipe-types';
import type { TransactionResult } from '../src/core/transaction-types';
import {
  createP7SingleFrameProcessor,
  selectNextP7EligiblePlan,
  type P7SingleFrameProcessorDeps,
} from '../src/plugin/p7-single-frame-processor';
import type { SafeFixRuntimeResult } from '../src/plugin/safe-fix-runtime';

function plan(
  targetNodeId: string,
  targetPath: number[],
  recipe: SafeRecipeKind = 'vertical-stack',
  decision: SafeRecipePlan['decision'] = 'ELIGIBLE',
): SafeRecipePlan {
  return {
    schemaVersion: 1,
    decision,
    recipe: decision === 'ELIGIBLE' ? recipe : null,
    reasonCode: decision === 'ELIGIBLE' ? 'SUPPORTED_HIGH_CONFIDENCE' : 'BELOW_CONFIDENCE_GATE',
    reason: 'fixture',
    confidence: decision === 'ELIGIBLE' ? 99 : 70,
    minConfidence: 90,
    pattern: recipe === 'horizontal-row' ? 'horizontal-row' : 'vertical-stack',
    targetNodeId,
    targetNodeName: targetNodeId,
    targetPath,
    evidence: {},
  };
}

function frame(id = 'frame-1'): FrameNode {
  return { id, name: id, type: 'FRAME' } as unknown as FrameNode;
}

function committedResult(selectedPlan: SafeRecipePlan, committedNodeId = 'candidate-1'): SafeFixRuntimeResult {
  const transaction: TransactionResult = {
    schemaVersion: 1,
    transactionId: 'tx-1',
    state: 'COMMITTED',
    originalNodeId: 'frame-1',
    candidateNodeId: committedNodeId,
    commit: {
      transactionId: 'tx-1',
      originalNodeId: 'frame-1',
      committedNodeId,
      undoToken: 'undo',
    },
    events: [],
  };
  return { plan: selectedPlan, transaction };
}

function deps(overrides: Partial<P7SingleFrameProcessorDeps> = {}): P7SingleFrameProcessorDeps {
  return {
    runtimeProofValid: async () => true,
    hasPendingCheckpoint: async () => false,
    resolveFrame: async (id) => frame(id),
    planFrame: async () => [],
    runPlan: async (_frame, selectedPlan) => committedResult(selectedPlan),
    ...overrides,
  };
}

const item = {
  frameId: 'frame-1',
  frameName: 'Home',
  status: 'RUNNING' as const,
  attempts: 1,
  error: null,
  skipReason: null,
};

describe('P7 deterministic eligible-plan selection', () => {
  it('selects distinct targets in document-path order', () => {
    const result = selectNextP7EligiblePlan([
      plan('later', [2, 0]),
      plan('first', [0, 3]),
      plan('middle', [1]),
    ]);
    expect(result.error).toBeNull();
    expect(result.plan?.targetNodeId).toBe('first');
  });

  it('fails closed when one target has multiple eligible recipes', () => {
    const result = selectNextP7EligiblePlan([
      plan('same', [0], 'vertical-stack'),
      plan('same', [0], 'horizontal-row'),
    ]);
    expect(result.plan).toBeNull();
    expect(result.error).toContain('Multiple eligible Safe Fix recipes');
  });
});

describe('P7 canonical single-frame processor', () => {
  it('fails closed before resolving a frame when runtime proof is missing', async () => {
    let resolved = false;
    const processor = createP7SingleFrameProcessor(deps({
      runtimeProofValid: async () => false,
      resolveFrame: async () => { resolved = true; return frame(); },
    }));

    const result = await processor(item);
    expect(result.status).toBe('FAILED');
    expect(resolved).toBe(false);
  });

  it('fails closed if a checkpoint appears before processing starts', async () => {
    const processor = createP7SingleFrameProcessor(deps({ hasPendingCheckpoint: async () => true }));
    const result = await processor(item);
    expect(result.status).toBe('FAILED');
    if (result.status === 'FAILED') expect(result.error).toContain('checkpoint became pending');
  });

  it('marks a fully audited frame with no eligible mutation as complete', async () => {
    const processor = createP7SingleFrameProcessor(deps({
      planFrame: async () => [plan('review-only', [0], 'vertical-stack', 'REVIEW')],
    }));
    await expect(processor(item)).resolves.toEqual({ status: 'SUCCEEDED' });
  });

  it('runs exactly one deterministic plan through P5 and propagates the committed live id', async () => {
    const seen: string[] = [];
    const processor = createP7SingleFrameProcessor(deps({
      planFrame: async () => [plan('second', [1]), plan('first', [0])],
      runPlan: async (_frame, selectedPlan) => {
        seen.push(selectedPlan.targetNodeId);
        return committedResult(selectedPlan, 'candidate-live');
      },
    }));

    const result = await processor(item);
    expect(seen).toEqual(['first']);
    expect(result.status).toBe('CHECKPOINT_PENDING');
    if (result.status === 'CHECKPOINT_PENDING') {
      expect(result.committedFrameId).toBe('candidate-live');
    }
  });

  it('fails safely when the queued live frame no longer exists', async () => {
    const processor = createP7SingleFrameProcessor(deps({ resolveFrame: async () => null }));
    const result = await processor(item);
    expect(result.status).toBe('FAILED');
    if (result.status === 'FAILED') expect(result.error).toContain('unavailable');
  });
});
