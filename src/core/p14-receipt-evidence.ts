import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import { isP14BoundedIdentity } from './p14-adapter-evidence';

export const P14_RECEIPT_EVIDENCE_VERSION = 1 as const;
export const P14_MAX_RECEIPT_COLLECTION_ITEMS = DEFAULT_P14_INPUT_BOUNDS.maxActions;

export function isP14BoundedReceiptIdentity(value: unknown): value is string {
  return isP14BoundedIdentity(value);
}

export function isP14BoundedDiagnosticDetail(value: unknown): value is string {
  return typeof value === 'string'
    && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxDetailLength;
}

export function isP14BoundedNonEmptyDiagnosticDetail(value: unknown): value is string {
  return isP14BoundedDiagnosticDetail(value) && value.length > 0;
}

export function boundedP14DiagnosticDetail(value: string, fallback = 'P14 diagnostic unavailable.'): string {
  const source = value.length > 0 ? value : fallback;
  return source.slice(0, DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);
}

export function boundedP14DiagnosticIdentity(value: string, fallback: string): string {
  const source = value.length > 0 ? value : fallback;
  return source.slice(0, DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength);
}

/** Convert arbitrary thrown runtime evidence into bounded receipt-safe text. */
export function boundedP14RuntimeErrorMessage(error: unknown): string {
  let message = '';
  try {
    if (error instanceof Error) {
      message = typeof error.message === 'string' ? error.message : '';
    } else if (typeof error === 'string') {
      message = error;
    } else {
      message = String(error);
    }
  } catch {
    message = 'Unprintable runtime error.';
  }
  return boundedP14DiagnosticDetail(message, 'Unknown runtime error.');
}

export function hasBoundedP14ReceiptCollectionLength(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length <= P14_MAX_RECEIPT_COLLECTION_ITEMS;
}
