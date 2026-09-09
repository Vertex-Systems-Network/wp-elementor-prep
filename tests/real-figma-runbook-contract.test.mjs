import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const runbookPath = fileURLToPath(new URL('../docs/REAL_FIGMA_ACCEPTANCE_RUNBOOK.md', import.meta.url));
const runbook = readFileSync(runbookPath, 'utf8');

describe('real Figma acceptance runbook closure contract', () => {
  it('requires current-main runtime closure intake for P5, P6 and P7', () => {
    expect(runbook).toContain('npm run runtime:closure-intake -- p5');
    expect(runbook).toContain('npm run runtime:closure-intake -- p6');
    expect(runbook).toContain('npm run runtime:closure-intake -- p7');
    expect(runbook).toContain('Runtime closure intake: PASS');
  });

  it('does not allow a direct packaged verifier run to authorize merge or issue closure', () => {
    expect(runbook).toContain('directly invoking it is not the normative final closure boundary');
    expect(runbook).toContain('A direct packaged-verifier run may be used only as an optional local diagnostic');
    expect(runbook).toContain('A direct artifact verifier invocation alone is insufficient');
  });

  it('requires fresh P6 and P7 artifacts to be registered for final closure', () => {
    expect(runbook).toContain('fresh P6 artifact in current `main`');
    expect(runbook).toContain('fresh P7 artifact in current `main`');
    expect(runbook.match(/`finalClosureEligible: true`/g)).toHaveLength(2);
    expect(runbook).toContain('schema-v3 id-excluded manifest semantic SHA-256');
  });

  it('preserves the non-nested local import safety contract', () => {
    expect(runbook).toContain('node prepare-figma-import.mjs <your-figma-plugin-id> . ../figma-plugin-dist-488-local');
    expect(runbook).toContain('source artifact directory and prepared output directory must not overlap');
    expect(runbook).toContain('previously documented `. dist-local` nested-output form is invalid');
  });
});
