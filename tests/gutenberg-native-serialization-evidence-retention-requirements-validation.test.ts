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
} from '../src/targets/gutenberg/native-serialization-evidence-retention-requirements';
import {
  fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue,
  serializeGutenbergNativeSerializationEvidenceRetentionRequirementsValidation,
  validateGutenbergNativeSerializationEvidenceRetentionRequirements,
} from '../src/targets/gutenberg/native-serialization-evidence-retention-requirements-validation';
import {
  GUTENBERG_NATIVE_SERIALIZATION_VALIDATION_RECEIPT_VERSION,
  type GutenbergNativeSerializationValidationReceiptV1,
} from '../src/targets/gutenberg/native-serialization-validation-contract';
import { buildGutenbergNativeSerializationReviewPacket } from '../src/targets/gutenberg/native-serialization-review-packet';
import {
  GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
  type GutenbergNormalizedParsedBlockDocumentV1,
} from '../src/targets/gutenberg/parsed-block';
import { buildGutenbergTargetProfile } from '../src/targets/gutenberg/target-profile';

function document(blockName = 'core/paragraph'): GutenbergNormalizedParsedBlockDocumentV1 {
  return {
    schemaVersion: 1,
    contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    blocks: [{ blockName, attrs: {}, innerBlocks: [], innerHTML: '' }],
  };
}

function profile(wordpressVersion = '6.8.2') {
  return buildGutenbergTargetProfile({ wordpressVersion });
}

function passReceipt(
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
    observedAt: '2026-09-14T21:24:00.000Z',
    observedResult: 'PASS',
    checks: {
      parseSucceeded: true,
      serializeSucceeded: true,
      roundTripStable: true,
      invalidBlockWarningsObserved: false,
    },
    nativeOutput: {
      sha256: `sha256:${'d'.repeat(64)}`,
      byteLength: 192,
    },
    evidenceReference: 'operator://private/p16/native-evidence-validator-fixture',
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

function authenticationReport(
  documentValue = document(),
  profileValue = profile(),
  receiptValue = passReceipt(documentValue, profileValue),
  result: 'PASS' | 'FAIL' = 'PASS',
): GutenbergNativeSerializationAuthenticationReportV1 {
  const packet = buildGutenbergNativeSerializationReviewPacket(
    documentValue,
    profileValue,
    receiptValue,
  );
  if (!packet.currentCandidateIdentity || !packet.canonicalReceiptSha256) {
    throw new Error('Expected authentication-ready fixture.');
  }
  return {
    schemaVersion: 1,
    reportVersion: GUTENBERG_NATIVE_SERIALIZATION_AUTHENTICATION_REPORT_VERSION,
    candidateIdentityDigest: packet.currentCandidateIdentity.digest,
    canonicalReceiptSha256: packet.canonicalReceiptSha256,
    reportedAt: '2026-09-14T21:25:00.000Z',
    evidenceAuthentication: {
      result,
      sourceEvidenceReferenceSha256: `sha256:${sha256Hex(receiptValue.evidenceReference)}`,
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

function readyFixture() {
  const doc = document();
  const targetProfile = profile();
  const receipt = passReceipt(doc, targetProfile);
  const report = authenticationReport(doc, targetProfile, receipt);
  const manifest = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
    doc,
    targetProfile,
    receipt,
    report,
  );
  if (manifest.status !== 'EVIDENCE_RETENTION_REQUIREMENTS_READY') {
    throw new Error('Expected retention-requirements-ready fixture.');
  }
  return { doc, targetProfile, receipt, report, manifest };
}

function reorderObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => reorderObject(item));
  if (typeof value !== 'object' || value === null) return value;
  const record = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(record)
      .sort()
      .reverse()
      .map((key) => [key, reorderObject(record[key])]),
  );
}

function cloneJsonRecord(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function defineEnumerableProtoKey(target: Record<string, unknown>): void {
  Object.defineProperty(target, '__proto__', {
    value: { polluted: true },
    enumerable: true,
    configurable: true,
    writable: true,
  });
}

describe('P16 retention requirements manifest validation', () => {
  it('accepts only the exact current deterministic requirements manifest without granting authority', () => {
    const { doc, targetProfile, receipt, report, manifest } = readyFixture();
    const validation = validateGutenbergNativeSerializationEvidenceRetentionRequirements(
      manifest,
      doc,
      targetProfile,
      receipt,
      report,
    );

    expect(validation.status).toBe('CURRENT_REQUIREMENTS_MANIFEST_VALID');
    expect(validation.currentRequirementsStatus).toBe('EVIDENCE_RETENTION_REQUIREMENTS_READY');
    expect(validation.providedManifestObject).toBe(true);
    expect(validation.exactSemanticMatch).toBe(true);
    expect(validation.canonicalExpectedManifestSha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(validation.canonicalProvidedManifestSha256)
      .toBe(validation.canonicalExpectedManifestSha256);
    expect(validation.issues).toEqual([]);
    expect(validation.nextAction).toBe('RETAIN_VALIDATED_MANIFEST_AS_NON_AUTHORIZING_METADATA');
    expect(validation.evidenceAuthenticationStatus).toBe('NOT_RUN');
    expect(validation.authenticationAuthority).toBe(false);
    expect(validation.nativeSerializationAuthority).toBe(false);
    expect(validation.targetEnvironmentValidated).toBe(false);
    expect(validation.editorImportValidated).toBe(false);
    expect(validation.renderValidated).toBe(false);
    expect(validation.decisionAuthority).toBe(false);
    expect(validation.acceptanceAuthority).toBe(false);
    expect(validation.targetCompatibilityClaim).toBe(false);
    expect(validation.productionAcceptance).toBe(false);
    expect(validation.generationEnabled).toBe(false);
    expect(validation.downloadEnabled).toBe(false);
    expect(validation.internalDecisionStatus).toBe('NOT_RUN');
    expect(validation.internalDecisionEligible).toBe(false);
    expect(validation.internalReviewRequired).toBe(true);
  });

  it('is independent of JSON object key order while preserving array order', () => {
    const { doc, targetProfile, receipt, report, manifest } = readyFixture();
    const reordered = reorderObject(manifest);
    const validation = validateGutenbergNativeSerializationEvidenceRetentionRequirements(
      reordered,
      doc,
      targetProfile,
      receipt,
      report,
    );

    expect(validation.status).toBe('CURRENT_REQUIREMENTS_MANIFEST_VALID');
    expect(validation.exactSemanticMatch).toBe(true);
    expect(validation.canonicalProvidedManifestSha256)
      .toBe(validation.canonicalExpectedManifestSha256);
  });

  it('rejects extra, missing and mutated manifest fields', () => {
    const { doc, targetProfile, receipt, report, manifest } = readyFixture();
    const extra = { ...manifest, unexpected: true };
    const { nextAction: _omitted, ...missing } = manifest;
    const mutated = { ...manifest, declaredWordpressVersion: '6.9.0' };

    for (const candidate of [extra, missing, mutated]) {
      const validation = validateGutenbergNativeSerializationEvidenceRetentionRequirements(
        candidate,
        doc,
        targetProfile,
        receipt,
        report,
      );
      expect(validation.status).toBe('REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE');
      expect(validation.exactSemanticMatch).toBe(false);
      expect(validation.nextAction).toBe('REEXPORT_CURRENT_RETENTION_REQUIREMENTS_MANIFEST');
      expect(validation.issues.map((issue) => issue.code))
        .toContain('P16_RETENTION_MANIFEST_INVALID_OR_STALE');
    }
  });

  it('preserves and rejects an own top-level __proto__ key instead of dropping it', () => {
    const { doc, targetProfile, receipt, report, manifest } = readyFixture();
    const hostile = cloneJsonRecord(manifest);
    defineEnumerableProtoKey(hostile);

    const cleanFingerprint = fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(manifest);
    const hostileFingerprint = fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(hostile);
    const validation = validateGutenbergNativeSerializationEvidenceRetentionRequirements(
      hostile,
      doc,
      targetProfile,
      receipt,
      report,
    );

    expect(Object.keys(hostile)).toContain('__proto__');
    expect(hostileFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(hostileFingerprint).not.toBe(cleanFingerprint);
    expect(validation.status).toBe('REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE');
    expect(validation.exactSemanticMatch).toBe(false);
    expect(validation.canonicalProvidedManifestSha256).toBe(hostileFingerprint);
    expect(Object.prototype).not.toHaveProperty('polluted');
  });

  it('preserves and rejects a nested own __proto__ key without prototype pollution', () => {
    const { doc, targetProfile, receipt, report, manifest } = readyFixture();
    const hostile = cloneJsonRecord(manifest);
    const requirementsProfile = hostile.requirementsProfile as Record<string, unknown>;
    defineEnumerableProtoKey(requirementsProfile);

    const cleanFingerprint = fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(manifest);
    const hostileFingerprint = fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(hostile);
    const validation = validateGutenbergNativeSerializationEvidenceRetentionRequirements(
      hostile,
      doc,
      targetProfile,
      receipt,
      report,
    );

    expect(Object.keys(requirementsProfile)).toContain('__proto__');
    expect(hostileFingerprint).not.toBe(cleanFingerprint);
    expect(validation.status).toBe('REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE');
    expect(validation.exactSemanticMatch).toBe(false);
    expect(Object.prototype).not.toHaveProperty('polluted');
  });

  it('rejects non-object manifest input without echoing it', () => {
    const { doc, targetProfile, receipt, report } = readyFixture();
    const validation = validateGutenbergNativeSerializationEvidenceRetentionRequirements(
      'private-raw-manifest-value',
      doc,
      targetProfile,
      receipt,
      report,
    );

    expect(validation.status).toBe('REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE');
    expect(validation.providedManifestObject).toBe(false);
    expect(validation.canonicalProvidedManifestSha256).toBeNull();
    expect(validation.issues.map((issue) => issue.code))
      .toContain('P16_RETENTION_MANIFEST_NOT_OBJECT');
    expect(JSON.stringify(validation)).not.toContain('private-raw-manifest-value');
  });

  it('rejects a previously valid manifest when the exact current authentication report changes', () => {
    const { doc, targetProfile, receipt, report, manifest } = readyFixture();
    const changedReport: GutenbergNativeSerializationAuthenticationReportV1 = {
      ...report,
      reportedAt: '2026-09-14T21:26:00.000Z',
    };
    const validation = validateGutenbergNativeSerializationEvidenceRetentionRequirements(
      manifest,
      doc,
      targetProfile,
      receipt,
      changedReport,
    );

    expect(validation.currentRequirementsStatus).toBe('EVIDENCE_RETENTION_REQUIREMENTS_READY');
    expect(validation.status).toBe('REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE');
    expect(validation.exactSemanticMatch).toBe(false);
    expect(validation.canonicalProvidedManifestSha256)
      .not.toBe(validation.canonicalExpectedManifestSha256);
  });

  it('rejects validation entirely when the current exact prerequisite chain is no longer ready', () => {
    const { doc, targetProfile, receipt, manifest } = readyFixture();
    const failReport = authenticationReport(doc, targetProfile, receipt, 'FAIL');
    const validation = validateGutenbergNativeSerializationEvidenceRetentionRequirements(
      manifest,
      doc,
      targetProfile,
      receipt,
      failReport,
    );

    expect(validation.currentRequirementsStatus).toBe('REJECTED_PREREQUISITE_NOT_READY');
    expect(validation.status).toBe('REJECTED_CURRENT_CHAIN_NOT_READY');
    expect(validation.exactSemanticMatch).toBe(false);
    expect(validation.nextAction).toBe('FIX_CURRENT_PREREQUISITE_CHAIN');
    expect(validation.issues.map((issue) => issue.code))
      .toContain('P16_RETENTION_MANIFEST_CURRENT_CHAIN_NOT_READY');
  });

  it('fails closed for stale document, profile or receipt bindings', () => {
    const { doc, targetProfile, receipt, report, manifest } = readyFixture();
    const staleCases: Array<[unknown, unknown, unknown, unknown]> = [
      [document('core/heading'), targetProfile, receipt, report],
      [doc, profile('6.9.0'), receipt, report],
      [doc, targetProfile, { ...receipt, observedAt: '2026-09-14T21:24:30.000Z' }, report],
    ];

    for (const [currentDocument, currentProfile, currentReceipt, currentReport] of staleCases) {
      const validation = validateGutenbergNativeSerializationEvidenceRetentionRequirements(
        manifest,
        currentDocument,
        currentProfile,
        currentReceipt,
        currentReport,
      );
      expect(validation.status).toBe('REJECTED_CURRENT_CHAIN_NOT_READY');
      expect(validation.exactSemanticMatch).toBe(false);
    }
  });

  it('fingerprints semantic manifest content deterministically', () => {
    const { manifest } = readyFixture();
    const reordered = reorderObject(manifest);
    const changed = { ...manifest, declaredWordpressVersion: '6.9.0' };

    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(manifest))
      .toBe(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(reordered));
    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(changed))
      .not.toBe(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(manifest));
    expect(fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(undefined))
      .toBeNull();
  });

  it('serializes only sanitized validation metadata and never echoes manifest/evidence payloads', () => {
    const { doc, targetProfile, receipt, report, manifest } = readyFixture();
    const hostile = {
      ...manifest,
      evidenceReference: receipt.evidenceReference,
      sourceEvidenceReferenceSha256: report.evidenceAuthentication.sourceEvidenceReferenceSha256,
      postContent: '<!-- wp:paragraph -->PRIVATE_NATIVE_CONTENT<!-- /wp:paragraph -->',
    };
    const serialized = serializeGutenbergNativeSerializationEvidenceRetentionRequirementsValidation(
      hostile,
      doc,
      targetProfile,
      receipt,
      report,
    );

    expect(serialized.endsWith('\n')).toBe(true);
    expect(serialized).not.toContain(receipt.evidenceReference);
    expect(serialized).not.toContain(report.evidenceAuthentication.sourceEvidenceReferenceSha256);
    expect(serialized).not.toContain('PRIVATE_NATIVE_CONTENT');
    expect(serialized).not.toContain('<!-- wp:');
    expect(serialized).toContain('REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE');
  });
});