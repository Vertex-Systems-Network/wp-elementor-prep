import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import {
  boundedP14DiagnosticDetail,
  boundedP14DiagnosticIdentity,
  boundedP14RuntimeErrorMessage,
  hasBoundedP14ReceiptCollectionLength,
  isP14BoundedDiagnosticDetail,
  isP14BoundedNonEmptyDiagnosticDetail,
  isP14BoundedReceiptIdentity,
  P14_MAX_RECEIPT_COLLECTION_ITEMS,
} from '../src/core/p14-receipt-evidence';

describe('P14 receipt diagnostic evidence bounds', () => {
  it('accepts exact identity/detail boundaries and rejects oversized evidence', () => {
    const identity = 'i'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength);
    const detail = 'd'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);
    expect(isP14BoundedReceiptIdentity(identity)).toBe(true);
    expect(isP14BoundedReceiptIdentity(`${identity}x`)).toBe(false);
    expect(isP14BoundedDiagnosticDetail(detail)).toBe(true);
    expect(isP14BoundedDiagnosticDetail(`${detail}x`)).toBe(false);
    expect(isP14BoundedNonEmptyDiagnosticDetail('detail')).toBe(true);
    expect(isP14BoundedNonEmptyDiagnosticDetail('')).toBe(false);
  });

  it('bounds generated detail/identity evidence deterministically', () => {
    const detail = boundedP14DiagnosticDetail('d'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 50));
    const identity = boundedP14DiagnosticIdentity('i'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 50), 'fallback');
    expect(detail).toHaveLength(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);
    expect(identity).toHaveLength(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength);
    expect(boundedP14DiagnosticDetail('', 'fallback')).toBe('fallback');
    expect(boundedP14DiagnosticIdentity('', 'fallback')).toBe('fallback');
  });

  it('sanitizes hostile runtime exception text without propagating stringification failure', () => {
    const huge = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 500);
    expect(boundedP14RuntimeErrorMessage(new Error(huge))).toHaveLength(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);

    const hostile = new Proxy({}, {
      get(_target, property) {
        if (property === Symbol.toPrimitive || property === 'toString') {
          throw new Error('hostile stringifier');
        }
        return undefined;
      },
    });
    expect(() => boundedP14RuntimeErrorMessage(hostile)).not.toThrow();
    expect(boundedP14RuntimeErrorMessage(hostile)).toBe('Unprintable runtime error.');
  });

  it('bounds receipt collection counts from length', () => {
    expect(P14_MAX_RECEIPT_COLLECTION_ITEMS).toBe(DEFAULT_P14_INPUT_BOUNDS.maxActions);
    expect(hasBoundedP14ReceiptCollectionLength(new Array(P14_MAX_RECEIPT_COLLECTION_ITEMS))).toBe(true);
    expect(hasBoundedP14ReceiptCollectionLength(new Array(P14_MAX_RECEIPT_COLLECTION_ITEMS + 1))).toBe(false);
  });
});
