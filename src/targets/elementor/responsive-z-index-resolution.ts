import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { intRangeCodec } from './mapping-engine/codecs';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';

export const P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MANIFEST_VERSION =
  'p15-elementor-responsive-z-index-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_Z_INDEX_RESULT_VERSION =
  'p15-elementor-responsive-z-index-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MAX = 9_999 as const;

export const P15_ELEMENTOR_RESPONSIVE_Z_INDEX_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  containerPlaywrightSourcePath: 'tests/playwright/sanity/modules/container/container-1.test.ts',
  containerPlaywrightSourceBlobSha: '1cdbc387887abea49d4e8477b1b3a684c5149c9e',
  responsiveNumberFixtureSourcePath: 'tests/qunit/mock/elments/video.json',
  responsiveNumberFixtureSourceBlobSha: '20f71a3e127ac3806446c95b313abff01e4b97c2',
  controlName: 'z_index',
  desktopSettingKey: 'z_index',
  tabletSettingKey: 'z_index_tablet',
  mobileSettingKey: 'z_index_mobile',
  minValue: 0,
  maxValue: P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MAX,
});

export interface P15ElementorResponsiveZIndexEntryV1 {
  sourceNodeId: string;
  tabletZIndex?: number;
  mobileZIndex?: number;
}

export interface P15ElementorResponsiveZIndexSummaryEntryV1 {
  sourceNodeId: string;
  tabletZIndex: number | null;
  mobileZIndex: number | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_Z_INDEX_RESULT_VERSION;
  status: P15ElementorResponsiveZIndexStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveZIndexEntryV1;
  summaryField: 'resolvedZIndexes';
  summary: P15ElementorResponsiveZIndexSummaryEntryV1;
  issueCode: P15ElementorResponsiveZIndexIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveZIndexManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveZIndexIssueCode = FamilyIssueCode<'P15_RESPONSIVE_Z_INDEX'>;
export type P15ElementorResponsiveZIndexIssueV1 = FamilyIssueV1<P15ElementorResponsiveZIndexIssueCode>;
export type P15ElementorResponsiveZIndexStatus = FamilyStatus<'NO_RESPONSIVE_Z_INDEX_OVERRIDES', 'RESPONSIVE_Z_INDEX_RESOLVED'>;
export type P15ElementorResponsiveZIndexResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_Z_INDEX_EVIDENCE;
const valueCodec = intRangeCodec({ min: 0, max: P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MAX });
const FAMILY = responsiveEnumFamily({
  id: 'responsive-z-index',
  issuePrefix: 'P15_RESPONSIVE_Z_INDEX',
  subject: 'Responsive z-index',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_Z_INDEX_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_Z_INDEX_OVERRIDES', resolved: 'RESPONSIVE_Z_INDEX_RESOLVED' },
  summaryField: 'resolvedZIndexes',
  fields: [
    { field: 'tabletZIndex', settingKey: EVIDENCE.tabletSettingKey, codec: valueCodec, conflictSubject: 'tablet min-height' },
    { field: 'mobileZIndex', settingKey: EVIDENCE.mobileSettingKey, codec: valueCodec, conflictSubject: 'mobile min-height' },
  ],
  entryEnvelopeMessage: 'Each responsive z-index entry may contain only sourceNodeId plus tablet/mobile min-height values.',
  overrideRequiredMessage: 'Each responsive z-index entry must explicitly provide tabletZIndex and/or mobileZIndex.',
  valueInvalidMessage: `Responsive z-index must be an integer value between 0 and ${P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MAX}.`,
});

const API = familyApi<P15ElementorResponsiveZIndexResultV1>(FAMILY);

/**
 * Apply explicit tablet/mobile z-index overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerZIndex(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveZIndexResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized z-index metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveZIndexSummary(result: P15ElementorResponsiveZIndexResultV1): string {
  return API.serialize(result);
}
