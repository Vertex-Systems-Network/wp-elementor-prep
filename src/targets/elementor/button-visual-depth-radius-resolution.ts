import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { elementorLinkedDimensionsPx } from './mapping-engine/codecs';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import {
  boxShadowValueCodec,
  elementorBoxShadowPosition,
  responsiveRadiusCodec,
  textShadowValueCodec,
  type BoxShadowValue,
  type ResponsiveRadiusValue,
  type TextShadowValue,
} from './mapping-engine/families/button-style';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';
import { P15_NEUTRAL_EXPORT_MAX_RADIUS_PX } from './neutral-export-ir';

export const P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_VERSION =
  'p15-elementor-button-visual-depth-radius-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_RESULT_VERSION =
  'p15-elementor-button-visual-depth-radius-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  groupBaseSourcePath: 'includes/controls/groups/base.php',
  groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234',
  textShadowGroupSourcePath: 'includes/controls/groups/text-shadow.php',
  textShadowGroupSourceBlobSha: 'd587b60ada0e4303e8168b334354c8c04fcccd84',
  textShadowControlSourcePath: 'includes/controls/text-shadow.php',
  textShadowControlSourceBlobSha: 'c6d9615d280e20de8356a90351f95d8a36c18d2f',
  boxShadowGroupSourcePath: 'includes/controls/groups/box-shadow.php',
  boxShadowGroupSourceBlobSha: '1c068c900db0ff2593089028d67fb6d897dbaa33',
  boxShadowControlSourcePath: 'includes/controls/box-shadow.php',
  boxShadowControlSourceBlobSha: 'e55cf9af34db5cc3e73dc295cd9f35b437da6fa7',
  dimensionsControlSourcePath: 'includes/controls/dimensions.php',
  dimensionsControlSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  buttonSelector: '{{WRAPPER}} .elementor-button',
  textShadowGroupName: 'text_shadow',
  textShadowTypeSettingKey: 'text_shadow_text_shadow_type',
  textShadowSettingKey: 'text_shadow_text_shadow',
  textShadowEnabledValue: 'yes',
  boxShadowGroupName: 'button_box_shadow',
  boxShadowTypeSettingKey: 'button_box_shadow_box_shadow_type',
  boxShadowSettingKey: 'button_box_shadow_box_shadow',
  boxShadowPositionSettingKey: 'button_box_shadow_box_shadow_position',
  boxShadowEnabledValue: 'yes',
  borderRadiusControlName: 'border_radius',
  borderRadiusDesktopSettingKey: 'border_radius',
  borderRadiusTabletSettingKey: 'border_radius_tablet',
  borderRadiusMobileSettingKey: 'border_radius_mobile',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
  radiusMinPx: 0,
  radiusMaxPx: P15_NEUTRAL_EXPORT_MAX_RADIUS_PX,
});

export interface P15ElementorButtonTextShadowV1 {
  horizontal: number;
  vertical: number;
  blur: number;
  color: string;
}

export interface P15ElementorButtonBoxShadowV1 {
  horizontal: number;
  vertical: number;
  blur: number;
  spread: number;
  color: string;
  position: 'outline' | 'inset';
}

export interface P15ElementorButtonResponsiveRadiusPxV1 {
  desktop: number;
  tablet: number;
  mobile: number;
}

export interface P15ElementorButtonVisualDepthRadiusEntryV1 {
  sourceNodeId: string;
  textShadow?: P15ElementorButtonTextShadowV1;
  boxShadow?: P15ElementorButtonBoxShadowV1;
  borderRadiusPx?: P15ElementorButtonResponsiveRadiusPxV1;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_RESULT_VERSION;
  status: P15ElementorButtonVisualDepthRadiusStatus;
  entriesField: 'buttons';
  entry: P15ElementorButtonVisualDepthRadiusEntryV1;
  summaryField: 'resolvedStyles';
  summary: P15ElementorButtonVisualDepthRadiusEntryV1;
  issueCode: P15ElementorButtonVisualDepthRadiusIssueCode;
  noun: 'Button';
  flags: FamilyAuthorityFlag<'styleInferencePerformed'>;
};
export type P15ElementorButtonVisualDepthRadiusManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorButtonVisualDepthRadiusIssueCode =
  FamilyIssueCode<'P15_BUTTON_VISUAL_DEPTH_RADIUS', 'SOURCE_NOT_BUTTON' | 'TEXT_SHADOW_INVALID' | 'BOX_SHADOW_INVALID' | 'RADIUS_INVALID'>;
export type P15ElementorButtonVisualDepthRadiusIssueV1 = FamilyIssueV1<P15ElementorButtonVisualDepthRadiusIssueCode>;
export type P15ElementorButtonVisualDepthRadiusStatus = FamilyStatus<'NO_BUTTON_VISUAL_DEPTH_RADIUS_OVERRIDES', 'BUTTON_VISUAL_DEPTH_RADIUS_RESOLVED'>;
export type P15ElementorButtonVisualDepthRadiusResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE;
const textShadowCodec = textShadowValueCodec();
const boxShadowCodec = boxShadowValueCodec();
const radiusCodec = responsiveRadiusCodec(P15_NEUTRAL_EXPORT_MAX_RADIUS_PX);
const conflict = (settingKey: string) => ({
  conflictSubject: settingKey,
  conflictMessage: `Generated base candidate already contains requested Button style setting ${settingKey}.`,
});
const FAMILY = containerStyleFamily({
  id: 'button-visual-depth-radius',
  issuePrefix: 'P15_BUTTON_VISUAL_DEPTH_RADIUS',
  subject: 'Button visual-depth/radius',
  manifestVersion: P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_VISUAL_DEPTH_RADIUS_OVERRIDES', resolved: 'BUTTON_VISUAL_DEPTH_RADIUS_RESOLVED' },
  summaryField: 'resolvedStyles',
  target: buttonWidgetTarget('Review nodes cannot participate in Button visual-depth/radius binding.'),
  fields: [
    { field: 'textShadow', codec: textShadowCodec, optional: true },
    { field: 'boxShadow', codec: boxShadowCodec, optional: true },
    { field: 'borderRadiusPx', codec: radiusCodec, optional: true },
  ],
  requireAny: { code: 'ENTRY_INVALID', message: 'Each Button entry must request at least one bounded visual-depth/radius capability.' },
  checks: [
    { fields: ['textShadow'], code: 'TEXT_SHADOW_INVALID', pathSuffix: '.textShadow', message: 'Text shadow must use bounded integer sliders and strict lowercase six-digit hex color.' },
    { fields: ['boxShadow'], code: 'BOX_SHADOW_INVALID', pathSuffix: '.boxShadow', message: 'Box shadow must use bounded integer sliders, strict lowercase six-digit hex color and outline|inset position.' },
    {
      fields: ['borderRadiusPx'],
      code: 'RADIUS_INVALID',
      pathSuffix: '.borderRadiusPx',
      message: `borderRadiusPx must explicitly provide integer desktop/tablet/mobile px values from 0 through ${P15_NEUTRAL_EXPORT_MAX_RADIUS_PX}.`,
    },
  ],
  leadingAuthorityFlags: ['styleInferencePerformed'],
  extraIssueSuffixes: ['TEXT_SHADOW_INVALID', 'BOX_SHADOW_INVALID', 'RADIUS_INVALID'],
  entryEnvelopeMessage: 'Each entry may contain only sourceNodeId, textShadow, boxShadow and borderRadiusPx.',
  messages: {
    notContainer: 'sourceNodeId must identify an existing neutral Button node.',
    authority: 'Button visual-depth/radius resolution cannot grant inference, mutation, network, closure, compatibility, production or download authority.',
  },
  writes: (entry) => [
    ...(entry.textShadow === undefined ? [] : [
      { settingKey: EVIDENCE.textShadowTypeSettingKey, value: EVIDENCE.textShadowEnabledValue, ...conflict(EVIDENCE.textShadowTypeSettingKey) },
      { settingKey: EVIDENCE.textShadowSettingKey, value: textShadowCodec.encode(entry.textShadow as TextShadowValue), ...conflict(EVIDENCE.textShadowSettingKey) },
    ]),
    ...(entry.boxShadow === undefined ? [] : [
      { settingKey: EVIDENCE.boxShadowTypeSettingKey, value: EVIDENCE.boxShadowEnabledValue, ...conflict(EVIDENCE.boxShadowTypeSettingKey) },
      { settingKey: EVIDENCE.boxShadowSettingKey, value: boxShadowCodec.encode(entry.boxShadow as BoxShadowValue), ...conflict(EVIDENCE.boxShadowSettingKey) },
      { settingKey: EVIDENCE.boxShadowPositionSettingKey, value: elementorBoxShadowPosition(entry.boxShadow as BoxShadowValue), ...conflict(EVIDENCE.boxShadowPositionSettingKey) },
    ]),
    ...(entry.borderRadiusPx === undefined ? [] : (['desktop', 'tablet', 'mobile'] as const).map((device) => {
      const settingKey = {
        desktop: EVIDENCE.borderRadiusDesktopSettingKey,
        tablet: EVIDENCE.borderRadiusTabletSettingKey,
        mobile: EVIDENCE.borderRadiusMobileSettingKey,
      }[device];
      return { settingKey, value: elementorLinkedDimensionsPx((entry.borderRadiusPx as ResponsiveRadiusValue)[device]), ...conflict(settingKey) };
    })),
  ],
});

const API = familyApi<P15ElementorButtonVisualDepthRadiusResultV1>(FAMILY);

/**
 * Apply only explicit bounded text shadow, box shadow and responsive radius to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-style-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonVisualDepthRadius(sourceValue: unknown, manifestValue: unknown): P15ElementorButtonVisualDepthRadiusResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized visual-depth/radius metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonVisualDepthRadiusSummary(result: P15ElementorButtonVisualDepthRadiusResultV1): string {
  return API.serialize(result);
}
