import { lstat, mkdir, mkdtemp, open, realpath, rename, rm } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

export const SCRIPT_JSON_MAX_BYTES = 64 * 1024 * 1024;
export const SCRIPT_JSON_MAX_DEPTH = 128;
export const SCRIPT_JSON_MAX_VALUES = 1_000_000;

export class SecurityIoError extends Error {
  constructor(kind, message) {
    super(message);
    this.name = 'SecurityIoError';
    this.kind = kind;
  }
}

function positiveLimit(value, fallback, label) {
  if (value === undefined) return fallback;
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new SecurityIoError('INVALID_LIMIT', `${label} must be a positive safe integer.`);
  }
  return value;
}

function sameFileIdentity(before, after) {
  const comparableIdentity = Number.isFinite(before.dev)
    && Number.isFinite(before.ino)
    && Number.isFinite(after.dev)
    && Number.isFinite(after.ino)
    && before.ino !== 0
    && after.ino !== 0;
  if (comparableIdentity && (before.dev !== after.dev || before.ino !== after.ino)) return false;
  return true;
}

function validateJsonStructure(value, { maxDepth, maxValues, label }) {
  const stack = [{ value, depth: 0 }];
  let visited = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    visited += 1;
    if (visited > maxValues) {
      throw new SecurityIoError(
        'JSON_RESOURCE_LIMIT',
        `${label} exceeds the ${maxValues}-value structural limit.`,
      );
    }

    if (current.value === null || typeof current.value !== 'object') continue;

    const nextDepth = current.depth + 1;
    if (nextDepth > maxDepth) {
      throw new SecurityIoError(
        'JSON_RESOURCE_LIMIT',
        `${label} exceeds the ${maxDepth}-level nesting limit.`,
      );
    }

    if (Array.isArray(current.value)) {
      for (let index = current.value.length - 1; index >= 0; index -= 1) {
        stack.push({ value: current.value[index], depth: nextDepth });
      }
      continue;
    }

    const keys = Object.keys(current.value);
    for (let index = keys.length - 1; index >= 0; index -= 1) {
      const key = keys[index];
      if (key !== undefined) stack.push({ value: current.value[key], depth: nextDepth });
    }
  }
}

export async function readBoundedJsonFile(inputPath, options = {}) {
  const absolute = resolve(inputPath);
  const label = options.label ?? inputPath;
  const maxBytes = positiveLimit(options.maxBytes, SCRIPT_JSON_MAX_BYTES, 'maxBytes');
  const maxDepth = positiveLimit(options.maxDepth, SCRIPT_JSON_MAX_DEPTH, 'maxDepth');
  const maxValues = positiveLimit(options.maxValues, SCRIPT_JSON_MAX_VALUES, 'maxValues');

  let handle;
  const chunks = [];
  let totalBytes = 0;

  try {
    handle = await open(absolute, 'r');
    const opened = await handle.stat();
    if (!opened.isFile()) {
      throw new SecurityIoError('UNSAFE_INPUT', `${label} must be a regular file.`);
    }
    if (opened.size <= 0) {
      throw new SecurityIoError('INVALID_JSON', `${label} is empty.`);
    }
    if (opened.size > maxBytes) {
      throw new SecurityIoError('JSON_RESOURCE_LIMIT', `${label} exceeds the ${maxBytes}-byte JSON input limit.`);
    }

    let pathEntry;
    try {
      pathEntry = await lstat(absolute);
    } catch {
      throw new SecurityIoError('UNSAFE_INPUT', `${label} changed identity while being opened.`);
    }
    if (pathEntry.isSymbolicLink()) {
      throw new SecurityIoError('UNSAFE_INPUT', `${label} must not be a symbolic link.`);
    }
    if (!pathEntry.isFile() || !sameFileIdentity(pathEntry, opened)) {
      throw new SecurityIoError('UNSAFE_INPUT', `${label} changed identity while being opened.`);
    }

    const stream = handle.createReadStream({ autoClose: false });
    for await (const chunk of stream) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += bytes.byteLength;
      if (totalBytes > maxBytes) {
        stream.destroy();
        throw new SecurityIoError(
          'JSON_RESOURCE_LIMIT',
          `${label} exceeds the ${maxBytes}-byte JSON input limit.`,
        );
      }
      chunks.push(bytes);
    }

    const after = await handle.stat();
    let finalPathEntry;
    try {
      finalPathEntry = await lstat(absolute);
    } catch {
      throw new SecurityIoError('UNSAFE_INPUT', `${label} changed while it was being read.`);
    }
    if (
      !sameFileIdentity(opened, after)
      || after.size !== opened.size
      || after.mtimeMs !== opened.mtimeMs
      || after.ctimeMs !== opened.ctimeMs
      || totalBytes !== after.size
      || finalPathEntry.isSymbolicLink()
      || !sameFileIdentity(finalPathEntry, opened)
    ) {
      throw new SecurityIoError('UNSAFE_INPUT', `${label} changed while it was being read.`);
    }
  } catch (error) {
    if (error instanceof SecurityIoError) throw error;
    const detail = error instanceof Error ? error.message : String(error);
    throw new SecurityIoError('READ_FAILED', `Unable to read ${label}: ${detail}`);
  } finally {
    if (handle) await handle.close().catch(() => undefined);
  }

  let raw;
  try {
    raw = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks, totalBytes));
  } catch {
    throw new SecurityIoError('INVALID_UTF8', `${label} is not valid UTF-8.`);
  }

  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new SecurityIoError('INVALID_JSON', `${label} is not valid JSON.`);
  }

  validateJsonStructure(value, { maxDepth, maxValues, label });
  return { raw, value };
}


function pathInside(root, candidate) {
  const rel = relative(root, candidate);
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

export async function readBoundedContainedFile(rootPath, reference, options = {}) {
  const label = options.label ?? String(reference);
  const maxBytes = positiveLimit(options.maxBytes, SCRIPT_JSON_MAX_BYTES, 'maxBytes');
  const allowAbsolute = options.allowAbsolute === true;

  if (typeof reference !== 'string' || reference.length === 0) {
    throw new SecurityIoError('UNSAFE_INPUT', `${label} path must be a non-empty string.`);
  }
  if (isAbsolute(reference) && !allowAbsolute) {
    throw new SecurityIoError('PATH_ESCAPE', `${label} must use a relative path inside its declared root.`);
  }

  let canonicalRoot;
  try {
    canonicalRoot = await realpath(resolve(rootPath));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new SecurityIoError('READ_FAILED', `Unable to resolve ${label} root: ${detail}`);
  }

  const candidate = isAbsolute(reference) ? resolve(reference) : resolve(canonicalRoot, reference);
  if (!pathInside(canonicalRoot, candidate)) {
    throw new SecurityIoError('PATH_ESCAPE', `${label} escapes its declared root.`);
  }

  let handle;
  const chunks = [];
  let totalBytes = 0;

  try {
    handle = await open(candidate, 'r');
    const opened = await handle.stat();
    if (!opened.isFile()) {
      throw new SecurityIoError('UNSAFE_INPUT', `${label} must be a regular file.`);
    }
    if (opened.size <= 0) {
      throw new SecurityIoError('UNSAFE_INPUT', `${label} must not be empty.`);
    }
    if (opened.size > maxBytes) {
      throw new SecurityIoError('JSON_RESOURCE_LIMIT', `${label} exceeds the ${maxBytes}-byte input limit.`);
    }

    let pathEntry;
    let canonicalCandidate;
    try {
      [pathEntry, canonicalCandidate] = await Promise.all([lstat(candidate), realpath(candidate)]);
    } catch {
      throw new SecurityIoError('UNSAFE_INPUT', `${label} changed identity while being opened.`);
    }
    if (pathEntry.isSymbolicLink()) {
      throw new SecurityIoError('UNSAFE_INPUT', `${label} must not be a symbolic link.`);
    }
    if (!pathEntry.isFile() || !sameFileIdentity(pathEntry, opened)) {
      throw new SecurityIoError('UNSAFE_INPUT', `${label} changed identity while being opened.`);
    }
    if (!pathInside(canonicalRoot, canonicalCandidate)) {
      throw new SecurityIoError('PATH_ESCAPE', `${label} resolves outside its declared root.`);
    }

    const stream = handle.createReadStream({ autoClose: false });
    for await (const chunk of stream) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += bytes.byteLength;
      if (totalBytes > maxBytes) {
        stream.destroy();
        throw new SecurityIoError(
          'JSON_RESOURCE_LIMIT',
          `${label} exceeds the ${maxBytes}-byte input limit.`,
        );
      }
      chunks.push(bytes);
    }

    const after = await handle.stat();
    let finalPathEntry;
    let finalCanonicalCandidate;
    try {
      [finalPathEntry, finalCanonicalCandidate] = await Promise.all([lstat(candidate), realpath(candidate)]);
    } catch {
      throw new SecurityIoError('UNSAFE_INPUT', `${label} changed while it was being read.`);
    }
    if (
      !sameFileIdentity(opened, after)
      || after.size !== opened.size
      || after.mtimeMs !== opened.mtimeMs
      || after.ctimeMs !== opened.ctimeMs
      || totalBytes !== after.size
      || finalPathEntry.isSymbolicLink()
      || !sameFileIdentity(finalPathEntry, opened)
    ) {
      throw new SecurityIoError('UNSAFE_INPUT', `${label} changed while it was being read.`);
    }
    if (!pathInside(canonicalRoot, finalCanonicalCandidate)) {
      throw new SecurityIoError('PATH_ESCAPE', `${label} resolves outside its declared root.`);
    }

    return {
      bytes: Buffer.concat(chunks, totalBytes),
      size: totalBytes,
      canonicalPath: finalCanonicalCandidate,
      relativePath: relative(canonicalRoot, finalCanonicalCandidate).replaceAll('\\\\', '/'),
    };
  } catch (error) {
    if (error instanceof SecurityIoError) throw error;
    const detail = error instanceof Error ? error.message : String(error);
    throw new SecurityIoError('READ_FAILED', `Unable to read ${label}: ${detail}`);
  } finally {
    if (handle) await handle.close().catch(() => undefined);
  }
}

export async function readBoundedContainedJsonFile(rootPath, reference, options = {}) {
  const label = options.label ?? String(reference);
  const file = await readBoundedContainedFile(rootPath, reference, options);

  let raw;
  try {
    raw = new TextDecoder('utf-8', { fatal: true }).decode(file.bytes);
  } catch {
    throw new SecurityIoError('INVALID_UTF8', `${label} is not valid UTF-8.`);
  }

  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new SecurityIoError('INVALID_JSON', `${label} is not valid JSON.`);
  }

  validateJsonStructure(value, {
    maxDepth: positiveLimit(options.maxDepth, SCRIPT_JSON_MAX_DEPTH, 'maxDepth'),
    maxValues: positiveLimit(options.maxValues, SCRIPT_JSON_MAX_VALUES, 'maxValues'),
    label,
  });
  return { ...file, raw, value };
}

export async function writeAtomicTextFile(outputPath, content) {
  const absolute = resolve(outputPath);
  const requestedParent = dirname(absolute);
  const fileName = basename(absolute);

  if (!fileName || fileName === '.' || fileName === '..') {
    throw new SecurityIoError('UNSAFE_OUTPUT', `Unsafe output path: ${outputPath}`);
  }

  await mkdir(requestedParent, { recursive: true });
  const canonicalParent = await realpath(requestedParent);
  const target = join(canonicalParent, fileName);
  const tempDir = await mkdtemp(join(canonicalParent, '.wp-elementor-prep-receipt-'));
  const tempPath = join(tempDir, 'payload');
  let handle;

  try {
    handle = await open(tempPath, 'wx', 0o600);
    await handle.writeFile(content, 'utf8');
    await handle.sync();
    await handle.close();
    handle = undefined;

    try {
      const existing = await lstat(target);
      if (existing.isDirectory()) {
        throw new SecurityIoError('UNSAFE_OUTPUT', `Refusing to replace output directory: ${target}`);
      }
    } catch (error) {
      if (error instanceof SecurityIoError) throw error;
      if (error?.code !== 'ENOENT') throw error;
    }

    await rm(target, { force: true });
    await rename(tempPath, target);
    return target;
  } finally {
    if (handle) await handle.close().catch(() => undefined);
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
