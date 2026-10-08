import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { assertNoUnresolvedPluginBuildDefines, PLUGIN_BUILD_DEFINE_NAMES, releasePluginBuildDefines } from '../scripts/release-build-defines.mjs';

const PLUGIN_ID = '123456789012345678';
const SOURCE_SHA = 'abcdef0123456789abcdef0123456789abcdef01';
const roots = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function buildRelease(env) {
  const root = await mkdtemp(join(tmpdir(), 'release-build-identity-'));
  roots.push(root);
  const release = join(root, 'release');
  const result = spawnSync(process.execPath, [
    'scripts/build-release.mjs', '--fixture', `--plugin-id=${PLUGIN_ID}`, `--source-sha=${SOURCE_SHA}`, `--out=${release}`,
  ], { cwd: process.cwd(), encoding: 'utf8', env: { ...process.env, GITHUB_RUN_ID: '', GITHUB_RUN_NUMBER: '', ...env } });
  expect(result.status, result.stderr).toBe(0);
  return release;
}

describe('recovery M0.2 — release build identity', () => {
  it('compiles a traceable P7 build identity into the publishable bundle when CI run identity is present', async () => {
    const release = await buildRelease({ GITHUB_RUN_ID: '987654321', GITHUB_RUN_NUMBER: '42' });
    const code = await readFile(join(release, 'plugin', 'code.js'), 'utf8');
    for (const name of PLUGIN_BUILD_DEFINE_NAMES) expect(code).not.toContain(name);
    expect(code).toContain(JSON.stringify(SOURCE_SHA));
    expect(code).toContain('"987654321"');
    expect(code).toContain('"42"');
  }, 60_000);

  it('rejects a release package whose bundle still carries an unresolved build define', async () => {
    const release = await buildRelease({});
    const codePath = join(release, 'plugin', 'code.js');
    const tampered = `${await readFile(codePath, 'utf8')}\nvoid (typeof __WPEP_BUILD_RUN_ID__);\n`;
    await writeFile(codePath, tampered, 'utf8');
    const result = spawnSync(process.execPath, ['scripts/verify-release-package.mjs', release, '--allow-fixture'], { cwd: process.cwd(), encoding: 'utf8' });
    expect(result.status).not.toBe(0);
    expect(`${result.stderr}${result.stdout}`).toMatch(/unresolved build define\(s\) in plugin\/code\.js: __WPEP_BUILD_RUN_ID__/);
  }, 60_000);

  it('names every unresolved define and maps both identity families to the same source/run tuple', () => {
    expect(() => assertNoUnresolvedPluginBuildDefines('typeof __WPEP_BUILD_SOURCE_SHA__')).toThrow(/__WPEP_BUILD_SOURCE_SHA__/);
    const defines = releasePluginBuildDefines({ pluginVersion: '1.0.0', sourceSha: SOURCE_SHA, runId: '1', runNumber: '2' });
    expect(defines.__WPEP_BUILD_SOURCE_SHA__).toBe(defines.__P5_SOURCE_SHA__);
    expect(defines.__WPEP_BUILD_RUN_ID__).toBe(defines.__P5_GITHUB_RUN_ID__);
    expect(defines.__WPEP_BUILD_RUN_NUMBER__).toBe(defines.__P5_GITHUB_RUN_NUMBER__);
  });
});
