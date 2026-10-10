import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { borderStyleFamily } from './mapping-engine/families/border-style';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';

export const P15_ELEMENTOR_BUTTON_BORDER_STYLE_MANIFEST_VERSION =
  'p15-elementor-button-border-style-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_BORDER_STYLE_RESULT_VERSION =
  'p15-elementor-button-border-style-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_BORDER_STYLE_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_BUTTON_BORDER_WIDTH_MAX_PX = 100 as const;

export const P15_ELEMENTOR_BUTTON_BORDER_TYPES = [
  'solid',
  'double',
  'dotted',
  'dashed',
  'groove',
] as const;

export const P15_ELEMENTOR_BUTTON_BORDER_STYLE_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  groupBaseSourcePath: 'includes/controls/groups/base.php',
  groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234',
  borderGroupSourcePath: 'includes/controls/groups/border.php',
  borderGroupSourceBlobSha: 'eac53e6b1014a985d1d17f90a4044cfb0c6c33c5',
  dimensionsControlSourcePath: 'includes/controls/dimensions.php',
  dimensionsControlSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  groupName: 'border',
  groupPrefixRule: '{{ControlName}}_',
  borderTypeFieldName: 'border',
  borderTypeSettingKey: 'border_border',
  borderWidthFieldName: 'width',
  borderWidthSettingKey: 'border_width',
  borderWidthTabletSettingKey: 'border_width_tablet',
  borderWidthMobileSettingKey: 'border_width_mobile',
  borderColorFieldName: 'color',
  borderColorSettingKey: 'border_color',
  selector: '{{WRAPPER}} .elementor-button',
  acceptedUnit: 'px',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
  borderWidthMinPx: 0,
  borderWidthMaxPx: P15_ELEMENTOR_BUTTON_BORDER_WIDTH_MAX_PX,
  acceptedBorderTypes: P15_ELEMENTOR_BUTTON_BORDER_TYPES,
});

export type P15ElementorButtonBorderType =
  typeof P15_ELEMENTOR_BUTTON_BORDER_TYPES[number];

export interface P15ElementorButtonBorderWidthPxV1 {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface P15ElementorButtonBorderStyleEntryV1 {
  sourceNodeId: string;
  borderType: P15ElementorButtonBorderType;
  widthPx: P15ElementorButtonBorderWidthPxV1;
  tabletWidthPx?: P15ElementorButtonBorderWidthPxV1;
  mobileWidthPx?: P15ElementorButtonBorderWidthPxV1;
  color: string;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_BORDER_STYLE_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_BORDER_STYLE_RESULT_VERSION;
  status: P15ElementorButtonBorderStyleStatus;
  entriesField: 'buttons';
  entry: P15ElementorButtonBorderStyleEntryV1;
  summaryField: 'resolvedBorderStyles';
  summary: P15ElementorButtonBorderStyleEntryV1;
  issueCode: P15ElementorButtonBorderStyleIssueCode;
  noun: 'Button';
  flags: FamilyAuthorityFlag<'styleInferencePerformed'>;
};
export type P15ElementorButtonBorderStyleManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorButtonBorderStyleIssueCode =
  FamilyIssueCode<'P15_BUTTON_BORDER_STYLE', 'SOURCE_NOT_BUTTON' | 'TYPE_INVALID' | 'WIDTH_INVALID' | 'COLOR_INVALID'>;
export type P15ElementorButtonBorderStyleIssueV1 = FamilyIssueV1<P15ElementorButtonBorderStyleIssueCode>;
export type P15ElementorButtonBorderStyleStatus = FamilyStatus<'NO_BUTTON_BORDER_STYLE_OVERRIDES', 'BUTTON_BORDER_STYLES_RESOLVED'>;
export type P15ElementorButtonBorderStyleResultV1 = FamilyResultV1<Contract>;

const FAMILY = borderStyleFamily({
  id: 'button-border-style',
  issuePrefix: 'P15_BUTTON_BORDER_STYLE',
  subject: 'Button border-style',
  manifestVersion: P15_ELEMENTOR_BUTTON_BORDER_STYLE_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_BORDER_STYLE_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_BORDER_STYLE_MAX_ENTRIES,
  evidence: P15_ELEMENTOR_BUTTON_BORDER_STYLE_EVIDENCE,
  borderTypes: P15_ELEMENTOR_BUTTON_BORDER_TYPES,
  statuses: { none: 'NO_BUTTON_BORDER_STYLE_OVERRIDES', resolved: 'BUTTON_BORDER_STYLES_RESOLVED' },
  nodeNoun: 'Button',
  conflictNoun: 'Button border',
  target: buttonWidgetTarget('Review nodes cannot participate in Button border-style binding.'),
});

const API = familyApi<P15ElementorButtonBorderStyleResultV1>(FAMILY);

/**
 * Apply only an explicit visible border type, exact integer px widths and one lowercase hex colour to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-style-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonBorderStyles(sourceValue: unknown, manifestValue: unknown): P15ElementorButtonBorderStyleResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized border-style metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonBorderStyleSummary(result: P15ElementorButtonBorderStyleResultV1): string {
  return API.serialize(result);
}
