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
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import { widgetTarget } from './mapping-engine/widget-binding';
import { P15_TEXT_LIMITS } from './typography';

/**
 * Responsive text typography metrics (recovery M4.3c): explicit tablet/mobile font size, line height and letter
 * spacing for Heading, Text Editor and Button widgets, whose generated `typography` group the base writes with the
 * `custom` starter. Values use the neutral IR's own limits (two decimals), never inferred.
 *
 * R0, Elementor 4.2.4: `includes/controls/groups/typography.php` (blob eea951b) declares `font_size`, `line_height`
 * and `letter_spacing` with `responsive => true`, so each has `_tablet` / `_mobile` keys under the group prefix;
 * the three widgets register the group with the `typography` name (heading.php, text-editor.php, button-trait.php).
 */
export const P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_MANIFEST_VERSION = 'p15-elementor-responsive-text-typography-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_RESULT_VERSION = 'p15-elementor-responsive-text-typography-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  typographyGroupSourcePath: 'includes/controls/groups/typography.php',
  typographyGroupSourceBlobSha: 'eea951b6331bd84c80e24b7fb6ab249e5c4c41a1',
  starterSettingKey: 'typography_typography',
  starterValue: 'custom',
  settingKeys: {
    tabletFontSizePx: 'typography_font_size_tablet',
    mobileFontSizePx: 'typography_font_size_mobile',
    tabletLineHeightPx: 'typography_line_height_tablet',
    mobileLineHeightPx: 'typography_line_height_mobile',
    tabletLetterSpacingPx: 'typography_letter_spacing_tablet',
    mobileLetterSpacingPx: 'typography_letter_spacing_mobile',
  },
});

export interface P15ElementorResponsiveTextTypographyEntryV1 {
  sourceNodeId: string;
  tabletFontSizePx?: number;
  mobileFontSizePx?: number;
  tabletLineHeightPx?: number;
  mobileLineHeightPx?: number;
  tabletLetterSpacingPx?: number;
  mobileLetterSpacingPx?: number;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_RESULT_VERSION;
  status: P15ElementorResponsiveTextTypographyStatus;
  entriesField: 'widgets';
  entry: P15ElementorResponsiveTextTypographyEntryV1;
  summaryField: 'resolvedTypography';
  summary: Record<keyof P15ElementorResponsiveTextTypographyEntryV1, unknown>;
  issueCode: P15ElementorResponsiveTextTypographyIssueCode;
  noun: 'Widget';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveTextTypographyManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveTextTypographyIssueCode = FamilyIssueCode<'P15_RESPONSIVE_TEXT_TYPOGRAPHY', 'SOURCE_NOT_TEXT_WIDGET'>;
export type P15ElementorResponsiveTextTypographyIssueV1 = FamilyIssueV1<P15ElementorResponsiveTextTypographyIssueCode>;
export type P15ElementorResponsiveTextTypographyStatus = FamilyStatus<'NO_RESPONSIVE_TEXT_TYPOGRAPHY_OVERRIDES', 'RESPONSIVE_TEXT_TYPOGRAPHY_RESOLVED'>;
export type P15ElementorResponsiveTextTypographyResultV1 = FamilyResultV1<Contract>;

/** A px value in `[min, max]` with at most two decimals (the neutral typography precision). */
function twoDecimalPxCodec([min, max]: readonly [number, number]): ValueCodec<number, ReturnType<typeof elementorPxSlider>> {
  return {
    id: `px2:${min}..${max}`,
    is: (value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
      && Math.abs(Math.round(value * 100) - value * 100) < 1e-9,
    snapshot: (value) => value,
    encode: (value) => elementorPxSlider(value),
  };
}

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_EVIDENCE;
const fontSize = twoDecimalPxCodec(P15_TEXT_LIMITS.fontSizePx);
const lineHeight = twoDecimalPxCodec(P15_TEXT_LIMITS.lineHeightPx);
const letterSpacing = twoDecimalPxCodec(P15_TEXT_LIMITS.letterSpacingPx);
const conflictMessage = (settingKey: string): string => `Generated base candidate already contains responsive typography setting ${settingKey}.`;
const field = (name: keyof typeof EVIDENCE.settingKeys, codec: ValueCodec<number, ReturnType<typeof elementorPxSlider>>) => ({
  field: name, settingKey: EVIDENCE.settingKeys[name], codec, toElementor: (value: never) => elementorPxSlider(value as number),
  conflictSubject: EVIDENCE.settingKeys[name], conflictMessage: conflictMessage(EVIDENCE.settingKeys[name]),
});

const FAMILY = responsiveEnumFamily({
  id: 'responsive-text-typography',
  issuePrefix: 'P15_RESPONSIVE_TEXT_TYPOGRAPHY',
  subject: 'Responsive text typography',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_TEXT_TYPOGRAPHY_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_TEXT_TYPOGRAPHY_OVERRIDES', resolved: 'RESPONSIVE_TEXT_TYPOGRAPHY_RESOLVED' },
  summaryField: 'resolvedTypography',
  target: widgetTarget({
    kinds: ['heading', 'text', 'button'],
    entriesField: 'widgets',
    sourceCountField: 'sourceTextWidgetCount',
    resolvedCountField: 'resolvedWidgetCount',
    notTargetSuffix: 'SOURCE_NOT_TEXT_WIDGET',
    notTargetMessage: (subject) => `${subject} sourceNodeId must identify an existing neutral Heading, Text or Button node.`,
    bindingMissingMessage: (sourceNodeId) => `Generated text-widget binding missing for sourceNodeId ${sourceNodeId}.`,
    reviewMessage: 'Review nodes cannot participate in responsive text typography binding.',
    matches: () => true,
    driftPathSuffix: '.settings',
    driftMessage: 'Generated widget drifted from the neutral source.',
  }),
  fields: [
    field('tabletFontSizePx', fontSize), field('mobileFontSizePx', fontSize),
    field('tabletLineHeightPx', lineHeight), field('mobileLineHeightPx', lineHeight),
    field('tabletLetterSpacingPx', letterSpacing), field('mobileLetterSpacingPx', letterSpacing),
  ],
  // The `custom` starter enables the group (already written by the base whenever it has desktop typography).
  leadingWrites: [{ settingKey: EVIDENCE.starterSettingKey, value: EVIDENCE.starterValue }],
  conflictMode: 'all',
  extraIssueSuffixes: ['SOURCE_NOT_TEXT_WIDGET'],
  entryEnvelopeMessage: 'Each responsive text typography entry may contain only sourceNodeId plus tablet/mobile font size, line height and letter spacing.',
  overrideRequiredMessage: 'Each responsive text typography entry must provide at least one tablet or mobile metric.',
  valueInvalidMessage: 'Responsive typography metrics must be px values within the neutral typography limits, with at most two decimals.',
});

const API = familyApi<P15ElementorResponsiveTextTypographyResultV1>(FAMILY);

/** Apply explicit tablet/mobile typography metrics to exact generated Heading, Text Editor and Button bindings. */
export function resolveP15ElementorResponsiveTextTypography(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveTextTypographyResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

export function serializeP15ElementorResponsiveTextTypographySummary(result: P15ElementorResponsiveTextTypographyResultV1): string {
  return API.serialize(result);
}
