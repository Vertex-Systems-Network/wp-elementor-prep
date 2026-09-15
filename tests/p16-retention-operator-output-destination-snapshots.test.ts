import {
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  captureP16OperatorOutputDestinationSnapshot,
  p16OperatorOutputDestinationMatchesSnapshot,
  writeP16OperatorJsonOutput,
  type P16OperatorOutputDestinationSnapshot,
} from '../src/cli/p16-operator-json-io';

function fail(message: string): never {
  throw new Error(message);
}

describe('P16 retention operator output destination snapshots', () => {
  it('keeps an absent destination valid only while it remains absent', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-destination-absent-'));
    try {
      const outputPath = join(dir, 'result.json');
      const snapshot = await captureP16OperatorOutputDestinationSnapshot(outputPath, fail);

      expect(snapshot).toEqual({ state: 'ABSENT', path: outputPath });
      expect(Object.isFrozen(snapshot)).toBe(true);
      expect(await p16OperatorOutputDestinationMatchesSnapshot(snapshot)).toBe(true);

      await writeFile(outputPath, '{"intruder":true}\n', 'utf8');

      expect(await p16OperatorOutputDestinationMatchesSnapshot(snapshot)).toBe(false);
      expect(await readFile(outputPath, 'utf8')).toBe('{"intruder":true}\n');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('keeps an unchanged existing regular destination valid', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-destination-existing-'));
    try {
      const outputPath = join(dir, 'result.json');
      await writeFile(outputPath, '{"existing":true}\n', 'utf8');
      const snapshot = await captureP16OperatorOutputDestinationSnapshot(outputPath, fail);

      expect(snapshot.state).toBe('EXISTING_REGULAR');
      expect(Object.isFrozen(snapshot)).toBe(true);
      if (snapshot.state === 'EXISTING_REGULAR') {
        expect(Object.isFrozen(snapshot.file)).toBe(true);
      }
      expect(await p16OperatorOutputDestinationMatchesSnapshot(snapshot)).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects an existing regular destination replaced at the same path', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-destination-replaced-'));
    try {
      const outputPath = join(dir, 'result.json');
      const movedPath = join(dir, 'result-original.json');
      await writeFile(outputPath, '{"original":true}\n', 'utf8');
      const snapshot = await captureP16OperatorOutputDestinationSnapshot(outputPath, fail);

      await rename(outputPath, movedPath);
      await writeFile(outputPath, '{"replacement":"different-size"}\n', 'utf8');

      expect(await p16OperatorOutputDestinationMatchesSnapshot(snapshot)).toBe(false);
      expect(await readFile(outputPath, 'utf8')).toBe('{"replacement":"different-size"}\n');
      expect(await readFile(movedPath, 'utf8')).toBe('{"original":true}\n');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('uses bounded metadata consistency when a captured inode is unavailable', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-destination-fallback-'));
    try {
      const outputPath = join(dir, 'result.json');
      await writeFile(outputPath, '{"stable":true}\n', 'utf8');
      const captured = await captureP16OperatorOutputDestinationSnapshot(outputPath, fail);
      expect(captured.state).toBe('EXISTING_REGULAR');
      if (captured.state !== 'EXISTING_REGULAR') return;

      const fallback: P16OperatorOutputDestinationSnapshot = Object.freeze({
        state: 'EXISTING_REGULAR',
        path: captured.path,
        canonicalPath: captured.canonicalPath,
        file: Object.freeze({
          ...captured.file,
          ino: 0,
        }),
      });

      expect(await p16OperatorOutputDestinationMatchesSnapshot(fallback)).toBe(true);

      await writeFile(outputPath, '{"changed":"different-size"}\n', 'utf8');

      expect(await p16OperatorOutputDestinationMatchesSnapshot(fallback)).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('preserves intentional overwrite of the same unchanged regular destination', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-destination-overwrite-'));
    try {
      const outputPath = join(dir, 'result.json');
      await writeFile(outputPath, '{"before":true}\n', 'utf8');

      await writeP16OperatorJsonOutput(outputPath, [], '{"after":true}\n', fail);

      expect(await readFile(outputPath, 'utf8')).toBe('{"after":true}\n');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
