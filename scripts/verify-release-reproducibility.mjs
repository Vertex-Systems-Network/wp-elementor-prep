import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

function fail(message) {
  throw new Error(`Release reproducibility verification failed: ${message}`);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function listFiles(root, current = root, files = []) {
  const entries = await readdir(current, { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = resolve(current, entry.name);
    if (entry.isDirectory()) {
      await listFiles(root, absolute, files);
    } else if (entry.isFile()) {
      files.push(relative(root, absolute).replaceAll('\\', '/'));
    }
  }
  return files;
}

const [leftArg, rightArg] = process.argv.slice(2).filter((value) => !value.startsWith('--'));
if (!leftArg || !rightArg) fail('expected two release directories.');

const leftRoot = resolve(leftArg);
const rightRoot = resolve(rightArg);
for (const root of [leftRoot, rightRoot]) {
  const info = await stat(root).catch(() => null);
  if (!info?.isDirectory()) fail(`release directory does not exist: ${root}`);
}

const [leftFiles, rightFiles] = await Promise.all([listFiles(leftRoot), listFiles(rightRoot)]);
if (JSON.stringify(leftFiles) !== JSON.stringify(rightFiles)) {
  fail(`file lists differ: ${JSON.stringify(leftFiles)} vs ${JSON.stringify(rightFiles)}.`);
}

const hashes = {};
for (const filename of leftFiles) {
  const [leftBytes, rightBytes] = await Promise.all([
    readFile(resolve(leftRoot, filename)),
    readFile(resolve(rightRoot, filename)),
  ]);
  const leftHash = sha256(leftBytes);
  const rightHash = sha256(rightBytes);
  if (leftHash !== rightHash) fail(`${filename} differs: ${leftHash} vs ${rightHash}.`);
  hashes[filename] = leftHash;
}

console.log(`Release reproducibility PASS: ${leftFiles.length} files are byte-identical.`);
for (const filename of leftFiles) console.log(`${hashes[filename]}  ${filename}`);
