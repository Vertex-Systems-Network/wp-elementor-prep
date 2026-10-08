import { enumCodec, type ValueCodec } from '../codecs';
import type { ContainerPropertyFamily, FamilyEvidence, FamilyMessageOverrides, FamilySettingWrite } from '../property-family';
import { exactKeys, isRecord, validSourceNodeId } from '../shared-validation';

/**
 * Responsive container layout families (recovery M1.3b): flex direction, wrap and alignment.
 * All three are "explicit enum per breakpoint" families, built from one factory.
 */

export interface EnumFieldSpec {
  /** Manifest/summary field, e.g. `tabletDirection`. */
  field: string;
  settingKey: string;
  codec: ValueCodec<string, string>;
  /** Neutral → Elementor value mapping (identity when omitted). */
  toElementor?: (value: string) => string;
  conflictSubject: string;
  conflictMessage?: string;
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
}

type EnumEntry = { sourceNodeId: string } & Record<string, unknown>;

export function responsiveEnumFamily(meta: ResponsiveEnumFamilyMeta): ContainerPropertyFamily<EnumEntry, EnumEntry> {
  const fieldNames = meta.fields.map((spec) => spec.field);
  const summaryKeys = ['sourceNodeId', ...fieldNames];
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
    entryKeys: summaryKeys,
    entryEnvelopeMessage: meta.entryEnvelopeMessage,
    ...(meta.issueCodes ? { issueCodes: meta.issueCodes } : {}),
    ...(meta.messages ? { messages: meta.messages } : {}),
    ...(meta.bindingIssuesLast ? { bindingIssuesLast: true } : {}),
    ...(meta.conflictMode ? { conflictMode: meta.conflictMode } : {}),
    codecs: [...new Set(meta.fields.map((spec) => spec.codec))],
    parseEntry(raw) {
      const provided = meta.fields.filter((spec) => raw[spec.field] !== undefined);
      if (provided.length === 0) return { ok: false, code: 'OVERRIDE_REQUIRED', message: meta.overrideRequiredMessage };
      if (provided.some((spec) => !spec.codec.is(raw[spec.field]))) {
        return { ok: false, code: 'VALUE_INVALID', message: meta.valueInvalidMessage };
      }
      const entry: EnumEntry = { sourceNodeId: raw.sourceNodeId };
      for (const spec of provided) entry[spec.field] = raw[spec.field];
      return { ok: true, entry };
    },
    writes(entry) {
      return meta.fields
        .filter((spec) => entry[spec.field] !== undefined)
        .map((spec): FamilySettingWrite => {
          const value = entry[spec.field] as string;
          return {
            settingKey: spec.settingKey,
            value: spec.toElementor ? spec.toElementor(value) : value,
            conflictSubject: spec.conflictSubject,
            ...(spec.conflictMessage ? { conflictMessage: spec.conflictMessage } : {}),
          };
        });
    },
    summarize(entry) {
      const summary: EnumEntry = { sourceNodeId: entry.sourceNodeId };
      for (const spec of meta.fields) summary[spec.field] = entry[spec.field] ?? null;
      return summary;
    },
    validSummary(entry) {
      return isRecord(entry)
        && exactKeys(entry, summaryKeys)
        && validSourceNodeId(entry.sourceNodeId)
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
