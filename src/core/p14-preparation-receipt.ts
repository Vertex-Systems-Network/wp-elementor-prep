import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import {
  isP14BoundedIdentity,
  validateP14RecipeExecutionResultEvidence,
  validateP14RetentionEvidence,
} from './p14-adapter-evidence';
import { snapshotP14AdapterOutputRecord } from './p14-adapter-output-snapshot';
import {
  assessP14ReceiptCollection,
  isP14BoundedReceiptDetail,
  isP14BoundedReceiptIdentity,
} from './p14-receipt-evidence';
import { validateP14RescoreEvidence } from './p14-rescore-evidence';
import { validateP14ValidationEvidence } from './p14-validation-evidence';
import {
  P14_UNKNOWN_SOURCE_FINGERPRINT,
  isP14ReceiptSourceFingerprintEvidence,
} from './p14-source-fingerprint-evidence';
import { isP14ReceiptEventTimestampEvidence } from './p14-timestamp-evidence';
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

const RECEIPT_FIELDS = [
  'schemaVersion',
  'engineVersion',
  'acceptanceAuthority',
  'targetCompatibilityClaim',
  'transactionId',
  'status',
  'terminalState',
  'source',
  'p13RunId',
  'planDigest',
  'appliedActions',
  'errors',
  'events',
  'validation',
  'rescore',
  'candidate',
  'retention',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  try {
    return !Array.isArray(value);
  } catch {
    return false;
  }
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function boundedReceiptCollection(
  value: unknown,
  label: string,
  failures: string[],
  requireNonEmpty = false,
): unknown[] | null {
  const assessment = assessP14ReceiptCollection(value);
  if (assessment.failure === 'NOT_ARRAY') {
    failures.push(`${label} must be an array.`);
    return null;
  }
  if (assessment.failure === 'TOO_LARGE') {
    failures.push(`${label} exceeds the bounded receipt collection limit (${assessment.actualLength} > ${assessment.limit}).`);
    return null;
  }
  if (assessment.failure === 'UNREADABLE') {
    failures.push(`${label} could not be read safely.`);
    return null;
  }
  if (!assessment.value) return null;
  if (requireNonEmpty && assessment.value.length === 0) {
    failures.push(`${label} must be a non-empty array.`);
  }
  return assessment.value;
}

export function serializeP14PreparationReceiptJson(receipt: P14PreparationReceiptV1): string {
  return `${JSON.stringify(receipt, null, 2)}\n`;
}

export function validateP14PreparationReceipt(value: unknown): P14ReceiptIntegrityResult {
  const receiptSnapshot = snapshotP14AdapterOutputRecord(value, RECEIPT_FIELDS, 'P14 receipt');
  if (!receiptSnapshot.valid || !receiptSnapshot.value) {
    return { valid: false, failures: receiptSnapshot.failures };
  }

  const receipt = receiptSnapshot.value;
  const failures: string[] = [];

  if (receipt.schemaVersion !== 1) failures.push('Unsupported P14 receipt schema version.');
  if (receipt.engineVersion !== P14_PREPARATION_ENGINE_VERSION) failures.push('Unsupported P14 receipt engine version.');
  if (receipt.acceptanceAuthority !== false) failures.push('P14 receipt must carry acceptanceAuthority=false.');
  if (receipt.targetCompatibilityClaim !== false) failures.push('P14 receipt must carry targetCompatibilityClaim=false.');
  if (!isP14BoundedReceiptIdentity(receipt.transactionId)) failures.push('transactionId is missing or oversized.');
  if (typeof receipt.status !== 'string' || !STATUSES.has(receipt.status as P14PreparationStatus)) failures.push('Receipt status is unsupported.');
  if (typeof receipt.terminalState !== 'string' || !TERMINAL_STATES.has(receipt.terminalState as P14TransactionState)) {
    failures.push('Receipt terminalState is unsupported.');
  }
  if (!isP14BoundedReceiptIdentity(receipt.p13RunId)) failures.push('p13RunId is missing or oversized.');
  if (!isP14BoundedReceiptIdentity(receipt.planDigest) || !receipt.planDigest.startsWith('p14-plan-')) {
    failures.push('planDigest is missing, malformed or oversized.');
  }

  const sourceSnapshot = snapshotP14AdapterOutputRecord(
    receipt.source,
    ['nodeId', 'beforeFingerprint', 'afterFingerprint'] as const,
    'Receipt source fingerprint evidence',
  );
  const source = sourceSnapshot.valid && sourceSnapshot.value ? sourceSnapshot.value : null;
  if (!source
    || !isP14BoundedReceiptIdentity(source.nodeId)
    || !isP14ReceiptSourceFingerprintEvidence(source.beforeFingerprint)
    || !isP14ReceiptSourceFingerprintEvidence(source.afterFingerprint)) {
    failures.push('Receipt source fingerprint evidence is missing, malformed or oversized.');
  }

  const appliedActions = boundedReceiptCollection(receipt.appliedActions, 'appliedActions', failures);
  const errors = boundedReceiptCollection(receipt.errors, 'errors', failures);
  const events = boundedReceiptCollection(receipt.events, 'events', failures, true);

  if (errors) {
    for (const [index, error] of errors.entries()) {
      const captured = snapshotP14AdapterOutputRecord(
        error,
        ['code', 'stage', 'detail', 'recovery'] as const,
        `errors[${index}]`,
      );
      if (!captured.valid || !captured.value) {
        errors[index] = null;
        failures.push(`errors[${index}] is malformed, oversized or uses an unsupported code.`);
        continue;
      }
      errors[index] = captured.value;
      const boundedError = captured.value;
      if (typeof boundedError.code !== 'string'
        || !ERROR_CODES.has(boundedError.code)
        || !isP14BoundedReceiptIdentity(boundedError.stage)
        || !isP14BoundedReceiptDetail(boundedError.detail, true)
        || (boundedError.recovery !== undefined && !isP14BoundedReceiptDetail(boundedError.recovery))) {
        failures.push(`errors[${index}] is malformed, oversized or uses an unsupported code.`);
      }
    }
  }

  if (events && events.length > 0) {
    for (const [index, item] of events.entries()) {
      const captured = snapshotP14AdapterOutputRecord(
        item,
        ['state', 'at', 'detail'] as const,
        `events[${index}]`,
      );
      if (!captured.valid || !captured.value) {
        events[index] = null;
        failures.push(`events[${index}] is malformed or oversized.`);
        continue;
      }
      events[index] = captured.value;
      const boundedEvent = captured.value;
      if (typeof boundedEvent.state !== 'string'
        || !EVENT_STATES.has(boundedEvent.state as P14TransactionState)
        || !isP14ReceiptEventTimestampEvidence(boundedEvent.at)
        || (boundedEvent.detail !== undefined && !isP14BoundedReceiptDetail(boundedEvent.detail))) {
        failures.push(`events[${index}] is malformed or oversized.`);
      }
    }
    const first = events[0];
    const last = events[events.length - 1];
    if (!isRecord(first) || first.state !== 'IDLE') failures.push('Receipt event history must start at IDLE.');
    if (!isRecord(last) || last.state !== receipt.terminalState) failures.push('Receipt event history must end at terminalState.');
  }

  if (appliedActions) {
    const ids: string[] = [];
    for (const [index, action] of appliedActions.entries()) {
      const evidence = validateP14RecipeExecutionResultEvidence(action);
      if (!evidence.valid || !evidence.value) {
        failures.push(`appliedActions[${index}] is malformed or oversized.`);
        continue;
      }
      ids.push(evidence.value.actionId);
    }
    if (new Set(ids).size !== ids.length) failures.push('appliedActions contains duplicate action IDs.');
  }

  let validation = null;
  if (receipt.validation !== undefined) {
    const validationEvidence = validateP14ValidationEvidence(receipt.validation);
    if (!validationEvidence.valid || !validationEvidence.value) {
      failures.push(...validationEvidence.failures);
    } else {
      validation = validationEvidence.value;
      if (validation.profileIdsRun.length > DEFAULT_P14_INPUT_BOUNDS.maxActions) {
        failures.push('validation.profileIdsRun exceeds the bounded profile count.');
      } else {
        const profileIds = validation.profileIdsRun;
        if (profileIds.some((profileId) => !nonEmptyString(profileId)
          || String(profileId).length > DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength)) {
          failures.push('validation.profileIdsRun contains an invalid or oversized profile ID.');
        }
        if (new Set(profileIds).size !== profileIds.length) {
          failures.push('validation.profileIdsRun contains duplicate profile IDs.');
        }
      }
      if (validation.passed) {
        const failedRequired = validation.checks.some((check) => check.required && !check.passed);
        if (failedRequired) failures.push('validation.passed contradicts a failed required check.');
      }
    }
  }

  let rescore = null;
  if (receipt.rescore !== undefined) {
    const rescoreIntegrity = validateP14RescoreEvidence(receipt.rescore);
    if (!rescoreIntegrity.valid || !rescoreIntegrity.value) {
      failures.push('rescore is malformed or outside the accepted scored P13 evidence domain.');
    } else {
      rescore = rescoreIntegrity.value;
    }
  }

  let candidate = null;
  if (receipt.candidate !== undefined) {
    const candidateSnapshot = snapshotP14AdapterOutputRecord(
      receipt.candidate,
      ['nodeId', 'retained'] as const,
      'candidate',
    );
    if (!candidateSnapshot.valid || !candidateSnapshot.value
      || !isP14BoundedIdentity(candidateSnapshot.value.nodeId)
      || typeof candidateSnapshot.value.retained !== 'boolean') {
      failures.push('candidate is malformed or oversized.');
    } else {
      candidate = candidateSnapshot.value;
    }
  }

  const retentionValidation = receipt.retention === undefined
    ? null
    : validateP14RetentionEvidence(receipt.retention);
  const retention = retentionValidation?.valid && retentionValidation.value
    ? retentionValidation.value
    : null;
  if (receipt.retention !== undefined) {
    if (!retention) {
      failures.push('retention is malformed or oversized.');
    } else {
      if (retention.transactionId !== receipt.transactionId) failures.push('Retention transactionId contradicts the receipt.');
      if (source && retention.sourceNodeId !== source.nodeId) failures.push('Retention sourceNodeId contradicts the receipt source.');
      if (candidate && retention.retainedNodeId !== candidate.nodeId) failures.push('Retention retainedNodeId contradicts the receipt candidate.');
    }
  }

  const status = receipt.status as P14PreparationStatus;
  const terminal = receipt.terminalState as P14TransactionState;
  const sourceProvenEqual = source
    && source.beforeFingerprint !== P14_UNKNOWN_SOURCE_FINGERPRINT
    && source.afterFingerprint !== P14_UNKNOWN_SOURCE_FINGERPRINT
    && source.beforeFingerprint === source.afterFingerprint;
  const boundedErrors = errors ?? [];

  if (status === 'PREPARED' || status === 'PREPARED_WITH_REVIEW') {
    if (terminal !== 'COMPLETE') failures.push(`${status} must terminate at COMPLETE.`);
    if (!candidate || candidate.retained !== true) failures.push(`${status} requires a retained candidate.`);
    if (!retention) failures.push(`${status} requires retention evidence.`);
    if (!validation || validation.passed !== true) failures.push(`${status} requires passing validation.`);
    else if (validation.profileIdsRun.length === 0) {
      failures.push(`${status} requires validation-profile execution evidence.`);
    }
    if (!rescore) failures.push(`${status} requires a candidate re-score.`);
    else {
      if (rescore.introducedBlockerOrHighCount !== 0) failures.push(`${status} cannot introduce HIGH/BLOCKER findings.`);
      if (status === 'PREPARED' && rescore.reviewRequired !== false) failures.push('PREPARED contradicts reviewRequired=true.');
      if (status === 'PREPARED_WITH_REVIEW' && rescore.reviewRequired !== true) failures.push('PREPARED_WITH_REVIEW requires reviewRequired=true.');
    }
    if (!sourceProvenEqual) failures.push(`${status} requires proved source immutability.`);
    if (boundedErrors.length !== 0) failures.push(`${status} cannot carry terminal errors.`);
  }

  if (status === 'NO_CHANGES_NEEDED') {
    if (terminal !== 'COMPLETE') failures.push('NO_CHANGES_NEEDED must terminate at COMPLETE.');
    if (candidate || retention) failures.push('NO_CHANGES_NEEDED cannot carry candidate/retention evidence.');
    if (appliedActions && appliedActions.length > 0) failures.push('NO_CHANGES_NEEDED cannot carry applied actions.');
    if (!sourceProvenEqual) failures.push('NO_CHANGES_NEEDED requires proved source immutability.');
    if (boundedErrors.length !== 0) failures.push('NO_CHANGES_NEEDED cannot carry terminal errors.');
  }

  if (status === 'BLOCKED') {
    if (terminal !== 'BLOCKED' && terminal !== 'SOURCE_STALE') failures.push('BLOCKED must terminate at BLOCKED or SOURCE_STALE.');
    if (candidate?.retained === true || retention) failures.push('BLOCKED cannot carry retained candidate evidence.');
    if (boundedErrors.length === 0) failures.push('BLOCKED requires at least one error/reason.');
  }

  if (status === 'REJECTED') {
    if (terminal !== 'REJECTED' && terminal !== 'SOURCE_STALE') failures.push('REJECTED must terminate at REJECTED or SOURCE_STALE.');
    if (candidate?.retained === true) failures.push('REJECTED cannot mark its candidate retained.');
    if (boundedErrors.length === 0) failures.push('REJECTED requires at least one error/reason.');
  }

  if (status === 'CANCELLED') {
    if (terminal !== 'CANCELLED') failures.push('CANCELLED must terminate at CANCELLED.');
    if (candidate?.retained === true || retention) failures.push('CANCELLED cannot carry retained candidate evidence.');
    const hasCancellation = boundedErrors.some((error) => isRecord(error) && error.code === 'P14_CANCELLED');
    if (!hasCancellation) failures.push('CANCELLED requires P14_CANCELLED evidence.');
  }

  if (status === 'CLEANUP_REQUIRED') {
    if (terminal !== 'CLEANUP_REQUIRED') failures.push('CLEANUP_REQUIRED must terminate at CLEANUP_REQUIRED.');
    const hasDiscardFailure = boundedErrors.some((error) => isRecord(error) && error.code === 'P14_DISCARD_FAILED');
    const hasCoordinatorReleaseFailure = boundedErrors.some((error) => isRecord(error)
      && error.code === 'P14_INTERNAL_INVARIANT_FAILED'
      && error.stage === 'coordination-release');
    if (!candidate && !hasCoordinatorReleaseFailure) {
      failures.push('CLEANUP_REQUIRED must identify the candidate unless source-coordinator lease recovery is required.');
    }
    if (!hasDiscardFailure && !hasCoordinatorReleaseFailure) {
      failures.push('CLEANUP_REQUIRED requires candidate-discard or coordinator-release failure evidence.');
    }
  }

  return { valid: failures.length === 0, failures };
}
