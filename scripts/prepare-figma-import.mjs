import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const PLACEHOLDER_PLUGIN_ID = '000000000000000000';

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function usage() {
  console.error('Usage: npm run prepare:figma-import -- <figma-plugin-id> [source-dist] [output-dir]');
  process.exit(2);
}

const [, , rawPluginId, rawSource = 'dist', rawOutput = 'dist-local'] = process.argv;
const pluginId = rawPluginId?.trim();
if (!pluginId || pluginId === PLACEHOLDER_PLUGIN_ID || /\s/.test(pluginId)) usage();

const sourceDir = resolve(rawSource);
const outputDir = resolve(rawOutput);
const sourceManifestPath = join(sourceDir, 'manifest.json');
if (!existsSync(sourceManifestPath)) {
  throw new Error(`Missing source manifest: ${sourceManifestPath}. Run npm run build or unpack a CI artifact first.`);
}

const manifest = JSON.parse(readFileSync(sourceManifestPath, 'utf8'));
for (const target of [manifest.main, manifest.ui]) {
  if (typeof target !== 'string' || !target || !existsSync(join(sourceDir, target))) {
    throw new Error(`Missing manifest target in source build: ${String(target)}`);
  }
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });
cpSync(sourceDir, outputDir, { recursive: true });

const preparedManifest = { ...manifest, id: pluginId };
writeFileSync(join(outputDir, 'manifest.json'), `${JSON.stringify(preparedManifest, null, 2)}\n`, 'utf8');

const protectedTargets = [manifest.main, manifest.ui];
const hashes = protectedTargets.map((target) => {
  const sourcePath = join(sourceDir, target);
  const preparedPath = join(outputDir, target);
  const sourceSha256 = sha256(sourcePath);
  const preparedSha256 = sha256(preparedPath);
  if (sourceSha256 !== preparedSha256) {
    throw new Error(`Compiled target changed during local import preparation: ${target}`);
  }
  return { target, sha256: sourceSha256 };
});

const provenancePath = join(sourceDir, 'BUILD_INFO.txt');
const provenance = existsSync(provenancePath)
  ? readFileSync(provenancePath, 'utf8').trim()
  : 'BUILD_INFO.txt not present in source directory.';

const notes = [
  'WPEssential Figma local-import preparation',
  `source_dir=${sourceDir}`,
  `output_dir=${outputDir}`,
  `source_manifest_id=${String(manifest.id ?? '')}`,
  `prepared_manifest_id=${pluginId}`,
  'compiled_targets_unchanged=true',
  ...hashes.map(({ target, sha256: digest }) => `sha256:${basename(target)}=${digest}`),
  '',
  'The compiled plugin code/UI were copied byte-for-byte. Only manifest.json id was rebound for local Figma import.',
  'Do not treat local manifest preparation or CI success as imported-Figma runtime acceptance.',
  '',
  provenance,
  '',
].join('\n');
writeFileSync(join(outputDir, 'LOCAL_IMPORT_INFO.txt'), notes, 'utf8');

console.log(`Prepared Figma import at ${outputDir}`);
console.log(`Plugin id: ${pluginId}`);
for (const { target, sha256: digest } of hashes) console.log(`sha256 ${target}: ${digest}`);
