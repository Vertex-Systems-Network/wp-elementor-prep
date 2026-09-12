import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { buildReleaseUi } from '../scripts/release-ui-contract.mjs';

const [ui, main] = await Promise.all([
  readFile(new URL('../src/ui/ui.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/plugin/main.ts', import.meta.url), 'utf8'),
]);
const generatedReleaseUi = buildReleaseUi(ui);

describe('P14 main-panel Guided Prepare preview contract', () => {
  it('exposes a dedicated read-only Guided Prepare preview control in the normal plugin panel', () => {
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

  it('renders the exact proposed-change review binding without adding confirmation controls', () => {
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
    expect(ui).not.toContain("post('p14-confirmation-request')");
    expect(ui).not.toContain('Approve Guided Prepare');
    expect(ui).not.toContain('Confirm Guided Prepare');
  });

  it('routes the main-panel request through exact current P13 evidence and the existing P14 preview model', () => {
    expect(main).toContain("from './p14-plan-preview'");
    expect(main).toContain("from './p14-preview-context'");
    expect(main).toContain("from './p14-preview-freshness'");
    expect(main).toContain('loadLatestP13RuntimeEvidence(figma.clientStorage)');
    expect(main).toContain('assessP14PreviewContextBinding(evidence.context');
    expect(main).toContain('fileKey: currentFileKey');
    expect(main).toContain('pageId: currentPageId');
    expect(main).toContain('frameId: currentFrame.id');
    expect(main).toContain('buildBuildReadyReport(scanSceneNode(currentFrame))');
    expect(main).toContain('assessP14PreviewFreshness(');
    expect(main).toContain('PLUGIN_VERSION');
    expect(main).toContain('P7_BUILD_IDENTITY');
    expect(main).toContain('Run Audit on this selected Frame first.');
    expect(main).toContain('buildP14PlanPreview(evidence.buildReady)');
    expect(main).toContain('serializeP14PlanPreviewJson(preview)');
    expect(main).toContain("type === 'p14-plan-preview-request'");
    expect(main).toContain("type: 'p14-plan-preview-result'");
    expect(main).toContain("type: 'p14-plan-preview-unavailable'");
    expect(main).not.toContain('runP14RetainedDuplicateTransaction');
    expect(main).not.toContain('buildP14PreparationConfirmation');
  });

  it('strips the development-only preview and review-binding surfaces from the generated release UI', () => {
    expect(generatedReleaseUi).not.toContain('p14-plan-preview-request');
    expect(generatedReleaseUi).not.toContain('Preview Guided Prepare');
    expect(generatedReleaseUi).not.toContain('P14 GUIDED PREPARE PREVIEW');
    expect(generatedReleaseUi).not.toContain('renderP14PlanPreview');
    expect(generatedReleaseUi).not.toContain('Proposed Change Review Binding');
    expect(generatedReleaseUi).not.toContain('READ-ONLY REVIEW ARTIFACT');
    expect(generatedReleaseUi).not.toContain('Eligible reviewed actions');
  });
});
