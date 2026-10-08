import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { responsiveGapFamily } from './mapping-engine/families/responsive-spacing';
import type { ElementorTemplateV04 } from './template-v04';

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

export interface P15ElementorResponsiveGapManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveGapEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveGapIssueCode =
  | 'P15_RESPONSIVE_GAP_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_GAP_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_GAP_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_GAP_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_GAP_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_GAP_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_GAP_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_GAP_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_GAP_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_GAP_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_GAP_ENTRY_INVALID'
  | 'P15_RESPONSIVE_GAP_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_GAP_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_GAP_VALUE_INVALID'
  | 'P15_RESPONSIVE_GAP_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_GAP_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_GAP_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_GAP_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_GAP_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveGapIssueV1 {
  code: P15ElementorResponsiveGapIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveGapStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_GAP_OVERRIDES'
  | 'RESPONSIVE_GAPS_RESOLVED';

export interface P15ElementorResponsiveGapSummaryEntryV1 {
  sourceNodeId: string;
  tabletGapPx: number | null;
  tabletRowGapPx: number | null;
  tabletColumnGapPx: number | null;
  mobileGapPx: number | null;
  mobileRowGapPx: number | null;
  mobileColumnGapPx: number | null;
}

export interface P15ElementorResponsiveGapResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_GAP_RESULT_VERSION;
  status: P15ElementorResponsiveGapStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedGaps: P15ElementorResponsiveGapSummaryEntryV1[];
  issues: P15ElementorResponsiveGapIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const P15_ELEMENTOR_RESPONSIVE_GAP_FAMILY = responsiveGapFamily({
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_GAP_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_GAP_MAX_ENTRIES,
  evidence: P15_ELEMENTOR_RESPONSIVE_GAP_EVIDENCE,
});

/**
 * Apply explicit tablet/mobile gap overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3a); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerGaps(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveGapResultV1 {
  return resolveContainerPropertyFamily(P15_ELEMENTOR_RESPONSIVE_GAP_FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveGapResultV1;
}

/** Serialize only sanitized gap metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveGapSummary(
  result: P15ElementorResponsiveGapResultV1,
): string {
  return serializeContainerPropertyFamilySummary(P15_ELEMENTOR_RESPONSIVE_GAP_FAMILY, result as unknown as ContainerFamilyResult);
}
