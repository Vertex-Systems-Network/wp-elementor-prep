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

  it('labels a repeated chapter stack with nested two-column targets as timeline/chapter', () => {
    const chapterA = node({ id: 'chapter-a', geometry: { x: 0, y: 100, width: 1000, height: 300 } });
    const chapterB = node({ id: 'chapter-b', geometry: { x: 0, y: 420, width: 1000, height: 300 } });
    const chapterC = node({ id: 'chapter-c', geometry: { x: 0, y: 740, width: 1000, height: 300 } });
    const section = withChildren(node({ id: 'section', geometry: { x: 0, y: 0, width: 1000, height: 1200 } }), [chapterA, chapterB, chapterC, node({ id: 'chapter-d' })]);

    const detections = [
      detection({ pattern: 'vertical-stack', targetNodeId: 'section', evidence: { itemCount: 4 } }),
      detection({ pattern: 'two-column', targetNodeId: 'chapter-a', confidence: 95 }),
      detection({ pattern: 'two-column', targetNodeId: 'chapter-b', confidence: 95 }),
      detection({ pattern: 'two-column', targetNodeId: 'chapter-c', confidence: 95 }),
    ];

    const result = enrichSemanticHints(section, detections);
    expect(result.find((item) => item.targetNodeId === 'section')?.semanticHint).toBe('timeline-chapter');
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
});
