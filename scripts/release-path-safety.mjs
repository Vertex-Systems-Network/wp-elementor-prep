import { isAbsolute, relative, resolve, sep } from 'node:path';

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
