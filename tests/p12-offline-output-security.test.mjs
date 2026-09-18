import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('P12 offline evidence output security', () => {
  it('routes the caller-selected report path through the atomic safe-output boundary', async () => {
    const source = await readFile('scripts/p12-offline-acceptance.mjs', 'utf8');

    expect(source).toContain("import { writeAtomicTextFile } from './security-io.mjs';");
    expect(source).toContain('await writeAtomicTextFile(reportPath');
    expect(source).not.toContain('writeFile(reportPath');
  });
});
