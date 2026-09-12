import { describe, expect, it } from 'vitest';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';
import {
  P14_PREPARATION_ENGINE_VERSION,
  type P14PreparationReceiptV1,
} from '../src/core/p14-preparation-types';

const fixedAt = '2026-09-13T00:00:00.000Z';

function noChangesReceipt(): P14PreparationReceiptV1 {
  return {
    schemaVersion: 1,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    transactionId: 'tx-receipt-snapshot',
    status: 'NO_CHANGES_NEEDED',
    terminalState: 'COMPLETE',
    source: {
      nodeId: '1:1',
      beforeFingerprint: 'source-fingerprint',
      afterFingerprint: 'source-fingerprint',
    },
    p13RunId: 'p13-receipt-snapshot',
    planDigest: 'p14-plan-receipt-snapshot',
    appliedActions: [],
    errors: [],
    events: [
      { state: 'IDLE', at: fixedAt },
      { state: 'COMPLETE', at: fixedAt },
    ],
  };
}

function preparedReceipt(): P14PreparationReceiptV1 {
  return {
    ...noChangesReceipt(),
    transactionId: 'tx-prepared-snapshot',
    status: 'PREPARED',
    candidate: {
      nodeId: 'candidate:1',
      retained: true,
    },
    validation: {
      passed: true,
      profileIdsRun: ['P14_VALIDATE_SNAPSHOT'],
      checks: [{ id: 'required', passed: true, required: true }],
    },
    rescore: {
      runId: 'p13-rescore-snapshot',
      score: 95,
      status: 'READY',
      blockerCount: 0,
      highRiskCount: 0,
      introducedBlockerOrHighCount: 0,
      reviewRequired: false,
    },
    retention: {
      transactionId: 'tx-prepared-snapshot',
      sourceNodeId: '1:1',
      retainedNodeId: 'candidate:1',
      preparedName: 'Prepared Snapshot',
    },
  };
}

describe('P14 receipt semantic snapshot', () => {
  it('fails closed when the top-level receipt proxy is revoked', () => {
    const revoked = Proxy.revocable(noChangesReceipt() as unknown as object, {});
    revoked.revoke();

    let result;
    expect(() => {
      result = validateP14PreparationReceipt(revoked.proxy);
    }).not.toThrow();
    expect(result!.valid).toBe(false);
    expect(result!.failures.some((failure: string) => failure.includes('could not be inspected safely'))).toBe(true);
  });

  it('captures top-level semantic fields once before validation', () => {
    const receipt = noChangesReceipt() as any;
    let statusReads = 0;
    Object.defineProperty(receipt, 'status', {
      enumerable: true,
      configurable: true,
      get() {
        statusReads += 1;
        return statusReads === 1 ? 'NO_CHANGES_NEEDED' : 'BLOCKED';
      },
    });

    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
    expect(statusReads).toBe(1);
  });

  it('captures source and candidate semantic fields once', () => {
    const receipt = preparedReceipt() as any;
    let sourceNodeReads = 0;
    let retainedReads = 0;
    Object.defineProperty(receipt.source, 'nodeId', {
      enumerable: true,
      configurable: true,
      get() {
        sourceNodeReads += 1;
        return sourceNodeReads === 1 ? '1:1' : 'forged-source';
      },
    });
    Object.defineProperty(receipt.candidate, 'retained', {
      enumerable: true,
      configurable: true,
      get() {
        retainedReads += 1;
        return retainedReads === 1 ? true : false;
      },
    });

    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
    expect(sourceNodeReads).toBe(1);
    expect(retainedReads).toBe(1);
  });

  it('fails closed for revoked receipt-owned collections', () => {
    for (const field of ['appliedActions', 'errors', 'events'] as const) {
      const receipt = noChangesReceipt() as any;
      const revoked = Proxy.revocable([], {});
      revoked.revoke();
      receipt[field] = revoked.proxy;

      let result;
      expect(() => {
        result = validateP14PreparationReceipt(receipt);
      }).not.toThrow();
      expect(result!.valid).toBe(false);
      expect(result!.failures.some((failure: string) => failure.includes(`${field} could not be read safely`))).toBe(true);
    }
  });

  it('copies bounded collection indices once instead of retaining the source array', () => {
    const receipt = noChangesReceipt() as any;
    let eventIndexReads = 0;
    const first = { state: 'IDLE', at: fixedAt };
    const second = { state: 'COMPLETE', at: fixedAt };
    receipt.events = new Proxy([first, second], {
      get(target, property, receiver) {
        if (property === '0' || property === '1') {
          eventIndexReads += 1;
          if (eventIndexReads > 2) throw new Error('receipt events were re-read after snapshot');
        }
        return Reflect.get(target, property, receiver);
      },
    });

    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
    expect(eventIndexReads).toBe(2);
  });

  it('fails closed when a copied collection item becomes unreadable', () => {
    const receipt = noChangesReceipt() as any;
    const revoked = Proxy.revocable({ state: 'IDLE', at: fixedAt }, {});
    revoked.revoke();
    receipt.events = [revoked.proxy, { state: 'COMPLETE', at: fixedAt }];

    let result;
    expect(() => {
      result = validateP14PreparationReceipt(receipt);
    }).not.toThrow();
    expect(result!.valid).toBe(false);
    expect(result!.failures.some((failure: string) => failure.includes('events[0]'))).toBe(true);
  });

  it('uses detached accepted validation and rescore evidence for PREPARED invariants', () => {
    const receipt = preparedReceipt() as any;
    let passedReads = 0;
    let profilesReads = 0;
    let introducedReads = 0;
    let reviewReads = 0;

    Object.defineProperty(receipt.validation, 'passed', {
      enumerable: true,
      configurable: true,
      get() {
        passedReads += 1;
        return passedReads === 1 ? true : false;
      },
    });
    Object.defineProperty(receipt.validation, 'profileIdsRun', {
      enumerable: true,
      configurable: true,
      get() {
        profilesReads += 1;
        return profilesReads === 1 ? ['P14_VALIDATE_SNAPSHOT'] : [];
      },
    });
    Object.defineProperty(receipt.rescore, 'introducedBlockerOrHighCount', {
      enumerable: true,
      configurable: true,
      get() {
        introducedReads += 1;
        return introducedReads === 1 ? 0 : 1;
      },
    });
    Object.defineProperty(receipt.rescore, 'reviewRequired', {
      enumerable: true,
      configurable: true,
      get() {
        reviewReads += 1;
        return reviewReads === 1 ? false : true;
      },
    });

    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
    expect(passedReads).toBe(1);
    expect(profilesReads).toBe(1);
    expect(introducedReads).toBe(1);
    expect(reviewReads).toBe(1);
  });

  it('preserves ordinary valid receipt semantics', () => {
    expect(validateP14PreparationReceipt(noChangesReceipt())).toEqual({ valid: true, failures: [] });
    expect(validateP14PreparationReceipt(preparedReceipt())).toEqual({ valid: true, failures: [] });
  });
});
