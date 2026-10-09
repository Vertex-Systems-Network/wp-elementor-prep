import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { directionCodec, GENERIC_RESPONSIVE_MESSAGES, responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION =
  'p15-elementor-responsive-direction-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_DIRECTION_RESULT_VERSION =
  'p15-elementor-responsive-direction-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_DIRECTION_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
  flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
  groupName: 'flex',
  controlName: 'direction',
  tabletSettingKey: 'flex_direction_tablet',
  mobileSettingKey: 'flex_direction_mobile',
});

export type P15ElementorResponsiveDirection =
  | 'row'
  | 'column'
  | 'row-reverse'
  | 'column-reverse';

export interface P15ElementorResponsiveDirectionEntryV1 {
  sourceNodeId: string;
  tabletDirection?: P15ElementorResponsiveDirection;
  mobileDirection?: P15ElementorResponsiveDirection;
}

export interface P15ElementorResponsiveDirectionManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveDirectionEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveDirectionIssueCode =
  | 'P15_RESPONSIVE_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_ENTRY_INVALID'
  | 'P15_RESPONSIVE_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_DIRECTION_INVALID'
  | 'P15_RESPONSIVE_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveDirectionIssueV1 {
  code: P15ElementorResponsiveDirectionIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveDirectionStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_OVERRIDES'
  | 'RESPONSIVE_DIRECTIONS_RESOLVED';

export interface P15ElementorResponsiveDirectionSummaryEntryV1 {
  sourceNodeId: string;
  tabletDirection: P15ElementorResponsiveDirection | null;
  mobileDirection: P15ElementorResponsiveDirection | null;
}

export interface P15ElementorResponsiveDirectionResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_DIRECTION_RESULT_VERSION;
  status: P15ElementorResponsiveDirectionStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedDirections: P15ElementorResponsiveDirectionSummaryEntryV1[];
  issues: P15ElementorResponsiveDirectionIssueV1[];
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

const P15_ELEMENTOR_RESPONSIVE_DIRECTION_FAMILY = responsiveEnumFamily({
  id: 'responsive-direction',
  issuePrefix: 'P15_RESPONSIVE',
  subject: 'Responsive direction',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_DIRECTION_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_DIRECTION_MAX_ENTRIES,
  evidence: P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_OVERRIDES', resolved: 'RESPONSIVE_DIRECTIONS_RESOLVED' },
  summaryField: 'resolvedDirections',
  fields: [
    { field: 'tabletDirection', settingKey: P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE.tabletSettingKey, codec: directionCodec, conflictSubject: 'tablet direction' },
    { field: 'mobileDirection', settingKey: P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE.mobileSettingKey, codec: directionCodec, conflictSubject: 'mobile direction' },
  ],
  entryEnvelopeMessage: 'Each responsive entry may contain only sourceNodeId plus tablet/mobile direction overrides.',
  overrideRequiredMessage: 'Each responsive entry must explicitly provide tabletDirection and/or mobileDirection.',
  valueInvalidMessage: 'Responsive direction must be row, column, row-reverse or column-reverse.',
  issueCodes: { VALUE_INVALID: 'P15_RESPONSIVE_DIRECTION_INVALID' },
  messages: GENERIC_RESPONSIVE_MESSAGES,
  bindingIssuesLast: true,
});

/**
 * Apply explicit tablet/mobile direction overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerDirections(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveDirectionResultV1 {
  return resolveContainerPropertyFamily(P15_ELEMENTOR_RESPONSIVE_DIRECTION_FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveDirectionResultV1;
}

/** Serialize only sanitized direction metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveDirectionSummary(
  result: P15ElementorResponsiveDirectionResultV1,
): string {
  return serializeContainerPropertyFamilySummary(P15_ELEMENTOR_RESPONSIVE_DIRECTION_FAMILY, result as unknown as ContainerFamilyResult);
}
