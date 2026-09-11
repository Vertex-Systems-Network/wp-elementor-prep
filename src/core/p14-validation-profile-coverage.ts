import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import type { P14PreparationPlanV1 } from './p14-preparation-types';

export const P14_VALIDATION_PROFILE_COVERAGE_VERSION = 1 as const;

export interface P14ValidationProfileCoverageResult {
  version: typeof P14_VALIDATION_PROFILE_COVERAGE_VERSION;
  valid: boolean;
  failures: string[];
  requiredProfileIds: string[];
  observedProfileIds: string[];
}

function boundedId(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= DEFAULT_P14_INPUT_BOUNDS.maxIdentityLength;
}

function stableUnique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function requiredP14ValidationProfileIds(plan: P14PreparationPlanV1): string[] {
  return stableUnique(
    plan.actions
      .filter((action) => action.decision === 'ELIGIBLE')
      .map((action) => action.validationProfileId)
      .filter((value): value is string => boundedId(value)),
  );
}

export function assessP14ValidationProfileCoverage(
  plan: P14PreparationPlanV1,
  profileIdsRun: unknown,
): P14ValidationProfileCoverageResult {
  const failures: string[] = [];
  const requiredProfileIds = requiredP14ValidationProfileIds(plan);
  let observedProfileIds: string[] = [];

  const eligibleActions = plan.actions.filter((action) => action.decision === 'ELIGIBLE');
  if (eligibleActions.length > 0 && requiredProfileIds.length === 0) {
    failures.push('Eligible P14 actions do not expose any bounded validation profile IDs.');
  }
  if (eligibleActions.some((action) => !boundedId(action.validationProfileId))) {
    failures.push('One or more eligible P14 actions has a missing or oversized validation profile ID.');
  }

  if (!Array.isArray(profileIdsRun)) {
    failures.push('Validation evidence must include profileIdsRun as an array.');
  } else if (profileIdsRun.length > DEFAULT_P14_INPUT_BOUNDS.maxActions) {
    failures.push(`Validation profile evidence exceeds bounded profile count ${DEFAULT_P14_INPUT_BOUNDS.maxActions}.`);
  } else {
    const validIds: string[] = [];
    let malformed = false;
    for (const value of profileIdsRun) {
      if (!boundedId(value)) {
        malformed = true;
        continue;
      }
      validIds.push(value);
    }
    if (malformed) failures.push('Validation profile evidence contains an empty, non-string or oversized profile ID.');
    if (new Set(validIds).size !== validIds.length) {
      failures.push('Validation profile evidence contains duplicate profile IDs.');
    }
    observedProfileIds = stableUnique(validIds);
  }

  for (const profileId of requiredProfileIds) {
    if (!observedProfileIds.includes(profileId)) {
      failures.push(`Required validation profile ${profileId} did not run.`);
    }
  }

  return {
    version: P14_VALIDATION_PROFILE_COVERAGE_VERSION,
    valid: failures.length === 0,
    failures,
    requiredProfileIds,
    observedProfileIds,
  };
}
