import { describe, expect, it } from 'vitest';
import {
  ELEMENTOR_ASSET_CONTROL_REGISTRY_VERSION,
  ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA,
  ELEMENTOR_DOCUMENTED_ASSET_CONTROLS_V1,
  reviewElementorAssetReferences,
  serializeElementorAssetReferenceReview,
  type ElementorAssetReferenceReviewV1,
} from '../src/targets/elementor/asset-reference-review';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

function profile() {
  return buildElementorTargetProfile({
    wordpressVersion: 'wp-declared',
    elementorVersion: 'elementor-declared',
  });
}

function template(widgetType = 'heading', settings: Record<string, unknown> = { title: 'Fixture' }) {
  return {
    title: 'Asset Reference Review',
    type: 'page',
    version: '0.4',
    page_settings: [],
    content: [
      {
        id: 'container-1',
        elType: 'container',
        isInner: false,
        settings: {},
        elements: [
          {
            id: 'widget-1',
            elType: 'widget',
            widgetType,
            isInner: false,
            settings,
            elements: [],
          },
        ],
      },
    ],
  };
}

describe('P15 R1 Elementor documented asset-reference review gate', () => {
  it('pins the first asset-control registry to the exact documented core image MEDIA mapping', () => {
    expect(ELEMENTOR_ASSET_CONTROL_REGISTRY_VERSION).toBe('elementor-asset-control-registry-v1');
    expect(ELEMENTOR_ASSET_EVIDENCE_ELEMENTOR_SOURCE_SHA).toBe('4ee26420a83b32ba48b2faf576b91029d083bb64');
    expect(ELEMENTOR_DOCUMENTED_ASSET_CONTROLS_V1).toEqual([{
      widgetType: 'image',
      settingKey: 'image',
      controlType: 'MEDIA',
      evidence: 'ELEMENTOR_CORE_IMAGE_WIDGET_SOURCE',
      sourcePath: 'includes/widgets/image.php',
      sourceSha: '4ee26420a83b32ba48b2faf576b91029d083bb64',
    }]);
  });

  it('marks asset closure NOT_REQUIRED when no documented image MEDIA control is populated', () => {
    const review = reviewElementorAssetReferences(template(), profile());

    expect(review.status).toBe('NO_DOCUMENTED_ASSET_REFERENCES');
    expect(review.upstreamAssessmentStatus).toBe('PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING');
    expect(review.upstreamReviewRequired).toBe(false);
    expect(review.globalReferenceReviewStatus).toBe('NO_GLOBAL_REFERENCES');
    expect(review.globalReferenceClosureStatus).toBe('NOT_REQUIRED');
    expect(review.assetReferenceStatus).toBe('NOT_REQUIRED');
    expect(review.references).toEqual([]);
    expect(review.issues).toEqual([]);
    expect(review.assetReferenceClosureClaim).toBe(false);
    expect(review.targetCompatibilityClaim).toBe(false);
    expect(review.productionAcceptance).toBe(false);
    expect(review.generationEnabled).toBe(false);
    expect(review.downloadEnabled).toBe(false);
    expect(review.internalReviewRequired).toBe(true);
  });

  it('inventories exact core image MEDIA id/url evidence without emitting the raw URL', () => {
    const rawUrl = 'https://source.example.test/wp-content/uploads/exact-image.jpg?private=sentinel';
    const review = reviewElementorAssetReferences(template('image', {
      image: { id: 321, url: rawUrl },
    }), profile());

    expect(review.status).toBe('EXTERNAL_ASSET_CLOSURE_REQUIRED');
    expect(review.assetReferenceStatus).toBe('NOT_VERIFIED');
    expect(review.references).toHaveLength(1);
    expect(review.references[0]).toMatchObject({
      path: '$.content[0].elements[0].settings.image',
      widgetId: 'widget-1',
      widgetType: 'image',
      settingKey: 'image',
      controlType: 'MEDIA',
      mediaId: 321,
      urlPresent: true,
      referenceMode: 'MEDIA_ID_AND_URL',
    });
    expect(review.references[0]?.urlFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);

    const serialized = serializeElementorAssetReferenceReview(review);
    expect(serialized).not.toContain(rawUrl);
    expect(serialized).not.toContain('private=sentinel');
    expect(serialized).toContain(review.references[0]?.urlFingerprint ?? 'missing-fingerprint');
  });

  it('accepts the documented core image default-style URL-only MEDIA value as external closure evidence', () => {
    const review = reviewElementorAssetReferences(template('image', {
      image: { url: 'https://source.example.test/placeholder.png' },
    }), profile());

    expect(review.status).toBe('EXTERNAL_ASSET_CLOSURE_REQUIRED');
    expect(review.references).toHaveLength(1);
    expect(review.references[0]?.mediaId).toBeNull();
    expect(review.references[0]?.urlPresent).toBe(true);
    expect(review.references[0]?.referenceMode).toBe('URL_ONLY');
  });

  it('treats empty documented MEDIA values as no asset reference', () => {
    const review = reviewElementorAssetReferences(template('image', {
      image: { id: 0, url: '' },
    }), profile());

    expect(review.status).toBe('NO_DOCUMENTED_ASSET_REFERENCES');
    expect(review.assetReferenceStatus).toBe('NOT_REQUIRED');
    expect(review.references).toEqual([]);
    expect(review.issues).toEqual([]);
  });

  it('fails to REVIEW for malformed or drifted fields on the exact whitelisted MEDIA control', () => {
    const extraField = reviewElementorAssetReferences(template('image', {
      image: { id: 7, url: 'https://source.example.test/a.jpg', source: 'undocumented' },
    }), profile());
    expect(extraField.status).toBe('REVIEW_REQUIRED_UNSUPPORTED_ASSET_SHAPE');
    expect(extraField.assetReferenceStatus).toBe('REVIEW_REQUIRED');
    expect(extraField.references).toEqual([]);
    expect(extraField.issues[0]?.code).toBe('P15_ASSET_MEDIA_VALUE_UNKNOWN_FIELD');

    const invalidId = reviewElementorAssetReferences(template('image', {
      image: { id: '7', url: 'https://source.example.test/a.jpg' },
    }), profile());
    expect(invalidId.status).toBe('REVIEW_REQUIRED_UNSUPPORTED_ASSET_SHAPE');
    expect(invalidId.issues[0]?.code).toBe('P15_ASSET_MEDIA_ID_INVALID');
  });

  it('does not shape-sniff arbitrary media-like objects outside the documented image control', () => {
    const rawUrl = 'https://must-not-be-classified.example.test/arbitrary.jpg';
    const review = reviewElementorAssetReferences(template('heading', {
      title: 'Fixture',
      hero_media: { id: 99, url: rawUrl },
    }), profile());

    expect(review.status).toBe('NO_DOCUMENTED_ASSET_REFERENCES');
    expect(review.references).toEqual([]);
    expect(review.issues).toEqual([]);
    expect(serializeElementorAssetReferenceReview(review)).not.toContain(rawUrl);
  });

  it('preserves upstream REVIEW_REQUIRED and does not infer asset support for third-party widgets', () => {
    const review = reviewElementorAssetReferences(template('third-party-widget', {
      image: { id: 55, url: 'https://third-party.example.test/image.jpg' },
    }), profile());

    expect(review.upstreamAssessmentStatus).toBe('REVIEW_REQUIRED');
    expect(review.upstreamReviewRequired).toBe(true);
    expect(review.status).toBe('NO_DOCUMENTED_ASSET_REFERENCES');
    expect(review.references).toEqual([]);
    expect(review.targetCompatibilityClaim).toBe(false);
  });

  it('preserves global-reference closure state independently when documented asset evidence also exists', () => {
    const review = reviewElementorAssetReferences(template('image', {
      image: { id: 44, url: 'https://source.example.test/global-and-asset.jpg' },
      __globals__: {
        border_color: 'globals/colors?id=external-global-value',
      },
    }), profile());

    expect(review.globalReferenceReviewStatus).toBe('EXTERNAL_CLOSURE_REQUIRED');
    expect(review.globalReferenceClosureStatus).toBe('NOT_VERIFIED');
    expect(review.globalReferenceClosureClaim).toBe(false);
    expect(review.status).toBe('EXTERNAL_ASSET_CLOSURE_REQUIRED');
    expect(review.assetReferenceStatus).toBe('NOT_VERIFIED');
    expect(review.assetReferenceClosureClaim).toBe(false);
  });

  it('blocks before asset inspection when the target profile or template is invalid', () => {
    const invalidProfile = {
      ...profile(),
      downloadEnabled: true,
    };
    const profileBlocked = reviewElementorAssetReferences(template('image', {
      image: { id: 1, url: 'https://must-not-be-inspected.example.test/a.jpg' },
    }), invalidProfile);
    expect(profileBlocked.status).toBe('BLOCKED_UPSTREAM');
    expect(profileBlocked.assetReferenceStatus).toBe('BLOCKED');
    expect(profileBlocked.references).toEqual([]);

    const legacy = template() as Record<string, unknown>;
    legacy.content = [{
      id: 'legacy-section',
      elType: 'section',
      isInner: false,
      settings: { image: { id: 1, url: 'https://must-not-be-inspected.example.test/b.jpg' } },
      elements: [],
    }];
    const templateBlocked = reviewElementorAssetReferences(legacy, profile());
    expect(templateBlocked.status).toBe('BLOCKED_UPSTREAM');
    expect(templateBlocked.assetReferenceStatus).toBe('BLOCKED');
    expect(templateBlocked.references).toEqual([]);
  });

  it('is deterministic and serializer refuses authority inflation or contradictory asset state', () => {
    const value = template('image', {
      image: { id: 123, url: 'https://source.example.test/deterministic.jpg' },
    });
    const first = reviewElementorAssetReferences(value, profile());
    const second = reviewElementorAssetReferences(value, profile());
    expect(first).toEqual(second);
    expect(serializeElementorAssetReferenceReview(first)).toBe(serializeElementorAssetReferenceReview(second));

    const inflated = {
      ...first,
      downloadEnabled: true,
    } as unknown as ElementorAssetReferenceReviewV1;
    expect(() => serializeElementorAssetReferenceReview(inflated))
      .toThrow(/Invalid or authority-inflated/);

    const contradictory = {
      ...first,
      assetReferenceStatus: 'NOT_REQUIRED',
    } as unknown as ElementorAssetReferenceReviewV1;
    expect(() => serializeElementorAssetReferenceReview(contradictory))
      .toThrow(/Invalid or authority-inflated/);
  });
});
