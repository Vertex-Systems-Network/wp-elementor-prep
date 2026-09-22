import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_EVIDENCE,
  P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_MANIFEST_VERSION,
  resolveP15ElementorContainerSemanticHtmlTag,
  serializeP15ElementorContainerSemanticHtmlTagSummary,
  type P15ElementorContainerSemanticHtmlTagManifestV1,
  type P15ElementorContainerSemanticHtmlTagResultV1,
} from '../src/targets/elementor/container-semantic-html-tag-resolution';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  type P15NeutralExportDocumentV1,
} from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

function sourceDocument(): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Container semantic HTML tag private source',
    documentType: 'section',
    nodes: [
      {
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'row',
        children: [
          {
            kind: 'container',
            sourceNodeId: 'nested',
            direction: 'column',
            children: [
              {
                kind: 'text',
                sourceNodeId: 'copy',
                text: 'PRIVATE SEMANTIC TAG COPY',
                align: 'start',
              },
            ],
          },
        ],
      },
    ],
  };
}

function baseIdentityDigest(source: P15NeutralExportDocumentV1): string {
  const generation = generateElementorV3TemplateCandidate(source);
  if (generation.status !== 'GENERATED_LOCAL_CANDIDATE' || !generation.candidate) {
    throw new Error('fixture must generate a ready base candidate');
  }
  return buildElementorTemplateCandidateIdentity(generation.candidate).digest;
}

function manifest(
  source: P15NeutralExportDocumentV1,
  containers: P15ElementorContainerSemanticHtmlTagManifestV1['containers'],
): P15ElementorContainerSemanticHtmlTagManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: baseIdentityDigest(source),
    containers,
    responsiveInferencePerformed: false,
    figmaMutation: false,
    networkAccess: false,
    responsiveClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
  };
}

function settingsOf(element: unknown): Record<string, unknown> {
  if (typeof element !== 'object' || element === null || Array.isArray(element)) {
    throw new Error('expected element object');
  }
  const settings = (element as Record<string, unknown>).settings;
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
    throw new Error('expected settings object');
  }
  return settings as Record<string, unknown>;
}

describe('P15 exact source-bound Container semantic HTML tag resolution', () => {
  it('writes only exact Elementor 4.2.4 html_tag setting for an explicit semantic tag', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorContainerSemanticHtmlTag(source, manifest(source, [
      { sourceNodeId: 'root', htmlTag: 'main' },
    ]));

    expect(P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_EVIDENCE).toEqual({
      elementorVersion: '4.2.4',
      elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
      containerSourcePath: 'includes/elements/container.php',
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      controlName: 'html_tag',
      settingKey: 'html_tag',
      defaultTag: 'div',
      linkedTag: 'a',
      acceptedTags: ['header', 'footer', 'main', 'article', 'section', 'aside', 'nav'],
    });

    expect(result.status).toBe('CONTAINER_SEMANTIC_HTML_TAG_RESOLVED');
    expect(result.sourceContainerCount).toBe(2);
    expect(result.resolvedContainerCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');

    const settings = settingsOf(result.template?.content[0]);
    expect(settings.html_tag).toBe('main');
    expect(settings).not.toHaveProperty('link');
    expect(settings).not.toHaveProperty('overflow');
    expect(settings).not.toHaveProperty('html_tag_tablet');
    expect(settings).not.toHaveProperty('html_tag_mobile');

    expect(result.resolvedHtmlTags).toEqual([
      { sourceNodeId: 'root', htmlTag: 'main' },
    ]);
    expect(result.baseCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.resolvedCandidateIdentityDigest).not.toBe(result.baseCandidateIdentityDigest);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('accepts every bounded semantic non-link tag and rejects implicit inference', () => {
    const source = sourceDocument();
    const values = ['header', 'footer', 'main', 'article', 'section', 'aside', 'nav'] as const;

    for (const htmlTag of values) {
      const result = resolveP15ElementorContainerSemanticHtmlTag(source, manifest(source, [
        { sourceNodeId: 'root', htmlTag },
      ]));
      expect(result.status).toBe('CONTAINER_SEMANTIC_HTML_TAG_RESOLVED');
      expect(settingsOf(result.template?.content[0]).html_tag).toBe(htmlTag);
      expect(result.resolvedHtmlTags).toEqual([{ sourceNodeId: 'root', htmlTag }]);
    }
  });

  it('binds nested containers and leaves root/default tag untouched', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorContainerSemanticHtmlTag(source, manifest(source, [
      { sourceNodeId: 'nested', htmlTag: 'nav' },
    ]));

    expect(result.status).toBe('CONTAINER_SEMANTIC_HTML_TAG_RESOLVED');
    const root = result.template?.content[0];
    const nested = root?.elements[0];
    expect(settingsOf(root)).not.toHaveProperty('html_tag');
    expect(settingsOf(nested).html_tag).toBe('nav');
    expect(result.resolvedHtmlTags).toEqual([
      { sourceNodeId: 'nested', htmlTag: 'nav' },
    ]);
  });

  it('returns a deterministic no-op when no semantic tag overrides are supplied', () => {
    const source = sourceDocument();
    const first = resolveP15ElementorContainerSemanticHtmlTag(source, manifest(source, []));
    const second = resolveP15ElementorContainerSemanticHtmlTag(source, manifest(source, []));

    expect(first.status).toBe('NO_CONTAINER_SEMANTIC_HTML_TAG_OVERRIDES');
    expect(first.resolvedContainerCount).toBe(0);
    expect(first.baseCandidateIdentityDigest).toBe(first.resolvedCandidateIdentityDigest);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first).toEqual(second);
  });

  it('fails closed for stale source/candidate replay', () => {
    const source = sourceDocument();
    const valid = manifest(source, [{ sourceNodeId: 'root', htmlTag: 'section' }]);

    const staleSource = resolveP15ElementorContainerSemanticHtmlTag(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(staleSource.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleSource.issues.map((issue) => issue.code))
      .toContain('P15_CONTAINER_SEMANTIC_HTML_TAG_SOURCE_FINGERPRINT_MISMATCH');

    const staleCandidate = resolveP15ElementorContainerSemanticHtmlTag(source, {
      ...valid,
      baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64),
    });
    expect(staleCandidate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(staleCandidate.issues.map((issue) => issue.code))
      .toContain('P15_CONTAINER_SEMANTIC_HTML_TAG_BASE_CANDIDATE_IDENTITY_MISMATCH');
  });

  it('rejects duplicate, non-container, linked/default/custom and unknown-field entries', () => {
    const source = sourceDocument();

    const duplicate = resolveP15ElementorContainerSemanticHtmlTag(source, manifest(source, [
      { sourceNodeId: 'root', htmlTag: 'header' },
      { sourceNodeId: 'root', htmlTag: 'footer' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code))
      .toContain('P15_CONTAINER_SEMANTIC_HTML_TAG_DUPLICATE_SOURCE_ID');

    const nonContainer = resolveP15ElementorContainerSemanticHtmlTag(source, manifest(source, [
      { sourceNodeId: 'copy', htmlTag: 'section' },
    ]));
    expect(nonContainer.issues.map((issue) => issue.code))
      .toContain('P15_CONTAINER_SEMANTIC_HTML_TAG_SOURCE_NOT_CONTAINER');

    for (const value of ['', 'div', 'a', 'p', 'span', 'script', 'custom-tag', 1, null, {}]) {
      const invalid = resolveP15ElementorContainerSemanticHtmlTag(source, {
        ...manifest(source, []),
        containers: [{ sourceNodeId: 'root', htmlTag: value }],
      });
      expect(invalid.issues.map((issue) => issue.code))
        .toContain('P15_CONTAINER_SEMANTIC_HTML_TAG_VALUE_INVALID');
    }

    const unknownField = resolveP15ElementorContainerSemanticHtmlTag(source, {
      ...manifest(source, []),
      containers: [{
        sourceNodeId: 'root',
        htmlTag: 'main',
        link: { url: 'https://example.invalid' },
      }],
    });
    expect(unknownField.issues.map((issue) => issue.code))
      .toContain('P15_CONTAINER_SEMANTIC_HTML_TAG_ENTRY_INVALID');
  });

  it('blocks review-bearing upstream IR and rejects authority inflation', () => {
    const blockedSource: P15NeutralExportDocumentV1 = {
      schemaVersion: 1,
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      title: 'Blocked Container semantic tag source',
      documentType: 'section',
      nodes: [{
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'row',
        children: [{
          kind: 'review',
          sourceNodeId: 'manual',
          reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW',
          detail: 'must remain blocked',
        }],
      }],
    };

    const blocked = resolveP15ElementorContainerSemanticHtmlTag(blockedSource, {});
    expect(blocked.status).toBe('BLOCKED_UPSTREAM_GENERATION');
    expect(blocked.template).toBeNull();
    expect(blocked.candidate).toBeNull();
    expect(blocked.issues).toEqual([
      expect.objectContaining({ code: 'P15_CONTAINER_SEMANTIC_HTML_TAG_UPSTREAM_GENERATION_NOT_READY' }),
    ]);

    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', htmlTag: 'article' }]);
    const inflated = resolveP15ElementorContainerSemanticHtmlTag(source, {
      ...raw,
      targetCompatibilityClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code))
      .toContain('P15_CONTAINER_SEMANTIC_HTML_TAG_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only sanitized semantic-tag metadata and refuses authority-inflated results', () => {
    const source = sourceDocument();
    const raw = manifest(source, [{ sourceNodeId: 'root', htmlTag: 'aside' }]);
    const result = resolveP15ElementorContainerSemanticHtmlTag(source, raw);
    const serialized = serializeP15ElementorContainerSemanticHtmlTagSummary(result);

    expect(serialized).not.toContain('PRIVATE SEMANTIC TAG COPY');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('"candidate"');
    expect(serialized).not.toContain('"template"');
    expect(serialized).toContain('"settingKey": "html_tag"');
    expect(serialized).toContain('"htmlTag": "aside"');
    expect(serialized).toContain('"linkedTag": "a"');

    const mutatedIssue = {
      ...resolveP15ElementorContainerSemanticHtmlTag(source, {
        ...raw,
        sourceIrFingerprint: 'sha256:' + '2'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: 'PRIVATE SEMANTIC TAG COPY',
    }));
    expect(serializeP15ElementorContainerSemanticHtmlTagSummary(mutatedIssue))
      .not.toContain('PRIVATE SEMANTIC TAG COPY');

    const inflatedResult = {
      ...result,
      productionAcceptance: true,
    } as unknown as P15ElementorContainerSemanticHtmlTagResultV1;
    expect(() => serializeP15ElementorContainerSemanticHtmlTagSummary(inflatedResult))
      .toThrow(/authority-inflated/);
  });
});
