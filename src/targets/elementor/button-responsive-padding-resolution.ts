import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { dimensionsBoxCodec } from './mapping-engine/codecs';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';
import { P15_NEUTRAL_EXPORT_MAX_SPACING_PX, type P15NeutralPaddingPx } from './neutral-export-ir';

export const P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_MANIFEST_VERSION =
  'p15-elementor-button-responsive-padding-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_RESULT_VERSION =
  'p15-elementor-button-responsive-padding-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  dimensionsControlSourcePath: 'includes/controls/dimensions.php',
  dimensionsControlSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  controlName: 'text_padding',
  responsive: true,
  desktopSettingKey: 'text_padding',
  tabletSettingKey: 'text_padding_tablet',
  mobileSettingKey: 'text_padding_mobile',
  unit: 'px',
  minPx: 0,
  maxPx: P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
});

export interface P15ElementorButtonResponsivePaddingEntryV1 {
  sourceNodeId: string;
  desktopPaddingPx?: P15NeutralPaddingPx;
  tabletPaddingPx?: P15NeutralPaddingPx;
  mobilePaddingPx?: P15NeutralPaddingPx;
}

export interface P15ElementorButtonResponsivePaddingSummaryEntryV1 {
  sourceNodeId: string;
  desktopPaddingPx: P15NeutralPaddingPx | null;
  tabletPaddingPx: P15NeutralPaddingPx | null;
  mobilePaddingPx: P15NeutralPaddingPx | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_RESULT_VERSION;
  status: P15ElementorButtonResponsivePaddingStatus;
  entriesField: 'buttons';
  entry: P15ElementorButtonResponsivePaddingEntryV1;
  summaryField: 'resolvedPaddings';
  summary: P15ElementorButtonResponsivePaddingSummaryEntryV1;
  issueCode: P15ElementorButtonResponsivePaddingIssueCode;
  noun: 'Button';
  flags: FamilyAuthorityFlag<'styleInferencePerformed'>;
};
export type P15ElementorButtonResponsivePaddingManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorButtonResponsivePaddingIssueCode =
  FamilyIssueCode<'P15_BUTTON_RESPONSIVE_PADDING', 'SOURCE_NOT_BUTTON'>;
export type P15ElementorButtonResponsivePaddingIssueV1 = FamilyIssueV1<P15ElementorButtonResponsivePaddingIssueCode>;
export type P15ElementorButtonResponsivePaddingStatus = FamilyStatus<'NO_BUTTON_RESPONSIVE_PADDING_OVERRIDES', 'BUTTON_RESPONSIVE_PADDING_RESOLVED'>;
export type P15ElementorButtonResponsivePaddingResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_EVIDENCE;
const paddingCodec = dimensionsBoxCodec({ min: 0, max: P15_NEUTRAL_EXPORT_MAX_SPACING_PX });
const field = (name: string, settingKey: string) => ({
  field: name,
  settingKey,
  codec: paddingCodec,
  toElementor: paddingCodec.encode,
  conflictSubject: settingKey,
  conflictMessage: `Generated base candidate already contains ${settingKey}.`,
});
const FAMILY = responsiveEnumFamily({
  id: 'button-responsive-padding',
  issuePrefix: 'P15_BUTTON_RESPONSIVE_PADDING',
  subject: 'Button responsive padding',
  manifestVersion: P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_RESPONSIVE_PADDING_OVERRIDES', resolved: 'BUTTON_RESPONSIVE_PADDING_RESOLVED' },
  summaryField: 'resolvedPaddings',
  target: buttonWidgetTarget('Review nodes cannot participate in Button responsive padding binding.'),
  fields: [
    field('desktopPaddingPx', EVIDENCE.desktopSettingKey),
    field('tabletPaddingPx', EVIDENCE.tabletSettingKey),
    field('mobilePaddingPx', EVIDENCE.mobileSettingKey),
  ],
  // Every conflicting device key is reported, not only the first.
  conflictMode: 'all',
  leadingAuthorityFlags: ['styleInferencePerformed'],
  entryEnvelopeMessage: 'Each entry may contain only sourceNodeId and explicit desktop/tablet/mobile padding objects.',
  overrideRequiredMessage: 'Each entry must explicitly provide desktop, tablet and/or mobile padding.',
  valueInvalidMessage: `Padding must contain exact top/right/bottom/left px values between 0 and ${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}.`,
  messages: {
    notContainer: 'sourceNodeId must identify an existing neutral Button node.',
    upstream: 'Button responsive padding requires an existing review-free generated local candidate.',
    authority: 'Button responsive padding cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
    entriesInvalid: 'buttons must be a bounded array.',
  },
});

const API = familyApi<P15ElementorButtonResponsivePaddingResultV1>(FAMILY);

/**
 * Apply only explicit desktop/tablet/mobile Button text padding to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-style-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonResponsivePadding(sourceValue: unknown, manifestValue: unknown): P15ElementorButtonResponsivePaddingResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized padding metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonResponsivePaddingSummary(result: P15ElementorButtonResponsivePaddingResultV1): string {
  return API.serialize(result);
}
