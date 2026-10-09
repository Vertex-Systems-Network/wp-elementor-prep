import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { enumCodec } from './mapping-engine/codecs';
import type { ContainerPropertyFamily, FamilySettingWrite } from './mapping-engine/property-family';
import { exactKeys, isRecord, validSourceNodeId } from './mapping-engine/shared-validation';
import { desktopAlignMatches, widgetTarget } from './mapping-engine/widget-binding';
import type {
  P15NeutralHeadingNode,
  P15NeutralTextAlignment,
  P15NeutralTextNode,
} from './neutral-export-ir';
import type { ElementorTemplateV04 } from './template-v04';

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

export interface P15ElementorResponsiveTextAlignmentManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  widgets: P15ElementorResponsiveTextAlignmentEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveTextAlignmentIssueCode =
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_ENTRY_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_NOT_TEXT_WIDGET'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_VALUE_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveTextAlignmentIssueV1 {
  code: P15ElementorResponsiveTextAlignmentIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveTextAlignmentStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDES'
  | 'RESPONSIVE_TEXT_ALIGNMENTS_RESOLVED';

export interface P15ElementorResponsiveTextAlignmentSummaryEntryV1 {
  sourceNodeId: string;
  nodeKind: P15ElementorResponsiveTextNodeKind;
  tabletAlign: P15NeutralTextAlignment | null;
  mobileAlign: P15NeutralTextAlignment | null;
}

export interface P15ElementorResponsiveTextAlignmentResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_RESULT_VERSION;
  status: P15ElementorResponsiveTextAlignmentStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceTextWidgetCount: number;
  resolvedWidgetCount: number;
  resolvedAlignments: P15ElementorResponsiveTextAlignmentSummaryEntryV1[];
  issues: P15ElementorResponsiveTextAlignmentIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

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

/**
 * Apply only explicit default tablet/mobile alignment overrides to exact generated Heading/Text Editor bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer semantics or responsive values,
 * alter desktop alignment, expand to Button, or claim responsive closure.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4a); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-widget-family-golden.test.ts`.
 */
export function resolveP15ElementorResponsiveTextAlignments(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveTextAlignmentResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorResponsiveTextAlignmentResultV1;
}

/** Serialize only sanitized alignment metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveTextAlignmentSummary(
  result: P15ElementorResponsiveTextAlignmentResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
