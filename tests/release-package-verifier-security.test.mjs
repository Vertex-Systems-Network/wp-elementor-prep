import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const roots = [];
const PLUGIN_ID = '123456789012345678';
const SOURCE_SHA = '0123456789abcdef0123456789abcdef01234567';

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function buildFixtureRelease() {
  const root = await mkdtemp(join(tmpdir(), 'release-verifier-security-'));
  roots.push(root);
  const release = join(root, 'release');
  const result = spawnSync(process.execPath, [
    'scripts/build-release.mjs',
    '--fixture',
    `--plugin-id=${PLUGIN_ID}`,
    `--source-sha=${SOURCE_SHA}`,
    `--out=${release}`,
  ], { cwd: process.cwd(), encoding: 'utf8' });
  expect(result.status, result.stderr).toBe(0);
  return { root, release };
}

function verify(release) {
  return spawnSync(process.execPath, [
    'scripts/verify-release-package.mjs',
    release,
    '--allow-fixture',
  ], { cwd: process.cwd(), encoding: 'utf8' });
}

describe('release package verifier filesystem security', () => {
  it('continues to verify an ordinary fixture release', async () => {
    const { release } = await buildFixtureRelease();
    const result = verify(release);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('Release package verification PASS');
  });

  it.skipIf(process.platform === 'win32')('rejects a symlink substituted for an expected plugin file', async () => {
    const { root, release } = await buildFixtureRelease();
    const outside = join(root, 'outside-ui.html');
    const ui = join(release, 'plugin', 'ui.html');
    const original = await readFile(ui);
    await writeFile(outside, original);
    await rm(ui);
    await symlink(outside, ui);

    const result = verify(release);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/plugin\/ui\.html must not be a symbolic link|resolves outside its declared root/);
  });

  it.skipIf(process.platform === 'win32')('rejects a symlink substituted for the plugin directory', async () => {
    const { root, release } = await buildFixtureRelease();
    const plugin = join(release, 'plugin');
    const outsidePlugin = join(root, 'outside-plugin');
    await rename(plugin, outsidePlugin);
    await symlink(outsidePlugin, plugin);

    const result = verify(release);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/plugin directory must not be a symbolic link/);
  });
});
