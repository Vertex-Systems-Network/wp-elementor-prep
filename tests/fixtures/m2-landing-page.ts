/**
 * Golden landing page (recovery M2.9c): a Figma-shaped 1440px page exercising every M2 mapping. Plain data in the
 * shape the Figma Plugin API exposes; text nodes emulate `getStyledTextSegments` from their `segments`.
 */
type Node = Record<string, unknown>;

const rgb = (hex: string) => ({ r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255, b: parseInt(hex.slice(5, 7), 16) / 255 });
const solid = (hex: string) => ({ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: rgb(hex) });

interface Style { family?: string; weight?: number; italic?: boolean; size?: number; lineHeight?: number; letterSpacing?: number; color?: string;
  textCase?: string; textDecoration?: string; url?: string }

function segment(characters: string, style: Style) {
  return {
    characters,
    fontName: { family: style.family ?? 'Inter', style: style.italic ? 'Italic' : 'Regular' },
    fontWeight: style.weight ?? 400,
    fontStyle: style.italic ? 'ITALIC' : 'REGULAR',
    fontSize: style.size ?? 16,
    lineHeight: style.lineHeight === undefined ? { unit: 'AUTO' } : { unit: 'PIXELS', value: style.lineHeight },
    letterSpacing: { unit: 'PIXELS', value: style.letterSpacing ?? 0 },
    textCase: style.textCase ?? 'ORIGINAL',
    textDecoration: style.textDecoration ?? 'NONE',
    fills: [solid(style.color ?? '#0f172a')],
    hyperlink: style.url === undefined ? null : { type: 'URL', value: style.url },
  };
}

/** A text node; `runs` (characters + style) default to one run of `characters` in `style`. */
function text(id: string, characters: string, style: Style, extra: Node = {}, runs?: Array<[string, Style]>): Node {
  const segments = (runs ?? [[characters, style]]).map(([chars, runStyle]) => segment(chars, { ...style, ...runStyle }));
  const first = segments[0]!;
  const uniform = segments.length === 1;
  const mixed = Symbol('mixed');
  return {
    id, name: id, type: 'TEXT', visible: true, characters, textAlignHorizontal: 'LEFT', layoutSizingHorizontal: 'HUG', layoutSizingVertical: 'HUG',
    // Node-level text properties, as the Plugin API reports them (figma.mixed when runs differ).
    fills: uniform ? first.fills : mixed, fontSize: first.fontSize, fontName: uniform ? first.fontName : mixed, lineHeight: first.lineHeight,
    letterSpacing: first.letterSpacing, textCase: first.textCase, textDecoration: first.textDecoration,
    getStyledTextSegments: () => segments,
    ...extra,
  };
}

function frame(id: string, extra: Node = {}): Node {
  return {
    id, name: id, type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO', itemSpacing: 0,
    paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN',
    fills: [], strokes: [], effects: [], opacity: 1, blendMode: 'PASS_THROUGH', rotation: 0, clipsContent: false, children: [], ...extra,
  };
}

const pad = (vertical: number, horizontal: number) => ({ paddingTop: vertical, paddingBottom: vertical, paddingLeft: horizontal, paddingRight: horizontal });
const fill = { layoutSizingHorizontal: 'FILL', layoutSizingVertical: 'HUG' };

function button(id: string, label: string, background: string, color: string): Node {
  return frame(id, { name: `Button ${label}`, layoutMode: 'HORIZONTAL', ...pad(12, 20), primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
    layoutSizingHorizontal: 'HUG', layoutSizingVertical: 'HUG', width: 140, height: 48, cornerRadius: 8, fills: [solid(background)],
    children: [text(`${id}-label`, label, { weight: 600, size: 16, lineHeight: 24, color })] });
}

function card(index: number, title: string, body: string): Node {
  return frame(`feature-${index}`, {
    ...pad(32, 32), itemSpacing: 12, layoutSizingHorizontal: 'FILL', layoutSizingVertical: 'FILL', width: 405, height: 220, cornerRadius: 16,
    fills: [solid('#f8fafc')], strokes: [solid('#e2e8f0')], strokeWeight: 1, strokeAlign: 'INSIDE',
    effects: [{ type: 'DROP_SHADOW', visible: true, blendMode: 'NORMAL', showShadowBehindNode: false, offset: { x: 0, y: 4 }, radius: 12, spread: 0,
      color: { r: 0, g: 0, b: 0, a: 0.08 } }],
    gridRowAnchorIndex: 0, gridColumnAnchorIndex: index, gridRowSpan: 1, gridColumnSpan: 1, gridChildHorizontalAlign: 'AUTO', gridChildVerticalAlign: 'AUTO',
    children: [text(`feature-${index}-title`, title, { weight: 600, size: 20, lineHeight: 28 }, fill),
      text(`feature-${index}-body`, body, { size: 16, lineHeight: 24, color: '#475569' }, fill)],
  });
}

const chip = (index: number, label: string) => frame(`logo-${index}`, { layoutMode: 'HORIZONTAL', ...pad(8, 16), layoutSizingHorizontal: 'HUG',
  layoutSizingVertical: 'HUG', width: 120, height: 40, cornerRadius: 20, fills: [solid('#f1f5f9')],
  children: [text(`logo-${index}-label`, label, { weight: 500, size: 14, lineHeight: 24, color: '#334155' })] });
const avatar = (index: number, color: string) => frame(`avatar-${index}`, { layoutMode: 'HORIZONTAL', width: 48, height: 48,
  layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED', cornerRadius: 24, fills: [solid(color)], strokes: [solid('#ffffff')], strokeWeight: 2,
  strokeAlign: 'INSIDE', children: [] });

export function landingPageFrame(): Node {
  const nav = frame('nav', { layoutMode: 'HORIZONTAL', ...pad(24, 80), primaryAxisAlignItems: 'SPACE_BETWEEN', counterAxisAlignItems: 'CENTER', itemSpacing: 24,
    ...fill, width: 1440, height: 96, children: [
      text('logo', 'Acme', { weight: 700, size: 24, lineHeight: 32 }),
      frame('links', { layoutMode: 'HORIZONTAL', itemSpacing: 32, layoutSizingHorizontal: 'HUG', layoutSizingVertical: 'HUG', width: 300, height: 24,
        counterAxisAlignItems: 'CENTER', children: ['Product', 'Pricing', 'Docs'].map((label) => text(`link-${label.toLowerCase()}`, label,
          { weight: 500, size: 16, lineHeight: 24, color: '#334155' })) }),
      button('nav-cta', 'Get started', '#2563eb', '#ffffff'),
    ] });

  const hero = frame('hero', { ...pad(96, 80), itemSpacing: 24, counterAxisAlignItems: 'CENTER', ...fill, width: 1440, height: 520,
    fills: [{ type: 'GRADIENT_LINEAR', visible: true, opacity: 1, blendMode: 'NORMAL', gradientTransform: [[0, 1, 0], [-1, 0, 1]],
      gradientStops: [{ position: 0, color: { ...rgb('#eff6ff'), a: 1 } }, { position: 1, color: { ...rgb('#ffffff'), a: 1 } }] }],
    children: [
      text('hero-title', 'Ship pixel-perfect pages', { weight: 700, size: 56, lineHeight: 64, letterSpacing: -1 }),
      text('hero-copy', 'Turn approved Figma designs into native Elementor layouts.', { size: 20, lineHeight: 32, color: '#475569' },
        { layoutSizingHorizontal: 'FIXED', width: 720, textAlignHorizontal: 'CENTER' }),
      frame('hero-actions', { layoutMode: 'HORIZONTAL', itemSpacing: 16, layoutSizingHorizontal: 'HUG', layoutSizingVertical: 'HUG', width: 300, height: 48,
        children: [button('hero-primary', 'Start free', '#2563eb', '#ffffff'),
          // An outline button: the Button widget border is not mapped yet, so it stays an exact container with a review.
          { ...button('hero-secondary', 'Book a demo', '#ffffff', '#2563eb'), strokes: [solid('#2563eb')], strokeWeight: 1, strokeAlign: 'INSIDE' }] }),
      frame('hero-badge', { layoutMode: 'HORIZONTAL', layoutPositioning: 'ABSOLUTE', constraints: { horizontal: 'MAX', vertical: 'MIN' },
        x: 1240, y: 32, width: 120, height: 32, layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED', ...pad(4, 12), cornerRadius: 16,
        fills: [solid('#dbeafe')], children: [text('hero-badge-label', 'New in 2026', { weight: 600, size: 12, lineHeight: 24, color: '#1d4ed8',
          textCase: 'UPPER' })] }),
    ] });

  const features = frame('features', { layoutMode: 'GRID', gridRowCount: 1, gridColumnCount: 3, gridRowGap: 32, gridColumnGap: 32,
    gridRowSizes: [{ type: 'FLEX', value: 1 }], gridColumnSizes: [1, 2, 3].map(() => ({ type: 'FLEX', value: 1 })), ...pad(80, 80), ...fill,
    width: 1440, height: 380, children: [card(0, 'Read-only audit', 'Nothing in your file changes.'), card(1, 'Native widgets', 'Headings, text and buttons.'),
      card(2, 'Explicit review', 'Every gap is listed.')] });

  const logos = frame('logos', { layoutMode: 'HORIZONTAL', layoutWrap: 'WRAP', itemSpacing: 16, counterAxisSpacing: 16, counterAxisAlignContent: 'AUTO',
    primaryAxisAlignItems: 'CENTER', ...pad(40, 80), ...fill, width: 1440, height: 136,
    children: ['Northwind', 'Globex', 'Initech', 'Umbrella', 'Hooli'].map((label, index) => chip(index, label)) });

  const testimonial = frame('testimonial', { layoutMode: 'HORIZONTAL', itemSpacing: 24, counterAxisAlignItems: 'CENTER', ...pad(64, 80), ...fill,
    width: 1440, height: 176, children: [
      frame('avatars', { layoutMode: 'HORIZONTAL', itemSpacing: -12, layoutSizingHorizontal: 'HUG', layoutSizingVertical: 'HUG', width: 120, height: 48,
        children: [avatar(0, '#f59e0b'), avatar(1, '#10b981'), avatar(2, '#6366f1')] }),
      text('quote', '“Acme changed how we ship.” — Jane Doe', { size: 18, lineHeight: 28 }, {},
        [['“Acme changed how we ship.” — ', { italic: true }], ['Jane Doe', { weight: 700 }]]),
    ] });

  const screenshot = { id: 'product-shot', name: 'Product shot', type: 'RECTANGLE', visible: true, width: 1280, height: 640, x: 80, y: 0,
    fills: [{ type: 'IMAGE', visible: true, imageHash: 'abc', scaleMode: 'FILL' }], strokes: [], effects: [] };

  const divider = { id: 'footer-rule', name: 'Divider', type: 'RECTANGLE', visible: true, width: 1440, height: 1, layoutSizingHorizontal: 'FILL',
    layoutSizingVertical: 'FIXED', fills: [solid('#e2e8f0')], strokes: [], effects: [], opacity: 1, blendMode: 'PASS_THROUGH', rotation: 0 };

  const footer = frame('footer', { layoutMode: 'HORIZONTAL', primaryAxisAlignItems: 'SPACE_BETWEEN', counterAxisAlignItems: 'CENTER', itemSpacing: 24,
    ...pad(40, 80), ...fill, width: 1440, height: 104, fills: [solid('#0f172a')], children: [
      text('copyright', '© 2026 Acme', { size: 14, lineHeight: 24, color: '#94a3b8' }),
      text('privacy', 'Privacy', { size: 14, lineHeight: 24, color: '#e2e8f0', textDecoration: 'UNDERLINE', url: 'https://example.com/privacy' }),
    ] });

  return frame('landing', { name: 'Landing page', width: 1440, height: 2400, layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'HUG',
    fills: [solid('#ffffff')], children: [nav, hero, features, logos, testimonial, screenshot, divider, footer] });
}
