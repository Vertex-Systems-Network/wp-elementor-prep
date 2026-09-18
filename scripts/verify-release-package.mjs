import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { assertReleaseUiCapabilities } from './release-ui-contract.mjs';
import { readBoundedContainedFile, readBoundedContainedJsonFile } from './security-io.mjs';

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function fail(message) {
  throw new Error(`Release package verification failed: ${message}`);
}

function strictUtf8(bytes, label) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    fail(`${label} is not valid UTF-8.`);
  }
}

function stableCommands(menu) {
  if (!Array.isArray(menu)) return [];
  const commands = [];
  for (const item of menu) {
    if (!item || typeof item !== 'object') continue;
    if (typeof item.command === 'string') commands.push({ name: item.name, command: item.command });
    if (Array.isArray(item.menu)) commands.push(...stableCommands(item.menu));
  }
  return commands;
}

const args = process.argv.slice(2);
const allowFixture = args.includes('--allow-fixture');
const rootArg = args.find((value) => !value.startsWith('--')) ?? 'dist-release';
const root = resolve(rootArg);
const pluginDir = resolve(root, 'plugin');

const releaseConfig = JSON.parse(await readFile('config/plugin-release.json', 'utf8'));
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));

let pluginMetadata;
try {
  pluginMetadata = await lstat(pluginDir);
} catch (error) {
  fail(`plugin directory is missing: ${error instanceof Error ? error.message : String(error)}`);
}
if (pluginMetadata.isSymbolicLink()) fail('plugin directory must not be a symbolic link.');
if (!pluginMetadata.isDirectory()) fail('plugin entry must be a directory.');

let releaseInfoFile;
let manifestFile;
let uiFile;
try {
  [releaseInfoFile, manifestFile, uiFile] = await Promise.all([
    readBoundedContainedJsonFile(root, 'RELEASE_INFO.json', {
      label: 'RELEASE_INFO.json',
      maxBytes: 4 * 1024 * 1024,
    }),
    readBoundedContainedJsonFile(root, 'plugin/manifest.json', {
      label: 'plugin/manifest.json',
      maxBytes: 4 * 1024 * 1024,
    }),
    readBoundedContainedFile(root, 'plugin/ui.html', {
      label: 'plugin/ui.html',
      maxBytes: 64 * 1024 * 1024,
    }),
  ]);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

const releaseInfo = releaseInfoFile.value;
const manifest = manifestFile.value;
const releaseUi = strictUtf8(uiFile.bytes, 'plugin/ui.html');

if (releaseInfo.schemaVersion !== 1) fail('unsupported RELEASE_INFO schemaVersion.');
if (releaseInfo.fixture === true && !allowFixture) fail('fixture package cannot be treated as publishable.');
if (releaseInfo.packageVersion !== packageJson.version) fail('package version mismatch.');
if (!/^[0-9a-f]{40}$/.test(releaseInfo.sourceSha ?? '')) fail('source SHA must be full 40-character hex.');
if (!/^\d{10,30}$/.test(releaseInfo.pluginId ?? '')) fail('release plugin ID must be numeric.');
if (manifest.id !== releaseInfo.pluginId) fail('manifest plugin ID does not match RELEASE_INFO.');
if (manifest.id === '000000000000000000') fail('placeholder plugin ID is forbidden.');
if (manifest.name !== releaseConfig.pluginName) fail('plugin name drifted from release config.');
if (manifest.documentAccess !== 'dynamic-page') fail('documentAccess must be dynamic-page.');
if (manifest.main !== 'code.js' || manifest.ui !== 'ui.html') fail('manifest runtime entrypoints are unexpected.');
if (JSON.stringify(manifest.editorType) !== JSON.stringify(releaseConfig.editorTypes)) fail('editorType drifted from release config.');
if (JSON.stringify(manifest.networkAccess) !== JSON.stringify(releaseConfig.networkAccess)) fail('network access drifted from release config.');
if (JSON.stringify(releaseInfo.acceptedIntegratedCapabilities) !== JSON.stringify(releaseConfig.acceptedIntegratedCapabilities)) {
  fail('RELEASE_INFO acceptedIntegratedCapabilities differs from release config.');
}
if ('deferredIntegratedCapabilities' in releaseInfo) fail('publishable RELEASE_INFO must not retain accepted capabilities as deferred.');
try {
  assertReleaseUiCapabilities(releaseUi);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

const manifestCommands = stableCommands(manifest.menu);
const expectedCommands = releaseConfig.userCommands.map(({ command, label }) => ({ name: label, command }));
if (JSON.stringify(manifestCommands) !== JSON.stringify(expectedCommands)) {
  fail(`release menu differs from configured user commands: ${JSON.stringify(manifestCommands)}.`);
}

const reservedPrefixes = releaseConfig.developerCommandPolicy?.reservedPrefixes ?? [];
for (const entry of manifestCommands) {
  const command = String(entry.command).toLowerCase();
  const name = String(entry.name ?? '').toLowerCase();
  if (reservedPrefixes.some((prefix) => command.startsWith(prefix) || name.startsWith(prefix))) {
    fail(`developer-only command leaked into release menu: ${entry.command}.`);
  }
}

const actualFiles = (await readdir(pluginDir)).sort();
const expectedFiles = [...releaseConfig.releaseFiles].sort();
if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
  fail(`plugin directory must contain only ${expectedFiles.join(', ')}; got ${actualFiles.join(', ')}.`);
}

for (const filename of expectedFiles) {
  let file;
  try {
    file = await readBoundedContainedFile(root, `plugin/${filename}`, {
      label: `plugin/${filename}`,
      maxBytes: 128 * 1024 * 1024,
    });
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
  const actual = sha256(file.bytes);
  if (releaseInfo.fileHashes?.[filename] !== actual) fail(`${filename} SHA-256 mismatch.`);
}

let sumsFile;
try {
  sumsFile = await readBoundedContainedFile(root, 'SHA256SUMS.txt', {
    label: 'SHA256SUMS.txt',
    maxBytes: 4 * 1024 * 1024,
  });
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
const sums = strictUtf8(sumsFile.bytes, 'SHA256SUMS.txt');
const expectedSums = `${expectedFiles.map((filename) => `${releaseInfo.fileHashes[filename]}  plugin/${filename}`).join('\n')}\n`;
if (sums !== expectedSums) fail('SHA256SUMS.txt is not byte-exact for the release files.');

const rootFiles = (await readdir(root)).sort();
for (const required of ['plugin', ...releaseConfig.provenanceFiles]) {
  if (!rootFiles.includes(required)) fail(`missing release root entry ${required}.`);
}
for (const entry of rootFiles) {
  if (!['plugin', ...releaseConfig.provenanceFiles].includes(entry)) {
    fail(`unexpected release root entry ${basename(entry)}.`);
  }
}

console.log(`Release package verification PASS: ${releaseInfo.pluginName} ${releaseInfo.packageVersion}`);
console.log(`Source: ${releaseInfo.sourceSha}`);
console.log(`Files: ${expectedFiles.length}/${expectedFiles.length} SHA-256 MATCH`);
console.log(`Integrated capabilities: ${releaseConfig.acceptedIntegratedCapabilities.map((entry) => entry.capability).join(', ')}`);
console.log(`Mode: ${releaseInfo.fixture ? 'fixture-validated' : 'publishable'}`);