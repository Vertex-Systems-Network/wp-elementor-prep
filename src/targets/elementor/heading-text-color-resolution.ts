import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { lowerHexColorCodec } from './mapping-engine/codecs';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import { headingBaseSettingsMatch, widgetTarget } from './mapping-engine/widget-binding';
import type { P15NeutralHeadingNode } from './neutral-export-ir';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_HEADING_TEXT_COLOR_MANIFEST_VERSION =
  'p15-elementor-heading-text-color-manifest-v1' as const;
export const P15_ELEMENTOR_HEADING_TEXT_COLOR_RESULT_VERSION =
  'p15-elementor-heading-text-color-result-v1' as const;
export const P15_ELEMENTOR_HEADING_TEXT_COLOR_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_HEADING_TEXT_COLOR_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  headingSourcePath: 'includes/widgets/heading.php',
  headingSourceBlobSha: '5b193f958ba34d8d4a24d165a9114f9bc3ef2561',
  controlName: 'title_color',
  settingKey: 'title_color',
  hoverControlName: 'title_hover_color',
  selector: '{{WRAPPER}} .elementor-heading-title',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
});

export type P15ElementorHeadingTextColorValue = string;

export interface P15ElementorHeadingTextColorEntryV1 {
  sourceNodeId: string;
  color: P15ElementorHeadingTextColorValue;
}

export interface P15ElementorHeadingTextColorManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_HEADING_TEXT_COLOR_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  headings: P15ElementorHeadingTextColorEntryV1[];
  colorInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorHeadingTextColorIssueCode =
  | 'P15_HEADING_TEXT_COLOR_SOURCE_IR_INVALID'
  | 'P15_HEADING_TEXT_COLOR_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_HEADING_TEXT_COLOR_MANIFEST_NOT_OBJECT'
  | 'P15_HEADING_TEXT_COLOR_MANIFEST_FIELDS_INVALID'
  | 'P15_HEADING_TEXT_COLOR_MANIFEST_VERSION_INVALID'
  | 'P15_HEADING_TEXT_COLOR_SOURCE_FINGERPRINT_INVALID'
  | 'P15_HEADING_TEXT_COLOR_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_HEADING_TEXT_COLOR_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_HEADING_TEXT_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_HEADING_TEXT_COLOR_ENTRIES_INVALID'
  | 'P15_HEADING_TEXT_COLOR_ENTRY_INVALID'
  | 'P15_HEADING_TEXT_COLOR_DUPLICATE_SOURCE_ID'
  | 'P15_HEADING_TEXT_COLOR_SOURCE_NOT_HEADING'
  | 'P15_HEADING_TEXT_COLOR_VALUE_INVALID'
  | 'P15_HEADING_TEXT_COLOR_AUTHORITY_FLAGS_INVALID'
  | 'P15_HEADING_TEXT_COLOR_GENERATOR_BINDING_MISMATCH'
  | 'P15_HEADING_TEXT_COLOR_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_HEADING_TEXT_COLOR_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorHeadingTextColorIssueV1 {
  code: P15ElementorHeadingTextColorIssueCode;
  path: string;
  message: string;
}

export type P15ElementorHeadingTextColorStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_HEADING_TEXT_COLOR_OVERRIDES'
  | 'HEADING_TEXT_COLORS_RESOLVED';

export interface P15ElementorHeadingTextColorSummaryEntryV1 {
  sourceNodeId: string;
  color: P15ElementorHeadingTextColorValue;
}

export interface P15ElementorHeadingTextColorResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_HEADING_TEXT_COLOR_RESULT_VERSION;
  status: P15ElementorHeadingTextColorStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceHeadingCount: number;
  resolvedHeadingCount: number;
  resolvedColors: P15ElementorHeadingTextColorSummaryEntryV1[];
  issues: P15ElementorHeadingTextColorIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  colorInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const EVIDENCE = P15_ELEMENTOR_HEADING_TEXT_COLOR_EVIDENCE;
const FAMILY = containerStyleFamily({
  id: 'heading-text-color',
  issuePrefix: 'P15_HEADING_TEXT_COLOR',
  subject: 'Heading text color',
  manifestVersion: P15_ELEMENTOR_HEADING_TEXT_COLOR_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_HEADING_TEXT_COLOR_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_HEADING_TEXT_COLOR_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_HEADING_TEXT_COLOR_OVERRIDES', resolved: 'HEADING_TEXT_COLORS_RESOLVED' },
  summaryField: 'resolvedColors',
  target: widgetTarget({
    kinds: ['heading'],
    entriesField: 'headings',
    sourceCountField: 'sourceHeadingCount',
    resolvedCountField: 'resolvedHeadingCount',
    notTargetSuffix: 'SOURCE_NOT_HEADING',
    notTargetMessage: (subject) => `${subject} sourceNodeId must identify an existing neutral Heading node.`,
    bindingMissingMessage: (sourceNodeId) => `Generated Heading binding missing for sourceNodeId ${sourceNodeId}.`,
    reviewMessage: 'Review nodes cannot participate in Heading color binding.',
    matches: (node, settings) => headingBaseSettingsMatch(node as P15NeutralHeadingNode, settings),
    driftPathSuffix: '.settings',
    driftMessage: 'Generated Heading base settings drifted from the exact neutral source.',
  }),
  fields: [{ field: 'color', codec: lowerHexColorCodec }],
  checks: [{
    fields: ['color'],
    code: 'VALUE_INVALID',
    pathSuffix: '.color',
    message: 'Heading text color must be a lowercase six-digit hex value such as #1a2b3c.',
  }],
  leadingAuthorityFlags: ['colorInferencePerformed'],
  entryEnvelopeMessage: 'Each Heading text color entry may contain only sourceNodeId and color.',
  messages: {
    authority: 'Heading text color resolution cannot grant color/responsive inference, mutation, network, closure, compatibility, production or download authority.',
  },
  writes: (entry) => [{
    settingKey: EVIDENCE.settingKey,
    value: entry.color,
    conflictSubject: 'Heading title_color',
    conflictMessage: 'Generated base candidate already contains a Heading title_color setting.',
  }],
});

/**
 * Apply only explicit lowercase six-digit hex normal text colors to exact generated Heading bindings.
 *
 * This contract does not infer colors, parse CSS, resolve global/theme tokens, mutate hover/link color,
 * add alpha channels, change Heading content/level/alignment, or claim compatibility/production authority.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4a); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-widget-family-golden.test.ts`.
 */
export function resolveP15ElementorHeadingTextColors(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorHeadingTextColorResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorHeadingTextColorResultV1;
}

/** Serialize only sanitized color metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorHeadingTextColorSummary(
  result: P15ElementorHeadingTextColorResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
