import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { customSelectionCodec, flexOrderValueCodec, toElementorCustomSelection } from './mapping-engine/families/responsive-flex-item-sizing';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import type { ElementorTemplateV04 } from './template-v04';

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

export interface P15ElementorResponsiveFlexItemCustomOrderManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveFlexItemCustomOrderEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveFlexItemCustomOrderIssueCode =
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_ENTRY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_VALUE_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveFlexItemCustomOrderIssueV1 {
  code: P15ElementorResponsiveFlexItemCustomOrderIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveFlexItemCustomOrderStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_OVERRIDES'
  | 'RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED';

export interface P15ElementorResponsiveFlexItemCustomOrderSummaryEntryV1 {
  sourceNodeId: string;
  tabletOrderCustom: P15ElementorFlexOrderCustom | null;
  mobileOrderCustom: P15ElementorFlexOrderCustom | null;
  tabletOrderValue: P15ElementorFlexOrderValue | null;
  mobileOrderValue: P15ElementorFlexOrderValue | null;
}

export interface P15ElementorResponsiveFlexItemCustomOrderResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemCustomOrderStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedOrder: P15ElementorResponsiveFlexItemCustomOrderSummaryEntryV1[];
  issues: P15ElementorResponsiveFlexItemCustomOrderIssueV1[];
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

/**
 * Apply explicit tablet/mobile flex-item-custom-order overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerFlexItemCustomOrder(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveFlexItemCustomOrderResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveFlexItemCustomOrderResultV1;
}

/** Serialize only sanitized flex-item-custom-order metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemCustomOrderSummary(
  result: P15ElementorResponsiveFlexItemCustomOrderResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
