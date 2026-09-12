import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import {
  snapshotP14AdapterOutputArray,
  snapshotP14AdapterOutputRecord,
} from './p14-adapter-output-snapshot';
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

/**
 * Bounded shape/resource validation for adapter-provided validation evidence.
 *
 * This deliberately does not decide whether required checks passed or whether every active
 * validation profile ran. Those policy/coverage decisions remain separate transaction gates.
 */
export function validateP14ValidationEvidence(value: unknown): P14ValidationEvidenceResult {
  const captured = snapshotP14AdapterOutputRecord(
    value,
    ['passed', 'profileIdsRun', 'checks'] as const,
    'validation',
  );
  if (!captured.valid || !captured.value) {
    return { valid: false, failures: captured.failures, value: null };
  }

  const failures: string[] = [];
  const passed = captured.value.passed;
  if (typeof passed !== 'boolean') failures.push('validation.passed must be boolean.');

  const profileIdsSnapshot = snapshotP14AdapterOutputArray(
    captured.value.profileIdsRun,
    DEFAULT_P14_INPUT_BOUNDS.maxActions,
    'validation.profileIdsRun',
    'profile count',
  );
  if (!profileIdsSnapshot.valid || !profileIdsSnapshot.value) {
    failures.push(...profileIdsSnapshot.failures);
  }

  const checksSnapshot = snapshotP14AdapterOutputArray(
    captured.value.checks,
    DEFAULT_P14_INPUT_BOUNDS.maxActions,
    'validation.checks',
    'check count',
  );
  if (!checksSnapshot.valid || !checksSnapshot.value) {
    failures.push(...checksSnapshot.failures);
    return { valid: false, failures, value: null };
  }

  const checks: P14ValidationCheck[] = [];
  for (const [index, check] of checksSnapshot.value.entries()) {
    const path = `validation.checks[${index}]`;
    const checkSnapshot = snapshotP14AdapterOutputRecord(
      check,
      ['id', 'passed', 'required', 'detail'] as const,
      path,
    );
    if (!checkSnapshot.valid || !checkSnapshot.value) {
      failures.push(...checkSnapshot.failures);
      continue;
    }

    const id = checkSnapshot.value.id;
    const checkPassed = checkSnapshot.value.passed;
    const required = checkSnapshot.value.required;
    const detail = checkSnapshot.value.detail;

    if (typeof id !== 'string') {
      failures.push(`${path}.id must be a string.`);
      continue;
    }
    if (id.length === 0) {
      failures.push(`${path}.id must not be empty.`);
      continue;
    }
    if (id.length > DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength) {
      failures.push(`${path} has oversized id evidence (max ${DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength}).`);
      continue;
    }
    if (typeof checkPassed !== 'boolean' || typeof required !== 'boolean') {
      failures.push(`${path} must include boolean passed and required fields.`);
      continue;
    }
    if (detail !== undefined) {
      if (typeof detail !== 'string') {
        failures.push(`${path}.detail must be a string when present.`);
        continue;
      }
      if (detail.length > DEFAULT_P14_INPUT_BOUNDS.maxDetailLength) {
        failures.push(`${path} has oversized detail evidence (max ${DEFAULT_P14_INPUT_BOUNDS.maxDetailLength}).`);
        continue;
      }
    }
    checks.push({
      id,
      passed: checkPassed,
      required,
      ...(detail !== undefined ? { detail } : {}),
    });
  }

  const profileIdsRun = profileIdsSnapshot.value;
  if (failures.length > 0 || typeof passed !== 'boolean' || !profileIdsRun) {
    return { valid: false, failures, value: null };
  }

  return {
    valid: true,
    failures: [],
    value: {
      version: P14_VALIDATION_EVIDENCE_VERSION,
      passed,
      profileIdsRun: [...profileIdsRun],
      checks,
    },
  };
}
