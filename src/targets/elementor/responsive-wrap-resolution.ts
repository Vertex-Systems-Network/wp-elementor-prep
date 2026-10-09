import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { GENERIC_RESPONSIVE_MESSAGES, responsiveEnumFamily, wrapCodec } from './mapping-engine/families/responsive-layout';

export const P15_ELEMENTOR_RESPONSIVE_WRAP_MANIFEST_VERSION =
  'p15-elementor-responsive-wrap-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_WRAP_RESULT_VERSION =
  'p15-elementor-responsive-wrap-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_WRAP_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_WRAP_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
  flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
  qunitFixturePath: 'tests/qunit/mock/elments/container.json',
  qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: 'flex',
  controlName: 'wrap',
  desktopSettingKey: 'flex_wrap',
  tabletSettingKey: 'flex_wrap_tablet',
  mobileSettingKey: 'flex_wrap_mobile',
});

export type P15ElementorResponsiveWrap = 'nowrap' | 'wrap';

export interface P15ElementorResponsiveWrapEntryV1 {
  sourceNodeId: string;
  tabletWrap?: P15ElementorResponsiveWrap;
  mobileWrap?: P15ElementorResponsiveWrap;
}

export interface P15ElementorResponsiveWrapSummaryEntryV1 {
  sourceNodeId: string;
  tabletWrap: P15ElementorResponsiveWrap | null;
  mobileWrap: P15ElementorResponsiveWrap | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_WRAP_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_WRAP_RESULT_VERSION;
  status: P15ElementorResponsiveWrapStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveWrapEntryV1;
  summaryField: 'resolvedWraps';
  summary: P15ElementorResponsiveWrapSummaryEntryV1;
  issueCode: P15ElementorResponsiveWrapIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveWrapManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveWrapIssueCode = FamilyIssueCode<'P15_RESPONSIVE_WRAP'>;
export type P15ElementorResponsiveWrapIssueV1 = FamilyIssueV1<P15ElementorResponsiveWrapIssueCode>;
export type P15ElementorResponsiveWrapStatus = FamilyStatus<'NO_RESPONSIVE_WRAP_OVERRIDES', 'RESPONSIVE_WRAPS_RESOLVED'>;
export type P15ElementorResponsiveWrapResultV1 = FamilyResultV1<Contract>;

/** Responsive wrap as an engine family; also the chained prerequisite of align-content. */
export const P15_ELEMENTOR_RESPONSIVE_WRAP_FAMILY = responsiveEnumFamily({
  id: 'responsive-wrap',
  issuePrefix: 'P15_RESPONSIVE_WRAP',
  subject: 'Responsive wrap',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_WRAP_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_WRAP_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_WRAP_MAX_ENTRIES,
  evidence: P15_ELEMENTOR_RESPONSIVE_WRAP_EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_WRAP_OVERRIDES', resolved: 'RESPONSIVE_WRAPS_RESOLVED' },
  summaryField: 'resolvedWraps',
  fields: [
    { field: 'tabletWrap', settingKey: P15_ELEMENTOR_RESPONSIVE_WRAP_EVIDENCE.tabletSettingKey, codec: wrapCodec, conflictSubject: 'tablet wrap' },
    { field: 'mobileWrap', settingKey: P15_ELEMENTOR_RESPONSIVE_WRAP_EVIDENCE.mobileSettingKey, codec: wrapCodec, conflictSubject: 'mobile wrap' },
  ],
  entryEnvelopeMessage: 'Each responsive entry may contain only sourceNodeId plus tablet/mobile wrap overrides.',
  overrideRequiredMessage: 'Each responsive entry must explicitly provide tabletWrap and/or mobileWrap.',
  valueInvalidMessage: 'Responsive wrap must be nowrap or wrap.',
  messages: GENERIC_RESPONSIVE_MESSAGES,
  bindingIssuesLast: true,
});

const API = familyApi<P15ElementorResponsiveWrapResultV1>(P15_ELEMENTOR_RESPONSIVE_WRAP_FAMILY);

/**
 * Apply explicit tablet/mobile wrap overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerWraps(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveWrapResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized wrap metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveWrapSummary(result: P15ElementorResponsiveWrapResultV1): string {
  return API.serialize(result);
}
