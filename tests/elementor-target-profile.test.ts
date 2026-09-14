import { describe, expect, it } from 'vitest';
import {
  buildElementorTargetProfile,
  fingerprintElementorTargetProfile,
  serializeElementorTargetProfile,
  validateElementorTargetProfile,
  type ElementorTargetProfileV1,
} from '../src/targets/elementor/target-profile';

function validProfile(): ElementorTargetProfileV1 {
  return buildElementorTargetProfile({
    wordpressVersion: 'declared-wordpress-version',
    elementorVersion: 'declared-elementor-version',
  });
}

describe('P15 R1 declared Elementor target profile', () => {
  it('builds the exact narrow declared profile with all authority disabled', () => {
    const profile = validProfile();
    const result = validateElementorTargetProfile(profile);

    expect(result.valid).toBe(true);
    expect(result.profile).toEqual(profile);
    expect(result.issues).toEqual([]);
    expect(profile.target).toBe('elementor');
    expect(profile.documentDataVersion).toBe('0.4');
    expect(profile.architecture).toBe('CONTAINER');
    expect(profile.outputMode).toBe('TEMPLATE_JSON');
    expect(profile.responsiveMode).toBe('SOURCE_ONLY');
    expect(profile.environment.source).toBe('DECLARED');
    expect(profile.proWidgets).toBe('UNSUPPORTED');
    expect(profile.atomicElements).toBe('UNSUPPORTED');
    expect(profile.globalReferencePolicy).toBe('REVIEW_REQUIRED');
    expect(profile.assetReferencePolicy).toBe('REVIEW_REQUIRED');
    expect(profile.targetEnvironmentValidated).toBe(false);
    expect(profile.targetCompatibilityClaim).toBe(false);
    expect(profile.generationEnabled).toBe(false);
    expect(profile.downloadEnabled).toBe(false);
  });

  it('serializes and fingerprints deterministically using SHA-256', () => {
    const profile = validProfile();
    const firstJson = serializeElementorTargetProfile(profile);
    const secondJson = serializeElementorTargetProfile(profile);
    const firstFingerprint = fingerprintElementorTargetProfile(profile);
    const secondFingerprint = fingerprintElementorTargetProfile(profile);

    expect(firstJson).toBe(secondJson);
    expect(firstJson.endsWith('\n')).toBe(true);
    expect(firstFingerprint).toBe(secondFingerprint);
    expect(firstFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('changes the profile fingerprint when either declared target version changes', () => {
    const baseline = buildElementorTargetProfile({
      wordpressVersion: 'wp-a',
      elementorVersion: 'elementor-a',
    });
    const wordpressChanged = buildElementorTargetProfile({
      wordpressVersion: 'wp-b',
      elementorVersion: 'elementor-a',
    });
    const elementorChanged = buildElementorTargetProfile({
      wordpressVersion: 'wp-a',
      elementorVersion: 'elementor-b',
    });

    expect(fingerprintElementorTargetProfile(baseline)).not.toBe(
      fingerprintElementorTargetProfile(wordpressChanged),
    );
    expect(fingerprintElementorTargetProfile(baseline)).not.toBe(
      fingerprintElementorTargetProfile(elementorChanged),
    );
  });

  it('fails closed on unknown fields and unsupported option values', () => {
    const unknown = {
      ...validProfile(),
      unexpectedOption: true,
    };
    const unsupported = {
      ...validProfile(),
      outputMode: 'KIT_ZIP',
    };

    expect(validateElementorTargetProfile(unknown).issues.map((issue) => issue.code))
      .toContain('P15_PROFILE_FIELDS_INVALID');
    expect(validateElementorTargetProfile(unsupported).issues.map((issue) => issue.code))
      .toContain('P15_PROFILE_FIELDS_INVALID');
  });

  it('rejects observed-environment claims and authority inflation', () => {
    const observed = validProfile() as unknown as Record<string, unknown>;
    observed.environment = {
      source: 'OBSERVED',
      wordpressVersion: 'wp',
      elementorVersion: 'elementor',
    };
    const observedResult = validateElementorTargetProfile(observed);
    expect(observedResult.valid).toBe(false);
    expect(observedResult.issues.map((issue) => issue.code)).toContain('P15_PROFILE_ENVIRONMENT_INVALID');

    const inflated = validProfile() as unknown as Record<string, unknown>;
    inflated.targetCompatibilityClaim = true;
    inflated.generationEnabled = true;
    const inflatedResult = validateElementorTargetProfile(inflated);
    expect(inflatedResult.valid).toBe(false);
    expect(inflatedResult.issues.map((issue) => issue.code)).toContain('P15_PROFILE_AUTHORITY_FLAGS_INVALID');
  });

  it('rejects missing or blank declared target versions', () => {
    expect(() => buildElementorTargetProfile({
      wordpressVersion: '',
      elementorVersion: 'elementor',
    })).toThrow(/P15_PROFILE_ENVIRONMENT_INVALID/);
    expect(() => buildElementorTargetProfile({
      wordpressVersion: 'wordpress',
      elementorVersion: '',
    })).toThrow(/P15_PROFILE_ENVIRONMENT_INVALID/);
  });

  it('returns a detached canonical environment snapshot after validation', () => {
    const original = validProfile() as unknown as Record<string, unknown>;
    const result = validateElementorTargetProfile(original);
    expect(result.valid).toBe(true);
    expect(result.profile).not.toBeNull();

    const environment = original.environment as Record<string, unknown>;
    environment.wordpressVersion = 'mutated-after-validation';
    expect(result.profile?.environment.wordpressVersion).toBe('declared-wordpress-version');
  });

  it('refuses to serialize an invalid profile', () => {
    const invalid = {
      ...validProfile(),
      downloadEnabled: true,
    } as unknown as ElementorTargetProfileV1;
    expect(() => serializeElementorTargetProfile(invalid)).toThrow(/P15_PROFILE_AUTHORITY_FLAGS_INVALID/);
  });
});
