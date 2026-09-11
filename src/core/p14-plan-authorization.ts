import type { P14PreparationAction, P14PreparationPlanV1 } from './p14-preparation-types';
import {
  PRODUCTION_P14_SAFE_RECIPE_REGISTRY,
  validateP14SafeRecipeRegistry,
  type P14SafeRecipeRegistryV1,
} from './p14-safe-recipe-registry';

export interface P14PlanAuthorizationResult {
  authorized: boolean;
  failures: string[];
  authorizedActionIds: string[];
}

function stableStrings(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sameStrings(left: string[], right: string[]): boolean {
  const a = stableStrings(left);
  const b = stableStrings(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function exactBindingKey(ruleId: string, ruleVersion: number): string {
  return `${ruleId}@${ruleVersion}`;
}

function eligibleActions(plan: P14PreparationPlanV1): P14PreparationAction[] {
  return plan.actions.filter((action) => action.decision === 'ELIGIBLE');
}

/**
 * Authorization is deliberately separate from plan-integrity validation.
 * A plan may be internally coherent but still be non-executable when the current safe-recipe
 * registry does not explicitly allow its exact rule/version -> recipe contract.
 */
export function authorizeP14PreparationPlan(
  plan: P14PreparationPlanV1,
  registry: P14SafeRecipeRegistryV1 = PRODUCTION_P14_SAFE_RECIPE_REGISTRY,
): P14PlanAuthorizationResult {
  const registryValidation = validateP14SafeRecipeRegistry(registry);
  if (!registryValidation.valid) {
    return {
      authorized: false,
      failures: registryValidation.failures.map((failure) => `Invalid P14 safe-recipe registry: ${failure}`).sort(),
      authorizedActionIds: [],
    };
  }

  const actions = eligibleActions(plan);
  if (actions.length === 0) {
    return { authorized: true, failures: [], authorizedActionIds: [] };
  }

  const byRule = new Map(
    registry.bindings.map((binding) => [exactBindingKey(binding.sourceRuleId, binding.sourceRuleVersion), binding]),
  );
  const failures: string[] = [];
  const authorizedActionIds: string[] = [];

  for (const action of actions) {
    const binding = byRule.get(exactBindingKey(action.sourceRuleId, action.sourceRuleVersion));
    if (!binding) {
      failures.push(`Action ${action.actionId} has no current safe-recipe binding for ${action.sourceRuleId}@${action.sourceRuleVersion}.`);
      continue;
    }

    const recipe = binding.recipe;
    const prefix = `Action ${action.actionId}`;
    let actionAuthorized = true;
    if (action.recipeId !== recipe.id || action.recipeVersion !== recipe.version) {
      failures.push(`${prefix} recipe identity does not match current registry contract ${recipe.id}@${recipe.version}.`);
      actionAuthorized = false;
    }
    if (action.validationProfileId !== recipe.validationProfileId) {
      failures.push(`${prefix} validation profile does not match current registry contract.`);
      actionAuthorized = false;
    }
    if (action.orderClass !== recipe.orderClass) {
      failures.push(`${prefix} order class does not match current registry contract.`);
      actionAuthorized = false;
    }
    if (!sameStrings(action.mutationAllowlist, recipe.mutationAllowlist)) {
      failures.push(`${prefix} mutation allowlist does not match current registry contract.`);
      actionAuthorized = false;
    }
    if (!sameStrings(action.prerequisiteRecipeIds, recipe.prerequisites)) {
      failures.push(`${prefix} prerequisites do not match current registry contract.`);
      actionAuthorized = false;
    }
    if (!sameStrings(action.conflictsWithRecipeIds, recipe.conflictsWith)) {
      failures.push(`${prefix} conflicts do not match current registry contract.`);
      actionAuthorized = false;
    }
    if (action.confidence < recipe.minConfidence) {
      failures.push(`${prefix} confidence ${action.confidence} is below current registry minimum ${recipe.minConfidence}.`);
      actionAuthorized = false;
    }
    if (!recipe.sourceRuleIds.includes(action.sourceRuleId)) {
      failures.push(`${prefix} source rule is not authorized by the current recipe contract.`);
      actionAuthorized = false;
    }

    if (actionAuthorized) authorizedActionIds.push(action.actionId);
  }

  return {
    authorized: failures.length === 0 && authorizedActionIds.length === actions.length,
    failures: failures.sort(),
    authorizedActionIds,
  };
}
