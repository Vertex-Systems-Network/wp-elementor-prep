import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const mainSource = readFileSync(new URL('../src/plugin/main.ts', import.meta.url), 'utf8');

describe('P7 embedded P5 proof entrypoint contract', () => {
  it('routes proof minting through the deterministic acceptance updater', () => {
    expect(mainSource).toContain('updateP5RuntimeProofFromCalibration');
    expect(mainSource).not.toContain('createP5RuntimeProof');
  });

  it('does not gate runtime proof directly on the top-level self-test passed flag', () => {
    expect(mainSource).not.toMatch(/if\s*\(\s*result\.passed\s*\)/);
    expect(mainSource).toContain('acceptance.accepted && proof.valid');
  });

  it('persists and exposes bounded P5 prerequisite closure evidence', () => {
    expect(mainSource).toContain('buildP5RuntimeEvidenceBundle');
    expect(mainSource).toContain('persistP5RuntimeEvidenceBestEffort');
    expect(mainSource).toContain("figma.command === 'p5-runtime-evidence'");
  });
});
