import { createHash } from 'node:crypto';
import {
  access,
  mkdtemp,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  p16OperatorInputMatchesSnapshot,
  readP16OperatorJsonInput,
  writeP16OperatorJsonOutput,
  type P16OperatorJsonInputSnapshot,
} from '../src/cli/p16-operator-json-io';

function fail(message: string): never {
  throw new Error(message);
}

function sha256(bytes: Uint8Array): string {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

async function metadataAdjustedSnapshot(
  snapshot: P16OperatorJsonInputSnapshot,
): Promise<P16OperatorJsonInputSnapshot> {
  const current = await stat(snapshot.resolvedPath);
  return Object.freeze({
    ...snapshot,
    file: Object.freeze({
      dev: current.dev,
      ino: current.ino,
      size: current.size,
      mtimeMs: current.mtimeMs,
      ctimeMs: current.ctimeMs,
    }),
  });
}

describe('P16 retention operator exact input content binding', () => {
  it('retains SHA-256 over the exact multibyte UTF-8 bytes consumed', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-content-digest-'));
    try {
      const inputPath = join(dir, 'input.json');
      const bytes = Buffer.from('{"label":"İstanbul — 東京"}\n', 'utf8');
      await writeFile(inputPath, bytes);

      const snapshot = await readP16OperatorJsonInput(inputPath, 'document', fail);

      expect(snapshot.contentSha256).toBe(sha256(bytes));
      expect(snapshot.value).toEqual({ label: 'İstanbul — 東京' });
      expect(await p16OperatorInputMatchesSnapshot(snapshot)).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects malformed UTF-8 before JSON semantic validation', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-invalid-utf8-'));
    try {
      const inputPath = join(dir, 'input.json');
      const malformed = Buffer.from([
        0x7b, 0x22, 0x78, 0x22, 0x3a, 0x22,
        0xc3, 0x28,
        0x22, 0x7d, 0x0a,
      ]);
      await writeFile(inputPath, malformed);

      await expect(readP16OperatorJsonInput(inputPath, 'document', fail))
        .rejects.toThrow('document input is not valid UTF-8.');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects same-size byte drift even when supplied metadata matches the changed file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-same-size-drift-'));
    try {
      const inputPath = join(dir, 'input.json');
      await writeFile(inputPath, '{"value":1}\n', 'utf8');

      const original = await readP16OperatorJsonInput(inputPath, 'document', fail);
      await writeFile(inputPath, '{"value":2}\n', 'utf8');
      const metadataAdjusted = await metadataAdjustedSnapshot(original);

      expect(metadataAdjusted.file.size).toBe(original.file.size);
      expect(await p16OperatorInputMatchesSnapshot(metadataAdjusted)).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('refuses output commit on digest mismatch and removes owned temporary artifacts', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-digest-commit-'));
    try {
      const inputPath = join(dir, 'input.json');
      const outputPath = join(dir, 'report.json');
      await writeFile(inputPath, '{"value":1}\n', 'utf8');

      const original = await readP16OperatorJsonInput(inputPath, 'document', fail);
      await writeFile(inputPath, '{"value":2}\n', 'utf8');
      const metadataAdjusted = await metadataAdjustedSnapshot(original);

      await expect(writeP16OperatorJsonOutput(
        outputPath,
        [metadataAdjusted],
        '{"report":true}\n',
        fail,
      )).rejects.toThrow('Input path changed after it was read.');

      await expect(access(outputPath)).rejects.toThrow();
      expect((await readdir(dir)).some((name) => name.startsWith('.p16-output-'))).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
