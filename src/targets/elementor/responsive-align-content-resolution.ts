import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import type {
  FamilyAuthorityFlag,
  FamilyIssueCode,
  FamilyIssueV1,
  FamilyManifestV1,
  FamilyResultV1,
  FamilyStatus,
} from './mapping-engine/contract-types';
import { enumCodec } from './mapping-engine/codecs';
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import type { FamilyEntryFailure } from './mapping-engine/property-family';
import {
  P15_ELEMENTOR_RESPONSIVE_WRAP_FAMILY,
  type P15ElementorResponsiveWrapSummaryEntryV1,
  type P15ElementorResponsiveWrapStatus,
} from './responsive-wrap-resolution';

export const P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION =
  'p15-elementor-responsive-align-content-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_RESULT_VERSION =
  'p15-elementor-responsive-align-content-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
  flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
  qunitFixturePath: 'tests/qunit/mock/elments/container.json',
  qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: 'flex',
  controlName: 'align_content',
  prerequisiteControlName: 'wrap',
  prerequisiteValue: 'wrap',
  desktopSettingKey: 'container_align_content',
  tabletSettingKey: 'container_align_content_tablet',
  mobileSettingKey: 'container_align_content_mobile',
  supportedValues: [
    'flex-start',
    'center',
    'flex-end',
    'space-between',
    'space-around',
    'space-evenly',
  ] as const,
});

export type P15ElementorResponsiveAlignContent =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export interface P15ElementorResponsiveAlignContentEntryV1 {
  sourceNodeId: string;
  tabletAlignContent?: P15ElementorResponsiveAlignContent;
  mobileAlignContent?: P15ElementorResponsiveAlignContent;
}

export interface P15ElementorResponsiveAlignContentSummaryEntryV1 {
  sourceNodeId: string;
  tabletAlignContent: P15ElementorResponsiveAlignContent | null;
  mobileAlignContent: P15ElementorResponsiveAlignContent | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_RESULT_VERSION;
  status: P15ElementorResponsiveAlignContentStatus;
  entriesField: 'containers';
  entry: P15ElementorResponsiveAlignContentEntryV1;
  summaryField: 'resolvedAlignContents';
  summary: P15ElementorResponsiveAlignContentSummaryEntryV1;
  issueCode: P15ElementorResponsiveAlignContentIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
  digestField: 'wrappedCandidateIdentityDigest';
  extra: { wrapPrerequisiteStatus: P15ElementorResponsiveWrapStatus | null };
};
export type P15ElementorResponsiveAlignContentManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveAlignContentIssueCode =
  FamilyIssueCode<'P15_RESPONSIVE_ALIGN_CONTENT', 'WRAP_PREREQUISITE_INVALID' | 'WRAPPED_CANDIDATE_IDENTITY_INVALID' | 'WRAPPED_CANDIDATE_IDENTITY_MISMATCH' | 'WRAP_REQUIRED'>;
export type P15ElementorResponsiveAlignContentIssueV1 = FamilyIssueV1<P15ElementorResponsiveAlignContentIssueCode>;
export type P15ElementorResponsiveAlignContentStatus = FamilyStatus<'NO_RESPONSIVE_ALIGN_CONTENT_OVERRIDES', 'RESPONSIVE_ALIGN_CONTENT_RESOLVED', 'BLOCKED_WRAP_PREREQUISITE'>;
export type P15ElementorResponsiveAlignContentResultV1 = FamilyResultV1<Contract>;

const alignContentCodec = enumCodec(P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE.supportedValues);

/** Elementor 4.2.4 conditions align_content on wrap=wrap: each breakpoint needs an explicit same-container wrap. */
function wrapPrerequisite(entry: { sourceNodeId: string } & Record<string, unknown>,
  prerequisite: Readonly<Record<string, unknown>>): FamilyEntryFailure[] {
  const wraps = prerequisite.resolvedWraps as readonly P15ElementorResponsiveWrapSummaryEntryV1[];
  const wrap = wraps.find((candidate) => candidate.sourceNodeId === entry.sourceNodeId) ?? null;
  const failures: FamilyEntryFailure[] = [];
  if (entry.tabletAlignContent !== undefined && wrap?.tabletWrap !== 'wrap') {
    failures.push({ code: 'WRAP_REQUIRED', pathSuffix: '.tabletAlignContent',
      message: 'Tablet align-content requires an explicit tabletWrap="wrap" prerequisite on the same container.' });
  }
  if (entry.mobileAlignContent !== undefined && wrap?.mobileWrap !== 'wrap') {
    failures.push({ code: 'WRAP_REQUIRED', pathSuffix: '.mobileAlignContent',
      message: 'Mobile align-content requires an explicit mobileWrap="wrap" prerequisite on the same container.' });
  }
  return failures;
}

const P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_FAMILY = responsiveEnumFamily({
  id: 'responsive-align-content',
  issuePrefix: 'P15_RESPONSIVE_ALIGN_CONTENT',
  subject: 'Responsive align-content',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MAX_ENTRIES,
  evidence: P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_ALIGN_CONTENT_OVERRIDES', resolved: 'RESPONSIVE_ALIGN_CONTENT_RESOLVED' },
  summaryField: 'resolvedAlignContents',
  fields: [
    { field: 'tabletAlignContent', settingKey: P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE.tabletSettingKey, codec: alignContentCodec,
      conflictSubject: 'tablet align-content', conflictMessage: 'Wrapped candidate already contains a tablet align-content override.' },
    { field: 'mobileAlignContent', settingKey: P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE.mobileSettingKey, codec: alignContentCodec,
      conflictSubject: 'mobile align-content', conflictMessage: 'Wrapped candidate already contains a mobile align-content override.' },
  ],
  entryEnvelopeMessage: 'Each responsive align-content entry may contain only sourceNodeId plus tablet/mobile align-content overrides.',
  overrideRequiredMessage: 'Each responsive align-content entry must explicitly provide tabletAlignContent and/or mobileAlignContent.',
  valueInvalidMessage: 'Responsive align-content value is not supported by the exact Elementor 4.2.4 control.',
  extraIssueSuffixes: ['WRAP_REQUIRED'],
  bindingIssuesLast: true,
  chain: {
    prerequisite: P15_ELEMENTOR_RESPONSIVE_WRAP_FAMILY,
    statusField: 'wrapPrerequisiteStatus',
    digestField: 'wrappedCandidateIdentityDigest',
    digestIssueStem: 'WRAPPED_CANDIDATE_IDENTITY',
    baseNoun: 'wrapped candidate',
    blockedStatus: 'BLOCKED_WRAP_PREREQUISITE',
    blockedSuffix: 'WRAP_PREREQUISITE_INVALID',
    blockedPath: '$wrapManifest',
    blockedMessage: 'Align-content resolution requires a valid exact responsive-wrap prerequisite result.',
  },
  prerequisiteCheck: wrapPrerequisite,
});

/**
 * Apply explicit responsive align-content overrides only on top of the exact #576 wrap result.
 *
 * Elementor 4.2.4 conditions align_content on wrap=wrap. This resolver therefore requires an
 * explicit same-container, same-breakpoint wrap value of "wrap"; it never infers wrap inheritance
 * or promotes nowrap/missing wrap state. Re-expressed as a chained engine family (recovery M1.5b);
 * every output is proven identical to the original resolver by `tests/m1-chained-family-golden.test.ts`.
 */
export function resolveP15ElementorResponsiveContainerAlignContent(
  sourceValue: unknown,
  wrapManifestValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveAlignContentResultV1 {
  return resolveContainerPropertyFamily(P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_FAMILY, sourceValue, manifestValue,
    wrapManifestValue) as unknown as P15ElementorResponsiveAlignContentResultV1;
}

/** Serialize only sanitized responsive metadata; source text, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveAlignContentSummary(
  result: P15ElementorResponsiveAlignContentResultV1,
): string {
  return serializeContainerPropertyFamilySummary(P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_FAMILY, result as unknown as ContainerFamilyResult);
}
