import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { dimensionsBoxCodec } from './mapping-engine/codecs';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';
import { P15_NEUTRAL_EXPORT_MAX_SPACING_PX, type P15NeutralPaddingPx } from './neutral-export-ir';
import type { ElementorTemplateV04 } from './template-v04';

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

export interface P15ElementorButtonResponsivePaddingManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonResponsivePaddingEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonResponsivePaddingIssueCode =
  | 'P15_BUTTON_RESPONSIVE_PADDING_SOURCE_IR_INVALID'
  | 'P15_BUTTON_RESPONSIVE_PADDING_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_RESPONSIVE_PADDING_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_RESPONSIVE_PADDING_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_RESPONSIVE_PADDING_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_RESPONSIVE_PADDING_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_RESPONSIVE_PADDING_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_RESPONSIVE_PADDING_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_RESPONSIVE_PADDING_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_RESPONSIVE_PADDING_ENTRIES_INVALID'
  | 'P15_BUTTON_RESPONSIVE_PADDING_ENTRY_INVALID'
  | 'P15_BUTTON_RESPONSIVE_PADDING_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_RESPONSIVE_PADDING_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_RESPONSIVE_PADDING_VALUE_INVALID'
  | 'P15_BUTTON_RESPONSIVE_PADDING_OVERRIDE_REQUIRED'
  | 'P15_BUTTON_RESPONSIVE_PADDING_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_RESPONSIVE_PADDING_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_RESPONSIVE_PADDING_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_RESPONSIVE_PADDING_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonResponsivePaddingIssueV1 {
  code: P15ElementorButtonResponsivePaddingIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonResponsivePaddingStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_RESPONSIVE_PADDING_OVERRIDES'
  | 'BUTTON_RESPONSIVE_PADDING_RESOLVED';

export interface P15ElementorButtonResponsivePaddingSummaryEntryV1 {
  sourceNodeId: string;
  desktopPaddingPx: P15NeutralPaddingPx | null;
  tabletPaddingPx: P15NeutralPaddingPx | null;
  mobilePaddingPx: P15NeutralPaddingPx | null;
}

export interface P15ElementorButtonResponsivePaddingResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_RESULT_VERSION;
  status: P15ElementorButtonResponsivePaddingStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedPaddings: P15ElementorButtonResponsivePaddingSummaryEntryV1[];
  issues: P15ElementorButtonResponsivePaddingIssueV1[];
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

/**
 * Apply only explicit desktop/tablet/mobile Button text padding to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-style-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonResponsivePadding(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonResponsivePaddingResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorButtonResponsivePaddingResultV1;
}

/** Serialize only sanitized padding metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonResponsivePaddingSummary(
  result: P15ElementorButtonResponsivePaddingResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
