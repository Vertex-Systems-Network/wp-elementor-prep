import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL,
  P15_ELEMENTOR_ASSET_PROOF_VECTOR_FILENAMES,
  buildP15ElementorAssetProofVector,
} from '../src/targets/elementor/asset-proof-vector';
import { buildP15ElementorFirstProofVector } from '../src/targets/elementor/first-proof-vector';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-asset-proof-vector-test-'));
  tempDirs.push(dir);
  return dir;
}

function runVector(outDir: string) {
  return spawnSync(process.execPath, [
    'scripts/p15-elementor-asset-proof-vector.mjs',
    '--out-dir', outDir,
  ], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

describe('P15 controlled URL-only Image asset proof vector', () => {
  it('rebuilds an exact deterministic production candidate/profile/reference-review vector', () => {
    const first = buildP15ElementorAssetProofVector();
    const second = buildP15ElementorAssetProofVector();

    expect(first.files).toEqual(second.files);
    expect(Object.keys(first.files).sort())
      .toEqual([...P15_ELEMENTOR_ASSET_PROOF_VECTOR_FILENAMES].sort());
    expect(first.manifest.candidateStatus).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
    expect(first.manifest.importValidationStatus).toBe('NOT_RUN');
    expect(first.candidateIdentity.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.targetProfileFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.referenceReviewIdentity.disposition).toBe('EXTERNAL_CLOSURE_REQUIRED');
    expect(first.referenceReviewIdentity.assetReferenceReviewStatus)
      .toBe('EXTERNAL_ASSET_CLOSURE_REQUIRED');
    expect(first.referenceReviewIdentity.assetReferenceStatus).toBe('NOT_VERIFIED');
    expect(first.referenceReviewIdentity.digest).toBe(first.manifest.referenceReviewIdentityDigest);
    expect(first.assetUrlFingerprint).toBe(first.manifest.assetUrlFingerprint);
    expect(first.assetUrlFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('contains exactly one URL-only core Image reference to the controlled local fixture', () => {
    const vector = buildP15ElementorAssetProofVector();
    const template = JSON.parse(vector.files['template.json']) as {
      content: Array<{ elements: Array<{ widgetType?: string; settings?: Record<string, unknown> }> }>;
    };
    const image = template.content[0]?.elements.find((element) => element.widgetType === 'image');
    expect(image).toBeDefined();
    expect(image?.settings?.image).toEqual({
      id: 0,
      url: P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL,
    });
    expect(vector.files['template.json']).toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
    expect(vector.files['reference-review-identity.json']).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
  });

  it('keeps the asset vector explicitly unobserved and non-authorizing', () => {
    const manifest = buildP15ElementorAssetProofVector().manifest;
    expect(manifest.targetEnvironmentObserved).toBe(false);
    expect(manifest.importObserved).toBe(false);
    expect(manifest.renderObserved).toBe(false);
    expect(manifest.imageReferenceObserved).toBe(false);
    expect(manifest.browserImageLoadObserved).toBe(false);
    expect(manifest.assetReferenceClosureClaim).toBe(false);
    expect(manifest.acceptanceAuthority).toBe(false);
    expect(manifest.targetCompatibilityClaim).toBe(false);
    expect(manifest.productionAcceptance).toBe(false);
    expect(manifest.internalReviewRequired).toBe(true);
  });

  it('does not change the retained #483 first-proof vector identity', () => {
    const firstProof = buildP15ElementorFirstProofVector();
    expect(firstProof.candidateIdentity.digest)
      .toBe('sha256:96ffe8a19b0c4d05eccd1e3d28d8b453f41464450ebd6c3f69decc1ab2543f26');
    expect(firstProof.targetProfileFingerprint)
      .toBe('sha256:8c93e6c2c4635f7da845ef737bbce8810bbf4e46334f7496a54b682673a1b676');
    expect(firstProof.manifest.fileSha256.template)
      .toBe('sha256:bf2c229441f93486af7152f9196c265f09ee9e3cefab67d11ecb6765f583e4ad');
  });

  it('writes once, verifies exact existing bytes, rejects drift and never prints the raw URL', () => {
    const dir = fixtureDir();
    const outDir = join(dir, 'vector');

    const generated = runVector(outDir);
    expect(generated.status).toBe(0);
    expect(generated.stdout).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
    for (const filename of P15_ELEMENTOR_ASSET_PROOF_VECTOR_FILENAMES) {
      expect(readFileSync(join(outDir, filename), 'utf8')).toBe(
        buildP15ElementorAssetProofVector().files[filename],
      );
    }

    const verified = runVector(outDir);
    expect(verified.status).toBe(0);
    expect(JSON.parse(verified.stdout).status).toBe('VERIFIED_EXISTING');

    const candidatePath = join(outDir, 'candidate.json');
    const drifted = `${readFileSync(candidatePath, 'utf8')} `;
    writeFileSync(candidatePath, drifted);
    const rejected = runVector(outDir);
    expect(rejected.status).toBe(2);
    expect(rejected.stderr).toContain('Existing vector drift detected in candidate.json');
    expect(readFileSync(candidatePath, 'utf8')).toBe(drifted);
  });
});
