import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { basename, isAbsolute, join, relative, resolve, sep } from 'node:path';

const PLACEHOLDER_PLUGIN_ID = '000000000000000000';

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function usage() {
  console.error('Usage: npm run prepare:figma-import -- <figma-plugin-id> [source-dist] [output-dir]');
  process.exit(2);
}

function containsPath(parent, child) {
  const path = relative(parent, child);
  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

function resolveContainedRegularFile(root, target, label) {
  if (typeof target !== 'string' || target.trim().length === 0 || target.includes('\0')) {
    throw new Error(`${label} must be a non-empty relative file path.`);
  }
  if (isAbsolute(target)) {
    throw new Error(`${label} must be relative to the source artifact.`);
  }

  const lexicalPath = resolve(root, target);
  if (!containsPath(root, lexicalPath)) {
    throw new Error(`${label} escapes the source artifact: ${target}`);
  }
  if (!existsSync(lexicalPath)) {
    throw new Error(`Missing ${label}: ${lexicalPath}`);
  }

  const info = lstatSync(lexicalPath);
  if (info.isSymbolicLink() || !info.isFile()) {
    throw new Error(`${label} must be a non-symlink regular file: ${target}`);
  }

  const canonicalPath = realpathSync(lexicalPath);
  if (!containsPath(root, canonicalPath)) {
    throw new Error(`${label} resolves outside the source artifact: ${target}`);
  }
  return canonicalPath;
}

const [, , rawPluginId, rawSource = 'dist', rawOutput = 'dist-local'] = process.argv;
const pluginId = rawPluginId?.trim();
if (!pluginId || pluginId === PLACEHOLDER_PLUGIN_ID || /\s/.test(pluginId)) usage();

const sourceDir = realpathSync(resolve(rawSource));
const outputDir = resolve(rawOutput);
if (containsPath(sourceDir, outputDir) || containsPath(outputDir, sourceDir)) {
  throw new Error(`Unsafe path overlap: source (${sourceDir}) and output (${outputDir}) must be separate, non-nested directories.`);
}

const sourceManifestPath = resolveContainedRegularFile(sourceDir, 'manifest.json', 'source manifest');
const manifest = JSON.parse(readFileSync(sourceManifestPath, 'utf8'));
const targetEntries = [manifest.main, manifest.ui].map((target) => ({
  target,
  sourcePath: resolveContainedRegularFile(sourceDir, target, `manifest target ${String(target)}`),
}));

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });
cpSync(sourceDir, outputDir, { recursive: true });
writeFileSync(join(outputDir, 'manifest.json'), `${JSON.stringify({ ...manifest, id: pluginId }, null, 2)}\n`, 'utf8');

const hashes = targetEntries.map(({ target, sourcePath }) => {
  const sourceSha256 = sha256(sourcePath);
  const preparedSha256 = sha256(join(outputDir, target));
  if (sourceSha256 !== preparedSha256) throw new Error(`Compiled target changed during local import preparation: ${target}`);
  return { target, sha256: sourceSha256 };
});

const provenancePath = join(sourceDir, 'BUILD_INFO.txt');
let provenance = 'BUILD_INFO.txt not present in source directory.';
if (existsSync(provenancePath)) {
  try {
    provenance = readFileSync(
      resolveContainedRegularFile(sourceDir, 'BUILD_INFO.txt', 'BUILD_INFO.txt'),
      'utf8',
    ).trim();
  } catch {
    provenance = 'BUILD_INFO.txt ignored because it was not a safe source-contained regular file.';
  }
}
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
