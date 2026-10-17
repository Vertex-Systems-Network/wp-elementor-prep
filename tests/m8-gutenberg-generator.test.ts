import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generateGutenbergBlockMarkup, serializeGutenbergAttributes } from '../src/targets/gutenberg/block-markup-generator';
import { m8GutenbergGoldenDocument } from './fixtures/m8-gutenberg-golden';

const GOLDEN = 'tests/golden/m8-gutenberg-golden.html';

describe('recovery M8.2 — neutral IR to Gutenberg core block markup', () => {
  it('generates the golden section byte for byte (validated by the pinned WP 6.9 core validator, M8.3)', () => {
    const result = generateGutenbergBlockMarkup(m8GutenbergGoldenDocument());
    expect(result.reviews).toEqual([]);
    expect(result.status).toBe('GENERATED_LOCAL_CANDIDATE');
    if (process.env.UPDATE_GOLDEN === '1' || !existsSync(GOLDEN)) writeFileSync(GOLDEN, result.markup!);
    expect(result.markup).toBe(readFileSync(GOLDEN, 'utf8'));
    expect(result.editorValidityStatus).toBe('NOT_RUN');
    expect(result.targetCompatibilityClaim).toBe(false);
  });

  it('uses only core blocks and never an HTML/freeform fallback', () => {
    const markup = generateGutenbergBlockMarkup(m8GutenbergGoldenDocument()).markup!;
    const names = [...new Set([...markup.matchAll(/<!-- wp:([a-z-]+)/g)].map((m) => m[1]))].sort();
    expect(names).toEqual(['button', 'buttons', 'group', 'heading', 'image', 'paragraph', 'separator', 'spacer']);
    expect(markup).not.toMatch(/wp:html|wp:freeform/);
  });

  it('escapes comment attributes like WordPress serializeAttributes', () => {
    expect(serializeGutenbergAttributes({ a: '--<&>"' })).toBe('{"a":"\\u002d\\u002d\\u003c\\u0026\\u003e\\u0022"}');
  });

  it('turns facts without a core equivalent into REVIEW with no markup', () => {
    const doc = m8GutenbergGoldenDocument() as { nodes: { children: Record<string, unknown>[] }[] };
    doc.nodes[0]!.children[0]!.zIndex = 2;
    doc.nodes[0]!.children.push({ kind: 'image', sourceNodeId: 'asset', assetPath: 'assets/abc.png' });
    const result = generateGutenbergBlockMarkup(doc);
    expect(result.status).toBe('REVIEW_REQUIRED');
    expect(result.markup).toBeNull();
    expect(result.reviews.map((r) => r.reasonCode)).toEqual(['GUTENBERG_PROPERTY_UNMAPPED', 'GUTENBERG_IMAGE_ASSET_UNMAPPED']);
    expect(generateGutenbergBlockMarkup({}).status).toBe('REJECTED_INVALID_IR');
  });
});
