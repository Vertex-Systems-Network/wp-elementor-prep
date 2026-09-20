import { mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { readP15UnboundedTemplateJsonInput } from '../src/cli/p15-unbounded-template-json-input';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-unbounded-template-input-test-'));
  tempDirs.push(dir);
  return dir;
}

function fail(message: string): never {
  throw new Error(message);
}

describe('P15 unbounded template JSON input path safety', () => {
  it('reads a stable regular JSON file and retains exact raw-byte identity', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'template.json');
    const raw = '{"version":"0.4","title":"Stable fixture"}\n';
    writeFileSync(input, raw);

    const snapshot = await readP15UnboundedTemplateJsonInput(input, 'template', fail);

    expect(snapshot.raw).toBe(raw);
    expect(snapshot.value).toEqual({ version: '0.4', title: 'Stable fixture' });
    expect(snapshot.resolvedPath).toBe(input);
    expect(snapshot.canonicalPath).toBe(realpathSync(input));
    expect(snapshot.file.size).toBe(Buffer.byteLength(raw));
    expect(snapshot.contentSha256).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('rejects a symbolic-link pathname instead of following its target', async () => {
    const dir = fixtureDir();
    const target = join(dir, 'target.json');
    const input = join(dir, 'template.json');
    writeFileSync(target, '{"version":"0.4"}\n');
    symlinkSync(target, input, 'file');

    await expect(readP15UnboundedTemplateJsonInput(input, 'template', fail))
      .rejects.toThrow('template input must be a regular file.');
  });

  it('keeps strict JSON parsing for ordinary regular files', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'template.json');
    writeFileSync(input, '{not-json');

    await expect(readP15UnboundedTemplateJsonInput(input, 'template', fail))
      .rejects.toThrow('template input is not valid JSON.');
  });
});
