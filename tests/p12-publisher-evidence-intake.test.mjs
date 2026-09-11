import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  collectPublisherEvidence,
  collectPublisherPackagePreflight,
} from '../scripts/p12-publisher-evidence-intake.mjs';

const roots = [];

function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function makeFixture({ manifestId = '1680034649341961379', expectedManifestId = manifestId } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'p12-publisher-'));
  roots.push(root);
  const packageDir = join(root, 'plugin');
  await mkdir(packageDir);

  const code = Buffer.from('console.log("fixture");\n');
  const ui = Buffer.from('<!doctype html><title>fixture</title>\n');
  const manifest = Buffer.from(
    `${JSON.stringify(
      {
        name: 'WP Builders Prepare',
        id: manifestId,
        api: '1.0.0',
        editorType: ['figma'],
        documentAccess: 'dynamic-page',
        main: 'code.js',
        ui: 'ui.html',
        networkAccess: { allowedDomains: ['none'] },
      },
      null,
      2,
    )}\n`,
  );
  const zip = Buffer.from('synthetic exact package zip bytes');

  await writeFile(join(packageDir, 'code.js'), code);
  await writeFile(join(packageDir, 'manifest.json'), manifest);
  await writeFile(join(packageDir, 'ui.html'), ui);
  const packageZipPath = join(root, 'publish.zip');
  await writeFile(packageZipPath, zip);

  const evidencePaths = {
    runtimeScreenshot: join(root, 'runtime.png'),
    publishDetailsScreenshot: join(root, 'publish.png'),
    twoFactorScreenshot: join(root, 'twofa.png'),
  };
  await writeFile(evidencePaths.runtimeScreenshot, Buffer.from('runtime screenshot bytes'));
  await writeFile(evidencePaths.publishDetailsScreenshot, Buffer.from('publish screenshot bytes'));
  await writeFile(evidencePaths.twoFactorScreenshot, Buffer.from('twofa screenshot bytes'));

  const candidate = {
    schemaVersion: 1,
    releaseLabel: 'fixture release',
    pluginName: 'WP Builders Prepare',
    packageVersion: '0.1.0-alpha.1',
    pluginId: '1680034649341961379',
    sourceSha: '5f12b1d28146d5c2af815cc9f83eb30431dce4b5',
    artifact: { name: 'fixture', id: 1, sha256: digest('artifact') },
    importPackage: {
      sha256: digest(zip),
      files: {
        'code.js': digest(code),
        'manifest.json': digest(manifest),
        'ui.html': digest(ui),
      },
    },
    expectedManifest: {
      name: 'WP Builders Prepare',
      id: expectedManifestId,
      api: '1.0.0',
      editorType: ['figma'],
      documentAccess: 'dynamic-page',
      allowedDomains: ['none'],
    },
    community: {
      publishTarget: 'Community',
      supportContact: 'info@vertexsystemsnetwork.com',
    },
    requiredEvidence: ['runtimeScreenshot', 'publishDetailsScreenshot', 'twoFactorScreenshot'],
    requiredAttestations: [
      'exactPackageOpened',
      'validManifestIdObserved',
      'publisherIdentityObserved',
      'communityTargetObserved',
      'supportContactObserved',
      'noNetworkAccessObserved',
      'twoFactorEnabledObserved',
    ],
  };

  const attestations = Object.fromEntries(candidate.requiredAttestations.map((key) => [key, true]));
  return { root, packageDir, packageZipPath, evidencePaths, candidate, attestations };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('P12 publisher evidence intake', () => {
  it('validates the exact package independently before any live evidence is collected', async () => {
    const fixture = await makeFixture();
    const receipt = await collectPublisherPackagePreflight({
      candidate: fixture.candidate,
      packageDir: fixture.packageDir,
      packageZipPath: fixture.packageZipPath,
      generatedAt: '2026-09-11T09:59:00.000Z',
    });

    expect(receipt.gate).toBe('p12-publisher-package-preflight');
    expect(receipt.packagePreflightComplete).toBe(true);
    expect(receipt.evidenceBundleComplete).toBe(false);
    expect(receipt.runtimeEvidenceCollected).toBe(false);
    expect(receipt.acceptanceAuthority).toBe(false);
    expect(receipt.package.zip.sha256).toBe(fixture.candidate.importPackage.sha256);
    expect(receipt.package.manifest.id).toBe(fixture.candidate.pluginId);
    expect(receipt).not.toHaveProperty('evidence');
    expect(receipt).not.toHaveProperty('operatorAttestations');
    expect(receipt.semantics.finalEvidenceIntakeStillRequired).toBe(true);
    expect(receipt.semantics.noTwoFactorStateClaimed).toBe(true);
  });

  it('binds exact package bytes and hashed manual evidence without granting acceptance authority', async () => {
    const fixture = await makeFixture();
    const receipt = await collectPublisherEvidence({
      ...fixture,
      generatedAt: '2026-09-11T10:00:00.000Z',
    });

    expect(receipt.packagePreflightComplete).toBe(true);
    expect(receipt.evidenceBundleComplete).toBe(true);
    expect(receipt.acceptanceAuthority).toBe(false);
    expect(receipt.package.zip.sha256).toBe(fixture.candidate.importPackage.sha256);
    expect(receipt.package.manifest.id).toBe(fixture.candidate.pluginId);
    expect(receipt.evidence.runtimeScreenshot.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(receipt.operatorAttestations.twoFactorEnabledObserved).toBe(true);
    expect(receipt.semantics.screenshotsAreHashedNotInterpreted).toBe(true);
    expect(receipt.semantics.finalInternalAcceptanceRequiresSeparateReview).toBe(true);
  });

  it('fails closed when an extracted package file does not match the pinned candidate', async () => {
    const fixture = await makeFixture();
    await writeFile(join(fixture.packageDir, 'code.js'), 'tampered');

    await expect(collectPublisherEvidence(fixture)).rejects.toThrow(/package file hash mismatch for code\.js/);
  });

  it('fails package preflight closed when the exact publish ZIP does not match the pinned candidate', async () => {
    const fixture = await makeFixture();
    await writeFile(fixture.packageZipPath, 'different zip bytes');

    await expect(
      collectPublisherPackagePreflight({
        candidate: fixture.candidate,
        packageDir: fixture.packageDir,
        packageZipPath: fixture.packageZipPath,
      }),
    ).rejects.toThrow(/publish ZIP hash mismatch/);
  });

  it('fails closed when a required operator attestation is missing', async () => {
    const fixture = await makeFixture();
    fixture.attestations.twoFactorEnabledObserved = false;

    await expect(collectPublisherEvidence(fixture)).rejects.toThrow(/twoFactorEnabledObserved/);
  });

  it('validates manifest semantics independently of pinned file hashes', async () => {
    const fixture = await makeFixture({ manifestId: '1680034649341961379', expectedManifestId: '9999999999999999999' });

    await expect(collectPublisherEvidence(fixture)).rejects.toThrow(/manifest id mismatch/);
  });
});
