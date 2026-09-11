import { validateP14PreparationPlan } from './p14-plan-integrity';
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
} from './p14-preparation-types';

export interface P14RetainedDuplicateRunInput {
  plan: unknown;
  transactionId: string;
  preparedName?: string;
  allowPreparedWithReview?: boolean;
  now?: () => string;
  shouldCancel?: () => boolean | Promise<boolean>;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function event(now: () => string, state: P14TransactionState, detail?: string): P14TransactionEvent {
  return { state, at: now(), ...(detail ? { detail } : {}) };
}

function receiptError(code: P14ErrorCode, stage: string, detail: string, recovery?: string): P14ReceiptError {
  return { code, stage, detail, ...(recovery ? { recovery } : {}) };
}

async function cancelled(check?: () => boolean | Promise<boolean>): Promise<boolean> {
  return check ? Boolean(await check()) : false;
}

async function discardCandidate(
  adapter: P14RetainedDuplicateAdapter,
  candidate: P14CandidateHandle,
): Promise<string | null> {
  try {
    await adapter.discardCandidate(candidate);
    return null;
  } catch (error) {
    return messageOf(error);
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
  now: () => string;
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

function eligibleActions(plan: P14PreparationPlanV1): P14PreparationAction[] {
  return plan.actions.filter((action) => action.decision === 'ELIGIBLE');
}

function invalidPlanReceipt(
  value: unknown,
  transactionId: string,
  now: () => string,
  failures: string[],
): P14PreparationReceiptV1 {
  const record = typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const source = typeof record.source === 'object' && record.source !== null && !Array.isArray(record.source)
    ? record.source as Record<string, unknown>
    : {};
  const nodeId = typeof source.nodeId === 'string' && source.nodeId ? source.nodeId : 'UNKNOWN';
  const p13RunId = typeof record.p13RunId === 'string' && record.p13RunId ? record.p13RunId : 'UNKNOWN';
  const planDigest = typeof record.planDigest === 'string' && record.planDigest.startsWith('p14-plan-')
    ? record.planDigest
    : 'p14-plan-invalid';
  const detail = `Invalid P14 preparation plan: ${failures.join(' | ')}`;
  return {
    schemaVersion: 1,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    transactionId,
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
    errors: [receiptError('P14_INTERNAL_INVARIANT_FAILED', 'preflight', detail)],
    events: [
      event(now, 'IDLE'),
      event(now, 'PREFLIGHT'),
      event(now, 'BLOCKED', 'plan integrity validation failed'),
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
  const planIntegrity = validateP14PreparationPlan(input.plan);
  if (!planIntegrity.valid) {
    return invalidPlanReceipt(input.plan, input.transactionId, now, planIntegrity.failures);
  }
  const plan = input.plan as P14PreparationPlanV1;
  const unknownFingerprint = 'UNKNOWN';

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

  let beforeFingerprint: string;
  try {
    beforeFingerprint = await adapter.fingerprintSource(plan.source.nodeId);
  } catch (error) {
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'BLOCKED',
      terminalState: 'BLOCKED',
      beforeFingerprint: unknownFingerprint,
      afterFingerprint: unknownFingerprint,
      errors: [receiptError('P14_INTERNAL_INVARIANT_FAILED', 'preflight', `Unable to fingerprint source: ${messageOf(error)}`)],
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

  events.push(event(now, 'PLAN_READY'));
  events.push(event(now, 'AWAITING_CONFIRMATION', 'execution call represents explicit confirmation'));

  if (plan.status === 'NO_CHANGES_NEEDED') {
    let afterFingerprint = beforeFingerprint;
    try {
      afterFingerprint = await adapter.fingerprintSource(plan.source.nodeId);
    } catch (error) {
      return baseReceipt({
        plan,
        transactionId: input.transactionId,
        status: 'BLOCKED',
        terminalState: 'BLOCKED',
        beforeFingerprint,
        afterFingerprint: unknownFingerprint,
        errors: [receiptError('P14_INTERNAL_INVARIANT_FAILED', 'preflight', `Unable to re-check no-op source: ${messageOf(error)}`)],
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

  if (await cancelled(input.shouldCancel)) {
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
    candidate = await adapter.cloneSource(plan.source.nodeId, input.transactionId);
    if (candidate.sourceNodeId !== plan.source.nodeId || !candidate.candidateNodeId || candidate.candidateNodeId === plan.source.nodeId) {
      throw new Error('Candidate adapter returned an invalid source/candidate identity binding.');
    }
  } catch (error) {
    return baseReceipt({
      plan,
      transactionId: input.transactionId,
      status: 'REJECTED',
      terminalState: 'REJECTED',
      beforeFingerprint,
      afterFingerprint: unknownFingerprint,
      errors: [receiptError('P14_CLONE_FAILED', 'clone', messageOf(error))],
      events: [...events, event(now, 'REJECTED', 'candidate clone failed')],
    });
  }

  const appliedActions: P14RecipeExecutionResult[] = [];
  events.push(event(now, 'TRANSFORMING'));
  for (const action of actions) {
    if (await cancelled(input.shouldCancel)) {
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
    try {
      const result = await adapter.applyRecipe(candidate, action);
      if (result.actionId !== action.actionId || result.recipeId !== action.recipeId) {
        throw new Error('Recipe execution result does not match the planned action identity.');
      }
      if (!result.applied && !result.becameNoOp) {
        throw new Error(result.detail ?? 'Recipe did not apply and did not resolve to an accepted no-op.');
      }
      appliedActions.push(result);
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
        primaryError: receiptError('P14_TRANSFORM_FAILED', 'transform', messageOf(error)),
        discardError,
      });
    }
  }

  if (await cancelled(input.shouldCancel)) {
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
  let validation;
  try {
    validation = await adapter.validateCandidate(candidate, plan);
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
      primaryError: receiptError('P14_VALIDATION_FAILED', 'validate', `Validation crashed: ${messageOf(error)}`),
      discardError,
    });
  }

  const requiredChecksPass = validation.checks.filter((check) => check.required).every((check) => check.passed);
  if (!validation.passed || !requiredChecksPass) {
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
      primaryError: receiptError('P14_VALIDATION_FAILED', 'validate', 'Candidate failed one or more mandatory validators.'),
      discardError,
    });
    return { ...result, validation };
  }

  events.push(event(now, 'RESCORING'));
  let rescore;
  try {
    rescore = await adapter.rescoreCandidate(candidate, plan);
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
      primaryError: receiptError('P14_RESCORE_FAILED', 'rescore', messageOf(error)),
      discardError,
    });
    return { ...result, validation };
  }

  if (rescore.introducedBlockerOrHighCount > 0 || rescore.blockerCount < 0 || rescore.highRiskCount < 0) {
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
      primaryError: receiptError('P14_VALIDATION_FAILED', 'rescore', 'Preparation introduced a new HIGH/BLOCKER finding or produced invalid risk counts.'),
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

  if (await cancelled(input.shouldCancel)) {
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
    preRetainFingerprint = await adapter.fingerprintSource(plan.source.nodeId);
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
      primaryError: receiptError('P14_SOURCE_CHANGED_DURING_RUN', 'pre-finalize', `Unable to verify source immutability: ${messageOf(error)}`),
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
  let retention;
  try {
    retention = await adapter.retainCandidate(
      candidate,
      input.transactionId,
      input.preparedName?.trim() || 'Prepared Duplicate',
    );
    if (retention.transactionId !== input.transactionId
      || retention.sourceNodeId !== plan.source.nodeId
      || retention.retainedNodeId !== candidate.candidateNodeId) {
      throw new Error('Retention evidence does not match the transaction/source/candidate identity.');
    }
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
      primaryError: receiptError('P14_FINALIZE_FAILED', 'finalize', messageOf(error)),
      discardError,
    });
    return { ...result, validation, rescore };
  }

  let afterFingerprint: string;
  try {
    afterFingerprint = await adapter.fingerprintSource(plan.source.nodeId);
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
      primaryError: receiptError('P14_SOURCE_CHANGED_DURING_RUN', 'post-finalize', `Unable to prove source immutability after retention: ${messageOf(error)}`),
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
}
