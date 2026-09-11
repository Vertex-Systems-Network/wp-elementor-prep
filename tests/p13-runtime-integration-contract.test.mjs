import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

async function source(path) {
  return readFile(path, 'utf8');
}

describe('P13 runtime evidence plugin integration contract', () => {
  it('captures bounded P13 evidence from the same successful audit result', async () => {
    const main = await source('src/plugin/main.ts');
    expect(main).toContain("import { buildP13RuntimeEvidenceBundle } from './p13-runtime-evidence';");
    expect(main).toContain('const p13RuntimeEvidence = buildP13RuntimeEvidenceBundle({');
    expect(main).toContain('build: P7_BUILD_IDENTITY,');
    expect(main).toContain('audit: report,');
    expect(main).toContain('buildReady,');
    expect(main).toContain('persistP13RuntimeEvidenceBestEffort(');
    expect(main).toContain('p13RuntimeEvidencePersisted: p13RuntimeEvidencePersistence.persisted');
  });

  it('exposes the evidence viewer only through the developer manifest, not the release menu', async () => {
    const [developmentManifest, releaseManifest, main] = await Promise.all([
      source('manifest.template.json'),
      source('manifest.release.template.json'),
      source('src/plugin/main.ts'),
    ]);
    expect(developmentManifest).toContain('Developer: P13 Runtime Evidence');
    expect(developmentManifest).toContain('p13-runtime-evidence');
    expect(releaseManifest).not.toContain('p13-runtime-evidence');
    expect(main).toContain("figma.command === 'p13-runtime-evidence'");
    expect(main).toContain('runP13RuntimeEvidenceViewer()');
  });

  it('retains the network-free development manifest boundary', async () => {
    const developmentManifest = JSON.parse(await source('manifest.template.json'));
    expect(developmentManifest.networkAccess.allowedDomains).toEqual(['none']);
  });
});
