import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { buildP15ResponsiveHarnessFixture } from '../src/cli/p15-responsive-harness-lib';

const dir = mkdtempSync(join(tmpdir(), 'm4-responsive-harness-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('recovery M4.6 — responsive real-target harness helper', () => {
  it('merges the three-breakpoint fixture without reviews and lists 15 viewport checks', async () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    try {
      await buildP15ResponsiveHarnessFixture(dir);
    } finally {
      write.mockRestore();
    }
    const expectation = JSON.parse(readFileSync(join(dir, 'responsive-expectation.json'), 'utf8'));
    expect(Object.keys(expectation.entries).sort()).toEqual(['containerWidth', 'direction', 'elementOrder', 'gap', 'textTypography', 'visibility']);
    expect(expectation.checks).toHaveLength(15);
    expect(expectation.checks.filter((check: { width: number }) => check.width === 390).map((check: { kind: string; property?: string; expected?: string; negate?: boolean }) =>
      [check.kind, check.property ?? null, check.expected ?? null, check.negate ?? null])).toEqual([
      ['style', 'flexDirection', 'column', null], ['style', 'fontSize', '32px', null], ['style', 'display', 'none', false],
      ['style', 'display', 'none', true], ['before', null, null, null]]);
    const template = JSON.parse(readFileSync(join(dir, 'responsive-template.json'), 'utf8'));
    const hero = template.content[0].elements.find((element: { settings: Record<string, unknown> }) => element.settings.flex_direction_mobile === 'column');
    expect(hero.settings).toMatchObject({ flex_direction: 'row', flex_gap_tablet: { column: '32' }, flex_gap_mobile: { column: '16' } });
    expect(readFileSync('.github/workflows/p15-real-target-proof.yml', 'utf8')).toContain('Enforce recovery responsive import and render');
  });
});
