import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_IMAGE_ASSET_RESOLUTION_MANIFEST_VERSION,
  fingerprintP15ElementorImageAssetSourceIr,
  resolveP15ElementorImageAssets,
  serializeP15ElementorImageAssetResolutionSummary,
  type P15ElementorImageAssetResolutionManifestV1,
  type P15ElementorImageAssetResolutionResultV1,
} from '../src/targets/elementor/image-asset-resolution';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  type P15NeutralExportDocumentV1,
} from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';
import { reviewElementorAssetReferences } from '../src/targets/elementor/asset-reference-review';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

function imageReviewDocument(extraReview = false): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Image asset resolution',
    documentType: 'section',
    nodes: [
      {
        kind: 'container',
        sourceNodeId: 'root',
        direction: 'column',
        children: [
          {
            kind: 'review',
            sourceNodeId: 'image-fill',
            reasonCode: 'IMAGE_ASSET_EXPORT_REQUIRED',
            detail: 'Image-backed Figma content requires retained asset resolution.',
          },
          ...(extraReview ? [{
            kind: 'review' as const,
            sourceNodeId: 'manual-layout',
            reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW',
            detail: 'Unrelated review must remain unchanged.',
          }] : []),
        ],
      },
    ],
  };
}

function manifest(
  source: P15NeutralExportDocumentV1,
  assets: Array<{ sourceNodeId: string; url: string }>,
): P15ElementorImageAssetResolutionManifestV1 {
  return {
    schemaVersion: 1,
    manifestVersion: P15_ELEMENTOR_IMAGE_ASSET_RESOLUTION_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15ElementorImageAssetSourceIr(source),
    assets,
    networkAccess: false,
    assetUploadPerformed: false,
    assetReferenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
  };
}

describe('P15 source-bound image asset resolution', () => {
  it('fingerprints semantically identical valid neutral IR independently of object key order', () => {
    const first = imageReviewDocument();
    const second = {
      nodes: [
        {
          children: [
            {
              detail: 'Image-backed Figma content requires retained asset resolution.',
              reasonCode: 'IMAGE_ASSET_EXPORT_REQUIRED',
              sourceNodeId: 'image-fill',
              kind: 'review',
            },
          ],
          direction: 'column',
          sourceNodeId: 'root',
          kind: 'container',
        },
      ],
      documentType: 'section',
      title: 'Image asset resolution',
      irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
      schemaVersion: 1,
    } as P15NeutralExportDocumentV1;

    expect(fingerprintP15ElementorImageAssetSourceIr(second))
      .toBe(fingerprintP15ElementorImageAssetSourceIr(first));
  });

  it('resolves only matching image review nodes and preserves unrelated review nodes', () => {
    const source = imageReviewDocument(true);
    const rawUrl = 'https://assets.example.test/private/image-one.jpg?token=secret';
    const result = resolveP15ElementorImageAssets(source, manifest(source, [
      { sourceNodeId: 'image-fill', url: rawUrl },
    ]));

    expect(result.status).toBe('IMAGE_ASSETS_RESOLVED');
    expect(result.imageReviewCount).toBe(1);
    expect(result.resolvedImageCount).toBe(1);
    expect(result.remainingReviewCount).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.resolvedReferences).toEqual([{
      sourceNodeId: 'image-fill',
      urlFingerprint: expect.stringMatching(/^sha256:[0-9a-f]{64}$/),
    }]);
    expect(result.document?.nodes[0]).toEqual(expect.objectContaining({
      kind: 'container',
      children: [
        { kind: 'image', sourceNodeId: 'image-fill', url: rawUrl },
        {
          kind: 'review',
          sourceNodeId: 'manual-layout',
          reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW',
          detail: 'Unrelated review must remain unchanged.',
        },
      ],
    }));
    expect(result.networkAccess).toBe(false);
    expect(result.assetUploadPerformed).toBe(false);
    expect(result.assetReferenceClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
    expect(result.internalReviewRequired).toBe(true);
  });

  it('bridges an exact image review into the existing native generator while retaining external asset closure review', () => {
    const source = imageReviewDocument();
    const rawUrl = 'https://assets.example.test/catalog/image.jpg';
    const resolution = resolveP15ElementorImageAssets(source, manifest(source, [
      { sourceNodeId: 'image-fill', url: rawUrl },
    ]));

    expect(resolution.status).toBe('IMAGE_ASSETS_RESOLVED');
    expect(resolution.remainingReviewCount).toBe(0);
    expect(resolution.document).not.toBeNull();

    const generation = generateElementorV3TemplateCandidate(resolution.document);
    expect(generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(generation.template).not.toBeNull();
    expect(JSON.stringify(generation.template)).toContain(rawUrl);
    expect(JSON.stringify(generation.template)).toContain('"id":0');

    const profile = buildElementorTargetProfile({
      wordpressVersion: '6.8',
      elementorVersion: '4.2.4',
    });
    const assetReview = reviewElementorAssetReferences(generation.template, profile);
    expect(assetReview.status).toBe('EXTERNAL_ASSET_CLOSURE_REQUIRED');
    expect(assetReview.assetReferenceStatus).toBe('NOT_VERIFIED');
    expect(assetReview.assetReferenceClosureClaim).toBe(false);
    expect(assetReview.references).toEqual([
      expect.objectContaining({
        widgetType: 'image',
        settingKey: 'image',
        mediaId: null,
        urlPresent: true,
        referenceMode: 'URL_ONLY',
      }),
    ]);
    expect(JSON.stringify(assetReview)).not.toContain(rawUrl);
  });

  it('fails closed for stale, missing, extra and duplicate resolution entries', () => {
    const source = imageReviewDocument();
    const valid = manifest(source, [
      { sourceNodeId: 'image-fill', url: 'https://assets.example.test/a.jpg' },
    ]);

    const stale = resolveP15ElementorImageAssets(source, {
      ...valid,
      sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
    });
    expect(stale.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(stale.document).toBeNull();
    expect(stale.issues.map((issue) => issue.code)).toContain('P15_IMAGE_ASSET_SOURCE_FINGERPRINT_MISMATCH');

    const missing = resolveP15ElementorImageAssets(source, manifest(source, []));
    expect(missing.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(missing.issues.map((issue) => issue.code)).toContain('P15_IMAGE_ASSET_RESOLUTION_MISSING');

    const extra = resolveP15ElementorImageAssets(source, manifest(source, [
      { sourceNodeId: 'image-fill', url: 'https://assets.example.test/a.jpg' },
      { sourceNodeId: 'not-a-review', url: 'https://assets.example.test/b.jpg' },
    ]));
    expect(extra.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(extra.issues.map((issue) => issue.code)).toContain('P15_IMAGE_ASSET_RESOLUTION_SOURCE_NOT_REVIEWABLE');

    const duplicate = resolveP15ElementorImageAssets(source, manifest(source, [
      { sourceNodeId: 'image-fill', url: 'https://assets.example.test/a.jpg' },
      { sourceNodeId: 'image-fill', url: 'https://assets.example.test/b.jpg' },
    ]));
    expect(duplicate.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(duplicate.issues.map((issue) => issue.code)).toContain('P15_IMAGE_ASSET_RESOLUTION_DUPLICATE_SOURCE_ID');
  });

  it('rejects unsafe URLs and authority inflation without producing transformed IR', () => {
    const source = imageReviewDocument();
    const unsafe = resolveP15ElementorImageAssets(source, manifest(source, [
      { sourceNodeId: 'image-fill', url: 'https://user:pass@assets.example.test/private.jpg' },
    ]));
    expect(unsafe.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(unsafe.document).toBeNull();
    expect(unsafe.issues.map((issue) => issue.code)).toContain('P15_IMAGE_ASSET_RESOLUTION_URL_INVALID');

    const inflated = resolveP15ElementorImageAssets(source, {
      ...manifest(source, [{ sourceNodeId: 'image-fill', url: 'https://assets.example.test/a.jpg' }]),
      assetReferenceClosureClaim: true,
    });
    expect(inflated.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(inflated.document).toBeNull();
    expect(inflated.issues.map((issue) => issue.code)).toContain('P15_IMAGE_ASSET_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only a sanitized summary and rejects authority-inflated result serialization', () => {
    const source = imageReviewDocument();
    const rawUrl = 'https://assets.example.test/private.jpg?secret=value';
    const result = resolveP15ElementorImageAssets(source, manifest(source, [
      { sourceNodeId: 'image-fill', url: rawUrl },
    ]));

    const serialized = serializeP15ElementorImageAssetResolutionSummary(result);
    expect(serialized).not.toContain(rawUrl);
    expect(serialized).not.toContain('secret=value');
    expect(serialized).not.toContain('"document"');
    expect(serialized).toContain(result.resolvedReferences[0]?.urlFingerprint ?? 'missing');

    const mutatedIssue = {
      ...resolveP15ElementorImageAssets(source, {
        ...manifest(source, [{ sourceNodeId: 'image-fill', url: rawUrl }]),
        sourceIrFingerprint: 'sha256:' + '0'.repeat(64),
      }),
    };
    mutatedIssue.issues = mutatedIssue.issues.map((issue) => ({
      ...issue,
      message: rawUrl,
    }));
    expect(serializeP15ElementorImageAssetResolutionSummary(mutatedIssue)).not.toContain(rawUrl);

    const invalidFingerprint = {
      ...result,
      resolvedReferences: result.resolvedReferences.map((entry) => ({
        ...entry,
        urlFingerprint: rawUrl,
      })),
    } as P15ElementorImageAssetResolutionResultV1;
    expect(() => serializeP15ElementorImageAssetResolutionSummary(invalidFingerprint))
      .toThrow(/authority-inflated/);

    const inflated = {
      ...result,
      productionAcceptance: true,
    } as unknown as P15ElementorImageAssetResolutionResultV1;
    expect(() => serializeP15ElementorImageAssetResolutionSummary(inflated))
      .toThrow(/authority-inflated/);
  });
});
