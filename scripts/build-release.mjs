import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { assertSafeReleaseOutput } from './release-path-safety.mjs';

function parseArgs(argv) {
  const result = new Map();
  const flags = new Set();
  for (const token of argv) {
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const equals = token.indexOf('=');
    if (equals < 0) {
      flags.add(token.slice(2));
      continue;
    }
    result.set(token.slice(2, equals), token.slice(equals + 1));
  }
  return { values: result, flags };
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function requirePluginId(value, fixture) {
  if (!value || !/^\d{10,30}$/.test(value)) {
    throw new Error('A numeric Figma plugin ID is required via FIGMA_PLUGIN_ID or --plugin-id=<id>.');
  }
  if (!fixture && value === '000000000000000000') {
    throw new Error('Placeholder Figma plugin ID is not allowed for a publishable release package.');
  }
  return value;
}

function requireSourceSha(value, fixture) {
  if (!value || !/^[0-9a-f]{40}$/i.test(value)) {
    throw new Error('A full 40-character source SHA is required via SOURCE_SHA/GITHUB_SHA or --source-sha=<sha>.');
  }
  if (!fixture && /^0+$/.test(value)) {
    throw new Error('All-zero source SHA is not allowed for a publishable release package.');
  }
  return value.toLowerCase();
}

const args = parseArgs(process.argv.slice(2));
const fixture = args.flags.has('fixture');
const pluginId = requirePluginId(args.values.get('plugin-id') ?? process.env.FIGMA_PLUGIN_ID, fixture);
const sourceSha = requireSourceSha(
  args.values.get('source-sha') ?? process.env.SOURCE_SHA ?? process.env.GITHUB_SHA,
  fixture,
);

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const releaseConfig = JSON.parse(await readFile('config/plugin-release.json', 'utf8'));
const template = await readFile('manifest.release.template.json', 'utf8');
const manifestText = template.replace('__FIGMA_PLUGIN_ID__', pluginId);
const manifest = JSON.parse(manifestText);

if (manifest.id !== pluginId) throw new Error('Release manifest plugin ID substitution failed.');
if (manifest.networkAccess?.allowedDomains?.length !== 1 || manifest.networkAccess.allowedDomains[0] !== 'none') {
  throw new Error('Release manifest must remain offline with networkAccess.allowedDomains=["none"].');
}

const outRoot = assertSafeReleaseOutput(args.values.get('out') ?? 'dist-release');
const pluginDir = resolve(outRoot, 'plugin');
await rm(outRoot, { recursive: true, force: true });
await mkdir(pluginDir, { recursive: true });

await build({
  entryPoints: ['src/plugin/main.ts'],
  bundle: true,
  outfile: resolve(pluginDir, 'code.js'),
  platform: 'browser',
  target: 'es2022',
  format: 'iife',
  sourcemap: false,
  legalComments: 'none',
  define: {
    __PLUGIN_VERSION__: JSON.stringify(packageJson.version),
  },
});
await cp('src/ui/ui.html', resolve(pluginDir, 'ui.html'));
await writeFile(resolve(pluginDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

const releaseFiles = releaseConfig.releaseFiles;
const fileHashes = {};
for (const filename of releaseFiles) {
  const bytes = await readFile(resolve(pluginDir, filename));
  fileHashes[filename] = sha256(bytes);
}

const releaseInfo = {
  schemaVersion: 1,
  pluginName: releaseConfig.pluginName,
  packageVersion: packageJson.version,
  pluginId,
  sourceSha,
  fixture,
  editorTypes: releaseConfig.editorTypes,
  networkAccess: releaseConfig.networkAccess,
  userCommands: releaseConfig.userCommands,
  deferredIntegratedCapabilities: releaseConfig.deferredIntegratedCapabilities,
  releaseFiles,
  fileHashes,
};
await writeFile(resolve(outRoot, 'RELEASE_INFO.json'), `${JSON.stringify(releaseInfo, null, 2)}\n`, 'utf8');
await writeFile(
  resolve(outRoot, 'SHA256SUMS.txt'),
  `${releaseFiles.map((filename) => `${fileHashes[filename]}  plugin/${filename}`).join('\n')}\n`,
  'utf8',
);

console.log(`Built ${fixture ? 'fixture' : 'publishable'} Figma release package at ${outRoot}`);
console.log(`Plugin ID: ${pluginId}`);
console.log(`Source SHA: ${sourceSha}`);
