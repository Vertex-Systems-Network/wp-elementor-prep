import { describe, expect, it } from 'vitest';
import { buildP15ElementorV1PreviewFromFigmaFrame, extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { auditP15PropertyCoverage } from '../src/plugin/p15-property-coverage-audit';
import type { P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';

const solid = (r: number, g: number, b: number) => ({ type: 'SOLID', visible: true, color: { r, g, b } });
const frame = (id: string, extra: Record<string, unknown> = {}) => ({ id, name: id, type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP',
  layoutPositioning: 'AUTO', itemSpacing: 16, paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24, primaryAxisAlignItems: 'MIN',
  counterAxisAlignItems: 'MIN', fills: [], strokes: [], effects: [], children: [], width: 400, height: 300, ...extra });
const text = (id: string, extra: Record<string, unknown> = {}) => ({ id, name: id, type: 'TEXT', visible: true, characters: id, textAlignHorizontal: 'LEFT', fills: [], ...extra });

const extract = (page: Record<string, unknown>) => extractP15NeutralExportDocumentFromFigmaFrame(page as unknown as FrameNode, 'page');
const clone = (document: P15NeutralExportDocumentV1) => JSON.parse(JSON.stringify(document)) as P15NeutralExportDocumentV1;
type Container = { children: Record<string, unknown>[] } & Record<string, unknown>;

describe('recovery M2.9b — property-coverage audit', () => {
  const page = frame('page', { fills: [solid(1, 1, 1)], children: [
    frame('card', { cornerRadius: 12, fills: [solid(0.9, 0.9, 0.9)], effects: [{ type: 'DROP_SHADOW', visible: true, blendMode: 'NORMAL', showShadowBehindNode: false,
      offset: { x: 0, y: 2 }, radius: 4, spread: 0, color: { r: 0, g: 0, b: 0, a: 0.2 } }], children: [text('title'), text('body')] }),
    frame('faded', { opacity: 0.5, children: [text('ghost')] }),
    { id: 'logo', name: 'logo', type: 'RECTANGLE', visible: true, fills: [{ type: 'IMAGE', visible: true }], width: 40, height: 40 },
  ] });

  it('a faithful extraction is COMPLETE: every property is mapped or reviewed', () => {
    const document = extract(page);
    expect(auditP15PropertyCoverage(page, document)).toEqual({ auditVersion: 'p15-property-coverage-audit-v1', status: 'COMPLETE',
      visitedNodeCount: 7, findings: [] });
  });

  it('catches a dropped node, a dropped property and a silenced review', () => {
    const document = extract(page);
    const droppedNode = clone(document);
    (droppedNode.nodes[0] as unknown as Container).children[0]!.children = [(((droppedNode.nodes[0] as unknown as Container).children[0]) as Container).children[0]];
    expect(auditP15PropertyCoverage(page, droppedNode).findings).toEqual([expect.objectContaining({ sourceNodeId: 'body', property: 'node' })]);

    const droppedShadow = clone(document);
    delete ((droppedShadow.nodes[0] as unknown as Container).children[0] as Record<string, unknown>).boxShadow;
    expect(auditP15PropertyCoverage(page, droppedShadow).findings).toEqual([expect.objectContaining({ sourceNodeId: 'card', property: 'effects' })]);

    const silenced = clone(document);
    delete ((silenced.nodes[0] as unknown as Container).children[1] as Record<string, unknown>).styleReviews;
    expect(auditP15PropertyCoverage(page, silenced)).toMatchObject({ status: 'SILENT_DROPS',
      findings: [expect.objectContaining({ sourceNodeId: 'faded', property: 'opacity' })] });
  });

  it('a review node covers its subtree; a bounds review covers the whole tree', () => {
    const manual = frame('page', { children: [frame('free', { layoutMode: 'NONE', children: [text('inside', { opacity: 0.2 })] })] });
    expect(auditP15PropertyCoverage(manual, extract(manual)).status).toBe('COMPLETE');
    const bounded: P15NeutralExportDocumentV1 = { ...extract(manual), nodes: [{ kind: 'review', sourceNodeId: 'page:p15-bounds', reasonCode: 'NODE_LIMIT_EXCEEDED', detail: 'x' }] };
    expect(auditP15PropertyCoverage(manual, bounded)).toMatchObject({ status: 'COMPLETE', visitedNodeCount: 0 });
  });

  it('checks a button label against the button typography', () => {
    const button = frame('Button', { layoutMode: 'HORIZONTAL', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20, itemSpacing: 0,
      layoutSizingHorizontal: 'HUG', layoutSizingVertical: 'HUG', fills: [solid(0, 0, 1)], children: [text('Go', { textCase: 'UPPER' })] });
    const pageWithButton = frame('page', { children: [button] });
    const document = extract(pageWithButton);
    const extracted = (document.nodes[0] as unknown as Container).children[0]!;
    expect(extracted.kind).toBe('button');
    const audit = auditP15PropertyCoverage(pageWithButton, document);
    // The mock label carries a text case but no styled segments, so the extractor could not read it: the audit says so.
    expect(audit.findings).toEqual([expect.objectContaining({ sourceNodeId: 'Button', property: 'textCase' })]);
  });

  it('the plugin preview turns a silent drop into an explicit review instead of a candidate', () => {
    const button = frame('Button', { layoutMode: 'HORIZONTAL', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20, itemSpacing: 0,
      layoutSizingHorizontal: 'HUG', layoutSizingVertical: 'HUG', fills: [solid(0, 0, 1)], children: [text('Go', { textCase: 'UPPER' })] });
    const preview = buildP15ElementorV1PreviewFromFigmaFrame(frame('page', { children: [button] }) as unknown as FrameNode);
    expect(preview.coverageAudit.status).toBe('SILENT_DROPS');
    expect(preview.validation.valid).toBe(true);
    expect(preview.generation.status).toBe('REVIEW_REQUIRED');
    expect(preview.generation.reviewEntries).toEqual([expect.objectContaining({ sourceNodeId: 'page:p15-coverage-0', reasonCode: 'SILENT_DROP_DETECTED',
      detail: expect.stringContaining('Node Button, textCase') })]);
    expect(preview.generation.reviewArtifact?.reviewItems.length).toBe(1);

    const clean = buildP15ElementorV1PreviewFromFigmaFrame(frame('page', { children: [text('Hi')] }) as unknown as FrameNode);
    expect(clean.coverageAudit.status).toBe('COMPLETE');
    expect(clean.generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
  });
});
