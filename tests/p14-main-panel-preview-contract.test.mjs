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
  it('exposes a dedicated reviewed Guided Prepare control with explicit internal confirmation in the normal plugin panel', () => {
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
    it('enables the R6 runtime only in development builds and hard-disables it in publishable release builds', () => {
    expect(devBuild).toContain("__P14_INTERNAL_ACTIVATION__: 'true'");
    expect(releaseBuild).toContain("__P14_INTERNAL_ACTIVATION__: 'false'");
    expect(main).toContain('if (!__P14_INTERNAL_ACTIVATION__)');
  });
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
    expect(ui).toContain('No eligible action bindings are authorized by the current production P14 recipe registry.');
    expect(ui).toContain("post('p14-guided-prepare-confirm-request')");
    expect(ui).toContain('Confirm & create prepared duplicate');
    expect(ui).toContain('requiresExplicitConfirmation === true');
    expect(ui).not.toContain("post('p14-confirmation-request')");
  });

  it('routes the main-panel request through exact current P13 evidence and the existing P14 preview model', () => {
    expect(main).toContain("from './p14-plan-preview'");
    expect(main).toContain("from './p14-preview-context'");
    expect(main).toContain("from './p14-preview-freshness'");
    expect(main).toContain('inspectLatestP13RuntimeEvidence(figma.clientStorage)');
    expect(main).toContain('const evidence = inspection.evidence');
    expect(main).toContain('Persisted P13 Build-Ready evidence was rejected (${inspection.status})');
    expect(main).toContain('Run Audit on exactly one current Frame first.');
    expect(main).toContain('assessP14PreviewContextBinding(evidence.context');
    expect(main).toContain('fileKey: currentFileKey');
    expect(main).toContain('pageId: currentPageId');
    expect(main).toContain('frameId: currentFrame.id');
    expect(main).toContain('const sourceTree = scanSceneNode(currentFrame)');
    expect(main).toContain('const currentBuildReady = buildBuildReadyReport(sourceTree)');
    expect(main).toContain('assessP14PreviewFreshness(');
    expect(main).toContain('PLUGIN_VERSION');
    expect(main).toContain('P7_BUILD_IDENTITY');
    expect(main).toContain('Run Audit on this selected Frame first.');
    expect(main).toContain('buildP14PlanPreview(evidence.buildReady, sourceTree)');
    expect(main).toContain('serializeP14PlanPreviewJson(preview)');
    expect(main).toContain("type === 'p14-plan-preview-request'");
    expect(main).toContain("type: 'p14-plan-preview-result'");
    expect(main).toContain("type: 'p14-plan-preview-unavailable'");
    expect(main).toContain('runP14RetainedDuplicateTransaction');
    expect(main).toContain('buildP14PreparationConfirmation');
    expect(main).toContain('assessP14InternalActivationSession');
    expect(main).toContain("type === 'p14-guided-prepare-confirm-request'");
    expect(main).toContain('p14ReviewedActivation = null');
  });

  it('strips the development-only preview and review-binding surfaces from the generated release UI', () => {
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
