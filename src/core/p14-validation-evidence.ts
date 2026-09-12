import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import type { P14ValidationCheck } from './p14-preparation-types';

export const P14_VALIDATION_EVIDENCE_VERSION = 1 as const;

export interface P14BoundedValidationEvidence {
  version: typeof P14_VALIDATION_EVIDENCE_VERSION;
  passed: boolean;
  /** Kept opaque here; profile semantics are validated by the dedicated coverage gate. */
  profileIdsRun: unknown[];
  checks: P14ValidationCheck[];
}

export interface P14ValidationEvidenceResult {
  valid: boolean;
  failures: string[];
  value: P14BoundedValidationEvidence | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function boundedIdentity(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength;
}

function boundedDetail(value: unknown): value is string {
  return typeof value === 'string'
    && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxDetailLength;
}

/**
 * Bounded shape/resource validation for adapter-provided validation evidence.
 *
 * This deliberately does not decide whether required checks passed or whether every active
 * validation profile ran. Those policy/coverage decisions remain separate transaction gates.
 */
export function validateP14ValidationEvidence(value: unknown): P14ValidationEvidenceResult {
  const failures: string[] = [];
  if (!isRecord(value)) {
    return { valid: false, failures: ['validation must be an object.'], value: null };
  }

  if (typeof value.passed !== 'boolean') failures.push('validation.passed must be boolean.');
  if (!Array.isArray(value.profileIdsRun)) {
    failures.push('validation.profileIdsRun must be an array.');
  } else if (value.profileIdsRun.length > DEFAULT_P14_INPUT_BOUNDS.maxActions) {
    failures.push(`validation.profileIdsRun exceeds bounded profile count ${DEFAULT_P14_INPUT_BOUNDS.maxActions}.`);
  }

  if (!Array.isArray(value.checks)) {
    failures.push('validation.checks must be an array.');
    return { valid: false, failures, value: null };
  }
  if (value.checks.length > DEFAULT_P14_INPUT_BOUNDS.maxActions) {
    failures.push(`validation.checks exceeds bounded check count ${DEFAULT_P14_INPUT_BOUNDS.maxActions}.`);
    return { valid: false, failures, value: null };
  }

  const checks: P14ValidationCheck[] = [];
  for (const [index, check] of value.checks.entries()) {
    const path = `validation.checks[${index}]`;
    if (!isRecord(check)) {
      failures.push(`${path} must be an object.`);
      continue;
    }
    if (!boundedIdentity(check.id)) {
      failures.push(`${path}.id is empty, non-string or oversized.`);
      continue;
    }
    if (typeof check.passed !== 'boolean' || typeof check.required !== 'boolean') {
      failures.push(`${path} must include boolean passed and required fields.`);
      continue;
    }
    if (check.detail !== undefined && !boundedDetail(check.detail)) {
      failures.push(`${path}.detail is non-string or oversized.`);
      continue;
    }
    checks.push({
      id: check.id,
      passed: check.passed,
      required: check.required,
      ...(check.detail !== undefined ? { detail: check.detail } : {}),
    });
  }

  if (failures.length > 0 || typeof value.passed !== 'boolean' || !Array.isArray(value.profileIdsRun)) {
    return { valid: false, failures, value: null };
  }

  return {
    valid: true,
    failures: [],
    value: {
      version: P14_VALIDATION_EVIDENCE_VERSION,
      passed: value.passed,
      profileIdsRun: value.profileIdsRun,
      checks,
    },
  };
}
