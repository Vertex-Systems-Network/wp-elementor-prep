import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildP15ElementorV1PreviewFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { buildP15ElementorExport } from '../src/targets/elementor/export-pipeline';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { landingPageFrame } from './fixtures/m2-landing-page';

/**
 * Recovery M2.9c golden: the landing page fixture through extraction, the coverage audit, the generator and the
 * export pipeline. Re-record only on purpose with `GOLDEN_WRITE=1 npx vitest run tests/m2-golden-landing-page.test.ts`
 * and review the diff: every change to the golden is a change to what users get.
 */
const GOLDEN = 'tests/golden/m2-landing-page.golden.json';

function snapshot() {
  const preview = buildP15ElementorV1PreviewFromFigmaFrame(landingPageFrame() as unknown as FrameNode);
  const exported = buildP15ElementorExport(preview.document);
  return {
    irFingerprint: fingerprintP15NeutralExportDocument(preview.document),
    coverageAudit: preview.coverageAudit,
    generationStatus: preview.generation.status,
    exportStatus: exported.status,
    fontManifest: exported.fontManifest,
    reviewArtifact: preview.generation.reviewArtifact,
    document: preview.document,
  };
}

describe('recovery M2.9c — golden landing page', () => {
  const current = snapshot();
  if (process.env.GOLDEN_WRITE === '1') writeFileSync(GOLDEN, `${JSON.stringify(current, null, 2)}\n`);

  it('every visible Figma node and property is mapped or listed as review (zero silent drops)', () => {
    expect(current.coverageAudit).toMatchObject({ status: 'COMPLETE', findings: [] });
    expect(current.coverageAudit.visitedNodeCount).toBe(51);
  });

  it('exports as a labelled REVIEW artifact whose only items are the genuinely unmapped ones', () => {
    expect(current.generationStatus).toBe('REVIEW_REQUIRED');
    expect(current.exportStatus).toBe('BLOCKED_GENERATION');
    expect(current.reviewArtifact?.label).toBe('REVIEW REQUIRED');
    expect(current.reviewArtifact?.reviewItems.map((item) => [item.sourceNodeId, item.reasonCode, item.kind])).toEqual([
      ['hero-secondary', 'BUTTON_DETECTION_REQUIRES_REVIEW', 'unmapped-property'],
      ['product-shot', 'IMAGE_ASSET_EXPORT_REQUIRED', 'placeholder'],
    ]);
    expect(current.fontManifest?.families.map((entry) => [entry.family, entry.source])).toEqual([['Inter', 'google']]);
  });

  it('matches the recorded golden', () => {
    expect(existsSync(GOLDEN)).toBe(true);
    expect(JSON.parse(JSON.stringify(current))).toEqual(JSON.parse(readFileSync(GOLDEN, 'utf8')));
  });
});
