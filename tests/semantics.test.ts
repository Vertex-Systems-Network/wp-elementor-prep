import { describe, expect, it } from 'vitest';
import { enrichSemanticHints } from '../src/core/semantics';
import type { AuditNode, PatternDetection } from '../src/core/types';

let counter = 0;
function node(overrides: Partial<AuditNode> = {}): AuditNode {
  counter += 1;
  return {
    id: `n:${counter}`,
    name: 'Frame',
    type: 'FRAME',
    geometry: { x: 0, y: 0, width: 1000, height: 600 },
    layoutMode: 'NONE',
    isAutoLayout: false,
    isContainer: true,
    isText: false,
    isImageLike: false,
    isGenericName: false,
    textLength: 0,
    textAutoResize: null,
    absolutePositioned: false,
    clipsContent: false,
    opacity: 1,
    visible: true,
    childIds: [],
    children: [],
    ...overrides,
  };
}

function text(id: string): AuditNode {
  return node({ id, type: 'TEXT', name: 'Text', isContainer: false, isText: true, textLength: 12, children: [], childIds: [] });
}

function withChildren(parent: AuditNode, children: AuditNode[]): AuditNode {
  return { ...parent, children, childIds: children.map((child) => child.id) };
}

function detection(overrides: Partial<PatternDetection>): PatternDetection {
  return {
    pattern: 'vertical-stack',
    confidence: 80,
    targetNodeId: 'section',
    targetNodeName: 'Section',
    evidence: {},
    ...overrides,
  };
}

describe('enrichSemanticHints', () => {
  it('labels a clipped carousel target as a carousel viewport', () => {
    const viewport = node({ id: 'viewport', clipsContent: true, geometry: { x: 0, y: 200, width: 1000, height: 320 } });
    const section = withChildren(node({ id: 'section', geometry: { x: 0, y: 0, width: 1000, height: 900 } }), [viewport]);
    const result = enrichSemanticHints(section, [detection({ pattern: 'carousel-track', targetNodeId: 'viewport' })]);

    expect(result[0]?.semanticHint).toBe('carousel-viewport');
  });

  it('labels a coherent small grid as repeated cards', () => {
    const grid = node({ id: 'grid', geometry: { x: 0, y: 100, width: 1000, height: 500 } });
    const section = withChildren(node({ id: 'section', geometry: { x: 0, y: 0, width: 1000, height: 900 } }), [grid]);
    const result = enrichSemanticHints(section, [detection({
      pattern: 'grid',
      targetNodeId: 'grid',
      evidence: { itemCount: 4, widthConsistencyPct: 100, occupancyPct: 100 },
    })]);

    expect(result[0]?.semanticHint).toBe('repeated-cards');
  });

  it('labels a shallow top two-column pair as a split header', () => {
    const header = node({ id: 'header', geometry: { x: 0, y: 40, width: 1000, height: 220 } });
    const section = withChildren(node({ id: 'section', geometry: { x: 0, y: 0, width: 1000, height: 1000 } }), [header]);
    const result = enrichSemanticHints(section, [detection({ pattern: 'two-column', targetNodeId: 'header' })]);

    expect(result[0]?.semanticHint).toBe('split-header');
  });

  it('does not label a nested early chapter row as a split header', () => {
    const row = node({ id: 'chapter-row', geometry: { x: 80, y: 120, width: 840, height: 180 } });
    const chapter = withChildren(node({ id: 'chapter', geometry: { x: 0, y: 120, width: 1000, height: 600 } }), [row]);
    const section = withChildren(node({ id: 'section', geometry: { x: 0, y: 0, width: 1000, height: 4000 } }), [chapter]);
    const result = enrichSemanticHints(section, [detection({ pattern: 'two-column', targetNodeId: 'chapter-row' })]);

    expect(result[0]?.semanticHint).not.toBe('split-header');
  });

  it('labels a repeated chapter stack with nested two-column targets as timeline/chapter', () => {
    const chapterA = node({ id: 'chapter-a', geometry: { x: 0, y: 100, width: 1000, height: 300 } });
    const chapterB = node({ id: 'chapter-b', geometry: { x: 0, y: 420, width: 1000, height: 300 } });
    const chapterC = node({ id: 'chapter-c', geometry: { x: 0, y: 740, width: 1000, height: 300 } });
    const chapterD = node({ id: 'chapter-d', geometry: { x: 0, y: 1060, width: 1000, height: 300 } });
    const chapterE = node({ id: 'chapter-e', geometry: { x: 0, y: 1380, width: 1000, height: 300 } });
    const section = withChildren(node({ id: 'section', geometry: { x: 0, y: 0, width: 1000, height: 1800 } }), [chapterA, chapterB, chapterC, chapterD, chapterE]);

    const detections = [
      detection({ pattern: 'vertical-stack', targetNodeId: 'section', evidence: { itemCount: 5 } }),
      detection({ pattern: 'two-column', targetNodeId: 'chapter-a', confidence: 95 }),
      detection({ pattern: 'two-column', targetNodeId: 'chapter-b', confidence: 95 }),
      detection({ pattern: 'two-column', targetNodeId: 'chapter-c', confidence: 95 }),
    ];

    const result = enrichSemanticHints(section, detections);
    expect(result.find((item) => item.targetNodeId === 'section')?.semanticHint).toBe('timeline-chapter');
  });

  it('does not label a four-item content stack as timeline even with nested two-column regions', () => {
    const blocks = Array.from({ length: 4 }, (_, index) => node({
      id: `block-${index}`,
      geometry: { x: 0, y: index * 220, width: 1000, height: 200 },
    }));
    const section = withChildren(node({ id: 'section', geometry: { x: 0, y: 0, width: 1000, height: 900 } }), blocks);
    const detections = [
      detection({ pattern: 'vertical-stack', targetNodeId: 'section', evidence: { itemCount: 4 } }),
      detection({ pattern: 'two-column', targetNodeId: 'block-0', confidence: 95 }),
      detection({ pattern: 'two-column', targetNodeId: 'block-1', confidence: 95 }),
      detection({ pattern: 'two-column', targetNodeId: 'block-2', confidence: 95 }),
    ];

    const result = enrichSemanticHints(section, detections);
    expect(result.find((item) => item.targetNodeId === 'section')?.semanticHint).not.toBe('timeline-chapter');
  });

  it('labels a manual full-width text-rich chapter sequence as timeline/chapter', () => {
    const chapters = Array.from({ length: 5 }, (_, index) => {
      const chapter = node({
        id: `manual-${index}`,
        geometry: { x: 0, y: index * 800, width: 1000, height: 800 },
      });
      return withChildren(chapter, Array.from({ length: 6 }, (__, textIndex) => text(`manual-${index}-t${textIndex}`)));
    });
    const section = withChildren(node({ id: 'section', geometry: { x: 0, y: 0, width: 1000, height: 4000 } }), chapters);
    const result = enrichSemanticHints(section, [detection({
      pattern: 'vertical-stack',
      targetNodeId: 'section',
      evidence: { itemCount: 5 },
    })]);

    const semantic = result[0];
    expect(semantic?.semanticHint).toBe('timeline-chapter');
    expect(semantic?.evidence.semanticRule).toBe('chapter-like-full-width-stack');
  });

  it('labels a compact repeated container text-item stack as a facts list', () => {
    const facts = Array.from({ length: 6 }, (_, index) => withChildren(
      node({ id: `fact-${index}`, geometry: { x: 0, y: index * 70, width: 500, height: 70 } }),
      [text(`fact-${index}-label`), text(`fact-${index}-value`)],
    ));
    const stack = withChildren(node({ id: 'facts', geometry: { x: 0, y: 300, width: 500, height: 420 } }), facts);
    const section = withChildren(node({ id: 'section', geometry: { x: 0, y: 0, width: 1000, height: 1000 } }), [stack]);
    const result = enrichSemanticHints(section, [detection({
      pattern: 'vertical-stack',
      targetNodeId: 'facts',
      evidence: { itemCount: 6 },
    })]);

    expect(result[0]?.semanticHint).toBe('facts-list');
    expect(result[0]?.evidence.semanticFactLikePct).toBe(100);
  });

  it('does not infer facts-list from divider frames plus loose text siblings', () => {
    const dividers = Array.from({ length: 5 }, (_, index) => node({
      id: `divider-${index}`,
      geometry: { x: 600, y: 100 + index * 50, width: 350, height: 1 },
      children: [],
      childIds: [],
    }));
    const looseText = Array.from({ length: 12 }, (_, index) => text(`loose-${index}`));
    const stack = withChildren(node({ id: 'mixed-stack', geometry: { x: 0, y: 0, width: 1000, height: 500 } }), [...dividers, ...looseText]);
    const section = withChildren(node({ id: 'section', geometry: { x: 0, y: 0, width: 1000, height: 700 } }), [stack]);
    const result = enrichSemanticHints(section, [detection({
      pattern: 'vertical-stack',
      targetNodeId: 'mixed-stack',
      evidence: { itemCount: 5 },
    })]);

    expect(result[0]?.semanticHint).not.toBe('facts-list');
  });

  it('labels shallow lower text columns as footer columns but rejects the same row near the top', () => {
    const columns = Array.from({ length: 4 }, (_, index) => withChildren(
      node({ id: `col-${index}`, geometry: { x: index * 250, y: 0, width: 230, height: 60 } }),
      [text(`col-${index}-text-a`), text(`col-${index}-text-b`)],
    ));
    const footer = withChildren(node({ id: 'footer', geometry: { x: 0, y: 820, width: 1000, height: 80 } }), columns);
    const section = withChildren(node({ id: 'section', geometry: { x: 0, y: 0, width: 1000, height: 1000 } }), [footer]);
    const footerResult = enrichSemanticHints(section, [detection({
      pattern: 'horizontal-row', targetNodeId: 'footer', evidence: { itemCount: 4 },
    })]);
    expect(footerResult[0]?.semanticHint).toBe('footer-columns');

    const topRow = withChildren(node({ id: 'top-row', geometry: { x: 0, y: 100, width: 1000, height: 80 } }), columns);
    const topSection = withChildren(node({ id: 'top-section', geometry: { x: 0, y: 0, width: 1000, height: 1000 } }), [topRow]);
    const topResult = enrichSemanticHints(topSection, [detection({
      pattern: 'horizontal-row', targetNodeId: 'top-row', evidence: { itemCount: 4 },
    })]);
    expect(topResult[0]?.semanticHint).not.toBe('footer-columns');
  });

  it('does not label a tall lower three-card row as footer columns', () => {
    const cards = Array.from({ length: 3 }, (_, index) => withChildren(
      node({ id: `card-${index}`, geometry: { x: index * 330, y: 0, width: 300, height: 240 } }),
      [text(`card-${index}-title`), text(`card-${index}-body`)],
    ));
    const row = withChildren(node({ id: 'lower-cards', geometry: { x: 0, y: 700, width: 1000, height: 240 } }), cards);
    const section = withChildren(node({ id: 'section', geometry: { x: 0, y: 0, width: 1000, height: 1000 } }), [row]);
    const result = enrichSemanticHints(section, [detection({
      pattern: 'horizontal-row', targetNodeId: 'lower-cards', evidence: { itemCount: 3 },
    })]);

    expect(result[0]?.semanticHint).not.toBe('footer-columns');
  });
});