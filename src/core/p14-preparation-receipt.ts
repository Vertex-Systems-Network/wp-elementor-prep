import {
  P14_PREPARATION_ENGINE_VERSION,
  type P14PreparationReceiptV1,
  type P14PreparationStatus,
  type P14TransactionState,
} from './p14-preparation-types';

export interface P14ReceiptIntegrityResult {
  valid: boolean;
  failures: string[];
}

const STATUSES = new Set<P14PreparationStatus>([
  'PREPARED',
  'PREPARED_WITH_REVIEW',
  'NO_CHANGES_NEEDED',
  'REJECTED',
  'BLOCKED',
  'CLEANUP_REQUIRED',
  'CANCELLED',
]);

const TERMINAL_STATES = new Set<P14TransactionState>([
  'COMPLETE',
  'CANCELLED',
  'REJECTED',
  'BLOCKED',
  'SOURCE_STALE',
  'CLEANUP_REQUIRED',
]);

const EVENT_STATES = new Set<P14TransactionState>([
  'IDLE',
  'PREFLIGHT',
  'PLAN_READY',
  'AWAITING_CONFIRMATION',
  'CLONING',
  'TRANSFORMING',
  'VALIDATING',
  'RESCORING',
  'FINALIZING',
  'COMPLETE',
  'CANCELLED',
  'REJECTED',
  'BLOCKED',
  'SOURCE_STALE',
  'CLEANUP_REQUIRED',
]);

const ERROR_CODES = new Set([
  'P14_P13_REPORT_REQUIRED',
  'P14_P13_REPORT_STALE',
  'P14_NO_ELIGIBLE_RECIPES',
  'P14_RECIPE_VERSION_MISMATCH',
  'P14_RECIPE_PREREQUISITE_MISSING',
  'P14_RECIPE_CONFLICT',
  'P14_RECIPE_UNAUTHORIZED',
  'P14_CONFIRMATION_REQUIRED',
  'P14_CONFIRMATION_MISMATCH',
  'P14_TRANSACTION_CONFLICT',
  'P14_CLONE_FAILED',
  'P14_SOURCE_CHANGED_DURING_RUN',
  'P14_TRANSFORM_FAILED',
  'P14_VALIDATION_FAILED',
  'P14_RESCORE_FAILED',
  'P14_FINALIZE_FAILED',
  'P14_DISCARD_FAILED',
  'P14_CANCELLED',
  'P14_INPUT_TOO_LARGE',
  'P14_INTERNAL_INVARIANT_FAILED',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function finiteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function serializeP14PreparationReceiptJson(receipt: P14PreparationReceiptV1): string {
  return `${JSON.stringify(receipt, null, 2)}\n`;
}

export function validateP14PreparationReceipt(value: unknown): P14ReceiptIntegrityResult {
  const failures: string[] = [];
  if (!isRecord(value)) return { valid: false, failures: ['P14 receipt must be an object.'] };

  if (value.schemaVersion !== 1) failures.push('Unsupported P14 receipt schema version.');
  if (value.engineVersion !== P14_PREPARATION_ENGINE_VERSION) failures.push('Unsupported P14 receipt engine version.');
  if (value.acceptanceAuthority !== false) failures.push('P14 receipt must carry acceptanceAuthority=false.');
  if (value.targetCompatibilityClaim !== false) failures.push('P14 receipt must carry targetCompatibilityClaim=false.');
  if (!nonEmptyString(value.transactionId)) failures.push('transactionId is missing.');
  if (typeof value.status !== 'string' || !STATUSES.has(value.status as P14PreparationStatus)) failures.push('Receipt status is unsupported.');
  if (typeof value.terminalState !== 'string' || !TERMINAL_STATES.has(value.terminalState as P14TransactionState)) {
    failures.push('Receipt terminalState is unsupported.');
  }
  if (!nonEmptyString(value.p13RunId)) failures.push('p13RunId is missing.');
  if (!nonEmptyString(value.planDigest) || !String(value.planDigest).startsWith('p14-plan-')) failures.push('planDigest is missing or malformed.');
  if (!isRecord(value.source)
    || !nonEmptyString(value.source.nodeId)
    || !nonEmptyString(value.source.beforeFingerprint)
    || !nonEmptyString(value.source.afterFingerprint)) {
    failures.push('Receipt source fingerprint evidence is missing.');
  }
  if (!Array.isArray(value.appliedActions)) failures.push('appliedActions must be an array.');
  if (!Array.isArray(value.errors)) failures.push('errors must be an array.');
  if (!Array.isArray(value.events) || value.events.length === 0) failures.push('events must be a non-empty array.');

  if (Array.isArray(value.errors)) {
    for (const [index, error] of value.errors.entries()) {
      if (!isRecord(error)
        || typeof error.code !== 'string'
        || !ERROR_CODES.has(error.code)
        || !nonEmptyString(error.stage)
        || !nonEmptyString(error.detail)
        || (error.recovery !== undefined && typeof error.recovery !== 'string')) {
        failures.push(`errors[${index}] is malformed or uses an unsupported code.`);
      }
    }
  }

  if (Array.isArray(value.events) && value.events.length > 0) {
    for (const [index, item] of value.events.entries()) {
      if (!isRecord(item)
        || typeof item.state !== 'string'
        || !EVENT_STATES.has(item.state as P14TransactionState)
        || !nonEmptyString(item.at)
        || Number.isNaN(Date.parse(item.at))
        || (item.detail !== undefined && typeof item.detail !== 'string')) {
        failures.push(`events[${index}] is malformed.`);
      }
    }
    const first = value.events[0];
    const last = value.events[value.events.length - 1];
    if (!isRecord(first) || first.state !== 'IDLE') failures.push('Receipt event history must start at IDLE.');
    if (!isRecord(last) || last.state !== value.terminalState) failures.push('Receipt event history must end at terminalState.');
  }

  if (Array.isArray(value.appliedActions)) {
    const ids: string[] = [];
    for (const [index, action] of value.appliedActions.entries()) {
      if (!isRecord(action)
        || !nonEmptyString(action.actionId)
        || !nonEmptyString(action.recipeId)
        || typeof action.applied !== 'boolean') {
        failures.push(`appliedActions[${index}] is malformed.`);
        continue;
      }
      if (action.becameNoOp !== undefined && typeof action.becameNoOp !== 'boolean') {
        failures.push(`appliedActions[${index}].becameNoOp must be boolean when present.`);
      }
      const outcomeCount = (action.applied ? 1 : 0) + (action.becameNoOp === true ? 1 : 0);
      if (outcomeCount !== 1) {
        failures.push(`appliedActions[${index}] must be exactly one of applied or accepted idempotent no-op.`);
      }
      ids.push(action.actionId);
    }
    if (new Set(ids).size !== ids.length) failures.push('appliedActions contains duplicate action IDs.');
  }

  if (value.validation !== undefined) {
    if (!isRecord(value.validation) || typeof value.validation.passed !== 'boolean' || !Array.isArray(value.validation.checks)) {
      failures.push('validation is malformed.');
    } else {
      for (const [index, check] of value.validation.checks.entries()) {
        if (!isRecord(check)
          || !nonEmptyString(check.id)
          || typeof check.passed !== 'boolean'
          || typeof check.required !== 'boolean'
          || (check.detail !== undefined && typeof check.detail !== 'string')) {
          failures.push(`validation.checks[${index}] is malformed.`);
        }
      }
      if (value.validation.passed) {
        const failedRequired = value.validation.checks.some((check) => isRecord(check) && check.required === true && check.passed !== true);
        if (failedRequired) failures.push('validation.passed contradicts a failed required check.');
      }
    }
  }

  if (value.rescore !== undefined) {
    if (!isRecord(value.rescore)
      || !nonEmptyString(value.rescore.runId)
      || typeof value.rescore.status !== 'string'
      || !Number.isFinite(value.rescore.score)
      || !finiteNonNegative(value.rescore.blockerCount)
      || !finiteNonNegative(value.rescore.highRiskCount)
      || !finiteNonNegative(value.rescore.introducedBlockerOrHighCount)
      || typeof value.rescore.reviewRequired !== 'boolean') {
      failures.push('rescore is malformed.');
    }
  }

  const candidate = isRecord(value.candidate) ? value.candidate : null;
  if (value.candidate !== undefined && (!candidate || !nonEmptyString(candidate.nodeId) || typeof candidate.retained !== 'boolean')) {
    failures.push('candidate is malformed.');
  }
  const retention = isRecord(value.retention) ? value.retention : null;
  if (value.retention !== undefined) {
    if (!retention
      || !nonEmptyString(retention.transactionId)
      || !nonEmptyString(retention.sourceNodeId)
      || !nonEmptyString(retention.retainedNodeId)
      || !nonEmptyString(retention.preparedName)) {
      failures.push('retention is malformed.');
    } else {
      if (retention.transactionId !== value.transactionId) failures.push('Retention transactionId contradicts the receipt.');
      if (isRecord(value.source) && retention.sourceNodeId !== value.source.nodeId) failures.push('Retention sourceNodeId contradicts the receipt source.');
      if (candidate && retention.retainedNodeId !== candidate.nodeId) failures.push('Retention retainedNodeId contradicts the receipt candidate.');
    }
  }

  const status = value.status as P14PreparationStatus;
  const terminal = value.terminalState as P14TransactionState;
  const source = isRecord(value.source) ? value.source : null;
  const sourceProvenEqual = source
    && source.beforeFingerprint !== 'UNKNOWN'
    && source.afterFingerprint !== 'UNKNOWN'
    && source.beforeFingerprint === source.afterFingerprint;
  const errors = Array.isArray(value.errors) ? value.errors : [];

  if (status === 'PREPARED' || status === 'PREPARED_WITH_REVIEW') {
    if (terminal !== 'COMPLETE') failures.push(`${status} must terminate at COMPLETE.`);
    if (!candidate || candidate.retained !== true) failures.push(`${status} requires a retained candidate.`);
    if (!retention) failures.push(`${status} requires retention evidence.`);
    if (!isRecord(value.validation) || value.validation.passed !== true) failures.push(`${status} requires passing validation.`);
    if (!isRecord(value.rescore)) failures.push(`${status} requires a candidate re-score.`);
    else {
      if (value.rescore.introducedBlockerOrHighCount !== 0) failures.push(`${status} cannot introduce HIGH/BLOCKER findings.`);
      if (status === 'PREPARED' && value.rescore.reviewRequired !== false) failures.push('PREPARED contradicts reviewRequired=true.');
      if (status === 'PREPARED_WITH_REVIEW' && value.rescore.reviewRequired !== true) failures.push('PREPARED_WITH_REVIEW requires reviewRequired=true.');
    }
    if (!sourceProvenEqual) failures.push(`${status} requires proved source immutability.`);
    if (errors.length !== 0) failures.push(`${status} cannot carry terminal errors.`);
  }

  if (status === 'NO_CHANGES_NEEDED') {
    if (terminal !== 'COMPLETE') failures.push('NO_CHANGES_NEEDED must terminate at COMPLETE.');
    if (candidate || retention) failures.push('NO_CHANGES_NEEDED cannot carry candidate/retention evidence.');
    if (Array.isArray(value.appliedActions) && value.appliedActions.length > 0) failures.push('NO_CHANGES_NEEDED cannot carry applied actions.');
    if (!sourceProvenEqual) failures.push('NO_CHANGES_NEEDED requires proved source immutability.');
    if (errors.length !== 0) failures.push('NO_CHANGES_NEEDED cannot carry terminal errors.');
  }

  if (status === 'BLOCKED') {
    if (terminal !== 'BLOCKED' && terminal !== 'SOURCE_STALE') failures.push('BLOCKED must terminate at BLOCKED or SOURCE_STALE.');
    if (candidate?.retained === true || retention) failures.push('BLOCKED cannot carry retained candidate evidence.');
    if (errors.length === 0) failures.push('BLOCKED requires at least one error/reason.');
  }

  if (status === 'REJECTED') {
    if (terminal !== 'REJECTED' && terminal !== 'SOURCE_STALE') failures.push('REJECTED must terminate at REJECTED or SOURCE_STALE.');
    if (candidate?.retained === true) failures.push('REJECTED cannot mark its candidate retained.');
    if (errors.length === 0) failures.push('REJECTED requires at least one error/reason.');
  }

  if (status === 'CANCELLED') {
    if (terminal !== 'CANCELLED') failures.push('CANCELLED must terminate at CANCELLED.');
    if (candidate?.retained === true || retention) failures.push('CANCELLED cannot carry retained candidate evidence.');
    const hasCancellation = errors.some((error) => isRecord(error) && error.code === 'P14_CANCELLED');
    if (!hasCancellation) failures.push('CANCELLED requires P14_CANCELLED evidence.');
  }

  if (status === 'CLEANUP_REQUIRED') {
    if (terminal !== 'CLEANUP_REQUIRED') failures.push('CLEANUP_REQUIRED must terminate at CLEANUP_REQUIRED.');
    if (!candidate) failures.push('CLEANUP_REQUIRED must identify the candidate requiring recovery.');
    const hasDiscardFailure = errors.some((error) => isRecord(error) && error.code === 'P14_DISCARD_FAILED');
    if (!hasDiscardFailure) failures.push('CLEANUP_REQUIRED requires P14_DISCARD_FAILED evidence.');
  }

  return { valid: failures.length === 0, failures };
}
