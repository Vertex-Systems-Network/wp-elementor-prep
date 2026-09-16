import { describe, expect, it } from 'vitest';
import {
  buildElementorTargetEnvironmentEvidence,
  serializeElementorTargetEnvironmentEvidence,
  validateElementorTargetEnvironmentEvidence,
  type ElementorTargetEnvironmentEvidenceV1,
} from '../src/targets/elementor/target-environment-evidence';

function evidence(
  overrides: Partial<{
    wordpressVersion: string;
    elementorVersion: string;
    phpVersion: string;
    databaseEngine: 'MYSQL' | 'MARIADB' | 'SQLITE' | 'OTHER';
    databaseVersion: string;
    wordpressMemoryLimitMb: number;
    browserFamily: 'CHROME' | 'EDGE' | 'BRAVE' | 'FIREFOX' | 'SAFARI' | 'OTHER';
    browserVersion: string;
    elementorProActive: boolean;
    thirdPartyElementorAddonsActive: boolean;
  }> = {},
): ElementorTargetEnvironmentEvidenceV1 {
  return buildElementorTargetEnvironmentEvidence({
    wordpressVersion: overrides.wordpressVersion ?? '6.8.0',
    elementorVersion: overrides.elementorVersion ?? '4.2.4',
    phpVersion: overrides.phpVersion ?? '7.4.0',
    database: {
      engine: overrides.databaseEngine ?? 'MYSQL',
      version: overrides.databaseVersion ?? '5.6.0',
    },
    wordpressMemoryLimitMb: overrides.wordpressMemoryLimitMb ?? 256,
    browser: {
      family: overrides.browserFamily ?? 'CHROME',
      version: overrides.browserVersion ?? '148.0',
    },
    elementorProActive: overrides.elementorProActive ?? false,
    thirdPartyElementorAddonsActive: overrides.thirdPartyElementorAddonsActive ?? false,
    observedAt: '2026-09-16T13:50:00.000Z',
    evidenceReference: 'retained-evidence://elementor/environment/fixture',
  });
}

describe('P15 Elementor target environment qualification evidence', () => {
  it('qualifies the exact conservative minimum environment without granting target authority', () => {
    const value = evidence();
    const validation = validateElementorTargetEnvironmentEvidence(value);

    expect(validation.valid).toBe(true);
    expect(validation.classification).toBe('QUALIFIED_FOR_BOUND_TARGET_PROOF');
    expect(validation.failures).toEqual([]);
    expect(validation.reviewCodes).toEqual([]);
    expect(validation.requirementChecks).toEqual({
      wordpressMinimum: true,
      phpMinimum: true,
      databaseSupported: true,
      databaseMinimum: true,
      memoryMinimum: true,
      browserSupported: true,
      browserMinimum: true,
    });
    expect(validation.acceptanceAuthority).toBe(false);
    expect(validation.targetCompatibilityClaim).toBe(false);
    expect(validation.productionAcceptance).toBe(false);
    expect(validation.internalReviewRequired).toBe(true);
    expect(JSON.parse(serializeElementorTargetEnvironmentEvidence(value))).toEqual(value);
  });

  it('qualifies newer supported WordPress/PHP/MariaDB/Safari versions', () => {
    const validation = validateElementorTargetEnvironmentEvidence(evidence({
      wordpressVersion: '7.0.1',
      elementorVersion: '4.2.4',
      phpVersion: '8.3.5',
      databaseEngine: 'MARIADB',
      databaseVersion: '10.6.20',
      wordpressMemoryLimitMb: 768,
      browserFamily: 'SAFARI',
      browserVersion: '26.2.1',
    }));

    expect(validation.classification).toBe('QUALIFIED_FOR_BOUND_TARGET_PROOF');
    expect(validation.failures).toEqual([]);
  });

  it.each([
    ['WordPress', { wordpressVersion: '6.7.9' }, 'P15_TARGET_ENVIRONMENT_WORDPRESS_BELOW_MINIMUM'],
    ['PHP', { phpVersion: '7.3.9' }, 'P15_TARGET_ENVIRONMENT_PHP_BELOW_MINIMUM'],
    ['MySQL', { databaseVersion: '5.5.99' }, 'P15_TARGET_ENVIRONMENT_DATABASE_BELOW_MINIMUM'],
    ['memory', { wordpressMemoryLimitMb: 255 }, 'P15_TARGET_ENVIRONMENT_MEMORY_BELOW_MINIMUM'],
    ['Chrome', { browserVersion: '147.9' }, 'P15_TARGET_ENVIRONMENT_BROWSER_BELOW_MINIMUM'],
  ])('fails qualification when %s is below the bounded minimum', (_name, overrides, failureCode) => {
    const validation = validateElementorTargetEnvironmentEvidence(evidence(overrides));
    expect(validation.valid).toBe(true);
    expect(validation.classification).toBe('NOT_QUALIFIED');
    expect(validation.failures).toContain(failureCode);
  });

  it('uses the MariaDB-specific 10.5 minimum', () => {
    const validation = validateElementorTargetEnvironmentEvidence(evidence({
      databaseEngine: 'MARIADB',
      databaseVersion: '10.4.99',
    }));
    expect(validation.classification).toBe('NOT_QUALIFIED');
    expect(validation.failures).toContain('P15_TARGET_ENVIRONMENT_DATABASE_BELOW_MINIMUM');
  });

  it('does not qualify SQLite or unknown database engines as Elementor target proof environments', () => {
    for (const databaseEngine of ['SQLITE', 'OTHER'] as const) {
      const validation = validateElementorTargetEnvironmentEvidence(evidence({
        databaseEngine,
        databaseVersion: '3.46.0',
      }));
      expect(validation.valid).toBe(true);
      expect(validation.classification).toBe('NOT_QUALIFIED');
      expect(validation.failures).toContain('P15_TARGET_ENVIRONMENT_DATABASE_ENGINE_UNSUPPORTED');
    }
  });

  it('does not qualify unsupported browser families', () => {
    const validation = validateElementorTargetEnvironmentEvidence(evidence({
      browserFamily: 'OTHER',
      browserVersion: '999.0',
    }));
    expect(validation.classification).toBe('NOT_QUALIFIED');
    expect(validation.failures).toContain('P15_TARGET_ENVIRONMENT_BROWSER_UNSUPPORTED');
  });

  it('requires review when Elementor Pro or third-party Elementor addons are active', () => {
    const validation = validateElementorTargetEnvironmentEvidence(evidence({
      elementorProActive: true,
      thirdPartyElementorAddonsActive: true,
    }));
    expect(validation.valid).toBe(true);
    expect(validation.classification).toBe('REVIEW_REQUIRED');
    expect(validation.failures).toEqual([]);
    expect(validation.reviewCodes).toEqual([
      'P15_TARGET_ENVIRONMENT_ELEMENTOR_PRO_ACTIVE',
      'P15_TARGET_ENVIRONMENT_THIRD_PARTY_ADDONS_ACTIVE',
    ]);
  });

  it('rejects malformed numeric versions instead of guessing', () => {
    const invalid = {
      ...evidence(),
      wordpressVersion: '6.8-RC1',
    };
    const validation = validateElementorTargetEnvironmentEvidence(invalid);
    expect(validation.valid).toBe(false);
    expect(validation.classification).toBe('REJECTED');
    expect(validation.issues.map((issue) => issue.code)).toContain('P15_TARGET_ENVIRONMENT_VERSION_INVALID');
  });

  it('rejects unknown fields and elevated authority flags', () => {
    const base = evidence();
    const unknown = { ...base, hiddenAuthority: true };
    expect(validateElementorTargetEnvironmentEvidence(unknown).issues.map((issue) => issue.code))
      .toContain('P15_TARGET_ENVIRONMENT_FIELDS_INVALID');

    const elevated = { ...base, targetCompatibilityClaim: true };
    expect(validateElementorTargetEnvironmentEvidence(elevated).issues.map((issue) => issue.code))
      .toContain('P15_TARGET_ENVIRONMENT_AUTHORITY_FLAGS_INVALID');
  });
});
