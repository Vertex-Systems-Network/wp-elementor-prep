import type { AuditNode, PatternDetection, SemanticHint } from './types';

interface LocatedNode {
  node: AuditNode;
  offsetX: number;
  offsetY: number;
}

interface SemanticResult {
  hint: SemanticHint;
  evidence: Record<string, string | number | boolean>;
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

function chapterLikeStack(target: AuditNode): { matched: boolean; evidence: Record<string, string | number | boolean> } {
  const children = target.children.filter((child) => child.visible && child.isContainer);
  if (children.length < 5) return { matched: false, evidence: {} };

  const fullWidth = children.filter((child) => child.geometry.width >= target.geometry.width * 0.85).length;
  const substantial = children.filter((child) => child.geometry.height >= target.geometry.height * 0.08);
  const textRich = substantial.filter((child) => textDescendants(child) >= 5).length;
  const sorted = [...children].sort((a, b) => a.geometry.y - b.geometry.y);
  let sequentialPairs = 0;
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (!previous || !current) continue;
    const expectedStart = previous.geometry.y + previous.geometry.height;
    if (current.geometry.y >= expectedStart - 4) sequentialPairs += 1;
  }

  const fullWidthPct = Math.round((fullWidth / Math.max(1, children.length)) * 100);
  const textRichPct = Math.round((textRich / Math.max(1, substantial.length)) * 100);
  const sequentialPct = Math.round((sequentialPairs / Math.max(1, sorted.length - 1)) * 100);
  const matched = fullWidthPct >= 80 && substantial.length >= 4 && textRichPct >= 75 && sequentialPct >= 80;

  return {
    matched,
    evidence: {
      semanticRule: 'chapter-like-full-width-stack',
      semanticFullWidthChildPct: fullWidthPct,
      semanticSubstantialChildCount: substantial.length,
      semanticTextRichPct: textRichPct,
      semanticSequentialPairPct: sequentialPct,
    },
  };
}

function semanticFor(section: AuditNode, detection: PatternDetection, all: PatternDetection[]): SemanticResult | null {
  const located = locate(section, detection.targetNodeId);
  if (!located) return null;
  const target = located.node;
  const sectionHeight = Math.max(1, section.geometry.height);

  if (detection.pattern === 'carousel-track' && target.clipsContent) {
    return {
      hint: 'carousel-viewport',
      evidence: {
        semanticRule: 'clipped-overflow-carousel-viewport',
        semanticClipsContent: true,
      },
    };
  }

  if (detection.pattern === 'grid') {
    const itemCount = Number(detection.evidence.itemCount ?? 0);
    const widthConsistency = Number(detection.evidence.widthConsistencyPct ?? 0);
    const occupancy = Number(detection.evidence.occupancyPct ?? 0);
    if (itemCount >= 4 && itemCount <= 12 && widthConsistency >= 75 && occupancy >= 70) {
      return {
        hint: 'repeated-cards',
        evidence: { semanticRule: 'coherent-small-grid', semanticItemCount: itemCount },
      };
    }
  }

  if (detection.pattern === 'two-column') {
    const topRatio = located.offsetY / sectionHeight;
    const heightRatio = target.geometry.height / sectionHeight;
    if (topRatio <= 0.28 && heightRatio <= 0.38) {
      return {
        hint: 'split-header',
        evidence: {
          semanticRule: 'shallow-top-two-column',
          semanticTopPct: Math.round(topRatio * 100),
          semanticHeightPct: Math.round(heightRatio * 100),
        },
      };
    }
  }

  if (detection.pattern === 'vertical-stack') {
    const itemCount = Number(detection.evidence.itemCount ?? 0);
    if (itemCount >= 4) {
      const nestedTwoColumns = all.filter((candidate) => {
        if (candidate.pattern !== 'two-column' || candidate.targetNodeId === detection.targetNodeId) return false;
        return containsNode(target, candidate.targetNodeId);
      }).length;
      if (nestedTwoColumns >= 2) {
        return {
          hint: 'timeline-chapter',
          evidence: { semanticRule: 'stack-with-repeated-two-column-chapters', semanticNestedTwoColumnCount: nestedTwoColumns },
        };
      }

      const chapterStack = chapterLikeStack(target);
      if (chapterStack.matched) {
        return { hint: 'timeline-chapter', evidence: chapterStack.evidence };
      }

      const visibleChildren = target.children.filter((child) => child.visible);
      const factLike = visibleChildren.filter((child) => {
        const texts = textDescendants(child) + (child.isText ? 1 : 0);
        return texts >= 1 && texts <= 4;
      }).length;
      if (visibleChildren.length >= 4 && factLike / visibleChildren.length >= 0.7) {
        return {
          hint: 'facts-list',
          evidence: {
            semanticRule: 'compact-text-item-stack',
            semanticFactLikePct: Math.round((factLike / visibleChildren.length) * 100),
          },
        };
      }
    }
  }

  if (detection.pattern === 'horizontal-row') {
    const itemCount = Number(detection.evidence.itemCount ?? 0);
    const topRatio = located.offsetY / sectionHeight;
    const heightRatio = target.geometry.height / sectionHeight;
    if (itemCount >= 3 && itemCount <= 6 && topRatio >= 0.45 && heightRatio >= 0.15) {
      const withText = target.children.filter((child) => child.visible && textDescendants(child) > 0).length;
      const visibleCount = Math.max(1, target.children.filter((child) => child.visible).length);
      if (withText / visibleCount >= 0.6) {
        return {
          hint: 'footer-columns',
          evidence: {
            semanticRule: 'lower-page-text-columns',
            semanticTextColumnPct: Math.round((withText / visibleCount) * 100),
          },
        };
      }
    }
  }

  return null;
}

/** Add conservative semantic hints without replacing the underlying geometric classification. */
export function enrichSemanticHints(section: AuditNode, detections: PatternDetection[]): PatternDetection[] {
  return detections.map((detection) => {
    const semantic = semanticFor(section, detection, detections);
    return semantic
      ? { ...detection, semanticHint: semantic.hint, evidence: { ...detection.evidence, ...semantic.evidence } }
      : detection;
  });
}
