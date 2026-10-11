import { describe, expect, it } from 'vitest';
import { buildP15ElementorPackFromFigmaFrame } from '../src/plugin/p15-elementor-pack-builder';

const vector = (id: string) => ({ id, name: id, type: 'VECTOR', visible: true, width: 24, height: 24, fills: [], strokes: [], effects: [] });
const svgExport = (label: string) => async () => new TextEncoder().encode(`<svg id="${label}"/>`);

describe('recovery M3.5 — SVG icons', () => {
  it('an icon frame and a bare vector become sized Image widgets on their SVG, with an SVG upload review', async () => {
    const icon = { id: 'icon', name: 'Arrow icon', type: 'FRAME', visible: true, width: 24, height: 24, layoutSizingHorizontal: 'FIXED',
      layoutSizingVertical: 'FIXED', fills: [], strokes: [], effects: [], children: [vector('v1'), vector('v2')], exportAsync: svgExport('icon') };
    const star = { ...vector('star'), layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED', exportAsync: svgExport('star') };
    const row = { id: 'row', name: 'row', type: 'FRAME', visible: true, layoutMode: 'HORIZONTAL', layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO',
      itemSpacing: 8, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'CENTER',
      fills: [], children: [icon, star, { id: 't', name: 't', type: 'TEXT', visible: true, characters: 'Next', textAlignHorizontal: 'LEFT', fills: [] }] };
    const { assets, preview, pack } = await buildP15ElementorPackFromFigmaFrame(row as unknown as FrameNode, { getImageByHash: () => null });
    expect(assets.assets.map((asset) => asset.assetId)).toEqual(['svg-icon', 'svg-star']);
    const children = (preview.document.nodes[0] as unknown as { children: Array<Record<string, unknown>> }).children;
    expect(children[0]).toEqual({ kind: 'image', sourceNodeId: 'icon', assetPath: 'assets/svg-icon.svg', sizing: { widthPx: 24, flex: 'fixed' }, heightPx: 24 });
    expect(children[1]).toMatchObject({ kind: 'image', assetPath: 'assets/svg-star.svg' });
    expect(preview.coverageAudit.status).toBe('COMPLETE');
    const uploads = preview.generation.reviewEntries.filter((entry) => entry.reasonCode === 'ASSET_UPLOAD_REQUIRED');
    expect(uploads.map((entry) => entry.sourceNodeId)).toEqual(['icon', 'star']);
    expect(uploads[0]!.detail).toContain('WordPress blocks SVG uploads by default');
    // Icons are decorative: no alt-text review.
    expect(pack.manifest!.reviews.some((review) => review.reasonCode === 'ASSET_ALT_TEXT_MISSING')).toBe(false);
  });

  it('without a collected SVG a vector keeps its review', async () => {
    const lone = { id: 'row', name: 'row', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO',
      itemSpacing: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN',
      fills: [], children: [vector('plain')] };
    const { preview } = await buildP15ElementorPackFromFigmaFrame(lone as unknown as FrameNode, { getImageByHash: () => null });
    expect((preview.document.nodes[0] as unknown as { children: Array<Record<string, unknown>> }).children[0]).toMatchObject({ kind: 'review' });
  });
});
