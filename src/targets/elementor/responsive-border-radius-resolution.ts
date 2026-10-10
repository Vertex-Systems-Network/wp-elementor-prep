import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { P15_NEUTRAL_EXPORT_MAX_RADIUS_PX } from './neutral-export-ir';
import { elementorLinkedDimensionsPx, intRangeCodec } from './mapping-engine/codecs';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';

export const P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION =
  'p15-elementor-responsive-border-radius-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_RESULT_VERSION =
  'p15-elementor-responsive-border-radius-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  controlName: 'border_radius',
  desktopSettingKey: 'border_radius',
  tabletSettingKey: 'border_radius_tablet',
  mobileSettingKey: 'border_radius_mobile',
});

export interface P15ElementorResponsiveBorderRadiusEntryV1 {
  sourceNodeId: string;
  tabletCornerRadiusPx?: number;
  mobileCornerRadiusPx?: number;
}

export interface P15ElementorResponsiveBorderRadiusSummaryEntryV1 {
  sourceNodeId: string;
  tabletCornerRadiusPx: number | null;
  mobileCornerRadiusPx: number | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_RESULT_VERSION;
  status: P15ElementorResponsiveBorderRadiusStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveBorderRadiusEntryV1;
  summaryField: 'resolvedBorderRadii';
  summary: P15ElementorResponsiveBorderRadiusSummaryEntryV1;
  issueCode: P15ElementorResponsiveBorderRadiusIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveBorderRadiusManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveBorderRadiusIssueCode = FamilyIssueCode<'P15_RESPONSIVE_BORDER_RADIUS'>;
export type P15ElementorResponsiveBorderRadiusIssueV1 = FamilyIssueV1<P15ElementorResponsiveBorderRadiusIssueCode>;
export type P15ElementorResponsiveBorderRadiusStatus = FamilyStatus<'NO_RESPONSIVE_BORDER_RADIUS_OVERRIDES', 'RESPONSIVE_BORDER_RADIUS_RESOLVED'>;
export type P15ElementorResponsiveBorderRadiusResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_EVIDENCE;
const valueCodec = intRangeCodec({ min: 0, max: P15_NEUTRAL_EXPORT_MAX_RADIUS_PX });
const FAMILY = responsiveEnumFamily({
  id: 'responsive-border-radius',
  issuePrefix: 'P15_RESPONSIVE_BORDER_RADIUS',
  subject: 'Responsive border radius',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_BORDER_RADIUS_OVERRIDES', resolved: 'RESPONSIVE_BORDER_RADIUS_RESOLVED' },
  summaryField: 'resolvedBorderRadii',
  fields: [
    { field: 'tabletCornerRadiusPx', settingKey: EVIDENCE.tabletSettingKey, codec: valueCodec, toElementor: elementorLinkedDimensionsPx, conflictSubject: 'tablet border-radius' },
    { field: 'mobileCornerRadiusPx', settingKey: EVIDENCE.mobileSettingKey, codec: valueCodec, toElementor: elementorLinkedDimensionsPx, conflictSubject: 'mobile border-radius' },
  ],
  entryEnvelopeMessage: 'Each responsive border radius entry may contain only sourceNodeId plus tablet/mobile border-radius values.',
  overrideRequiredMessage: 'Each responsive border radius entry must explicitly provide tabletCornerRadiusPx and/or mobileCornerRadiusPx.',
  valueInvalidMessage: `Responsive border radius must be an integer px value between 0 and ${P15_NEUTRAL_EXPORT_MAX_RADIUS_PX}.`,
});

const API = familyApi<P15ElementorResponsiveBorderRadiusResultV1>(FAMILY);

/**
 * Apply only explicit default tablet/mobile uniform px border-radius overrides to exact generated container bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer responsive border radius, convert units,
 * change desktop border radius, introduce negative radius values, or claim responsive closure.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-style.test.ts`.
 */
export function resolveP15ElementorResponsiveContainerBorderRadius(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveBorderRadiusResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized border-radius metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveBorderRadiusSummary(result: P15ElementorResponsiveBorderRadiusResultV1): string {
  return API.serialize(result);
}
