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

export const P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_MANIFEST_VERSION =
  'p15-elementor-button-hover-border-color-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_RESULT_VERSION =
  'p15-elementor-button-hover-border-color-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  hoverTabName: 'tab_button_hover',
  controlName: 'button_hover_border_color',
  settingKey: 'button_hover_border_color',
  hoverTextColorControlName: 'hover_color',
  hoverBackgroundGroupName: 'button_background_hover',
  hoverBoxShadowGroupName: 'button_hover_box_shadow',
  transitionControlName: 'button_hover_transition_duration',
  hoverAnimationControlName: 'hover_animation',
  normalBorderGroupName: 'border',
  buttonSelector: '{{WRAPPER}} .elementor-button:hover, {{WRAPPER}} .elementor-button:focus',
  cssProperty: 'border-color',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
});

export type P15ElementorButtonHoverBorderColorValue = string;

export interface P15ElementorButtonHoverBorderColorEntryV1 {
  sourceNodeId: string;
  color: P15ElementorButtonHoverBorderColorValue;
}

export interface P15ElementorButtonHoverBorderColorSummaryEntryV1 {
  sourceNodeId: string;
  color: P15ElementorButtonHoverBorderColorValue;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_RESULT_VERSION;
  status: P15ElementorButtonHoverBorderColorStatus;
  entriesField: 'buttons';
  entry: P15ElementorButtonHoverBorderColorEntryV1;
  summaryField: 'resolvedHoverBorderColors';
  summary: P15ElementorButtonHoverBorderColorSummaryEntryV1;
  issueCode: P15ElementorButtonHoverBorderColorIssueCode;
  noun: 'Button';
  flags: FamilyAuthorityFlag<'colorInferencePerformed'>;
};
export type P15ElementorButtonHoverBorderColorManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorButtonHoverBorderColorIssueCode =
  FamilyIssueCode<'P15_BUTTON_HOVER_BORDER_COLOR', 'SOURCE_NOT_BUTTON'>;
export type P15ElementorButtonHoverBorderColorIssueV1 = FamilyIssueV1<P15ElementorButtonHoverBorderColorIssueCode>;
export type P15ElementorButtonHoverBorderColorStatus = FamilyStatus<'NO_BUTTON_HOVER_BORDER_COLOR_OVERRIDES', 'BUTTON_HOVER_BORDER_COLORS_RESOLVED'>;
export type P15ElementorButtonHoverBorderColorResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_EVIDENCE;
const CONFLICT = {
  conflictSubject: 'Button hover border color',
  conflictMessage: 'Generated base candidate already contains a Button button_text_color setting.',
};
const FAMILY = containerStyleFamily({
  id: 'button-hover-border-color',
  issuePrefix: 'P15_BUTTON_HOVER_BORDER_COLOR',
  subject: 'Button hover border color',
  manifestVersion: P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_HOVER_BORDER_COLOR_OVERRIDES', resolved: 'BUTTON_HOVER_BORDER_COLORS_RESOLVED' },
  summaryField: 'resolvedHoverBorderColors',
  target: buttonWidgetTarget('Review nodes cannot participate in Button color binding.'),
  fields: [{ field: 'color', codec: lowerHexColorCodec }],
  checks: [{
    fields: ['color'],
    code: 'VALUE_INVALID',
    pathSuffix: '.color',
    message: 'Button hover border color must be a lowercase six-digit hex value such as #1a2b3c.',
  }],
  leadingAuthorityFlags: ['colorInferencePerformed'],
  entryEnvelopeMessage: 'Each Button hover border color entry may contain only sourceNodeId and color.',
  messages: {
    authority: 'Button hover border color resolution cannot grant color/responsive inference, mutation, network, closure, compatibility, production or download authority.',
  },
  writes: (entry) => [
    { settingKey: EVIDENCE.settingKey, value: entry.color, ...CONFLICT },
  ],
});

const API = familyApi<P15ElementorButtonHoverBorderColorResultV1>(FAMILY);

/**
 * Apply only explicit lowercase six-digit hex hover/focus border colors to exact generated Button bindings.
 *
 * This contract writes only button_hover_border_color. It does not infer colors, parse CSS, resolve global/theme
 * tokens, mutate hover text/background/shadow/transition/animation or normal border styling, add alpha channels,
 * change Button text/alignment/link, or claim compatibility/production authority.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonHoverBorderColors(sourceValue: unknown, manifestValue: unknown): P15ElementorButtonHoverBorderColorResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized color metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonHoverBorderColorSummary(result: P15ElementorButtonHoverBorderColorResultV1): string {
  return API.serialize(result);
}
