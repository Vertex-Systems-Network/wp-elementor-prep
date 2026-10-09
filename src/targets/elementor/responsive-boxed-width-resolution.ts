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

export const P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MANIFEST_VERSION =
  'p15-elementor-responsive-boxed-width-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_RESULT_VERSION =
  'p15-elementor-responsive-boxed-width-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MIN_PX = 500 as const;
export const P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_PX = 1600 as const;

export const P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  sliderSourcePath: 'includes/controls/slider.php',
  sliderSourceBlobSha: 'f56798bd5e0a2bee5a7c3a7771ecbaf2af87fb7f',
  fixtureSourcePath: 'tests/jest/unit/modules/container-converter/assets/js/editor/commands/convert.test.js',
  fixtureSourceBlobSha: '27c8d0eadae77a9c4e33258111829f47ed9e217b',
  conditionControlName: 'content_width',
  conditionDefaultValue: 'boxed',
  conditionRequiredValue: 'boxed',
  controlName: 'boxed_width',
  desktopSettingKey: 'boxed_width',
  tabletSettingKey: 'boxed_width_tablet',
  mobileSettingKey: 'boxed_width_mobile',
  unit: 'px',
  minPx: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MIN_PX,
  maxPx: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_PX,
});

export interface P15ElementorResponsiveBoxedWidthEntryV1 {
  sourceNodeId: string;
  tabletBoxedWidthPx?: number;
  mobileBoxedWidthPx?: number;
}

export interface P15ElementorResponsiveBoxedWidthSummaryEntryV1 {
  sourceNodeId: string;
  tabletBoxedWidthPx: number | null;
  mobileBoxedWidthPx: number | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_RESULT_VERSION;
  status: P15ElementorResponsiveBoxedWidthStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveBoxedWidthEntryV1;
  summaryField: 'resolvedBoxedWidths';
  summary: P15ElementorResponsiveBoxedWidthSummaryEntryV1;
  issueCode: P15ElementorResponsiveBoxedWidthIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveBoxedWidthManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveBoxedWidthIssueCode =
  FamilyIssueCode<'P15_RESPONSIVE_BOXED_WIDTH', 'CONDITION_MISMATCH'>;
export type P15ElementorResponsiveBoxedWidthIssueV1 = FamilyIssueV1<P15ElementorResponsiveBoxedWidthIssueCode>;
export type P15ElementorResponsiveBoxedWidthStatus = FamilyStatus<'NO_RESPONSIVE_BOXED_WIDTH_OVERRIDES', 'RESPONSIVE_BOXED_WIDTH_RESOLVED'>;
export type P15ElementorResponsiveBoxedWidthResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_EVIDENCE;
const valueCodec = intRangeCodec({ min: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MIN_PX, max: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_PX });
const FAMILY = responsiveEnumFamily({
  id: 'responsive-boxed-width',
  issuePrefix: 'P15_RESPONSIVE_BOXED_WIDTH',
  subject: 'Responsive boxed width',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_BOXED_WIDTH_OVERRIDES', resolved: 'RESPONSIVE_BOXED_WIDTH_RESOLVED' },
  summaryField: 'resolvedBoxedWidths',
  fields: [
    { field: 'tabletBoxedWidthPx', settingKey: EVIDENCE.tabletSettingKey, codec: valueCodec, toElementor: elementorPxSlider, conflictSubject: 'tablet min-height' },
    { field: 'mobileBoxedWidthPx', settingKey: EVIDENCE.mobileSettingKey, codec: valueCodec, toElementor: elementorPxSlider, conflictSubject: 'mobile min-height' },
  ],
  extraIssueSuffixes: ['CONDITION_MISMATCH'],
  // Boxed width is meaningful only for an unset or boxed content_width.
  precondition: (settings) => (settings.content_width !== undefined && settings.content_width !== 'boxed'
    ? { code: 'CONDITION_MISMATCH', message: 'Responsive boxed width requires the exact Elementor content_width=boxed condition.' }
    : null),
  entryEnvelopeMessage: 'Each responsive boxed width entry may contain only sourceNodeId plus tablet/mobile min-height values.',
  overrideRequiredMessage: 'Each responsive boxed width entry must explicitly provide tabletBoxedWidthPx and/or mobileBoxedWidthPx.',
  valueInvalidMessage: `Responsive boxed width must be an integer px value between ${P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MIN_PX} and ${P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_PX}.`,
});

const API = familyApi<P15ElementorResponsiveBoxedWidthResultV1>(FAMILY);

/**
 * Apply explicit tablet/mobile boxed-width overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerBoxedWidth(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveBoxedWidthResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized boxed-width metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveBoxedWidthSummary(result: P15ElementorResponsiveBoxedWidthResultV1): string {
  return API.serialize(result);
}
