import type { BatchItemOutcome } from '../core/batch-queue';
import type { SafeFixRuntimeResult } from './safe-fix-runtime';

function rejectionDetail(result: SafeFixRuntimeResult): string {
  const finding = result.transaction?.validation?.findings.find((item) => item.severity === 'error');
  return finding?.detail
    ?? finding?.title
    ?? 'Safe Fix candidate was rejected by mandatory Full P3 validation.';
}

/**
 * Deterministic adapter from the canonical P5 single-frame transaction result into P7 scheduler
 * semantics. It does not perform any mutation itself.
 */
export function p5SafeFixResultToBatchOutcome(result: SafeFixRuntimeResult): BatchItemOutcome {
  if (!result.transaction) {
    return { status: 'SKIPPED' };
  }

  if (result.transaction.state === 'COMMITTED') {
    if (!result.transaction.commit) {
      return {
        status: 'FAILED',
        error: 'P5 reported COMMITTED without commit evidence; refusing to create a batch checkpoint state.',
      };
    }
    return {
      status: 'CHECKPOINT_PENDING',
      reason: 'P5 Safe Fix committed and is awaiting explicit restore/finalize checkpoint resolution.',
    };
  }

  if (result.transaction.state === 'REJECTED') {
    return { status: 'FAILED', error: rejectionDetail(result) };
  }

  return {
    status: 'FAILED',
    error: result.transaction.error
      ?? `P5 Safe Fix transaction failed${result.transaction.failureStage ? ` during ${result.transaction.failureStage}` : ''}.`,
  };
}
