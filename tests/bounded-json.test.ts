import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BoundedJsonReadError, readBoundedJsonFile } from '../src/cli/bounded-json';

describe('bounded CLI JSON reader', () => {
  it('reads valid JSON within the configured byte ceiling', async () => {
    const root = mkdtempSync(join(process.cwd(), '.bounded-json-'));
    try {
      const path = join(root, 'input.json');
      writeFileSync(path, '{"ok":true}\n', 'utf8');
      await expect(readBoundedJsonFile(path, { maxBytes: 64, label: 'fixture' })).resolves.toEqual({ ok: true });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('fails closed before parsing JSON above the configured byte ceiling', async () => {
    const root = mkdtempSync(join(process.cwd(), '.bounded-json-'));
    try {
      const path = join(root, 'oversized.json');
      writeFileSync(path, JSON.stringify({ payload: 'x'.repeat(128) }), 'utf8');
      await expect(readBoundedJsonFile(path, { maxBytes: 32, label: 'fixture' })).rejects.toMatchObject({
        name: 'BoundedJsonReadError',
        kind: 'RESOURCE_LIMIT',
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects malformed UTF-8 before JSON parsing', async () => {
    const root = mkdtempSync(join(process.cwd(), '.bounded-json-'));
    try {
      const path = join(root, 'invalid-utf8.json');
      writeFileSync(path, Buffer.from([0xc3, 0x28]));
      await expect(readBoundedJsonFile(path, { maxBytes: 32, label: 'fixture' })).rejects.toMatchObject({
        name: 'BoundedJsonReadError',
        kind: 'INVALID_UTF8',
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects invalid byte-limit configuration', async () => {
    await expect(readBoundedJsonFile('unused.json', { maxBytes: 0 })).rejects.toBeInstanceOf(BoundedJsonReadError);
  });
});
