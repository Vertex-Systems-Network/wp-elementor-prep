import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';
import { P14_PREPARATION_ENGINE_VERSION } from '../src/core/p14-preparation-types';

const NOW = '2026-09-12T00:00:00.000Z';

function preparedReceipt() {
  return {
    schemaVersion: 1,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    transactionId: 'validation-receipt-tx',
    status: 'PREPARED',
    terminalState: 'COMPLETE',
    source: {
      nodeId: 'validation:source',
      beforeFingerprint: 'validation-source-fingerprint',
      afterFingerprint: 'validation-source-fingerprint',
    },
    candidate: { nodeId: 'validation:candidate', retained: true },
    p13RunId: 'p13-validation-receipt',
    planDigest: 'p14-plan-validation-receipt',
    appliedActions: [{ actionId: 'action-1', recipeId: 'recipe-1', applied: true }],
    validation: {
      passed: true,
      profileIdsRun: ['PROFILE_ONE'],
      checks: [{ id: 'required', passed: true, required: true }],
    },
    rescore: {
      runId: 'p13-validation-rescore', score: 95, status: 'READY', blockerCount: 0,
      highRiskCount: 0, introducedBlockerOrHighCount: 0, reviewRequired: false,
    },
    retention: {
      transactionId: 'validation-receipt-tx',
      sourceNodeId: 'validation:source',
      retainedNodeId: 'validation:candidate',
      preparedName: 'Prepared Duplicate',
    },
    errors: [],
    events: [
      { state: 'IDLE', at: NOW },
      { state: 'COMPLETE', at: NOW },
    ],
  };
}

describe('P14 validation receipt evidence integrity', () => {
  it('accepts bounded validation checks', () => {
    expect(validateP14PreparationReceipt(preparedReceipt()).valid).toBe(true);
  });

  it('rejects oversized validation check identity and detail', () => {
    const oversizedId = 'i'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    const oversizedDetail = 'd'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1);

    const idValue = preparedReceipt();
    idValue.validation.checks[0]!.id = oversizedId;
    expect(validateP14PreparationReceipt(idValue).valid).toBe(false);

    const detailValue = preparedReceipt() as ReturnType<typeof preparedReceipt> & {
      validation: { passed: boolean; profileIdsRun: string[]; checks: Array<Record<string, unknown>> };
    };
    detailValue.validation.checks[0]!.detail = oversizedDetail;
    expect(validateP14PreparationReceipt(detailValue).valid).toBe(false);
  });

  it('rejects oversized check arrays from length without trusting typed receipt shape', () => {
    const value = preparedReceipt() as ReturnType<typeof preparedReceipt> & {
      validation: { passed: boolean; profileIdsRun: string[]; checks: unknown[] };
    };
    value.validation.checks = new Array(DEFAULT_P14_INPUT_BOUNDS.maxActions + 1).fill(null);
    expect(validateP14PreparationReceipt(value).valid).toBe(false);
  });
});
