import type { Stats } from 'node:fs';
import type { FileHandle } from 'node:fs/promises';
import {
  lstat,
  mkdir,
  mkdtemp,
  open,
  realpath,
  rename,
  rm,
  rmdir,
  writeFile,
} from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';

export const P16_OPERATOR_JSON_INPUT_MAX_BYTES = 1024 * 1024;
export const P16_OPERATOR_JSON_INPUT_MAX_DEPTH = 64;
export const P16_OPERATOR_JSON_INPUT_MAX_VALUES = 50_000;

type Fail = (message: string) => never;

type StableIdentity = {
  readonly dev: number;
  readonly ino: number;
};

export type P16OperatorJsonFileSnapshot = StableIdentity & {
  readonly size: number;
  readonly mtimeMs: number;
  readonly ctimeMs: number;
};

export type P16OperatorJsonInputSnapshot = {
  readonly value: unknown;
  readonly resolvedPath: string;
  readonly canonicalPath: string;
  readonly file: P16OperatorJsonFileSnapshot;
};

export type P16OperatorOutputParentSnapshot = StableIdentity & {
  readonly canonicalPath: string;
};

export type P16OperatorTemporaryDirectorySnapshot = StableIdentity & {
  readonly path: string;
};

type JsonTraversalEntry = {
  value: unknown;
  containerDepth: number;
};

function comparisonPath(path: string): string {
  const resolved = resolve(path);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function isMissingPathError(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code?: unknown }).code === 'ENOENT';
}

function toFileSnapshot(info: Stats): P16OperatorJsonFileSnapshot {
  return Object.freeze({
    dev: info.dev,
    ino: info.ino,
    size: info.size,
    mtimeMs: info.mtimeMs,
    ctimeMs: info.ctimeMs,
  });
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
  first: P16OperatorJsonFileSnapshot | Stats,
  second: P16OperatorJsonFileSnapshot | Stats,
): boolean {
  return first.size === second.size
    && first.mtimeMs === second.mtimeMs
    && first.ctimeMs === second.ctimeMs;
}

function sameObservedFile(
  first: P16OperatorJsonFileSnapshot | Stats,
  second: P16OperatorJsonFileSnapshot | Stats,
): boolean {
  if (hasStableFileIdentity(first) && hasStableFileIdentity(second)) {
    return sameFileIdentity(first, second) && sameFileMetadata(first, second);
  }
  return sameFileMetadata(first, second);
}

async function inputPathMatchesSnapshot(
  snapshot: P16OperatorJsonInputSnapshot,
): Promise<boolean> {
  try {
    const currentInfo = await lstat(snapshot.resolvedPath);
    if (!currentInfo.isFile()) return false;

    const currentCanonical = await realpath(snapshot.resolvedPath);
    if (comparisonPath(currentCanonical) !== comparisonPath(snapshot.canonicalPath)) return false;

    return sameObservedFile(snapshot.file, currentInfo);
  } catch {
    return false;
  }
}

function validateP16OperatorJsonStructure(
  value: unknown,
  label: string,
  fail: Fail,
): void {
  const stack: JsonTraversalEntry[] = [{ value, containerDepth: 0 }];
  let visitedValues = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    visitedValues += 1;
    if (visitedValues > P16_OPERATOR_JSON_INPUT_MAX_VALUES) {
      fail(`${label} input exceeds ${P16_OPERATOR_JSON_INPUT_MAX_VALUES}-value structural limit.`);
    }

    if (current.value === null || typeof current.value !== 'object') {
      continue;
    }

    const nextDepth = current.containerDepth + 1;
    if (nextDepth > P16_OPERATOR_JSON_INPUT_MAX_DEPTH) {
      fail(`${label} input exceeds ${P16_OPERATOR_JSON_INPUT_MAX_DEPTH}-level nesting limit.`);
    }

    if (Array.isArray(current.value)) {
      for (let index = current.value.length - 1; index >= 0; index -= 1) {
        stack.push({ value: current.value[index], containerDepth: nextDepth });
      }
      continue;
    }

    const record = current.value as Record<string, unknown>;
    const keys = Object.keys(record);
    for (let index = keys.length - 1; index >= 0; index -= 1) {
      const key = keys[index];
      if (key !== undefined) {
        stack.push({ value: record[key], containerDepth: nextDepth });
      }
    }
  }
}

export function resolveP16OperatorOutputPath(
  outputPath: string,
  inputPaths: readonly string[],
  fail: Fail,
): string {
  const resolvedOutput = resolve(outputPath);
  const outputComparison = comparisonPath(resolvedOutput);
  if (inputPaths.some((path) => comparisonPath(path) === outputComparison)) {
    fail('Output path must not resolve to an input path.');
  }
  return resolvedOutput;
}

export async function captureP16OperatorOutputParentSnapshot(
  requestedParent: string,
  fail: Fail,
): Promise<P16OperatorOutputParentSnapshot> {
  try {
    await mkdir(requestedParent, { recursive: true });
  } catch {
    fail('Unable to create output directory.');
  }

  let canonicalPath: string;
  let infoBefore: Stats;
  let infoAfter: Stats;
  let selfCanonicalPath: string;
  try {
    canonicalPath = await realpath(requestedParent);
    infoBefore = await lstat(canonicalPath);
    selfCanonicalPath = await realpath(canonicalPath);
    infoAfter = await lstat(canonicalPath);
  } catch {
    fail('Unable to resolve output directory.');
  }

  if (!infoBefore.isDirectory() || !infoAfter.isDirectory()) {
    fail('Output directory must resolve to a directory.');
  }
  if (comparisonPath(selfCanonicalPath) !== comparisonPath(canonicalPath)) {
    fail('Output directory changed while being resolved.');
  }
  if (
    hasStableFileIdentity(infoBefore)
    && (!hasStableFileIdentity(infoAfter) || !sameFileIdentity(infoBefore, infoAfter))
  ) {
    fail('Output directory changed while being resolved.');
  }

  return Object.freeze({
    canonicalPath,
    dev: infoAfter.dev,
    ino: infoAfter.ino,
  });
}

export async function p16OperatorOutputParentMatchesSnapshot(
  snapshot: P16OperatorOutputParentSnapshot,
): Promise<boolean> {
  try {
    const currentInfo = await lstat(snapshot.canonicalPath);
    if (!currentInfo.isDirectory()) return false;

    const currentCanonical = await realpath(snapshot.canonicalPath);
    if (comparisonPath(currentCanonical) !== comparisonPath(snapshot.canonicalPath)) return false;

    if (hasStableFileIdentity(snapshot)) {
      return hasStableFileIdentity(currentInfo) && sameFileIdentity(snapshot, currentInfo);
    }
    return true;
  } catch {
    return false;
  }
}

function captureTemporaryDirectorySnapshot(
  path: string,
  info: Stats,
): P16OperatorTemporaryDirectorySnapshot {
  return Object.freeze({
    path,
    dev: info.dev,
    ino: info.ino,
  });
}

export async function removeP16OperatorTemporaryDirectoryIfOwned(
  temporary: P16OperatorTemporaryDirectorySnapshot,
  parent: P16OperatorOutputParentSnapshot,
): Promise<boolean> {
  if (!(await p16OperatorOutputParentMatchesSnapshot(parent))) return false;

  let currentInfo: Stats;
  try {
    currentInfo = await lstat(temporary.path);
  } catch (error) {
    return isMissingPathError(error);
  }
  if (!currentInfo.isDirectory()) return false;

  if (hasStableFileIdentity(temporary)) {
    if (!hasStableFileIdentity(currentInfo) || !sameFileIdentity(temporary, currentInfo)) {
      return false;
    }
    await rm(temporary.path, { recursive: true, force: true }).catch(() => undefined);
    return true;
  }

  try {
    const currentCanonical = await realpath(temporary.path);
    if (comparisonPath(currentCanonical) !== comparisonPath(temporary.path)) return false;
    await rmdir(temporary.path);
    return true;
  } catch {
    return false;
  }
}

export async function readP16OperatorJsonInput(
  path: string,
  label: string,
  fail: Fail,
): Promise<P16OperatorJsonInputSnapshot> {
  const resolvedPath = resolve(path);
  let initialPathInfo: Stats;
  try {
    initialPathInfo = await lstat(resolvedPath);
  } catch {
    fail(`Unable to inspect ${label} input.`);
  }

  if (!initialPathInfo.isFile()) {
    fail(`${label} input must be a regular file.`);
  }
  if (initialPathInfo.size === 0) {
    fail(`${label} input is empty.`);
  }
  if (initialPathInfo.size > P16_OPERATOR_JSON_INPUT_MAX_BYTES) {
    fail(`${label} input exceeds ${P16_OPERATOR_JSON_INPUT_MAX_BYTES}-byte limit.`);
  }

  let handle: FileHandle;
  try {
    handle = await open(resolvedPath, 'r');
  } catch {
    fail(`Unable to read ${label} input.`);
  }

  try {
    let before: Stats;
    let pathInfoBeforeRead: Stats;
    try {
      before = await handle.stat();
      pathInfoBeforeRead = await lstat(resolvedPath);
    } catch {
      fail(`${label} input changed before it was read.`);
    }

    if (!before.isFile() || !pathInfoBeforeRead.isFile()) {
      fail(`${label} input must be a regular file.`);
    }
    if (!sameObservedFile(initialPathInfo, before) || !sameObservedFile(before, pathInfoBeforeRead)) {
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

    if (!sameObservedFile(before, after)) {
      fail(`${label} input changed while being read.`);
    }

    const actualBytes = Buffer.byteLength(raw, 'utf8');
    if (actualBytes === 0 || raw.trim().length === 0) {
      fail(`${label} input is empty.`);
    }
    if (actualBytes > P16_OPERATOR_JSON_INPUT_MAX_BYTES) {
      fail(`${label} input exceeds ${P16_OPERATOR_JSON_INPUT_MAX_BYTES}-byte limit.`);
    }

    let pathInfoBeforeRealpath: Stats;
    let canonicalPath: string;
    let pathInfoAfterRealpath: Stats;
    try {
      pathInfoBeforeRealpath = await lstat(resolvedPath);
      canonicalPath = await realpath(resolvedPath);
      pathInfoAfterRealpath = await lstat(resolvedPath);
    } catch {
      fail(`${label} input changed after it was read.`);
    }

    if (!pathInfoBeforeRealpath.isFile() || !pathInfoAfterRealpath.isFile()) {
      fail(`${label} input changed after it was read.`);
    }
    if (
      !sameObservedFile(pathInfoBeforeRealpath, pathInfoAfterRealpath)
      || !sameObservedFile(after, pathInfoAfterRealpath)
    ) {
      fail(`${label} input changed after it was read.`);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      fail(`${label} input is not valid JSON.`);
    }

    validateP16OperatorJsonStructure(parsed, label, fail);
    return Object.freeze({
      value: parsed,
      resolvedPath,
      canonicalPath,
      file: toFileSnapshot(after),
    });
  } finally {
    await handle.close().catch(() => undefined);
  }
}

export async function writeP16OperatorJsonOutput(
  outputPath: string,
  inputSnapshots: readonly P16OperatorJsonInputSnapshot[],
  content: string,
  fail: Fail,
): Promise<void> {
  const inputPaths = inputSnapshots.map((snapshot) => snapshot.resolvedPath);
  const resolvedOutput = resolveP16OperatorOutputPath(outputPath, inputPaths, fail);
  const requestedParent = dirname(resolvedOutput);
  const parentSnapshot = await captureP16OperatorOutputParentSnapshot(requestedParent, fail);
  const realParent = parentSnapshot.canonicalPath;

  const canonicalOutput = join(realParent, basename(resolvedOutput));
  const canonicalOutputComparison = comparisonPath(canonicalOutput);

  for (const inputSnapshot of inputSnapshots) {
    if (!(await inputPathMatchesSnapshot(inputSnapshot))) {
      fail('Input path changed after it was read.');
    }
    if (comparisonPath(inputSnapshot.canonicalPath) === canonicalOutputComparison) {
      fail('Output path must not resolve to an input path.');
    }
  }

  let existingOutput: Stats | null = null;
  try {
    existingOutput = await lstat(canonicalOutput);
  } catch (error) {
    if (!isMissingPathError(error)) {
      fail('Unable to inspect output path.');
    }
  }

  if (existingOutput) {
    if (existingOutput.isSymbolicLink()) {
      fail('Output path must not be a symbolic link.');
    }
    if (!existingOutput.isFile()) {
      fail('Output path must be a regular file or not exist.');
    }
    if (inputSnapshots.some((inputSnapshot) => sameFileIdentity(existingOutput, inputSnapshot.file))) {
      fail('Output path must not alias an input file.');
    }
  }

  let temporarySnapshot: P16OperatorTemporaryDirectorySnapshot | null = null;
  let writeFailed = false;
  let inputChanged = false;
  let outputParentChanged = false;
  try {
    if (!(await p16OperatorOutputParentMatchesSnapshot(parentSnapshot))) {
      outputParentChanged = true;
    } else {
      const temporaryDirectory = await mkdtemp(join(realParent, '.p16-output-'));
      const temporaryInfo = await lstat(temporaryDirectory);
      if (!temporaryInfo.isDirectory()) {
        throw new Error('Temporary output path is not a directory.');
      }
      temporarySnapshot = captureTemporaryDirectorySnapshot(temporaryDirectory, temporaryInfo);

      const temporaryPath = join(temporaryDirectory, 'payload.json');
      await writeFile(temporaryPath, content, { encoding: 'utf8', flag: 'wx', mode: 0o600 });

      for (const inputSnapshot of inputSnapshots) {
        if (!(await inputPathMatchesSnapshot(inputSnapshot))) {
          inputChanged = true;
          break;
        }
      }

      if (!inputChanged && !(await p16OperatorOutputParentMatchesSnapshot(parentSnapshot))) {
        outputParentChanged = true;
      }

      if (!inputChanged && !outputParentChanged) {
        await rename(temporaryPath, canonicalOutput);
      }
    }
  } catch {
    writeFailed = true;
  } finally {
    if (temporarySnapshot) {
      await removeP16OperatorTemporaryDirectoryIfOwned(temporarySnapshot, parentSnapshot);
    }
  }

  if (inputChanged) {
    fail('Input path changed after it was read.');
  }
  if (outputParentChanged) {
    fail('Output directory changed during write.');
  }
  if (writeFailed) {
    fail('Unable to write output safely.');
  }
}
