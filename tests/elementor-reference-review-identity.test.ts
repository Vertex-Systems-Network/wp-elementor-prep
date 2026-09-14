import { describe, expect, it } from 'vitest';
import {
  buildElementorReferenceReviewIdentity,
  serializeElementorReferenceReviewIdentity,
  type ElementorReferenceReviewIdentityV1,
} from '../src/targets/elementor/reference-review-identity';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

function profile(elementorVersion = 'elementor-declared') {
  return buildElementorTargetProfile({
    wordpressVersion: 'wp-declared',
    elementorVersion,
  });
}

function template(widgetType = 'heading', settings: Record<string, unknown> = { title: 'Fixture' }) {
  return {
    title: 'Reference Review Identity',
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

describe('P15 R1 combined Elementor reference-review identity', () => {
  it('builds deterministic no-reference identity without granting closure or compatibility authority', () => {
    const value = template();
    const targetProfile = profile();
    const first = buildElementorReferenceReviewIdentity(value, targetProfile);
    const second = buildElementorReferenceReviewIdentity(value, targetProfile);

    expect(first).toEqual(second);
    expect(first.disposition).toBe('NO_EXTERNAL_REFERENCE_CLOSURE_REQUIRED');
    expect(first.externalClosureRequired).toBe(false);
    expect(first.upstreamReviewRequired).toBe(false);
    expect(first.globalReferenceReviewStatus).toBe('NO_GLOBAL_REFERENCES');
    expect(first.globalReferenceClosureStatus).toBe('NOT_REQUIRED');
    expect(first.assetReferenceReviewStatus).toBe('NO_DOCUMENTED_ASSET_REFERENCES');
    expect(first.assetReferenceStatus).toBe('NOT_REQUIRED');
    expect(first.algorithm).toBe('SHA-256');
    expect(first.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.referenceClosureClaim).toBe(false);
    expect(first.targetCompatibilityClaim).toBe(false);
    expect(first.productionAcceptance).toBe(false);
    expect(first.generationEnabled).toBe(false);
    expect(first.downloadEnabled).toBe(false);
    expect(first.internalReviewRequired).toBe(true);
    expect(serializeElementorReferenceReviewIdentity(first, value, targetProfile))
      .toBe(serializeElementorReferenceReviewIdentity(second, value, targetProfile));
  });

  it('marks global-only external closure and changes identity when exact candidate global value changes', () => {
    const targetProfile = profile();
    const firstTemplate = template('heading', {
      title: 'Fixture',
      __globals__: { title_color: 'globals/colors?id=private-global-a' },
    });
    const secondTemplate = template('heading', {
      title: 'Fixture',
      __globals__: { title_color: 'globals/colors?id=private-global-b' },
    });
    const first = buildElementorReferenceReviewIdentity(firstTemplate, targetProfile);
    const second = buildElementorReferenceReviewIdentity(secondTemplate, targetProfile);

    expect(first.disposition).toBe('EXTERNAL_CLOSURE_REQUIRED');
    expect(first.externalClosureRequired).toBe(true);
    expect(first.globalReferenceReviewStatus).toBe('EXTERNAL_CLOSURE_REQUIRED');
    expect(first.assetReferenceReviewStatus).toBe('NO_DOCUMENTED_ASSET_REFERENCES');
    expect(first.candidateFingerprint).not.toBe(second.candidateFingerprint);
    expect(first.digest).not.toBe(second.digest);

    const serialized = serializeElementorReferenceReviewIdentity(first, firstTemplate, targetProfile);
    expect(serialized).not.toContain('private-global-a');
  });

  it('marks documented image asset-only external closure and emits no raw asset URL', () => {
    const rawUrl = 'https://source.example.test/private-asset.jpg?sentinel=secret';
    const value = template('image', {
      image: { id: 88, url: rawUrl },
    });
    const targetProfile = profile();
    const identity = buildElementorReferenceReviewIdentity(value, targetProfile);

    expect(identity.disposition).toBe('EXTERNAL_CLOSURE_REQUIRED');
    expect(identity.externalClosureRequired).toBe(true);
    expect(identity.globalReferenceReviewStatus).toBe('NO_GLOBAL_REFERENCES');
    expect(identity.assetReferenceReviewStatus).toBe('EXTERNAL_ASSET_CLOSURE_REQUIRED');
    expect(identity.assetReferenceStatus).toBe('NOT_VERIFIED');
    expect(serializeElementorReferenceReviewIdentity(identity, value, targetProfile)).not.toContain(rawUrl);
    expect(serializeElementorReferenceReviewIdentity(identity, value, targetProfile)).not.toContain('sentinel=secret');
  });

  it('binds combined global + asset external closure to one exact digest', () => {
    const value = template('image', {
      image: { id: 99, url: 'https://source.example.test/combined.jpg' },
      __globals__: { border_color: 'globals/colors?id=combined-global' },
    });
    const identity = buildElementorReferenceReviewIdentity(value, profile());

    expect(identity.disposition).toBe('EXTERNAL_CLOSURE_REQUIRED');
    expect(identity.externalClosureRequired).toBe(true);
    expect(identity.globalReferenceClosureStatus).toBe('NOT_VERIFIED');
    expect(identity.assetReferenceStatus).toBe('NOT_VERIFIED');
    expect(identity.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('keeps upstream undocumented-widget REVIEW_REQUIRED while independently exposing external closure', () => {
    const value = template('third-party-widget', {
      __globals__: { custom_color: 'globals/colors?id=third-party-global' },
      arbitrary_media: { id: 12, url: 'https://third-party.example.test/not-whitelisted.jpg' },
    });
    const identity = buildElementorReferenceReviewIdentity(value, profile());

    expect(identity.disposition).toBe('REVIEW_REQUIRED');
    expect(identity.upstreamReviewRequired).toBe(true);
    expect(identity.externalClosureRequired).toBe(true);
    expect(identity.globalReferenceReviewStatus).toBe('EXTERNAL_CLOSURE_REQUIRED');
    expect(identity.assetReferenceReviewStatus).toBe('NO_DOCUMENTED_ASSET_REFERENCES');
  });

  it('marks unsupported documented asset shape REVIEW_REQUIRED', () => {
    const value = template('image', {
      image: {
        id: 9,
        url: 'https://source.example.test/drift.jpg',
        undocumented: 'drift',
      },
    });
    const identity = buildElementorReferenceReviewIdentity(value, profile());

    expect(identity.disposition).toBe('REVIEW_REQUIRED');
    expect(identity.externalClosureRequired).toBe(false);
    expect(identity.assetReferenceReviewStatus).toBe('REVIEW_REQUIRED_UNSUPPORTED_ASSET_SHAPE');
    expect(identity.assetReferenceStatus).toBe('REVIEW_REQUIRED');
  });

  it('builds blocked identity for invalid upstream evidence', () => {
    const invalidProfile = {
      ...profile(),
      generationEnabled: true,
    };
    const identity = buildElementorReferenceReviewIdentity(template(), invalidProfile);

    expect(identity.disposition).toBe('BLOCKED_UPSTREAM');
    expect(identity.externalClosureRequired).toBe(false);
    expect(identity.profileFingerprint).toBeNull();
    expect(identity.candidateFingerprint).toBeNull();
    expect(identity.globalReferenceReviewStatus).toBe('BLOCKED_UPSTREAM');
    expect(identity.assetReferenceReviewStatus).toBe('BLOCKED_UPSTREAM');
  });

  it('makes prior identity stale when candidate bytes change even if recognized reference classes do not', () => {
    const targetProfile = profile();
    const firstTemplate = template('heading', { title: 'First title' });
    const secondTemplate = template('heading', { title: 'Second title' });
    const identity = buildElementorReferenceReviewIdentity(firstTemplate, targetProfile);

    expect(() => serializeElementorReferenceReviewIdentity(identity, secondTemplate, targetProfile))
      .toThrow(/Invalid or stale/);
    expect(buildElementorReferenceReviewIdentity(firstTemplate, targetProfile).digest)
      .not.toBe(buildElementorReferenceReviewIdentity(secondTemplate, targetProfile).digest);
  });

  it('makes prior identity stale when declared target profile changes', () => {
    const value = template();
    const firstProfile = profile('elementor-a');
    const secondProfile = profile('elementor-b');
    const identity = buildElementorReferenceReviewIdentity(value, firstProfile);

    expect(identity.profileFingerprint)
      .not.toBe(buildElementorReferenceReviewIdentity(value, secondProfile).profileFingerprint);
    expect(() => serializeElementorReferenceReviewIdentity(identity, value, secondProfile))
      .toThrow(/Invalid or stale/);
  });

  it('rejects tampered digest, authority inflation and unknown identity fields', () => {
    const value = template();
    const targetProfile = profile();
    const identity = buildElementorReferenceReviewIdentity(value, targetProfile);

    const tampered = {
      ...identity,
      digest: `sha256:${'0'.repeat(64)}`,
    } as ElementorReferenceReviewIdentityV1;
    expect(() => serializeElementorReferenceReviewIdentity(tampered, value, targetProfile))
      .toThrow(/Invalid or stale/);

    const inflated = {
      ...identity,
      targetCompatibilityClaim: true,
    } as unknown as ElementorReferenceReviewIdentityV1;
    expect(() => serializeElementorReferenceReviewIdentity(inflated, value, targetProfile))
      .toThrow(/Invalid or stale/);

    const unknownField = {
      ...identity,
      approval: 'forged',
    };
    expect(() => serializeElementorReferenceReviewIdentity(unknownField, value, targetProfile))
      .toThrow(/Invalid or stale/);
  });
});
