import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { enumCodec } from './mapping-engine/codecs';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_CONTAINER_OVERFLOW_MANIFEST_VERSION =
  'p15-elementor-container-overflow-manifest-v1' as const;
export const P15_ELEMENTOR_CONTAINER_OVERFLOW_RESULT_VERSION =
  'p15-elementor-container-overflow-result-v1' as const;
export const P15_ELEMENTOR_CONTAINER_OVERFLOW_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_CONTAINER_OVERFLOW_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  frontendContainerStylesSourcePath: 'assets/dev/scss/frontend/_container.scss',
  frontendContainerStylesSourceBlobSha: 'd6c65cb86810634c55c8b9e65aef8e9b9ef439e8',
  controlName: 'overflow',
  settingKey: 'overflow',
  defaultCssVariableValue: 'visible',
  acceptedValues: ['hidden', 'auto'] as const,
});

export type P15ElementorContainerOverflowValue = 'hidden' | 'auto';

export interface P15ElementorContainerOverflowEntryV1 {
  sourceNodeId: string;
  overflow: P15ElementorContainerOverflowValue;
}

export interface P15ElementorContainerOverflowManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_OVERFLOW_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorContainerOverflowEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorContainerOverflowIssueCode =
  | 'P15_CONTAINER_OVERFLOW_SOURCE_IR_INVALID'
  | 'P15_CONTAINER_OVERFLOW_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_CONTAINER_OVERFLOW_MANIFEST_NOT_OBJECT'
  | 'P15_CONTAINER_OVERFLOW_MANIFEST_FIELDS_INVALID'
  | 'P15_CONTAINER_OVERFLOW_MANIFEST_VERSION_INVALID'
  | 'P15_CONTAINER_OVERFLOW_SOURCE_FINGERPRINT_INVALID'
  | 'P15_CONTAINER_OVERFLOW_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_CONTAINER_OVERFLOW_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_CONTAINER_OVERFLOW_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_CONTAINER_OVERFLOW_ENTRIES_INVALID'
  | 'P15_CONTAINER_OVERFLOW_ENTRY_INVALID'
  | 'P15_CONTAINER_OVERFLOW_DUPLICATE_SOURCE_ID'
  | 'P15_CONTAINER_OVERFLOW_SOURCE_NOT_CONTAINER'
  | 'P15_CONTAINER_OVERFLOW_VALUE_INVALID'
  | 'P15_CONTAINER_OVERFLOW_AUTHORITY_FLAGS_INVALID'
  | 'P15_CONTAINER_OVERFLOW_GENERATOR_BINDING_MISMATCH'
  | 'P15_CONTAINER_OVERFLOW_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_CONTAINER_OVERFLOW_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorContainerOverflowIssueV1 {
  code: P15ElementorContainerOverflowIssueCode;
  path: string;
  message: string;
}

export type P15ElementorContainerOverflowStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_CONTAINER_OVERFLOW_OVERRIDES'
  | 'CONTAINER_OVERFLOW_RESOLVED';

export interface P15ElementorContainerOverflowSummaryEntryV1 {
  sourceNodeId: string;
  overflow: P15ElementorContainerOverflowValue;
}

export interface P15ElementorContainerOverflowResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_OVERFLOW_RESULT_VERSION;
  status: P15ElementorContainerOverflowStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedOverflows: P15ElementorContainerOverflowSummaryEntryV1[];
  issues: P15ElementorContainerOverflowIssueV1[];
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

const EVIDENCE = P15_ELEMENTOR_CONTAINER_OVERFLOW_EVIDENCE;
const FAMILY = containerStyleFamily({
  id: 'container-overflow',
  issuePrefix: 'P15_CONTAINER_OVERFLOW',
  subject: 'Container overflow',
  manifestVersion: P15_ELEMENTOR_CONTAINER_OVERFLOW_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_CONTAINER_OVERFLOW_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_CONTAINER_OVERFLOW_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_CONTAINER_OVERFLOW_OVERRIDES', resolved: 'CONTAINER_OVERFLOW_RESOLVED' },
  summaryField: 'resolvedOverflows',
  fields: [{ field: 'overflow', codec: enumCodec(EVIDENCE.acceptedValues) }],
  checks: [{
    fields: ['overflow'],
    code: 'VALUE_INVALID',
    pathSuffix: '.overflow',
    message: 'Container overflow must be the explicit value hidden or auto.',
  }],
  entryEnvelopeMessage: 'Each Container overflow entry may contain only sourceNodeId and overflow.',
  messages: {
    notContainer: 'Container overflow sourceNodeId must identify an existing neutral Container node.',
  },
  bindingMissingMessage: (sourceNodeId) => `Generated Container binding missing for sourceNodeId ${sourceNodeId}.`,
  writes: (entry) => [
    { settingKey: EVIDENCE.settingKey, value: entry.overflow, conflictSubject: 'Container overflow', conflictMessage: 'Generated base candidate already contains a Container overflow setting.' },
  ],
});

/**
 * Apply only explicit Container overflow values to exact generated Container bindings.
 *
 * The accepted domain is deliberately narrower than arbitrary CSS overflow:
 * hidden | auto only. This contract does not infer layout/responsive behavior,
 * reset the default visible value, parse CSS/custom values, or claim compatibility/production authority.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-style.test.ts`.
 */
export function resolveP15ElementorContainerOverflow(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorContainerOverflowResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorContainerOverflowResultV1;
}

/** Serialize only sanitized overflow metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorContainerOverflowSummary(
  result: P15ElementorContainerOverflowResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
