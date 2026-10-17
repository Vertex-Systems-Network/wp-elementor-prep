import type {
  P15NeutralContainerNode,
  P15NeutralExportDocumentV1,
  P15NeutralExportNode,
  P15NeutralTypography,
} from './neutral-export-ir';

/**
 * IR → plain-CSS reference page (recovery M7.2). An Elementor-independent rendering of the same neutral IR, used as the
 * round-trip reference wherever no Figma reference bundle (M7.1) exists, e.g. in CI. It is labelled
 * `IR_CSS_REFERENCE` in every report and never stands in for a Figma render.
 *
 * Bounded: containers (flex direction, gap, padding, alignment, solid background, uniform radius, border, width,
 * min height), headings and text with typography, buttons and images as sized boxes. Anything else renders as an
 * empty block and is listed in `unrendered`, so the report shows where the reference itself is approximate.
 */
export const P15_IR_CSS_REFERENCE_VERSION = 'p15-ir-css-reference-v1' as const;

export interface P15IrCssReference {
  version: typeof P15_IR_CSS_REFERENCE_VERSION;
  html: string;
  /** Every node below the page container (source node ids, document order); the round-trip report compares these boxes. */
  sectionIds: string[];
  unrendered: { sourceNodeId: string; fact: string }[];
}

const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const escapeAttr = escapeHtml;
const FLEX: Record<string, string> = {
  start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch',
  'space-between': 'space-between', 'space-around': 'space-around', 'space-evenly': 'space-evenly',
};
const TEXT_ALIGN: Record<string, string> = { start: 'left', center: 'center', end: 'right', justify: 'justify' };

function css(rules: Record<string, string | number | undefined>): string {
  return Object.entries(rules)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}:${typeof value === 'number' ? `${value}px` : value}`)
    .join(';');
}

function typography(t: P15NeutralTypography | undefined): Record<string, string | number | undefined> {
  if (!t) return {};
  return {
    'font-family': t.fontFamily === undefined ? undefined : `"${t.fontFamily.replace(/"/g, '')}"`,
    'font-weight': t.fontWeight,
    'font-style': t.fontStyle,
    'font-size': t.fontSizePx,
    'line-height': t.lineHeightPx,
    'letter-spacing': t.letterSpacingPx,
    'text-transform': t.textTransform,
    'text-decoration': t.textDecoration,
    color: t.colorHex,
  };
}

const CONTAINER_UNRENDERED = ['cornerRadiiPx', 'backgroundImage', 'gradient', 'boxShadow', 'wrap', 'grid', 'marginPx', 'position'] as const;

function node(item: P15NeutralExportNode, unrendered: P15IrCssReference['unrendered']): string {
  const source = `data-source="${escapeAttr(item.sourceNodeId)}"`;
  switch (item.kind) {
    case 'container': return container(item, unrendered);
    case 'heading':
    case 'text':
      return `<div ${source} style="${css({ margin: 0, 'white-space': 'pre-wrap', 'text-align': item.align ? TEXT_ALIGN[item.align] : undefined, width: item.sizing?.widthPx, ...typography(item.typography) })}">${escapeHtml(item.text)}</div>`;
    case 'button':
      return `<div ${source} style="${css({ display: 'inline-block', 'align-self': 'flex-start', background: item.backgroundColorHex, 'border-radius': item.cornerRadiusPx,
        padding: item.paddingPx ? `${item.paddingPx.top}px ${item.paddingPx.right}px ${item.paddingPx.bottom}px ${item.paddingPx.left}px` : undefined, ...typography(item.typography) })}">${escapeHtml(item.text)}</div>`;
    case 'image':
      unrendered.push({ sourceNodeId: item.sourceNodeId, fact: 'image pixels (box only)' });
      return `<div ${source} style="${css({ width: item.sizing?.widthPx, height: item.heightPx })}"></div>`;
    case 'spacer':
      return `<div ${source} style="${css({ height: item.heightPx })}"></div>`;
    case 'divider':
      return `<div ${source} style="${css({ height: 0, 'border-top': `${item.weightPx}px solid ${item.colorHex}`, width: item.widthPx })}"></div>`;
    default:
      unrendered.push({ sourceNodeId: item.sourceNodeId, fact: item.kind });
      return `<div ${source}></div>`;
  }
}

function container(item: P15NeutralContainerNode, unrendered: P15IrCssReference['unrendered']): string {
  for (const fact of CONTAINER_UNRENDERED) if (item[fact] !== undefined) unrendered.push({ sourceNodeId: item.sourceNodeId, fact });
  const pad = item.paddingPx;
  const style = css({
    display: 'flex',
    'flex-direction': item.direction,
    gap: item.gapPx,
    padding: pad ? `${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px` : undefined,
    'align-items': item.alignItems ? FLEX[item.alignItems] : undefined,
    'justify-content': item.justifyContent ? FLEX[item.justifyContent] : undefined,
    background: item.backgroundColorHex,
    'border-radius': item.cornerRadiusPx,
    border: item.border ? `${item.border.widthPx.top}px solid ${item.border.colorHex}` : undefined,
    overflow: item.clipsContent ? 'hidden' : undefined,
    width: item.sizing?.widthPx,
    'min-height': item.sizing?.minHeightPx,
    'box-sizing': 'border-box',
  });
  return `<div data-source="${escapeAttr(item.sourceNodeId)}" style="${style}">${item.children.map((child) => node(child, unrendered)).join('')}</div>`;
}

export function buildP15IrCssReference(document: P15NeutralExportDocumentV1, widthPx: number): P15IrCssReference {
  const unrendered: P15IrCssReference['unrendered'] = [];
  const body = document.nodes.map((item) => node(item, unrendered)).join('');
  // A single page container is the frame itself; every node below it is a section.
  const only = document.nodes.length === 1 && document.nodes[0]!.kind === 'container' ? document.nodes[0]! : null;
  const sectionIds: string[] = [];
  const walk = (items: readonly P15NeutralExportNode[]): void => items.forEach((item) => {
    sectionIds.push(item.sourceNodeId);
    if (item.kind === 'container') walk(item.children);
  });
  walk(only && only.kind === 'container' ? only.children : document.nodes);
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${widthPx}">`
    + `<title>${escapeHtml(document.title)}</title><style>html,body{margin:0;padding:0;background:#fff}</style></head>`
    + `<body><main id="p15-reference-root" style="width:${widthPx}px">${body}</main></body></html>`;
  return { version: P15_IR_CSS_REFERENCE_VERSION, html, sectionIds, unrendered };
}
