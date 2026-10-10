import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'esbuild';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildP15ElementorExport, serializeP15ElementorExportSummary } from '../src/targets/elementor/export-pipeline';
import { composeP15ElementorPage, P15_PAGE_COMPOSITION_VERSION } from '../src/targets/elementor/page-composition';
import { P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION } from '../src/targets/elementor/responsive-gap-resolution';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';

const source = (): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'PRIVATE PAGE',
  documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'row', gapPx: 24, children: [
    { kind: 'text', sourceNodeId: 'copy', text: 'PRIVATE COPY' }] }] });
const FLAGS = { responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false, responsiveClosureClaim: false,
  targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false };
function pageManifest(document: P15NeutralExportDocumentV1, tabletGapPx = 12) {
  const common = { schemaVersion: 1, sourceIrFingerprint: fingerprintP15NeutralExportDocument(document),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generateElementorV3TemplateCandidate(document).candidate!).digest, ...FLAGS };
  return { ...common, compositionVersion: P15_PAGE_COMPOSITION_VERSION, families: {
    gap: { ...common, manifestVersion: P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION, containers: [{ sourceNodeId: 'root', tabletGapPx }] } } };
}

describe('recovery M1.6 — one Elementor export pipeline', () => {
  it('without a page manifest the export is exactly the generated base candidate', () => {
    const document = source();
    const result = buildP15ElementorExport(document);
    const generation = generateElementorV3TemplateCandidate(document);
    expect(result.status).toBe('BASE_CANDIDATE');
    expect(result.generation).toEqual(generation);
    expect(result.template).toEqual(generation.template);
    expect(result.candidate?.templateJson).toBe(generation.candidate?.templateJson);
    expect(result.composition).toBeNull();
  });

  it('with a page manifest the export is exactly the page composition', () => {
    const document = source();
    const result = buildP15ElementorExport(document, pageManifest(document));
    const composition = composeP15ElementorPage(document, pageManifest(document));
    expect(result.status).toBe('COMPOSED_CANDIDATE');
    expect(result.template).toEqual(composition.template);
    expect(result.candidateIdentityDigest).toBe(composition.resolvedCandidateIdentityDigest);
    expect(JSON.stringify(result.template)).toContain('flex_gap_tablet');
  });

  it('a refused composition or a REVIEW source yields no candidate, and the summary stays sanitized', () => {
    const document = source();
    const rejected = buildP15ElementorExport(document, { ...pageManifest(document), downloadEnabled: true });
    expect(rejected.status).toBe('REJECTED_COMPOSITION');
    expect(rejected.candidate).toBeNull();
    const review = source();
    (review.nodes[0] as { children: unknown[] }).children.push({ kind: 'review', sourceNodeId: 'r', reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW', detail: 'x' });
    expect(buildP15ElementorExport(review).status).toBe('BLOCKED_GENERATION');
    const summary = serializeP15ElementorExportSummary(buildP15ElementorExport(document, pageManifest(document)));
    expect(summary).not.toContain('PRIVATE');
    expect(() => serializeP15ElementorExportSummary({ ...rejected, targetCompatibilityClaim: true } as never)).toThrow();
  });

  it('the plugin preview/download extractor goes through the shared pipeline', () => {
    const extractor = readFileSync('src/plugin/p15-neutral-export-extractor.ts', 'utf8');
    expect(extractor).toContain('buildP15ElementorExport(document).generation');
    expect(extractor).not.toContain('generateElementorV3TemplateCandidate(');
  });
});

describe('recovery M1.6 — bundles', () => {
  let dir = '';
  let cli = '';
  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), 'm1-export-pipeline-'));
    cli = join(dir, 'cli.mjs');
    await build({ entryPoints: ['src/cli/index.ts'], bundle: true, platform: 'node', target: 'node20', format: 'esm', outfile: cli, logLevel: 'silent' });
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('the plugin bundle contains the mapping engine and the page composition', async () => {
    const bundled = await build({ entryPoints: ['src/plugin/entry.ts'], bundle: true, write: false, platform: 'browser', target: 'es2017', logLevel: 'silent' });
    const code = bundled.outputFiles[0]!.text;
    expect(code).toContain(P15_PAGE_COMPOSITION_VERSION);
    expect(code).toContain('p15-elementor-export-pipeline-v1');
  });

  it('CLI export:elementor writes the template only for a ready candidate', () => {
    const document = source();
    const input = join(dir, 'ir.json');
    const manifest = join(dir, 'page.json');
    writeFileSync(input, JSON.stringify(document));
    writeFileSync(manifest, JSON.stringify(pageManifest(document)));
    const out = join(dir, 'out');
    const run = spawnSync(process.execPath, [cli, 'export:elementor', '--input', input, '--page-manifest', manifest, '--out', out], { encoding: 'utf8' });
    expect(run.status, run.stderr).toBe(0);
    const template = readFileSync(join(out, 'elementor-template.json'), 'utf8');
    expect(template).toBe(buildP15ElementorExport(document, pageManifest(document)).candidate?.templateJson);
    expect(JSON.parse(readFileSync(join(out, 'elementor-export-summary.json'), 'utf8')).status).toBe('COMPOSED_CANDIDATE');

    writeFileSync(manifest, JSON.stringify({ ...pageManifest(document), productionAcceptance: true }));
    const blockedOut = join(dir, 'blocked');
    const blocked = spawnSync(process.execPath, [cli, 'export:elementor', '--input', input, '--page-manifest', manifest, '--out', blockedOut], { encoding: 'utf8' });
    expect(blocked.status).toBe(3);
    expect(JSON.parse(blocked.stdout).status).toBe('REJECTED_COMPOSITION');
    expect(existsSync(join(blockedOut, 'elementor-template.json'))).toBe(false);
  });
});
