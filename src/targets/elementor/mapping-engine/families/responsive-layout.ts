import { enumCodec, type ValueCodec } from '../codecs';
import type {
  ContainerPropertyFamily,
  FamilyChain,
  FamilyEntryFailure,
  FamilyEvidence,
  FamilyMessageOverrides,
  FamilyPreconditionFailure,
  FamilySettingWrite,
  FamilyTarget,
} from '../property-family';
import { exactKeys, isRecord, validSourceNodeId } from '../shared-validation';

/**
 * Responsive container layout families (recovery M1.3b): flex direction, wrap and alignment.
 * All three are "explicit enum per breakpoint" families, built from one factory.
 */

export interface EnumFieldSpec {
  /** Manifest/summary field, e.g. `tabletDirection`. */
  field: string;
  settingKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  codec: ValueCodec<any, any>;
  /** Neutral → Elementor value mapping (identity when omitted). */
  toElementor?: (value: never) => unknown;
  conflictSubject: string;
  conflictMessage?: string;
}

/** A field every entry must carry with an exact value, checked before override/value checks. */
export interface RequiredEntryField {
  field: string;
  value: unknown;
  code: string;
  message: string;
}

export interface ResponsiveEnumFamilyMeta {
  id: string;
  issuePrefix: string;
  subject: string;
  manifestVersion: string;
  resultVersion: string;
  maxEntries: number;
  evidence: FamilyEvidence;
  statuses: { none: string; resolved: string };
  summaryField: string;
  /** Fields in contract order: conflict checks, writes and summary keys follow this order. */
  fields: readonly EnumFieldSpec[];
  entryEnvelopeMessage: string;
  overrideRequiredMessage: string;
  valueInvalidMessage: string;
  issueCodes?: Readonly<Partial<Record<string, string>>>;
  messages?: FamilyMessageOverrides;
  bindingIssuesLast?: boolean;
  conflictMode?: 'first' | 'all';
  /** Fields that must be provided together (type + value pairs); a mismatch is VALUE_INVALID. */
  pairs?: ReadonlyArray<readonly [string, string]>;
  requiredEntryFields?: readonly RequiredEntryField[];
  /** Enabling writes emitted before the field writes, without a conflict check. */
  leadingWrites?: ReadonlyArray<{ settingKey: string; value: unknown }>;
  extraIssueSuffixes?: readonly string[];
  precondition?: (settings: Record<string, unknown>) => FamilyPreconditionFailure | null;
  /** Bound target kind (default: generated containers). */
  target?: FamilyTarget;
  /** Base on a prerequisite family's resolved candidate (e.g. align-content on wrap). */
  chain?: FamilyChain;
  /** Checked after value validation against the chained prerequisite result; any failure refuses the entry. */
  prerequisiteCheck?: (entry: EnumEntry, prerequisite: Readonly<Record<string, unknown>>) => FamilyEntryFailure[];
  leadingAuthorityFlags?: readonly string[];
  omittedAuthorityFlags?: readonly string[];
  serializerId?: string;
}

export type EnumEntry = { sourceNodeId: string } & Record<string, unknown>;

/** Explicit per-breakpoint field family; the factory behind every scalar/enum responsive family. */
export function responsiveEnumFamily(meta: ResponsiveEnumFamilyMeta): ContainerPropertyFamily<EnumEntry, EnumEntry> {
  const fieldNames = meta.fields.map((spec) => spec.field);
  const required = meta.requiredEntryFields ?? [];
  const summaryKeys = ['sourceNodeId', ...required.map((spec) => spec.field), ...fieldNames];
  return {
    id: meta.id,
    ...(meta.target ? { target: meta.target } : {}),
    ...(meta.chain ? { chain: meta.chain } : {}),
    ...(meta.leadingAuthorityFlags ? { leadingAuthorityFlags: meta.leadingAuthorityFlags } : {}),
    ...(meta.omittedAuthorityFlags ? { omittedAuthorityFlags: meta.omittedAuthorityFlags } : {}),
    ...(meta.serializerId ? { serializerId: meta.serializerId } : {}),
    issuePrefix: meta.issuePrefix,
    subject: meta.subject,
    manifestVersion: meta.manifestVersion,
    resultVersion: meta.resultVersion,
    maxEntries: meta.maxEntries,
    evidence: meta.evidence,
    statuses: meta.statuses,
    summaryField: meta.summaryField,
    entryKeys: summaryKeys,
    entryEnvelopeMessage: meta.entryEnvelopeMessage,
    ...(meta.issueCodes ? { issueCodes: meta.issueCodes } : {}),
    ...(meta.messages ? { messages: meta.messages } : {}),
    ...(meta.bindingIssuesLast ? { bindingIssuesLast: true } : {}),
    ...(meta.conflictMode ? { conflictMode: meta.conflictMode } : {}),
    ...(meta.extraIssueSuffixes ? { extraIssueSuffixes: meta.extraIssueSuffixes } : {}),
    ...(meta.precondition ? { precondition: meta.precondition } : {}),
    codecs: [...new Set(meta.fields.map((spec) => spec.codec))],
    parseEntry(raw, _node, prerequisite) {
      for (const spec of required) {
        if (raw[spec.field] !== spec.value) return { ok: false, code: spec.code, message: spec.message, pathSuffix: `.${spec.field}` };
      }
      const provided = meta.fields.filter((spec) => raw[spec.field] !== undefined);
      if (provided.length === 0) return { ok: false, code: 'OVERRIDE_REQUIRED', message: meta.overrideRequiredMessage };
      const unpaired = (meta.pairs ?? []).some(([left, right]) => (raw[left] !== undefined) !== (raw[right] !== undefined));
      if (provided.some((spec) => !spec.codec.is(raw[spec.field])) || unpaired) {
        return { ok: false, code: 'VALUE_INVALID', message: meta.valueInvalidMessage };
      }
      const entry: EnumEntry = { sourceNodeId: raw.sourceNodeId };
      for (const spec of required) entry[spec.field] = spec.value;
      for (const spec of provided) entry[spec.field] = raw[spec.field];
      const failures = meta.prerequisiteCheck && prerequisite ? meta.prerequisiteCheck(entry, prerequisite) : [];
      if (failures.length > 0) return { ok: false, failures };
      return { ok: true, entry };
    },
    writes(entry) {
      const leading = (meta.leadingWrites ?? []).map((write): FamilySettingWrite => ({
        settingKey: write.settingKey,
        value: write.value,
        conflictSubject: write.settingKey,
        checkConflict: false,
      }));
      return [...leading, ...meta.fields
        .filter((spec) => entry[spec.field] !== undefined)
        .map((spec): FamilySettingWrite => {
          const value = entry[spec.field] as never;
          return {
            settingKey: spec.settingKey,
            value: spec.toElementor ? spec.toElementor(value) : value,
            conflictSubject: spec.conflictSubject,
            ...(spec.conflictMessage ? { conflictMessage: spec.conflictMessage } : {}),
          };
        })];
    },
    summarize(entry) {
      const summary: EnumEntry = { sourceNodeId: entry.sourceNodeId };
      for (const spec of required) summary[spec.field] = spec.value;
      for (const spec of meta.fields) summary[spec.field] = entry[spec.field] ?? null;
      return summary;
    },
    validSummary(entry) {
      return isRecord(entry)
        && exactKeys(entry, summaryKeys)
        && validSourceNodeId(entry.sourceNodeId)
        && required.every((spec) => entry[spec.field] === spec.value)
        && meta.fields.every((spec) => entry[spec.field] === null || spec.codec.is(entry[spec.field]))
        && meta.fields.some((spec) => entry[spec.field] !== null);
    },
  };
}

// ---------------------------------------------------------------- shared vocabularies

export const directionCodec = enumCodec(['row', 'column', 'row-reverse', 'column-reverse'] as const);
export const wrapCodec = enumCodec(['nowrap', 'wrap'] as const);
export const crossAlignmentCodec = enumCodec(['start', 'center', 'end', 'stretch'] as const);
export const justificationCodec = enumCodec(['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'] as const);

/** Neutral `start`/`end` → Elementor flex `flex-start`/`flex-end`; other values pass through. */
export function toElementorFlexAlignment(value: string): string {
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  return value;
}

/** Generic "Responsive …" wording used by the direction/wrap contracts for shared checks. */
export const GENERIC_RESPONSIVE_MESSAGES: FamilyMessageOverrides = {
  duplicate: 'Responsive sourceNodeId must be unique.',
  notContainer: 'Responsive sourceNodeId must identify an existing neutral container node.',
  resolvedInvalid: 'Responsive override output did not rebuild into a canonical ready Elementor candidate.',
};
