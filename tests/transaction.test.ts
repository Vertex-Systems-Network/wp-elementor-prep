import { describe, expect, it } from 'vitest';
import { runCandidateTransaction } from '../src/core/transaction';
import type { CandidateHandle, CandidateTransactionAdapter, CommitEvidence } from '../src/core/transaction-types';
import type { IntegritySnapshot, ValidationReport } from '../src/core/validation-types';
import { validateIntegrity } from '../src/core/validator';

function snapshot(textFingerprint = 'text:same'): IntegritySnapshot {
  return {
    schemaVersion: 1,
    root: { width: 1000, height: 500 },
    textAnchors: [{
      kind: 'text',
      fingerprint: textFingerprint,
      geometry: { x: 100, y: 100, width: 300, height: 40 },
      path: '0/0',
    }],
    imageAnchors: [],
    visibleNodeCount: 2,
    nodeTypeCounts: { FRAME: 1, TEXT: 1 },
  };
}

function passingValidation(): ValidationReport {
  return validateIntegrity(snapshot(), snapshot());
}

function rejectedValidation(): ValidationReport {
  return validateIntegrity(snapshot(), snapshot('text:changed'));
}

class FakeAdapter implements CandidateTransactionAdapter {
  original = 'approved';
  candidate: string | null = null;
  cloneCalls = 0;
  transformCalls = 0;
  validateCalls = 0;
  commitCalls = 0;
  discardCalls = 0;
  transformError: Error | null = null;
  validateError: Error | null = null;
  discardError: Error | null = null;
  commitError: Error | null = null;
  validation: ValidationReport = passingValidation();

  async cloneOriginal(originalNodeId: string): Promise<CandidateHandle> {
    this.cloneCalls += 1;
    this.candidate = this.original;
    return { originalNodeId, candidateNodeId: 'candidate:1' };
  }

  async transformCandidate(): Promise<void> {
    this.transformCalls += 1;
    if (this.transformError) throw this.transformError;
    this.candidate = 'transformed';
  }

  async validateCandidate(): Promise<ValidationReport> {
    this.validateCalls += 1;
    if (this.validateError) throw this.validateError;
    return this.validation;
  }

  async commitCandidate(candidate: CandidateHandle, transactionId: string): Promise<CommitEvidence> {
    this.commitCalls += 1;
    if (this.commitError) throw this.commitError;
    if (this.candidate === null) throw new Error('candidate missing');
    this.original = this.candidate;
    this.candidate = null;
    return {
      transactionId,
      originalNodeId: candidate.originalNodeId,
      committedNodeId: candidate.candidateNodeId,
      parentNodeId: 'parent:1',
      siblingIndex: 2,
      undoToken: 'undo:1',
    };
  }

  async discardCandidate(): Promise<void> {
    this.discardCalls += 1;
    if (this.discardError) throw this.discardError;
    this.candidate = null;
  }
}

describe('runCandidateTransaction', () => {
  it('keeps the approved original unchanged when transform throws and cleans the candidate', async () => {
    const adapter = new FakeAdapter();
    adapter.transformError = new Error('forced transform failure');

    const result = await runCandidateTransaction('original:1', adapter, 'tx-transform-fail');

    expect(result.state).toBe('FAILED');
    expect(result.failureStage).toBe('transform');
    expect(adapter.original).toBe('approved');
    expect(adapter.candidate).toBeNull();
    expect(adapter.discardCalls).toBe(1);
    expect(adapter.commitCalls).toBe(0);
  });

  it('rejects a candidate that fails P3 validation without touching the original', async () => {
    const adapter = new FakeAdapter();
    adapter.validation = rejectedValidation();

    const result = await runCandidateTransaction('original:1', adapter, 'tx-rejected');

    expect(result.state).toBe('REJECTED');
    expect(result.validation?.passed).toBe(false);
    expect(adapter.original).toBe('approved');
    expect(adapter.candidate).toBeNull();
    expect(adapter.discardCalls).toBe(1);
    expect(adapter.commitCalls).toBe(0);
  });

  it('commits only after validation passes and returns small audit evidence', async () => {
    const adapter = new FakeAdapter();

    const result = await runCandidateTransaction('original:1', adapter, 'tx-success');

    expect(result.state).toBe('COMMITTED');
    expect(result.validation?.passed).toBe(true);
    expect(adapter.original).toBe('transformed');
    expect(adapter.commitCalls).toBe(1);
    expect(adapter.discardCalls).toBe(0);
    expect(result.commit).toMatchObject({
      transactionId: 'tx-success',
      originalNodeId: 'original:1',
      committedNodeId: 'candidate:1',
      undoToken: 'undo:1',
    });
    expect(JSON.stringify(result)).not.toContain('Uint8Array');
  });

  it('reports cleanup failure explicitly while still never committing', async () => {
    const adapter = new FakeAdapter();
    adapter.transformError = new Error('forced transform failure');
    adapter.discardError = new Error('forced discard failure');

    const result = await runCandidateTransaction('original:1', adapter, 'tx-discard-fail');

    expect(result.state).toBe('FAILED');
    expect(result.failureStage).toBe('discard');
    expect(adapter.original).toBe('approved');
    expect(adapter.commitCalls).toBe(0);
    expect(result.error).toMatch(/cleanup also failed/);
  });

  it('discards a candidate when validation itself crashes', async () => {
    const adapter = new FakeAdapter();
    adapter.validateError = new Error('validator crashed');

    const result = await runCandidateTransaction('original:1', adapter, 'tx-validate-crash');

    expect(result.state).toBe('FAILED');
    expect(result.failureStage).toBe('validate');
    expect(adapter.original).toBe('approved');
    expect(adapter.candidate).toBeNull();
    expect(adapter.discardCalls).toBe(1);
    expect(adapter.commitCalls).toBe(0);
  });

  it('does not blindly discard after commit begins, leaving recovery to the swap-safe adapter', async () => {
    const adapter = new FakeAdapter();
    adapter.commitError = new Error('commit failed after swap boundary entered');

    const result = await runCandidateTransaction('original:1', adapter, 'tx-commit-fail');

    expect(result.state).toBe('FAILED');
    expect(result.failureStage).toBe('commit');
    expect(adapter.discardCalls).toBe(0);
    expect(result.events.some((item) => item.state === 'COMMITTING')).toBe(true);
  });
});
