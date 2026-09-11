import {
  P14_PREPARATION_ENGINE_VERSION,
  P14_PREPARATION_SCHEMA_VERSION,
  type P14PlanBlocker,
  type P14PreparationAction,
  type P14PreparationFindingInput,
  type P14PreparationPlanV1,
  type P14PreparationRecipeDefinition,
} from './p14-preparation-types';

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function fnv1a(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function stableStrings(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function actionSort(a: P14PreparationAction, b: P14PreparationAction): number {
  return a.orderClass.localeCompare(b.orderClass)
    || (a.recipeId ?? '').localeCompare(b.recipeId ?? '')
    || a.sourceRuleId.localeCompare(b.sourceRuleId)
    || a.targetNodeIds.join('|').localeCompare(b.targetNodeIds.join('|'))
    || a.findingId.localeCompare(b.findingId);
}

function actionId(input: P14PreparationFindingInput): string {
  const canonical = JSON.stringify({
    findingId: input.findingId,
    sourceRuleId: input.sourceRuleId,
    sourceRuleVersion: input.sourceRuleVersion,
    targetNodeIds: stableStrings(input.targetNodeIds),
    remediationClass: input.remediationClass,
    recipeId: input.acceptedRecipeId ?? null,
    recipeVersion: input.acceptedRecipeVersion ?? null,
  });
  return `p14-action-${fnv1a(canonical)}`;
}

function reviewAction(input: P14PreparationFindingInput): P14PreparationAction {
  return {
    actionId: actionId(input),
    findingId: input.findingId,
    decision: 'REVIEW',
    sourceRuleId: input.sourceRuleId,
    sourceRuleVersion: input.sourceRuleVersion,
    targetNodeIds: stableStrings(input.targetNodeIds),
    confidence: clampConfidence(input.confidence),
    recipeId: null,
    recipeVersion: null,
    orderClass: 'review',
    prerequisiteRecipeIds: [],
    conflictsWithRecipeIds: [],
    mutationAllowlist: [],
    validationProfileId: null,
    refusalCode: input.refusalCode ?? input.remediationClass,
  };
}

function refusedAction(
  input: P14PreparationFindingInput,
  refusalCode: string,
  recipe?: P14PreparationRecipeDefinition,
): P14PreparationAction {
  return {
    actionId: actionId(input),
    findingId: input.findingId,
    decision: 'REFUSED',
    sourceRuleId: input.sourceRuleId,
    sourceRuleVersion: input.sourceRuleVersion,
    targetNodeIds: stableStrings(input.targetNodeIds),
    confidence: clampConfidence(input.confidence),
    recipeId: recipe?.id ?? input.acceptedRecipeId ?? null,
    recipeVersion: recipe?.version ?? input.acceptedRecipeVersion ?? null,
    orderClass: recipe?.orderClass ?? 'refused',
    prerequisiteRecipeIds: stableStrings(recipe?.prerequisites ?? []),
    conflictsWithRecipeIds: stableStrings(recipe?.conflictsWith ?? []),
    mutationAllowlist: [...(recipe?.mutationAllowlist ?? [])],
    validationProfileId: recipe?.validationProfileId ?? null,
    refusalCode,
  };
}

function findingToAction(
  input: P14PreparationFindingInput,
  registry: Map<string, P14PreparationRecipeDefinition>,
): P14PreparationAction {
  if (input.remediationClass === 'P14_SAFE_NOOP') {
    return {
      actionId: actionId(input),
      findingId: input.findingId,
      decision: 'NOOP',
      sourceRuleId: input.sourceRuleId,
      sourceRuleVersion: input.sourceRuleVersion,
      targetNodeIds: stableStrings(input.targetNodeIds),
      confidence: clampConfidence(input.confidence),
      recipeId: input.acceptedRecipeId ?? null,
      recipeVersion: input.acceptedRecipeVersion ?? null,
      orderClass: 'noop',
      prerequisiteRecipeIds: [],
      conflictsWithRecipeIds: [],
      mutationAllowlist: [],
      validationProfileId: null,
      refusalCode: null,
    };
  }

  if (input.remediationClass === 'ADVISORY' || input.remediationClass === 'MANUAL_REVIEW') {
    return reviewAction(input);
  }

  if (input.remediationClass !== 'P14_SAFE_CANDIDATE') {
    return refusedAction(input, input.refusalCode ?? 'P14_UNSUPPORTED_REMEDIATION_CLASS');
  }

  if (!input.acceptedRecipeId || !Number.isInteger(input.acceptedRecipeVersion)) {
    return refusedAction(input, 'P14_RECIPE_VERSION_MISMATCH');
  }

  const recipe = registry.get(input.acceptedRecipeId);
  if (!recipe || recipe.version !== input.acceptedRecipeVersion) {
    return refusedAction(input, 'P14_RECIPE_VERSION_MISMATCH', recipe);
  }
  if (!recipe.sourceRuleIds.includes(input.sourceRuleId)) {
    return refusedAction(input, 'P14_RECIPE_RULE_MISMATCH', recipe);
  }
  if (clampConfidence(input.confidence) < recipe.minConfidence) {
    return refusedAction(input, 'P14_BELOW_CONFIDENCE_GATE', recipe);
  }
  if (input.targetNodeIds.length === 0) {
    return refusedAction(input, 'P14_INSUFFICIENT_TARGET_CONTEXT', recipe);
  }

  return {
    actionId: actionId(input),
    findingId: input.findingId,
    decision: 'ELIGIBLE',
    sourceRuleId: input.sourceRuleId,
    sourceRuleVersion: input.sourceRuleVersion,
    targetNodeIds: stableStrings(input.targetNodeIds),
    confidence: clampConfidence(input.confidence),
    recipeId: recipe.id,
    recipeVersion: recipe.version,
    orderClass: recipe.orderClass,
    prerequisiteRecipeIds: stableStrings(recipe.prerequisites),
    conflictsWithRecipeIds: stableStrings(recipe.conflictsWith),
    mutationAllowlist: [...recipe.mutationAllowlist],
    validationProfileId: recipe.validationProfileId,
    refusalCode: null,
  };
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
    group.sort(actionSort);
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
    .sort(actionSort);
  const ordered: P14PreparationAction[] = [];

  while (ready.length > 0) {
    const current = ready.shift();
    if (!current) break;
    ordered.push(current);
    const dependents = [...(outgoing.get(current.actionId) ?? [])]
      .map((id) => byId.get(id))
      .filter((action): action is P14PreparationAction => Boolean(action))
      .sort(actionSort);
    for (const dependent of dependents) {
      const next = (indegree.get(dependent.actionId) ?? 0) - 1;
      indegree.set(dependent.actionId, next);
      if (next === 0) {
        ready.push(dependent);
        ready.sort(actionSort);
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

function planDigest(input: {
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
      targetNodeIds: stableStrings(action.targetNodeIds),
      prerequisiteRecipeIds: stableStrings(action.prerequisiteRecipeIds),
      conflictsWithRecipeIds: stableStrings(action.conflictsWithRecipeIds),
      mutationAllowlist: [...action.mutationAllowlist].sort(),
    })),
  };
  return `p14-plan-${fnv1a(JSON.stringify(canonical))}`;
}

export function buildP14PreparationPlan(input: {
  p13RunId: string;
  sourceNodeId: string;
  sourceFingerprint: string;
  findings: P14PreparationFindingInput[];
  recipes: P14PreparationRecipeDefinition[];
}): P14PreparationPlanV1 {
  const registry = new Map(input.recipes.map((recipe) => [recipe.id, recipe]));
  const rawActions = input.findings.map((finding) => findingToAction(finding, registry)).sort(actionSort);
  const blockers: P14PlanBlocker[] = [];
  const eligible = rawActions.filter((action) => action.decision === 'ELIGIBLE');
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
      if (conflict) {
        blockers.push({
          code: 'P14_RECIPE_CONFLICT',
          detail: `Recipe ${left.recipeId} conflicts with ${right.recipeId}.`,
          actionIds: [left.actionId, right.actionId].sort(),
        });
      }
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

  const review = rawActions.filter((action) => action.decision === 'REVIEW').sort(actionSort);
  const refused = rawActions.filter((action) => action.decision === 'REFUSED').sort(actionSort);
  const noops = rawActions.filter((action) => action.decision === 'NOOP').sort(actionSort);
  const cycleIds = new Set(topological.cycleActionIds);
  const cyclicEligible = eligible.filter((action) => cycleIds.has(action.actionId)).sort(actionSort);
  const actions = [...topological.ordered, ...cyclicEligible, ...noops, ...review, ...refused];

  if (eligible.length === 0 && (review.length > 0 || refused.length > 0 || noops.length === 0)) {
    blockers.push({
      code: 'P14_NO_ELIGIBLE_RECIPES',
      detail: 'No accepted mutating recipe is eligible for this plan.',
      actionIds: [...review, ...refused].map((action) => action.actionId).sort(),
    });
  }

  blockers.sort((a, b) => a.code.localeCompare(b.code) || a.actionIds.join('|').localeCompare(b.actionIds.join('|')));
  const status = blockers.length > 0
    ? 'BLOCKED'
    : eligible.length > 0
      ? 'READY'
      : 'NO_CHANGES_NEEDED';

  return {
    schemaVersion: P14_PREPARATION_SCHEMA_VERSION,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    p13RunId: input.p13RunId,
    source: {
      nodeId: input.sourceNodeId,
      fingerprint: input.sourceFingerprint,
    },
    status,
    actions,
    blockers,
    eligibleActionIds: topological.ordered.map((action) => action.actionId),
    noOpActionIds: noops.map((action) => action.actionId),
    reviewActionIds: review.map((action) => action.actionId),
    refusedActionIds: refused.map((action) => action.actionId),
    planDigest: planDigest({
      p13RunId: input.p13RunId,
      sourceNodeId: input.sourceNodeId,
      sourceFingerprint: input.sourceFingerprint,
      actions,
    }),
  };
}
