import { P15_NEUTRAL_EXPORT_MAX_SPACING_PX } from './neutral-export-ir';
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

export const P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION =
  'p15-elementor-responsive-margin-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_MARGIN_RESULT_VERSION =
  'p15-elementor-responsive-margin-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_MARGIN_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_MARGIN_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  dimensionsSourcePath: 'includes/controls/dimensions.php',
  dimensionsSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d',
  controlName: 'margin',
  tabletSettingKey: 'margin_tablet',
  mobileSettingKey: 'margin_mobile',
  unit: 'px',
});

export interface P15ElementorResponsiveMarginPx {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface P15ElementorResponsiveMarginEntryV1 {
  sourceNodeId: string;
  tabletMarginPx?: P15ElementorResponsiveMarginPx;
  mobileMarginPx?: P15ElementorResponsiveMarginPx;
}

export interface P15ElementorResponsiveMarginSummaryEntryV1 {
  sourceNodeId: string;
  tabletMarginPx: P15ElementorResponsiveMarginPx | null;
  mobileMarginPx: P15ElementorResponsiveMarginPx | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_MARGIN_RESULT_VERSION;
  status: P15ElementorResponsiveMarginStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveMarginEntryV1;
  summaryField: 'resolvedMargins';
  summary: P15ElementorResponsiveMarginSummaryEntryV1;
  issueCode: P15ElementorResponsiveMarginIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveMarginManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveMarginIssueCode = FamilyIssueCode<'P15_RESPONSIVE_MARGIN'>;
export type P15ElementorResponsiveMarginIssueV1 = FamilyIssueV1<P15ElementorResponsiveMarginIssueCode>;
export type P15ElementorResponsiveMarginStatus = FamilyStatus<'NO_RESPONSIVE_MARGIN_OVERRIDES', 'RESPONSIVE_MARGIN_RESOLVED'>;
export type P15ElementorResponsiveMarginResultV1 = FamilyResultV1<Contract>;

const P15_ELEMENTOR_RESPONSIVE_MARGIN_FAMILY = responsiveBoxSpacingFamily({
  control: 'margin',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_MARGIN_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_MARGIN_MAX_ENTRIES,
  evidence: P15_ELEMENTOR_RESPONSIVE_MARGIN_EVIDENCE,
  valueInvalidMessage: `Responsive margin must contain exact finite non-negative top/right/bottom/left px values between 0 and ${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}.`,
});

const API = familyApi<P15ElementorResponsiveMarginResultV1>(P15_ELEMENTOR_RESPONSIVE_MARGIN_FAMILY);

/**
 * Apply explicit tablet/mobile margin overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3a); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerMargin(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveMarginResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized margin metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveMarginSummary(result: P15ElementorResponsiveMarginResultV1): string {
  return API.serialize(result);
}
