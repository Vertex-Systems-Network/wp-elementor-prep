import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { ELEMENT_TARGET } from './mapping-engine/element-target';
import { customSelectionCodec, flexOrderValueCodec, toElementorCustomSelection } from './mapping-engine/families/responsive-flex-item-sizing';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';

/**
 * Responsive element order (recovery M4.3b): the tablet/mobile custom flex order of any Container or core widget,
 * for children the design reorders on a breakpoint. Same writes as the Container custom-order family, on the
 * element target.
 *
 * R0, Elementor 4.2.4: `includes/controls/groups/flex-item.php` (blob dc95ad4) `order` (`custom`) and `order_custom`,
 * both `responsive`; Containers carry the `_flex` group, and widgets include `order` and `order_custom` in
 * `includes/widgets/common-base.php` (blob 77c497b, `_flex` group with `include`).
 */
export const P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_MANIFEST_VERSION = 'p15-elementor-responsive-element-order-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_RESULT_VERSION = 'p15-elementor-responsive-element-order-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  flexItemSourcePath: 'includes/controls/groups/flex-item.php',
  flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
  widgetCommonSourcePath: 'includes/widgets/common-base.php',
  widgetCommonSourceBlobSha: '77c497bfa4a3b7bb283c585e87efb06c590cb0c1',
  tabletOrderSettingKey: '_flex_order_tablet',
  mobileOrderSettingKey: '_flex_order_mobile',
  tabletCustomOrderSettingKey: '_flex_order_custom_tablet',
  mobileCustomOrderSettingKey: '_flex_order_custom_mobile',
  repositoryAcceptedValueRange: [-1000, 1000] as const,
});

export interface P15ElementorResponsiveElementOrderEntryV1 {
  sourceNodeId: string;
  tabletOrderCustom?: true;
  mobileOrderCustom?: true;
  tabletOrderValue?: number;
  mobileOrderValue?: number;
}

export interface P15ElementorResponsiveElementOrderSummaryEntryV1 {
  sourceNodeId: string;
  tabletOrderCustom: true | null;
  mobileOrderCustom: true | null;
  tabletOrderValue: number | null;
  mobileOrderValue: number | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_RESULT_VERSION;
  status: P15ElementorResponsiveElementOrderStatus;
  entriesField: 'elements';
  entry: P15ElementorResponsiveElementOrderEntryV1;
  summaryField: 'resolvedOrder';
  summary: P15ElementorResponsiveElementOrderSummaryEntryV1;
  issueCode: P15ElementorResponsiveElementOrderIssueCode;
  noun: 'Element';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveElementOrderManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveElementOrderIssueCode = FamilyIssueCode<'P15_RESPONSIVE_ELEMENT_ORDER'>;
export type P15ElementorResponsiveElementOrderIssueV1 = FamilyIssueV1<P15ElementorResponsiveElementOrderIssueCode>;
export type P15ElementorResponsiveElementOrderStatus = FamilyStatus<'NO_RESPONSIVE_ELEMENT_ORDER_OVERRIDES', 'RESPONSIVE_ELEMENT_ORDER_RESOLVED'>;
export type P15ElementorResponsiveElementOrderResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_EVIDENCE;
const conflictMessage = (settingKey: string): string => `Generated base candidate already contains requested element order key ${settingKey}.`;
const FAMILY = responsiveEnumFamily({
  id: 'responsive-element-order',
  issuePrefix: 'P15_RESPONSIVE_ELEMENT_ORDER',
  subject: 'Responsive element order',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_ELEMENT_ORDER_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_ELEMENT_ORDER_OVERRIDES', resolved: 'RESPONSIVE_ELEMENT_ORDER_RESOLVED' },
  summaryField: 'resolvedOrder',
  target: ELEMENT_TARGET,
  fields: [
    { field: 'tabletOrderCustom', settingKey: EVIDENCE.tabletOrderSettingKey, codec: customSelectionCodec, toElementor: toElementorCustomSelection, conflictSubject: 'tablet order', conflictMessage: conflictMessage(EVIDENCE.tabletOrderSettingKey) },
    { field: 'mobileOrderCustom', settingKey: EVIDENCE.mobileOrderSettingKey, codec: customSelectionCodec, toElementor: toElementorCustomSelection, conflictSubject: 'mobile order', conflictMessage: conflictMessage(EVIDENCE.mobileOrderSettingKey) },
    { field: 'tabletOrderValue', settingKey: EVIDENCE.tabletCustomOrderSettingKey, codec: flexOrderValueCodec, conflictSubject: 'tablet custom order', conflictMessage: conflictMessage(EVIDENCE.tabletCustomOrderSettingKey) },
    { field: 'mobileOrderValue', settingKey: EVIDENCE.mobileCustomOrderSettingKey, codec: flexOrderValueCodec, conflictSubject: 'mobile custom order', conflictMessage: conflictMessage(EVIDENCE.mobileCustomOrderSettingKey) },
  ],
  pairs: [['tabletOrderCustom', 'tabletOrderValue'], ['mobileOrderCustom', 'mobileOrderValue']],
  conflictMode: 'all',
  entryEnvelopeMessage: 'Each responsive element order entry may contain only sourceNodeId plus tablet/mobile custom-order type/value pairs.',
  overrideRequiredMessage: 'Each responsive element order entry must explicitly provide a complete tablet or mobile custom-order type/value pair.',
  valueInvalidMessage: 'Responsive element order must use a custom selection and a finite integer value from -1000 through 1000.',
});

const API = familyApi<P15ElementorResponsiveElementOrderResultV1>(FAMILY);

/** Apply explicit tablet/mobile custom order to exact generated element bindings; desktop order is unchanged. */
export function resolveP15ElementorResponsiveElementOrder(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveElementOrderResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

export function serializeP15ElementorResponsiveElementOrderSummary(result: P15ElementorResponsiveElementOrderResultV1): string {
  return API.serialize(result);
}
