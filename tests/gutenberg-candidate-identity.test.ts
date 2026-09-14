import { describe, expect, it } from 'vitest';
import {
  buildGutenbergNormalizedCandidateArtifact,
  type GutenbergNormalizedCandidateArtifactV1,
} from '../src/targets/gutenberg/candidate-artifact';
import {
  GUTENBERG_NORMALIZED_CANDIDATE_IDENTITY_VERSION,
  buildGutenbergNormalizedCandidateIdentity,
  serializeGutenbergNormalizedCandidateIdentity,
} from '../src/targets/gutenberg/candidate-identity';
import {
  GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
  type GutenbergNormalizedParsedBlockDocumentV1,
  type GutenbergNormalizedParsedBlockV1,
} from '../src/targets/gutenberg/parsed-block';
import { buildGutenbergTargetProfile } from '../src/targets/gutenberg/target-profile';

function block(
  blockName: string | null,
  attrs: Record<string, string | number | boolean | null> = {},
): GutenbergNormalizedParsedBlockV1 {
  return {
    blockName,
    attrs,
    innerBlocks: [],
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

function readyCandidate(wordpressVersion = 'wp-a', text = 'alpha') {
  return buildGutenbergNormalizedCandidateArtifact(
    document([block('core/paragraph', { content: text })]),
    buildGutenbergTargetProfile({ wordpressVersion }),
  );
}

describe('P16 R1 exact Gutenberg normalized candidate identity', () => {
  it('builds a deterministic SHA-256 identity for one exact canonical READY candidate', () => {
    const candidate = readyCandidate();
    const first = buildGutenbergNormalizedCandidateIdentity(candidate);
    const second = buildGutenbergNormalizedCandidateIdentity(readyCandidate());

    expect(candidate.status).toBe('READY_FOR_NATIVE_SERIALIZATION_VALIDATION');
    expect(first).toEqual(second);
    expect(first.identityVersion).toBe(GUTENBERG_NORMALIZED_CANDIDATE_IDENTITY_VERSION);
    expect(first.candidateVersion).toBe('gutenberg-normalized-candidate-v1');
    expect(first.targetContractVersion).toBe('gutenberg-normalized-parsed-block-v1');
    expect(first.capabilityRegistryVersion).toBe('gutenberg-documented-core-block-capabilities-v1');
    expect(first.targetProfileVersion).toBe('gutenberg-target-profile-v1');
    expect(first.assessmentVersion).toBe('gutenberg-target-profile-assessment-v1');
    expect(first.algorithm).toBe('SHA-256');
    expect(first.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('changes identity when the declared WordPress target changes', () => {
    const first = buildGutenbergNormalizedCandidateIdentity(readyCandidate('wp-a', 'same'));
    const second = buildGutenbergNormalizedCandidateIdentity(readyCandidate('wp-b', 'same'));

    expect(first.digest).not.toBe(second.digest);
  });

  it('changes identity when canonical normalized document content changes', () => {
    const first = buildGutenbergNormalizedCandidateIdentity(readyCandidate('wp-a', 'alpha'));
    const second = buildGutenbergNormalizedCandidateIdentity(readyCandidate('wp-a', 'beta'));

    expect(first.digest).not.toBe(second.digest);
  });

  it('rejects REVIEW_REQUIRED and invalid candidates before identity creation', () => {
    const reviewCandidate = buildGutenbergNormalizedCandidateArtifact(
      document([block('my-plugin/card')]),
      buildGutenbergTargetProfile({ wordpressVersion: 'wp-a' }),
    );
    const invalidCandidate = buildGutenbergNormalizedCandidateArtifact(
      { schemaVersion: 1, contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION, blocks: 'invalid' },
      buildGutenbergTargetProfile({ wordpressVersion: 'wp-a' }),
    );

    expect(reviewCandidate.status).toBe('REVIEW_REQUIRED');
    expect(invalidCandidate.status).toBe('REJECTED_INVALID_DOCUMENT');
    expect(() => buildGutenbergNormalizedCandidateIdentity(reviewCandidate)).toThrow(/not ready/i);
    expect(() => buildGutenbergNormalizedCandidateIdentity(invalidCandidate)).toThrow(/not ready/i);
  });

  it('rejects a forged READY status when embedded evidence rebuilds as REVIEW_REQUIRED', () => {
    const reviewCandidate = buildGutenbergNormalizedCandidateArtifact(
      document([block('my-plugin/card')]),
      buildGutenbergTargetProfile({ wordpressVersion: 'wp-a' }),
    );
    const forged = {
      ...reviewCandidate,
      status: 'READY_FOR_NATIVE_SERIALIZATION_VALIDATION',
    } as GutenbergNormalizedCandidateArtifactV1;

    expect(() => buildGutenbergNormalizedCandidateIdentity(forged)).toThrow(/not the canonical artifact/i);
  });

  it('rejects tampered embedded normalized document JSON', () => {
    const candidate = readyCandidate();
    const tampered = {
      ...candidate,
      normalizedDocumentJson: JSON.stringify(document([block('core/heading')]), null, 2) + '\n',
    };

    expect(() => buildGutenbergNormalizedCandidateIdentity(tampered)).toThrow(/not the canonical artifact/i);
  });

  it('rejects tampered embedded declared profile JSON', () => {
    const candidate = readyCandidate('wp-a');
    const tampered = {
      ...candidate,
      profileJson: JSON.stringify(buildGutenbergTargetProfile({ wordpressVersion: 'wp-b' }), null, 2) + '\n',
    };

    expect(() => buildGutenbergNormalizedCandidateIdentity(tampered)).toThrow(/not the canonical artifact/i);
  });

  it('rejects assessment or authority-field tampering as noncanonical', () => {
    const candidate = readyCandidate();
    const tamperedAssessment = {
      ...candidate,
      assessment: {
        ...candidate.assessment,
        internalReviewRequired: false,
      },
    } as unknown as GutenbergNormalizedCandidateArtifactV1;
    const tamperedAuthority = {
      ...candidate,
      downloadEnabled: true,
    } as unknown as GutenbergNormalizedCandidateArtifactV1;

    expect(() => buildGutenbergNormalizedCandidateIdentity(tamperedAssessment)).toThrow(/not the canonical artifact/i);
    expect(() => buildGutenbergNormalizedCandidateIdentity(tamperedAuthority)).toThrow(/not the canonical artifact/i);
  });

  it('serializes identity deterministically with a trailing newline', () => {
    const identity = buildGutenbergNormalizedCandidateIdentity(readyCandidate());
    const first = serializeGutenbergNormalizedCandidateIdentity(identity);
    const second = serializeGutenbergNormalizedCandidateIdentity(
      buildGutenbergNormalizedCandidateIdentity(readyCandidate()),
    );

    expect(second).toBe(first);
    expect(first.endsWith('\n')).toBe(true);
    expect(JSON.parse(first)).toEqual(identity);
  });
});
