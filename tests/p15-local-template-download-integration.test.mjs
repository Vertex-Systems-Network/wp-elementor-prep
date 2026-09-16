import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extendP15LocalTemplateDownloadUi } from '../scripts/p15-local-template-download-ui.mjs';

describe('P15 local Template JSON integration boundaries', () => {
  it('keeps normal preview sanitized while the explicit download path is separate', () => {
    const previewReport = readFileSync('src/plugin/p15-plugin-preview-report.ts', 'utf8');
    const controller = readFileSync('src/plugin/p15-local-template-download-controller.ts', 'utf8');
    const downloadContract = readFileSync('src/plugin/p15-local-template-download.ts', 'utf8');

    expect(previewReport).not.toContain('templateJson: string');
    expect(previewReport).not.toContain('fileDownload: true');
    expect(previewReport).toContain('fileDownload: false');
    expect(controller).toContain("type === 'p15-elementor-local-template-download-request'");
    expect(controller).toContain("type: 'p15-elementor-local-template-download-result'");
    expect(downloadContract).toContain('templateJson: string | null');
    expect(downloadContract).toContain('fileDownload: boolean');
  });

  it('re-reads the current selection for every request and does not reuse preview/client-storage state', () => {
    const controller = readFileSync('src/plugin/p15-local-template-download-controller.ts', 'utf8');
    const selectedIndex = controller.indexOf('const frame = selectedFrame();');
    const extractionIndex = controller.indexOf('buildP15ElementorV1PreviewFromFigmaFrame(frame)');
    const resultIndex = controller.indexOf('buildP15LocalTemplateDownloadResult({ id: frame.id }, extraction)');

    expect(selectedIndex).toBeGreaterThanOrEqual(0);
    expect(extractionIndex).toBeGreaterThan(selectedIndex);
    expect(resultIndex).toBeGreaterThan(extractionIndex);
    expect(controller).not.toContain('clientStorage');
    expect(controller).not.toContain('latest');
    expect(controller).not.toContain('cached');
  });

  it('loads main first and then wraps the controller without modifying the main dispatcher hot spot', () => {
    const entry = readFileSync('src/plugin/entry.ts', 'utf8');
    const build = readFileSync('scripts/build.mjs', 'utf8');
    const releaseBuild = readFileSync('scripts/build-release.mjs', 'utf8');
    const main = readFileSync('src/plugin/main.ts', 'utf8');

    expect(entry).toBe("import './main';\nimport './p15-local-template-download-controller';\n");
    expect(build).toContain("entryPoints: ['src/plugin/entry.ts']");
    expect(releaseBuild).toContain("entryPoints: ['src/plugin/entry.ts']");
    expect(main).not.toContain('p15-elementor-local-template-download-request');
  });

  it('composes the development UI deterministically with a bounded download action and authority checks', () => {
    const rawUi = readFileSync('src/ui/ui.html', 'utf8');
    const extended = extendP15LocalTemplateDownloadUi(rawUi);

    expect(rawUi).not.toContain('id="p15-download"');
    expect(extended).toContain('id="p15-download"');
    expect(extended).toContain('Download Elementor JSON');
    expect(extended).toContain("post('p15-elementor-local-template-download-request')");
    expect(extended).toContain("message.type === 'p15-elementor-local-template-download-result'");
    expect(extended).toContain('LOCAL ARTIFACT VALIDATED');
    expect(extended).toContain('TARGET IMPORT NOT VERIFIED');
    expect(extended).toContain('authority.fileDownload === true');
    expect(extended).toContain('authority.targetImport === false');
    expect(extended).toContain("authority.importValidationStatus === 'NOT_RUN'");
    expect(extended).toContain('result.templateJson = null');
  });

  it('fails closed if the known UI composition anchor drifts', () => {
    const rawUi = readFileSync('src/ui/ui.html', 'utf8');
    const drifted = rawUi.replace('Preview Elementor', 'Inspect Elementor');
    expect(() => extendP15LocalTemplateDownloadUi(drifted)).toThrow(/UI contract drifted/);
  });
});
