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
import { responsiveEnumFamily } from './mapping-engine/families/responsive-layout';
import { desktopAlignMatches, expectedDesktopButtonAlignment, widgetTarget } from './mapping-engine/widget-binding';
import type { P15NeutralButtonNode } from './neutral-export-ir';

export const P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION =
  'p15-elementor-responsive-button-alignment-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_RESULT_VERSION =
  'p15-elementor-responsive-button-alignment-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  controlName: 'align',
  desktopSettingKey: 'align',
  tabletSettingKey: 'align_tablet',
  mobileSettingKey: 'align_mobile',
  targetValues: ['left', 'center', 'right', 'justify'] as const,
});

export type P15ElementorResponsiveButtonAlignment =
  typeof P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE.targetValues[number];

export interface P15ElementorResponsiveButtonAlignmentEntryV1 {
  sourceNodeId: string;
  tabletAlign?: P15ElementorResponsiveButtonAlignment;
  mobileAlign?: P15ElementorResponsiveButtonAlignment;
}

export interface P15ElementorResponsiveButtonAlignmentSummaryEntryV1 {
  sourceNodeId: string;
  tabletAlign: P15ElementorResponsiveButtonAlignment | null;
  mobileAlign: P15ElementorResponsiveButtonAlignment | null;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_RESULT_VERSION;
  status: P15ElementorResponsiveButtonAlignmentStatus;
  entriesField: 'widgets';
  entry: P15ElementorResponsiveButtonAlignmentEntryV1;
  summaryField: 'resolvedAlignments';
  summary: P15ElementorResponsiveButtonAlignmentSummaryEntryV1;
  issueCode: P15ElementorResponsiveButtonAlignmentIssueCode;
  /** Count fields `sourceButtonWidgetCount` / `resolvedWidgetCount` do not share one noun; both are explicit extras. */
  noun: never;
  flags: FamilyAuthorityFlag;
  extra: { sourceButtonWidgetCount: number; resolvedWidgetCount: number };
};
export type P15ElementorResponsiveButtonAlignmentManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorResponsiveButtonAlignmentIssueCode =
  FamilyIssueCode<'P15_RESPONSIVE_BUTTON_ALIGNMENT', 'SOURCE_NOT_BUTTON'>;
export type P15ElementorResponsiveButtonAlignmentIssueV1 = FamilyIssueV1<P15ElementorResponsiveButtonAlignmentIssueCode>;
export type P15ElementorResponsiveButtonAlignmentStatus = FamilyStatus<'NO_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDES', 'RESPONSIVE_BUTTON_ALIGNMENTS_RESOLVED'>;
export type P15ElementorResponsiveButtonAlignmentResultV1 = FamilyResultV1<Contract>;

const EVIDENCE = P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE;
const alignCodec = enumCodec(EVIDENCE.targetValues);
const FAMILY = responsiveEnumFamily({
  id: 'responsive-button-alignment',
  issuePrefix: 'P15_RESPONSIVE_BUTTON_ALIGNMENT',
  subject: 'Responsive Button alignment',
  manifestVersion: P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDES', resolved: 'RESPONSIVE_BUTTON_ALIGNMENTS_RESOLVED' },
  summaryField: 'resolvedAlignments',
  target: widgetTarget({
    kinds: ['button'],
    entriesField: 'widgets',
    sourceCountField: 'sourceButtonWidgetCount',
    resolvedCountField: 'resolvedWidgetCount',
    notTargetSuffix: 'SOURCE_NOT_BUTTON',
    notTargetMessage: (subject) => `${subject} sourceNodeId must identify an existing neutral Button node.`,
    bindingMissingMessage: (sourceNodeId) => `Generated Button binding missing for sourceNodeId ${sourceNodeId}.`,
    reviewMessage: 'Review nodes cannot participate in responsive Button binding.',
    matches: (node, settings) => desktopAlignMatches(expectedDesktopButtonAlignment((node as P15NeutralButtonNode).align), settings),
    driftPathSuffix: '.settings.align',
    driftMessage: 'Generated Button desktop alignment drifted from the exact normalized target vocabulary.',
  }),
  fields: [
    { field: 'tabletAlign', settingKey: EVIDENCE.tabletSettingKey, codec: alignCodec, conflictSubject: 'tablet alignment' },
    { field: 'mobileAlign', settingKey: EVIDENCE.mobileSettingKey, codec: alignCodec, conflictSubject: 'mobile alignment' },
  ],
  entryEnvelopeMessage: 'Each responsive Button alignment entry may contain only sourceNodeId plus tablet/mobile alignment values.',
  overrideRequiredMessage: 'Each responsive Button alignment entry must explicitly provide tabletAlign and/or mobileAlign.',
  valueInvalidMessage: 'Button responsive alignment must be left, center, right or justify.',
  messages: {
    upstream: 'Responsive Button alignment requires an existing review-free generated local candidate.',
    authority: 'Responsive Button alignment cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
  },
});

const API = familyApi<P15ElementorResponsiveButtonAlignmentResultV1>(FAMILY);

/**
 * Apply only explicit default tablet/mobile alignment overrides to exact generated Button bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer responsive values,
 * alter normalized desktop alignment, add custom breakpoints, or claim responsive closure.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4a); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-widget-family-golden.test.ts`.
 */
export function resolveP15ElementorResponsiveButtonAlignments(sourceValue: unknown, manifestValue: unknown): P15ElementorResponsiveButtonAlignmentResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized alignment metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveButtonAlignmentSummary(result: P15ElementorResponsiveButtonAlignmentResultV1): string {
  return API.serialize(result);
}
