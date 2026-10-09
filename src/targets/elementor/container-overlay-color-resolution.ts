import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { hundredthsOpacityCodec, lowerHexColorCodec } from './mapping-engine/codecs';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MANIFEST_VERSION =
  'p15-elementor-container-overlay-color-manifest-v1' as const;
export const P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_RESULT_VERSION =
  'p15-elementor-container-overlay-color-result-v1' as const;
export const P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  backgroundGroupSourcePath: 'includes/controls/groups/background.php',
  backgroundGroupSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1',
  groupName: 'background_overlay',
  typeSettingKey: 'background_overlay_background',
  colorSettingKey: 'background_overlay_color',
  selector: '{{WRAPPER}}::before, {{WRAPPER}} > .elementor-background-video-container::before, {{WRAPPER}} > .e-con-inner > .elementor-background-video-container::before, {{WRAPPER}} > .elementor-background-slideshow::before, {{WRAPPER}} > .e-con-inner > .elementor-background-slideshow::before, {{WRAPPER}} > .elementor-motion-effects-container > .elementor-motion-effects-layer::before',
  acceptedBackgroundType: 'classic',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
  opacityControlName: 'background_overlay_opacity',
  opacityDesktopSettingKey: 'background_overlay_opacity',
  opacityTabletSettingKey: 'background_overlay_opacity_tablet',
  opacityMobileSettingKey: 'background_overlay_opacity_mobile',
  sliderSourcePath: 'includes/controls/slider.php',
  sliderSourceBlobSha: 'f56798bd5e0a2bee5a7c3a7771ecbaf2af87fb7f',
  baseUnitsSourcePath: 'includes/controls/base-units.php',
  baseUnitsSourceBlobSha: '6ec6d40f5a7609114f0ceaa9b2f7250cc945823d',
  opacityMinHundredths: 0,
  opacityMaxHundredths: 100,
});

export type P15ElementorContainerOverlayColorValue = string;

export interface P15ElementorContainerOverlayColorEntryV1 {
  sourceNodeId: string;
  color: P15ElementorContainerOverlayColorValue;
  opacityHundredths?: number;
  tabletOpacityHundredths?: number;
  mobileOpacityHundredths?: number;
}

export interface P15ElementorContainerOverlayColorManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorContainerOverlayColorEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorContainerOverlayColorIssueCode =
  | 'P15_CONTAINER_OVERLAY_COLOR_SOURCE_IR_INVALID'
  | 'P15_CONTAINER_OVERLAY_COLOR_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_CONTAINER_OVERLAY_COLOR_MANIFEST_NOT_OBJECT'
  | 'P15_CONTAINER_OVERLAY_COLOR_MANIFEST_FIELDS_INVALID'
  | 'P15_CONTAINER_OVERLAY_COLOR_MANIFEST_VERSION_INVALID'
  | 'P15_CONTAINER_OVERLAY_COLOR_SOURCE_FINGERPRINT_INVALID'
  | 'P15_CONTAINER_OVERLAY_COLOR_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_CONTAINER_OVERLAY_COLOR_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_CONTAINER_OVERLAY_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_CONTAINER_OVERLAY_COLOR_ENTRIES_INVALID'
  | 'P15_CONTAINER_OVERLAY_COLOR_ENTRY_INVALID'
  | 'P15_CONTAINER_OVERLAY_COLOR_DUPLICATE_SOURCE_ID'
  | 'P15_CONTAINER_OVERLAY_COLOR_SOURCE_NOT_CONTAINER'
  | 'P15_CONTAINER_OVERLAY_COLOR_VALUE_INVALID'
  | 'P15_CONTAINER_OVERLAY_COLOR_OPACITY_INVALID'
  | 'P15_CONTAINER_OVERLAY_COLOR_AUTHORITY_FLAGS_INVALID'
  | 'P15_CONTAINER_OVERLAY_COLOR_GENERATOR_BINDING_MISMATCH'
  | 'P15_CONTAINER_OVERLAY_COLOR_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_CONTAINER_OVERLAY_COLOR_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorContainerOverlayColorIssueV1 {
  code: P15ElementorContainerOverlayColorIssueCode;
  path: string;
  message: string;
}

export type P15ElementorContainerOverlayColorStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_CONTAINER_OVERLAY_COLOR_OVERRIDES'
  | 'CONTAINER_OVERLAY_COLOR_RESOLVED';

export interface P15ElementorContainerOverlayColorSummaryEntryV1 {
  sourceNodeId: string;
  color: P15ElementorContainerOverlayColorValue;
  opacityHundredths?: number;
  tabletOpacityHundredths?: number;
  mobileOpacityHundredths?: number;
}

export interface P15ElementorContainerOverlayColorResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_RESULT_VERSION;
  status: P15ElementorContainerOverlayColorStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedOverlayColors: P15ElementorContainerOverlayColorSummaryEntryV1[];
  issues: P15ElementorContainerOverlayColorIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const EVIDENCE = P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_EVIDENCE;
const CONFLICT = { conflictSubject: 'Container overlay color', conflictMessage: 'Generated base candidate already contains a Container overlay color setting.' };
const OPACITY_FIELDS = [
  ['opacityHundredths', EVIDENCE.opacityDesktopSettingKey],
  ['tabletOpacityHundredths', EVIDENCE.opacityTabletSettingKey],
  ['mobileOpacityHundredths', EVIDENCE.opacityMobileSettingKey],
] as const;
/** Container overlay colour as an engine family; also the chained prerequisite of overlay visuals. */
export const P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_FAMILY = containerStyleFamily({
  id: 'container-overlay-color',
  issuePrefix: 'P15_CONTAINER_OVERLAY_COLOR',
  subject: 'Container overlay color',
  manifestVersion: P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_CONTAINER_OVERLAY_COLOR_OVERRIDES', resolved: 'CONTAINER_OVERLAY_COLOR_RESOLVED' },
  summaryField: 'resolvedOverlayColors',
  fields: [
    { field: 'color', codec: lowerHexColorCodec },
    ...OPACITY_FIELDS.map(([field]) => ({ field, codec: hundredthsOpacityCodec, optional: true })),
  ],
  checks: [
    {
      fields: ['color'],
      code: 'VALUE_INVALID',
      pathSuffix: '.color',
      message: 'Container overlay color must be a lowercase six-digit hex value such as #1a2b3c.',
    },
    {
      fields: OPACITY_FIELDS.map(([field]) => field),
      code: 'OPACITY_INVALID',
      pathSuffix: '.opacityHundredths',
      message: 'Each supplied opacity must be an integer hundredths value from 0 through 100.',
    },
  ],
  extraIssueSuffixes: ['OPACITY_INVALID'],
  entryEnvelopeMessage: 'Each Container overlay color entry may contain only sourceNodeId and color.',
  messages: {
    notContainer: 'Container overlay color sourceNodeId must identify an existing neutral Container node.',
  },
  bindingMissingMessage: () => 'Generated Container binding missing for a requested source node.',
  writes: (entry) => [
    { settingKey: EVIDENCE.typeSettingKey, value: 'classic', ...CONFLICT },
    { settingKey: EVIDENCE.colorSettingKey, value: entry.color, ...CONFLICT },
    ...OPACITY_FIELDS
      .filter(([field]) => entry[field] !== undefined)
      .map(([field, settingKey]) => ({ settingKey, value: hundredthsOpacityCodec.encode(entry[field] as number), ...CONFLICT })),
  ],
});

/**
 * Apply only explicit Container overlay color values to exact generated Container bindings.
 *
 * Only canonical lowercase six-digit hex is accepted. This does not infer
 * responsive values, parse CSS/global tokens, or claim import/production authority.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-style.test.ts`.
 */
export function resolveP15ElementorContainerOverlayColor(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorContainerOverlayColorResultV1 {
  return resolveContainerPropertyFamily(P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_FAMILY, sourceValue, manifestValue) as unknown as P15ElementorContainerOverlayColorResultV1;
}

/** Serialize only sanitized color metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorContainerOverlayColorSummary(
  result: P15ElementorContainerOverlayColorResultV1,
): string {
  return serializeContainerPropertyFamilySummary(P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_FAMILY, result as unknown as ContainerFamilyResult);
}
