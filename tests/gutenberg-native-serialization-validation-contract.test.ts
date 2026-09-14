import { describe, expect, it } from 'vitest';
import { buildGutenbergNormalizedCandidateArtifact } from '../src/targets/gutenberg/candidate-artifact';
import { buildGutenbergNormalizedCandidateIdentity } from '../src/targets/gutenberg/candidate-identity';
import {
  GUTENBERG_NATIVE_SERIALIZATION_VALIDATION_RECEIPT_VERSION,
  validateGutenbergNativeSerializationValidationReceipt,
  type GutenbergNativeSerializationValidationReceiptV1,
} from '../src/targets/gutenberg/native-serialization-validation-contract';
import {
  GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
  type GutenbergNormalizedParsedBlockDocumentV1,
  type GutenbergNormalizedParsedBlockV1,
} from '../src/targets/gutenberg/parsed-block';
import { buildGutenbergTargetProfile } from '../src/targets/gutenberg/target-profile';

function block(blockName: string): GutenbergNormalizedParsedBlockV1 {
  return {
    blockName,
    attrs: {},
    innerBlocks: [],
    innerHTML: '',
  };
}

function document(blockName = 'core/paragraph'): GutenbergNormalizedParsedBlockDocumentV1 {
  return {
    schemaVersion: 1,
    contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    blocks: [block(blockName)],
  };
}

function readyCandidate(wordpressVersion = 'wp-a') {
  return buildGutenbergNormalizedCandidateArtifact(
    document(),
    buildGutenbergTargetProfile({ wordpressVersion }),
  );
}

function validPassReceipt(
  candidate = readyCandidate(),
): GutenbergNativeSerializationValidationReceiptV1 {
  return {
    schemaVersion: 1,
    receiptVersion: GUTENBERG_NATIVE_SERIALIZATION_VALIDATION_RECEIPT_VERSION,
    candidateIdentity: buildGutenbergNormalizedCandidateIdentity(candidate),
    target: {
      wordpressVersion: 'wp-a',
      validationSurface: 'WORDPRESS_BLOCK_PARSE_SERIALIZE_ROUND_TRIP',
    },
    observedAt: '2026-09-14T18:30:00.000Z',
    observedResult: 'PASS',
    checks: {
      parseSucceeded: true,
      serializeSucceeded: true,
      roundTripStable: true,
      invalidBlockWarningsObserved: false,
    },
    nativeOutput: {
      sha256: `sha256:${'a'.repeat(64)}`,
      byteLength: 128,
    },
    evidenceReference: 'operator://p16/native-round-trip/evidence-1',
    nativeSerializationAuthority: false,
    targetEnvironmentValidated: false,
    editorImportValidated: false,
    renderValidated: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
  };
}

describe('P16 R1 external native serialization validation receipt', () => {
  it('accepts an exact-bound internally consistent externally reported PASS without granting authority', () => {
    const candidate = readyCandidate();
    const receipt = validPassReceipt(candidate);
    const result = validateGutenbergNativeSerializationValidationReceipt(receipt, candidate);

    expect(result.valid).toBe(true);
    expect(result.bindingMatches).toBe(true);
    expect(result.reportedResult).toBe('PASS');
    expect(result.candidateIdentity).toEqual(receipt.candidateIdentity);
    expect(result.reportedChecks).toEqual(receipt.checks);
    expect(result.nativeOutput).toEqual(receipt.nativeOutput);
    expect(result.issues).toEqual([]);
    expect(result.nativeSerializationAuthority).toBe(false);
    expect(result.targetEnvironmentValidated).toBe(false);
    expect(result.editorImportValidated).toBe(false);
    expect(result.renderValidated).toBe(false);
    expect(result.acceptanceAuthority).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.generationEnabled).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('accepts an exact-bound reported FAIL with no native output', () => {
    const candidate = readyCandidate();
    const receipt: GutenbergNativeSerializationValidationReceiptV1 = {
      ...validPassReceipt(candidate),
      observedResult: 'FAIL',
      checks: {
        parseSucceeded: false,
        serializeSucceeded: false,
        roundTripStable: false,
        invalidBlockWarningsObserved: true,
      },
      nativeOutput: {
        sha256: null,
        byteLength: null,
      },
    };

    const result = validateGutenbergNativeSerializationValidationReceipt(receipt, candidate);
    expect(result.valid).toBe(true);
    expect(result.bindingMatches).toBe(true);
    expect(result.reportedResult).toBe('FAIL');
    expect(result.nativeOutput).toEqual({ sha256: null, byteLength: null });
    expect(result.nativeSerializationAuthority).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
  });

  it('accepts reported FAIL when a bounded native output digest exists', () => {
    const candidate = readyCandidate();
    const receipt: GutenbergNativeSerializationValidationReceiptV1 = {
      ...validPassReceipt(candidate),
      observedResult: 'FAIL',
      checks: {
        parseSucceeded: true,
        serializeSucceeded: true,
        roundTripStable: false,
        invalidBlockWarningsObserved: true,
      },
    };

    const result = validateGutenbergNativeSerializationValidationReceipt(receipt, candidate);
    expect(result.valid).toBe(true);
    expect(result.reportedResult).toBe('FAIL');
    expect(result.nativeOutput?.sha256).toMatch(/^sha256:/);
  });

  it('rejects a candidate identity mismatch', () => {
    const candidate = readyCandidate('wp-a');
    const otherCandidate = readyCandidate('wp-b');
    const receipt = {
      ...validPassReceipt(candidate),
      candidateIdentity: buildGutenbergNormalizedCandidateIdentity(otherCandidate),
    };

    const result = validateGutenbergNativeSerializationValidationReceipt(receipt, candidate);
    expect(result.valid).toBe(false);
    expect(result.bindingMatches).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_RECEIPT_BINDING_MISMATCH');
  });

  it('rejects a WordPress target version that differs from the candidate declared profile', () => {
    const candidate = readyCandidate('wp-a');
    const receipt = {
      ...validPassReceipt(candidate),
      target: {
        wordpressVersion: 'wp-b',
        validationSurface: 'WORDPRESS_BLOCK_PARSE_SERIALIZE_ROUND_TRIP',
      },
    };

    const result = validateGutenbergNativeSerializationValidationReceipt(receipt, candidate);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_RECEIPT_TARGET_INVALID');
  });

  it('rejects inconsistent reported PASS semantics', () => {
    const candidate = readyCandidate();
    const inconsistent = {
      ...validPassReceipt(candidate),
      checks: {
        parseSucceeded: true,
        serializeSucceeded: true,
        roundTripStable: false,
        invalidBlockWarningsObserved: false,
      },
    };

    const result = validateGutenbergNativeSerializationValidationReceipt(inconsistent, candidate);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_RECEIPT_PASS_INCONSISTENT');
  });

  it('rejects PASS without present native output digest evidence', () => {
    const candidate = readyCandidate();
    const inconsistent = {
      ...validPassReceipt(candidate),
      nativeOutput: {
        sha256: null,
        byteLength: null,
      },
    };

    const result = validateGutenbergNativeSerializationValidationReceipt(inconsistent, candidate);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_RECEIPT_PASS_INCONSISTENT');
  });

  it('rejects malformed native-output digest/length pairs', () => {
    const candidate = readyCandidate();
    const malformed = {
      ...validPassReceipt(candidate),
      nativeOutput: {
        sha256: `sha256:${'b'.repeat(64)}`,
        byteLength: null,
      },
    };

    const result = validateGutenbergNativeSerializationValidationReceipt(malformed, candidate);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_RECEIPT_OUTPUT_INVALID');
  });

  it('rejects non-canonical timestamps and empty evidence references', () => {
    const candidate = readyCandidate();
    const malformed = {
      ...validPassReceipt(candidate),
      observedAt: '2026-09-14',
      evidenceReference: '   ',
    };

    const result = validateGutenbergNativeSerializationValidationReceipt(malformed, candidate);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_RECEIPT_OBSERVED_AT_INVALID');
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_RECEIPT_EVIDENCE_REFERENCE_INVALID');
  });

  it('rejects unknown receipt fields and authority inflation', () => {
    const candidate = readyCandidate();
    const inflated = {
      ...validPassReceipt(candidate),
      nativeSerializationAuthority: true,
      targetCompatibilityClaim: true,
      unexpectedField: true,
    };

    const result = validateGutenbergNativeSerializationValidationReceipt(inflated, candidate);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_RECEIPT_SHAPE_INVALID');
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_RECEIPT_AUTHORITY_FLAGS_INVALID');
    expect(result.nativeSerializationAuthority).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
  });

  it('rejects REVIEW_REQUIRED candidates before accepting receipt evidence', () => {
    const reviewCandidate = buildGutenbergNormalizedCandidateArtifact(
      document('my-plugin/card'),
      buildGutenbergTargetProfile({ wordpressVersion: 'wp-a' }),
    );
    const receipt = validPassReceipt(readyCandidate());

    const result = validateGutenbergNativeSerializationValidationReceipt(receipt, reviewCandidate);
    expect(reviewCandidate.status).toBe('REVIEW_REQUIRED');
    expect(result.valid).toBe(false);
    expect(result.bindingMatches).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_RECEIPT_CANDIDATE_NOT_READY');
  });

  it('rejects a forged noncanonical READY candidate', () => {
    const candidate = readyCandidate();
    const forged = {
      ...candidate,
      downloadEnabled: true,
    } as unknown as typeof candidate;
    const receipt = validPassReceipt(candidate);

    const result = validateGutenbergNativeSerializationValidationReceipt(receipt, forged);
    expect(result.valid).toBe(false);
    expect(result.bindingMatches).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_RECEIPT_CANDIDATE_NONCANONICAL');
  });

  it('does not echo raw native Gutenberg output bytes', () => {
    const candidate = readyCandidate();
    const receipt = validPassReceipt(candidate);
    const result = validateGutenbergNativeSerializationValidationReceipt(receipt, candidate);
    const serialized = JSON.stringify(result);

    expect(serialized).toContain(receipt.nativeOutput.sha256 as string);
    expect(serialized).not.toContain('<!-- wp:');
    expect(serialized).not.toContain('postContent');
  });
});
