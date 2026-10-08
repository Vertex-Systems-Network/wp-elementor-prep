import type { ValueCodec } from './codecs';

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

export interface FamilyEvidence {
  readonly elementorVersion: string;
  readonly [key: string]: string;
}

/** Parsing outcome for one manifest entry, after the engine's shared envelope checks. */
export type FamilyEntryParse<Entry> =
  | { ok: true; entry: Entry }
  | { ok: false; code: 'ENTRY_INVALID' | 'OVERRIDE_REQUIRED' | 'VALUE_INVALID'; message: string };

/** One setting write for an accepted entry; the engine refuses it when the key already exists. */
export interface FamilySettingWrite {
  settingKey: string;
  value: unknown;
  /** Device-qualified noun for the conflict message, e.g. "tablet gap". */
  conflictSubject: string;
}

export interface ContainerPropertyFamily<Entry extends { sourceNodeId: string }, Summary extends { sourceNodeId: string }> {
  /** Stable family id, e.g. `responsive-gap`; also the slug in the serializer error. */
  readonly id: string;
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
  /** Message for an entry that fails the shared record/keys/sourceNodeId envelope. */
  readonly entryEnvelopeMessage: string;
  /** Codecs this family encodes with, declared for inventory and capability reporting. */
  readonly codecs: readonly ValueCodec<unknown>[];
  parseEntry(raw: Record<string, unknown> & { sourceNodeId: string }): FamilyEntryParse<Entry>;
  writes(entry: Entry): FamilySettingWrite[];
  summarize(entry: Entry): Summary;
  validSummary(summary: Summary): boolean;
}
