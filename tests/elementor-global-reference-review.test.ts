import { describe, expect, it } from 'vitest';
import {
  reviewElementorGlobalReferences,
  serializeElementorGlobalReferenceReview,
  type ElementorGlobalReferenceReviewV1,
} from '../src/targets/elementor/global-reference-review';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

function profile() {
  return buildElementorTargetProfile({
    wordpressVersion: 'wp-declared',
    elementorVersion: 'elementor-declared',
  });
}

function template(widgetType = 'heading', settings: Record<string, unknown> = { title: 'Fixture' }) {
  return {
    title: 'Global Reference Review',
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

describe('P15 R1 Elementor global-reference review gate', () => {
  it('marks global reference closure NOT_REQUIRED when no __globals__ keys are present', () => {
    const review = reviewElementorGlobalReferences(template(), profile());

    expect(review.status).toBe('NO_GLOBAL_REFERENCES');
    expect(review.upstreamAssessmentStatus).toBe('PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING');
    expect(review.upstreamReviewRequired).toBe(false);
    expect(review.references).toEqual([]);
    expect(review.referencedWidgetCount).toBe(0);
    expect(review.globalReferenceClosureStatus).toBe('NOT_REQUIRED');
    expect(review.globalReferenceClosureClaim).toBe(false);
    expect(review.assetReferenceStatus).toBe('NOT_RUN');
    expect(review.targetCompatibilityClaim).toBe(false);
    expect(review.generationEnabled).toBe(false);
    expect(review.downloadEnabled).toBe(false);
    expect(review.internalReviewRequired).toBe(true);
  });

  it('inventories sorted global setting keys without retaining raw global reference values', () => {
    const review = reviewElementorGlobalReferences(template('heading', {
      title: 'Global fixture',
      __globals__: {
        typography_typography: 'globals/typography?id=secret-sentinel-typography',
        title_color: 'globals/colors?id=secret-sentinel-color',
      },
    }), profile());

    expect(review.status).toBe('EXTERNAL_CLOSURE_REQUIRED');
    expect(review.globalReferenceClosureStatus).toBe('NOT_VERIFIED');
    expect(review.references).toEqual([{
      path: '$.content[0].elements[0]',
      id: 'widget-1',
      widgetType: 'heading',
      settingKeys: ['title_color', 'typography_typography'],
    }]);
    expect(review.referencedWidgetCount).toBe(1);

    const serialized = serializeElementorGlobalReferenceReview(review);
    expect(serialized).not.toContain('secret-sentinel-typography');
    expect(serialized).not.toContain('secret-sentinel-color');
    expect(serialized).toContain('typography_typography');
    expect(serialized).toContain('title_color');
  });

  it('does not override upstream REVIEW_REQUIRED for an undocumented widget', () => {
    const review = reviewElementorGlobalReferences(template('third-party-widget', {
      __globals__: {
        custom_color: 'globals/colors?id=external-value',
      },
    }), profile());

    expect(review.status).toBe('EXTERNAL_CLOSURE_REQUIRED');
    expect(review.upstreamAssessmentStatus).toBe('REVIEW_REQUIRED');
    expect(review.upstreamReviewRequired).toBe(true);
    expect(review.references[0]?.widgetType).toBe('third-party-widget');
    expect(review.targetCompatibilityClaim).toBe(false);
  });

  it('blocks before reference inventory when the target profile is invalid', () => {
    const invalidProfile = {
      ...profile(),
      generationEnabled: true,
    };
    const review = reviewElementorGlobalReferences(template(), invalidProfile);

    expect(review.status).toBe('BLOCKED_UPSTREAM');
    expect(review.upstreamAssessmentStatus).toBe('BLOCKED_INVALID_PROFILE');
    expect(review.profileFingerprint).toBeNull();
    expect(review.candidateFingerprint).toBeNull();
    expect(review.globalReferenceClosureStatus).toBe('BLOCKED');
    expect(review.references).toEqual([]);
  });

  it('blocks before reference inventory when the template violates the container contract', () => {
    const legacy = template() as Record<string, unknown>;
    legacy.content = [{
      id: 'legacy-section',
      elType: 'section',
      isInner: false,
      settings: {
        __globals__: {
          color: 'globals/colors?id=must-not-be-inventoried',
        },
      },
      elements: [],
    }];
    const review = reviewElementorGlobalReferences(legacy, profile());

    expect(review.status).toBe('BLOCKED_UPSTREAM');
    expect(review.upstreamAssessmentStatus).toBe('BLOCKED_INVALID_TEMPLATE');
    expect(review.references).toEqual([]);
    expect(review.globalReferenceClosureStatus).toBe('BLOCKED');
  });

  it('orders multiple reference entries and keys deterministically', () => {
    const value = template() as Record<string, unknown>;
    value.content = [{
      id: 'container-1',
      elType: 'container',
      isInner: false,
      settings: {},
      elements: [
        {
          id: 'widget-b',
          elType: 'widget',
          widgetType: 'button',
          isInner: false,
          settings: { __globals__: { z_key: 'raw-z', a_key: 'raw-a' } },
          elements: [],
        },
        {
          id: 'widget-a',
          elType: 'widget',
          widgetType: 'image',
          isInner: false,
          settings: { __globals__: { image_key: 'raw-image' } },
          elements: [],
        },
      ],
    }];

    const first = reviewElementorGlobalReferences(value, profile());
    const second = reviewElementorGlobalReferences(value, profile());
    expect(first.references).toEqual(second.references);
    expect(first.references[0]?.settingKeys).toEqual(['a_key', 'z_key']);
    expect(serializeElementorGlobalReferenceReview(first)).toBe(serializeElementorGlobalReferenceReview(second));
  });

  it('serializer refuses authority inflation or contradictory closure state', () => {
    const review = reviewElementorGlobalReferences(template(), profile());
    const inflated = {
      ...review,
      targetCompatibilityClaim: true,
    } as unknown as ElementorGlobalReferenceReviewV1;
    expect(() => serializeElementorGlobalReferenceReview(inflated))
      .toThrow(/Invalid or authority-inflated/);

    const contradictory = {
      ...review,
      globalReferenceClosureStatus: 'NOT_VERIFIED',
    } as unknown as ElementorGlobalReferenceReviewV1;
    expect(() => serializeElementorGlobalReferenceReview(contradictory))
      .toThrow(/Invalid or authority-inflated/);
  });
});
