import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { borderStyleFamily } from './mapping-engine/families/border-style';
import type { ElementorTemplateV04 } from './template-v04';

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

export interface P15ElementorContainerBorderStyleManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorContainerBorderStyleEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorContainerBorderStyleIssueCode =
  | 'P15_CONTAINER_BORDER_STYLE_SOURCE_IR_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_CONTAINER_BORDER_STYLE_MANIFEST_NOT_OBJECT'
  | 'P15_CONTAINER_BORDER_STYLE_MANIFEST_FIELDS_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_MANIFEST_VERSION_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_SOURCE_FINGERPRINT_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_CONTAINER_BORDER_STYLE_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_CONTAINER_BORDER_STYLE_ENTRIES_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_ENTRY_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_DUPLICATE_SOURCE_ID'
  | 'P15_CONTAINER_BORDER_STYLE_SOURCE_NOT_CONTAINER'
  | 'P15_CONTAINER_BORDER_STYLE_TYPE_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_WIDTH_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_COLOR_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_AUTHORITY_FLAGS_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_GENERATOR_BINDING_MISMATCH'
  | 'P15_CONTAINER_BORDER_STYLE_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_CONTAINER_BORDER_STYLE_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorContainerBorderStyleIssueV1 {
  code: P15ElementorContainerBorderStyleIssueCode;
  path: string;
  message: string;
}

export type P15ElementorContainerBorderStyleStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_CONTAINER_BORDER_STYLE_OVERRIDES'
  | 'CONTAINER_BORDER_STYLES_RESOLVED';

export interface P15ElementorContainerBorderStyleResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_BORDER_STYLE_RESULT_VERSION;
  status: P15ElementorContainerBorderStyleStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedBorderStyles: P15ElementorContainerBorderStyleEntryV1[];
  issues: P15ElementorContainerBorderStyleIssueV1[];
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

/**
 * Apply only explicit border-style settings to exact generated Container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-style.test.ts`.
 */
export function resolveP15ElementorContainerBorderStyles(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorContainerBorderStyleResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorContainerBorderStyleResultV1;
}

/** Serialize only sanitized border-style metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorContainerBorderStyleSummary(
  result: P15ElementorContainerBorderStyleResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
