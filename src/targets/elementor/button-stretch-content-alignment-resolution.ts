import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { enumCodec } from './mapping-engine/codecs';
import type { ContainerPropertyFamily, FamilySettingWrite } from './mapping-engine/property-family';
import { isRecord, onlyAllowedKeys, validSourceNodeId } from './mapping-engine/shared-validation';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';
import type { P15NeutralButtonNode } from './neutral-export-ir';
import type { ElementorTemplateV04 } from './template-v04';

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

export interface P15ElementorButtonStretchContentAlignmentManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonStretchContentAlignmentEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonStretchContentAlignmentIssueCode =
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_IR_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_ENTRIES_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_ENTRY_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_ALIGNMENT_CONFLICT'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_STRETCH_REQUIRED'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_VALUE_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonStretchContentAlignmentIssueV1 {
  code: P15ElementorButtonStretchContentAlignmentIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonStretchContentAlignmentStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_STRETCH_CONTENT_ALIGNMENT_OVERRIDES'
  | 'BUTTON_STRETCH_CONTENT_ALIGNMENTS_RESOLVED';

export interface P15ElementorButtonStretchContentAlignmentResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_RESULT_VERSION;
  status: P15ElementorButtonStretchContentAlignmentStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedAlignments: P15ElementorButtonStretchContentAlignmentEntryV1[];
  issues: P15ElementorButtonStretchContentAlignmentIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

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

/**
 * Apply only an explicit Button stretch plus bounded desktop/tablet/mobile content alignment to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonStretchContentAlignments(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonStretchContentAlignmentResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorButtonStretchContentAlignmentResultV1;
}

/** Serialize only sanitized stretch/content alignment metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonStretchContentAlignmentSummary(
  result: P15ElementorButtonStretchContentAlignmentResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
