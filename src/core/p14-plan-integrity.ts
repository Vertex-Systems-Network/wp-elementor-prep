import {
  P14_PREPARATION_ENGINE_VERSION,
  P14_PREPARATION_SCHEMA_VERSION,
  type P14MutationField,
  type P14PlanBlocker,
  type P14PlanStatus,
  type P14PreparationAction,
  type P14PreparationPlanV1,
} from './p14-preparation-types';

export interface P14PlanIntegrityResult {
  valid: boolean;
  failures: string[];
}

export interface P14DerivedPlanStructure {
  actions: P14PreparationAction[];
  blockers: P14PlanBlocker[];
  status: P14PlanStatus;
  eligibleActionIds: string[];
  noOpActionIds: string[];
  reviewActionIds: string[];
  refusedActionIds: string[];
}

const DECISIONS = new Set(['ELIGIBLE', 'NOOP', 'REVIEW', 'REFUSED']);
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

function fnv1a(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function stableP14Strings(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function compareP14Actions(a: P14PreparationAction, b: P14PreparationAction): number {
  return a.orderClass.localeCompare(b.orderClass)
    || (a.recipeId ?? '').localeCompare(b.recipeId ?? '')
    || a.sourceRuleId.localeCompare(b.sourceRuleId)
    || a.targetNodeIds.join('|').localeCompare(b.targetNodeIds.join('|'))
    || a.findingId.localeCompare(b.findingId)
    || a.actionId.localeCompare(b.actionId);
}

function topologicallyOrderEligibleActions(eligible: P14PreparationAction[]): {
  ordered: P14PreparationAction[];
  cycleActionIds: string[];
} {
  const byId = new Map(eligible.map((action) => [action.actionId, action]));
  const byRecipe = new Map<string, P14PreparationAction[]>();
  for (const action of eligible) {
    if (!action.recipeId) continue;
    const group = byRecipe.get(action.recipeId) ?? [];
    group.push(action);
    group.sort(compareP14Actions);
    byRecipe.set(action.recipeId, group);
  }

  const indegree = new Map(eligible.map((action) => [action.actionId, 0]));
  const outgoing = new Map(eligible.map((action) => [action.actionId, new Set<string>()]));

  for (const action of eligible) {
    for (const prerequisiteRecipeId of action.prerequisiteRecipeIds) {
      const prerequisites = byRecipe.get(prerequisiteRecipeId) ?? [];
      for (const prerequisite of prerequisites) {
        const edges = outgoing.get(prerequisite.actionId);
        if (!edges || edges.has(action.actionId)) continue;
        edges.add(action.actionId);
        indegree.set(action.actionId, (indegree.get(action.actionId) ?? 0) + 1);
      }
    }
  }

  const ready = eligible
    .filter((action) => (indegree.get(action.actionId) ?? 0) === 0)
    .sort(compareP14Actions);
  const ordered: P14PreparationAction[] = [];

  while (ready.length > 0) {
    const current = ready.shift();
    if (!current) break;
    ordered.push(current);
    const dependents = [...(outgoing.get(current.actionId) ?? [])]
      .map((id) => byId.get(id))
      .filter((action): action is P14PreparationAction => Boolean(action))
      .sort(compareP14Actions);
    for (const dependent of dependents) {
      const next = (indegree.get(dependent.actionId) ?? 0) - 1;
      indegree.set(dependent.actionId, next);
      if (next === 0) {
        ready.push(dependent);
        ready.sort(compareP14Actions);
      }
    }
  }

  const orderedIds = new Set(ordered.map((action) => action.actionId));
  const cycleActionIds = eligible
    .filter((action) => !orderedIds.has(action.actionId))
    .map((action) => action.actionId)
    .sort();
  return { ordered, cycleActionIds };
}

export function deriveP14PlanStructure(rawActions: P14PreparationAction[]): P14DerivedPlanStructure {
  const canonicalInput = [...rawActions];
  const blockers: P14PlanBlocker[] = [];
  const eligible = canonicalInput.filter((action) => action.decision === 'ELIGIBLE');
  const eligibleRecipeIds = new Set(eligible.flatMap((action) => action.recipeId ? [action.recipeId] : []));

  for (const action of eligible) {
    const missing = action.prerequisiteRecipeIds.filter((recipeId) => !eligibleRecipeIds.has(recipeId));
    if (missing.length > 0) {
      blockers.push({
        code: 'P14_RECIPE_PREREQUISITE_MISSING',
        detail: `Action ${action.actionId} is missing prerequisite recipe(s): ${missing.join(', ')}.`,
        actionIds: [action.actionId],
      });
    }
  }

  for (let index = 0; index < eligible.length; index += 1) {
    const left = eligible[index];
    if (!left?.recipeId) continue;
    for (let otherIndex = index + 1; otherIndex < eligible.length; otherIndex += 1) {
      const right = eligible[otherIndex];
      if (!right?.recipeId) continue;
      const conflict = left.conflictsWithRecipeIds.includes(right.recipeId)
        || right.conflictsWithRecipeIds.includes(left.recipeId);
      if (!conflict) continue;
      blockers.push({
        code: 'P14_RECIPE_CONFLICT',
        detail: `Recipe ${left.recipeId} conflicts with ${right.recipeId}.`,
        actionIds: [left.actionId, right.actionId].sort(),
      });
    }
  }

  const topological = topologicallyOrderEligibleActions(eligible);
  if (topological.cycleActionIds.length > 0) {
    blockers.push({
      code: 'P14_RECIPE_CONFLICT',
      detail: 'Recipe prerequisite graph contains a dependency cycle; safe sequential ordering is impossible.',
      actionIds: topological.cycleActionIds,
    });
  }

  const review = canonicalInput.filter((action) => action.decision === 'REVIEW').sort(compareP14Actions);
  const refused = canonicalInput.filter((action) => action.decision === 'REFUSED').sort(compareP14Actions);
  const noops = canonicalInput.filter((action) => action.decision === 'NOOP').sort(compareP14Actions);
  const cycleIds = new Set(topological.cycleActionIds);
  const cyclicEligible = eligible.filter((action) => cycleIds.has(action.actionId)).sort(compareP14Actions);
  const actions = [...topological.ordered, ...cyclicEligible, ...noops, ...review, ...refused];

  if (eligible.length === 0 && (review.length > 0 || refused.length > 0 || noops.length === 0)) {
    blockers.push({
      code: 'P14_NO_ELIGIBLE_RECIPES',
      detail: 'No accepted mutating recipe is eligible for this plan.',
      actionIds: [...review, ...refused].map((action) => action.actionId).sort(),
    });
  }

  blockers.sort((a, b) => a.code.localeCompare(b.code) || a.actionIds.join('|').localeCompare(b.actionIds.join('|')));
  const status: P14PlanStatus = blockers.length > 0
    ? 'BLOCKED'
    : eligible.length > 0
      ? 'READY'
      : 'NO_CHANGES_NEEDED';

  return {
    actions,
    blockers,
    status,
    eligibleActionIds: topological.ordered.map((action) => action.actionId),
    noOpActionIds: noops.map((action) => action.actionId),
    reviewActionIds: review.map((action) => action.actionId),
    refusedActionIds: refused.map((action) => action.actionId),
  };
}

export function computeP14PlanDigest(input: {
  p13RunId: string;
  sourceNodeId: string;
  sourceFingerprint: string;
  actions: P14PreparationAction[];
}): string {
  const canonical = {
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    p13RunId: input.p13RunId,
    sourceNodeId: input.sourceNodeId,
    sourceFingerprint: input.sourceFingerprint,
    actions: input.actions.map((action) => ({
      ...action,
      targetNodeIds: stableP14Strings(action.targetNodeIds),
      prerequisiteRecipeIds: stableP14Strings(action.prerequisiteRecipeIds),
      conflictsWithRecipeIds: stableP14Strings(action.conflictsWithRecipeIds),
      mutationAllowlist: [...action.mutationAllowlist].sort(),
    })),
  };
  return `p14-plan-${fnv1a(JSON.stringify(canonical))}`;
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function validateAction(value: unknown, index: number, failures: string[]): value is P14PreparationAction {
  if (!isRecord(value)) {
    failures.push(`actions[${index}] must be an object.`);
    return false;
  }
  const prefix = `actions[${index}]`;
  if (!isNonEmptyString(value.actionId)) failures.push(`${prefix}.actionId is missing.`);
  if (!isNonEmptyString(value.findingId)) failures.push(`${prefix}.findingId is missing.`);
  if (!isNonEmptyString(value.sourceRuleId)) failures.push(`${prefix}.sourceRuleId is missing.`);
  if (!Number.isInteger(value.sourceRuleVersion) || Number(value.sourceRuleVersion) < 1) {
    failures.push(`${prefix}.sourceRuleVersion must be a positive integer.`);
  }
  if (!isStringArray(value.targetNodeIds) || value.targetNodeIds.length !== stableP14Strings(value.targetNodeIds).length) {
    failures.push(`${prefix}.targetNodeIds must be a duplicate-free string array.`);
  } else if (!sameJson(value.targetNodeIds, stableP14Strings(value.targetNodeIds))) {
    failures.push(`${prefix}.targetNodeIds are not canonically ordered.`);
  }
  if (!Number.isFinite(value.confidence) || Number(value.confidence) < 0 || Number(value.confidence) > 100) {
    failures.push(`${prefix}.confidence must be between 0 and 100.`);
  }
  if (typeof value.decision !== 'string' || !DECISIONS.has(value.decision)) {
    failures.push(`${prefix}.decision is unsupported.`);
  }
  if (!isNonEmptyString(value.orderClass)) failures.push(`${prefix}.orderClass is missing.`);
  if (!isStringArray(value.prerequisiteRecipeIds)
    || !sameJson(value.prerequisiteRecipeIds, stableP14Strings(value.prerequisiteRecipeIds))) {
    failures.push(`${prefix}.prerequisiteRecipeIds must be canonical unique strings.`);
  }
  if (!isStringArray(value.conflictsWithRecipeIds)
    || !sameJson(value.conflictsWithRecipeIds, stableP14Strings(value.conflictsWithRecipeIds))) {
    failures.push(`${prefix}.conflictsWithRecipeIds must be canonical unique strings.`);
  }
  if (!Array.isArray(value.mutationAllowlist)
    || !value.mutationAllowlist.every((item) => typeof item === 'string' && MUTATION_FIELDS.has(item as P14MutationField))
    || new Set(value.mutationAllowlist).size !== value.mutationAllowlist.length) {
    failures.push(`${prefix}.mutationAllowlist contains an unsupported or duplicate field.`);
  }

  if (value.decision === 'ELIGIBLE') {
    if (!isNonEmptyString(value.recipeId)) failures.push(`${prefix}.recipeId is required for ELIGIBLE actions.`);
    if (!Number.isInteger(value.recipeVersion) || Number(value.recipeVersion) < 1) {
      failures.push(`${prefix}.recipeVersion must be a positive integer for ELIGIBLE actions.`);
    }
    if (!isNonEmptyString(value.validationProfileId)) {
      failures.push(`${prefix}.validationProfileId is required for ELIGIBLE actions.`);
    }
    if (value.refusalCode !== null) failures.push(`${prefix}.refusalCode must be null for ELIGIBLE actions.`);
    if (!Array.isArray(value.targetNodeIds) || value.targetNodeIds.length === 0) {
      failures.push(`${prefix}.targetNodeIds cannot be empty for ELIGIBLE actions.`);
    }
  }
  if (value.decision === 'NOOP' && value.refusalCode !== null) {
    failures.push(`${prefix}.refusalCode must be null for NOOP actions.`);
  }
  if (value.decision === 'REVIEW' && value.mutationAllowlist && Array.isArray(value.mutationAllowlist) && value.mutationAllowlist.length > 0) {
    failures.push(`${prefix}.REVIEW actions cannot carry a mutation allowlist.`);
  }
  return true;
}

function normalizeBlockers(blockers: P14PlanBlocker[]): P14PlanBlocker[] {
  return blockers.map((blocker) => ({
    code: blocker.code,
    detail: blocker.detail,
    actionIds: [...blocker.actionIds],
  }));
}

export function validateP14PreparationPlan(value: unknown): P14PlanIntegrityResult {
  const failures: string[] = [];
  if (!isRecord(value)) return { valid: false, failures: ['P14 plan must be an object.'] };
  if (value.schemaVersion !== P14_PREPARATION_SCHEMA_VERSION) failures.push('Unsupported P14 plan schema version.');
  if (value.engineVersion !== P14_PREPARATION_ENGINE_VERSION) failures.push('Unsupported P14 preparation engine version.');
  if (!isNonEmptyString(value.p13RunId)) failures.push('p13RunId is missing.');
  if (!isRecord(value.source)
    || !isNonEmptyString(value.source.nodeId)
    || !isNonEmptyString(value.source.fingerprint)) {
    failures.push('Source node identity/fingerprint is missing.');
  }
  if (!Array.isArray(value.actions)) failures.push('actions must be an array.');
  if (!Array.isArray(value.blockers)) failures.push('blockers must be an array.');
  for (const field of ['eligibleActionIds', 'noOpActionIds', 'reviewActionIds', 'refusedActionIds'] as const) {
    if (!isStringArray(value[field])) failures.push(`${field} must be a string array.`);
  }
  if (!isNonEmptyString(value.planDigest)) failures.push('planDigest is missing.');

  if (failures.length > 0 || !Array.isArray(value.actions) || !isRecord(value.source)) {
    return { valid: false, failures };
  }

  const actions: P14PreparationAction[] = [];
  value.actions.forEach((action, index) => {
    if (validateAction(action, index, failures)) actions.push(action);
  });
  const actionIds = actions.map((action) => action.actionId);
  if (new Set(actionIds).size !== actionIds.length) failures.push('P14 plan contains duplicate action IDs.');

  const derived = deriveP14PlanStructure(actions);
  if (!sameJson(actions.map((action) => action.actionId), derived.actions.map((action) => action.actionId))) {
    failures.push('P14 action order is not the canonical dependency/topological order.');
  }
  if (value.status !== derived.status) failures.push(`Plan status contradicts derived status ${derived.status}.`);
  if (!sameJson(value.eligibleActionIds, derived.eligibleActionIds)) failures.push('eligibleActionIds contradict the canonical plan.');
  if (!sameJson(value.noOpActionIds, derived.noOpActionIds)) failures.push('noOpActionIds contradict the canonical plan.');
  if (!sameJson(value.reviewActionIds, derived.reviewActionIds)) failures.push('reviewActionIds contradict the canonical plan.');
  if (!sameJson(value.refusedActionIds, derived.refusedActionIds)) failures.push('refusedActionIds contradict the canonical plan.');

  if (Array.isArray(value.blockers)) {
    const blockerShapeOkay = value.blockers.every((blocker) => isRecord(blocker)
      && isNonEmptyString(blocker.code)
      && isNonEmptyString(blocker.detail)
      && isStringArray(blocker.actionIds));
    if (!blockerShapeOkay) failures.push('blockers contain a malformed entry.');
    else if (!sameJson(value.blockers, normalizeBlockers(derived.blockers))) {
      failures.push('Plan blockers contradict the canonical plan analysis.');
    }
  }

  const expectedDigest = computeP14PlanDigest({
    p13RunId: String(value.p13RunId),
    sourceNodeId: String(value.source.nodeId),
    sourceFingerprint: String(value.source.fingerprint),
    actions,
  });
  if (value.planDigest !== expectedDigest) failures.push('planDigest does not match the canonical P14 plan content.');

  return { valid: failures.length === 0, failures };
}
