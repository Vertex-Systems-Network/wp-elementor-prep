import type { ElementorTemplateCandidateArtifactV1 } from '../candidate-artifact';
import type { ElementorTemplateV04 } from '../template-v04';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
  type IssueSuffix,
  type MANIFEST_AUTHORITY_FLAGS,
} from './container-family-engine';
import type { ContainerPropertyFamily } from './property-family';

/**
 * Generic public contract types for engine families (recovery M1.8).
 *
 * Every engine family publishes the same manifest and result envelope; only the version strings,
 * statuses, entry/summary shapes, issue-code prefix, counted noun and authority flags differ. Families
 * declare those few parameters and alias these types under their existing exported names, instead of
 * repeating ~90 lines of hand-written interfaces each. Runtime behaviour is untouched: these are types.
 */
export type SharedAuthorityFlag = typeof MANIFEST_AUTHORITY_FLAGS[number];

/** A family's authority flags: its own leading flags plus the shared ones it carries. */
export type FamilyAuthorityFlag<Leading extends string = never, Omitted extends SharedAuthorityFlag = never> =
  | Leading
  | Exclude<SharedAuthorityFlag, Omitted>;

/** Issue codes `${prefix}_${suffix}`: the shared suffixes plus the family's own (e.g. its `SOURCE_NOT_*`). */
export type FamilyIssueCode<Prefix extends string, Extra extends string = never> = `${Prefix}_${IssueSuffix | Extra}`;

export interface FamilyIssueV1<Code extends string = string> {
  code: Code;
  path: string;
  message: string;
}

/** Statuses: the shared refusals (a chained family names its own blocked status) plus none/resolved. */
export type FamilyStatus<None extends string, Resolved extends string, Blocked extends string = 'BLOCKED_UPSTREAM_GENERATION'> =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | Blocked
  | 'REJECTED_INVALID_MANIFEST'
  | None
  | Resolved;

/** The parameters that distinguish one family's public contract. */
export interface FamilyContract {
  manifestVersion: string;
  resultVersion: string;
  status: string;
  /** Manifest array field, e.g. `containers` or `buttons`. */
  entriesField: string;
  entry: unknown;
  /** Result field holding the sorted summaries, e.g. `resolvedGaps`. */
  summaryField: string;
  summary: unknown;
  issueCode: string;
  /** Counted noun: `Container` gives `sourceContainerCount` / `resolvedContainerCount`. */
  noun: string;
  flags: string;
  /** Base digest field; a chained family names its prerequisite's digest. */
  digestField?: string;
  /** Extra result fields, e.g. a chained family's prerequisite status. */
  extra?: object;
}

type DigestField<C extends FamilyContract> = C['digestField'] extends string ? C['digestField'] : 'baseCandidateIdentityDigest';
type Extra<C extends FamilyContract> = C['extra'] extends object ? C['extra'] : unknown;

export type FamilyManifestV1<C extends FamilyContract> = {
  schemaVersion: 1;
  manifestVersion: C['manifestVersion'];
  sourceIrFingerprint: string;
} & Record<DigestField<C>, string> & Record<C['entriesField'], C['entry'][]> & Record<C['flags'], false>;

export type FamilyResultV1<C extends FamilyContract> = {
  schemaVersion: 1;
  resultVersion: C['resultVersion'];
  status: C['status'];
  sourceIrFingerprint: string | null;
  resolvedCandidateIdentityDigest: string | null;
  issues: FamilyIssueV1<C['issueCode']>[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  internalReviewRequired: true;
} & Record<DigestField<C>, string | null>
  & Record<`source${C['noun']}Count` | `resolved${C['noun']}Count`, number>
  & Record<C['summaryField'], C['summary'][]>
  & Record<C['flags'], false>
  & Extra<C>;

/** The typed resolve/serialize pair every non-chained engine family exports. */
export function familyApi<Result, Entry extends { sourceNodeId: string } = { sourceNodeId: string },
  Summary extends { sourceNodeId: string } = { sourceNodeId: string }>(family: ContainerPropertyFamily<Entry, Summary>): {
  resolve(sourceValue: unknown, manifestValue: unknown): Result;
  serialize(result: Result): string;
} {
  return {
    resolve: (sourceValue, manifestValue) => resolveContainerPropertyFamily(family, sourceValue, manifestValue) as unknown as Result,
    serialize: (result) => serializeContainerPropertyFamilySummary(family, result as unknown as ContainerFamilyResult),
  };
}
