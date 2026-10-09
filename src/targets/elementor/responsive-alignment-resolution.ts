import type { P15NeutralCrossAlignment, P15NeutralJustification } from './neutral-export-ir';
import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { crossAlignmentCodec, justificationCodec, responsiveEnumFamily, toElementorFlexAlignment } from './mapping-engine/families/responsive-layout';

export const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION =
  'p15-elementor-responsive-alignment-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_RESULT_VERSION =
  'p15-elementor-responsive-alignment-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
  flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
  containerMockSourcePath: 'tests/qunit/mock/elments/container.json',
  containerMockSourceBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: 'flex',
  justifyControlName: 'justify_content',
  alignControlName: 'align_items',
  tabletJustifySettingKey: 'flex_justify_content_tablet',
  mobileJustifySettingKey: 'flex_justify_content_mobile',
  tabletAlignSettingKey: 'flex_align_items_tablet',
  mobileAlignSettingKey: 'flex_align_items_mobile',
});

export interface P15ElementorResponsiveAlignmentEntryV1 {
  sourceNodeId: string;
  tabletAlignItems?: P15NeutralCrossAlignment;
  mobileAlignItems?: P15NeutralCrossAlignment;
  tabletJustifyContent?: P15NeutralJustification;
  mobileJustifyContent?: P15NeutralJustification;
}

export interface P15ElementorResponsiveAlignmentSummaryEntryV1 {
  sourceNodeId: string;
  tabletAlignItems: P15NeutralCrossAlignment | null;
  mobileAlignItems: P15NeutralCrossAlignment | null;
  tabletJustifyContent: P15NeutralJustification | null;
  mobileJustifyContent: P15NeutralJustification | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_RESULT_VERSION;
  status: P15ElementorResponsiveAlignmentStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveAlignmentEntryV1;
  summaryField: 'resolvedAlignments';
  summary: P15ElementorResponsiveAlignmentSummaryEntryV1;
  issueCode: P15ElementorResponsiveAlignmentIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveAlignmentManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveAlignmentIssueCode = FamilyIssueCode<'P15_RESPONSIVE_ALIGNMENT'>;
export type P15ElementorResponsiveAlignmentIssueV1 = FamilyIssueV1<P15ElementorResponsiveAlignmentIssueCode>;
export type P15ElementorResponsiveAlignmentStatus = FamilyStatus<'NO_RESPONSIVE_ALIGNMENT_OVERRIDES', 'RESPONSIVE_ALIGNMENTS_RESOLVED'>;
export type P15ElementorResponsiveAlignmentResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE;
const conflictMessage = (settingKey: string): string =>
  `Generated base candidate already contains requested responsive alignment key ${settingKey}.`;

const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_FAMILY = responsiveEnumFamily({
  id: 'responsive-alignment',
  issuePrefix: 'P15_RESPONSIVE_ALIGNMENT',
  subject: 'Responsive alignment',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_ALIGNMENT_OVERRIDES', resolved: 'RESPONSIVE_ALIGNMENTS_RESOLVED' },
  summaryField: 'resolvedAlignments',
  fields: [
    { field: 'tabletAlignItems', settingKey: EVIDENCE.tabletAlignSettingKey, codec: crossAlignmentCodec, toElementor: toElementorFlexAlignment, conflictSubject: 'tablet align', conflictMessage: conflictMessage(EVIDENCE.tabletAlignSettingKey) },
    { field: 'mobileAlignItems', settingKey: EVIDENCE.mobileAlignSettingKey, codec: crossAlignmentCodec, toElementor: toElementorFlexAlignment, conflictSubject: 'mobile align', conflictMessage: conflictMessage(EVIDENCE.mobileAlignSettingKey) },
    { field: 'tabletJustifyContent', settingKey: EVIDENCE.tabletJustifySettingKey, codec: justificationCodec, toElementor: toElementorFlexAlignment, conflictSubject: 'tablet justify', conflictMessage: conflictMessage(EVIDENCE.tabletJustifySettingKey) },
    { field: 'mobileJustifyContent', settingKey: EVIDENCE.mobileJustifySettingKey, codec: justificationCodec, toElementor: toElementorFlexAlignment, conflictSubject: 'mobile justify', conflictMessage: conflictMessage(EVIDENCE.mobileJustifySettingKey) },
  ],
  entryEnvelopeMessage: 'Each responsive alignment entry may contain only sourceNodeId plus tablet/mobile align/justify overrides.',
  overrideRequiredMessage: 'Each responsive alignment entry must explicitly provide at least one tablet/mobile alignment override.',
  valueInvalidMessage: 'Responsive alignItems/justifyContent value is outside the bounded neutral vocabulary.',
  conflictMode: 'all',
});

const API = familyApi<P15ElementorResponsiveAlignmentResultV1>(P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_FAMILY);

/**
 * Apply explicit tablet/mobile alignment overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerAlignments(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveAlignmentResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized alignment metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveAlignmentSummary(result: P15ElementorResponsiveAlignmentResultV1): string {
  return API.serialize(result);
}
