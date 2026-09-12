import { describe, expect, it } from 'vitest';
import { validateP14CandidateHandleEvidence } from '../src/core/p14-adapter-evidence';
import { validateP14ValidationEvidence } from '../src/core/p14-validation-evidence';

describe('P14 revoked adapter output proxies', () => {
  it('fails closed when the top-level evidence proxy has been revoked', () => {
    const revoked = Proxy.revocable({
      sourceNodeId: 'source:1',
      candidateNodeId: 'candidate:1',
    }, {});
    revoked.revoke();

    expect(() => validateP14CandidateHandleEvidence(revoked.proxy, 'source:1')).not.toThrow();
    const result = validateP14CandidateHandleEvidence(revoked.proxy, 'source:1');
    expect(result.valid).toBe(false);
    expect(result.value).toBeNull();
  });

  it('fails closed when a nested array proxy has been revoked', () => {
    const revokedChecks = Proxy.revocable([], {});
    revokedChecks.revoke();

    expect(() => validateP14ValidationEvidence({
      passed: true,
      profileIdsRun: [],
      checks: revokedChecks.proxy,
    })).not.toThrow();

    const result = validateP14ValidationEvidence({
      passed: true,
      profileIdsRun: [],
      checks: revokedChecks.proxy,
    });
    expect(result.valid).toBe(false);
    expect(result.value).toBeNull();
  });
});
