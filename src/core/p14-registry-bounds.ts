import {
  resolveP14InputBounds,
  type P14InputBoundFailure,
  type P14InputBoundsLimits,
} from './p14-input-bounds';

export interface P14RegistryBoundsResult {
  allowed: boolean;
  effectiveLimits: P14InputBoundsLimits;
  observedBindingCount: number;
  failures: P14InputBoundFailure[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkString(
  value: unknown,
  path: string,
  limit: number,
  failures: P14InputBoundFailure[],
): void {
  if (typeof value === 'string' && value.length > limit) {
    failures.push({
      code: 'P14_BOUND_MAX_IDENTITY_LENGTH',
      path,
      actual: value.length,
      limit,
    });
  }
}

function boundedArray(
  value: unknown,
  path: string,
  limit: number,
  code: P14InputBoundFailure['code'],
  failures: P14InputBoundFailure[],
): unknown[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length > limit) {
    failures.push({ code, path, actual: value.length, limit });
    return null;
  }
  return value;
}

function checkIdentityArray(
  value: unknown,
  path: string,
  countLimit: number,
  countCode: P14InputBoundFailure['code'],
  identityLimit: number,
  failures: P14InputBoundFailure[],
): void {
  const items = boundedArray(value, path, countLimit, countCode, failures);
  if (!items) return;
  for (let index = 0; index < items.length; index += 1) {
    checkString(items[index], `${path}[${index}]`, identityLimit, failures);
  }
}

/**
 * Resource-only bounds for untrusted safe-recipe registry evidence.
 *
 * Shape/semantic validation remains owned by validateP14SafeRecipeRegistry(...). This gate only
 * ensures that deep validation/authorization cannot be forced to traverse oversized collections or
 * identities. It intentionally reuses the existing P14 safety limits instead of defining a second
 * registry-specific limit system.
 */
export function assessP14SafeRecipeRegistryBounds(
  value: unknown,
  overrides: Partial<P14InputBoundsLimits> = {},
): P14RegistryBoundsResult {
  const limits = resolveP14InputBounds(overrides);
  const failures: P14InputBoundFailure[] = [];
  if (!isRecord(value)) {
    return { allowed: true, effectiveLimits: limits, observedBindingCount: 0, failures };
  }

  const rawBindings = value.bindings;
  const observedBindingCount = Array.isArray(rawBindings) ? rawBindings.length : 0;
  const bindings = boundedArray(
    rawBindings,
    'registry.bindings',
    limits.maxActions,
    'P14_BOUND_MAX_ACTIONS',
    failures,
  );
  if (!bindings) {
    return {
      allowed: failures.length === 0,
      effectiveLimits: limits,
      observedBindingCount,
      failures,
    };
  }

  for (let index = 0; index < bindings.length; index += 1) {
    const binding = bindings[index];
    if (!isRecord(binding)) continue;
    const prefix = `registry.bindings[${index}]`;
    checkString(binding.sourceRuleId, `${prefix}.sourceRuleId`, limits.maxIdentityLength, failures);

    const recipe = binding.recipe;
    if (!isRecord(recipe)) continue;
    checkString(recipe.id, `${prefix}.recipe.id`, limits.maxIdentityLength, failures);
    checkString(
      recipe.validationProfileId,
      `${prefix}.recipe.validationProfileId`,
      limits.maxIdentityLength,
      failures,
    );
    checkString(recipe.orderClass, `${prefix}.recipe.orderClass`, limits.maxIdentityLength, failures);

    checkIdentityArray(
      recipe.sourceRuleIds,
      `${prefix}.recipe.sourceRuleIds`,
      limits.maxActions,
      'P14_BOUND_MAX_ACTIONS',
      limits.maxIdentityLength,
      failures,
    );
    checkIdentityArray(
      recipe.prerequisites,
      `${prefix}.recipe.prerequisites`,
      limits.maxPrerequisitesPerAction,
      'P14_BOUND_MAX_PREREQUISITES_PER_ACTION',
      limits.maxIdentityLength,
      failures,
    );
    checkIdentityArray(
      recipe.conflictsWith,
      `${prefix}.recipe.conflictsWith`,
      limits.maxConflictsPerAction,
      'P14_BOUND_MAX_CONFLICTS_PER_ACTION',
      limits.maxIdentityLength,
      failures,
    );
    boundedArray(
      recipe.mutationAllowlist,
      `${prefix}.recipe.mutationAllowlist`,
      limits.maxMutationFieldsPerAction,
      'P14_BOUND_MAX_MUTATION_FIELDS_PER_ACTION',
      failures,
    );
  }

  failures.sort((a, b) => a.path.localeCompare(b.path)
    || a.code.localeCompare(b.code)
    || a.actual - b.actual);
  return {
    allowed: failures.length === 0,
    effectiveLimits: limits,
    observedBindingCount,
    failures,
  };
}
