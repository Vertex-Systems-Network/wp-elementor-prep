import { describe, expect, it } from 'vitest';
import { buildP14PreparationPlan } from '../src/core/p14-preparation-plan';
import type { P14PreparationRecipeDefinition } from '../src/core/p14-preparation-types';

function recipe(input: Partial<P14PreparationRecipeDefinition> & Pick<P14PreparationRecipeDefinition, 'id' | 'sourceRuleIds'>): P14PreparationRecipeDefinition {
  return {
    id: input.id,
    version: input.version ?? 1,
    sourceRuleIds: input.sourceRuleIds,
    minConfidence: input.minConfidence ?? 90,
    prerequisites: input.prerequisites ?? [],
    mutationAllowlist: input.mutationAllowlist ?? ['layoutMode'],
    validationProfileId: input.validationProfileId ?? 'P14_TEST_VALIDATION',
    conflictsWith: input.conflictsWith ?? [],
    orderClass: input.orderClass ?? '10-default',
  };
}

function finding(id: string, ruleId: string, recipeId: string) {
  return {
    findingId: id,
    sourceRuleId: ruleId,
    sourceRuleVersion: 1,
    targetNodeIds: [`node:${id}`],
    confidence: 99,
    remediationClass: 'P14_SAFE_CANDIDATE' as const,
    acceptedRecipeId: recipeId,
    acceptedRecipeVersion: 1,
  };
}

describe('P14 recipe dependency ordering', () => {
  it('orders prerequisites before dependents even when orderClass would sort them backwards', () => {
    const parent = recipe({
      id: 'P14_PARENT_STRUCTURE',
      sourceRuleIds: ['RULE_PARENT'],
      orderClass: '99-late-by-label',
    });
    const child = recipe({
      id: 'P14_CHILD_SIZING',
      sourceRuleIds: ['RULE_CHILD'],
      prerequisites: ['P14_PARENT_STRUCTURE'],
      orderClass: '01-early-by-label',
    });

    const plan = buildP14PreparationPlan({
      p13RunId: 'p13-topology',
      sourceNodeId: '1:1',
      sourceFingerprint: 'fp',
      findings: [
        finding('child', 'RULE_CHILD', child.id),
        finding('parent', 'RULE_PARENT', parent.id),
      ],
      recipes: [child, parent],
    });

    expect(plan.status).toBe('READY');
    expect(plan.actions.filter((action) => action.decision === 'ELIGIBLE').map((action) => action.recipeId)).toEqual([
      'P14_PARENT_STRUCTURE',
      'P14_CHILD_SIZING',
    ]);
    expect(plan.eligibleActionIds).toEqual(
      plan.actions.filter((action) => action.decision === 'ELIGIBLE').map((action) => action.actionId),
    );
  });

  it('fails closed when prerequisite recipes form a dependency cycle', () => {
    const recipeA = recipe({
      id: 'P14_A',
      sourceRuleIds: ['RULE_A'],
      prerequisites: ['P14_B'],
    });
    const recipeB = recipe({
      id: 'P14_B',
      sourceRuleIds: ['RULE_B'],
      prerequisites: ['P14_A'],
    });

    const plan = buildP14PreparationPlan({
      p13RunId: 'p13-cycle',
      sourceNodeId: '1:1',
      sourceFingerprint: 'fp',
      findings: [
        finding('a', 'RULE_A', recipeA.id),
        finding('b', 'RULE_B', recipeB.id),
      ],
      recipes: [recipeA, recipeB],
    });

    expect(plan.status).toBe('BLOCKED');
    expect(plan.eligibleActionIds).toEqual([]);
    const cycle = plan.blockers.find((blocker) => blocker.code === 'P14_RECIPE_CONFLICT' && blocker.detail.includes('dependency cycle'));
    expect(cycle).toBeDefined();
    expect(cycle?.actionIds).toHaveLength(2);
  });
});
