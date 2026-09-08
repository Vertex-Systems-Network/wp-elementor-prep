import { describe, expect, it } from 'vitest';
import {
  P5_RUNTIME_GATE_VERSION,
  createP5RuntimeProof,
  isTraceableP5RuntimeBuildIdentity,
  isValidP5RuntimeProof,
} from '../src/core/p5-runtime-gate';

const BUILD = {
  sourceSha: '0123456789abcdef0123456789abcdef01234567',
  runId: '34219111842',
  runNumber: '309',
};

describe('P5 compiled runtime proof gate', () => {
  it('creates a proof bound to the current traceable build', () => {
    const proof = createP5RuntimeProof(BUILD, '2026-09-08T00:00:00.000Z');
    expect(proof).toEqual({
      schemaVersion: 1,
      gateVersion: P5_RUNTIME_GATE_VERSION,
      passedAt: '2026-09-08T00:00:00.000Z',
      build: BUILD,
    });
    expect(isTraceableP5RuntimeBuildIdentity(BUILD)).toBe(true);
    expect(isValidP5RuntimeProof(proof, BUILD)).toBe(true);
  });

  it('rejects stale, malformed, local and missing proofs', () => {
    expect(isValidP5RuntimeProof(null, BUILD)).toBe(false);
    expect(isValidP5RuntimeProof({}, BUILD)).toBe(false);
    expect(isValidP5RuntimeProof({ schemaVersion: 1, gateVersion: 'p5-runtime-proof-v1', passedAt: '2026-09-08T00:00:00.000Z', build: BUILD }, BUILD)).toBe(false);
    expect(isValidP5RuntimeProof({ schemaVersion: 1, gateVersion: P5_RUNTIME_GATE_VERSION, passedAt: '', build: BUILD }, BUILD)).toBe(false);
    expect(isValidP5RuntimeProof({ schemaVersion: 1, gateVersion: P5_RUNTIME_GATE_VERSION, passedAt: 'x', build: { sourceSha: 'local', runId: 'local', runNumber: 'local' } }, BUILD)).toBe(false);
  });

  it('rejects a valid proof minted by a different CI artifact', () => {
    const proof = createP5RuntimeProof(BUILD, '2026-09-08T00:00:00.000Z');
    expect(isValidP5RuntimeProof(proof, {
      ...BUILD,
      sourceSha: 'fedcba9876543210fedcba9876543210fedcba98',
    })).toBe(false);
    expect(isValidP5RuntimeProof(proof, {
      ...BUILD,
      runId: '34219111843',
      runNumber: '310',
    })).toBe(false);
  });
});
