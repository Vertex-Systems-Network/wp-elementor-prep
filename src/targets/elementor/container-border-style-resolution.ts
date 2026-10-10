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

export const P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MANIFEST_VERSION =
  'p15-elementor-container-border-style-manifest-v1' as const;
export const P15_ELEMENTOR_CONTAINER_BORDER_STYLE_RESULT_VERSION =
  'p15-elementor-container-border-style-result-v1' as const;
export const P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_CONTAINER_BORDER_WIDTH_MAX_PX = 100 as const;

export const P15_ELEMENTOR_CONTAINER_BORDER_TYPES = [
  'solid',
  'double',
  'dotted',
  'dashed',
  'groove',
] as const;

export const P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
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
  selector: '{{WRAPPER}}',
  acceptedUnit: 'px',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
  borderWidthMinPx: 0,
  borderWidthMaxPx: P15_ELEMENTOR_CONTAINER_BORDER_WIDTH_MAX_PX,
  acceptedBorderTypes: P15_ELEMENTOR_CONTAINER_BORDER_TYPES,
});

export type P15ElementorContainerBorderType =
  typeof P15_ELEMENTOR_CONTAINER_BORDER_TYPES[number];

export interface P15ElementorContainerBorderWidthPxV1 {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface P15ElementorContainerBorderStyleEntryV1 {
  sourceNodeId: string;
  borderType: P15ElementorContainerBorderType;
  widthPx: P15ElementorContainerBorderWidthPxV1;
  tabletWidthPx?: P15ElementorContainerBorderWidthPxV1;
  mobileWidthPx?: P15ElementorContainerBorderWidthPxV1;
  color: string;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_BORDER_STYLE_RESULT_VERSION;
  status: P15ElementorContainerBorderStyleStatus;
  entriesField: 'containers';
  entry: P15ElementorContainerBorderStyleEntryV1;
  summaryField: 'resolvedBorderStyles';
  summary: P15ElementorContainerBorderStyleEntryV1;
  issueCode: P15ElementorContainerBorderStyleIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag<'styleInferencePerformed'>;
};
export type P15ElementorContainerBorderStyleManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorContainerBorderStyleIssueCode =
  FamilyIssueCode<'P15_CONTAINER_BORDER_STYLE', 'TYPE_INVALID' | 'WIDTH_INVALID' | 'COLOR_INVALID'>;
export type P15ElementorContainerBorderStyleIssueV1 = FamilyIssueV1<P15ElementorContainerBorderStyleIssueCode>;
export type P15ElementorContainerBorderStyleStatus = FamilyStatus<'NO_CONTAINER_BORDER_STYLE_OVERRIDES', 'CONTAINER_BORDER_STYLES_RESOLVED'>;
export type P15ElementorContainerBorderStyleResultV1 = FamilyResultV1<Contract>;

const FAMILY = borderStyleFamily({
  id: 'container-border-style',
  issuePrefix: 'P15_CONTAINER_BORDER_STYLE',
  subject: 'Container border-style',
  manifestVersion: P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_CONTAINER_BORDER_STYLE_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MAX_ENTRIES,
  evidence: P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE,
  borderTypes: P15_ELEMENTOR_CONTAINER_BORDER_TYPES,
  statuses: { none: 'NO_CONTAINER_BORDER_STYLE_OVERRIDES', resolved: 'CONTAINER_BORDER_STYLES_RESOLVED' },
  nodeNoun: 'Container',
  conflictNoun: 'Container border',
  bindingMissingMessage: (sourceNodeId) => `Generated Container binding missing for sourceNodeId ${sourceNodeId}.`,
});

const API = familyApi<P15ElementorContainerBorderStyleResultV1>(FAMILY);

/**
 * Apply only explicit border-style settings to exact generated Container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-style.test.ts`.
 */
export function resolveP15ElementorContainerBorderStyles(sourceValue: unknown, manifestValue: unknown): P15ElementorContainerBorderStyleResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized border-style metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorContainerBorderStyleSummary(result: P15ElementorContainerBorderStyleResultV1): string {
  return API.serialize(result);
}
