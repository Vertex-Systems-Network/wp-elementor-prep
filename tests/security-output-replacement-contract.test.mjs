import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const cliWriter = readFileSync('src/cli/safe-output.ts', 'utf8');
const scriptWriter = readFileSync('scripts/security-io.mjs', 'utf8');

describe('security output replacement contract', () => {
  it('never creates an unlink-to-rename replacement gap in the CLI writer', () => {
    expect(cliWriter).toContain('await rename(tempPath, target);');
    expect(cliWriter).not.toContain('await rm(target');
  });

  it('never creates an unlink-to-rename replacement gap in the scripts writer', () => {
    expect(scriptWriter).toContain('await rename(tempPath, target);');
    expect(scriptWriter).not.toContain('await rm(target');
  });
});
