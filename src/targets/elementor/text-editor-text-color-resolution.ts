import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { lowerHexColorCodec } from './mapping-engine/codecs';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import { textEditorBaseSettingsMatch, widgetTarget } from './mapping-engine/widget-binding';
import type { P15NeutralTextNode } from './neutral-export-ir';

export const P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MANIFEST_VERSION =
  'p15-elementor-text-editor-text-color-manifest-v1' as const;
export const P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_RESULT_VERSION =
  'p15-elementor-text-editor-text-color-result-v1' as const;
export const P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  textEditorSourcePath: 'includes/widgets/text-editor.php',
  textEditorSourceBlobSha: '72ff868493a3c0f27c6305794ffcff9cf217c9ea',
  controlName: 'text_color',
  settingKey: 'text_color',
  linkControlName: 'link_color',
  selector: '{{WRAPPER}}',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
});

export type P15ElementorTextEditorTextColorValue = string;

export interface P15ElementorTextEditorTextColorEntryV1 {
  sourceNodeId: string;
  color: P15ElementorTextEditorTextColorValue;
}

export interface P15ElementorTextEditorTextColorSummaryEntryV1 {
  sourceNodeId: string;
  color: P15ElementorTextEditorTextColorValue;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_RESULT_VERSION;
  status: P15ElementorTextEditorTextColorStatus;
  entriesField: 'texts';
  entry: P15ElementorTextEditorTextColorEntryV1;
  summaryField: 'resolvedColors';
  summary: P15ElementorTextEditorTextColorSummaryEntryV1;
  issueCode: P15ElementorTextEditorTextColorIssueCode;
  noun: 'Text';
  flags: FamilyAuthorityFlag<'colorInferencePerformed'>;
};
export type P15ElementorTextEditorTextColorManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorTextEditorTextColorIssueCode =
  FamilyIssueCode<'P15_TEXT_EDITOR_TEXT_COLOR', 'SOURCE_NOT_TEXT'>;
export type P15ElementorTextEditorTextColorIssueV1 = FamilyIssueV1<P15ElementorTextEditorTextColorIssueCode>;
export type P15ElementorTextEditorTextColorStatus = FamilyStatus<'NO_TEXT_EDITOR_TEXT_COLOR_OVERRIDES', 'TEXT_EDITOR_TEXT_COLORS_RESOLVED'>;
export type P15ElementorTextEditorTextColorResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_EVIDENCE;
const FAMILY = containerStyleFamily({
  id: 'text-editor-text-color',
  issuePrefix: 'P15_TEXT_EDITOR_TEXT_COLOR',
  subject: 'Text Editor text color',
  manifestVersion: P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_TEXT_EDITOR_TEXT_COLOR_OVERRIDES', resolved: 'TEXT_EDITOR_TEXT_COLORS_RESOLVED' },
  summaryField: 'resolvedColors',
  target: widgetTarget({
    kinds: ['text'],
    entriesField: 'texts',
    sourceCountField: 'sourceTextCount',
    resolvedCountField: 'resolvedTextCount',
    notTargetSuffix: 'SOURCE_NOT_TEXT',
    notTargetMessage: (subject) => `${subject} sourceNodeId must identify an existing neutral Text node.`,
    bindingMissingMessage: (sourceNodeId) => `Generated Text Editor binding missing for sourceNodeId ${sourceNodeId}.`,
    reviewMessage: 'Review nodes cannot participate in Text Editor color binding.',
    matches: (node, settings) => textEditorBaseSettingsMatch(node as P15NeutralTextNode, settings),
    driftPathSuffix: '.settings',
    driftMessage: 'Generated Text Editor base settings drifted from the exact neutral source.',
  }),
  fields: [{ field: 'color', codec: lowerHexColorCodec }],
  checks: [{
    fields: ['color'],
    code: 'VALUE_INVALID',
    pathSuffix: '.color',
    message: 'Text Editor text color must be a lowercase six-digit hex value such as #1a2b3c.',
  }],
  leadingAuthorityFlags: ['colorInferencePerformed'],
  entryEnvelopeMessage: 'Each Text Editor text color entry may contain only sourceNodeId and color.',
  messages: {
    authority: 'Text Editor text color resolution cannot grant color/responsive inference, mutation, network, closure, compatibility, production or download authority.',
  },
  writes: (entry) => [{
    settingKey: EVIDENCE.settingKey,
    value: entry.color,
    conflictSubject: 'Text Editor text_color',
    conflictMessage: 'Generated base candidate already contains a Text Editor text_color setting.',
  }],
});

const API = familyApi<P15ElementorTextEditorTextColorResultV1>(FAMILY);

/**
 * Apply only explicit lowercase six-digit hex normal text colors to exact generated Text Editor bindings.
 *
 * This contract does not infer colors, parse CSS, resolve global/theme tokens, mutate hover/link color,
 * add alpha channels, change Text content/alignment, or claim compatibility/production authority.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4a); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-widget-family-golden.test.ts`.
 */
export function resolveP15ElementorTextEditorTextColors(sourceValue: unknown, manifestValue: unknown): P15ElementorTextEditorTextColorResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized color metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorTextEditorTextColorSummary(result: P15ElementorTextEditorTextColorResultV1): string {
  return API.serialize(result);
}
