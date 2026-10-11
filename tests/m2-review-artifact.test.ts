import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'esbuild';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildP15ElementorExport } from '../src/targets/elementor/export-pipeline';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const doc = (...children: Record<string, unknown>[]): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Partial',
  documentType: 'page', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children } as unknown as P15NeutralExportNode] });
const text = { kind: 'text', sourceNodeId: 'copy', text: 'Hello' };
const image = { kind: 'review', sourceNodeId: '12:34', reasonCode: 'IMAGE_ASSET_EXPORT_REQUIRED', detail: 'Image needs an asset export.' };
const styled = { kind: 'text', sourceNodeId: 'styled', text: 'Faded', styleReviews: [{ reasonCode: 'LAYER_OPACITY_REQUIRES_REVIEW', detail: 'Layer opacity has no core control.' }] };

describe('recovery M2.9a — D-049 review artifact', () => {
  it('keeps template and candidate null and returns a labelled partial template listing every review item', () => {
    const result = generateElementorV3TemplateCandidate(doc(text, image, styled));
    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(result.template).toBeNull();
    expect(result.candidate).toBeNull();
    const artifact = result.reviewArtifact!;
    expect(artifact).toMatchObject({ schemaVersion: 1, artifactVersion: 'p15-elementor-review-artifact-v1', label: 'REVIEW REQUIRED',
      readiness: 'REVIEW_REQUIRED', targetImportReady: false });
    const root = artifact.template.content[0]!;
    expect(root.elements.map((element) => element.elType)).toEqual(['widget', 'container', 'widget']);
    const placeholder = root.elements[1]!;
    expect(placeholder).toMatchObject({ elType: 'container', isInner: true, elements: [], settings: {
      hide_desktop: 'hidden-desktop', hide_tablet: 'hidden-tablet', hide_mobile: 'hidden-mobile',
      css_classes: 'p15-review-placeholder p15-review-image-asset-export-required' } });
    expect(artifact.reviewItems).toEqual([
      { sourceNodeId: '12:34', reasonCode: 'IMAGE_ASSET_EXPORT_REQUIRED', detail: 'Image needs an asset export.', elementId: placeholder.id, kind: 'placeholder' },
      { sourceNodeId: 'styled', reasonCode: 'LAYER_OPACITY_REQUIRES_REVIEW', detail: 'Layer opacity has no core control.', elementId: root.elements[2]!.id, kind: 'unmapped-property' },
    ]);
    // Every review entry is listed: nothing is silently dropped.
    expect(artifact.reviewItems.length).toBe(result.reviewEntries.length);
  });

  it('a clean document has no artifact and keeps its exact candidate; bounds failures produce no artifact', () => {
    const clean = generateElementorV3TemplateCandidate(doc(text));
    expect(clean.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(clean.reviewArtifact).toBeNull();
    expect(JSON.stringify(clean.template)).not.toContain('p15-review-placeholder');
    const bounded = generateElementorV3TemplateCandidate({ ...doc(), nodes: [{ kind: 'review', sourceNodeId: 'f:p15-bounds', reasonCode: 'NODE_LIMIT_EXCEEDED', detail: 'Too many nodes.' }] });
    expect(bounded.status).toBe('REVIEW_REQUIRED');
    expect(bounded.reviewArtifact).toBeNull();
    expect(generateElementorV3TemplateCandidate({ nonsense: true }).reviewArtifact).toBeNull();
  });

  it('the pipeline passes the artifact through only for blocked generation', () => {
    expect(buildP15ElementorExport(doc(text, image))).toMatchObject({ status: 'BLOCKED_GENERATION', candidate: null, reviewArtifact: { label: 'REVIEW REQUIRED' } });
    expect(buildP15ElementorExport(doc(text)).reviewArtifact).toBeNull();
  });
});

describe('recovery M2.9a — CLI', () => {
  let dir = '';
  let cli = '';
  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), 'm2-review-artifact-'));
    cli = join(dir, 'cli.mjs');
    await build({ entryPoints: ['src/cli/index.ts'], bundle: true, platform: 'node', target: 'node20', format: 'esm', outfile: cli, logLevel: 'silent' });
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('writes the labelled review artifact, never elementor-template.json, and still exits 3', () => {
    const input = join(dir, 'ir.json');
    writeFileSync(input, JSON.stringify(doc(text, image)));
    const out = join(dir, 'out');
    const run = spawnSync(process.execPath, [cli, 'export:elementor', '--input', input, '--out', out], { encoding: 'utf8' });
    expect(run.status, run.stderr).toBe(3);
    expect(JSON.parse(run.stdout)).toMatchObject({ label: 'REVIEW REQUIRED', reviewItemCount: 1 });
    expect(existsSync(join(out, 'elementor-template.json'))).toBe(false);
    const artifact = JSON.parse(readFileSync(join(out, 'elementor-review-artifact.json'), 'utf8'));
    expect(artifact).toMatchObject({ label: 'REVIEW REQUIRED', targetImportReady: false, reviewItems: [{ reasonCode: 'IMAGE_ASSET_EXPORT_REQUIRED' }] });
    expect(JSON.parse(readFileSync(join(out, 'elementor-export-summary.json'), 'utf8')).status).toBe('BLOCKED_GENERATION');

    const summaryOnly = spawnSync(process.execPath, [cli, 'export:elementor', '--input', input, '--out', join(dir, 'none'), '--summary-only'], { encoding: 'utf8' });
    expect(summaryOnly.status).toBe(3);
    expect(existsSync(join(dir, 'none'))).toBe(false);
  });
});
