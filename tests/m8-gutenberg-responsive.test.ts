import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generateGutenbergBlockMarkup, planGutenbergResponsive } from '../src/targets/gutenberg/block-markup-generator';
import type { P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { m8GutenbergResponsiveDocument } from './fixtures/m8-gutenberg-golden';

const GOLDEN = 'tests/golden/m8-gutenberg-responsive.html';

describe('recovery M8.4 — Gutenberg responsive strategy', () => {
  it('a row of equally growing children that becomes a column on mobile is core/columns (stacks below 782 px)', () => {
    const { document, entries } = m8GutenbergResponsiveDocument();
    const plan = planGutenbergResponsive(document as P15NeutralExportDocumentV1, entries);
    expect(plan).toEqual({ stackOnMobile: ['cards'], reviews: [] });
    const result = generateGutenbergBlockMarkup(document, plan);
    expect(result.reviews).toEqual([]);
    if (process.env.UPDATE_GOLDEN === '1' || !existsSync(GOLDEN)) writeFileSync(GOLDEN, result.markup!);
    expect(result.markup).toBe(readFileSync(GOLDEN, 'utf8'));
    expect(result.markup).toContain('<div class="wp-block-columns are-vertically-aligned-center has-background"');
    expect(result.markup).not.toContain('"layout":{"selfStretch"');
  });

  it('per-breakpoint styles, visibility, order and tablet direction changes are REVIEW', () => {
    const { document } = m8GutenbergResponsiveDocument();
    const plan = planGutenbergResponsive(document as P15NeutralExportDocumentV1, {
      direction: [{ sourceNodeId: 'cards', tabletDirection: 'column', mobileDirection: 'column' }],
      textTypography: [{ sourceNodeId: 'c2', mobileFontSizePx: 14 }],
      visibility: [{ sourceNodeId: 'c1', hideMobile: true }],
      elementOrder: [{ sourceNodeId: 'c2', mobileOrderCustom: true, mobileOrderValue: 0 }],
      containerWidth: [{ sourceNodeId: 'cards', mobileWidthPx: 300 }],
    });
    expect(plan.stackOnMobile).toEqual([]);
    expect(plan.reviews.map((r) => r.sourceNodeId)).toEqual(['cards', 'c2', 'c1', 'c2', 'cards']);
    expect(generateGutenbergBlockMarkup(document, plan).status).toBe('REVIEW_REQUIRED');
  });

  it('a row whose children hug their content is not stacked (columns would redesign the desktop)', () => {
    const { document, entries } = m8GutenbergResponsiveDocument();
    const doc = JSON.parse(JSON.stringify(document));
    doc.nodes[0].children[0].children[1].sizing = { widthPx: 200 };
    const plan = planGutenbergResponsive(doc, entries);
    expect(plan.stackOnMobile).toEqual([]);
    expect(plan.reviews[0]!.reasonCode).toBe('GUTENBERG_RESPONSIVE_UNMAPPED');
  });
});
