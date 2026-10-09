import { dimensionsBoxCodec, type BoxPx, type PxRange, type ValueCodec } from '../codecs';
import type {
  ContainerPropertyFamily,
  FamilyEvidence,
  FamilyMessageOverrides,
  FamilySettingWrite,
} from '../property-family';
import { exactKeys, hasOwn, isRecord, onlyAllowedKeys, validSourceNodeId } from '../shared-validation';

/**
 * Container style families (recovery M1.3d): explicit, non-inferred container style settings such as
 * border style, background/overlay colour, overflow and semantic tag. One entry carries named fields;
 * each field is validated by an ordered check, then the family emits its Elementor setting writes.
 */
export type StyleEntry = { sourceNodeId: string } & Record<string, unknown>;

export interface StyleEntryField {
  field: string;
  codec: ValueCodec<unknown>;
  /** Optional fields are validated only when present and copied only when defined. */
  optional?: boolean;
}

/** One ordered validation step; the first failing step rejects the entry with its issue. */
export interface StyleCheck {
  fields: readonly string[];
  /** Issue suffix, e.g. `VALUE_INVALID` or a family-specific `COLOR_INVALID`. */
  code: string;
  pathSuffix: string;
  message: string;
}

export interface ContainerStyleFamilyMeta {
  id: string;
  issuePrefix: string;
  subject: string;
  manifestVersion: string;
  resultVersion: string;
  maxEntries: number;
  evidence: FamilyEvidence;
  statuses: { none: string; resolved: string };
  summaryField: string;
  /** Entry fields in contract (entry/summary key) order. */
  fields: readonly StyleEntryField[];
  checks: readonly StyleCheck[];
  entryEnvelopeMessage: string;
  /** Required fields must also be present for the shared envelope (exact-entry contracts). */
  envelopeRequiresFields?: boolean;
  leadingAuthorityFlags?: readonly string[];
  extraIssueSuffixes?: readonly string[];
  messages?: FamilyMessageOverrides;
  bindingMissingMessage?: (sourceNodeId: string) => string;
  writes: (entry: StyleEntry) => FamilySettingWrite[];
}

export function containerStyleFamily(meta: ContainerStyleFamilyMeta): ContainerPropertyFamily<StyleEntry, StyleEntry> {
  const byName = new Map(meta.fields.map((spec) => [spec.field, spec]));
  const entryKeys = ['sourceNodeId', ...meta.fields.map((spec) => spec.field)];
  const required = meta.fields.filter((spec) => !spec.optional);
  const invalid = (raw: Record<string, unknown>, field: string): boolean => {
    const spec = byName.get(field);
    if (!spec) throw new Error(`Unknown container style field ${field}.`);
    return spec.optional ? hasOwn(raw, field) && !spec.codec.is(raw[field]) : !spec.codec.is(raw[field]);
  };
  const snapshot = (source: Record<string, unknown> & { sourceNodeId: string }): StyleEntry => {
    const entry: StyleEntry = { sourceNodeId: source.sourceNodeId };
    for (const spec of meta.fields) {
      if (source[spec.field] === undefined) continue;
      entry[spec.field] = spec.codec.snapshot(source[spec.field]);
    }
    return entry;
  };
  return {
    id: meta.id,
    issuePrefix: meta.issuePrefix,
    subject: meta.subject,
    manifestVersion: meta.manifestVersion,
    resultVersion: meta.resultVersion,
    maxEntries: meta.maxEntries,
    evidence: meta.evidence,
    statuses: meta.statuses,
    summaryField: meta.summaryField,
    entryKeys,
    ...(meta.envelopeRequiresFields ? { requiredEntryKeys: required.map((spec) => spec.field) } : {}),
    ...(meta.leadingAuthorityFlags ? { leadingAuthorityFlags: meta.leadingAuthorityFlags } : {}),
    entryEnvelopeMessage: meta.entryEnvelopeMessage,
    ...(meta.messages ? { messages: meta.messages } : {}),
    ...(meta.extraIssueSuffixes ? { extraIssueSuffixes: meta.extraIssueSuffixes } : {}),
    ...(meta.bindingMissingMessage ? { bindingMissingMessage: meta.bindingMissingMessage } : {}),
    codecs: [...new Set(meta.fields.map((spec) => spec.codec))],
    parseEntry(raw) {
      for (const check of meta.checks) {
        if (check.fields.some((field) => invalid(raw, field))) {
          return { ok: false, code: check.code, message: check.message, pathSuffix: check.pathSuffix };
        }
      }
      return { ok: true, entry: snapshot(raw) };
    },
    writes: meta.writes,
    summarize: snapshot,
    validSummary(entry) {
      return isRecord(entry)
        && onlyAllowedKeys(entry, entryKeys)
        && validSourceNodeId(entry.sourceNodeId)
        && meta.fields.every((spec) => !invalid(entry, spec.field));
    },
  };
}

/**
 * Exact integer top/right/bottom/left px box (border widths). The snapshot keeps the manifest's own
 * key order, as the original border contracts copied the object verbatim.
 */
export function intDimensionsBoxCodec(range: PxRange): ValueCodec<BoxPx> {
  const box = dimensionsBoxCodec(range);
  return {
    id: `int-dimensions-box:${range.min}..${range.max}`,
    is: (value): value is BoxPx => isRecord(value)
      && exactKeys(value, ['bottom', 'left', 'right', 'top'])
      && [value.top, value.right, value.bottom, value.left].every((side) => typeof side === 'number'
        && Number.isInteger(side)
        && Number.isFinite(side)
        && side >= range.min
        && side <= range.max),
    snapshot: (value) => ({ ...value }),
    encode: box.encode,
  };
}
