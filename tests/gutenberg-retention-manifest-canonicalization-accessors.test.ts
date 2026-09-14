import { describe, expect, it } from 'vitest';
import {
  fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue,
} from '../src/targets/gutenberg/native-serialization-evidence-retention-requirements-validation';

describe('P16 direct retention manifest canonicalization accessor rejection', () => {
  it('rejects an enumerable object getter without invoking it', () => {
    let getterCalls = 0;
    const value: Record<string, unknown> = {};
    Object.defineProperty(value, 'payload', {
      enumerable: true,
      configurable: true,
      get() {
        getterCalls += 1;
        return 'secret';
      },
    });

    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(value))
      .toBeNull();
    expect(getterCalls).toBe(0);
  });

  it('rejects an enumerable array-index getter without invoking it', () => {
    let getterCalls = 0;
    const value: unknown[] = [null];
    Object.defineProperty(value, '0', {
      enumerable: true,
      configurable: true,
      get() {
        getterCalls += 1;
        return 'secret';
      },
    });

    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(value))
      .toBeNull();
    expect(getterCalls).toBe(0);
  });

  it('continues to canonicalize own enumerable data properties including __proto__', () => {
    const value = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(value, '__proto__', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 'kept-as-data',
    });
    Object.defineProperty(value, 'payload', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ['ok'],
    });

    const equivalent = JSON.parse('{"__proto__":"kept-as-data","payload":["ok"]}') as unknown;
    const fingerprint = fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(value);

    expect(fingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(fingerprint).toBe(
      fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(equivalent),
    );
    expect(Object.prototype).not.toHaveProperty('kept-as-data');
  });
});
