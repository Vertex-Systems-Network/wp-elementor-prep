import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const manifest = JSON.parse(await readFile('manifest.template.json', 'utf8'));

describe('P14 development runtime-preview menu contract', () => {
  it('keeps the established command id while making Guided Prepare preview discoverable', () => {
    const entries = Array.isArray(manifest.menu) ? manifest.menu : [];
    const entry = entries.find((item) => item?.command === 'p13-runtime-evidence');

    expect(entry).toBeTruthy();
    expect(entry.name).toContain('P13 Runtime Evidence');
    expect(entry.name).toContain('P14 Guided Prepare Preview');
    expect(entries.filter((item) => item?.command === 'p13-runtime-evidence')).toHaveLength(1);
  });

  it('does not change the offline development network policy', () => {
    expect(manifest.networkAccess).toEqual({ allowedDomains: ['none'] });
  });
});
