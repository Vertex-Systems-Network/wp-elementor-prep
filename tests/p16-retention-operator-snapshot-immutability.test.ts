import {
  mkdtemp,
  readFile,
  rm,
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

describe('P16 retention operator snapshot immutability', () => {
  it('freezes snapshot identity metadata while leaving parsed value usable', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'wp-elementor-prep-p16-snapshot-freeze-'));
    try {
      const inputPath = join(dir, 'input.json');
      const outputPath = join(dir, 'out.json');
      await writeFile(inputPath, '{"payload":{"ok":true}}\n', 'utf8');

      const snapshot = await readP16OperatorJsonInput(inputPath, 'document', fail);
      const originalResolvedPath = snapshot.resolvedPath;
      const originalCanonicalPath = snapshot.canonicalPath;
      const originalDev = snapshot.file.dev;
      const originalIno = snapshot.file.ino;
      const originalSize = snapshot.file.size;

      expect(Object.isFrozen(snapshot)).toBe(true);
      expect(Object.isFrozen(snapshot.file)).toBe(true);
      expect(Object.isFrozen(snapshot.value)).toBe(false);

      expect(Reflect.set(snapshot, 'resolvedPath', join(dir, 'redirected.json'))).toBe(false);
      expect(Reflect.set(snapshot, 'canonicalPath', join(dir, 'redirected-real.json'))).toBe(false);
      expect(Reflect.set(snapshot.file, 'dev', originalDev + 1)).toBe(false);
      expect(Reflect.set(snapshot.file, 'ino', originalIno + 1)).toBe(false);
      expect(Reflect.set(snapshot.file, 'size', originalSize + 1)).toBe(false);

      expect(snapshot.resolvedPath).toBe(originalResolvedPath);
      expect(snapshot.canonicalPath).toBe(originalCanonicalPath);
      expect(snapshot.file.dev).toBe(originalDev);
      expect(snapshot.file.ino).toBe(originalIno);
      expect(snapshot.file.size).toBe(originalSize);

      const parsed = snapshot.value as { payload: { ok: boolean; added?: string } };
      parsed.payload.added = 'still-usable';
      expect(parsed.payload.added).toBe('still-usable');

      await writeP16OperatorJsonOutput(outputPath, [snapshot], '{"written":true}\n', fail);
      expect(await readFile(outputPath, 'utf8')).toBe('{"written":true}\n');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
