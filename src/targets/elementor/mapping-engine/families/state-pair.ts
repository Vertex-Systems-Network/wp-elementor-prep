import type { ValueCodec } from '../codecs';
import type { ContainerPropertyFamily, FamilyEvidence, FamilySettingWrite } from '../property-family';
import { isRecord, onlyAllowedKeys, validSourceNodeId } from '../shared-validation';

/**
 * Normal/hover pair families (recovery M1.5c): one entry carries an optional `normal` and an optional
 * `hover` value of the same shape, and each state writes its own Elementor control group (for example
 * `box_shadow` / `box_shadow_hover`, or `background` / `background_hover`). Container box shadow and
 * the linear and radial container gradients are built from this one factory.
 */
export const PAIR_STATES = ['normal', 'hover'] as const;
export type PairState = typeof PAIR_STATES[number];

export type PairEntry<Value> = { sourceNodeId: string; normal?: Value; hover?: Value };

export interface StatePairFamilyMeta<Value> {
  id: string;
  issuePrefix: string;
  subject: string;
  manifestVersion: string;
  resultVersion: string;
  maxEntries: number;
  evidence: FamilyEvidence;
  statuses: { none: string; resolved: string };
  summaryField: string;
  /** Family-specific authority flags placed before the shared ones (e.g. `gradientInferencePerformed`). */
  leadingAuthorityFlags: readonly string[];
  /** Validates and snapshots one state value. */
  codec: ValueCodec<Value, unknown>;
  /** The settings one state writes, in write order. */
  settings(value: Value, state: PairState): ReadonlyArray<readonly [string, unknown]>;
  entryEnvelopeMessage: string;
  overrideRequiredMessage: string;
  valueInvalidMessage: string;
}

export function statePairFamily<Value>(meta: StatePairFamilyMeta<Value>): ContainerPropertyFamily<PairEntry<Value>, PairEntry<Value>> {
  const snapshot = (entry: PairEntry<Value>): PairEntry<Value> => ({
    sourceNodeId: entry.sourceNodeId,
    ...(entry.normal === undefined ? {} : { normal: meta.codec.snapshot(entry.normal) as Value }),
    ...(entry.hover === undefined ? {} : { hover: meta.codec.snapshot(entry.hover) as Value }),
  });
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
    entryKeys: ['sourceNodeId', ...PAIR_STATES],
    leadingAuthorityFlags: meta.leadingAuthorityFlags,
    entryEnvelopeMessage: meta.entryEnvelopeMessage,
    codecs: [meta.codec as ValueCodec<unknown>],
    parseEntry(raw) {
      const provided = PAIR_STATES.filter((state) => raw[state] !== undefined);
      if (provided.length === 0) return { ok: false, code: 'OVERRIDE_REQUIRED', message: meta.overrideRequiredMessage };
      if (provided.some((state) => !meta.codec.is(raw[state]))) return { ok: false, code: 'VALUE_INVALID', message: meta.valueInvalidMessage };
      return { ok: true, entry: snapshot(raw as PairEntry<Value>) };
    },
    writes(entry) {
      return PAIR_STATES.flatMap((state) => {
        const value = entry[state];
        if (value === undefined) return [];
        return meta.settings(value, state).map(([settingKey, written]): FamilySettingWrite => ({
          settingKey,
          value: written,
          conflictSubject: `${state} ${settingKey}`,
        }));
      });
    },
    summarize: snapshot,
    validSummary(entry) {
      return isRecord(entry)
        && onlyAllowedKeys(entry, ['sourceNodeId', ...PAIR_STATES])
        && validSourceNodeId(entry.sourceNodeId)
        && PAIR_STATES.some((state) => entry[state] !== undefined)
        && PAIR_STATES.every((state) => entry[state] === undefined || meta.codec.is(entry[state]));
    },
  };
}
