import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
  const failures: string[] = [];
  if (!isRecord(value)) {
    return { valid: false, failures: ['P14 candidate handle must be an object.'], value: null };
  }

  if (!isP14BoundedIdentity(value.sourceNodeId)) {
    failures.push('P14 candidate sourceNodeId is missing or oversized.');
  } else if (expectedSourceNodeId !== undefined && value.sourceNodeId !== expectedSourceNodeId) {
    failures.push('P14 candidate sourceNodeId does not match the approved source.');
  }

  if (!isP14BoundedIdentity(value.candidateNodeId)) {
    failures.push('P14 candidate candidateNodeId is missing or oversized.');
  } else if (isP14BoundedIdentity(value.sourceNodeId) && value.candidateNodeId === value.sourceNodeId) {
    failures.push('P14 candidate candidateNodeId must differ from sourceNodeId.');
  }

  if (failures.length > 0) return { valid: false, failures, value: null };
  return {
    valid: true,
    failures: [],
    value: {
      sourceNodeId: value.sourceNodeId as string,
      candidateNodeId: value.candidateNodeId as string,
    },
  };
}

export function validateP14RecipeExecutionResultEvidence(
  value: unknown,
  expectedAction?: P14PreparationAction,
): P14AdapterEvidenceValidation<P14RecipeExecutionResult> {
  const failures: string[] = [];
  if (!isRecord(value)) {
    return { valid: false, failures: ['P14 recipe execution result must be an object.'], value: null };
  }

  if (!isP14BoundedIdentity(value.actionId)) {
    failures.push('P14 recipe result actionId is missing or oversized.');
  } else if (expectedAction && value.actionId !== expectedAction.actionId) {
    failures.push('P14 recipe result actionId does not match the planned action.');
  }

  if (!isP14BoundedIdentity(value.recipeId)) {
    failures.push('P14 recipe result recipeId is missing or oversized.');
  } else if (expectedAction && value.recipeId !== expectedAction.recipeId) {
    failures.push('P14 recipe result recipeId does not match the planned recipe.');
  }

  if (typeof value.applied !== 'boolean') {
    failures.push('P14 recipe result applied must be boolean.');
  }
  if (value.becameNoOp !== undefined && typeof value.becameNoOp !== 'boolean') {
    failures.push('P14 recipe result becameNoOp must be boolean when present.');
  }

  if (typeof value.applied === 'boolean'
    && (value.becameNoOp === undefined || typeof value.becameNoOp === 'boolean')) {
    const outcomeCount = (value.applied ? 1 : 0) + (value.becameNoOp === true ? 1 : 0);
    if (outcomeCount !== 1) {
      failures.push('P14 recipe result must be exactly one of applied or accepted idempotent no-op.');
    }
  }

  if (value.detail !== undefined && !boundedDetail(value.detail)) {
    failures.push('P14 recipe result detail must be a bounded string when present.');
  }

  if (failures.length > 0) return { valid: false, failures, value: null };
  return {
    valid: true,
    failures: [],
    value: {
      actionId: value.actionId as string,
      recipeId: value.recipeId as string,
      applied: value.applied as boolean,
      ...(value.becameNoOp === true ? { becameNoOp: true } : {}),
      ...(typeof value.detail === 'string' && value.detail.length > 0 ? { detail: value.detail } : {}),
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
  const failures: string[] = [];
  if (!isRecord(value)) {
    return { valid: false, failures: ['P14 retention evidence must be an object.'], value: null };
  }

  const identities: Array<[keyof P14RetentionEvidence, unknown]> = [
    ['transactionId', value.transactionId],
    ['sourceNodeId', value.sourceNodeId],
    ['retainedNodeId', value.retainedNodeId],
    ['preparedName', value.preparedName],
  ];
  for (const [field, fieldValue] of identities) {
    if (!isP14BoundedIdentity(fieldValue)) {
      failures.push(`P14 retention ${field} is missing or oversized.`);
    }
  }

  if (expected) {
    if (value.transactionId !== expected.transactionId) failures.push('P14 retention transactionId does not match the current transaction.');
    if (value.sourceNodeId !== expected.sourceNodeId) failures.push('P14 retention sourceNodeId does not match the approved source.');
    if (value.retainedNodeId !== expected.retainedNodeId) failures.push('P14 retention retainedNodeId does not match the candidate.');
    if (value.preparedName !== expected.preparedName) failures.push('P14 retention preparedName does not match the requested prepared name.');
  }

  if (failures.length > 0) return { valid: false, failures, value: null };
  return {
    valid: true,
    failures: [],
    value: {
      transactionId: value.transactionId as string,
      sourceNodeId: value.sourceNodeId as string,
      retainedNodeId: value.retainedNodeId as string,
      preparedName: value.preparedName as string,
    },
  };
}
