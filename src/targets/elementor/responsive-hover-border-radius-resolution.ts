import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { P15_NEUTRAL_EXPORT_MAX_RADIUS_PX } from './neutral-export-ir';
import { elementorLinkedDimensionsPx, intRangeCodec } from './mapping-engine/codecs';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import type { ElementorTemplateV04 } from './template-v04';

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

export interface P15ElementorResponsiveHoverBorderRadiusManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveHoverBorderRadiusEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveHoverBorderRadiusIssueCode =
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_ENTRY_INVALID'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_VALUE_INVALID'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_HOVER_BORDER_RADIUS_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveHoverBorderRadiusIssueV1 {
  code: P15ElementorResponsiveHoverBorderRadiusIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveHoverBorderRadiusStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_HOVER_BORDER_RADIUS_OVERRIDES'
  | 'RESPONSIVE_HOVER_BORDER_RADIUS_RESOLVED';

export interface P15ElementorResponsiveHoverBorderRadiusSummaryEntryV1 {
  sourceNodeId: string;
  tabletCornerRadiusPx: number | null;
  mobileCornerRadiusPx: number | null;
}

export interface P15ElementorResponsiveHoverBorderRadiusResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_RESULT_VERSION;
  status: P15ElementorResponsiveHoverBorderRadiusStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedHoverBorderRadii: P15ElementorResponsiveHoverBorderRadiusSummaryEntryV1[];
  issues: P15ElementorResponsiveHoverBorderRadiusIssueV1[];
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

/**
 * Apply only explicit default tablet/mobile uniform px border-radius overrides to exact generated container bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer responsive hover border radius, convert units,
 * change desktop hover border radius or normal-state radius, introduce negative radius values, or claim responsive closure.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-style.test.ts`.
 */
export function resolveP15ElementorResponsiveContainerHoverBorderRadius(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveHoverBorderRadiusResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveHoverBorderRadiusResultV1;
}

/** Serialize only sanitized border-radius metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveHoverBorderRadiusSummary(
  result: P15ElementorResponsiveHoverBorderRadiusResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
