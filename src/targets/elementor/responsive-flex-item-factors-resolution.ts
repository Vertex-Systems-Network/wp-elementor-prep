import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { binaryFlexFactorCodec } from './mapping-engine/families/responsive-flex-item-sizing';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION =
  'p15-elementor-responsive-flex-item-factors-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_RESULT_VERSION =
  'p15-elementor-responsive-flex-item-factors-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  flexItemSourcePath: 'includes/controls/groups/flex-item.php',
  flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
  qunitFixturePath: 'tests/qunit/mock/elments/container.json',
  qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: '_flex',
  growControlName: 'grow',
  shrinkControlName: 'shrink',
  desktopGrowSettingKey: '_flex_grow',
  tabletGrowSettingKey: '_flex_grow_tablet',
  mobileGrowSettingKey: '_flex_grow_mobile',
  desktopShrinkSettingKey: '_flex_shrink',
  tabletShrinkSettingKey: '_flex_shrink_tablet',
  mobileShrinkSettingKey: '_flex_shrink_mobile',
  acceptedFactors: [0, 1] as const,
});

export type P15ElementorBinaryFlexFactor = 0 | 1;

export interface P15ElementorResponsiveFlexItemFactorsEntryV1 {
  sourceNodeId: string;
  tabletGrow?: P15ElementorBinaryFlexFactor;
  mobileGrow?: P15ElementorBinaryFlexFactor;
  tabletShrink?: P15ElementorBinaryFlexFactor;
  mobileShrink?: P15ElementorBinaryFlexFactor;
}

export interface P15ElementorResponsiveFlexItemFactorsManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveFlexItemFactorsEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveFlexItemFactorsIssueCode =
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_ENTRY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_VALUE_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveFlexItemFactorsIssueV1 {
  code: P15ElementorResponsiveFlexItemFactorsIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveFlexItemFactorsStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_FLEX_ITEM_FACTOR_OVERRIDES'
  | 'RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED';

export interface P15ElementorResponsiveFlexItemFactorsSummaryEntryV1 {
  sourceNodeId: string;
  tabletGrow: P15ElementorBinaryFlexFactor | null;
  mobileGrow: P15ElementorBinaryFlexFactor | null;
  tabletShrink: P15ElementorBinaryFlexFactor | null;
  mobileShrink: P15ElementorBinaryFlexFactor | null;
}

export interface P15ElementorResponsiveFlexItemFactorsResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemFactorsStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedFactors: P15ElementorResponsiveFlexItemFactorsSummaryEntryV1[];
  issues: P15ElementorResponsiveFlexItemFactorsIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE;
const conflictMessage = (settingKey: string): string =>
  `Generated base candidate already contains requested responsive flex-item factor key ${settingKey}.`;
const factor = (field: string, settingKey: string) => ({
  field, settingKey, codec: binaryFlexFactorCodec, conflictSubject: field, conflictMessage: conflictMessage(settingKey),
});
const FAMILY = responsiveEnumFamily({
  id: 'responsive-flex-item-factors',
  issuePrefix: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS',
  subject: 'Responsive flex-item factor',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_FLEX_ITEM_FACTOR_OVERRIDES', resolved: 'RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED' },
  summaryField: 'resolvedFactors',
  fields: [
    factor('tabletGrow', EVIDENCE.tabletGrowSettingKey),
    factor('mobileGrow', EVIDENCE.mobileGrowSettingKey),
    factor('tabletShrink', EVIDENCE.tabletShrinkSettingKey),
    factor('mobileShrink', EVIDENCE.mobileShrinkSettingKey),
  ],
  conflictMode: 'all',
  messages: { resolvedInvalid: 'Responsive flex-item factors output did not rebuild into a canonical ready Elementor candidate.' },
  entryEnvelopeMessage: 'Each responsive flex-item factor entry may contain only sourceNodeId plus tablet/mobile grow/shrink factors.',
  overrideRequiredMessage: 'Each responsive flex-item factor entry must explicitly provide at least one tablet/mobile grow/shrink factor.',
  valueInvalidMessage: 'Responsive flex-item grow/shrink factors are deliberately restricted to binary integer values 0 or 1.',
});

/**
 * Apply explicit tablet/mobile flex-item-factors overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerFlexItemFactors(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveFlexItemFactorsResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveFlexItemFactorsResultV1;
}

/** Serialize only sanitized flex-item-factors metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemFactorsSummary(
  result: P15ElementorResponsiveFlexItemFactorsResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
