export const P14_INPUT_BOUNDS_VERSION = 1 as const;

export interface P14InputBoundsLimits {
  maxActions: number;
  maxBlockers: number;
  maxTargetsPerAction: number;
  maxTotalTargetReferences: number;
  maxPrerequisitesPerAction: number;
  maxConflictsPerAction: number;
  maxMutationFieldsPerAction: number;
  maxBucketActionIds: number;
  maxBlockerActionIds: number;
  maxIdentityLength: number;
  maxDetailLength: number;
}

export type P14InputBoundFailureCode =
  | 'P14_BOUND_MAX_ACTIONS'
  | 'P14_BOUND_MAX_BLOCKERS'
  | 'P14_BOUND_MAX_TARGETS_PER_ACTION'
  | 'P14_BOUND_MAX_TOTAL_TARGET_REFERENCES'
  | 'P14_BOUND_MAX_PREREQUISITES_PER_ACTION'
  | 'P14_BOUND_MAX_CONFLICTS_PER_ACTION'
  | 'P14_BOUND_MAX_MUTATION_FIELDS_PER_ACTION'
  | 'P14_BOUND_MAX_BUCKET_ACTION_IDS'
  | 'P14_BOUND_MAX_BLOCKER_ACTION_IDS'
  | 'P14_BOUND_MAX_IDENTITY_LENGTH'
  | 'P14_BOUND_MAX_DETAIL_LENGTH';

export interface P14InputBoundFailure {
  code: P14InputBoundFailureCode;
  path: string;
  actual: number;
  limit: number;
}

export interface P14InputBoundsResult {
  boundsVersion: typeof P14_INPUT_BOUNDS_VERSION;
  allowed: boolean;
  effectiveLimits: P14InputBoundsLimits;
  observed: {
    actionCount: number;
    blockerCount: number;
    totalTargetReferences: number;
  };
  failures: P14InputBoundFailure[];
}

export const DEFAULT_P14_INPUT_BOUNDS: Readonly<P14InputBoundsLimits> = Object.freeze({
  maxActions: 512,
  maxBlockers: 128,
  maxTargetsPerAction: 256,
  maxTotalTargetReferences: 4096,
  maxPrerequisitesPerAction: 64,
  maxConflictsPerAction: 64,
  maxMutationFieldsPerAction: 16,
  maxBucketActionIds: 512,
  maxBlockerActionIds: 512,
  maxIdentityLength: 512,
  maxDetailLength: 4096,
});

export const HARD_P14_INPUT_BOUNDS: Readonly<P14InputBoundsLimits> = Object.freeze({
  maxActions: 2048,
  maxBlockers: 512,
  maxTargetsPerAction: 1024,
  maxTotalTargetReferences: 16384,
  maxPrerequisitesPerAction: 128,
  maxConflictsPerAction: 128,
  maxMutationFieldsPerAction: 32,
  maxBucketActionIds: 2048,
  maxBlockerActionIds: 2048,
  maxIdentityLength: 2048,
  maxDetailLength: 16384,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function positiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function resolveP14InputBounds(
  overrides: Partial<P14InputBoundsLimits> = {},
): P14InputBoundsLimits {
  const result = {} as P14InputBoundsLimits;
  for (const key of Object.keys(DEFAULT_P14_INPUT_BOUNDS) as Array<keyof P14InputBoundsLimits>) {
    const requested = overrides[key];
    const base = positiveInteger(requested) ? requested : DEFAULT_P14_INPUT_BOUNDS[key];
    result[key] = Math.min(base, HARD_P14_INPUT_BOUNDS[key]);
  }
  return result;
}

function checkString(
  value: unknown,
  path: string,
  limit: number,
  code: P14InputBoundFailureCode,
  failures: P14InputBoundFailure[],
): void {
  if (typeof value === 'string' && value.length > limit) {
    failures.push({ code, path, actual: value.length, limit });
  }
}

function checkArrayLength(
  value: unknown,
  path: string,
  limit: number,
  code: P14InputBoundFailureCode,
  failures: P14InputBoundFailure[],
): value is unknown[] {
  if (!Array.isArray(value)) return false;
  if (value.length > limit) {
    failures.push({ code, path, actual: value.length, limit });
    return false;
  }
  return true;
}

function checkIdentityArrayItems(
  values: unknown[],
  path: string,
  limit: number,
  failures: P14InputBoundFailure[],
): void {
  for (let index = 0; index < values.length; index += 1) {
    checkString(values[index], `${path}[${index}]`, limit, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);
  }
}

export function assessP14PreparationInputBounds(
  value: unknown,
  overrides: Partial<P14InputBoundsLimits> = {},
): P14InputBoundsResult {
  const limits = resolveP14InputBounds(overrides);
  const failures: P14InputBoundFailure[] = [];
  let actionCount = 0;
  let blockerCount = 0;
  let totalTargetReferences = 0;

  if (!isRecord(value)) {
    return {
      boundsVersion: P14_INPUT_BOUNDS_VERSION,
      allowed: true,
      effectiveLimits: limits,
      observed: { actionCount, blockerCount, totalTargetReferences },
      failures,
    };
  }

  checkString(value.p13RunId, 'p13RunId', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);
  checkString(value.planDigest, 'planDigest', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);
  if (isRecord(value.source)) {
    checkString(value.source.nodeId, 'source.nodeId', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);
    checkString(value.source.fingerprint, 'source.fingerprint', limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);
  }

  const actions = value.actions;
  if (Array.isArray(actions)) actionCount = actions.length;
  if (checkArrayLength(actions, 'actions', limits.maxActions, 'P14_BOUND_MAX_ACTIONS', failures)) {
    for (let actionIndex = 0; actionIndex < actions.length; actionIndex += 1) {
      const action = actions[actionIndex];
      if (!isRecord(action)) continue;
      for (const key of ['actionId', 'findingId', 'sourceRuleId', 'recipeId', 'orderClass', 'validationProfileId', 'refusalCode']) {
        checkString(action[key], `actions[${actionIndex}].${key}`, limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);
      }

      const targets = action.targetNodeIds;
      if (Array.isArray(targets)) {
        totalTargetReferences += targets.length;
        if (totalTargetReferences > limits.maxTotalTargetReferences) {
          failures.push({
            code: 'P14_BOUND_MAX_TOTAL_TARGET_REFERENCES',
            path: 'actions[*].targetNodeIds',
            actual: totalTargetReferences,
            limit: limits.maxTotalTargetReferences,
          });
          break;
        }
      }
      if (checkArrayLength(targets, `actions[${actionIndex}].targetNodeIds`, limits.maxTargetsPerAction, 'P14_BOUND_MAX_TARGETS_PER_ACTION', failures)) {
        checkIdentityArrayItems(targets, `actions[${actionIndex}].targetNodeIds`, limits.maxIdentityLength, failures);
      }

      const prerequisites = action.prerequisiteRecipeIds;
      if (checkArrayLength(prerequisites, `actions[${actionIndex}].prerequisiteRecipeIds`, limits.maxPrerequisitesPerAction, 'P14_BOUND_MAX_PREREQUISITES_PER_ACTION', failures)) {
        checkIdentityArrayItems(prerequisites, `actions[${actionIndex}].prerequisiteRecipeIds`, limits.maxIdentityLength, failures);
      }

      const conflicts = action.conflictsWithRecipeIds;
      if (checkArrayLength(conflicts, `actions[${actionIndex}].conflictsWithRecipeIds`, limits.maxConflictsPerAction, 'P14_BOUND_MAX_CONFLICTS_PER_ACTION', failures)) {
        checkIdentityArrayItems(conflicts, `actions[${actionIndex}].conflictsWithRecipeIds`, limits.maxIdentityLength, failures);
      }

      checkArrayLength(
        action.mutationAllowlist,
        `actions[${actionIndex}].mutationAllowlist`,
        limits.maxMutationFieldsPerAction,
        'P14_BOUND_MAX_MUTATION_FIELDS_PER_ACTION',
        failures,
      );
    }
  }

  const blockers = value.blockers;
  if (Array.isArray(blockers)) blockerCount = blockers.length;
  if (checkArrayLength(blockers, 'blockers', limits.maxBlockers, 'P14_BOUND_MAX_BLOCKERS', failures)) {
    for (let blockerIndex = 0; blockerIndex < blockers.length; blockerIndex += 1) {
      const blocker = blockers[blockerIndex];
      if (!isRecord(blocker)) continue;
      checkString(blocker.code, `blockers[${blockerIndex}].code`, limits.maxIdentityLength, 'P14_BOUND_MAX_IDENTITY_LENGTH', failures);
      checkString(blocker.detail, `blockers[${blockerIndex}].detail`, limits.maxDetailLength, 'P14_BOUND_MAX_DETAIL_LENGTH', failures);
      const actionIds = blocker.actionIds;
      if (checkArrayLength(actionIds, `blockers[${blockerIndex}].actionIds`, limits.maxBlockerActionIds, 'P14_BOUND_MAX_BLOCKER_ACTION_IDS', failures)) {
        checkIdentityArrayItems(actionIds, `blockers[${blockerIndex}].actionIds`, limits.maxIdentityLength, failures);
      }
    }
  }

  for (const key of ['eligibleActionIds', 'noOpActionIds', 'reviewActionIds', 'refusedActionIds']) {
    const bucket = value[key];
    if (checkArrayLength(bucket, key, limits.maxBucketActionIds, 'P14_BOUND_MAX_BUCKET_ACTION_IDS', failures)) {
      checkIdentityArrayItems(bucket, key, limits.maxIdentityLength, failures);
    }
  }

  failures.sort((a, b) => a.path.localeCompare(b.path) || a.code.localeCompare(b.code) || a.actual - b.actual);
  return {
    boundsVersion: P14_INPUT_BOUNDS_VERSION,
    allowed: failures.length === 0,
    effectiveLimits: limits,
    observed: { actionCount, blockerCount, totalTargetReferences },
    failures,
  };
}
