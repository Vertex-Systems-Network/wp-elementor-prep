import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { intRangeCodec, elementorPxSlider } from './mapping-engine/codecs';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION =
  'p15-elementor-responsive-min-height-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_RESULT_VERSION =
  'p15-elementor-responsive-min-height-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX = 1440 as const;

export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  sliderSourcePath: 'includes/controls/slider.php',
  sliderSourceBlobSha: 'f56798bd5e0a2bee5a7c3a7771ecbaf2af87fb7f',
  fixtureSourcePath: 'tests/jest/unit/modules/container-converter/assets/js/editor/commands/convert.test.js',
  fixtureSourceBlobSha: '27c8d0eadae77a9c4e33258111829f47ed9e217b',
  controlName: 'min_height',
  desktopSettingKey: 'min_height',
  tabletSettingKey: 'min_height_tablet',
  mobileSettingKey: 'min_height_mobile',
  unit: 'px',
  maxPx: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX,
});

export interface P15ElementorResponsiveMinHeightEntryV1 {
  sourceNodeId: string;
  tabletMinHeightPx?: number;
  mobileMinHeightPx?: number;
}

export interface P15ElementorResponsiveMinHeightManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveMinHeightEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveMinHeightIssueCode =
  | 'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_MIN_HEIGHT_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_MIN_HEIGHT_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_MIN_HEIGHT_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_MIN_HEIGHT_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_ENTRY_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_MIN_HEIGHT_VALUE_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_MIN_HEIGHT_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_MIN_HEIGHT_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_MIN_HEIGHT_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveMinHeightIssueV1 {
  code: P15ElementorResponsiveMinHeightIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveMinHeightStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_MIN_HEIGHT_OVERRIDES'
  | 'RESPONSIVE_MIN_HEIGHT_RESOLVED';

export interface P15ElementorResponsiveMinHeightSummaryEntryV1 {
  sourceNodeId: string;
  tabletMinHeightPx: number | null;
  mobileMinHeightPx: number | null;
}

export interface P15ElementorResponsiveMinHeightResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_RESULT_VERSION;
  status: P15ElementorResponsiveMinHeightStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedMinHeights: P15ElementorResponsiveMinHeightSummaryEntryV1[];
  issues: P15ElementorResponsiveMinHeightIssueV1[];
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

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_EVIDENCE;
const valueCodec = intRangeCodec({ min: 0, max: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX });
const FAMILY = responsiveEnumFamily({
  id: 'responsive-min-height',
  issuePrefix: 'P15_RESPONSIVE_MIN_HEIGHT',
  subject: 'Responsive min height',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_MIN_HEIGHT_OVERRIDES', resolved: 'RESPONSIVE_MIN_HEIGHT_RESOLVED' },
  summaryField: 'resolvedMinHeights',
  fields: [
    { field: 'tabletMinHeightPx', settingKey: EVIDENCE.tabletSettingKey, codec: valueCodec, toElementor: elementorPxSlider, conflictSubject: 'tablet min-height' },
    { field: 'mobileMinHeightPx', settingKey: EVIDENCE.mobileSettingKey, codec: valueCodec, toElementor: elementorPxSlider, conflictSubject: 'mobile min-height' },
  ],
  entryEnvelopeMessage: 'Each responsive min height entry may contain only sourceNodeId plus tablet/mobile min-height values.',
  overrideRequiredMessage: 'Each responsive min height entry must explicitly provide tabletMinHeightPx and/or mobileMinHeightPx.',
  valueInvalidMessage: `Responsive min height must be an integer px value between 0 and ${P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX}.`,
});

/**
 * Apply explicit tablet/mobile min-height overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerMinHeight(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveMinHeightResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveMinHeightResultV1;
}

/** Serialize only sanitized min-height metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveMinHeightSummary(
  result: P15ElementorResponsiveMinHeightResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
