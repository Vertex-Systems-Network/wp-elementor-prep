import {
  access,
  mkdtemp,
  readFile,
  rename,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  readP16OperatorJsonInput,
  writeP16OperatorJsonOutput,
} from '../src/cli/p16-operator-json-io';

function fail(message: string): never {
  throw new Error(message);
}

describe('P16 retention operator stable input snapshots', () => {
  it('writes normally when the input path still matches the file that was read', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-snapshot-stable-'));
    try {
      const inputPath = join(dir, 'input.json');
      const outputPath = join(dir, 'out.json');
      await writeFile(inputPath, '{"stable":true}\n', 'utf8');

      const snapshot = await readP16OperatorJsonInput(inputPath, 'document', fail);
      expect(snapshot.value).toEqual({ stable: true });

      await writeP16OperatorJsonOutput(outputPath, [snapshot], '{"written":true}\n', fail);

      expect(await readFile(outputPath, 'utf8')).toBe('{"written":true}\n');
      expect(await readFile(inputPath, 'utf8')).toBe('{"stable":true}\n');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('fails closed when an input pathname is replaced after the read snapshot', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-snapshot-replaced-'));
    try {
      const inputPath = join(dir, 'input.json');
      const originalPath = join(dir, 'original.json');
      const outputPath = join(dir, 'out.json');
      const original = '{"stable":true}\n';
      const replacement = '{"replacement":"different-length"}\n';
      await writeFile(inputPath, original, 'utf8');

      const snapshot = await readP16OperatorJsonInput(inputPath, 'document', fail);
      await rename(inputPath, originalPath);
      await writeFile(inputPath, replacement, 'utf8');

      await expect(
        writeP16OperatorJsonOutput(outputPath, [snapshot], '{"written":true}\n', fail),
      ).rejects.toThrow('Input path changed after it was read.');

      expect(await readFile(originalPath, 'utf8')).toBe(original);
      expect(await readFile(inputPath, 'utf8')).toBe(replacement);
      await expect(access(outputPath)).rejects.toThrow();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('continues to reject a symbolic-link input path without accepting its target', async () => {
    if (process.platform === 'win32') return;

    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-snapshot-symlink-'));
    try {
      const targetPath = join(dir, 'target.json');
      const inputPath = join(dir, 'input.json');
      await writeFile(targetPath, '{"target":true}\n', 'utf8');
      await symlink(targetPath, inputPath, 'file');

      await expect(readP16OperatorJsonInput(inputPath, 'document', fail))
        .rejects.toThrow('document input must be a regular file.');
      expect(await readFile(targetPath, 'utf8')).toBe('{"target":true}\n');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
