import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const [ui, main, releaseUi] = await Promise.all([
  readFile(new URL('../src/ui/ui.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/plugin/main.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/ui/release-ui.html', import.meta.url), 'utf8'),
]);

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

  it('routes the main-panel request through persisted P13 evidence and the existing P14 preview model', () => {
    expect(main).toContain("from './p14-plan-preview'");
    expect(main).toContain('loadLatestP13RuntimeEvidence(figma.clientStorage)');
    expect(main).toContain('buildP14PlanPreview(evidence.buildReady)');
    expect(main).toContain('serializeP14PlanPreviewJson(preview)');
    expect(main).toContain("type === 'p14-plan-preview-request'");
    expect(main).toContain("type: 'p14-plan-preview-result'");
    expect(main).toContain("type: 'p14-plan-preview-unavailable'");
    expect(main).not.toContain('runP14RetainedDuplicateTransaction');
    expect(main).not.toContain('buildP14PreparationConfirmation');
  });

  it('does not leak the development-only preview control into the release UI surface', () => {
    expect(releaseUi).not.toContain('p14-plan-preview-request');
    expect(releaseUi).not.toContain('Preview Guided Prepare');
  });
});
