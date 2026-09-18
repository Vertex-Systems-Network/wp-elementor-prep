import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  SecurityIoError,
  readBoundedJsonFile,
  writeAtomicTextFile,
} from '../scripts/security-io.mjs';

const roots = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function root() {
  const dir = await mkdtemp(join(tmpdir(), 'security-io-'));
  roots.push(dir);
  return dir;
}

describe('scripts security I/O', () => {
  it('reads strict JSON within caller-supplied resource ceilings', async () => {
    const dir = await root();
    const path = join(dir, 'input.json');
    await writeFile(path, '{"ok":true}\n', 'utf8');

    await expect(readBoundedJsonFile(path, {
      label: 'fixture',
      maxBytes: 64,
      maxDepth: 8,
      maxValues: 32,
    })).resolves.toMatchObject({ value: { ok: true } });
  });

  it('rejects JSON above the configured byte ceiling before parsing', async () => {
    const dir = await root();
    const path = join(dir, 'oversized.json');
    await writeFile(path, JSON.stringify({ payload: 'x'.repeat(128) }), 'utf8');

    await expect(readBoundedJsonFile(path, { label: 'fixture', maxBytes: 32 }))
      .rejects.toMatchObject({ name: 'SecurityIoError', kind: 'JSON_RESOURCE_LIMIT' });
  });

  it('rejects deeply nested JSON before recursive consumers can process it', async () => {
    const dir = await root();
    const path = join(dir, 'deep.json');
    await writeFile(path, JSON.stringify({ a: { b: { c: { d: true } } } }), 'utf8');

    await expect(readBoundedJsonFile(path, { label: 'fixture', maxDepth: 2 }))
      .rejects.toMatchObject({ name: 'SecurityIoError', kind: 'JSON_RESOURCE_LIMIT' });
  });

  it('rejects malformed UTF-8 JSON', async () => {
    const dir = await root();
    const path = join(dir, 'invalid.json');
    await writeFile(path, Buffer.from([0xc3, 0x28]));

    await expect(readBoundedJsonFile(path, { label: 'fixture' }))
      .rejects.toMatchObject({ name: 'SecurityIoError', kind: 'INVALID_UTF8' });
  });

  it.skipIf(process.platform === 'win32')('replaces a symlinked receipt path without modifying its target', async () => {
    const dir = await root();
    const outside = join(dir, 'outside.txt');
    const output = join(dir, 'receipt.json');
    await writeFile(outside, 'outside-original\n', 'utf8');
    await symlink(outside, output);

    await writeAtomicTextFile(output, '{"safe":true}\n');

    expect(await readFile(outside, 'utf8')).toBe('outside-original\n');
    expect(await readFile(output, 'utf8')).toBe('{"safe":true}\n');
  });

  it('rejects output-directory replacement', async () => {
    const dir = await root();
    const output = join(dir, 'receipt.json');
    await import('node:fs/promises').then(({ mkdir }) => mkdir(output));

    await expect(writeAtomicTextFile(output, '{}\n')).rejects.toBeInstanceOf(SecurityIoError);
  });
});
