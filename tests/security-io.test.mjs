import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  SecurityIoError,
  readBoundedContainedFile,
  readBoundedContainedJsonFile,
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

  it('reads contained files and returns a root-relative canonical path', async () => {
    const dir = await root();
    const declared = join(dir, 'declared');
    await mkdir(declared);
    await writeFile(join(declared, 'input.json'), '{"ok":true}\n', 'utf8');

    await expect(readBoundedContainedJsonFile(declared, 'input.json', {
      label: 'contained fixture',
      maxBytes: 64,
      maxDepth: 8,
      maxValues: 32,
    })).resolves.toMatchObject({
      value: { ok: true },
      relativePath: 'input.json',
    });
  });

  it('rejects traversal and absolute references outside a declared root', async () => {
    const dir = await root();
    const declared = join(dir, 'declared');
    await mkdir(declared);
    const outside = join(dir, 'outside.txt');
    await writeFile(outside, 'outside\n', 'utf8');

    await expect(readBoundedContainedFile(declared, '../outside.txt', { label: 'traversal fixture' }))
      .rejects.toMatchObject({ name: 'SecurityIoError', kind: 'PATH_ESCAPE' });
    await expect(readBoundedContainedFile(declared, outside, { label: 'absolute fixture' }))
      .rejects.toMatchObject({ name: 'SecurityIoError', kind: 'PATH_ESCAPE' });
  });

  it.skipIf(process.platform === 'win32')('rejects final symlinks and parent-symlink escapes', async () => {
    const dir = await root();
    const declared = join(dir, 'declared');
    const outsideDir = join(dir, 'outside');
    await mkdir(declared);
    await mkdir(outsideDir);
    await writeFile(join(outsideDir, 'secret.txt'), 'secret\n', 'utf8');

    await symlink(join(outsideDir, 'secret.txt'), join(declared, 'final-link.txt'));
    await expect(readBoundedContainedFile(declared, 'final-link.txt', { label: 'final link' }))
      .rejects.toMatchObject({ name: 'SecurityIoError', kind: 'UNSAFE_INPUT' });

    await symlink(outsideDir, join(declared, 'parent-link'));
    await expect(readBoundedContainedFile(declared, 'parent-link/secret.txt', { label: 'parent link' }))
      .rejects.toMatchObject({ name: 'SecurityIoError', kind: 'PATH_ESCAPE' });
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
