import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { validateP14RescoreEvidence } from '../src/core/p14-rescore-evidence';

const valid = {
  runId: 'p13-candidate-rescore',
  score: 92,
  status: 'REVIEW',
  blockerCount: 0,
  highRiskCount: 0,
  introducedBlockerOrHighCount: 0,
  reviewRequired: true,
};

describe('P14 candidate re-score evidence', () => {
  it('accepts bounded scored P13 evidence', () => {
    const result = validateP14RescoreEvidence(valid);
    expect(result.valid).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.value).toEqual(valid);
  });

  it('accepts each scored P13 status but not INSUFFICIENT_EVIDENCE with a numeric score', () => {
    for (const status of ['READY', 'REVIEW', 'NOT_READY']) {
      expect(validateP14RescoreEvidence({ ...valid, status }).valid).toBe(true);
    }
    const insufficient = validateP14RescoreEvidence({ ...valid, status: 'INSUFFICIENT_EVIDENCE' });
    expect(insufficient.valid).toBe(false);
    expect(insufficient.failures.some((failure) => failure.includes('score=null'))).toBe(true);
  });

  it('rejects null and malformed objects', () => {
    expect(validateP14RescoreEvidence(null).valid).toBe(false);
    expect(validateP14RescoreEvidence([]).valid).toBe(false);
    expect(validateP14RescoreEvidence({}).valid).toBe(false);
  });

  it('rejects NaN, Infinity, fractional and out-of-range scores', () => {
    for (const score of [Number.NaN, Number.POSITIVE_INFINITY, 90.5, -1, 101]) {
      const result = validateP14RescoreEvidence({ ...valid, score });
      expect(result.valid).toBe(false);
      expect(result.value).toBeNull();
    }
  });

  it('rejects negative, fractional and unsafe finding counts', () => {
    for (const key of ['blockerCount', 'highRiskCount', 'introducedBlockerOrHighCount'] as const) {
      for (const count of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
        const result = validateP14RescoreEvidence({ ...valid, [key]: count });
        expect(result.valid).toBe(false);
        expect(result.value).toBeNull();
      }
    }
  });

  it('rejects missing or oversized run/status identities without echoing hostile values', () => {
    const hostile = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    const result = validateP14RescoreEvidence({ ...valid, runId: hostile, status: hostile });
    expect(result.valid).toBe(false);
    expect(result.failures.join(' ')).not.toContain(hostile);
    expect(result.value).toBeNull();
  });

  it('rejects unsupported status and non-boolean reviewRequired', () => {
    expect(validateP14RescoreEvidence({ ...valid, status: 'UNKNOWN' }).valid).toBe(false);
    expect(validateP14RescoreEvidence({ ...valid, reviewRequired: 'false' }).valid).toBe(false);
  });
});
