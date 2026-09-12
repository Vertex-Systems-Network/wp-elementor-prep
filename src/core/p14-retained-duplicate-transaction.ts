import { assessP14PreparationInputBounds, DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import {
  snapshotP14AdapterAction,
  snapshotP14AdapterCandidate,
  snapshotP14AdapterPlan,
} from './p14-adapter-input-snapshot';
import {
  boundP14ReceiptDetail,
  boundP14ReceiptIdentity,
  safeP14RuntimeErrorMessage,
} from './p14-receipt-evidence';
import { assessP14RunControlEvidence } from './p14-run-control-evidence';
import { snapshotP14SemanticInputEvidence } from './p14-semantic-input-snapshot';
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

function semanticRunInputSnapshot(
  snapshot: P14RunInputSnapshot,
  plan: unknown,
  confirmation: unknown,
): P14RunInputSnapshot {
  return {
    plan,
    ...(snapshot.registry !== undefined ? { registry: snapshot.registry } : {}),
    ...(snapshot.coordinator !== undefined ? { coordinator: snapshot.coordinator } : {}),
    ...(snapshot.inputBounds !== undefined ? { inputBounds: snapshot.inputBounds } : {}),
    ...(confirmation !== undefined ? { confirmation } : {}),
    transactionId: snapshot.transactionId,
    ...(snapshot.preparedName !== undefined ? { preparedName: snapshot.preparedName } : {}),
    ...(snapshot.allowPreparedWithReview !== undefined
      ? { allowPreparedWithReview: snapshot.allowPreparedWithReview }
      : {}),
    ...(snapshot.shouldCancel !== undefined ? { shouldCancel: snapshot.shouldCancel } : {}),
  };
}

function guardP14RuntimeAdapterBoundary(
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
        return (candidate, action) => hook.call(
          adapter,
          snapshotP14AdapterCandidate(candidate),
          snapshotP14AdapterAction(action),
        );
      } catch (error) {
        const detail = safeP14RuntimeErrorMessage(error);
        return async () => {
          throw new Error(`Unable to read runtime action eligibility adapter hook: ${detail}`);
        };
      }
    },
    applyRecipe: (candidate: P14CandidateHandle, action: P14PreparationAction) =>
      adapter.applyRecipe(
        snapshotP14AdapterCandidate(candidate),
        snapshotP14AdapterAction(action),
      ),
    validateCandidate: (candidate: P14CandidateHandle, plan: P14PreparationPlanV1) =>
      adapter.validateCandidate(
        snapshotP14AdapterCandidate(candidate),
        snapshotP14AdapterPlan(plan),
      ),
    rescoreCandidate: (candidate: P14CandidateHandle, plan: P14PreparationPlanV1) =>
      adapter.rescoreCandidate(
        snapshotP14AdapterCandidate(candidate),
        snapshotP14AdapterPlan(plan),
      ),
    retainCandidate: (candidate: P14CandidateHandle, transactionId: string, preparedName: string) =>
      adapter.retainCandidate(
        snapshotP14AdapterCandidate(candidate),
        transactionId,
        preparedName,
      ),
    discardCandidate: (candidate: P14CandidateHandle) =>
      adapter.discardCandidate(snapshotP14AdapterCandidate(candidate)),
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
  stage: 'run-input' | 'run-control' | 'bounds-evidence',
): P14PreparationReceiptV1 {
  const metadata = safePlanMetadata(plan);
  const evidenceLabel = stage === 'run-input'
    ? 'Invalid P14 run-input evidence'
    : stage === 'run-control'
      ? 'Invalid P14 run-control evidence'
      : 'Unreadable P14 bounded-input evidence';
  const recovery = stage === 'run-input'
    ? 'Provide a readable P14 run input object and retry the current reviewed plan.'
    : stage === 'run-control'
      ? 'Provide typed, bounded P14 run controls and retry the current reviewed plan.'
      : 'Provide readable nested plan/confirmation bounds evidence and retry the current reviewed plan.';
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
      detail: boundP14ReceiptDetail(`${evidenceLabel}: ${failures.join(' | ')}`),
      recovery,
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
 * Public P14 transaction boundary. Caller controls and the known nested plan/confirmation contract
 * are snapshotted before retained-duplicate semantics so caller-owned getters are not re-entered.
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
  let boundedPreflight;
  try {
    boundedPreflight = assessP14PreparationInputBounds(inputSnapshot.plan, controlSnapshot.inputBounds, {
      transactionId: controlSnapshot.rawTransactionId,
      preparedName: rawPreparedName,
      confirmation: inputSnapshot.confirmation,
    });
  } catch (error) {
    return boundaryBlockedReceipt(
      inputSnapshot.plan,
      controls.safeTransactionId,
      now,
      [`P14 bounded-input evidence could not be read safely: ${safeP14RuntimeErrorMessage(error)}`],
      'bounds-evidence',
    );
  }

  // Preserve the established P14_INPUT_TOO_LARGE path for caller evidence already proven oversized
  // by the first bounded traversal. No semantic snapshot is required to reject that input safely.
  if (!boundedPreflight.allowed) {
    const guardedAdapter = guardP14RuntimeAdapterBoundary(adapter);
    return runP14RetainedDuplicateTransactionCore(delegatedRunInput(inputSnapshot, {
      transactionId: controlSnapshot.rawTransactionId,
      preparedName: rawPreparedName,
      allowPreparedWithReview: controlSnapshot.allowPreparedWithReview,
      inputBounds: controlSnapshot.inputBounds,
    }, now), guardedAdapter);
  }

  const semanticEvidence = snapshotP14SemanticInputEvidence(
    inputSnapshot.plan,
    inputSnapshot.confirmation,
    boundedPreflight.effectiveLimits,
  );
  if (!semanticEvidence.valid) {
    return boundaryBlockedReceipt(
      undefined,
      controls.safeTransactionId,
      now,
      semanticEvidence.failures,
      'bounds-evidence',
    );
  }

  const semanticSnapshot = semanticRunInputSnapshot(
    inputSnapshot,
    semanticEvidence.plan,
    semanticEvidence.confirmation,
  );

  let semanticPreflight;
  try {
    semanticPreflight = assessP14PreparationInputBounds(semanticSnapshot.plan, controlSnapshot.inputBounds, {
      transactionId: controlSnapshot.transactionId,
      preparedName: controlSnapshot.preparedName,
      confirmation: semanticSnapshot.confirmation,
    });
  } catch (error) {
    return boundaryBlockedReceipt(
      semanticSnapshot.plan,
      controls.safeTransactionId,
      now,
      [`P14 semantic snapshot bounds could not be read safely: ${safeP14RuntimeErrorMessage(error)}`],
      'bounds-evidence',
    );
  }

  const guardedAdapter = guardP14RuntimeAdapterBoundary(adapter);
  const delegated = delegatedRunInput(semanticSnapshot, {
    transactionId: controlSnapshot.transactionId,
    preparedName: controlSnapshot.preparedName,
    allowPreparedWithReview: controlSnapshot.allowPreparedWithReview,
    inputBounds: controlSnapshot.inputBounds,
  }, now);

  // Stateful-but-readable evidence may grow between the first bounds pass and semantic capture.
  // Delegate the bounded plain snapshot so the core preserves the existing P14_INPUT_TOO_LARGE path.
  if (!semanticPreflight.allowed) {
    return runP14RetainedDuplicateTransactionCore(delegated, guardedAdapter);
  }

  return runP14RetainedDuplicateTransactionCore(delegated, guardedAdapter);
}
