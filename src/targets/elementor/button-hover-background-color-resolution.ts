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

export const P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION =
  'p15-elementor-button-hover-background-color-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_RESULT_VERSION =
  'p15-elementor-button-hover-background-color-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  backgroundGroupControlSourcePath: 'includes/controls/groups/background.php',
  backgroundGroupControlSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1',
  groupName: 'button_background_hover',
  backgroundTypeSettingKey: 'button_background_hover_background',
  backgroundColorSettingKey: 'button_background_hover_color',
  hoverTextColorControlName: 'hover_color',
  normalTextColorControlName: 'button_text_color',
  normalBackgroundGroupName: 'background',
  selector: '{{WRAPPER}} .elementor-button:hover, {{WRAPPER}} .elementor-button:focus',
  acceptedBackgroundType: 'classic',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
});

export type P15ElementorButtonHoverBackgroundColorValue = string;

export interface P15ElementorButtonHoverBackgroundColorEntryV1 {
  sourceNodeId: string;
  color: P15ElementorButtonHoverBackgroundColorValue;
}

export interface P15ElementorButtonHoverBackgroundColorSummaryEntryV1 {
  sourceNodeId: string;
  color: P15ElementorButtonHoverBackgroundColorValue;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_RESULT_VERSION;
  status: P15ElementorButtonHoverBackgroundColorStatus;
  entriesField: 'buttons';
  entry: P15ElementorButtonHoverBackgroundColorEntryV1;
  summaryField: 'resolvedHoverBackgrounds';
  summary: P15ElementorButtonHoverBackgroundColorSummaryEntryV1;
  issueCode: P15ElementorButtonHoverBackgroundColorIssueCode;
  noun: 'Button';
  flags: FamilyAuthorityFlag<'colorInferencePerformed'>;
};
export type P15ElementorButtonHoverBackgroundColorManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorButtonHoverBackgroundColorIssueCode =
  FamilyIssueCode<'P15_BUTTON_HOVER_BACKGROUND_COLOR', 'SOURCE_NOT_BUTTON'>;
export type P15ElementorButtonHoverBackgroundColorIssueV1 = FamilyIssueV1<P15ElementorButtonHoverBackgroundColorIssueCode>;
export type P15ElementorButtonHoverBackgroundColorStatus = FamilyStatus<'NO_BUTTON_HOVER_BACKGROUND_COLOR_OVERRIDES', 'BUTTON_HOVER_BACKGROUND_COLORS_RESOLVED'>;
export type P15ElementorButtonHoverBackgroundColorResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_EVIDENCE;
const CONFLICT = {
  conflictSubject: 'Button hover background color',
  conflictMessage: 'Generated base candidate already contains a Button hover background override.',
};
const FAMILY = containerStyleFamily({
  id: 'button-hover-background-color',
  issuePrefix: 'P15_BUTTON_HOVER_BACKGROUND_COLOR',
  subject: 'Button hover background color',
  manifestVersion: P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_HOVER_BACKGROUND_COLOR_OVERRIDES', resolved: 'BUTTON_HOVER_BACKGROUND_COLORS_RESOLVED' },
  summaryField: 'resolvedHoverBackgrounds',
  target: buttonWidgetTarget('Review nodes cannot participate in Button color binding.'),
  fields: [{ field: 'color', codec: lowerHexColorCodec }],
  checks: [{
    fields: ['color'],
    code: 'VALUE_INVALID',
    pathSuffix: '.color',
    message: 'Button hover background color must be a lowercase six-digit hex value such as #1a2b3c.',
  }],
  leadingAuthorityFlags: ['colorInferencePerformed'],
  entryEnvelopeMessage: 'Each Button hover background color entry may contain only sourceNodeId and color.',
  messages: {
    authority: 'Button hover background color resolution cannot grant color/responsive inference, mutation, network, closure, compatibility, production or download authority.',
  },
  writes: (entry) => [
    { settingKey: EVIDENCE.backgroundTypeSettingKey, value: EVIDENCE.acceptedBackgroundType, ...CONFLICT },
    { settingKey: EVIDENCE.backgroundColorSettingKey, value: entry.color, ...CONFLICT },
  ],
});

const API = familyApi<P15ElementorButtonHoverBackgroundColorResultV1>(FAMILY);

/**
 * Apply only explicit lowercase six-digit hex classic hover/focus background colors
 * to exact generated Button bindings.
 *
 * This contract writes only the hover background group type/color keys. It does not infer colors,
 * emit gradients/images/video, mutate hover text or normal text/background styling, resolve global
 * or theme tokens, add alpha channels, change Button text/alignment/link, or claim broader authority.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonHoverBackgroundColors(sourceValue: unknown, manifestValue: unknown): P15ElementorButtonHoverBackgroundColorResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized color metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonHoverBackgroundColorSummary(result: P15ElementorButtonHoverBackgroundColorResultV1): string {
  return API.serialize(result);
}
