import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildGutenbergNormalizedCandidateArtifact } from '../src/targets/gutenberg/candidate-artifact';
import { buildGutenbergNormalizedCandidateIdentity } from '../src/targets/gutenberg/candidate-identity';
import {
  buildGutenbergNativeSerializationIntakeReport,
  serializeGutenbergNativeSerializationIntakeReport,
} from '../src/targets/gutenberg/native-serialization-intake';
import {
  GUTENBERG_NATIVE_SERIALIZATION_VALIDATION_RECEIPT_VERSION,
  type GutenbergNativeSerializationValidationReceiptV1,
} from '../src/targets/gutenberg/native-serialization-validation-contract';
import {
  GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
  type GutenbergNormalizedParsedBlockDocumentV1,
} from '../src/targets/gutenberg/parsed-block';
import { buildGutenbergTargetProfile } from '../src/targets/gutenberg/target-profile';

function document(blockName = 'core/paragraph'): GutenbergNormalizedParsedBlockDocumentV1 {
  return {
    schemaVersion: 1,
    contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    blocks: [{
      blockName,
      attrs: {},
      innerBlocks: [],
      innerHTML: '',
    }],
  };
}

function profile(wordpressVersion = 'wp-a') {
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
    observedAt: '2026-09-14T18:45:00.000Z',
    observedResult: 'PASS',
    checks: {
      parseSucceeded: true,
      serializeSucceeded: true,
      roundTripStable: true,
      invalidBlockWarningsObserved: false,
    },
    nativeOutput: {
      sha256: `sha256:${'c'.repeat(64)}`,
      byteLength: 256,
    },
    evidenceReference: 'operator://private/native-evidence-reference',
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

function inputFor(
  documentValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
) {
  return {
    documentRaw: `${JSON.stringify(documentValue, null, 2)}\n`,
    documentValue,
    profileRaw: `${JSON.stringify(profileValue, null, 2)}\n`,
    profileValue,
    receiptRaw: `${JSON.stringify(receiptValue, null, 2)}\n`,
    receiptValue,
  };
}

describe('P16 offline native-serialization evidence intake', () => {
  it('emits a sanitized exact-bound BOUND_REPORTED_PASS without granting authority', () => {
    const documentValue = document();
    const profileValue = profile();
    const receiptValue = passReceipt(documentValue, profileValue);
    const report = buildGutenbergNativeSerializationIntakeReport(
      inputFor(documentValue, profileValue, receiptValue),
    );

    expect(report.status).toBe('BOUND_REPORTED_PASS');
    expect(report.candidateStatus).toBe('READY_FOR_NATIVE_SERIALIZATION_VALIDATION');
    expect(report.receiptValid).toBe(true);
    expect(report.bindingMatches).toBe(true);
    expect(report.reportedResult).toBe('PASS');
    expect(report.currentCandidateIdentity).toEqual(receiptValue.candidateIdentity);
    expect(report.reportedChecks).toEqual(receiptValue.checks);
    expect(report.nativeOutput).toEqual(receiptValue.nativeOutput);
    expect(report.inputs.documentSha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(report.inputs.profileSha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(report.inputs.receiptSha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(report.nativeSerializationAuthority).toBe(false);
    expect(report.targetEnvironmentValidated).toBe(false);
    expect(report.editorImportValidated).toBe(false);
    expect(report.renderValidated).toBe(false);
    expect(report.acceptanceAuthority).toBe(false);
    expect(report.targetCompatibilityClaim).toBe(false);
    expect(report.productionAcceptance).toBe(false);
    expect(report.generationEnabled).toBe(false);
    expect(report.downloadEnabled).toBe(false);
    expect(report.internalReviewRequired).toBe(true);

    const serialized = serializeGutenbergNativeSerializationIntakeReport(report);
    expect(serialized).not.toContain(receiptValue.evidenceReference);
    expect(serialized).not.toContain('<!-- wp:');
  });

  it('emits BOUND_REPORTED_FAIL for a valid exact-bound externally reported FAIL', () => {
    const documentValue = document();
    const profileValue = profile();
    const receiptValue: GutenbergNativeSerializationValidationReceiptV1 = {
      ...passReceipt(documentValue, profileValue),
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

    const report = buildGutenbergNativeSerializationIntakeReport(
      inputFor(documentValue, profileValue, receiptValue),
    );
    expect(report.status).toBe('BOUND_REPORTED_FAIL');
    expect(report.receiptValid).toBe(true);
    expect(report.bindingMatches).toBe(true);
    expect(report.reportedResult).toBe('FAIL');
    expect(report.nativeSerializationAuthority).toBe(false);
  });

  it('rejects a stale receipt bound to another exact candidate identity', () => {
    const currentDocument = document('core/paragraph');
    const currentProfile = profile('wp-a');
    const staleReceipt = passReceipt(document('core/heading'), currentProfile);

    const report = buildGutenbergNativeSerializationIntakeReport(
      inputFor(currentDocument, currentProfile, staleReceipt),
    );
    expect(report.status).toBe('REJECTED');
    expect(report.receiptValid).toBe(false);
    expect(report.bindingMatches).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain('P16_NATIVE_RECEIPT_BINDING_MISMATCH');
  });

  it('rejects REVIEW_REQUIRED normalized input before external PASS can become bound evidence', () => {
    const reviewDocument = document('my-plugin/card');
    const currentProfile = profile();
    const receiptValue = passReceipt(document(), currentProfile);

    const report = buildGutenbergNativeSerializationIntakeReport(
      inputFor(reviewDocument, currentProfile, receiptValue),
    );
    expect(report.status).toBe('REJECTED');
    expect(report.candidateStatus).toBe('REVIEW_REQUIRED');
    expect(report.currentCandidateIdentity).toBeNull();
    expect(report.bindingMatches).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain('P16_NATIVE_RECEIPT_CANDIDATE_NOT_READY');
  });

  it('hashes exact raw input bytes deterministically without echoing their sensitive receipt reference', () => {
    const documentValue = document();
    const profileValue = profile();
    const receiptValue = passReceipt(documentValue, profileValue);
    const input = inputFor(documentValue, profileValue, receiptValue);
    const first = buildGutenbergNativeSerializationIntakeReport(input);
    const second = buildGutenbergNativeSerializationIntakeReport({ ...input });

    expect(second.inputs).toEqual(first.inputs);
    expect(serializeGutenbergNativeSerializationIntakeReport(second))
      .toBe(serializeGutenbergNativeSerializationIntakeReport(first));
    expect(JSON.stringify(first)).not.toContain(receiptValue.evidenceReference);
  });

  it('runs the Node-20 launcher end to end and writes only sanitized report evidence', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-intake-test-'));
    try {
      const documentValue = document();
      const profileValue = profile();
      const receiptValue = passReceipt(documentValue, profileValue);
      const documentPath = join(dir, 'document.json');
      const profilePath = join(dir, 'profile.json');
      const receiptPath = join(dir, 'receipt.json');
      const outPath = join(dir, 'report.json');

      await writeFile(documentPath, `${JSON.stringify(documentValue, null, 2)}\n`, 'utf8');
      await writeFile(profilePath, `${JSON.stringify(profileValue, null, 2)}\n`, 'utf8');
      await writeFile(receiptPath, `${JSON.stringify(receiptValue, null, 2)}\n`, 'utf8');

      const result = spawnSync(process.execPath, [
        'scripts/p16-native-serialization-intake.mjs',
        '--document', documentPath,
        '--profile', profilePath,
        '--receipt', receiptPath,
        '--out', outPath,
      ], {
        cwd: process.cwd(),
        encoding: 'utf8',
      });

      expect(result.status).toBe(0);
      expect(result.stderr).toBe('');
      expect(result.stdout).toContain('"status": "BOUND_REPORTED_PASS"');

      const written = await readFile(outPath, 'utf8');
      const report = JSON.parse(written) as Record<string, unknown>;
      expect(report.status).toBe('BOUND_REPORTED_PASS');
      expect(written).not.toContain(receiptValue.evidenceReference);
      expect(written).not.toContain('<!-- wp:');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
