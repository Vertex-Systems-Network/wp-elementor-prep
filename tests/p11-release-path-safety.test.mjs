import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { assertSafeReleaseOutput, isSameOrInside } from '../scripts/release-path-safety.mjs';

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

  it('uses boundary-aware containment instead of prefix matching', () => {
    expect(isSameOrInside('/workspace/repo', '/workspace/repo/output')).toBe(true);
    expect(isSameOrInside('/workspace/repo', '/workspace/repository/output')).toBe(false);
  });
});
