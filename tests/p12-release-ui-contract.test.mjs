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

  it('retains the bounded read-only P15 Elementor preview while stripping development-only P14 preview surfaces', async () => {
    const developmentUi = await readFile('src/ui/ui.html', 'utf8');
    const releaseUi = buildReleaseUi(developmentUi);

    expect(releaseUi).toContain('id="p15-preview"');
    expect(releaseUi).toContain("post('p15-elementor-preview-request')");
    expect(releaseUi).toContain("message.type === 'p15-elementor-preview-result'");
    expect(releaseUi).toContain('function renderP15ElementorPreview(message)');
    expect(releaseUi).toContain('P15 ELEMENTOR LOCAL PREVIEW');
    expect(releaseUi).toContain('targetCompatibilityClaim=false · productionAcceptance=false · downloadEnabled=false · importValidationStatus=NOT_RUN');

    expect(releaseUi).not.toContain('id="p14-preview"');
    expect(releaseUi).not.toContain('p14-plan-preview-request');
    expect(releaseUi).not.toContain('function renderP14PlanPreview(message)');
    expect(releaseUi).not.toContain('P14 GUIDED PREPARE PREVIEW');
    expect(releaseUi).not.toContain('p14-guided-prepare-review.json');

    expect(releaseUi).not.toContain('export-p15');
    expect(releaseUi).not.toContain("downloadText('elementor");
    expect(releaseUi).not.toContain('templateJson');
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
