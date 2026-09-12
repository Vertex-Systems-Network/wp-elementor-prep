import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import {
  buildP14PreparationConfirmation,
  validateP14PreparationConfirmation,
} from '../src/core/p14-preparation-confirmation';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import { validateP14PreparationReceipt } from '../src/core/p14-preparation-receipt';
import { runP14RetainedDuplicateTransaction } from '../src/core/p14-retained-duplicate-transaction';
import {
  P14_UNKNOWN_EVENT_TIMESTAMP,
  isP14NormalizedUtcTimestamp,
  isP14ReceiptEventTimestampEvidence,
  readP14RuntimeEventTimestamp,
} from '../src/core/p14-timestamp-evidence';
import type {
  P14CandidateHandle,
  P14PreparationAction,
  P14PreparationPlanV1,
  P14PreparationRecipeDefinition,
  P14RecipeExecutionResult,
  P14RescoreSummary,
  P14RetainedDuplicateAdapter,
  P14ValidationSummary,
} from '../src/core/p14-preparation-types';

const SOURCE_ID = '1:1';
const SOURCE_FP = 'source-fingerprint';
const CANONICAL_TIMESTAMP = '2026-09-12T00:00:00.000Z';

const recipe: P14PreparationRecipeDefinition = {
  id: 'P14_TIMESTAMP_TEST',
  version: 1,
  sourceRuleIds: ['BR_TIMESTAMP_TEST'],
  minConfidence: 90,
  prerequisites: [],
  mutationAllowlist: ['layoutMode'],
  validationProfileId: 'P14_TIMESTAMP_VALIDATION',
  conflictsWith: [],
  orderClass: '10-test',
};

function readyPlan(): P14PreparationPlanV1 {
  return buildP14PreparationPlan({
    p13RunId: 'p13-timestamp-ready',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'timestamp-ready',
      sourceRuleId: 'BR_TIMESTAMP_TEST',
      sourceRuleVersion: 1,
      targetNodeIds: ['2:1'],
      confidence: 99,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    }],
    recipes: [recipe],
  });
}

function noOpPlan(): P14PreparationPlanV1 {
  return buildP14PreparationPlan({
    p13RunId: 'p13-timestamp-noop',
    sourceNodeId: SOURCE_ID,
    sourceFingerprint: SOURCE_FP,
    findings: [{
      findingId: 'timestamp-noop',
      sourceRuleId: 'BR_TIMESTAMP_NOOP',
      sourceRuleVersion: 1,
      targetNodeIds: ['2:1'],
      confidence: 100,
      remediationClass: 'P14_SAFE_NOOP',
    }],
    recipes: [],
  });
}

class NoOpAdapter implements P14RetainedDuplicateAdapter {
  async fingerprintSource(): Promise<string> {
    return SOURCE_FP;
  }

  async cloneSource(): Promise<P14CandidateHandle> {
    throw new Error('no-op plan must not clone');
  }

  async assessActionEligibility(_candidate: P14CandidateHandle, _action: P14PreparationAction): Promise<unknown> {
    throw new Error('no-op plan must not assess action eligibility');
  }

  async applyRecipe(_candidate: P14CandidateHandle, _action: P14PreparationAction): Promise<P14RecipeExecutionResult> {
    throw new Error('no-op plan must not apply recipes');
  }

  async validateCandidate(): Promise<P14ValidationSummary> {
    throw new Error('no-op plan must not validate a candidate');
  }

  async rescoreCandidate(): Promise<P14RescoreSummary> {
    throw new Error('no-op plan must not rescore a candidate');
  }

  async retainCandidate(): Promise<never> {
    throw new Error('no-op plan must not retain a candidate');
  }

  async discardCandidate(): Promise<void> {
    throw new Error('no-op plan must not discard a candidate');
  }
}

async function runNoOp(now: () => unknown) {
  return runP14RetainedDuplicateTransaction({
    plan: noOpPlan(),
    transactionId: 'p14-timestamp-transaction',
    now,
  }, new NoOpAdapter());
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('P14 bounded timestamp evidence', () => {
  it('accepts only normalized UTC millisecond timestamps and explicit receipt UNKNOWN evidence', () => {
    expect(isP14NormalizedUtcTimestamp(CANONICAL_TIMESTAMP)).toBe(true);
    expect(isP14NormalizedUtcTimestamp('2026-09-12T00:00:00Z')).toBe(false);
    expect(isP14NormalizedUtcTimestamp('2026-09-12T05:00:00.000+05:00')).toBe(false);
    expect(isP14NormalizedUtcTimestamp('2026-02-30T00:00:00.000Z')).toBe(false);
    expect(isP14NormalizedUtcTimestamp(P14_UNKNOWN_EVENT_TIMESTAMP)).toBe(false);

    expect(isP14ReceiptEventTimestampEvidence(CANONICAL_TIMESTAMP)).toBe(true);
    expect(isP14ReceiptEventTimestampEvidence(P14_UNKNOWN_EVENT_TIMESTAMP)).toBe(true);
  });

  it('rejects oversized timestamp strings before Date.parse is called', () => {
    const parseSpy = vi.spyOn(Date, 'parse');
    const oversized = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);

    expect(isP14NormalizedUtcTimestamp(oversized)).toBe(false);
    expect(parseSpy).not.toHaveBeenCalled();
  });

  it('maps hostile runtime clock evidence to UNKNOWN without throwing', () => {
    const hostileValues: Array<() => unknown> = [
      () => { throw new Error('clock failure'); },
      () => 123,
      () => 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1),
      () => '2026-09-12T00:00:00Z',
    ];

    for (const now of hostileValues) {
      expect(() => readP14RuntimeEventTimestamp(now)).not.toThrow();
      expect(readP14RuntimeEventTimestamp(now)).toBe(P14_UNKNOWN_EVENT_TIMESTAMP);
    }
  });
});

describe('P14 confirmation timestamp compatibility', () => {
  it('retains strict normalized UTC confirmation timestamps', () => {
    const plan = readyPlan();
    const confirmation = buildP14PreparationConfirmation(plan, CANONICAL_TIMESTAMP);

    expect(validateP14PreparationConfirmation(confirmation, plan)).toEqual({ valid: true, failures: [] });
    expect(() => buildP14PreparationConfirmation(plan, '2026-09-12T00:00:00Z')).toThrow(/valid bounded timestamp/);
    expect(() => buildP14PreparationConfirmation(plan, P14_UNKNOWN_EVENT_TIMESTAMP)).toThrow(/valid bounded timestamp/);
  });
});

describe('P14 runtime event clock hardening', () => {
  it.each([
    ['throwing clock', () => { throw new Error('clock failure'); }],
    ['non-string clock', () => 123],
    ['oversized clock', () => 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1)],
    ['non-canonical clock', () => '2026-09-12T00:00:00Z'],
  ] as const)('keeps a valid receipt when %s evidence is unavailable', async (_label, now) => {
    const receipt = await runNoOp(now);

    expect(receipt.status).toBe('NO_CHANGES_NEEDED');
    expect(receipt.terminalState).toBe('COMPLETE');
    expect(receipt.events.length).toBeGreaterThan(0);
    expect(receipt.events.every((item) => item.at === P14_UNKNOWN_EVENT_TIMESTAMP)).toBe(true);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('preserves canonical runtime event timestamps when the clock is valid', async () => {
    const receipt = await runNoOp(() => CANONICAL_TIMESTAMP);

    expect(receipt.events.every((item) => item.at === CANONICAL_TIMESTAMP)).toBe(true);
    expect(validateP14PreparationReceipt(receipt)).toEqual({ valid: true, failures: [] });
  });

  it('rejects forged oversized and non-canonical receipt event timestamps', async () => {
    const base = await runNoOp(() => CANONICAL_TIMESTAMP);

    const oversized = structuredClone(base);
    oversized.events[0]!.at = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength + 1);
    expect(validateP14PreparationReceipt(oversized).failures.some((failure) => failure.includes('events[0]'))).toBe(true);

    const nonCanonical = structuredClone(base);
    nonCanonical.events[0]!.at = '2026-09-12T00:00:00Z';
    expect(validateP14PreparationReceipt(nonCanonical).failures.some((failure) => failure.includes('events[0]'))).toBe(true);

    const impossible = structuredClone(base);
    impossible.events[0]!.at = '2026-02-30T00:00:00.000Z';
    expect(validateP14PreparationReceipt(impossible).failures.some((failure) => failure.includes('events[0]'))).toBe(true);
  });
});
