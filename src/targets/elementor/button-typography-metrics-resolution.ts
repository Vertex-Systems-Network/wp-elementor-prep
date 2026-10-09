import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { elementorPxSlider, type ValueCodec } from './mapping-engine/codecs';
import { groupPrefixConflict, safeIntegerCodec, steppedNumberCodec } from './mapping-engine/families/button-style';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_VERSION =
  'p15-elementor-button-typography-metrics-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_RESULT_VERSION =
  'p15-elementor-button-typography-metrics-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_FONT_FAMILY_MAX_LENGTH = 128 as const;
export const P15_ELEMENTOR_BUTTON_FONT_SIZE_MIN_PX = 1 as const;
export const P15_ELEMENTOR_BUTTON_FONT_SIZE_MAX_PX = 200 as const;
export const P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MIN_PX = 1 as const;
export const P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MAX_PX = 400 as const;
export const P15_ELEMENTOR_BUTTON_LETTER_SPACING_MIN_PX = -5 as const;
export const P15_ELEMENTOR_BUTTON_LETTER_SPACING_MAX_PX = 10 as const;
export const P15_ELEMENTOR_BUTTON_LETTER_SPACING_STEP_PX = 0.1 as const;
export const P15_ELEMENTOR_BUTTON_WORD_SPACING_MIN_PX = 0 as const;
export const P15_ELEMENTOR_BUTTON_WORD_SPACING_MAX_PX = 50 as const;

export const P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  typographyGroupSourcePath: 'includes/controls/groups/typography.php',
  typographyGroupSourceBlobSha: 'eea951b6331bd84c80e24b7fb6ab249e5c4c41a1',
  groupBaseSourcePath: 'includes/controls/groups/base.php',
  groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234',
  groupName: 'typography',
  groupPrefixRule: '{{ControlName}}_',
  starterFieldName: 'typography',
  starterSettingKey: 'typography_typography',
  starterValue: 'custom',
  fontFamilyFieldName: 'font_family',
  fontFamilySettingKey: 'typography_font_family',
  fontFamilyMaxLength: P15_ELEMENTOR_BUTTON_FONT_FAMILY_MAX_LENGTH,
  fontSizeFieldName: 'font_size',
  fontSizeSettingKey: 'typography_font_size',
  fontSizeUnit: 'px',
  fontSizeMinPx: P15_ELEMENTOR_BUTTON_FONT_SIZE_MIN_PX,
  fontSizeMaxPx: P15_ELEMENTOR_BUTTON_FONT_SIZE_MAX_PX,
  lineHeightFieldName: 'line_height',
  lineHeightSettingKey: 'typography_line_height',
  lineHeightUnit: 'px',
  lineHeightMinPx: P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MIN_PX,
  lineHeightMaxPx: P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MAX_PX,
  letterSpacingFieldName: 'letter_spacing',
  letterSpacingSettingKey: 'typography_letter_spacing',
  letterSpacingUnit: 'px',
  letterSpacingMinPx: P15_ELEMENTOR_BUTTON_LETTER_SPACING_MIN_PX,
  letterSpacingMaxPx: P15_ELEMENTOR_BUTTON_LETTER_SPACING_MAX_PX,
  letterSpacingStepPx: P15_ELEMENTOR_BUTTON_LETTER_SPACING_STEP_PX,
  wordSpacingFieldName: 'word_spacing',
  wordSpacingSettingKey: 'typography_word_spacing',
  wordSpacingUnit: 'px',
  wordSpacingMinPx: P15_ELEMENTOR_BUTTON_WORD_SPACING_MIN_PX,
  wordSpacingMaxPx: P15_ELEMENTOR_BUTTON_WORD_SPACING_MAX_PX,
  sourceResponsiveFields: ['font_size', 'line_height', 'letter_spacing', 'word_spacing'] as const,
  responsiveWritesIncluded: false,
  globalFontResolutionIncluded: false,
  variableFontAxesIncluded: false,
});

export interface P15ElementorButtonTypographyMetricsEntryV1 {
  sourceNodeId: string;
  fontFamily?: string;
  fontSizePx?: number;
  lineHeightPx?: number;
  letterSpacingPx?: number;
  wordSpacingPx?: number;
}

export interface P15ElementorButtonTypographyMetricsManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonTypographyMetricsEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonTypographyMetricsIssueCode =
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_IR_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_ENTRIES_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_ENTRY_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_FONT_FAMILY_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_FONT_SIZE_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_LINE_HEIGHT_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_LETTER_SPACING_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_WORD_SPACING_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_OVERRIDE_REQUIRED'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonTypographyMetricsIssueV1 {
  code: P15ElementorButtonTypographyMetricsIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonTypographyMetricsStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_TYPOGRAPHY_METRICS_OVERRIDES'
  | 'BUTTON_TYPOGRAPHY_METRICS_RESOLVED';

export interface P15ElementorButtonTypographyMetricsResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_RESULT_VERSION;
  status: P15ElementorButtonTypographyMetricsStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedTypographyMetrics: P15ElementorButtonTypographyMetricsEntryV1[];
  issues: P15ElementorButtonTypographyMetricsIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const EVIDENCE = P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_EVIDENCE;
const fontFamilyCodec = {
  id: 'font-family:literal',
  is: (value: unknown): value is string => typeof value === 'string'
    && value.length > 0
    && value.length <= P15_ELEMENTOR_BUTTON_FONT_FAMILY_MAX_LENGTH
    && value.trim() === value
    && /^[A-Za-z0-9][A-Za-z0-9 ._+-]*$/.test(value),
  snapshot: (value: string) => value,
  encode: (value: string) => value,
};
const FIELDS = [
  { field: 'fontFamily', settingKey: EVIDENCE.fontFamilySettingKey, codec: fontFamilyCodec, slider: false, code: 'FONT_FAMILY_INVALID', message: 'fontFamily must be one bounded literal family name with no quotes, commas, escapes, tokens or fallback list.' },
  { field: 'fontSizePx', settingKey: EVIDENCE.fontSizeSettingKey, codec: safeIntegerCodec(P15_ELEMENTOR_BUTTON_FONT_SIZE_MIN_PX, P15_ELEMENTOR_BUTTON_FONT_SIZE_MAX_PX), slider: true, code: 'FONT_SIZE_INVALID', message: 'fontSizePx must be an integer px value in the exact Elementor 4.2.4 range 1..200.' },
  { field: 'lineHeightPx', settingKey: EVIDENCE.lineHeightSettingKey, codec: safeIntegerCodec(P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MIN_PX, P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MAX_PX), slider: true, code: 'LINE_HEIGHT_INVALID', message: 'lineHeightPx must be a bounded integer px value in 1..400.' },
  { field: 'letterSpacingPx', settingKey: EVIDENCE.letterSpacingSettingKey, codec: steppedNumberCodec(P15_ELEMENTOR_BUTTON_LETTER_SPACING_MIN_PX, P15_ELEMENTOR_BUTTON_LETTER_SPACING_MAX_PX, P15_ELEMENTOR_BUTTON_LETTER_SPACING_STEP_PX), slider: true, code: 'LETTER_SPACING_INVALID', message: 'letterSpacingPx must be a finite px value in -5..10 using 0.1 increments.' },
  { field: 'wordSpacingPx', settingKey: EVIDENCE.wordSpacingSettingKey, codec: safeIntegerCodec(P15_ELEMENTOR_BUTTON_WORD_SPACING_MIN_PX, P15_ELEMENTOR_BUTTON_WORD_SPACING_MAX_PX), slider: true, code: 'WORD_SPACING_INVALID', message: 'wordSpacingPx must be a bounded integer px value in 0..50.' },
] as const;
const FAMILY = containerStyleFamily({
  id: 'button-typography-metrics',
  issuePrefix: 'P15_BUTTON_TYPOGRAPHY_METRICS',
  subject: 'Button typography metrics',
  manifestVersion: P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_TYPOGRAPHY_METRICS_OVERRIDES', resolved: 'BUTTON_TYPOGRAPHY_METRICS_RESOLVED' },
  summaryField: 'resolvedTypographyMetrics',
  target: buttonWidgetTarget('Review nodes cannot participate in Button typography binding.'),
  fields: FIELDS.map((spec) => ({ field: spec.field, codec: spec.codec as ValueCodec<unknown>, optional: 'defined' as const })),
  requireAny: { code: 'OVERRIDE_REQUIRED', message: 'Each entry must explicitly provide at least one typography metric capability.' },
  checks: FIELDS.map((spec) => ({ fields: [spec.field], code: spec.code, pathSuffix: `.${spec.field}`, message: spec.message })),
  leadingAuthorityFlags: ['styleInferencePerformed'],
  extraIssueSuffixes: FIELDS.map((spec) => spec.code),
  entryEnvelopeMessage: 'Each entry may contain only sourceNodeId and explicit fontFamily/fontSizePx/lineHeightPx/letterSpacingPx/wordSpacingPx values.',
  messages: {
    notContainer: 'sourceNodeId must identify an existing neutral Button node.',
    authority: 'Button typography metrics resolution cannot grant inference, mutation, network, closure, compatibility, production or download authority.',
    entriesInvalid: 'buttons must be a bounded array.',
    duplicate: 'Button typography sourceNodeId must be unique.',
  },
  // Any existing typography_* setting refuses the whole typography group, not only the written keys.
  conflictScan: groupPrefixConflict('typography_', (key) => `Generated base candidate already contains Button typography setting ${key}.`),
  writes: (entry) => [
    { settingKey: EVIDENCE.starterSettingKey, value: EVIDENCE.starterValue, conflictSubject: EVIDENCE.starterSettingKey },
    ...FIELDS
      .filter((spec) => entry[spec.field] !== undefined)
      .map((spec) => ({
        settingKey: spec.settingKey,
        value: spec.slider ? elementorPxSlider(entry[spec.field] as number) : entry[spec.field],
        conflictSubject: spec.settingKey,
      })),
  ],
});

/**
 * Apply only explicit desktop Button font family, size, line height and letter/word spacing to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-typography-gradient-golden.test.ts`.
 */
export function resolveP15ElementorButtonTypographyMetrics(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonTypographyMetricsResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorButtonTypographyMetricsResultV1;
}

/** Serialize only sanitized typography metrics metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonTypographyMetricsSummary(
  result: P15ElementorButtonTypographyMetricsResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
