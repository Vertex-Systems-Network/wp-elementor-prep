import type { Stats } from 'node:fs';
import type { FileHandle } from 'node:fs/promises';
import {
  lstat,
  mkdir,
  mkdtemp,
  open,
  realpath,
  rename,
  rmdir,
  stat,
  unlink,
} from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { outputAliasesAnyInput } from './p15-evidence-path-safety';

export const P15_SMALL_JSON_INPUT_MAX_BYTES = 1024 * 1024;
export const P15_SMALL_JSON_INPUT_MAX_DEPTH = 64;
export const P15_SMALL_JSON_INPUT_MAX_VALUES = 50_000;
export const P15_CANDIDATE_JSON_INPUT_MAX_DEPTH = 256;

type Fail = (message: string) => never;

type StableIdentity = {
  readonly dev: number;
  readonly ino: number;
};

export type P15OperatorJsonFileSnapshot = StableIdentity & {
  readonly size: number;
  readonly mtimeMs: number;
  readonly ctimeMs: number;
};

export type P15OperatorJsonInputSnapshot = {
  readonly raw: string;
  readonly value: unknown;
  readonly resolvedPath: string;
  readonly canonicalPath: string;
  readonly file: P15OperatorJsonFileSnapshot;
};

export type P15OperatorJsonReadOptions = {
  readonly maxBytes?: number;
  readonly maxDepth: number;
  readonly maxValues?: number;
};

export type P15OperatorOutputParentSnapshot = StableIdentity & {
  readonly canonicalPath: string;
};

export type P15OperatorOutputDestinationSnapshot =
  | {
      readonly state: 'ABSENT';
      readonly path: string;
    }
  | {
      readonly state: 'EXISTING_REGULAR';
      readonly path: string;
      readonly canonicalPath: string;
      readonly file: P15OperatorJsonFileSnapshot;
    };

export type P15OperatorTemporaryDirectorySnapshot = StableIdentity & {
  readonly path: string;
};

export type P15OperatorTemporaryPayloadSnapshot = {
  readonly path: string;
  readonly file: P15OperatorJsonFileSnapshot;
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

function toFileSnapshot(info: Stats): P15OperatorJsonFileSnapshot {
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

export async function p15OperatorInputMatchesSnapshot(
  snapshot: P15OperatorJsonInputSnapshot,
): Promise<boolean> {
  try {
    const currentInfo = await stat(snapshot.resolvedPath);
    if (!currentInfo.isFile()) return false;
    const currentCanonical = await realpath(snapshot.resolvedPath);
    if (comparisonPath(currentCanonical) !== comparisonPath(snapshot.canonicalPath)) return false;
    return sameObservedFile(snapshot.file, currentInfo);
  } catch {
    return false;
  }
}

export function validateP15OperatorJsonStructure(
  value: unknown,
  label: string,
  options: Pick<P15OperatorJsonReadOptions, 'maxDepth' | 'maxValues'>,
  fail: Fail,
): void {
  const stack: JsonTraversalEntry[] = [{ value, containerDepth: 0 }];
  let visitedValues = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    visitedValues += 1;
    if (options.maxValues !== undefined && visitedValues > options.maxValues) {
      fail(`${label} input exceeds ${options.maxValues}-value structural limit.`);
    }

    if (current.value === null || typeof current.value !== 'object') continue;

    const nextDepth = current.containerDepth + 1;
    if (nextDepth > options.maxDepth) {
      fail(`${label} input exceeds ${options.maxDepth}-level nesting limit.`);
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
      if (key !== undefined) stack.push({ value: record[key], containerDepth: nextDepth });
    }
  }
}

export function validateP15CandidateEmbeddedTemplateJsonDepth(
  candidate: unknown,
  fail: Fail,
): void {
  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) return;
  const templateJson = (candidate as Record<string, unknown>).templateJson;
  if (typeof templateJson !== 'string') return;

  let template: unknown;
  try {
    template = JSON.parse(templateJson) as unknown;
  } catch {
    return;
  }

  validateP15OperatorJsonStructure(
    template,
    'candidate templateJson',
    { maxDepth: P15_CANDIDATE_JSON_INPUT_MAX_DEPTH },
    fail,
  );
}

export async function readP15OperatorJsonInput(
  path: string,
  label: string,
  options: P15OperatorJsonReadOptions,
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
  if (options.maxBytes !== undefined && initialPathInfo.size > options.maxBytes) {
    fail(`${label} input exceeds ${options.maxBytes}-byte limit.`);
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

    const actualBytes = Buffer.byteLength(raw, 'utf8');
    if (actualBytes === 0 || raw.trim().length === 0) fail(`${label} input is empty.`);
    if (options.maxBytes !== undefined && actualBytes > options.maxBytes) {
      fail(`${label} input exceeds ${options.maxBytes}-byte limit.`);
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

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      fail(`${label} input is not valid JSON.`);
    }

    validateP15OperatorJsonStructure(parsed, label, options, fail);
    return Object.freeze({
      raw,
      value: parsed,
      resolvedPath,
      canonicalPath: canonicalAfterRead,
      file: toFileSnapshot(after),
    });
  } finally {
    await handle.close().catch(() => undefined);
  }
}

export async function captureP15OperatorOutputParentSnapshot(
  requestedParent: string,
  fail: Fail,
): Promise<P15OperatorOutputParentSnapshot> {
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

  return Object.freeze({ canonicalPath, dev: infoAfter.dev, ino: infoAfter.ino });
}

export async function p15OperatorOutputParentMatchesSnapshot(
  snapshot: P15OperatorOutputParentSnapshot,
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

export async function captureP15OperatorOutputDestinationSnapshot(
  path: string,
  fail: Fail,
): Promise<P15OperatorOutputDestinationSnapshot> {
  let infoBefore: Stats;
  try {
    infoBefore = await lstat(path);
  } catch (error) {
    if (isMissingPathError(error)) return Object.freeze({ state: 'ABSENT', path });
    fail('Unable to inspect output path.');
  }

  if (infoBefore.isSymbolicLink()) fail('Output path must not be a symbolic link.');
  if (!infoBefore.isFile()) fail('Output path must be a regular file or not exist.');

  let canonicalPath: string;
  let infoAfter: Stats;
  try {
    canonicalPath = await realpath(path);
    infoAfter = await lstat(path);
  } catch {
    fail('Output path changed while being inspected.');
  }

  if (
    infoAfter.isSymbolicLink()
    || !infoAfter.isFile()
    || comparisonPath(canonicalPath) !== comparisonPath(path)
    || !sameObservedFile(infoBefore, infoAfter)
  ) {
    fail('Output path changed while being inspected.');
  }

  return Object.freeze({
    state: 'EXISTING_REGULAR',
    path,
    canonicalPath,
    file: toFileSnapshot(infoAfter),
  });
}

export async function p15OperatorOutputDestinationMatchesSnapshot(
  snapshot: P15OperatorOutputDestinationSnapshot,
): Promise<boolean> {
  if (snapshot.state === 'ABSENT') {
    try {
      await lstat(snapshot.path);
      return false;
    } catch (error) {
      return isMissingPathError(error);
    }
  }

  try {
    const currentInfo = await lstat(snapshot.path);
    if (currentInfo.isSymbolicLink() || !currentInfo.isFile()) return false;
    const currentCanonical = await realpath(snapshot.path);
    if (comparisonPath(currentCanonical) !== comparisonPath(snapshot.canonicalPath)) return false;
    return sameObservedFile(snapshot.file, currentInfo);
  } catch {
    return false;
  }
}

function captureTemporaryDirectorySnapshot(
  path: string,
  info: Stats,
): P15OperatorTemporaryDirectorySnapshot {
  return Object.freeze({ path, dev: info.dev, ino: info.ino });
}

async function temporaryDirectoryMatchesSnapshot(
  snapshot: P15OperatorTemporaryDirectorySnapshot,
): Promise<boolean> {
  try {
    const currentInfo = await lstat(snapshot.path);
    if (!currentInfo.isDirectory()) return false;
    const currentCanonical = await realpath(snapshot.path);
    if (comparisonPath(currentCanonical) !== comparisonPath(snapshot.path)) return false;
    if (hasStableFileIdentity(snapshot)) {
      return hasStableFileIdentity(currentInfo) && sameFileIdentity(snapshot, currentInfo);
    }
    return true;
  } catch {
    return false;
  }
}

async function openedPayloadMatchesPath(handle: FileHandle, path: string): Promise<boolean> {
  try {
    const handleInfo = await handle.stat();
    const pathInfo = await lstat(path);
    if (!handleInfo.isFile() || !pathInfo.isFile()) return false;
    return sameObservedFile(handleInfo, pathInfo);
  } catch {
    return false;
  }
}

function captureTemporaryPayloadSnapshot(
  path: string,
  info: Stats,
): P15OperatorTemporaryPayloadSnapshot {
  return Object.freeze({ path, file: toFileSnapshot(info) });
}

async function temporaryPayloadMatchesSnapshot(
  snapshot: P15OperatorTemporaryPayloadSnapshot,
): Promise<boolean> {
  try {
    const currentInfo = await lstat(snapshot.path);
    if (!currentInfo.isFile()) return false;
    const currentCanonical = await realpath(snapshot.path);
    if (comparisonPath(currentCanonical) !== comparisonPath(snapshot.path)) return false;
    return sameObservedFile(snapshot.file, currentInfo);
  } catch {
    return false;
  }
}

async function removeTemporaryArtifactsIfOwned(
  temporary: P15OperatorTemporaryDirectorySnapshot,
  payload: P15OperatorTemporaryPayloadSnapshot | null,
  parent: P15OperatorOutputParentSnapshot,
): Promise<boolean> {
  if (!(await p15OperatorOutputParentMatchesSnapshot(parent))) return false;
  if (!(await temporaryDirectoryMatchesSnapshot(temporary))) return false;

  if (payload) {
    if (await temporaryPayloadMatchesSnapshot(payload)) {
      try {
        await unlink(payload.path);
      } catch {
        return false;
      }
    } else {
      try {
        await lstat(payload.path);
        return false;
      } catch (error) {
        if (!isMissingPathError(error)) return false;
      }
    }
  }

  if (!(await temporaryDirectoryMatchesSnapshot(temporary))) return false;
  try {
    await rmdir(temporary.path);
    return true;
  } catch {
    return false;
  }
}

export async function writeP15OperatorJsonOutput(
  outputPath: string,
  inputSnapshots: readonly P15OperatorJsonInputSnapshot[],
  content: string,
  fail: Fail,
): Promise<void> {
  const resolvedOutput = resolve(outputPath);
  const inputPaths = inputSnapshots.map((snapshot) => snapshot.resolvedPath);
  const outputComparison = comparisonPath(resolvedOutput);
  if (inputSnapshots.some((snapshot) => comparisonPath(snapshot.resolvedPath) === outputComparison)) {
    fail('Output path must not resolve to an input path.');
  }

  try {
    if (await outputAliasesAnyInput(resolvedOutput, inputPaths)) {
      fail('Output path must not alias an input file.');
    }
  } catch {
    fail('Unable to inspect output path safely.');
  }

  const parentSnapshot = await captureP15OperatorOutputParentSnapshot(dirname(resolvedOutput), fail);
  const canonicalOutput = join(parentSnapshot.canonicalPath, basename(resolvedOutput));
  const canonicalOutputComparison = comparisonPath(canonicalOutput);

  for (const inputSnapshot of inputSnapshots) {
    if (!(await p15OperatorInputMatchesSnapshot(inputSnapshot))) {
      fail('Input path changed after it was read.');
    }
    if (comparisonPath(inputSnapshot.canonicalPath) === canonicalOutputComparison) {
      fail('Output path must not resolve to an input path.');
    }
  }

  const destinationSnapshot = await captureP15OperatorOutputDestinationSnapshot(canonicalOutput, fail);
  if (
    destinationSnapshot.state === 'EXISTING_REGULAR'
    && inputSnapshots.some((snapshot) => sameFileIdentity(destinationSnapshot.file, snapshot.file))
  ) {
    fail('Output path must not alias an input file.');
  }

  let temporarySnapshot: P15OperatorTemporaryDirectorySnapshot | null = null;
  let payloadSnapshot: P15OperatorTemporaryPayloadSnapshot | null = null;
  let writeFailed = false;
  let inputChanged = false;
  let outputParentChanged = false;
  let outputDestinationChanged = false;
  let temporaryPathChanged = false;

  try {
    if (!(await p15OperatorOutputParentMatchesSnapshot(parentSnapshot))) {
      outputParentChanged = true;
    } else {
      const temporaryDirectory = await mkdtemp(join(parentSnapshot.canonicalPath, '.p15-output-'));
      const temporaryInfo = await lstat(temporaryDirectory);
      if (!temporaryInfo.isDirectory()) throw new Error('Temporary output path is not a directory.');
      temporarySnapshot = captureTemporaryDirectorySnapshot(temporaryDirectory, temporaryInfo);

      if (!(await temporaryDirectoryMatchesSnapshot(temporarySnapshot))) {
        temporaryPathChanged = true;
      } else {
        const temporaryPath = join(temporaryDirectory, 'payload.json');
        let payloadHandle: FileHandle | null = null;
        try {
          payloadHandle = await open(temporaryPath, 'wx', 0o600);
          if (
            !(await temporaryDirectoryMatchesSnapshot(temporarySnapshot))
            || !(await openedPayloadMatchesPath(payloadHandle, temporaryPath))
          ) {
            temporaryPathChanged = true;
          } else {
            await payloadHandle.writeFile(content, { encoding: 'utf8' });
            const payloadAfterWrite = await payloadHandle.stat();
            if (!payloadAfterWrite.isFile()) temporaryPathChanged = true;
            else payloadSnapshot = captureTemporaryPayloadSnapshot(temporaryPath, payloadAfterWrite);
          }
        } finally {
          if (payloadHandle) await payloadHandle.close().catch(() => undefined);
        }

        if (
          !temporaryPathChanged
          && (
            !(await temporaryDirectoryMatchesSnapshot(temporarySnapshot))
            || !payloadSnapshot
            || !(await temporaryPayloadMatchesSnapshot(payloadSnapshot))
          )
        ) {
          temporaryPathChanged = true;
        }

        if (!temporaryPathChanged) {
          for (const inputSnapshot of inputSnapshots) {
            if (!(await p15OperatorInputMatchesSnapshot(inputSnapshot))) {
              inputChanged = true;
              break;
            }
          }
        }

        if (
          !temporaryPathChanged
          && !inputChanged
          && !(await p15OperatorOutputParentMatchesSnapshot(parentSnapshot))
        ) {
          outputParentChanged = true;
        }

        if (
          !temporaryPathChanged
          && !inputChanged
          && !outputParentChanged
          && (
            !(await temporaryDirectoryMatchesSnapshot(temporarySnapshot))
            || !payloadSnapshot
            || !(await temporaryPayloadMatchesSnapshot(payloadSnapshot))
          )
        ) {
          temporaryPathChanged = true;
        }

        if (
          !temporaryPathChanged
          && !inputChanged
          && !outputParentChanged
          && payloadSnapshot
          && !(await p15OperatorOutputDestinationMatchesSnapshot(destinationSnapshot))
        ) {
          outputDestinationChanged = true;
        }

        if (
          !temporaryPathChanged
          && !inputChanged
          && !outputParentChanged
          && !outputDestinationChanged
          && payloadSnapshot
        ) {
          await rename(payloadSnapshot.path, canonicalOutput);
        }
      }
    }
  } catch {
    writeFailed = true;
  } finally {
    if (temporarySnapshot) {
      await removeTemporaryArtifactsIfOwned(temporarySnapshot, payloadSnapshot, parentSnapshot);
    }
  }

  if (inputChanged) fail('Input path changed after it was read.');
  if (outputParentChanged) fail('Output directory changed during write.');
  if (outputDestinationChanged) fail('Output path changed during write.');
  if (temporaryPathChanged) fail('Temporary output path changed during write.');
  if (writeFailed) fail('Unable to write output safely.');
}
