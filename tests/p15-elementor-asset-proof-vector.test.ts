import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL,
  P15_ELEMENTOR_ASSET_PROOF_VECTOR_FILENAMES,
  buildP15ElementorAssetProofVector,
} from '../src/targets/elementor/asset-proof-vector';
import { buildP15ElementorFirstProofVector } from '../src/targets/elementor/first-proof-vector';

describe('P15 controlled URL-only asset proof vector', () => {
  it('is deterministic and binds exactly one URL_ONLY Image MEDIA reference', () => {
    const first = buildP15ElementorAssetProofVector();
    const second = buildP15ElementorAssetProofVector();

    expect(first.files).toEqual(second.files);
    expect(Object.keys(first.files).sort())
      .toEqual([...P15_ELEMENTOR_ASSET_PROOF_VECTOR_FILENAMES].sort());
    expect(first.manifest.candidateStatus).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
    expect(first.manifest.assetReference.referenceMode).toBe('URL_ONLY');
    expect(first.manifest.assetReference.urlFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.referenceReviewIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.manifest.referenceReviewIdentityDigest).toBe(first.referenceReviewIdentityDigest);

    const template = JSON.parse(first.files['template.json']) as {
      content: Array<{ elements: Array<{ widgetType?: string; settings?: Record<string, unknown> }> }>;
    };
    const image = template.content[0]?.elements.find((element) => element.widgetType === 'image');
    expect(image?.settings?.image).toEqual({
      id: 0,
      url: P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL,
    });
    expect(first.files['manifest.json']).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
  });

  it('keeps the asset vector explicitly unobserved and non-authorizing', () => {
    const manifest = buildP15ElementorAssetProofVector().manifest;
    expect(manifest.targetEnvironmentObserved).toBe(false);
    expect(manifest.importObserved).toBe(false);
    expect(manifest.renderObserved).toBe(false);
    expect(manifest.assetReferenceObserved).toBe(false);
    expect(manifest.browserAssetLoadObserved).toBe(false);
    expect(manifest.assetReferenceClosureClaim).toBe(false);
    expect(manifest.acceptanceAuthority).toBe(false);
    expect(manifest.targetCompatibilityClaim).toBe(false);
    expect(manifest.productionAcceptance).toBe(false);
    expect(manifest.internalReviewRequired).toBe(true);
  });

  it('does not alter the retained first-proof candidate/profile/template identity', () => {
    const retained = buildP15ElementorFirstProofVector();
    expect(retained.candidateIdentity.digest)
      .toBe('sha256:96ffe8a19b0c4d05eccd1e3d28d8b453f41464450ebd6c3f69decc1ab2543f26');
    expect(retained.targetProfileFingerprint)
      .toBe('sha256:8c93e6c2c4635f7da845ef737bbce8810bbf4e46334f7496a54b682673a1b676');
    expect(retained.manifest.fileSha256.template)
      .toBe('sha256:bf2c229441f93486af7152f9196c265f09ee9e3cefab67d11ecb6765f583e4ad');
  });
});
