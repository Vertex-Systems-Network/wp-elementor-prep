import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { elementorPxSlider, enumCodec, pxNumberCodec } from './mapping-engine/codecs';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import { exactKeys, isRecord } from './mapping-engine/shared-validation';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_BUTTON_ICON_BASICS_MANIFEST_VERSION =
  'p15-elementor-button-icon-basics-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_ICON_BASICS_RESULT_VERSION =
  'p15-elementor-button-icon-basics-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_ICON_BASICS_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_BUTTON_ICON_INDENT_MAX_PX = 50 as const;

export const P15_ELEMENTOR_BUTTON_ICON_LIBRARIES = [
  'fa-solid',
  'fa-regular',
  'fa-brands',
] as const;

export const P15_ELEMENTOR_BUTTON_ICON_ALIGNMENTS = [
  'row',
  'row-reverse',
] as const;

export const P15_ELEMENTOR_BUTTON_ICON_BASICS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  iconsControlSourcePath: 'includes/controls/icons.php',
  iconsControlSourceBlobSha: 'd7d9445cb94c852bbb4731e076667fd97dec0554',
  buttonIconFixturePath: 'tests/playwright/sanity/templates/button-icon-styling.json',
  buttonIconFixtureBlobSha: 'ba4b5b444ab41fa69f982dc74af655aa03417783',
  selectedIconControlName: 'selected_icon',
  selectedIconSettingKey: 'selected_icon',
  iconAlignControlName: 'icon_align',
  iconAlignSettingKey: 'icon_align',
  iconIndentControlName: 'icon_indent',
  iconIndentSettingKey: 'icon_indent',
  acceptedIconLibraries: P15_ELEMENTOR_BUTTON_ICON_LIBRARIES,
  acceptedIconAlignments: P15_ELEMENTOR_BUTTON_ICON_ALIGNMENTS,
  iconIndentUnit: 'px',
  iconIndentMinPx: 0,
  iconIndentMaxPx: P15_ELEMENTOR_BUTTON_ICON_INDENT_MAX_PX,
  svgImportAllowed: false,
});

export type P15ElementorButtonIconLibrary =
  typeof P15_ELEMENTOR_BUTTON_ICON_LIBRARIES[number];
export type P15ElementorButtonIconAlignment =
  typeof P15_ELEMENTOR_BUTTON_ICON_ALIGNMENTS[number];

export interface P15ElementorButtonSelectedIconV1 {
  value: string;
  library: P15ElementorButtonIconLibrary;
}

export interface P15ElementorButtonIconBasicsEntryV1 {
  sourceNodeId: string;
  selectedIcon: P15ElementorButtonSelectedIconV1;
  iconAlign?: P15ElementorButtonIconAlignment;
  iconIndentPx?: number;
}

export interface P15ElementorButtonIconBasicsManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_ICON_BASICS_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonIconBasicsEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  iconInferencePerformed: false;
  svgImportPerformed: false;
  figmaMutation: false;
  networkAccess: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonIconBasicsIssueCode =
  | 'P15_BUTTON_ICON_BASICS_SOURCE_IR_INVALID'
  | 'P15_BUTTON_ICON_BASICS_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_ICON_BASICS_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_ICON_BASICS_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_ICON_BASICS_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_ICON_BASICS_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_ICON_BASICS_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_ICON_BASICS_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_ICON_BASICS_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_ICON_BASICS_ENTRIES_INVALID'
  | 'P15_BUTTON_ICON_BASICS_ENTRY_INVALID'
  | 'P15_BUTTON_ICON_BASICS_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_ICON_BASICS_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_ICON_BASICS_ICON_INVALID'
  | 'P15_BUTTON_ICON_BASICS_ICON_ALIGNMENT_INVALID'
  | 'P15_BUTTON_ICON_BASICS_ICON_INDENT_INVALID'
  | 'P15_BUTTON_ICON_BASICS_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_ICON_BASICS_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_ICON_BASICS_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_ICON_BASICS_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonIconBasicsIssueV1 {
  code: P15ElementorButtonIconBasicsIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonIconBasicsStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_ICON_OVERRIDES'
  | 'BUTTON_ICON_BASICS_RESOLVED';

export interface P15ElementorButtonIconBasicsResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_ICON_BASICS_RESULT_VERSION;
  status: P15ElementorButtonIconBasicsStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedIcons: P15ElementorButtonIconBasicsEntryV1[];
  issues: P15ElementorButtonIconBasicsIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  iconInferencePerformed: false;
  svgImportPerformed: false;
  figmaMutation: false;
  networkAccess: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const EVIDENCE = P15_ELEMENTOR_BUTTON_ICON_BASICS_EVIDENCE;
const LIBRARY_PREFIX: Readonly<Record<P15ElementorButtonIconLibrary, string>> = {
  'fa-solid': 'fas',
  'fa-regular': 'far',
  'fa-brands': 'fab',
};
const selectedIconCodec = {
  id: 'font-awesome-selected-icon',
  is: (value: unknown): value is P15ElementorButtonSelectedIconV1 => {
    if (!isRecord(value) || !exactKeys(value, ['library', 'value']) || !enumCodec(P15_ELEMENTOR_BUTTON_ICON_LIBRARIES).is(value.library)) {
      return false;
    }
    if (typeof value.value !== 'string' || value.value.length > 128) return false;
    const match = /^(fas|far|fab) (fa-[a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(value.value);
    return match !== null && match[1] === LIBRARY_PREFIX[value.library];
  },
  snapshot: (value: P15ElementorButtonSelectedIconV1) => ({ ...value }),
  encode: (value: P15ElementorButtonSelectedIconV1) => ({ value: value.value, library: value.library }),
};
const indentCodec = pxNumberCodec({ min: EVIDENCE.iconIndentMinPx, max: EVIDENCE.iconIndentMaxPx });
const conflict = (settingKey: string) => ({
  conflictSubject: settingKey,
  conflictMessage: `Generated base candidate already contains Button setting ${settingKey}.`,
});
const FAMILY = containerStyleFamily({
  id: 'button-icon-basics',
  issuePrefix: 'P15_BUTTON_ICON_BASICS',
  subject: 'Button icon',
  manifestVersion: P15_ELEMENTOR_BUTTON_ICON_BASICS_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_ICON_BASICS_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_ICON_BASICS_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_ICON_OVERRIDES', resolved: 'BUTTON_ICON_BASICS_RESOLVED' },
  summaryField: 'resolvedIcons',
  target: buttonWidgetTarget('Review nodes cannot participate in Button icon binding.'),
  fields: [
    { field: 'selectedIcon', codec: selectedIconCodec },
    { field: 'iconAlign', codec: enumCodec(P15_ELEMENTOR_BUTTON_ICON_ALIGNMENTS), optional: 'defined' },
    { field: 'iconIndentPx', codec: indentCodec, optional: 'defined' },
  ],
  checks: [
    { fields: ['selectedIcon'], code: 'ICON_INVALID', pathSuffix: '.selectedIcon', message: 'selectedIcon must be one exact bounded Font Awesome class/library pair; SVG/URL/custom payloads are rejected.' },
    { fields: ['iconAlign'], code: 'ICON_ALIGNMENT_INVALID', pathSuffix: '.iconAlign', message: 'iconAlign must be row or row-reverse.' },
    { fields: ['iconIndentPx'], code: 'ICON_INDENT_INVALID', pathSuffix: '.iconIndentPx', message: 'iconIndentPx must be a finite px value from 0 through 50.' },
  ],
  // The icon contract interleaves its own flags after responsiveInferencePerformed and carries no closure claim.
  authorityFlags: [
    'styleInferencePerformed',
    'responsiveInferencePerformed',
    'iconInferencePerformed',
    'svgImportPerformed',
    'figmaMutation',
    'networkAccess',
    'targetCompatibilityClaim',
    'productionAcceptance',
    'downloadEnabled',
  ],
  extraIssueSuffixes: ['ICON_INVALID', 'ICON_ALIGNMENT_INVALID', 'ICON_INDENT_INVALID'],
  entryEnvelopeMessage: 'Each entry may contain only sourceNodeId, selectedIcon, iconAlign and iconIndentPx.',
  messages: {
    notContainer: 'sourceNodeId must identify an existing neutral Button node.',
    authority: 'Button icon resolution cannot grant inference/SVG/network/compatibility/production/download authority.',
    entriesInvalid: 'buttons must be a bounded array.',
  },
  writes: (entry) => [
    { settingKey: EVIDENCE.selectedIconSettingKey, value: selectedIconCodec.encode(entry.selectedIcon as P15ElementorButtonSelectedIconV1), ...conflict(EVIDENCE.selectedIconSettingKey) },
    ...(entry.iconAlign === undefined ? [] : [{ settingKey: EVIDENCE.iconAlignSettingKey, value: entry.iconAlign, ...conflict(EVIDENCE.iconAlignSettingKey) }]),
    ...(entry.iconIndentPx === undefined ? [] : [{
      settingKey: EVIDENCE.iconIndentSettingKey,
      value: elementorPxSlider(entry.iconIndentPx as number),
      ...conflict(EVIDENCE.iconIndentSettingKey),
    }]),
  ],
});

/**
 * Apply only one exact bounded Font Awesome icon, its alignment and indent to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-style-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonIconBasics(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonIconBasicsResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorButtonIconBasicsResultV1;
}

/** Serialize only sanitized icon metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonIconBasicsSummary(
  result: P15ElementorButtonIconBasicsResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
