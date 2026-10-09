import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { binaryFlexFactorCodec } from './mapping-engine/families/responsive-flex-item-sizing';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';

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

export interface P15ElementorResponsiveFlexItemFactorsSummaryEntryV1 {
  sourceNodeId: string;
  tabletGrow: P15ElementorBinaryFlexFactor | null;
  mobileGrow: P15ElementorBinaryFlexFactor | null;
  tabletShrink: P15ElementorBinaryFlexFactor | null;
  mobileShrink: P15ElementorBinaryFlexFactor | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemFactorsStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveFlexItemFactorsEntryV1;
  summaryField: 'resolvedFactors';
  summary: P15ElementorResponsiveFlexItemFactorsSummaryEntryV1;
  issueCode: P15ElementorResponsiveFlexItemFactorsIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveFlexItemFactorsManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveFlexItemFactorsIssueCode =
  FamilyIssueCode<'P15_RESPONSIVE_FLEX_ITEM_FACTORS'>;
export type P15ElementorResponsiveFlexItemFactorsIssueV1 = FamilyIssueV1<P15ElementorResponsiveFlexItemFactorsIssueCode>;
export type P15ElementorResponsiveFlexItemFactorsStatus = FamilyStatus<'NO_RESPONSIVE_FLEX_ITEM_FACTOR_OVERRIDES', 'RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED'>;
export type P15ElementorResponsiveFlexItemFactorsResultV1 = FamilyResultV1<Contract>;

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

const API = familyApi<P15ElementorResponsiveFlexItemFactorsResultV1>(FAMILY);

/**
 * Apply explicit tablet/mobile flex-item-factors overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerFlexItemFactors(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveFlexItemFactorsResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized flex-item-factors metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemFactorsSummary(result: P15ElementorResponsiveFlexItemFactorsResultV1): string {
  return API.serialize(result);
}
