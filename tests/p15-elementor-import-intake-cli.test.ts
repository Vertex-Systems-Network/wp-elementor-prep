import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildElementorTemplateCandidateArtifact,
  serializeElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from '../src/targets/elementor/candidate-artifact';
import {
  ELEMENTOR_IMPORT_VALIDATION_RECEIPT_VERSION,
  buildElementorTemplateCandidateIdentity,
  serializeElementorImportValidationReceipt,
  type ElementorImportValidationReceiptV1,
} from '../src/targets/elementor/import-validation-contract';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function candidate(title: string): ElementorTemplateCandidateArtifactV1 {
  const artifact = buildElementorTemplateCandidateArtifact({
    title: 'Operator Intake Fixture',
    type: 'page',
    version: '0.4',
    page_settings: [],
    content: [
      {
        id: 'container-1',
        elType: 'container',
        isInner: false,
        settings: {},
        elements: [
          {
            id: 'heading-1',
            elType: 'widget',
            widgetType: 'heading',
            isInner: false,
            settings: { title },
            elements: [],
          },
        ],
      },
    ],
  });
  expect(artifact.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
  return artifact;
}

function receipt(
  artifact: ElementorTemplateCandidateArtifactV1,
  observedResult: 'PASS' | 'FAIL',
): ElementorImportValidationReceiptV1 {
  return {
    schemaVersion: 1,
    receiptVersion: ELEMENTOR_IMPORT_VALIDATION_RECEIPT_VERSION,
    candidateIdentity: buildElementorTemplateCandidateIdentity(artifact),
    target: {
      wordpressVersion: 'observed-wordpress-version',
      elementorVersion: 'observed-elementor-version',
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: '2026-09-14T12:30:00.000Z',
    observedResult,
    evidenceReference: 'retained-evidence://operator-capture/integration-fixture',
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
  };
}

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-elementor-intake-test-'));
  tempDirs.push(dir);
  return dir;
}

function runIntake(candidatePath: string, receiptPath: string, outPath: string) {
  return spawnSync(process.execPath, [
    'scripts/p15-elementor-import-intake.mjs',
    '--candidate', candidatePath,
    '--receipt', receiptPath,
    '--out', outPath,
  ], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

describe('P15 Elementor import evidence operator intake', () => {
  it('writes a non-authorizing BOUND_OBSERVED_PASS report for exact-bound PASS evidence', () => {
    const dir = fixtureDir();
    const artifact = candidate('PASS candidate');
    const candidatePath = join(dir, 'candidate.json');
    const receiptPath = join(dir, 'receipt.json');
    const outPath = join(dir, 'report.json');
    writeFileSync(candidatePath, serializeElementorTemplateCandidateArtifact(artifact));
    writeFileSync(receiptPath, serializeElementorImportValidationReceipt(receipt(artifact, 'PASS'), artifact));

    const run = runIntake(candidatePath, receiptPath, outPath);
    expect(run.status).toBe(0);
    const report = JSON.parse(readFileSync(outPath, 'utf8')) as Record<string, unknown>;
    expect(report.status).toBe('BOUND_OBSERVED_PASS');
    expect(report.receiptValid).toBe(true);
    expect(report.bindingMatches).toBe(true);
    expect(report.observedResult).toBe('PASS');
    expect(report.acceptanceAuthority).toBe(false);
    expect(report.targetCompatibilityClaim).toBe(false);
    expect(report.productionAcceptance).toBe(false);
    expect(report.downloadEnabled).toBe(false);
    expect(report.internalReviewRequired).toBe(true);
    expect(JSON.stringify(report)).not.toContain('acceptanceAuthority":true');
  });

  it('retains exact-bound observed FAIL as evidence but returns nonzero', () => {
    const dir = fixtureDir();
    const artifact = candidate('FAIL candidate');
    const candidatePath = join(dir, 'candidate.json');
    const receiptPath = join(dir, 'receipt.json');
    const outPath = join(dir, 'report.json');
    writeFileSync(candidatePath, serializeElementorTemplateCandidateArtifact(artifact));
    writeFileSync(receiptPath, serializeElementorImportValidationReceipt(receipt(artifact, 'FAIL'), artifact));

    const run = runIntake(candidatePath, receiptPath, outPath);
    expect(run.status).toBe(2);
    const report = JSON.parse(readFileSync(outPath, 'utf8')) as Record<string, unknown>;
    expect(report.status).toBe('BOUND_OBSERVED_FAIL');
    expect(report.receiptValid).toBe(true);
    expect(report.bindingMatches).toBe(true);
    expect(report.observedResult).toBe('FAIL');
    expect(report.internalReviewRequired).toBe(true);
  });

  it('rejects a receipt replayed against a different candidate', () => {
    const dir = fixtureDir();
    const original = candidate('Original candidate');
    const different = candidate('Different candidate');
    const candidatePath = join(dir, 'candidate.json');
    const receiptPath = join(dir, 'receipt.json');
    const outPath = join(dir, 'report.json');
    writeFileSync(candidatePath, serializeElementorTemplateCandidateArtifact(different));
    writeFileSync(receiptPath, serializeElementorImportValidationReceipt(receipt(original, 'PASS'), original));

    const run = runIntake(candidatePath, receiptPath, outPath);
    expect(run.status).toBe(2);
    const report = JSON.parse(readFileSync(outPath, 'utf8')) as Record<string, unknown>;
    expect(report.status).toBe('REJECTED');
    expect(report.receiptValid).toBe(false);
    expect(report.bindingMatches).toBe(false);
    expect(JSON.stringify(report)).toContain('P15_IMPORT_RECEIPT_BINDING_MISMATCH');
  });

  it('fails before report output on malformed receipt JSON', () => {
    const dir = fixtureDir();
    const artifact = candidate('Malformed receipt fixture');
    const candidatePath = join(dir, 'candidate.json');
    const receiptPath = join(dir, 'receipt.json');
    const outPath = join(dir, 'report.json');
    writeFileSync(candidatePath, serializeElementorTemplateCandidateArtifact(artifact));
    writeFileSync(receiptPath, '{not-json');

    const run = runIntake(candidatePath, receiptPath, outPath);
    expect(run.status).toBe(2);
    expect(run.stderr).toContain('is not valid JSON');
    expect(() => readFileSync(outPath, 'utf8')).toThrow();
  });
});
