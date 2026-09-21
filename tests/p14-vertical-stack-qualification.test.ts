import { describe, expect, it } from 'vitest';
import {
  PRODUCTION_P14_SAFE_RECIPE_REGISTRY,
  createP14SafeRecipeRegistry,
  validateP14SafeRecipeRegistry,
} from '../src/core/p14-safe-recipe-registry';
import {
  P14_VERTICAL_STACK_RECIPE_QUALIFICATION,
  serializeP14VerticalStackRecipeQualification,
} from '../src/core/p14-vertical-stack-qualification';

describe('P14 vertical-stack recipe qualification', () => {
  it('freezes the exact P13/P5 identity and complete bounded P5 write surface', () => {
    expect(P14_VERTICAL_STACK_RECIPE_QUALIFICATION).toEqual({
      schemaVersion: 1,
      qualificationVersion: 2,
      sourceRuleId: 'BR_SAFE_VERTICAL_STACK_CANDIDATE',
      sourceRuleVersion: 1,
      p5Recipe: 'vertical-stack',
      p5MinimumConfidence: 90,
      requiresP5Decision: 'ELIGIBLE',
      requiresP5ReasonCode: 'SUPPORTED_HIGH_CONFIDENCE',
      mutationAllowlist: [
        'layoutMode',
        'primaryAxisSizingMode',
        'counterAxisSizingMode',
        'primaryAxisAlignItems',
        'counterAxisAlignItems',
        'itemSpacing',
        'padding',
      ],
      validationProfileId: 'P14_VALIDATE_VERTICAL_STACK_V1',
      blockers: [
        'P14_RUNTIME_ADAPTER_NOT_WIRED',
        'P14_PRODUCTION_REGISTRY_BINDING_NOT_ACCEPTED',
      ],
      candidateOnlyRequired: true,
      productionRegistryEligible: false,
      runtimeMutationEnabled: false,
      confirmationEnabled: false,
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
    });
  });

  it('serializes deterministically with the accepted profile but without runtime or production authority', () => {
    const first = serializeP14VerticalStackRecipeQualification();
    const second = serializeP14VerticalStackRecipeQualification();

    expect(first).toBe(second);
    expect(first).toContain('"validationProfileId": "P14_VALIDATE_VERTICAL_STACK_V1"');
    expect(first).toContain('"productionRegistryEligible": false');
    expect(first).toContain('"runtimeMutationEnabled": false');
    expect(first).toContain('"acceptanceAuthority": false');
  });

  it('allows the registry vocabulary to describe the full alignment write surface only in an explicit test registry', () => {
    const registry = createP14SafeRecipeRegistry([{
      sourceRuleId: 'TEST_ONLY_RULE',
      sourceRuleVersion: 1,
      recipe: {
        id: 'TEST_ONLY_VERTICAL_STACK',
        version: 1,
        sourceRuleIds: ['TEST_ONLY_RULE'],
        minConfidence: 100,
        prerequisites: [],
        mutationAllowlist: [
          'layoutMode',
          'primaryAxisSizingMode',
          'counterAxisSizingMode',
          'primaryAxisAlignItems',
          'counterAxisAlignItems',
          'itemSpacing',
          'padding',
        ],
        validationProfileId: 'TEST_ONLY_VALIDATION_PROFILE',
        conflictsWith: [],
        orderClass: '10-test-only',
      },
    }]);

    expect(validateP14SafeRecipeRegistry(registry)).toEqual({ valid: true, failures: [] });
  });

  it('keeps production mutation fail-closed after qualification', () => {
    expect(PRODUCTION_P14_SAFE_RECIPE_REGISTRY.bindings).toEqual([]);
    expect(P14_VERTICAL_STACK_RECIPE_QUALIFICATION.productionRegistryEligible).toBe(false);
    expect(P14_VERTICAL_STACK_RECIPE_QUALIFICATION.validationProfileId).toBe('P14_VALIDATE_VERTICAL_STACK_V1');
    expect(P14_VERTICAL_STACK_RECIPE_QUALIFICATION.blockers).not.toContain(
      'P14_VALIDATION_PROFILE_NOT_ACCEPTED',
    );
    expect(P14_VERTICAL_STACK_RECIPE_QUALIFICATION.blockers).toContain(
      'P14_PRODUCTION_REGISTRY_BINDING_NOT_ACCEPTED',
    );
  });
});
