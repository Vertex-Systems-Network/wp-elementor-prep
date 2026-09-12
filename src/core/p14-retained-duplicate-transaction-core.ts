import {
  DEFAULT_P14_INPUT_BOUNDS,
  assessP14PreparationInputBounds,
  type P14InputBoundsLimits,
} from './p14-input-bounds';
import {
  validateP14CandidateHandleEvidence,
  validateP14RecipeExecutionResultEvidence,
  validateP14RetentionEvidence,
} from './p14-adapter-evidence';
import {
  assessP14CancellationCheck,
  boundedP14CancellationFailureDetail,
} from './p14-cancellation-check';
import {
  boundP14ReceiptDetail,
  boundP14ReceiptIdentity,
  safeP14RuntimeErrorMessage,
} from './p14-receipt-evidence';
import { readP14RuntimeEventTimestamp } from './p14-timestamp-evidence';
import { validateP14PreparationPlan } from './p14-plan-integrity';
import { authorizeP14PreparationPlan } from './p14-plan-authorization';
import { validateP14PreparationConfirmation } from './p14-preparation-confirmation';
import { assessP14ValidationProfileCoverage } from './p14-validation-profile-coverage';
import {
  validateP14ValidationEvidence,
  type P14BoundedValidationEvidence,
} from './p14-validation-evidence';
import { validateP14RescoreEvidence } from './p14-rescore-evidence';
import { validateP14RuntimeActionEligibilityEvidence } from './p14-runtime-action-eligibility';
import {
  P14_UNKNOWN_SOURCE_FINGERPRINT,
  validateP14SourceFingerprintEvidence,
} from './p14-source-fingerprint-evidence';
import {
  DEFAULT_P14_SOURCE_TRANSACTION_COORDINATOR,
  assessP14TransactionLeaseResultEvidence,
  type P14SourceTransactionCoordinator,
  type P14TransactionLease,
} from './p14-transaction-coordinator';
import {
  PRODUCTION_P14_SAFE_RECIPE_REGISTRY,
  type P14SafeRecipeRegistryV1,
} from './p14-safe-recipe-registry';
import {
  P14_PREPARATION_ENGINE_VERSION,
  type P14CandidateHandle,
  type P14ErrorCode,
  type P14PreparationAction,
  type P14PreparationPlanV1,
  type P14PreparationReceiptV1,
  type P14ReceiptError,
  type P14RecipeExecutionResult,
  type P14RetainedDuplicateAdapter,
  type P14TransactionEvent,
  type P14TransactionState,
  type P14ValidationSummary,
} from './p14-preparation-types';

export interface P14RetainedDuplicateRunInput {
  plan: unknown;
  registry?: P14SafeRecipeRegistryV1;
  coordinator?: P14SourceTransactionCoordinator;
  inputBounds?: Partial<P14InputBoundsLimits>;
  confirmation?: unknown;
  transactionId: string;
  preparedName?: string;
  allowPreparedWithReview?: boolean;
  now?: () => unknown;
  shouldCancel?: () => boolean | Promise<boolean>;
}

async function readP14SourceFingerprint(
  adapter: P14RetainedDuplicateAdapter,
  sourceNodeId: string,
): Promise<string> {
  const rawFingerprint: unknown = await adapter.fingerprintSource(sourceNodeId);
  const evidence = validateP14SourceFingerprintEvidence(rawFingerprint);
  if (!evidence.valid || !evidence.value) {
    throw new Error(`Source fingerprint adapter returned invalid evidence: ${evidence.failures.join(' | ')}`);
  }
  return evidence.value;
}

function event(now: () => unknown, state: P14TransactionState, detail?: string): P14TransactionEvent {
  const safeDetail = detail ? boundP14ReceiptDetail(detail) : undefined;
  return {
    state,
    at: readP14RuntimeEventTimestamp(now),
    ...(safeDetail ? { detail: safeDetail } : {}),
  };
}

function receiptError(code: P14ErrorCode, stage: string, detail: string, recovery?: string): P14ReceiptError {
  const safeStage = boundP14ReceiptIdentity(stage, 'unknown-stage');
  const safeDetail = boundP14ReceiptDetail(detail);
  const safeRecovery = recovery ? boundP14ReceiptDetail(recovery) : undefined;
  return {
    code,
    stage: safeStage,
    detail: safeDetail,
    ...(safeRecovery ? { recovery: safeRecovery } : {}),
  };
}

async function discardCandidate(
  adapter: P14RetainedDuplicateAdapter,
  candidate: P14CandidateHandle,
): Promise<string | null> {
  try {
    await adapter.discardCandidate(candidate);
    return null;
  } catch (error) {
    return safeP14RuntimeErrorMessage(error);
  }
}

function baseReceipt(input: {
  plan: P14PreparationPlanV1;
  transactionId: string;
  status: P14PreparationReceiptV1['status'];
  terminalState: P14PreparationReceiptV1['terminalState'];
  beforeFingerprint: string;
  afterFingerprint: string;
  candidate?: P14PreparationReceiptV1['candidate'];
  appliedActions?: P14RecipeExecutionResult[];
  errors?: P14ReceiptError[];
  events: P14TransactionEvent[];
}): P14PreparationReceiptV1 {
  return {
    schemaVersion: 1,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    transactionId: input.transactionId,
    status: input.status,
    terminalState: input.terminalState,
    source: {
      nodeId: input.plan.source.nodeId,
      beforeFingerprint: input.beforeFingerprint,
      afterFingerprint: input.afterFingerprint,
    },
    ...(input.candidate ? { candidate: input.candidate } : {}),
    p13RunId: input.plan.p13RunId,
    planDigest: input.plan.planDigest,
    appliedActions: input.appliedActions ?? [],
    errors: input.errors ?? [],
    events: input.events,
  };
}

function cleanupOutcome(input: {
  plan: P14PreparationPlanV1;
  transactionId: string;
  beforeFingerprint: string;
  afterFingerprint: string;
  candidate: P14CandidateHandle;
  appliedActions: P14RecipeExecutionResult[];
  events: P14TransactionEvent[];
  now: () => unknown;
  primaryError: P14ReceiptError;
  discardError: string | null;
  rejectedState?: 'REJECTED' | 'SOURCE_STALE' | 'CANCELLED';
}): P14PreparationReceiptV1 {
  if (input.discardError) {
    return baseReceipt({
      plan: input.plan,
      transactionId: input.transactionId,
      status: 'CLEANUP_REQUIRED',
      terminalState: 'CLEANUP_REQUIRED',
      beforeFingerprint: input.beforeFingerprint,
      afterFingerprint: input.afterFingerprint,
      candidate: { nodeId: input.candidate.candidateNodeId, retained: false },
      appliedActions: input.appliedActions,
      errors: [
        input.primaryError,
        receiptError(
          'P14_DISCARD_FAILED',
          'discard',
          input.discardError,
          `Remove or recover candidate ${input.candidate.candidateNodeId} before retrying.`,
        ),
      ],
      events: [...input.events, event(input.now, 'CLEANUP_REQUIRED', 'candidate cleanup failed')],
    });
  }

  const terminal = input.rejectedState ?? 'REJECTED';
  return baseReceipt({
    plan: input.plan,
    transactionId: input.transactionId,
    status: terminal === 'CANCELLED' ? 'CANCELLED' : 'REJECTED',
    terminalState: terminal,
    beforeFingerprint: input.beforeFingerprint,
    afterFingerprint: input.afterFingerprint,
    candidate: { nodeId: input.candidate.candidateNodeId, retained: false },
    appliedActions: input.appliedActions,
    errors: [input.primaryError],
    events: [...input.events, event(input.now, terminal, input.primaryError.detail)],
  });
}

function coordinatorReleaseCleanupOutcome(
  receipt: P14PreparationReceiptV1,
  now: () => unknown,
  detail: string,
): P14PreparationReceiptV1 {
  return {
    ...receipt,
    status: 'CLEANUP_REQUIRED',
    terminalState: 'CLEANUP_REQUIRED',
    errors: [
      ...receipt.errors,
      receiptError(
        'P14_INTERNAL_INVARIANT_FAILED',
        'coordination-release',
        detail,
        'Recover or reset the source transaction coordinator lease before retrying preparation.',
      ),
    ],
    events: [...receipt.events, event(now, 'CLEANUP_REQUIRED', 'source transaction lease cleanup failed')],
  };
}

function releaseCoordinatorLease(
  coordinator: P14SourceTransactionCoordinator,
  lease: P14TransactionLease,
): { released: boolean; detail: string } {
  try {
    const releaseResult: unknown = coordinator.release(lease);
    if (releaseResult === true) return { released: true, detail: '' };
    return {
      released: false,
      detail: releaseResult === false
        ? 'P14 source transaction coordinator refused to release the acquired lease.'
        : `P14 source transaction coordinator returned non-boolean release evidence (${typeof releaseResult}).`,
    };
  } catch (error) {
    return {
      released: false,
      detail: `P14 source transaction coordinator release failed: ${safeP14RuntimeErrorMessage(error)}`,
    };
  }
}

function eligibleActions(plan: P14PreparationPlanV1): P14PreparationAction[] {
  return plan.actions.filter((action) => action.decision === 'ELIGIBLE');
}

function invalidPlanReceipt(
  value: unknown,
  transactionId: string,
  now: () => unknown,
  failures: string[],
  options: {
    code?: P14ErrorCode;
    stage?: string;
    detailPrefix?: string;
    eventDetail?: string;
  } = {},
): P14PreparationReceiptV1 {
  const record = typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const source = typeof record.source === 'object' && record.source !== null && !Array.isArray(record.source)
    ? record.source as Record<string, unknown>
    : {};
  const boundedIdentity = (value: unknown, fallback: string): string =>
    typeof value === 'string'
      && value.length > 0
      && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength
      ? value
      : fallback;
  const safeTransactionId = boundedIdentity(transactionId, 'p14-transaction-invalid');
  const nodeId = boundedIdentity(source.nodeId, 'UNKNOWN');
  const p13RunId = boundedIdentity(record.p13RunId, 'UNKNOWN');
  const rawPlanDigest = boundedIdentity(record.planDigest, 'p14-plan-invalid');
  const planDigest = rawPlanDigest.startsWith('p14-plan-') ? rawPlanDigest : 'p14-plan-invalid';
  const detail = `${options.detailPrefix ?? 'Invalid P14 preparation plan'}: ${failures.join(' | ')}`;
  return {
    schemaVersion: 1,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    transactionId: safeTransactionId,
    status: 'BLOCKED',
    terminalState: 'BLOCKED',
    source: {
      nodeId,
      beforeFingerprint: 'UNKNOWN',
      afterFingerprint: 'UNKNOWN',
    },
    p13RunId,
    planDigest,
    appliedActions: [],
    errors: [receiptError(options.code ?? 'P14_INTERNAL_INVARIANT_FAILED', options.stage ?? 'preflight', detail)],
    events: [
      event(now, 'IDLE'),
      event(now, 'PREFLIGHT'),
      event(now, 'BLOCKED', options.eventDetail ?? 'plan integrity validation failed'),
    ],
  };
}

function unreadableBoundsReceipt(
  transactionId: string,
  now: () => unknown,
  error: unknown,
): P14PreparationReceiptV1 {
  return {
    schemaVersion: 1,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    transactionId: boundP14ReceiptIdentity(transactionId, 'p14-transaction-invalid'),
    status: 'BLOCKED',
    terminalState: 'BLOCKED',
    source: {
      nodeId: 'UNKNOWN',
      beforeFingerprint: P14_UNKNOWN_SOURCE_FINGERPRINT,
      afterFingerprint: P14_UNKNOWN_SOURCE_FINGERPRINT,
    },
    p13RunId: 'UNKNOWN',
    planDigest: 'p14-plan-invalid',
    appliedActions: [],
    errors: [receiptError(
      'P14_INTERNAL_INVARIANT_FAILED',
      'bounds-evidence',
      `P14 bounded-input evidence could not be read safely: ${safeP14RuntimeErrorMessage(error)}`,
      'Provide readable nested plan/confirmation bounds evidence and retry the current reviewed plan.',
    )],
    events: [
      event(now, 'IDLE'),
      event(now, 'PREFLIGHT'),
      event(now, 'BLOCKED', 'bounded input evidence could not be read safely'),
    ],
  };
}

/**
 * Target-neutral P14 transaction core.
 *
 * The approved source node id is used only for fingerprinting and cloning. Recipe callbacks receive
 * the candidate handle, never the source/original node. Finalization retains the validated duplicate
 * as a separate node; this engine never swaps/replaces/deletes the approved source.
 */
export async function runP14RetainedDuplicateTransaction(
  input: P14RetainedDuplicateRunInput,
  adapter: P14RetainedDuplicateAdapter,
): Promise<P14PreparationReceiptV1> {
  const now = input.now ?? (() => new Date().toISOString());
  const events: P14TransactionEvent[] = [event(now, 'IDLE'), event(now, 'PREFLIGHT')];
  let inputBounds: ReturnType<typeof assessP14PreparationInputBounds>;
  try {
    inputBounds = assessP14PreparationInputBounds(input.plan, input.inputBounds, {
      transactionId: input.transactionId,
      preparedName: input.preparedName,
      confirmation: input.confirmation,
    });
  } catch (error) {
    return unreadableBoundsReceipt(input.transactionId, now, error);
  }
  if (!inputBounds.allowed) {
    const failures = inputBounds.failures.map(
      (failure) => `${failure.code} at ${failure.path}: ${failure.actual} > ${failure.limit}`,
    );
    return invalidPlanReceipt(input.plan, input.transactionId, now, failures, {
      code: 'P14_INPUT_TOO_LARGE',
      stage: 'bounds',
      detailPrefix: 'P14 input exceeds bounded safety limits',
      eventDetail: 'bounded input preflight failed',
    });
  }
  const planIntegrity = validateP14PreparationPlan(input.plan);
  if (!planIntegrity.valid) {
    return invalidPlanReceipt(input.plan, input.transactionId, now, planIntegrity.failures);
  }
  const plan = input.plan as P14PreparationPlanV1;
  const unknownFingerprint = P14_UNKNOWN_SOURCE_FINGERPRINT;

  if (plan.schemaVersion !== 1 || plan.engineVersion !== P14_PREPARATION_ENGINE_VERSION) {
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'BLOCKED',
      terminalState: 'BLOCKED',
      beforeFingerprint: unknownFingerprint,
      afterFingerprint: unknownFingerprint,
      errors: [receiptError('P14_INTERNAL_INVARIANT_FAILED', 'preflight', 'Unsupported P14 plan schema or engine version.')],
      events: [...events, event(now, 'BLOCKED', 'unsupported plan contract')],
    });
  }

  if (plan.status === 'BLOCKED') {
    const errors = plan.blockers.length > 0
      ? plan.blockers.map((blocker) => receiptError(blocker.code, 'plan', blocker.detail))
      : [receiptError('P14_NO_ELIGIBLE_RECIPES', 'plan', 'Preparation plan is blocked.')];
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'BLOCKED',
      terminalState: 'BLOCKED',
      beforeFingerprint: plan.source.fingerprint,
      afterFingerprint: plan.source.fingerprint,
      errors,
      events: [...events, event(now, 'BLOCKED', 'plan is blocked')],
    });
  }

  const authorization = authorizeP14PreparationPlan(
    plan,
    input.registry ?? PRODUCTION_P14_SAFE_RECIPE_REGISTRY,
  );
  if (!authorization.authorized) {
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'BLOCKED',
      terminalState: 'BLOCKED',
      beforeFingerprint: unknownFingerprint,
      afterFingerprint: unknownFingerprint,
      errors: [receiptError(
        'P14_RECIPE_UNAUTHORIZED',
        'authorization',
        `Preparation plan is not authorized by the current safe-recipe registry: ${authorization.failures.join(' | ')}`,
        'Re-run Build Readiness and Safe Preparation with the current accepted recipe registry.',
      )],
      events: [...events, event(now, 'BLOCKED', 'safe-recipe authorization failed')],
    });
  }

  if (plan.status === 'READY') {
    events.push(event(now, 'PLAN_READY', 'plan integrity and safe-recipe authorization passed'));
    events.push(event(now, 'AWAITING_CONFIRMATION', 'explicit plan-bound confirmation required'));
    if (input.confirmation === undefined || input.confirmation === null) {
      return baseReceipt({
        plan,
        transactionId: input.transactionId,
        status: 'BLOCKED',
        terminalState: 'BLOCKED',
        beforeFingerprint: unknownFingerprint,
        afterFingerprint: unknownFingerprint,
        errors: [receiptError(
          'P14_CONFIRMATION_REQUIRED',
          'confirmation',
          'Mutating P14 preparation requires explicit confirmation bound to the exact reviewed plan.',
          'Review the proposed changes and create a confirmation for the current plan before retrying.',
        )],
        events: [...events, event(now, 'BLOCKED', 'explicit preparation confirmation missing')],
      });
    }
    const confirmation = validateP14PreparationConfirmation(input.confirmation, plan);
    if (!confirmation.valid) {
      return baseReceipt({
        plan,
        transactionId: input.transactionId,
        status: 'BLOCKED',
        terminalState: 'BLOCKED',
        beforeFingerprint: unknownFingerprint,
        afterFingerprint: unknownFingerprint,
        errors: [receiptError(
          'P14_CONFIRMATION_MISMATCH',
          'confirmation',
          `Preparation confirmation does not match the current reviewed plan: ${confirmation.failures.join(' | ')}`,
          'Review and confirm the current preparation plan again before retrying.',
        )],
        events: [...events, event(now, 'BLOCKED', 'preparation confirmation validation failed')],
      });
    }
  }

  const coordinator = input.coordinator ?? DEFAULT_P14_SOURCE_TRANSACTION_COORDINATOR;
  let lease: P14TransactionLease | null = null;
  if (plan.status === 'READY') {
    let rawLeaseResult: unknown;
    try {
      rawLeaseResult = coordinator.tryAcquire(plan.source.nodeId, input.transactionId);
    } catch (error) {
      return baseReceipt({
        plan,
        transactionId: input.transactionId,
        status: 'BLOCKED',
        terminalState: 'BLOCKED',
        beforeFingerprint: unknownFingerprint,
        afterFingerprint: unknownFingerprint,
        errors: [receiptError(
          'P14_INTERNAL_INVARIANT_FAILED',
          'coordination',
          `P14 source transaction coordinator acquisition failed: ${safeP14RuntimeErrorMessage(error)}`,
          'Fix or replace the source transaction coordinator before retrying preparation.',
        )],
        events: [...events, event(now, 'BLOCKED', 'source transaction lease acquisition failed')],
      });
    }

    const leaseEvidence = assessP14TransactionLeaseResultEvidence(
      rawLeaseResult,
      plan.source.nodeId,
      input.transactionId,
    );
    if (!leaseEvidence.valid || !leaseEvidence.value) {
      const invalidReceipt = baseReceipt({
        plan,
        transactionId: input.transactionId,
        status: 'BLOCKED',
        terminalState: 'BLOCKED',
        beforeFingerprint: unknownFingerprint,
        afterFingerprint: unknownFingerprint,
        errors: [receiptError(
          'P14_INTERNAL_INVARIANT_FAILED',
          'coordination',
          `P14 source transaction coordinator returned invalid acquisition evidence: ${leaseEvidence.failures.join(' | ')}`,
          'Fix or replace the source transaction coordinator before retrying preparation.',
        )],
        events: [...events, event(now, 'BLOCKED', 'source transaction lease evidence invalid')],
      });
      if (leaseEvidence.claimedAcquired) {
        const releaseAttempt = releaseCoordinatorLease(coordinator, leaseEvidence.expectedLease);
        if (!releaseAttempt.released) {
          return coordinatorReleaseCleanupOutcome(invalidReceipt, now, releaseAttempt.detail);
        }
      }
      return invalidReceipt;
    }

    const leaseResult = leaseEvidence.value;
    if (!leaseResult.acquired) {
      const isConflict = leaseResult.reason === 'SOURCE_BUSY' || leaseResult.reason === 'TRANSACTION_ID_BUSY';
      const owner = leaseResult.ownerTransactionId
        ? ` Active transaction: ${leaseResult.ownerTransactionId}.`
        : '';
      return baseReceipt({
        plan,
        transactionId: input.transactionId,
        status: 'BLOCKED',
        terminalState: 'BLOCKED',
        beforeFingerprint: unknownFingerprint,
        afterFingerprint: unknownFingerprint,
        errors: [receiptError(
          isConflict ? 'P14_TRANSACTION_CONFLICT' : 'P14_INTERNAL_INVARIANT_FAILED',
          'coordination',
          `Unable to acquire P14 source transaction lease (${leaseResult.reason}).${owner}`,
          isConflict ? 'Wait for the active preparation transaction to finish, then retry.' : 'Use a non-empty unique transaction ID and valid source scope.',
        )],
        events: [...events, event(now, 'BLOCKED', 'source transaction lease unavailable')],
      });
    }
    lease = leaseResult.lease;
  }

  const executeWithLease = async (): Promise<P14PreparationReceiptV1> => {
  let beforeFingerprint: string;
  try {
    beforeFingerprint = await readP14SourceFingerprint(adapter, plan.source.nodeId);
  } catch (error) {
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'BLOCKED',
      terminalState: 'BLOCKED',
      beforeFingerprint: unknownFingerprint,
      afterFingerprint: unknownFingerprint,
      errors: [receiptError('P14_INTERNAL_INVARIANT_FAILED', 'preflight', `Unable to fingerprint source: ${safeP14RuntimeErrorMessage(error)}`)],
      events: [...events, event(now, 'BLOCKED', 'source fingerprint failed')],
    });
  }

  if (beforeFingerprint !== plan.source.fingerprint) {
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'BLOCKED',
      terminalState: 'SOURCE_STALE',
      beforeFingerprint,
      afterFingerprint: beforeFingerprint,
      errors: [receiptError(
        'P14_P13_REPORT_STALE',
        'preflight',
        'Current source fingerprint no longer matches the P13-bound preparation plan.',
        'Re-run Build Readiness and preview preparation again.',
      )],
      events: [...events, event(now, 'SOURCE_STALE', 'P13-bound source fingerprint is stale')],
    });
  }

  if (plan.status === 'NO_CHANGES_NEEDED') {
    events.push(event(now, 'PLAN_READY', 'non-mutating no-op plan ready'));
    let afterFingerprint = beforeFingerprint;
    try {
      afterFingerprint = await readP14SourceFingerprint(adapter, plan.source.nodeId);
    } catch (error) {
      return baseReceipt({
        plan,
        transactionId: input.transactionId,
        status: 'BLOCKED',
        terminalState: 'BLOCKED',
        beforeFingerprint,
        afterFingerprint: unknownFingerprint,
        errors: [receiptError('P14_INTERNAL_INVARIANT_FAILED', 'preflight', `Unable to re-check no-op source: ${safeP14RuntimeErrorMessage(error)}`)],
        events: [...events, event(now, 'BLOCKED', 'no-op source recheck failed')],
      });
    }
    if (afterFingerprint !== beforeFingerprint) {
      return baseReceipt({
        plan,
        transactionId: input.transactionId,
        status: 'BLOCKED',
        terminalState: 'SOURCE_STALE',
        beforeFingerprint,
        afterFingerprint,
        errors: [receiptError('P14_SOURCE_CHANGED_DURING_RUN', 'preflight', 'Source changed during no-op confirmation.')],
        events: [...events, event(now, 'SOURCE_STALE', 'source changed during no-op confirmation')],
      });
    }
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'NO_CHANGES_NEEDED',
      terminalState: 'COMPLETE',
      beforeFingerprint,
      afterFingerprint,
      events: [...events, event(now, 'COMPLETE', 'accepted plan contains only no-op confirmations')],
    });
  }

  const actions = eligibleActions(plan);
  if (actions.length === 0) {
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'BLOCKED',
      terminalState: 'BLOCKED',
      beforeFingerprint,
      afterFingerprint: beforeFingerprint,
      errors: [receiptError('P14_NO_ELIGIBLE_RECIPES', 'preflight', 'READY plan contains no eligible recipes.')],
      events: [...events, event(now, 'BLOCKED', 'READY plan invariant failed')],
    });
  }

  const preCloneCancellation = await assessP14CancellationCheck(input.shouldCancel);
  if (preCloneCancellation.failure) {
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'BLOCKED',
      terminalState: 'BLOCKED',
      beforeFingerprint,
      afterFingerprint: beforeFingerprint,
      errors: [receiptError(
        'P14_INTERNAL_INVARIANT_FAILED',
        'pre-clone-cancellation-check',
        boundedP14CancellationFailureDetail('Cancellation check failed before cloning', preCloneCancellation.failure),
        'Fix the cancellation/control callback and retry the current preparation plan.',
      )],
      events: [...events, event(now, 'BLOCKED', 'pre-clone cancellation check failed')],
    });
  }
  if (preCloneCancellation.cancelled) {
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'CANCELLED',
      terminalState: 'CANCELLED',
      beforeFingerprint,
      afterFingerprint: beforeFingerprint,
      errors: [receiptError('P14_CANCELLED', 'pre-clone', 'Preparation was cancelled before cloning.')],
      events: [...events, event(now, 'CANCELLED', 'cancelled before clone')],
    });
  }

  let candidate: P14CandidateHandle;
  events.push(event(now, 'CLONING'));
  try {
    const rawCandidate: unknown = await adapter.cloneSource(plan.source.nodeId, input.transactionId);
    const candidateEvidence = validateP14CandidateHandleEvidence(rawCandidate, plan.source.nodeId);
    if (!candidateEvidence.valid || !candidateEvidence.value) {
      throw new Error(`Candidate adapter returned invalid evidence: ${candidateEvidence.failures.join(' | ')}`);
    }
    candidate = candidateEvidence.value;
  } catch (error) {
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'REJECTED',
      terminalState: 'REJECTED',
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      errors: [receiptError('P14_CLONE_FAILED', 'clone', safeP14RuntimeErrorMessage(error))],
      events: [...events, event(now, 'REJECTED', 'candidate clone failed')],
    });
  }

  const appliedActions: P14RecipeExecutionResult[] = [];
  events.push(event(now, 'TRANSFORMING'));
  for (const action of actions) {
    const transformCancellation = await assessP14CancellationCheck(input.shouldCancel);
    if (transformCancellation.failure) {
      const discardError = await discardCandidate(adapter, candidate);
      return cleanupOutcome({
        plan,
        transactionId: input.transactionId,
        beforeFingerprint,
        afterFingerprint: unknownFingerprint,
        candidate,
        appliedActions,
        events,
        now,
        primaryError: receiptError(
          'P14_INTERNAL_INVARIANT_FAILED',
          'transform-cancellation-check',
          boundedP14CancellationFailureDetail('Cancellation check failed between recipe checkpoints', transformCancellation.failure),
          'Fix the cancellation/control callback and re-run preparation from a fresh plan.',
        ),
        discardError,
      });
    }
    if (transformCancellation.cancelled) {
      const discardError = await discardCandidate(adapter, candidate);
      return cleanupOutcome({
        plan,
        transactionId: input.transactionId,
        beforeFingerprint,
        afterFingerprint: unknownFingerprint,
        candidate,
        appliedActions,
        events,
        now,
        primaryError: receiptError('P14_CANCELLED', 'transform', 'Preparation was cancelled between recipes.'),
        discardError,
        rejectedState: 'CANCELLED',
      });
    }
    if (!action.recipeId || action.recipeVersion === null || !action.validationProfileId) {
      const discardError = await discardCandidate(adapter, candidate);
      return cleanupOutcome({
        plan,
        transactionId: input.transactionId,
        beforeFingerprint,
        afterFingerprint: unknownFingerprint,
        candidate,
        appliedActions,
        events,
        now,
        primaryError: receiptError('P14_INTERNAL_INVARIANT_FAILED', 'transform', `Eligible action ${action.actionId} has no accepted recipe contract.`),
        discardError,
      });
    }
    const completedRecipeIds = new Set(appliedActions.map((result) => result.recipeId));
    const missingPrerequisiteRecipeIds = action.prerequisiteRecipeIds.filter(
      (recipeId) => !completedRecipeIds.has(recipeId),
    );
    if (missingPrerequisiteRecipeIds.length > 0) {
      const discardError = await discardCandidate(adapter, candidate);
      const firstMissing = missingPrerequisiteRecipeIds[0] ?? 'UNKNOWN';
      return cleanupOutcome({
        plan,
        transactionId: input.transactionId,
        beforeFingerprint,
        afterFingerprint: unknownFingerprint,
        candidate,
        appliedActions,
        events,
        now,
        primaryError: receiptError(
          'P14_RECIPE_PREREQUISITE_MISSING',
          'transform-recheck',
          `Action ${action.actionId} no longer has completed prerequisite execution evidence (${missingPrerequisiteRecipeIds.length} missing; first: ${firstMissing}).`,
          'Re-run Build Readiness and Safe Preparation to produce a current deterministic plan.',
        ),
        discardError,
      });
    }

    if (appliedActions.length > 0) {
      const assessActionEligibility = adapter.assessActionEligibility;
      if (typeof assessActionEligibility !== 'function') {
        const discardError = await discardCandidate(adapter, candidate);
        return cleanupOutcome({
          plan,
          transactionId: input.transactionId,
          beforeFingerprint,
          afterFingerprint: unknownFingerprint,
          candidate,
          appliedActions,
          events,
          now,
          primaryError: receiptError(
            'P14_TRANSFORM_FAILED',
            'transform-recheck',
            `Adapter cannot re-evaluate runtime eligibility for action ${action.actionId} after a prior recipe.`,
            'Use an adapter that implements bounded runtime action eligibility reassessment, then re-run the current plan.',
          ),
          discardError,
        });
      }

      let runtimeEligibility;
      try {
        const rawEligibility: unknown = await assessActionEligibility.call(adapter, candidate, action);
        const evidence = validateP14RuntimeActionEligibilityEvidence(rawEligibility, action);
        if (!evidence.valid || !evidence.value) {
          throw new Error(`Runtime action eligibility evidence is invalid: ${evidence.failures.join(' | ')}`);
        }
        runtimeEligibility = evidence.value;
      } catch (error) {
        const discardError = await discardCandidate(adapter, candidate);
        return cleanupOutcome({
          plan,
          transactionId: input.transactionId,
          beforeFingerprint,
          afterFingerprint: unknownFingerprint,
          candidate,
          appliedActions,
          events,
          now,
          primaryError: receiptError('P14_TRANSFORM_FAILED', 'transform-recheck', safeP14RuntimeErrorMessage(error)),
          discardError,
        });
      }

      if (!runtimeEligibility.eligible) {
        const discardError = await discardCandidate(adapter, candidate);
        const boundedDetail = runtimeEligibility.detail ? ` ${runtimeEligibility.detail.slice(0, 1024)}` : '';
        return cleanupOutcome({
          plan,
          transactionId: input.transactionId,
          beforeFingerprint,
          afterFingerprint: unknownFingerprint,
          candidate,
          appliedActions,
          events,
          now,
          primaryError: receiptError(
            'P14_RECIPE_PREREQUISITE_MISSING',
            'transform-recheck',
            `Runtime eligibility changed for action ${action.actionId}; continuing would use stale recipe assumptions.${boundedDetail}`,
            'Re-run Build Readiness and Safe Preparation to replan against the current candidate/source state.',
          ),
          discardError,
        });
      }
    }

    try {
      const rawResult: unknown = await adapter.applyRecipe(candidate, action);
      const executionEvidence = validateP14RecipeExecutionResultEvidence(rawResult, action);
      if (!executionEvidence.valid || !executionEvidence.value) {
        throw new Error(`Recipe execution evidence is invalid: ${executionEvidence.failures.join(' | ')}`);
      }
      appliedActions.push(executionEvidence.value);
    } catch (error) {
      const discardError = await discardCandidate(adapter, candidate);
      return cleanupOutcome({
        plan,
        transactionId: input.transactionId,
        beforeFingerprint,
        afterFingerprint: unknownFingerprint,
        candidate,
        appliedActions,
        events,
        now,
        primaryError: receiptError('P14_TRANSFORM_FAILED', 'transform', safeP14RuntimeErrorMessage(error)),
        discardError,
      });
    }
  }

  const preValidationCancellation = await assessP14CancellationCheck(input.shouldCancel);
  if (preValidationCancellation.failure) {
    const discardError = await discardCandidate(adapter, candidate);
    return cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError(
        'P14_INTERNAL_INVARIANT_FAILED',
        'pre-validation-cancellation-check',
        boundedP14CancellationFailureDetail('Cancellation check failed before validation', preValidationCancellation.failure),
        'Fix the cancellation/control callback and re-run preparation from a fresh plan.',
      ),
      discardError,
    });
  }
  if (preValidationCancellation.cancelled) {
    const discardError = await discardCandidate(adapter, candidate);
    return cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_CANCELLED', 'pre-validation', 'Preparation was cancelled before validation.'),
      discardError,
      rejectedState: 'CANCELLED',
    });
  }

  events.push(event(now, 'VALIDATING'));
  let validationEvidence: P14BoundedValidationEvidence;
  try {
    const rawValidation: unknown = await adapter.validateCandidate(candidate, plan);
    const evidence = validateP14ValidationEvidence(rawValidation);
    if (!evidence.valid || !evidence.value) {
      throw new Error(`Validation adapter returned malformed evidence: ${evidence.failures.join(' | ')}`);
    }
    validationEvidence = evidence.value;
  } catch (error) {
    const discardError = await discardCandidate(adapter, candidate);
    return cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_VALIDATION_FAILED', 'validate', `Validation crashed: ${safeP14RuntimeErrorMessage(error)}`),
      discardError,
    });
  }

  const profileCoverage = assessP14ValidationProfileCoverage(plan, validationEvidence.profileIdsRun);
  const validation: P14ValidationSummary = {
    passed: validationEvidence.passed,
    profileIdsRun: profileCoverage.observedProfileIds,
    checks: validationEvidence.checks,
  };
  const requiredChecksPass = Array.isArray(validation.checks)
    && validation.checks.filter((check) => check.required).every((check) => check.passed);
  if (!profileCoverage.valid || !validation.passed || !requiredChecksPass) {
    const discardError = await discardCandidate(adapter, candidate);
    const profileDetail = profileCoverage.valid
      ? ''
      : ` Validation profile coverage failed: ${profileCoverage.failures.join(' | ')}`;
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError(
        'P14_VALIDATION_FAILED',
        'validate',
        `Candidate failed one or more mandatory validators.${profileDetail}`,
      ),
      discardError,
    });
    return { ...result, validation };
  }

  events.push(event(now, 'RESCORING'));
  let rescore;
  try {
    const rawRescore: unknown = await adapter.rescoreCandidate(candidate, plan);
    const evidence = validateP14RescoreEvidence(rawRescore);
    if (!evidence.valid || !evidence.value) {
      throw new Error(`Candidate re-score evidence is invalid: ${evidence.failures.join(' | ')}`);
    }
    rescore = evidence.value;
  } catch (error) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_RESCORE_FAILED', 'rescore', safeP14RuntimeErrorMessage(error)),
      discardError,
    });
    return { ...result, validation };
  }

  if (rescore.introducedBlockerOrHighCount > 0) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_VALIDATION_FAILED', 'rescore', 'Preparation introduced a new HIGH/BLOCKER finding.'),
      discardError,
    });
    return { ...result, validation, rescore };
  }

  if (rescore.reviewRequired && !input.allowPreparedWithReview) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_VALIDATION_FAILED', 'rescore', 'Candidate still requires review and PREPARED_WITH_REVIEW policy was not explicitly enabled.'),
      discardError,
    });
    return { ...result, validation, rescore };
  }

  const preFinalizeCancellation = await assessP14CancellationCheck(input.shouldCancel);
  if (preFinalizeCancellation.failure) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError(
        'P14_INTERNAL_INVARIANT_FAILED',
        'pre-finalize-cancellation-check',
        boundedP14CancellationFailureDetail('Cancellation check failed before finalization', preFinalizeCancellation.failure),
        'Fix the cancellation/control callback and re-run preparation from a fresh plan.',
      ),
      discardError,
    });
    return { ...result, validation, rescore };
  }
  if (preFinalizeCancellation.cancelled) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_CANCELLED', 'pre-finalize', 'Preparation was cancelled before finalization.'),
      discardError,
      rejectedState: 'CANCELLED',
    });
    return { ...result, validation, rescore };
  }

  let preRetainFingerprint: string;
  try {
    preRetainFingerprint = await readP14SourceFingerprint(adapter, plan.source.nodeId);
  } catch (error) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_SOURCE_CHANGED_DURING_RUN', 'pre-finalize', `Unable to verify source immutability: ${safeP14RuntimeErrorMessage(error)}`),
      discardError,
      rejectedState: 'SOURCE_STALE',
    });
    return { ...result, validation, rescore };
  }

  if (preRetainFingerprint !== beforeFingerprint) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: preRetainFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_SOURCE_CHANGED_DURING_RUN', 'pre-finalize', 'Approved source changed while the candidate was being prepared.'),
      discardError,
      rejectedState: 'SOURCE_STALE',
    });
    return { ...result, validation, rescore };
  }

  events.push(event(now, 'FINALIZING'));
  const preparedName = input.preparedName?.trim() || 'Prepared Duplicate';
  let retention;
  try {
    const rawRetention: unknown = await adapter.retainCandidate(
      candidate,
      input.transactionId,
      preparedName,
    );
    const retentionEvidence = validateP14RetentionEvidence(rawRetention, {
      transactionId: input.transactionId,
      sourceNodeId: plan.source.nodeId,
      retainedNodeId: candidate.candidateNodeId,
      preparedName,
    });
    if (!retentionEvidence.valid || !retentionEvidence.value) {
      throw new Error(`Retention adapter returned invalid evidence: ${retentionEvidence.failures.join(' | ')}`);
    }
    retention = retentionEvidence.value;
  } catch (error) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: preRetainFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_FINALIZE_FAILED', 'finalize', safeP14RuntimeErrorMessage(error)),
      discardError,
    });
    return { ...result, validation, rescore };
  }

  let afterFingerprint: string;
  try {
    afterFingerprint = await readP14SourceFingerprint(adapter, plan.source.nodeId);
  } catch (error) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_SOURCE_CHANGED_DURING_RUN', 'post-finalize', `Unable to prove source immutability after retention: ${safeP14RuntimeErrorMessage(error)}`),
      discardError,
      rejectedState: 'SOURCE_STALE',
    });
    return { ...result, validation, rescore, retention };
  }

  if (afterFingerprint !== beforeFingerprint) {
    const discardError = await discardCandidate(adapter, candidate);
    const result = cleanupOutcome({
      plan,
      transactionId: input.transactionId,
      beforeFingerprint,
      afterFingerprint,
      candidate,
      appliedActions,
      events,
      now,
      primaryError: receiptError('P14_SOURCE_CHANGED_DURING_RUN', 'post-finalize', 'Approved source fingerprint changed during duplicate retention.'),
      discardError,
      rejectedState: 'SOURCE_STALE',
    });
    return { ...result, validation, rescore, retention };
  }

  const status = rescore.reviewRequired ? 'PREPARED_WITH_REVIEW' : 'PREPARED';
  return {
    ...baseReceipt({
      plan,
      transactionId: input.transactionId,
      status,
      terminalState: 'COMPLETE',
      beforeFingerprint,
      afterFingerprint,
      candidate: { nodeId: candidate.candidateNodeId, retained: true },
      appliedActions,
      events: [...events, event(now, 'COMPLETE', status)],
    }),
    validation,
    rescore,
    retention,
  };
  };

  let executionOutcome: P14PreparationReceiptV1 | undefined;
  let executionFailure: unknown;
  let executionFailed = false;
  try {
    executionOutcome = await executeWithLease();
  } catch (error) {
    executionFailed = true;
    executionFailure = error;
  }

  if (lease) {
    const releaseAttempt = releaseCoordinatorLease(coordinator, lease);
    if (!releaseAttempt.released) {
      const cleanupBase = executionOutcome ?? baseReceipt({
        plan,
        transactionId: input.transactionId,
        status: 'BLOCKED',
        terminalState: 'BLOCKED',
        beforeFingerprint: unknownFingerprint,
        afterFingerprint: unknownFingerprint,
        errors: [receiptError(
          'P14_INTERNAL_INVARIANT_FAILED',
          'transaction',
          `P14 transaction failed unexpectedly before a terminal receipt was produced: ${safeP14RuntimeErrorMessage(executionFailure)}`,
        )],
        events: [...events, event(now, 'BLOCKED', 'unexpected transaction failure')],
      });
      return coordinatorReleaseCleanupOutcome(cleanupBase, now, releaseAttempt.detail);
    }
  }

  if (executionFailed) throw executionFailure;
  if (!executionOutcome) throw new Error('P14 transaction completed without a terminal receipt.');
  return executionOutcome;
}
