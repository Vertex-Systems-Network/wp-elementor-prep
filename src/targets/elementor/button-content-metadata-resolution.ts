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

import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_BUTTON_CONTENT_METADATA_MANIFEST_VERSION =
  'p15-elementor-button-content-metadata-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_CONTENT_METADATA_RESULT_VERSION =
  'p15-elementor-button-content-metadata-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_CONTENT_METADATA_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_BUTTON_CSS_ID_MAX_LENGTH = 128 as const;

export const P15_ELEMENTOR_BUTTON_TYPES = [
  'info', 'success', 'warning', 'danger',
] as const;
export const P15_ELEMENTOR_BUTTON_SIZES = [
  'xs', 'sm', 'md', 'lg', 'xl',
] as const;

export const P15_ELEMENTOR_BUTTON_CONTENT_METADATA_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  buttonTypeControlName: 'button_type',
  buttonTypeSettingKey: 'button_type',
  acceptedButtonTypes: P15_ELEMENTOR_BUTTON_TYPES,
  sizeControlName: 'size',
  sizeSettingKey: 'size',
  acceptedSizes: P15_ELEMENTOR_BUTTON_SIZES,
  cssIdControlName: 'button_css_id',
  cssIdSettingKey: 'button_css_id',
  cssIdPattern: '^[A-Za-z0-9_]{1,128}$',
  cssIdMaxLength: P15_ELEMENTOR_BUTTON_CSS_ID_MAX_LENGTH,
});

export type P15ElementorButtonType = typeof P15_ELEMENTOR_BUTTON_TYPES[number];
export type P15ElementorButtonSize = typeof P15_ELEMENTOR_BUTTON_SIZES[number];

export interface P15ElementorButtonContentMetadataEntryV1 {
  sourceNodeId: string;
  buttonType?: P15ElementorButtonType;
  buttonSize?: P15ElementorButtonSize;
  buttonCssId?: string;
}

export interface P15ElementorButtonContentMetadataManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_CONTENT_METADATA_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonContentMetadataEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonContentMetadataIssueCode =
  | 'P15_BUTTON_CONTENT_METADATA_SOURCE_IR_INVALID'
  | 'P15_BUTTON_CONTENT_METADATA_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_CONTENT_METADATA_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_CONTENT_METADATA_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_CONTENT_METADATA_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_CONTENT_METADATA_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_CONTENT_METADATA_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_CONTENT_METADATA_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_CONTENT_METADATA_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_CONTENT_METADATA_ENTRIES_INVALID'
  | 'P15_BUTTON_CONTENT_METADATA_ENTRY_INVALID'
  | 'P15_BUTTON_CONTENT_METADATA_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_CONTENT_METADATA_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_CONTENT_METADATA_BUTTON_TYPE_INVALID'
  | 'P15_BUTTON_CONTENT_METADATA_BUTTON_SIZE_INVALID'
  | 'P15_BUTTON_CONTENT_METADATA_CSS_ID_INVALID'
  | 'P15_BUTTON_CONTENT_METADATA_OVERRIDE_REQUIRED'
  | 'P15_BUTTON_CONTENT_METADATA_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_CONTENT_METADATA_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_CONTENT_METADATA_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_CONTENT_METADATA_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonContentMetadataIssueV1 {
  code: P15ElementorButtonContentMetadataIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonContentMetadataStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_CONTENT_METADATA_OVERRIDES'
  | 'BUTTON_CONTENT_METADATA_RESOLVED';

export interface P15ElementorButtonContentMetadataResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_CONTENT_METADATA_RESULT_VERSION;
  status: P15ElementorButtonContentMetadataStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedMetadata: P15ElementorButtonContentMetadataEntryV1[];
  issues: P15ElementorButtonContentMetadataIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const EVIDENCE = P15_ELEMENTOR_BUTTON_CONTENT_METADATA_EVIDENCE;
const typeCodec = enumCodec(P15_ELEMENTOR_BUTTON_TYPES);
const sizeCodec = enumCodec(P15_ELEMENTOR_BUTTON_SIZES);
const cssIdCodec = {
  id: 'button-css-id:[A-Za-z0-9_]{1,128}',
  is: (value: unknown): value is string => typeof value === 'string'
    && value.length >= 1
    && value.length <= P15_ELEMENTOR_BUTTON_CSS_ID_MAX_LENGTH
    && /^[A-Za-z0-9_]+$/.test(value),
  snapshot: (value: string) => value,
  encode: (value: string) => value,
};

/** Fields in contract order: validation, conflict reporting, writes and summary keys follow it. */
const FIELDS = [
  { field: 'buttonType', settingKey: EVIDENCE.buttonTypeSettingKey, codec: typeCodec, code: 'BUTTON_TYPE_INVALID', message: 'buttonType must be one exact non-default Elementor Button type.' },
  { field: 'buttonSize', settingKey: EVIDENCE.sizeSettingKey, codec: sizeCodec, code: 'BUTTON_SIZE_INVALID', message: 'buttonSize must be one exact Elementor Button size.' },
  { field: 'buttonCssId', settingKey: EVIDENCE.cssIdSettingKey, codec: cssIdCodec, code: 'CSS_ID_INVALID', message: 'buttonCssId must contain only ASCII letters, digits and underscore and be 1..128 characters.' },
] as const;
const ENTRY_KEYS = ['buttonCssId', 'buttonSize', 'buttonType', 'sourceNodeId'];

function snapshot(entry: Record<string, unknown> & { sourceNodeId: string }): P15ElementorButtonContentMetadataEntryV1 {
  const result: Record<string, unknown> = { sourceNodeId: entry.sourceNodeId };
  for (const spec of FIELDS) if (entry[spec.field] !== undefined) result[spec.field] = entry[spec.field];
  return result as unknown as P15ElementorButtonContentMetadataEntryV1;
}

const FAMILY: ContainerPropertyFamily<P15ElementorButtonContentMetadataEntryV1, P15ElementorButtonContentMetadataEntryV1> = {
  id: 'button-content-metadata',
  issuePrefix: 'P15_BUTTON_CONTENT_METADATA',
  subject: 'Button content metadata',
  manifestVersion: P15_ELEMENTOR_BUTTON_CONTENT_METADATA_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_BUTTON_CONTENT_METADATA_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_BUTTON_CONTENT_METADATA_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_BUTTON_CONTENT_METADATA_OVERRIDES', resolved: 'BUTTON_CONTENT_METADATA_RESOLVED' },
  summaryField: 'resolvedMetadata',
  target: buttonWidgetTarget('Review nodes cannot participate in Button content metadata binding.'),
  entryKeys: ENTRY_KEYS,
  leadingAuthorityFlags: ['styleInferencePerformed'],
  omittedAuthorityFlags: ['responsiveClosureClaim'],
  extraIssueSuffixes: FIELDS.map((spec) => spec.code),
  // Every conflicting requested key is reported, not only the first.
  conflictMode: 'all',
  entryEnvelopeMessage: 'Each entry may contain only sourceNodeId, buttonType, buttonSize and buttonCssId.',
  messages: {
    notContainer: 'sourceNodeId must identify an existing neutral Button node.',
    entriesInvalid: 'buttons must be a bounded array.',
    authority: 'Button content metadata cannot grant inference/mutation/network/compatibility/production/download authority.',
  },
  codecs: [typeCodec, sizeCodec, cssIdCodec],
  parseEntry(raw) {
    if (FIELDS.every((spec) => raw[spec.field] === undefined)) {
      return { ok: false, code: 'OVERRIDE_REQUIRED', message: 'Each entry must explicitly provide buttonType, buttonSize and/or buttonCssId.' };
    }
    for (const spec of FIELDS) {
      if (raw[spec.field] !== undefined && !spec.codec.is(raw[spec.field])) {
        return { ok: false, code: spec.code, message: spec.message, pathSuffix: `.${spec.field}` };
      }
    }
    return { ok: true, entry: snapshot(raw) };
  },
  writes: (entry) => FIELDS
    .filter((spec) => entry[spec.field] !== undefined)
    .map((spec): FamilySettingWrite => ({
      settingKey: spec.settingKey,
      value: entry[spec.field],
      conflictSubject: spec.settingKey,
      conflictMessage: `Generated base candidate already contains Button setting ${spec.settingKey}.`,
    })),
  summarize: (entry) => snapshot(entry as unknown as Record<string, unknown> & { sourceNodeId: string }),
  validSummary(entry) {
    if (!isRecord(entry) || !onlyAllowedKeys(entry, ENTRY_KEYS) || !validSourceNodeId(entry.sourceNodeId)) return false;
    const provided = FIELDS.filter((spec) => entry[spec.field] !== undefined);
    return provided.length > 0 && provided.every((spec) => spec.codec.is(entry[spec.field]));
  },
};

/**
 * Apply only explicit Button type, size and CSS id metadata to exact generated Button bindings.
 *
 * Re-expressed over the shared mapping engine (recovery M1.4b); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-button-family-golden.test.ts`.
 */
export function resolveP15ElementorButtonContentMetadata(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonContentMetadataResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorButtonContentMetadataResultV1;
}

/** Serialize only sanitized content metadata metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorButtonContentMetadataSummary(
  result: P15ElementorButtonContentMetadataResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
