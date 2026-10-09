import {
  familyApi,
  type FamilyAuthorityFlag,
  type FamilyIssueCode,
  type FamilyIssueV1,
  type FamilyManifestV1,
  type FamilyResultV1,
  type FamilyStatus,
} from './mapping-engine/contract-types';
import { elementorPxSlider, enumCodec, pxNumberCodec } from './mapping-engine/codecs';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import { exactKeys, isRecord } from './mapping-engine/shared-validation';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';

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

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_ICON_BASICS_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_ICON_BASICS_RESULT_VERSION;
  status: P15ElementorButtonIconBasicsStatus;
  entriesField: 'buttons';
  entry: P15ElementorButtonIconBasicsEntryV1;
  summaryField: 'resolvedIcons';
  summary: P15ElementorButtonIconBasicsEntryV1;
  issueCode: P15ElementorButtonIconBasicsIssueCode;
  noun: 'Button';
  flags: FamilyAuthorityFlag<'styleInferencePerformed' | 'iconInferencePerformed' | 'svgImportPerformed', 'responsiveClosureClaim'>;
};
export type P15ElementorButtonIconBasicsManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorButtonIconBasicsIssueCode =
  FamilyIssueCode<'P15_BUTTON_ICON_BASICS', 'SOURCE_NOT_BUTTON' | 'ICON_INVALID' | 'ICON_ALIGNMENT_INVALID' | 'ICON_INDENT_INVALID'>;
export type P15ElementorButtonIconBasicsIssueV1 = FamilyIssueV1<P15ElementorButtonIconBasicsIssueCode>;
export type P15ElementorButtonIconBasicsStatus = FamilyStatus<'NO_BUTTON_ICON_OVERRIDES', 'BUTTON_ICON_BASICS_RESOLVED'>;
export type P15ElementorButtonIconBasicsResultV1 = FamilyResultV1<Contract>;

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

const API = familyApi<P15ElementorButtonIconBasicsResultV1>(FAMILY);

/**
 * Apply only one exact bounded Font Awesome icon, its alignment and indent to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4c); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-style-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonIconBasics(sourceValue: unknown, manifestValue: unknown): P15ElementorButtonIconBasicsResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized icon metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonIconBasicsSummary(result: P15ElementorButtonIconBasicsResultV1): string {
  return API.serialize(result);
}
