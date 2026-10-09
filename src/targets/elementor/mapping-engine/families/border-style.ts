import { enumCodec, lowerHexColorCodec, type BoxPx } from '../codecs';
import type { ContainerPropertyFamily, FamilyEvidence, FamilyTarget } from '../property-family';
import { containerStyleFamily, intDimensionsBoxCodec, type StyleEntry } from './container-style';

/**
 * The Elementor `border` group family (normal or hover) shared by containers and Buttons: one visible
 * border type, an exact integer px width box with optional tablet/mobile widths, and one lowercase hex
 * colour. Every contract using it words its messages identically apart from the subject and node noun.
 */
export interface BorderStyleEvidence extends FamilyEvidence {
  readonly borderTypeSettingKey: string;
  readonly borderWidthSettingKey: string;
  readonly borderWidthTabletSettingKey: string;
  readonly borderWidthMobileSettingKey: string;
  readonly borderColorSettingKey: string;
  readonly borderWidthMinPx: number;
  readonly borderWidthMaxPx: number;
}

export interface BorderStyleFamilyMeta {
  id: string;
  issuePrefix: string;
  /** e.g. `Container border-style`, `Button border-style`. */
  subject: string;
  manifestVersion: string;
  resultVersion: string;
  maxEntries: number;
  evidence: BorderStyleEvidence;
  borderTypes: readonly string[];
  statuses: { none: string; resolved: string };
  /** Neutral node noun in the not-target message, e.g. `Container` or `Button`. */
  nodeNoun: string;
  /** Conflict noun, e.g. `Container border`, `Container hover border`, `Button border`. */
  conflictNoun: string;
  target?: FamilyTarget;
  bindingMissingMessage?: (sourceNodeId: string) => string;
}

export function borderStyleFamily(meta: BorderStyleFamilyMeta): ContainerPropertyFamily<StyleEntry, StyleEntry> {
  const evidence = meta.evidence;
  const widthCodec = intDimensionsBoxCodec({ min: evidence.borderWidthMinPx, max: evidence.borderWidthMaxPx });
  const conflict = (settingKey: string, conflictRank: number) => ({
    conflictSubject: settingKey,
    conflictMessage: `Generated base candidate already contains requested ${meta.conflictNoun} setting ${settingKey}.`,
    conflictRank,
  });
  return containerStyleFamily({
    id: meta.id,
    issuePrefix: meta.issuePrefix,
    subject: meta.subject,
    manifestVersion: meta.manifestVersion,
    resultVersion: meta.resultVersion,
    maxEntries: meta.maxEntries,
    evidence,
    statuses: meta.statuses,
    summaryField: 'resolvedBorderStyles',
    ...(meta.target ? { target: meta.target } : {}),
    fields: [
      { field: 'borderType', codec: enumCodec(meta.borderTypes) },
      { field: 'widthPx', codec: widthCodec },
      { field: 'tabletWidthPx', codec: widthCodec, optional: true },
      { field: 'mobileWidthPx', codec: widthCodec, optional: true },
      { field: 'color', codec: lowerHexColorCodec },
    ],
    checks: [
      {
        fields: ['borderType'],
        code: 'TYPE_INVALID',
        pathSuffix: '.borderType',
        message: 'borderType must be one visible Elementor 4.2.4 border style: solid, double, dotted, dashed or groove.',
      },
      {
        fields: ['widthPx'],
        code: 'WIDTH_INVALID',
        pathSuffix: '.widthPx',
        message: `widthPx must contain integer px sides from 0 through ${evidence.borderWidthMaxPx}.`,
      },
      {
        fields: ['tabletWidthPx', 'mobileWidthPx'],
        code: 'WIDTH_INVALID',
        pathSuffix: '.responsiveWidthPx',
        message: 'Each supplied responsive width must contain four integer px sides from 0 through 100.',
      },
      {
        fields: ['color'],
        code: 'COLOR_INVALID',
        pathSuffix: '.color',
        message: 'color must be a lowercase six-digit hex value such as #1a2b3c.',
      },
    ],
    envelopeRequiresFields: true,
    leadingAuthorityFlags: ['styleInferencePerformed'],
    extraIssueSuffixes: ['TYPE_INVALID', 'WIDTH_INVALID', 'COLOR_INVALID'],
    entryEnvelopeMessage: 'Each entry must contain exactly sourceNodeId, borderType, widthPx and color.',
    messages: {
      notContainer: `sourceNodeId must identify an existing neutral ${meta.nodeNoun} node.`,
      authority: `${meta.subject} resolution cannot grant inference, mutation, network, closure, compatibility, production or download authority.`,
    },
    ...(meta.bindingMissingMessage ? { bindingMissingMessage: meta.bindingMissingMessage } : {}),
    // Writes follow the original order; conflicts report the first requested key (type, width, color, tablet, mobile).
    writes: (entry) => [
      { settingKey: evidence.borderTypeSettingKey, value: entry.borderType, ...conflict(evidence.borderTypeSettingKey, 0) },
      { settingKey: evidence.borderWidthSettingKey, value: widthCodec.encode(entry.widthPx as BoxPx), ...conflict(evidence.borderWidthSettingKey, 1) },
      ...(entry.tabletWidthPx === undefined ? [] : [{
        settingKey: evidence.borderWidthTabletSettingKey,
        value: widthCodec.encode(entry.tabletWidthPx as BoxPx),
        ...conflict(evidence.borderWidthTabletSettingKey, 3),
      }]),
      ...(entry.mobileWidthPx === undefined ? [] : [{
        settingKey: evidence.borderWidthMobileSettingKey,
        value: widthCodec.encode(entry.mobileWidthPx as BoxPx),
        ...conflict(evidence.borderWidthMobileSettingKey, 4),
      }]),
      { settingKey: evidence.borderColorSettingKey, value: entry.color, ...conflict(evidence.borderColorSettingKey, 2) },
    ],
  });
}
