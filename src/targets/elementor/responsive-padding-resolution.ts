import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import { P15_NEUTRAL_EXPORT_MAX_SPACING_PX, type P15NeutralPaddingPx } from './neutral-export-ir';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { responsiveBoxSpacingFamily } from './mapping-engine/families/responsive-spacing';
import type { ElementorTemplateV04 } from './template-v04';

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

export interface P15ElementorResponsivePaddingManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsivePaddingEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsivePaddingIssueCode =
  | 'P15_RESPONSIVE_PADDING_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_PADDING_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_PADDING_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_PADDING_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_PADDING_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_PADDING_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_PADDING_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_PADDING_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_PADDING_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_PADDING_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_PADDING_ENTRY_INVALID'
  | 'P15_RESPONSIVE_PADDING_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_PADDING_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_PADDING_VALUE_INVALID'
  | 'P15_RESPONSIVE_PADDING_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_PADDING_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_PADDING_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_PADDING_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_PADDING_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsivePaddingIssueV1 {
  code: P15ElementorResponsivePaddingIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsivePaddingStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_PADDING_OVERRIDES'
  | 'RESPONSIVE_PADDING_RESOLVED';

export interface P15ElementorResponsivePaddingSummaryEntryV1 {
  sourceNodeId: string;
  tabletPaddingPx: P15NeutralPaddingPx | null;
  mobilePaddingPx: P15NeutralPaddingPx | null;
}

export interface P15ElementorResponsivePaddingResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_PADDING_RESULT_VERSION;
  status: P15ElementorResponsivePaddingStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedPaddings: P15ElementorResponsivePaddingSummaryEntryV1[];
  issues: P15ElementorResponsivePaddingIssueV1[];
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

const P15_ELEMENTOR_RESPONSIVE_PADDING_FAMILY = responsiveBoxSpacingFamily({
  control: 'padding',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_PADDING_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_PADDING_MAX_ENTRIES,
  evidence: P15_ELEMENTOR_RESPONSIVE_PADDING_EVIDENCE,
  valueInvalidMessage: `Responsive padding must contain exact top/right/bottom/left px values between 0 and ${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}.`,
});

/**
 * Apply explicit tablet/mobile padding overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3a); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerPadding(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsivePaddingResultV1 {
  return resolveContainerPropertyFamily(P15_ELEMENTOR_RESPONSIVE_PADDING_FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsivePaddingResultV1;
}

/** Serialize only sanitized padding metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsivePaddingSummary(
  result: P15ElementorResponsivePaddingResultV1,
): string {
  return serializeContainerPropertyFamilySummary(P15_ELEMENTOR_RESPONSIVE_PADDING_FAMILY, result as unknown as ContainerFamilyResult);
}
