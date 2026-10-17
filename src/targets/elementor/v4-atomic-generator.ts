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
} from './neutral-export-ir';
import {
  ELEMENTOR_V4_ATOMIC_ADAPTER_VERSION,
  validateElementorV4AtomicTemplate,
  type AtomicElement,
  type AtomicProp,
  type AtomicValidationResult,
  type ElementorV4AtomicTemplate,
} from './v4-atomic-template';

/**
 * Neutral IR -> Elementor v4 Atomic (recovery M6.4).
 *
 * Bounded first slice: container -> e-flexbox, heading -> e-heading, text -> e-paragraph, button -> e-button,
 * image (absolute URL) -> e-image. Every IR fact without a tested atomic mapping becomes REVIEW for that node; the
 * adapter never falls back to v3 settings, HTML or screenshots. A REVIEW result exposes no template.
 */
export const P15_ELEMENTOR_V4_ATOMIC_GENERATOR_VERSION = 'p15-elementor-v4-atomic-generator-v1' as const;

export type P15ElementorV4AtomicStatus = 'REJECTED_INVALID_IR' | 'REVIEW_REQUIRED' | 'GENERATED_LOCAL_CANDIDATE';

export interface P15ElementorV4AtomicReview {
  sourceNodeId: string;
  reasonCode: string;
  detail: string;
}

export interface P15ElementorV4AtomicResult {
  schemaVersion: 1;
  generatorVersion: typeof P15_ELEMENTOR_V4_ATOMIC_GENERATOR_VERSION;
  adapterVersion: typeof ELEMENTOR_V4_ATOMIC_ADAPTER_VERSION;
  status: P15ElementorV4AtomicStatus;
  irValidation: P15NeutralExportValidationResult;
  templateValidation: AtomicValidationResult | null;
  reviews: P15ElementorV4AtomicReview[];
  template: ElementorV4AtomicTemplate | null;
  templateJson: string | null;
  targetCompatibilityClaim: false;
  importValidationStatus: 'NOT_RUN';
}

interface State {
  usedIds: Set<string>;
  reviews: P15ElementorV4AtomicReview[];
}

const prop = ($$type: AtomicProp['$$type'], value: unknown): AtomicProp => ({ $$type, value });
const px = (size: number): AtomicProp => prop('size', { size, unit: 'px' });
const str = (value: string): AtomicProp => prop('string', value);

function fnv1a32(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function stableId(kind: string, sourceNodeId: string, state: State): string {
  for (let attempt = 0; attempt < 1_024; attempt += 1) {
    const id = fnv1a32(`atomic\u0000${kind}\u0000${sourceNodeId}\u0000${attempt}`).toString(16).padStart(8, '0');
    if (!state.usedIds.has(id)) {
      state.usedIds.add(id);
      return id;
    }
  }
  throw new Error('Unable to derive a unique bounded atomic element id.');
}

function review(state: State, node: { sourceNodeId: string }, reasonCode: string, detail: string): void {
  state.reviews.push({ sourceNodeId: node.sourceNodeId, reasonCode, detail });
}

/** Any listed IR fact present on the node has no atomic mapping yet: REVIEW, never dropped silently. */
function reviewUnmapped(state: State, node: P15NeutralExportNode, keys: readonly string[]): void {
  for (const key of keys) {
    if ((node as unknown as Record<string, unknown>)[key] !== undefined) {
      review(state, node, 'ATOMIC_PROPERTY_UNMAPPED', `${node.kind}.${key} has no tested Elementor v4 Atomic mapping.`);
    }
  }
}

const dimensions = (box: P15NeutralPaddingPx): AtomicProp => prop('dimensions', {
  'block-start': px(box.top), 'inline-end': px(box.right), 'block-end': px(box.bottom), 'inline-start': px(box.left),
});

const FLEX_ALIGN: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' };
const FLEX_JUSTIFY: Record<string, string> = {
  start: 'flex-start', center: 'center', end: 'flex-end', 'space-between': 'space-between', 'space-around': 'space-around', 'space-evenly': 'space-evenly',
};
const TEXT_ALIGN: Record<string, string> = { start: 'start', center: 'center', end: 'end', justify: 'justify' };

function typographyProps(typography: P15NeutralTypography | undefined): Record<string, AtomicProp> {
  if (!typography) return {};
  const props: Record<string, AtomicProp> = {};
  if (typography.fontFamily !== undefined) props['font-family'] = str(typography.fontFamily);
  if (typography.fontWeight !== undefined) props['font-weight'] = str(String(typography.fontWeight));
  if (typography.fontStyle !== undefined) props['font-style'] = str(typography.fontStyle);
  if (typography.fontSizePx !== undefined) props['font-size'] = px(typography.fontSizePx);
  if (typography.lineHeightPx !== undefined) props['line-height'] = px(typography.lineHeightPx);
  if (typography.letterSpacingPx !== undefined) props['letter-spacing'] = px(typography.letterSpacingPx);
  if (typography.textTransform !== undefined) props['text-transform'] = str(typography.textTransform);
  if (typography.textDecoration !== undefined) props['text-decoration'] = str(typography.textDecoration);
  if (typography.colorHex !== undefined) props.color = prop('color', typography.colorHex);
  return props;
}

function element(
  id: string,
  head: { elType: AtomicElement['elType']; widgetType?: string },
  settings: Record<string, AtomicProp>,
  styleProps: Record<string, AtomicProp>,
  children: AtomicElement[],
): AtomicElement {
  const styleId = `e-${id}-local`;
  const hasStyle = Object.keys(styleProps).length > 0;
  return {
    id,
    ...head,
    settings: hasStyle ? { classes: prop('classes', [styleId]), ...settings } : settings,
    isLocked: false,
    editor_settings: [],
    styles: hasStyle
      ? { [styleId]: { id: styleId, type: 'class', label: 'local', variants: [{ meta: { breakpoint: 'desktop', state: null }, props: styleProps }] } }
      : [],
    version: '0.0',
    elements: children,
  } as AtomicElement;
}

const link = (url: string, newTab = false): AtomicProp =>
  prop('link', newTab ? { destination: prop('url', url), isTargetBlank: prop('boolean', true) } : { destination: prop('url', url) });

function container(node: P15NeutralContainerNode, state: State): AtomicElement {
  reviewUnmapped(state, node, ['cornerRadiiPx', 'backgroundImage', 'gradient', 'boxShadow', 'sizing', 'wrap', 'grid', 'marginPx', 'position', 'zIndex']);
  for (const item of node.styleReviews ?? []) review(state, node, item.reasonCode, item.detail);
  const style: Record<string, AtomicProp> = { display: str('flex'), 'flex-direction': str(node.direction) };
  if (node.gapPx !== undefined) style.gap = px(node.gapPx);
  if (node.paddingPx) style.padding = dimensions(node.paddingPx);
  if (node.alignItems) style['align-items'] = str(FLEX_ALIGN[node.alignItems]!);
  if (node.justifyContent) style['justify-content'] = str(FLEX_JUSTIFY[node.justifyContent]!);
  if (node.backgroundColorHex) style.background = prop('background', { color: prop('color', node.backgroundColorHex) });
  if (node.cornerRadiusPx !== undefined) style['border-radius'] = px(node.cornerRadiusPx);
  if (node.border) {
    style['border-width'] = dimensions(node.border.widthPx);
    style['border-color'] = prop('color', node.border.colorHex);
    style['border-style'] = str(node.border.style);
  }
  if (node.clipsContent) style.overflow = str('hidden');
  const id = stableId('container', node.sourceNodeId, state);
  const children = node.children.map((child) => convert(child, state)).filter((child): child is AtomicElement => child !== null);
  return element(id, { elType: 'e-flexbox' }, { tag: str('div') }, style, children);
}

function heading(node: P15NeutralHeadingNode, state: State): AtomicElement | null {
  reviewUnmapped(state, node, ['sizing', 'position', 'zIndex']);
  if (!/^h[1-6]$/.test(node.level)) {
    review(state, node, 'ATOMIC_HEADING_TAG_UNSUPPORTED', `e-heading accepts h1–h6 only; got ${node.level}.`);
    return null;
  }
  const style = typographyProps(node.typography);
  if (node.align) style['text-align'] = str(TEXT_ALIGN[node.align]!);
  const settings: Record<string, AtomicProp> = { tag: str(node.level), title: prop('escaped-html', node.text) };
  if (node.href) settings.link = link(node.href);
  return element(stableId('heading', node.sourceNodeId, state), { elType: 'widget', widgetType: 'e-heading' }, settings, style, []);
}

function paragraph(node: P15NeutralTextNode, state: State): AtomicElement {
  reviewUnmapped(state, node, ['sizing', 'position', 'zIndex', 'paragraphSpacingPx']);
  for (const item of node.styleReviews ?? []) review(state, node, item.reasonCode, item.detail);
  const styledRuns = (node.paragraphs ?? []).some((p) => p.spans.some((span) => span.style !== undefined || span.href !== undefined));
  if (styledRuns) review(state, node, 'ATOMIC_RICH_TEXT_UNMAPPED', 'Per-span styles or links have no tested e-paragraph mapping.');
  if ((node.paragraphs?.length ?? 0) > 1) review(state, node, 'ATOMIC_MULTI_PARAGRAPH_UNMAPPED', 'Multiple paragraphs need separate e-paragraph elements.');
  const style = typographyProps(node.typography);
  if (node.align) style['text-align'] = str(TEXT_ALIGN[node.align]!);
  const settings: Record<string, AtomicProp> = { tag: str('p'), paragraph: prop('escaped-html', node.text) };
  if (node.href) settings.link = link(node.href);
  return element(stableId('text', node.sourceNodeId, state), { elType: 'widget', widgetType: 'e-paragraph' }, settings, style, []);
}

function button(node: P15NeutralButtonNode, state: State): AtomicElement {
  reviewUnmapped(state, node, ['sizing', 'position', 'zIndex', 'align']);
  if (node.nofollow) review(state, node, 'ATOMIC_PROPERTY_UNMAPPED', 'button.nofollow has no e-button link field.');
  for (const item of node.styleReviews ?? []) review(state, node, item.reasonCode, item.detail);
  const style = typographyProps(node.typography);
  if (node.backgroundColorHex) style.background = prop('background', { color: prop('color', node.backgroundColorHex) });
  if (node.paddingPx) style.padding = dimensions(node.paddingPx);
  if (node.cornerRadiusPx !== undefined) style['border-radius'] = px(node.cornerRadiusPx);
  const settings: Record<string, AtomicProp> = { text: prop('escaped-html', node.text) };
  if (node.url) settings.link = link(node.url, node.openInNewTab === true);
  return element(stableId('button', node.sourceNodeId, state), { elType: 'widget', widgetType: 'e-button' }, settings, style, []);
}

function image(node: P15NeutralImageNode, state: State): AtomicElement | null {
  reviewUnmapped(state, node, ['sizing']);
  if (!node.url) {
    review(state, node, 'ATOMIC_IMAGE_ASSET_UNMAPPED', 'Pack-relative image assets need the v4 media relink, which is not implemented.');
    return null;
  }
  const src = prop('image-src', {
    id: node.attachmentId === undefined ? null : prop('image-attachment-id', node.attachmentId),
    url: prop('url', node.url),
  });
  const style: Record<string, AtomicProp> = {};
  if (node.heightPx !== undefined) style.height = px(node.heightPx);
  if (node.objectFit) style['object-fit'] = str(node.objectFit);
  return element(stableId('image', node.sourceNodeId, state), { elType: 'widget', widgetType: 'e-image' }, { image: prop('image', { src }) }, style, []);
}

function convert(node: P15NeutralExportNode, state: State): AtomicElement | null {
  switch (node.kind) {
    case 'container': return container(node, state);
    case 'heading': return heading(node, state);
    case 'text': return paragraph(node, state);
    case 'button': return button(node, state);
    case 'image': return image(node, state);
    case 'review':
      review(state, node, node.reasonCode, node.detail);
      return null;
    default:
      review(state, node, 'ATOMIC_ELEMENT_UNMAPPED', `${node.kind} has no tested Elementor v4 Atomic element in this adapter.`);
      return null;
  }
}

function result(
  status: P15ElementorV4AtomicStatus,
  irValidation: P15NeutralExportValidationResult,
  reviews: P15ElementorV4AtomicReview[],
  template: ElementorV4AtomicTemplate | null,
  templateValidation: AtomicValidationResult | null,
): P15ElementorV4AtomicResult {
  return {
    schemaVersion: 1,
    generatorVersion: P15_ELEMENTOR_V4_ATOMIC_GENERATOR_VERSION,
    adapterVersion: ELEMENTOR_V4_ATOMIC_ADAPTER_VERSION,
    status,
    irValidation,
    templateValidation,
    reviews,
    template,
    templateJson: template === null ? null : JSON.stringify(template),
    targetCompatibilityClaim: false,
    importValidationStatus: 'NOT_RUN',
  };
}

export function generateElementorV4AtomicTemplate(value: unknown): P15ElementorV4AtomicResult {
  const irValidation = validateP15NeutralExportDocument(value);
  if (!irValidation.valid) return result('REJECTED_INVALID_IR', irValidation, [], null, null);
  const document = value as P15NeutralExportDocumentV1;
  const state: State = { usedIds: new Set(), reviews: [] };
  const content = document.nodes.map((node) => convert(node, state)).filter((node): node is AtomicElement => node !== null);
  if (state.reviews.length > 0) return result('REVIEW_REQUIRED', irValidation, state.reviews, null, null);
  const template: ElementorV4AtomicTemplate = { title: document.title, type: document.documentType, version: '0.4', page_settings: [], content };
  const templateValidation = validateElementorV4AtomicTemplate(template);
  if (!templateValidation.valid) {
    const reviews = templateValidation.issues.map((issue) => ({ sourceNodeId: '', reasonCode: issue.code, detail: `${issue.path}: ${issue.message}` }));
    return result('REVIEW_REQUIRED', irValidation, reviews, null, templateValidation);
  }
  return result('GENERATED_LOCAL_CANDIDATE', irValidation, [], template, templateValidation);
}
