import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import { snapshotP14AdapterOutputRecord } from './p14-adapter-output-snapshot';
import type {
  P14CandidateHandle,
  P14PreparationAction,
  P14RecipeExecutionResult,
  P14RetentionEvidence,
} from './p14-preparation-types';

export interface P14AdapterEvidenceValidation<T> {
  valid: boolean;
  failures: string[];
  value: T | null;
}

export function isP14BoundedIdentity(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength;
}

function boundedDetail(value: unknown): value is string {
  return typeof value === 'string'
    && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxDetailLength;
}

export function validateP14CandidateHandleEvidence(
  value: unknown,
  expectedSourceNodeId?: string,
): P14AdapterEvidenceValidation<P14CandidateHandle> {
  const captured = snapshotP14AdapterOutputRecord(
    value,
    ['sourceNodeId', 'candidateNodeId'] as const,
    'P14 candidate handle',
  );
  if (!captured.valid || !captured.value) {
    return { valid: false, failures: captured.failures, value: null };
  }

  const failures: string[] = [];
  const sourceNodeId = captured.value.sourceNodeId;
  const candidateNodeId = captured.value.candidateNodeId;

  if (!isP14BoundedIdentity(sourceNodeId)) {
    failures.push('P14 candidate sourceNodeId is missing or oversized.');
  } else if (expectedSourceNodeId !== undefined && sourceNodeId !== expectedSourceNodeId) {
    failures.push('P14 candidate sourceNodeId does not match the approved source.');
  }

  if (!isP14BoundedIdentity(candidateNodeId)) {
    failures.push('P14 candidate candidateNodeId is missing or oversized.');
  } else if (isP14BoundedIdentity(sourceNodeId) && candidateNodeId === sourceNodeId) {
    failures.push('P14 candidate candidateNodeId must differ from sourceNodeId.');
  }

  if (failures.length > 0) return { valid: false, failures, value: null };
  return {
    valid: true,
    failures: [],
    value: {
      sourceNodeId: sourceNodeId as string,
      candidateNodeId: candidateNodeId as string,
    },
  };
}

export function validateP14RecipeExecutionResultEvidence(
  value: unknown,
  expectedAction?: P14PreparationAction,
): P14AdapterEvidenceValidation<P14RecipeExecutionResult> {
  const captured = snapshotP14AdapterOutputRecord(
    value,
    ['actionId', 'recipeId', 'applied', 'becameNoOp', 'detail'] as const,
    'P14 recipe execution result',
  );
  if (!captured.valid || !captured.value) {
    return { valid: false, failures: captured.failures, value: null };
  }

  const failures: string[] = [];
  const actionId = captured.value.actionId;
  const recipeId = captured.value.recipeId;
  const applied = captured.value.applied;
  const becameNoOp = captured.value.becameNoOp;
  const detail = captured.value.detail;

  if (!isP14BoundedIdentity(actionId)) {
    failures.push('P14 recipe result actionId is missing or oversized.');
  } else if (expectedAction && actionId !== expectedAction.actionId) {
    failures.push('P14 recipe result actionId does not match the planned action.');
  }

  if (!isP14BoundedIdentity(recipeId)) {
    failures.push('P14 recipe result recipeId is missing or oversized.');
  } else if (expectedAction && recipeId !== expectedAction.recipeId) {
    failures.push('P14 recipe result recipeId does not match the planned recipe.');
  }

  if (typeof applied !== 'boolean') {
    failures.push('P14 recipe result applied must be boolean.');
  }
  if (becameNoOp !== undefined && typeof becameNoOp !== 'boolean') {
    failures.push('P14 recipe result becameNoOp must be boolean when present.');
  }

  if (typeof applied === 'boolean'
    && (becameNoOp === undefined || typeof becameNoOp === 'boolean')) {
    const outcomeCount = (applied ? 1 : 0) + (becameNoOp === true ? 1 : 0);
    if (outcomeCount !== 1) {
      failures.push('P14 recipe result must be exactly one of applied or accepted idempotent no-op.');
    }
  }

  if (detail !== undefined && !boundedDetail(detail)) {
    failures.push('P14 recipe result detail must be a bounded string when present.');
  }

  if (failures.length > 0) return { valid: false, failures, value: null };
  return {
    valid: true,
    failures: [],
    value: {
      actionId: actionId as string,
      recipeId: recipeId as string,
      applied: applied as boolean,
      ...(becameNoOp === true ? { becameNoOp: true } : {}),
      ...(typeof detail === 'string' && detail.length > 0 ? { detail } : {}),
    },
  };
}

export interface P14ExpectedRetentionEvidence {
  transactionId: string;
  sourceNodeId: string;
  retainedNodeId: string;
  preparedName: string;
}

export function validateP14RetentionEvidence(
  value: unknown,
  expected?: P14ExpectedRetentionEvidence,
): P14AdapterEvidenceValidation<P14RetentionEvidence> {
  const captured = snapshotP14AdapterOutputRecord(
    value,
    ['transactionId', 'sourceNodeId', 'retainedNodeId', 'preparedName'] as const,
    'P14 retention evidence',
  );
  if (!captured.valid || !captured.value) {
    return { valid: false, failures: captured.failures, value: null };
  }

  const failures: string[] = [];
  const transactionId = captured.value.transactionId;
  const sourceNodeId = captured.value.sourceNodeId;
  const retainedNodeId = captured.value.retainedNodeId;
  const preparedName = captured.value.preparedName;

  const identities: Array<[keyof P14RetentionEvidence, unknown]> = [
    ['transactionId', transactionId],
    ['sourceNodeId', sourceNodeId],
    ['retainedNodeId', retainedNodeId],
    ['preparedName', preparedName],
  ];
  for (const [field, fieldValue] of identities) {
    if (!isP14BoundedIdentity(fieldValue)) {
      failures.push(`P14 retention ${field} is missing or oversized.`);
    }
  }

  if (expected) {
    if (transactionId !== expected.transactionId) failures.push('P14 retention transactionId does not match the current transaction.');
    if (sourceNodeId !== expected.sourceNodeId) failures.push('P14 retention sourceNodeId does not match the approved source.');
    if (retainedNodeId !== expected.retainedNodeId) failures.push('P14 retention retainedNodeId does not match the candidate.');
    if (preparedName !== expected.preparedName) failures.push('P14 retention preparedName does not match the requested prepared name.');
  }

  if (failures.length > 0) return { valid: false, failures, value: null };
  return {
    valid: true,
    failures: [],
    value: {
      transactionId: transactionId as string,
      sourceNodeId: sourceNodeId as string,
      retainedNodeId: retainedNodeId as string,
      preparedName: preparedName as string,
    },
  };
}
