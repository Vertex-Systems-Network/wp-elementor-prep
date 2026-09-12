import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';
import { P14_PREPARATION_ENGINE_VERSION } from '../src/core/p14-preparation-types';
import { P14_MAX_RECEIPT_COLLECTION_ITEMS } from '../src/core/p14-receipt-evidence';

const NOW = '2026-09-12T00:00:00.000Z';

function noChangeReceipt() {
  return {
    schemaVersion: 1,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    transactionId: 'receipt-envelope-tx',
    status: 'NO_CHANGES_NEEDED',
    terminalState: 'COMPLETE',
    source: {
      nodeId: 'receipt-envelope:source',
      beforeFingerprint: 'receipt-envelope-fingerprint',
      afterFingerprint: 'receipt-envelope-fingerprint',
    },
    p13RunId: 'p13-receipt-envelope',
    planDigest: 'p14-plan-receipt-envelope',
    appliedActions: [],
    errors: [],
    events: [
      { state: 'IDLE', at: NOW },
      { state: 'COMPLETE', at: NOW },
    ],
  };
}

function oversizedArrayProxy(label: string): unknown[] {
  const target = new Array(P14_MAX_RECEIPT_COLLECTION_ITEMS + 1);
  return new Proxy(target, {
    get(array, property, receiver) {
      if (property !== 'length') throw new Error(`${label} was traversed: ${String(property)}`);
      return Reflect.get(array, property, receiver);
    },
  });
}

describe('P14 receipt envelope and diagnostic integrity', () => {
  it('rejects oversized top-level receipt identities', () => {
    const hostile = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    for (const mutate of [
      (value: ReturnType<typeof noChangeReceipt>) => { value.transactionId = hostile; },
      (value: ReturnType<typeof noChangeReceipt>) => { value.p13RunId = hostile; },
      (value: ReturnType<typeof noChangeReceipt>) => { value.planDigest = `p14-plan-${hostile}`; },
      (value: ReturnType<typeof noChangeReceipt>) => { value.source.nodeId = hostile; },
    ]) {
      const value = noChangeReceipt();
      mutate(value);
      expect(validateP14PreparationReceipt(value).valid).toBe(false);
    }
  });

  it.each(['appliedActions', 'errors', 'events'] as const)(
    'rejects oversized %s from length without traversing contents',
    (field) => {
      const value = noChangeReceipt() as ReturnType<typeof noChangeReceipt> & Record<typeof field, unknown[]>;
      value[field] = oversizedArrayProxy(field);
      expect(() => validateP14PreparationReceipt(value)).not.toThrow();
      const result = validateP14PreparationReceipt(value);
      expect(result.valid).toBe(false);
      expect(result.failures.some((failure) => failure.includes(field) && failure.includes('bounded'))).toBe(true);
    },
  );

  it('rejects oversized error diagnostic fields', () => {
    const value = noChangeReceipt() as ReturnType<typeof noChangeReceipt> & {
      status: string;
      terminalState: string;
      errors: Array<Record<string, unknown>>;
    };
    value.status = 'BLOCKED';
    value.terminalState = 'BLOCKED';
    value.events = [
      { state: 'IDLE', at: NOW },
      { state: 'BLOCKED', at: NOW },
    ];
    value.errors = [{
      code: 'P14_INTERNAL_INVARIANT_FAILED',
      stage: 's'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1),
      detail: 'd'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1),
      recovery: 'r'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1),
    }];
    expect(validateP14PreparationReceipt(value).valid).toBe(false);
  });

  it('rejects oversized event timestamp/detail evidence', () => {
    const value = noChangeReceipt();
    value.events[0] = {
      state: 'IDLE',
      at: '2'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1),
      detail: 'd'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1),
    } as (typeof value.events)[number];
    expect(validateP14PreparationReceipt(value).valid).toBe(false);
  });
});
