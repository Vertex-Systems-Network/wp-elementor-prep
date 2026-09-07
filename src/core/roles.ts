import type { AuditNode, RoleDetection } from './types';

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function descendantCount(node: AuditNode): number {
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

function intersectionArea(a: AuditNode, b: AuditNode): number {
  const left = Math.max(a.geometry.x, b.geometry.x);
  const top = Math.max(a.geometry.y, b.geometry.y);
  const right = Math.min(a.geometry.x + a.geometry.width, b.geometry.x + b.geometry.width);
  const bottom = Math.min(a.geometry.y + a.geometry.height, b.geometry.y + b.geometry.height);
  if (right <= left || bottom <= top) return 0;
  return (right - left) * (bottom - top);
}

function classifyChild(parent: AuditNode, child: AuditNode, siblings: AuditNode[]): RoleDetection | null {
  const parentArea = Math.max(1, parent.geometry.width * parent.geometry.height);
  const childArea = Math.max(1, child.geometry.width * child.geometry.height);
  const widthCoverage = child.geometry.width / Math.max(1, parent.geometry.width);
  const heightCoverage = child.geometry.height / Math.max(1, parent.geometry.height);
  const areaCoverage = childArea / parentArea;
  const originNear = Math.abs(child.geometry.x) <= 3 && Math.abs(child.geometry.y) <= 3;
  const descendants = descendantCount(child);

  // Full-size Auto Layout wrappers are often real content containers. Background inference is
  // intentionally limited to non-Auto-Layout layers so future mutation cannot skip valid content.
  if (
    siblings.length >= 2
    && !child.isAutoLayout
    && widthCoverage >= 0.94
    && heightCoverage >= 0.9
    && originNear
    && descendants <= 8
  ) {
    return {
      role: 'background-layer',
      confidence: 96,
      targetNodeId: child.id,
      targetNodeName: child.name,
      parentNodeId: parent.id,
      evidence: {
        widthCoveragePct: Math.round(widthCoverage * 100),
        heightCoveragePct: Math.round(heightCoverage * 100),
        originNear,
        isAutoLayout: child.isAutoLayout,
        descendantCount: descendants,
      },
    };
  }

  if (child.absolutePositioned) {
    return {
      role: 'absolute-overlay',
      confidence: 94,
      targetNodeId: child.id,
      targetNodeName: child.name,
      parentNodeId: parent.id,
      evidence: {
        areaCoveragePct: Math.round(areaCoverage * 100),
        opacityPct: Math.round(child.opacity * 100),
        descendantCount: descendants,
      },
    };
  }

  if (child.opacity <= 0.45 && descendants <= 6) {
    const maxOverlap = siblings
      .filter((sibling) => sibling.id !== child.id && sibling.visible)
      .reduce((max, sibling) => Math.max(max, intersectionArea(child, sibling)), 0);
    const overlapRatio = maxOverlap / childArea;
    if (overlapRatio >= 0.15) {
      return {
        role: 'decorative-overlay',
        confidence: clamp(68 + Math.min(20, overlapRatio * 30) + (child.opacity <= 0.25 ? 8 : 0)),
        targetNodeId: child.id,
        targetNodeName: child.name,
        parentNodeId: parent.id,
        evidence: {
          opacityPct: Math.round(child.opacity * 100),
          maxOverlapPct: Math.round(overlapRatio * 100),
          descendantCount: descendants,
        },
      };
    }
  }

  return null;
}

/**
 * Conservatively reports only special roles that future Auto-Fix must preserve.
 * Ordinary content is intentionally implicit to avoid flooding audit output.
 */
export function detectSpecialRoles(section: AuditNode, maxDepth = 3, maxResults = 20): RoleDetection[] {
  const queue: Array<{ node: AuditNode; depth: number }> = [{ node: section, depth: 0 }];
  const byTarget = new Map<string, RoleDetection>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const siblings = current.node.children.filter((child) => child.visible);
    for (const child of siblings) {
      const role = classifyChild(current.node, child, siblings);
      if (role) {
        const existing = byTarget.get(role.targetNodeId);
        if (!existing || role.confidence > existing.confidence) byTarget.set(role.targetNodeId, role);
      }
    }

    if (current.depth >= maxDepth) continue;
    for (const child of current.node.children) {
      if (child.visible && child.isContainer) queue.push({ node: child, depth: current.depth + 1 });
    }
  }

  return [...byTarget.values()]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, Math.max(1, maxResults));
}
