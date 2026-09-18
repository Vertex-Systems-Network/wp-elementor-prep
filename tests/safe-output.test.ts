import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { prepareSafeOutputDirectory, SafeOutputError, writeAtomicOutputFile } from '../src/cli/safe-output';

describe('safe CLI output writer', () => {
  it('writes the requested report bytes into a canonical output directory', async () => {
    const root = mkdtempSync(join(process.cwd(), '.safe-output-'));
    try {
      const outDir = await prepareSafeOutputDirectory(join(root, 'reports'));
      await writeAtomicOutputFile(outDir, 'audit-report.json', '{"ok":true}\n');
      expect(readFileSync(join(outDir, 'audit-report.json'), 'utf8')).toBe('{"ok":true}\n');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.skipIf(process.platform === 'win32')('replaces an existing symlink without modifying its target', async () => {
    const root = mkdtempSync(join(process.cwd(), '.safe-output-'));
    try {
      const outDir = await prepareSafeOutputDirectory(join(root, 'reports'));
      const outside = join(root, 'outside.txt');
      writeFileSync(outside, 'outside-original\n', 'utf8');
      symlinkSync(outside, join(outDir, 'audit-report.json'));

      await writeAtomicOutputFile(outDir, 'audit-report.json', '{"safe":true}\n');

      expect(readFileSync(outside, 'utf8')).toBe('outside-original\n');
      expect(readFileSync(join(outDir, 'audit-report.json'), 'utf8')).toBe('{"safe":true}\n');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('refuses to replace a directory at a report filename', async () => {
    const root = mkdtempSync(join(process.cwd(), '.safe-output-'));
    try {
      const outDir = await prepareSafeOutputDirectory(join(root, 'reports'));
      mkdirSync(join(outDir, 'backlog.json'));

      await expect(writeAtomicOutputFile(outDir, 'backlog.json', '{}\n')).rejects.toBeInstanceOf(SafeOutputError);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects output filenames containing path traversal', async () => {
    const root = mkdtempSync(join(process.cwd(), '.safe-output-'));
    try {
      const outDir = await prepareSafeOutputDirectory(join(root, 'reports'));
      await expect(writeAtomicOutputFile(outDir, '../outside.json', '{}\n')).rejects.toBeInstanceOf(SafeOutputError);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
