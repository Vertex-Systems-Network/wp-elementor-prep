import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { GENERIC_RESPONSIVE_MESSAGES, responsiveEnumFamily, wrapCodec } from './mapping-engine/families/responsive-layout';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_RESPONSIVE_WRAP_MANIFEST_VERSION =
  'p15-elementor-responsive-wrap-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_WRAP_RESULT_VERSION =
  'p15-elementor-responsive-wrap-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_WRAP_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_WRAP_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
  flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
  qunitFixturePath: 'tests/qunit/mock/elments/container.json',
  qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: 'flex',
  controlName: 'wrap',
  desktopSettingKey: 'flex_wrap',
  tabletSettingKey: 'flex_wrap_tablet',
  mobileSettingKey: 'flex_wrap_mobile',
});

export type P15ElementorResponsiveWrap = 'nowrap' | 'wrap';

export interface P15ElementorResponsiveWrapEntryV1 {
  sourceNodeId: string;
  tabletWrap?: P15ElementorResponsiveWrap;
  mobileWrap?: P15ElementorResponsiveWrap;
}

export interface P15ElementorResponsiveWrapManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_WRAP_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveWrapEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveWrapIssueCode =
  | 'P15_RESPONSIVE_WRAP_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_WRAP_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_WRAP_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_WRAP_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_WRAP_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_WRAP_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_WRAP_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_WRAP_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_WRAP_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_WRAP_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_WRAP_ENTRY_INVALID'
  | 'P15_RESPONSIVE_WRAP_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_WRAP_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_WRAP_VALUE_INVALID'
  | 'P15_RESPONSIVE_WRAP_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_WRAP_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_WRAP_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_WRAP_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_WRAP_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveWrapIssueV1 {
  code: P15ElementorResponsiveWrapIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveWrapStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_WRAP_OVERRIDES'
  | 'RESPONSIVE_WRAPS_RESOLVED';

export interface P15ElementorResponsiveWrapSummaryEntryV1 {
  sourceNodeId: string;
  tabletWrap: P15ElementorResponsiveWrap | null;
  mobileWrap: P15ElementorResponsiveWrap | null;
}

export interface P15ElementorResponsiveWrapResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_WRAP_RESULT_VERSION;
  status: P15ElementorResponsiveWrapStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedWraps: P15ElementorResponsiveWrapSummaryEntryV1[];
  issues: P15ElementorResponsiveWrapIssueV1[];
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

const P15_ELEMENTOR_RESPONSIVE_WRAP_FAMILY = responsiveEnumFamily({
  id: 'responsive-wrap',
  issuePrefix: 'P15_RESPONSIVE_WRAP',
  subject: 'Responsive wrap',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_WRAP_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_WRAP_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_WRAP_MAX_ENTRIES,
  evidence: P15_ELEMENTOR_RESPONSIVE_WRAP_EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_WRAP_OVERRIDES', resolved: 'RESPONSIVE_WRAPS_RESOLVED' },
  summaryField: 'resolvedWraps',
  fields: [
    { field: 'tabletWrap', settingKey: P15_ELEMENTOR_RESPONSIVE_WRAP_EVIDENCE.tabletSettingKey, codec: wrapCodec, conflictSubject: 'tablet wrap' },
    { field: 'mobileWrap', settingKey: P15_ELEMENTOR_RESPONSIVE_WRAP_EVIDENCE.mobileSettingKey, codec: wrapCodec, conflictSubject: 'mobile wrap' },
  ],
  entryEnvelopeMessage: 'Each responsive entry may contain only sourceNodeId plus tablet/mobile wrap overrides.',
  overrideRequiredMessage: 'Each responsive entry must explicitly provide tabletWrap and/or mobileWrap.',
  valueInvalidMessage: 'Responsive wrap must be nowrap or wrap.',
  messages: GENERIC_RESPONSIVE_MESSAGES,
  bindingIssuesLast: true,
});

/**
 * Apply explicit tablet/mobile wrap overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerWraps(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveWrapResultV1 {
  return resolveContainerPropertyFamily(P15_ELEMENTOR_RESPONSIVE_WRAP_FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveWrapResultV1;
}

/** Serialize only sanitized wrap metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveWrapSummary(
  result: P15ElementorResponsiveWrapResultV1,
): string {
  return serializeContainerPropertyFamilySummary(P15_ELEMENTOR_RESPONSIVE_WRAP_FAMILY, result as unknown as ContainerFamilyResult);
}
