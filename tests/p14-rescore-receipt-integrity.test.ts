import { describe, expect, it } from 'vitest';
import { P14_PREPARATION_ENGINE_VERSION } from '../src/core/p14-preparation-types';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';

const NOW = '2026-09-12T00:00:00.000Z';

function receiptWithRescore(rescore: unknown) {
  return {
    schemaVersion: 1,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    transactionId: 'p14-receipt-rescore-test',
    status: 'NO_CHANGES_NEEDED',
    terminalState: 'COMPLETE',
    source: {
      nodeId: 'receipt:source',
      beforeFingerprint: 'receipt-fingerprint',
      afterFingerprint: 'receipt-fingerprint',
    },
    p13RunId: 'p13-receipt-source-run',
    planDigest: 'p14-plan-receipt-test',
    appliedActions: [],
    rescore,
    errors: [],
    events: [
      { state: 'IDLE', at: NOW },
      { state: 'COMPLETE', at: NOW },
    ],
  };
}

describe('P14 receipt re-score integrity', () => {
  it('accepts bounded scored P13 evidence when present', () => {
    const result = validateP14PreparationReceipt(receiptWithRescore({
      runId: 'p13-receipt-candidate-run',
      score: 91,
      status: 'REVIEW',
      blockerCount: 0,
      highRiskCount: 0,
      introducedBlockerOrHighCount: 0,
      reviewRequired: true,
    }));
    expect(result.valid).toBe(true);
  });

  it.each([
    ['null', null],
    ['NaN score', { runId: 'run', score: Number.NaN, status: 'READY', blockerCount: 0, highRiskCount: 0, introducedBlockerOrHighCount: 0, reviewRequired: false }],
    ['negative count', { runId: 'run', score: 90, status: 'READY', blockerCount: -1, highRiskCount: 0, introducedBlockerOrHighCount: 0, reviewRequired: false }],
    ['numeric insufficient', { runId: 'run', score: 90, status: 'INSUFFICIENT_EVIDENCE', blockerCount: 0, highRiskCount: 0, introducedBlockerOrHighCount: 0, reviewRequired: false }],
  ])('rejects forged %s re-score evidence', (_label, rescore) => {
    const result = validateP14PreparationReceipt(receiptWithRescore(rescore));
    expect(result.valid).toBe(false);
    expect(result.failures).toContain('rescore is malformed or outside the accepted scored P13 evidence domain.');
  });
});
