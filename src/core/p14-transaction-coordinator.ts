export interface P14TransactionLease {
  sourceScope: string;
  transactionId: string;
}

export type P14TransactionLeaseResult =
  | { acquired: true; lease: P14TransactionLease }
  | {
    acquired: false;
    reason: 'INVALID_SCOPE' | 'INVALID_TRANSACTION_ID' | 'SOURCE_BUSY' | 'TRANSACTION_ID_BUSY';
    ownerTransactionId?: string;
    ownerSourceScope?: string;
  };

function normalized(value: string): string {
  return value.trim();
}

/**
 * Process-local source-scope coordinator for P14 mutation transactions.
 *
 * This is deliberately not a distributed/persistent lock. A future Figma adapter may provide an
 * injected coordinator with a host-specific scope, but core execution still requires one owner per
 * source and one active source per transaction ID.
 */
export class P14SourceTransactionCoordinator {
  private readonly sourceOwners = new Map<string, string>();
  private readonly transactionSources = new Map<string, string>();

  tryAcquire(sourceScopeInput: string, transactionIdInput: string): P14TransactionLeaseResult {
    const sourceScope = normalized(sourceScopeInput);
    const transactionId = normalized(transactionIdInput);
    if (!sourceScope) return { acquired: false, reason: 'INVALID_SCOPE' };
    if (!transactionId) return { acquired: false, reason: 'INVALID_TRANSACTION_ID' };

    const sourceOwner = this.sourceOwners.get(sourceScope);
    if (sourceOwner !== undefined) {
      return {
        acquired: false,
        reason: 'SOURCE_BUSY',
        ownerTransactionId: sourceOwner,
        ownerSourceScope: sourceScope,
      };
    }

    const transactionSource = this.transactionSources.get(transactionId);
    if (transactionSource !== undefined) {
      return {
        acquired: false,
        reason: 'TRANSACTION_ID_BUSY',
        ownerTransactionId: transactionId,
        ownerSourceScope: transactionSource,
      };
    }

    this.sourceOwners.set(sourceScope, transactionId);
    this.transactionSources.set(transactionId, sourceScope);
    return { acquired: true, lease: { sourceScope, transactionId } };
  }

  release(lease: P14TransactionLease): boolean {
    const sourceScope = normalized(lease.sourceScope);
    const transactionId = normalized(lease.transactionId);
    if (!sourceScope || !transactionId) return false;
    if (this.sourceOwners.get(sourceScope) !== transactionId) return false;
    if (this.transactionSources.get(transactionId) !== sourceScope) return false;
    this.sourceOwners.delete(sourceScope);
    this.transactionSources.delete(transactionId);
    return true;
  }

  ownerOf(sourceScopeInput: string): string | null {
    const sourceScope = normalized(sourceScopeInput);
    return sourceScope ? (this.sourceOwners.get(sourceScope) ?? null) : null;
  }

  sourceOf(transactionIdInput: string): string | null {
    const transactionId = normalized(transactionIdInput);
    return transactionId ? (this.transactionSources.get(transactionId) ?? null) : null;
  }

  get activeCount(): number {
    return this.sourceOwners.size;
  }
}

export const DEFAULT_P14_SOURCE_TRANSACTION_COORDINATOR = new P14SourceTransactionCoordinator();
