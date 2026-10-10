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

export const P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_VERSION =
  'p15-elementor-responsive-hover-border-radius-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_RESULT_VERSION =
  'p15-elementor-responsive-hover-border-radius-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  dimensionsSourcePath: 'includes/controls/dimensions.php',
  dimensionsSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d',
  controlName: 'border_radius_hover',
  desktopSettingKey: 'border_radius_hover',
  tabletSettingKey: 'border_radius_hover_tablet',
  mobileSettingKey: 'border_radius_hover_mobile',
});

export interface P15ElementorResponsiveHoverBorderRadiusEntryV1 {
  sourceNodeId: string;
  tabletCornerRadiusPx?: number;
  mobileCornerRadiusPx?: number;
}

export interface P15ElementorResponsiveHoverBorderRadiusSummaryEntryV1 {
  sourceNodeId: string;
  tabletCornerRadiusPx: number | null;
  mobileCornerRadiusPx: number | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_RESULT_VERSION;
  status: P15ElementorResponsiveHoverBorderRadiusStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveHoverBorderRadiusEntryV1;
  summaryField: 'resolvedHoverBorderRadii';
  summary: P15ElementorResponsiveHoverBorderRadiusSummaryEntryV1;
  issueCode: P15ElementorResponsiveHoverBorderRadiusIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveHoverBorderRadiusManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveHoverBorderRadiusIssueCode =
  FamilyIssueCode<'P15_RESPONSIVE_HOVER_BORDER_RADIUS'>;
export type P15ElementorResponsiveHoverBorderRadiusIssueV1 = FamilyIssueV1<P15ElementorResponsiveHoverBorderRadiusIssueCode>;
export type P15ElementorResponsiveHoverBorderRadiusStatus = FamilyStatus<'NO_RESPONSIVE_HOVER_BORDER_RADIUS_OVERRIDES', 'RESPONSIVE_HOVER_BORDER_RADIUS_RESOLVED'>;
export type P15ElementorResponsiveHoverBorderRadiusResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_EVIDENCE;
const valueCodec = intRangeCodec({ min: 0, max: P15_NEUTRAL_EXPORT_MAX_RADIUS_PX });
const FAMILY = responsiveEnumFamily({
  id: 'responsive-hover-border-radius',
  issuePrefix: 'P15_RESPONSIVE_HOVER_BORDER_RADIUS',
  subject: 'Responsive hover border radius',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_HOVER_BORDER_RADIUS_OVERRIDES', resolved: 'RESPONSIVE_HOVER_BORDER_RADIUS_RESOLVED' },
  summaryField: 'resolvedHoverBorderRadii',
  fields: [
    { field: 'tabletCornerRadiusPx', settingKey: EVIDENCE.tabletSettingKey, codec: valueCodec, toElementor: elementorLinkedDimensionsPx, conflictSubject: 'tablet border-radius' },
    { field: 'mobileCornerRadiusPx', settingKey: EVIDENCE.mobileSettingKey, codec: valueCodec, toElementor: elementorLinkedDimensionsPx, conflictSubject: 'mobile border-radius' },
  ],
  entryEnvelopeMessage: 'Each responsive hover border radius entry may contain only sourceNodeId plus tablet/mobile border-radius values.',
  overrideRequiredMessage: 'Each responsive hover border radius entry must explicitly provide tabletCornerRadiusPx and/or mobileCornerRadiusPx.',
  valueInvalidMessage: `Responsive hover border radius must be an integer px value between 0 and ${P15_NEUTRAL_EXPORT_MAX_RADIUS_PX}.`,
});

const API = familyApi<P15ElementorResponsiveHoverBorderRadiusResultV1>(FAMILY);

/**
 * Apply only explicit default tablet/mobile uniform px border-radius overrides to exact generated container bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer responsive hover border radius, convert units,
 * change desktop hover border radius or normal-state radius, introduce negative radius values, or claim responsive closure.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-style.test.ts`.
 */
export function resolveP15ElementorResponsiveContainerHoverBorderRadius(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveHoverBorderRadiusResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized border-radius metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveHoverBorderRadiusSummary(result: P15ElementorResponsiveHoverBorderRadiusResultV1): string {
  return API.serialize(result);
}
