import type { ValueCodec } from './codecs';
import type { P15NeutralExportDocumentV1 } from '../neutral-export-ir';
import type { ElementorTemplateV04 } from '../template-v04';

/**
 * Declarative description of one Elementor property family (for example responsive container gap).
 *
 * A family is data, not a new resolver: the shared engine owns manifest validation, authority
 * flags, source/base binding, conflict detection, candidate rebuild and summary serialisation.
 * A family supplies only its identity, Elementor evidence, entry parsing, setting writes and
 * summary shape. This is the "table row" that replaces a ~700-line per-family resolver.
 */
export type ElementorDevice = 'desktop' | 'tablet' | 'mobile';

/** Elementor 3/4 responsive control suffix convention: desktop has none. */
export function responsiveSettingKey(baseKey: string, device: ElementorDevice): string {
  return device === 'desktop' ? baseKey : `${baseKey}_${device}`;
}

/** Exact Elementor source evidence for a family (paths, blob SHAs, setting keys, accepted ranges). */
export interface FamilyEvidence {
  readonly elementorVersion: string;
  readonly [key: string]: unknown;
}

/** One refusal of a manifest entry, after the engine's shared envelope checks. */
export interface FamilyEntryFailure {
  /** Issue suffix: a shared one, or one listed in the family's `extraIssueSuffixes`. */
  code: 'ENTRY_INVALID' | 'OVERRIDE_REQUIRED' | 'VALUE_INVALID' | string;
  message: string;
  /** Appended to the entry path, e.g. `.contentWidthMode`. */
  pathSuffix?: string;
}

/** Parsing outcome for one manifest entry: accepted, or refused with one or several issues. */
export type FamilyEntryParse<Entry> =
  | { ok: true; entry: Entry }
  | ({ ok: false } & FamilyEntryFailure)
  | { ok: false; failures: readonly FamilyEntryFailure[] };

/**
 * A chained family binds to another family's resolved candidate instead of the generated base, for
 * example align-content on the exact responsive-wrap result. The engine resolves the prerequisite
 * family first, blocks unless it is ready, binds the manifest to the prerequisite's resolved
 * candidate digest, writes on top of that candidate and passes the prerequisite result to `parseEntry`.
 */
export interface FamilyChain {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly prerequisite: ContainerPropertyFamily<any, any>;
  /** Result field reporting the prerequisite status, right after `status`. */
  readonly statusField: string;
  /** Manifest/result field that replaces `baseCandidateIdentityDigest`, e.g. `wrappedCandidateIdentityDigest`. */
  readonly digestField: string;
  /** Issue suffix stem for that digest, e.g. `WRAPPED_CANDIDATE_IDENTITY` (→ `_INVALID` / `_MISMATCH`). */
  readonly digestIssueStem: string;
  /** Noun in the digest mismatch message, e.g. `wrapped candidate`. */
  readonly baseNoun: string;
  /** Status, issue suffix, path and message when the prerequisite is not ready. */
  readonly blockedStatus: string;
  readonly blockedSuffix: string;
  readonly blockedPath: string;
  readonly blockedMessage: string;
}

/** One setting write for an accepted entry; the engine refuses it when the key already exists. */
export interface FamilySettingWrite {
  settingKey: string;
  value: unknown;
  /** Device-qualified noun for the conflict message, e.g. "tablet gap". */
  conflictSubject: string;
  /** Full conflict message, when the family's contract words it differently. */
  conflictMessage?: string;
  /** Conflict reporting order when it differs from write order (lower first; default write order). */
  conflictRank?: number;
  /** False for an enabling write (e.g. `content_width`) that the contract sets without a conflict check. */
  checkConflict?: boolean;
}

/** Refusal of a bound target's existing settings before any write (e.g. a content_width condition). */
export interface FamilyPreconditionFailure {
  code: string;
  message: string;
}

/** Engine message keys a family may word differently from the subject-derived defaults. */
export interface FamilyMessageOverrides {
  readonly duplicate?: string;
  readonly notContainer?: string;
  readonly resolvedInvalid?: string;
  readonly upstream?: string;
  readonly entriesInvalid?: string;
  /** Subject of the three manifest-shape messages, when it differs from the family subject. */
  readonly manifestSubject?: string;
  readonly authority?: string;
}

/** A node binding the engine writes settings into. */
export interface FamilyBoundTarget {
  settings: unknown;
}

/**
 * What a family binds to: generated containers (the default) or one widget kind. The target owns the
 * manifest array field, the result count fields, source collection and generated-tree binding.
 */
export interface FamilyTarget {
  /** Manifest array field, e.g. `containers`, `headings`, `widgets`. */
  readonly entriesField: string;
  /** Result count fields, e.g. `sourceContainerCount` / `resolvedContainerCount`. */
  readonly sourceCountField: string;
  readonly resolvedCountField: string;
  /** Issue suffix for an entry whose node is not of this target kind, e.g. `SOURCE_NOT_HEADING`. */
  readonly notTargetSuffix: string;
  notTargetMessage(subject: string): string;
  collect(source: P15NeutralExportDocumentV1): ReadonlyMap<string, unknown>;
  bind(source: P15NeutralExportDocumentV1, template: ElementorTemplateV04): {
    targets: ReadonlyMap<string, FamilyBoundTarget>;
    issues: ReadonlyArray<{ path: string; message: string }>;
  };
  bindingMissingMessage(sourceNodeId: string): string;
}

export interface ContainerPropertyFamily<Entry extends { sourceNodeId: string }, Summary extends { sourceNodeId: string }> {
  /** Stable family id, e.g. `responsive-gap`; also the slug in the serializer error. */
  readonly id: string;
  /** Slug in the serializer refusal when the contract names it differently from `id` (a copied name). */
  readonly serializerId?: string;
  /** Bound target kind; defaults to generated containers. */
  readonly target?: FamilyTarget;
  /** Base on another family's resolved candidate instead of the generated base. */
  readonly chain?: FamilyChain;
  /** Issue code prefix, e.g. `P15_RESPONSIVE_GAP`. */
  readonly issuePrefix: string;
  /** Sentence-case subject used in shared messages, e.g. `Responsive gap`. */
  readonly subject: string;
  readonly manifestVersion: string;
  readonly resultVersion: string;
  readonly maxEntries: number;
  readonly evidence: FamilyEvidence;
  readonly statuses: { readonly none: string; readonly resolved: string };
  /** Result field holding the sorted summaries, e.g. `resolvedGaps`. */
  readonly summaryField: string;
  /** Allowed entry keys including `sourceNodeId`. */
  readonly entryKeys: readonly string[];
  /** Entry keys the shared envelope additionally requires to be present (own properties). */
  readonly requiredEntryKeys?: readonly string[];
  /** Family-specific authority flags placed before the shared ones (e.g. `styleInferencePerformed`). */
  readonly leadingAuthorityFlags?: readonly string[];
  /** Shared authority flags this family's contract does not carry (e.g. `responsiveClosureClaim`). */
  readonly omittedAuthorityFlags?: readonly string[];
  /** The complete authority flag list in contract order, when it interleaves family flags with shared ones. */
  readonly authorityFlags?: readonly string[];
  /** Binding-missing message, when the contract words it differently from the shared default. */
  bindingMissingMessage?(sourceNodeId: string): string;
  /** Message for an entry that fails the shared record/keys/sourceNodeId envelope. */
  readonly entryEnvelopeMessage: string;
  /** Per-suffix full issue codes that differ from `${issuePrefix}_${suffix}` (e.g. a value code). */
  readonly issueCodes?: Readonly<Partial<Record<string, string>>>;
  readonly messages?: FamilyMessageOverrides;
  /** Report binding-missing issues after conflict issues (the order some resolvers used). */
  readonly bindingIssuesLast?: boolean;
  /** `first` (default): one conflict issue per entry; `all`: one issue per conflicting key. */
  readonly conflictMode?: 'first' | 'all';
  /** Family-specific issue suffixes beyond the shared set (e.g. `CONDITION_MISMATCH`). */
  readonly extraIssueSuffixes?: readonly string[];
  /**
   * Replaces per-write conflict detection: returns the conflict message for a bound target's existing
   * settings (e.g. any key of a whole Elementor group such as `typography_*`), or null when it is free.
   */
  conflictScan?(settings: Record<string, unknown>): string | null;
  /** Checked on each bound target before conflicts and writes. */
  precondition?(settings: Record<string, unknown>): FamilyPreconditionFailure | null;
  /** Codecs this family encodes with, declared for inventory and capability reporting. */
  readonly codecs: readonly ValueCodec<unknown>[];
  /** `node` is the collected neutral source node; `prerequisite` is the chained prerequisite result, if any. */
  parseEntry(raw: Record<string, unknown> & { sourceNodeId: string }, node: unknown,
    prerequisite?: Readonly<Record<string, unknown>>): FamilyEntryParse<Entry>;
  writes(entry: Entry): FamilySettingWrite[];
  summarize(entry: Entry, node?: unknown): Summary;
  validSummary(summary: Summary): boolean;
}
