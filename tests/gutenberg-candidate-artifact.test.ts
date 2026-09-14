import { describe, expect, it } from 'vitest';
import {
  GUTENBERG_NORMALIZED_CANDIDATE_VERSION,
  buildGutenbergNormalizedCandidateArtifact,
  serializeGutenbergNormalizedCandidateArtifact,
} from '../src/targets/gutenberg/candidate-artifact';
import {
  GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
  type GutenbergNormalizedParsedBlockDocumentV1,
  type GutenbergNormalizedParsedBlockV1,
} from '../src/targets/gutenberg/parsed-block';
import { buildGutenbergTargetProfile } from '../src/targets/gutenberg/target-profile';

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

describe('P16 R1 Gutenberg normalized candidate artifact', () => {
  it('rejects an invalid profile before embedding profile or document JSON', () => {
    const invalidProfile = {
      ...profile(),
      targetCompatibilityClaim: true,
    };

    const artifact = buildGutenbergNormalizedCandidateArtifact(
      document([block('core/paragraph')]),
      invalidProfile,
    );

    expect(artifact.status).toBe('REJECTED_INVALID_PROFILE');
    expect(artifact.profileJson).toBeNull();
    expect(artifact.normalizedDocumentJson).toBeNull();
    expect(artifact.assessment.status).toBe('BLOCKED_INVALID_PROFILE');
  });

  it('keeps canonical declared profile JSON but rejects invalid normalized document JSON', () => {
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

    const artifact = buildGutenbergNormalizedCandidateArtifact(invalidDocument, profile());

    expect(artifact.status).toBe('REJECTED_INVALID_DOCUMENT');
    expect(artifact.profileJson).toContain('"profileVersion": "gutenberg-target-profile-v1"');
    expect(artifact.profileJson?.endsWith('\n')).toBe(true);
    expect(artifact.normalizedDocumentJson).toBeNull();
    expect(artifact.assessment.status).toBe('BLOCKED_INVALID_DOCUMENT');
  });

  it('preserves review-required inventory and canonical normalized JSON for review candidates', () => {
    const artifact = buildGutenbergNormalizedCandidateArtifact(
      document([
        block('my-plugin/card'),
        block(null),
        block('core/paragraph'),
      ]),
      profile(),
    );

    expect(artifact.status).toBe('REVIEW_REQUIRED');
    expect(artifact.profileJson).not.toBeNull();
    expect(artifact.normalizedDocumentJson).not.toBeNull();
    expect(artifact.normalizedDocumentJson?.endsWith('\n')).toBe(true);
    expect(artifact.assessment.reviewRequiredBlockInventory).toEqual([
      { blockName: null, count: 1 },
      { blockName: 'my-plugin/card', count: 1 },
    ]);
    expect(artifact.assessment.capabilitySummary?.reviewRequiredBlocks).toBe(2);
  });

  it('marks documented-core normalized evidence ready only for future native serialization validation', () => {
    const artifact = buildGutenbergNormalizedCandidateArtifact(
      document([
        block('core/group', [
          block('core/heading'),
          block('core/image'),
          block('core/paragraph'),
        ]),
      ]),
      profile(),
    );

    expect(artifact.schemaVersion).toBe(1);
    expect(artifact.candidateVersion).toBe(GUTENBERG_NORMALIZED_CANDIDATE_VERSION);
    expect(artifact.targetContractVersion).toBe('gutenberg-normalized-parsed-block-v1');
    expect(artifact.capabilityRegistryVersion).toBe('gutenberg-documented-core-block-capabilities-v1');
    expect(artifact.targetProfileVersion).toBe('gutenberg-target-profile-v1');
    expect(artifact.assessmentVersion).toBe('gutenberg-target-profile-assessment-v1');
    expect(artifact.status).toBe('READY_FOR_NATIVE_SERIALIZATION_VALIDATION');
    expect(artifact.assessment.status).toBe('PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING');
    expect(artifact.profileJson).not.toBeNull();
    expect(artifact.normalizedDocumentJson).not.toBeNull();
    expect(artifact.assessment.reviewRequiredBlockInventory).toEqual([]);
  });

  it('keeps every native/runtime/authority gate unrun or false for all candidate states', () => {
    const artifacts = [
      buildGutenbergNormalizedCandidateArtifact(
        document([block('core/paragraph')]),
        { ...profile(), generationEnabled: true },
      ),
      buildGutenbergNormalizedCandidateArtifact(
        {
          schemaVersion: 1,
          contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
          blocks: 'invalid',
        },
        profile(),
      ),
      buildGutenbergNormalizedCandidateArtifact(
        document([block('my-plugin/card')]),
        profile(),
      ),
      buildGutenbergNormalizedCandidateArtifact(
        document([block('core/paragraph')]),
        profile(),
      ),
    ];

    for (const artifact of artifacts) {
      expect(artifact.nativeSerializationValidationStatus).toBe('NOT_RUN');
      expect(artifact.editorImportValidationStatus).toBe('NOT_RUN');
      expect(artifact.renderValidationStatus).toBe('NOT_RUN');
      expect(artifact.targetEnvironmentValidationStatus).toBe('NOT_RUN');
      expect(artifact.targetCompatibilityClaim).toBe(false);
      expect(artifact.productionAcceptance).toBe(false);
      expect(artifact.generationEnabled).toBe(false);
      expect(artifact.downloadEnabled).toBe(false);
    }
  });

  it('serializes deterministically as JSON evidence rather than a native Gutenberg serializer output', () => {
    const firstArtifact = buildGutenbergNormalizedCandidateArtifact(
      document([block('core/paragraph')]),
      profile(),
    );
    const secondArtifact = buildGutenbergNormalizedCandidateArtifact(
      document([block('core/paragraph')]),
      profile(),
    );

    const first = serializeGutenbergNormalizedCandidateArtifact(firstArtifact);
    const second = serializeGutenbergNormalizedCandidateArtifact(secondArtifact);

    expect(second).toBe(first);
    expect(first.endsWith('\n')).toBe(true);
    expect(JSON.parse(first)).toEqual(firstArtifact);
    expect(first).toContain('"nativeSerializationValidationStatus": "NOT_RUN"');
    expect(first).toContain('"targetCompatibilityClaim": false');
    expect(first).toContain('"downloadEnabled": false');
  });
});
