import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { intRangeCodec, elementorPxSlider } from './mapping-engine/codecs';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MANIFEST_VERSION =
  'p15-elementor-responsive-boxed-width-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_RESULT_VERSION =
  'p15-elementor-responsive-boxed-width-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MIN_PX = 500 as const;
export const P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_PX = 1600 as const;

export const P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  sliderSourcePath: 'includes/controls/slider.php',
  sliderSourceBlobSha: 'f56798bd5e0a2bee5a7c3a7771ecbaf2af87fb7f',
  fixtureSourcePath: 'tests/jest/unit/modules/container-converter/assets/js/editor/commands/convert.test.js',
  fixtureSourceBlobSha: '27c8d0eadae77a9c4e33258111829f47ed9e217b',
  conditionControlName: 'content_width',
  conditionDefaultValue: 'boxed',
  conditionRequiredValue: 'boxed',
  controlName: 'boxed_width',
  desktopSettingKey: 'boxed_width',
  tabletSettingKey: 'boxed_width_tablet',
  mobileSettingKey: 'boxed_width_mobile',
  unit: 'px',
  minPx: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MIN_PX,
  maxPx: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_PX,
});

export interface P15ElementorResponsiveBoxedWidthEntryV1 {
  sourceNodeId: string;
  tabletBoxedWidthPx?: number;
  mobileBoxedWidthPx?: number;
}

export interface P15ElementorResponsiveBoxedWidthManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveBoxedWidthEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveBoxedWidthIssueCode =
  | 'P15_RESPONSIVE_BOXED_WIDTH_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_BOXED_WIDTH_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_BOXED_WIDTH_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_BOXED_WIDTH_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_BOXED_WIDTH_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_BOXED_WIDTH_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_BOXED_WIDTH_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_BOXED_WIDTH_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_BOXED_WIDTH_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_BOXED_WIDTH_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_BOXED_WIDTH_ENTRY_INVALID'
  | 'P15_RESPONSIVE_BOXED_WIDTH_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_BOXED_WIDTH_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_BOXED_WIDTH_CONDITION_MISMATCH'
  | 'P15_RESPONSIVE_BOXED_WIDTH_VALUE_INVALID'
  | 'P15_RESPONSIVE_BOXED_WIDTH_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_BOXED_WIDTH_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_BOXED_WIDTH_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_BOXED_WIDTH_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_BOXED_WIDTH_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveBoxedWidthIssueV1 {
  code: P15ElementorResponsiveBoxedWidthIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveBoxedWidthStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_BOXED_WIDTH_OVERRIDES'
  | 'RESPONSIVE_BOXED_WIDTH_RESOLVED';

export interface P15ElementorResponsiveBoxedWidthSummaryEntryV1 {
  sourceNodeId: string;
  tabletBoxedWidthPx: number | null;
  mobileBoxedWidthPx: number | null;
}

export interface P15ElementorResponsiveBoxedWidthResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_RESULT_VERSION;
  status: P15ElementorResponsiveBoxedWidthStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedBoxedWidths: P15ElementorResponsiveBoxedWidthSummaryEntryV1[];
  issues: P15ElementorResponsiveBoxedWidthIssueV1[];
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

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_EVIDENCE;
const valueCodec = intRangeCodec({ min: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MIN_PX, max: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_PX });
const FAMILY = responsiveEnumFamily({
  id: 'responsive-boxed-width',
  issuePrefix: 'P15_RESPONSIVE_BOXED_WIDTH',
  subject: 'Responsive boxed width',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_BOXED_WIDTH_OVERRIDES', resolved: 'RESPONSIVE_BOXED_WIDTH_RESOLVED' },
  summaryField: 'resolvedBoxedWidths',
  fields: [
    { field: 'tabletBoxedWidthPx', settingKey: EVIDENCE.tabletSettingKey, codec: valueCodec, toElementor: elementorPxSlider, conflictSubject: 'tablet min-height' },
    { field: 'mobileBoxedWidthPx', settingKey: EVIDENCE.mobileSettingKey, codec: valueCodec, toElementor: elementorPxSlider, conflictSubject: 'mobile min-height' },
  ],
  extraIssueSuffixes: ['CONDITION_MISMATCH'],
  // Boxed width is meaningful only for an unset or boxed content_width.
  precondition: (settings) => (settings.content_width !== undefined && settings.content_width !== 'boxed'
    ? { code: 'CONDITION_MISMATCH', message: 'Responsive boxed width requires the exact Elementor content_width=boxed condition.' }
    : null),
  entryEnvelopeMessage: 'Each responsive boxed width entry may contain only sourceNodeId plus tablet/mobile min-height values.',
  overrideRequiredMessage: 'Each responsive boxed width entry must explicitly provide tabletBoxedWidthPx and/or mobileBoxedWidthPx.',
  valueInvalidMessage: `Responsive boxed width must be an integer px value between ${P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MIN_PX} and ${P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MAX_PX}.`,
});

/**
 * Apply explicit tablet/mobile boxed-width overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerBoxedWidth(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveBoxedWidthResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveBoxedWidthResultV1;
}

/** Serialize only sanitized boxed-width metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveBoxedWidthSummary(
  result: P15ElementorResponsiveBoxedWidthResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
