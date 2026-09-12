import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';

export const P14_UNKNOWN_EVENT_TIMESTAMP = 'UNKNOWN' as const;

const P14_UTC_ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/**
 * Accept only the normalized UTC millisecond form already used by P14 confirmation evidence.
 * The length bound is checked before Date.parse so oversized hostile strings are never parsed.
 */
export function isP14NormalizedUtcTimestamp(value: unknown): value is string {
  if (typeof value !== 'string'
    || value.length === 0
    || value.length > DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength
    || !P14_UTC_ISO_TIMESTAMP.test(value)) {
    return false;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

/**
 * Receipt events may explicitly state that their runtime wall-clock time was unavailable.
 * UNKNOWN is evidence of absence, not a fabricated timestamp.
 */
export function isP14ReceiptEventTimestampEvidence(value: unknown): value is string {
  return value === P14_UNKNOWN_EVENT_TIMESTAMP || isP14NormalizedUtcTimestamp(value);
}

/**
 * Runtime clock callbacks are untrusted evidence providers. They cannot escape the transaction.
 */
export function readP14RuntimeEventTimestamp(now: () => unknown): string {
  try {
    const value = now();
    return isP14NormalizedUtcTimestamp(value) ? value : P14_UNKNOWN_EVENT_TIMESTAMP;
  } catch {
    return P14_UNKNOWN_EVENT_TIMESTAMP;
  }
}
