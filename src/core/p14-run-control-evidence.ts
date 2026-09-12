import {
  DEFAULT_P14_INPUT_BOUNDS,
  type P14InputBoundsLimits,
} from './p14-input-bounds';

const INPUT_BOUND_KEYS = [
  'maxActions',
  'maxBlockers',
  'maxTargetsPerAction',
  'maxTotalTargetReferences',
  'maxPrerequisitesPerAction',
  'maxConflictsPerAction',
  'maxMutationFieldsPerAction',
  'maxBucketActionIds',
  'maxBlockerActionIds',
  'maxIdentityLength',
  'maxDetailLength',
] as const satisfies readonly (keyof P14InputBoundsLimits)[];

export interface P14RunControlSnapshot {
  transactionId: string;
  rawTransactionId: string;
  preparedName: string;
  rawPreparedName?: string;
  allowPreparedWithReview: boolean;
  inputBounds: Partial<P14InputBoundsLimits>;
}

export interface P14RunControlEvidenceAssessment {
  valid: boolean;
  failures: string[];
  safeTransactionId: string;
  value?: P14RunControlSnapshot;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function safeTransactionIdentity(value: unknown): string {
  if (typeof value !== 'string'
    || value.length === 0
    || value.length > DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength) {
    return 'p14-transaction-invalid';
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : 'p14-transaction-invalid';
}

/**
 * Snapshot caller-supplied P14 execution controls as runtime evidence before they can influence
 * policy, bounds, coordinator identity or adapter calls. Resource-size enforcement remains in the
 * existing bounded-input gate so valid-but-oversized strings keep the P14_INPUT_TOO_LARGE path.
 */
export function assessP14RunControlEvidence(input: {
  transactionId: unknown;
  preparedName?: unknown;
  allowPreparedWithReview?: unknown;
  inputBounds?: unknown;
}): P14RunControlEvidenceAssessment {
  const failures: string[] = [];
  const safeTransactionId = safeTransactionIdentity(input.transactionId);

  let transactionId = '';
  let rawTransactionId = '';
  if (typeof input.transactionId !== 'string') {
    failures.push('transactionId must be a string runtime value.');
  } else {
    rawTransactionId = input.transactionId;
    transactionId = input.transactionId.trim();
    if (transactionId.length === 0) {
      failures.push('transactionId must contain a non-whitespace identity.');
    }
  }

  let rawPreparedName: string | undefined;
  let preparedName = 'Prepared Duplicate';
  if (input.preparedName !== undefined) {
    if (typeof input.preparedName !== 'string') {
      failures.push('preparedName must be a string runtime value when supplied.');
    } else {
      rawPreparedName = input.preparedName;
      preparedName = input.preparedName.trim() || 'Prepared Duplicate';
    }
  }

  let allowPreparedWithReview = false;
  if (input.allowPreparedWithReview !== undefined) {
    if (typeof input.allowPreparedWithReview !== 'boolean') {
      failures.push('allowPreparedWithReview must be a boolean runtime value when supplied.');
    } else {
      allowPreparedWithReview = input.allowPreparedWithReview;
    }
  }

  const inputBounds: Partial<P14InputBoundsLimits> = {};
  if (input.inputBounds !== undefined) {
    if (typeof input.inputBounds !== 'object' || input.inputBounds === null || Array.isArray(input.inputBounds)) {
      failures.push('inputBounds must be an object runtime value when supplied.');
    } else {
      for (const key of INPUT_BOUND_KEYS) {
        let value: unknown;
        try {
          value = (input.inputBounds as Record<string, unknown>)[key];
        } catch {
          failures.push(`inputBounds.${key} could not be read safely.`);
          continue;
        }
        if (value === undefined) continue;
        if (!isPositiveInteger(value)) {
          failures.push(`inputBounds.${key} must be a positive integer when supplied.`);
          continue;
        }
        inputBounds[key] = value;
      }
    }
  }

  if (failures.length > 0) {
    return { valid: false, failures, safeTransactionId };
  }

  return {
    valid: true,
    failures,
    safeTransactionId,
    value: {
      transactionId,
      rawTransactionId,
      preparedName,
      ...(rawPreparedName !== undefined ? { rawPreparedName } : {}),
      allowPreparedWithReview,
      inputBounds,
    },
  };
}
