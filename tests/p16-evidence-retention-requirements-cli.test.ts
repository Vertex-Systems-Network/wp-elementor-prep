import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/core/sha256';
import { buildGutenbergNormalizedCandidateArtifact } from '../src/targets/gutenberg/candidate-artifact';
import { buildGutenbergNormalizedCandidateIdentity } from '../src/targets/gutenberg/candidate-identity';
import {
  GUTENBERG_NATIVE_SERIALIZATION_AUTHENTICATION_REPORT_VERSION,
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
} from '../src/targets/gutenberg/parsed-block';
import { buildGutenbergTargetProfile } from '../src/targets/gutenberg/target-profile';

function document(): GutenbergNormalizedParsedBlockDocumentV1 {
  return {
    schemaVersion: 1,
    contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    blocks: [{
      blockName: 'core/paragraph',
      attrs: {},
      innerBlocks: [],
      innerHTML: '',
    }],
  };
}

function profile() {
  return buildGutenbergTargetProfile({ wordpressVersion: '6.8.2' });
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
    evidenceReference: 'operator://p16/private/native-evidence-reference',
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
    reportedAt: '2026-09-14T20:39:00.000Z',
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

async function writeFixtureFiles(
  dir: string,
  authResult: 'PASS' | 'FAIL' = 'PASS',
): Promise<{
  documentPath: string;
  profilePath: string;
  receiptPath: string;
  authenticationReportPath: string;
  outPath: string;
  evidenceReference: string;
  sourceEvidenceReferenceSha256: string;
}> {
  const documentValue = document();
  const profileValue = profile();
  const receiptValue = passReceipt(documentValue, profileValue);
  const reportValue = authenticationReport(documentValue, profileValue, receiptValue, authResult);
  const documentPath = join(dir, 'document.json');
  const profilePath = join(dir, 'profile.json');
  const receiptPath = join(dir, 'receipt.json');
  const authenticationReportPath = join(dir, 'authentication-report.json');
  const outPath = join(dir, 'requirements.json');

  await writeFile(documentPath, `${JSON.stringify(documentValue, null, 2)}\n`, 'utf8');
  await writeFile(profilePath, `${JSON.stringify(profileValue, null, 2)}\n`, 'utf8');
  await writeFile(receiptPath, `${JSON.stringify(receiptValue, null, 2)}\n`, 'utf8');
  await writeFile(authenticationReportPath, `${JSON.stringify(reportValue, null, 2)}\n`, 'utf8');

  return {
    documentPath,
    profilePath,
    receiptPath,
    authenticationReportPath,
    outPath,
    evidenceReference: receiptValue.evidenceReference,
    sourceEvidenceReferenceSha256: reportValue.evidenceAuthentication.sourceEvidenceReferenceSha256,
  };
}

function launcherArgs(files: {
  documentPath: string;
  profilePath: string;
  receiptPath: string;
  authenticationReportPath: string;
  outPath: string;
}): string[] {
  return [
    'scripts/p16-evidence-retention-requirements.mjs',
    '--document', files.documentPath,
    '--profile', files.profilePath,
    '--receipt', files.receiptPath,
    '--authentication-report', files.authenticationReportPath,
    '--out', files.outPath,
  ];
}

describe('P16 evidence-retention requirements operator export CLI', () => {
  it('writes a sanitized READY requirements manifest and safe stdout summary', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-retention-export-'));
    try {
      const files = await writeFixtureFiles(dir, 'PASS');
      const result = spawnSync(process.execPath, launcherArgs(files), {
        cwd: process.cwd(),
        encoding: 'utf8',
      });

      expect(result.status).toBe(0);
      expect(result.stderr).toBe('');
      expect(result.stdout).toContain('"status": "EVIDENCE_RETENTION_REQUIREMENTS_READY"');
      expect(result.stdout).toContain('"prerequisiteStatus": "GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED"');
      expect(result.stdout).toContain('"declaredWordpressVersion": "6.8.2"');
      expect(result.stdout).not.toContain(files.evidenceReference);
      expect(result.stdout).not.toContain(files.sourceEvidenceReferenceSha256);

      const written = await readFile(files.outPath, 'utf8');
      const manifest = JSON.parse(written) as Record<string, unknown>;
      expect(manifest.status).toBe('EVIDENCE_RETENTION_REQUIREMENTS_READY');
      expect(manifest.evidenceAuthenticationStatus).toBe('NOT_RUN');
      expect(manifest.authenticationAuthority).toBe(false);
      expect(manifest.internalDecisionStatus).toBe('NOT_RUN');
      expect(manifest.internalDecisionEligible).toBe(false);
      expect(written).not.toContain(files.evidenceReference);
      expect(written).not.toContain(files.sourceEvidenceReferenceSha256);
      expect(written).not.toContain('<!-- wp:');
      expect(written).not.toContain('postContent');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('writes a sanitized rejected manifest and exits 2 for an auth-FAIL prerequisite', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-retention-reject-'));
    try {
      const files = await writeFixtureFiles(dir, 'FAIL');
      const result = spawnSync(process.execPath, launcherArgs(files), {
        cwd: process.cwd(),
        encoding: 'utf8',
      });

      expect(result.status).toBe(2);
      expect(result.stderr).toBe('');
      expect(result.stdout).toContain('"status": "REJECTED_PREREQUISITE_NOT_READY"');
      expect(result.stdout).toContain('"prerequisiteStatus": "EXTERNAL_AUTH_FAIL_REVIEW_REQUIRED"');

      const written = await readFile(files.outPath, 'utf8');
      expect(written).toContain('"status": "REJECTED_PREREQUISITE_NOT_READY"');
      expect(written).not.toContain(files.evidenceReference);
      expect(written).not.toContain(files.sourceEvidenceReferenceSha256);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('fails closed on unsupported options before reading inputs', () => {
    const result = spawnSync(process.execPath, [
      'scripts/p16-evidence-retention-requirements.mjs',
      '--unsupported', 'value',
    ], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('P16_EVIDENCE_RETENTION_REQUIREMENTS_FAILED: Unsupported option: --unsupported.');
  });

  it('fails closed when a required authentication-report path is missing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-retention-missing-'));
    try {
      const files = await writeFixtureFiles(dir, 'PASS');
      const result = spawnSync(process.execPath, [
        'scripts/p16-evidence-retention-requirements.mjs',
        '--document', files.documentPath,
        '--profile', files.profilePath,
        '--receipt', files.receiptPath,
        '--out', files.outPath,
      ], {
        cwd: process.cwd(),
        encoding: 'utf8',
      });

      expect(result.status).toBe(2);
      expect(result.stderr).toContain('P16_EVIDENCE_RETENTION_REQUIREMENTS_FAILED: Missing required --authentication-report.');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
