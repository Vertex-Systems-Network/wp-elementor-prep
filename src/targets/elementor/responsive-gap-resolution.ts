import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { responsiveGapFamily } from './mapping-engine/families/responsive-spacing';

export const P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION =
  'p15-elementor-responsive-gap-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_GAP_RESULT_VERSION =
  'p15-elementor-responsive-gap-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_GAP_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_GAP_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
  flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
  upgradeTestSourcePath: 'tests/phpunit/elementor/core/upgrade/test-upgrades.php',
  upgradeTestSourceBlobSha: 'ca26af25b0e35d24303a771eb3a85dc1fee21b89',
  groupName: 'flex',
  controlName: 'gap',
  desktopSettingKey: 'flex_gap',
  tabletSettingKey: 'flex_gap_tablet',
  mobileSettingKey: 'flex_gap_mobile',
});

export interface P15ElementorResponsiveGapEntryV1 {
  sourceNodeId: string;
  tabletGapPx?: number;
  tabletRowGapPx?: number;
  tabletColumnGapPx?: number;
  mobileGapPx?: number;
  mobileRowGapPx?: number;
  mobileColumnGapPx?: number;
}

export interface P15ElementorResponsiveGapSummaryEntryV1 {
  sourceNodeId: string;
  tabletGapPx: number | null;
  tabletRowGapPx: number | null;
  tabletColumnGapPx: number | null;
  mobileGapPx: number | null;
  mobileRowGapPx: number | null;
  mobileColumnGapPx: number | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_GAP_RESULT_VERSION;
  status: P15ElementorResponsiveGapStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveGapEntryV1;
  summaryField: 'resolvedGaps';
  summary: P15ElementorResponsiveGapSummaryEntryV1;
  issueCode: P15ElementorResponsiveGapIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveGapManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveGapIssueCode = FamilyIssueCode<'P15_RESPONSIVE_GAP'>;
export type P15ElementorResponsiveGapIssueV1 = FamilyIssueV1<P15ElementorResponsiveGapIssueCode>;
export type P15ElementorResponsiveGapStatus = FamilyStatus<'NO_RESPONSIVE_GAP_OVERRIDES', 'RESPONSIVE_GAPS_RESOLVED'>;
export type P15ElementorResponsiveGapResultV1 = FamilyResultV1<Contract>;

const P15_ELEMENTOR_RESPONSIVE_GAP_FAMILY = responsiveGapFamily({
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_GAP_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_GAP_MAX_ENTRIES,
  evidence: P15_ELEMENTOR_RESPONSIVE_GAP_EVIDENCE,
});

const API = familyApi<P15ElementorResponsiveGapResultV1>(P15_ELEMENTOR_RESPONSIVE_GAP_FAMILY);

/**
 * Apply explicit tablet/mobile gap overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3a); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerGaps(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveGapResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized gap metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveGapSummary(result: P15ElementorResponsiveGapResultV1): string {
  return API.serialize(result);
}
