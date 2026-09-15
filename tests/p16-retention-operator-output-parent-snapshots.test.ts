import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  captureP16OperatorOutputParentSnapshot,
  p16OperatorOutputParentMatchesSnapshot,
  readP16OperatorJsonInput,
  removeP16OperatorTemporaryDirectoryIfOwned,
  writeP16OperatorJsonOutput,
  type P16OperatorTemporaryDirectorySnapshot,
} from '../src/cli/p16-operator-json-io';

function fail(message: string): never {
  throw new Error(message);
}

describe('P16 retention operator output parent snapshots', () => {
  it('keeps a stable canonical output parent valid and supports a normal write', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-parent-stable-'));
    try {
      const parent = join(dir, 'out');
      const parentSnapshot = await captureP16OperatorOutputParentSnapshot(parent, fail);

      expect(Object.isFrozen(parentSnapshot)).toBe(true);
      expect(await p16OperatorOutputParentMatchesSnapshot(parentSnapshot)).toBe(true);

      const inputPath = join(dir, 'input.json');
      const outputPath = join(parent, 'result.json');
      await writeFile(inputPath, '{"stable":true}\n', 'utf8');
      const inputSnapshot = await readP16OperatorJsonInput(inputPath, 'document', fail);

      await writeP16OperatorJsonOutput(outputPath, [inputSnapshot], '{"written":true}\n', fail);

      expect(await readFile(outputPath, 'utf8')).toBe('{"written":true}\n');
      expect(await p16OperatorOutputParentMatchesSnapshot(parentSnapshot)).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects a canonical output parent replaced by a non-directory', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-parent-file-replace-'));
    try {
      const parent = join(dir, 'out');
      const movedParent = join(dir, 'out-original');
      const snapshot = await captureP16OperatorOutputParentSnapshot(parent, fail);

      await rename(parent, movedParent);
      await writeFile(parent, 'replacement', 'utf8');

      expect(await p16OperatorOutputParentMatchesSnapshot(snapshot)).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('detects same-path directory replacement when stable identity is available', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-parent-identity-'));
    try {
      const parent = join(dir, 'out');
      const movedParent = join(dir, 'out-original');
      const snapshot = await captureP16OperatorOutputParentSnapshot(parent, fail);

      await rename(parent, movedParent);
      await mkdir(parent);

      const matches = await p16OperatorOutputParentMatchesSnapshot(snapshot);
      if (snapshot.ino !== 0) {
        expect(matches).toBe(false);
      } else {
        expect(matches).toBe(true);
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('does not recursively delete a replacement-controlled temp path after parent replacement', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-parent-cleanup-'));
    try {
      const parent = join(dir, 'out');
      const movedParent = join(dir, 'out-original');
      const parentSnapshot = await captureP16OperatorOutputParentSnapshot(parent, fail);
      const temporaryPath = await mkdtemp(join(parent, '.p16-output-'));
      const temporaryInfo = await lstat(temporaryPath);
      const temporarySnapshot: P16OperatorTemporaryDirectorySnapshot = Object.freeze({
        path: temporaryPath,
        dev: temporaryInfo.dev,
        ino: temporaryInfo.ino,
      });
      await writeFile(join(temporaryPath, 'payload.json'), '{"original":true}\n', 'utf8');

      await rename(parent, movedParent);
      await mkdir(parent);
      const replacementTemporaryPath = join(parent, basename(temporaryPath));
      await mkdir(replacementTemporaryPath);
      const sentinelPath = join(replacementTemporaryPath, 'sentinel.txt');
      await writeFile(sentinelPath, 'do-not-delete', 'utf8');

      const removed = await removeP16OperatorTemporaryDirectoryIfOwned(
        temporarySnapshot,
        parentSnapshot,
      );

      expect(removed).toBe(false);
      expect(await readFile(sentinelPath, 'utf8')).toBe('do-not-delete');
      expect(await readFile(join(movedParent, basename(temporaryPath), 'payload.json'), 'utf8'))
        .toBe('{"original":true}\n');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
