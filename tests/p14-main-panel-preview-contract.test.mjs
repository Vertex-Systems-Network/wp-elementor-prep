import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { buildReleaseUi } from '../scripts/release-ui-contract.mjs';

const [ui, main, devBuild, releaseBuild] = await Promise.all([
  readFile(new URL('../src/ui/ui.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/plugin/main.ts', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-release.mjs', import.meta.url), 'utf8'),
]);
const generatedReleaseUi = buildReleaseUi(ui);

describe('P14 main-panel Guided Prepare preview contract', () => {
  it('exposes a reviewed Guided Prepare control with explicit internal confirmation', () => {
    expect(ui).toContain('id="p14-preview"');
    expect(ui).toContain('Preview Guided Prepare');
    expect(ui).toContain("post('p14-plan-preview-request')");
    expect(ui).toContain("message.type === 'p14-plan-preview-result'");
    expect(ui).toContain("message.type === 'p14-plan-preview-unavailable'");
    expect(ui).toContain('P14 GUIDED PREPARE PREVIEW');
    expect(ui).toContain('READ-ONLY / LOCKED');
    expect(ui).toContain('acceptanceAuthority=false');
    expect(ui).toContain('targetCompatibilityClaim=false');
    expect(ui).toContain('mutationEnabled=false');
    expect(ui).toContain('confirmationEnabled=false');
  });

  it('keeps the review artifact non-authorizing while adding a separate explicit confirmation control', () => {
    expect(ui).toContain('const reviewManifest = preview.reviewManifest || null');
    expect(ui).toContain('Proposed Change Review Binding');
    expect(ui).toContain('READ-ONLY REVIEW ARTIFACT');
    expect(ui).toContain('P13 run:');
    expect(ui).toContain('Source node:');
    expect(ui).toContain('Source fingerprint:');
    expect(ui).toContain('Eligible action IDs:');
    expect(ui).toContain('Eligible reviewed actions');
    expect(ui).toContain('validation ${escapeHtml(action.validationProfileId)}');
    expect(ui).toContain("post('p14-guided-prepare-confirm-request')");
    expect(ui).toContain('Confirm & create prepared duplicate');
    expect(ui).toContain('requiresExplicitConfirmation === true');
    expect(ui).not.toContain("post('p14-confirmation-request')");
  });

  it('recomputes exact current evidence before confirmed retained-duplicate execution', () => {
    expect(main).toContain("from './p14-plan-preview'");
    expect(main).toContain("from './p14-preview-context'");
    expect(main).toContain("from './p14-preview-freshness'");
    expect(main).toContain("from './p14-internal-activation'");
    expect(main).toContain('inspectLatestP13RuntimeEvidence(figma.clientStorage)');
    expect(main).toContain('const sourceTree = scanSceneNode(currentFrame)');
    expect(main).toContain('const currentBuildReady = buildBuildReadyReport(sourceTree)');
    expect(main).toContain('assessP14PreviewFreshness(');
    expect(main).toContain('buildP14PlanPreview(evidence.buildReady, sourceTree)');
    expect(main).toContain('buildP14InternalActivationSession');
    expect(main).toContain('assessP14InternalActivationSession');
    expect(main).toContain('buildP14PreparationConfirmation');
    expect(main).toContain('runP14RetainedDuplicateTransaction');
    expect(main).toContain('new FigmaP14VerticalStackRetainedDuplicateAdapter()');
    expect(main).toContain("type === 'p14-guided-prepare-confirm-request'");
    expect(main).toContain('p14ReviewedActivation = null');
  });

  it('enables R6 only in development builds and hard-disables it in publishable release builds', () => {
    expect(devBuild).toContain("__P14_INTERNAL_ACTIVATION__: 'true'");
    expect(releaseBuild).toContain("__P14_INTERNAL_ACTIVATION__: 'false'");
    expect(main).toContain('if (!__P14_INTERNAL_ACTIVATION__)');
  });

  it('strips all P14 review and activation surfaces from the generated release UI', () => {
    expect(generatedReleaseUi).not.toContain('p14-plan-preview-request');
    expect(generatedReleaseUi).not.toContain('Preview Guided Prepare');
    expect(generatedReleaseUi).not.toContain('P14 GUIDED PREPARE PREVIEW');
    expect(generatedReleaseUi).not.toContain('renderP14PlanPreview');
    expect(generatedReleaseUi).not.toContain('Proposed Change Review Binding');
    expect(generatedReleaseUi).not.toContain('READ-ONLY REVIEW ARTIFACT');
    expect(generatedReleaseUi).not.toContain('Eligible reviewed actions');
    expect(generatedReleaseUi).not.toContain('p14-guided-prepare-confirm-request');
    expect(generatedReleaseUi).not.toContain('Confirm & create prepared duplicate');
    expect(generatedReleaseUi).not.toContain('P14 INTERNAL GUIDED PREPARE RESULT');
  });
});
