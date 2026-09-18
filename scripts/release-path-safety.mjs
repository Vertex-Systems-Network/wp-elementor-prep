import { lstat, realpath } from 'node:fs/promises';
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';

const PROTECTED_DIRECTORIES = Object.freeze([
  '.git',
  '.github',
  'community',
  'config',
  'docs',
  'memory-bank',
  'node_modules',
  'scripts',
  'src',
  'tests',
]);

const PROTECTED_FILES = Object.freeze([
  '.gitignore',
  'AGENTS.md',
  'README.md',
  'manifest.template.json',
  'manifest.release.template.json',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
]);

export function isSameOrInside(parentPath, candidatePath) {
  const parent = resolve(parentPath);
  const candidate = resolve(candidatePath);
  const rel = relative(parent, candidate);
  return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`));
}

export function assertSafeReleaseOutput(outputPath, cwd = process.cwd()) {
  const repoRoot = resolve(cwd);
  const outRoot = resolve(repoRoot, outputPath);

  if (outRoot === repoRoot || isSameOrInside(outRoot, repoRoot)) {
    throw new Error(`Release output must not be the repository root or one of its ancestors: ${outRoot}`);
  }

  for (const directory of PROTECTED_DIRECTORIES) {
    const protectedPath = resolve(repoRoot, directory);
    if (isSameOrInside(protectedPath, outRoot)) {
      throw new Error(`Release output overlaps protected repository directory ${directory}: ${outRoot}`);
    }
  }

  for (const file of PROTECTED_FILES) {
    if (outRoot === resolve(repoRoot, file)) {
      throw new Error(`Release output overlaps protected repository file ${file}: ${outRoot}`);
    }
  }

  return outRoot;
}

async function canonicalizeOutputParent(parentPath) {
  let current = resolve(parentPath);
  const missingSegments = [];

  while (true) {
    try {
      const metadata = await lstat(current);
      if (!metadata.isDirectory() && !metadata.isSymbolicLink()) {
        throw new Error(`Release output parent is not a directory: ${current}`);
      }
      const canonicalExistingParent = await realpath(current);
      return resolve(canonicalExistingParent, ...missingSegments.reverse());
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      const parent = dirname(current);
      if (parent === current) {
        throw new Error(`Unable to resolve an existing parent for release output: ${parentPath}`);
      }
      missingSegments.push(basename(current));
      current = parent;
    }
  }
}

export async function assertSafeReleaseOutputOnDisk(outputPath, cwd = process.cwd()) {
  const lexicalOutRoot = assertSafeReleaseOutput(outputPath, cwd);

  let canonicalRepoRoot;
  try {
    canonicalRepoRoot = await realpath(resolve(cwd));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to resolve repository root before release cleanup: ${detail}`);
  }

  const effectiveParent = await canonicalizeOutputParent(dirname(lexicalOutRoot));
  const effectiveOutRoot = resolve(effectiveParent, basename(lexicalOutRoot));

  // Re-apply all protected-path rules against the on-disk effective path.
  // This catches parent-directory symlinks such as artifacts -> src before
  // build-release reaches recursive rm()/mkdir().
  assertSafeReleaseOutput(effectiveOutRoot, canonicalRepoRoot);
  return lexicalOutRoot;
}
