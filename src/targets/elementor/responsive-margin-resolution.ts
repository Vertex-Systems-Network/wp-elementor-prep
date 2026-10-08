import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import { P15_NEUTRAL_EXPORT_MAX_SPACING_PX } from './neutral-export-ir';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { responsiveBoxSpacingFamily } from './mapping-engine/families/responsive-spacing';
import type { ElementorTemplateV04 } from './template-v04';

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

export interface P15ElementorResponsiveMarginManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveMarginEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveMarginIssueCode =
  | 'P15_RESPONSIVE_MARGIN_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_MARGIN_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_MARGIN_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_MARGIN_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_MARGIN_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_MARGIN_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_MARGIN_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_MARGIN_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_MARGIN_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_MARGIN_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_MARGIN_ENTRY_INVALID'
  | 'P15_RESPONSIVE_MARGIN_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_MARGIN_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_MARGIN_VALUE_INVALID'
  | 'P15_RESPONSIVE_MARGIN_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_MARGIN_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_MARGIN_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_MARGIN_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_MARGIN_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveMarginIssueV1 {
  code: P15ElementorResponsiveMarginIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveMarginStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_MARGIN_OVERRIDES'
  | 'RESPONSIVE_MARGIN_RESOLVED';

export interface P15ElementorResponsiveMarginSummaryEntryV1 {
  sourceNodeId: string;
  tabletMarginPx: P15ElementorResponsiveMarginPx | null;
  mobileMarginPx: P15ElementorResponsiveMarginPx | null;
}

export interface P15ElementorResponsiveMarginResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_MARGIN_RESULT_VERSION;
  status: P15ElementorResponsiveMarginStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedMargins: P15ElementorResponsiveMarginSummaryEntryV1[];
  issues: P15ElementorResponsiveMarginIssueV1[];
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

const P15_ELEMENTOR_RESPONSIVE_MARGIN_FAMILY = responsiveBoxSpacingFamily({
  control: 'margin',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_MARGIN_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_MARGIN_MAX_ENTRIES,
  evidence: P15_ELEMENTOR_RESPONSIVE_MARGIN_EVIDENCE,
  valueInvalidMessage: `Responsive margin must contain exact finite non-negative top/right/bottom/left px values between 0 and ${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}.`,
});

/**
 * Apply explicit tablet/mobile margin overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3a); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerMargin(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveMarginResultV1 {
  return resolveContainerPropertyFamily(P15_ELEMENTOR_RESPONSIVE_MARGIN_FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveMarginResultV1;
}

/** Serialize only sanitized margin metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveMarginSummary(
  result: P15ElementorResponsiveMarginResultV1,
): string {
  return serializeContainerPropertyFamilySummary(P15_ELEMENTOR_RESPONSIVE_MARGIN_FAMILY, result as unknown as ContainerFamilyResult);
}
