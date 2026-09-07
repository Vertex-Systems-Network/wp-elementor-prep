import type {
  CandidateHandle,
  CandidateTransactionAdapter,
  TransactionEvent,
  TransactionResult,
  TransactionState,
} from './transaction-types';

function now(): string {
  return new Date().toISOString();
}

function event(state: TransactionState, detail?: string): TransactionEvent {
  return { state, at: now(), ...(detail ? { detail } : {}) };
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

let sequence = 0;
export function createTransactionId(prefix = 'tx'): string {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence.toString(36)}`;
}

async function safeDiscard(
  adapter: CandidateTransactionAdapter,
  candidate: CandidateHandle,
  events: TransactionEvent[],
): Promise<string | null> {
  events.push(event('DISCARDING'));
  try {
    await adapter.discardCandidate(candidate);
    return null;
  } catch (error) {
    return messageOf(error);
  }
}

/**
 * Deterministic P4 transaction state machine.
 *
 * The approved original is identified once and is never passed to the transform function.
 * Mutation happens only on the candidate. Commit is reachable only after a passing P3 validation report.
 */
export async function runCandidateTransaction(
  originalNodeId: string,
  adapter: CandidateTransactionAdapter,
  transactionId = createTransactionId(),
): Promise<TransactionResult> {
  const events: TransactionEvent[] = [event('IDLE')];
  let candidate: CandidateHandle | null = null;

  try {
    events.push(event('CLONING'));
    candidate = await adapter.cloneOriginal(originalNodeId, transactionId);
    if (candidate.originalNodeId !== originalNodeId) {
      throw new Error('Candidate adapter returned a handle for a different original node.');
    }
  } catch (error) {
    return {
      schemaVersion: 1,
      transactionId,
      state: 'FAILED',
      originalNodeId,
      failureStage: 'clone',
      error: messageOf(error),
      events: [...events, event('FAILED', 'clone failed')],
    };
  }

  try {
    events.push(event('TRANSFORMING'));
    await adapter.transformCandidate(candidate);
  } catch (error) {
    const discardError = await safeDiscard(adapter, candidate, events);
    return {
      schemaVersion: 1,
      transactionId,
      state: 'FAILED',
      originalNodeId,
      candidateNodeId: candidate.candidateNodeId,
      failureStage: discardError ? 'discard' : 'transform',
      error: discardError
        ? `Transform failed (${messageOf(error)}); candidate cleanup also failed (${discardError}).`
        : messageOf(error),
      events: [...events, event('FAILED', discardError ? 'transform + discard failed' : 'transform failed')],
    };
  }

  let validation;
  try {
    events.push(event('VALIDATING'));
    validation = await adapter.validateCandidate(candidate);
  } catch (error) {
    const discardError = await safeDiscard(adapter, candidate, events);
    return {
      schemaVersion: 1,
      transactionId,
      state: 'FAILED',
      originalNodeId,
      candidateNodeId: candidate.candidateNodeId,
      failureStage: discardError ? 'discard' : 'validate',
      error: discardError
        ? `Validation crashed (${messageOf(error)}); candidate cleanup also failed (${discardError}).`
        : messageOf(error),
      events: [...events, event('FAILED', discardError ? 'validation + discard failed' : 'validation failed')],
    };
  }

  if (!validation.passed) {
    const discardError = await safeDiscard(adapter, candidate, events);
    if (discardError) {
      return {
        schemaVersion: 1,
        transactionId,
        state: 'FAILED',
        originalNodeId,
        candidateNodeId: candidate.candidateNodeId,
        validation,
        failureStage: 'discard',
        error: `Candidate was rejected by validation, but cleanup failed: ${discardError}`,
        events: [...events, event('FAILED', 'rejected candidate cleanup failed')],
      };
    }

    return {
      schemaVersion: 1,
      transactionId,
      state: 'REJECTED',
      originalNodeId,
      candidateNodeId: candidate.candidateNodeId,
      validation,
      events: [...events, event('REJECTED', 'validation did not pass')],
    };
  }

  try {
    events.push(event('COMMITTING'));
    const commit = await adapter.commitCandidate(candidate, transactionId);
    return {
      schemaVersion: 1,
      transactionId,
      state: 'COMMITTED',
      originalNodeId,
      candidateNodeId: candidate.candidateNodeId,
      validation,
      commit,
      events: [...events, event('COMMITTED')],
    };
  } catch (error) {
    /*
     * A commit adapter is required to be swap-safe. Once commit is attempted we do not blindly
     * delete the candidate here, because an implementation may have already moved it into the
     * approved position. P4 Figma integration must make this stage recoverable/auditable.
     */
    return {
      schemaVersion: 1,
      transactionId,
      state: 'FAILED',
      originalNodeId,
      candidateNodeId: candidate.candidateNodeId,
      validation,
      failureStage: 'commit',
      error: messageOf(error),
      events: [...events, event('FAILED', 'commit failed; adapter recovery required')],
    };
  }
}
