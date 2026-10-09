import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { lowerHexColorCodec } from './mapping-engine/codecs';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION =
  'p15-elementor-container-hover-background-color-manifest-v1' as const;
export const P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_RESULT_VERSION =
  'p15-elementor-container-hover-background-color-result-v1' as const;
export const P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  backgroundGroupSourcePath: 'includes/controls/groups/background.php',
  backgroundGroupSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1',
  groupName: 'background_hover',
  typeSettingKey: 'background_hover_background',
  colorSettingKey: 'background_hover_color',
  selector: '{{WRAPPER}}:hover',
  acceptedBackgroundType: 'classic',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
});

export type P15ElementorContainerHoverBackgroundColorValue = string;

export interface P15ElementorContainerHoverBackgroundColorEntryV1 {
  sourceNodeId: string;
  color: P15ElementorContainerHoverBackgroundColorValue;
}

export interface P15ElementorContainerHoverBackgroundColorManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorContainerHoverBackgroundColorEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorContainerHoverBackgroundColorIssueCode =
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_SOURCE_IR_INVALID'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_NOT_OBJECT'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_FIELDS_INVALID'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION_INVALID'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_SOURCE_FINGERPRINT_INVALID'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_ENTRIES_INVALID'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_ENTRY_INVALID'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_DUPLICATE_SOURCE_ID'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_SOURCE_NOT_CONTAINER'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_VALUE_INVALID'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_AUTHORITY_FLAGS_INVALID'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_GENERATOR_BINDING_MISMATCH'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorContainerHoverBackgroundColorIssueV1 {
  code: P15ElementorContainerHoverBackgroundColorIssueCode;
  path: string;
  message: string;
}

export type P15ElementorContainerHoverBackgroundColorStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_CONTAINER_HOVER_BACKGROUND_COLOR_OVERRIDES'
  | 'CONTAINER_HOVER_BACKGROUND_COLOR_RESOLVED';

export interface P15ElementorContainerHoverBackgroundColorSummaryEntryV1 {
  sourceNodeId: string;
  color: P15ElementorContainerHoverBackgroundColorValue;
}

export interface P15ElementorContainerHoverBackgroundColorResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_RESULT_VERSION;
  status: P15ElementorContainerHoverBackgroundColorStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedHoverBackgroundColors: P15ElementorContainerHoverBackgroundColorSummaryEntryV1[];
  issues: P15ElementorContainerHoverBackgroundColorIssueV1[];
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

const EVIDENCE = P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_EVIDENCE;
const FAMILY = containerStyleFamily({
  id: 'container-hover-background-color',
  issuePrefix: 'P15_CONTAINER_HOVER_BACKGROUND_COLOR',
  subject: 'Container hover background color',
  manifestVersion: P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_CONTAINER_HOVER_BACKGROUND_COLOR_OVERRIDES', resolved: 'CONTAINER_HOVER_BACKGROUND_COLOR_RESOLVED' },
  summaryField: 'resolvedHoverBackgroundColors',
  fields: [{ field: 'color', codec: lowerHexColorCodec }],
  checks: [{
    fields: ['color'],
    code: 'VALUE_INVALID',
    pathSuffix: '.color',
    message: 'Container hover background color must be a lowercase six-digit hex value such as #1a2b3c.',
  }],
  entryEnvelopeMessage: 'Each Container hover background color entry may contain only sourceNodeId and color.',
  messages: {
    notContainer: 'Container hover background color sourceNodeId must identify an existing neutral Container node.',
  },
  bindingMissingMessage: (sourceNodeId) => `Generated Container binding missing for sourceNodeId ${sourceNodeId}.`,
  writes: (entry) => [
    { settingKey: EVIDENCE.typeSettingKey, value: 'classic', conflictSubject: 'Container hover background color', conflictMessage: 'Generated base candidate already contains a Container hover background color setting.' },
    { settingKey: EVIDENCE.colorSettingKey, value: entry.color, conflictSubject: 'Container hover background color', conflictMessage: 'Generated base candidate already contains a Container hover background color setting.' },
  ],
});

/**
 * Apply only explicit Container hover background color values to exact generated Container bindings.
 *
 * Only canonical lowercase six-digit hex is accepted. This does not infer
 * responsive values, parse CSS/global tokens, or claim import/production authority.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-style.test.ts`.
 */
export function resolveP15ElementorContainerHoverBackgroundColor(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorContainerHoverBackgroundColorResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorContainerHoverBackgroundColorResultV1;
}

/** Serialize only sanitized hover background color metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorContainerHoverBackgroundColorSummary(
  result: P15ElementorContainerHoverBackgroundColorResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
