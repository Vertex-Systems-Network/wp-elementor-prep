import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/core/sha256';
import {
  ELEMENTOR_REFERENCE_CLOSURE_EVIDENCE_RECEIPT_VERSION,
  type ElementorReferenceClosureEvidenceReceiptV1,
} from '../src/targets/elementor/reference-closure-evidence';
import { buildElementorReferenceReviewIdentity } from '../src/targets/elementor/reference-review-identity';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function targetProfile() {
  return buildElementorTargetProfile({
    wordpressVersion: 'wp-cli-review-packet',
    elementorVersion: 'elementor-cli-review-packet',
  });
}

function template(globalValue = 'globals/colors?id=cli-private') {
  return {
    title: 'CLI Review Packet',
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
            settings: {
              title: 'Fixture',
              __globals__: { title_color: globalValue },
            },
            elements: [],
          },
        ],
      },
    ],
  };
}

function receipt(
  value: unknown,
  profile: unknown,
  result: 'PASS' | 'FAIL',
): ElementorReferenceClosureEvidenceReceiptV1 {
  return {
    schemaVersion: 1,
    receiptVersion: ELEMENTOR_REFERENCE_CLOSURE_EVIDENCE_RECEIPT_VERSION,
    referenceReviewIdentity: buildElementorReferenceReviewIdentity(value, profile),
    observedAt: '2026-09-14T14:50:00.000Z',
    globalClosureEvidence: {
      result,
      evidenceReference: 'external-review/cli-super-secret-reference',
    },
    assetClosureEvidence: null,
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
  const dir = mkdtempSync(join(tmpdir(), 'p15-reference-closure-review-packet-'));
  tempDirs.push(dir);
  return dir;
}

function runPacket(templatePath: string, profilePath: string, receiptPath: string, outPath: string) {
  return spawnSync(process.execPath, [
    'scripts/p15-reference-closure-review-packet.mjs',
    '--template', templatePath,
    '--profile', profilePath,
    '--receipt', receiptPath,
    '--out', outPath,
  ], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

describe('P15 reference-closure review-packet CLI', () => {
  it('writes exact input hashes and keeps reported PASS non-authorizing/authentication-required', () => {
    const dir = fixtureDir();
    const value = template();
    const profile = targetProfile();
    const input = receipt(value, profile, 'PASS');
    const templateRaw = `${JSON.stringify(value, null, 2)}\n`;
    const profileRaw = `${JSON.stringify(profile, null, 2)}\n`;
    const receiptRaw = `${JSON.stringify(input, null, 2)}\n`;
    const templatePath = join(dir, 'template.json');
    const profilePath = join(dir, 'profile.json');
    const receiptPath = join(dir, 'receipt.json');
    const outPath = join(dir, 'report.json');
    writeFileSync(templatePath, templateRaw);
    writeFileSync(profilePath, profileRaw);
    writeFileSync(receiptPath, receiptRaw);

    const run = runPacket(templatePath, profilePath, receiptPath, outPath);
    expect(run.status).toBe(0);
    const report = JSON.parse(readFileSync(outPath, 'utf8')) as {
      packet: Record<string, unknown>;
      inputs: Record<string, string>;
    };
    expect(report.packet.status).toBe('REPORTED_PASS_AUTHENTICATION_REQUIRED');
    expect(report.packet.evidenceAuthenticationStatus).toBe('NOT_RUN');
    expect(report.packet.internalDecisionStatus).toBe('NOT_RUN');
    expect(report.packet.referenceClosureClaim).toBe(false);
    expect(report.packet.targetCompatibilityClaim).toBe(false);
    expect(report.inputs.templateSha256).toBe(`sha256:${sha256Hex(templateRaw)}`);
    expect(report.inputs.profileSha256).toBe(`sha256:${sha256Hex(profileRaw)}`);
    expect(report.inputs.receiptSha256).toBe(`sha256:${sha256Hex(receiptRaw)}`);
    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain('cli-super-secret-reference');
    expect(serialized).not.toContain('globals/colors?id=cli-private');
  });

  it('writes a valid review-required packet for exact-bound reported FAIL without treating it as a CLI error', () => {
    const dir = fixtureDir();
    const value = template();
    const profile = targetProfile();
    const input = receipt(value, profile, 'FAIL');
    const templatePath = join(dir, 'template.json');
    const profilePath = join(dir, 'profile.json');
    const receiptPath = join(dir, 'receipt.json');
    const outPath = join(dir, 'report.json');
    writeFileSync(templatePath, JSON.stringify(value));
    writeFileSync(profilePath, JSON.stringify(profile));
    writeFileSync(receiptPath, JSON.stringify(input));

    const run = runPacket(templatePath, profilePath, receiptPath, outPath);
    expect(run.status).toBe(0);
    const report = JSON.parse(readFileSync(outPath, 'utf8')) as { packet: Record<string, unknown> };
    expect(report.packet.status).toBe('REPORTED_FAIL_REVIEW_REQUIRED');
    expect(report.packet.allRequiredEvidenceReportsPass).toBe(false);
  });

  it('returns nonzero and writes REJECTED for stale exact-binding evidence', () => {
    const dir = fixtureDir();
    const original = template('globals/colors?id=original');
    const changed = template('globals/colors?id=changed');
    const profile = targetProfile();
    const input = receipt(original, profile, 'PASS');
    const templatePath = join(dir, 'template.json');
    const profilePath = join(dir, 'profile.json');
    const receiptPath = join(dir, 'receipt.json');
    const outPath = join(dir, 'report.json');
    writeFileSync(templatePath, JSON.stringify(changed));
    writeFileSync(profilePath, JSON.stringify(profile));
    writeFileSync(receiptPath, JSON.stringify(input));

    const run = runPacket(templatePath, profilePath, receiptPath, outPath);
    expect(run.status).toBe(2);
    const report = JSON.parse(readFileSync(outPath, 'utf8')) as { packet: Record<string, unknown> };
    expect(report.packet.status).toBe('REJECTED_INVALID_RECEIPT');
    expect(report.packet.receiptValid).toBe(false);
  });

  it('fails before report output when any required JSON input is malformed', () => {
    const dir = fixtureDir();
    const value = template();
    const profile = targetProfile();
    const templatePath = join(dir, 'template.json');
    const profilePath = join(dir, 'profile.json');
    const receiptPath = join(dir, 'receipt.json');
    const outPath = join(dir, 'report.json');
    writeFileSync(templatePath, JSON.stringify(value));
    writeFileSync(profilePath, JSON.stringify(profile));
    writeFileSync(receiptPath, '{not-json');

    const run = runPacket(templatePath, profilePath, receiptPath, outPath);
    expect(run.status).toBe(2);
    expect(run.stderr).toContain('receipt');
    expect(run.stderr).toContain('not valid JSON');
    expect(() => readFileSync(outPath, 'utf8')).toThrow();
  });
});
