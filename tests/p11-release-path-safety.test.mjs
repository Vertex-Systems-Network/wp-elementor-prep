import { mkdir, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assertSafeReleaseOutput, assertSafeReleaseOutputOnDisk, isSameOrInside } from '../scripts/release-path-safety.mjs';

const repo = '/workspace/wp-elementor-prep';

describe('P11 release output path safety', () => {
  it('allows generated release directories inside the repository', () => {
    expect(assertSafeReleaseOutput('dist-release', repo)).toBe(resolve(repo, 'dist-release'));
    expect(assertSafeReleaseOutput('artifacts/p11-release', repo)).toBe(resolve(repo, 'artifacts/p11-release'));
  });

  it('allows a sibling output directory outside the repository', () => {
    expect(assertSafeReleaseOutput('../wp-elementor-prep-release', repo)).toBe('/workspace/wp-elementor-prep-release');
  });

  it('rejects repository root and ancestors', () => {
    expect(() => assertSafeReleaseOutput('.', repo)).toThrow(/repository root or one of its ancestors/);
    expect(() => assertSafeReleaseOutput('..', repo)).toThrow(/repository root or one of its ancestors/);
    expect(() => assertSafeReleaseOutput('/', repo)).toThrow(/repository root or one of its ancestors/);
  });

  it('rejects protected source, metadata and dependency locations', () => {
    for (const path of ['src', 'src/generated', 'scripts/tmp', 'config/release', 'docs/output', 'community/output', 'memory-bank/out', '.github/out', '.git/out', 'node_modules/out']) {
      expect(() => assertSafeReleaseOutput(path, repo)).toThrow(/overlaps protected repository directory/);
    }

    for (const path of ['package.json', 'package-lock.json', 'README.md', 'manifest.release.template.json']) {
      expect(() => assertSafeReleaseOutput(path, repo)).toThrow(/overlaps protected repository file/);
    }
  });

  it('allows a normal on-disk release directory under a safe parent', async () => {
    const root = await mkdtemp(join(tmpdir(), 'release-path-safe-'));
    const repoRoot = join(root, 'repo');
    try {
      await mkdir(join(repoRoot, 'src'), { recursive: true });
      await mkdir(join(repoRoot, 'artifacts'), { recursive: true });
      await expect(assertSafeReleaseOutputOnDisk('artifacts/release', repoRoot))
        .resolves.toBe(resolve(repoRoot, 'artifacts/release'));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it.skipIf(process.platform === 'win32')('rejects a symlinked output parent that resolves into protected source', async () => {
    const root = await mkdtemp(join(tmpdir(), 'release-path-symlink-'));
    const repoRoot = join(root, 'repo');
    try {
      await mkdir(join(repoRoot, 'src'), { recursive: true });
      await symlink(join(repoRoot, 'src'), join(repoRoot, 'artifacts'));
      await expect(assertSafeReleaseOutputOnDisk('artifacts/release', repoRoot))
        .rejects.toThrow(/protected repository directory src/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it.skipIf(process.platform === 'win32')('rejects a lexical sibling whose parent symlink resolves back into protected source', async () => {
    const root = await mkdtemp(join(tmpdir(), 'release-path-sibling-'));
    const repoRoot = join(root, 'repo');
    try {
      await mkdir(join(repoRoot, 'src'), { recursive: true });
      await symlink(join(repoRoot, 'src'), join(root, 'shared-output'));
      await expect(assertSafeReleaseOutputOnDisk('../shared-output/release', repoRoot))
        .rejects.toThrow(/protected repository directory src/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('uses boundary-aware containment instead of prefix matching', () => {
    expect(isSameOrInside('/workspace/repo', '/workspace/repo/output')).toBe(true);
    expect(isSameOrInside('/workspace/repo', '/workspace/repository/output')).toBe(false);
  });
});
