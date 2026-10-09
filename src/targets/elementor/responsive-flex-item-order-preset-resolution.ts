import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { orderPresetCodec } from './mapping-engine/families/responsive-flex-item-sizing';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION =
  'p15-elementor-responsive-flex-item-order-preset-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESULT_VERSION =
  'p15-elementor-responsive-flex-item-order-preset-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  flexItemSourcePath: 'includes/controls/groups/flex-item.php',
  flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
  qunitFixturePath: 'tests/qunit/mock/elments/container.json',
  qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: '_flex',
  controlName: 'order',
  desktopSettingKey: '_flex_order',
  tabletSettingKey: '_flex_order_tablet',
  mobileSettingKey: '_flex_order_mobile',
  startTargetValue: -99999,
  endTargetValue: 99999,
});

export type P15ElementorResponsiveOrderPreset = 'start' | 'end';

export interface P15ElementorResponsiveFlexItemOrderPresetEntryV1 {
  sourceNodeId: string;
  tabletOrderPreset?: P15ElementorResponsiveOrderPreset;
  mobileOrderPreset?: P15ElementorResponsiveOrderPreset;
}

export interface P15ElementorResponsiveFlexItemOrderPresetSummaryEntryV1 {
  sourceNodeId: string;
  tabletOrderPreset: P15ElementorResponsiveOrderPreset | null;
  mobileOrderPreset: P15ElementorResponsiveOrderPreset | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemOrderPresetStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveFlexItemOrderPresetEntryV1;
  summaryField: 'resolvedOrders';
  summary: P15ElementorResponsiveFlexItemOrderPresetSummaryEntryV1;
  issueCode: P15ElementorResponsiveFlexItemOrderPresetIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveFlexItemOrderPresetManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveFlexItemOrderPresetIssueCode =
  FamilyIssueCode<'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET'>;
export type P15ElementorResponsiveFlexItemOrderPresetIssueV1 = FamilyIssueV1<P15ElementorResponsiveFlexItemOrderPresetIssueCode>;
export type P15ElementorResponsiveFlexItemOrderPresetStatus = FamilyStatus<'NO_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDES', 'RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED'>;
export type P15ElementorResponsiveFlexItemOrderPresetResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EVIDENCE;
/** Elementor's order presets resolve to the exact start/end target values. */
const mapOrderPreset = (value: P15ElementorResponsiveOrderPreset): number =>
  (value === 'start' ? EVIDENCE.startTargetValue : EVIDENCE.endTargetValue);
const FAMILY = responsiveEnumFamily({
  id: 'responsive-flex-item order preset',
  issuePrefix: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET',
  subject: 'Responsive flex-item order preset',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDES', resolved: 'RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED' },
  summaryField: 'resolvedOrders',
  fields: [
    { field: 'tabletOrderPreset', settingKey: EVIDENCE.tabletSettingKey, codec: orderPresetCodec, toElementor: mapOrderPreset, conflictSubject: 'tablet flex-item order preset' },
    { field: 'mobileOrderPreset', settingKey: EVIDENCE.mobileSettingKey, codec: orderPresetCodec, toElementor: mapOrderPreset, conflictSubject: 'mobile flex-item order preset' },
  ],
  entryEnvelopeMessage: 'Each responsive flex-item order preset entry may contain only sourceNodeId plus tablet/mobile order presets.',
  overrideRequiredMessage: 'Each responsive flex-item order preset entry must explicitly provide tabletOrderPreset and/or mobileOrderPreset.',
  valueInvalidMessage: 'Responsive flex-item order preset must be the explicit preset start or end.',
  messages: { authority: 'Responsive flex-item order preset resolution cannot grant inference/custom-order/mutation/network/closure/compatibility/production/download authority.' },
});

const API = familyApi<P15ElementorResponsiveFlexItemOrderPresetResultV1>(FAMILY);

/**
 * Apply explicit tablet/mobile flex-item-order-preset overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerOrderPreset(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveFlexItemOrderPresetResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized flex-item-order-preset metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemOrderPresetSummary(result: P15ElementorResponsiveFlexItemOrderPresetResultV1): string {
  return API.serialize(result);
}
