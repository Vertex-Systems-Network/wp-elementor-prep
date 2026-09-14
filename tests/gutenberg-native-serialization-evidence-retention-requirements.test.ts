import { describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/core/sha256';
import { buildGutenbergNormalizedCandidateArtifact } from '../src/targets/gutenberg/candidate-artifact';
import { buildGutenbergNormalizedCandidateIdentity } from '../src/targets/gutenberg/candidate-identity';
import {
  GUTENBERG_NATIVE_SERIALIZATION_AUTHENTICATION_REPORT_VERSION,
  type GutenbergNativeSerializationAuthenticationReportV1,
} from '../src/targets/gutenberg/native-serialization-authentication-report';
import {
  buildGutenbergNativeSerializationEvidenceRetentionRequirements,
  fingerprintGutenbergNativeSerializationEvidenceRetentionProfile,
  serializeGutenbergNativeSerializationEvidenceRetentionRequirements,
} from '../src/targets/gutenberg/native-serialization-evidence-retention-requirements';
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
      wordpressVersion: profileValue.environment.wordpressVersion,
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

describe('P16 R1 genuine evidence retention requirements manifest', () => {
  it('builds exact-bound retention requirements only from external-auth PASS prerequisite state', () => {
    const doc = document();
    const targetProfile = profile('6.8.2');
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt, 'PASS');

    const manifest = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
      doc,
      targetProfile,
      receipt,
      report,
    );

    expect(manifest.status).toBe('EVIDENCE_RETENTION_REQUIREMENTS_READY');
    expect(manifest.prerequisiteStatus).toBe('GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED');
    expect(manifest.currentCandidateIdentity?.digest).toBe(report.candidateIdentityDigest);
    expect(manifest.canonicalReceiptSha256).toBe(report.canonicalReceiptSha256);
    expect(manifest.canonicalAuthenticationReportSha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(manifest.declaredWordpressVersion).toBe('6.8.2');
    expect(manifest.requirementsProfile?.requiredBindings).toEqual([
      'candidateIdentityDigest',
      'canonicalReceiptSha256',
      'canonicalAuthenticationReportSha256',
      'declaredWordpressVersion',
    ]);
    expect(manifest.requirementsProfile?.authenticatedEvidenceArtifact).toEqual({
      sha256Required: true,
      byteLengthRequired: true,
      rawArtifactForbiddenInManifest: true,
    });
    expect(manifest.requirementsProfile?.authenticatorIdentity.referenceSha256Required).toBe(true);
    expect(manifest.requirementsProfileSha256).toBe(
      fingerprintGutenbergNativeSerializationEvidenceRetentionProfile(manifest.requirementsProfile!),
    );
    expect(manifest.nextAction).toBe('RETAIN_GENUINE_AUTHENTICATED_EVIDENCE_USING_REQUIREMENTS');
  });

  it('rejects external-auth FAIL before retention requirements become ready', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt, 'FAIL');

    const manifest = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
      doc,
      targetProfile,
      receipt,
      report,
    );

    expect(manifest.status).toBe('REJECTED_PREREQUISITE_NOT_READY');
    expect(manifest.prerequisiteStatus).toBe('EXTERNAL_AUTH_FAIL_REVIEW_REQUIRED');
    expect(manifest.requirementsProfile).toBeNull();
    expect(manifest.requirementsProfileSha256).toBeNull();
    expect(manifest.currentCandidateIdentity).toBeNull();
    expect(manifest.nextAction).toBe('FIX_PREREQUISITE_CHAIN_BEFORE_EVIDENCE_RETENTION');
  });

  it('rejects invalid authentication binding instead of manufacturing requirements readiness', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt);
    const forged = {
      ...report,
      evidenceAuthentication: {
        result: 'PASS',
        sourceEvidenceReferenceSha256: `sha256:${'b'.repeat(64)}`,
      },
    };

    const manifest = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
      doc,
      targetProfile,
      receipt,
      forged,
    );

    expect(manifest.status).toBe('REJECTED_PREREQUISITE_NOT_READY');
    expect(manifest.prerequisiteStatus).toBe('REJECTED_INVALID_AUTHENTICATION_REPORT');
    expect(manifest.canonicalReceiptSha256).toBeNull();
    expect(manifest.canonicalAuthenticationReportSha256).toBeNull();
    expect(manifest.declaredWordpressVersion).toBeNull();
  });

  it('fails closed when document, declared profile or receipt changes underneath the exact chain', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt);

    const changedDocument = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
      document('core/heading'), targetProfile, receipt, report,
    );
    const changedProfile = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
      doc, profile('wp-b'), receipt, report,
    );
    const changedReceipt = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
      doc,
      targetProfile,
      { ...receipt, observedAt: '2026-09-14T20:32:00.000Z' },
      report,
    );

    expect(changedDocument.status).toBe('REJECTED_PREREQUISITE_NOT_READY');
    expect(changedProfile.status).toBe('REJECTED_PREREQUISITE_NOT_READY');
    expect(changedReceipt.status).toBe('REJECTED_PREREQUISITE_NOT_READY');
  });

  it('fingerprints requirements and canonical authentication report deterministically', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt);

    const first = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
      doc, targetProfile, receipt, report,
    );
    const second = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
      doc, targetProfile, receipt, report,
    );
    const changedReport: GutenbergNativeSerializationAuthenticationReportV1 = {
      ...report,
      reportedAt: '2026-09-14T20:40:00.000Z',
    };
    const changed = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
      doc, targetProfile, receipt, changedReport,
    );

    expect(first.requirementsProfileSha256).toBe(second.requirementsProfileSha256);
    expect(first.canonicalAuthenticationReportSha256).toBe(second.canonicalAuthenticationReportSha256);
    expect(changed.requirementsProfileSha256).toBe(first.requirementsProfileSha256);
    expect(changed.canonicalAuthenticationReportSha256).not.toBe(first.canonicalAuthenticationReportSha256);
  });

  it('keeps every authority and internal-decision gate closed', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt);
    const manifest = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
      doc, targetProfile, receipt, report,
    );

    expect(manifest.evidenceAuthenticationStatus).toBe('NOT_RUN');
    expect(manifest.authenticationAuthority).toBe(false);
    expect(manifest.nativeSerializationAuthority).toBe(false);
    expect(manifest.targetEnvironmentValidated).toBe(false);
    expect(manifest.editorImportValidated).toBe(false);
    expect(manifest.renderValidated).toBe(false);
    expect(manifest.decisionAuthority).toBe(false);
    expect(manifest.acceptanceAuthority).toBe(false);
    expect(manifest.targetCompatibilityClaim).toBe(false);
    expect(manifest.productionAcceptance).toBe(false);
    expect(manifest.generationEnabled).toBe(false);
    expect(manifest.downloadEnabled).toBe(false);
    expect(manifest.internalDecisionStatus).toBe('NOT_RUN');
    expect(manifest.internalDecisionEligible).toBe(false);
    expect(manifest.internalReviewRequired).toBe(true);
  });

  it('serializes deterministically without raw or hashed source evidence references or native post content', () => {
    const doc = document();
    const targetProfile = profile();
    const receipt = validPassReceipt(doc, targetProfile);
    const report = validAuthenticationReport(doc, targetProfile, receipt);

    const first = serializeGutenbergNativeSerializationEvidenceRetentionRequirements(
      doc, targetProfile, receipt, report,
    );
    const second = serializeGutenbergNativeSerializationEvidenceRetentionRequirements(
      doc, targetProfile, receipt, report,
    );

    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
    expect(first).not.toContain(receipt.evidenceReference);
    expect(first).not.toContain(report.evidenceAuthentication.sourceEvidenceReferenceSha256);
    expect(first).not.toContain('<!-- wp:');
    expect(first).not.toContain('postContent');
  });
});
