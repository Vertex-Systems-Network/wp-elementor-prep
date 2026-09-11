import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';

export const P14_UNKNOWN_SOURCE_FINGERPRINT = 'UNKNOWN' as const;

export interface P14SourceFingerprintEvidenceValidation {
  valid: boolean;
  failures: string[];
  value: string | null;
}

export function validateP14SourceFingerprintEvidence(
  value: unknown,
): P14SourceFingerprintEvidenceValidation {
  const failures: string[] = [];
  if (typeof value !== 'string'
    || value.trim().length === 0
    || value.length > DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength) {
    failures.push('P14 runtime source fingerprint must be a non-empty bounded string.');
  } else if (value === P14_UNKNOWN_SOURCE_FINGERPRINT) {
    failures.push('P14 runtime source fingerprint cannot use the receipt-only UNKNOWN sentinel.');
  }

  if (failures.length > 0) return { valid: false, failures, value: null };
  return { valid: true, failures: [], value: value as string };
}

export function isP14ReceiptSourceFingerprintEvidence(value: unknown): value is string {
  return value === P14_UNKNOWN_SOURCE_FINGERPRINT
    || validateP14SourceFingerprintEvidence(value).valid;
}
