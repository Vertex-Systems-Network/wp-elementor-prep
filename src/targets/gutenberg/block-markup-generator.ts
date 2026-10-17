import {
  validateP15NeutralExportDocument,
  type P15NeutralButtonNode,
  type P15NeutralContainerNode,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
  type P15NeutralExportValidationResult,
  type P15NeutralHeadingNode,
  type P15NeutralImageNode,
  type P15NeutralPaddingPx,
  type P15NeutralTextNode,
  type P15NeutralTypography,
} from '../elementor/neutral-export-ir';

/**
 * Neutral IR → native Gutenberg block markup (recovery M8.2), WordPress 6.9 core blocks only (the validated set).
 *
 * The serialiser reproduces core's own `save` output for the attributes it writes (class names, style-engine CSS
 * order, comment-attribute order and escaping, from `docs/R0_GUTENBERG_WP69_2026-10-17.md`). The pinned validator
 * (`tools/gutenberg-validator`, M8.3) is the authority: markup that does not round-trip byte for byte is BLOCKED.
 * Every IR fact without a core equivalent is REVIEW and no markup is exposed; there is no HTML-block fallback.
 */
export const P16_GUTENBERG_BLOCK_GENERATOR_VERSION = 'p16-gutenberg-block-generator-v1' as const;

export type P16GutenbergGenerationStatus = 'REJECTED_INVALID_IR' | 'REVIEW_REQUIRED' | 'GENERATED_LOCAL_CANDIDATE';

export interface P16GutenbergReview {
  sourceNodeId: string;
  reasonCode: string;
  detail: string;
}

export interface P16GutenbergGenerationResult {
  schemaVersion: 1;
  generatorVersion: typeof P16_GUTENBERG_BLOCK_GENERATOR_VERSION;
  wordpressVersions: readonly ['6.9'];
  status: P16GutenbergGenerationStatus;
  irValidation: P15NeutralExportValidationResult;
  reviews: P16GutenbergReview[];
  markup: string | null;
  blockCount: number;
  /** Set by the pinned validator only (M8.3); the generator never claims editor validity. */
  editorValidityStatus: 'NOT_RUN';
  targetCompatibilityClaim: false;
}

type Css = [property: string, value: string][];
type Style = Record<string, unknown>;

interface Block {
  /** Comment name without `core/`. */
  name: string;
  /** Comment attributes in core's serialisation order; undefined entries are dropped. */
  attributes: [string, unknown][];
  open: string;
  close: string;
  inner: Block[];
}

interface State {
  reviews: P16GutenbergReview[];
  count: number;
  /** Row groups that stack on mobile (M8.4): rendered as core/columns. */
  stackOnMobile: ReadonlySet<string>;
  /** Direction of the flex group the current node sits in; null at the top level. */
  parent: 'row' | 'column' | null;
}

type Sizing = { widthPx?: number; hugWidth?: true; fillWidth?: true; flex?: 'fixed' | 'grow'; alignSelfStretch?: true; minHeightPx?: number };

/**
 * Flex-child sizing as core's `style.layout` (`selfStretch` fit/fill/fixed + `flexSize`), only inside a flex group.
 * Main-axis sizing maps; cross-axis stretch of one child has no core attribute and is REVIEW.
 */
function childLayout(node: P15NeutralExportNode, sizing: Sizing | undefined, state: State): Record<string, string> | undefined {
  if (!sizing) return undefined;
  const { widthPx, hugWidth, fillWidth, flex, alignSelfStretch } = sizing;
  if (widthPx === undefined && !hugWidth && !fillWidth && !flex && !alignSelfStretch) return undefined;
  if (state.parent === null) {
    review(state, node, 'GUTENBERG_SIZING_UNMAPPED', 'Sizing outside a flex group has no core attribute.');
    return undefined;
  }
  if (alignSelfStretch && state.parent === 'row') {
    review(state, node, 'GUTENBERG_SIZING_UNMAPPED', 'Per-child cross-axis stretch has no core attribute.');
  }
  // In a vertical group the main axis is height: a fixed width there is not a flex size.
  if (state.parent === 'column') {
    if (widthPx !== undefined || fillWidth || flex === 'grow') review(state, node, 'GUTENBERG_SIZING_UNMAPPED', 'Width in a vertical flex group has no core child-layout attribute.');
    return undefined;
  }
  if (flex === 'grow' || fillWidth) return { selfStretch: 'fill' };
  if (widthPx !== undefined) return { selfStretch: 'fixed', flexSize: px(widthPx) };
  if (hugWidth) return { selfStretch: 'fit' };
  return undefined;
}

const rgba = (hex: string, alpha: number): string => `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})`;

const px = (value: number): string => `${value}px`;
const review = (state: State, node: { sourceNodeId: string }, reasonCode: string, detail: string): void => {
  state.reviews.push({ sourceNodeId: node.sourceNodeId, reasonCode, detail });
};

function reviewUnmapped(state: State, node: P15NeutralExportNode, keys: readonly string[]): void {
  for (const key of keys) {
    if ((node as unknown as Record<string, unknown>)[key] !== undefined) {
      review(state, node, 'GUTENBERG_PROPERTY_UNMAPPED', `${node.kind}.${key} has no WordPress core block equivalent in this adapter.`);
    }
  }
}

/** WordPress `serializeAttributes`: JSON with `--`, `<`, `>`, `&` and escaped quotes rewritten as unicode escapes. */
export function serializeGutenbergAttributes(attributes: Record<string, unknown>): string {
  return JSON.stringify(attributes)
    .replace(/--/g, '\\u002d\\u002d')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\\"/g, '\\u0022');
}

const escapeText = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttribute = (value: string): string => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const richText = (value: string): string => escapeText(value).replace(/\r?\n/g, '<br>');

function render(block: Block): string {
  const attributes = Object.fromEntries(block.attributes.filter(([, value]) => value !== undefined));
  const json = Object.keys(attributes).length > 0 ? ` ${serializeGutenbergAttributes(attributes)}` : '';
  const inner = block.inner.map(render).join('\n\n');
  return `<!-- wp:${block.name}${json} -->\n${block.open}${inner}${block.close}\n<!-- /wp:${block.name} -->`;
}

const cssText = (css: Css): string => css.map(([property, value]) => `${property}:${value}`).join(';');
const styleAttribute = (css: Css): string => (css.length > 0 ? ` style="${escapeAttribute(cssText(css))}"` : '');
const classAttribute = (classes: (string | false | undefined)[]): string => {
  const list = classes.filter((item): item is string => typeof item === 'string' && item.length > 0);
  return list.length > 0 ? ` class="${list.join(' ')}"` : '';
};
const box = (value: P15NeutralPaddingPx) => ({ top: px(value.top), right: px(value.right), bottom: px(value.bottom), left: px(value.left) });

/** Style-engine order observed from core: border, color, dimensions, spacing, typography. */
function styleCss(style: Style): Css {
  const css: Css = [];
  const border = style.border as Record<string, unknown> | undefined;
  const color = style.color as Record<string, string> | undefined;
  const dimensions = style.dimensions as Record<string, string> | undefined;
  const spacing = style.spacing as Record<string, Record<string, string> | string> | undefined;
  const typography = style.typography as Record<string, string> | undefined;
  if (border) {
    if (typeof border.color === 'string') css.push(['border-color', border.color]);
    if (typeof border.style === 'string') css.push(['border-style', border.style]);
    if (typeof border.width === 'string') css.push(['border-width', border.width]);
    if (typeof border.radius === 'string') css.push(['border-radius', border.radius]);
    else if (border.radius && typeof border.radius === 'object') {
      const radius = border.radius as Record<string, string>;
      for (const [key, property] of [['topLeft', 'top-left'], ['topRight', 'top-right'], ['bottomLeft', 'bottom-left'], ['bottomRight', 'bottom-right']] as const) {
        if (radius[key] !== undefined) css.push([`border-${property}-radius`, radius[key]!]);
      }
    }
  }
  if (color?.text) css.push(['color', color.text]);
  if (color?.background) css.push(['background-color', color.background]);
  if (color?.gradient) css.push(['background', color.gradient]);
  if (dimensions?.minHeight) css.push(['min-height', dimensions.minHeight]);
  for (const side of ['margin', 'padding'] as const) {
    const sides = spacing?.[side];
    if (sides && typeof sides === 'object') {
      for (const key of ['top', 'right', 'bottom', 'left'] as const) if (sides[key] !== undefined) css.push([`${side}-${key}`, sides[key]!]);
    }
  }
  if (typography) {
    for (const [key, property] of [['fontFamily', 'font-family'], ['fontSize', 'font-size'], ['fontStyle', 'font-style'], ['fontWeight', 'font-weight'],
      ['letterSpacing', 'letter-spacing'], ['lineHeight', 'line-height'], ['textDecoration', 'text-decoration'], ['textTransform', 'text-transform']] as const) {
      if (typography[key] !== undefined) css.push([property, typography[key]!]);
    }
  }
  if (typeof style.shadow === 'string') css.push(['box-shadow', style.shadow]);
  return css;
}

function typographyStyle(typography: P15NeutralTypography | undefined, state: State, node: P15NeutralExportNode): { typography?: Record<string, string>; color?: Record<string, string> } {
  if (!typography) return {};
  const out: Record<string, string> = {};
  if (typography.fontFamily !== undefined) {
    if (/[^A-Za-z0-9 _-]/.test(typography.fontFamily)) review(state, node, 'GUTENBERG_FONT_FAMILY_UNSAFE', 'Font family name needs quoting that core does not serialise.');
    else out.fontFamily = typography.fontFamily;
  }
  if (typography.fontSizePx !== undefined) out.fontSize = px(typography.fontSizePx);
  if (typography.fontStyle !== undefined) out.fontStyle = typography.fontStyle;
  if (typography.fontWeight !== undefined) out.fontWeight = String(typography.fontWeight);
  if (typography.letterSpacingPx !== undefined) out.letterSpacing = px(typography.letterSpacingPx);
  if (typography.lineHeightPx !== undefined) out.lineHeight = px(typography.lineHeightPx);
  if (typography.textDecoration !== undefined) out.textDecoration = typography.textDecoration;
  if (typography.textTransform !== undefined) out.textTransform = typography.textTransform;
  // Comment order follows core: fontFamily, fontStyle, fontWeight, lineHeight, letterSpacing, textTransform, textDecoration, fontSize.
  const ordered: Record<string, string> = {};
  for (const key of ['fontFamily', 'fontStyle', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform', 'textDecoration', 'fontSize']) {
    if (out[key] !== undefined) ordered[key] = out[key]!;
  }
  return {
    ...(Object.keys(ordered).length > 0 ? { typography: ordered } : {}),
    ...(typography.colorHex !== undefined ? { color: { text: typography.colorHex } } : {}),
  };
}

const ROW_JUSTIFY: Record<string, string> = { start: 'left', center: 'center', end: 'right', 'space-between': 'space-between' };
const ROW_ALIGN: Record<string, string> = { start: 'top', center: 'center', end: 'bottom', stretch: 'stretch' };
const COLUMN_JUSTIFY: Record<string, string> = { start: 'left', center: 'center', end: 'right', stretch: 'stretch' };
const COLUMN_ALIGN: Record<string, string> = { start: 'top', center: 'center', end: 'bottom', 'space-between': 'space-between' };

/**
 * A row group that becomes a column on mobile only → `core/columns` (stacks below 782 px, the only native responsive
 * layout in core). Bounded: padding, background, gap and cross-axis alignment; anything else stays REVIEW.
 */
const COLUMNS_ALIGN: Record<string, string | undefined> = { start: 'top', center: 'center', end: 'bottom', stretch: undefined };

function columns(node: P15NeutralContainerNode, state: State): Block {
  reviewUnmapped(state, node, ['backgroundImage', 'gradient', 'boxShadow', 'border', 'cornerRadiusPx', 'cornerRadiiPx', 'wrap', 'grid',
    'marginPx', 'position', 'zIndex', 'clipsContent', 'justifyContent']);
  for (const item of node.styleReviews ?? []) review(state, node, item.reasonCode, item.detail);
  if (node.sizing && state.parent !== null) review(state, node, 'GUTENBERG_SIZING_UNMAPPED', 'Sizing of a stacking columns block is not mapped.');
  const align = node.alignItems ? COLUMNS_ALIGN[node.alignItems] : undefined;
  const style: Style = {};
  const spacing: Record<string, unknown> = {};
  if (node.gapPx !== undefined) spacing.blockGap = { left: px(node.gapPx) };
  if (node.paddingPx) spacing.padding = box(node.paddingPx);
  if (Object.keys(spacing).length > 0) style.spacing = spacing;
  if (node.backgroundColorHex) style.color = { background: node.backgroundColorHex };
  state.count += 1 + node.children.length;
  const previous = state.parent;
  state.parent = null; // a core/column is a flow container: child sizing inside it is not a flex size
  // The column itself is the equal share the child's grow/fill asked for.
  const inner = node.children.map((child): Block => {
    const sizing = (child as { sizing?: Sizing }).sizing;
    let unwrapped = child;
    if (sizing) {
      const { flex: _flex, fillWidth: _fill, ...rest } = sizing;
      unwrapped = { ...child, sizing: Object.keys(rest).length > 0 ? rest : undefined } as P15NeutralExportNode;
      if (Object.keys(rest).length === 0) delete (unwrapped as { sizing?: unknown }).sizing;
    }
    return { name: 'column', attributes: [], open: '<div class="wp-block-column">', close: '</div>', inner: convert(unwrapped, state) };
  });
  state.parent = previous;
  return {
    name: 'columns',
    attributes: [['verticalAlignment', align], ['style', Object.keys(style).length > 0 ? style : undefined]],
    open: `<div${classAttribute(['wp-block-columns', align && `are-vertically-aligned-${align}`, style.color !== undefined && 'has-background'])}${styleAttribute(styleCss(style))}>`,
    close: '</div>',
    inner,
  };
}

function group(node: P15NeutralContainerNode, state: State): Block {
  if (state.stackOnMobile.has(node.sourceNodeId)) return columns(node, state);
  reviewUnmapped(state, node, ['backgroundImage', 'marginPx', 'position', 'zIndex', 'clipsContent']);
  for (const item of node.styleReviews ?? []) review(state, node, item.reasonCode, item.detail);
  // The single top-level frame is the page itself: its design width is the canvas, not a block attribute.
  const isRootFrame = state.parent === null && node.fullContentWidth === true;
  let sizing: Sizing | undefined = node.sizing;
  if (isRootFrame && node.sizing) {
    const { widthPx: _width, hugWidth: _hug, ...rest } = node.sizing;
    sizing = rest;
  }
  const selfLayout = childLayout(node, sizing, state);
  const row = node.direction === 'row';
  const grid = node.grid;
  const equalTracks = (tracks: readonly { unit: string; value?: number }[]) => tracks.every((track) => track.unit === 'fr' && track.value === 1);
  if (grid && (!equalTracks(grid.columns) || !equalTracks(grid.rows))) {
    review(state, node, 'GUTENBERG_GRID_UNMAPPED', 'Only equal 1fr grid tracks map to the core grid layout (columnCount).');
  }
  const layout: Record<string, string | number> = grid ? { type: 'grid', columnCount: grid.columns.length } : { type: 'flex' };
  if (!grid && row) layout.flexWrap = node.wrap ? 'wrap' : 'nowrap';
  else if (!grid) layout.orientation = 'vertical';
  if (node.wrap && node.wrap.alignContent !== undefined && String(node.wrap.alignContent) !== 'start') {
    review(state, node, 'GUTENBERG_ALIGNMENT_UNMAPPED', 'Wrapped-line distribution (align-content) has no flex layout value.');
  }
  const justify = row ? node.justifyContent && ROW_JUSTIFY[node.justifyContent] : node.alignItems && COLUMN_JUSTIFY[node.alignItems];
  const align = row ? node.alignItems && ROW_ALIGN[node.alignItems] : node.justifyContent && COLUMN_ALIGN[node.justifyContent];
  if ((row ? node.justifyContent : node.alignItems) && !justify) review(state, node, 'GUTENBERG_ALIGNMENT_UNMAPPED', 'Main-axis distribution has no flex layout value.');
  if ((row ? node.alignItems : node.justifyContent) && !align) review(state, node, 'GUTENBERG_ALIGNMENT_UNMAPPED', 'Cross-axis alignment has no flex layout value.');
  if (!grid && justify && justify !== 'left') layout.justifyContent = justify;
  if (!grid && align && align !== 'top') layout.verticalAlignment = align;

  const style: Style = {};
  if (node.sizing?.minHeightPx !== undefined) style.dimensions = { minHeight: px(node.sizing.minHeightPx) };
  const spacing: Record<string, unknown> = {};
  if (node.paddingPx) spacing.padding = box(node.paddingPx);
  if (grid) spacing.blockGap = { top: px(grid.rowGapPx), left: px(grid.columnGapPx) };
  else if (node.wrap) spacing.blockGap = { top: px(node.wrap.rowGapPx), left: px(node.gapPx ?? 0) };
  else if (node.gapPx !== undefined) spacing.blockGap = px(node.gapPx);
  if (Object.keys(spacing).length > 0) style.spacing = spacing;
  if (node.backgroundColorHex) style.color = { background: node.backgroundColorHex };
  if (node.gradient) {
    const g = node.gradient;
    const stops = `${g.colorA} ${g.stopA}%,${g.colorB} ${g.stopB}%`;
    style.color = { gradient: g.type === 'linear' ? `linear-gradient(${g.angleDeg ?? 180}deg,${stops})` : `radial-gradient(${stops})` };
  }
  const border: Record<string, unknown> = {};
  if (node.cornerRadiusPx !== undefined) border.radius = px(node.cornerRadiusPx);
  if (node.cornerRadiiPx) {
    const r = node.cornerRadiiPx;
    border.radius = { topLeft: px(r.topLeft), topRight: px(r.topRight), bottomLeft: px(r.bottomLeft), bottomRight: px(r.bottomRight) };
  }
  if (node.border) {
    const w = node.border.widthPx;
    if (w.top === w.right && w.top === w.bottom && w.top === w.left) {
      border.width = px(w.top);
      border.color = node.border.colorHex;
      border.style = node.border.style;
    } else review(state, node, 'GUTENBERG_BORDER_UNMAPPED', 'Per-side border widths are not mapped.');
  }
  if (Object.keys(border).length > 0) style.border = border;
  if (node.boxShadow) {
    const b = node.boxShadow;
    style.shadow = `${b.inset ? 'inset ' : ''}${px(b.xPx)} ${px(b.yPx)} ${px(b.blurPx)} ${px(b.spreadPx)} ${rgba(b.colorHex, b.alpha)}`;
  }
  if (selfLayout) style.layout = selfLayout;

  const classes = ['wp-block-group', border.color !== undefined && 'has-border-color', style.color !== undefined && 'has-background'];
  state.count += 1;
  return {
    name: 'group',
    attributes: [['style', Object.keys(style).length > 0 ? style : undefined], ['layout', layout]],
    open: `<div${classAttribute(classes)}${styleAttribute(styleCss(style))}>`,
    close: '</div>',
    inner: withParent(state, row ? 'row' : 'column', () => node.children.flatMap((child) => convert(child, state))),
  };
}

function withParent<T>(state: State, parent: 'row' | 'column', run: () => T): T {
  const previous = state.parent;
  state.parent = parent;
  try { return run(); } finally { state.parent = previous; }
}

/** Typography/colour style plus the flex-child layout, for text-like blocks. */
function textStyle(node: P15NeutralHeadingNode | P15NeutralTextNode, state: State): Style {
  const style: Style = { ...typographyStyle(node.typography, state, node) };
  const layout = childLayout(node, node.sizing, state);
  if (layout) style.layout = layout;
  return style;
}

const linked = (html: string, href: string | undefined): string => (href ? `<a href="${escapeAttribute(href)}">${html}</a>` : html);

const TEXT_ALIGN: Record<string, string> = { start: 'left', center: 'center', end: 'right', justify: 'justify' };

function heading(node: P15NeutralHeadingNode, state: State): Block[] {
  reviewUnmapped(state, node, ['position', 'zIndex']);
  if (!/^h[1-6]$/.test(node.level)) {
    review(state, node, 'GUTENBERG_HEADING_LEVEL_UNMAPPED', `core/heading accepts h1–h6 only; got ${node.level}.`);
    return [];
  }
  const level = Number(node.level.slice(1));
  const style = textStyle(node, state);
  const align = node.align ? TEXT_ALIGN[node.align] : undefined;
  const classes = ['wp-block-heading', align && align !== 'left' ? `has-text-align-${align}` : align === 'left' ? 'has-text-align-left' : undefined, style.color !== undefined && 'has-text-color'];
  state.count += 1;
  return [{
    name: 'heading',
    attributes: [['textAlign', align], ['level', level === 2 ? undefined : level], ['style', Object.keys(style).length > 0 ? style : undefined]],
    open: `<h${level}${classAttribute(classes)}${styleAttribute(styleCss(style))}>${linked(richText(node.text), node.href)}`,
    close: `</h${level}>`,
    inner: [],
  }];
}

function paragraph(node: P15NeutralTextNode, state: State): Block[] {
  reviewUnmapped(state, node, ['position', 'zIndex', 'paragraphSpacingPx']);
  for (const item of node.styleReviews ?? []) review(state, node, item.reasonCode, item.detail);
  if ((node.paragraphs ?? []).some((p) => p.spans.some((span) => span.style !== undefined || span.href !== undefined))) {
    review(state, node, 'GUTENBERG_RICH_TEXT_UNMAPPED', 'Per-span styles or links are not mapped to inline formats.');
  }
  const style = textStyle(node, state);
  const align = node.align ? TEXT_ALIGN[node.align] : undefined;
  state.count += 1;
  return [{
    name: 'paragraph',
    attributes: [['align', align], ['style', Object.keys(style).length > 0 ? style : undefined]],
    open: `<p${classAttribute([align && `has-text-align-${align}`, style.color !== undefined && 'has-text-color'])}${styleAttribute(styleCss(style))}>${linked(richText(node.text), node.href)}`,
    close: '</p>',
    inner: [],
  }];
}

function buttons(node: P15NeutralButtonNode, state: State): Block[] {
  reviewUnmapped(state, node, ['position', 'zIndex', 'align']);
  const sizing = node.sizing as (Sizing & { fullWidth?: true; contentAlign?: string }) | undefined;
  if (sizing?.fullWidth || sizing?.contentAlign) review(state, node, 'GUTENBERG_SIZING_UNMAPPED', 'Full-width buttons and label alignment are not mapped.');
  const wrapperLayout = childLayout(node, sizing, state);
  if (node.nofollow) review(state, node, 'GUTENBERG_PROPERTY_UNMAPPED', 'button.nofollow is not mapped.');
  for (const item of node.styleReviews ?? []) review(state, node, item.reasonCode, item.detail);
  const text = typographyStyle(node.typography, state, node);
  const style: Style = {};
  if (text.typography) style.typography = text.typography;
  const color: Record<string, string> = { ...(text.color ?? {}) };
  if (node.backgroundColorHex) color.background = node.backgroundColorHex;
  if (Object.keys(color).length > 0) style.color = color;
  if (node.paddingPx) style.spacing = { padding: box(node.paddingPx) };
  if (node.cornerRadiusPx !== undefined) style.border = { radius: px(node.cornerRadiusPx) };
  const link = [
    'wp-block-button__link', color.text && 'has-text-color', color.background && 'has-background',
    text.typography?.fontSize && 'has-custom-font-size', 'wp-element-button',
  ];
  const href = node.url ? ` href="${escapeAttribute(node.url)}"` : '';
  const target = node.url && node.openInNewTab ? ' target="_blank" rel="noreferrer noopener"' : '';
  state.count += 2;
  return [{
    name: 'buttons',
    attributes: [['style', wrapperLayout ? { layout: wrapperLayout } : undefined]],
    open: '<div class="wp-block-buttons">',
    close: '</div>',
    inner: [{
      name: 'button',
      attributes: [['style', Object.keys(style).length > 0 ? style : undefined]],
      open: `<div class="wp-block-button"><a${classAttribute(link)}${href}${styleAttribute(styleCss(style))}${target}>${richText(node.text)}`,
      close: '</a></div>',
      inner: [],
    }],
  }];
}

function image(node: P15NeutralImageNode, state: State): Block[] {
  if (!node.url) {
    review(state, node, 'GUTENBERG_IMAGE_ASSET_UNMAPPED', 'Pack-relative image assets need a media upload before core/image can reference them.');
    return [];
  }
  reviewUnmapped(state, node, ['attachmentId']);
  if (node.sizing && (node.sizing.fillWidth || node.sizing.flex || node.sizing.alignSelfStretch)) {
    review(state, node, 'GUTENBERG_SIZING_UNMAPPED', 'Fill/flex image sizing is not mapped.');
  }
  const width = node.sizing?.widthPx === undefined ? undefined : px(node.sizing.widthPx);
  const height = node.heightPx === undefined ? undefined : px(node.heightPx);
  const scale = node.objectFit;
  const css: Css = [];
  if (scale) css.push(['object-fit', scale]);
  if (width) css.push(['width', width]);
  if (height) css.push(['height', height]);
  state.count += 1;
  return [{
    name: 'image',
    attributes: [['width', width], ['height', height], ['scale', scale]],
    open: `<figure class="wp-block-image${width || height ? ' is-resized' : ''}"><img src="${escapeAttribute(node.url)}" alt=""${styleAttribute(css)}/>`,
    close: '</figure>',
    inner: [],
  }];
}

function convert(node: P15NeutralExportNode, state: State): Block[] {
  switch (node.kind) {
    case 'container': return [group(node, state)];
    case 'heading': return heading(node, state);
    case 'text': return paragraph(node, state);
    case 'button': return buttons(node, state);
    case 'image': return image(node, state);
    case 'spacer':
      state.count += 1;
      return [{ name: 'spacer', attributes: [['height', px(node.heightPx)]], open: `<div style="height:${px(node.heightPx)}" aria-hidden="true" class="wp-block-spacer">`, close: '</div>', inner: [] }];
    case 'divider': {
      reviewUnmapped(state, node, ['widthPx', 'align', 'zIndex']);
      if (node.weightPx !== 1) review(state, node, 'GUTENBERG_DIVIDER_WEIGHT_UNMAPPED', 'core/separator has no thickness attribute.');
      state.count += 1;
      const color = node.colorHex;
      return [{ name: 'separator', attributes: [['style', { color: { background: color } }]],
        open: `<hr class="wp-block-separator has-text-color has-alpha-channel-opacity has-background" style="background-color:${color};color:${color}"/>`, close: '', inner: [] }];
    }
    case 'review':
      review(state, node, node.reasonCode, node.detail);
      return [];
    default:
      review(state, node, 'GUTENBERG_BLOCK_UNMAPPED', `${(node as P15NeutralExportNode).kind} has no core block in this adapter.`);
      return [];
  }
}

export interface P16GutenbergResponsivePlan {
  /** Row containers that become a column on mobile (and keep their direction on tablet): rendered as core/columns. */
  stackOnMobile: string[];
  /** Responsive differences core cannot express (no per-breakpoint styles): REVIEW, never dropped. */
  reviews: P16GutenbergReview[];
}

/**
 * Recovery M8.4: map the M4 responsive merge entries onto core's limits. Core blocks have no per-breakpoint
 * attributes; the only native behaviour used is `core/columns` stacking on mobile. The root frame's per-device width
 * is the canvas, not a block attribute. Everything else is REVIEW.
 */
export function planGutenbergResponsive(
  document: P15NeutralExportDocumentV1,
  entries: Record<string, ReadonlyArray<Record<string, unknown>>>,
): P16GutenbergResponsivePlan {
  const rootId = document.nodes.length === 1 && document.nodes[0]!.kind === 'container' && document.nodes[0]!.fullContentWidth ? document.nodes[0]!.sourceNodeId : null;
  // core/columns gives every column an equal share on desktop too, so only rows whose children already grow equally
  // keep the desktop design; any other row would be redesigned by stacking and stays REVIEW.
  const rows = new Set<string>();
  const grows = (item: P15NeutralExportNode): boolean => {
    const sizing = (item as { sizing?: Sizing }).sizing;
    return sizing !== undefined && sizing.widthPx === undefined && (sizing.flex === 'grow' || sizing.fillWidth === true);
  };
  const walk = (items: readonly P15NeutralExportNode[]): void => items.forEach((item) => {
    if (item.kind === 'container') {
      if (item.direction === 'row' && !item.grid && item.children.length > 0 && item.children.every(grows)) rows.add(item.sourceNodeId);
      walk(item.children);
    }
  });
  walk(document.nodes);
  const plan: P16GutenbergResponsivePlan = { stackOnMobile: [], reviews: [] };
  for (const [family, list] of Object.entries(entries)) {
    for (const entry of list) {
      const sourceNodeId = String(entry.sourceNodeId ?? '');
      if (family === 'containerWidth' && sourceNodeId === rootId) continue;
      if (family === 'direction' && rows.has(sourceNodeId) && entry.mobileDirection === 'column' && entry.tabletDirection === undefined) {
        plan.stackOnMobile.push(sourceNodeId);
        continue;
      }
      plan.reviews.push({ sourceNodeId, reasonCode: 'GUTENBERG_RESPONSIVE_UNMAPPED',
        detail: `Responsive ${family} has no core block equivalent (core has no per-breakpoint styles).` });
    }
  }
  plan.stackOnMobile.sort();
  return plan;
}

export function generateGutenbergBlockMarkup(value: unknown, responsive?: P16GutenbergResponsivePlan): P16GutenbergGenerationResult {
  const irValidation = validateP15NeutralExportDocument(value);
  const base = {
    schemaVersion: 1 as const, generatorVersion: P16_GUTENBERG_BLOCK_GENERATOR_VERSION, wordpressVersions: ['6.9'] as const,
    irValidation, editorValidityStatus: 'NOT_RUN' as const, targetCompatibilityClaim: false as const,
  };
  if (!irValidation.valid) return { ...base, status: 'REJECTED_INVALID_IR', reviews: [], markup: null, blockCount: 0 };
  const state: State = { reviews: [...(responsive?.reviews ?? [])], count: 0, stackOnMobile: new Set(responsive?.stackOnMobile ?? []), parent: null };
  const blocks = (value as P15NeutralExportDocumentV1).nodes.flatMap((node) => convert(node, state));
  if (state.reviews.length > 0) return { ...base, status: 'REVIEW_REQUIRED', reviews: state.reviews, markup: null, blockCount: 0 };
  return { ...base, status: 'GENERATED_LOCAL_CANDIDATE', reviews: [], markup: blocks.map(render).join('\n\n'), blockCount: state.count };
}
