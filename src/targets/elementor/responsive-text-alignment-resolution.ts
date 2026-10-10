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
import { exactKeys, isRecord, validSourceNodeId } from './mapping-engine/shared-validation';
import { desktopAlignMatches, widgetTarget } from './mapping-engine/widget-binding';
import type {
  P15NeutralHeadingNode,
  P15NeutralTextAlignment,
  P15NeutralTextNode,
} from './neutral-export-ir';

export const P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION =
  'p15-elementor-responsive-text-alignment-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_RESULT_VERSION =
  'p15-elementor-responsive-text-alignment-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  headingSourcePath: 'includes/widgets/heading.php',
  headingSourceBlobSha: '5b193f958ba34d8d4a24d165a9114f9bc3ef2561',
  textEditorSourcePath: 'includes/widgets/text-editor.php',
  textEditorSourceBlobSha: '72ff868493a3c0f27c6305794ffcff9cf217c9ea',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  controlName: 'align',
  desktopSettingKey: 'align',
  tabletSettingKey: 'align_tablet',
  mobileSettingKey: 'align_mobile',
  headingValues: ['start', 'center', 'end'] as const,
  textValues: ['start', 'center', 'end', 'justify'] as const,
});

type P15ResponsiveTextNode = P15NeutralHeadingNode | P15NeutralTextNode;
export type P15ElementorResponsiveTextNodeKind = P15ResponsiveTextNode['kind'];

export interface P15ElementorResponsiveTextAlignmentEntryV1 {
  sourceNodeId: string;
  tabletAlign?: P15NeutralTextAlignment;
  mobileAlign?: P15NeutralTextAlignment;
}

export interface P15ElementorResponsiveTextAlignmentSummaryEntryV1 {
  sourceNodeId: string;
  nodeKind: P15ElementorResponsiveTextNodeKind;
  tabletAlign: P15NeutralTextAlignment | null;
  mobileAlign: P15NeutralTextAlignment | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_RESULT_VERSION;
  status: P15ElementorResponsiveTextAlignmentStatus;
  entriesField: 'widgets';
  entry: P15ElementorResponsiveTextAlignmentEntryV1;
  summaryField: 'resolvedAlignments';
  summary: P15ElementorResponsiveTextAlignmentSummaryEntryV1;
  issueCode: P15ElementorResponsiveTextAlignmentIssueCode;
  noun: 'TextWidget';
  flags: FamilyAuthorityFlag;
  /** The resolved count keeps its historical `resolvedWidgetCount` name. */
  extra: { resolvedWidgetCount: number };
};
export type P15ElementorResponsiveTextAlignmentManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveTextAlignmentIssueCode =
  FamilyIssueCode<'P15_RESPONSIVE_TEXT_ALIGNMENT', 'SOURCE_NOT_TEXT_WIDGET'>;
export type P15ElementorResponsiveTextAlignmentIssueV1 = FamilyIssueV1<P15ElementorResponsiveTextAlignmentIssueCode>;
export type P15ElementorResponsiveTextAlignmentStatus = FamilyStatus<'NO_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDES', 'RESPONSIVE_TEXT_ALIGNMENTS_RESOLVED'>;
export type P15ElementorResponsiveTextAlignmentResultV1 = Omit<FamilyResultV1<Contract>, 'resolvedTextWidgetCount'>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_EVIDENCE;
const textAlignCodec = enumCodec(EVIDENCE.textValues);
const headingAlignCodec = enumCodec(EVIDENCE.headingValues);
const FIELDS = [
  ['tabletAlign', EVIDENCE.tabletSettingKey, 'tablet alignment'],
  ['mobileAlign', EVIDENCE.mobileSettingKey, 'mobile alignment'],
] as const;

/** Heading accepts start/center/end; Text Editor additionally accepts justify. */
function alignmentAllowed(kind: P15ElementorResponsiveTextNodeKind, value: unknown): value is P15NeutralTextAlignment {
  return kind === 'text' ? textAlignCodec.is(value) : headingAlignCodec.is(value);
}

const FAMILY: ContainerPropertyFamily<P15ElementorResponsiveTextAlignmentEntryV1, P15ElementorResponsiveTextAlignmentSummaryEntryV1> = {
  id: 'responsive-text-alignment',
  issuePrefix: 'P15_RESPONSIVE_TEXT_ALIGNMENT',
  subject: 'Responsive text alignment',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDES', resolved: 'RESPONSIVE_TEXT_ALIGNMENTS_RESOLVED' },
  summaryField: 'resolvedAlignments',
  target: widgetTarget({
    kinds: ['heading', 'text'],
    entriesField: 'widgets',
    sourceCountField: 'sourceTextWidgetCount',
    resolvedCountField: 'resolvedWidgetCount',
    notTargetSuffix: 'SOURCE_NOT_TEXT_WIDGET',
    notTargetMessage: (subject) => `${subject} sourceNodeId must identify an existing neutral Heading or Text node.`,
    bindingMissingMessage: (sourceNodeId) => `Generated text-widget binding missing for sourceNodeId ${sourceNodeId}.`,
    reviewMessage: 'Review nodes cannot participate in responsive text-widget binding.',
    matches: (node, settings) => desktopAlignMatches((node as P15NeutralHeadingNode | P15NeutralTextNode).align, settings),
    driftPathSuffix: '.settings.align',
    driftMessage: 'Generated widget desktop alignment drifted from the neutral source.',
  }),
  entryKeys: ['mobileAlign', 'sourceNodeId', 'tabletAlign'],
  entryEnvelopeMessage: 'Each responsive text alignment entry may contain only sourceNodeId plus tablet/mobile alignment values.',
  messages: {
    upstream: 'Responsive text alignment requires an existing review-free generated local candidate.',
    authority: 'Responsive text alignment cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
  },
  codecs: [textAlignCodec, headingAlignCodec],
  parseEntry(raw, node) {
    const kind = (node as P15NeutralHeadingNode | P15NeutralTextNode).kind;
    const provided = FIELDS.filter(([field]) => raw[field] !== undefined);
    if (provided.length === 0) {
      return { ok: false, code: 'OVERRIDE_REQUIRED', message: 'Each responsive text alignment entry must explicitly provide tabletAlign and/or mobileAlign.' };
    }
    if (provided.some(([field]) => !alignmentAllowed(kind, raw[field]))) {
      return {
        ok: false,
        code: 'VALUE_INVALID',
        message: kind === 'heading'
          ? 'Heading responsive alignment must be start, center or end.'
          : 'Text responsive alignment must be start, center, end or justify.',
      };
    }
    const entry: P15ElementorResponsiveTextAlignmentEntryV1 = { sourceNodeId: raw.sourceNodeId };
    for (const [field] of provided) entry[field] = raw[field] as P15NeutralTextAlignment;
    return { ok: true, entry };
  },
  writes: (entry) => FIELDS
    .filter(([field]) => entry[field] !== undefined)
    .map(([field, settingKey, conflictSubject]): FamilySettingWrite => ({ settingKey, value: entry[field], conflictSubject })),
  summarize: (entry, node) => ({
    sourceNodeId: entry.sourceNodeId,
    nodeKind: (node as P15NeutralHeadingNode | P15NeutralTextNode).kind,
    tabletAlign: entry.tabletAlign ?? null,
    mobileAlign: entry.mobileAlign ?? null,
  }),
  validSummary(entry) {
    if (!isRecord(entry)) return false;
    const kindValid = entry.nodeKind === 'heading' || entry.nodeKind === 'text';
    return exactKeys(entry, ['mobileAlign', 'nodeKind', 'sourceNodeId', 'tabletAlign'])
      && validSourceNodeId(entry.sourceNodeId)
      && kindValid
      && (entry.tabletAlign === null || alignmentAllowed(entry.nodeKind, entry.tabletAlign))
      && (entry.mobileAlign === null || alignmentAllowed(entry.nodeKind, entry.mobileAlign))
      && (entry.tabletAlign !== null || entry.mobileAlign !== null);
  },
};

const API = familyApi<P15ElementorResponsiveTextAlignmentResultV1>(FAMILY);

/**
 * Apply only explicit default tablet/mobile alignment overrides to exact generated Heading/Text Editor bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer semantics or responsive values,
 * alter desktop alignment, expand to Button, or claim responsive closure.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4a); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-widget-family-golden.test.ts`.
 */
export function resolveP15ElementorResponsiveTextAlignments(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveTextAlignmentResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized alignment metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveTextAlignmentSummary(result: P15ElementorResponsiveTextAlignmentResultV1): string {
  return API.serialize(result);
}
