import { P15_NEUTRAL_EXPORT_MAX_SPACING_PX } from '../../neutral-export-ir';
import { dimensionsBoxCodec, gapAxesCodec, isFinitePxInRange, type BoxPx } from '../codecs';
import type { ContainerPropertyFamily, FamilyEvidence, FamilySettingWrite } from '../property-family';
import { exactKeys, isRecord, validSourceNodeId } from '../shared-validation';

/**
 * Responsive container spacing families (recovery M1.3a): flex gap, padding and margin.
 * Each family is pure data plus small parse/write hooks over the shared container-family engine.
 */

const SPACING_RANGE = { min: 0, max: P15_NEUTRAL_EXPORT_MAX_SPACING_PX } as const;
const gapCodec = gapAxesCodec(SPACING_RANGE);
const boxCodec = dimensionsBoxCodec(SPACING_RANGE);

// ---------------------------------------------------------------- flex gap

export interface ResponsiveGapEntry {
  sourceNodeId: string;
  tabletGapPx?: number;
  tabletRowGapPx?: number;
  tabletColumnGapPx?: number;
  mobileGapPx?: number;
  mobileRowGapPx?: number;
  mobileColumnGapPx?: number;
}

export interface ResponsiveGapSummary {
  sourceNodeId: string;
  tabletGapPx: number | null;
  tabletRowGapPx: number | null;
  tabletColumnGapPx: number | null;
  mobileGapPx: number | null;
  mobileRowGapPx: number | null;
  mobileColumnGapPx: number | null;
}

const GAP_ENTRY_KEYS = [
  'mobileColumnGapPx',
  'mobileGapPx',
  'mobileRowGapPx',
  'sourceNodeId',
  'tabletColumnGapPx',
  'tabletGapPx',
  'tabletRowGapPx',
] as const;

function validGapPx(value: unknown): value is number {
  return isFinitePxInRange(value, SPACING_RANGE);
}

function gapWrite(
  settingKey: string,
  device: 'tablet' | 'mobile',
  linked: number | undefined,
  row: number | undefined,
  column: number | undefined,
): FamilySettingWrite | null {
  if (linked !== undefined) return { settingKey, value: gapCodec.encode({ row: linked, column: linked, isLinked: true }), conflictSubject: `${device} gap` };
  if (row !== undefined) return { settingKey, value: gapCodec.encode({ row, column: column as number, isLinked: false }), conflictSubject: `${device} gap` };
  return null;
}

export function responsiveGapFamily(meta: {
  manifestVersion: string;
  resultVersion: string;
  maxEntries: number;
  evidence: FamilyEvidence & { readonly tabletSettingKey: string; readonly mobileSettingKey: string };
}): ContainerPropertyFamily<ResponsiveGapEntry, ResponsiveGapSummary> {
  return {
    id: 'responsive-gap',
    issuePrefix: 'P15_RESPONSIVE_GAP',
    subject: 'Responsive gap',
    ...meta,
    statuses: { none: 'NO_RESPONSIVE_GAP_OVERRIDES', resolved: 'RESPONSIVE_GAPS_RESOLVED' },
    summaryField: 'resolvedGaps',
    entryKeys: GAP_ENTRY_KEYS,
    entryEnvelopeMessage: 'Each responsive gap entry may contain only sourceNodeId plus linked gaps or complete tablet/mobile row/column px pairs.',
    codecs: [gapCodec],
    parseEntry(raw) {
      const tabletLinked = raw.tabletGapPx !== undefined;
      const tabletRow = raw.tabletRowGapPx !== undefined;
      const tabletColumn = raw.tabletColumnGapPx !== undefined;
      const mobileLinked = raw.mobileGapPx !== undefined;
      const mobileRow = raw.mobileRowGapPx !== undefined;
      const mobileColumn = raw.mobileColumnGapPx !== undefined;
      const tabletSplit = tabletRow || tabletColumn;
      const mobileSplit = mobileRow || mobileColumn;
      if ((tabletLinked && tabletSplit) || (mobileLinked && mobileSplit)) {
        return { ok: false, code: 'ENTRY_INVALID', message: 'Use either linked gap or an explicit row/column pair for each breakpoint, not both.' };
      }
      if (tabletRow !== tabletColumn || mobileRow !== mobileColumn) {
        return { ok: false, code: 'ENTRY_INVALID', message: 'Explicit responsive row and column gaps must be supplied together at each breakpoint.' };
      }
      if (!(tabletLinked || tabletSplit) && !(mobileLinked || mobileSplit)) {
        return { ok: false, code: 'OVERRIDE_REQUIRED', message: 'Each responsive gap entry must provide linked gaps or explicit row/column px pairs.' };
      }
      const values = [
        ...(tabletLinked ? [raw.tabletGapPx] : []),
        ...(tabletSplit ? [raw.tabletRowGapPx, raw.tabletColumnGapPx] : []),
        ...(mobileLinked ? [raw.mobileGapPx] : []),
        ...(mobileSplit ? [raw.mobileRowGapPx, raw.mobileColumnGapPx] : []),
      ];
      if (values.some((value) => !validGapPx(value))) {
        return { ok: false, code: 'VALUE_INVALID', message: `Responsive gap px values must be finite and between 0 and ${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}.` };
      }
      return {
        ok: true,
        entry: {
          sourceNodeId: raw.sourceNodeId,
          ...(tabletLinked ? { tabletGapPx: raw.tabletGapPx as number } : {}),
          ...(tabletSplit ? { tabletRowGapPx: raw.tabletRowGapPx as number, tabletColumnGapPx: raw.tabletColumnGapPx as number } : {}),
          ...(mobileLinked ? { mobileGapPx: raw.mobileGapPx as number } : {}),
          ...(mobileSplit ? { mobileRowGapPx: raw.mobileRowGapPx as number, mobileColumnGapPx: raw.mobileColumnGapPx as number } : {}),
        },
      };
    },
    writes(entry) {
      return [
        gapWrite(meta.evidence.tabletSettingKey, 'tablet', entry.tabletGapPx, entry.tabletRowGapPx, entry.tabletColumnGapPx),
        gapWrite(meta.evidence.mobileSettingKey, 'mobile', entry.mobileGapPx, entry.mobileRowGapPx, entry.mobileColumnGapPx),
      ].filter((write): write is FamilySettingWrite => write !== null);
    },
    summarize(entry) {
      return {
        sourceNodeId: entry.sourceNodeId,
        tabletGapPx: entry.tabletGapPx ?? null,
        tabletRowGapPx: entry.tabletRowGapPx ?? null,
        tabletColumnGapPx: entry.tabletColumnGapPx ?? null,
        mobileGapPx: entry.mobileGapPx ?? null,
        mobileRowGapPx: entry.mobileRowGapPx ?? null,
        mobileColumnGapPx: entry.mobileColumnGapPx ?? null,
      };
    },
    validSummary(entry) {
      const values = [entry.tabletGapPx, entry.tabletRowGapPx, entry.tabletColumnGapPx, entry.mobileGapPx, entry.mobileRowGapPx, entry.mobileColumnGapPx];
      return isRecord(entry)
        && exactKeys(entry as unknown as Record<string, unknown>, GAP_ENTRY_KEYS)
        && validSourceNodeId(entry.sourceNodeId)
        && values.every((value) => value === null || validGapPx(value))
        && values.some((value) => value !== null)
        && (entry.tabletRowGapPx === null) === (entry.tabletColumnGapPx === null)
        && (entry.mobileRowGapPx === null) === (entry.mobileColumnGapPx === null)
        && !(entry.tabletGapPx !== null && (entry.tabletRowGapPx !== null || entry.tabletColumnGapPx !== null))
        && !(entry.mobileGapPx !== null && (entry.mobileRowGapPx !== null || entry.mobileColumnGapPx !== null));
    },
  };
}

// ---------------------------------------------------------------- padding / margin boxes

/**
 * Responsive dimensions-box family factory (padding, margin): explicit tablet and/or mobile
 * top/right/bottom/left px boxes written to `<control>_tablet` / `<control>_mobile`.
 */
export function responsiveBoxSpacingFamily(meta: {
  control: 'padding' | 'margin';
  manifestVersion: string;
  resultVersion: string;
  maxEntries: number;
  evidence: FamilyEvidence & { readonly tabletSettingKey: string; readonly mobileSettingKey: string };
  valueInvalidMessage: string;
}): ContainerPropertyFamily<{ sourceNodeId: string } & Record<string, unknown>, { sourceNodeId: string } & Record<string, BoxPx | null | string>> {
  const Control = meta.control === 'padding' ? 'Padding' : 'Margin';
  const tabletField = `tablet${Control}Px`;
  const mobileField = `mobile${Control}Px`;
  const summaryKeys = [mobileField, 'sourceNodeId', tabletField];
  return {
    id: `responsive-${meta.control}`,
    issuePrefix: `P15_RESPONSIVE_${meta.control.toUpperCase()}`,
    subject: `Responsive ${meta.control}`,
    manifestVersion: meta.manifestVersion,
    resultVersion: meta.resultVersion,
    maxEntries: meta.maxEntries,
    evidence: meta.evidence,
    statuses: { none: `NO_RESPONSIVE_${meta.control.toUpperCase()}_OVERRIDES`, resolved: `RESPONSIVE_${meta.control.toUpperCase()}_RESOLVED` },
    summaryField: `resolved${Control}s`,
    entryKeys: [mobileField, 'sourceNodeId', tabletField],
    entryEnvelopeMessage: `Each responsive ${meta.control} entry may contain only sourceNodeId plus tablet/mobile ${meta.control} objects.`,
    codecs: [boxCodec],
    parseEntry(raw) {
      const tabletProvided = raw[tabletField] !== undefined;
      const mobileProvided = raw[mobileField] !== undefined;
      if (!tabletProvided && !mobileProvided) {
        return { ok: false, code: 'OVERRIDE_REQUIRED', message: `Each responsive ${meta.control} entry must explicitly provide ${tabletField} and/or ${mobileField}.` };
      }
      if ((tabletProvided && !boxCodec.is(raw[tabletField])) || (mobileProvided && !boxCodec.is(raw[mobileField]))) {
        return { ok: false, code: 'VALUE_INVALID', message: meta.valueInvalidMessage };
      }
      return {
        ok: true,
        entry: {
          sourceNodeId: raw.sourceNodeId,
          ...(tabletProvided ? { [tabletField]: boxCodec.snapshot(raw[tabletField] as BoxPx) } : {}),
          ...(mobileProvided ? { [mobileField]: boxCodec.snapshot(raw[mobileField] as BoxPx) } : {}),
        },
      };
    },
    writes(entry) {
      const writes: FamilySettingWrite[] = [];
      if (entry[tabletField] !== undefined) writes.push({ settingKey: meta.evidence.tabletSettingKey, value: boxCodec.encode(entry[tabletField] as BoxPx), conflictSubject: `tablet ${meta.control}` });
      if (entry[mobileField] !== undefined) writes.push({ settingKey: meta.evidence.mobileSettingKey, value: boxCodec.encode(entry[mobileField] as BoxPx), conflictSubject: `mobile ${meta.control}` });
      return writes;
    },
    summarize(entry) {
      return {
        sourceNodeId: entry.sourceNodeId,
        [tabletField]: entry[tabletField] ? boxCodec.snapshot(entry[tabletField] as BoxPx) : null,
        [mobileField]: entry[mobileField] ? boxCodec.snapshot(entry[mobileField] as BoxPx) : null,
      };
    },
    validSummary(entry) {
      const tablet = entry[tabletField];
      const mobile = entry[mobileField];
      return isRecord(entry)
        && exactKeys(entry, summaryKeys)
        && validSourceNodeId(entry.sourceNodeId)
        && (tablet === null || boxCodec.is(tablet))
        && (mobile === null || boxCodec.is(mobile))
        && (tablet !== null || mobile !== null);
    },
  };
}
