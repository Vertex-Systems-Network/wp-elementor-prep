import type { P14InputBoundsLimits } from './p14-input-bounds';
import { safeP14RuntimeErrorMessage } from './p14-receipt-evidence';

export interface P14SemanticInputSnapshotAssessment {
  valid: boolean;
  failures: string[];
  plan: unknown;
  confirmation: unknown;
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

function snapshotLeaf(value: unknown, path: string, failures: string[]): unknown {
  const kind = classify(value, path, failures);
  if (kind === 'unreadable') return undefined;
  if (kind === 'array') return [];
  if (kind === 'record') return {};
  return value;
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

function oversizedArray(limit: number): unknown[] {
  return new Array(limit + 1);
}

function snapshotArray(
  value: unknown,
  limit: number,
  path: string,
  failures: string[],
  snapshotItem: (item: unknown, index: number) => unknown = (item, index) =>
    snapshotLeaf(item, `${path}[${index}]`, failures),
): unknown {
  const kind = classify(value, path, failures);
  if (kind === 'unreadable') return undefined;
  if (kind === 'record') return {};
  if (kind !== 'array') return value;

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

function snapshotSource(value: unknown, path: string, failures: string[]): unknown {
  const kind = classify(value, path, failures);
  if (kind === 'unreadable') return undefined;
  if (kind === 'array') return [];
  if (kind !== 'record') return value;

  const record = value as Record<string, unknown>;
  return {
    nodeId: snapshotLeaf(readProperty(record, 'nodeId', `${path}.nodeId`, failures), `${path}.nodeId`, failures),
    fingerprint: snapshotLeaf(
      readProperty(record, 'fingerprint', `${path}.fingerprint`, failures),
      `${path}.fingerprint`,
      failures,
    ),
  };
}

function snapshotAction(
  value: unknown,
  index: number,
  limits: P14InputBoundsLimits,
  failures: string[],
  targetBudget: { total: number },
): unknown {
  const path = `plan.actions[${index}]`;
  const kind = classify(value, path, failures);
  if (kind === 'unreadable') return undefined;
  if (kind === 'array') return [];
  if (kind !== 'record') return value;

  const record = value as Record<string, unknown>;
  const targetPath = `${path}.targetNodeIds`;
  const targetNodeIds = readProperty(record, 'targetNodeIds', targetPath, failures);
  let targetSnapshot: unknown;
  const targetKind = classify(targetNodeIds, targetPath, failures);
  if (targetKind === 'array') {
    const targets = targetNodeIds as unknown[];
    const length = readArrayLength(targets, targetPath, failures);
    if (length === null) {
      targetSnapshot = [];
    } else if (length > limits.maxTargetsPerAction) {
      targetSnapshot = oversizedArray(limits.maxTargetsPerAction);
    } else {
      const remaining = Math.max(0, limits.maxTotalTargetReferences - targetBudget.total);
      const copyLength = length > remaining ? Math.min(length, remaining + 1) : length;
      const copied: unknown[] = [];
      for (let targetIndex = 0; targetIndex < copyLength; targetIndex += 1) {
        copied.push(snapshotLeaf(
          readArrayItem(targets, targetIndex, targetPath, failures),
          `${targetPath}[${targetIndex}]`,
          failures,
        ));
      }
      targetBudget.total += copyLength;
      targetSnapshot = copied;
    }
  } else if (targetKind === 'record') {
    targetSnapshot = {};
  } else if (targetKind === 'unreadable') {
    targetSnapshot = undefined;
  } else {
    targetSnapshot = targetNodeIds;
  }

  const leaf = (key: string): unknown => snapshotLeaf(
    readProperty(record, key, `${path}.${key}`, failures),
    `${path}.${key}`,
    failures,
  );

  return {
    actionId: leaf('actionId'),
    findingId: leaf('findingId'),
    decision: leaf('decision'),
    sourceRuleId: leaf('sourceRuleId'),
    sourceRuleVersion: leaf('sourceRuleVersion'),
    targetNodeIds: targetSnapshot,
    confidence: leaf('confidence'),
    recipeId: leaf('recipeId'),
    recipeVersion: leaf('recipeVersion'),
    orderClass: leaf('orderClass'),
    prerequisiteRecipeIds: snapshotArray(
      readProperty(record, 'prerequisiteRecipeIds', `${path}.prerequisiteRecipeIds`, failures),
      limits.maxPrerequisitesPerAction,
      `${path}.prerequisiteRecipeIds`,
      failures,
    ),
    conflictsWithRecipeIds: snapshotArray(
      readProperty(record, 'conflictsWithRecipeIds', `${path}.conflictsWithRecipeIds`, failures),
      limits.maxConflictsPerAction,
      `${path}.conflictsWithRecipeIds`,
      failures,
    ),
    mutationAllowlist: snapshotArray(
      readProperty(record, 'mutationAllowlist', `${path}.mutationAllowlist`, failures),
      limits.maxMutationFieldsPerAction,
      `${path}.mutationAllowlist`,
      failures,
    ),
    validationProfileId: leaf('validationProfileId'),
    refusalCode: leaf('refusalCode'),
  };
}

function snapshotBlocker(
  value: unknown,
  index: number,
  limits: P14InputBoundsLimits,
  failures: string[],
): unknown {
  const path = `plan.blockers[${index}]`;
  const kind = classify(value, path, failures);
  if (kind === 'unreadable') return undefined;
  if (kind === 'array') return [];
  if (kind !== 'record') return value;

  const record = value as Record<string, unknown>;
  return {
    code: snapshotLeaf(readProperty(record, 'code', `${path}.code`, failures), `${path}.code`, failures),
    detail: snapshotLeaf(readProperty(record, 'detail', `${path}.detail`, failures), `${path}.detail`, failures),
    actionIds: snapshotArray(
      readProperty(record, 'actionIds', `${path}.actionIds`, failures),
      limits.maxBlockerActionIds,
      `${path}.actionIds`,
      failures,
    ),
  };
}

function snapshotPlan(
  value: unknown,
  limits: P14InputBoundsLimits,
  failures: string[],
): unknown {
  const kind = classify(value, 'plan', failures);
  if (kind === 'unreadable') return undefined;
  if (kind === 'array') return [];
  if (kind !== 'record') return value;

  const record = value as Record<string, unknown>;
  const targetBudget = { total: 0 };
  const leaf = (key: string): unknown => snapshotLeaf(
    readProperty(record, key, `plan.${key}`, failures),
    `plan.${key}`,
    failures,
  );

  return {
    schemaVersion: leaf('schemaVersion'),
    engineVersion: leaf('engineVersion'),
    p13RunId: leaf('p13RunId'),
    source: snapshotSource(readProperty(record, 'source', 'plan.source', failures), 'plan.source', failures),
    status: leaf('status'),
    actions: snapshotArray(
      readProperty(record, 'actions', 'plan.actions', failures),
      limits.maxActions,
      'plan.actions',
      failures,
      (item, index) => snapshotAction(item, index, limits, failures, targetBudget),
    ),
    blockers: snapshotArray(
      readProperty(record, 'blockers', 'plan.blockers', failures),
      limits.maxBlockers,
      'plan.blockers',
      failures,
      (item, index) => snapshotBlocker(item, index, limits, failures),
    ),
    eligibleActionIds: snapshotArray(
      readProperty(record, 'eligibleActionIds', 'plan.eligibleActionIds', failures),
      limits.maxBucketActionIds,
      'plan.eligibleActionIds',
      failures,
    ),
    noOpActionIds: snapshotArray(
      readProperty(record, 'noOpActionIds', 'plan.noOpActionIds', failures),
      limits.maxBucketActionIds,
      'plan.noOpActionIds',
      failures,
    ),
    reviewActionIds: snapshotArray(
      readProperty(record, 'reviewActionIds', 'plan.reviewActionIds', failures),
      limits.maxBucketActionIds,
      'plan.reviewActionIds',
      failures,
    ),
    refusedActionIds: snapshotArray(
      readProperty(record, 'refusedActionIds', 'plan.refusedActionIds', failures),
      limits.maxBucketActionIds,
      'plan.refusedActionIds',
      failures,
    ),
    planDigest: leaf('planDigest'),
  };
}

function snapshotConfirmation(
  value: unknown,
  limits: P14InputBoundsLimits,
  failures: string[],
): unknown {
  if (value === undefined || value === null) return value;
  const kind = classify(value, 'confirmation', failures);
  if (kind === 'unreadable') return undefined;
  if (kind === 'array') return [];
  if (kind !== 'record') return value;

  const record = value as Record<string, unknown>;
  const leaf = (key: string): unknown => snapshotLeaf(
    readProperty(record, key, `confirmation.${key}`, failures),
    `confirmation.${key}`,
    failures,
  );

  return {
    schemaVersion: leaf('schemaVersion'),
    acceptanceAuthority: leaf('acceptanceAuthority'),
    targetCompatibilityClaim: leaf('targetCompatibilityClaim'),
    confirmedAt: leaf('confirmedAt'),
    planDigest: leaf('planDigest'),
    p13RunId: leaf('p13RunId'),
    source: snapshotSource(
      readProperty(record, 'source', 'confirmation.source', failures),
      'confirmation.source',
      failures,
    ),
    eligibleActionIds: snapshotArray(
      readProperty(record, 'eligibleActionIds', 'confirmation.eligibleActionIds', failures),
      limits.maxBucketActionIds,
      'confirmation.eligibleActionIds',
      failures,
    ),
  };
}

/**
 * Captures the known bounded P14 plan/confirmation contract into plain values after the first
 * resource preflight. Caller-owned nested getters/proxies are never delegated into core semantics.
 */
export function snapshotP14SemanticInputEvidence(
  plan: unknown,
  confirmation: unknown,
  limits: P14InputBoundsLimits,
): P14SemanticInputSnapshotAssessment {
  const failures: string[] = [];
  const planSnapshot = snapshotPlan(plan, limits, failures);
  const confirmationSnapshot = snapshotConfirmation(confirmation, limits, failures);
  return {
    valid: failures.length === 0,
    failures,
    plan: planSnapshot,
    confirmation: confirmationSnapshot,
  };
}
