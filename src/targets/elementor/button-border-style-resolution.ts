import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { borderStyleFamily } from './mapping-engine/families/border-style';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';
import type { ElementorTemplateV04 } from './template-v04';

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

export interface P15ElementorButtonBorderStyleManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_BORDER_STYLE_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonBorderStyleEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonBorderStyleIssueCode =
  | 'P15_BUTTON_BORDER_STYLE_SOURCE_IR_INVALID'
  | 'P15_BUTTON_BORDER_STYLE_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_BORDER_STYLE_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_BORDER_STYLE_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_BORDER_STYLE_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_BORDER_STYLE_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_BORDER_STYLE_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_BORDER_STYLE_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_BORDER_STYLE_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_BORDER_STYLE_ENTRIES_INVALID'
  | 'P15_BUTTON_BORDER_STYLE_ENTRY_INVALID'
  | 'P15_BUTTON_BORDER_STYLE_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_BORDER_STYLE_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_BORDER_STYLE_TYPE_INVALID'
  | 'P15_BUTTON_BORDER_STYLE_WIDTH_INVALID'
  | 'P15_BUTTON_BORDER_STYLE_COLOR_INVALID'
  | 'P15_BUTTON_BORDER_STYLE_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_BORDER_STYLE_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_BORDER_STYLE_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_BORDER_STYLE_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonBorderStyleIssueV1 {
  code: P15ElementorButtonBorderStyleIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonBorderStyleStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_BORDER_STYLE_OVERRIDES'
  | 'BUTTON_BORDER_STYLES_RESOLVED';

export interface P15ElementorButtonBorderStyleResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_BORDER_STYLE_RESULT_VERSION;
  status: P15ElementorButtonBorderStyleStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedBorderStyles: P15ElementorButtonBorderStyleEntryV1[];
  issues: P15ElementorButtonBorderStyleIssueV1[];
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

/**
 * Apply only an explicit visible border type, exact integer px widths and one lowercase hex colour to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-style-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonBorderStyles(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonBorderStyleResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorButtonBorderStyleResultV1;
}

/** Serialize only sanitized border-style metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonBorderStyleSummary(
  result: P15ElementorButtonBorderStyleResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
