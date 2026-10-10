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
import { containerStyleFamily } from './mapping-engine/families/container-style';

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

export interface P15ElementorContainerSemanticHtmlTagSummaryEntryV1 {
  sourceNodeId: string;
  htmlTag: P15ElementorContainerSemanticHtmlTagValue;
}

type Contract = {
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_MANIFEST_VERSION;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_RESULT_VERSION;
  status: P15ElementorContainerSemanticHtmlTagStatus;
  entriesField: 'containers';
  entry: P15ElementorContainerSemanticHtmlTagEntryV1;
  summaryField: 'resolvedHtmlTags';
  summary: P15ElementorContainerSemanticHtmlTagSummaryEntryV1;
  issueCode: P15ElementorContainerSemanticHtmlTagIssueCode;
  noun: 'Container';
  flags: FamilyAuthorityFlag;
};
export type P15ElementorContainerSemanticHtmlTagManifestV1 = FamilyManifestV1<Contract>;
export type P15ElementorContainerSemanticHtmlTagIssueCode =
  FamilyIssueCode<'P15_CONTAINER_SEMANTIC_HTML_TAG'>;
export type P15ElementorContainerSemanticHtmlTagIssueV1 = FamilyIssueV1<P15ElementorContainerSemanticHtmlTagIssueCode>;
export type P15ElementorContainerSemanticHtmlTagStatus = FamilyStatus<'NO_CONTAINER_SEMANTIC_HTML_TAG_OVERRIDES', 'CONTAINER_SEMANTIC_HTML_TAG_RESOLVED'>;
export type P15ElementorContainerSemanticHtmlTagResultV1 = FamilyResultV1<Contract>;

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

const API = familyApi<P15ElementorContainerSemanticHtmlTagResultV1>(FAMILY);

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
export function resolveP15ElementorContainerSemanticHtmlTag(sourceValue: unknown, manifestValue: unknown): P15ElementorContainerSemanticHtmlTagResultV1 {
  return API.resolve(sourceValue, manifestValue);
}

/** Serialize only sanitized semantic HTML tag metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorContainerSemanticHtmlTagSummary(result: P15ElementorContainerSemanticHtmlTagResultV1): string {
  return API.serialize(result);
}
