import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';

export const P14_RECEIPT_COLLECTION_LIMIT = DEFAULT_P14_INPUT_BOUNDS.maxActions;

export type P14ReceiptCollectionFailure = 'NOT_ARRAY' | 'TOO_LARGE' | 'UNREADABLE';

export interface P14ReceiptCollectionAssessment {
  value: unknown[] | null;
  failure: P14ReceiptCollectionFailure | null;
  actualLength: number | null;
  limit: number;
}

export function assessP14ReceiptCollection(value: unknown): P14ReceiptCollectionAssessment {
  let isArray: boolean;
  try {
    isArray = Array.isArray(value);
  } catch {
    return {
      value: null,
      failure: 'UNREADABLE',
      actualLength: null,
      limit: P14_RECEIPT_COLLECTION_LIMIT,
    };
  }

  if (!isArray) {
    return {
      value: null,
      failure: 'NOT_ARRAY',
      actualLength: null,
      limit: P14_RECEIPT_COLLECTION_LIMIT,
    };
  }

  const arrayValue = value as unknown[];
  let actualLength: number;
  try {
    actualLength = arrayValue.length;
  } catch {
    return {
      value: null,
      failure: 'UNREADABLE',
      actualLength: null,
      limit: P14_RECEIPT_COLLECTION_LIMIT,
    };
  }

  if (!Number.isSafeInteger(actualLength) || actualLength < 0) {
    return {
      value: null,
      failure: 'UNREADABLE',
      actualLength: null,
      limit: P14_RECEIPT_COLLECTION_LIMIT,
    };
  }

  if (actualLength > P14_RECEIPT_COLLECTION_LIMIT) {
    return {
      value: null,
      failure: 'TOO_LARGE',
      actualLength,
      limit: P14_RECEIPT_COLLECTION_LIMIT,
    };
  }

  const snapshot: unknown[] = [];
  for (let index = 0; index < actualLength; index += 1) {
    try {
      snapshot.push(arrayValue[index]);
    } catch {
      return {
        value: null,
        failure: 'UNREADABLE',
        actualLength,
        limit: P14_RECEIPT_COLLECTION_LIMIT,
      };
    }
  }

  return {
    value: snapshot,
    failure: null,
    actualLength,
    limit: P14_RECEIPT_COLLECTION_LIMIT,
  };
}

export function isP14BoundedReceiptIdentity(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength;
}

export function isP14BoundedReceiptDetail(value: unknown, requireNonEmpty = false): value is string {
  return typeof value === 'string'
    && (!requireNonEmpty || value.length > 0)
    && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxDetailLength;
}

export function boundP14ReceiptIdentity(value: string, fallback: string): string {
  const candidate = value.length > 0 ? value : fallback;
  return candidate.length <= DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength
    ? candidate
    : candidate.slice(0, DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength);
}

export function boundP14ReceiptDetail(
  value: string,
  fallback = 'P14 diagnostic detail unavailable.',
): string {
  const candidate = value.length > 0 ? value : fallback;
  return candidate.length <= DEFAULT_P14_INPUT_BOUNDS.maxDetailLength
    ? candidate
    : candidate.slice(0, DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);
}

export function safeP14RuntimeErrorMessage(
  error: unknown,
  fallback = 'Unknown P14 runtime failure.',
): string {
  let rendered = fallback;
  try {
    if (typeof error === 'string') {
      rendered = error.length > 0 ? error : fallback;
    } else if (error instanceof Error && typeof error.message === 'string') {
      rendered = error.message.length > 0 ? error.message : fallback;
    } else {
      const value = String(error);
      rendered = value.length > 0 ? value : fallback;
    }
  } catch {
    rendered = fallback;
  }
  return boundP14ReceiptDetail(rendered, fallback);
}
