import type { P14MutationField } from './p14-preparation-types';

export const P14_RECIPE_QUALIFICATION_SCHEMA_VERSION = 1 as const;
export const P14_VERTICAL_STACK_QUALIFICATION_VERSION = 1 as const;

export type P14RecipeQualificationBlocker =
  | 'P14_VALIDATION_PROFILE_NOT_ACCEPTED'
  | 'P14_RUNTIME_ADAPTER_NOT_WIRED'
  | 'P14_PRODUCTION_REGISTRY_BINDING_NOT_ACCEPTED';

export interface P14VerticalStackRecipeQualificationV1 {
  schemaVersion: typeof P14_RECIPE_QUALIFICATION_SCHEMA_VERSION;
  qualificationVersion: typeof P14_VERTICAL_STACK_QUALIFICATION_VERSION;
  sourceRuleId: 'BR_SAFE_VERTICAL_STACK_CANDIDATE';
  sourceRuleVersion: 1;
  p5Recipe: 'vertical-stack';
  p5MinimumConfidence: 90;
  requiresP5Decision: 'ELIGIBLE';
  requiresP5ReasonCode: 'SUPPORTED_HIGH_CONFIDENCE';
  mutationAllowlist: readonly P14MutationField[];
  validationProfileId: null;
  blockers: readonly P14RecipeQualificationBlocker[];
  candidateOnlyRequired: true;
  productionRegistryEligible: false;
  runtimeMutationEnabled: false;
  confirmationEnabled: false;
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

const VERTICAL_STACK_BLOCKERS = Object.freeze([
  'P14_VALIDATION_PROFILE_NOT_ACCEPTED',
  'P14_RUNTIME_ADAPTER_NOT_WIRED',
  'P14_PRODUCTION_REGISTRY_BINDING_NOT_ACCEPTED',
] satisfies P14RecipeQualificationBlocker[]);

/**
 * Machine-readable qualification only. This contract freezes the exact already-proven P5
 * vertical-stack write surface that P14 would need to authorize in a future slice.
 *
 * It intentionally cannot be inserted into P14PreparationRecipeDefinition because no P14
 * validation profile has been accepted yet. Production registry activation and plugin mutation
 * wiring therefore remain separate fail-closed gates.
 */
export const P14_VERTICAL_STACK_RECIPE_QUALIFICATION: P14VerticalStackRecipeQualificationV1 =
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
    validationProfileId: null,
    blockers: VERTICAL_STACK_BLOCKERS,
    candidateOnlyRequired: true,
    productionRegistryEligible: false,
    runtimeMutationEnabled: false,
    confirmationEnabled: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
  });

export function serializeP14VerticalStackRecipeQualification(): string {
  return `${JSON.stringify(P14_VERTICAL_STACK_RECIPE_QUALIFICATION, null, 2)}\n`;
}
