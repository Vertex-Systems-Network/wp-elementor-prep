import { P15_NEUTRAL_EXPORT_MAX_SPACING_PX, type P15NeutralPaddingPx } from './neutral-export-ir';
import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { responsiveBoxSpacingFamily } from './mapping-engine/families/responsive-spacing';

export const P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION =
  'p15-elementor-responsive-padding-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_PADDING_RESULT_VERSION =
  'p15-elementor-responsive-padding-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_PADDING_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_PADDING_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  fixtureSourcePath: 'tests/qunit/mock/library/pages/landing-page-hotel.json',
  fixtureSourceBlobSha: 'd916825ab5483424bd61bb31bc2921bb7a6b0b78',
  controlName: 'padding',
  tabletSettingKey: 'padding_tablet',
  mobileSettingKey: 'padding_mobile',
});

export interface P15ElementorResponsivePaddingEntryV1 {
  sourceNodeId: string;
  tabletPaddingPx?: P15NeutralPaddingPx;
  mobilePaddingPx?: P15NeutralPaddingPx;
}

export interface P15ElementorResponsivePaddingSummaryEntryV1 {
  sourceNodeId: string;
  tabletPaddingPx: P15NeutralPaddingPx | null;
  mobilePaddingPx: P15NeutralPaddingPx | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_PADDING_RESULT_VERSION;
  status: P15ElementorResponsivePaddingStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsivePaddingEntryV1;
  summaryField: 'resolvedPaddings';
  summary: P15ElementorResponsivePaddingSummaryEntryV1;
  issueCode: P15ElementorResponsivePaddingIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsivePaddingManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsivePaddingIssueCode = FamilyIssueCode<'P15_RESPONSIVE_PADDING'>;
export type P15ElementorResponsivePaddingIssueV1 = FamilyIssueV1<P15ElementorResponsivePaddingIssueCode>;
export type P15ElementorResponsivePaddingStatus = FamilyStatus<'NO_RESPONSIVE_PADDING_OVERRIDES', 'RESPONSIVE_PADDING_RESOLVED'>;
export type P15ElementorResponsivePaddingResultV1 = FamilyResultV1<Contract>;

const P15_ELEMENTOR_RESPONSIVE_PADDING_FAMILY = responsiveBoxSpacingFamily({
  control: 'padding',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_PADDING_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_PADDING_MAX_ENTRIES,
  evidence: P15_ELEMENTOR_RESPONSIVE_PADDING_EVIDENCE,
  valueInvalidMessage: `Responsive padding must contain exact top/right/bottom/left px values between 0 and ${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}.`,
});

const API = familyApi<P15ElementorResponsivePaddingResultV1>(P15_ELEMENTOR_RESPONSIVE_PADDING_FAMILY);

/**
 * Apply explicit tablet/mobile padding overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3a); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerPadding(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsivePaddingResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized padding metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsivePaddingSummary(result: P15ElementorResponsivePaddingResultV1): string {
  return API.serialize(result);
}
