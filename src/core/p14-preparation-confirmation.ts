import { DEFAULT_P14_INPUT_BOUNDS, assessP14PreparationInputBounds } from './p14-input-bounds';
import { validateP14PreparationPlan } from './p14-plan-integrity';
import type { P14PreparationPlanV1 } from './p14-preparation-types';

export const P14_PREPARATION_CONFIRMATION_SCHEMA_VERSION = 1 as const;

export interface P14PreparationConfirmationV1 {
  schemaVersion: typeof P14_PREPARATION_CONFIRMATION_SCHEMA_VERSION;
  /** Confirmation records reviewed intent only; it never authorizes production acceptance. */
  acceptanceAuthority: false;
  /** Confirmation does not make a target-specific compatibility claim. */
  targetCompatibilityClaim: false;
  confirmedAt: string;
  planDigest: string;
  p13RunId: string;
  source: {
    nodeId: string;
    fingerprint: string;
  };
  eligibleActionIds: string[];
}

export interface P14PreparationConfirmationValidation {
  valid: boolean;
  failures: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function boundedIdentity(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength;
}

const UTC_ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function validTimestamp(value: unknown): value is string {
  if (typeof value !== 'string'
    || value.length === 0
    || value.length > DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength
    || !UTC_ISO_TIMESTAMP.test(value)) {
    return false;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function sameStrings(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function buildP14PreparationConfirmation(
  plan: P14PreparationPlanV1,
  confirmedAt: string,
): P14PreparationConfirmationV1 {
  const bounds = assessP14PreparationInputBounds(plan);
  if (!bounds.allowed) {
    throw new Error('Cannot confirm a P14 preparation plan that exceeds bounded safety limits.');
  }
  const integrity = validateP14PreparationPlan(plan);
  if (!integrity.valid) {
    throw new Error(`Cannot confirm an invalid P14 preparation plan: ${integrity.failures.join(' | ')}`);
  }
  if (plan.status !== 'READY' || plan.eligibleActionIds.length === 0) {
    throw new Error('P14 preparation confirmation is only valid for READY plans with eligible mutating actions.');
  }
  if (!validTimestamp(confirmedAt)) {
    throw new Error('P14 preparation confirmation requires a valid bounded timestamp.');
  }
  return {
    schemaVersion: P14_PREPARATION_CONFIRMATION_SCHEMA_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    confirmedAt,
    planDigest: plan.planDigest,
    p13RunId: plan.p13RunId,
    source: {
      nodeId: plan.source.nodeId,
      fingerprint: plan.source.fingerprint,
    },
    eligibleActionIds: [...plan.eligibleActionIds],
  };
}

export function validateP14PreparationConfirmation(
  value: unknown,
  plan?: P14PreparationPlanV1,
): P14PreparationConfirmationValidation {
  const failures: string[] = [];
  if (!isRecord(value)) {
    return { valid: false, failures: ['P14 preparation confirmation must be an object.'] };
  }
  if (value.schemaVersion !== P14_PREPARATION_CONFIRMATION_SCHEMA_VERSION) {
    failures.push('Unsupported P14 preparation confirmation schema version.');
  }
  if (value.acceptanceAuthority !== false) {
    failures.push('P14 preparation confirmation must carry acceptanceAuthority=false.');
  }
  if (value.targetCompatibilityClaim !== false) {
    failures.push('P14 preparation confirmation must carry targetCompatibilityClaim=false.');
  }
  if (!validTimestamp(value.confirmedAt)) {
    failures.push('P14 preparation confirmation confirmedAt must be a valid bounded timestamp.');
  }
  if (!boundedIdentity(value.planDigest)) failures.push('P14 preparation confirmation planDigest is missing or oversized.');
  if (!boundedIdentity(value.p13RunId)) failures.push('P14 preparation confirmation p13RunId is missing or oversized.');
  if (!isRecord(value.source)
    || !boundedIdentity(value.source.nodeId)
    || !boundedIdentity(value.source.fingerprint)) {
    failures.push('P14 preparation confirmation source identity is incomplete or oversized.');
  }

  let actionIds: string[] | null = null;
  if (!Array.isArray(value.eligibleActionIds)) {
    failures.push('P14 preparation confirmation eligibleActionIds must be an array.');
  } else if (value.eligibleActionIds.length === 0) {
    failures.push('P14 preparation confirmation must contain at least one eligible action ID.');
  } else if (value.eligibleActionIds.length > DEFAULT_P14_INPUT_BOUNDS.maxBucketActionIds) {
    failures.push('P14 preparation confirmation eligibleActionIds exceeds the bounded action-ID limit.');
  } else if (value.eligibleActionIds.some((item) => !boundedIdentity(item))) {
    failures.push('P14 preparation confirmation eligibleActionIds contains an invalid or oversized ID.');
  } else {
    actionIds = value.eligibleActionIds as string[];
    if (new Set(actionIds).size !== actionIds.length) {
      failures.push('P14 preparation confirmation eligibleActionIds must not contain duplicates.');
    }
  }

  if (plan) {
    const planBounds = assessP14PreparationInputBounds(plan);
    if (!planBounds.allowed) {
      failures.push('P14 preparation confirmation cannot bind to a plan that exceeds bounded safety limits.');
    } else {
      const planIntegrity = validateP14PreparationPlan(plan);
      if (!planIntegrity.valid) {
        failures.push('P14 preparation confirmation cannot bind to an invalid plan.');
      } else if (plan.status !== 'READY' || plan.eligibleActionIds.length === 0) {
        failures.push('P14 preparation confirmation can bind only to a READY mutating plan.');
      } else {
        if (value.planDigest !== plan.planDigest) failures.push('P14 preparation confirmation planDigest does not match the reviewed plan.');
        if (value.p13RunId !== plan.p13RunId) failures.push('P14 preparation confirmation p13RunId does not match the reviewed plan.');
        if (!isRecord(value.source)
          || value.source.nodeId !== plan.source.nodeId
          || value.source.fingerprint !== plan.source.fingerprint) {
          failures.push('P14 preparation confirmation source identity does not match the reviewed plan.');
        }
        if (actionIds && !sameStrings(actionIds, plan.eligibleActionIds)) {
          failures.push('P14 preparation confirmation eligibleActionIds do not match the reviewed plan.');
        }
      }
    }
  }

  return { valid: failures.length === 0, failures };
}
