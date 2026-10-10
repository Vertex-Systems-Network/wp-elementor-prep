import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  P15_NEUTRAL_EXPORT_MAX_DEPTH,
  P15_NEUTRAL_EXPORT_MAX_NODES,
  P15_NEUTRAL_EXPORT_MAX_RADIUS_PX,
  P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
  validateP15NeutralExportDocument,
  type P15NeutralContainerNode,
  type P15NeutralCrossAlignment,
  type P15NeutralDocumentType,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
  type P15NeutralJustification,
  type P15NeutralPaddingPx,
  type P15NeutralReviewNode,
  type P15NeutralStyleReview,
  type P15NeutralTextAlignment,
  type P15NeutralExportValidationResult,
  type P15NeutralParagraph,
  type P15NeutralTypography,
} from '../targets/elementor/neutral-export-ir';
import {
  P15_TEXT_FONT_WEIGHTS,
  paragraphProblems,
  paragraphSpacingValid,
  typographyProblems,
} from '../targets/elementor/typography';
import { buildP15ElementorExport } from '../targets/elementor/export-pipeline';
import { validP15LinkUrl } from '../targets/elementor/link-url';
import { detectP15Buttons, detectP15Headings } from '../targets/elementor/semantic-detection';
import type { P15ElementorV3GenerationResult } from '../targets/elementor/v3-template-generator';

export const P15_FIGMA_NEUTRAL_EXTRACTOR_VERSION = 'p15-figma-neutral-export-extractor-v3' as const;

export interface P15FigmaNeutralExtractionResult {
  schemaVersion: 1;
  extractorVersion: typeof P15_FIGMA_NEUTRAL_EXTRACTOR_VERSION;
  readOnly: true;
  document: P15NeutralExportDocumentV1;
  validation: P15NeutralExportValidationResult;
  generation: P15ElementorV3GenerationResult;
}

interface ExtractionState {
  visited: number;
  boundsExceeded: 'DEPTH_LIMIT_EXCEEDED' | 'NODE_LIMIT_EXCEEDED' | null;
}

interface ParsedContainerStyle<T> {
  value?: T | undefined;
  review?: {
    reasonCode: string;
    detail: string;
  };
}

function recordOf(node: SceneNode): Record<string, unknown> {
  return node as unknown as Record<string, unknown>;
}

function visible(node: SceneNode): boolean {
  return node.visible !== false;
}

function childNodes(node: SceneNode): readonly SceneNode[] {
  const children = recordOf(node).children;
  return Array.isArray(children) ? children as readonly SceneNode[] : [];
}

function hasImageFill(node: SceneNode): boolean {
  const fills = recordOf(node).fills;
  if (!Array.isArray(fills)) return false;
  return fills.some((paint) => (
    typeof paint === 'object'
    && paint !== null
    && (paint as { type?: unknown }).type === 'IMAGE'
    && (paint as { visible?: unknown }).visible !== false
  ));
}

function isContainerLike(node: SceneNode): boolean {
  return node.type !== 'TEXT' && (childNodes(node).length > 0 || 'layoutMode' in recordOf(node));
}

function isAbsolute(node: SceneNode): boolean {
  return recordOf(node).layoutPositioning === 'ABSOLUTE';
}

function finiteSpacing(value: unknown): number | null {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= 0
    && value <= P15_NEUTRAL_EXPORT_MAX_SPACING_PX
    ? value
    : null;
}

function finiteRadius(value: unknown): number | null {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= 0
    && value <= P15_NEUTRAL_EXPORT_MAX_RADIUS_PX
    ? value
    : null;
}

const GEOMETRY_TOLERANCE_PX = 0.5;

function visiblePaintList(value: unknown): Record<string, unknown>[] | 'MIXED' {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return 'MIXED';
  return value.filter((paint): paint is Record<string, unknown> => (
    typeof paint === 'object' && paint !== null && (paint as { visible?: unknown }).visible !== false
  ));
}

function hasPositiveStrokeWeight(record: Record<string, unknown>): boolean {
  const weights = [record.strokeWeight, record.strokeTopWeight, record.strokeRightWeight, record.strokeBottomWeight, record.strokeLeftWeight];
  // A mixed (non-number) weight is treated as visible: it cannot be proven to be zero.
  return weights.some((weight) => weight !== undefined && (typeof weight !== 'number' || weight > 0));
}

function childOverflowsBounds(node: SceneNode): boolean {
  const record = recordOf(node);
  const width = record.width;
  const height = record.height;
  if (typeof width !== 'number' || typeof height !== 'number') return false;
  return childNodes(node).some((child) => {
    if (!visible(child)) return false;
    const box = recordOf(child);
    const { x, y } = box;
    const childWidth = box.width;
    const childHeight = box.height;
    if (typeof x !== 'number' || typeof y !== 'number' || typeof childWidth !== 'number' || typeof childHeight !== 'number') return true;
    return x < -GEOMETRY_TOLERANCE_PX
      || y < -GEOMETRY_TOLERANCE_PX
      || x + childWidth > width + GEOMETRY_TOLERANCE_PX
      || y + childHeight > height + GEOMETRY_TOLERANCE_PX;
  });
}

/**
 * Visual facts the bounded generator does not map yet. Each one becomes an explicit REVIEW on the
 * node instead of being dropped silently, so the output can never look complete while missing them.
 */
function unmappedVisualFactReviews(node: SceneNode): P15NeutralStyleReview[] {
  const record = recordOf(node);
  const reviews: P15NeutralStyleReview[] = [];

  const strokes = visiblePaintList(record.strokes);
  if (strokes === 'MIXED' || (strokes.length > 0 && hasPositiveStrokeWeight(record))) {
    reviews.push({ reasonCode: 'STROKE_REQUIRES_REVIEW', detail: 'Visible Figma strokes/borders are not mapped yet and would be lost.' });
  }

  const effects = visiblePaintList(record.effects);
  if (effects === 'MIXED' || effects.length > 0) {
    const types = effects === 'MIXED' ? 'MIXED' : [...new Set(effects.map((effect) => String(effect.type ?? 'UNKNOWN')))].sort().join(', ');
    reviews.push({ reasonCode: 'EFFECT_REQUIRES_REVIEW', detail: `Visible Figma effects are not mapped yet and would be lost: ${types}.` });
  }

  if (record.opacity !== undefined && record.opacity !== 1) {
    reviews.push({ reasonCode: 'LAYER_OPACITY_REQUIRES_REVIEW', detail: `Layer opacity ${String(record.opacity)} is not mapped yet.` });
  }

  if (record.blendMode !== undefined && record.blendMode !== 'NORMAL' && record.blendMode !== 'PASS_THROUGH') {
    reviews.push({ reasonCode: 'BLEND_MODE_REQUIRES_REVIEW', detail: `Blend mode ${String(record.blendMode)} is not mapped yet.` });
  }

  if (record.rotation !== undefined && record.rotation !== 0) {
    reviews.push({ reasonCode: 'ROTATION_REQUIRES_REVIEW', detail: `Rotation ${String(record.rotation)}° is not mapped yet.` });
  }

  if (record.isMask === true) {
    reviews.push({ reasonCode: 'MASK_REQUIRES_REVIEW', detail: 'Figma mask layers are not mapped yet.' });
  }

  if (record.clipsContent === true && childOverflowsBounds(node)) {
    reviews.push({ reasonCode: 'CLIPPED_OVERFLOW_REQUIRES_REVIEW', detail: 'Container clips children that overflow its bounds; overflow clipping is not mapped yet.' });
  }

  return reviews;
}

function review(node: SceneNode, reasonCode: string, detail: string): P15NeutralReviewNode {
  return {
    kind: 'review',
    sourceNodeId: node.id,
    reasonCode,
    detail,
  };
}

function mapPrimaryAlignment(value: unknown): P15NeutralJustification | null {
  if (value === 'MIN') return 'start';
  if (value === 'CENTER') return 'center';
  if (value === 'MAX') return 'end';
  if (value === 'SPACE_BETWEEN') return 'space-between';
  return null;
}

function mapCounterAlignment(value: unknown): P15NeutralCrossAlignment | null {
  if (value === 'MIN') return 'start';
  if (value === 'CENTER') return 'center';
  if (value === 'MAX') return 'end';
  return null;
}

function mapTextAlignment(value: unknown): P15NeutralTextAlignment | null {
  if (value === 'LEFT') return 'start';
  if (value === 'CENTER') return 'center';
  if (value === 'RIGHT') return 'end';
  if (value === 'JUSTIFIED') return 'justify';
  return null;
}

function boundedPadding(node: SceneNode): P15NeutralPaddingPx | null {
  const record = recordOf(node);
  const top = finiteSpacing(record.paddingTop);
  const right = finiteSpacing(record.paddingRight);
  const bottom = finiteSpacing(record.paddingBottom);
  const left = finiteSpacing(record.paddingLeft);
  if (top === null || right === null || bottom === null || left === null) return null;
  return { top, right, bottom, left };
}

function colorChannel(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1 ? value : null;
}

function byteHex(channel: number): string {
  return Math.round(channel * 255).toString(16).padStart(2, '0').toUpperCase();
}

/** A single fully opaque SOLID paint as lowercase `#rrggbb`, else null (no blending, no guessing). */
function solidOpaqueHex(paint: Record<string, unknown> | undefined): string | null {
  if (!paint || paint.type !== 'SOLID' || (paint.opacity !== undefined && paint.opacity !== 1)) return null;
  const color = paint.color;
  if (typeof color !== 'object' || color === null || Array.isArray(color)) return null;
  const channels = ['r', 'g', 'b'].map((key) => colorChannel((color as Record<string, unknown>)[key]));
  if (channels.some((channel) => channel === null)) return null;
  return `#${channels.map((channel) => byteHex(channel as number).toLowerCase()).join('')}`;
}

function parseContainerBackground(node: SceneNode): ParsedContainerStyle<string> {
  const fills = recordOf(node).fills;
  if (fills === undefined) return {};
  if (!Array.isArray(fills)) {
    return {
      review: {
        reasonCode: 'UNSUPPORTED_CONTAINER_FILL_STATE',
        detail: 'Container fills are mixed or otherwise unavailable as a bounded paint list.',
      },
    };
  }

  const visiblePaints = fills.filter((paint) => (
    typeof paint !== 'object'
    || paint === null
    || (paint as { visible?: unknown }).visible !== false
  ));
  if (visiblePaints.length === 0) return {};
  if (visiblePaints.length > 1) {
    return {
      review: {
        reasonCode: 'MULTIPLE_VISIBLE_FILLS_REQUIRES_REVIEW',
        detail: 'Multiple visible container fills require an explicit fidelity mapping decision.',
      },
    };
  }

  const paint = visiblePaints[0];
  if (typeof paint !== 'object' || paint === null) {
    return {
      review: {
        reasonCode: 'UNSUPPORTED_CONTAINER_FILL_STATE',
        detail: 'Container fill is not a readable bounded Figma paint object.',
      },
    };
  }
  const paintRecord = paint as Record<string, unknown>;
  if (paintRecord.type === 'IMAGE') {
    return {
      review: {
        reasonCode: 'CONTAINER_BACKGROUND_IMAGE_REQUIRES_REVIEW',
        detail: 'Container background image requires a retained asset export/upload reference; the container and its children are preserved.',
      },
    };
  }
  if (paintRecord.type !== 'SOLID') {
    return {
      review: {
        reasonCode: 'UNSUPPORTED_CONTAINER_FILL_REQUIRES_REVIEW',
        detail: `Only one opaque SOLID container fill is mapped in this fidelity slice; observed ${String(paintRecord.type ?? 'UNKNOWN')}.`,
      },
    };
  }
  if (paintRecord.opacity !== undefined && paintRecord.opacity !== 1) {
    return {
      review: {
        reasonCode: 'TRANSLUCENT_SOLID_FILL_REQUIRES_REVIEW',
        detail: 'Translucent solid container fills require an explicit opacity mapping decision.',
      },
    };
  }
  const color = paintRecord.color;
  if (typeof color !== 'object' || color === null || Array.isArray(color)) {
    return {
      review: {
        reasonCode: 'UNSUPPORTED_CONTAINER_FILL_STATE',
        detail: 'Solid container fill does not expose bounded RGB channels.',
      },
    };
  }
  const colorRecord = color as Record<string, unknown>;
  const red = colorChannel(colorRecord.r);
  const green = colorChannel(colorRecord.g);
  const blue = colorChannel(colorRecord.b);
  if (red === null || green === null || blue === null) {
    return {
      review: {
        reasonCode: 'UNSUPPORTED_CONTAINER_FILL_STATE',
        detail: 'Solid container RGB channels must be finite values between 0 and 1.',
      },
    };
  }
  return { value: `#${byteHex(red)}${byteHex(green)}${byteHex(blue)}` };
}

function parseContainerRadius(node: SceneNode): ParsedContainerStyle<number> {
  const record = recordOf(node);
  const keys = ['topLeftRadius', 'topRightRadius', 'bottomRightRadius', 'bottomLeftRadius'] as const;
  const provided = keys.map((key) => record[key] !== undefined);

  if (provided.some(Boolean)) {
    if (!provided.every(Boolean)) {
      return {
        review: {
          reasonCode: 'UNSUPPORTED_CORNER_RADIUS_STATE',
          detail: 'Container exposes only a partial set of individual corner radii.',
        },
      };
    }
    const values = keys.map((key) => finiteRadius(record[key]));
    if (values.some((value) => value === null)) {
      return {
        review: {
          reasonCode: 'CORNER_RADIUS_OUT_OF_RANGE',
          detail: `Container corner radii must be finite values between 0 and ${P15_NEUTRAL_EXPORT_MAX_RADIUS_PX}px.`,
        },
      };
    }
    const [first, ...rest] = values as number[];
    if (rest.some((value) => value !== first)) {
      return {
        review: {
          reasonCode: 'NONUNIFORM_CORNER_RADIUS_REQUIRES_REVIEW',
          detail: 'Non-uniform container corner radii require an explicit fidelity mapping decision.',
        },
      };
    }
    return first === 0 ? {} : { value: first };
  }

  if (record.cornerRadius === undefined) return {};
  const radius = finiteRadius(record.cornerRadius);
  if (radius === null) {
    return {
      review: {
        reasonCode: 'CORNER_RADIUS_OUT_OF_RANGE',
        detail: `Uniform container corner radius must be finite and between 0 and ${P15_NEUTRAL_EXPORT_MAX_RADIUS_PX}px.`,
      },
    };
  }
  return radius === 0 ? {} : { value: radius };
}


const TEXT_SEGMENT_FIELDS = ['fontName', 'fontWeight', 'fontStyle', 'fontSize', 'lineHeight', 'letterSpacing',
  'textCase', 'textDecoration', 'fills', 'hyperlink'] as const;
const TYPOGRAPHY_FIELDS = ['fontFamily', 'fontWeight', 'fontStyle', 'fontSizePx', 'lineHeightPx', 'letterSpacingPx',
  'textTransform', 'textDecoration', 'colorHex'] as const;
type TextSegment = Pick<StyledTextSegment, typeof TEXT_SEGMENT_FIELDS[number] | 'characters'>;
const round2 = (value: number): number => Math.round(value * 100) / 100;

interface TextTypographyExtraction {
  href?: string;
  typography?: P15NeutralTypography;
  paragraphs?: P15NeutralParagraph[];
  paragraphSpacingPx?: number;
  reviews: P15NeutralStyleReview[];
}

/** A segment's URL link; a link to a Figma node or an unsafe URL becomes a review, never a guess. */
function segmentLink(segment: TextSegment, reviews: Map<string, P15NeutralStyleReview>): string | undefined {
  const target = segment.hyperlink;
  if (target === null || target === undefined) return undefined;
  if (target.type === 'URL' && validP15LinkUrl(target.value)) return target.value;
  const reasonCode = target.type === 'NODE' ? 'LINK_TO_NODE_REQUIRES_REVIEW' : 'LINK_URL_REQUIRES_REVIEW';
  if (!reviews.has(reasonCode)) {
    reviews.set(reasonCode, { reasonCode, detail: target.type === 'NODE'
      ? 'A link to another Figma node has no page URL to export.'
      : 'Only bounded http(s), mailto, tel, root-relative or fragment links are exported.' });
  }
  return undefined;
}

/** One Figma text segment as explicit neutral typography; unmappable facts become reviews, never guesses. */
function segmentTypography(segment: TextSegment, reviews: Map<string, P15NeutralStyleReview>): P15NeutralTypography {
  const style: P15NeutralTypography = {};
  const flag = (reasonCode: string, detail: string) => { if (!reviews.has(reasonCode)) reviews.set(reasonCode, { reasonCode, detail }); };
  style.fontFamily = segment.fontName.family;
  if (segment.fontStyle === 'ITALIC') style.fontStyle = 'italic';
  const weight = String(segment.fontWeight);
  if ((P15_TEXT_FONT_WEIGHTS as readonly string[]).includes(weight)) style.fontWeight = weight as NonNullable<P15NeutralTypography['fontWeight']>;
  else flag('FONT_WEIGHT_REQUIRES_REVIEW', `Font weight ${weight} is not one of 100..900 in steps of 100.`);
  style.fontSizePx = round2(segment.fontSize);
  if (segment.lineHeight.unit === 'PIXELS') style.lineHeightPx = round2(segment.lineHeight.value);
  else if (segment.lineHeight.unit === 'PERCENT') style.lineHeightPx = round2((segment.fontSize * segment.lineHeight.value) / 100);
  const letterSpacing = segment.letterSpacing.unit === 'PIXELS' ? segment.letterSpacing.value : (segment.fontSize * segment.letterSpacing.value) / 100;
  if (round2(letterSpacing) !== 0) style.letterSpacingPx = round2(letterSpacing);
  if (segment.textCase === 'UPPER') style.textTransform = 'uppercase';
  else if (segment.textCase === 'LOWER') style.textTransform = 'lowercase';
  else if (segment.textCase === 'TITLE') style.textTransform = 'capitalize';
  else if (segment.textCase !== 'ORIGINAL') flag('TEXT_CASE_REQUIRES_REVIEW', `Text case ${String(segment.textCase)} has no Elementor text-transform equivalent.`);
  if (segment.textDecoration === 'UNDERLINE') style.textDecoration = 'underline';
  else if (segment.textDecoration === 'STRIKETHROUGH') style.textDecoration = 'line-through';
  const fills = visiblePaintList(segment.fills);
  if (fills === 'MIXED' || fills.length > 1) {
    flag('TEXT_FILL_REQUIRES_REVIEW', 'Text with several visible fills is not mapped.');
  } else if (fills.length === 1) {
    const color = solidOpaqueHex(fills[0]);
    if (color === null) flag('TEXT_FILL_REQUIRES_REVIEW', 'Only a single fully opaque solid text fill is mapped.');
    else style.colorHex = color;
  }
  const out: P15NeutralTypography = {};
  for (const key of TYPOGRAPHY_FIELDS) if (style[key] !== undefined) (out as Record<string, unknown>)[key] = style[key];
  return out;
}

/**
 * Read the styled text segments (recovery M2.1). The style covering the most characters becomes the node
 * typography; other runs keep only the properties that differ. Paragraphs are split on newlines and
 * emitted only when the text has several paragraphs or mixed runs, so plain uniform text is unchanged.
 * A run that would need to unset a node property (no neutral "none" value) is flagged, not guessed.
 */
function extractTextTypography(node: TextNode): TextTypographyExtraction {
  if (typeof node.getStyledTextSegments !== 'function') return { reviews: [] };
  const reviews = new Map<string, P15NeutralStyleReview>();
  const segments = (node.getStyledTextSegments([...TEXT_SEGMENT_FIELDS]) as TextSegment[])
    .map((segment) => ({ text: segment.characters, style: segmentTypography(segment, reviews), href: segmentLink(segment, reviews) }));
  // One URL across the whole text is a node link; anything else keeps links on their own runs.
  const links = new Set(segments.map((segment) => segment.href ?? null));
  const nodeHref = links.size === 1 && !links.has(null) ? [...links][0]! : undefined;
  const weights = new Map<string, number>();
  for (const segment of segments) {
    const key = JSON.stringify(segment.style);
    weights.set(key, (weights.get(key) ?? 0) + segment.text.length);
  }
  let dominantKey = '';
  let dominantWeight = -1;
  for (const [key, weight] of weights) if (weight > dominantWeight) { dominantKey = key; dominantWeight = weight; }
  const dominant = (dominantKey ? JSON.parse(dominantKey) : {}) as P15NeutralTypography;
  const difference = (style: P15NeutralTypography): P15NeutralTypography | undefined => {
    const diff: Record<string, unknown> = {};
    for (const key of TYPOGRAPHY_FIELDS) {
      if (style[key] === dominant[key]) continue;
      if (style[key] === undefined) {
        if (!reviews.has('MIXED_TYPOGRAPHY_REQUIRES_REVIEW')) {
          reviews.set('MIXED_TYPOGRAPHY_REQUIRES_REVIEW', { reasonCode: 'MIXED_TYPOGRAPHY_REQUIRES_REVIEW', detail: `A text run removes ${key}, which inline styles cannot express.` });
        }
        continue;
      }
      diff[key] = style[key];
    }
    return Object.keys(diff).length > 0 ? diff as P15NeutralTypography : undefined;
  };
  const paragraphs: P15NeutralParagraph[] = [{ spans: [] }];
  for (const segment of segments) {
    const style = difference(segment.style);
    const href = nodeHref === undefined ? segment.href : undefined;
    segment.text.replace(/\r\n?/g, '\n').split('\n').forEach((part, index) => {
      if (index > 0) paragraphs.push({ spans: [] });
      if (part.length > 0) paragraphs[paragraphs.length - 1]!.spans.push({ text: part, ...(style ? { style } : {}), ...(href ? { href } : {}) });
    });
  }
  const mixed = paragraphs.some((paragraph) => paragraph.spans.some((span) => span.style !== undefined || span.href !== undefined));
  const spacing = typeof node.paragraphSpacing === 'number' && node.paragraphSpacing > 0 ? round2(node.paragraphSpacing) : undefined;
  const result: TextTypographyExtraction = { reviews: [...reviews.values()] };
  if (nodeHref !== undefined) result.href = nodeHref;
  if (Object.keys(dominant).length > 0) result.typography = dominant;
  if (paragraphs.length > 1 || mixed) result.paragraphs = paragraphs;
  if (spacing !== undefined) result.paragraphSpacingPx = spacing;
  const problems = [
    ...(result.typography ? typographyProblems(result.typography, 'typography') : []),
    ...(result.paragraphs ? paragraphProblems(result.paragraphs, node.characters, 'paragraphs') : []),
    ...(spacing !== undefined && !paragraphSpacingValid(spacing) ? [{ path: 'paragraphSpacingPx', message: 'out of range' }] : []),
  ];
  if (problems.length > 0) {
    return { reviews: [...result.reviews, { reasonCode: 'TYPOGRAPHY_OUT_OF_RANGE', detail: `Text typography is outside the supported bounds: ${problems.map((problem) => problem.path).join(', ')}.` }] };
  }
  return result;
}

function extractText(node: SceneNode): P15NeutralExportNode {
  if (node.type !== 'TEXT') return review(node, 'UNSUPPORTED_NODE_TYPE', `Unsupported visible Figma node type: ${node.type}.`);
  if (node.characters.trim().length === 0) {
    return review(node, 'EMPTY_TEXT_REQUIRES_REVIEW', 'Empty visible text cannot be safely dropped because it may carry layout intent.');
  }
  const align = mapTextAlignment(node.textAlignHorizontal);
  if (align === null) {
    return review(node, 'UNSUPPORTED_TEXT_ALIGNMENT', `Unsupported Figma text alignment: ${String(node.textAlignHorizontal)}.`);
  }
  const typography = extractTextTypography(node);
  const styleReviews = [...unmappedVisualFactReviews(node), ...typography.reviews];
  return {
    kind: 'text',
    sourceNodeId: node.id,
    text: node.characters,
    align,
    ...(typography.href !== undefined ? { href: typography.href } : {}),
    ...(typography.typography ? { typography: typography.typography } : {}),
    ...(typography.paragraphs ? { paragraphs: typography.paragraphs } : {}),
    ...(typography.paragraphSpacingPx !== undefined ? { paragraphSpacingPx: typography.paragraphSpacingPx } : {}),
    ...(styleReviews.length > 0 ? { styleReviews } : {}),
  };
}

function extractContainer(
  node: SceneNode,
  depth: number,
  state: ExtractionState,
): P15NeutralExportNode {
  const record = recordOf(node);
  const mode = record.layoutMode;
  if (mode !== 'HORIZONTAL' && mode !== 'VERTICAL') {
    const reason = mode === 'GRID' ? 'GRID_LAYOUT_REQUIRES_REVIEW' : 'MANUAL_LAYOUT_REQUIRES_REVIEW';
    return review(node, reason, `V1 extraction requires HORIZONTAL or VERTICAL Auto Layout; observed ${String(mode ?? 'NONE')}.`);
  }
  if (record.layoutWrap === 'WRAP') {
    return review(node, 'WRAPPED_AUTO_LAYOUT_REQUIRES_REVIEW', 'Wrapped Figma Auto Layout is not mapped by the bounded V1 Elementor generator.');
  }

  const gapPx = finiteSpacing(record.itemSpacing);
  const paddingPx = boundedPadding(node);
  if (gapPx === null || paddingPx === null) {
    return review(node, 'SPACING_OUT_OF_RANGE', `Auto Layout spacing must be finite and within 0-${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}px.`);
  }

  const justifyContent = mapPrimaryAlignment(record.primaryAxisAlignItems);
  const alignItems = mapCounterAlignment(record.counterAxisAlignItems);
  if (justifyContent === null || alignItems === null) {
    return review(
      node,
      'UNSUPPORTED_AUTO_LAYOUT_ALIGNMENT',
      `V1 cannot safely map primary=${String(record.primaryAxisAlignItems)} counter=${String(record.counterAxisAlignItems)}.`,
    );
  }

  // Style facts that cannot be mapped yet stay REVIEW on the container itself, so the
  // container's layout and children are still extracted instead of being dropped.
  const background = parseContainerBackground(node);
  const radius = parseContainerRadius(node);
  const styleReviews: P15NeutralStyleReview[] = [
    ...[background.review, radius.review]
      .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined)
      .map((entry) => ({ reasonCode: entry.reasonCode, detail: entry.detail })),
    ...unmappedVisualFactReviews(node),
  ];

  const children: P15NeutralExportNode[] = [];
  for (const child of childNodes(node)) {
    if (!visible(child)) continue;
    const extracted = extractNode(child, depth + 1, state, mode === 'VERTICAL' ? 'column' : 'row');
    if (state.boundsExceeded) break;
    if (extracted) children.push(extracted);
  }

  const container: P15NeutralContainerNode = {
    kind: 'container',
    sourceNodeId: node.id,
    direction: mode === 'HORIZONTAL' ? 'row' : 'column',
    gapPx,
    paddingPx,
    alignItems,
    justifyContent,
    ...(background.value !== undefined ? { backgroundColorHex: background.value } : {}),
    ...(radius.value !== undefined ? { cornerRadiusPx: radius.value } : {}),
    ...(styleReviews.length > 0 ? { styleReviews } : {}),
    children,
  };
  return container;
}

/**
 * Dividers and spacers (recovery M2.2c). A horizontal LINE with one solid opaque stroke, or a thin solid
 * RECTANGLE (height <= 10px and width >= 4x height), becomes a divider. An empty leaf FRAME or RECTANGLE with
 * no visible fills, strokes or effects inside a vertical Auto Layout becomes a spacer of its height (the
 * Elementor spacer is vertical only, so in a row it stays whatever it was). Anything else returns null and
 * keeps its previous handling; a line that cannot map exactly becomes an explicit review.
 */
function extractRule(node: SceneNode, parentDirection: 'row' | 'column' | null): P15NeutralExportNode | null {
  const record = recordOf(node);
  const hasChildren = childNodes(node).length > 0;
  const fills = visiblePaintList(record.fills);
  const strokes = visiblePaintList(record.strokes);
  const effects = visiblePaintList(record.effects);
  const width = typeof record.width === 'number' && Number.isFinite(record.width) ? record.width : null;
  const height = typeof record.height === 'number' && Number.isFinite(record.height) ? record.height : null;
  const plain = unmappedVisualFactReviews(node).length === 0;
  if (node.type === 'LINE') {
    const weight = typeof record.strokeWeight === 'number' ? Math.round(record.strokeWeight * 100) / 100 : null;
    const color = strokes !== 'MIXED' && strokes.length === 1 ? solidOpaqueHex(strokes[0]) : null;
    const rotated = record.rotation !== undefined && record.rotation !== 0;
    if (rotated || color === null || weight === null || weight < 0.1 || weight > 10 || width === null || width <= 0
      || width > P15_NEUTRAL_EXPORT_MAX_SPACING_PX || effects === 'MIXED' || effects.length > 0) {
      return review(node, 'DIVIDER_REQUIRES_REVIEW', 'Only a horizontal line with one opaque solid stroke of 0.1-10px maps to a divider.');
    }
    return { kind: 'divider', sourceNodeId: node.id, weightPx: weight, colorHex: color, widthPx: Math.round(width * 100) / 100 };
  }
  if (hasChildren || (node.type !== 'RECTANGLE' && node.type !== 'FRAME') || width === null || height === null) return null;
  if (fills !== 'MIXED' && fills.length === 0 && strokes !== 'MIXED' && strokes.length === 0 && effects !== 'MIXED' && effects.length === 0
    && plain && parentDirection === 'column' && height > 0 && height <= P15_NEUTRAL_EXPORT_MAX_SPACING_PX) {
    return { kind: 'spacer', sourceNodeId: node.id, heightPx: Math.round(height * 100) / 100 };
  }
  if (node.type === 'RECTANGLE' && fills !== 'MIXED' && fills.length === 1 && strokes !== 'MIXED' && strokes.length === 0 && plain
    && height >= 0.1 && height <= 10 && width >= height * 4 && width <= P15_NEUTRAL_EXPORT_MAX_SPACING_PX) {
    const color = solidOpaqueHex(fills[0]);
    if (color !== null) return { kind: 'divider', sourceNodeId: node.id, weightPx: Math.round(height * 100) / 100, colorHex: color, widthPx: Math.round(width * 100) / 100 };
  }
  return null;
}

function extractNode(
  node: SceneNode,
  depth: number,
  state: ExtractionState,
  parentDirection: 'row' | 'column' | null = null,
): P15NeutralExportNode | null {
  if (!visible(node)) return null;
  if (depth > P15_NEUTRAL_EXPORT_MAX_DEPTH) {
    state.boundsExceeded = 'DEPTH_LIMIT_EXCEEDED';
    return null;
  }
  state.visited += 1;
  if (state.visited > P15_NEUTRAL_EXPORT_MAX_NODES) {
    state.boundsExceeded = 'NODE_LIMIT_EXCEEDED';
    return null;
  }
  if (isAbsolute(node)) {
    return review(node, 'ABSOLUTE_POSITION_REQUIRES_REVIEW', 'Absolute-positioned Figma content requires an explicit target mapping decision.');
  }
  if (hasImageFill(node) && !isContainerLike(node)) {
    return review(node, 'IMAGE_ASSET_EXPORT_REQUIRED', 'Image-backed Figma content requires a retained asset export/upload reference before Elementor generation.');
  }
  if (node.type === 'TEXT') return extractText(node);
  const rule = extractRule(node, parentDirection);
  if (rule) return rule;
  if (isContainerLike(node)) {
    return extractContainer(node, depth, state);
  }
  return review(node, 'UNSUPPORTED_NODE_TYPE', `Unsupported visible Figma node type: ${node.type}.`);
}

function boundsReview(frame: FrameNode, reason: NonNullable<ExtractionState['boundsExceeded']>): P15NeutralReviewNode {
  return {
    kind: 'review',
    sourceNodeId: `${frame.id}:p15-bounds`,
    reasonCode: reason,
    detail: reason === 'DEPTH_LIMIT_EXCEEDED'
      ? `Figma export tree exceeds the V1 depth limit of ${P15_NEUTRAL_EXPORT_MAX_DEPTH}.`
      : `Figma export tree exceeds the V1 node limit of ${P15_NEUTRAL_EXPORT_MAX_NODES}.`,
  };
}

/**
 * Read one selected Figma Frame into bounded target-neutral export intent.
 * This function performs no node mutation, clone, plugin-data write, network access or file export.
 */
export function extractP15NeutralExportDocumentFromFigmaFrame(
  frame: FrameNode,
  documentType: P15NeutralDocumentType = 'page',
): P15NeutralExportDocumentV1 {
  const state: ExtractionState = { visited: 0, boundsExceeded: null };
  const extracted = extractNode(frame, 1, state);
  const nodes: P15NeutralExportNode[] = state.boundsExceeded
    ? [boundsReview(frame, state.boundsExceeded)]
    : extracted
      ? [extracted]
      : [];

  // Recovery M2.2: deterministic semantic detection on the extracted IR, with layer names as secondary hints.
  const names = new Map<string, string>();
  collectLayerNames(frame, names);
  return detectP15Headings(detectP15Buttons({
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: frame.name,
    documentType,
    nodes,
  }, names), names);
}

function collectLayerNames(node: SceneNode, names: Map<string, string>): void {
  if (typeof node.name === 'string') names.set(node.id, node.name);
  for (const child of childNodes(node)) collectLayerNames(child, names);
}

export function buildP15ElementorV1PreviewFromFigmaFrame(
  frame: FrameNode,
  documentType: P15NeutralDocumentType = 'page',
): P15FigmaNeutralExtractionResult {
  const document = extractP15NeutralExportDocumentFromFigmaFrame(frame, documentType);
  const validation = validateP15NeutralExportDocument(document);
  // The shared export path (recovery M1.6). The plugin has no page manifest yet, so this is the generated base.
  const generation = buildP15ElementorExport(document).generation;
  return {
    schemaVersion: 1,
    extractorVersion: P15_FIGMA_NEUTRAL_EXTRACTOR_VERSION,
    readOnly: true,
    document,
    validation,
    generation,
  };
}