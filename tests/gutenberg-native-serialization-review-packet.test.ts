import { describe, expect, it } from 'vitest';
import { buildGutenbergNormalizedCandidateArtifact } from '../src/targets/gutenberg/candidate-artifact';
import { buildGutenbergNormalizedCandidateIdentity } from '../src/targets/gutenberg/candidate-identity';
import {
  GUTENBERG_NATIVE_SERIALIZATION_VALIDATION_RECEIPT_VERSION,
  type GutenbergNativeSerializationValidationReceiptV1,
} from '../src/targets/gutenberg/native-serialization-validation-contract';
import {
  buildGutenbergNativeSerializationReviewPacket,
  serializeGutenbergNativeSerializationReviewPacket,
} from '../src/targets/gutenberg/native-serialization-review-packet';
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

function profile(wordpressVersion = 'wp-a') {
  return buildGutenbergTargetProfile({ wordpressVersion });
}

function validPassReceipt(
  documentValue = document(),
  profileValue = profile(),
): GutenbergNativeSerializationValidationReceiptV1 {
  const candidate = buildGutenbergNormalizedCandidateArtifact(documentValue, profileValue);
  return {
    schemaVersion: 1,
    receiptVersion: GUTENBERG_NATIVE_SERIALIZATION_VALIDATION_RECEIPT_VERSION,
    candidateIdentity: buildGutenbergNormalizedCandidateIdentity(candidate),
    target: {
      wordpressVersion: 'wp-a',
      validationSurface: 'WORDPRESS_BLOCK_PARSE_SERIALIZE_ROUND_TRIP',
    },
    observedAt: '2026-09-14T20:31:00.000Z',
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
    evidenceReference: 'operator://p16/native-round-trip/private-evidence-1',
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

describe('P16 R1 native serialization pre-decision review packet', () => {
  it('rejects invalid receipt evidence and keeps all authority locked', () => {
    const doc = document();
    const targetProfile = profile();
    const invalidReceipt = {
      ...validPassReceipt(doc, targetProfile),
      evidenceReference: '   ',
    };

    const packet = buildGutenbergNativeSerializationReviewPacket(doc, targetProfile, invalidReceipt);

    expect(packet.status).toBe('REJECTED_INVALID_RECEIPT');
    expect(packet.reviewNextAction).toBe('FIX_OR_RECAPTURE_EVIDENCE');
    expect(packet.receiptValid).toBe(false);
    expect(packet.canonicalReceiptSha256).toBeNull();
    expect(packet.evidenceAuthenticationStatus).toBe('NOT_RUN');
    expect(packet.internalDecisionStatus).toBe('NOT_RUN');
    expect(packet.nativeSerializationAuthority).toBe(false);
    expect(packet.targetCompatibilityClaim).toBe(false);
    expect(packet.productionAcceptance).toBe(false);
    expect(packet.generationEnabled).toBe(false);
    expect(packet.downloadEnabled).toBe(false);
    expect(packet.internalReviewRequired).toBe(true);
  });

  it('routes an exact-bound reported FAIL to internal failure review', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt: GutenbergNativeSerializationValidationReceiptV1 = {
      ...validPassReceipt(doc, targetProfile),
      observedResult: 'FAIL',
      checks: {
        parseSucceeded: true,
        serializeSucceeded: true,
        roundTripStable: false,
        invalidBlockWarningsObserved: true,
      },
      nativeOutput: {
        sha256: null,
        byteLength: null,
      },
    };

    const packet = buildGutenbergNativeSerializationReviewPacket(doc, targetProfile, receipt);

    expect(packet.status).toBe('REPORTED_FAIL_REVIEW_REQUIRED');
    expect(packet.reviewNextAction).toBe('REVIEW_REPORTED_FAILURES');
    expect(packet.receiptValid).toBe(true);
    expect(packet.bindingMatches).toBe(true);
    expect(packet.reportedResult).toBe('FAIL');
    expect(packet.canonicalReceiptSha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(packet.evidenceAuthenticationStatus).toBe('NOT_RUN');
    expect(packet.internalDecisionStatus).toBe('NOT_RUN');
  });

  it('advances exact-bound reported PASS only to evidence authentication', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const candidate = buildGutenbergNormalizedCandidateArtifact(doc, targetProfile);

    const packet = buildGutenbergNativeSerializationReviewPacket(doc, targetProfile, receipt);

    expect(packet.status).toBe('REPORTED_PASS_AUTHENTICATION_REQUIRED');
    expect(packet.reviewNextAction).toBe('AUTHENTICATE_EVIDENCE_THEN_INTERNAL_REVIEW');
    expect(packet.candidateStatus).toBe('READY_FOR_NATIVE_SERIALIZATION_VALIDATION');
    expect(packet.currentCandidateIdentity).toEqual(buildGutenbergNormalizedCandidateIdentity(candidate));
    expect(packet.reportedResult).toBe('PASS');
    expect(packet.reportedChecks).toEqual(receipt.checks);
    expect(packet.nativeOutput).toEqual(receipt.nativeOutput);
    expect(packet.canonicalReceiptSha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(packet.nativeSerializationAuthority).toBe(false);
    expect(packet.targetEnvironmentValidated).toBe(false);
    expect(packet.editorImportValidated).toBe(false);
    expect(packet.renderValidated).toBe(false);
    expect(packet.acceptanceAuthority).toBe(false);
    expect(packet.targetCompatibilityClaim).toBe(false);
    expect(packet.productionAcceptance).toBe(false);
    expect(packet.generationEnabled).toBe(false);
    expect(packet.downloadEnabled).toBe(false);
  });

  it('produces a deterministic canonical receipt hash and changes it when private evidence binding changes', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);

    const first = buildGutenbergNativeSerializationReviewPacket(doc, targetProfile, receipt);
    const second = buildGutenbergNativeSerializationReviewPacket(doc, targetProfile, receipt);
    const changed = buildGutenbergNativeSerializationReviewPacket(doc, targetProfile, {
      ...receipt,
      evidenceReference: 'operator://p16/native-round-trip/private-evidence-2',
    });

    expect(first.canonicalReceiptSha256).toBe(second.canonicalReceiptSha256);
    expect(changed.canonicalReceiptSha256).not.toBe(first.canonicalReceiptSha256);
  });

  it('fails closed when document or declared target profile no longer matches the receipt', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);

    const changedDocument = buildGutenbergNativeSerializationReviewPacket(
      document('core/heading'),
      targetProfile,
      receipt,
    );
    const changedProfile = buildGutenbergNativeSerializationReviewPacket(
      doc,
      profile('wp-b'),
      receipt,
    );

    expect(changedDocument.status).toBe('REJECTED_INVALID_RECEIPT');
    expect(changedDocument.bindingMatches).toBe(false);
    expect(changedDocument.canonicalReceiptSha256).toBeNull();
    expect(changedProfile.status).toBe('REJECTED_INVALID_RECEIPT');
    expect(changedProfile.bindingMatches).toBe(false);
    expect(changedProfile.canonicalReceiptSha256).toBeNull();
  });

  it('rejects REVIEW_REQUIRED documents before reported PASS can advance', () => {
    const targetProfile = profile();
    const receipt = validPassReceipt(document(), targetProfile);
    const packet = buildGutenbergNativeSerializationReviewPacket(
      document('my-plugin/card'),
      targetProfile,
      receipt,
    );

    expect(packet.candidateStatus).toBe('REVIEW_REQUIRED');
    expect(packet.status).toBe('REJECTED_INVALID_RECEIPT');
    expect(packet.currentCandidateIdentity).toBeNull();
    expect(packet.reviewNextAction).toBe('FIX_OR_RECAPTURE_EVIDENCE');
  });

  it('serializes deterministically without exposing raw evidence references or native post content', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);

    const first = serializeGutenbergNativeSerializationReviewPacket(doc, targetProfile, receipt);
    const second = serializeGutenbergNativeSerializationReviewPacket(doc, targetProfile, receipt);

    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
    expect(first).not.toContain(receipt.evidenceReference);
    expect(first).not.toContain('<!-- wp:');
    expect(first).not.toContain('postContent');
    expect(first).toContain(receipt.nativeOutput.sha256 as string);
  });
});
