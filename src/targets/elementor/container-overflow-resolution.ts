import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { enumCodec } from './mapping-engine/codecs';
import { containerStyleFamily } from './mapping-engine/families/container-style';

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

export interface P15ElementorContainerOverflowSummaryEntryV1 {
  sourceNodeId: string;
  overflow: P15ElementorContainerOverflowValue;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_OVERFLOW_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_OVERFLOW_RESULT_VERSION;
  status: P15ElementorContainerOverflowStatus;
  entriesField: 'containers';
  entry: P15ElementorContainerOverflowEntryV1;
  summaryField: 'resolvedOverflows';
  summary: P15ElementorContainerOverflowSummaryEntryV1;
  issueCode: P15ElementorContainerOverflowIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorContainerOverflowManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorContainerOverflowIssueCode =
  FamilyIssueCode<'P15_CONTAINER_OVERFLOW'>;
export type P15ElementorContainerOverflowIssueV1 = FamilyIssueV1<P15ElementorContainerOverflowIssueCode>;
export type P15ElementorContainerOverflowStatus = FamilyStatus<'NO_CONTAINER_OVERFLOW_OVERRIDES', 'CONTAINER_OVERFLOW_RESOLVED'>;
export type P15ElementorContainerOverflowResultV1 = FamilyResultV1<Contract>;

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

const API = familyApi<P15ElementorContainerOverflowResultV1>(FAMILY);

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
export function resolveP15ElementorContainerOverflow(sourceValue: unknown, manifestValue: unknown): P15ElementorContainerOverflowResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized overflow metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorContainerOverflowSummary(result: P15ElementorContainerOverflowResultV1): string {
  return API.serialize(result);
}
