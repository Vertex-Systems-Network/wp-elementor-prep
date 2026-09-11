import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';
import { P14_PREPARATION_ENGINE_VERSION } from '../src/core/p14-preparation-types';

const NOW = '2026-09-12T00:00:00.000Z';

function noChangeReceipt(beforeFingerprint: unknown, afterFingerprint: unknown) {
  return {
    schemaVersion: 1,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    transactionId: 'p14-fingerprint-receipt',
    status: 'NO_CHANGES_NEEDED',
    terminalState: 'COMPLETE',
    source: {
      nodeId: 'receipt:source',
      beforeFingerprint,
      afterFingerprint,
    },
    p13RunId: 'p13-fingerprint-receipt-run',
    planDigest: 'p14-plan-fingerprint-receipt',
    appliedActions: [],
    errors: [],
    events: [
      { state: 'IDLE', at: NOW },
      { state: 'COMPLETE', at: NOW },
    ],
  };
}

describe('P14 receipt source fingerprint integrity', () => {
  it('accepts matching bounded actual fingerprint evidence', () => {
    const result = validateP14PreparationReceipt(noChangeReceipt('fingerprint-v1', 'fingerprint-v1'));
    expect(result.valid).toBe(true);
  });

  it.each(['', '   ', null])('rejects malformed fingerprint evidence %#', (value) => {
    const result = validateP14PreparationReceipt(noChangeReceipt(value, value));
    expect(result.valid).toBe(false);
    expect(result.failures).toContain('Receipt source fingerprint evidence is missing, malformed or oversized.');
  });

  it('rejects oversized fingerprint evidence without needing to interpret a hash format', () => {
    const hostile = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    const result = validateP14PreparationReceipt(noChangeReceipt(hostile, hostile));
    expect(result.valid).toBe(false);
    expect(result.failures).toContain('Receipt source fingerprint evidence is missing, malformed or oversized.');
  });
});
