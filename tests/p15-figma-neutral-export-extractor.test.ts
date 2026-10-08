import { describe, expect, it } from 'vitest';
import {
  P15_NEUTRAL_EXPORT_MAX_DEPTH,
  P15_NEUTRAL_EXPORT_MAX_NODES,
} from '../src/targets/elementor/neutral-export-ir';
import {
  buildP15ElementorV1PreviewFromFigmaFrame,
  extractP15NeutralExportDocumentFromFigmaFrame,
} from '../src/plugin/p15-neutral-export-extractor';

type MockNode = Record<string, unknown> & {
  id: string;
  name: string;
  type: string;
  visible: boolean;
};

function textNode(id: string, characters: string, extra: Record<string, unknown> = {}): MockNode {
  return {
    id,
    name: id,
    type: 'TEXT',
    visible: true,
    characters,
    textAlignHorizontal: 'LEFT',
    fills: [],
    ...extra,
  };
}

function autoFrame(
  id: string,
  children: MockNode[],
  extra: Record<string, unknown> = {},
): MockNode {
  return {
    id,
    name: id,
    type: 'FRAME',
    visible: true,
    layoutMode: 'VERTICAL',
    layoutWrap: 'NO_WRAP',
    layoutPositioning: 'AUTO',
    itemSpacing: 16,
    paddingTop: 24,
    paddingRight: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: 'MIN',
    fills: [],
    children,
    ...extra,
  };
}

function asFrame(node: MockNode): FrameNode {
  return node as unknown as FrameNode;
}

describe('P15 read-only Figma neutral export extractor', () => {
  it('extracts supported Auto Layout + plain text and generates a deterministic text-editor candidate', () => {
    const selected = autoFrame('page', [
      autoFrame('row', [
        textNode('copy', '<Launch> & learn\nSafely', { textAlignHorizontal: 'CENTER' }),
      ], {
        layoutMode: 'HORIZONTAL',
        itemSpacing: 20,
        paddingTop: 12,
        paddingRight: 16,
        paddingBottom: 12,
        paddingLeft: 16,
        primaryAxisAlignItems: 'SPACE_BETWEEN',
        counterAxisAlignItems: 'CENTER',
      }),
    ]);

    const first = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(selected));
    const second = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(selected));

    expect(first.readOnly).toBe(true);
    expect(first.validation.valid).toBe(true);
    expect(first.validation.reviewNodeCount).toBe(0);
    expect(first.generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(first.generation.targetCompatibilityClaim).toBe(false);
    expect(first.generation.productionAcceptance).toBe(false);
    expect(first.generation.downloadEnabled).toBe(false);
    expect(first.generation.importValidationStatus).toBe('NOT_RUN');
    expect(first.generation.template).toEqual(second.generation.template);

    const root = first.generation.template?.content[0];
    const row = root?.elements[0];
    const widget = row?.elements[0];
    expect(root).toEqual(expect.objectContaining({
      elType: 'container',
      settings: expect.objectContaining({ flex_direction: 'column' }),
    }));
    expect(row).toEqual(expect.objectContaining({
      elType: 'container',
      settings: expect.objectContaining({
        flex_direction: 'row',
        flex_gap: { column: '20', row: '20', isLinked: true, unit: 'px' },
        flex_align_items: 'center',
        flex_justify_content: 'space-between',
      }),
    }));
    expect(widget).toEqual(expect.objectContaining({
      elType: 'widget',
      widgetType: 'text-editor',
      settings: {
        editor: '<p>&lt;Launch&gt; &amp; learn<br>Safely</p>',
        align: 'center',
      },
    }));
  });

  it('does not guess heading semantics from Figma layer names', () => {
    const selected = autoFrame('page', [
      textNode('hero-title', 'Looks like a heading', { name: 'H1 Hero Heading' }),
    ]);
    const result = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(selected));
    const root = result.generation.template?.content[0];
    const widget = root?.elements[0];
    expect(widget?.elType).toBe('widget');
    if (widget?.elType !== 'widget') throw new Error('fixture invariant');
    expect(widget.widgetType).toBe('text-editor');
  });

  it('returns REVIEW_REQUIRED for manual layout instead of guessing geometry', () => {
    const selected = autoFrame('manual', [textNode('copy', 'Text')], { layoutMode: 'NONE' });
    const result = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(selected));

    expect(result.validation.valid).toBe(true);
    expect(result.generation.status).toBe('REVIEW_REQUIRED');
    expect(result.generation.template).toBeNull();
    expect(result.generation.reviewEntries[0]).toEqual(expect.objectContaining({
      sourceNodeId: 'manual',
      reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW',
    }));
  });

  it('fails closed for absolute-positioned and image-backed children with no partial candidate', () => {
    const selected = autoFrame('page', [
      textNode('absolute-copy', 'Overlay', { layoutPositioning: 'ABSOLUTE' }),
      {
        id: 'photo',
        name: 'photo',
        type: 'RECTANGLE',
        visible: true,
        layoutPositioning: 'AUTO',
        fills: [{ type: 'IMAGE', visible: true, imageHash: 'fake-hash', scaleMode: 'FILL' }],
      },
    ]);
    const result = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(selected));

    expect(result.validation.reviewNodeCount).toBe(2);
    expect(result.generation.status).toBe('REVIEW_REQUIRED');
    expect(result.generation.template).toBeNull();
    expect(result.generation.candidate).toBeNull();
    expect(result.generation.reviewEntries.map((entry) => entry.reasonCode)).toEqual([
      'ABSOLUTE_POSITION_REQUIRES_REVIEW',
      'IMAGE_ASSET_EXPORT_REQUIRED',
    ]);
  });

  it('fails closed for wrapped/grid/unsupported alignment states', () => {
    const wrapped = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(autoFrame('wrapped', [], { layoutWrap: 'WRAP' })));
    const grid = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(autoFrame('grid', [], { layoutMode: 'GRID' })));
    const baseline = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(autoFrame('baseline', [], { counterAxisAlignItems: 'BASELINE' })));

    expect(wrapped.generation.reviewEntries[0]?.reasonCode).toBe('WRAPPED_AUTO_LAYOUT_REQUIRES_REVIEW');
    expect(grid.generation.reviewEntries[0]?.reasonCode).toBe('GRID_LAYOUT_REQUIRES_REVIEW');
    expect(baseline.generation.reviewEntries[0]?.reasonCode).toBe('UNSUPPORTED_AUTO_LAYOUT_ALIGNMENT');
  });

  it('collapses over-depth source trees into one bounded review marker before recursive overflow', () => {
    let current = textNode('leaf', 'Leaf');
    for (let depth = P15_NEUTRAL_EXPORT_MAX_DEPTH + 2; depth >= 1; depth -= 1) {
      current = autoFrame(`depth-${depth}`, [current]);
    }
    const document = extractP15NeutralExportDocumentFromFigmaFrame(asFrame(current));
    const result = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(current));

    expect(document.nodes).toEqual([
      expect.objectContaining({
        sourceNodeId: `${current.id}:p15-bounds`,
        kind: 'review',
        reasonCode: 'DEPTH_LIMIT_EXCEEDED',
      }),
    ]);
    expect(result.validation.valid).toBe(true);
    expect(result.validation.nodeCount).toBe(1);
    expect(result.generation.status).toBe('REVIEW_REQUIRED');
    expect(result.generation.template).toBeNull();
  });

  it('collapses over-node-limit source trees into one bounded review marker', () => {
    const children = Array.from({ length: P15_NEUTRAL_EXPORT_MAX_NODES }, (_, index) => (
      textNode(`copy-${index}`, `Text ${index}`)
    ));
    const selected = autoFrame('node-heavy', children);
    const document = extractP15NeutralExportDocumentFromFigmaFrame(asFrame(selected));
    const result = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(selected));

    expect(document.nodes).toEqual([
      expect.objectContaining({
        sourceNodeId: 'node-heavy:p15-bounds',
        kind: 'review',
        reasonCode: 'NODE_LIMIT_EXCEEDED',
      }),
    ]);
    expect(result.validation.valid).toBe(true);
    expect(result.validation.nodeCount).toBe(1);
    expect(result.generation.status).toBe('REVIEW_REQUIRED');
    expect(result.generation.template).toBeNull();
  });

  it('rejects out-of-range spacing via a review marker instead of silently clamping', () => {
    const selected = autoFrame('page', [textNode('copy', 'Text')], { itemSpacing: 50_000 });
    const result = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(selected));
    expect(result.generation.status).toBe('REVIEW_REQUIRED');
    expect(result.generation.reviewEntries[0]?.reasonCode).toBe('SPACING_OUT_OF_RANGE');
  });
});

describe('recovery M0.3 — image-backed containers keep their subtree', () => {
  const imageFill = [{ type: 'IMAGE', visible: true, imageHash: 'fake-hash', scaleMode: 'FILL' }];

  it('extracts the container and every child instead of collapsing the subtree into one review node', () => {
    const selected = autoFrame('page', [
      autoFrame('hero', [
        textNode('hero-title', 'Welcome'),
        textNode('hero-copy', 'Body copy'),
      ], { fills: imageFill }),
    ]);
    const document = extractP15NeutralExportDocumentFromFigmaFrame(asFrame(selected));
    const page = document.nodes[0];
    expect(page?.kind).toBe('container');
    const hero = page?.kind === 'container' ? page.children[0] : undefined;
    expect(hero).toEqual(expect.objectContaining({
      kind: 'container',
      sourceNodeId: 'hero',
      styleReviews: [expect.objectContaining({ reasonCode: 'CONTAINER_BACKGROUND_IMAGE_REQUIRES_REVIEW' })],
    }));
    expect(hero?.kind === 'container' ? hero.children.map((child) => child.sourceNodeId) : []).toEqual(['hero-title', 'hero-copy']);

    const result = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(selected));
    expect(result.validation.valid).toBe(true);
    expect(result.generation.status).toBe('REVIEW_REQUIRED');
    expect(result.generation.template).toBeNull();
    expect(result.generation.reviewEntries).toEqual([
      expect.objectContaining({ sourceNodeId: 'hero', reasonCode: 'CONTAINER_BACKGROUND_IMAGE_REQUIRES_REVIEW' }),
    ]);
  });

  it('surfaces child reviews inside an image-backed container instead of hiding them', () => {
    const selected = autoFrame('page', [
      autoFrame('card', [textNode('badge', 'New', { layoutPositioning: 'ABSOLUTE' })], { fills: imageFill }),
    ]);
    const result = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(selected));
    expect(result.generation.reviewEntries.map((entry) => `${entry.sourceNodeId}:${entry.reasonCode}`)).toEqual([
      'card:CONTAINER_BACKGROUND_IMAGE_REQUIRES_REVIEW',
      'badge:ABSOLUTE_POSITION_REQUIRES_REVIEW',
    ]);
  });

  it('keeps leaf image fills and image-filled text as node-level asset reviews', () => {
    const selected = autoFrame('page', [
      { id: 'photo', name: 'photo', type: 'RECTANGLE', visible: true, layoutPositioning: 'AUTO', fills: imageFill },
      textNode('image-text', 'Texture', { fills: imageFill }),
    ]);
    const result = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(selected));
    expect(result.generation.reviewEntries.map((entry) => `${entry.sourceNodeId}:${entry.reasonCode}`)).toEqual([
      'photo:IMAGE_ASSET_EXPORT_REQUIRED',
      'image-text:IMAGE_ASSET_EXPORT_REQUIRED',
    ]);
  });
});

describe('recovery M0.4 — no silent drop of unmapped visual facts', () => {
  function reasons(selected: MockNode): string[] {
    const result = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(selected));
    expect(result.validation.valid).toBe(true);
    return result.generation.reviewEntries.map((entry) => `${entry.sourceNodeId}:${entry.reasonCode}`);
  }

  it('reports every unmapped container visual fact as REVIEW while keeping the subtree', () => {
    const card = autoFrame('card', [textNode('card-title', 'Card')], {
      strokes: [{ type: 'SOLID', visible: true, color: { r: 0, g: 0, b: 0 } }],
      strokeWeight: 1,
      effects: [{ type: 'DROP_SHADOW', visible: true }, { type: 'LAYER_BLUR', visible: true }],
      opacity: 0.8,
      blendMode: 'MULTIPLY',
      rotation: 5,
      isMask: true,
      clipsContent: true,
      width: 100,
      height: 100,
    });
    (card.children as MockNode[])[0]!.x = 0;
    Object.assign((card.children as MockNode[])[0]!, { y: 0, width: 140, height: 20 });
    expect(reasons(autoFrame('page', [card]))).toEqual([
      'card:STROKE_REQUIRES_REVIEW',
      'card:EFFECT_REQUIRES_REVIEW',
      'card:LAYER_OPACITY_REQUIRES_REVIEW',
      'card:BLEND_MODE_REQUIRES_REVIEW',
      'card:ROTATION_REQUIRES_REVIEW',
      'card:MASK_REQUIRES_REVIEW',
      'card:CLIPPED_OVERFLOW_REQUIRES_REVIEW',
    ]);
    const document = extractP15NeutralExportDocumentFromFigmaFrame(asFrame(autoFrame('page', [card])));
    const page = document.nodes[0];
    const extractedCard = page?.kind === 'container' ? page.children[0] : undefined;
    expect(extractedCard?.kind === 'container' ? extractedCard.children.map((child) => child.sourceNodeId) : []).toEqual(['card-title']);
  });

  it('reports unmapped text visual facts on the text node and keeps its content', () => {
    const shadowed = textNode('shadowed', 'Glow', {
      effects: [{ type: 'DROP_SHADOW', visible: true }],
      strokes: [{ type: 'SOLID', visible: true }],
      strokeWeight: 2,
      opacity: 0.5,
    });
    expect(reasons(autoFrame('page', [shadowed]))).toEqual([
      'shadowed:STROKE_REQUIRES_REVIEW',
      'shadowed:EFFECT_REQUIRES_REVIEW',
      'shadowed:LAYER_OPACITY_REQUIRES_REVIEW',
    ]);
    const document = extractP15NeutralExportDocumentFromFigmaFrame(asFrame(autoFrame('page', [shadowed])));
    const page = document.nodes[0];
    expect(page?.kind === 'container' ? page.children[0] : undefined).toEqual(expect.objectContaining({ kind: 'text', text: 'Glow' }));
  });

  it('does not flag default, hidden or zero-weight facts and in-bounds clipping', () => {
    const plain = autoFrame('page', [
      textNode('copy', 'Copy', { opacity: 1, blendMode: 'PASS_THROUGH', rotation: 0, x: 0, y: 0, width: 50, height: 20 }),
    ], {
      strokes: [{ type: 'SOLID', visible: true }],
      strokeWeight: 0,
      effects: [{ type: 'DROP_SHADOW', visible: false }],
      clipsContent: true,
      width: 100,
      height: 100,
      opacity: 1,
      blendMode: 'PASS_THROUGH',
    });
    const result = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(plain));
    expect(result.generation.reviewEntries).toEqual([]);
    expect(result.generation.template).not.toBeNull();
  });
});
