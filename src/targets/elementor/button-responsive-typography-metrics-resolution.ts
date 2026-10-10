import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { elementorPxSlider, type ValueCodec } from './mapping-engine/codecs';
import { safeIntegerCodec, steppedNumberCodec } from './mapping-engine/families/button-style';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';

export const P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_MANIFEST_VERSION =
  'p15-elementor-button-responsive-typography-metrics-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_RESULT_VERSION =
  'p15-elementor-button-responsive-typography-metrics-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_RESPONSIVE_FONT_SIZE_MIN_PX = 1 as const;
export const P15_ELEMENTOR_BUTTON_RESPONSIVE_FONT_SIZE_MAX_PX = 200 as const;
export const P15_ELEMENTOR_BUTTON_RESPONSIVE_LINE_HEIGHT_MIN_PX = 1 as const;
export const P15_ELEMENTOR_BUTTON_RESPONSIVE_LINE_HEIGHT_MAX_PX = 400 as const;
export const P15_ELEMENTOR_BUTTON_RESPONSIVE_LETTER_SPACING_MIN_PX = -5 as const;
export const P15_ELEMENTOR_BUTTON_RESPONSIVE_LETTER_SPACING_MAX_PX = 10 as const;
export const P15_ELEMENTOR_BUTTON_RESPONSIVE_LETTER_SPACING_STEP_PX = 0.1 as const;
export const P15_ELEMENTOR_BUTTON_RESPONSIVE_WORD_SPACING_MIN_PX = 0 as const;
export const P15_ELEMENTOR_BUTTON_RESPONSIVE_WORD_SPACING_MAX_PX = 50 as const;

export const P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  typographyGroupSourcePath: 'includes/controls/groups/typography.php',
  typographyGroupSourceBlobSha: 'eea951b6331bd84c80e24b7fb6ab249e5c4c41a1',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  groupName: 'typography',
  groupPrefixRule: '{{ControlName}}_',
  responsiveSuffixRule: '<id>_<device>',
  starterSettingKey: 'typography_typography',
  starterValue: 'custom',
  fontSizeFieldName: 'font_size',
  fontSizeResponsive: true,
  fontSizeTabletSettingKey: 'typography_font_size_tablet',
  fontSizeMobileSettingKey: 'typography_font_size_mobile',
  fontSizeUnit: 'px',
  fontSizeMinPx: P15_ELEMENTOR_BUTTON_RESPONSIVE_FONT_SIZE_MIN_PX,
  fontSizeMaxPx: P15_ELEMENTOR_BUTTON_RESPONSIVE_FONT_SIZE_MAX_PX,
  lineHeightFieldName: 'line_height',
  lineHeightResponsive: true,
  lineHeightTabletSettingKey: 'typography_line_height_tablet',
  lineHeightMobileSettingKey: 'typography_line_height_mobile',
  lineHeightUnit: 'px',
  lineHeightMinPx: P15_ELEMENTOR_BUTTON_RESPONSIVE_LINE_HEIGHT_MIN_PX,
  lineHeightMaxPx: P15_ELEMENTOR_BUTTON_RESPONSIVE_LINE_HEIGHT_MAX_PX,
  letterSpacingFieldName: 'letter_spacing',
  letterSpacingResponsive: true,
  letterSpacingTabletSettingKey: 'typography_letter_spacing_tablet',
  letterSpacingMobileSettingKey: 'typography_letter_spacing_mobile',
  letterSpacingUnit: 'px',
  letterSpacingMinPx: P15_ELEMENTOR_BUTTON_RESPONSIVE_LETTER_SPACING_MIN_PX,
  letterSpacingMaxPx: P15_ELEMENTOR_BUTTON_RESPONSIVE_LETTER_SPACING_MAX_PX,
  letterSpacingStepPx: P15_ELEMENTOR_BUTTON_RESPONSIVE_LETTER_SPACING_STEP_PX,
  wordSpacingFieldName: 'word_spacing',
  wordSpacingResponsive: true,
  wordSpacingTabletSettingKey: 'typography_word_spacing_tablet',
  wordSpacingMobileSettingKey: 'typography_word_spacing_mobile',
  wordSpacingUnit: 'px',
  wordSpacingMinPx: P15_ELEMENTOR_BUTTON_RESPONSIVE_WORD_SPACING_MIN_PX,
  wordSpacingMaxPx: P15_ELEMENTOR_BUTTON_RESPONSIVE_WORD_SPACING_MAX_PX,
  desktopWritesIncluded: false,
  customBreakpointsIncluded: false,
  globalFontResolutionIncluded: false,
  variableFontAxesIncluded: false,
});

export interface P15ElementorButtonResponsiveTypographyMetricsEntryV1 {
  sourceNodeId: string;
  tabletFontSizePx?: number;
  mobileFontSizePx?: number;
  tabletLineHeightPx?: number;
  mobileLineHeightPx?: number;
  tabletLetterSpacingPx?: number;
  mobileLetterSpacingPx?: number;
  tabletWordSpacingPx?: number;
  mobileWordSpacingPx?: number;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_RESULT_VERSION;
  status: P15ElementorButtonResponsiveTypographyMetricsStatus;
  entriesField: 'buttons';
  entry: P15ElementorButtonResponsiveTypographyMetricsEntryV1;
  summaryField: 'resolvedResponsiveTypographyMetrics';
  summary: P15ElementorButtonResponsiveTypographyMetricsEntryV1;
  issueCode: P15ElementorButtonResponsiveTypographyMetricsIssueCode;
  noun: 'Button';
  flags: FamilyAuthorityFlag<'styleInferencePerformed'>;
};
export type P15ElementorButtonResponsiveTypographyMetricsManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorButtonResponsiveTypographyMetricsIssueCode =
  FamilyIssueCode<'P15_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS', 'SOURCE_NOT_BUTTON' | 'FONT_SIZE_INVALID' | 'LINE_HEIGHT_INVALID' | 'LETTER_SPACING_INVALID' | 'WORD_SPACING_INVALID'>;
export type P15ElementorButtonResponsiveTypographyMetricsIssueV1 = FamilyIssueV1<P15ElementorButtonResponsiveTypographyMetricsIssueCode>;
export type P15ElementorButtonResponsiveTypographyMetricsStatus = FamilyStatus<'NO_BUTTON_TYPOGRAPHY_METRICS_OVERRIDES', 'BUTTON_TYPOGRAPHY_METRICS_RESOLVED'>;
export type P15ElementorButtonResponsiveTypographyMetricsResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_EVIDENCE;
const fontSizeCodec = safeIntegerCodec(P15_ELEMENTOR_BUTTON_RESPONSIVE_FONT_SIZE_MIN_PX, P15_ELEMENTOR_BUTTON_RESPONSIVE_FONT_SIZE_MAX_PX);
const lineHeightCodec = safeIntegerCodec(P15_ELEMENTOR_BUTTON_RESPONSIVE_LINE_HEIGHT_MIN_PX, P15_ELEMENTOR_BUTTON_RESPONSIVE_LINE_HEIGHT_MAX_PX);
const letterSpacingCodec = steppedNumberCodec(P15_ELEMENTOR_BUTTON_RESPONSIVE_LETTER_SPACING_MIN_PX, P15_ELEMENTOR_BUTTON_RESPONSIVE_LETTER_SPACING_MAX_PX, P15_ELEMENTOR_BUTTON_RESPONSIVE_LETTER_SPACING_STEP_PX);
const wordSpacingCodec = safeIntegerCodec(P15_ELEMENTOR_BUTTON_RESPONSIVE_WORD_SPACING_MIN_PX, P15_ELEMENTOR_BUTTON_RESPONSIVE_WORD_SPACING_MAX_PX);
/** Fields in contract order: validation, conflict reporting, writes and summary keys follow it. */
const FIELDS = [
  { field: 'tabletFontSizePx', settingKey: EVIDENCE.fontSizeTabletSettingKey, codec: fontSizeCodec },
  { field: 'mobileFontSizePx', settingKey: EVIDENCE.fontSizeMobileSettingKey, codec: fontSizeCodec },
  { field: 'tabletLineHeightPx', settingKey: EVIDENCE.lineHeightTabletSettingKey, codec: lineHeightCodec },
  { field: 'mobileLineHeightPx', settingKey: EVIDENCE.lineHeightMobileSettingKey, codec: lineHeightCodec },
  { field: 'tabletLetterSpacingPx', settingKey: EVIDENCE.letterSpacingTabletSettingKey, codec: letterSpacingCodec },
  { field: 'mobileLetterSpacingPx', settingKey: EVIDENCE.letterSpacingMobileSettingKey, codec: letterSpacingCodec },
  { field: 'tabletWordSpacingPx', settingKey: EVIDENCE.wordSpacingTabletSettingKey, codec: wordSpacingCodec },
  { field: 'mobileWordSpacingPx', settingKey: EVIDENCE.wordSpacingMobileSettingKey, codec: wordSpacingCodec },
] as const;
const FAMILY = containerStyleFamily({
  id: 'button-responsive-typography-metrics',
  issuePrefix: 'P15_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS',
  subject: 'Button responsive typography metrics',
  manifestVersion: P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_MAX_ENTRIES,
  evidence: EVIDENCE,
  // The original contract reuses the desktop metrics status names; they are kept exactly.
  statuses: { none: 'NO_BUTTON_TYPOGRAPHY_METRICS_OVERRIDES', resolved: 'BUTTON_TYPOGRAPHY_METRICS_RESOLVED' },
  summaryField: 'resolvedResponsiveTypographyMetrics',
  target: buttonWidgetTarget('Review nodes cannot participate in Button typography binding.'),
  fields: FIELDS.map((spec) => ({ field: spec.field, codec: spec.codec as ValueCodec<unknown>, optional: 'defined' as const })),
  requireAny: { code: 'OVERRIDE_REQUIRED', message: 'Each entry must explicitly provide at least one tablet/mobile typography metric.' },
  checks: [
    { fields: ['tabletFontSizePx', 'mobileFontSizePx'], code: 'FONT_SIZE_INVALID', pathSuffix: '', message: 'Responsive font size values must be explicit integer px values in 1..200.' },
    { fields: ['tabletLineHeightPx', 'mobileLineHeightPx'], code: 'LINE_HEIGHT_INVALID', pathSuffix: '', message: 'Responsive line height values must be explicit bounded integer px values in 1..400.' },
    { fields: ['tabletLetterSpacingPx', 'mobileLetterSpacingPx'], code: 'LETTER_SPACING_INVALID', pathSuffix: '', message: 'Responsive letter spacing values must be finite px values in -5..10 using 0.1 increments.' },
    { fields: ['tabletWordSpacingPx', 'mobileWordSpacingPx'], code: 'WORD_SPACING_INVALID', pathSuffix: '', message: 'Responsive word spacing values must be explicit bounded integer px values in 0..50.' },
  ],
  leadingAuthorityFlags: ['styleInferencePerformed'],
  extraIssueSuffixes: ['FONT_SIZE_INVALID', 'LINE_HEIGHT_INVALID', 'LETTER_SPACING_INVALID', 'WORD_SPACING_INVALID'],
  entryEnvelopeMessage: 'Each entry may contain only sourceNodeId plus explicit tablet/mobile font-size, line-height, letter-spacing and word-spacing px values.',
  messages: {
    notContainer: 'sourceNodeId must identify an existing neutral Button node.',
    authority: 'Button responsive typography metrics resolution cannot grant inference, mutation, network, closure, compatibility, production or download authority.',
    entriesInvalid: 'buttons must be a bounded array.',
    duplicate: 'Button typography sourceNodeId must be unique.',
  },
  // The typography starter is enabled without a conflict check; only the requested device keys are checked.
  writes: (entry) => [
    { settingKey: EVIDENCE.starterSettingKey, value: EVIDENCE.starterValue, conflictSubject: EVIDENCE.starterSettingKey, checkConflict: false },
    ...FIELDS
      .filter((spec) => entry[spec.field] !== undefined)
      .map((spec) => ({
        settingKey: spec.settingKey,
        value: elementorPxSlider(entry[spec.field] as number),
        conflictSubject: spec.settingKey,
        conflictMessage: `Generated base candidate already contains responsive Button typography setting ${spec.settingKey}.`,
      })),
  ],
});

const API = familyApi<P15ElementorButtonResponsiveTypographyMetricsResultV1>(FAMILY);

/**
 * Apply only explicit tablet/mobile Button font size, line height and letter/word spacing to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-typography-gradient-golden.test.ts`.
 */
export function resolveP15ElementorButtonResponsiveTypographyMetrics(sourceValue: unknown, manifestValue: unknown): P15ElementorButtonResponsiveTypographyMetricsResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized responsive typography metrics metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonResponsiveTypographyMetricsSummary(result: P15ElementorButtonResponsiveTypographyMetricsResultV1): string {
  return API.serialize(result);
}
