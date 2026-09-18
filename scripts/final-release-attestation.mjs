import { createHash } from 'node:crypto';
import { basename, resolve } from 'node:path';
import {
  readBoundedContainedFile,
  readBoundedContainedJsonFile,
  writeAtomicTextFile,
} from './security-io.mjs';

const MAX_RELEASE_FILE_BYTES = 128 * 1024 * 1024;
const MAX_COMMUNITY_ASSET_BYTES = 32 * 1024 * 1024;

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

function requireReleaseFilename(filename) {
  if (
    typeof filename !== 'string'
    || filename.length === 0
    || basename(filename) !== filename
    || filename === '.'
    || filename === '..'
  ) {
    fail(`releaseFiles entries must be plain filenames inside plugin/: ${String(filename)}.`);
  }
  return filename;
}

async function hashContained(root, reference, label, maxBytes) {
  const file = await readBoundedContainedFile(root, reference, {
    label,
    maxBytes,
    allowAbsolute: false,
  });
  return sha256(file.bytes);
}

const args = parseArgs(process.argv.slice(2));
const releaseArg = args.get('release') ?? 'dist-release';
const communityArg = args.get('community') ?? 'community/listing.publishable.json';
const assetRootArg = args.get('asset-root') ?? '.';
const outputArg = args.get('out') ?? 'FINAL_RELEASE_ATTESTATION.json';
const releaseRoot = resolve(releaseArg);
const assetRoot = resolve(assetRootArg);
const outputPath = resolve(outputArg);
const expectedPluginId = args.get('expected-plugin-id');
const expectedSourceSha = args.get('source-sha')?.toLowerCase();

if (!expectedPluginId || !/^\d{10,30}$/.test(expectedPluginId)) fail('expected-plugin-id must be a real numeric Figma plugin ID.');
if (!expectedSourceSha || !/^[0-9a-f]{40}$/.test(expectedSourceSha)) fail('source-sha must be a full 40-character Git SHA.');

let releaseInfoFile;
let listingFile;
try {
  [releaseInfoFile, listingFile] = await Promise.all([
    readBoundedContainedJsonFile(releaseRoot, 'RELEASE_INFO.json', {
      label: 'RELEASE_INFO.json',
      maxBytes: 4 * 1024 * 1024,
    }),
    readBoundedContainedJsonFile(assetRoot, communityArg, {
      label: 'Community listing',
      maxBytes: 4 * 1024 * 1024,
      allowAbsolute: true,
    }),
  ]);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

const releaseInfo = releaseInfoFile.value;
const listing = listingFile.value;
if (!releaseInfo || typeof releaseInfo !== 'object' || Array.isArray(releaseInfo)) fail('RELEASE_INFO.json root must be an object.');
if (!listing || typeof listing !== 'object' || Array.isArray(listing)) fail('Community listing root must be an object.');
if (releaseInfo.fixture === true) fail('fixture release cannot be attested as final.');
if (releaseInfo.pluginId !== expectedPluginId) fail(`release plugin ID mismatch: ${releaseInfo.pluginId}.`);
if (releaseInfo.sourceSha !== expectedSourceSha) fail(`release source SHA mismatch: ${releaseInfo.sourceSha}.`);
if (listing.name !== releaseInfo.pluginName) fail('Community listing and release plugin names differ.');
if (listing.publishTarget !== 'Community') fail('final Community listing must target Community.');
if (!Array.isArray(releaseInfo.releaseFiles) || releaseInfo.releaseFiles.length === 0) {
  fail('RELEASE_INFO releaseFiles must be a non-empty array.');
}

const releaseFiles = {};
for (const configuredName of [...releaseInfo.releaseFiles].sort()) {
  const filename = requireReleaseFilename(configuredName);
  releaseFiles[`plugin/${filename}`] = await hashContained(
    releaseRoot,
    `plugin/${filename}`,
    `release plugin file ${filename}`,
    MAX_RELEASE_FILE_BYTES,
  );
}
for (const filename of ['RELEASE_INFO.json', 'SHA256SUMS.txt']) {
  releaseFiles[filename] = await hashContained(
    releaseRoot,
    filename,
    `release provenance file ${filename}`,
    MAX_RELEASE_FILE_BYTES,
  );
}

const communityAssets = {};
const assetPaths = [
  listing.assets?.icon?.path,
  listing.assets?.thumbnail?.path,
  ...(listing.assets?.carousel?.paths ?? []),
].filter(Boolean);
for (const path of assetPaths.sort()) {
  if (typeof path !== 'string' || path.length === 0) fail('Community asset paths must be non-empty strings.');
  communityAssets[path] = await hashContained(
    assetRoot,
    path,
    `Community asset ${path}`,
    MAX_COMMUNITY_ASSET_BYTES,
  );
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
    listingPath: listingFile.relativePath,
    listingSha256: sha256(listingFile.bytes),
    publishTarget: listing.publishTarget,
    category: listing.category,
    supportContact: listing.supportContact,
    assets: communityAssets,
  },
};

await writeAtomicTextFile(outputPath, `${JSON.stringify(attestation, null, 2)}\n`);
console.log(`Final release attestation PASS: ${releaseInfo.pluginName} ${releaseInfo.packageVersion}`);
console.log(`Plugin ID: ${releaseInfo.pluginId}`);
console.log(`Source SHA: ${releaseInfo.sourceSha}`);
console.log(`Attestation: ${outputArg.replaceAll('\\', '/')}`);
