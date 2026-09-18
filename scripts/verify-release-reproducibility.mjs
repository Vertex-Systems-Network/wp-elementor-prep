import { createHash } from 'node:crypto';
import { lstat, readdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readBoundedContainedFile } from './security-io.mjs';

export const RELEASE_REPRO_MAX_DEPTH = 32;
export const RELEASE_REPRO_MAX_FILES = 1000;
export const RELEASE_REPRO_MAX_FILE_BYTES = 128 * 1024 * 1024;
export const RELEASE_REPRO_MAX_TOTAL_BYTES = 512 * 1024 * 1024;

function fail(message) {
  throw new Error(`Release reproducibility verification failed: ${message}`);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function positiveLimit(value, fallback, label) {
  if (value === undefined) return fallback;
  if (!Number.isSafeInteger(value) || value <= 0) fail(`${label} must be a positive safe integer.`);
  return value;
}

async function requireRealDirectory(root, label) {
  let info;
  try {
    info = await lstat(root);
  } catch {
    fail(`${label} release directory does not exist: ${root}`);
  }
  if (info.isSymbolicLink()) fail(`${label} release directory must not be a symbolic link: ${root}`);
  if (!info.isDirectory()) fail(`${label} release path is not a directory: ${root}`);
}

async function listFiles(root, options) {
  const state = {
    files: [],
    totalBytes: 0,
  };

  async function walk(current, depth) {
    if (depth > options.maxDepth) {
      fail(`release tree exceeds the ${options.maxDepth}-level directory nesting limit: ${current}`);
    }

    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = resolve(current, entry.name);
      const rel = relative(root, absolute).replaceAll('\\', '/');

      if (entry.isSymbolicLink()) {
        fail(`release tree must not contain symbolic links: ${rel}`);
      }

      if (entry.isDirectory()) {
        await walk(absolute, depth + 1);
        continue;
      }

      if (!entry.isFile()) {
        fail(`release tree contains unsupported filesystem entry: ${rel}`);
      }

      const metadata = await lstat(absolute);
      if (metadata.isSymbolicLink() || !metadata.isFile()) {
        fail(`release tree entry changed type during enumeration: ${rel}`);
      }
      if (metadata.size > options.maxFileBytes) {
        fail(`${rel} exceeds the ${options.maxFileBytes}-byte per-file limit.`);
      }

      state.files.push(rel);
      if (state.files.length > options.maxFiles) {
        fail(`release tree exceeds the ${options.maxFiles}-file limit.`);
      }

      state.totalBytes += metadata.size;
      if (state.totalBytes > options.maxTotalBytes) {
        fail(`release tree exceeds the ${options.maxTotalBytes}-byte total-file limit.`);
      }
    }
  }

  await walk(root, 0);
  return state;
}

export async function verifyReleaseReproducibility(leftArg, rightArg, limits = {}) {
  if (!leftArg || !rightArg) fail('expected two release directories.');

  const options = {
    maxDepth: positiveLimit(limits.maxDepth, RELEASE_REPRO_MAX_DEPTH, 'maxDepth'),
    maxFiles: positiveLimit(limits.maxFiles, RELEASE_REPRO_MAX_FILES, 'maxFiles'),
    maxFileBytes: positiveLimit(limits.maxFileBytes, RELEASE_REPRO_MAX_FILE_BYTES, 'maxFileBytes'),
    maxTotalBytes: positiveLimit(limits.maxTotalBytes, RELEASE_REPRO_MAX_TOTAL_BYTES, 'maxTotalBytes'),
  };

  const leftRoot = resolve(leftArg);
  const rightRoot = resolve(rightArg);
  await Promise.all([
    requireRealDirectory(leftRoot, 'left'),
    requireRealDirectory(rightRoot, 'right'),
  ]);

  const [leftTree, rightTree] = await Promise.all([
    listFiles(leftRoot, options),
    listFiles(rightRoot, options),
  ]);
  const leftFiles = leftTree.files;
  const rightFiles = rightTree.files;

  if (JSON.stringify(leftFiles) !== JSON.stringify(rightFiles)) {
    fail(`file lists differ: ${JSON.stringify(leftFiles)} vs ${JSON.stringify(rightFiles)}.`);
  }

  const hashes = {};
  for (const filename of leftFiles) {
    let leftFile;
    let rightFile;
    try {
      [leftFile, rightFile] = await Promise.all([
        readBoundedContainedFile(leftRoot, filename, {
          label: `left release file ${filename}`,
          maxBytes: options.maxFileBytes,
        }),
        readBoundedContainedFile(rightRoot, filename, {
          label: `right release file ${filename}`,
          maxBytes: options.maxFileBytes,
        }),
      ]);
    } catch (error) {
      fail(error instanceof Error ? error.message : String(error));
    }

    const leftHash = sha256(leftFile.bytes);
    const rightHash = sha256(rightFile.bytes);
    if (leftHash !== rightHash) fail(`${filename} differs: ${leftHash} vs ${rightHash}.`);
    hashes[filename] = leftHash;
  }

  return {
    files: leftFiles,
    hashes,
    leftTotalBytes: leftTree.totalBytes,
    rightTotalBytes: rightTree.totalBytes,
  };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  const [leftArg, rightArg] = process.argv.slice(2).filter((value) => !value.startsWith('--'));
  const result = await verifyReleaseReproducibility(leftArg, rightArg);

  console.log(`Release reproducibility PASS: ${result.files.length} files are byte-identical.`);
  for (const filename of result.files) console.log(`${result.hashes[filename]}  ${filename}`);
}
