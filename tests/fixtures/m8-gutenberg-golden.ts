/** Recovery M8 golden IR: every fact the Gutenberg adapter maps, in one hand-authored section (no Figma file). */
export function m8GutenbergGoldenDocument(): unknown {
  return {
    schemaVersion: 1, irVersion: 'p15-neutral-export-ir-v2', title: 'M8 golden', documentType: 'page',
    nodes: [{
      kind: 'container', sourceNodeId: 'page', direction: 'column', fullContentWidth: true, sizing: { widthPx: 1440 }, children: [
        {
          kind: 'container', sourceNodeId: 'hero', direction: 'column', gapPx: 16, paddingPx: { top: 40, right: 24, bottom: 40, left: 24 },
          alignItems: 'center', justifyContent: 'start', backgroundColorHex: '#112233', cornerRadiusPx: 8,
          border: { style: 'solid', widthPx: { top: 2, right: 2, bottom: 2, left: 2 }, colorHex: '#778899' }, sizing: { minHeightPx: 300 },
          boxShadow: { xPx: 0, yPx: 4, blurPx: 12, spreadPx: 0, colorHex: '#000000', alpha: 0.25 },
          children: [
            { kind: 'heading', sourceNodeId: 'title', text: 'Welcome & <hello>', level: 'h1', align: 'center',
              typography: { fontFamily: 'Inter', fontWeight: '700', fontSizePx: 48, lineHeightPx: 56, colorHex: '#ffffff' } },
            { kind: 'heading', sourceNodeId: 'subtitle', text: 'Second level', level: 'h2', href: 'https://example.com/more' },
            { kind: 'text', sourceNodeId: 'copy', text: 'Body\ncopy -- with a break', align: 'start',
              typography: { fontSizePx: 16, lineHeightPx: 24, letterSpacingPx: 1, textTransform: 'uppercase', fontStyle: 'italic', textDecoration: 'underline', colorHex: '#abcdef' } },
            { kind: 'divider', sourceNodeId: 'rule', weightPx: 1, colorHex: '#cccccc' },
          ],
        },
        {
          kind: 'container', sourceNodeId: 'actions', direction: 'row', justifyContent: 'space-between', alignItems: 'center', gapPx: 12,
          gradient: { type: 'linear', colorA: '#ff0000', colorB: '#0000ff', stopA: 0, stopB: 100, angleDeg: 90 },
          cornerRadiiPx: { topLeft: 1, topRight: 2, bottomRight: 3, bottomLeft: 4 },
          children: [
            { kind: 'button', sourceNodeId: 'cta', text: 'Start', url: 'https://example.com/start?a=1&b=2', openInNewTab: true, backgroundColorHex: '#FF0000',
              typography: { fontSizePx: 14, fontWeight: '600', colorHex: '#ffffff' }, paddingPx: { top: 12, right: 24, bottom: 12, left: 24 }, cornerRadiusPx: 4 },
            { kind: 'text', sourceNodeId: 'note', text: 'Grows', sizing: { flex: 'grow' } },
            { kind: 'heading', sourceNodeId: 'label', text: 'Hug', level: 'h3', sizing: { widthPx: 80 } },
          ],
        },
        {
          kind: 'container', sourceNodeId: 'chips', direction: 'row', gapPx: 8, wrap: { rowGapPx: 6, alignContent: 'start' },
          children: [{ kind: 'text', sourceNodeId: 'chip-1', text: 'One' }, { kind: 'text', sourceNodeId: 'chip-2', text: 'Two' }],
        },
        {
          kind: 'container', sourceNodeId: 'features', direction: 'row', paddingPx: { top: 80, right: 80, bottom: 80, left: 80 },
          grid: { columns: [{ unit: 'fr', value: 1 }, { unit: 'fr', value: 1 }, { unit: 'fr', value: 1 }], rows: [{ unit: 'fr', value: 1 }], columnGapPx: 32, rowGapPx: 24 },
          children: [{ kind: 'text', sourceNodeId: 'f1', text: 'A' }, { kind: 'text', sourceNodeId: 'f2', text: 'B' }, { kind: 'text', sourceNodeId: 'f3', text: 'C' }],
        },
        { kind: 'image', sourceNodeId: 'shot', url: 'https://example.com/a.png', sizing: { widthPx: 300 }, heightPx: 200, objectFit: 'cover' },
        { kind: 'spacer', sourceNodeId: 'gap', heightPx: 32 },
      ],
    }],
  };
}

/** Recovery M8.4: a row of equally growing cards that stacks on mobile, plus the matching M4 merge entries. */
export function m8GutenbergResponsiveDocument(): { document: unknown; entries: Record<string, Record<string, unknown>[]> } {
  return {
    document: {
      schemaVersion: 1, irVersion: 'p15-neutral-export-ir-v2', title: 'M8 responsive', documentType: 'page',
      nodes: [{
        kind: 'container', sourceNodeId: 'page', direction: 'column', fullContentWidth: true, sizing: { widthPx: 1440 }, children: [{
          kind: 'container', sourceNodeId: 'cards', direction: 'row', gapPx: 48, alignItems: 'center', backgroundColorHex: '#EEEEEE',
          paddingPx: { top: 40, right: 40, bottom: 40, left: 40 },
          children: [
            { kind: 'container', sourceNodeId: 'card-1', direction: 'column', sizing: { flex: 'grow' }, children: [{ kind: 'heading', sourceNodeId: 'c1', text: 'One', level: 'h3' }] },
            { kind: 'text', sourceNodeId: 'c2', text: 'Two', sizing: { fillWidth: true } },
          ],
        }],
      }],
    },
    entries: {
      containerWidth: [{ sourceNodeId: 'page', tabletWidthPx: 1024, mobileWidthPx: 390 }],
      direction: [{ sourceNodeId: 'cards', mobileDirection: 'column' }],
    },
  };
}
