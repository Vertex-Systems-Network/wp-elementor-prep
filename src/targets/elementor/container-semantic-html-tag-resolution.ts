import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import {
  resolveContainerPropertyFamily,
  serializeContainerPropertyFamilySummary,
  type ContainerFamilyResult,
} from './mapping-engine/container-family-engine';
import { enumCodec } from './mapping-engine/codecs';
import { containerStyleFamily } from './mapping-engine/families/container-style';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_MANIFEST_VERSION =
  'p15-elementor-container-semantic-html-tag-manifest-v1' as const;
export const P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_RESULT_VERSION =
  'p15-elementor-container-semantic-html-tag-result-v1' as const;
export const P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  controlName: 'html_tag',
  settingKey: 'html_tag',
  defaultTag: 'div',
  linkedTag: 'a',
  acceptedTags: ['header', 'footer', 'main', 'article', 'section', 'aside', 'nav'] as const,
});

export type P15ElementorContainerSemanticHtmlTagValue =
  | 'header'
  | 'footer'
  | 'main'
  | 'article'
  | 'section'
  | 'aside'
  | 'nav';

export interface P15ElementorContainerSemanticHtmlTagEntryV1 {
  sourceNodeId: string;
  htmlTag: P15ElementorContainerSemanticHtmlTagValue;
}

export interface P15ElementorContainerSemanticHtmlTagManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorContainerSemanticHtmlTagEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorContainerSemanticHtmlTagIssueCode =
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_SOURCE_IR_INVALID'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_MANIFEST_NOT_OBJECT'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_MANIFEST_FIELDS_INVALID'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_MANIFEST_VERSION_INVALID'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_SOURCE_FINGERPRINT_INVALID'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_ENTRIES_INVALID'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_ENTRY_INVALID'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_DUPLICATE_SOURCE_ID'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_SOURCE_NOT_CONTAINER'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_VALUE_INVALID'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_AUTHORITY_FLAGS_INVALID'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_GENERATOR_BINDING_MISMATCH'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_CONTAINER_SEMANTIC_HTML_TAG_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorContainerSemanticHtmlTagIssueV1 {
  code: P15ElementorContainerSemanticHtmlTagIssueCode;
  path: string;
  message: string;
}

export type P15ElementorContainerSemanticHtmlTagStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_CONTAINER_SEMANTIC_HTML_TAG_OVERRIDES'
  | 'CONTAINER_SEMANTIC_HTML_TAG_RESOLVED';

export interface P15ElementorContainerSemanticHtmlTagSummaryEntryV1 {
  sourceNodeId: string;
  htmlTag: P15ElementorContainerSemanticHtmlTagValue;
}

export interface P15ElementorContainerSemanticHtmlTagResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_RESULT_VERSION;
  status: P15ElementorContainerSemanticHtmlTagStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedHtmlTags: P15ElementorContainerSemanticHtmlTagSummaryEntryV1[];
  issues: P15ElementorContainerSemanticHtmlTagIssueV1[];
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

const EVIDENCE = P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_EVIDENCE;
const FAMILY = containerStyleFamily({
  id: 'container-semantic-html-tag',
  issuePrefix: 'P15_CONTAINER_SEMANTIC_HTML_TAG',
  subject: 'Container semantic HTML tag',
  manifestVersion: P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_MANIFEST_VERSION,
  resultVersion: P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_RESULT_VERSION,
  maxEntries: P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_MAX_ENTRIES,
  evidence: EVIDENCE,
  statuses: { none: 'NO_CONTAINER_SEMANTIC_HTML_TAG_OVERRIDES', resolved: 'CONTAINER_SEMANTIC_HTML_TAG_RESOLVED' },
  summaryField: 'resolvedHtmlTags',
  fields: [{ field: 'htmlTag', codec: enumCodec(EVIDENCE.acceptedTags) }],
  checks: [{
    fields: ['htmlTag'],
    code: 'VALUE_INVALID',
    pathSuffix: '.htmlTag',
    message: 'Container semantic HTML tag must be one of header, footer, main, article, section, aside or nav.',
  }],
  entryEnvelopeMessage: 'Each Container semantic HTML tag entry may contain only sourceNodeId and htmlTag.',
  messages: {
    notContainer: 'Container semantic HTML tag sourceNodeId must identify an existing neutral Container node.',
  },
  bindingMissingMessage: (sourceNodeId) => `Generated Container binding missing for sourceNodeId ${sourceNodeId}.`,
  writes: (entry) => [
    { settingKey: EVIDENCE.settingKey, value: entry.htmlTag, conflictSubject: 'Container html_tag', conflictMessage: 'Generated base candidate already contains a Container html_tag setting.' },
  ],
});

/**
 * Apply only explicit semantic non-link HTML tags to exact generated Container bindings.
 *
 * The accepted domain is deliberately narrower than Elementor's complete html_tag control:
 * header | footer | main | article | section | aside | nav only.
 * This contract does not infer semantics, reset to div, create links, accept arbitrary/custom tags,
 * infer responsive/layout behavior, or claim compatibility/production authority.
 *
 * Re-expressed over the shared mapping engine (recovery M1.3d); behaviour and every output are
 * proven identical to the original hand-written resolver by `tests/m1-container-family-golden-style.test.ts`.
 */
export function resolveP15ElementorContainerSemanticHtmlTag(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorContainerSemanticHtmlTagResultV1 {
  return resolveContainerPropertyFamily(FAMILY, sourceValue, manifestValue) as unknown as P15ElementorContainerSemanticHtmlTagResultV1;
}

/** Serialize only sanitized semantic HTML tag metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorContainerSemanticHtmlTagSummary(
  result: P15ElementorContainerSemanticHtmlTagResultV1,
): string {
  return serializeContainerPropertyFamilySummary(FAMILY, result as unknown as ContainerFamilyResult);
}
