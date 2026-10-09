import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { customSelectionCodec, flexOrderValueCodec, toElementorCustomSelection } from './mapping-engine/families/responsive-flex-item-sizing';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION =
  'p15-elementor-responsive-flex-item-custom-order-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESULT_VERSION =
  'p15-elementor-responsive-flex-item-custom-order-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  flexItemSourcePath: 'includes/controls/groups/flex-item.php',
  flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
  containerFixturePath: 'tests/qunit/mock/elments/container.json',
  containerFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: '_flex',
  orderControlName: 'order',
  customOrderControlName: 'order_custom',
  tabletOrderSettingKey: '_flex_order_tablet',
  mobileOrderSettingKey: '_flex_order_mobile',
  tabletCustomOrderSettingKey: '_flex_order_custom_tablet',
  mobileCustomOrderSettingKey: '_flex_order_custom_mobile',
  repositoryAcceptedValueRange: [-1000, 1000] as const,
  controlledTargetRoundtripPr: 827,
  controlledTargetRenderPr: 828,
});

export type P15ElementorFlexOrderValue = number;
export type P15ElementorFlexOrderCustom = true;

export interface P15ElementorResponsiveFlexItemCustomOrderEntryV1 {
  sourceNodeId: string;
  tabletOrderCustom?: P15ElementorFlexOrderCustom;
  mobileOrderCustom?: P15ElementorFlexOrderCustom;
  tabletOrderValue?: P15ElementorFlexOrderValue;
  mobileOrderValue?: P15ElementorFlexOrderValue;
}

export interface P15ElementorResponsiveFlexItemCustomOrderSummaryEntryV1 {
  sourceNodeId: string;
  tabletOrderCustom: P15ElementorFlexOrderCustom | null;
  mobileOrderCustom: P15ElementorFlexOrderCustom | null;
  tabletOrderValue: P15ElementorFlexOrderValue | null;
  mobileOrderValue: P15ElementorFlexOrderValue | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemCustomOrderStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveFlexItemCustomOrderEntryV1;
  summaryField: 'resolvedOrder';
  summary: P15ElementorResponsiveFlexItemCustomOrderSummaryEntryV1;
  issueCode: P15ElementorResponsiveFlexItemCustomOrderIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveFlexItemCustomOrderManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveFlexItemCustomOrderIssueCode =
  FamilyIssueCode<'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER'>;
export type P15ElementorResponsiveFlexItemCustomOrderIssueV1 = FamilyIssueV1<P15ElementorResponsiveFlexItemCustomOrderIssueCode>;
export type P15ElementorResponsiveFlexItemCustomOrderStatus = FamilyStatus<'NO_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_OVERRIDES', 'RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED'>;
export type P15ElementorResponsiveFlexItemCustomOrderResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE;
const conflictMessage = (settingKey: string): string =>
  `Generated base candidate already contains requested responsive flex-item custom order key ${settingKey}.`;
const FAMILY = responsiveEnumFamily({
  id: 'responsive-flex-item-custom-order',
  issuePrefix: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER',
  subject: 'Responsive flex-item custom order',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_OVERRIDES', resolved: 'RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED' },
  summaryField: 'resolvedOrder',
  fields: [
    { field: 'tabletOrderCustom', settingKey: EVIDENCE.tabletOrderSettingKey, codec: customSelectionCodec, toElementor: toElementorCustomSelection, conflictSubject: 'tablet order', conflictMessage: conflictMessage(EVIDENCE.tabletOrderSettingKey) },
    { field: 'mobileOrderCustom', settingKey: EVIDENCE.mobileOrderSettingKey, codec: customSelectionCodec, toElementor: toElementorCustomSelection, conflictSubject: 'mobile order', conflictMessage: conflictMessage(EVIDENCE.mobileOrderSettingKey) },
    { field: 'tabletOrderValue', settingKey: EVIDENCE.tabletCustomOrderSettingKey, codec: flexOrderValueCodec, conflictSubject: 'tablet custom order', conflictMessage: conflictMessage(EVIDENCE.tabletCustomOrderSettingKey) },
    { field: 'mobileOrderValue', settingKey: EVIDENCE.mobileCustomOrderSettingKey, codec: flexOrderValueCodec, conflictSubject: 'mobile custom order', conflictMessage: conflictMessage(EVIDENCE.mobileCustomOrderSettingKey) },
  ],
  pairs: [['tabletOrderCustom', 'tabletOrderValue'], ['mobileOrderCustom', 'mobileOrderValue']],
  conflictMode: 'all',
  entryEnvelopeMessage: 'Each responsive flex-item custom order entry may contain only sourceNodeId plus tablet/mobile custom-order type/value pairs.',
  overrideRequiredMessage: 'Each responsive flex-item custom order entry must explicitly provide a complete tablet or mobile custom-order type/value pair.',
  valueInvalidMessage: 'Responsive flex-item custom order must use a custom selection and a finite integer value from -1000 through 1000.',
});

const API = familyApi<P15ElementorResponsiveFlexItemCustomOrderResultV1>(FAMILY);

/**
 * Apply explicit tablet/mobile flex-item-custom-order overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerFlexItemCustomOrder(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveFlexItemCustomOrderResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized flex-item-custom-order metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemCustomOrderSummary(result: P15ElementorResponsiveFlexItemCustomOrderResultV1): string {
  return API.serialize(result);
}
