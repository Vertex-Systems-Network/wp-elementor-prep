import { assessP14PreparationInputBounds, DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import {
  boundP14ReceiptDetail,
  boundP14ReceiptIdentity,
  safeP14RuntimeErrorMessage,
} from './p14-receipt-evidence';
import { assessP14RunControlEvidence } from './p14-run-control-evidence';
import { P14_UNKNOWN_SOURCE_FINGERPRINT } from './p14-source-fingerprint-evidence';
import {
  P14_UNKNOWN_EVENT_TIMESTAMP,
  readP14RuntimeEventTimestamp,
} from './p14-timestamp-evidence';
import {
  P14_PREPARATION_ENGINE_VERSION,
  type P14CandidateHandle,
  type P14PreparationAction,
  type P14PreparationPlanV1,
  type P14PreparationReceiptV1,
  type P14RetainedDuplicateAdapter,
  type P14TransactionEvent,
} from './p14-preparation-types';
import {
  runP14RetainedDuplicateTransaction as runP14RetainedDuplicateTransactionCore,
  type P14RetainedDuplicateRunInput,
} from './p14-retained-duplicate-transaction-core';

export type { P14RetainedDuplicateRunInput } from './p14-retained-duplicate-transaction-core';

type P14RunInputSnapshot = Omit<P14RetainedDuplicateRunInput, 'now'>;

interface P14RunInputSnapshotAssessment {
  valid: boolean;
  failures: string[];
  safeTransactionId: string;
  plan?: unknown;
  value?: P14RunInputSnapshot;
}

const RUN_INPUT_KEYS = [
  'plan',
  'registry',
  'coordinator',
  'inputBounds',
  'confirmation',
  'transactionId',
  'preparedName',
  'allowPreparedWithReview',
  'shouldCancel',
] as const satisfies readonly (keyof P14RunInputSnapshot)[];

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

function safeNow(input: unknown): () => unknown {
  try {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return () => P14_UNKNOWN_EVENT_TIMESTAMP;
    }
    const supplied: unknown = (input as Record<string, unknown>).now;
    if (supplied === undefined) return () => new Date().toISOString();
    if (typeof supplied === 'function') return supplied as () => unknown;
    return () => P14_UNKNOWN_EVENT_TIMESTAMP;
  } catch {
    return () => P14_UNKNOWN_EVENT_TIMESTAMP;
  }
}

function snapshotP14RunInput(input: unknown): P14RunInputSnapshotAssessment {
  const failures: string[] = [];
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return {
      valid: false,
      failures: ['P14 run input must be an object runtime value.'],
      safeTransactionId: 'p14-transaction-invalid',
    };
  }

  const source = input as Record<string, unknown>;
  const snapshot: Record<string, unknown> = {};
  for (const key of RUN_INPUT_KEYS) {
    try {
      snapshot[key] = source[key];
    } catch {
      failures.push(`${key} could not be read safely from the P14 run input.`);
    }
  }

  const safeTransactionId = boundedIdentity(snapshot.transactionId, 'p14-transaction-invalid');
  if (failures.length > 0) {
    return {
      valid: false,
      failures,
      safeTransactionId,
      ...(Object.prototype.hasOwnProperty.call(snapshot, 'plan') ? { plan: snapshot.plan } : {}),
    };
  }

  return {
    valid: true,
    failures,
    safeTransactionId,
    plan: snapshot.plan,
    value: snapshot as unknown as P14RunInputSnapshot,
  };
}

function guardP14RuntimeEligibilityHook(
  adapter: P14RetainedDuplicateAdapter,
): P14RetainedDuplicateAdapter {
  return {
    fingerprintSource: (sourceNodeId: string) => adapter.fingerprintSource(sourceNodeId),
    cloneSource: (sourceNodeId: string, transactionId: string) => adapter.cloneSource(sourceNodeId, transactionId),
    get assessActionEligibility(): P14RetainedDuplicateAdapter['assessActionEligibility'] {
      try {
        const hook: unknown = adapter.assessActionEligibility;
        if (hook === undefined || typeof hook !== 'function') {
          return hook as P14RetainedDuplicateAdapter['assessActionEligibility'];
        }
        return (candidate, action) => hook.call(adapter, candidate, action);
      } catch (error) {
        const detail = safeP14RuntimeErrorMessage(error);
        return async () => {
          throw new Error(`Unable to read runtime action eligibility adapter hook: ${detail}`);
        };
      }
    },
    applyRecipe: (candidate: P14CandidateHandle, action: P14PreparationAction) =>
      adapter.applyRecipe(candidate, action),
    validateCandidate: (candidate: P14CandidateHandle, plan: P14PreparationPlanV1) =>
      adapter.validateCandidate(candidate, plan),
    rescoreCandidate: (candidate: P14CandidateHandle, plan: P14PreparationPlanV1) =>
      adapter.rescoreCandidate(candidate, plan),
    retainCandidate: (candidate: P14CandidateHandle, transactionId: string, preparedName: string) =>
      adapter.retainCandidate(candidate, transactionId, preparedName),
    discardCandidate: (candidate: P14CandidateHandle) => adapter.discardCandidate(candidate),
  } as unknown as P14RetainedDuplicateAdapter;
}

function boundaryEvent(now: () => unknown, state: 'IDLE' | 'PREFLIGHT' | 'BLOCKED', detail?: string): P14TransactionEvent {
  const safeDetail = detail ? boundP14ReceiptDetail(detail) : undefined;
  return {
    state,
    at: readP14RuntimeEventTimestamp(now),
    ...(safeDetail ? { detail: safeDetail } : {}),
  };
}

function boundaryBlockedReceipt(
  plan: unknown,
  transactionId: string,
  now: () => unknown,
  failures: string[],
  stage: 'run-input' | 'run-control',
): P14PreparationReceiptV1 {
  const metadata = safePlanMetadata(plan);
  const isRunInput = stage === 'run-input';
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
      stage,
      detail: boundP14ReceiptDetail(
        `${isRunInput ? 'Invalid P14 run-input evidence' : 'Invalid P14 run-control evidence'}: ${failures.join(' | ')}`,
      ),
      recovery: isRunInput
        ? 'Provide a readable P14 run input object and retry the current reviewed plan.'
        : 'Provide typed, bounded P14 run controls and retry the current reviewed plan.',
    }],
    events: [
      boundaryEvent(now, 'IDLE'),
      boundaryEvent(now, 'PREFLIGHT'),
      boundaryEvent(now, 'BLOCKED', `${stage} evidence validation failed`),
    ],
  };
}

function delegatedRunInput(
  snapshot: P14RunInputSnapshot,
  controls: {
    transactionId: string;
    preparedName: string;
    allowPreparedWithReview: boolean;
    inputBounds: NonNullable<P14RetainedDuplicateRunInput['inputBounds']>;
  },
  now: () => unknown,
): P14RetainedDuplicateRunInput {
  return {
    plan: snapshot.plan,
    ...(snapshot.registry !== undefined ? { registry: snapshot.registry } : {}),
    ...(snapshot.coordinator !== undefined ? { coordinator: snapshot.coordinator } : {}),
    inputBounds: controls.inputBounds,
    ...(snapshot.confirmation !== undefined ? { confirmation: snapshot.confirmation } : {}),
    transactionId: controls.transactionId,
    preparedName: controls.preparedName,
    allowPreparedWithReview: controls.allowPreparedWithReview,
    now,
    ...(snapshot.shouldCancel !== undefined ? { shouldCancel: snapshot.shouldCancel } : {}),
  };
}

/**
 * Public P14 transaction boundary. The caller object is snapshotted once before transaction
 * semantics, then caller controls are validated and normalized before the retained-duplicate core.
 */
export async function runP14RetainedDuplicateTransaction(
  input: P14RetainedDuplicateRunInput,
  adapter: P14RetainedDuplicateAdapter,
): Promise<P14PreparationReceiptV1> {
  const now = safeNow(input);
  const runInput = snapshotP14RunInput(input);
  if (!runInput.valid || !runInput.value) {
    return boundaryBlockedReceipt(
      runInput.plan,
      runInput.safeTransactionId,
      now,
      runInput.failures,
      'run-input',
    );
  }

  const inputSnapshot = runInput.value;
  let controls;
  try {
    controls = assessP14RunControlEvidence({
      transactionId: inputSnapshot.transactionId,
      preparedName: inputSnapshot.preparedName,
      allowPreparedWithReview: inputSnapshot.allowPreparedWithReview,
      inputBounds: inputSnapshot.inputBounds,
    });
  } catch {
    controls = {
      valid: false,
      failures: ['P14 run-control evidence could not be read safely.'],
      safeTransactionId: 'p14-transaction-invalid',
    };
  }

  if (!controls.valid || !controls.value) {
    return boundaryBlockedReceipt(
      inputSnapshot.plan,
      controls.safeTransactionId,
      now,
      controls.failures,
      'run-control',
    );
  }

  const controlSnapshot = controls.value;
  const rawPreparedName = controlSnapshot.rawPreparedName ?? controlSnapshot.preparedName;
  const boundedPreflight = assessP14PreparationInputBounds(inputSnapshot.plan, controlSnapshot.inputBounds, {
    transactionId: controlSnapshot.rawTransactionId,
    preparedName: rawPreparedName,
    confirmation: inputSnapshot.confirmation,
  });
  const guardedAdapter = guardP14RuntimeEligibilityHook(adapter);

  // Preserve the established P14_INPUT_TOO_LARGE path for valid typed controls whose raw resource
  // size exceeds the current/default or caller-supplied stricter limit. The core receives only the
  // already-snapshotted inputBounds object, so hostile getters cannot be re-entered.
  if (!boundedPreflight.allowed) {
    return runP14RetainedDuplicateTransactionCore(delegatedRunInput(inputSnapshot, {
      transactionId: controlSnapshot.rawTransactionId,
      preparedName: rawPreparedName,
      allowPreparedWithReview: controlSnapshot.allowPreparedWithReview,
      inputBounds: controlSnapshot.inputBounds,
    }, now), guardedAdapter);
  }

  return runP14RetainedDuplicateTransactionCore(delegatedRunInput(inputSnapshot, {
    transactionId: controlSnapshot.transactionId,
    preparedName: controlSnapshot.preparedName,
    allowPreparedWithReview: controlSnapshot.allowPreparedWithReview,
    inputBounds: controlSnapshot.inputBounds,
  }, now), guardedAdapter);
}
