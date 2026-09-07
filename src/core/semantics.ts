import type { AuditNode, PatternDetection, SemanticHint } from './types';

interface LocatedNode {
  node: AuditNode;
  offsetX: number;
  offsetY: number;
}

function locate(root: AuditNode, targetId: string): LocatedNode | null {
  const queue: LocatedNode[] = [{ node: root, offsetX: 0, offsetY: 0 }];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (current.node.id === targetId) return current;
    for (const child of current.node.children) {
      queue.push({
        node: child,
        offsetX: current.offsetX + child.geometry.x,
        offsetY: current.offsetY + child.geometry.y,
      });
    }
  }
  return null;
}

function textDescendants(node: AuditNode): number {
  let count = 0;
  const stack = [...node.children];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    if (current.isText) count += 1;
    stack.push(...current.children);
  }
  return count;
}

function containsNode(root: AuditNode, targetId: string): boolean {
  if (root.id === targetId) return true;
  return root.children.some((child) => containsNode(child, targetId));
}

function semanticFor(section: AuditNode, detection: PatternDetection, all: PatternDetection[]): SemanticHint | null {
  const located = locate(section, detection.targetNodeId);
  if (!located) return null;
  const target = located.node;
  const sectionHeight = Math.max(1, section.geometry.height);

  if (detection.pattern === 'grid') {
    const itemCount = Number(detection.evidence.itemCount ?? 0);
    const widthConsistency = Number(detection.evidence.widthConsistencyPct ?? 0);
    const occupancy = Number(detection.evidence.occupancyPct ?? 0);
    if (itemCount >= 4 && itemCount <= 12 && widthConsistency >= 75 && occupancy >= 70) {
      return 'repeated-cards';
    }
  }

  if (detection.pattern === 'two-column') {
    const topRatio = located.offsetY / sectionHeight;
    const heightRatio = target.geometry.height / sectionHeight;
    if (topRatio <= 0.28 && heightRatio <= 0.38) return 'split-header';
  }

  if (detection.pattern === 'vertical-stack') {
    const itemCount = Number(detection.evidence.itemCount ?? 0);
    if (itemCount >= 4) {
      const nestedTwoColumns = all.filter((candidate) => {
        if (candidate.pattern !== 'two-column' || candidate.targetNodeId === detection.targetNodeId) return false;
        return containsNode(target, candidate.targetNodeId);
      }).length;
      if (nestedTwoColumns >= 2) return 'timeline-chapter';

      const visibleChildren = target.children.filter((child) => child.visible);
      const factLike = visibleChildren.filter((child) => {
        const texts = textDescendants(child) + (child.isText ? 1 : 0);
        return texts >= 1 && texts <= 4;
      }).length;
      if (visibleChildren.length >= 4 && factLike / visibleChildren.length >= 0.7) return 'facts-list';
    }
  }

  if (detection.pattern === 'horizontal-row') {
    const itemCount = Number(detection.evidence.itemCount ?? 0);
    const topRatio = located.offsetY / sectionHeight;
    const heightRatio = target.geometry.height / sectionHeight;
    if (itemCount >= 3 && itemCount <= 6 && topRatio >= 0.45 && heightRatio >= 0.15) {
      const withText = target.children.filter((child) => child.visible && textDescendants(child) > 0).length;
      const visibleCount = Math.max(1, target.children.filter((child) => child.visible).length);
      if (withText / visibleCount >= 0.6) return 'footer-columns';
    }
  }

  return null;
}

/** Add conservative semantic hints without replacing the underlying geometric classification. */
export function enrichSemanticHints(section: AuditNode, detections: PatternDetection[]): PatternDetection[] {
  return detections.map((detection) => {
    const semanticHint = semanticFor(section, detection, detections);
    return semanticHint ? { ...detection, semanticHint } : detection;
  });
}
