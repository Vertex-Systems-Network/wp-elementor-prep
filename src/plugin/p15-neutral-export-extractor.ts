import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  P15_NEUTRAL_EXPORT_MAX_DEPTH,
  P15_NEUTRAL_EXPORT_MAX_NODES,
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
  type P15NeutralTextAlignment,
  type P15NeutralExportValidationResult,
} from '../targets/elementor/neutral-export-ir';
import {
  generateElementorV3TemplateCandidate,
  type P15ElementorV3GenerationResult,
} from '../targets/elementor/v3-template-generator';

export const P15_FIGMA_NEUTRAL_EXTRACTOR_VERSION = 'p15-figma-neutral-export-extractor-v1' as const;

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

function extractText(node: SceneNode): P15NeutralExportNode {
  if (node.type !== 'TEXT') return review(node, 'UNSUPPORTED_NODE_TYPE', `Unsupported visible Figma node type: ${node.type}.`);
  if (node.characters.trim().length === 0) {
    return review(node, 'EMPTY_TEXT_REQUIRES_REVIEW', 'Empty visible text cannot be safely dropped because it may carry layout intent.');
  }
  const align = mapTextAlignment(node.textAlignHorizontal);
  if (align === null) {
    return review(node, 'UNSUPPORTED_TEXT_ALIGNMENT', `Unsupported Figma text alignment: ${String(node.textAlignHorizontal)}.`);
  }
  return {
    kind: 'text',
    sourceNodeId: node.id,
    text: node.characters,
    align,
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

  const children: P15NeutralExportNode[] = [];
  for (const child of childNodes(node)) {
    if (!visible(child)) continue;
    const extracted = extractNode(child, depth + 1, state);
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
    children,
  };
  return container;
}

function extractNode(
  node: SceneNode,
  depth: number,
  state: ExtractionState,
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
  if (hasImageFill(node)) {
    return review(node, 'IMAGE_ASSET_EXPORT_REQUIRED', 'Image-backed Figma content requires a retained asset export/upload reference before Elementor generation.');
  }
  if (node.type === 'TEXT') return extractText(node);
  if (childNodes(node).length > 0 || 'layoutMode' in recordOf(node)) {
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

  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: frame.name,
    documentType,
    nodes,
  };
}

export function buildP15ElementorV1PreviewFromFigmaFrame(
  frame: FrameNode,
  documentType: P15NeutralDocumentType = 'page',
): P15FigmaNeutralExtractionResult {
  const document = extractP15NeutralExportDocumentFromFigmaFrame(frame, documentType);
  const validation = validateP15NeutralExportDocument(document);
  const generation = generateElementorV3TemplateCandidate(document);
  return {
    schemaVersion: 1,
    extractorVersion: P15_FIGMA_NEUTRAL_EXTRACTOR_VERSION,
    readOnly: true,
    document,
    validation,
    generation,
  };
}
