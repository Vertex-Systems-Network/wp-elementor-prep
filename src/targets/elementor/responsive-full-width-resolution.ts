import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { intRangeCodec, elementorPxSlider } from './mapping-engine/codecs';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MANIFEST_VERSION =
  'p15-elementor-responsive-full-width-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_RESULT_VERSION =
  'p15-elementor-responsive-full-width-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MIN_PX = 500 as const;
export const P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_PX = 1600 as const;

export const P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_EVIDENCE = Object.freeze({
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
  conditionRequiredValue: 'full',
  controlName: 'width',
  desktopSettingKey: 'width',
  tabletSettingKey: 'width_tablet',
  mobileSettingKey: 'width_mobile',
  unit: 'px',
  minPx: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MIN_PX,
  maxPx: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_PX,
});

export interface P15ElementorResponsiveFullWidthEntryV1 {
  sourceNodeId: string;
  contentWidthMode: 'full';
  tabletWidthPx?: number;
  mobileWidthPx?: number;
}

export interface P15ElementorResponsiveFullWidthManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveFullWidthEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveFullWidthIssueCode =
  | 'P15_RESPONSIVE_FULL_WIDTH_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_FULL_WIDTH_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_FULL_WIDTH_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_FULL_WIDTH_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_FULL_WIDTH_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_ENTRY_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_FULL_WIDTH_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_FULL_WIDTH_CONDITION_MISMATCH'
  | 'P15_RESPONSIVE_FULL_WIDTH_VALUE_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_FULL_WIDTH_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_FULL_WIDTH_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_FULL_WIDTH_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveFullWidthIssueV1 {
  code: P15ElementorResponsiveFullWidthIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveFullWidthStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_FULL_WIDTH_OVERRIDES'
  | 'RESPONSIVE_FULL_WIDTH_RESOLVED';

export interface P15ElementorResponsiveFullWidthSummaryEntryV1 {
  sourceNodeId: string;
  contentWidthMode: 'full';
  tabletWidthPx: number | null;
  mobileWidthPx: number | null;
}

export interface P15ElementorResponsiveFullWidthResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_RESULT_VERSION;
  status: P15ElementorResponsiveFullWidthStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedWidths: P15ElementorResponsiveFullWidthSummaryEntryV1[];
  issues: P15ElementorResponsiveFullWidthIssueV1[];
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

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_EVIDENCE;
const valueCodec = intRangeCodec({ min: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MIN_PX, max: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_PX });
const FAMILY = responsiveEnumFamily({
  id: 'responsive-full-width',
  issuePrefix: 'P15_RESPONSIVE_FULL_WIDTH',
  subject: 'Responsive full width',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_FULL_WIDTH_OVERRIDES', resolved: 'RESPONSIVE_FULL_WIDTH_RESOLVED' },
  summaryField: 'resolvedWidths',
  fields: [
    { field: 'tabletWidthPx', settingKey: EVIDENCE.tabletSettingKey, codec: valueCodec, toElementor: elementorPxSlider, conflictSubject: 'tablet full width' },
    { field: 'mobileWidthPx', settingKey: EVIDENCE.mobileSettingKey, codec: valueCodec, toElementor: elementorPxSlider, conflictSubject: 'mobile full width' },
  ],
  // Every entry must explicitly request contentWidthMode=full.
  requiredEntryFields: [{ field: 'contentWidthMode', value: 'full', code: 'CONDITION_MISMATCH', message: 'Responsive full width requires explicit contentWidthMode=full.' }],
  extraIssueSuffixes: ['CONDITION_MISMATCH'],
  // Only an unset/boxed/full content_width may transition; the transition itself sets content_width=full.
  precondition: (settings) => (settings.content_width !== undefined && settings.content_width !== 'boxed' && settings.content_width !== 'full'
    ? { code: 'CONDITION_MISMATCH', message: 'Responsive full width can transition only an unset/boxed/full Elementor content_width state.' }
    : null),
  leadingWrites: [{ settingKey: EVIDENCE.conditionControlName, value: EVIDENCE.conditionRequiredValue }],
  entryEnvelopeMessage: 'Each responsive full width entry may contain only sourceNodeId plus tablet/mobile full width values.',
  overrideRequiredMessage: 'Each responsive full width entry must explicitly provide tabletWidthPx and/or mobileWidthPx.',
  valueInvalidMessage: `Responsive full width must be an integer px value between ${P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MIN_PX} and ${P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_PX}.`,
});

/**
 * Apply explicit tablet/mobile full-width overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerFullWidth(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveFullWidthResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveFullWidthResultV1;
}

/** Serialize only sanitized full-width metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFullWidthSummary(
  result: P15ElementorResponsiveFullWidthResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
