import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import {
  snapshotP14AdapterOutputArray,
  snapshotP14AdapterOutputRecord,
} from './p14-adapter-output-snapshot';
import type { P14PreparationAction } from './p14-preparation-types';

export interface P14RuntimeActionEligibilityEvidenceV1 {
  actionId: string;
  recipeId: string;
  checkedPrerequisiteRecipeIds: string[];
  eligible: boolean;
  detail?: string;
}

export interface P14RuntimeActionEligibilityValidation {
  valid: boolean;
  failures: string[];
  value: P14RuntimeActionEligibilityEvidenceV1 | null;
}

function boundedIdentity(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength;
}

function sameCanonicalIds(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();
  return leftSorted.every((value, index) => value === rightSorted[index]);
}

export function validateP14RuntimeActionEligibilityEvidence(
  value: unknown,
  action: P14PreparationAction,
): P14RuntimeActionEligibilityValidation {
  const captured = snapshotP14AdapterOutputRecord(
    value,
    ['actionId', 'recipeId', 'checkedPrerequisiteRecipeIds', 'eligible', 'detail'] as const,
    'P14 runtime action eligibility evidence',
  );
  if (!captured.valid || !captured.value) {
    return { valid: false, failures: captured.failures, value: null };
  }

  const failures: string[] = [];
  const actionId = captured.value.actionId;
  const recipeId = captured.value.recipeId;
  const eligible = captured.value.eligible;
  const detail = captured.value.detail;

  if (!boundedIdentity(actionId) || actionId !== action.actionId) {
    failures.push('Runtime action eligibility actionId is missing, oversized or does not match the planned action.');
  }
  if (!boundedIdentity(recipeId) || recipeId !== action.recipeId) {
    failures.push('Runtime action eligibility recipeId is missing, oversized or does not match the planned recipe.');
  }
  if (typeof eligible !== 'boolean') {
    failures.push('Runtime action eligibility eligible flag must be boolean.');
  }

  let checkedPrerequisiteRecipeIds: string[] = [];
  const prerequisiteSnapshot = snapshotP14AdapterOutputArray(
    captured.value.checkedPrerequisiteRecipeIds,
    DEFAULT_P14_INPUT_BOUNDS.maxPrerequisitesPerAction,
    'Runtime action eligibility checkedPrerequisiteRecipeIds',
    'prerequisite count',
  );
  if (!prerequisiteSnapshot.valid || !prerequisiteSnapshot.value) {
    failures.push(...prerequisiteSnapshot.failures);
  } else {
    const rawIds = prerequisiteSnapshot.value;
    if (rawIds.some((id) => !boundedIdentity(id))) {
      failures.push('Runtime action eligibility prerequisite evidence contains an invalid or oversized recipe ID.');
    } else {
      checkedPrerequisiteRecipeIds = rawIds as string[];
      if (new Set(checkedPrerequisiteRecipeIds).size !== checkedPrerequisiteRecipeIds.length) {
        failures.push('Runtime action eligibility prerequisite evidence contains duplicate recipe IDs.');
      }
      if (!sameCanonicalIds(checkedPrerequisiteRecipeIds, action.prerequisiteRecipeIds)) {
        failures.push('Runtime action eligibility prerequisite evidence does not match the exact planned prerequisite set.');
      }
    }
  }

  if (detail !== undefined
    && (typeof detail !== 'string' || detail.length > DEFAULT_P14_INPUT_BOUNDS.maxDetailLength)) {
    failures.push('Runtime action eligibility detail must be a bounded string when present.');
  }

  if (failures.length > 0) return { valid: false, failures, value: null };

  return {
    valid: true,
    failures: [],
    value: {
      actionId: actionId as string,
      recipeId: recipeId as string,
      checkedPrerequisiteRecipeIds: [...checkedPrerequisiteRecipeIds].sort(),
      eligible: eligible as boolean,
      ...(typeof detail === 'string' && detail.length > 0 ? { detail } : {}),
    },
  };
}
