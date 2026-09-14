import { describe, expect, it } from 'vitest';
import {
  GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_VALUES,
  fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue,
} from '../src/targets/gutenberg/native-serialization-evidence-retention-requirements-validation';

function objectWithPrimitiveProperties(count: number): Record<string, unknown> {
  const value = Object.create(null) as Record<string, unknown>;
  for (let index = 0; index < count; index += 1) {
    value[String(index)] = null;
  }
  return value;
}

describe('P16 direct retention manifest object cardinality preflight', () => {
  it('accepts root plus 49,999 primitive properties at the 50,000-value boundary', () => {
    const value = objectWithPrimitiveProperties(
      GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_VALUES - 1,
    );

    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(value))
      .toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('rejects root plus 50,000 primitive properties before child traversal', () => {
    const value = objectWithPrimitiveProperties(
      GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_VALUES,
    );

    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(value))
      .toBeNull();
  });
});
