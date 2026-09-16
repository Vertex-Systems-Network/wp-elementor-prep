import type { Stats } from 'node:fs';
import type { FileHandle } from 'node:fs/promises';
import { open, realpath, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sha256Hex } from '../core/sha256';
import type {
  P15OperatorJsonFileSnapshot,
  P15OperatorJsonInputSnapshot,
} from './p15-operator-json-io';

type Fail = (message: string) => never;

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

function sameFileMetadata(
  first: P15OperatorJsonFileSnapshot | Stats,
  second: P15OperatorJsonFileSnapshot | Stats,
): boolean {
  return first.size === second.size
    && first.mtimeMs === second.mtimeMs
    && first.ctimeMs === second.ctimeMs;
}

function sameObservedFile(
  first: P15OperatorJsonFileSnapshot | Stats,
  second: P15OperatorJsonFileSnapshot | Stats,
): boolean {
  if (hasStableFileIdentity(first) && hasStableFileIdentity(second)) {
    return sameFileIdentity(first, second) && sameFileMetadata(first, second);
  }
  return sameFileMetadata(first, second);
}

function toFileSnapshot(info: Stats): P15OperatorJsonFileSnapshot {
  return Object.freeze({
    dev: info.dev,
    ino: info.ino,
    size: info.size,
    mtimeMs: info.mtimeMs,
    ctimeMs: info.ctimeMs,
  });
}

/**
 * Read a raw Elementor template through the same stable opened-file identity boundary used
 * by P15 operator evidence I/O, without adding a new generic byte/depth/value ceiling.
 *
 * The classic Elementor v0.4 contract intentionally treats populated settings as target-owned
 * objects and does not bound arbitrary nested setting keys/values. Resource-policy changes for
 * that raw template contract therefore require a separate product decision.
 */
export async function readP15UnboundedTemplateJsonInput(
  path: string,
  label: string,
  fail: Fail,
): Promise<P15OperatorJsonInputSnapshot> {
  const resolvedPath = resolve(path);

  let canonicalBeforeOpen: string;
  let initialPathInfo: Stats;
  try {
    [canonicalBeforeOpen, initialPathInfo] = await Promise.all([
      realpath(resolvedPath),
      stat(resolvedPath),
    ]);
  } catch {
    fail(`Unable to inspect ${label} input.`);
  }

  if (!initialPathInfo.isFile()) fail(`${label} input must resolve to a regular file.`);
  if (initialPathInfo.size === 0) fail(`${label} input is empty.`);

  let handle: FileHandle;
  try {
    handle = await open(resolvedPath, 'r');
  } catch {
    fail(`Unable to read ${label} input.`);
  }

  try {
    let before: Stats;
    let pathInfoBeforeRead: Stats;
    let canonicalBeforeRead: string;
    try {
      [before, pathInfoBeforeRead, canonicalBeforeRead] = await Promise.all([
        handle.stat(),
        stat(resolvedPath),
        realpath(resolvedPath),
      ]);
    } catch {
      fail(`${label} input changed before it was read.`);
    }

    if (!before.isFile() || !pathInfoBeforeRead.isFile()) {
      fail(`${label} input must resolve to a regular file.`);
    }
    if (
      !sameObservedFile(initialPathInfo, before)
      || !sameObservedFile(before, pathInfoBeforeRead)
      || comparisonPath(canonicalBeforeOpen) !== comparisonPath(canonicalBeforeRead)
    ) {
      fail(`${label} input changed before it was read.`);
    }

    let raw: string;
    let after: Stats;
    try {
      raw = await handle.readFile({ encoding: 'utf8' });
      after = await handle.stat();
    } catch {
      fail(`Unable to read ${label} input.`);
    }

    if (!sameObservedFile(before, after)) fail(`${label} input changed while being read.`);
    if (Buffer.byteLength(raw, 'utf8') === 0 || raw.trim().length === 0) {
      fail(`${label} input is empty.`);
    }

    let pathInfoAfterRead: Stats;
    let canonicalAfterRead: string;
    try {
      [pathInfoAfterRead, canonicalAfterRead] = await Promise.all([
        stat(resolvedPath),
        realpath(resolvedPath),
      ]);
    } catch {
      fail(`${label} input changed after it was read.`);
    }

    if (
      !pathInfoAfterRead.isFile()
      || !sameObservedFile(after, pathInfoAfterRead)
      || comparisonPath(canonicalBeforeRead) !== comparisonPath(canonicalAfterRead)
    ) {
      fail(`${label} input changed after it was read.`);
    }

    let value: unknown;
    try {
      value = JSON.parse(raw) as unknown;
    } catch {
      fail(`${label} input is not valid JSON.`);
    }

    return Object.freeze({
      raw,
      value,
      resolvedPath,
      canonicalPath: canonicalAfterRead,
      contentSha256: `sha256:${sha256Hex(raw)}`,
      file: toFileSnapshot(after),
    });
  } finally {
    await handle.close().catch(() => undefined);
  }
}
