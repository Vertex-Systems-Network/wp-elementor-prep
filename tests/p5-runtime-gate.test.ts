import { describe, expect, it } from 'vitest';
import {
  P5_RUNTIME_GATE_VERSION,
  createP5RuntimeProof,
  isValidP5RuntimeProof,
} from '../src/core/p5-runtime-gate';

describe('P5 compiled runtime proof gate', () => {
  it('creates a proof that validates for the current gate version', () => {
    const proof = createP5RuntimeProof('2026-09-08T00:00:00.000Z');
    expect(proof).toEqual({
      schemaVersion: 1,
      gateVersion: P5_RUNTIME_GATE_VERSION,
      passedAt: '2026-09-08T00:00:00.000Z',
    });
    expect(isValidP5RuntimeProof(proof)).toBe(true);
  });

  it('rejects stale, malformed and missing proofs', () => {
    expect(isValidP5RuntimeProof(null)).toBe(false);
    expect(isValidP5RuntimeProof({})).toBe(false);
    expect(isValidP5RuntimeProof({ schemaVersion: 1, gateVersion: 'old', passedAt: 'x' })).toBe(false);
    expect(isValidP5RuntimeProof({ schemaVersion: 1, gateVersion: P5_RUNTIME_GATE_VERSION, passedAt: '' })).toBe(false);
  });
});
