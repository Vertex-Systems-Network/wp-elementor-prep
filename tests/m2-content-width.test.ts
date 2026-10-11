import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const doc = (root: Record<string, unknown>): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Width',
  documentType: 'page', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [], ...root } as unknown as P15NeutralExportNode] });
const settings = (root: Record<string, unknown>) => generateElementorV3TemplateCandidate(doc(root)).template!.content[0]!.settings as Record<string, unknown>;

describe('recovery M2.10 — content width of Figma containers', () => {
  it('a flagged container writes content_width full; hand-authored IR without the flag is unchanged', () => {
    expect(settings({ fullContentWidth: true })).toEqual({ flex_direction: 'column', content_width: 'full' });
    expect(settings({})).toEqual({ flex_direction: 'column' });
    // A sized container already writes it, once, in its sizing position.
    expect(settings({ fullContentWidth: true, sizing: { widthPx: 400 } })).toEqual({ flex_direction: 'column', content_width: 'full',
      width: { unit: 'px', size: 400, sizes: [] } });
  });

  it('validates the flag and keeps it in the identity', () => {
    expect(validateP15NeutralExportDocument(doc({ fullContentWidth: false })).valid).toBe(false);
    expect(fingerprintP15NeutralExportDocument(doc({ fullContentWidth: true }))).not.toBe(fingerprintP15NeutralExportDocument(doc({})));
  });

  it('the Figma extractor flags every container it extracts', () => {
    const frame = (id: string, children: unknown[] = []) => ({ id, name: id, type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP',
      layoutPositioning: 'AUTO', itemSpacing: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN',
      counterAxisAlignItems: 'MIN', fills: [], children });
    const text = { id: 't', name: 't', type: 'TEXT', visible: true, characters: 'Hi', textAlignHorizontal: 'LEFT', fills: [] };
    const document = extractP15NeutralExportDocumentFromFigmaFrame(frame('page', [frame('section', [text])]) as unknown as FrameNode, 'page');
    const root = document.nodes[0] as unknown as { fullContentWidth?: true; children: Array<{ fullContentWidth?: true }> };
    expect(root.fullContentWidth).toBe(true);
    expect(root.children[0]!.fullContentWidth).toBe(true);
  });
});
