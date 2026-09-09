import { readFile } from 'node:fs/promises';

function fail(message) {
  throw new Error(`Release contract verification failed: ${message}`);
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

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const releaseConfig = JSON.parse(await readFile('config/plugin-release.json', 'utf8'));
const manifestText = await readFile('manifest.release.template.json', 'utf8');
const manifest = JSON.parse(manifestText);
const listing = JSON.parse(await readFile('community/listing.template.json', 'utf8'));
const changelog = await readFile('CHANGELOG.md', 'utf8');
const privacy = await readFile('docs/PRIVACY.md', 'utf8');
const releaseGuide = await readFile('docs/P11_RELEASE_DISTRIBUTION.md', 'utf8');

if (typeof packageJson.version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(packageJson.version)) {
  fail(`package.json version is not supported semver-like text: ${packageJson.version}`);
}
if (!changelog.includes(`## [${packageJson.version}]`)) {
  fail(`CHANGELOG.md has no entry for package version ${packageJson.version}.`);
}
if (!releaseGuide.includes('`package.json` is the canonical software version.')) {
  fail('release guide no longer identifies package.json as the canonical software version.');
}
if (!releaseGuide.includes('`CHANGELOG.md` records release-facing changes.')) {
  fail('release guide no longer requires CHANGELOG.md.');
}

const placeholderMatches = manifestText.match(/__FIGMA_PLUGIN_ID__/g) ?? [];
if (placeholderMatches.length !== 1 || manifest.id !== '__FIGMA_PLUGIN_ID__') {
  fail('release manifest must contain exactly one plugin ID placeholder at top-level id.');
}
if (manifest.name !== releaseConfig.pluginName) fail('release manifest name differs from release config.');
if (manifest.documentAccess !== 'dynamic-page') fail('release manifest documentAccess must be dynamic-page.');
if (manifest.main !== 'code.js' || manifest.ui !== 'ui.html') fail('release manifest runtime entrypoints changed unexpectedly.');
if (JSON.stringify(manifest.editorType) !== JSON.stringify(releaseConfig.editorTypes)) fail('release manifest editorType differs from release config.');
if (JSON.stringify(manifest.networkAccess) !== JSON.stringify(releaseConfig.networkAccess)) fail('release manifest networkAccess differs from release config.');

const manifestCommands = stableCommands(manifest.menu);
const configuredCommands = releaseConfig.userCommands.map(({ command, label }) => ({ name: label, command }));
if (JSON.stringify(manifestCommands) !== JSON.stringify(configuredCommands)) {
  fail('release manifest menu differs from config/plugin-release.json userCommands.');
}

const reservedPrefixes = releaseConfig.developerCommandPolicy?.reservedPrefixes ?? [];
for (const entry of manifestCommands) {
  const command = String(entry.command).toLowerCase();
  const name = String(entry.name ?? '').toLowerCase();
  if (reservedPrefixes.some((prefix) => command.startsWith(prefix) || name.startsWith(prefix))) {
    fail(`developer-only command leaked into release menu: ${entry.command}.`);
  }
}

if (listing.name !== releaseConfig.pluginName) fail('Community listing name differs from release config.');
if (listing.privacyPolicy !== 'docs/PRIVACY.md') fail('Community listing privacyPolicy must point to docs/PRIVACY.md.');
if (!privacy.includes('"allowedDomains": ["none"]')) fail('privacy disclosure no longer states the offline release network policy.');
if (JSON.stringify(releaseConfig.networkAccess) !== JSON.stringify({ allowedDomains: ['none'] })) {
  fail('release config must remain offline unless privacy/network policy is deliberately redesigned.');
}

const releaseFiles = [...releaseConfig.releaseFiles].sort();
if (JSON.stringify(releaseFiles) !== JSON.stringify(['code.js', 'manifest.json', 'ui.html'])) {
  fail(`releaseFiles changed unexpectedly: ${releaseFiles.join(', ')}.`);
}
if (JSON.stringify([...releaseConfig.provenanceFiles].sort()) !== JSON.stringify(['RELEASE_INFO.json', 'SHA256SUMS.txt'])) {
  fail('provenanceFiles must remain RELEASE_INFO.json and SHA256SUMS.txt.');
}

console.log(`Release contract PASS: ${releaseConfig.pluginName} ${packageJson.version}`);
console.log(`Normal user commands: ${configuredCommands.map((entry) => entry.command).join(', ')}`);
console.log('Network policy: offline');
