import { describe, expect, it } from 'vitest';
import {
  fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue,
} from '../src/targets/gutenberg/native-serialization-evidence-retention-requirements-validation';

describe('P16 direct retention manifest canonicalization own-property shape', () => {
  it('rejects an own symbol property on a plain object', () => {
    const value: Record<PropertyKey, unknown> = { payload: 'ok' };
    value[Symbol('hidden')] = 'secret';

    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(value))
      .toBeNull();
  });

  it('rejects a non-enumerable own string property on a plain object', () => {
    const value: Record<string, unknown> = { payload: 'ok' };
    Object.defineProperty(value, 'hidden', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: 'secret',
    });

    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(value))
      .toBeNull();
  });

  it('rejects an extra named property on an array', () => {
    const value = ['ok'] as unknown[] & { extra?: string };
    value.extra = 'secret';

    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(value))
      .toBeNull();
  });

  it('rejects an own symbol property on an array', () => {
    const value = ['ok'] as unknown[] & Record<PropertyKey, unknown>;
    value[Symbol('hidden')] = 'secret';

    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(value))
      .toBeNull();
  });

  it('continues to accept frozen JSON-shaped objects and arrays', () => {
    const frozen = Object.freeze({
      payload: Object.freeze(['ok', 1, true, null]),
    });
    const equivalent = { payload: ['ok', 1, true, null] };

    const fingerprint = fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(frozen);
    expect(fingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(fingerprint).toBe(
      fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(equivalent),
    );
  });

  it('continues to canonicalize an own enumerable __proto__ data key', () => {
    const value = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(value, '__proto__', {
      enumerable: true,
      configurable: false,
      writable: false,
      value: 'kept-as-data',
    });
    const equivalent = JSON.parse('{"__proto__":"kept-as-data"}') as unknown;

    const fingerprint = fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(value);
    expect(fingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(fingerprint).toBe(
      fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(equivalent),
    );
  });
});
