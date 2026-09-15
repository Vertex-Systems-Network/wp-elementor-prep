import {
  lstat,
  mkdir,
  mkdtemp,
  open,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  p16OperatorOpenedPayloadMatchesPath,
  p16OperatorTemporaryDirectoryMatchesSnapshot,
  p16OperatorTemporaryPayloadMatchesSnapshot,
  type P16OperatorTemporaryDirectorySnapshot,
  type P16OperatorTemporaryPayloadSnapshot,
} from '../src/cli/p16-operator-json-io';

function directorySnapshot(
  path: string,
  info: Awaited<ReturnType<typeof lstat>>,
): P16OperatorTemporaryDirectorySnapshot {
  return Object.freeze({
    path,
    dev: info.dev,
    ino: info.ino,
  });
}

function payloadSnapshot(
  path: string,
  info: Awaited<ReturnType<typeof lstat>>,
): P16OperatorTemporaryPayloadSnapshot {
  return Object.freeze({
    path,
    file: Object.freeze({
      dev: info.dev,
      ino: info.ino,
      size: info.size,
      mtimeMs: info.mtimeMs,
      ctimeMs: info.ctimeMs,
    }),
  });
}

describe('P16 retention operator temporary payload snapshots', () => {
  it('keeps a stable canonical temporary directory matched to its snapshot', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-temp-stable-'));
    try {
      const temporaryDirectory = await mkdtemp(join(dir, '.p16-output-'));
      const info = await lstat(temporaryDirectory);
      const snapshot = directorySnapshot(temporaryDirectory, info);

      expect(await p16OperatorTemporaryDirectoryMatchesSnapshot(snapshot)).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects a temporary directory replaced by a non-directory', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-temp-file-'));
    try {
      const temporaryDirectory = await mkdtemp(join(dir, '.p16-output-'));
      const movedDirectory = `${temporaryDirectory}-original`;
      const info = await lstat(temporaryDirectory);
      const snapshot = directorySnapshot(temporaryDirectory, info);

      await rename(temporaryDirectory, movedDirectory);
      await writeFile(temporaryDirectory, 'replacement', 'utf8');

      expect(await p16OperatorTemporaryDirectoryMatchesSnapshot(snapshot)).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('detects same-path temporary-directory replacement when stable identity is available', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-temp-identity-'));
    try {
      const temporaryDirectory = await mkdtemp(join(dir, '.p16-output-'));
      const movedDirectory = `${temporaryDirectory}-original`;
      const info = await lstat(temporaryDirectory);
      const snapshot = directorySnapshot(temporaryDirectory, info);

      await rename(temporaryDirectory, movedDirectory);
      await mkdir(temporaryDirectory);

      const matches = await p16OperatorTemporaryDirectoryMatchesSnapshot(snapshot);
      if (snapshot.ino !== 0) {
        expect(matches).toBe(false);
      } else {
        expect(matches).toBe(true);
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects an opened payload handle/path mismatch before content is written to the handle', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-payload-open-'));
    let handle: Awaited<ReturnType<typeof open>> | null = null;
    try {
      const payloadPath = join(dir, 'payload.json');
      const movedPath = join(dir, 'payload-original.json');
      handle = await open(payloadPath, 'wx', 0o600);

      await rename(payloadPath, movedPath);
      await writeFile(payloadPath, 'replacement-path-content', 'utf8');

      expect(await p16OperatorOpenedPayloadMatchesPath(handle, payloadPath)).toBe(false);
      expect((await handle.stat()).size).toBe(0);
    } finally {
      if (handle) await handle.close().catch(() => undefined);
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects payload pathname replacement after write before rename', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-payload-replace-'));
    try {
      const payloadPath = join(dir, 'payload.json');
      const movedPath = join(dir, 'payload-original.json');
      await writeFile(payloadPath, '{"written":true}\n', 'utf8');
      const info = await lstat(payloadPath);
      const snapshot = payloadSnapshot(payloadPath, info);

      expect(await p16OperatorTemporaryPayloadMatchesSnapshot(snapshot)).toBe(true);

      await rename(payloadPath, movedPath);
      await writeFile(payloadPath, '{"replacement":"different-size-content"}\n', 'utf8');

      expect(await p16OperatorTemporaryPayloadMatchesSnapshot(snapshot)).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
