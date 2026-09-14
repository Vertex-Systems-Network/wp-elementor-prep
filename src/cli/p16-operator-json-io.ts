import { lstat, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const P16_OPERATOR_JSON_INPUT_MAX_BYTES = 1024 * 1024;

type Fail = (message: string) => never;

function comparisonPath(path: string): string {
  const resolved = resolve(path);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
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
  let size: number;

  try {
    const info = await lstat(resolvedPath);
    if (!info.isFile()) {
      fail(`${label} input must be a regular file.`);
    }
    size = info.size;
  } catch (error) {
    if (error instanceof Error && error.message.endsWith('input must be a regular file.')) {
      throw error;
    }
    fail(`Unable to inspect ${label} input.`);
  }

  if (size === 0) {
    fail(`${label} input is empty.`);
  }
  if (size > P16_OPERATOR_JSON_INPUT_MAX_BYTES) {
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
