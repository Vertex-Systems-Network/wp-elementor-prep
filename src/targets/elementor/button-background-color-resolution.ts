import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { lowerHexColorCodec } from './mapping-engine/codecs';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';
import type { ElementorTemplateV04 } from './template-v04';

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

export interface P15ElementorButtonBackgroundColorManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonBackgroundColorEntryV1[];
  colorInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonBackgroundColorIssueCode =
  | 'P15_BUTTON_BACKGROUND_COLOR_SOURCE_IR_INVALID'
  | 'P15_BUTTON_BACKGROUND_COLOR_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_BACKGROUND_COLOR_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_BACKGROUND_COLOR_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_BACKGROUND_COLOR_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_BACKGROUND_COLOR_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_BACKGROUND_COLOR_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_BACKGROUND_COLOR_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_BACKGROUND_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_BACKGROUND_COLOR_ENTRIES_INVALID'
  | 'P15_BUTTON_BACKGROUND_COLOR_ENTRY_INVALID'
  | 'P15_BUTTON_BACKGROUND_COLOR_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_BACKGROUND_COLOR_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_BACKGROUND_COLOR_VALUE_INVALID'
  | 'P15_BUTTON_BACKGROUND_COLOR_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_BACKGROUND_COLOR_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_BACKGROUND_COLOR_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_BACKGROUND_COLOR_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonBackgroundColorIssueV1 {
  code: P15ElementorButtonBackgroundColorIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonBackgroundColorStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_BACKGROUND_COLOR_OVERRIDES'
  | 'BUTTON_BACKGROUND_COLORS_RESOLVED';

export interface P15ElementorButtonBackgroundColorSummaryEntryV1 {
  sourceNodeId: string;
  color: P15ElementorButtonBackgroundColorValue;
}

export interface P15ElementorButtonBackgroundColorResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_RESULT_VERSION;
  status: P15ElementorButtonBackgroundColorStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedBackgrounds: P15ElementorButtonBackgroundColorSummaryEntryV1[];
  issues: P15ElementorButtonBackgroundColorIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  colorInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

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

/**
 * Apply only explicit lowercase six-digit hex normal text colors to exact generated Button bindings.
 *
 * This contract does not infer colors, parse CSS, resolve global/theme tokens, mutate hover/link color,
 * add alpha channels, change Button text/alignment/link, or claim compatibility/production authority.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonBackgroundColors(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonBackgroundColorResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorButtonBackgroundColorResultV1;
}

/** Serialize only sanitized color metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonBackgroundColorSummary(
  result: P15ElementorButtonBackgroundColorResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
