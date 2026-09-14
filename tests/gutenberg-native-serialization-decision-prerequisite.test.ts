import { describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/core/sha256';
import { buildGutenbergNormalizedCandidateArtifact } from '../src/targets/gutenberg/candidate-artifact';
import { buildGutenbergNormalizedCandidateIdentity } from '../src/targets/gutenberg/candidate-identity';
import {
  GUTENBERG_NATIVE_SERIALIZATION_AUTHENTICATION_REPORT_VERSION,
  type GutenbergNativeSerializationAuthenticationReportV1,
} from '../src/targets/gutenberg/native-serialization-authentication-report';
import {
  buildGutenbergNativeSerializationDecisionPrerequisite,
  serializeGutenbergNativeSerializationDecisionPrerequisite,
} from '../src/targets/gutenberg/native-serialization-decision-prerequisite';
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
  result: 'PASS' | 'FAIL' = 'PASS',
): GutenbergNativeSerializationAuthenticationReportV1 {
  const packet = buildGutenbergNativeSerializationReviewPacket(
    documentValue,
    profileValue,
    receipt,
  );
  if (!packet.currentCandidateIdentity || !packet.canonicalReceiptSha256) {
    throw new Error('Expected authentication-ready fixture.');
  }

  return {
    schemaVersion: 1,
    reportVersion: GUTENBERG_NATIVE_SERIALIZATION_AUTHENTICATION_REPORT_VERSION,
    candidateIdentityDigest: packet.currentCandidateIdentity.digest,
    canonicalReceiptSha256: packet.canonicalReceiptSha256,
    reportedAt: '2026-09-14T20:39:00.000Z',
    evidenceAuthentication: {
      result,
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

describe('P16 R1 native decision prerequisite packet', () => {
  it('rejects invalid authentication reports and grants no decision authority', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const invalidReport = {
      ...validAuthenticationReport(doc, targetProfile, receipt),
      evidenceAuthentication: {
        result: 'PASS',
        sourceEvidenceReferenceSha256: `sha256:${'b'.repeat(64)}`,
      },
    };

    const packet = buildGutenbergNativeSerializationDecisionPrerequisite(
      doc,
      targetProfile,
      receipt,
      invalidReport,
    );

    expect(packet.status).toBe('REJECTED_INVALID_AUTHENTICATION_REPORT');
    expect(packet.nextAction).toBe('FIX_OR_RECAPTURE_AUTHENTICATION_REPORT');
    expect(packet.authenticationReportValid).toBe(false);
    expect(packet.authenticationBindingMatches).toBe(false);
    expect(packet.canonicalAuthenticationReportSha256).toBeNull();
    expect(packet.decisionAuthority).toBe(false);
    expect(packet.authenticationAuthority).toBe(false);
    expect(packet.nativeSerializationAuthority).toBe(false);
    expect(packet.internalDecisionStatus).toBe('NOT_RUN');
  });

  it('routes exact-bound externally reported authentication FAIL to review', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt, 'FAIL');

    const packet = buildGutenbergNativeSerializationDecisionPrerequisite(
      doc,
      targetProfile,
      receipt,
      report,
    );

    expect(packet.status).toBe('EXTERNAL_AUTH_FAIL_REVIEW_REQUIRED');
    expect(packet.nextAction).toBe('REVIEW_REPORTED_AUTHENTICATION_FAILURE');
    expect(packet.authenticationReportValid).toBe(true);
    expect(packet.authenticationBindingMatches).toBe(true);
    expect(packet.externalAuthenticationReportedResult).toBe('FAIL');
    expect(packet.canonicalAuthenticationReportSha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(packet.internalDecisionStatus).toBe('NOT_RUN');
    expect(packet.internalReviewRequired).toBe(true);
  });

  it('keeps exact-bound externally reported PASS at genuine-authentication-evidence-required', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt, 'PASS');
    const candidate = buildGutenbergNormalizedCandidateArtifact(doc, targetProfile);

    const packet = buildGutenbergNativeSerializationDecisionPrerequisite(
      doc,
      targetProfile,
      receipt,
      report,
    );

    expect(packet.status).toBe('GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED');
    expect(packet.nextAction).toBe('RETAIN_GENUINE_AUTHENTICATED_EVIDENCE_BEFORE_INTERNAL_DECISION');
    expect(packet.currentCandidateIdentity).toEqual(buildGutenbergNormalizedCandidateIdentity(candidate));
    expect(packet.externalAuthenticationReportedResult).toBe('PASS');
    expect(packet.authenticationAuthority).toBe(false);
    expect(packet.nativeSerializationAuthority).toBe(false);
    expect(packet.targetEnvironmentValidated).toBe(false);
    expect(packet.editorImportValidated).toBe(false);
    expect(packet.renderValidated).toBe(false);
    expect(packet.decisionAuthority).toBe(false);
    expect(packet.acceptanceAuthority).toBe(false);
    expect(packet.targetCompatibilityClaim).toBe(false);
    expect(packet.productionAcceptance).toBe(false);
    expect(packet.generationEnabled).toBe(false);
    expect(packet.downloadEnabled).toBe(false);
    expect(packet.internalDecisionStatus).toBe('NOT_RUN');
  });

  it('fails closed when document or profile changes underneath the exact-bound chain', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt);

    const changedDocument = buildGutenbergNativeSerializationDecisionPrerequisite(
      document('core/heading'),
      targetProfile,
      receipt,
      report,
    );
    const changedProfile = buildGutenbergNativeSerializationDecisionPrerequisite(
      doc,
      profile('wp-b'),
      receipt,
      report,
    );

    expect(changedDocument.status).toBe('REJECTED_INVALID_AUTHENTICATION_REPORT');
    expect(changedDocument.authenticationBindingMatches).toBe(false);
    expect(changedDocument.canonicalAuthenticationReportSha256).toBeNull();
    expect(changedProfile.status).toBe('REJECTED_INVALID_AUTHENTICATION_REPORT');
    expect(changedProfile.authenticationBindingMatches).toBe(false);
    expect(changedProfile.canonicalAuthenticationReportSha256).toBeNull();
  });

  it('fails closed when the exact receipt changes', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt);
    const changedReceipt: GutenbergNativeSerializationValidationReceiptV1 = {
      ...receipt,
      observedAt: '2026-09-14T20:32:00.000Z',
    };

    const packet = buildGutenbergNativeSerializationDecisionPrerequisite(
      doc,
      targetProfile,
      changedReceipt,
      report,
    );

    expect(packet.status).toBe('REJECTED_INVALID_AUTHENTICATION_REPORT');
    expect(packet.authenticationBindingMatches).toBe(false);
    expect(packet.canonicalAuthenticationReportSha256).toBeNull();
  });

  it('fingerprints canonical valid authentication-report bytes deterministically', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt);

    const first = buildGutenbergNativeSerializationDecisionPrerequisite(doc, targetProfile, receipt, report);
    const second = buildGutenbergNativeSerializationDecisionPrerequisite(doc, targetProfile, receipt, report);
    const changedReport: GutenbergNativeSerializationAuthenticationReportV1 = {
      ...report,
      reportedAt: '2026-09-14T20:40:00.000Z',
    };
    const changed = buildGutenbergNativeSerializationDecisionPrerequisite(
      doc,
      targetProfile,
      receipt,
      changedReport,
    );

    expect(first.canonicalAuthenticationReportSha256).toBe(second.canonicalAuthenticationReportSha256);
    expect(changed.canonicalAuthenticationReportSha256).not.toBe(first.canonicalAuthenticationReportSha256);
  });

  it('serializes deterministically without raw evidence references or native post content', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt);

    const first = serializeGutenbergNativeSerializationDecisionPrerequisite(
      doc,
      targetProfile,
      receipt,
      report,
    );
    const second = serializeGutenbergNativeSerializationDecisionPrerequisite(
      doc,
      targetProfile,
      receipt,
      report,
    );

    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
    expect(first).not.toContain(receipt.evidenceReference);
    expect(first).not.toContain('<!-- wp:');
    expect(first).not.toContain('postContent');
    expect(first).not.toContain(report.evidenceAuthentication.sourceEvidenceReferenceSha256);
    expect(first).toMatch(/"canonicalAuthenticationReportSha256": "sha256:[0-9a-f]{64}"/);
  });
});
