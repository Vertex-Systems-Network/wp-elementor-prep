import { assessP14PreparationInputBounds, DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import { boundP14ReceiptDetail, boundP14ReceiptIdentity } from './p14-receipt-evidence';
import { assessP14RunControlEvidence } from './p14-run-control-evidence';
import { P14_UNKNOWN_SOURCE_FINGERPRINT } from './p14-source-fingerprint-evidence';
import {
  P14_UNKNOWN_EVENT_TIMESTAMP,
  readP14RuntimeEventTimestamp,
} from './p14-timestamp-evidence';
import {
  P14_PREPARATION_ENGINE_VERSION,
  type P14PreparationReceiptV1,
  type P14RetainedDuplicateAdapter,
  type P14TransactionEvent,
} from './p14-preparation-types';
import {
  runP14RetainedDuplicateTransaction as runP14RetainedDuplicateTransactionCore,
  type P14RetainedDuplicateRunInput,
} from './p14-retained-duplicate-transaction-core';

export type { P14RetainedDuplicateRunInput } from './p14-retained-duplicate-transaction-core';

function boundedIdentity(value: unknown, fallback: string): string {
  if (typeof value !== 'string'
    || value.length === 0
    || value.length > DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength) {
    return fallback;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
}

function safePlanMetadata(value: unknown): {
  sourceNodeId: string;
  p13RunId: string;
  planDigest: string;
} {
  try {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return { sourceNodeId: 'UNKNOWN', p13RunId: 'UNKNOWN', planDigest: 'p14-plan-invalid' };
    }
    const record = value as Record<string, unknown>;
    const source = typeof record.source === 'object' && record.source !== null && !Array.isArray(record.source)
      ? record.source as Record<string, unknown>
      : {};
    const rawDigest = boundedIdentity(record.planDigest, 'p14-plan-invalid');
    return {
      sourceNodeId: boundedIdentity(source.nodeId, 'UNKNOWN'),
      p13RunId: boundedIdentity(record.p13RunId, 'UNKNOWN'),
      planDigest: rawDigest.startsWith('p14-plan-') ? rawDigest : 'p14-plan-invalid',
    };
  } catch {
    return { sourceNodeId: 'UNKNOWN', p13RunId: 'UNKNOWN', planDigest: 'p14-plan-invalid' };
  }
}

function safeNow(input: P14RetainedDuplicateRunInput): () => unknown {
  try {
    const supplied: unknown = input.now;
    if (supplied === undefined) return () => new Date().toISOString();
    if (typeof supplied === 'function') return supplied as () => unknown;
    return () => P14_UNKNOWN_EVENT_TIMESTAMP;
  } catch {
    return () => P14_UNKNOWN_EVENT_TIMESTAMP;
  }
}

function runControlEvent(now: () => unknown, state: 'IDLE' | 'PREFLIGHT' | 'BLOCKED', detail?: string): P14TransactionEvent {
  const safeDetail = detail ? boundP14ReceiptDetail(detail) : undefined;
  return {
    state,
    at: readP14RuntimeEventTimestamp(now),
    ...(safeDetail ? { detail: safeDetail } : {}),
  };
}

function runControlBlockedReceipt(
  plan: unknown,
  transactionId: string,
  now: () => unknown,
  failures: string[],
): P14PreparationReceiptV1 {
  const metadata = safePlanMetadata(plan);
  return {
    schemaVersion: 1,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    transactionId: boundP14ReceiptIdentity(transactionId, 'p14-transaction-invalid'),
    status: 'BLOCKED',
    terminalState: 'BLOCKED',
    source: {
      nodeId: metadata.sourceNodeId,
      beforeFingerprint: P14_UNKNOWN_SOURCE_FINGERPRINT,
      afterFingerprint: P14_UNKNOWN_SOURCE_FINGERPRINT,
    },
    p13RunId: metadata.p13RunId,
    planDigest: metadata.planDigest,
    appliedActions: [],
    errors: [{
      code: 'P14_INTERNAL_INVARIANT_FAILED',
      stage: 'run-control',
      detail: boundP14ReceiptDetail(`Invalid P14 run-control evidence: ${failures.join(' | ')}`),
      recovery: 'Provide typed, bounded P14 run controls and retry the current reviewed plan.',
    }],
    events: [
      runControlEvent(now, 'IDLE'),
      runControlEvent(now, 'PREFLIGHT'),
      runControlEvent(now, 'BLOCKED', 'run-control evidence validation failed'),
    ],
  };
}

/**
 * Public P14 transaction boundary. Caller controls are validated and normalized before the retained-
 * duplicate transaction core may use them as policy, coordinator identity or adapter input.
 */
export async function runP14RetainedDuplicateTransaction(
  input: P14RetainedDuplicateRunInput,
  adapter: P14RetainedDuplicateAdapter,
): Promise<P14PreparationReceiptV1> {
  const now = safeNow(input);
  let controls;
  try {
    controls = assessP14RunControlEvidence({
      transactionId: input.transactionId,
      preparedName: input.preparedName,
      allowPreparedWithReview: input.allowPreparedWithReview,
      inputBounds: input.inputBounds,
    });
  } catch {
    controls = {
      valid: false,
      failures: ['P14 run-control evidence could not be read safely.'],
      safeTransactionId: 'p14-transaction-invalid',
    };
  }

  if (!controls.valid || !controls.value) {
    return runControlBlockedReceipt(input.plan, controls.safeTransactionId, now, controls.failures);
  }

  const snapshot = controls.value;
  const rawPreparedName = snapshot.rawPreparedName ?? snapshot.preparedName;
  const boundedPreflight = assessP14PreparationInputBounds(input.plan, snapshot.inputBounds, {
    transactionId: snapshot.rawTransactionId,
    preparedName: rawPreparedName,
    confirmation: input.confirmation,
  });

  // Preserve the established P14_INPUT_TOO_LARGE path for valid typed controls whose raw resource
  // size exceeds the current/default or caller-supplied stricter limit. The core receives only the
  // already-snapshotted inputBounds object, so hostile getters cannot be re-entered.
  if (!boundedPreflight.allowed) {
    return runP14RetainedDuplicateTransactionCore({
      ...input,
      transactionId: snapshot.rawTransactionId,
      preparedName: rawPreparedName,
      allowPreparedWithReview: snapshot.allowPreparedWithReview,
      inputBounds: snapshot.inputBounds,
    }, adapter);
  }

  return runP14RetainedDuplicateTransactionCore({
    ...input,
    transactionId: snapshot.transactionId,
    preparedName: snapshot.preparedName,
    allowPreparedWithReview: snapshot.allowPreparedWithReview,
    inputBounds: snapshot.inputBounds,
  }, adapter);
}
