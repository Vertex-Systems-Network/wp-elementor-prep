import { describe, expect, it } from 'vitest';
import {
  GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
  GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_DEPTH,
  GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_STRING_LENGTH,
  GUTENBERG_PARSED_BLOCK_MAX_DEPTH,
  GUTENBERG_PARSED_BLOCK_MAX_INNER_HTML_LENGTH,
  GUTENBERG_PARSED_BLOCK_MAX_NODES,
  serializeGutenbergNormalizedParsedBlockDocument,
  validateGutenbergNormalizedParsedBlockDocument,
  type GutenbergNormalizedParsedBlockDocumentV1,
  type GutenbergNormalizedParsedBlockV1,
} from '../src/targets/gutenberg/parsed-block';

function block(
  blockName: string | null,
  attrs: Record<string, unknown> = {},
  innerBlocks: GutenbergNormalizedParsedBlockV1[] = [],
  innerHTML = '',
): GutenbergNormalizedParsedBlockV1 {
  return {
    blockName,
    attrs: attrs as GutenbergNormalizedParsedBlockV1['attrs'],
    innerBlocks,
    innerHTML,
  };
}

function document(blocks: GutenbergNormalizedParsedBlockV1[]): GutenbergNormalizedParsedBlockDocumentV1 {
  return {
    schemaVersion: 1,
    contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    blocks,
  };
}

describe('P16 Gutenberg normalized parsed-block contract', () => {
  it('accepts a bounded nested normalized tree and reports stable block inventory facts', () => {
    const value = document([
      block('core/group', { layout: { type: 'constrained' } }, [
        block('core/heading', { level: 2 }, [], '<h2>Heading</h2>'),
        block('core/paragraph', { dropCap: false }, [], '<p>Body</p>'),
        block('core/image', { id: 42, sizeSlug: 'large' }, [], '<figure>Image</figure>'),
      ], '<div class="wp-block-group"></div>'),
    ]);

    const result = validateGutenbergNormalizedParsedBlockDocument(value);
    expect(result.valid).toBe(true);
    expect(result.blockCount).toBe(4);
    expect(result.namedBlockCount).toBe(4);
    expect(result.freeformBlockCount).toBe(0);
    expect(result.blockNames).toEqual(['core/group', 'core/heading', 'core/image', 'core/paragraph']);
    expect(result.issues).toEqual([]);

    const serialized = serializeGutenbergNormalizedParsedBlockDocument(value);
    expect(JSON.parse(serialized)).toEqual(value);
  });

  it('accepts top-level blockName=null as normalized freeform content but rejects nested freeform', () => {
    const topLevel = document([
      block(null, {}, [], '<p>Top-level non-block content</p>'),
      block('core/paragraph', {}, [], '<p>Named block</p>'),
    ]);
    const topLevelResult = validateGutenbergNormalizedParsedBlockDocument(topLevel);
    expect(topLevelResult.valid).toBe(true);
    expect(topLevelResult.freeformBlockCount).toBe(1);
    expect(topLevelResult.namedBlockCount).toBe(1);

    const nested = document([
      block('core/group', {}, [block(null, {}, [], 'nested freeform')]),
    ]);
    const nestedResult = validateGutenbergNormalizedParsedBlockDocument(nested);
    expect(nestedResult.valid).toBe(false);
    expect(nestedResult.issues.some((issue) => issue.code === 'P16_NESTED_FREEFORM_UNSUPPORTED')).toBe(true);
  });

  it('rejects raw parse_blocks-like extra fields rather than claiming the normalized model is the raw parser type', () => {
    const rawLike = {
      schemaVersion: 1,
      contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
      blocks: [
        {
          blockName: 'core/paragraph',
          attrs: {},
          innerBlocks: [],
          innerHTML: '<p>Body</p>',
          innerContent: ['<p>Body</p>'],
        },
      ],
    };

    const result = validateGutenbergNormalizedParsedBlockDocument(rawLike);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'P16_BLOCK_SHAPE_INVALID')).toBe(true);
  });

  it('fails closed on malformed names, attrs, children and innerHTML', () => {
    const malformed = {
      schemaVersion: 1,
      contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
      blocks: [
        {
          blockName: 'paragraph',
          attrs: [],
          innerBlocks: {},
          innerHTML: 123,
        },
        {
          blockName: 'Core/Heading',
          attrs: { okay: true },
          innerBlocks: [],
          innerHTML: '',
        },
      ],
    };

    const result = validateGutenbergNormalizedParsedBlockDocument(malformed);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'P16_BLOCK_NAME_INVALID')).toBe(true);
    expect(result.issues.some((issue) => issue.code === 'P16_ATTRIBUTES_INVALID')).toBe(true);
    expect(result.issues.some((issue) => issue.code === 'P16_INNER_BLOCKS_INVALID')).toBe(true);
    expect(result.issues.some((issue) => issue.code === 'P16_INNER_HTML_INVALID')).toBe(true);
  });

  it('rejects non-JSON, cyclic and non-finite attribute values', () => {
    const cycle: Record<string, unknown> = {};
    cycle.self = cycle;
    const value = document([
      block('core/paragraph', {
        undefinedValue: undefined,
        nonFinite: Number.POSITIVE_INFINITY,
        cyclic: cycle,
      }),
    ]);

    const result = validateGutenbergNormalizedParsedBlockDocument(value);
    expect(result.valid).toBe(false);
    expect(result.issues.filter((issue) => issue.code === 'P16_ATTRIBUTE_VALUE_INVALID').length).toBeGreaterThanOrEqual(3);
  });

  it('enforces bounded block nesting depth', () => {
    let nested = block('core/paragraph');
    for (let index = 0; index < GUTENBERG_PARSED_BLOCK_MAX_DEPTH; index += 1) {
      nested = block('core/group', {}, [nested]);
    }

    const result = validateGutenbergNormalizedParsedBlockDocument(document([nested]));
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'P16_DEPTH_LIMIT_EXCEEDED')).toBe(true);
  });

  it('enforces the total block-node limit', () => {
    const blocks = Array.from(
      { length: GUTENBERG_PARSED_BLOCK_MAX_NODES + 1 },
      () => block('core/paragraph'),
    );
    const result = validateGutenbergNormalizedParsedBlockDocument(document(blocks));
    expect(result.valid).toBe(false);
    expect(result.blockCount).toBe(GUTENBERG_PARSED_BLOCK_MAX_NODES);
    expect(result.issues.some((issue) => issue.code === 'P16_BLOCK_LIMIT_EXCEEDED')).toBe(true);
  });

  it('enforces innerHTML and attribute string limits', () => {
    const value = document([
      block(
        'core/paragraph',
        { oversized: 'a'.repeat(GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_STRING_LENGTH + 1) },
        [],
        'h'.repeat(GUTENBERG_PARSED_BLOCK_MAX_INNER_HTML_LENGTH + 1),
      ),
    ]);
    const result = validateGutenbergNormalizedParsedBlockDocument(value);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'P16_ATTRIBUTE_STRING_LIMIT_EXCEEDED')).toBe(true);
    expect(result.issues.some((issue) => issue.code === 'P16_INNER_HTML_LIMIT_EXCEEDED')).toBe(true);
  });

  it('enforces bounded attribute nesting depth', () => {
    let nested: unknown = 'leaf';
    for (let index = 0; index <= GUTENBERG_PARSED_BLOCK_MAX_ATTRIBUTE_DEPTH; index += 1) {
      nested = { child: nested };
    }
    const result = validateGutenbergNormalizedParsedBlockDocument(
      document([block('core/paragraph', { nested })]),
    );
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'P16_ATTRIBUTE_DEPTH_LIMIT_EXCEEDED')).toBe(true);
  });
});
