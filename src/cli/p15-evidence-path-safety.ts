import { realpath, stat, type Stats } from 'node:fs/promises';
import { resolve } from 'node:path';

function isNotFound(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as NodeJS.ErrnoException).code === 'ENOENT';
}

function hasUsableFileIdentity(stats: Stats): boolean {
  return Number.isSafeInteger(stats.ino) && stats.ino > 0
    && Number.isSafeInteger(stats.dev) && stats.dev >= 0;
}

/**
 * Return true when an output path would write to the same underlying file as any input.
 *
 * Resolved path equality catches lexical aliases. realpath catches symlink/parent-symlink
 * aliases. dev+ino catches hardlinks on filesystems exposing stable inode identity.
 * A nonexistent output is safe because it cannot already alias an existing input file.
 */
export async function outputAliasesAnyInput(
  outPath: string,
  inputPaths: readonly string[],
): Promise<boolean> {
  const resolvedOut = resolve(outPath);
  const resolvedInputs = inputPaths.map((path) => resolve(path));

  if (resolvedInputs.includes(resolvedOut)) return true;

  let outRealPath: string;
  let outStats: Stats;
  try {
    [outRealPath, outStats] = await Promise.all([
      realpath(resolvedOut),
      stat(resolvedOut),
    ]);
  } catch (error) {
    if (isNotFound(error)) return false;
    throw error;
  }

  for (const inputPath of resolvedInputs) {
    const [inputRealPath, inputStats] = await Promise.all([
      realpath(inputPath),
      stat(inputPath),
    ]);

    if (outRealPath === inputRealPath) return true;

    if (hasUsableFileIdentity(outStats)
      && hasUsableFileIdentity(inputStats)
      && outStats.dev === inputStats.dev
      && outStats.ino === inputStats.ino) {
      return true;
    }
  }

  return false;
}
