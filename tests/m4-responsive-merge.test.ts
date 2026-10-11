import { describe, expect, it } from 'vitest';
import { matchP15Breakpoint, type P15MatchNode } from '../src/core/breakpoint-matcher';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { buildP15ResponsiveMerge } from '../src/targets/elementor/responsive-merge';
import type { ElementorElementV04 } from '../src/targets/elementor/template-v04';

const doc = (nodes: P15NeutralExportNode[]): P15NeutralExportDocumentV1 =>
  ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Page', documentType: 'page', nodes });
const pad = (n: number) => ({ top: n, right: n, bottom: n, left: n });

function desktopDoc(): P15NeutralExportDocumentV1 {
  return doc([{ kind: 'container', sourceNodeId: 'd-root', direction: 'column', gapPx: 0, alignItems: 'stretch', justifyContent: 'start', paddingPx: pad(0), children: [
    { kind: 'container', sourceNodeId: 'd-hero', direction: 'row', gapPx: 48, alignItems: 'center', justifyContent: 'start', paddingPx: pad(80), children: [
      { kind: 'heading', sourceNodeId: 'd-title', text: 'Build faster', level: 'h1' },
      { kind: 'text', sourceNodeId: 'd-copy', text: 'Ship it today' },
    ] },
  ] }]);
}

function mobileDoc(overrides: Record<string, unknown> = {}): P15NeutralExportDocumentV1 {
  return doc([{ kind: 'container', sourceNodeId: 'm-root', direction: 'column', gapPx: 0, alignItems: 'stretch', justifyContent: 'start', paddingPx: pad(0), children: [
    { kind: 'container', sourceNodeId: 'm-hero', direction: 'column', gapPx: 16, alignItems: 'start', justifyContent: 'start', paddingPx: pad(24), ...overrides, children: [
      { kind: 'heading', sourceNodeId: 'm-title', text: 'Build faster', level: 'h1' },
      { kind: 'text', sourceNodeId: 'm-copy', text: 'Ship it today' },
    ] },
  ] } as P15NeutralExportNode]);
}

// Figma-shaped trees for the matcher (names and texts mirror the IR).
const tree = (prefix: string, width: number): P15MatchNode => ({ id: `${prefix}-root`, name: 'Page', type: 'FRAME', x: 0, y: 0, width, height: 800, children: [
  { id: `${prefix}-hero`, name: 'Hero', type: 'FRAME', x: 0, y: 0, width, height: 600, children: [
    { id: `${prefix}-title`, name: 'Title', type: 'TEXT', characters: 'Build faster', x: 24, y: 40, width: 300, height: 60 },
    { id: `${prefix}-copy`, name: 'Copy', type: 'TEXT', characters: 'Ship it today', x: 24, y: 120, width: 300, height: 40 },
  ] },
] });

const settingsOf = (elements: ElementorElementV04[], depth: number[]): Record<string, unknown> => {
  let node: ElementorElementV04 = elements[depth[0]!]!;
  for (const i of depth.slice(1)) node = node.elements[i]!;
  return node.settings as Record<string, unknown>;
};

describe('recovery M4.3a — responsive container layout merge', () => {
  it('writes the mobile direction, alignment, gap and padding as _mobile keys through the page composition', () => {
    const match = matchP15Breakpoint(tree('d', 1440), tree('m', 390), 'mobile');
    const result = buildP15ResponsiveMerge(desktopDoc(), [{ device: 'mobile', document: mobileDoc(), match }]);
    expect(result.status).toBe('MERGED');
    expect(result.reviews).toEqual([]);
    expect(result.entries).toEqual({
      alignment: [{ sourceNodeId: 'd-hero', mobileAlignItems: 'start' }],
      direction: [{ sourceNodeId: 'd-hero', mobileDirection: 'column' }],
      gap: [{ sourceNodeId: 'd-hero', mobileGapPx: 16 }],
      padding: [{ sourceNodeId: 'd-hero', mobilePaddingPx: pad(24) }],
    });
    const hero = settingsOf(result.composition!.template!.content, [0, 0]);
    expect(hero).toMatchObject({ flex_direction: 'row', flex_direction_mobile: 'column', flex_align_items: 'center', flex_align_items_mobile: 'flex-start' });
    expect(hero.flex_gap_mobile).toMatchObject({ column: '16', row: '16', unit: 'px' });
    expect(hero.padding_mobile).toMatchObject({ top: '24', unit: 'px' });
    expect(Object.keys(hero).some((key) => key.endsWith('_tablet'))).toBe(false);
  });

  it('merges tablet and mobile into one entry per container', () => {
    const tablet = mobileDoc({ direction: 'row', gapPx: 32, alignItems: 'center', paddingPx: pad(48) });
    const result = buildP15ResponsiveMerge(desktopDoc(), [
      { device: 'tablet', document: JSON.parse(JSON.stringify(tablet).replaceAll('"m-', '"t-')), match: matchP15Breakpoint(tree('d', 1440), tree('t', 834), 'tablet') },
      { device: 'mobile', document: mobileDoc(), match: matchP15Breakpoint(tree('d', 1440), tree('m', 390), 'mobile') },
    ]);
    expect(result.status).toBe('MERGED');
    expect(result.entries.gap).toEqual([{ sourceNodeId: 'd-hero', tabletGapPx: 32, mobileGapPx: 16 }]);
    expect(result.entries.padding).toEqual([{ sourceNodeId: 'd-hero', tabletPaddingPx: pad(48), mobilePaddingPx: pad(24) }]);
    expect(result.entries.direction).toEqual([{ sourceNodeId: 'd-hero', mobileDirection: 'column' }]);
  });

  it('does not merge what it cannot express: explicit reviews instead', () => {
    const match = matchP15Breakpoint(tree('d', 1440), tree('m', 390), 'mobile');
    const result = buildP15ResponsiveMerge(desktopDoc(), [{ device: 'mobile', document: mobileDoc({ backgroundColorHex: '#ffffff', paddingPx: undefined }), match }]);
    expect(result.status).toBe('REVIEW');
    expect(result.reviews.map((review) => [review.sourceNodeId, review.reasonCode])).toEqual([
      ['d-hero', 'RESPONSIVE_PROPERTY_NOT_MERGED'], ['d-hero', 'RESPONSIVE_VALUE_UNSET_ON_VARIANT']]);
    expect(result.entries.padding).toBeUndefined();
  });

  it('M4.3b: reordered children get the breakpoint custom order', () => {
    const m = tree('m', 390);
    const hero = m.children![0]! as unknown as { children: P15MatchNode[] };
    hero.children = [hero.children[1]!, hero.children[0]!];
    const mobile = mobileDoc();
    const mHero = mobile.nodes[0]!.kind === 'container' ? mobile.nodes[0]!.children[0]! : null;
    if (mHero?.kind === 'container') mHero.children.reverse();
    const result = buildP15ResponsiveMerge(desktopDoc(), [{ device: 'mobile', document: mobile, match: matchP15Breakpoint(tree('d', 1440), m, 'mobile') }]);
    expect(result.status).toBe('MERGED');
    expect(result.entries.elementOrder).toEqual([
      { sourceNodeId: 'd-copy', mobileOrderCustom: true, mobileOrderValue: 0 },
      { sourceNodeId: 'd-title', mobileOrderCustom: true, mobileOrderValue: 1 },
    ]);
    const heroSettings = result.composition!.template!.content[0]!.elements[0]!;
    expect(heroSettings.elements[0]!.settings).toMatchObject({ _flex_order_mobile: 'custom', _flex_order_custom_mobile: 1 });
    expect(heroSettings.elements[1]!.settings).toMatchObject({ _flex_order_mobile: 'custom', _flex_order_custom_mobile: 0 });
  });

  it('M4.3b: a desktop-only element is hidden on mobile; a mobile-only element is inserted and hidden elsewhere', () => {
    const m = tree('m', 390);
    const hero = m.children![0]! as unknown as { children: P15MatchNode[] };
    hero.children = [hero.children[0]!, { id: 'm-badge', name: 'Badge', type: 'TEXT', characters: 'New', x: 24, y: 100, width: 80, height: 20 }];
    const mobile = mobileDoc();
    const mHero = mobile.nodes[0]!.kind === 'container' ? mobile.nodes[0]!.children[0]! : null;
    if (mHero?.kind === 'container') mHero.children.splice(1, 1, { kind: 'text', sourceNodeId: 'm-badge', text: 'New' });
    const result = buildP15ResponsiveMerge(desktopDoc(), [
      { device: 'mobile', document: mobile, match: matchP15Breakpoint(tree('d', 1440), m, 'mobile') },
      { device: 'tablet', document: JSON.parse(JSON.stringify(desktopDoc()).replaceAll('"d-', '"t-')), match: matchP15Breakpoint(tree('d', 1440), tree('t', 1024), 'tablet') },
    ]);
    expect(result.status).toBe('MERGED');
    expect(result.entries.visibility).toEqual([
      { sourceNodeId: 'd-copy', hideMobile: true },
      { sourceNodeId: 'm-badge', hideDesktop: true, hideTablet: true },
    ]);
    // Inserted right after the title (its preceding matched sibling) in the desktop tree.
    const heroNode = result.document!.nodes[0]!.kind === 'container' ? result.document!.nodes[0]!.children[0]! : null;
    expect(heroNode?.kind === 'container' && heroNode.children.map((child) => child.sourceNodeId)).toEqual(['d-title', 'm-badge', 'd-copy']);
    const elements = result.composition!.template!.content[0]!.elements[0]!.elements;
    expect(elements[1]!.settings).toMatchObject({ hide_desktop: 'hidden-desktop', hide_tablet: 'hidden-tablet' });
    expect(elements[2]!.settings).toMatchObject({ hide_mobile: 'hidden-mobile' });
    expect(elements[0]!.settings).not.toHaveProperty('hide_mobile');
  });

  it('M4.3b: a variant-only root-level element cannot be placed and is a review', () => {
    const m = tree('m', 390);
    const result = buildP15ResponsiveMerge(desktopDoc(), [{ device: 'mobile',
      document: { ...mobileDoc(), nodes: [...mobileDoc().nodes, { kind: 'text', sourceNodeId: 'm-floating', text: 'x' }] },
      match: { ...matchP15Breakpoint(tree('d', 1440), m, 'mobile'), unmatchedVariant: ['m-floating'] } }]);
    expect(result.reviews.map((review) => [review.sourceNodeId, review.reasonCode])).toContainEqual(['m-floating', 'RESPONSIVE_NODE_NOT_PLACED']);
  });

  it('M4.3c: heading/text typography metrics and alignment per breakpoint', () => {
    const d = desktopDoc();
    const dHero = d.nodes[0]!.kind === 'container' ? d.nodes[0]!.children[0]! : null;
    if (dHero?.kind === 'container') {
      dHero.children[0] = { kind: 'heading', sourceNodeId: 'd-title', text: 'Build faster', level: 'h1', align: 'start', typography: { fontSizePx: 64, lineHeightPx: 72, fontWeight: '700' } };
    }
    const m = mobileDoc();
    const mHero = m.nodes[0]!.kind === 'container' ? m.nodes[0]!.children[0]! : null;
    if (mHero?.kind === 'container') {
      mHero.children[0] = { kind: 'heading', sourceNodeId: 'm-title', text: 'Build faster', level: 'h1', align: 'center', typography: { fontSizePx: 36.5, lineHeightPx: 40, fontWeight: '700' } };
    }
    const result = buildP15ResponsiveMerge(d, [{ device: 'mobile', document: m, match: matchP15Breakpoint(tree('d', 1440), tree('m', 390), 'mobile') }]);
    expect(result.status).toBe('MERGED');
    expect(result.entries.textTypography).toEqual([{ sourceNodeId: 'd-title', mobileFontSizePx: 36.5, mobileLineHeightPx: 40 }]);
    expect(result.entries.textAlignment).toEqual([{ sourceNodeId: 'd-title', mobileAlign: 'center' }]);
    const title = result.composition!.template!.content[0]!.elements[0]!.elements[0]!.settings;
    expect(title).toMatchObject({ typography_typography: 'custom', typography_font_size: { unit: 'px', size: 64, sizes: [] },
      typography_font_size_mobile: { unit: 'px', size: 36.5, sizes: [] }, typography_line_height_mobile: { unit: 'px', size: 40, sizes: [] },
      align: 'start', align_mobile: 'center' });
  });

  it('M4.3c: a different text or font family per breakpoint is a review, not a merge', () => {
    const m = mobileDoc();
    const mHero = m.nodes[0]!.kind === 'container' ? m.nodes[0]!.children[0]! : null;
    if (mHero?.kind === 'container') mHero.children[1] = { kind: 'text', sourceNodeId: 'm-copy', text: 'Ship it today', typography: { fontFamily: 'Inter' } };
    const result = buildP15ResponsiveMerge(desktopDoc(), [{ device: 'mobile', document: m, match: matchP15Breakpoint(tree('d', 1440), tree('m', 390), 'mobile') }]);
    expect(result.status).toBe('REVIEW');
    expect(result.reviews.map((review) => [review.sourceNodeId, review.reasonCode, review.detail])).toContainEqual(
      ['d-copy', 'RESPONSIVE_WIDGET_PROPERTY_NOT_MERGED', 'typography fontFamily differ on mobile.']);
  });

  it('blocks without a variant, with a duplicate device, or on a desktop base that needs review', () => {
    expect(buildP15ResponsiveMerge(desktopDoc(), []).status).toBe('BLOCKED');
    const match = matchP15Breakpoint(tree('d', 1440), tree('m', 390), 'mobile');
    expect(buildP15ResponsiveMerge(desktopDoc(), [{ device: 'mobile', document: mobileDoc(), match }, { device: 'mobile', document: mobileDoc(), match }]).status).toBe('BLOCKED');
    const reviewBase = doc([{ kind: 'image', sourceNodeId: 'd-img', assetPath: 'assets/x.png' } as P15NeutralExportNode]);
    expect(buildP15ResponsiveMerge(reviewBase, [{ device: 'mobile', document: mobileDoc(), match }]).blockReason).toContain('review-free');
  });
});
