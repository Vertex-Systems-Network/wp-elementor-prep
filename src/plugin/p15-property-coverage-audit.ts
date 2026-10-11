import type { P15NeutralExportDocumentV1, P15NeutralExportNode, P15NeutralTypography } from '../targets/elementor/neutral-export-ir';

/**
 * Property-coverage audit (recovery M2.9b): proves "no silent drop" for one extraction.
 *
 * It walks the original Figma tree independently of the extractor and, for every visible node, checks that the
 * node itself is accounted for (an IR node with its id, a review node, or a button label folded into its button),
 * and that every visual property with a non-default value is either carried by an IR field or named by a review on
 * that node (a review whose code mentions the property family, for example `STROKE` or `OPACITY`). Descendants of a
 * review node are covered by that review. The audit reads plain node properties only: no Figma mutation, no network.
 */
export const P15_PROPERTY_COVERAGE_AUDIT_VERSION = 'p15-property-coverage-audit-v1' as const;

export interface P15CoverageFinding {
  sourceNodeId: string;
  property: string;
  detail: string;
}

export interface P15PropertyCoverageAuditV1 {
  auditVersion: typeof P15_PROPERTY_COVERAGE_AUDIT_VERSION;
  status: 'COMPLETE' | 'SILENT_DROPS';
  visitedNodeCount: number;
  findings: P15CoverageFinding[];
}

type Node = Record<string, unknown>;
type IrNode = P15NeutralExportNode;

interface IrIndex {
  nodes: Map<string, IrNode>;
  /** Review codes per node id: style reviews plus the codes of review nodes. */
  reviews: Map<string, string[]>;
  /** Children of these ids are folded into them (button labels). */
  folded: Set<string>;
  bounded: boolean;
}

function indexIr(nodes: readonly IrNode[], index: IrIndex): void {
  for (const node of nodes) {
    index.nodes.set(node.sourceNodeId, node);
    const codes = index.reviews.get(node.sourceNodeId) ?? [];
    if (node.kind === 'review') {
      codes.push(node.reasonCode);
      if (node.sourceNodeId.endsWith(':p15-bounds')) index.bounded = true;
    }
    if ('styleReviews' in node && node.styleReviews) codes.push(...node.styleReviews.map((review) => review.reasonCode));
    index.reviews.set(node.sourceNodeId, codes);
    if (node.kind === 'button') index.folded.add(node.sourceNodeId);
    if (node.kind === 'container') indexIr(node.children, index);
  }
}

const childrenOf = (node: Node): Node[] => (Array.isArray(node.children) ? node.children as Node[] : []);
const visible = (node: Node): boolean => node.visible !== false;
const visiblePaints = (value: unknown): unknown[] | 'MIXED' => (Array.isArray(value)
  ? value.filter((paint) => typeof paint === 'object' && paint !== null && (paint as Node).visible !== false)
  : value === undefined ? [] : 'MIXED');
const present = (value: unknown[] | 'MIXED'): boolean => value === 'MIXED' || value.length > 0;
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

class Audit {
  readonly findings: P15CoverageFinding[] = [];
  visited = 0;

  constructor(private readonly index: IrIndex) {}

  private covered(id: string, family: readonly string[]): boolean {
    return (this.index.reviews.get(id) ?? []).some((code) => family.some((word) => code.includes(word)));
  }

  private need(id: string, property: string, carried: boolean, family: readonly string[], detail: string): void {
    if (!carried && !this.covered(id, family)) this.findings.push({ sourceNodeId: id, property, detail });
  }

  /** Properties every visible layer can carry. */
  private common(node: Node, id: string, ir: IrNode): void {
    if (node.opacity !== undefined && node.opacity !== 1) this.need(id, 'opacity', false, ['OPACITY'], `Layer opacity ${String(node.opacity)}.`);
    if (node.blendMode !== undefined && node.blendMode !== 'NORMAL' && node.blendMode !== 'PASS_THROUGH') {
      this.need(id, 'blendMode', false, ['BLEND'], `Blend mode ${String(node.blendMode)}.`);
    }
    if (node.rotation !== undefined && node.rotation !== 0) this.need(id, 'rotation', false, ['ROTATION'], `Rotation ${String(node.rotation)}.`);
    if (node.isMask === true) this.need(id, 'isMask', false, ['MASK'], 'Mask layer.');
    if (node.layoutPositioning === 'ABSOLUTE') {
      this.need(id, 'layoutPositioning', 'position' in ir && ir.position !== undefined, ['ABSOLUTE'], 'Absolute placement.');
    }
    for (const key of ['minWidth', 'maxWidth', 'minHeight', 'maxHeight'] as const) {
      if (isNumber(node[key]) && (node[key] as number) > 0) {
        const sizing = 'sizing' in ir ? ir.sizing as Record<string, unknown> | undefined : undefined;
        this.need(id, key, key === 'minHeight' && sizing?.minHeightPx !== undefined, ['SIZE'], `${key} ${String(node[key])}.`);
      }
    }
  }

  private frame(node: Node, id: string, ir: IrNode): void {
    const container = ir.kind === 'container' ? ir : null;
    const button = ir.kind === 'button' ? ir : null;
    if (!container && !button) return;
    if (present(visiblePaints(node.fills))) {
      this.need(id, 'fills', (container?.backgroundColorHex ?? container?.gradient ?? button?.backgroundColorHex) !== undefined,
        ['FILL', 'GRADIENT', 'BACKGROUND'], 'Visible frame fill.');
    }
    const strokeWeights = [node.strokeWeight, node.strokeTopWeight, node.strokeRightWeight, node.strokeBottomWeight, node.strokeLeftWeight];
    if (present(visiblePaints(node.strokes)) && strokeWeights.some((weight) => !isNumber(weight) ? weight !== undefined : weight > 0)) {
      this.need(id, 'strokes', container?.border !== undefined, ['STROKE'], 'Visible stroke.');
    }
    if (present(visiblePaints(node.effects))) this.need(id, 'effects', container?.boxShadow !== undefined, ['EFFECT'], 'Visible effect.');
    const radii = [node.topLeftRadius, node.topRightRadius, node.bottomRightRadius, node.bottomLeftRadius];
    if ((node.cornerRadius !== undefined && node.cornerRadius !== 0) || radii.some((radius) => isNumber(radius) && radius > 0)) {
      this.need(id, 'cornerRadius', (container?.cornerRadiusPx ?? container?.cornerRadiiPx ?? button?.cornerRadiusPx) !== undefined, ['RADIUS'], 'Corner radius.');
    }
    if (node.clipsContent === true && container && childrenOf(node).some(visible)) {
      // Clipping only needs mapping where it is visible; the extractor decides that, so accept either outcome but never silence.
      this.need(id, 'clipsContent', container.clipsContent === true || !this.clipVisible(node, container), ['CLIP', 'OVERFLOW'], 'Clipped content.');
    }
    if (!container) return;
    if (node.layoutWrap === 'WRAP') this.need(id, 'layoutWrap', container.wrap !== undefined, ['WRAP'], 'Wrapped Auto Layout.');
    if (node.layoutMode === 'GRID') this.need(id, 'layoutMode', container.grid !== undefined, ['GRID'], 'Grid layout.');
    if (node.counterAxisAlignItems === 'BASELINE') this.need(id, 'counterAxisAlignItems', false, ['BASELINE'], 'Baseline alignment.');
    if (isNumber(node.itemSpacing) && node.itemSpacing !== 0 && node.layoutMode !== 'GRID') {
      const distributed = ['space-between', 'space-around', 'space-evenly'].includes(container.justifyContent ?? '');
      const overlap = node.itemSpacing < 0 && container.children.some((child) => child.kind === 'container' && child.marginPx !== undefined);
      this.need(id, 'itemSpacing', container.gapPx === node.itemSpacing || distributed || overlap, ['SPACING'], `Item spacing ${node.itemSpacing}.`);
    }
    const padding = [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft];
    if (padding.some((side) => isNumber(side) && side !== 0)) this.need(id, 'padding', container.paddingPx !== undefined, ['SPACING', 'PADDING'], 'Padding.');
  }

  private clipVisible(node: Node, container: { cornerRadiusPx?: number; cornerRadiiPx?: unknown }): boolean {
    const width = Number(node.width);
    const height = Number(node.height);
    const overflow = childrenOf(node).filter(visible).some((child) => {
      const x = Number(child.x ?? 0); const y = Number(child.y ?? 0);
      return x < 0 || y < 0 || x + Number(child.width ?? 0) > width || y + Number(child.height ?? 0) > height;
    });
    return overflow || container.cornerRadiusPx !== undefined || container.cornerRadiiPx !== undefined;
  }

  /** Text properties, checked against the typography of the IR node they ended up in. */
  private text(node: Node, id: string, typography: P15NeutralTypography | undefined, reviewId: string): void {
    const has = (key: keyof P15NeutralTypography) => typography?.[key] !== undefined;
    const fills = visiblePaints(node.fills);
    if (present(fills)) this.need(reviewId, 'text fills', has('colorHex'), ['FILL', 'TEXT'], `Text colour of ${id}.`);
    if (node.fontSize !== undefined) this.need(reviewId, 'fontSize', has('fontSizePx'), ['TYPOGRAPHY'], `Font size of ${id}.`);
    const fontName = node.fontName as Node | undefined;
    if (fontName !== undefined) this.need(reviewId, 'fontName', has('fontFamily'), ['TYPOGRAPHY', 'FONT'], `Font of ${id}.`);
    const letter = node.letterSpacing as Node | undefined;
    if (letter !== undefined && (typeof letter !== 'object' || (letter as Node).value !== 0)) {
      this.need(reviewId, 'letterSpacing', has('letterSpacingPx'), ['TYPOGRAPHY'], `Letter spacing of ${id}.`);
    }
    const line = node.lineHeight as Node | undefined;
    if (line !== undefined && (typeof line !== 'object' || (line as Node).unit !== 'AUTO')) {
      this.need(reviewId, 'lineHeight', has('lineHeightPx'), ['TYPOGRAPHY'], `Line height of ${id}.`);
    }
    if (node.textCase !== undefined && node.textCase !== 'ORIGINAL') this.need(reviewId, 'textCase', has('textTransform'), ['CASE', 'TYPOGRAPHY'], `Text case of ${id}.`);
    if (node.textDecoration !== undefined && node.textDecoration !== 'NONE') {
      this.need(reviewId, 'textDecoration', has('textDecoration'), ['TYPOGRAPHY'], `Text decoration of ${id}.`);
    }
    if (present(visiblePaints(node.strokes))) this.need(reviewId, 'text strokes', false, ['STROKE'], `Text stroke of ${id}.`);
    if (present(visiblePaints(node.effects))) this.need(reviewId, 'text effects', false, ['EFFECT'], `Text effect of ${id}.`);
  }

  walk(node: Node, foldedInto: IrNode | null = null): void {
    if (!visible(node)) return;
    this.visited += 1;
    const id = String(node.id);
    if (foldedInto) {
      // A button label: its text properties live on the button.
      if (node.type === 'TEXT') this.text(node, id, foldedInto.kind === 'button' ? foldedInto.typography : undefined, foldedInto.sourceNodeId);
      else this.findings.push({ sourceNodeId: id, property: 'node', detail: `A ${String(node.type)} inside a button has no place in the Button widget.` });
      return;
    }
    const ir = this.index.nodes.get(id);
    if (ir === undefined) {
      this.findings.push({ sourceNodeId: id, property: 'node', detail: `Visible ${String(node.type)} "${String(node.name ?? '')}" is neither mapped nor listed as review.` });
      return;
    }
    if (ir.kind === 'review') return; // The review covers the node and its subtree.
    this.common(node, id, ir);
    if (node.type === 'TEXT') {
      this.text(node, id, ir.kind === 'text' || ir.kind === 'heading' ? ir.typography : undefined, id);
      return;
    }
    this.frame(node, id, ir);
    const folded = this.index.folded.has(id) ? ir : null;
    for (const child of childrenOf(node)) this.walk(child, folded);
  }
}

/** Audit one extraction: the selected Figma frame and the neutral document extracted from it. */
export function auditP15PropertyCoverage(frame: unknown, document: P15NeutralExportDocumentV1): P15PropertyCoverageAuditV1 {
  const index: IrIndex = { nodes: new Map(), reviews: new Map(), folded: new Set(), bounded: false };
  indexIr(document.nodes, index);
  const audit = new Audit(index);
  // A bounds review stands for the whole tree.
  if (!index.bounded) audit.walk(frame as Node);
  return {
    auditVersion: P15_PROPERTY_COVERAGE_AUDIT_VERSION,
    status: audit.findings.length === 0 ? 'COMPLETE' : 'SILENT_DROPS',
    visitedNodeCount: audit.visited,
    findings: audit.findings,
  };
}
