import type { AuditNode, PatternDetection, SemanticHint } from './types';

interface LocatedNode {
  node: AuditNode;
  offsetX: number;
  offsetY: number;
  depth: number;
  parentOffsetY: number;
}

interface SemanticResult {
  hint: SemanticHint;
  evidence: Record<string, string | number | boolean>;
}

function locate(root: AuditNode, targetId: string): LocatedNode | null {
  const queue: LocatedNode[] = [{ node: root, offsetX: 0, offsetY: 0, depth: 0, parentOffsetY: 0 }];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (current.node.id === targetId) return current;
    for (const child of current.node.children) {
      queue.push({
        node: child,
        offsetX: current.offsetX + child.geometry.x,
        offsetY: current.offsetY + child.geometry.y,
        depth: current.depth + 1,
        parentOffsetY: current.offsetY,
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

function imageDescendants(node: AuditNode): number {
  let count = 0;
  const stack = [...node.children];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    if (current.isImageLike) count += 1;
    stack.push(...current.children);
  }
  return count;
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

function containsNode(root: AuditNode, targetId: string): boolean {
  if (root.id === targetId) return true;
  return root.children.some((child) => containsNode(child, targetId));
}

function horizontalCoverage(target: AuditNode): number {
  const children = target.children.filter((child) => child.visible);
  if (children.length === 0) return 0;
  const left = Math.min(...children.map((child) => child.geometry.x));
  const right = Math.max(...children.map((child) => child.geometry.x + child.geometry.width));
  return Math.max(0, right - left) / Math.max(1, target.geometry.width);
}

function heightConsistency(nodes: AuditNode[]): number {
  if (nodes.length === 0) return 0;
  const heights = nodes.map((node) => node.geometry.height).filter((height) => height > 0);
  if (heights.length === 0) return 0;
  const average = heights.reduce((sum, height) => sum + height, 0) / heights.length;
  return heights.filter((height) => Math.abs(height - average) <= average * 0.2).length / heights.length;
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

function factsLikeStack(target: AuditNode): { matched: boolean; evidence: Record<string, string | number | boolean> } {
  const items = target.children.filter((child) => child.visible && child.isContainer);
  if (items.length < 5) return { matched: false, evidence: {} };

  const textItemCount = items.filter((item) => {
    const texts = textDescendants(item);
    return texts >= 1 && texts <= 4;
  }).length;
  const broadItemCount = items.filter((item) => item.geometry.width >= target.geometry.width * 0.8).length;
  const textItemPct = Math.round((textItemCount / items.length) * 100);
  const broadItemPct = Math.round((broadItemCount / items.length) * 100);
  const heightConsistencyPct = Math.round(heightConsistency(items) * 100);
  const matched = textItemPct >= 80 && broadItemPct >= 80 && heightConsistencyPct >= 70;

  return {
    matched,
    evidence: {
      semanticRule: 'repeated-container-text-items',
      semanticFactItemCount: items.length,
      semanticFactLikePct: textItemPct,
      semanticBroadItemPct: broadItemPct,
      semanticHeightConsistencyPct: heightConsistencyPct,
    },
  };
}

function metricLikeGrid(section: AuditNode, target: AuditNode, detection: PatternDetection): SemanticResult | null {
  const itemCount = Number(detection.evidence.itemCount ?? 0);
  if (itemCount < 4 || itemCount > 8) return null;

  const items = target.children.filter((child) => child.visible && child.isContainer);
  if (items.length !== itemCount) return null;

  const semanticName = `${section.name} ${target.name}`.toLowerCase();
  const explicitMetricName = /\b(metric|metrics|stat|stats|statistics|kpi|kpis|number|numbers|counter|counters|figures?)\b/.test(semanticName);
  if (!explicitMetricName) return null;

  const simple = items.filter((item) => {
    const texts = textDescendants(item);
    return texts >= 1 && texts <= 3 && imageDescendants(item) === 0 && descendantCount(item) <= 8;
  }).length;
  const simplePct = Math.round((simple / Math.max(1, items.length)) * 100);
  const targetHeightPct = Math.round((target.geometry.height / Math.max(1, section.geometry.height)) * 100);
  if (simplePct < 80 || targetHeightPct > 45) return null;

  return {
    hint: 'metric-grid',
    evidence: {
      semanticRule: 'explicit-metric-name-simple-text-grid',
      semanticMetricItemCount: itemCount,
      semanticSimpleMetricPct: simplePct,
      semanticTargetHeightPct: targetHeightPct,
      semanticMetricNameEvidence: true,
    },
  };
}

function socialLikeRow(section: AuditNode, target: AuditNode, detection: PatternDetection): SemanticResult | null {
  const itemCount = Number(detection.evidence.itemCount ?? 0);
  if (itemCount < 2 || itemCount > 8) return null;

  const semanticName = `${section.name} ${target.name}`.toLowerCase();
  const explicitSocialName = /\b(social|socials|follow|connect)\b/.test(semanticName);
  if (!explicitSocialName) return null;

  const children = target.children.filter((child) => child.visible && child.isContainer);
  if (children.length !== itemCount) return null;
  const compact = children.filter((child) => textDescendants(child) <= 2 && descendantCount(child) <= 6).length;
  const compactPct = Math.round((compact / Math.max(1, children.length)) * 100);
  const heightPct = Math.round((target.geometry.height / Math.max(1, section.geometry.height)) * 100);
  const maxChildWidthPct = Math.round(Math.max(...children.map((child) => child.geometry.width / Math.max(1, target.geometry.width))) * 100);
  if (compactPct < 80 || heightPct > 18 || maxChildWidthPct > 40) return null;

  return {
    hint: 'social-link-strip',
    evidence: {
      semanticRule: 'explicit-social-name-compact-horizontal-row',
      semanticSocialItemCount: itemCount,
      semanticCompactSocialPct: compactPct,
      semanticHeightPct: heightPct,
      semanticMaxChildWidthPct: maxChildWidthPct,
      semanticSocialNameEvidence: true,
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
    const metric = metricLikeGrid(section, target, detection);
    if (metric) return metric;

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
    const parentTopRatio = located.parentOffsetY / sectionHeight;
    const topLevelContext = located.depth <= 1 || parentTopRatio <= 0.02;

    if (topRatio <= 0.28 && heightRatio <= 0.38 && topLevelContext) {
      return {
        hint: 'split-header',
        evidence: {
          semanticRule: 'shallow-top-level-two-column',
          semanticTopPct: Math.round(topRatio * 100),
          semanticHeightPct: Math.round(heightRatio * 100),
          semanticDepth: located.depth,
          semanticParentTopPct: Math.round(parentTopRatio * 100),
        },
      };
    }
  }

  if (detection.pattern === 'vertical-stack') {
    const itemCount = Number(detection.evidence.itemCount ?? 0);

    if (itemCount >= 5) {
      const nestedTwoColumns = all.filter((candidate) => {
        if (candidate.pattern !== 'two-column' || candidate.targetNodeId === detection.targetNodeId) return false;
        return containsNode(target, candidate.targetNodeId);
      }).length;
      if (nestedTwoColumns >= 2) {
        return {
          hint: 'timeline-chapter',
          evidence: {
            semanticRule: 'stack-with-repeated-two-column-chapters',
            semanticNestedTwoColumnCount: nestedTwoColumns,
            semanticStackItemCount: itemCount,
          },
        };
      }

      const chapterStack = chapterLikeStack(target);
      if (chapterStack.matched) {
        return { hint: 'timeline-chapter', evidence: chapterStack.evidence };
      }

      const factStack = factsLikeStack(target);
      if (factStack.matched) {
        return { hint: 'facts-list', evidence: factStack.evidence };
      }
    }
  }

  if (detection.pattern === 'horizontal-row') {
    const itemCount = Number(detection.evidence.itemCount ?? 0);
    const topRatio = located.offsetY / sectionHeight;
    const heightRatio = target.geometry.height / sectionHeight;
    const withText = target.children.filter((child) => child.visible && textDescendants(child) > 0).length;
    const visibleCount = Math.max(1, target.children.filter((child) => child.visible).length);
    const textRatio = withText / visibleCount;
    const coverage = horizontalCoverage(target);

    if (
      itemCount >= 3 &&
      itemCount <= 6 &&
      topRatio >= 0.55 &&
      heightRatio <= 0.18 &&
      textRatio >= 0.75 &&
      coverage >= 0.65
    ) {
      return {
        hint: 'footer-columns',
        evidence: {
          semanticRule: 'shallow-lower-page-text-columns',
          semanticTopPct: Math.round(topRatio * 100),
          semanticHeightPct: Math.round(heightRatio * 100),
          semanticTextColumnPct: Math.round(textRatio * 100),
          semanticHorizontalCoveragePct: Math.round(coverage * 100),
        },
      };
    }

    const social = socialLikeRow(section, target, detection);
    if (social) return social;
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
