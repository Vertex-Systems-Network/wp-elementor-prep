import { describe, expect, it } from 'vitest';
import { assessP14TransactionLeaseResultEvidence } from '../src/core/p14-transaction-coordinator';

describe('P14 coordinator acquisition evidence semantic snapshot', () => {
  it('reads an acquired lease object and nested identities once before exact binding', () => {
    let leaseReads = 0;
    let sourceScopeReads = 0;
    let transactionIdReads = 0;

    const leaseEvidence = {
      get sourceScope() {
        sourceScopeReads += 1;
        return sourceScopeReads === 1 ? 'source:1' : 'source:mutated';
      },
      get transactionId() {
        transactionIdReads += 1;
        return transactionIdReads === 1 ? 'tx:1' : 'tx:mutated';
      },
    };

    const result = assessP14TransactionLeaseResultEvidence({
      acquired: true,
      get lease() {
        leaseReads += 1;
        return leaseReads === 1
          ? leaseEvidence
          : { sourceScope: 'source:mutated', transactionId: 'tx:mutated' };
      },
    }, 'source:1', 'tx:1');

    expect(result.valid).toBe(true);
    expect(result.claimedAcquired).toBe(true);
    expect(result.value).toEqual({
      acquired: true,
      lease: { sourceScope: 'source:1', transactionId: 'tx:1' },
    });
    expect(leaseReads).toBe(1);
    expect(sourceScopeReads).toBe(1);
    expect(transactionIdReads).toBe(1);
  });

  it('reads refusal owner identities once and returns detached accepted evidence', () => {
    let ownerTransactionReads = 0;
    let ownerSourceReads = 0;

    const evidence = {
      acquired: false,
      reason: 'SOURCE_BUSY',
      get ownerTransactionId() {
        ownerTransactionReads += 1;
        return ownerTransactionReads === 1 ? 'tx:owner' : 'tx:mutated';
      },
      get ownerSourceScope() {
        ownerSourceReads += 1;
        return ownerSourceReads === 1 ? 'source:owner' : 'source:mutated';
      },
    };

    const result = assessP14TransactionLeaseResultEvidence(evidence, 'source:requested', 'tx:requested');

    expect(result.valid).toBe(true);
    expect(result.claimedAcquired).toBe(false);
    expect(result.value).toEqual({
      acquired: false,
      reason: 'SOURCE_BUSY',
      ownerTransactionId: 'tx:owner',
      ownerSourceScope: 'source:owner',
    });
    expect(ownerTransactionReads).toBe(1);
    expect(ownerSourceReads).toBe(1);
  });

  it('preserves claimed-acquired cleanup evidence when nested lease capture fails', () => {
    const result = assessP14TransactionLeaseResultEvidence({
      acquired: true,
      get lease(): never {
        throw new Error('unreadable acquired lease');
      },
    }, 'source:1', 'tx:1');

    expect(result.valid).toBe(false);
    expect(result.claimedAcquired).toBe(true);
    expect(result.value).toBeUndefined();
    expect(result.failures).toContain('Coordinator lease result could not be read safely.');
    expect(result.expectedLease).toEqual({ sourceScope: 'source:1', transactionId: 'tx:1' });
  });

  it('fails closed on a revoked coordinator result proxy instead of throwing', () => {
    const revoked = Proxy.revocable({
      acquired: true,
      lease: { sourceScope: 'source:1', transactionId: 'tx:1' },
    }, {});
    revoked.revoke();

    expect(() => assessP14TransactionLeaseResultEvidence(revoked.proxy, 'source:1', 'tx:1')).not.toThrow();
    const result = assessP14TransactionLeaseResultEvidence(revoked.proxy, 'source:1', 'tx:1');
    expect(result.valid).toBe(false);
    expect(result.value).toBeUndefined();
    expect(result.failures).toContain('Coordinator lease result could not be read safely.');
  });
});
