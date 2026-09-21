import type {
  P14MutationField,
  P14PreparationRecipeDefinition,
} from './p14-preparation-types';
import { P14_VERTICAL_STACK_VALIDATION_PROFILE_ID } from './p14-vertical-stack-validation-profile';

export const P14_RECIPE_QUALIFICATION_SCHEMA_VERSION = 1 as const;
export const P14_VERTICAL_STACK_QUALIFICATION_VERSION = 5 as const;

export const P14_VERTICAL_STACK_PRODUCTION_RECIPE_ID = 'P14_VERTICAL_STACK_V1' as const;
export const P14_VERTICAL_STACK_PRODUCTION_RECIPE_VERSION = 1 as const;
export const P14_VERTICAL_STACK_PRODUCTION_ORDER_CLASS = '10-structure' as const;

export type P14RecipeQualificationBlocker = never;

export interface P14VerticalStackRecipeQualificationV5 {
  schemaVersion: typeof P14_RECIPE_QUALIFICATION_SCHEMA_VERSION;
  qualificationVersion: typeof P14_VERTICAL_STACK_QUALIFICATION_VERSION;
  sourceRuleId: 'BR_SAFE_VERTICAL_STACK_CANDIDATE';
  sourceRuleVersion: 1;
  p5Recipe: 'vertical-stack';
  p5MinimumConfidence: 90;
  requiresP5Decision: 'ELIGIBLE';
  requiresP5ReasonCode: 'SUPPORTED_HIGH_CONFIDENCE';
  mutationAllowlist: readonly P14MutationField[];
  validationProfileId: typeof P14_VERTICAL_STACK_VALIDATION_PROFILE_ID;
  blockers: readonly P14RecipeQualificationBlocker[];
  candidateOnlyRequired: true;
  runtimeAdapterImplemented: true;
  productionRegistryEligible: true;
  productionRegistryBound: true;
  runtimeMutationEnabled: true;
  confirmationEnabled: true;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
}

const VERTICAL_STACK_MUTATION_ALLOWLIST = Object.freeze([
  'layoutMode',
  'primaryAxisSizingMode',
  'counterAxisSizingMode',
  'primaryAxisAlignItems',
  'counterAxisAlignItems',
  'itemSpacing',
  'padding',
] satisfies P14MutationField[]);

const VERTICAL_STACK_BLOCKERS = Object.freeze([] satisfies P14RecipeQualificationBlocker[]);

/**
 * Detached exact recipe contract accepted for the production P14 planning registry.
 * Registry binding does not enable mutation execution, confirmation/UI or acceptance authority.
 */
export function createP14VerticalStackProductionRecipe(): P14PreparationRecipeDefinition {
  return {
    id: P14_VERTICAL_STACK_PRODUCTION_RECIPE_ID,
    version: P14_VERTICAL_STACK_PRODUCTION_RECIPE_VERSION,
    sourceRuleIds: ['BR_SAFE_VERTICAL_STACK_CANDIDATE'],
    minConfidence: 90,
    prerequisites: [],
    mutationAllowlist: [...VERTICAL_STACK_MUTATION_ALLOWLIST],
    validationProfileId: P14_VERTICAL_STACK_VALIDATION_PROFILE_ID,
    conflictsWith: [],
    orderClass: P14_VERTICAL_STACK_PRODUCTION_ORDER_CLASS,
  };
}

/**
 * R1-R6 are implemented for one exact vertical-stack candidate path. Runtime mutation is enabled
 * only behind the internal/dev explicit-confirmation activation boundary; acceptance and target
 * compatibility authority remain false and publishable release UI does not expose this path.
 */
export const P14_VERTICAL_STACK_RECIPE_QUALIFICATION: P14VerticalStackRecipeQualificationV5 =
  Object.freeze({
    schemaVersion: P14_RECIPE_QUALIFICATION_SCHEMA_VERSION,
    qualificationVersion: P14_VERTICAL_STACK_QUALIFICATION_VERSION,
    sourceRuleId: 'BR_SAFE_VERTICAL_STACK_CANDIDATE',
    sourceRuleVersion: 1,
    p5Recipe: 'vertical-stack',
    p5MinimumConfidence: 90,
    requiresP5Decision: 'ELIGIBLE',
    requiresP5ReasonCode: 'SUPPORTED_HIGH_CONFIDENCE',
    mutationAllowlist: VERTICAL_STACK_MUTATION_ALLOWLIST,
    validationProfileId: P14_VERTICAL_STACK_VALIDATION_PROFILE_ID,
    blockers: VERTICAL_STACK_BLOCKERS,
    candidateOnlyRequired: true,
    runtimeAdapterImplemented: true,
    productionRegistryEligible: true,
    productionRegistryBound: true,
    runtimeMutationEnabled: true,
    confirmationEnabled: true,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
  });

export function serializeP14VerticalStackRecipeQualification(): string {
  return JSON.stringify(P14_VERTICAL_STACK_RECIPE_QUALIFICATION, null, 2) + '\n';
}
