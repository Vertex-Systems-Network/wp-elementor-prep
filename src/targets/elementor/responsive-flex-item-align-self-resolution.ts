import type { P15NeutralCrossAlignment } from './neutral-export-ir';
import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { alignSelfCodec, toElementorAlignSelf } from './mapping-engine/families/responsive-flex-item-sizing';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION =
  'p15-elementor-responsive-flex-item-align-self-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESULT_VERSION =
  'p15-elementor-responsive-flex-item-align-self-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  flexItemSourcePath: 'includes/controls/groups/flex-item.php',
  flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
  qunitFixturePath: 'tests/qunit/mock/elments/container.json',
  qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: '_flex',
  controlName: 'align_self',
  desktopSettingKey: '_flex_align_self',
  tabletSettingKey: '_flex_align_self_tablet',
  mobileSettingKey: '_flex_align_self_mobile',
  targetValues: ['flex-start', 'center', 'flex-end', 'stretch'] as const,
});

export interface P15ElementorResponsiveFlexItemAlignSelfEntryV1 {
  sourceNodeId: string;
  tabletAlignSelf?: P15NeutralCrossAlignment;
  mobileAlignSelf?: P15NeutralCrossAlignment;
}

export interface P15ElementorResponsiveFlexItemAlignSelfSummaryEntryV1 {
  sourceNodeId: string;
  tabletAlignSelf: P15NeutralCrossAlignment | null;
  mobileAlignSelf: P15NeutralCrossAlignment | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemAlignSelfStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveFlexItemAlignSelfEntryV1;
  summaryField: 'resolvedAlignments';
  summary: P15ElementorResponsiveFlexItemAlignSelfSummaryEntryV1;
  issueCode: P15ElementorResponsiveFlexItemAlignSelfIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveFlexItemAlignSelfManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveFlexItemAlignSelfIssueCode =
  FamilyIssueCode<'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF'>;
export type P15ElementorResponsiveFlexItemAlignSelfIssueV1 = FamilyIssueV1<P15ElementorResponsiveFlexItemAlignSelfIssueCode>;
export type P15ElementorResponsiveFlexItemAlignSelfStatus = FamilyStatus<'NO_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDES', 'RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED'>;
export type P15ElementorResponsiveFlexItemAlignSelfResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EVIDENCE;
const FAMILY = responsiveEnumFamily({
  id: 'responsive-flex-item align-self',
  issuePrefix: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF',
  subject: 'Responsive flex-item align-self',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDES', resolved: 'RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED' },
  summaryField: 'resolvedAlignments',
  fields: [
    { field: 'tabletAlignSelf', settingKey: EVIDENCE.tabletSettingKey, codec: alignSelfCodec, toElementor: toElementorAlignSelf, conflictSubject: 'tablet flex-item align-self' },
    { field: 'mobileAlignSelf', settingKey: EVIDENCE.mobileSettingKey, codec: alignSelfCodec, toElementor: toElementorAlignSelf, conflictSubject: 'mobile flex-item align-self' },
  ],
  entryEnvelopeMessage: 'Each responsive flex-item align-self entry may contain only sourceNodeId plus tablet/mobile align-self values.',
  overrideRequiredMessage: 'Each responsive flex-item align-self entry must explicitly provide tabletAlignSelf and/or mobileAlignSelf.',
  valueInvalidMessage: 'Responsive flex-item align-self must be start, center, end or stretch.',
});

const API = familyApi<P15ElementorResponsiveFlexItemAlignSelfResultV1>(FAMILY);

/**
 * Apply explicit tablet/mobile flex-item-align-self overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerAlignSelf(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveFlexItemAlignSelfResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized flex-item-align-self metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemAlignSelfSummary(result: P15ElementorResponsiveFlexItemAlignSelfResultV1): string {
  return API.serialize(result);
}
