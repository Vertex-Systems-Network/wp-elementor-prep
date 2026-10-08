import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import type { P15NeutralCrossAlignment } from './neutral-export-ir';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { alignSelfCodec, toElementorAlignSelf } from './mapping-engine/families/responsive-flex-item-sizing';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION =
  'p15-elementor-responsive-flex-item-align-self-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESULT_VERSION =
  'p15-elementor-responsive-flex-item-align-self-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  flexItemSourcePath: 'includes/controls/groups/flex-item.php',
  flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
  qunitFixturePath: 'tests/qunit/mock/elments/container.json',
  qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: '_flex',
  controlName: 'align_self',
  desktopSettingKey: '_flex_align_self',
  tabletSettingKey: '_flex_align_self_tablet',
  mobileSettingKey: '_flex_align_self_mobile',
  targetValues: ['flex-start', 'center', 'flex-end', 'stretch'] as const,
});

export interface P15ElementorResponsiveFlexItemAlignSelfEntryV1 {
  sourceNodeId: string;
  tabletAlignSelf?: P15NeutralCrossAlignment;
  mobileAlignSelf?: P15NeutralCrossAlignment;
}

export interface P15ElementorResponsiveFlexItemAlignSelfManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveFlexItemAlignSelfEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveFlexItemAlignSelfIssueCode =
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_ENTRY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_VALUE_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveFlexItemAlignSelfIssueV1 {
  code: P15ElementorResponsiveFlexItemAlignSelfIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveFlexItemAlignSelfStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDES'
  | 'RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED';

export interface P15ElementorResponsiveFlexItemAlignSelfSummaryEntryV1 {
  sourceNodeId: string;
  tabletAlignSelf: P15NeutralCrossAlignment | null;
  mobileAlignSelf: P15NeutralCrossAlignment | null;
}

export interface P15ElementorResponsiveFlexItemAlignSelfResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemAlignSelfStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedAlignments: P15ElementorResponsiveFlexItemAlignSelfSummaryEntryV1[];
  issues: P15ElementorResponsiveFlexItemAlignSelfIssueV1[];
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

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EVIDENCE;
const FAMILY = responsiveEnumFamily({
  id: 'responsive-flex-item align-self',
  issuePrefix: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF',
  subject: 'Responsive flex-item align-self',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDES', resolved: 'RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED' },
  summaryField: 'resolvedAlignments',
  fields: [
    { field: 'tabletAlignSelf', settingKey: EVIDENCE.tabletSettingKey, codec: alignSelfCodec, toElementor: toElementorAlignSelf, conflictSubject: 'tablet flex-item align-self' },
    { field: 'mobileAlignSelf', settingKey: EVIDENCE.mobileSettingKey, codec: alignSelfCodec, toElementor: toElementorAlignSelf, conflictSubject: 'mobile flex-item align-self' },
  ],
  entryEnvelopeMessage: 'Each responsive flex-item align-self entry may contain only sourceNodeId plus tablet/mobile align-self values.',
  overrideRequiredMessage: 'Each responsive flex-item align-self entry must explicitly provide tabletAlignSelf and/or mobileAlignSelf.',
  valueInvalidMessage: 'Responsive flex-item align-self must be start, center, end or stretch.',
});

/**
 * Apply explicit tablet/mobile flex-item-align-self overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-sizing.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerAlignSelf(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveFlexItemAlignSelfResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveFlexItemAlignSelfResultV1;
}

/** Serialize only sanitized flex-item-align-self metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemAlignSelfSummary(
  result: P15ElementorResponsiveFlexItemAlignSelfResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
