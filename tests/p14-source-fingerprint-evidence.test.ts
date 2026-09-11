import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import {
  P14_UNKNOWN_SOURCE_FINGERPRINT,
  isP14ReceiptSourceFingerprintEvidence,
  validateP14SourceFingerprintEvidence,
} from '../src/core/p14-source-fingerprint-evidence';

describe('P14 source fingerprint evidence', () => {
  it('accepts a bounded non-empty runtime fingerprint without inventing a format', () => {
    const value = 'runtime-fingerprint:v1/arbitrary-format';
    expect(validateP14SourceFingerprintEvidence(value)).toEqual({
      valid: true,
      failures: [],
      value,
    });
  });

  it.each([null, undefined, '', '   ', 123, {}, []])('rejects malformed runtime fingerprint evidence %#', (value) => {
    const result = validateP14SourceFingerprintEvidence(value);
    expect(result.valid).toBe(false);
    expect(result.value).toBeNull();
  });

  it('rejects oversized runtime fingerprints without echoing the hostile value', () => {
    const hostile = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    const result = validateP14SourceFingerprintEvidence(hostile);
    expect(result.valid).toBe(false);
    expect(result.failures.join(' ')).not.toContain(hostile);
    expect(result.value).toBeNull();
  });

  it('reserves UNKNOWN for receipts and rejects it as actual runtime proof', () => {
    expect(validateP14SourceFingerprintEvidence(P14_UNKNOWN_SOURCE_FINGERPRINT).valid).toBe(false);
    expect(isP14ReceiptSourceFingerprintEvidence(P14_UNKNOWN_SOURCE_FINGERPRINT)).toBe(true);
  });

  it('receipt helper accepts only UNKNOWN or valid bounded actual fingerprint evidence', () => {
    expect(isP14ReceiptSourceFingerprintEvidence('fp-valid')).toBe(true);
    expect(isP14ReceiptSourceFingerprintEvidence('')).toBe(false);
    expect(isP14ReceiptSourceFingerprintEvidence(null)).toBe(false);
    expect(isP14ReceiptSourceFingerprintEvidence('x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1))).toBe(false);
  });
});
