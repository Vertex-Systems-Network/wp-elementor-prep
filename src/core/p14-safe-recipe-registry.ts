import { assessP14SafeRecipeRegistryBounds } from './p14-registry-bounds';
import type {
  P14MutationField,
  P14PreparationRecipeDefinition,
} from './p14-preparation-types';

export const P14_SAFE_RECIPE_REGISTRY_SCHEMA_VERSION = 1 as const;

export interface P14SafeRecipeBinding {
  sourceRuleId: string;
  sourceRuleVersion: number;
  recipe: P14PreparationRecipeDefinition;
}

export interface P14SafeRecipeRegistryV1 {
  schemaVersion: typeof P14_SAFE_RECIPE_REGISTRY_SCHEMA_VERSION;
  bindings: P14SafeRecipeBinding[];
}

export interface P14SafeRecipeRegistryValidation {
  valid: boolean;
  failures: string[];
}

export type P14SafeRecipeResolution =
  | { status: 'MATCH'; binding: P14SafeRecipeBinding }
  | { status: 'NO_MATCH' }
  | { status: 'INVALID_REGISTRY'; failures: string[] };

const MUTATION_FIELDS = new Set<P14MutationField>([
  'layoutMode',
  'primaryAxisSizingMode',
  'counterAxisSizingMode',
  'itemSpacing',
  'padding',
  'textAutoResize',
  'layoutSizing',
  'layoutGrow',
  'layoutAlign',
  'wrapperCreation',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function integerVersion(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function finiteConfidence(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
}

function sortedStrings(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function bindingKey(binding: Pick<P14SafeRecipeBinding, 'sourceRuleId' | 'sourceRuleVersion'>): string {
  return `${binding.sourceRuleId}@${binding.sourceRuleVersion}`;
}

function bindingSort(a: P14SafeRecipeBinding, b: P14SafeRecipeBinding): number {
  return a.sourceRuleId.localeCompare(b.sourceRuleId)
    || a.sourceRuleVersion - b.sourceRuleVersion
    || a.recipe.id.localeCompare(b.recipe.id)
    || a.recipe.version - b.recipe.version;
}

function normalizeRecipe(recipe: P14PreparationRecipeDefinition): P14PreparationRecipeDefinition {
  return {
    ...recipe,
    sourceRuleIds: sortedStrings(recipe.sourceRuleIds),
    prerequisites: sortedStrings(recipe.prerequisites),
    mutationAllowlist: [...recipe.mutationAllowlist].sort(),
    conflictsWith: sortedStrings(recipe.conflictsWith),
  };
}

export function createP14SafeRecipeRegistry(
  bindings: P14SafeRecipeBinding[],
): P14SafeRecipeRegistryV1 {
  return {
    schemaVersion: P14_SAFE_RECIPE_REGISTRY_SCHEMA_VERSION,
    bindings: bindings
      .map((binding) => ({
        sourceRuleId: binding.sourceRuleId,
        sourceRuleVersion: binding.sourceRuleVersion,
        recipe: normalizeRecipe(binding.recipe),
      }))
      .sort(bindingSort),
  };
}

function validateStringArray(
  value: unknown,
  label: string,
  failures: string[],
  options: { allowEmpty: boolean } = { allowEmpty: true },
): string[] | null {
  if (!Array.isArray(value) || value.some((item) => !nonEmptyString(item))) {
    failures.push(`${label} must be an array of non-empty strings.`);
    return null;
  }
  if (!options.allowEmpty && value.length === 0) {
    failures.push(`${label} must not be empty.`);
  }
  const strings = value as string[];
  if (new Set(strings).size !== strings.length) {
    failures.push(`${label} must not contain duplicates.`);
  }
  return strings;
}

function canonicalRecipe(value: P14PreparationRecipeDefinition): string {
  return JSON.stringify(normalizeRecipe(value));
}

export function validateP14SafeRecipeRegistry(value: unknown): P14SafeRecipeRegistryValidation {
  const bounds = assessP14SafeRecipeRegistryBounds(value);
  if (!bounds.allowed) {
    return {
      valid: false,
      failures: bounds.failures.map(
        (failure) => `P14 safe-recipe registry exceeds bounded safety limits: ${failure.code} at ${failure.path}: ${failure.actual} > ${failure.limit}`,
      ),
    };
  }

  const failures: string[] = [];
  if (!isRecord(value)) return { valid: false, failures: ['P14 safe-recipe registry must be an object.'] };
  if (value.schemaVersion !== P14_SAFE_RECIPE_REGISTRY_SCHEMA_VERSION) {
    failures.push('Unsupported P14 safe-recipe registry schema version.');
  }
  if (!Array.isArray(value.bindings)) {
    failures.push('P14 safe-recipe registry bindings must be an array.');
    return { valid: false, failures };
  }

  const seenBindings = new Set<string>();
  const recipeContracts = new Map<string, string>();

  for (const [index, rawBinding] of value.bindings.entries()) {
    const prefix = `bindings[${index}]`;
    if (!isRecord(rawBinding)) {
      failures.push(`${prefix} must be an object.`);
      continue;
    }
    if (!nonEmptyString(rawBinding.sourceRuleId)) failures.push(`${prefix}.sourceRuleId is missing.`);
    if (!integerVersion(rawBinding.sourceRuleVersion)) failures.push(`${prefix}.sourceRuleVersion must be a positive integer.`);
    if (!isRecord(rawBinding.recipe)) {
      failures.push(`${prefix}.recipe must be an object.`);
      continue;
    }

    const recipe = rawBinding.recipe;
    if (!nonEmptyString(recipe.id)) failures.push(`${prefix}.recipe.id is missing.`);
    if (!integerVersion(recipe.version)) failures.push(`${prefix}.recipe.version must be a positive integer.`);
    if (!finiteConfidence(recipe.minConfidence)) failures.push(`${prefix}.recipe.minConfidence must be between 0 and 100.`);
    if (!nonEmptyString(recipe.validationProfileId)) failures.push(`${prefix}.recipe.validationProfileId is missing.`);
    if (!nonEmptyString(recipe.orderClass)) failures.push(`${prefix}.recipe.orderClass is missing.`);

    const sourceRuleIds = validateStringArray(recipe.sourceRuleIds, `${prefix}.recipe.sourceRuleIds`, failures, { allowEmpty: false });
    const prerequisites = validateStringArray(recipe.prerequisites, `${prefix}.recipe.prerequisites`, failures);
    const conflicts = validateStringArray(recipe.conflictsWith, `${prefix}.recipe.conflictsWith`, failures);

    let mutationAllowlistValid = false;
    if (!Array.isArray(recipe.mutationAllowlist) || recipe.mutationAllowlist.length === 0) {
      failures.push(`${prefix}.recipe.mutationAllowlist must contain at least one accepted mutation field.`);
    } else {
      const fields = recipe.mutationAllowlist as unknown[];
      const hasUnsupported = fields.some(
        (field) => typeof field !== 'string' || !MUTATION_FIELDS.has(field as P14MutationField),
      );
      const hasDuplicates = new Set(fields).size !== fields.length;
      if (hasUnsupported) failures.push(`${prefix}.recipe.mutationAllowlist contains an unsupported field.`);
      if (hasDuplicates) failures.push(`${prefix}.recipe.mutationAllowlist must not contain duplicates.`);
      mutationAllowlistValid = !hasUnsupported && !hasDuplicates;
    }

    if (nonEmptyString(rawBinding.sourceRuleId) && sourceRuleIds && !sourceRuleIds.includes(rawBinding.sourceRuleId)) {
      failures.push(`${prefix}.recipe.sourceRuleIds does not authorize binding source rule ${rawBinding.sourceRuleId}.`);
    }
    if (nonEmptyString(recipe.id) && prerequisites?.includes(recipe.id)) {
      failures.push(`${prefix}.recipe cannot depend on itself.`);
    }
    if (nonEmptyString(recipe.id) && conflicts?.includes(recipe.id)) {
      failures.push(`${prefix}.recipe cannot conflict with itself.`);
    }

    if (nonEmptyString(rawBinding.sourceRuleId) && integerVersion(rawBinding.sourceRuleVersion)) {
      const key = `${rawBinding.sourceRuleId}@${rawBinding.sourceRuleVersion}`;
      if (seenBindings.has(key)) failures.push(`Duplicate safe-recipe binding for ${key}.`);
      seenBindings.add(key);
    }

    const canonicalizable = nonEmptyString(recipe.id)
      && integerVersion(recipe.version)
      && finiteConfidence(recipe.minConfidence)
      && nonEmptyString(recipe.validationProfileId)
      && nonEmptyString(recipe.orderClass)
      && sourceRuleIds !== null
      && prerequisites !== null
      && conflicts !== null
      && mutationAllowlistValid;
    if (canonicalizable) {
      const identity = `${recipe.id}@${recipe.version}`;
      const canonical = canonicalRecipe(recipe as unknown as P14PreparationRecipeDefinition);
      const previous = recipeContracts.get(identity);
      if (previous !== undefined && previous !== canonical) {
        failures.push(`Recipe ${identity} is reused with contradictory contracts.`);
      } else {
        recipeContracts.set(identity, canonical);
      }
    }
  }

  return { valid: failures.length === 0, failures };
}

export function resolveP14SafeRecipe(
  registry: P14SafeRecipeRegistryV1,
  sourceRuleId: string,
  sourceRuleVersion: number,
): P14SafeRecipeResolution {
  const validation = validateP14SafeRecipeRegistry(registry);
  if (!validation.valid) return { status: 'INVALID_REGISTRY', failures: validation.failures };
  const key = `${sourceRuleId}@${sourceRuleVersion}`;
  const binding = registry.bindings.find((candidate) => bindingKey(candidate) === key);
  return binding ? { status: 'MATCH', binding } : { status: 'NO_MATCH' };
}

/**
 * Production is intentionally non-authorizing at this slice. Current P13 production rules emit
 * only MANUAL_REVIEW/ADVISORY findings; a mutating binding requires a separately accepted issue,
 * recipe, validator and runtime evidence before being registered here.
 */
export const PRODUCTION_P14_SAFE_RECIPE_REGISTRY: P14SafeRecipeRegistryV1 =
  createP14SafeRecipeRegistry([]);
