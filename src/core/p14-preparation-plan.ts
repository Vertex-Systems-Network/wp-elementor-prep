import {
  computeP14PlanDigest,
  deriveP14PlanStructure,
  stableP14Strings,
} from './p14-plan-integrity';
import {
  P14_PREPARATION_ENGINE_VERSION,
  P14_PREPARATION_SCHEMA_VERSION,
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

function actionId(input: P14PreparationFindingInput): string {
  const canonical = JSON.stringify({
    findingId: input.findingId,
    sourceRuleId: input.sourceRuleId,
    sourceRuleVersion: input.sourceRuleVersion,
    targetNodeIds: stableP14Strings(input.targetNodeIds),
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
    targetNodeIds: stableP14Strings(input.targetNodeIds),
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
    targetNodeIds: stableP14Strings(input.targetNodeIds),
    confidence: clampConfidence(input.confidence),
    recipeId: recipe?.id ?? input.acceptedRecipeId ?? null,
    recipeVersion: recipe?.version ?? input.acceptedRecipeVersion ?? null,
    orderClass: recipe?.orderClass ?? 'refused',
    prerequisiteRecipeIds: stableP14Strings(recipe?.prerequisites ?? []),
    conflictsWithRecipeIds: stableP14Strings(recipe?.conflictsWith ?? []),
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
      targetNodeIds: stableP14Strings(input.targetNodeIds),
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
    targetNodeIds: stableP14Strings(input.targetNodeIds),
    confidence: clampConfidence(input.confidence),
    recipeId: recipe.id,
    recipeVersion: recipe.version,
    orderClass: recipe.orderClass,
    prerequisiteRecipeIds: stableP14Strings(recipe.prerequisites),
    conflictsWithRecipeIds: stableP14Strings(recipe.conflictsWith),
    mutationAllowlist: [...recipe.mutationAllowlist],
    validationProfileId: recipe.validationProfileId,
    refusalCode: null,
  };
}

export function buildP14PreparationPlan(input: {
  p13RunId: string;
  sourceNodeId: string;
  sourceFingerprint: string;
  findings: P14PreparationFindingInput[];
  recipes: P14PreparationRecipeDefinition[];
}): P14PreparationPlanV1 {
  const registry = new Map(input.recipes.map((recipe) => [recipe.id, recipe]));
  const rawActions = input.findings.map((finding) => findingToAction(finding, registry));
  const derived = deriveP14PlanStructure(rawActions);
  const planDigest = computeP14PlanDigest({
    p13RunId: input.p13RunId,
    sourceNodeId: input.sourceNodeId,
    sourceFingerprint: input.sourceFingerprint,
    actions: derived.actions,
  });

  return {
    schemaVersion: P14_PREPARATION_SCHEMA_VERSION,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    p13RunId: input.p13RunId,
    source: {
      nodeId: input.sourceNodeId,
      fingerprint: input.sourceFingerprint,
    },
    status: derived.status,
    actions: derived.actions,
    blockers: derived.blockers,
    eligibleActionIds: derived.eligibleActionIds,
    noOpActionIds: derived.noOpActionIds,
    reviewActionIds: derived.reviewActionIds,
    refusedActionIds: derived.refusedActionIds,
    planDigest,
  };
}
