import { describe, expect, it } from 'vitest';
import type { SafeRecipePlan } from '../src/core/safe-recipe-types';
import type { TransactionResult } from '../src/core/transaction-types';
import type { ValidationReport } from '../src/core/validation-types';
import { p5SafeFixResultToBatchOutcome } from '../src/plugin/p7-p5-outcome';
import type { SafeFixRuntimeResult } from '../src/plugin/safe-fix-runtime';

function plan(): SafeRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'ELIGIBLE',
    recipe: 'vertical-stack',
    reasonCode: 'SUPPORTED_HIGH_CONFIDENCE',
    reason: 'fixture',
    confidence: 99,
    minConfidence: 90,
    pattern: 'vertical-stack',
    targetNodeId: 'target',
    targetNodeName: 'Stack',
    targetPath: [],
    evidence: {},
  };
}

function validation(passed: boolean): ValidationReport {
  return {
    schemaVersion: 1,
    passed,
    thresholdVersion: 'fixture',
    thresholds: {
      version: 'fixture',
      rootSizePx: 0,
      anchorPositionPx: 0,
      anchorSizePx: 0,
      pixelChannelDelta: 0,
      maxChangedPixelPct: 0,
      maxMeanChannelDelta: 0,
    },
    findings: passed ? [] : [{
      code: 'PIXEL_DIFF_EXCEEDED',
      severity: 'error',
      title: 'Pixel mismatch',
      detail: 'Full P3 pixel diff exceeded the fixture threshold.',
      evidence: {},
    }],
    metrics: {
      textAnchorCountBefore: 0,
      textAnchorCountAfter: 0,
      imageAnchorCountBefore: 0,
      imageAnchorCountAfter: 0,
      maxRootSizeDriftPx: 0,
      maxTextPositionDriftPx: 0,
      maxTextSizeDriftPx: 0,
      maxImagePositionDriftPx: 0,
      maxImageSizeDriftPx: 0,
      visibleNodeCountBefore: 0,
      visibleNodeCountAfter: 0,
    },
  };
}

function result(transaction: TransactionResult | null, skippedReason?: string): SafeFixRuntimeResult {
  return { plan: plan(), transaction, ...(skippedReason ? { skippedReason } : {}) };
}

describe('P7 canonical P5 result adapter', () => {
  it('maps a committed transaction with evidence to CHECKPOINT_PENDING and carries the new live Frame id', () => {
    const outcome = p5SafeFixResultToBatchOutcome(result({
      schemaVersion: 1,
      transactionId: 'tx-1',
      state: 'COMMITTED',
      originalNodeId: 'original',
      candidateNodeId: 'candidate',
      validation: validation(true),
      commit: {
        transactionId: 'tx-1',
        originalNodeId: 'original',
        committedNodeId: 'candidate',
        undoToken: 'undo',
      },
      events: [],
    }));

    expect(outcome).toEqual({
      status: 'CHECKPOINT_PENDING',
      committedFrameId: 'candidate',
      reason: 'P5 Safe Fix committed and is awaiting explicit restore/finalize checkpoint resolution.',
    });
  });

  it('fails closed if COMMITTED is missing commit evidence', () => {
    const outcome = p5SafeFixResultToBatchOutcome(result({
      schemaVersion: 1,
      transactionId: 'tx-2',
      state: 'COMMITTED',
      originalNodeId: 'original',
      validation: validation(true),
      events: [],
    }));

    expect(outcome.status).toBe('FAILED');
    if (outcome.status !== 'FAILED') return;
    expect(outcome.error).toContain('without commit evidence');
  });

  it('maps Full P3 rejection to an isolated frame failure with finding detail', () => {
    const outcome = p5SafeFixResultToBatchOutcome(result({
      schemaVersion: 1,
      transactionId: 'tx-3',
      state: 'REJECTED',
      originalNodeId: 'original',
      validation: validation(false),
      events: [],
    }));

    expect(outcome).toEqual({
      status: 'FAILED',
      error: 'Full P3 pixel diff exceeded the fixture threshold.',
    });
  });

  it('preserves transaction failure detail', () => {
    const outcome = p5SafeFixResultToBatchOutcome(result({
      schemaVersion: 1,
      transactionId: 'tx-4',
      state: 'FAILED',
      originalNodeId: 'original',
      failureStage: 'validate',
      error: 'validator timeout',
      events: [],
    }));

    expect(outcome).toEqual({ status: 'FAILED', error: 'validator timeout' });
  });

  it('maps a non-started P5 plan to a scheduler skip', () => {
    expect(p5SafeFixResultToBatchOutcome(result(null, 'not eligible'))).toEqual({ status: 'SKIPPED' });
  });
});
