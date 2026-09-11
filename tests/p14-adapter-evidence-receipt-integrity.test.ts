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
    transactionId: 'adapter-receipt-tx',
    status: 'PREPARED',
    terminalState: 'COMPLETE',
    source: {
      nodeId: 'adapter:source',
      beforeFingerprint: 'source-fingerprint',
      afterFingerprint: 'source-fingerprint',
    },
    candidate: { nodeId: 'adapter:candidate', retained: true },
    p13RunId: 'p13-adapter-receipt',
    planDigest: 'p14-plan-adapter-receipt',
    appliedActions: [{
      actionId: 'action-1',
      recipeId: 'recipe-one',
      applied: true,
    }],
    validation: {
      passed: true,
      profileIdsRun: ['profile-one'],
      checks: [{ id: 'required', passed: true, required: true }],
    },
    rescore: {
      runId: 'p13-adapter-rescore',
      score: 95,
      status: 'READY',
      blockerCount: 0,
      highRiskCount: 0,
      introducedBlockerOrHighCount: 0,
      reviewRequired: false,
    },
    retention: {
      transactionId: 'adapter-receipt-tx',
      sourceNodeId: 'adapter:source',
      retainedNodeId: 'adapter:candidate',
      preparedName: 'Prepared Duplicate',
    },
    errors: [],
    events: [
      { state: 'IDLE', at: NOW },
      { state: 'COMPLETE', at: NOW },
    ],
  };
}

describe('P14 receipt adapter evidence integrity', () => {
  it('accepts bounded candidate, recipe-result and retention evidence', () => {
    expect(validateP14PreparationReceipt(preparedReceipt()).valid).toBe(true);
  });

  it('rejects an oversized candidate node identity', () => {
    const value = preparedReceipt();
    value.candidate.nodeId = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    expect(validateP14PreparationReceipt(value).valid).toBe(false);
  });

  it('rejects oversized applied-action identity or detail evidence', () => {
    const hugeIdentity = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    const hugeDetail = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength + 1);

    const identity = preparedReceipt();
    identity.appliedActions[0]!.actionId = hugeIdentity;
    expect(validateP14PreparationReceipt(identity).valid).toBe(false);

    const detail = preparedReceipt() as ReturnType<typeof preparedReceipt> & { appliedActions: Array<Record<string, unknown>> };
    detail.appliedActions[0]!.detail = hugeDetail;
    expect(validateP14PreparationReceipt(detail).valid).toBe(false);
  });

  it('rejects oversized retention identities and prepared name', () => {
    const huge = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);

    const retained = preparedReceipt();
    retained.retention.retainedNodeId = huge;
    expect(validateP14PreparationReceipt(retained).valid).toBe(false);

    const name = preparedReceipt();
    name.retention.preparedName = huge;
    expect(validateP14PreparationReceipt(name).valid).toBe(false);
  });
});
