import { lstat, mkdir, mkdtemp, open, realpath, rename, rm, stat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

export class SafeOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SafeOutputError';
  }
}

export async function prepareSafeOutputDirectory(path: string): Promise<string> {
  const requested = resolve(path);
  await mkdir(requested, { recursive: true });
  const canonical = await realpath(requested);
  const info = await stat(canonical);
  if (!info.isDirectory()) {
    throw new SafeOutputError(`Output path is not a directory: ${requested}`);
  }
  return canonical;
}

export async function writeAtomicOutputFile(
  canonicalOutDir: string,
  fileName: string,
  content: string,
): Promise<void> {
  if (!fileName || basename(fileName) !== fileName || fileName === '.' || fileName === '..') {
    throw new SafeOutputError(`Unsafe output filename: ${fileName}`);
  }

  const outDir = await realpath(canonicalOutDir);
  const target = join(outDir, fileName);
  const tempDir = await mkdtemp(join(outDir, '.wp-elementor-prep-write-'));
  const tempPath = join(tempDir, 'payload');
  let handle: Awaited<ReturnType<typeof open>> | null = null;

  try {
    handle = await open(tempPath, 'wx', 0o600);
    await handle.writeFile(content, 'utf8');
    await handle.sync();
    await handle.close();
    handle = null;

    try {
      const existing = await lstat(target);
      if (existing.isDirectory()) {
        throw new SafeOutputError(`Refusing to replace output directory: ${target}`);
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException)?.code;
      if (code !== 'ENOENT') throw error;
    }

    // Same-directory rename replaces an existing non-directory entry atomically on
    // supported filesystems. Avoid unlinking first, which would create a replacement
    // gap where another process could race a new destination entry into place.
    await rename(tempPath, target);
  } finally {
    if (handle) {
      await handle.close().catch(() => undefined);
    }
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
