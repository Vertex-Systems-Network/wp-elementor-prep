import type { Stats } from 'node:fs';
import {
  lstat,
  mkdir,
  mkdtemp,
  open,
  realpath,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';

export const P16_OPERATOR_JSON_INPUT_MAX_BYTES = 1024 * 1024;
export const P16_OPERATOR_JSON_INPUT_MAX_DEPTH = 64;
export const P16_OPERATOR_JSON_INPUT_MAX_VALUES = 50_000;

type Fail = (message: string) => never;

export type P16OperatorJsonFileSnapshot = {
  dev: number;
  ino: number;
  size: number;
  mtimeMs: number;
  ctimeMs: number;
};

export type P16OperatorJsonInputSnapshot = {
  value: unknown;
  resolvedPath: string;
  canonicalPath: string;
  file: P16OperatorJsonFileSnapshot;
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
  return {
    dev: info.dev,
    ino: info.ino,
    size: info.size,
    mtimeMs: info.mtimeMs,
    ctimeMs: info.ctimeMs,
  };
}

function hasStableFileIdentity(info: P16OperatorJsonFileSnapshot | Stats): boolean {
  return info.ino !== 0;
}

function sameFileIdentity(
  first: P16OperatorJsonFileSnapshot | Stats,
  second: P16OperatorJsonFileSnapshot | Stats,
): boolean {
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

async function inspectCurrentInputPath(
  snapshot: P16OperatorJsonInputSnapshot,
  fail: Fail,
): Promise<Stats> {
  let currentInfo: Stats;
  let currentCanonical: string;
  try {
    currentInfo = await lstat(snapshot.resolvedPath);
    currentCanonical = await realpath(snapshot.resolvedPath);
  } catch {
    fail('Input path changed after it was read.');
  }

  if (!currentInfo.isFile()) {
    fail('Input path changed after it was read.');
  }
  if (comparisonPath(currentCanonical) !== comparisonPath(snapshot.canonicalPath)) {
    fail('Input path changed after it was read.');
  }
  if (!sameObservedFile(snapshot.file, currentInfo)) {
    fail('Input path changed after it was read.');
  }
  return currentInfo;
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

export async function readP16OperatorJsonInput(
  path: string,
  label: string,
  fail: Fail,
): Promise<P16OperatorJsonInputSnapshot> {
  const resolvedPath = resolve(path);
  let handle;
  try {
    handle = await open(resolvedPath, 'r');
  } catch {
    fail(`Unable to inspect ${label} input.`);
  }

  try {
    let before: Stats;
    try {
      before = await handle.stat();
    } catch {
      fail(`Unable to inspect ${label} input.`);
    }

    if (!before.isFile()) {
      fail(`${label} input must be a regular file.`);
    }
    if (before.size === 0) {
      fail(`${label} input is empty.`);
    }
    if (before.size > P16_OPERATOR_JSON_INPUT_MAX_BYTES) {
      fail(`${label} input exceeds ${P16_OPERATOR_JSON_INPUT_MAX_BYTES}-byte limit.`);
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

    let pathInfoBefore: Stats;
    let canonicalPath: string;
    let pathInfoAfter: Stats;
    try {
      pathInfoBefore = await lstat(resolvedPath);
      canonicalPath = await realpath(resolvedPath);
      pathInfoAfter = await lstat(resolvedPath);
    } catch {
      fail(`${label} input changed after it was read.`);
    }

    if (!pathInfoBefore.isFile() || !pathInfoAfter.isFile()) {
      fail(`${label} input must be a regular file.`);
    }
    if (!sameObservedFile(pathInfoBefore, pathInfoAfter) || !sameObservedFile(after, pathInfoAfter)) {
      fail(`${label} input changed after it was read.`);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      fail(`${label} input is not valid JSON.`);
    }

    validateP16OperatorJsonStructure(parsed, label, fail);
    return {
      value: parsed,
      resolvedPath,
      canonicalPath,
      file: toFileSnapshot(after),
    };
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

  try {
    await mkdir(requestedParent, { recursive: true });
  } catch {
    fail('Unable to create output directory.');
  }

  let realParent: string;
  try {
    realParent = await realpath(requestedParent);
  } catch {
    fail('Unable to resolve output directory.');
  }

  const canonicalOutput = join(realParent, basename(resolvedOutput));
  const canonicalOutputComparison = comparisonPath(canonicalOutput);

  for (const inputSnapshot of inputSnapshots) {
    await inspectCurrentInputPath(inputSnapshot, fail);
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

  let temporaryDirectory: string | null = null;
  let writeFailed = false;
  try {
    temporaryDirectory = await mkdtemp(join(realParent, '.p16-output-'));
    const temporaryPath = join(temporaryDirectory, 'payload.json');
    await writeFile(temporaryPath, content, { encoding: 'utf8', flag: 'wx', mode: 0o600 });

    for (const inputSnapshot of inputSnapshots) {
      await inspectCurrentInputPath(inputSnapshot, fail);
    }

    await rename(temporaryPath, canonicalOutput);
  } catch (error) {
    if (error instanceof Error && error.message === 'Input path changed after it was read.') {
      throw error;
    }
    writeFailed = true;
  } finally {
    if (temporaryDirectory) {
      await rm(temporaryDirectory, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  if (writeFailed) {
    fail('Unable to write output safely.');
  }
}
