import {
  lstat,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  captureP16OperatorOutputParentSnapshot,
  removeP16OperatorTemporaryDirectoryIfOwned,
  type P16OperatorTemporaryDirectorySnapshot,
} from '../src/cli/p16-operator-json-io';

function fail(message: string): never {
  throw new Error(message);
}

describe('P16 retention operator non-recursive temporary cleanup', () => {
  it('removes an empty stable owned temporary directory', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-cleanup-empty-'));
    try {
      const parent = join(dir, 'out');
      const parentSnapshot = await captureP16OperatorOutputParentSnapshot(parent, fail);
      const temporaryPath = await mkdtemp(join(parent, '.p16-output-'));
      const temporaryInfo = await lstat(temporaryPath);
      const temporarySnapshot: P16OperatorTemporaryDirectorySnapshot = Object.freeze({
        path: temporaryPath,
        dev: temporaryInfo.dev,
        ino: temporaryInfo.ino,
      });

      expect(await removeP16OperatorTemporaryDirectoryIfOwned(
        temporarySnapshot,
        parentSnapshot,
      )).toBe(true);
      await expect(lstat(temporaryPath)).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('leaves a non-empty stable temporary directory untouched instead of recursively deleting it', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-cleanup-nonempty-'));
    try {
      const parent = join(dir, 'out');
      const parentSnapshot = await captureP16OperatorOutputParentSnapshot(parent, fail);
      const temporaryPath = await mkdtemp(join(parent, '.p16-output-'));
      const temporaryInfo = await lstat(temporaryPath);
      const temporarySnapshot: P16OperatorTemporaryDirectorySnapshot = Object.freeze({
        path: temporaryPath,
        dev: temporaryInfo.dev,
        ino: temporaryInfo.ino,
      });
      const sentinelPath = join(temporaryPath, 'sentinel.txt');
      await writeFile(sentinelPath, 'preserve-me', 'utf8');

      expect(await removeP16OperatorTemporaryDirectoryIfOwned(
        temporarySnapshot,
        parentSnapshot,
      )).toBe(false);
      expect(await readFile(sentinelPath, 'utf8')).toBe('preserve-me');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
