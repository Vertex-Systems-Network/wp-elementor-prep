import type { P14InputBoundsLimits } from './p14-input-bounds';
import { safeP14RuntimeErrorMessage } from './p14-receipt-evidence';

export interface P14RegistrySemanticSnapshotAssessment {
  valid: boolean;
  failures: string[];
  value: unknown;
}

type SnapshotKind = 'array' | 'record' | 'other' | 'unreadable';

function classify(value: unknown, path: string, failures: string[]): SnapshotKind {
  try {
    if (Array.isArray(value)) return 'array';
  } catch (error) {
    failures.push(`${path} could not be classified safely: ${safeP14RuntimeErrorMessage(error)}`);
    return 'unreadable';
  }
  return typeof value === 'object' && value !== null ? 'record' : 'other';
}

function readProperty(
  record: Record<string, unknown>,
  key: string,
  path: string,
  failures: string[],
): unknown {
  try {
    return record[key];
  } catch (error) {
    failures.push(`${path} could not be read safely: ${safeP14RuntimeErrorMessage(error)}`);
    return undefined;
  }
}

function readArrayLength(
  values: unknown[],
  path: string,
  failures: string[],
): number | null {
  try {
    const length: unknown = values.length;
    if (typeof length !== 'number' || !Number.isSafeInteger(length) || length < 0) {
      failures.push(`${path}.length is not a safe non-negative integer.`);
      return null;
    }
    return length;
  } catch (error) {
    failures.push(`${path}.length could not be read safely: ${safeP14RuntimeErrorMessage(error)}`);
    return null;
  }
}

function readArrayItem(
  values: unknown[],
  index: number,
  path: string,
  failures: string[],
): unknown {
  try {
    return values[index];
  } catch (error) {
    failures.push(`${path}[${index}] could not be read safely: ${safeP14RuntimeErrorMessage(error)}`);
    return undefined;
  }
}

function scalarEvidence(value: unknown): unknown {
  return typeof value === 'object' && value !== null ? null : value;
}

function oversizedArray(limit: number): unknown[] {
  return new Array(limit + 1);
}

function snapshotArray(
  value: unknown,
  limit: number,
  path: string,
  failures: string[],
  snapshotItem: (item: unknown, index: number) => unknown = (item) => scalarEvidence(item),
): unknown {
  const kind = classify(value, path, failures);
  if (kind === 'unreadable') return undefined;
  if (kind !== 'array') return scalarEvidence(value);

  const values = value as unknown[];
  const length = readArrayLength(values, path, failures);
  if (length === null) return [];
  if (length > limit) return oversizedArray(limit);

  const result: unknown[] = [];
  for (let index = 0; index < length; index += 1) {
    result.push(snapshotItem(readArrayItem(values, index, path, failures), index));
  }
  return result;
}

function snapshotRecipe(
  value: unknown,
  bindingIndex: number,
  limits: P14InputBoundsLimits,
  failures: string[],
): unknown {
  const path = `registry.bindings[${bindingIndex}].recipe`;
  const kind = classify(value, path, failures);
  if (kind === 'unreadable') return undefined;
  if (kind === 'array') return [];
  if (kind !== 'record') return scalarEvidence(value);

  const record = value as Record<string, unknown>;
  return {
    id: scalarEvidence(readProperty(record, 'id', `${path}.id`, failures)),
    version: scalarEvidence(readProperty(record, 'version', `${path}.version`, failures)),
    sourceRuleIds: snapshotArray(
      readProperty(record, 'sourceRuleIds', `${path}.sourceRuleIds`, failures),
      limits.maxActions,
      `${path}.sourceRuleIds`,
      failures,
    ),
    minConfidence: scalarEvidence(readProperty(record, 'minConfidence', `${path}.minConfidence`, failures)),
    prerequisites: snapshotArray(
      readProperty(record, 'prerequisites', `${path}.prerequisites`, failures),
      limits.maxPrerequisitesPerAction,
      `${path}.prerequisites`,
      failures,
    ),
    mutationAllowlist: snapshotArray(
      readProperty(record, 'mutationAllowlist', `${path}.mutationAllowlist`, failures),
      limits.maxMutationFieldsPerAction,
      `${path}.mutationAllowlist`,
      failures,
    ),
    validationProfileId: scalarEvidence(
      readProperty(record, 'validationProfileId', `${path}.validationProfileId`, failures),
    ),
    conflictsWith: snapshotArray(
      readProperty(record, 'conflictsWith', `${path}.conflictsWith`, failures),
      limits.maxConflictsPerAction,
      `${path}.conflictsWith`,
      failures,
    ),
    orderClass: scalarEvidence(readProperty(record, 'orderClass', `${path}.orderClass`, failures)),
  };
}

function snapshotBinding(
  value: unknown,
  index: number,
  limits: P14InputBoundsLimits,
  failures: string[],
): unknown {
  const path = `registry.bindings[${index}]`;
  const kind = classify(value, path, failures);
  if (kind === 'unreadable') return undefined;
  if (kind === 'array') return [];
  if (kind !== 'record') return scalarEvidence(value);

  const record = value as Record<string, unknown>;
  return {
    sourceRuleId: scalarEvidence(readProperty(record, 'sourceRuleId', `${path}.sourceRuleId`, failures)),
    sourceRuleVersion: scalarEvidence(
      readProperty(record, 'sourceRuleVersion', `${path}.sourceRuleVersion`, failures),
    ),
    recipe: snapshotRecipe(
      readProperty(record, 'recipe', `${path}.recipe`, failures),
      index,
      limits,
      failures,
    ),
  };
}

/**
 * Captures only the known safe-recipe registry contract into bounded plain values. This runs after
 * a successful registry resource preflight and never enumerates arbitrary caller-owned properties.
 */
export function snapshotP14SafeRecipeRegistryEvidence(
  value: unknown,
  limits: P14InputBoundsLimits,
): P14RegistrySemanticSnapshotAssessment {
  const failures: string[] = [];
  const kind = classify(value, 'registry', failures);
  if (kind === 'unreadable') {
    return { valid: false, failures, value: undefined };
  }
  if (kind === 'array') {
    return { valid: true, failures, value: [] };
  }
  if (kind !== 'record') {
    return { valid: true, failures, value: scalarEvidence(value) };
  }

  const record = value as Record<string, unknown>;
  const snapshot = {
    schemaVersion: scalarEvidence(readProperty(record, 'schemaVersion', 'registry.schemaVersion', failures)),
    bindings: snapshotArray(
      readProperty(record, 'bindings', 'registry.bindings', failures),
      limits.maxActions,
      'registry.bindings',
      failures,
      (item, index) => snapshotBinding(item, index, limits, failures),
    ),
  };

  return {
    valid: failures.length === 0,
    failures,
    value: snapshot,
  };
}
