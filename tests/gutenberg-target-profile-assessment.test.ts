import { describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/core/sha256';
import {
  assessGutenbergTargetProfile,
  serializeGutenbergTargetProfileAssessment,
  type GutenbergTargetProfileAssessmentV1,
} from '../src/targets/gutenberg/target-profile-assessment';
import {
  GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
  serializeGutenbergNormalizedParsedBlockDocument,
  type GutenbergNormalizedParsedBlockDocumentV1,
  type GutenbergNormalizedParsedBlockV1,
} from '../src/targets/gutenberg/parsed-block';
import {
  buildGutenbergTargetProfile,
  fingerprintGutenbergTargetProfile,
} from '../src/targets/gutenberg/target-profile';

function block(
  blockName: string | null,
  innerBlocks: GutenbergNormalizedParsedBlockV1[] = [],
): GutenbergNormalizedParsedBlockV1 {
  return {
    blockName,
    attrs: {},
    innerBlocks,
    innerHTML: '',
  };
}

function document(blocks: GutenbergNormalizedParsedBlockV1[]): GutenbergNormalizedParsedBlockDocumentV1 {
  return {
    schemaVersion: 1,
    contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    blocks,
  };
}

function profile() {
  return buildGutenbergTargetProfile({ wordpressVersion: 'declared-wordpress-version' });
}

describe('P16 R1 Gutenberg target-profile assessment', () => {
  it('blocks invalid profiles before using document evidence', () => {
    const invalidProfile = {
      ...profile(),
      targetCompatibilityClaim: true,
    };

    const result = assessGutenbergTargetProfile(
      { deliberately: 'not-a-normalized-document' },
      invalidProfile,
    );

    expect(result.status).toBe('BLOCKED_INVALID_PROFILE');
    expect(result.profileIdentity).toBeNull();
    expect(result.documentFingerprint).toBeNull();
    expect(result.capabilitySummary).toBeNull();
    expect(result.profileIssues.map((issue) => issue.code)).toContain('P16_PROFILE_AUTHORITY_FLAGS_INVALID');
    expect(result.documentIssues).toEqual([]);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.generationEnabled).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('binds a valid profile but blocks invalid normalized document evidence', () => {
    const validProfile = profile();
    const invalidDocument = {
      schemaVersion: 1,
      contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
      blocks: [{
        blockName: 'core/paragraph',
        attrs: {},
        innerBlocks: 'invalid',
        innerHTML: '',
      }],
    };

    const result = assessGutenbergTargetProfile(invalidDocument, validProfile);

    expect(result.status).toBe('BLOCKED_INVALID_DOCUMENT');
    expect(result.profileIdentity).toEqual({
      profileVersion: 'gutenberg-target-profile-v1',
      fingerprint: fingerprintGutenbergTargetProfile(validProfile),
    });
    expect(result.documentFingerprint).toBeNull();
    expect(result.capabilitySummary).toBeNull();
    expect(result.profileIssues).toEqual([]);
    expect(result.documentIssues.map((issue) => issue.code)).toContain('P16_INNER_BLOCKS_INVALID');
    expect(result.nativeSerializationStatus).toBe('NOT_RUN');
    expect(result.editorImportValidationStatus).toBe('NOT_RUN');
    expect(result.renderValidationStatus).toBe('NOT_RUN');
    expect(result.targetEnvironmentValidationStatus).toBe('NOT_RUN');
  });

  it('returns REVIEW_REQUIRED with exact custom/freeform inventory and bound identities', () => {
    const value = document([
      block('my-plugin/card'),
      block(null),
      block('core/paragraph'),
    ]);
    const validProfile = profile();

    const result = assessGutenbergTargetProfile(value, validProfile);
    const expectedDocumentFingerprint = `sha256:${sha256Hex(
      serializeGutenbergNormalizedParsedBlockDocument(value),
    )}`;

    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(result.profileIdentity?.fingerprint).toBe(fingerprintGutenbergTargetProfile(validProfile));
    expect(result.documentFingerprint).toBe(expectedDocumentFingerprint);
    expect(result.alignment).toEqual({
      adapterContract: true,
      capabilityRegistry: true,
      documentedCoreApiVersion: true,
      outputMode: true,
      serializationMode: true,
      responsiveMode: true,
    });
    expect(result.capabilitySummary).toEqual({
      totalBlocks: 3,
      namedBlocks: 2,
      freeformBlocks: 1,
      documentedCoreBlocks: 1,
      reviewRequiredBlocks: 2,
    });
    expect(result.reviewRequiredBlockInventory).toEqual([
      { blockName: null, count: 1 },
      { blockName: 'my-plugin/card', count: 1 },
    ]);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.generationEnabled).toBe(false);
    expect(result.downloadEnabled).toBe(false);
    expect(result.internalReviewRequired).toBe(true);
  });

  it('uses PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING only for current documented-core normalized evidence', () => {
    const value = document([
      block('core/group', [
        block('core/heading'),
        block('core/image'),
        block('core/paragraph'),
      ]),
    ]);

    const result = assessGutenbergTargetProfile(value, profile());

    expect(result.status).toBe('PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING');
    expect(Object.values(result.alignment).every((aligned) => aligned)).toBe(true);
    expect(result.capabilitySummary).toEqual({
      totalBlocks: 4,
      namedBlocks: 4,
      freeformBlocks: 0,
      documentedCoreBlocks: 4,
      reviewRequiredBlocks: 0,
    });
    expect(result.reviewRequiredBlockInventory).toEqual([]);
    expect(result.nativeSerializationStatus).toBe('NOT_RUN');
    expect(result.editorImportValidationStatus).toBe('NOT_RUN');
    expect(result.renderValidationStatus).toBe('NOT_RUN');
    expect(result.targetEnvironmentValidationStatus).toBe('NOT_RUN');
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.generationEnabled).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('changes the bound profile identity when the declared WordPress target changes', () => {
    const value = document([block('core/paragraph')]);
    const first = assessGutenbergTargetProfile(
      value,
      buildGutenbergTargetProfile({ wordpressVersion: 'wp-a' }),
    );
    const second = assessGutenbergTargetProfile(
      value,
      buildGutenbergTargetProfile({ wordpressVersion: 'wp-b' }),
    );

    expect(first.documentFingerprint).toBe(second.documentFingerprint);
    expect(first.profileIdentity?.fingerprint).not.toBe(second.profileIdentity?.fingerprint);
  });

  it('changes the document identity when canonical normalized content changes', () => {
    const first = assessGutenbergTargetProfile(document([block('core/paragraph')]), profile());
    const second = assessGutenbergTargetProfile(document([block('core/heading')]), profile());

    expect(first.profileIdentity?.fingerprint).toBe(second.profileIdentity?.fingerprint);
    expect(first.documentFingerprint).not.toBe(second.documentFingerprint);
  });

  it('serializes assessment output deterministically', () => {
    const assessment = assessGutenbergTargetProfile(
      document([block('core/paragraph')]),
      profile(),
    );

    const first = serializeGutenbergTargetProfileAssessment(assessment);
    const second = serializeGutenbergTargetProfileAssessment(
      assessGutenbergTargetProfile(document([block('core/paragraph')]), profile()),
    );

    expect(second).toBe(first);
    expect(first.endsWith('\n')).toBe(true);
    expect(first).toContain('"nativeSerializationStatus": "NOT_RUN"');
    expect(first).toContain('"targetCompatibilityClaim": false');
    expect(first).toContain('"productionAcceptance": false');
    expect(first).toContain('"generationEnabled": false');
    expect(first).toContain('"downloadEnabled": false');
  });

  it('refuses to serialize authority-inflated assessment evidence', () => {
    const assessment = assessGutenbergTargetProfile(
      document([block('core/paragraph')]),
      profile(),
    );
    const inflated = {
      ...assessment,
      targetCompatibilityClaim: true,
      productionAcceptance: true,
    } as unknown as GutenbergTargetProfileAssessmentV1;

    expect(() => serializeGutenbergTargetProfileAssessment(inflated))
      .toThrow(/authority-inflated/);
  });

  it('refuses a forged strongest status when review-required capability evidence remains', () => {
    const assessment = assessGutenbergTargetProfile(
      document([block('my-plugin/card')]),
      profile(),
    );
    const forged = {
      ...assessment,
      status: 'PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING',
    } as GutenbergTargetProfileAssessmentV1;

    expect(() => serializeGutenbergTargetProfileAssessment(forged))
      .toThrow(/authority-inflated/);
  });
});
