import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

function fail(message) {
  throw new Error(`Final release attestation failed: ${message}`);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function parseArgs(argv) {
  const values = new Map();
  for (const token of argv) {
    if (!token.startsWith('--') || !token.includes('=')) fail(`unexpected argument: ${token}`);
    const index = token.indexOf('=');
    values.set(token.slice(2, index), token.slice(index + 1));
  }
  return values;
}

async function hashFile(path) {
  return sha256(await readFile(path));
}

const args = parseArgs(process.argv.slice(2));
const releaseRoot = resolve(args.get('release') ?? 'dist-release');
const communityListingPath = resolve(args.get('community') ?? 'community/listing.publishable.json');
const assetRoot = resolve(args.get('asset-root') ?? '.');
const outputPath = resolve(args.get('out') ?? 'FINAL_RELEASE_ATTESTATION.json');
const expectedPluginId = args.get('expected-plugin-id');
const expectedSourceSha = args.get('source-sha')?.toLowerCase();

if (!expectedPluginId || !/^\d{10,30}$/.test(expectedPluginId)) fail('expected-plugin-id must be a real numeric Figma plugin ID.');
if (!expectedSourceSha || !/^[0-9a-f]{40}$/.test(expectedSourceSha)) fail('source-sha must be a full 40-character Git SHA.');

const releaseInfo = JSON.parse(await readFile(resolve(releaseRoot, 'RELEASE_INFO.json'), 'utf8'));
const listing = JSON.parse(await readFile(communityListingPath, 'utf8'));
if (releaseInfo.fixture === true) fail('fixture release cannot be attested as final.');
if (releaseInfo.pluginId !== expectedPluginId) fail(`release plugin ID mismatch: ${releaseInfo.pluginId}.`);
if (releaseInfo.sourceSha !== expectedSourceSha) fail(`release source SHA mismatch: ${releaseInfo.sourceSha}.`);
if (listing.name !== releaseInfo.pluginName) fail('Community listing and release plugin names differ.');
if (listing.publishTarget !== 'Community') fail('final Community listing must target Community.');

const releaseFiles = {};
for (const filename of [...releaseInfo.releaseFiles].sort()) {
  releaseFiles[`plugin/${filename}`] = await hashFile(resolve(releaseRoot, 'plugin', filename));
}
for (const filename of ['RELEASE_INFO.json', 'SHA256SUMS.txt']) {
  releaseFiles[filename] = await hashFile(resolve(releaseRoot, filename));
}

const communityAssets = {};
const assetPaths = [
  listing.assets?.icon?.path,
  listing.assets?.thumbnail?.path,
  ...(listing.assets?.carousel?.paths ?? []),
].filter(Boolean);
for (const path of assetPaths.sort()) {
  communityAssets[path] = await hashFile(resolve(assetRoot, path));
}

const attestation = {
  schemaVersion: 1,
  pluginName: releaseInfo.pluginName,
  packageVersion: releaseInfo.packageVersion,
  pluginId: releaseInfo.pluginId,
  sourceSha: releaseInfo.sourceSha,
  editorTypes: releaseInfo.editorTypes,
  networkAccess: releaseInfo.networkAccess,
  userCommands: releaseInfo.userCommands,
  acceptedIntegratedCapabilities: releaseInfo.acceptedIntegratedCapabilities,
  releaseFiles,
  community: {
    listingPath: communityListingPath.replaceAll('\\', '/'),
    listingSha256: await hashFile(communityListingPath),
    publishTarget: listing.publishTarget,
    category: listing.category,
    supportContact: listing.supportContact,
    assets: communityAssets,
  },
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(attestation, null, 2)}\n`, 'utf8');
console.log(`Final release attestation PASS: ${releaseInfo.pluginName} ${releaseInfo.packageVersion}`);
console.log(`Plugin ID: ${releaseInfo.pluginId}`);
console.log(`Source SHA: ${releaseInfo.sourceSha}`);
console.log(`Attestation: ${outputPath}`);
