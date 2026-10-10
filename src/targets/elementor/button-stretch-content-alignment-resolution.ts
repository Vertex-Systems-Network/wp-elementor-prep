import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { enumCodec } from './mapping-engine/codecs';
import type { ContainerPropertyFamily, FamilySettingWrite } from './mapping-engine/property-family';
import { isRecord, onlyAllowedKeys, validSourceNodeId } from './mapping-engine/shared-validation';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';
import type { P15NeutralButtonNode } from './neutral-export-ir';

export const P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION =
  'p15-elementor-button-stretch-content-alignment-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_RESULT_VERSION =
  'p15-elementor-button-stretch-content-alignment-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_CONTENT_ALIGNMENTS = [
  'start',
  'center',
  'end',
  'space-between',
] as const;

export const P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  positionControlName: 'align',
  stretchSettingKey: 'align',
  stretchValue: 'justify',
  contentAlignmentControlName: 'content_align',
  desktopContentAlignmentSettingKey: 'content_align',
  tabletContentAlignmentSettingKey: 'content_align_tablet',
  mobileContentAlignmentSettingKey: 'content_align_mobile',
  acceptedContentAlignments: P15_ELEMENTOR_BUTTON_CONTENT_ALIGNMENTS,
});

export type P15ElementorButtonContentAlignment =
  typeof P15_ELEMENTOR_BUTTON_CONTENT_ALIGNMENTS[number];

export interface P15ElementorButtonStretchContentAlignmentEntryV1 {
  sourceNodeId: string;
  stretch: true;
  desktopContentAlign?: P15ElementorButtonContentAlignment;
  tabletContentAlign?: P15ElementorButtonContentAlignment;
  mobileContentAlign?: P15ElementorButtonContentAlignment;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_RESULT_VERSION;
  status: P15ElementorButtonStretchContentAlignmentStatus;
  entriesField: 'buttons';
  entry: P15ElementorButtonStretchContentAlignmentEntryV1;
  summaryField: 'resolvedAlignments';
  summary: P15ElementorButtonStretchContentAlignmentEntryV1;
  issueCode: P15ElementorButtonStretchContentAlignmentIssueCode;
  noun: 'Button';
  flags: FamilyAuthorityFlag<'styleInferencePerformed'>;
};
export type P15ElementorButtonStretchContentAlignmentManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorButtonStretchContentAlignmentIssueCode =
  FamilyIssueCode<'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT', 'SOURCE_NOT_BUTTON' | 'SOURCE_ALIGNMENT_CONFLICT' | 'STRETCH_REQUIRED'>;
export type P15ElementorButtonStretchContentAlignmentIssueV1 = FamilyIssueV1<P15ElementorButtonStretchContentAlignmentIssueCode>;
export type P15ElementorButtonStretchContentAlignmentStatus = FamilyStatus<'NO_BUTTON_STRETCH_CONTENT_ALIGNMENT_OVERRIDES', 'BUTTON_STRETCH_CONTENT_ALIGNMENTS_RESOLVED'>;
export type P15ElementorButtonStretchContentAlignmentResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE;
const alignCodec = enumCodec(P15_ELEMENTOR_BUTTON_CONTENT_ALIGNMENTS);
const FIELDS = [
  ['desktopContentAlign', EVIDENCE.desktopContentAlignmentSettingKey],
  ['tabletContentAlign', EVIDENCE.tabletContentAlignmentSettingKey],
  ['mobileContentAlign', EVIDENCE.mobileContentAlignmentSettingKey],
] as const;
const ENTRY_KEYS = ['desktopContentAlign', 'mobileContentAlign', 'sourceNodeId', 'stretch', 'tabletContentAlign'];

function snapshot(entry: Record<string, unknown> & { sourceNodeId: string }): P15ElementorButtonStretchContentAlignmentEntryV1 {
  const result: Record<string, unknown> = { sourceNodeId: entry.sourceNodeId, stretch: true };
  for (const [field] of FIELDS) if (entry[field] !== undefined) result[field] = entry[field];
  return result as unknown as P15ElementorButtonStretchContentAlignmentEntryV1;
}

const conflict = (settingKey: string) => ({
  conflictSubject: settingKey,
  conflictMessage: `Generated base candidate already contains Button setting ${settingKey}.`,
});

const FAMILY: ContainerPropertyFamily<P15ElementorButtonStretchContentAlignmentEntryV1, P15ElementorButtonStretchContentAlignmentEntryV1> = {
  id: 'button-stretch-content-alignment',
  issuePrefix: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT',
  subject: 'Button stretch/content alignment',
  manifestVersion: P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_STRETCH_CONTENT_ALIGNMENT_OVERRIDES', resolved: 'BUTTON_STRETCH_CONTENT_ALIGNMENTS_RESOLVED' },
  summaryField: 'resolvedAlignments',
  target: buttonWidgetTarget('Review nodes cannot participate in Button stretch/content alignment binding.'),
  entryKeys: ENTRY_KEYS,
  leadingAuthorityFlags: ['styleInferencePerformed'],
  extraIssueSuffixes: ['SOURCE_ALIGNMENT_CONFLICT', 'STRETCH_REQUIRED'],
  entryEnvelopeMessage: 'Each entry may contain only sourceNodeId, stretch and bounded desktop/tablet/mobile content alignment.',
  messages: {
    notContainer: 'sourceNodeId must identify an existing neutral Button node.',
    entriesInvalid: 'buttons must be a bounded array.',
    upstream: 'Button stretch/content alignment requires an existing review-free generated local candidate.',
    authority: 'Button stretch/content alignment cannot grant inference/mutation/network/compatibility/production/download authority.',
  },
  codecs: [alignCodec],
  parseEntry(raw, node) {
    if ((node as P15NeutralButtonNode).align !== undefined) {
      return {
        ok: false,
        code: 'SOURCE_ALIGNMENT_CONFLICT',
        message: 'Stretch is rejected when the neutral Button already declares explicit alignment.',
        pathSuffix: '.sourceNodeId',
      };
    }
    if (raw.stretch !== true) {
      return { ok: false, code: 'STRETCH_REQUIRED', message: 'stretch must be explicitly true for this target-specific layout mutation.', pathSuffix: '.stretch' };
    }
    if (FIELDS.some(([field]) => raw[field] !== undefined && !alignCodec.is(raw[field]))) {
      return { ok: false, code: 'VALUE_INVALID', message: 'Content alignment must be one of start, center, end or space-between.' };
    }
    return { ok: true, entry: snapshot(raw) };
  },
  // The stretch `align` write comes first; conflicts report the first requested key in that same order.
  writes: (entry) => [
    { settingKey: EVIDENCE.stretchSettingKey, value: EVIDENCE.stretchValue, ...conflict(EVIDENCE.stretchSettingKey) },
    ...FIELDS
      .filter(([field]) => entry[field] !== undefined)
      .map(([field, settingKey]): FamilySettingWrite => ({ settingKey, value: entry[field], ...conflict(settingKey) })),
  ],
  summarize: (entry) => snapshot(entry as unknown as Record<string, unknown> & { sourceNodeId: string }),
  validSummary(entry) {
    return isRecord(entry)
      && onlyAllowedKeys(entry, ENTRY_KEYS)
      && validSourceNodeId(entry.sourceNodeId)
      && entry.stretch === true
      && FIELDS.every(([field]) => entry[field] === undefined || alignCodec.is(entry[field]));
  },
};

const API = familyApi<P15ElementorButtonStretchContentAlignmentResultV1>(FAMILY);

/**
 * Apply only an explicit Button stretch plus bounded desktop/tablet/mobile content alignment to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonStretchContentAlignments(sourceValue: unknown, manifestValue: unknown): P15ElementorButtonStretchContentAlignmentResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized stretch/content alignment metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonStretchContentAlignmentSummary(result: P15ElementorButtonStretchContentAlignmentResultV1): string {
  return API.serialize(result);
}
