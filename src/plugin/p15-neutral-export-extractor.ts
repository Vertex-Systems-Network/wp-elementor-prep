import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  P15_NEUTRAL_EXPORT_MAX_DEPTH,
  P15_NEUTRAL_EXPORT_MAX_NODES,
  P15_NEUTRAL_EXPORT_MAX_RADIUS_PX,
  P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
  validateP15NeutralExportDocument,
  type P15NeutralContainerNode,
  type P15NeutralCrossAlignment,
  type P15NeutralDividerNode,
  type P15NeutralDocumentType,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
  type P15NeutralJustification,
  type P15NeutralPaddingPx,
  type P15NeutralImageNode,
  type P15NeutralReviewNode,
  type P15NeutralStyleReview,
  type P15NeutralTextAlignment,
  type P15NeutralExportValidationResult,
  type P15NeutralParagraph,
  type P15NeutralTypography,
} from '../targets/elementor/neutral-export-ir';
import {
  P15_SPAN_RESETS,
  P15_TEXT_FONT_WEIGHTS,
  paragraphProblems,
  paragraphSpacingValid,
  typographyProblems,
} from '../targets/elementor/typography';
import { buildP15ElementorExport } from '../targets/elementor/export-pipeline';
import { deriveP15Gradient, type P15NeutralGradient } from '../targets/elementor/container-gradient';
import { deriveP15BoxShadow } from '../targets/elementor/container-shadow';
import { deriveP15ContainerBorder, deriveP15CornerRadii, type P15NeutralBoxPx, type P15NeutralCornerRadii } from '../targets/elementor/container-visual-style';
import {
  deriveP15ContainerSizing,
  deriveP15WidgetSizing,
  fillDistributionReview,
  type P15ContainerSizingFacts,
  type P15FigmaSizingMode,
} from '../targets/elementor/container-sizing';
import { deriveP15Wrap, type P15NeutralWrap } from '../targets/elementor/container-wrap';
import { deriveP15Grid, type P15NeutralGrid } from '../targets/elementor/container-grid';
import { deriveP15BackgroundImage, type P15NeutralBackgroundImage } from '../targets/elementor/container-background-image';
import { assignP15Overlap, BASELINE_REVIEW, DISTRIBUTED_JUSTIFICATIONS } from '../targets/elementor/container-spacing';
import {
  ABSOLUTE_POSITION_REVIEW,
  assignP15StackOrder,
  deriveP15AbsolutePosition,
} from '../targets/elementor/absolute-position';
import { validP15LinkUrl } from '../targets/elementor/link-url';
import { auditP15PropertyCoverage, type P15PropertyCoverageAuditV1 } from './p15-property-coverage-audit';
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
  /** Recovery M2.9b: proof that every visible property was mapped or reviewed. */
  coverageAudit: P15PropertyCoverageAuditV1;
}

interface ExtractionState {
  visited: number;
  boundsExceeded: 'DEPTH_LIMIT_EXCEEDED' | 'NODE_LIMIT_EXCEEDED' | null;
  /** Figma sizing facts per extracted container, for button sizing after semantic detection (M2.3d). */
  sizingFacts: Map<string, P15ContainerSizingFacts>;
  /** Recovery M3.3: pack-relative asset path per image layer id, when assets were collected. */
  assetPaths: ReadonlyMap<string, string>;
  /** Recovery M3.4b: Stored Original pack path and natural width per image hash. */
  originals: ReadonlyMap<string, { path: string; widthPx: number }>;
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
function unmappedVisualFactReviews(node: SceneNode, container = false): P15NeutralStyleReview[] {
  const record = recordOf(node);
  const reviews: P15NeutralStyleReview[] = [];

  // Containers map strokes and clipping themselves (recovery M2.4a); everything else keeps the review.
  const strokes = visiblePaintList(record.strokes);
  if (!container && (strokes === 'MIXED' || (strokes.length > 0 && hasPositiveStrokeWeight(record)))) {
    reviews.push({ reasonCode: 'STROKE_REQUIRES_REVIEW', detail: 'Visible Figma strokes/borders are not mapped yet and would be lost.' });
  }

  const effects = visiblePaintList(record.effects);
  if (!container && (effects === 'MIXED' || effects.length > 0)) {
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

  if (!container && record.clipsContent === true && childOverflowsBounds(node)) {
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
  if (value === 'SPACE_AROUND') return 'space-around';
  if (value === 'SPACE_EVENLY') return 'space-evenly';
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

function parseContainerBackground(node: SceneNode, originals: ExtractionState['originals'] = new Map()): ParsedContainerStyle<string> & { gradient?: P15NeutralGradient; backgroundImage?: P15NeutralBackgroundImage } {
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
    // Recovery M3.4b: FILL / FIT / TILE on the collected Stored Original map exactly; anything else stays review.
    const original = typeof paintRecord.imageHash === 'string' ? originals.get(paintRecord.imageHash) : undefined;
    const derived = deriveP15BackgroundImage({ paint: paintRecord, originalPath: original?.path, originalWidthPx: original?.widthPx });
    return derived.backgroundImage !== undefined ? { backgroundImage: derived.backgroundImage } : { review: derived.review! };
  }
  if (paintRecord.type === 'GRADIENT_LINEAR' || paintRecord.type === 'GRADIENT_RADIAL') {
    // Recovery M2.4c: two-stop axis-aligned linear and default radial gradients map exactly.
    const derived = deriveP15Gradient(paintRecord);
    return derived.gradient !== undefined ? { gradient: derived.gradient } : { review: derived.review! };
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

function parseContainerRadius(node: SceneNode): ParsedContainerStyle<number> & { radii?: P15NeutralCornerRadii } {
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
      const [topLeft, topRight, bottomRight, bottomLeft] = values as number[];
      return { radii: { topLeft: topLeft!, topRight: topRight!, bottomRight: bottomRight!, bottomLeft: bottomLeft! } };
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
      if (style[key] === undefined && key in P15_SPAN_RESETS) {
        // Recovery M2.9c: dropping the node's italic or case is an exact inherited reset.
        diff[key] = P15_SPAN_RESETS[key as keyof typeof P15_SPAN_RESETS];
        continue;
      }
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

function extractText(node: SceneNode, parent: ParentLayout): P15NeutralExportNode {
  if (node.type !== 'TEXT') return review(node, 'UNSUPPORTED_NODE_TYPE', `Unsupported visible Figma node type: ${node.type}.`);
  if (node.characters.trim().length === 0) {
    return review(node, 'EMPTY_TEXT_REQUIRES_REVIEW', 'Empty visible text cannot be safely dropped because it may carry layout intent.');
  }
  const align = mapTextAlignment(node.textAlignHorizontal);
  if (align === null) {
    return review(node, 'UNSUPPORTED_TEXT_ALIGNMENT', `Unsupported Figma text alignment: ${String(node.textAlignHorizontal)}.`);
  }
  const typography = extractTextTypography(node);
  // Recovery M2.3b: heading/text width and flex-item sizing; a fixed text height is REVIEW.
  const sized = deriveP15WidgetSizing(sizingFacts(recordOf(node), parent));
  const styleReviews = [...unmappedVisualFactReviews(node), ...typography.reviews, ...sized.reviews];
  return {
    kind: 'text',
    sourceNodeId: node.id,
    text: node.characters,
    align,
    ...(typography.href !== undefined ? { href: typography.href } : {}),
    ...(typography.typography ? { typography: typography.typography } : {}),
    ...(typography.paragraphs ? { paragraphs: typography.paragraphs } : {}),
    ...(typography.paragraphSpacingPx !== undefined ? { paragraphSpacingPx: typography.paragraphSpacingPx } : {}),
    ...(sized.sizing ? { sizing: sized.sizing } : {}),
    ...(styleReviews.length > 0 ? { styleReviews } : {}),
  };
}

type ParentLayout = P15ContainerSizingFacts['parent'];

/** Parent geometry an absolute child is placed in (recovery M2.5). */
interface AbsoluteParent {
  width: unknown;
  height: unknown;
  borderPx?: P15NeutralBoxPx;
}

function sizingMode(value: unknown): P15FigmaSizingMode | undefined {
  return value === 'FIXED' || value === 'HUG' || value === 'FILL' ? value : undefined;
}

function optionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Recovery M2.7: without `layoutSizing*`, the older `layoutGrow: 1` (along the parent) and `layoutAlign: STRETCH`
 * (across the parent) still mean FILL on that axis. Anything else stays unknown, as before.
 */
function legacyFill(record: Record<string, unknown>, parent: ParentLayout, axis: 'row' | 'column'): P15FigmaSizingMode | undefined {
  if (!parent) return undefined;
  if (parent.direction === axis) return record.layoutGrow === 1 ? 'FILL' : undefined;
  return record.layoutAlign === 'STRETCH' ? 'FILL' : undefined;
}

function sizingFacts(record: Record<string, unknown>, parent: ParentLayout): P15ContainerSizingFacts {
  return {
    parent,
    horizontal: sizingMode(record.layoutSizingHorizontal) ?? legacyFill(record, parent, 'row'),
    vertical: sizingMode(record.layoutSizingVertical) ?? legacyFill(record, parent, 'column'),
    width: typeof record.width === 'number' ? record.width : NaN,
    height: typeof record.height === 'number' ? record.height : NaN,
    minWidth: optionalNumber(record.minWidth),
    maxWidth: optionalNumber(record.maxWidth),
    minHeight: optionalNumber(record.minHeight),
    maxHeight: optionalNumber(record.maxHeight),
  };
}

function extractContainer(
  node: SceneNode,
  depth: number,
  state: ExtractionState,
  parent: ParentLayout,
): P15NeutralExportNode {
  const record = recordOf(node);
  const mode = record.layoutMode;
  if (mode !== 'HORIZONTAL' && mode !== 'VERTICAL' && mode !== 'GRID') {
    return review(node, 'MANUAL_LAYOUT_REQUIRES_REVIEW', `V1 extraction requires Auto Layout or a grid; observed ${String(mode ?? 'NONE')}.`);
  }

  // Recovery M2.6b: a strict grid becomes a Grid Container; its children stretch in their cells.
  let grid: P15NeutralGrid | undefined;
  let gridChildReview: P15NeutralStyleReview | undefined;
  if (mode === 'GRID') {
    const gridded = deriveP15Grid({
      rowCount: record.gridRowCount,
      columnCount: record.gridColumnCount,
      rowGap: record.gridRowGap,
      columnGap: record.gridColumnGap,
      rowSizes: record.gridRowSizes,
      columnSizes: record.gridColumnSizes,
      children: childNodes(node).filter((child) => visible(child) && !isAbsolute(child)).map((child) => {
        const entry = recordOf(child);
        return {
          rowAnchor: entry.gridRowAnchorIndex,
          columnAnchor: entry.gridColumnAnchorIndex,
          rowSpan: entry.gridRowSpan,
          columnSpan: entry.gridColumnSpan,
          horizontalSizing: entry.layoutSizingHorizontal,
          verticalSizing: entry.layoutSizingVertical,
          horizontalAlign: entry.gridChildHorizontalAlign,
          verticalAlign: entry.gridChildVerticalAlign,
        };
      }),
    });
    if (gridded.review) return review(node, gridded.review.reasonCode, gridded.review.detail);
    grid = gridded.grid;
    gridChildReview = gridded.childReview;
  }

  // Recovery M2.7: negative spacing (an overlap) is checked after the children are extracted.
  const spacing = grid ? 0 : finiteSpacing(typeof record.itemSpacing === 'number' ? Math.abs(record.itemSpacing) : record.itemSpacing);
  const paddingPx = boundedPadding(node);
  if (spacing === null || paddingPx === null) {
    return review(node, 'SPACING_OUT_OF_RANGE', `Auto Layout spacing must be finite and within ±${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}px (padding 0-${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}px).`);
  }

  const justifyContent = grid ? 'start' : mapPrimaryAlignment(record.primaryAxisAlignItems);
  // Recovery M2.7: BASELINE has no Elementor option; it is laid out as start and flagged.
  const baseline = !grid && record.counterAxisAlignItems === 'BASELINE';
  const alignItems = grid ? 'stretch' : baseline ? 'start' : mapCounterAlignment(record.counterAxisAlignItems);
  // A distributed main axis divides only the free space, as CSS does with no gap.
  const distributed = justifyContent !== null && DISTRIBUTED_JUSTIFICATIONS.includes(justifyContent);
  const overlapPx = !grid && !distributed && typeof record.itemSpacing === 'number' && record.itemSpacing < 0 ? -spacing : 0;
  const gapPx = distributed || overlapPx < 0 ? 0 : spacing;
  if (justifyContent === null || alignItems === null) {
    return review(
      node,
      'UNSUPPORTED_AUTO_LAYOUT_ALIGNMENT',
      `V1 cannot safely map primary=${String(record.primaryAxisAlignItems)} counter=${String(record.counterAxisAlignItems)}.`,
    );
  }

  // Recovery M2.6a: a wrapped row writes flex wrap, the line gap and align-content.
  let wrap: P15NeutralWrap | undefined;
  if (record.layoutWrap === 'WRAP') {
    const inFlow = childNodes(node).filter((child) => visible(child) && !isAbsolute(child));
    const wrapped = deriveP15Wrap({
      layoutMode: mode,
      counterAxisSpacing: record.counterAxisSpacing,
      counterAxisAlignContent: record.counterAxisAlignContent,
      alignItems,
      childLayoutAligns: inFlow.map((child) => recordOf(child).layoutAlign),
    });
    if (wrapped.review) return review(node, wrapped.review.reasonCode, wrapped.review.detail);
    wrap = wrapped.wrap;
  }

  // Style facts that cannot be mapped yet stay REVIEW on the container itself, so the
  // container's layout and children are still extracted instead of being dropped.
  const background = parseContainerBackground(node, state.originals);
  const radius = parseContainerRadius(node);
  // Recovery M2.4a: non-uniform radii, an INSIDE solid border (padding lowered by its width) and a visible clip.
  const radii = radius.radii === undefined ? {} : deriveP15CornerRadii(radius.radii, Number(record.width), Number(record.height));
  const strokes = visiblePaintList(record.strokes);
  const bordered = deriveP15ContainerBorder({
    paints: strokes === 'MIXED' ? 'MIXED' : strokes.map((paint) => solidOpaqueHex(paint)),
    weight: record.strokeWeight,
    topWeight: record.strokeTopWeight,
    rightWeight: record.strokeRightWeight,
    bottomWeight: record.strokeBottomWeight,
    leftWeight: record.strokeLeftWeight,
    align: record.strokeAlign,
    dashPattern: record.dashPattern,
    includedInLayout: record.strokesIncludedInLayout,
    emptyFixedBox: !childNodes(node).some(visible) && record.layoutSizingHorizontal === 'FIXED' && record.layoutSizingVertical === 'FIXED',
  }, paddingPx);
  const shadowed = deriveP15BoxShadow(visiblePaintList(record.effects));
  const rounded = radius.value !== undefined || radii.radii !== undefined;
  const clips = record.clipsContent === true && (childOverflowsBounds(node) || (rounded && childNodes(node).some(visible)));
  const styleReviews: P15NeutralStyleReview[] = [
    ...[background.review, radius.review, radii.review, bordered.review, shadowed.review]
      .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined)
      .map((entry) => ({ reasonCode: entry.reasonCode, detail: entry.detail })),
    ...unmappedVisualFactReviews(node, true),
  ];
  if (baseline) {
    styleReviews.push({ reasonCode: BASELINE_REVIEW, detail: 'Baseline alignment has no Elementor align-items option; it is laid out as start.' });
  }

  // Recovery M2.3a: exact sizing; constraints without an exact mapping stay REVIEW on this container.
  const direction = mode === 'VERTICAL' ? 'column' : 'row';
  const facts = sizingFacts(record, parent);
  state.sizingFacts.set(node.id, facts);
  const { horizontal, vertical } = facts;
  const sized = deriveP15ContainerSizing(facts);
  styleReviews.push(...sized.reviews);

  const children: P15NeutralExportNode[] = [];
  for (const child of childNodes(node)) {
    if (!visible(child)) continue;
    const extracted = extractNode(child, depth + 1, state, { direction, alignItems },
      { width: record.width, height: record.height, ...(bordered.border ? { borderPx: bordered.border.widthPx } : {}) });
    if (state.boundsExceeded) break;
    if (extracted) children.push(extracted);
  }
  if (gridChildReview) styleReviews.push(gridChildReview);
  const distribution = grid ? null : fillDistributionReview(
    direction,
    direction === 'row' ? horizontal : vertical,
    children.map((child) => (child.kind === 'container' || child.kind === 'text' || child.kind === 'heading' ? child.sizing : undefined)),
  );
  if (distribution) styleReviews.push(distribution);
  if (wrap !== undefined && childNodes(node).some((child) => visible(child) && !isAbsolute(child) && recordOf(child).layoutSizingHorizontal === 'FILL')) {
    styleReviews.push({ reasonCode: 'SIZE_FILL_IN_WRAP_REQUIRES_REVIEW', detail: 'A FILL-width child of a wrapped row would take a whole line in CSS.' });
  }
  let flowChildren = children;
  if (overlapPx < 0) {
    const overlap = assignP15Overlap(children, overlapPx, { direction, wrapped: wrap !== undefined, reverseZIndex: record.itemReverseZIndex === true });
    if (overlap.review) styleReviews.push(overlap.review);
    flowChildren = overlap.children;
  }
  // Recovery M2.5: siblings from the first absolute child on carry their layer order; the stack stays inside this container.
  const stack = assignP15StackOrder(flowChildren);
  if (stack.review) styleReviews.push(stack.review);

  const container: P15NeutralContainerNode = {
    kind: 'container',
    sourceNodeId: node.id,
    direction,
    ...(grid ? { grid } : { gapPx, alignItems, justifyContent }),
    paddingPx: bordered.paddingPx ?? paddingPx,
    ...(background.value !== undefined ? { backgroundColorHex: background.value } : {}),
    ...(background.gradient !== undefined ? { gradient: background.gradient } : {}),
    ...(background.backgroundImage !== undefined ? { backgroundImage: background.backgroundImage } : {}),
    ...(radius.value !== undefined ? { cornerRadiusPx: radius.value } : {}),
    ...(radii.radii !== undefined ? { cornerRadiiPx: radii.radii } : {}),
    ...(bordered.border !== undefined ? { border: bordered.border } : {}),
    ...(clips ? { clipsContent: true as const } : {}),
    ...(shadowed.shadow !== undefined ? { boxShadow: shadowed.shadow } : {}),
    ...(sized.sizing ? { sizing: sized.sizing } : {}),
    // Recovery M2.10: a Figma frame is its own box, never Elementor's boxed (kit-width-capped) layout.
    fullContentWidth: true as const,
    ...(wrap !== undefined ? { wrap } : {}),
    ...(stack.stacked ? { zIndex: 0 } : {}),
    ...(styleReviews.length > 0 ? { styleReviews } : {}),
    children: stack.children,
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

/**
 * Divider placement (recovery M2.3d). In a row the divider widget grows (`divider.scss` blob
 * 96c448b3b4f21c7f3dc4fac777c7a3be8ebc9eb8: `--flex-grow: var(--container-widget-flex-grow)`), so it is REVIEW.
 * In a column a FILL line keeps the divider's default 100% width, and a narrower line takes its column's
 * cross alignment through the divider `align` control.
 */
function placeDivider(divider: P15NeutralDividerNode, node: SceneNode, parent: ParentLayout): P15NeutralExportNode {
  if (parent?.direction === 'row') {
    return review(node, 'DIVIDER_IN_ROW_REQUIRES_REVIEW', 'A divider inside a horizontal Auto Layout grows with the row in Elementor; its length needs review.');
  }
  const { widthPx, ...rest } = divider;
  const fill = recordOf(node).layoutSizingHorizontal === 'FILL';
  const align = parent?.alignItems === 'center' ? 'center' : parent?.alignItems === 'end' ? 'end' : undefined;
  return { ...rest, ...(fill || widthPx === undefined ? {} : { widthPx }), ...(fill || align === undefined ? {} : { align }) };
}

/**
 * An absolute child (recovery M2.5): a text or Auto Layout frame placed by MIN/MAX offsets from its parent.
 * Anything without an exact placement, and any other node type, stays an explicit review.
 */
function extractAbsolute(
  node: SceneNode,
  depth: number,
  state: ExtractionState,
  parent: ParentLayout,
  absoluteParent: AbsoluteParent | undefined,
): P15NeutralExportNode {
  if (absoluteParent === undefined || (node.type !== 'TEXT' && !isContainerLike(node))) {
    return review(node, ABSOLUTE_POSITION_REVIEW, `An absolute ${node.type} has no exact Elementor placement; only text and Auto Layout frames map.`);
  }
  const record = recordOf(node);
  const placed = deriveP15AbsolutePosition({
    x: record.x,
    y: record.y,
    width: record.width,
    height: record.height,
    rotation: record.rotation,
    constraints: record.constraints,
    parentWidth: absoluteParent.width,
    parentHeight: absoluteParent.height,
    ...(absoluteParent.borderPx ? { parentBorderPx: absoluteParent.borderPx } : {}),
  });
  if (placed.review) return review(node, placed.review.reasonCode, placed.review.detail);
  const position = placed.position!;
  if (node.type === 'TEXT') {
    const text = extractText(node, parent);
    return text.kind === 'text' ? { ...text, position } : text;
  }
  const container = extractContainer(node, depth, state, parent);
  if (container.kind !== 'container') return container;
  // The default Container width is 100% of its parent; an absolute frame needs its own exact or hugging width.
  if (container.sizing?.widthPx === undefined && container.sizing?.hugWidth === undefined) {
    return review(node, ABSOLUTE_POSITION_REVIEW, 'An absolute frame needs a fixed or hugging width to keep its size outside the flow.');
  }
  return { ...container, position };
}

/**
 * Recovery M3.4: an image layer on its @2x render, sized exactly: FIXED or HUG width → px, FILL width → 100% with
 * `object-fit: cover` (the render keeps its crop), height → px. A FILL height or a size constraint keeps the review.
 */
function extractImage(node: SceneNode, assetPath: string, parent: ParentLayout): P15NeutralImageNode | null {
  const record = recordOf(node);
  const facts = sizingFacts(record, parent);
  if (facts.vertical === 'FILL' || !Number.isFinite(facts.width) || !Number.isFinite(facts.height) || facts.height <= 0 || facts.width <= 0) return null;
  // The image height is written on the <img>; the widget wrapper only takes width and flex behaviour.
  const sized = deriveP15WidgetSizing({ ...facts, vertical: 'HUG', minHeight: null, maxHeight: null });
  if (sized.reviews.length > 0 || facts.minHeight !== null || facts.maxHeight !== null) return null;
  const width = facts.horizontal === 'FILL' ? null : Math.round(facts.width * 100) / 100;
  const sizing = { ...(sized.sizing ?? {}), ...(width === null ? {} : { widthPx: width }) };
  delete (sizing as { fillWidth?: true }).fillWidth;
  return {
    kind: 'image',
    sourceNodeId: node.id,
    assetPath,
    sizing: width === null ? { ...sizing, fillWidth: true } : sizing,
    heightPx: Math.round(facts.height * 100) / 100,
    ...(width === null ? { objectFit: 'cover' as const } : {}),
  };
}

function extractNode(
  node: SceneNode,
  depth: number,
  state: ExtractionState,
  parent: ParentLayout = null,
  absoluteParent?: AbsoluteParent,
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
  if (hasImageFill(node) && !isContainerLike(node)) {
    // Recovery M3.3 (D-051): an image layer with a collected @1x render becomes an Image widget on that pack asset,
    // unless it carries effects or other facts the render's natural size would not lay out exactly.
    const assetPath = state.assetPaths.get(node.id);
    if (assetPath !== undefined && unmappedVisualFactReviews(node).length === 0) {
      const image = extractImage(node, assetPath, parent);
      if (image) return image;
    }
    return review(node, 'IMAGE_ASSET_EXPORT_REQUIRED', 'Image-backed Figma content requires a retained asset export/upload reference before Elementor generation.');
  }
  if (isAbsolute(node)) return extractAbsolute(node, depth, state, parent, absoluteParent);
  // Recovery M3.5: a vector layer or pure-vector icon with a collected SVG becomes an Image widget on that SVG.
  const svgPath = state.assetPaths.get(node.id);
  if (svgPath !== undefined && svgPath.endsWith('.svg') && unmappedVisualFactReviews(node, isContainerLike(node)).length === 0) {
    const icon = extractImage(node, svgPath, parent);
    if (icon) return icon;
  }
  if (node.type === 'TEXT') return extractText(node, parent);
  const rule = extractRule(node, parent?.direction ?? null);
  if (rule) return rule.kind === 'divider' ? placeDivider(rule, node, parent) : rule;
  if (isContainerLike(node)) {
    return extractContainer(node, depth, state, parent);
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
  assetPaths: ReadonlyMap<string, string> = new Map(),
  originals: ReadonlyMap<string, { path: string; widthPx: number }> = new Map(),
): P15NeutralExportDocumentV1 {
  const state: ExtractionState = { visited: 0, boundsExceeded: null, sizingFacts: new Map(), assetPaths, originals };
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
  }, names, state.sizingFacts), names);
}

function collectLayerNames(node: SceneNode, names: Map<string, string>): void {
  if (typeof node.name === 'string') names.set(node.id, node.name);
  for (const child of childNodes(node)) collectLayerNames(child, names);
}

export function buildP15ElementorV1PreviewFromFigmaFrame(
  frame: FrameNode,
  documentType: P15NeutralDocumentType = 'page',
  assetPaths: ReadonlyMap<string, string> = new Map(),
  originals: ReadonlyMap<string, { path: string; widthPx: number }> = new Map(),
): P15FigmaNeutralExtractionResult {
  const extracted = extractP15NeutralExportDocumentFromFigmaFrame(frame, documentType, assetPaths, originals);
  const coverageAudit = auditP15PropertyCoverage(frame, extracted);
  // A silent drop the audit finds becomes an explicit review, so no candidate ever loses content unannounced.
  const document = withCoverageReviews(extracted, coverageAudit);
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
    coverageAudit,
  };
}
/**
 * Append audit findings to the root container as `SILENT_DROP_DETECTED` review nodes (recovery M2.9b). Review nodes
 * have no per-node cap and become placeholders in the D-049 review artifact; at most 100 are listed, plus a count.
 */
function withCoverageReviews(document: P15NeutralExportDocumentV1, audit: P15PropertyCoverageAuditV1): P15NeutralExportDocumentV1 {
  const [root, ...rest] = document.nodes;
  if (audit.status === 'COMPLETE' || root?.kind !== 'container') return document;
  const listed = audit.findings.slice(0, 100);
  const reviews: P15NeutralReviewNode[] = listed.map((finding, index) => ({ kind: 'review', sourceNodeId: `${root.sourceNodeId}:p15-coverage-${index}`,
    reasonCode: 'SILENT_DROP_DETECTED', detail: `Node ${finding.sourceNodeId}, ${finding.property}: ${finding.detail}`.slice(0, 2_000) }));
  if (listed.length < audit.findings.length) {
    reviews.push({ kind: 'review', sourceNodeId: `${root.sourceNodeId}:p15-coverage-more`, reasonCode: 'SILENT_DROP_DETECTED',
      detail: `${audit.findings.length - listed.length} more unmapped properties; see the coverage audit.` });
  }
  return { ...document, nodes: [{ ...root, children: [...root.children, ...reviews] }, ...rest] };
}
