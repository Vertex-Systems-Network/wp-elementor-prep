import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { validateP14ValidationEvidence } from '../src/core/p14-validation-evidence';

describe('P14 bounded validation evidence', () => {
  it('accepts and normalizes bounded validation checks without deciding policy', () => {
    const result = validateP14ValidationEvidence({
      passed: true,
      profileIdsRun: ['PROFILE_A'],
      checks: [
        { id: 'structure', passed: true, required: true, detail: 'ok' },
        { id: 'advisory', passed: false, required: false },
      ],
    });

    expect(result.valid).toBe(true);
    expect(result.value).toEqual({
      version: 1,
      passed: true,
      profileIdsRun: ['PROFILE_A'],
      checks: [
        { id: 'structure', passed: true, required: true, detail: 'ok' },
        { id: 'advisory', passed: false, required: false },
      ],
    });
  });

  it('rejects an oversized checks array from length without traversing its contents', () => {
    const target = new Array(DEFAULT_P14_INPUT_BOUNDS.maxActions + 1);
    const checks = new Proxy(target, {
      get(array, property, receiver) {
        if (property !== 'length') {
          throw new Error(`oversized validation checks were traversed: ${String(property)}`);
        }
        return Reflect.get(array, property, receiver);
      },
    });

    expect(() => validateP14ValidationEvidence({
      passed: true,
      profileIdsRun: [],
      checks,
    })).not.toThrow();

    const result = validateP14ValidationEvidence({
      passed: true,
      profileIdsRun: [],
      checks,
    });
    expect(result.valid).toBe(false);
    expect(result.value).toBeNull();
    expect(result.failures.some((failure) => failure.includes('bounded check count'))).toBe(true);
  });

  it('rejects oversized check identity and detail evidence', () => {
    const oversizedId = 'i'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    const oversizedDetail = 'd'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1);

    const idResult = validateP14ValidationEvidence({
      passed: true,
      profileIdsRun: [],
      checks: [{ id: oversizedId, passed: true, required: true }],
    });
    expect(idResult.valid).toBe(false);
    expect(idResult.failures.some((failure) => failure.includes('oversized id'))).toBe(true);

    const detailResult = validateP14ValidationEvidence({
      passed: true,
      profileIdsRun: [],
      checks: [{ id: 'bounded-id', passed: true, required: true, detail: oversizedDetail }],
    });
    expect(detailResult.valid).toBe(false);
    expect(detailResult.failures.some((failure) => failure.includes('oversized detail'))).toBe(true);
  });

  it('accepts exact boundary lengths', () => {
    const result = validateP14ValidationEvidence({
      passed: true,
      profileIdsRun: [],
      checks: [{
        id: 'i'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength),
        passed: true,
        required: true,
        detail: 'd'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength),
      }],
    });
    expect(result.valid).toBe(true);
  });
});
