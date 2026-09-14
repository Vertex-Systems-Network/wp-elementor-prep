import { describe, expect, it } from 'vitest';
import {
  GUTENBERG_TARGET_PROFILE_VERSION,
  buildGutenbergTargetProfile,
  fingerprintGutenbergTargetProfile,
  serializeGutenbergTargetProfile,
  validateGutenbergTargetProfile,
  type GutenbergTargetProfileV1,
} from '../src/targets/gutenberg/target-profile';

function validProfile(): GutenbergTargetProfileV1 {
  return buildGutenbergTargetProfile({
    wordpressVersion: 'declared-wordpress-version',
  });
}

describe('P16 R1 declared Gutenberg target profile', () => {
  it('builds the exact narrow declared profile with validation and authority disabled', () => {
    const profile = validProfile();
    const result = validateGutenbergTargetProfile(profile);

    expect(result.valid).toBe(true);
    expect(result.profile).toEqual(profile);
    expect(result.issues).toEqual([]);
    expect(profile.profileVersion).toBe(GUTENBERG_TARGET_PROFILE_VERSION);
    expect(profile.target).toBe('gutenberg');
    expect(profile.adapterContractVersion).toBe('gutenberg-normalized-parsed-block-v1');
    expect(profile.capabilityRegistryVersion).toBe('gutenberg-documented-core-block-capabilities-v1');
    expect(profile.documentedCoreApiVersion).toBe(3);
    expect(profile.outputMode).toBe('NORMALIZED_REVIEW_ONLY');
    expect(profile.serializationMode).toBe('UNWIRED');
    expect(profile.responsiveMode).toBe('SOURCE_ONLY');
    expect(profile.customBlockPolicy).toBe('REVIEW_REQUIRED');
    expect(profile.freeformContentPolicy).toBe('REVIEW_REQUIRED');
    expect(profile.dynamicBlockPolicy).toBe('REVIEW_REQUIRED');
    expect(profile.patternPackagePolicy).toBe('UNWIRED');
    expect(profile.environment.source).toBe('DECLARED');
    expect(profile.targetEnvironmentValidated).toBe(false);
    expect(profile.nativeSerializationValidated).toBe(false);
    expect(profile.editorImportValidated).toBe(false);
    expect(profile.renderValidated).toBe(false);
    expect(profile.targetCompatibilityClaim).toBe(false);
    expect(profile.productionAcceptance).toBe(false);
    expect(profile.generationEnabled).toBe(false);
    expect(profile.downloadEnabled).toBe(false);
  });

  it('serializes and fingerprints deterministically using SHA-256', () => {
    const profile = validProfile();
    const firstJson = serializeGutenbergTargetProfile(profile);
    const secondJson = serializeGutenbergTargetProfile(profile);
    const firstFingerprint = fingerprintGutenbergTargetProfile(profile);
    const secondFingerprint = fingerprintGutenbergTargetProfile(profile);

    expect(firstJson).toBe(secondJson);
    expect(firstJson.endsWith('\n')).toBe(true);
    expect(firstFingerprint).toBe(secondFingerprint);
    expect(firstFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('changes the profile fingerprint when the declared WordPress version changes', () => {
    const baseline = buildGutenbergTargetProfile({ wordpressVersion: 'wp-a' });
    const changed = buildGutenbergTargetProfile({ wordpressVersion: 'wp-b' });

    expect(fingerprintGutenbergTargetProfile(baseline)).not.toBe(
      fingerprintGutenbergTargetProfile(changed),
    );
  });

  it('fails closed on unknown fields and unsupported option values', () => {
    const unknown = {
      ...validProfile(),
      unexpectedOption: true,
    };
    const unsupported = {
      ...validProfile(),
      outputMode: 'BLOCK_MARKUP',
    };

    expect(validateGutenbergTargetProfile(unknown).issues.map((issue) => issue.code))
      .toContain('P16_PROFILE_FIELDS_INVALID');
    expect(validateGutenbergTargetProfile(unsupported).issues.map((issue) => issue.code))
      .toContain('P16_PROFILE_FIELDS_INVALID');
  });

  it('rejects observed-environment and validation claims', () => {
    const observed = validProfile() as unknown as Record<string, unknown>;
    observed.environment = {
      source: 'OBSERVED',
      wordpressVersion: 'wp',
    };
    const observedResult = validateGutenbergTargetProfile(observed);
    expect(observedResult.valid).toBe(false);
    expect(observedResult.issues.map((issue) => issue.code)).toContain('P16_PROFILE_ENVIRONMENT_INVALID');

    const inflatedValidation = validProfile() as unknown as Record<string, unknown>;
    inflatedValidation.nativeSerializationValidated = true;
    inflatedValidation.editorImportValidated = true;
    const validationResult = validateGutenbergTargetProfile(inflatedValidation);
    expect(validationResult.valid).toBe(false);
    expect(validationResult.issues.map((issue) => issue.code)).toContain('P16_PROFILE_VALIDATION_FLAGS_INVALID');
  });

  it('rejects compatibility, production, generation and download authority inflation', () => {
    const inflated = validProfile() as unknown as Record<string, unknown>;
    inflated.targetCompatibilityClaim = true;
    inflated.productionAcceptance = true;
    inflated.generationEnabled = true;
    inflated.downloadEnabled = true;

    const result = validateGutenbergTargetProfile(inflated);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P16_PROFILE_AUTHORITY_FLAGS_INVALID');
  });

  it('rejects missing, blank or overlong declared WordPress versions', () => {
    expect(() => buildGutenbergTargetProfile({ wordpressVersion: '' }))
      .toThrow(/P16_PROFILE_ENVIRONMENT_INVALID/);
    expect(() => buildGutenbergTargetProfile({ wordpressVersion: '   ' }))
      .toThrow(/P16_PROFILE_ENVIRONMENT_INVALID/);
    expect(() => buildGutenbergTargetProfile({ wordpressVersion: 'x'.repeat(65) }))
      .toThrow(/P16_PROFILE_ENVIRONMENT_INVALID/);
  });

  it('returns a detached canonical environment snapshot after validation', () => {
    const original = validProfile() as unknown as Record<string, unknown>;
    const result = validateGutenbergTargetProfile(original);
    expect(result.valid).toBe(true);
    expect(result.profile).not.toBeNull();

    const environment = original.environment as Record<string, unknown>;
    environment.wordpressVersion = 'mutated-after-validation';
    expect(result.profile?.environment.wordpressVersion).toBe('declared-wordpress-version');
  });

  it('refuses to serialize an invalid profile', () => {
    const invalid = {
      ...validProfile(),
      renderValidated: true,
    } as unknown as GutenbergTargetProfileV1;

    expect(() => serializeGutenbergTargetProfile(invalid))
      .toThrow(/P16_PROFILE_VALIDATION_FLAGS_INVALID/);
  });
});
