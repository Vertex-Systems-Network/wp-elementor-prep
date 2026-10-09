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

export const P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_MANIFEST_VERSION =
  'p15-elementor-button-text-color-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_RESULT_VERSION =
  'p15-elementor-button-text-color-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  backgroundGroupControlSourcePath: 'includes/controls/groups/background.php',
  backgroundGroupControlSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1',
  groupName: 'background',
  backgroundTypeSettingKey: 'background_background',
  backgroundColorSettingKey: 'background_color',
  hoverGroupName: 'button_background_hover',
  normalTextColorControlName: 'button_text_color',
  selector: '{{WRAPPER}} .elementor-button',
  acceptedBackgroundType: 'classic',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
});

export type P15ElementorButtonBackgroundColorValue = string;

export interface P15ElementorButtonBackgroundColorEntryV1 {
  sourceNodeId: string;
  color: P15ElementorButtonBackgroundColorValue;
}

export interface P15ElementorButtonBackgroundColorSummaryEntryV1 {
  sourceNodeId: string;
  color: P15ElementorButtonBackgroundColorValue;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_RESULT_VERSION;
  status: P15ElementorButtonBackgroundColorStatus;
  entriesField: 'buttons';
  entry: P15ElementorButtonBackgroundColorEntryV1;
  summaryField: 'resolvedBackgrounds';
  summary: P15ElementorButtonBackgroundColorSummaryEntryV1;
  issueCode: P15ElementorButtonBackgroundColorIssueCode;
  noun: 'Button';
  flags: FamilyAuthorityFlag<'colorInferencePerformed'>;
};
export type P15ElementorButtonBackgroundColorManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorButtonBackgroundColorIssueCode =
  FamilyIssueCode<'P15_BUTTON_BACKGROUND_COLOR', 'SOURCE_NOT_BUTTON'>;
export type P15ElementorButtonBackgroundColorIssueV1 = FamilyIssueV1<P15ElementorButtonBackgroundColorIssueCode>;
export type P15ElementorButtonBackgroundColorStatus = FamilyStatus<'NO_BUTTON_BACKGROUND_COLOR_OVERRIDES', 'BUTTON_BACKGROUND_COLORS_RESOLVED'>;
export type P15ElementorButtonBackgroundColorResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_EVIDENCE;
const CONFLICT = {
  conflictSubject: 'Button background color',
  conflictMessage: 'Generated base candidate already contains a normal Button background override.',
};
const FAMILY = containerStyleFamily({
  id: 'button-background-color',
  issuePrefix: 'P15_BUTTON_BACKGROUND_COLOR',
  subject: 'Button background color',
  manifestVersion: P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_BACKGROUND_COLOR_OVERRIDES', resolved: 'BUTTON_BACKGROUND_COLORS_RESOLVED' },
  summaryField: 'resolvedBackgrounds',
  // The original contract's serializer refusal names 'button-text-color'; it is kept exactly.
  serializerId: 'button-text-color',
  target: buttonWidgetTarget('Review nodes cannot participate in Button color binding.'),
  fields: [{ field: 'color', codec: lowerHexColorCodec }],
  checks: [{
    fields: ['color'],
    code: 'VALUE_INVALID',
    pathSuffix: '.color',
    message: 'Button background color must be a lowercase six-digit hex value such as #1a2b3c.',
  }],
  leadingAuthorityFlags: ['colorInferencePerformed'],
  entryEnvelopeMessage: 'Each Button background color entry may contain only sourceNodeId and color.',
  messages: {
    authority: 'Button background color resolution cannot grant color/responsive inference, mutation, network, closure, compatibility, production or download authority.',
  },
  writes: (entry) => [
    { settingKey: EVIDENCE.backgroundTypeSettingKey, value: EVIDENCE.acceptedBackgroundType, ...CONFLICT },
    { settingKey: EVIDENCE.backgroundColorSettingKey, value: entry.color, ...CONFLICT },
  ],
});

const API = familyApi<P15ElementorButtonBackgroundColorResultV1>(FAMILY);

/**
 * Apply only explicit lowercase six-digit hex normal text colors to exact generated Button bindings.
 *
 * This contract does not infer colors, parse CSS, resolve global/theme tokens, mutate hover/link color,
 * add alpha channels, change Button text/alignment/link, or claim compatibility/production authority.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonBackgroundColors(sourceValue: unknown, manifestValue: unknown): P15ElementorButtonBackgroundColorResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized color metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonBackgroundColorSummary(result: P15ElementorButtonBackgroundColorResultV1): string {
  return API.serialize(result);
}
