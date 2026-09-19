import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL,
  buildP15ElementorAssetProofVector,
} from '../src/targets/elementor/asset-proof-vector';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-asset-proof-intake-test-'));
  tempDirs.push(dir);
  return dir;
}

describe('P15 asset target proof intake CLI', () => {
  it('accepts exact full-pass evidence while never emitting the raw asset URL', () => {
    const vector = buildP15ElementorAssetProofVector();
    const dir = fixtureDir();
    const candidatePath = join(dir, 'candidate.json');
    const profilePath = join(dir, 'profile.json');
    const proofPath = join(dir, 'proof.json');
    const outPath = join(dir, 'report.json');

    writeFileSync(candidatePath, vector.files['candidate.json']);
    writeFileSync(profilePath, vector.files['target-profile.json']);
    writeFileSync(proofPath, JSON.stringify({
      schemaVersion: 1,
      evidenceVersion: 'elementor-asset-target-proof-evidence-v1',
      candidateIdentity: vector.candidateIdentity,
      targetProfileIdentity: {
        profileVersion: vector.profile.profileVersion,
        fingerprint: vector.targetProfileFingerprint,
      },
      referenceReviewIdentity: {
        identityVersion: vector.referenceReviewIdentity.identityVersion,
        digest: vector.referenceReviewIdentity.digest,
      },
      observedTarget: {
        source: 'OBSERVED',
        wordpressVersion: '6.8',
        elementorVersion: '4.2.4',
        importSurface: 'TEMPLATE_LIBRARY_JSON',
      },
      observedAt: '2026-09-19T09:00:00.000Z',
      evidenceReference: 'retained-evidence://p15/asset-proof-cli',
      steps: {
        importResult: 'PASS',
        targetManagedMediaResult: 'PASS',
        sourceProvenanceResult: 'PASS',
        sourceAssetUrlFingerprint: vector.assetUrlFingerprint,
        targetManagedMediaUrlFingerprint: 'sha256:' + 'a'.repeat(64),
        renderResult: 'PASS',
        renderedImageReferenceResult: 'PASS',
        browserImageLoadResult: 'PASS',
        renderedImageUrlFingerprint: 'sha256:' + 'a'.repeat(64),
      },
      assetReferenceClosureClaim: false,
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      internalReviewRequired: true,
    }, null, 2) + '\n');

    const run = spawnSync(process.execPath, [
      'scripts/p15-elementor-asset-target-proof-intake.mjs',
      '--candidate', candidatePath,
      '--profile', profilePath,
      '--proof', proofPath,
      '--out', outPath,
    ], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    expect(run.status).toBe(0);
    expect(run.stdout).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
    expect(run.stderr).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);

    const reportRaw = readFileSync(outPath, 'utf8');
    const report = JSON.parse(reportRaw);
    expect(report.classification).toBe('ASSET_BOUND_FULL_PASS');
    expect(report.proofValid).toBe(true);
    expect(report.candidateBindingMatches).toBe(true);
    expect(report.profileBindingMatches).toBe(true);
    expect(report.referenceReviewBindingMatches).toBe(true);
    expect(report.sourceAssetBindingMatches).toBe(true);
    expect(report.targetManagedRenderBindingMatches).toBe(true);
    expect(report.imageReferenceBindingMatches).toBe(true);
    expect(report.assetReferenceClosureClaim).toBe(false);
    expect(reportRaw).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
    expect(reportRaw).toContain(vector.assetUrlFingerprint);
  });

  it('returns exit 2 for a stale reference-review identity', () => {
    const vector = buildP15ElementorAssetProofVector();
    const dir = fixtureDir();
    const candidatePath = join(dir, 'candidate.json');
    const profilePath = join(dir, 'profile.json');
    const proofPath = join(dir, 'proof.json');
    const outPath = join(dir, 'report.json');

    writeFileSync(candidatePath, vector.files['candidate.json']);
    writeFileSync(profilePath, vector.files['target-profile.json']);
    writeFileSync(proofPath, JSON.stringify({
      schemaVersion: 1,
      evidenceVersion: 'elementor-asset-target-proof-evidence-v1',
      candidateIdentity: vector.candidateIdentity,
      targetProfileIdentity: {
        profileVersion: vector.profile.profileVersion,
        fingerprint: vector.targetProfileFingerprint,
      },
      referenceReviewIdentity: {
        identityVersion: vector.referenceReviewIdentity.identityVersion,
        digest: 'sha256:' + '0'.repeat(64),
      },
      observedTarget: {
        source: 'OBSERVED',
        wordpressVersion: '6.8',
        elementorVersion: '4.2.4',
        importSurface: 'TEMPLATE_LIBRARY_JSON',
      },
      observedAt: '2026-09-19T09:00:00.000Z',
      evidenceReference: 'retained-evidence://p15/asset-proof-cli-stale',
      steps: {
        importResult: 'PASS',
        targetManagedMediaResult: 'PASS',
        sourceProvenanceResult: 'PASS',
        sourceAssetUrlFingerprint: vector.assetUrlFingerprint,
        targetManagedMediaUrlFingerprint: 'sha256:' + 'a'.repeat(64),
        renderResult: 'PASS',
        renderedImageReferenceResult: 'PASS',
        browserImageLoadResult: 'PASS',
        renderedImageUrlFingerprint: 'sha256:' + 'a'.repeat(64),
      },
      assetReferenceClosureClaim: false,
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      internalReviewRequired: true,
    }, null, 2) + '\n');

    const run = spawnSync(process.execPath, [
      'scripts/p15-elementor-asset-target-proof-intake.mjs',
      '--candidate', candidatePath,
      '--profile', profilePath,
      '--proof', proofPath,
      '--out', outPath,
    ], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    expect(run.status).toBe(2);
    const report = JSON.parse(readFileSync(outPath, 'utf8'));
    expect(report.classification).toBe('REJECTED');
    expect(report.issues.map((issue: { code: string }) => issue.code))
      .toContain('P15_ASSET_PROOF_REFERENCE_REVIEW_MISMATCH');
  });
});
