import type { ValidationReport } from './validation-types';

export type TransactionState =
  | 'IDLE'
  | 'CLONING'
  | 'TRANSFORMING'
  | 'VALIDATING'
  | 'DISCARDING'
  | 'COMMITTING'
  | 'COMMITTED'
  | 'REJECTED'
  | 'FAILED';

export interface CandidateHandle {
  originalNodeId: string;
  candidateNodeId: string;
}

export interface CommitEvidence {
  transactionId: string;
  originalNodeId: string;
  committedNodeId: string;
  parentNodeId?: string;
  siblingIndex?: number;
  /** Small opaque token only. Never embed Figma node snapshots or PNG bytes here. */
  undoToken?: string;
}

export interface TransactionEvent {
  state: TransactionState;
  at: string;
  detail?: string;
}

export interface TransactionResult {
  schemaVersion: 1;
  transactionId: string;
  state: Extract<TransactionState, 'COMMITTED' | 'REJECTED' | 'FAILED'>;
  originalNodeId: string;
  candidateNodeId?: string;
  validation?: ValidationReport;
  commit?: CommitEvidence;
  failureStage?: 'clone' | 'transform' | 'validate' | 'discard' | 'commit';
  error?: string;
  events: TransactionEvent[];
}

export interface CandidateTransactionAdapter {
  cloneOriginal(originalNodeId: string, transactionId: string): Promise<CandidateHandle>;
  transformCandidate(candidate: CandidateHandle): Promise<void>;
  validateCandidate(candidate: CandidateHandle): Promise<ValidationReport>;
  /**
   * Commit must not mutate the approved original until validation has passed.
   * Implementations should swap/replace at the root boundary rather than replaying descendant edits onto the original.
   */
  commitCandidate(candidate: CandidateHandle, transactionId: string): Promise<CommitEvidence>;
  discardCandidate(candidate: CandidateHandle): Promise<void>;
}
