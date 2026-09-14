import { describe, expect, it } from 'vitest';
import {
  fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue,
  GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_TEXT_BYTES,
} from '../src/targets/gutenberg/native-serialization-evidence-retention-requirements-validation';

const fingerprint = fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue;

describe('P16 direct retention canonicalization UTF-8 text bounds', () => {
  it('accepts exactly 1 MiB of ASCII string text and fails closed one byte beyond', () => {
    const atLimit = 'a'.repeat(GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_TEXT_BYTES);
    const overLimit = `${atLimit}a`;

    expect(fingerprint(atLimit)).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(fingerprint(overLimit)).toBeNull();
  });

  it('counts object-key text against the same aggregate byte budget', () => {
    const atLimitKey = 'k'.repeat(GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_TEXT_BYTES);
    const overLimitKey = `${atLimitKey}k`;

    expect(fingerprint({ [atLimitKey]: null })).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(fingerprint({ [overLimitKey]: null })).toBeNull();
  });

  it('counts surrogate pairs by their four-byte UTF-8 width', () => {
    const pairCount = GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_TEXT_BYTES / 4;
    const atLimit = '😀'.repeat(pairCount);

    expect(fingerprint(atLimit)).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(fingerprint(`${atLimit}a`)).toBeNull();
  });

  it('counts lone surrogates using the three-byte UTF-8 replacement width', () => {
    const loneSurrogateCount = Math.floor(
      (GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_TEXT_BYTES - 1) / 3,
    );
    const atLimit = `a${'\ud800'.repeat(loneSurrogateCount)}`;

    expect(1 + (loneSurrogateCount * 3))
      .toBe(GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_TEXT_BYTES);
    expect(fingerprint(atLimit)).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(fingerprint(`${atLimit}a`)).toBeNull();
  });
});
