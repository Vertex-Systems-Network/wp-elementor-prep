import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { gradientProfileCodec, gradientWrites, type GradientProfile } from './mapping-engine/families/button-gradient';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MANIFEST_VERSION =
  'p15-elementor-button-radial-gradient-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_RESULT_VERSION =
  'p15-elementor-button-radial-gradient-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_POSITIONS = Object.freeze([
  'center center',
  'center left',
  'center right',
  'top center',
  'top left',
  'top right',
  'bottom center',
  'bottom left',
  'bottom right',
] as const);

export type P15ElementorButtonRadialGradientPosition =
  (typeof P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_POSITIONS)[number];

export const P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  backgroundGroupControlSourcePath: 'includes/controls/groups/background.php',
  backgroundGroupControlSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1',
  normalGroupName: 'background',
  hoverGroupName: 'button_background_hover',
  backgroundTypeSuffix: 'background',
  colorASuffix: 'color',
  colorAStopSuffix: 'color_stop',
  colorAStopTabletSuffix: 'color_stop_tablet',
  colorAStopMobileSuffix: 'color_stop_mobile',
  colorBSuffix: 'color_b',
  colorBStopSuffix: 'color_b_stop',
  colorBStopTabletSuffix: 'color_b_stop_tablet',
  colorBStopMobileSuffix: 'color_b_stop_mobile',
  gradientTypeSuffix: 'gradient_type',
  gradientPositionSuffix: 'gradient_position',
  gradientPositionTabletSuffix: 'gradient_position_tablet',
  gradientPositionMobileSuffix: 'gradient_position_mobile',
  acceptedBackgroundType: 'gradient',
  acceptedGradientType: 'radial',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
  stopUnit: '%',
  stopMin: 0,
  stopMax: 100,
  acceptedPositions: P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_POSITIONS,
});

export interface P15ElementorButtonRadialGradientV1 {
  colorA: string;
  colorB: string;
  stopA: number;
  stopB: number;
  tabletStopA?: number;
  tabletStopB?: number;
  mobileStopA?: number;
  mobileStopB?: number;
  position: P15ElementorButtonRadialGradientPosition;
  tabletPosition?: P15ElementorButtonRadialGradientPosition;
  mobilePosition?: P15ElementorButtonRadialGradientPosition;
}

export interface P15ElementorButtonRadialGradientEntryV1 {
  sourceNodeId: string;
  normal?: P15ElementorButtonRadialGradientV1;
  hover?: P15ElementorButtonRadialGradientV1;
}

export interface P15ElementorButtonRadialGradientManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonRadialGradientEntryV1[];
  gradientInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonRadialGradientIssueCode =
  | 'P15_BUTTON_RADIAL_GRADIENT_SOURCE_IR_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_RADIAL_GRADIENT_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_RADIAL_GRADIENT_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_RADIAL_GRADIENT_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_RADIAL_GRADIENT_ENTRIES_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_ENTRY_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_RADIAL_GRADIENT_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_RADIAL_GRADIENT_VALUE_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_RADIAL_GRADIENT_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_RADIAL_GRADIENT_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonRadialGradientIssueV1 {
  code: P15ElementorButtonRadialGradientIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonRadialGradientStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_RADIAL_GRADIENT_OVERRIDES'
  | 'BUTTON_RADIAL_GRADIENTS_RESOLVED';

export interface P15ElementorButtonRadialGradientSummaryEntryV1 {
  sourceNodeId: string;
  normal?: P15ElementorButtonRadialGradientV1;
  hover?: P15ElementorButtonRadialGradientV1;
}

export interface P15ElementorButtonRadialGradientResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_RESULT_VERSION;
  status: P15ElementorButtonRadialGradientStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedGradients: P15ElementorButtonRadialGradientSummaryEntryV1[];
  issues: P15ElementorButtonRadialGradientIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  gradientInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const EVIDENCE = P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_EVIDENCE;
const gradientCodec = gradientProfileCodec('radial', P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_POSITIONS);
const FAMILY = containerStyleFamily({
  id: 'button-radial-gradient',
  issuePrefix: 'P15_BUTTON_RADIAL_GRADIENT',
  subject: 'Button radial-gradient',
  manifestVersion: P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_RADIAL_GRADIENT_OVERRIDES', resolved: 'BUTTON_RADIAL_GRADIENTS_RESOLVED' },
  summaryField: 'resolvedGradients',
  target: buttonWidgetTarget('Review nodes cannot participate in Button gradient binding.'),
  fields: [
    { field: 'normal', codec: gradientCodec, optional: true },
    { field: 'hover', codec: gradientCodec, optional: true },
  ],
  requireAny: { code: 'ENTRY_INVALID', message: 'Each Button entry must request normal, hover, or both gradient states.' },
  checks: [{ fields: ['normal', 'hover'], code: 'VALUE_INVALID', pathSuffix: '', message: 'Gradient colors must be lowercase #rrggbb, stops integer 0..100 in order, desktop position must be one exact Elementor radial value, and optional tablet/mobile positions must use the same exact enum.' }],
  leadingAuthorityFlags: ['gradientInferencePerformed'],
  entryEnvelopeMessage: 'Each entry may contain only sourceNodeId plus optional normal and hover radial-gradient profiles.',
  messages: {
    authority: 'Button radial-gradient resolution cannot grant inference, mutation, network, closure, compatibility, production or download authority.',
  },
  // Normal (background_*) conflicts rank before hover (button_background_hover_*) conflicts.
  writes: (entry) => [
    ...(entry.normal === undefined ? [] : gradientWrites('radial', EVIDENCE.normalGroupName, entry.normal as GradientProfile, 0)),
    ...(entry.hover === undefined ? [] : gradientWrites('radial', EVIDENCE.hoverGroupName, entry.hover as GradientProfile, 100)),
  ],
});

/**
 * Apply only explicit two-colour normal/hover radial gradients to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-typography-gradient-golden.test.ts`.
 */
export function resolveP15ElementorButtonRadialGradients(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonRadialGradientResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorButtonRadialGradientResultV1;
}

/** Serialize only sanitized gradient metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonRadialGradientSummary(
  result: P15ElementorButtonRadialGradientResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
