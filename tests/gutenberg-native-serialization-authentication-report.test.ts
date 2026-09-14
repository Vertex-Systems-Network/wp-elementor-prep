import { describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/core/sha256';
import { buildGutenbergNormalizedCandidateArtifact } from '../src/targets/gutenberg/candidate-artifact';
import { buildGutenbergNormalizedCandidateIdentity } from '../src/targets/gutenberg/candidate-identity';
import {
  GUTENBERG_NATIVE_SERIALIZATION_AUTHENTICATION_REPORT_VERSION,
  serializeGutenbergNativeSerializationAuthenticationReport,
  validateGutenbergNativeSerializationAuthenticationReport,
  type GutenbergNativeSerializationAuthenticationReportV1,
} from '../src/targets/gutenberg/native-serialization-authentication-report';
import {
  GUTENBERG_NATIVE_SERIALIZATION_VALIDATION_RECEIPT_VERSION,
  type GutenbergNativeSerializationValidationReceiptV1,
} from '../src/targets/gutenberg/native-serialization-validation-contract';
import { buildGutenbergNativeSerializationReviewPacket } from '../src/targets/gutenberg/native-serialization-review-packet';
import {
  GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
  type GutenbergNormalizedParsedBlockDocumentV1,
  type GutenbergNormalizedParsedBlockV1,
} from '../src/targets/gutenberg/parsed-block';
import { buildGutenbergTargetProfile } from '../src/targets/gutenberg/target-profile';

function block(blockName: string): GutenbergNormalizedParsedBlockV1 {
  return { blockName, attrs: {}, innerBlocks: [], innerHTML: '' };
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

function validAuthenticationReport(
  documentValue = document(),
  profileValue = profile(),
  receipt = validPassReceipt(documentValue, profileValue),
): GutenbergNativeSerializationAuthenticationReportV1 {
  const packet = buildGutenbergNativeSerializationReviewPacket(
    documentValue,
    profileValue,
    receipt,
  );
  if (!packet.currentCandidateIdentity || !packet.canonicalReceiptSha256) {
    throw new Error('Expected an authentication-ready packet fixture.');
  }

  return {
    schemaVersion: 1,
    reportVersion: GUTENBERG_NATIVE_SERIALIZATION_AUTHENTICATION_REPORT_VERSION,
    candidateIdentityDigest: packet.currentCandidateIdentity.digest,
    canonicalReceiptSha256: packet.canonicalReceiptSha256,
    reportedAt: '2026-09-14T20:39:00.000Z',
    evidenceAuthentication: {
      result: 'PASS',
      sourceEvidenceReferenceSha256: `sha256:${sha256Hex(receipt.evidenceReference)}`,
    },
    authenticationAuthority: false,
    nativeSerializationAuthority: false,
    targetEnvironmentValidated: false,
    editorImportValidated: false,
    renderValidated: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalDecisionStatus: 'NOT_RUN',
    internalReviewRequired: true,
  };
}

describe('P16 R1 native evidence authentication report', () => {
  it('accepts exact-bound externally reported PASS without granting authentication or target authority', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt);

    const result = validateGutenbergNativeSerializationAuthenticationReport(
      report,
      doc,
      targetProfile,
      receipt,
    );

    expect(result.valid).toBe(true);
    expect(result.bindingMatches).toBe(true);
    expect(result.status).toBe('EXTERNALLY_REPORTED_PASS');
    expect(result.evidenceAuthenticationReportedResult).toBe('PASS');
    expect(result.evidenceReferenceHashMatches).toBe(true);
    expect(result.allRequiredAuthenticationReportsPass).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.authenticationAuthority).toBe(false);
    expect(result.nativeSerializationAuthority).toBe(false);
    expect(result.targetEnvironmentValidated).toBe(false);
    expect(result.editorImportValidated).toBe(false);
    expect(result.renderValidated).toBe(false);
    expect(result.acceptanceAuthority).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.generationEnabled).toBe(false);
    expect(result.downloadEnabled).toBe(false);
    expect(result.internalDecisionStatus).toBe('NOT_RUN');
    expect(result.internalReviewRequired).toBe(true);
  });

  it('accepts exact-bound externally reported FAIL as non-authorizing failure state', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report: GutenbergNativeSerializationAuthenticationReportV1 = {
      ...validAuthenticationReport(doc, targetProfile, receipt),
      evidenceAuthentication: {
        result: 'FAIL',
        sourceEvidenceReferenceSha256: `sha256:${sha256Hex(receipt.evidenceReference)}`,
      },
    };

    const result = validateGutenbergNativeSerializationAuthenticationReport(
      report,
      doc,
      targetProfile,
      receipt,
    );

    expect(result.valid).toBe(true);
    expect(result.bindingMatches).toBe(true);
    expect(result.status).toBe('EXTERNALLY_REPORTED_FAIL');
    expect(result.evidenceAuthenticationReportedResult).toBe('FAIL');
    expect(result.allRequiredAuthenticationReportsPass).toBe(false);
    expect(result.authenticationAuthority).toBe(false);
    expect(result.internalDecisionStatus).toBe('NOT_RUN');
  });

  it('rejects authentication reporting when the pre-decision prerequisite is not a reported PASS', () => {
    const doc = document();
    const targetProfile = profile();
    const passReceipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, passReceipt);
    const failReceipt: GutenbergNativeSerializationValidationReceiptV1 = {
      ...passReceipt,
      observedResult: 'FAIL',
      checks: {
        parseSucceeded: false,
        serializeSucceeded: false,
        roundTripStable: false,
        invalidBlockWarningsObserved: true,
      },
      nativeOutput: { sha256: null, byteLength: null },
    };

    const result = validateGutenbergNativeSerializationAuthenticationReport(
      report,
      doc,
      targetProfile,
      failReceipt,
    );

    expect(result.valid).toBe(false);
    expect(result.status).toBe('REJECTED');
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_AUTH_PREREQUISITE_NOT_READY');
  });

  it('rejects stale candidate/receipt binding after document or profile changes', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt);

    const changedDocument = validateGutenbergNativeSerializationAuthenticationReport(
      report,
      document('core/heading'),
      targetProfile,
      receipt,
    );
    const changedProfile = validateGutenbergNativeSerializationAuthenticationReport(
      report,
      doc,
      profile('wp-b'),
      receipt,
    );

    expect(changedDocument.valid).toBe(false);
    expect(changedDocument.bindingMatches).toBe(false);
    expect(changedDocument.issues.map((issue) => issue.code)).toContain('P16_NATIVE_AUTH_PREREQUISITE_NOT_READY');
    expect(changedProfile.valid).toBe(false);
    expect(changedProfile.bindingMatches).toBe(false);
    expect(changedProfile.issues.map((issue) => issue.code)).toContain('P16_NATIVE_AUTH_PREREQUISITE_NOT_READY');
  });

  it('rejects an authentication report bound to the wrong evidence-reference hash', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = {
      ...validAuthenticationReport(doc, targetProfile, receipt),
      evidenceAuthentication: {
        result: 'PASS',
        sourceEvidenceReferenceSha256: `sha256:${'b'.repeat(64)}`,
      },
    };

    const result = validateGutenbergNativeSerializationAuthenticationReport(
      report,
      doc,
      targetProfile,
      receipt,
    );

    expect(result.valid).toBe(false);
    expect(result.bindingMatches).toBe(false);
    expect(result.evidenceReferenceHashMatches).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_AUTH_EVIDENCE_INVALID');
  });

  it('rejects malformed timestamps, unknown fields and authority inflation', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const malformed = {
      ...validAuthenticationReport(doc, targetProfile, receipt),
      reportedAt: '2026-09-14',
      authenticationAuthority: true,
      targetCompatibilityClaim: true,
      extra: true,
    };

    const result = validateGutenbergNativeSerializationAuthenticationReport(
      malformed,
      doc,
      targetProfile,
      receipt,
    );

    expect(result.valid).toBe(false);
    expect(result.status).toBe('REJECTED');
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_AUTH_REPORT_SHAPE_INVALID');
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_AUTH_REPORTED_AT_INVALID');
    expect(result.issues.map((issue) => issue.code)).toContain('P16_NATIVE_AUTH_AUTHORITY_FLAGS_INVALID');
    expect(result.authenticationAuthority).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
  });

  it('serializes valid reports deterministically without raw evidence references or native post content', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt);

    const first = serializeGutenbergNativeSerializationAuthenticationReport(
      report,
      doc,
      targetProfile,
      receipt,
    );
    const second = serializeGutenbergNativeSerializationAuthenticationReport(
      report,
      doc,
      targetProfile,
      receipt,
    );

    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
    expect(first).toContain(report.evidenceAuthentication.sourceEvidenceReferenceSha256);
    expect(first).not.toContain(receipt.evidenceReference);
    expect(first).not.toContain('<!-- wp:');
    expect(first).not.toContain('postContent');
  });
});
