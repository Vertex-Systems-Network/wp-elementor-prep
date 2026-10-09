import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { enumCodec } from './mapping-engine/codecs';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import { desktopAlignMatches, expectedDesktopButtonAlignment, widgetTarget } from './mapping-engine/widget-binding';
import type { P15NeutralButtonNode } from './neutral-export-ir';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION =
  'p15-elementor-responsive-button-alignment-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_RESULT_VERSION =
  'p15-elementor-responsive-button-alignment-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  controlName: 'align',
  desktopSettingKey: 'align',
  tabletSettingKey: 'align_tablet',
  mobileSettingKey: 'align_mobile',
  targetValues: ['left', 'center', 'right', 'justify'] as const,
});

export type P15ElementorResponsiveButtonAlignment =
  typeof P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE.targetValues[number];

export interface P15ElementorResponsiveButtonAlignmentEntryV1 {
  sourceNodeId: string;
  tabletAlign?: P15ElementorResponsiveButtonAlignment;
  mobileAlign?: P15ElementorResponsiveButtonAlignment;
}

export interface P15ElementorResponsiveButtonAlignmentManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  widgets: P15ElementorResponsiveButtonAlignmentEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveButtonAlignmentIssueCode =
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_ENTRY_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_NOT_BUTTON'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_VALUE_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveButtonAlignmentIssueV1 {
  code: P15ElementorResponsiveButtonAlignmentIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveButtonAlignmentStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDES'
  | 'RESPONSIVE_BUTTON_ALIGNMENTS_RESOLVED';

export interface P15ElementorResponsiveButtonAlignmentSummaryEntryV1 {
  sourceNodeId: string;
  tabletAlign: P15ElementorResponsiveButtonAlignment | null;
  mobileAlign: P15ElementorResponsiveButtonAlignment | null;
}

export interface P15ElementorResponsiveButtonAlignmentResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_RESULT_VERSION;
  status: P15ElementorResponsiveButtonAlignmentStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonWidgetCount: number;
  resolvedWidgetCount: number;
  resolvedAlignments: P15ElementorResponsiveButtonAlignmentSummaryEntryV1[];
  issues: P15ElementorResponsiveButtonAlignmentIssueV1[];
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

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE;
const alignCodec = enumCodec(EVIDENCE.targetValues);
const FAMILY = responsiveEnumFamily({
  id: 'responsive-button-alignment',
  issuePrefix: 'P15_RESPONSIVE_BUTTON_ALIGNMENT',
  subject: 'Responsive Button alignment',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDES', resolved: 'RESPONSIVE_BUTTON_ALIGNMENTS_RESOLVED' },
  summaryField: 'resolvedAlignments',
  target: widgetTarget({
    kinds: ['button'],
    entriesField: 'widgets',
    sourceCountField: 'sourceButtonWidgetCount',
    resolvedCountField: 'resolvedWidgetCount',
    notTargetSuffix: 'SOURCE_NOT_BUTTON',
    notTargetMessage: (subject) => `${subject} sourceNodeId must identify an existing neutral Button node.`,
    bindingMissingMessage: (sourceNodeId) => `Generated Button binding missing for sourceNodeId ${sourceNodeId}.`,
    reviewMessage: 'Review nodes cannot participate in responsive Button binding.',
    matches: (node, settings) => desktopAlignMatches(expectedDesktopButtonAlignment((node as P15NeutralButtonNode).align), settings),
    driftPathSuffix: '.settings.align',
    driftMessage: 'Generated Button desktop alignment drifted from the exact normalized target vocabulary.',
  }),
  fields: [
    { field: 'tabletAlign', settingKey: EVIDENCE.tabletSettingKey, codec: alignCodec, conflictSubject: 'tablet alignment' },
    { field: 'mobileAlign', settingKey: EVIDENCE.mobileSettingKey, codec: alignCodec, conflictSubject: 'mobile alignment' },
  ],
  entryEnvelopeMessage: 'Each responsive Button alignment entry may contain only sourceNodeId plus tablet/mobile alignment values.',
  overrideRequiredMessage: 'Each responsive Button alignment entry must explicitly provide tabletAlign and/or mobileAlign.',
  valueInvalidMessage: 'Button responsive alignment must be left, center, right or justify.',
  messages: {
    upstream: 'Responsive Button alignment requires an existing review-free generated local candidate.',
    authority: 'Responsive Button alignment cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
  },
});

/**
 * Apply only explicit default tablet/mobile alignment overrides to exact generated Button bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer responsive values,
 * alter normalized desktop alignment, add custom breakpoints, or claim responsive closure.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4a); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-widget-family-golden.test.ts`.
 */
export function resolveP15ElementorResponsiveButtonAlignments(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveButtonAlignmentResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveButtonAlignmentResultV1;
}

/** Serialize only sanitized alignment metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveButtonAlignmentSummary(
  result: P15ElementorResponsiveButtonAlignmentResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
