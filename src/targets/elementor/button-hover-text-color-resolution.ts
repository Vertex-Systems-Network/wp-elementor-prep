import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { lowerHexColorCodec } from './mapping-engine/codecs';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';

export const P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_MANIFEST_VERSION =
  'p15-elementor-button-text-color-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_RESULT_VERSION =
  'p15-elementor-button-text-color-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  hoverTabName: 'tab_button_hover',
  controlName: 'hover_color',
  settingKey: 'hover_color',
  normalTextControlName: 'button_text_color',
  normalBackgroundGroupName: 'background',
  hoverBackgroundGroupName: 'button_background_hover',
  buttonSelector: '{{WRAPPER}} .elementor-button:hover, {{WRAPPER}} .elementor-button:focus',
  svgSelector: '{{WRAPPER}} .elementor-button:hover svg, {{WRAPPER}} .elementor-button:focus svg',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
});

export type P15ElementorButtonHoverTextColorValue = string;

export interface P15ElementorButtonHoverTextColorEntryV1 {
  sourceNodeId: string;
  color: P15ElementorButtonHoverTextColorValue;
}

export interface P15ElementorButtonHoverTextColorSummaryEntryV1 {
  sourceNodeId: string;
  color: P15ElementorButtonHoverTextColorValue;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_RESULT_VERSION;
  status: P15ElementorButtonHoverTextColorStatus;
  entriesField: 'buttons';
  entry: P15ElementorButtonHoverTextColorEntryV1;
  summaryField: 'resolvedHoverColors';
  summary: P15ElementorButtonHoverTextColorSummaryEntryV1;
  issueCode: P15ElementorButtonHoverTextColorIssueCode;
  noun: 'Button';
  flags: FamilyAuthorityFlag<'colorInferencePerformed'>;
};
export type P15ElementorButtonHoverTextColorManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorButtonHoverTextColorIssueCode =
  FamilyIssueCode<'P15_BUTTON_HOVER_TEXT_COLOR', 'SOURCE_NOT_BUTTON'>;
export type P15ElementorButtonHoverTextColorIssueV1 = FamilyIssueV1<P15ElementorButtonHoverTextColorIssueCode>;
export type P15ElementorButtonHoverTextColorStatus = FamilyStatus<'NO_BUTTON_HOVER_TEXT_COLOR_OVERRIDES', 'BUTTON_HOVER_TEXT_COLORS_RESOLVED'>;
export type P15ElementorButtonHoverTextColorResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_EVIDENCE;
const CONFLICT = {
  conflictSubject: 'Button hover text color',
  conflictMessage: 'Generated base candidate already contains a Button button_text_color setting.',
};
const FAMILY = containerStyleFamily({
  id: 'button-hover-text-color',
  issuePrefix: 'P15_BUTTON_HOVER_TEXT_COLOR',
  subject: 'Button hover text color',
  manifestVersion: P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_HOVER_TEXT_COLOR_OVERRIDES', resolved: 'BUTTON_HOVER_TEXT_COLORS_RESOLVED' },
  summaryField: 'resolvedHoverColors',
  // The original contract's serializer refusal names 'button-text-color'; it is kept exactly.
  serializerId: 'button-text-color',
  target: buttonWidgetTarget('Review nodes cannot participate in Button color binding.'),
  fields: [{ field: 'color', codec: lowerHexColorCodec }],
  checks: [{
    fields: ['color'],
    code: 'VALUE_INVALID',
    pathSuffix: '.color',
    message: 'Button hover text color must be a lowercase six-digit hex value such as #1a2b3c.',
  }],
  leadingAuthorityFlags: ['colorInferencePerformed'],
  entryEnvelopeMessage: 'Each Button hover text color entry may contain only sourceNodeId and color.',
  messages: {
    authority: 'Button hover text color resolution cannot grant color/responsive inference, mutation, network, closure, compatibility, production or download authority.',
  },
  writes: (entry) => [
    { settingKey: EVIDENCE.settingKey, value: entry.color, ...CONFLICT },
  ],
});

const API = familyApi<P15ElementorButtonHoverTextColorResultV1>(FAMILY);

/**
 * Apply only explicit lowercase six-digit hex hover/focus text colors to exact generated Button bindings.
 *
 * This contract writes only hover_color. It does not infer colors, parse CSS, resolve global/theme tokens,
 * mutate normal text/background or hover background styling, add alpha channels, change Button
 * text/alignment/link, or claim compatibility/production authority.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonHoverTextColors(sourceValue: unknown, manifestValue: unknown): P15ElementorButtonHoverTextColorResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized color metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonHoverTextColorSummary(result: P15ElementorButtonHoverTextColorResultV1): string {
  return API.serialize(result);
}
