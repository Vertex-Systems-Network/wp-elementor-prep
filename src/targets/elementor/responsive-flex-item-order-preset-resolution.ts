import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { orderPresetCodec } from './mapping-engine/families/responsive-flex-item-sizing';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import type { ElementorTemplateV04 } from './template-v04';

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

export interface P15ElementorResponsiveFlexItemOrderPresetManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveFlexItemOrderPresetEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveFlexItemOrderPresetIssueCode =
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_ENTRY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_VALUE_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveFlexItemOrderPresetIssueV1 {
  code: P15ElementorResponsiveFlexItemOrderPresetIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveFlexItemOrderPresetStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDES'
  | 'RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED';

export interface P15ElementorResponsiveFlexItemOrderPresetSummaryEntryV1 {
  sourceNodeId: string;
  tabletOrderPreset: P15ElementorResponsiveOrderPreset | null;
  mobileOrderPreset: P15ElementorResponsiveOrderPreset | null;
}

export interface P15ElementorResponsiveFlexItemOrderPresetResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemOrderPresetStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedOrders: P15ElementorResponsiveFlexItemOrderPresetSummaryEntryV1[];
  issues: P15ElementorResponsiveFlexItemOrderPresetIssueV1[];
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

/**
 * Apply explicit tablet/mobile flex-item-order-preset overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerOrderPreset(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveFlexItemOrderPresetResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveFlexItemOrderPresetResultV1;
}

/** Serialize only sanitized flex-item-order-preset metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemOrderPresetSummary(
  result: P15ElementorResponsiveFlexItemOrderPresetResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
