import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import type { P15NeutralCrossAlignment, P15NeutralJustification } from './neutral-export-ir';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { crossAlignmentCodec, justificationCodec, responsiveEnumFamily, toElementorFlexAlignment } from './mapping-engine/families/responsive-layout';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION =
  'p15-elementor-responsive-alignment-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_RESULT_VERSION =
  'p15-elementor-responsive-alignment-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
  flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
  containerMockSourcePath: 'tests/qunit/mock/elments/container.json',
  containerMockSourceBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: 'flex',
  justifyControlName: 'justify_content',
  alignControlName: 'align_items',
  tabletJustifySettingKey: 'flex_justify_content_tablet',
  mobileJustifySettingKey: 'flex_justify_content_mobile',
  tabletAlignSettingKey: 'flex_align_items_tablet',
  mobileAlignSettingKey: 'flex_align_items_mobile',
});

export interface P15ElementorResponsiveAlignmentEntryV1 {
  sourceNodeId: string;
  tabletAlignItems?: P15NeutralCrossAlignment;
  mobileAlignItems?: P15NeutralCrossAlignment;
  tabletJustifyContent?: P15NeutralJustification;
  mobileJustifyContent?: P15NeutralJustification;
}

export interface P15ElementorResponsiveAlignmentManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveAlignmentEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveAlignmentIssueCode =
  | 'P15_RESPONSIVE_ALIGNMENT_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_ALIGNMENT_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_ALIGNMENT_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_ALIGNMENT_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_ENTRY_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_ALIGNMENT_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_ALIGNMENT_VALUE_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_ALIGNMENT_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_ALIGNMENT_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveAlignmentIssueV1 {
  code: P15ElementorResponsiveAlignmentIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveAlignmentStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_ALIGNMENT_OVERRIDES'
  | 'RESPONSIVE_ALIGNMENTS_RESOLVED';

export interface P15ElementorResponsiveAlignmentSummaryEntryV1 {
  sourceNodeId: string;
  tabletAlignItems: P15NeutralCrossAlignment | null;
  mobileAlignItems: P15NeutralCrossAlignment | null;
  tabletJustifyContent: P15NeutralJustification | null;
  mobileJustifyContent: P15NeutralJustification | null;
}

export interface P15ElementorResponsiveAlignmentResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_RESULT_VERSION;
  status: P15ElementorResponsiveAlignmentStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedAlignments: P15ElementorResponsiveAlignmentSummaryEntryV1[];
  issues: P15ElementorResponsiveAlignmentIssueV1[];
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

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE;
const conflictMessage = (settingKey: string): string =>
  `Generated base candidate already contains requested responsive alignment key ${settingKey}.`;

const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_FAMILY = responsiveEnumFamily({
  id: 'responsive-alignment',
  issuePrefix: 'P15_RESPONSIVE_ALIGNMENT',
  subject: 'Responsive alignment',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_ALIGNMENT_OVERRIDES', resolved: 'RESPONSIVE_ALIGNMENTS_RESOLVED' },
  summaryField: 'resolvedAlignments',
  fields: [
    { field: 'tabletAlignItems', settingKey: EVIDENCE.tabletAlignSettingKey, codec: crossAlignmentCodec, toElementor: toElementorFlexAlignment, conflictSubject: 'tablet align', conflictMessage: conflictMessage(EVIDENCE.tabletAlignSettingKey) },
    { field: 'mobileAlignItems', settingKey: EVIDENCE.mobileAlignSettingKey, codec: crossAlignmentCodec, toElementor: toElementorFlexAlignment, conflictSubject: 'mobile align', conflictMessage: conflictMessage(EVIDENCE.mobileAlignSettingKey) },
    { field: 'tabletJustifyContent', settingKey: EVIDENCE.tabletJustifySettingKey, codec: justificationCodec, toElementor: toElementorFlexAlignment, conflictSubject: 'tablet justify', conflictMessage: conflictMessage(EVIDENCE.tabletJustifySettingKey) },
    { field: 'mobileJustifyContent', settingKey: EVIDENCE.mobileJustifySettingKey, codec: justificationCodec, toElementor: toElementorFlexAlignment, conflictSubject: 'mobile justify', conflictMessage: conflictMessage(EVIDENCE.mobileJustifySettingKey) },
  ],
  entryEnvelopeMessage: 'Each responsive alignment entry may contain only sourceNodeId plus tablet/mobile align/justify overrides.',
  overrideRequiredMessage: 'Each responsive alignment entry must explicitly provide at least one tablet/mobile alignment override.',
  valueInvalidMessage: 'Responsive alignItems/justifyContent value is outside the bounded neutral vocabulary.',
  conflictMode: 'all',
});

/**
 * Apply explicit tablet/mobile alignment overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerAlignments(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveAlignmentResultV1 {
  return resolveContainerPropertyFamily(P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveAlignmentResultV1;
}

/** Serialize only sanitized alignment metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveAlignmentSummary(
  result: P15ElementorResponsiveAlignmentResultV1,
): string {
  return serializeContainerPropertyFamilySummary(P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_FAMILY, result as unknown as ContainerFamilyResult);
}
