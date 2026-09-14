import { describe, expect, it } from 'vitest';
import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from '../src/targets/elementor/candidate-artifact';
import {
  ELEMENTOR_IMPORT_VALIDATION_RECEIPT_VERSION,
  buildElementorTemplateCandidateIdentity,
  type ElementorImportValidationReceiptV1,
} from '../src/targets/elementor/import-validation-contract';
import {
  buildElementorProfileBoundImportEvidence,
  serializeElementorProfileBoundImportEvidence,
  validateElementorProfileBoundImportEvidence,
  type ElementorProfileBoundImportEvidenceV1,
} from '../src/targets/elementor/profile-bound-import-evidence';
import {
  buildElementorTargetProfile,
  fingerprintElementorTargetProfile,
  type ElementorTargetProfileV1,
} from '../src/targets/elementor/target-profile';

function candidate(title: string): ElementorTemplateCandidateArtifactV1 {
  const artifact = buildElementorTemplateCandidateArtifact({
    title: 'Profile-bound import fixture',
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
            id: 'heading-1',
            elType: 'widget',
            widgetType: 'heading',
            isInner: false,
            settings: { title },
            elements: [],
          },
        ],
      },
    ],
  });
  expect(artifact.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
  return artifact;
}

function profile(wordpressVersion = 'wp-declared', elementorVersion = 'elementor-declared'): ElementorTargetProfileV1 {
  return buildElementorTargetProfile({ wordpressVersion, elementorVersion });
}

function receipt(
  artifact: ElementorTemplateCandidateArtifactV1,
  wordpressVersion = 'wp-declared',
  elementorVersion = 'elementor-declared',
  observedResult: 'PASS' | 'FAIL' = 'PASS',
): ElementorImportValidationReceiptV1 {
  return {
    schemaVersion: 1,
    receiptVersion: ELEMENTOR_IMPORT_VALIDATION_RECEIPT_VERSION,
    candidateIdentity: buildElementorTemplateCandidateIdentity(artifact),
    target: {
      wordpressVersion,
      elementorVersion,
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: '2026-09-14T13:00:00.000Z',
    observedResult,
    evidenceReference: 'retained-evidence://elementor/profile-bound-fixture',
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
  };
}

describe('P15 R1 profile-bound Elementor import evidence', () => {
  it('binds one valid import receipt to the exact immutable target profile without granting authority', () => {
    const artifact = candidate('Exact profile binding');
    const targetProfile = profile();
    const evidence = buildElementorProfileBoundImportEvidence(
      receipt(artifact),
      artifact,
      targetProfile,
    );
    const result = validateElementorProfileBoundImportEvidence(evidence, artifact, targetProfile);

    expect(result.valid).toBe(true);
    expect(result.candidateBindingMatches).toBe(true);
    expect(result.profileBindingMatches).toBe(true);
    expect(result.observedResult).toBe('PASS');
    expect(result.targetProfileFingerprint).toBe(fingerprintElementorTargetProfile(targetProfile));
    expect(result.acceptanceAuthority).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
    expect(result.internalReviewRequired).toBe(true);
  });

  it('rejects prior evidence when the declared target profile changes while candidate bytes remain unchanged', () => {
    const artifact = candidate('Stable candidate');
    const originalProfile = profile('wp-a', 'elementor-a');
    const evidence = buildElementorProfileBoundImportEvidence(
      receipt(artifact, 'wp-a', 'elementor-a'),
      artifact,
      originalProfile,
    );
    const changedProfile = profile('wp-b', 'elementor-a');
    const result = validateElementorProfileBoundImportEvidence(evidence, artifact, changedProfile);

    expect(result.valid).toBe(false);
    expect(result.candidateBindingMatches).toBe(true);
    expect(result.profileBindingMatches).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P15_PROFILE_BOUND_PROFILE_MISMATCH');
    expect(result.issues.map((issue) => issue.code)).toContain('P15_PROFILE_BOUND_TARGET_VERSION_MISMATCH');
  });

  it('rejects a profile fingerprint that has been tampered independently of the retained receipt', () => {
    const artifact = candidate('Tampered profile identity');
    const targetProfile = profile();
    const evidence = buildElementorProfileBoundImportEvidence(receipt(artifact), artifact, targetProfile);
    const tampered = {
      ...evidence,
      targetProfileIdentity: {
        ...evidence.targetProfileIdentity,
        fingerprint: `sha256:${'0'.repeat(64)}`,
      },
    };
    const result = validateElementorProfileBoundImportEvidence(tampered, artifact, targetProfile);

    expect(result.valid).toBe(false);
    expect(result.profileBindingMatches).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P15_PROFILE_BOUND_PROFILE_MISMATCH');
  });

  it('retains the existing candidate binding and rejects receipt replay against a different candidate', () => {
    const original = candidate('Original candidate');
    const different = candidate('Different candidate');
    const targetProfile = profile();
    const evidence = buildElementorProfileBoundImportEvidence(receipt(original), original, targetProfile);
    const result = validateElementorProfileBoundImportEvidence(evidence, different, targetProfile);

    expect(result.valid).toBe(false);
    expect(result.candidateBindingMatches).toBe(false);
    expect(result.profileBindingMatches).toBe(true);
    expect(result.issues.map((issue) => issue.code)).toContain('P15_PROFILE_BOUND_RECEIPT_INVALID');
  });

  it('rejects observed target versions that do not match the declared target profile', () => {
    const artifact = candidate('Target version mismatch');
    const targetProfile = profile('wp-declared', 'elementor-declared');
    const mismatchedReceipt = receipt(artifact, 'wp-observed-other', 'elementor-declared');
    const evidence: ElementorProfileBoundImportEvidenceV1 = {
      schemaVersion: 1,
      evidenceVersion: 'elementor-profile-bound-import-evidence-v1',
      targetProfileIdentity: {
        profileVersion: 'elementor-target-profile-v1',
        fingerprint: fingerprintElementorTargetProfile(targetProfile),
      },
      importReceipt: mismatchedReceipt,
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      downloadEnabled: false,
      internalReviewRequired: true,
    };
    const result = validateElementorProfileBoundImportEvidence(evidence, artifact, targetProfile);

    expect(result.valid).toBe(false);
    expect(result.candidateBindingMatches).toBe(true);
    expect(result.profileBindingMatches).toBe(true);
    expect(result.issues.map((issue) => issue.code)).toContain('P15_PROFILE_BOUND_TARGET_VERSION_MISMATCH');
  });

  it('fails closed on unknown envelope fields or authority inflation', () => {
    const artifact = candidate('Strict envelope');
    const targetProfile = profile();
    const evidence = buildElementorProfileBoundImportEvidence(receipt(artifact), artifact, targetProfile);

    const unknown = {
      ...evidence,
      unexpectedField: true,
    };
    expect(validateElementorProfileBoundImportEvidence(unknown, artifact, targetProfile).issues.map((issue) => issue.code))
      .toContain('P15_PROFILE_BOUND_EVIDENCE_FIELDS_INVALID');

    const inflated = {
      ...evidence,
      targetCompatibilityClaim: true,
      internalReviewRequired: false,
    };
    expect(validateElementorProfileBoundImportEvidence(inflated, artifact, targetProfile).issues.map((issue) => issue.code))
      .toContain('P15_PROFILE_BOUND_AUTHORITY_FLAGS_INVALID');
  });

  it('rejects an invalid or authority-inflated current target profile', () => {
    const artifact = candidate('Invalid current profile');
    const targetProfile = profile();
    const evidence = buildElementorProfileBoundImportEvidence(receipt(artifact), artifact, targetProfile);
    const invalidProfile = {
      ...targetProfile,
      downloadEnabled: true,
    } as unknown as ElementorTargetProfileV1;
    const result = validateElementorProfileBoundImportEvidence(evidence, artifact, invalidProfile);

    expect(result.valid).toBe(false);
    expect(result.profileBindingMatches).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P15_PROFILE_BOUND_PROFILE_INVALID');
  });

  it('serializes deterministically and refuses stale profile-bound evidence', () => {
    const artifact = candidate('Serialization fixture');
    const targetProfile = profile();
    const evidence = buildElementorProfileBoundImportEvidence(receipt(artifact), artifact, targetProfile);

    const first = serializeElementorProfileBoundImportEvidence(evidence, artifact, targetProfile);
    const second = serializeElementorProfileBoundImportEvidence(evidence, artifact, targetProfile);
    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
    expect(JSON.parse(first).internalReviewRequired).toBe(true);

    const changedProfile = profile('wp-changed', 'elementor-declared');
    expect(() => serializeElementorProfileBoundImportEvidence(evidence, artifact, changedProfile))
      .toThrow(/P15_PROFILE_BOUND_PROFILE_MISMATCH/);
  });
});
