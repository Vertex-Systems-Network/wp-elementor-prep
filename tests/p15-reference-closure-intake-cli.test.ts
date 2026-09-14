import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/core/sha256';
import {
  ELEMENTOR_REFERENCE_CLOSURE_EVIDENCE_RECEIPT_VERSION,
  serializeElementorReferenceClosureEvidenceReceipt,
  type ElementorReferenceClosureEvidenceReceiptV1,
} from '../src/targets/elementor/reference-closure-evidence';
import { buildElementorReferenceReviewIdentity } from '../src/targets/elementor/reference-review-identity';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function profile(suffix = 'declared') {
  return buildElementorTargetProfile({
    wordpressVersion: `wp-${suffix}`,
    elementorVersion: `elementor-${suffix}`,
  });
}

function template(widgetType = 'heading', settings: Record<string, unknown> = { title: 'Fixture' }) {
  return {
    title: 'Reference Closure Intake',
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
            id: 'widget-1',
            elType: 'widget',
            widgetType,
            isInner: false,
            settings,
            elements: [],
          },
        ],
      },
    ],
  };
}

function receipt(
  value: unknown,
  targetProfile: unknown,
  globalClosureEvidence: ElementorReferenceClosureEvidenceReceiptV1['globalClosureEvidence'],
  assetClosureEvidence: ElementorReferenceClosureEvidenceReceiptV1['assetClosureEvidence'],
): ElementorReferenceClosureEvidenceReceiptV1 {
  return {
    schemaVersion: 1,
    receiptVersion: ELEMENTOR_REFERENCE_CLOSURE_EVIDENCE_RECEIPT_VERSION,
    referenceReviewIdentity: buildElementorReferenceReviewIdentity(value, targetProfile),
    observedAt: '2026-09-14T12:00:00.000Z',
    globalClosureEvidence,
    assetClosureEvidence,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-reference-closure-intake-test-'));
  tempDirs.push(dir);
  return dir;
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function runIntake(templatePath: string, profilePath: string, receiptPath: string, outPath: string) {
  return spawnSync(process.execPath, [
    'scripts/p15-reference-closure-intake.mjs',
    '--template', templatePath,
    '--profile', profilePath,
    '--receipt', receiptPath,
    '--out', outPath,
  ], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

function writeInputs(
  dir: string,
  value: unknown,
  targetProfile: unknown,
  receiptRaw: string,
): { templatePath: string; profilePath: string; receiptPath: string; outPath: string; templateRaw: string; profileRaw: string } {
  const templatePath = join(dir, 'template.json');
  const profilePath = join(dir, 'profile.json');
  const receiptPath = join(dir, 'receipt.json');
  const outPath = join(dir, 'report.json');
  const templateRaw = json(value);
  const profileRaw = json(targetProfile);
  writeFileSync(templatePath, templateRaw);
  writeFileSync(profilePath, profileRaw);
  writeFileSync(receiptPath, receiptRaw);
  return { templatePath, profilePath, receiptPath, outPath, templateRaw, profileRaw };
}

describe('P15 reference-closure evidence operator intake', () => {
  it('writes sanitized BOUND_REPORTED_PASS with exact input hashes for exact-bound global PASS evidence', () => {
    const dir = fixtureDir();
    const value = template('heading', {
      title: 'Global fixture',
      __globals__: { title_color: 'globals/colors?id=private-global-value' },
    });
    const targetProfile = profile();
    const input = receipt(value, targetProfile, {
      result: 'PASS',
      evidenceReference: 'external-secret-reference://global/pass-123',
    }, null);
    const receiptRaw = serializeElementorReferenceClosureEvidenceReceipt(input, value, targetProfile);
    const paths = writeInputs(dir, value, targetProfile, receiptRaw);

    const run = runIntake(paths.templatePath, paths.profilePath, paths.receiptPath, paths.outPath);
    expect(run.status).toBe(0);
    const reportText = readFileSync(paths.outPath, 'utf8');
    const report = JSON.parse(reportText) as Record<string, any>;
    expect(report.status).toBe('BOUND_REPORTED_PASS');
    expect(report.receiptValid).toBe(true);
    expect(report.bindingMatches).toBe(true);
    expect(report.reportedResults).toEqual({ global: 'PASS', asset: null });
    expect(report.allRequiredEvidenceReportsPass).toBe(true);
    expect(report.inputs.templateSha256).toBe(`sha256:${sha256Hex(paths.templateRaw)}`);
    expect(report.inputs.profileSha256).toBe(`sha256:${sha256Hex(paths.profileRaw)}`);
    expect(report.inputs.receiptSha256).toBe(`sha256:${sha256Hex(receiptRaw)}`);
    expect(report.acceptanceAuthority).toBe(false);
    expect(report.referenceClosureClaim).toBe(false);
    expect(report.targetCompatibilityClaim).toBe(false);
    expect(report.productionAcceptance).toBe(false);
    expect(report.generationEnabled).toBe(false);
    expect(report.downloadEnabled).toBe(false);
    expect(report.internalReviewRequired).toBe(true);
    expect(reportText).not.toContain('external-secret-reference://global/pass-123');
    expect(reportText).not.toContain('private-global-value');
  });

  it('retains exact-bound asset FAIL as valid reported evidence but exits nonzero', () => {
    const dir = fixtureDir();
    const value = template('image', {
      image: { id: 55, url: 'https://source.example.test/private-image.jpg' },
    });
    const targetProfile = profile();
    const input = receipt(value, targetProfile, null, {
      result: 'FAIL',
      evidenceReference: 'external-secret-reference://asset/fail-55',
    });
    const receiptRaw = serializeElementorReferenceClosureEvidenceReceipt(input, value, targetProfile);
    const paths = writeInputs(dir, value, targetProfile, receiptRaw);

    const run = runIntake(paths.templatePath, paths.profilePath, paths.receiptPath, paths.outPath);
    expect(run.status).toBe(2);
    const reportText = readFileSync(paths.outPath, 'utf8');
    const report = JSON.parse(reportText) as Record<string, any>;
    expect(report.status).toBe('BOUND_REPORTED_FAIL');
    expect(report.receiptValid).toBe(true);
    expect(report.bindingMatches).toBe(true);
    expect(report.reportedResults).toEqual({ global: null, asset: 'FAIL' });
    expect(report.allRequiredEvidenceReportsPass).toBe(false);
    expect(reportText).not.toContain('external-secret-reference://asset/fail-55');
    expect(reportText).not.toContain('https://source.example.test/private-image.jpg');
  });

  it('requires both currently required evidence classes to report PASS for a successful intake', () => {
    const dir = fixtureDir();
    const value = template('image', {
      image: { id: 77, url: 'https://source.example.test/combined-private.jpg' },
      __globals__: { border_color: 'globals/colors?id=combined-private-global' },
    });
    const targetProfile = profile();
    const input = receipt(value, targetProfile, {
      result: 'PASS',
      evidenceReference: 'external-secret-reference://global/combined',
    }, {
      result: 'PASS',
      evidenceReference: 'external-secret-reference://asset/combined',
    });
    const receiptRaw = serializeElementorReferenceClosureEvidenceReceipt(input, value, targetProfile);
    const paths = writeInputs(dir, value, targetProfile, receiptRaw);

    const run = runIntake(paths.templatePath, paths.profilePath, paths.receiptPath, paths.outPath);
    expect(run.status).toBe(0);
    const report = JSON.parse(readFileSync(paths.outPath, 'utf8')) as Record<string, any>;
    expect(report.status).toBe('BOUND_REPORTED_PASS');
    expect(report.reportedResults).toEqual({ global: 'PASS', asset: 'PASS' });
    expect(report.allRequiredEvidenceReportsPass).toBe(true);
    expect(report.referenceClosureClaim).toBe(false);
  });

  it('rejects receipt replay when either the template or declared target profile changes', () => {
    const originalValue = template('heading', {
      title: 'Original',
      __globals__: { title_color: 'globals/colors?id=stale-binding' },
    });
    const originalProfile = profile('original');
    const input = receipt(originalValue, originalProfile, {
      result: 'PASS',
      evidenceReference: 'external-review/global/stale',
    }, null);
    const receiptRaw = serializeElementorReferenceClosureEvidenceReceipt(input, originalValue, originalProfile);

    const templateDir = fixtureDir();
    const changedValue = template('heading', {
      title: 'Changed',
      __globals__: { title_color: 'globals/colors?id=stale-binding' },
    });
    const templatePaths = writeInputs(templateDir, changedValue, originalProfile, receiptRaw);
    const templateRun = runIntake(templatePaths.templatePath, templatePaths.profilePath, templatePaths.receiptPath, templatePaths.outPath);
    expect(templateRun.status).toBe(2);
    const templateReport = JSON.parse(readFileSync(templatePaths.outPath, 'utf8')) as Record<string, any>;
    expect(templateReport.status).toBe('REJECTED');
    expect(templateReport.receiptValid).toBe(false);
    expect(templateReport.bindingMatches).toBe(false);

    const profileDir = fixtureDir();
    const changedProfile = profile('changed');
    const profilePaths = writeInputs(profileDir, originalValue, changedProfile, receiptRaw);
    const profileRun = runIntake(profilePaths.templatePath, profilePaths.profilePath, profilePaths.receiptPath, profilePaths.outPath);
    expect(profileRun.status).toBe(2);
    const profileReport = JSON.parse(readFileSync(profilePaths.outPath, 'utf8')) as Record<string, any>;
    expect(profileReport.status).toBe('REJECTED');
    expect(profileReport.receiptValid).toBe(false);
    expect(profileReport.bindingMatches).toBe(false);
  });

  it('rejects generic receipt intake for REVIEW_REQUIRED and no-reference current states', () => {
    const targetProfile = profile();

    const reviewValue = template('third-party-widget', {
      __globals__: { custom_color: 'globals/colors?id=review-required' },
    });
    const reviewReceipt = receipt(reviewValue, targetProfile, {
      result: 'PASS',
      evidenceReference: 'external-review/global/review-required',
    }, null);
    expect(reviewReceipt.referenceReviewIdentity.disposition).toBe('REVIEW_REQUIRED');
    const reviewDir = fixtureDir();
    const reviewPaths = writeInputs(reviewDir, reviewValue, targetProfile, json(reviewReceipt));
    const reviewRun = runIntake(reviewPaths.templatePath, reviewPaths.profilePath, reviewPaths.receiptPath, reviewPaths.outPath);
    expect(reviewRun.status).toBe(2);
    const reviewReport = JSON.parse(readFileSync(reviewPaths.outPath, 'utf8')) as Record<string, any>;
    expect(reviewReport.status).toBe('REJECTED');
    expect(reviewReport.issues.some((issue: { code: string }) => issue.code === 'P15_REFERENCE_CLOSURE_IDENTITY_NOT_ELIGIBLE')).toBe(true);

    const noReferenceValue = template();
    const noReferenceReceipt = receipt(noReferenceValue, targetProfile, null, null);
    expect(noReferenceReceipt.referenceReviewIdentity.disposition).toBe('NO_EXTERNAL_REFERENCE_CLOSURE_REQUIRED');
    const noReferenceDir = fixtureDir();
    const noReferencePaths = writeInputs(noReferenceDir, noReferenceValue, targetProfile, json(noReferenceReceipt));
    const noReferenceRun = runIntake(noReferencePaths.templatePath, noReferencePaths.profilePath, noReferencePaths.receiptPath, noReferencePaths.outPath);
    expect(noReferenceRun.status).toBe(2);
    const noReferenceReport = JSON.parse(readFileSync(noReferencePaths.outPath, 'utf8')) as Record<string, any>;
    expect(noReferenceReport.status).toBe('REJECTED');
    expect(noReferenceReport.receiptValid).toBe(false);
  });

  it('fails before report output on malformed receipt JSON', () => {
    const dir = fixtureDir();
    const value = template('heading', {
      __globals__: { title_color: 'globals/colors?id=malformed' },
    });
    const targetProfile = profile();
    const paths = writeInputs(dir, value, targetProfile, '{not-json');

    const run = runIntake(paths.templatePath, paths.profilePath, paths.receiptPath, paths.outPath);
    expect(run.status).toBe(2);
    expect(run.stderr).toContain('receipt');
    expect(run.stderr).toContain('is not valid JSON');
    expect(() => readFileSync(paths.outPath, 'utf8')).toThrow();
  });
});
