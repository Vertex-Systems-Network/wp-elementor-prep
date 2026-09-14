import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';

export const P16_OPERATOR_JSON_INPUT_MAX_BYTES = 1024 * 1024;

type Fail = (message: string) => never;

type InputStats = Awaited<ReturnType<typeof lstat>>;

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

function sameFileIdentity(first: InputStats, second: InputStats): boolean {
  return first.ino !== 0
    && second.ino !== 0
    && first.dev === second.dev
    && first.ino === second.ino;
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
): Promise<unknown> {
  const resolvedPath = resolve(path);
  let info: InputStats;

  try {
    info = await lstat(resolvedPath);
  } catch {
    fail(`Unable to inspect ${label} input.`);
  }

  if (!info.isFile()) {
    fail(`${label} input must be a regular file.`);
  }
  if (info.size === 0) {
    fail(`${label} input is empty.`);
  }
  if (info.size > P16_OPERATOR_JSON_INPUT_MAX_BYTES) {
    fail(`${label} input exceeds ${P16_OPERATOR_JSON_INPUT_MAX_BYTES}-byte limit.`);
  }

  let raw: string;
  try {
    raw = await readFile(resolvedPath, 'utf8');
  } catch {
    fail(`Unable to read ${label} input.`);
  }

  const actualBytes = Buffer.byteLength(raw, 'utf8');
  if (actualBytes === 0 || raw.trim().length === 0) {
    fail(`${label} input is empty.`);
  }
  if (actualBytes > P16_OPERATOR_JSON_INPUT_MAX_BYTES) {
    fail(`${label} input exceeds ${P16_OPERATOR_JSON_INPUT_MAX_BYTES}-byte limit.`);
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    fail(`${label} input is not valid JSON.`);
  }
}

export async function writeP16OperatorJsonOutput(
  outputPath: string,
  inputPaths: readonly string[],
  content: string,
  fail: Fail,
): Promise<void> {
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
  const inputIdentities: InputStats[] = [];

  for (const inputPath of inputPaths) {
    let canonicalInput: string;
    let inputInfo: InputStats;
    try {
      canonicalInput = await realpath(resolve(inputPath));
      inputInfo = await lstat(canonicalInput);
    } catch {
      fail('Unable to resolve input path for output safety.');
    }

    if (comparisonPath(canonicalInput) === canonicalOutputComparison) {
      fail('Output path must not resolve to an input path.');
    }
    inputIdentities.push(inputInfo);
  }

  let existingOutput: InputStats | null = null;
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
    if (inputIdentities.some((inputInfo) => sameFileIdentity(existingOutput, inputInfo))) {
      fail('Output path must not alias an input file.');
    }
  }

  let temporaryDirectory: string | null = null;
  let writeFailed = false;
  try {
    temporaryDirectory = await mkdtemp(join(realParent, '.p16-output-'));
    const temporaryPath = join(temporaryDirectory, 'payload.json');
    await writeFile(temporaryPath, content, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    await rename(temporaryPath, canonicalOutput);
  } catch {
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
