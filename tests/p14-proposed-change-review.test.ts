import { describe, expect, it } from 'vitest';
import {
  computeP14PlanDigest,
  deriveP14PlanStructure,
} from '../src/core/p14-plan-integrity';
import {
  P14_PREPARATION_ENGINE_VERSION,
  P14_PREPARATION_SCHEMA_VERSION,
  type P14PreparationAction,
  type P14PreparationPlanV1,
} from '../src/core/p14-preparation-types';
import { buildP14ProposedChangeReviewManifest } from '../src/plugin/p14-proposed-change-review';

function eligibleAction(overrides: Partial<P14PreparationAction> = {}): P14PreparationAction {
  return {
    actionId: 'action-a',
    findingId: 'finding-a',
    decision: 'ELIGIBLE',
    sourceRuleId: 'BR_RULE_A',
    sourceRuleVersion: 1,
    targetNodeIds: ['node-a'],
    confidence: 97,
    recipeId: 'recipe-a',
    recipeVersion: 1,
    orderClass: '10-layout',
    prerequisiteRecipeIds: [],
    conflictsWithRecipeIds: [],
    mutationAllowlist: ['layoutMode', 'itemSpacing'],
    validationProfileId: 'profile-a',
    refusalCode: null,
    ...overrides,
  };
}

function validPlan(): P14PreparationPlanV1 {
  const rawActions: P14PreparationAction[] = [
    eligibleAction(),
    eligibleAction({
      actionId: 'action-b',
      findingId: 'finding-b',
      sourceRuleId: 'BR_RULE_B',
      targetNodeIds: ['node-b', 'node-c'],
      confidence: 94,
      recipeId: 'recipe-b',
      recipeVersion: 2,
      orderClass: '20-sizing',
      prerequisiteRecipeIds: ['recipe-a'],
      mutationAllowlist: ['layoutSizing'],
      validationProfileId: 'profile-b',
    }),
  ];
  const structure = deriveP14PlanStructure(rawActions);
  const p13RunId = 'p13-current-run';
  const source = {
    nodeId: 'frame-1',
    fingerprint: 'structural-fingerprint-1',
  };
  return {
    schemaVersion: P14_PREPARATION_SCHEMA_VERSION,
    engineVersion: P14_PREPARATION_ENGINE_VERSION,
    p13RunId,
    source,
    status: structure.status,
    actions: structure.actions,
    blockers: structure.blockers,
    eligibleActionIds: structure.eligibleActionIds,
    noOpActionIds: structure.noOpActionIds,
    reviewActionIds: structure.reviewActionIds,
    refusedActionIds: structure.refusedActionIds,
    planDigest: computeP14PlanDigest({
      p13RunId,
      sourceNodeId: source.nodeId,
      sourceFingerprint: source.fingerprint,
      actions: structure.actions,
    }),
  };
}

describe('P14 proposed-change review manifest', () => {
  it('binds exact reviewed-plan identity and canonical eligible action order', () => {
    const plan = validPlan();
    const manifest = buildP14ProposedChangeReviewManifest(plan);

    expect(manifest).not.toBeNull();
    expect(manifest?.binding).toEqual({
      p13RunId: plan.p13RunId,
      source: plan.source,
      planDigest: plan.planDigest,
      eligibleActionIds: plan.eligibleActionIds,
    });
    expect(manifest?.actions.map((action) => action.actionId)).toEqual(plan.eligibleActionIds);
    expect(manifest?.actions[1]).toMatchObject({
      actionId: 'action-b',
      recipeId: 'recipe-b',
      recipeVersion: 2,
      prerequisiteRecipeIds: ['recipe-a'],
      mutationAllowlist: ['layoutSizing'],
      validationProfileId: 'profile-b',
      targetNodeIds: ['node-b', 'node-c'],
    });
  });

  it('is explicitly non-authorizing', () => {
    const manifest = buildP14ProposedChangeReviewManifest(validPlan());

    expect(manifest).toMatchObject({
      schemaVersion: 1,
      reviewVersion: 1,
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
      mutationEnabled: false,
      confirmationEnabled: false,
    });
  });

  it('detaches review binding and action collections from the source plan', () => {
    const plan = validPlan();
    const manifest = buildP14ProposedChangeReviewManifest(plan);
    expect(manifest).not.toBeNull();

    plan.p13RunId = 'mutated-run';
    plan.source.nodeId = 'mutated-frame';
    plan.source.fingerprint = 'mutated-fingerprint';
    plan.eligibleActionIds.push('mutated-action');
    plan.actions[0]?.targetNodeIds.push('mutated-node');
    plan.actions[0]?.prerequisiteRecipeIds.push('mutated-prerequisite');
    plan.actions[0]?.mutationAllowlist.push('padding');

    expect(manifest?.binding.p13RunId).toBe('p13-current-run');
    expect(manifest?.binding.source).toEqual({
      nodeId: 'frame-1',
      fingerprint: 'structural-fingerprint-1',
    });
    expect(manifest?.binding.eligibleActionIds).toEqual(['action-a', 'action-b']);
    expect(manifest?.actions[0]?.targetNodeIds).toEqual(['node-a']);
    expect(manifest?.actions[0]?.prerequisiteRecipeIds).toEqual([]);
    expect(manifest?.actions[0]?.mutationAllowlist).toEqual(['layoutMode', 'itemSpacing']);
  });

  it('fails closed for null or integrity-invalid plans', () => {
    expect(buildP14ProposedChangeReviewManifest(null)).toBeNull();

    const plan = validPlan();
    plan.planDigest = 'stale-digest';
    expect(buildP14ProposedChangeReviewManifest(plan)).toBeNull();
  });
});
