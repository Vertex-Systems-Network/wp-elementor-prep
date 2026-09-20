import { createHash } from 'node:crypto';
import type { Stats } from 'node:fs';
import type { FileHandle } from 'node:fs/promises';
import { lstat, open, realpath } from 'node:fs/promises';
import { resolve } from 'node:path';

export type P15StableContentObservation = {
  readonly digest: string;
  readonly canonicalPath: string;
  readonly handleBefore: Stats;
  readonly handleAfter: Stats;
  readonly pathAfter: Stats;
};

type StableIdentity = {
  readonly dev: number;
  readonly ino: number;
};

function comparisonPath(path: string): string {
  const resolved = resolve(path);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function hasStableFileIdentity(info: StableIdentity): boolean {
  return info.ino !== 0;
}

function sameFileIdentity(first: StableIdentity, second: StableIdentity): boolean {
  return hasStableFileIdentity(first)
    && hasStableFileIdentity(second)
    && first.dev === second.dev
    && first.ino === second.ino;
}

function sameFileMetadata(first: Stats, second: Stats): boolean {
  return first.size === second.size
    && first.mtimeMs === second.mtimeMs
    && first.ctimeMs === second.ctimeMs;
}

function sameObservedFile(first: Stats, second: Stats): boolean {
  if (hasStableFileIdentity(first) && hasStableFileIdentity(second)) {
    return sameFileIdentity(first, second) && sameFileMetadata(first, second);
  }
  return sameFileMetadata(first, second);
}

async function digestHandle(handle: FileHandle): Promise<string> {
  const hash = createHash('sha256');
  const stream = handle.createReadStream({ autoClose: false, start: 0 });
  for await (const chunk of stream) hash.update(chunk);
  return `sha256:${hash.digest('hex')}`;
}

/**
 * Stream-hash one current input through an opened file handle without loading the file into
 * memory a second time. Path/canonical identity and file metadata are checked around the hash
 * so replacement/retarget races fail closed before the caller compares the digest to retained
 * read-time evidence. The pathname itself must remain a regular non-symlink entry throughout.
 */
export async function observeP15StableInputContent(
  path: string,
): Promise<P15StableContentObservation | null> {
  const resolvedPath = resolve(path);
  let handle: FileHandle | null = null;
  try {
    const pathBefore = await lstat(resolvedPath);
    if (!pathBefore.isFile()) return null;
    const canonicalBefore = await realpath(resolvedPath);

    handle = await open(resolvedPath, 'r');
    const handleBefore = await handle.stat();
    if (!handleBefore.isFile() || !sameObservedFile(pathBefore, handleBefore)) return null;

    const digest = await digestHandle(handle);
    const handleAfter = await handle.stat();
    if (!handleAfter.isFile() || !sameObservedFile(handleBefore, handleAfter)) return null;

    const [canonicalAfter, pathAfter] = await Promise.all([
      realpath(resolvedPath),
      lstat(resolvedPath),
    ]);
    if (!pathAfter.isFile()) return null;
    if (comparisonPath(canonicalBefore) !== comparisonPath(canonicalAfter)) return null;
    if (!sameObservedFile(handleAfter, pathAfter)) return null;

    return Object.freeze({
      digest,
      canonicalPath: canonicalAfter,
      handleBefore,
      handleAfter,
      pathAfter,
    });
  } catch {
    return null;
  } finally {
    if (handle) await handle.close().catch(() => undefined);
  }
}
