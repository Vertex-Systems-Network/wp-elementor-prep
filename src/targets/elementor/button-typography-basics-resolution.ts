import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { enumCodec } from './mapping-engine/codecs';
import { groupPrefixConflict } from './mapping-engine/families/button-style';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import { buttonWidgetTarget } from './mapping-engine/widget-binding';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_MANIFEST_VERSION =
  'p15-elementor-button-typography-basics-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_RESULT_VERSION =
  'p15-elementor-button-typography-basics-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_FONT_WEIGHTS = [
  '100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold',
] as const;
export const P15_ELEMENTOR_BUTTON_TEXT_TRANSFORMS = [
  'uppercase', 'lowercase', 'capitalize', 'none',
] as const;
export const P15_ELEMENTOR_BUTTON_FONT_STYLES = [
  'normal', 'italic', 'oblique',
] as const;

export const P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  typographyGroupSourcePath: 'includes/controls/groups/typography.php',
  typographyGroupSourceBlobSha: 'eea951b6331bd84c80e24b7fb6ab249e5c4c41a1',
  groupBaseSourcePath: 'includes/controls/groups/base.php',
  groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234',
  groupName: 'typography',
  groupPrefixRule: '{{ControlName}}_',
  starterFieldName: 'typography',
  starterSettingKey: 'typography_typography',
  starterValue: 'custom',
  fontWeightFieldName: 'font_weight',
  fontWeightSettingKey: 'typography_font_weight',
  textTransformFieldName: 'text_transform',
  textTransformSettingKey: 'typography_text_transform',
  fontStyleFieldName: 'font_style',
  fontStyleSettingKey: 'typography_font_style',
  acceptedFontWeights: P15_ELEMENTOR_BUTTON_FONT_WEIGHTS,
  acceptedTextTransforms: P15_ELEMENTOR_BUTTON_TEXT_TRANSFORMS,
  acceptedFontStyles: P15_ELEMENTOR_BUTTON_FONT_STYLES,
});

export type P15ElementorButtonFontWeight =
  typeof P15_ELEMENTOR_BUTTON_FONT_WEIGHTS[number];
export type P15ElementorButtonTextTransform =
  typeof P15_ELEMENTOR_BUTTON_TEXT_TRANSFORMS[number];
export type P15ElementorButtonFontStyle =
  typeof P15_ELEMENTOR_BUTTON_FONT_STYLES[number];

export interface P15ElementorButtonTypographyBasicsEntryV1 {
  sourceNodeId: string;
  fontWeight?: P15ElementorButtonFontWeight;
  textTransform?: P15ElementorButtonTextTransform;
  fontStyle?: P15ElementorButtonFontStyle;
}

export interface P15ElementorButtonTypographyBasicsManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonTypographyBasicsEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonTypographyBasicsIssueCode =
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_SOURCE_IR_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_ENTRIES_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_ENTRY_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_FONT_WEIGHT_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_TEXT_TRANSFORM_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_FONT_STYLE_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_OVERRIDE_REQUIRED'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_TYPOGRAPHY_BASICS_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonTypographyBasicsIssueV1 {
  code: P15ElementorButtonTypographyBasicsIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonTypographyBasicsStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_TYPOGRAPHY_BASICS_OVERRIDES'
  | 'BUTTON_TYPOGRAPHY_BASICS_RESOLVED';

export interface P15ElementorButtonTypographyBasicsResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_RESULT_VERSION;
  status: P15ElementorButtonTypographyBasicsStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedTypographyBasics: P15ElementorButtonTypographyBasicsEntryV1[];
  issues: P15ElementorButtonTypographyBasicsIssueV1[];
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

const EVIDENCE = P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_EVIDENCE;
const FIELDS = [
  ['fontWeight', EVIDENCE.fontWeightSettingKey],
  ['textTransform', EVIDENCE.textTransformSettingKey],
  ['fontStyle', EVIDENCE.fontStyleSettingKey],
] as const;
const FAMILY = containerStyleFamily({
  id: 'button-typography-basics',
  issuePrefix: 'P15_BUTTON_TYPOGRAPHY_BASICS',
  subject: 'Button typography',
  manifestVersion: P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_TYPOGRAPHY_BASICS_OVERRIDES', resolved: 'BUTTON_TYPOGRAPHY_BASICS_RESOLVED' },
  summaryField: 'resolvedTypographyBasics',
  target: buttonWidgetTarget('Review nodes cannot participate in Button typography binding.'),
  fields: [
    { field: 'fontWeight', codec: enumCodec(P15_ELEMENTOR_BUTTON_FONT_WEIGHTS), optional: 'defined' },
    { field: 'textTransform', codec: enumCodec(P15_ELEMENTOR_BUTTON_TEXT_TRANSFORMS), optional: 'defined' },
    { field: 'fontStyle', codec: enumCodec(P15_ELEMENTOR_BUTTON_FONT_STYLES), optional: 'defined' },
  ],
  requireAny: { code: 'OVERRIDE_REQUIRED', message: 'Each entry must explicitly provide at least one typography capability.' },
  checks: [
    { fields: ['fontWeight'], code: 'FONT_WEIGHT_INVALID', pathSuffix: '.fontWeight', message: 'fontWeight must use the exact bounded Elementor 4.2.4 select vocabulary.' },
    { fields: ['textTransform'], code: 'TEXT_TRANSFORM_INVALID', pathSuffix: '.textTransform', message: 'textTransform must be uppercase, lowercase, capitalize or none.' },
    { fields: ['fontStyle'], code: 'FONT_STYLE_INVALID', pathSuffix: '.fontStyle', message: 'fontStyle must be normal, italic or oblique.' },
  ],
  leadingAuthorityFlags: ['styleInferencePerformed'],
  extraIssueSuffixes: ['FONT_WEIGHT_INVALID', 'TEXT_TRANSFORM_INVALID', 'FONT_STYLE_INVALID'],
  entryEnvelopeMessage: 'Each entry may contain only sourceNodeId and explicit fontWeight/textTransform/fontStyle values.',
  messages: {
    notContainer: 'sourceNodeId must identify an existing neutral Button node.',
    authority: 'Button typography resolution cannot grant inference, mutation, network, closure, compatibility, production or download authority.',
    entriesInvalid: 'buttons must be a bounded array.',
    manifestSubject: 'Button typography basics',
  },
  // Any existing typography_* setting refuses the whole typography group, not only the written keys.
  conflictScan: groupPrefixConflict('typography_', (key) => `Generated base candidate already contains Button typography setting ${key}.`),
  writes: (entry) => [
    { settingKey: EVIDENCE.starterSettingKey, value: EVIDENCE.starterValue, conflictSubject: EVIDENCE.starterSettingKey },
    ...FIELDS
      .filter(([field]) => entry[field] !== undefined)
      .map(([field, settingKey]) => ({ settingKey, value: entry[field], conflictSubject: settingKey })),
  ],
});

/**
 * Apply only explicit Button font weight, text transform and font style to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-typography-gradient-golden.test.ts`.
 */
export function resolveP15ElementorButtonTypographyBasics(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonTypographyBasicsResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorButtonTypographyBasicsResultV1;
}

/** Serialize only sanitized typography metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonTypographyBasicsSummary(
  result: P15ElementorButtonTypographyBasicsResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
