import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { enumCodec, pxNumberCodec } from './mapping-engine/codecs';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import { boxShadowValueCodec, elementorBoxShadowPosition, type BoxShadowValue } from './mapping-engine/families/button-style';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MANIFEST_VERSION =
  'p15-elementor-button-hover-interaction-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_RESULT_VERSION =
  'p15-elementor-button-hover-interaction-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_CORE_ANIMATIONS = [
  'grow',
  'shrink',
  'pulse',
  'pulse-grow',
  'pulse-shrink',
  'push',
  'pop',
  'bounce-in',
  'bounce-out',
  'rotate',
  'grow-rotate',
  'float',
  'sink',
  'bob',
  'hang',
  'skew',
  'skew-forward',
  'skew-backward',
  'wobble-vertical',
  'wobble-horizontal',
  'wobble-to-bottom-right',
  'wobble-to-top-right',
  'wobble-top',
  'wobble-bottom',
  'wobble-skew',
  'buzz',
  'buzz-out',
] as const;

export const P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  groupBaseSourcePath: 'includes/controls/groups/base.php',
  groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234',
  boxShadowGroupSourcePath: 'includes/controls/groups/box-shadow.php',
  boxShadowGroupSourceBlobSha: '1c068c900db0ff2593089028d67fb6d897dbaa33',
  boxShadowControlSourcePath: 'includes/controls/box-shadow.php',
  boxShadowControlSourceBlobSha: 'e55cf9af34db5cc3e73dc295cd9f35b437da6fa7',
  hoverAnimationControlSourcePath: 'includes/controls/hover-animation.php',
  hoverAnimationControlSourceBlobSha: '157399fddae46264f07654bc178373a2c1050c4e',
  hoverTabName: 'tab_button_hover',
  buttonSelector: '{{WRAPPER}} .elementor-button:hover, {{WRAPPER}} .elementor-button:focus',
  boxShadowGroupName: 'button_hover_box_shadow',
  boxShadowTypeSettingKey: 'button_hover_box_shadow_box_shadow_type',
  boxShadowSettingKey: 'button_hover_box_shadow_box_shadow',
  boxShadowPositionSettingKey: 'button_hover_box_shadow_box_shadow_position',
  boxShadowEnabledValue: 'yes',
  transitionControlName: 'button_hover_transition_duration',
  transitionSettingKey: 'button_hover_transition_duration',
  transitionUnit: 's',
  transitionSecondsMin: 0,
  transitionSecondsMax: 10,
  animationControlName: 'hover_animation',
  animationSettingKey: 'hover_animation',
  animationClassPrefix: 'elementor-animation-',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
  coreAnimations: P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_CORE_ANIMATIONS,
});

export type P15ElementorButtonHoverCoreAnimation =
  typeof P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_CORE_ANIMATIONS[number];

export interface P15ElementorButtonHoverBoxShadowV1 {
  horizontal: number;
  vertical: number;
  blur: number;
  spread: number;
  color: string;
  position: 'outline' | 'inset';
}

export interface P15ElementorButtonHoverInteractionEntryV1 {
  sourceNodeId: string;
  boxShadow?: P15ElementorButtonHoverBoxShadowV1;
  transitionSeconds?: number;
  animation?: P15ElementorButtonHoverCoreAnimation;
}

export interface P15ElementorButtonHoverInteractionManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonHoverInteractionEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonHoverInteractionIssueCode =
  | 'P15_BUTTON_HOVER_INTERACTION_SOURCE_IR_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_HOVER_INTERACTION_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_HOVER_INTERACTION_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_HOVER_INTERACTION_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_HOVER_INTERACTION_ENTRIES_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_ENTRY_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_HOVER_INTERACTION_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_HOVER_INTERACTION_BOX_SHADOW_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_TRANSITION_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_ANIMATION_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_HOVER_INTERACTION_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_HOVER_INTERACTION_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonHoverInteractionIssueV1 {
  code: P15ElementorButtonHoverInteractionIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonHoverInteractionStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_HOVER_INTERACTION_OVERRIDES'
  | 'BUTTON_HOVER_INTERACTIONS_RESOLVED';

export interface P15ElementorButtonHoverInteractionResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_RESULT_VERSION;
  status: P15ElementorButtonHoverInteractionStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedInteractions: P15ElementorButtonHoverInteractionEntryV1[];
  issues: P15ElementorButtonHoverInteractionIssueV1[];
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

const EVIDENCE = P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE;
const boxShadowCodec = boxShadowValueCodec();
const transitionCodec = pxNumberCodec({ min: EVIDENCE.transitionSecondsMin, max: EVIDENCE.transitionSecondsMax });
const conflict = (settingKey: string) => ({
  conflictSubject: settingKey,
  conflictMessage: `Generated base candidate already contains requested Button hover setting ${settingKey}.`,
});
const FAMILY = containerStyleFamily({
  id: 'button-hover-interaction',
  issuePrefix: 'P15_BUTTON_HOVER_INTERACTION',
  subject: 'Button hover interaction',
  manifestVersion: P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_HOVER_INTERACTION_OVERRIDES', resolved: 'BUTTON_HOVER_INTERACTIONS_RESOLVED' },
  summaryField: 'resolvedInteractions',
  target: buttonWidgetTarget('Review nodes cannot participate in Button hover interaction binding.'),
  fields: [
    { field: 'boxShadow', codec: boxShadowCodec, optional: true },
    { field: 'transitionSeconds', codec: transitionCodec, optional: true },
    { field: 'animation', codec: enumCodec(P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_CORE_ANIMATIONS), optional: true },
  ],
  requireAny: { code: 'ENTRY_INVALID', message: 'Each Button entry must request at least one bounded hover interaction capability.' },
  checks: [
    { fields: ['boxShadow'], code: 'BOX_SHADOW_INVALID', pathSuffix: '.boxShadow', message: 'Box shadow must use bounded integer sliders, lowercase six-digit hex color and outline|inset position.' },
    { fields: ['transitionSeconds'], code: 'TRANSITION_INVALID', pathSuffix: '.transitionSeconds', message: 'transitionSeconds must be a finite explicit number from 0 through 10 seconds.' },
    { fields: ['animation'], code: 'ANIMATION_INVALID', pathSuffix: '.animation', message: 'animation must be one of Elementor 4.2.4 core default hover animations.' },
  ],
  leadingAuthorityFlags: ['styleInferencePerformed'],
  extraIssueSuffixes: ['BOX_SHADOW_INVALID', 'TRANSITION_INVALID', 'ANIMATION_INVALID'],
  entryEnvelopeMessage: 'Each entry may contain only sourceNodeId, boxShadow, transitionSeconds and animation.',
  messages: {
    notContainer: 'sourceNodeId must identify an existing neutral Button node.',
    authority: 'Button hover interaction resolution cannot grant inference, mutation, network, closure, compatibility, production or download authority.',
  },
  writes: (entry) => [
    ...(entry.boxShadow === undefined ? [] : [
      { settingKey: EVIDENCE.boxShadowTypeSettingKey, value: EVIDENCE.boxShadowEnabledValue, ...conflict(EVIDENCE.boxShadowTypeSettingKey) },
      { settingKey: EVIDENCE.boxShadowSettingKey, value: boxShadowCodec.encode(entry.boxShadow as BoxShadowValue), ...conflict(EVIDENCE.boxShadowSettingKey) },
      { settingKey: EVIDENCE.boxShadowPositionSettingKey, value: elementorBoxShadowPosition(entry.boxShadow as BoxShadowValue), ...conflict(EVIDENCE.boxShadowPositionSettingKey) },
    ]),
    ...(entry.transitionSeconds === undefined ? [] : [{
      settingKey: EVIDENCE.transitionSettingKey,
      value: { unit: EVIDENCE.transitionUnit, size: entry.transitionSeconds, sizes: [] },
      ...conflict(EVIDENCE.transitionSettingKey),
    }]),
    ...(entry.animation === undefined ? [] : [{ settingKey: EVIDENCE.animationSettingKey, value: entry.animation, ...conflict(EVIDENCE.animationSettingKey) }]),
  ],
});

/**
 * Apply only an explicit bounded hover box shadow, transition duration and core hover animation to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-style-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonHoverInteractions(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonHoverInteractionResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorButtonHoverInteractionResultV1;
}

/** Serialize only sanitized hover interaction metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonHoverInteractionSummary(
  result: P15ElementorButtonHoverInteractionResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
