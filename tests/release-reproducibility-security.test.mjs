import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { verifyReleaseReproducibility } from '../scripts/verify-release-reproducibility.mjs';

const roots = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function pairedTrees() {
  const root = await mkdtemp(join(tmpdir(), 'release-repro-security-'));
  roots.push(root);
  const left = join(root, 'left');
  const right = join(root, 'right');
  await mkdir(join(left, 'plugin'), { recursive: true });
  await mkdir(join(right, 'plugin'), { recursive: true });
  for (const dir of [left, right]) {
    await writeFile(join(dir, 'RELEASE_INFO.json'), '{"ok":true}\n', 'utf8');
    await writeFile(join(dir, 'plugin', 'code.js'), 'same-code\n', 'utf8');
  }
  return { root, left, right };
}

describe('release reproducibility filesystem security', () => {
  it('preserves byte-identical comparison for ordinary release trees', async () => {
    const { left, right } = await pairedTrees();
    const result = await verifyReleaseReproducibility(left, right);

    expect(result.files.slice().sort()).toEqual(['plugin/code.js', 'RELEASE_INFO.json'].sort());
    expect(Object.keys(result.hashes).sort()).toEqual(result.files.slice().sort());
  });

  it.skipIf(process.platform === 'win32')('rejects a symbolic-link entry instead of silently skipping it', async () => {
    const { root, left, right } = await pairedTrees();
    const outside = join(root, 'outside.txt');
    await writeFile(outside, 'outside\n', 'utf8');
    await symlink(outside, join(left, 'linked.txt'));

    await expect(verifyReleaseReproducibility(left, right))
      .rejects.toThrow(/must not contain symbolic links/);
  });

  it.skipIf(process.platform === 'win32')('rejects a symbolic-link release root', async () => {
    const { root, left, right } = await pairedTrees();
    const leftLink = join(root, 'left-link');
    await symlink(left, leftLink, 'dir');

    await expect(verifyReleaseReproducibility(leftLink, right))
      .rejects.toThrow(/release directory must not be a symbolic link/);
  });

  it('enforces test-specific per-file and file-count ceilings', async () => {
    const { left, right } = await pairedTrees();

    await expect(verifyReleaseReproducibility(left, right, { maxFileBytes: 4 }))
      .rejects.toThrow(/per-file limit/);
    await expect(verifyReleaseReproducibility(left, right, { maxFiles: 1 }))
      .rejects.toThrow(/file limit/);
  });

  it('enforces a test-specific directory-depth ceiling', async () => {
    const { left, right } = await pairedTrees();
    for (const dir of [left, right]) {
      await mkdir(join(dir, 'deep', 'nested'), { recursive: true });
      await writeFile(join(dir, 'deep', 'nested', 'file.txt'), 'same\n', 'utf8');
    }

    await expect(verifyReleaseReproducibility(left, right, { maxDepth: 1 }))
      .rejects.toThrow(/directory nesting limit/);
  });
});
