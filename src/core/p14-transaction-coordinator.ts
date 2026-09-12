import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';

export interface P14TransactionLease {
  sourceScope: string;
  transactionId: string;
}

export type P14TransactionLeaseFailureReason =
  | 'INVALID_SCOPE'
  | 'INVALID_TRANSACTION_ID'
  | 'SOURCE_BUSY'
  | 'TRANSACTION_ID_BUSY';

export type P14TransactionLeaseResult =
  | { acquired: true; lease: P14TransactionLease }
  | {
    acquired: false;
    reason: P14TransactionLeaseFailureReason;
    ownerTransactionId?: string;
    ownerSourceScope?: string;
  };

export interface P14TransactionLeaseEvidenceResult {
  valid: boolean;
  failures: string[];
  claimedAcquired: boolean;
  expectedLease: P14TransactionLease;
  value?: P14TransactionLeaseResult;
}

const LEASE_FAILURE_REASONS = new Set<P14TransactionLeaseFailureReason>([
  'INVALID_SCOPE',
  'INVALID_TRANSACTION_ID',
  'SOURCE_BUSY',
  'TRANSACTION_ID_BUSY',
]);

function normalized(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function boundedIdentity(value: unknown): string | null {
  if (typeof value !== 'string'
    || value.length === 0
    || value.length > DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength) {
    return null;
  }
  const valueNormalized = value.trim();
  return valueNormalized.length > 0 ? valueNormalized : null;
}

/**
 * Treat an injected coordinator result as runtime evidence, not authority granted by its TypeScript type.
 * The returned value is normalized/bounded before transaction code may branch on it or copy owner identity.
 */
export function assessP14TransactionLeaseResultEvidence(
  value: unknown,
  sourceScopeInput: string,
  transactionIdInput: string,
): P14TransactionLeaseEvidenceResult {
  const expectedLease: P14TransactionLease = {
    sourceScope: normalized(sourceScopeInput),
    transactionId: normalized(transactionIdInput),
  };
  const failures: string[] = [];
  let claimedAcquired = false;
  let acceptedValue: P14TransactionLeaseResult | undefined;

  try {
    if (!isRecord(value)) {
      failures.push('Coordinator lease result must be an object.');
      return { valid: false, failures, claimedAcquired, expectedLease };
    }

    const acquired = value.acquired;
    claimedAcquired = acquired === true;
    if (typeof acquired !== 'boolean') {
      failures.push('Coordinator lease result acquired flag must be boolean.');
      return { valid: false, failures, claimedAcquired, expectedLease };
    }

    if (acquired) {
      if (!isRecord(value.lease)) {
        failures.push('Acquired coordinator result must include a lease object.');
      } else {
        const sourceScope = boundedIdentity(value.lease.sourceScope);
        const transactionId = boundedIdentity(value.lease.transactionId);
        if (!sourceScope || sourceScope !== expectedLease.sourceScope) {
          failures.push('Coordinator lease sourceScope is missing, oversized or does not match the requested source scope.');
        }
        if (!transactionId || transactionId !== expectedLease.transactionId) {
          failures.push('Coordinator lease transactionId is missing, oversized or does not match the requested transaction ID.');
        }
      }
      if (failures.length === 0) {
        acceptedValue = { acquired: true, lease: { ...expectedLease } };
      }
    } else {
      const reason = value.reason;
      if (typeof reason !== 'string' || !LEASE_FAILURE_REASONS.has(reason as P14TransactionLeaseFailureReason)) {
        failures.push('Coordinator lease refusal reason is unsupported.');
      }

      let ownerTransactionId: string | undefined;
      if (value.ownerTransactionId !== undefined) {
        ownerTransactionId = boundedIdentity(value.ownerTransactionId) ?? undefined;
        if (!ownerTransactionId) failures.push('Coordinator ownerTransactionId is malformed or oversized.');
      }

      let ownerSourceScope: string | undefined;
      if (value.ownerSourceScope !== undefined) {
        ownerSourceScope = boundedIdentity(value.ownerSourceScope) ?? undefined;
        if (!ownerSourceScope) failures.push('Coordinator ownerSourceScope is malformed or oversized.');
      }

      if (failures.length === 0) {
        acceptedValue = {
          acquired: false,
          reason: reason as P14TransactionLeaseFailureReason,
          ...(ownerTransactionId ? { ownerTransactionId } : {}),
          ...(ownerSourceScope ? { ownerSourceScope } : {}),
        };
      }
    }
  } catch {
    failures.push('Coordinator lease result could not be read safely.');
  }

  return {
    valid: failures.length === 0 && acceptedValue !== undefined,
    failures,
    claimedAcquired,
    expectedLease,
    ...(acceptedValue ? { value: acceptedValue } : {}),
  };
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
    const sourceScope = normalized(lease?.sourceScope);
    const transactionId = normalized(lease?.transactionId);
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
