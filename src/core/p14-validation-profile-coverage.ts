import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';
import { snapshotP14AdapterOutputArray } from './p14-adapter-output-snapshot';
import { snapshotP14SemanticInputEvidence } from './p14-semantic-input-snapshot';
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

function requiredP14ValidationProfileIdsFromStablePlan(plan: P14PreparationPlanV1): string[] {
  return stableUnique(
    plan.actions
      .filter((action) => action.decision === 'ELIGIBLE')
      .map((action) => action.validationProfileId)
      .filter((value): value is string => boundedId(value)),
  );
}

export function requiredP14ValidationProfileIds(plan: P14PreparationPlanV1): string[] {
  const planSnapshot = snapshotP14SemanticInputEvidence(
    plan,
    undefined,
    DEFAULT_P14_INPUT_BOUNDS,
  );
  if (!planSnapshot.valid) return [];
  return requiredP14ValidationProfileIdsFromStablePlan(planSnapshot.plan as P14PreparationPlanV1);
}

export function assessP14ValidationProfileCoverage(
  plan: P14PreparationPlanV1,
  profileIdsRun: unknown,
): P14ValidationProfileCoverageResult {
  const failures: string[] = [];
  const planSnapshot = snapshotP14SemanticInputEvidence(
    plan,
    undefined,
    DEFAULT_P14_INPUT_BOUNDS,
  );
  if (!planSnapshot.valid) {
    return {
      version: P14_VALIDATION_PROFILE_COVERAGE_VERSION,
      valid: false,
      failures: planSnapshot.failures.map((failure) => `Invalid P14 validation coverage plan evidence: ${failure}`),
      requiredProfileIds: [],
      observedProfileIds: [],
    };
  }

  const stablePlan = planSnapshot.plan as P14PreparationPlanV1;
  const requiredProfileIds = requiredP14ValidationProfileIdsFromStablePlan(stablePlan);
  let observedProfileIds: string[] = [];

  const eligibleActions = stablePlan.actions.filter((action) => action.decision === 'ELIGIBLE');
  if (eligibleActions.length > 0 && requiredProfileIds.length === 0) {
    failures.push('Eligible P14 actions do not expose any bounded validation profile IDs.');
  }
  if (eligibleActions.some((action) => !boundedId(action.validationProfileId))) {
    failures.push('One or more eligible P14 actions has a missing or oversized validation profile ID.');
  }

  const observedSnapshot = snapshotP14AdapterOutputArray(
    profileIdsRun,
    DEFAULT_P14_INPUT_BOUNDS.maxActions,
    'Validation profile evidence',
    'profile count',
  );
  if (!observedSnapshot.valid || !observedSnapshot.value) {
    failures.push(...observedSnapshot.failures);
  } else {
    const validIds: string[] = [];
    let malformed = false;
    for (const value of observedSnapshot.value) {
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
