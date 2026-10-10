import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { gradientProfileCodec, gradientWrites, type GradientProfile } from './mapping-engine/families/button-gradient';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';

export const P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_MANIFEST_VERSION =
  'p15-elementor-button-linear-gradient-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_RESULT_VERSION =
  'p15-elementor-button-linear-gradient-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_EVIDENCE = Object.freeze({
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
  gradientAngleSuffix: 'gradient_angle',
  gradientAngleTabletSuffix: 'gradient_angle_tablet',
  gradientAngleMobileSuffix: 'gradient_angle_mobile',
  acceptedBackgroundType: 'gradient',
  acceptedGradientType: 'linear',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
  stopUnit: '%',
  stopMin: 0,
  stopMax: 100,
  angleUnit: 'deg',
  angleMin: 0,
  angleMax: 360,
});

export interface P15ElementorButtonLinearGradientV1 {
  colorA: string;
  colorB: string;
  stopA: number;
  stopB: number;
  tabletStopA?: number;
  tabletStopB?: number;
  mobileStopA?: number;
  mobileStopB?: number;
  angleDeg?: number;
  tabletAngleDeg?: number;
  mobileAngleDeg?: number;
}

export interface P15ElementorButtonLinearGradientEntryV1 {
  sourceNodeId: string;
  normal?: P15ElementorButtonLinearGradientV1;
  hover?: P15ElementorButtonLinearGradientV1;
}

export interface P15ElementorButtonLinearGradientSummaryEntryV1 {
  sourceNodeId: string;
  normal?: P15ElementorButtonLinearGradientV1;
  hover?: P15ElementorButtonLinearGradientV1;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_RESULT_VERSION;
  status: P15ElementorButtonLinearGradientStatus;
  entriesField: 'buttons';
  entry: P15ElementorButtonLinearGradientEntryV1;
  summaryField: 'resolvedGradients';
  summary: P15ElementorButtonLinearGradientSummaryEntryV1;
  issueCode: P15ElementorButtonLinearGradientIssueCode;
  noun: 'Button';
  flags: FamilyAuthorityFlag<'gradientInferencePerformed'>;
};
export type P15ElementorButtonLinearGradientManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorButtonLinearGradientIssueCode =
  FamilyIssueCode<'P15_BUTTON_LINEAR_GRADIENT', 'SOURCE_NOT_BUTTON'>;
export type P15ElementorButtonLinearGradientIssueV1 = FamilyIssueV1<P15ElementorButtonLinearGradientIssueCode>;
export type P15ElementorButtonLinearGradientStatus = FamilyStatus<'NO_BUTTON_LINEAR_GRADIENT_OVERRIDES', 'BUTTON_LINEAR_GRADIENTS_RESOLVED'>;
export type P15ElementorButtonLinearGradientResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_EVIDENCE;
const gradientCodec = gradientProfileCodec('linear');
const FAMILY = containerStyleFamily({
  id: 'button-linear-gradient',
  issuePrefix: 'P15_BUTTON_LINEAR_GRADIENT',
  subject: 'Button linear-gradient',
  manifestVersion: P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_LINEAR_GRADIENT_OVERRIDES', resolved: 'BUTTON_LINEAR_GRADIENTS_RESOLVED' },
  summaryField: 'resolvedGradients',
  target: buttonWidgetTarget('Review nodes cannot participate in Button gradient binding.'),
  fields: [
    { field: 'normal', codec: gradientCodec, optional: true },
    { field: 'hover', codec: gradientCodec, optional: true },
  ],
  requireAny: { code: 'ENTRY_INVALID', message: 'Each Button entry must request normal, hover, or both gradient states.' },
  checks: [{ fields: ['normal', 'hover'], code: 'VALUE_INVALID', pathSuffix: '', message: 'Gradient colors must be lowercase #rrggbb, stops integer 0..100 in order, and optional angle integer 0..360 degrees.' }],
  leadingAuthorityFlags: ['gradientInferencePerformed'],
  entryEnvelopeMessage: 'Each entry may contain only sourceNodeId plus optional normal and hover linear-gradient profiles.',
  messages: {
    authority: 'Button linear-gradient resolution cannot grant inference, mutation, network, closure, compatibility, production or download authority.',
  },
  // Normal (background_*) conflicts rank before hover (button_background_hover_*) conflicts.
  writes: (entry) => [
    ...(entry.normal === undefined ? [] : gradientWrites('linear', EVIDENCE.normalGroupName, entry.normal as GradientProfile, 0)),
    ...(entry.hover === undefined ? [] : gradientWrites('linear', EVIDENCE.hoverGroupName, entry.hover as GradientProfile, 100)),
  ],
});

const API = familyApi<P15ElementorButtonLinearGradientResultV1>(FAMILY);

/**
 * Apply only explicit two-colour normal/hover linear gradients to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-typography-gradient-golden.test.ts`.
 */
export function resolveP15ElementorButtonLinearGradients(sourceValue: unknown, manifestValue: unknown): P15ElementorButtonLinearGradientResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized gradient metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonLinearGradientSummary(result: P15ElementorButtonLinearGradientResultV1): string {
  return API.serialize(result);
}
