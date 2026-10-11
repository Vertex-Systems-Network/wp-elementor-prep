import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extendP15LocalTemplateDownloadUi } from '../scripts/p15-local-template-download-ui.mjs';

describe('recovery M3.7 — asset-pack download in the plugin UI', () => {
  it('the UI offers the pack labelled as the manifest and says it is not ready for import', () => {
    const ui = extendP15LocalTemplateDownloadUi(readFileSync('src/ui/ui.html', 'utf8'));
    expect(ui).toContain('<button id="p15-asset-pack">Download asset pack</button>');
    expect(ui).toContain("post('p15-elementor-asset-pack-request')");
    expect(ui).toContain("message.type === 'p15-elementor-asset-pack-result'");
    expect(ui).toContain("(label === 'LOCAL CANDIDATE' || label === 'REVIEW REQUIRED')");
    expect(ui).toContain('result.targetImportReady === false');
    expect(ui).toContain('NOT READY FOR IMPORT');
    expect(ui).toContain("new Blob([bytes], { type: 'application/zip' })");
  });
});
