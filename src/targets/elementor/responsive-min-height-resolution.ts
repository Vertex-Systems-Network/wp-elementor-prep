import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { intRangeCodec, elementorPxSlider } from './mapping-engine/codecs';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';

export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION =
  'p15-elementor-responsive-min-height-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_RESULT_VERSION =
  'p15-elementor-responsive-min-height-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX = 1440 as const;

export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  sliderSourcePath: 'includes/controls/slider.php',
  sliderSourceBlobSha: 'f56798bd5e0a2bee5a7c3a7771ecbaf2af87fb7f',
  fixtureSourcePath: 'tests/jest/unit/modules/container-converter/assets/js/editor/commands/convert.test.js',
  fixtureSourceBlobSha: '27c8d0eadae77a9c4e33258111829f47ed9e217b',
  controlName: 'min_height',
  desktopSettingKey: 'min_height',
  tabletSettingKey: 'min_height_tablet',
  mobileSettingKey: 'min_height_mobile',
  unit: 'px',
  maxPx: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX,
});

export interface P15ElementorResponsiveMinHeightEntryV1 {
  sourceNodeId: string;
  tabletMinHeightPx?: number;
  mobileMinHeightPx?: number;
}

export interface P15ElementorResponsiveMinHeightSummaryEntryV1 {
  sourceNodeId: string;
  tabletMinHeightPx: number | null;
  mobileMinHeightPx: number | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_RESULT_VERSION;
  status: P15ElementorResponsiveMinHeightStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveMinHeightEntryV1;
  summaryField: 'resolvedMinHeights';
  summary: P15ElementorResponsiveMinHeightSummaryEntryV1;
  issueCode: P15ElementorResponsiveMinHeightIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveMinHeightManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveMinHeightIssueCode = FamilyIssueCode<'P15_RESPONSIVE_MIN_HEIGHT'>;
export type P15ElementorResponsiveMinHeightIssueV1 = FamilyIssueV1<P15ElementorResponsiveMinHeightIssueCode>;
export type P15ElementorResponsiveMinHeightStatus = FamilyStatus<'NO_RESPONSIVE_MIN_HEIGHT_OVERRIDES', 'RESPONSIVE_MIN_HEIGHT_RESOLVED'>;
export type P15ElementorResponsiveMinHeightResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_EVIDENCE;
const valueCodec = intRangeCodec({ min: 0, max: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX });
const FAMILY = responsiveEnumFamily({
  id: 'responsive-min-height',
  issuePrefix: 'P15_RESPONSIVE_MIN_HEIGHT',
  subject: 'Responsive min height',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_MIN_HEIGHT_OVERRIDES', resolved: 'RESPONSIVE_MIN_HEIGHT_RESOLVED' },
  summaryField: 'resolvedMinHeights',
  fields: [
    { field: 'tabletMinHeightPx', settingKey: EVIDENCE.tabletSettingKey, codec: valueCodec, toElementor: elementorPxSlider, conflictSubject: 'tablet min-height' },
    { field: 'mobileMinHeightPx', settingKey: EVIDENCE.mobileSettingKey, codec: valueCodec, toElementor: elementorPxSlider, conflictSubject: 'mobile min-height' },
  ],
  entryEnvelopeMessage: 'Each responsive min height entry may contain only sourceNodeId plus tablet/mobile min-height values.',
  overrideRequiredMessage: 'Each responsive min height entry must explicitly provide tabletMinHeightPx and/or mobileMinHeightPx.',
  valueInvalidMessage: `Responsive min height must be an integer px value between 0 and ${P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX}.`,
});

const API = familyApi<P15ElementorResponsiveMinHeightResultV1>(FAMILY);

/**
 * Apply explicit tablet/mobile min-height overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerMinHeight(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveMinHeightResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized min-height metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveMinHeightSummary(result: P15ElementorResponsiveMinHeightResultV1): string {
  return API.serialize(result);
}
