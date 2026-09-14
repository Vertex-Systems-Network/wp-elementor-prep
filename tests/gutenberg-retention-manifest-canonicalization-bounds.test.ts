import { describe, expect, it } from 'vitest';
import {
  fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue,
  GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_DEPTH,
  GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_VALUES,
} from '../src/targets/gutenberg/native-serialization-evidence-retention-requirements-validation';

function nestedArray(levels: number): unknown {
  let value: unknown = null;
  for (let index = 0; index < levels; index += 1) {
    value = [value];
  }
  return value;
}

describe('P16 direct retention manifest canonicalization bounds', () => {
  it('accepts the exact depth limit and fails closed one level beyond it', () => {
    const atLimit = nestedArray(GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_DEPTH);
    const overLimit = nestedArray(GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_DEPTH + 1);

    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(atLimit))
      .toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(overLimit))
      .toBeNull();
  });

  it('accepts exactly the total-value limit and fails closed one value beyond it', () => {
    const atLimit = Array.from(
      { length: GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_VALUES - 1 },
      () => null,
    );
    const overLimit = Array.from(
      { length: GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_VALUES },
      () => null,
    );

    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(atLimit))
      .toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(overLimit))
      .toBeNull();
  });
});
