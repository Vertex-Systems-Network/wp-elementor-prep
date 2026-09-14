import { describe, expect, it } from 'vitest';
import {
  assessElementorTargetProfileCompatibility,
  serializeElementorTargetProfileCompatibilityAssessment,
  type ElementorTargetProfileCompatibilityAssessmentV1,
} from '../src/targets/elementor/target-profile-assessment';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

function template(widgetType = 'heading', title = 'Fixture') {
  return {
    title: 'Target Profile Assessment',
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
            settings: { title },
            elements: [],
          },
        ],
      },
    ],
  };
}

function profile(wordpressVersion = 'wp-declared', elementorVersion = 'elementor-declared') {
  return buildElementorTargetProfile({ wordpressVersion, elementorVersion });
}

describe('P15 R1 read-only target-profile compatibility assessment', () => {
  it('classifies documented-core container input as profile-aligned with reference review still pending', () => {
    const result = assessElementorTargetProfileCompatibility(template('heading'), profile());

    expect(result.status).toBe('PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING');
    expect(result.candidateStatus).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
    expect(result.profileIdentity?.fingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.candidateFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(Object.values(result.alignment).every(Boolean)).toBe(true);
    expect(result.capabilitySummary).toEqual({
      totalWidgets: 1,
      documentedCoreWidgets: 1,
      reviewRequiredWidgets: 0,
      widgetsWithResponsiveSettings: 0,
      widgetsWithGlobalReferences: 0,
    });
    expect(result.reviewWidgetTypes).toEqual([]);
    expect(result.referenceClosureStatus).toBe('NOT_RUN');
    expect(result.targetEnvironmentValidationStatus).toBe('NOT_RUN');
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.generationEnabled).toBe(false);
    expect(result.downloadEnabled).toBe(false);
    expect(result.internalReviewRequired).toBe(true);
  });

  it('retains unknown widgets as REVIEW_REQUIRED instead of silently mapping them', () => {
    const result = assessElementorTargetProfileCompatibility(template('third-party-carousel'), profile());

    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(result.candidateStatus).toBe('REVIEW_REQUIRED');
    expect(result.reviewWidgetTypes).toEqual(['third-party-carousel']);
    expect(result.capabilitySummary?.reviewRequiredWidgets).toBe(1);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.generationEnabled).toBe(false);
  });

  it('blocks legacy section/column templates through the existing v0.4 validator', () => {
    const legacy = template() as Record<string, unknown>;
    legacy.content = [{
      id: 'legacy-section',
      elType: 'section',
      isInner: false,
      settings: {},
      elements: [],
    }];
    const result = assessElementorTargetProfileCompatibility(legacy, profile());

    expect(result.status).toBe('BLOCKED_INVALID_TEMPLATE');
    expect(result.candidateStatus).toBe('REJECTED_INVALID_TEMPLATE');
    expect(result.templateIssues.map((issue) => issue.code)).toContain('P15_LEGACY_ELEMENT_UNSUPPORTED');
    expect(result.referenceClosureStatus).toBe('NOT_RUN');
  });

  it('blocks Atomic element schemas rather than inferring Elementor 4 support', () => {
    const atomic = template() as Record<string, unknown>;
    atomic.content = [{
      id: 'atomic-element',
      elType: 'e-heading',
      isInner: false,
      settings: {},
      elements: [],
    }];
    const result = assessElementorTargetProfileCompatibility(atomic, profile());

    expect(result.status).toBe('BLOCKED_INVALID_TEMPLATE');
    expect(result.templateIssues.map((issue) => issue.code)).toContain('P15_ATOMIC_ELEMENT_UNSUPPORTED');
    expect(result.targetCompatibilityClaim).toBe(false);
  });

  it('blocks malformed or authority-inflated target profiles before candidate assessment', () => {
    const invalidProfile = {
      ...profile(),
      targetCompatibilityClaim: true,
    };
    const result = assessElementorTargetProfileCompatibility(template(), invalidProfile);

    expect(result.status).toBe('BLOCKED_INVALID_PROFILE');
    expect(result.profileIdentity).toBeNull();
    expect(result.candidateFingerprint).toBeNull();
    expect(result.candidateStatus).toBeNull();
    expect(result.profileIssues.map((issue) => issue.code)).toContain('P15_PROFILE_AUTHORITY_FLAGS_INVALID');
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('changes only the profile fingerprint when declared target versions change for identical template input', () => {
    const first = assessElementorTargetProfileCompatibility(
      template('heading', 'Stable candidate bytes'),
      profile('wp-a', 'elementor-a'),
    );
    const second = assessElementorTargetProfileCompatibility(
      template('heading', 'Stable candidate bytes'),
      profile('wp-b', 'elementor-a'),
    );

    expect(first.candidateFingerprint).toBe(second.candidateFingerprint);
    expect(first.profileIdentity?.fingerprint).not.toBe(second.profileIdentity?.fingerprint);
    expect(first.status).toBe('PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING');
    expect(second.status).toBe('PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING');
  });

  it('produces deterministic candidate fingerprints for identical normalized input', () => {
    const first = assessElementorTargetProfileCompatibility(template('button', 'Same'), profile());
    const second = assessElementorTargetProfileCompatibility(template('button', 'Same'), profile());

    expect(first.candidateFingerprint).toBe(second.candidateFingerprint);
    expect(first.profileIdentity?.fingerprint).toBe(second.profileIdentity?.fingerprint);
  });

  it('serializes deterministically while refusing authority-inflated assessments', () => {
    const result = assessElementorTargetProfileCompatibility(template('image'), profile());
    const first = serializeElementorTargetProfileCompatibilityAssessment(result);
    const second = serializeElementorTargetProfileCompatibilityAssessment(result);

    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
    const parsed = JSON.parse(first) as Record<string, unknown>;
    expect(parsed.targetCompatibilityClaim).toBe(false);
    expect(parsed.generationEnabled).toBe(false);
    expect(parsed.downloadEnabled).toBe(false);
    expect(parsed.referenceClosureStatus).toBe('NOT_RUN');

    const inflated = {
      ...result,
      downloadEnabled: true,
    } as unknown as ElementorTargetProfileCompatibilityAssessmentV1;
    expect(() => serializeElementorTargetProfileCompatibilityAssessment(inflated))
      .toThrow(/Invalid or authority-inflated/);
  });
});
