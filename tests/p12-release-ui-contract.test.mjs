import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { assertReleaseUiCapabilities, buildReleaseUi } from '../scripts/release-ui-contract.mjs';

describe('P12 publishable release UI capability contract', () => {
  it('promotes accepted Safe Fix and batch controls with a normal-user safety check', async () => {
    const developmentUi = await readFile('src/ui/ui.html', 'utf8');
    const releaseUi = buildReleaseUi(developmentUi);

    expect(releaseUi).toContain('Preview safe fixes');
    expect(releaseUi).toContain('Run safety check');
    expect(releaseUi).toContain('Run selected batch');
    expect(releaseUi).toContain("post('safe-fix-apply-request'");
    expect(releaseUi).toContain("post('safe-fix-restore-request')");
    expect(releaseUi).toContain("post('safe-fix-finalize-request')");
    expect(releaseUi).toContain("post('batch-cancel-request')");
    expect(releaseUi).toContain("post('batch-resume-request')");
    expect(releaseUi).toContain('BUILD SAFETY CHECK');
    expect(releaseUi).toContain('BATCH PREP');
  });

  it('keeps developer-only closure/calibration entrypoints out of publishable UI', async () => {
    const developmentUi = await readFile('src/ui/ui.html', 'utf8');
    const releaseUi = buildReleaseUi(developmentUi);

    for (const token of [
      'Developer:',
      'p5-runtime-evidence',
      'p6-page-flow-calibration',
      'p6-runtime-evidence',
      'p7-runtime-evidence',
      'P5 COMPILED RUNTIME SELF-TEST',
      '>Runtime self-test<',
    ]) {
      expect(releaseUi).not.toContain(token);
    }
    expect(() => assertReleaseUiCapabilities(releaseUi)).not.toThrow();
  });

  it('fails closed when an accepted production control disappears', async () => {
    const developmentUi = await readFile('src/ui/ui.html', 'utf8');
    const releaseUi = buildReleaseUi(developmentUi);
    const drifted = releaseUi.replace("post('batch-cancel-request')", "post('batch-stop-request')");

    expect(() => assertReleaseUiCapabilities(drifted)).toThrow(/required production token is missing/);
  });
});
