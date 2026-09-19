import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_SEMANTIC_RESOLUTION_MANIFEST_VERSION,
  resolveP15ElementorTextSemantics,
  serializeP15ElementorSemanticResolutionSummary,
  type P15ElementorSemanticResolutionManifestV1,
  type P15ElementorSemanticResolutionResultV1,
} from '../src/targets/elementor/semantic-resolution';
import {
  fingerprintP15NeutralExportDocument,
  P15_NEUTRAL_EXPORT_IR_IDENTITY_VERSION,
  serializeCanonicalP15NeutralExportDocument,
} from '../src/targets/elementor/neutral-export-ir-identity';
import { fingerprintP15ElementorImageAssetSourceIr } from '../src/targets/elementor/image-asset-resolution';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  type P15NeutralExportDocumentV1,
} from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';
import { assessP15ElementorCompatibilityReadiness } from '../src/targets/elementor/compatibility-readiness';

function sourceDocument(includeReview = false): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Semantic resolution fixture',
    documentType: 'section',
    nodes: [
      {
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'column',
        children: [
          {
            kind: 'text',
            sourceNodeId: 'hero-title',
            text: 'Exact <Hero> & title',
            align: 'center',
          },
          {
            kind: 'text',
            sourceNodeId: 'cta',
            text: 'Contact us',
            align: 'end',
          },
          {
            kind: 'text',
            sourceNodeId: 'body',
            text: 'Keep me as normal body text.',
            align: 'start',
          },
          ...(includeReview ? [{
            kind: 'review' as const,
            sourceNodeId: 'manual',
            reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW',
            detail: 'Preserve unrelated review.',
          }] : []),
        ],
      },
    ],
  };
}

function manifest(
  source: P15NeutralExportDocumentV1,
  semantics: P15ElementorSemanticResolutionManifestV1['semantics'],
): P15ElementorSemanticResolutionManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_SEMANTIC_RESOLUTION_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    semantics,
    semanticInferencePerformed: false,
    figmaMutation: false,
    networkAccess: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
  };
}

describe('P15 canonical neutral IR identity', () => {
  it('uses one deterministic generic fingerprint independent of object key order and preserves image wrapper identity', () => {
    const first = sourceDocument();
    const second = {
      nodes: [
        {
          children: [
            { align: 'center', text: 'Exact <Hero> & title', sourceNodeId: 'hero-title', kind: 'text' },
            { align: 'end', sourceNodeId: 'cta', kind: 'text', text: 'Contact us' },
            { text: 'Keep me as normal body text.', kind: 'text', align: 'start', sourceNodeId: 'body' },
          ],
          direction: 'column',
          sourceNodeId: 'root',
          kind: 'container',
        },
      ],
      documentType: 'section',
      title: 'Semantic resolution fixture',
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      schemaVersion: 1,
    } as P15NeutralExportDocumentV1;

    expect(P15_NEUTRAL_EXPORT_IR_IDENTITY_VERSION).toBe('p15-neutral-export-ir-identity-v1');
    expect(serializeCanonicalP15NeutralExportDocument(second))
      .toBe(serializeCanonicalP15NeutralExportDocument(first));
    expect(fingerprintP15NeutralExportDocument(second))
      .toBe(fingerprintP15NeutralExportDocument(first));
    expect(fingerprintP15ElementorImageAssetSourceIr(first))
      .toBe(fingerprintP15NeutralExportDocument(first));
  });
});

describe('P15 exact source-bound semantic resolution', () => {
  it('promotes explicit text nodes to heading/button, preserves text exactly and leaves unlisted text unchanged', () => {
    const source = sourceDocument(true);
    const rawUrl = '/contact?source=hero';
    const result = resolveP15ElementorTextSemantics(source, manifest(source, [
      { sourceNodeId: 'hero-title', targetKind: 'heading', level: 'h1' },
      {
        sourceNodeId: 'cta',
        targetKind: 'button',
        url: rawUrl,
        openInNewTab: true,
        nofollow: true,
      },
    ]));

    expect(result.status).toBe('SEMANTICS_RESOLVED');
    expect(result.eligibleTextCount).toBe(3);
    expect(result.resolvedSemanticCount).toBe(2);
    expect(result.remainingTextCount).toBe(1);
    expect(result.remainingReviewCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.document?.nodes[0]).toEqual(expect.objectContaining({
      kind: 'container',
      children: [
        {
          kind: 'heading',
          sourceNodeId: 'hero-title',
          text: 'Exact <Hero> & title',
          level: 'h1',
          align: 'center',
        },
        {
          kind: 'button',
          sourceNodeId: 'cta',
          text: 'Contact us',
          url: rawUrl,
          openInNewTab: true,
          nofollow: true,
          align: 'end',
        },
        {
          kind: 'text',
          sourceNodeId: 'body',
          text: 'Keep me as normal body text.',
          align: 'start',
        },
        {
          kind: 'review',
          sourceNodeId: 'manual',
          reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW',
          detail: 'Preserve unrelated review.',
        },
      ],
    }));
    expect(result.semanticInferencePerformed).toBe(false);
    expect(result.figmaMutation).toBe(false);
    expect(result.networkAccess).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('feeds promoted heading/button through existing deterministic generator and readiness as native mappings', () => {
    const source = sourceDocument();
    const resolution = resolveP15ElementorTextSemantics(source, manifest(source, [
      { sourceNodeId: 'hero-title', targetKind: 'heading', level: 'h2' },
      { sourceNodeId: 'cta', targetKind: 'button', url: '#contact' },
    ]));
    expect(resolution.status).toBe('SEMANTICS_RESOLVED');
    expect(resolution.document).not.toBeNull();

    const generation = generateElementorV3TemplateCandidate(resolution.document);
    expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(generation.template).not.toBeNull();
    const serializedTemplate = JSON.stringify(generation.template);
    expect(serializedTemplate).toContain('"widgetType":"heading"');
    expect(serializedTemplate).toContain('"header_size":"h2"');
    expect(serializedTemplate).toContain('"widgetType":"button"');
    expect(serializedTemplate).toContain('"url":"#contact"');
    expect(serializedTemplate).toContain('Exact <Hero> & title');
    expect(serializedTemplate).toContain('Keep me as normal body text.');

    const readiness = assessP15ElementorCompatibilityReadiness(resolution.document!);
    expect(readiness.status).toBe('READY');
    expect(readiness.compatibilityCoverage).toBe(100);
    expect(readiness.counts.native).toBe(4);
    expect(readiness.counts.unknown).toBe(0);
    expect(readiness.counts.unsupported).toBe(0);
    expect(readiness.findings).toEqual([
      { sourceNodeId: 'root', category: 'NATIVE', reasonCode: 'P15_NATIVE_CONTAINER' },
      { sourceNodeId: 'hero-title', category: 'NATIVE', reasonCode: 'P15_NATIVE_HEADING' },
      { sourceNodeId: 'cta', category: 'NATIVE', reasonCode: 'P15_NATIVE_BUTTON' },
      { sourceNodeId: 'body', category: 'NATIVE', reasonCode: 'P15_NATIVE_TEXT_EDITOR' },
    ]);
    expect(readiness.targetCompatibilityClaim).toBe(false);
    expect(readiness.productionAcceptance).toBe(false);
  });

  it('accepts an empty explicit mapping without inferring any semantics', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorTextSemantics(source, manifest(source, []));

    expect(result.status).toBe('NO_SEMANTIC_RESOLUTIONS');
    expect(result.resolvedSemanticCount).toBe(0);
    expect(result.remainingTextCount).toBe(3);
    expect(result.document).toEqual(source);
    expect(result.semanticInferencePerformed).toBe(false);
  });

  it('fails closed for justified text promotion rather than silently changing alignment', () => {
    const source = sourceDocument();
    const root = source.nodes[0];
    if (!root || root.kind !== 'container') throw new Error('fixture container missing');
    const body = root.children.find((node) => node.sourceNodeId === 'body');
    if (!body || body.kind !== 'text') throw new Error('fixture text missing');
    body.align = 'justify';

    const result = resolveP15ElementorTextSemantics(source, manifest(source, [
      { sourceNodeId: 'body', targetKind: 'heading', level: 'h3' },
    ]));
    expect(result.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(result.document).toBeNull();
    expect(result.issues.map((issue) => issue.code))
      .toContain('P15_SEMANTIC_JUSTIFY_ALIGNMENT_UNSUPPORTED');
  });

  it('rejects stale, duplicate, non-text, invalid-level, unsafe-URL and authority-inflated mappings', () => {
    const source = sourceDocument();

    const staleManifest = manifest(source, [{ sourceNodeId: 'hero-title', targetKind: 'heading', level: 'h1' }]);
    const stale = resolveP15ElementorTextSemantics(source, {
      ...staleManifest,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(stale.issues.map((issue) => issue.code)).toContain('P15_SEMANTIC_SOURCE_FINGERPRINT_MISMATCH');

    const duplicate = resolveP15ElementorTextSemantics(source, manifest(source, [
      { sourceNodeId: 'hero-title', targetKind: 'heading', level: 'h1' },
      { sourceNodeId: 'hero-title', targetKind: 'button' },
    ]));
    expect(duplicate.issues.map((issue) => issue.code)).toContain('P15_SEMANTIC_DUPLICATE_SOURCE_ID');

    const nonText = resolveP15ElementorTextSemantics(source, manifest(source, [
      { sourceNodeId: 'root', targetKind: 'heading', level: 'h1' },
    ]));
    expect(nonText.issues.map((issue) => issue.code)).toContain('P15_SEMANTIC_SOURCE_NOT_TEXT');

    const invalidLevel = resolveP15ElementorTextSemantics(source, {
      ...manifest(source, []),
      semantics: [{ sourceNodeId: 'hero-title', targetKind: 'heading', level: 'h0' }],
    });
    expect(invalidLevel.issues.map((issue) => issue.code)).toContain('P15_SEMANTIC_HEADING_LEVEL_INVALID');

    const unsafeUrl = resolveP15ElementorTextSemantics(source, {
      ...manifest(source, []),
      semantics: [{ sourceNodeId: 'cta', targetKind: 'button', url: 'javascript:alert(1)' }],
    });
    expect(unsafeUrl.issues.map((issue) => issue.code)).toContain('P15_SEMANTIC_BUTTON_URL_INVALID');

    const inflated = resolveP15ElementorTextSemantics(source, {
      ...manifest(source, [{ sourceNodeId: 'cta', targetKind: 'button' }]),
      targetCompatibilityClaim: true,
    });
    expect(inflated.issues.map((issue) => issue.code)).toContain('P15_SEMANTIC_AUTHORITY_FLAGS_INVALID');

    for (const result of [stale, duplicate, nonText, invalidLevel, unsafeUrl, inflated]) {
      expect(result.status).toBe('REJECTED_INVALID_MANIFEST');
      expect(result.document).toBeNull();
      expect(result.targetCompatibilityClaim).toBe(false);
      expect(result.productionAcceptance).toBe(false);
    }
  });

  it('serializes only sanitized semantic metadata and rejects mutated fingerprints/authority', () => {
    const source = sourceDocument();
    const rawText = 'Exact <Hero> & title';
    const rawUrl = 'https://example.test/private/contact?secret=semantic';
    const result = resolveP15ElementorTextSemantics(source, manifest(source, [
      { sourceNodeId: 'hero-title', targetKind: 'heading', level: 'h1' },
      { sourceNodeId: 'cta', targetKind: 'button', url: rawUrl },
    ]));

    const serialized = serializeP15ElementorSemanticResolutionSummary(result);
    expect(serialized).not.toContain(rawText);
    expect(serialized).not.toContain('Contact us');
    expect(serialized).not.toContain(rawUrl);
    expect(serialized).not.toContain('secret=semantic');
    expect(serialized).not.toContain('"document"');
    expect(serialized).toContain('"targetKind": "heading"');
    expect(serialized).toContain('"targetKind": "button"');

    const rejected = resolveP15ElementorTextSemantics(source, {
      ...manifest(source, [{ sourceNodeId: 'hero-title', targetKind: 'heading', level: 'h1' }]),
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    rejected.issues = rejected.issues.map((issue) => ({ ...issue, message: rawText + rawUrl }));
    expect(serializeP15ElementorSemanticResolutionSummary(rejected)).not.toContain(rawText);
    expect(serializeP15ElementorSemanticResolutionSummary(rejected)).not.toContain(rawUrl);

    const buttonEntry = result.resolvedSemantics.find((entry) => entry.targetKind === 'button');
    expect(buttonEntry?.targetKind).toBe('button');
    const invalidFingerprint = {
      ...result,
      resolvedSemantics: result.resolvedSemantics.map((entry) => (
        entry.targetKind === 'button'
          ? { ...entry, urlFingerprint: rawUrl }
          : entry
      )),
    } as P15ElementorSemanticResolutionResultV1;
    expect(() => serializeP15ElementorSemanticResolutionSummary(invalidFingerprint))
      .toThrow(/authority-inflated/);

    const inflated = {
      ...result,
      productionAcceptance: true,
    } as unknown as P15ElementorSemanticResolutionResultV1;
    expect(() => serializeP15ElementorSemanticResolutionSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
