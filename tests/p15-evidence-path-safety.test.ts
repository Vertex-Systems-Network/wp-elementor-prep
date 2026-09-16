import {
  linkSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { outputAliasesAnyInput } from '../src/cli/p15-evidence-path-safety';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-evidence-path-safety-'));
  tempDirs.push(dir);
  return dir;
}

describe('P15 evidence output path safety', () => {
  it('allows a normal nonexistent output path', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'input.json');
    const out = join(dir, 'report.json');
    writeFileSync(input, 'evidence');

    expect(await outputAliasesAnyInput(out, [input])).toBe(false);
  });

  it('allows an unrelated existing output file', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'input.json');
    const out = join(dir, 'report.json');
    writeFileSync(input, 'evidence');
    writeFileSync(out, 'old-report');

    expect(await outputAliasesAnyInput(out, [input])).toBe(false);
    expect(readFileSync(input, 'utf8')).toBe('evidence');
  });

  it('detects lexical aliases after path resolution', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'input.json');
    const alias = `${dir}${sep}.${sep}input.json`;
    writeFileSync(input, 'evidence');

    expect(await outputAliasesAnyInput(alias, [input])).toBe(true);
  });

  it('detects an existing hardlink to an input file', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'input.json');
    const hardlink = join(dir, 'hardlink-report.json');
    writeFileSync(input, 'evidence');
    linkSync(input, hardlink);

    expect(await outputAliasesAnyInput(hardlink, [input])).toBe(true);
    expect(readFileSync(input, 'utf8')).toBe('evidence');
  });

  it('detects an existing symlink to an input file when the platform permits it', async () => {
    const dir = fixtureDir();
    const input = join(dir, 'input.json');
    const symlink = join(dir, 'symlink-report.json');
    writeFileSync(input, 'evidence');

    try {
      symlinkSync(input, symlink, 'file');
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === 'EPERM' || code === 'EACCES' || code === 'ENOTSUP') return;
      throw error;
    }

    expect(await outputAliasesAnyInput(symlink, [input])).toBe(true);
    expect(readFileSync(input, 'utf8')).toBe('evidence');
  });
});
