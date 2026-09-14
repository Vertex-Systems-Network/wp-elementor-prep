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
import { buildGutenbergNativeSerializationEvidenceRetentionRequirements } from '../src/targets/gutenberg/native-serialization-evidence-retention-requirements';
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
    blocks: [{ blockName: 'core/paragraph', attrs: {}, innerBlocks: [], innerHTML: '' }],
  };
}

function profile() {
  return buildGutenbergTargetProfile({ wordpressVersion: '6.8.2' });
}

function receipt(
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
    observedAt: '2026-09-14T21:37:00.000Z',
    observedResult: 'PASS',
    checks: {
      parseSucceeded: true,
      serializeSucceeded: true,
      roundTripStable: true,
      invalidBlockWarningsObserved: false,
    },
    nativeOutput: { sha256: `sha256:${'e'.repeat(64)}`, byteLength: 224 },
    evidenceReference: 'operator://private/p16/validation-cli-evidence',
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

function authReport(
  documentValue = document(),
  profileValue = profile(),
  receiptValue = receipt(documentValue, profileValue),
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
    reportedAt: '2026-09-14T21:38:00.000Z',
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

type Files = {
  documentPath: string;
  profilePath: string;
  receiptPath: string;
  authenticationReportPath: string;
  manifestPath: string;
  outPath: string;
  evidenceReference: string;
  sourceEvidenceReferenceSha256: string;
};

async function writeFiles(
  dir: string,
  options: { authResult?: 'PASS' | 'FAIL'; tamperManifest?: boolean; hostileManifest?: boolean } = {},
): Promise<Files> {
  const documentValue = document();
  const profileValue = profile();
  const receiptValue = receipt(documentValue, profileValue);
  const reportValue = authReport(
    documentValue,
    profileValue,
    receiptValue,
    options.authResult ?? 'PASS',
  );
  const manifestValue = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
    documentValue,
    profileValue,
    receiptValue,
    reportValue,
  );

  let providedManifest: Record<string, unknown> = { ...manifestValue };
  if (options.tamperManifest) {
    providedManifest = { ...providedManifest, declaredWordpressVersion: '6.9.0' };
  }
  if (options.hostileManifest) {
    providedManifest = {
      ...providedManifest,
      evidenceReference: receiptValue.evidenceReference,
      sourceEvidenceReferenceSha256: reportValue.evidenceAuthentication.sourceEvidenceReferenceSha256,
      postContent: '<!-- wp:paragraph -->PRIVATE_NATIVE_CONTENT<!-- /wp:paragraph -->',
    };
  }

  const documentPath = join(dir, 'document.json');
  const profilePath = join(dir, 'profile.json');
  const receiptPath = join(dir, 'receipt.json');
  const authenticationReportPath = join(dir, 'authentication-report.json');
  const manifestPath = join(dir, 'manifest.json');
  const outPath = join(dir, 'validation.json');

  await writeFile(documentPath, `${JSON.stringify(documentValue, null, 2)}\n`, 'utf8');
  await writeFile(profilePath, `${JSON.stringify(profileValue, null, 2)}\n`, 'utf8');
  await writeFile(receiptPath, `${JSON.stringify(receiptValue, null, 2)}\n`, 'utf8');
  await writeFile(authenticationReportPath, `${JSON.stringify(reportValue, null, 2)}\n`, 'utf8');
  await writeFile(manifestPath, `${JSON.stringify(providedManifest, null, 2)}\n`, 'utf8');

  return {
    documentPath,
    profilePath,
    receiptPath,
    authenticationReportPath,
    manifestPath,
    outPath,
    evidenceReference: receiptValue.evidenceReference,
    sourceEvidenceReferenceSha256: reportValue.evidenceAuthentication.sourceEvidenceReferenceSha256,
  };
}

function args(files: Files): string[] {
  return [
    'scripts/p16-evidence-retention-requirements-validate.mjs',
    '--document', files.documentPath,
    '--profile', files.profilePath,
    '--receipt', files.receiptPath,
    '--authentication-report', files.authenticationReportPath,
    '--manifest', files.manifestPath,
    '--out', files.outPath,
  ];
}

describe('P16 exact-current retention manifest validation CLI', () => {
  it('validates an exact-current saved manifest and writes only sanitized metadata', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-retention-validate-'));
    try {
      const files = await writeFiles(dir);
      const result = spawnSync(process.execPath, args(files), { cwd: process.cwd(), encoding: 'utf8' });

      expect(result.status).toBe(0);
      expect(result.stderr).toBe('');
      expect(result.stdout).toContain('"status": "CURRENT_REQUIREMENTS_MANIFEST_VALID"');
      expect(result.stdout).toContain('"currentRequirementsStatus": "EVIDENCE_RETENTION_REQUIREMENTS_READY"');
      expect(result.stdout).toContain('"exactSemanticMatch": true');
      expect(result.stdout).toMatch(/"canonicalExpectedManifestSha256": "sha256:[0-9a-f]{64}"/);
      expect(result.stdout).toMatch(/"canonicalProvidedManifestSha256": "sha256:[0-9a-f]{64}"/);
      expect(result.stdout).not.toContain(files.evidenceReference);
      expect(result.stdout).not.toContain(files.sourceEvidenceReferenceSha256);

      const written = await readFile(files.outPath, 'utf8');
      const validation = JSON.parse(written) as Record<string, unknown>;
      expect(validation.status).toBe('CURRENT_REQUIREMENTS_MANIFEST_VALID');
      expect(validation.exactSemanticMatch).toBe(true);
      expect(validation.evidenceAuthenticationStatus).toBe('NOT_RUN');
      expect(validation.authenticationAuthority).toBe(false);
      expect(validation.internalDecisionStatus).toBe('NOT_RUN');
      expect(validation.internalDecisionEligible).toBe(false);
      expect(written).not.toContain(files.evidenceReference);
      expect(written).not.toContain(files.sourceEvidenceReferenceSha256);
      expect(written).not.toContain('postContent');
      expect(written).not.toContain('<!-- wp:');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects a stale/tampered saved manifest with exit 2', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-retention-stale-'));
    try {
      const files = await writeFiles(dir, { tamperManifest: true });
      const result = spawnSync(process.execPath, args(files), { cwd: process.cwd(), encoding: 'utf8' });

      expect(result.status).toBe(2);
      expect(result.stderr).toBe('');
      expect(result.stdout).toContain('"status": "REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE"');
      expect(result.stdout).toContain('"exactSemanticMatch": false');
      const written = await readFile(files.outPath, 'utf8');
      expect(written).toContain('REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE');
      expect(written).not.toContain('6.9.0');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects when the current prerequisite chain is not ready', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-retention-not-ready-'));
    try {
      const files = await writeFiles(dir, { authResult: 'FAIL' });
      const result = spawnSync(process.execPath, args(files), { cwd: process.cwd(), encoding: 'utf8' });

      expect(result.status).toBe(2);
      expect(result.stderr).toBe('');
      expect(result.stdout).toContain('"status": "REJECTED_CURRENT_CHAIN_NOT_READY"');
      expect(result.stdout).toContain('"currentRequirementsStatus": "REJECTED_PREREQUISITE_NOT_READY"');
      expect(result.stdout).toContain('"exactSemanticMatch": false');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('never echoes hostile manifest payloads in stdout or written validation output', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-retention-hostile-'));
    try {
      const files = await writeFiles(dir, { hostileManifest: true });
      const result = spawnSync(process.execPath, args(files), { cwd: process.cwd(), encoding: 'utf8' });

      expect(result.status).toBe(2);
      expect(result.stdout).not.toContain(files.evidenceReference);
      expect(result.stdout).not.toContain(files.sourceEvidenceReferenceSha256);
      expect(result.stdout).not.toContain('PRIVATE_NATIVE_CONTENT');
      expect(result.stdout).not.toContain('<!-- wp:');

      const written = await readFile(files.outPath, 'utf8');
      expect(written).not.toContain(files.evidenceReference);
      expect(written).not.toContain(files.sourceEvidenceReferenceSha256);
      expect(written).not.toContain('PRIVATE_NATIVE_CONTENT');
      expect(written).not.toContain('<!-- wp:');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('fails closed on unsupported, duplicate and missing manifest arguments', async () => {
    const unsupported = spawnSync(process.execPath, [
      'scripts/p16-evidence-retention-requirements-validate.mjs',
      '--unsupported', 'value',
    ], { cwd: process.cwd(), encoding: 'utf8' });
    expect(unsupported.status).toBe(2);
    expect(unsupported.stderr).toContain('Unsupported option: --unsupported.');

    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-retention-args-'));
    try {
      const files = await writeFiles(dir);
      const missing = spawnSync(process.execPath, [
        'scripts/p16-evidence-retention-requirements-validate.mjs',
        '--document', files.documentPath,
        '--profile', files.profilePath,
        '--receipt', files.receiptPath,
        '--authentication-report', files.authenticationReportPath,
      ], { cwd: process.cwd(), encoding: 'utf8' });
      expect(missing.status).toBe(2);
      expect(missing.stderr).toContain('Missing required --manifest.');

      const duplicate = spawnSync(process.execPath, [
        ...args(files),
        '--manifest', files.manifestPath,
      ], { cwd: process.cwd(), encoding: 'utf8' });
      expect(duplicate.status).toBe(2);
      expect(duplicate.stderr).toContain('Duplicate option: --manifest.');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
