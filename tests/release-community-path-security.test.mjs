import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const roots = [];
const SOURCE_SHA = '0123456789abcdef0123456789abcdef01234567';
const PLUGIN_ID = '123456789012345678';

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function finalReleaseFixture() {
  const root = await mkdtemp(join(tmpdir(), 'release-path-security-'));
  roots.push(root);
  const release = join(root, 'release');
  const plugin = join(release, 'plugin');
  const assetRoot = join(root, 'assets');
  await mkdir(plugin, { recursive: true });
  await mkdir(assetRoot, { recursive: true });

  const releaseInfo = {
    schemaVersion: 1,
    fixture: false,
    pluginName: 'Fixture Plugin',
    packageVersion: '1.0.0',
    pluginId: PLUGIN_ID,
    sourceSha: SOURCE_SHA,
    editorTypes: ['figma'],
    networkAccess: { allowedDomains: ['none'] },
    userCommands: [],
    acceptedIntegratedCapabilities: [],
    releaseFiles: ['manifest.json'],
  };
  await writeFile(join(plugin, 'manifest.json'), '{}\n', 'utf8');
  await writeFile(join(release, 'RELEASE_INFO.json'), `${JSON.stringify(releaseInfo, null, 2)}\n`, 'utf8');
  await writeFile(join(release, 'SHA256SUMS.txt'), 'fixture sums\n', 'utf8');
  await writeFile(join(assetRoot, 'asset.bin'), 'asset bytes\n', 'utf8');
  await writeFile(join(root, 'outside.txt'), 'outside bytes\n', 'utf8');

  const listing = {
    schemaVersion: 1,
    name: 'Fixture Plugin',
    publishTarget: 'Community',
    category: 'Software development',
    supportContact: 'support@example.com',
    assets: {
      icon: { path: 'asset.bin' },
      carousel: { paths: [] },
    },
  };
  const listingPath = join(assetRoot, 'listing.json');
  await writeFile(listingPath, `${JSON.stringify(listing, null, 2)}\n`, 'utf8');

  return { root, release, assetRoot, listing, listingPath, releaseInfo };
}

function runFinalRelease({ release, assetRoot, listingPath, output }) {
  return spawnSync(process.execPath, [
    'scripts/final-release-attestation.mjs',
    `--release=${release}`,
    `--community=${listingPath}`,
    `--asset-root=${assetRoot}`,
    `--out=${output}`,
    `--expected-plugin-id=${PLUGIN_ID}`,
    `--source-sha=${SOURCE_SHA}`,
  ], { cwd: process.cwd(), encoding: 'utf8' });
}

describe('release and Community path security', () => {
  it('attests valid files that remain inside their declared roots', async () => {
    const fixture = await finalReleaseFixture();
    const output = join(fixture.root, 'attestation.json');
    const result = runFinalRelease({ ...fixture, output });

    expect(result.status).toBe(0);
    const attestation = JSON.parse(await readFile(output, 'utf8'));
    expect(attestation.community.listingPath).toBe('listing.json');
    expect(attestation.community.assets['asset.bin']).toMatch(/^[0-9a-f]{64}$/);
  });

  it('rejects Community asset traversal outside asset-root', async () => {
    const fixture = await finalReleaseFixture();
    fixture.listing.assets.icon.path = '../outside.txt';
    await writeFile(fixture.listingPath, `${JSON.stringify(fixture.listing, null, 2)}\n`, 'utf8');

    const result = runFinalRelease({ ...fixture, output: join(fixture.root, 'attestation.json') });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/escapes its declared root|relative path inside its declared root/);
  });

  it('rejects releaseFiles traversal before hashing outside plugin/', async () => {
    const fixture = await finalReleaseFixture();
    fixture.releaseInfo.releaseFiles = ['../outside.txt'];
    await writeFile(
      join(fixture.release, 'RELEASE_INFO.json'),
      `${JSON.stringify(fixture.releaseInfo, null, 2)}\n`,
      'utf8',
    );

    const result = runFinalRelease({ ...fixture, output: join(fixture.root, 'attestation.json') });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/releaseFiles entries must be plain filenames inside plugin/);
  });

  it('rejects a Community privacy-policy traversal before publishable/template checks', async () => {
    const workspaceDir = await mkdtemp(join(process.cwd(), '.community-security-'));
    roots.push(workspaceDir);
    const listingPath = join(workspaceDir, 'listing.json');
    const listing = {
      schemaVersion: 1,
      name: 'Fixture Plugin',
      tagline: 'Fixture plugin tagline',
      description: 'Fixture description that is long enough for the verifier.',
      category: '__SELECT_IN_FIGMA_PUBLISH_MODAL__',
      tags: ['audit'],
      supportContact: '__REQUIRED_BEFORE_PUBLISH__',
      privacyPolicy: '../package.json',
      commentsEnabled: true,
      publishTarget: '__COMMUNITY_OR_ORGANIZATION__',
      assets: {
        icon: {
          path: '__ADD_FINAL_ICON_BEFORE_PUBLISH__',
          recommendedWidth: 128,
          recommendedHeight: 128,
        },
        thumbnail: {
          path: '__ADD_FINAL_THUMBNAIL_BEFORE_PUBLISH__',
          recommendedWidth: 1920,
          recommendedHeight: 1080,
        },
        carousel: { paths: [], maxItems: 9 },
      },
      reviewRequiredForCommunity: true,
      twoFactorAuthenticationRequiredBeforePublishing: true,
    };
    await writeFile(listingPath, `${JSON.stringify(listing, null, 2)}\n`, 'utf8');

    const result = spawnSync(process.execPath, [
      'scripts/verify-community-readiness.mjs',
      listingPath,
      '--template',
    ], { cwd: process.cwd(), encoding: 'utf8' });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/privacy policy.*escapes its declared root|privacy policy.*relative path inside its declared root/i);
  });
});
