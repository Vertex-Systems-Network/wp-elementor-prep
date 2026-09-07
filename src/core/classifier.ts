import type { AuditNode, PatternDetection, PatternKind } from './types';

interface Cluster {
  center: number;
  items: AuditNode[];
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function centerX(node: AuditNode): number {
  return node.geometry.x + node.geometry.width / 2;
}

function centerY(node: AuditNode): number {
  return node.geometry.y + node.geometry.height / 2;
}

function clusterBy(nodes: AuditNode[], axis: 'x' | 'y', tolerance: number): Cluster[] {
  const sorted = [...nodes].sort((a, b) => (axis === 'x' ? centerX(a) - centerX(b) : centerY(a) - centerY(b)));
  const clusters: Cluster[] = [];

  for (const node of sorted) {
    const value = axis === 'x' ? centerX(node) : centerY(node);
    const last = clusters.at(-1);
    if (!last || Math.abs(last.center - value) > tolerance) {
      clusters.push({ center: value, items: [node] });
      continue;
    }

    last.items.push(node);
    last.center = last.items.reduce((sum, item) => sum + (axis === 'x' ? centerX(item) : centerY(item)), 0) / last.items.length;
  }

  return clusters;
}

function countDescendants(node: AuditNode): number {
  let count = 0;
  const stack = [...node.children];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    count += 1;
    stack.push(...current.children);
  }
  return count;
}

function isLikelyBackground(parent: AuditNode, child: AuditNode, siblingCount: number): boolean {
  if (siblingCount < 3) return false;
  const widthCoverage = child.geometry.width / Math.max(1, parent.geometry.width);
  const heightCoverage = child.geometry.height / Math.max(1, parent.geometry.height);
  const originNear = Math.abs(child.geometry.x) <= 3 && Math.abs(child.geometry.y) <= 3;
  return widthCoverage >= 0.94 && heightCoverage >= 0.9 && originNear && countDescendants(child) <= 6;
}

function meaningfulChildren(node: AuditNode): AuditNode[] {
  const visible = node.children.filter((child) => child.visible && child.isContainer);
  const filtered = visible.filter((child) => !isLikelyBackground(node, child, visible.length));

  if (filtered.length === 1) {
    const only = filtered[0];
    if (!only) return filtered;
    const widthCoverage = only.geometry.width / Math.max(1, node.geometry.width);
    const heightCoverage = only.geometry.height / Math.max(1, node.geometry.height);
    if (widthCoverage >= 0.65 && heightCoverage >= 0.45) {
      const nested = only.children.filter((child) => child.visible && child.isContainer);
      if (nested.length >= 2) return nested;
    }
  }

  return filtered;
}

function dimensionConsistency(nodes: AuditNode[], dimension: 'width' | 'height'): number {
  if (nodes.length === 0) return 0;
  const values = nodes.map((node) => node.geometry[dimension]).filter((value) => value > 0);
  if (values.length === 0) return 0;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const consistent = values.filter((value) => Math.abs(value - average) <= average * 0.12).length;
  return consistent / values.length;
}

function widthConsistency(nodes: AuditNode[]): number {
  return dimensionConsistency(nodes, 'width');
}

function detectTwoColumn(node: AuditNode, children: AuditNode[]): PatternDetection | null {
  if (children.length !== 2) return null;
  const [left, right] = [...children].sort((a, b) => a.geometry.x - b.geometry.x);
  if (!left || !right) return null;

  const yDelta = Math.abs(left.geometry.y - right.geometry.y);
  const horizontalGap = right.geometry.x - (left.geometry.x + left.geometry.width);
  const combinedWidth = left.geometry.width + right.geometry.width + Math.max(0, horizontalGap);
  const coverage = combinedWidth / Math.max(1, node.geometry.width);
  const nonOverlap = horizontalGap >= -3;
  const similarOrigin = yDelta <= Math.max(6, node.geometry.height * 0.03);
  const meaningfulColumnWidths =
    left.geometry.width >= node.geometry.width * 0.18 && right.geometry.width >= node.geometry.width * 0.18;

  if (coverage < 0.55 || !meaningfulColumnWidths || !nonOverlap) return null;

  let confidence = 60;
  if (similarOrigin) confidence += 18;
  confidence += 10;
  if (coverage >= 0.72) confidence += 8;
  if (coverage >= 0.9) confidence += 4;

  return {
    pattern: 'two-column',
    confidence: clamp(confidence),
    targetNodeId: node.id,
    targetNodeName: node.name,
    evidence: {
      yDelta: Math.round(yDelta * 100) / 100,
      horizontalGap: Math.round(horizontalGap * 100) / 100,
      parentWidthCoveragePct: Math.round(coverage * 100),
      meaningfulColumnWidths,
      nonOverlap,
    },
  };
}

function strictGrid(node: AuditNode, children: AuditNode[]): PatternDetection | null {
  if (children.length < 4) return null;
  const xTolerance = Math.max(8, node.geometry.width * 0.04);
  const yTolerance = Math.max(8, node.geometry.height * 0.06);
  const xClusters = clusterBy(children, 'x', xTolerance);
  const yClusters = clusterBy(children, 'y', yTolerance);
  const consistency = widthConsistency(children);

  if (xClusters.length < 2 || yClusters.length < 2) return null;
  if (xClusters.length * yClusters.length < children.length) return null;

  const occupancy = children.length / (xClusters.length * yClusters.length);
  // Irregular scatter should not be promoted to a grid merely because clusters can be formed.
  if (occupancy < 0.6 || consistency < 0.65) return null;

  let confidence = 45;
  confidence += Math.min(25, xClusters.length * 5 + yClusters.length * 3);
  confidence += consistency * 20;
  confidence += occupancy >= 0.7 ? 10 : 0;

  return {
    pattern: 'grid',
    confidence: clamp(confidence),
    targetNodeId: node.id,
    targetNodeName: node.name,
    evidence: {
      itemCount: children.length,
      columns: xClusters.length,
      rows: yClusters.length,
      widthConsistencyPct: Math.round(consistency * 100),
      occupancyPct: Math.round(occupancy * 100),
      fragmentedCellCandidate: false,
    },
  };
}

function dominantSizeAnchors(children: AuditNode[]): AuditNode[] {
  let best: AuditNode[] = [];
  for (const seed of children) {
    if (seed.geometry.width <= 0 || seed.geometry.height <= 0) continue;
    const group = children.filter((child) => {
      const widthDelta = Math.abs(child.geometry.width - seed.geometry.width) / seed.geometry.width;
      const heightDelta = Math.abs(child.geometry.height - seed.geometry.height) / seed.geometry.height;
      return widthDelta <= 0.15 && heightDelta <= 0.15;
    });
    if (group.length > best.length) best = group;
  }
  return best;
}

/**
 * Detects a repeated grid when one or two visual cells are fragmented into sibling text/line nodes
 * instead of being wrapped in a single card frame. This is audit evidence only; synthesis happens later.
 */
function fragmentedGrid(node: AuditNode, children: AuditNode[]): PatternDetection | null {
  if (children.length < 6) return null;
  const anchors = dominantSizeAnchors(children);
  if (anchors.length < 4 || anchors.length >= children.length) return null;

  const xClusters = clusterBy(anchors, 'x', Math.max(8, node.geometry.width * 0.04));
  const yClusters = clusterBy(anchors, 'y', Math.max(8, node.geometry.height * 0.06));
  if (xClusters.length < 2 || yClusters.length < 2) return null;

  const slots = xClusters.length * yClusters.length;
  const missingSlots = slots - anchors.length;
  const occupancy = anchors.length / Math.max(1, slots);
  if (missingSlots < 1 || missingSlots > 2 || occupancy < 0.66) return null;

  const widthCons = dimensionConsistency(anchors, 'width');
  const heightCons = dimensionConsistency(anchors, 'height');
  if (widthCons < 0.75 || heightCons < 0.75) return null;

  const fragmentCount = children.length - anchors.length;
  const confidence = clamp(
    52 + widthCons * 10 + heightCons * 10 + (occupancy >= 0.75 ? 10 : 5) + (missingSlots === 1 ? 5 : 0),
  );

  return {
    pattern: 'grid',
    confidence,
    targetNodeId: node.id,
    targetNodeName: node.name,
    evidence: {
      itemCount: children.length,
      anchorCount: anchors.length,
      fragmentCount,
      columns: xClusters.length,
      rows: yClusters.length,
      missingSlots,
      occupancyPct: Math.round(occupancy * 100),
      widthConsistencyPct: Math.round(widthCons * 100),
      heightConsistencyPct: Math.round(heightCons * 100),
      fragmentedCellCandidate: true,
    },
  };
}

function detectGrid(node: AuditNode, children: AuditNode[]): PatternDetection | null {
  return strictGrid(node, children) ?? fragmentedGrid(node, children);
}

function detectHorizontalRow(node: AuditNode, children: AuditNode[]): PatternDetection | null {
  if (children.length < 2) return null;
  const yTolerance = Math.max(6, node.geometry.height * 0.05);
  const yClusters = clusterBy(children, 'y', yTolerance);
  if (yClusters.length !== 1) return null;

  const sorted = [...children].sort((a, b) => a.geometry.x - b.geometry.x);
  let overlaps = 0;
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (previous && current && current.geometry.x < previous.geometry.x + previous.geometry.width - 3) overlaps += 1;
  }

  const confidence = clamp(72 + Math.min(18, children.length * 3) - overlaps * 18);
  if (confidence < 60) return null;

  return {
    pattern: 'horizontal-row',
    confidence,
    targetNodeId: node.id,
    targetNodeName: node.name,
    evidence: { itemCount: children.length, overlapPairs: overlaps, yClusterCount: 1 },
  };
}

function detectVerticalStack(node: AuditNode, children: AuditNode[]): PatternDetection | null {
  if (children.length < 2) return null;
  const xTolerance = Math.max(6, node.geometry.width * 0.05);
  const xClusters = clusterBy(children, 'x', xTolerance);
  if (xClusters.length !== 1) return null;

  const sorted = [...children].sort((a, b) => a.geometry.y - b.geometry.y);
  let overlaps = 0;
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (previous && current && current.geometry.y < previous.geometry.y + previous.geometry.height - 3) overlaps += 1;
  }

  const confidence = clamp(70 + Math.min(20, children.length * 2) - overlaps * 18);
  if (confidence < 60) return null;

  return {
    pattern: 'vertical-stack',
    confidence,
    targetNodeId: node.id,
    targetNodeName: node.name,
    evidence: { itemCount: children.length, overlapPairs: overlaps, xClusterCount: 1 },
  };
}

function detectCarousel(node: AuditNode, children: AuditNode[]): PatternDetection | null {
  if (children.length < 3) return null;
  const sorted = [...children].sort((a, b) => a.geometry.x - b.geometry.x);
  const rightEdge = Math.max(...sorted.map((child) => child.geometry.x + child.geometry.width));
  const overflow = rightEdge - node.geometry.width;
  const consistency = widthConsistency(children);
  const row = detectHorizontalRow(node, children);
  const likelyOverflow = overflow > node.geometry.width * 0.08;

  if (!likelyOverflow || consistency < 0.65 || !row) return null;

  return {
    pattern: 'carousel-track',
    confidence: clamp(68 + consistency * 17 + (node.clipsContent ? 10 : 0)),
    targetNodeId: node.id,
    targetNodeName: node.name,
    evidence: {
      itemCount: children.length,
      overflowPx: Math.round(overflow),
      widthConsistencyPct: Math.round(consistency * 100),
      clipsContent: node.clipsContent,
    },
  };
}

function detectionsForNode(node: AuditNode): PatternDetection[] {
  const children = meaningfulChildren(node);
  if (children.length < 2) return [];

  return [
    detectCarousel(node, children),
    detectTwoColumn(node, children),
    detectGrid(node, children),
    detectHorizontalRow(node, children),
    detectVerticalStack(node, children),
  ]
    .filter((detection): detection is PatternDetection => detection !== null)
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Search a shallow subtree and return multiple explainable targets.
 * Complex sections often contain more than one meaningful web-layout pattern.
 */
export function detectPatterns(section: AuditNode, maxDepth = 3, maxResults = 8): PatternDetection[] {
  const queue: Array<{ node: AuditNode; depth: number }> = [{ node: section, depth: 0 }];
  const byKey = new Map<string, PatternDetection>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    for (const detection of detectionsForNode(current.node)) {
      const key = `${detection.targetNodeId}:${detection.pattern}`;
      const existing = byKey.get(key);
      if (!existing || detection.confidence > existing.confidence) byKey.set(key, detection);
    }

    if (current.depth >= maxDepth) continue;
    for (const child of current.node.children) {
      if (child.visible && child.isContainer) queue.push({ node: child, depth: current.depth + 1 });
    }
  }

  return [...byKey.values()]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, Math.max(1, maxResults));
}

/** Strongest pattern retained for existing consumers. */
export function detectBestPattern(section: AuditNode, maxDepth = 3): PatternDetection | null {
  return detectPatterns(section, maxDepth, 1)[0] ?? null;
}

export function recipeForPattern(pattern: PatternKind): string | null {
  if (pattern === 'unknown') return null;
  return pattern;
}
