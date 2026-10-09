import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { directionCodec, GENERIC_RESPONSIVE_MESSAGES, responsiveEnumFamily } from './mapping-engine/families/responsive-layout';

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

export interface P15ElementorResponsiveDirectionSummaryEntryV1 {
  sourceNodeId: string;
  tabletDirection: P15ElementorResponsiveDirection | null;
  mobileDirection: P15ElementorResponsiveDirection | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_DIRECTION_RESULT_VERSION;
  status: P15ElementorResponsiveDirectionStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveDirectionEntryV1;
  summaryField: 'resolvedDirections';
  summary: P15ElementorResponsiveDirectionSummaryEntryV1;
  issueCode: P15ElementorResponsiveDirectionIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorResponsiveDirectionManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveDirectionIssueCode = FamilyIssueCode<'P15_RESPONSIVE', 'DIRECTION_INVALID'>;
export type P15ElementorResponsiveDirectionIssueV1 = FamilyIssueV1<P15ElementorResponsiveDirectionIssueCode>;
export type P15ElementorResponsiveDirectionStatus = FamilyStatus<'NO_RESPONSIVE_OVERRIDES', 'RESPONSIVE_DIRECTIONS_RESOLVED'>;
export type P15ElementorResponsiveDirectionResultV1 = FamilyResultV1<Contract>;

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

const API = familyApi<P15ElementorResponsiveDirectionResultV1>(P15_ELEMENTOR_RESPONSIVE_DIRECTION_FAMILY);

/**
 * Apply explicit tablet/mobile direction overrides to exact generated container bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden.test.ts`.
 * The contract never infers responsive values, never changes desktop settings and claims no closure.
 */
export function resolveP15ElementorResponsiveContainerDirections(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveDirectionResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized direction metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveDirectionSummary(result: P15ElementorResponsiveDirectionResultV1): string {
  return API.serialize(result);
}
