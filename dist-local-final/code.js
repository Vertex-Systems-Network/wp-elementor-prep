"use strict";
(() => {
  // src/core/classifier.ts
  function clamp(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }
  function centerX(node) {
    return node.geometry.x + node.geometry.width / 2;
  }
  function centerY(node) {
    return node.geometry.y + node.geometry.height / 2;
  }
  function clusterBy(nodes, axis, tolerance) {
    const sorted = [...nodes].sort((a, b) => axis === "x" ? centerX(a) - centerX(b) : centerY(a) - centerY(b));
    const clusters = [];
    for (const node of sorted) {
      const value = axis === "x" ? centerX(node) : centerY(node);
      const last = clusters.at(-1);
      if (!last || Math.abs(last.center - value) > tolerance) {
        clusters.push({ center: value, items: [node] });
        continue;
      }
      last.items.push(node);
      last.center = last.items.reduce((sum, item) => sum + (axis === "x" ? centerX(item) : centerY(item)), 0) / last.items.length;
    }
    return clusters;
  }
  function countDescendants(node) {
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
  function isLikelyBackground(parent, child, siblingCount) {
    if (siblingCount < 3) return false;
    const widthCoverage = child.geometry.width / Math.max(1, parent.geometry.width);
    const heightCoverage = child.geometry.height / Math.max(1, parent.geometry.height);
    const originNear = Math.abs(child.geometry.x) <= 3 && Math.abs(child.geometry.y) <= 3;
    return widthCoverage >= 0.94 && heightCoverage >= 0.9 && originNear && countDescendants(child) <= 6;
  }
  function meaningfulChildren(node) {
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
  function dimensionConsistency(nodes, dimension) {
    if (nodes.length === 0) return 0;
    const values = nodes.map((node) => node.geometry[dimension]).filter((value) => value > 0);
    if (values.length === 0) return 0;
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const consistent = values.filter((value) => Math.abs(value - average) <= average * 0.12).length;
    return consistent / values.length;
  }
  function widthConsistency(nodes) {
    return dimensionConsistency(nodes, "width");
  }
  function detectTwoColumn(node, children) {
    if (children.length !== 2) return null;
    const [left, right] = [...children].sort((a, b) => a.geometry.x - b.geometry.x);
    if (!left || !right) return null;
    const yDelta = Math.abs(left.geometry.y - right.geometry.y);
    const horizontalGap = right.geometry.x - (left.geometry.x + left.geometry.width);
    const combinedWidth = left.geometry.width + right.geometry.width + Math.max(0, horizontalGap);
    const coverage = combinedWidth / Math.max(1, node.geometry.width);
    const nonOverlap = horizontalGap >= -3;
    const similarOrigin = yDelta <= Math.max(6, node.geometry.height * 0.03);
    const meaningfulColumnWidths = left.geometry.width >= node.geometry.width * 0.18 && right.geometry.width >= node.geometry.width * 0.18;
    if (coverage < 0.55 || !meaningfulColumnWidths || !nonOverlap) return null;
    let confidence = 60;
    if (similarOrigin) confidence += 18;
    confidence += 10;
    if (coverage >= 0.72) confidence += 8;
    if (coverage >= 0.9) confidence += 4;
    return {
      pattern: "two-column",
      confidence: clamp(confidence),
      targetNodeId: node.id,
      targetNodeName: node.name,
      evidence: {
        yDelta: Math.round(yDelta * 100) / 100,
        horizontalGap: Math.round(horizontalGap * 100) / 100,
        parentWidthCoveragePct: Math.round(coverage * 100),
        meaningfulColumnWidths,
        nonOverlap
      }
    };
  }
  function strictGrid(node, children) {
    if (children.length < 4) return null;
    const xTolerance = Math.max(8, node.geometry.width * 0.04);
    const yTolerance = Math.max(8, node.geometry.height * 0.06);
    const xClusters = clusterBy(children, "x", xTolerance);
    const yClusters = clusterBy(children, "y", yTolerance);
    const consistency = widthConsistency(children);
    if (xClusters.length < 2 || yClusters.length < 2) return null;
    if (xClusters.length * yClusters.length < children.length) return null;
    const occupancy = children.length / (xClusters.length * yClusters.length);
    if (occupancy < 0.6 || consistency < 0.65) return null;
    let confidence = 45;
    confidence += Math.min(25, xClusters.length * 5 + yClusters.length * 3);
    confidence += consistency * 20;
    confidence += occupancy >= 0.7 ? 10 : 0;
    return {
      pattern: "grid",
      confidence: clamp(confidence),
      targetNodeId: node.id,
      targetNodeName: node.name,
      evidence: {
        itemCount: children.length,
        columns: xClusters.length,
        rows: yClusters.length,
        widthConsistencyPct: Math.round(consistency * 100),
        occupancyPct: Math.round(occupancy * 100),
        fragmentedCellCandidate: false
      }
    };
  }
  function dominantSizeAnchors(children) {
    let best = [];
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
  function fragmentedGrid(node, children) {
    if (children.length < 6) return null;
    const anchors = dominantSizeAnchors(children);
    if (anchors.length < 4 || anchors.length >= children.length) return null;
    const xClusters = clusterBy(anchors, "x", Math.max(8, node.geometry.width * 0.04));
    const yClusters = clusterBy(anchors, "y", Math.max(8, node.geometry.height * 0.06));
    if (xClusters.length < 2 || yClusters.length < 2) return null;
    const slots = xClusters.length * yClusters.length;
    const missingSlots = slots - anchors.length;
    const occupancy = anchors.length / Math.max(1, slots);
    if (missingSlots < 1 || missingSlots > 2 || occupancy < 0.66) return null;
    const widthCons = dimensionConsistency(anchors, "width");
    const heightCons = dimensionConsistency(anchors, "height");
    if (widthCons < 0.75 || heightCons < 0.75) return null;
    const fragmentCount = children.length - anchors.length;
    const confidence = clamp(
      52 + widthCons * 10 + heightCons * 10 + (occupancy >= 0.75 ? 10 : 5) + (missingSlots === 1 ? 5 : 0)
    );
    return {
      pattern: "grid",
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
        fragmentedCellCandidate: true
      }
    };
  }
  function detectGrid(node, children) {
    return strictGrid(node, children) ?? fragmentedGrid(node, children);
  }
  function detectHorizontalRow(node, children) {
    if (children.length < 2) return null;
    const yTolerance = Math.max(6, node.geometry.height * 0.05);
    const yClusters = clusterBy(children, "y", yTolerance);
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
      pattern: "horizontal-row",
      confidence,
      targetNodeId: node.id,
      targetNodeName: node.name,
      evidence: { itemCount: children.length, overlapPairs: overlaps, yClusterCount: 1 }
    };
  }
  function detectVerticalStack(node, children) {
    if (children.length < 2) return null;
    const xTolerance = Math.max(6, node.geometry.width * 0.05);
    const xClusters = clusterBy(children, "x", xTolerance);
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
      pattern: "vertical-stack",
      confidence,
      targetNodeId: node.id,
      targetNodeName: node.name,
      evidence: { itemCount: children.length, overlapPairs: overlaps, xClusterCount: 1 }
    };
  }
  function detectCarousel(node, children) {
    if (children.length < 3) return null;
    const sorted = [...children].sort((a, b) => a.geometry.x - b.geometry.x);
    const rightEdge = Math.max(...sorted.map((child) => child.geometry.x + child.geometry.width));
    const overflow = rightEdge - node.geometry.width;
    const consistency = widthConsistency(children);
    const row = detectHorizontalRow(node, children);
    const likelyOverflow = overflow > node.geometry.width * 0.08;
    if (!likelyOverflow || consistency < 0.65 || !row) return null;
    return {
      pattern: "carousel-track",
      confidence: clamp(68 + consistency * 17 + (node.clipsContent ? 10 : 0)),
      targetNodeId: node.id,
      targetNodeName: node.name,
      evidence: {
        itemCount: children.length,
        overflowPx: Math.round(overflow),
        widthConsistencyPct: Math.round(consistency * 100),
        clipsContent: node.clipsContent
      }
    };
  }
  function detectionsForNode(node) {
    const children = meaningfulChildren(node);
    if (children.length < 2) return [];
    return [
      detectCarousel(node, children),
      detectTwoColumn(node, children),
      detectGrid(node, children),
      detectHorizontalRow(node, children),
      detectVerticalStack(node, children)
    ].filter((detection) => detection !== null).sort((a, b) => b.confidence - a.confidence);
  }
  function detectPatterns(section, maxDepth = 3, maxResults = 8) {
    const queue = [{ node: section, depth: 0 }];
    const byKey = /* @__PURE__ */ new Map();
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
    return [...byKey.values()].sort((a, b) => b.confidence - a.confidence).slice(0, Math.max(1, maxResults));
  }
  function recipeForPattern(pattern) {
    if (pattern === "unknown") return null;
    return pattern;
  }

  // src/core/ranking.ts
  var specificity = {
    "carousel-track": 500,
    grid: 400,
    "two-column": 300,
    "horizontal-row": 200,
    "vertical-stack": 100,
    unknown: 0
  };
  function stronger(a, b) {
    const aSpecificity = specificity[a.pattern];
    const bSpecificity = specificity[b.pattern];
    if (aSpecificity !== bSpecificity) return aSpecificity > bSpecificity ? a : b;
    if (a.confidence !== b.confidence) return a.confidence > b.confidence ? a : b;
    return a;
  }
  function rankPatternDetections(detections, maxResults = 8) {
    const byTarget = /* @__PURE__ */ new Map();
    for (const detection of detections) {
      const current = byTarget.get(detection.targetNodeId);
      byTarget.set(detection.targetNodeId, current ? stronger(current, detection) : detection);
    }
    return [...byTarget.values()].sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      return specificity[b.pattern] - specificity[a.pattern];
    }).slice(0, Math.max(1, maxResults));
  }

  // src/core/semantics.ts
  function locate(root, targetId) {
    const queue = [{ node: root, offsetX: 0, offsetY: 0, depth: 0, parentOffsetY: 0 }];
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
          parentOffsetY: current.offsetY
        });
      }
    }
    return null;
  }
  function textDescendants(node) {
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
  function imageDescendants(node) {
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
  function descendantCount(node) {
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
  function containsNode(root, targetId) {
    if (root.id === targetId) return true;
    return root.children.some((child) => containsNode(child, targetId));
  }
  function horizontalCoverage(target) {
    const children = target.children.filter((child) => child.visible);
    if (children.length === 0) return 0;
    const left = Math.min(...children.map((child) => child.geometry.x));
    const right = Math.max(...children.map((child) => child.geometry.x + child.geometry.width));
    return Math.max(0, right - left) / Math.max(1, target.geometry.width);
  }
  function heightConsistency(nodes) {
    if (nodes.length === 0) return 0;
    const heights = nodes.map((node) => node.geometry.height).filter((height) => height > 0);
    if (heights.length === 0) return 0;
    const average = heights.reduce((sum, height) => sum + height, 0) / heights.length;
    return heights.filter((height) => Math.abs(height - average) <= average * 0.2).length / heights.length;
  }
  function chapterLikeStack(target) {
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
    const fullWidthPct = Math.round(fullWidth / Math.max(1, children.length) * 100);
    const textRichPct = Math.round(textRich / Math.max(1, substantial.length) * 100);
    const sequentialPct = Math.round(sequentialPairs / Math.max(1, sorted.length - 1) * 100);
    const matched = fullWidthPct >= 80 && substantial.length >= 4 && textRichPct >= 75 && sequentialPct >= 80;
    return {
      matched,
      evidence: {
        semanticRule: "chapter-like-full-width-stack",
        semanticFullWidthChildPct: fullWidthPct,
        semanticSubstantialChildCount: substantial.length,
        semanticTextRichPct: textRichPct,
        semanticSequentialPairPct: sequentialPct
      }
    };
  }
  function factsLikeStack(target) {
    const items = target.children.filter((child) => child.visible && child.isContainer);
    if (items.length < 5) return { matched: false, evidence: {} };
    const textItemCount = items.filter((item) => {
      const texts = textDescendants(item);
      return texts >= 1 && texts <= 4;
    }).length;
    const broadItemCount = items.filter((item) => item.geometry.width >= target.geometry.width * 0.8).length;
    const textItemPct = Math.round(textItemCount / items.length * 100);
    const broadItemPct = Math.round(broadItemCount / items.length * 100);
    const heightConsistencyPct = Math.round(heightConsistency(items) * 100);
    const matched = textItemPct >= 80 && broadItemPct >= 80 && heightConsistencyPct >= 70;
    return {
      matched,
      evidence: {
        semanticRule: "repeated-container-text-items",
        semanticFactItemCount: items.length,
        semanticFactLikePct: textItemPct,
        semanticBroadItemPct: broadItemPct,
        semanticHeightConsistencyPct: heightConsistencyPct
      }
    };
  }
  function metricLikeGrid(section, target, detection) {
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
    const simplePct = Math.round(simple / Math.max(1, items.length) * 100);
    const targetHeightPct = Math.round(target.geometry.height / Math.max(1, section.geometry.height) * 100);
    if (simplePct < 80 || targetHeightPct > 45) return null;
    return {
      hint: "metric-grid",
      evidence: {
        semanticRule: "explicit-metric-name-simple-text-grid",
        semanticMetricItemCount: itemCount,
        semanticSimpleMetricPct: simplePct,
        semanticTargetHeightPct: targetHeightPct,
        semanticMetricNameEvidence: true
      }
    };
  }
  function socialLikeRow(section, target, detection) {
    const itemCount = Number(detection.evidence.itemCount ?? 0);
    if (itemCount < 2 || itemCount > 8) return null;
    const semanticName = `${section.name} ${target.name}`.toLowerCase();
    const explicitSocialName = /\b(social|socials|follow|connect)\b/.test(semanticName);
    if (!explicitSocialName) return null;
    const children = target.children.filter((child) => child.visible && child.isContainer);
    if (children.length !== itemCount) return null;
    const compact = children.filter((child) => textDescendants(child) <= 2 && descendantCount(child) <= 6).length;
    const compactPct = Math.round(compact / Math.max(1, children.length) * 100);
    const heightPct = Math.round(target.geometry.height / Math.max(1, section.geometry.height) * 100);
    const maxChildWidthPct = Math.round(Math.max(...children.map((child) => child.geometry.width / Math.max(1, target.geometry.width))) * 100);
    if (compactPct < 80 || heightPct > 18 || maxChildWidthPct > 40) return null;
    return {
      hint: "social-link-strip",
      evidence: {
        semanticRule: "explicit-social-name-compact-horizontal-row",
        semanticSocialItemCount: itemCount,
        semanticCompactSocialPct: compactPct,
        semanticHeightPct: heightPct,
        semanticMaxChildWidthPct: maxChildWidthPct,
        semanticSocialNameEvidence: true
      }
    };
  }
  function semanticFor(section, detection, all) {
    const located = locate(section, detection.targetNodeId);
    if (!located) return null;
    const target = located.node;
    const sectionHeight = Math.max(1, section.geometry.height);
    if (detection.pattern === "carousel-track" && target.clipsContent) {
      return {
        hint: "carousel-viewport",
        evidence: {
          semanticRule: "clipped-overflow-carousel-viewport",
          semanticClipsContent: true
        }
      };
    }
    if (detection.pattern === "grid") {
      const metric2 = metricLikeGrid(section, target, detection);
      if (metric2) return metric2;
      const itemCount = Number(detection.evidence.itemCount ?? 0);
      const widthConsistency2 = Number(detection.evidence.widthConsistencyPct ?? 0);
      const occupancy = Number(detection.evidence.occupancyPct ?? 0);
      if (itemCount >= 4 && itemCount <= 12 && widthConsistency2 >= 75 && occupancy >= 70) {
        return {
          hint: "repeated-cards",
          evidence: { semanticRule: "coherent-small-grid", semanticItemCount: itemCount }
        };
      }
    }
    if (detection.pattern === "two-column") {
      const topRatio = located.offsetY / sectionHeight;
      const heightRatio = target.geometry.height / sectionHeight;
      const parentTopRatio = located.parentOffsetY / sectionHeight;
      const topLevelContext = located.depth <= 1 || parentTopRatio <= 0.02;
      if (topRatio <= 0.28 && heightRatio <= 0.38 && topLevelContext) {
        return {
          hint: "split-header",
          evidence: {
            semanticRule: "shallow-top-level-two-column",
            semanticTopPct: Math.round(topRatio * 100),
            semanticHeightPct: Math.round(heightRatio * 100),
            semanticDepth: located.depth,
            semanticParentTopPct: Math.round(parentTopRatio * 100)
          }
        };
      }
    }
    if (detection.pattern === "vertical-stack") {
      const itemCount = Number(detection.evidence.itemCount ?? 0);
      if (itemCount >= 5) {
        const nestedTwoColumns = all.filter((candidate) => {
          if (candidate.pattern !== "two-column" || candidate.targetNodeId === detection.targetNodeId) return false;
          return containsNode(target, candidate.targetNodeId);
        }).length;
        if (nestedTwoColumns >= 2) {
          return {
            hint: "timeline-chapter",
            evidence: {
              semanticRule: "stack-with-repeated-two-column-chapters",
              semanticNestedTwoColumnCount: nestedTwoColumns,
              semanticStackItemCount: itemCount
            }
          };
        }
        const chapterStack = chapterLikeStack(target);
        if (chapterStack.matched) {
          return { hint: "timeline-chapter", evidence: chapterStack.evidence };
        }
        const factStack = factsLikeStack(target);
        if (factStack.matched) {
          return { hint: "facts-list", evidence: factStack.evidence };
        }
      }
    }
    if (detection.pattern === "horizontal-row") {
      const itemCount = Number(detection.evidence.itemCount ?? 0);
      const topRatio = located.offsetY / sectionHeight;
      const heightRatio = target.geometry.height / sectionHeight;
      const withText = target.children.filter((child) => child.visible && textDescendants(child) > 0).length;
      const visibleCount = Math.max(1, target.children.filter((child) => child.visible).length);
      const textRatio = withText / visibleCount;
      const coverage = horizontalCoverage(target);
      if (itemCount >= 3 && itemCount <= 6 && topRatio >= 0.55 && heightRatio <= 0.18 && textRatio >= 0.75 && coverage >= 0.65) {
        return {
          hint: "footer-columns",
          evidence: {
            semanticRule: "shallow-lower-page-text-columns",
            semanticTopPct: Math.round(topRatio * 100),
            semanticHeightPct: Math.round(heightRatio * 100),
            semanticTextColumnPct: Math.round(textRatio * 100),
            semanticHorizontalCoveragePct: Math.round(coverage * 100)
          }
        };
      }
      const social = socialLikeRow(section, target, detection);
      if (social) return social;
    }
    return null;
  }
  function enrichSemanticHints(section, detections) {
    return detections.map((detection) => {
      const semantic = semanticFor(section, detection, detections);
      return semantic ? { ...detection, semanticHint: semantic.hint, evidence: { ...detection.evidence, ...semantic.evidence } } : detection;
    });
  }

  // src/core/classification.ts
  function detectPatterns2(section, maxDepth = 3, maxResults = 8) {
    const geometric = detectPatterns(section, maxDepth, Math.max(maxResults * 4, 24));
    const enriched = enrichSemanticHints(section, geometric);
    return rankPatternDetections(enriched, maxResults);
  }
  function recipeForDetection(detection) {
    return detection.semanticHint ?? recipeForPattern(detection.pattern);
  }

  // src/core/p5-runtime-gate.ts
  var P5_RUNTIME_GATE_VERSION = "p5-runtime-proof-v3";
  var P5_RUNTIME_PROOF_STORAGE_KEY = "pella-elementor-prep:p5-runtime-proof";
  function isTraceableP5RuntimeBuildIdentity(value) {
    if (typeof value !== "object" || value === null) return false;
    const build = value;
    return typeof build.sourceSha === "string" && /^[0-9a-f]{40}$/i.test(build.sourceSha) && typeof build.runId === "string" && /^[1-9][0-9]*$/.test(build.runId) && typeof build.runNumber === "string" && /^[1-9][0-9]*$/.test(build.runNumber);
  }
  function sameP5RuntimeBuildIdentity(left, right) {
    return left.sourceSha === right.sourceSha && left.runId === right.runId && left.runNumber === right.runNumber;
  }
  function createP5RuntimeProof(build, passedAt = (/* @__PURE__ */ new Date()).toISOString()) {
    return {
      schemaVersion: 1,
      gateVersion: P5_RUNTIME_GATE_VERSION,
      passedAt,
      build: { ...build }
    };
  }
  function isValidP5RuntimeProof(value, expectedBuild) {
    if (typeof value !== "object" || value === null) return false;
    const proof = value;
    if (proof.schemaVersion !== 1 || proof.gateVersion !== P5_RUNTIME_GATE_VERSION || typeof proof.passedAt !== "string" || proof.passedAt.length === 0 || !isTraceableP5RuntimeBuildIdentity(proof.build)) {
      return false;
    }
    if (expectedBuild !== void 0) {
      if (!isTraceableP5RuntimeBuildIdentity(expectedBuild)) return false;
      if (!sameP5RuntimeBuildIdentity(proof.build, expectedBuild)) return false;
    }
    return true;
  }

  // src/core/roles.ts
  function clamp2(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }
  function descendantCount2(node) {
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
  function intersectionArea(a, b) {
    const left = Math.max(a.geometry.x, b.geometry.x);
    const top = Math.max(a.geometry.y, b.geometry.y);
    const right = Math.min(a.geometry.x + a.geometry.width, b.geometry.x + b.geometry.width);
    const bottom = Math.min(a.geometry.y + a.geometry.height, b.geometry.y + b.geometry.height);
    if (right <= left || bottom <= top) return 0;
    return (right - left) * (bottom - top);
  }
  function classifyChild(parent, child, siblings) {
    const parentArea = Math.max(1, parent.geometry.width * parent.geometry.height);
    const childArea = Math.max(1, child.geometry.width * child.geometry.height);
    const widthCoverage = child.geometry.width / Math.max(1, parent.geometry.width);
    const heightCoverage = child.geometry.height / Math.max(1, parent.geometry.height);
    const areaCoverage = childArea / parentArea;
    const originNear = Math.abs(child.geometry.x) <= 3 && Math.abs(child.geometry.y) <= 3;
    const descendants = descendantCount2(child);
    if (siblings.length >= 2 && !child.isAutoLayout && widthCoverage >= 0.94 && heightCoverage >= 0.9 && originNear && descendants <= 8) {
      return {
        role: "background-layer",
        confidence: 96,
        targetNodeId: child.id,
        targetNodeName: child.name,
        parentNodeId: parent.id,
        evidence: {
          widthCoveragePct: Math.round(widthCoverage * 100),
          heightCoveragePct: Math.round(heightCoverage * 100),
          originNear,
          isAutoLayout: child.isAutoLayout,
          descendantCount: descendants
        }
      };
    }
    if (child.absolutePositioned) {
      return {
        role: "absolute-overlay",
        confidence: 94,
        targetNodeId: child.id,
        targetNodeName: child.name,
        parentNodeId: parent.id,
        evidence: {
          areaCoveragePct: Math.round(areaCoverage * 100),
          opacityPct: Math.round(child.opacity * 100),
          descendantCount: descendants
        }
      };
    }
    if (child.opacity <= 0.45 && descendants <= 6) {
      const maxOverlap = siblings.filter((sibling) => sibling.id !== child.id && sibling.visible).reduce((max, sibling) => Math.max(max, intersectionArea(child, sibling)), 0);
      const overlapRatio = maxOverlap / childArea;
      if (overlapRatio >= 0.15) {
        return {
          role: "decorative-overlay",
          confidence: clamp2(68 + Math.min(20, overlapRatio * 30) + (child.opacity <= 0.25 ? 8 : 0)),
          targetNodeId: child.id,
          targetNodeName: child.name,
          parentNodeId: parent.id,
          evidence: {
            opacityPct: Math.round(child.opacity * 100),
            maxOverlapPct: Math.round(overlapRatio * 100),
            descendantCount: descendants
          }
        };
      }
    }
    return null;
  }
  function detectSpecialRoles(section, maxDepth = 3, maxResults = 20) {
    const queue = [{ node: section, depth: 0 }];
    const byTarget = /* @__PURE__ */ new Map();
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
    return [...byTarget.values()].sort((a, b) => b.confidence - a.confidence).slice(0, Math.max(1, maxResults));
  }

  // src/core/safe-recipe-planner.ts
  var PATTERN_RULES = {
    "vertical-stack": { recipe: "vertical-stack", minConfidence: 90 },
    "horizontal-row": { recipe: "horizontal-row", minConfidence: 90 },
    "two-column": { recipe: "two-column", minConfidence: 92 }
  };
  var SEMANTIC_RULES = {
    "facts-list": { recipe: "facts-list", minConfidence: 92 },
    "footer-columns": { recipe: "footer-columns", minConfidence: 92 },
    "repeated-cards": { recipe: "simple-card-grid", minConfidence: 94 },
    "metric-grid": { recipe: "metric-grid", minConfidence: 95 },
    "social-link-strip": { recipe: "social-link-strip", minConfidence: 95 }
  };
  function findNodeById(root, nodeId) {
    const queue = [{ node: root, path: [] }];
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;
      if (current.node.id === nodeId) return current;
      current.node.children.forEach((child, index) => {
        queue.push({ node: child, path: [...current.path, index] });
      });
    }
    return null;
  }
  function planned(detection, targetPath, recipe, decision, reasonCode, reason, minConfidence, extraEvidence = {}) {
    const semantic = detection.semanticHint ? { semanticHint: detection.semanticHint } : {};
    return {
      schemaVersion: 1,
      decision,
      recipe,
      reasonCode,
      reason,
      confidence: detection.confidence,
      minConfidence,
      pattern: detection.pattern,
      ...semantic,
      targetNodeId: detection.targetNodeId,
      targetNodeName: detection.targetNodeName,
      targetPath,
      evidence: { ...detection.evidence, ...extraEvidence }
    };
  }
  function ruleForDetection(detection) {
    if (detection.semanticHint) {
      const semantic = SEMANTIC_RULES[detection.semanticHint];
      if (semantic) return semantic;
    }
    return PATTERN_RULES[detection.pattern] ?? null;
  }
  function alreadyStructured(target, detection) {
    if (!target.isAutoLayout) return false;
    if (detection.pattern === "vertical-stack") return target.layoutMode === "VERTICAL";
    if (detection.pattern === "horizontal-row" || detection.pattern === "two-column") return target.layoutMode === "HORIZONTAL";
    if (detection.pattern === "grid") return target.layoutMode === "GRID";
    return false;
  }
  function planSafeRecipe(section, detection, roles = []) {
    const match = findNodeById(section, detection.targetNodeId);
    if (!match) {
      return planned(
        detection,
        [],
        null,
        "REVIEW",
        "TARGET_NOT_FOUND",
        "The classifier target is not present in the audited section tree; no candidate mutation is allowed.",
        null
      );
    }
    const { node: target, path } = match;
    if (detection.pattern === "carousel-track" || detection.semanticHint === "carousel-viewport" || detection.semanticHint === "timeline-chapter") {
      return planned(
        detection,
        path,
        null,
        "UNSUPPORTED",
        "ADVANCED_PATTERN_DEFERRED",
        "Carousel and timeline structures are deferred to P6 and must remain read-only in P5.",
        null
      );
    }
    if (detection.semanticHint === "split-header") {
      return planned(
        detection,
        path,
        null,
        "REVIEW",
        "SEMANTIC_RECIPE_NOT_SUPPORTED",
        "Split-header semantics are not an initial P5 Safe Fix recipe.",
        null
      );
    }
    if (detection.pattern === "grid" && detection.semanticHint !== "repeated-cards" && detection.semanticHint !== "metric-grid") {
      return planned(
        detection,
        path,
        null,
        "REVIEW",
        "AMBIGUOUS_GRID_SEMANTICS",
        "A geometric grid without conservative card/metric semantics could represent media, facts or decoration; keep it in REVIEW.",
        null
      );
    }
    if (detection.pattern === "grid" && Boolean(detection.evidence.fragmentedCellCandidate)) {
      return planned(
        detection,
        path,
        null,
        "REVIEW",
        "FRAGMENTED_GRID_UNSAFE",
        "Fragmented grid synthesis requires wrapper creation and is intentionally deferred from the first Safe Fix recipes.",
        null
      );
    }
    const roleOnTarget = roles.find((role) => role.targetNodeId === target.id || role.parentNodeId === target.id);
    if (roleOnTarget) {
      return planned(
        detection,
        path,
        null,
        "REVIEW",
        "SPECIAL_VISUAL_ROLE_PRESENT",
        `The target contains or is associated with ${roleOnTarget.role}; P5 will not normalize this structure automatically.`,
        null,
        { blockingRole: roleOnTarget.role }
      );
    }
    const absoluteChildren = target.children.filter((child) => child.visible && child.absolutePositioned).length;
    if (absoluteChildren > 0) {
      return planned(
        detection,
        path,
        null,
        "REVIEW",
        "ABSOLUTE_CHILD_PRESENT",
        "The target has visible absolute-positioned direct children; the first P5 recipes require ordinary-flow children only.",
        null,
        { absoluteDirectChildren: absoluteChildren }
      );
    }
    if (alreadyStructured(target, detection)) {
      const rule2 = ruleForDetection(detection);
      return planned(
        detection,
        path,
        rule2?.recipe ?? null,
        "NOOP",
        "TARGET_ALREADY_STRUCTURED",
        "The target already uses the matching Auto Layout/Grid mode, so no mutation is necessary.",
        rule2?.minConfidence ?? null
      );
    }
    const rule = ruleForDetection(detection);
    if (!rule) {
      return planned(
        detection,
        path,
        null,
        "UNSUPPORTED",
        "PATTERN_NOT_SUPPORTED",
        "No conservative P5 recipe is registered for this detection.",
        null
      );
    }
    if (detection.confidence < rule.minConfidence) {
      return planned(
        detection,
        path,
        rule.recipe,
        "REVIEW",
        "BELOW_CONFIDENCE_GATE",
        `Confidence ${detection.confidence}% is below the ${rule.minConfidence}% mutation gate for ${rule.recipe}.`,
        rule.minConfidence
      );
    }
    return planned(
      detection,
      path,
      rule.recipe,
      "ELIGIBLE",
      "SUPPORTED_HIGH_CONFIDENCE",
      `High-confidence ${rule.recipe} target is eligible for candidate-only transformation followed by mandatory P3 validation.`,
      rule.minConfidence
    );
  }
  function planSafeRecipes(section, detections, roles = []) {
    return detections.map((detection) => planSafeRecipe(section, detection, roles));
  }

  // src/core/scanner.ts
  var GENERIC_NAME = /^(frame|group|container|rectangle|text|paragraph|heading|section|line)(\b|\s|\d|\s+copy)/i;
  function numeric(value, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  }
  function normalizeLayoutMode(value) {
    const normalized = String(value ?? "NONE");
    if (normalized === "NONE" || normalized === "HORIZONTAL" || normalized === "VERTICAL" || normalized === "GRID") {
      return normalized;
    }
    return "UNKNOWN";
  }
  function isGenericLayerName(name) {
    return GENERIC_NAME.test(name.trim());
  }
  function readLayoutMode(node) {
    if (!("layoutMode" in node)) return "UNKNOWN";
    return normalizeLayoutMode(node.layoutMode);
  }
  function hasImageFill(node) {
    if (!("fills" in node)) return false;
    const fills = node.fills;
    if (!Array.isArray(fills)) return false;
    return fills.some((paint) => paint.type === "IMAGE");
  }
  function childNodes(node) {
    if (!("children" in node)) return [];
    return node.children;
  }
  function isAbsolute(node) {
    if (!("layoutPositioning" in node)) return false;
    return String(node.layoutPositioning) === "ABSOLUTE";
  }
  function textAutoResize(node) {
    if (node.type !== "TEXT") return null;
    return String(node.textAutoResize);
  }
  function clipsContent(node) {
    if (!("clipsContent" in node)) return false;
    return Boolean(node.clipsContent);
  }
  function readOpacity(node) {
    if (!("opacity" in node)) return 1;
    return numeric(node.opacity, 1);
  }
  function scanSceneNode(node) {
    const children = childNodes(node).map(scanSceneNode);
    const mode = readLayoutMode(node);
    const isContainer = children.length > 0 || "children" in node;
    const isText = node.type === "TEXT";
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      geometry: {
        x: numeric(node.x),
        y: numeric(node.y),
        width: numeric(node.width),
        height: numeric(node.height)
      },
      layoutMode: mode,
      isAutoLayout: mode === "HORIZONTAL" || mode === "VERTICAL" || mode === "GRID",
      isContainer,
      isText,
      isImageLike: hasImageFill(node),
      isGenericName: isGenericLayerName(node.name),
      textLength: isText ? node.characters.length : 0,
      textAutoResize: textAutoResize(node),
      absolutePositioned: isAbsolute(node),
      clipsContent: clipsContent(node),
      opacity: readOpacity(node),
      visible: node.visible,
      childIds: children.map((child) => child.id),
      children
    };
  }
  function flatten(root) {
    const result = [];
    const stack = [root];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;
      result.push(current);
      for (let i = current.children.length - 1; i >= 0; i -= 1) {
        const child = current.children[i];
        if (child) stack.push(child);
      }
    }
    return result;
  }
  function computeStats(root) {
    const nodes = flatten(root).filter((node) => node.visible);
    const containers = nodes.filter((node) => node.isContainer);
    const autoLayoutContainers = containers.filter((node) => node.isAutoLayout).length;
    const manualContainers = Math.max(0, containers.length - autoLayoutContainers);
    const textNodes = nodes.filter((node) => node.isText);
    const autoHeightTextNodes = textNodes.filter((node) => {
      const value = node.textAutoResize;
      return value === "HEIGHT" || value === "WIDTH_AND_HEIGHT";
    }).length;
    return {
      nodes: nodes.length,
      containers: containers.length,
      autoLayoutContainers,
      manualContainers,
      autoLayoutCoveragePct: containers.length === 0 ? 100 : Math.round(autoLayoutContainers / containers.length * 100),
      textNodes: textNodes.length,
      autoHeightTextNodes,
      genericNames: nodes.filter((node) => node.isGenericName).length,
      absolutePositionedNodes: nodes.filter((node) => node.absolutePositioned).length,
      imageLikeNodes: nodes.filter((node) => node.isImageLike).length
    };
  }
  function candidateScore(root, candidate) {
    if (!candidate.isContainer || candidate.children.length < 4) return -1;
    if (candidate.geometry.width < root.geometry.width * 0.65) return -1;
    if (candidate.geometry.height < root.geometry.height * 0.4) return -1;
    const sectionishChildren = candidate.children.filter(
      (child) => child.isContainer && child.geometry.width >= candidate.geometry.width * 0.6
    );
    const verticalSpread = candidate.children.length > 1 ? Math.max(...candidate.children.map((child) => child.geometry.y)) - Math.min(...candidate.children.map((child) => child.geometry.y)) : 0;
    return sectionishChildren.length * 10 + candidate.children.length + Math.min(20, verticalSpread / 200);
  }
  function discoverSections(root) {
    const candidates = flatten(root).filter((node) => node.id !== root.id).map((node) => ({ node, score: candidateScore(root, node) })).filter((entry) => entry.score >= 0).sort((a, b) => b.score - a.score);
    const wrapper = candidates[0]?.node;
    if (!wrapper) {
      return root.children.filter((child) => child.isContainer && child.visible).sort((a, b) => a.geometry.y - b.geometry.y);
    }
    return wrapper.children.filter((child) => child.isContainer && child.visible).sort((a, b) => a.geometry.y - b.geometry.y);
  }

  // src/core/scoring.ts
  function clamp3(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Math.round(value)));
  }
  function statusFor(score) {
    if (score >= 80) return "PASS";
    if (score >= 70) return "REVIEW";
    return "NEEDS_WORK";
  }
  function ratio(numerator, denominator, fallback = 1) {
    if (denominator <= 0) return fallback;
    return numerator / denominator;
  }
  function scoreStats(stats) {
    const layout = ratio(stats.autoLayoutContainers, stats.containers) * 50;
    const naming = (1 - ratio(stats.genericNames, stats.nodes, 0)) * 10;
    const textBehavior = ratio(stats.autoHeightTextNodes, stats.textNodes) * 12;
    const absoluteSafety = (1 - Math.min(1, ratio(stats.absolutePositionedNodes, stats.nodes, 0) * 3)) * 8;
    const structuralBaseline = stats.containers > 0 ? 10 : 5;
    const contentBaseline = stats.textNodes > 0 || stats.imageLikeNodes > 0 ? 10 : 5;
    return clamp3(layout + naming + textBehavior + absoluteSafety + structuralBaseline + contentBaseline);
  }
  function findingsFor(stats) {
    const findings = [];
    if (stats.autoLayoutCoveragePct < 50) {
      findings.push({
        code: "LOW_AUTO_LAYOUT_COVERAGE",
        severity: "error",
        title: "Normal layout is likely too manual",
        detail: "Less than half of container-like nodes currently participate in Auto Layout. This is a screening signal, not proof that every manual frame is wrong.",
        evidence: { autoLayoutCoveragePct: stats.autoLayoutCoveragePct, manualContainers: stats.manualContainers }
      });
    } else if (stats.autoLayoutCoveragePct < 75) {
      findings.push({
        code: "PARTIAL_AUTO_LAYOUT_COVERAGE",
        severity: "warning",
        title: "Layout is only partially structured",
        detail: "A meaningful share of container-like nodes are still manual and should be classified before any fix is proposed.",
        evidence: { autoLayoutCoveragePct: stats.autoLayoutCoveragePct }
      });
    }
    const genericRatio = ratio(stats.genericNames, stats.nodes, 0);
    if (genericRatio >= 0.45) {
      findings.push({
        code: "GENERIC_LAYER_NAMES",
        severity: "warning",
        title: "Layer semantics are weak",
        detail: "Generic names are common. Names remain secondary evidence only; geometry and node relationships drive classification.",
        evidence: { genericNames: stats.genericNames, nodes: stats.nodes }
      });
    }
    const textAutoRatio = ratio(stats.autoHeightTextNodes, stats.textNodes);
    if (stats.textNodes > 0 && textAutoRatio < 0.6) {
      findings.push({
        code: "TEXT_REFLOW_RISK",
        severity: "warning",
        title: "Text sizing may create reflow risk",
        detail: "Many text nodes do not currently use an auto-height style. A later classifier must distinguish intentional fixed text from risky fixed heights.",
        evidence: { textNodes: stats.textNodes, autoHeightTextNodes: stats.autoHeightTextNodes }
      });
    }
    if (stats.absolutePositionedNodes > 0) {
      findings.push({
        code: "ABSOLUTE_POSITIONING_PRESENT",
        severity: "info",
        title: "Absolute positioning requires role classification",
        detail: "Absolute positioning is valid for overlays and decoration. P2 reports special roles separately so future mutation does not normalize them blindly.",
        evidence: { absolutePositionedNodes: stats.absolutePositionedNodes }
      });
    }
    if (findings.length === 0) {
      findings.push({
        code: "NO_MAJOR_SCREENING_ISSUES",
        severity: "info",
        title: "No major screening issue detected",
        detail: "This remains an audit signal only; high-confidence mutation requires later validation and transaction phases.",
        evidence: { autoLayoutCoveragePct: stats.autoLayoutCoveragePct }
      });
    }
    return findings;
  }
  function auditSection(section) {
    const stats = computeStats(section);
    const detections = detectPatterns2(section);
    const detection = detections[0] ?? null;
    const roleDetections = detectSpecialRoles(section);
    let score = scoreStats(stats);
    if (detection && detection.confidence >= 85) score = clamp3(score + 3);
    const status = statusFor(score);
    return {
      id: section.id,
      name: section.name,
      score,
      status,
      stats,
      findings: findingsFor(stats),
      detection,
      detections,
      roleDetections,
      recommendedRecipe: status === "PASS" || !detection ? null : recipeForDetection(detection)
    };
  }
  function buildAuditReport(root, pluginVersion, generatedAt = (/* @__PURE__ */ new Date()).toISOString()) {
    const stats = computeStats(root);
    const sections = discoverSections(root).map(auditSection);
    const score = sections.length > 0 ? clamp3(sections.reduce((sum, section) => sum + section.score, 0) / sections.length) : scoreStats(stats);
    return {
      schemaVersion: 1,
      pluginVersion,
      root: {
        id: root.id,
        name: root.name,
        width: root.geometry.width,
        height: root.geometry.height
      },
      score,
      status: statusFor(score),
      stats,
      findings: findingsFor(stats),
      sections,
      generatedAt
    };
  }

  // src/core/backlog.ts
  var CATEGORY_ORDER = {
    ERROR: 0,
    WARNING: 1,
    IMPROVEMENT: 2,
    INFO: 3
  };
  var PRIORITY_ORDER = {
    P0: 0,
    P1: 1,
    P2: 2,
    P3: 3
  };
  function normalizeText(value) {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
  }
  function fnv1a32(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
  }
  function fingerprintFor(draft) {
    const semanticIdentity = [
      draft.category,
      draft.code,
      normalizeText(draft.title),
      normalizeText(draft.proposedAction),
      normalizeText(draft.recipeCandidate ?? "")
    ].join("|");
    const forward = fnv1a32(semanticIdentity);
    const reverse = fnv1a32([...semanticIdentity].reverse().join(""));
    return `p9-${forward}${reverse}`;
  }
  function contextKey(context) {
    return [
      context.fileKey ?? "",
      context.pageId ?? "",
      context.frameId ?? "",
      context.sectionId ?? "",
      context.nodeId ?? "",
      context.pageName ?? "",
      context.frameName ?? "",
      context.sectionName ?? "",
      context.nodeName ?? ""
    ].join("|");
  }
  function evidenceKey(evidence) {
    const values = Object.keys(evidence.values).sort().map((key) => `${key}=${String(evidence.values[key])}`).join("|");
    return `${contextKey(evidence.context)}|${evidence.confidence ?? ""}|${values}`;
  }
  function categoryForFinding(severity) {
    if (severity === "error") return "ERROR";
    if (severity === "warning") return "WARNING";
    return "INFO";
  }
  function severityForCategory(category) {
    if (category === "ERROR") return "HIGH";
    if (category === "WARNING" || category === "IMPROVEMENT") return "MEDIUM";
    return "LOW";
  }
  function priorityForCategory(category) {
    if (category === "ERROR") return "P1";
    if (category === "WARNING" || category === "IMPROVEMENT") return "P2";
    return "P3";
  }
  function actionForFinding(finding2) {
    switch (finding2.code) {
      case "LOW_AUTO_LAYOUT_COVERAGE":
        return "Classify manual containers and convert only high-confidence normal-flow structures to safe Auto Layout recipes.";
      case "PARTIAL_AUTO_LAYOUT_COVERAGE":
        return "Review remaining manual containers and preserve intentional overlays or absolute-positioned visual roles.";
      case "GENERIC_LAYER_NAMES":
        return "Improve semantic layer naming where it aids maintainability; never use names as the sole mutation signal.";
      case "TEXT_REFLOW_RISK":
        return "Review fixed-height text behavior and prefer safe auto-height text only where content/layout evidence supports it.";
      case "ABSOLUTE_POSITIONING_PRESENT":
        return "Classify absolute-positioned nodes as content, overlay, decoration or background before proposing any normalization.";
      case "NO_MAJOR_SCREENING_ISSUES":
        return "Keep the current structure under observation; no automatic change is required from this screening signal.";
      default:
        return "Review the finding evidence and choose the least invasive deterministic correction that preserves visual output.";
    }
  }
  function baseContext(report, context) {
    return {
      ...context,
      frameId: report.root.id,
      frameName: report.root.name
    };
  }
  function findingDraft(finding2, context) {
    const category = categoryForFinding(finding2.severity);
    return {
      category,
      severity: severityForCategory(category),
      priority: priorityForCategory(category),
      source: "AUDIT",
      code: finding2.code,
      title: finding2.title,
      explanation: finding2.detail,
      proposedAction: actionForFinding(finding2),
      recipeCandidate: null,
      autoFixEligible: false,
      confidence: null,
      context,
      evidence: finding2.evidence
    };
  }
  function recipeDraft(section, context) {
    if (!section.recommendedRecipe || section.status === "PASS") return null;
    const detection = section.detection;
    const label = detection?.semanticHint ?? detection?.pattern ?? "structured layout";
    return {
      category: "IMPROVEMENT",
      severity: "MEDIUM",
      priority: "P2",
      source: "AUDIT",
      code: "ELEMENTOR_RECIPE_CANDIDATE",
      title: `Candidate structural improvement: ${label}`,
      explanation: `Section ${section.name} is not currently PASS and has a deterministic recipe candidate. The backlog records the opportunity without mutating the design.`,
      proposedAction: section.recommendedRecipe,
      recipeCandidate: section.recommendedRecipe,
      // P9 only reports opportunities. Mutation eligibility remains owned by explicit P5+ safety gates.
      autoFixEligible: false,
      confidence: detection?.confidence ?? null,
      context,
      evidence: {
        sectionScore: section.score,
        sectionStatus: section.status,
        pattern: detection?.pattern ?? "unknown",
        confidence: detection?.confidence ?? 0
      }
    };
  }
  function runtimeDraft(finding2, fallbackContext) {
    const category = finding2.category ?? "ERROR";
    return {
      category,
      severity: finding2.severity ?? severityForCategory(category),
      priority: finding2.priority ?? priorityForCategory(category),
      source: "RUNTIME",
      code: finding2.code,
      title: finding2.title,
      explanation: finding2.explanation,
      proposedAction: finding2.proposedAction,
      recipeCandidate: finding2.recipeCandidate ?? null,
      autoFixEligible: finding2.autoFixEligible ?? false,
      confidence: finding2.confidence ?? null,
      context: { ...fallbackContext, ...finding2.context },
      evidence: finding2.evidence ?? {}
    };
  }
  function collectDrafts(report, options) {
    const frameContext = baseContext(report, options.context);
    const drafts = report.findings.map((finding2) => findingDraft(finding2, frameContext));
    for (const section of report.sections) {
      const sectionContext = {
        ...frameContext,
        sectionId: section.id,
        sectionName: section.name
      };
      for (const finding2 of section.findings) drafts.push(findingDraft(finding2, sectionContext));
      const recipe = recipeDraft(section, sectionContext);
      if (recipe) drafts.push(recipe);
    }
    for (const runtimeFinding of options.runtimeFindings ?? []) {
      drafts.push(runtimeDraft(runtimeFinding, frameContext));
    }
    return drafts;
  }
  function aggregateDrafts(drafts, observedAt) {
    const items = /* @__PURE__ */ new Map();
    for (const draft of drafts) {
      const fingerprint = fingerprintFor(draft);
      const existing = items.get(fingerprint);
      const evidence = {
        context: draft.context,
        values: draft.evidence,
        confidence: draft.confidence
      };
      if (!existing) {
        items.set(fingerprint, {
          id: `BLG-${fingerprint.slice(3).toUpperCase()}`,
          fingerprint,
          category: draft.category,
          severity: draft.severity,
          priority: draft.priority,
          status: "OPEN",
          delta: "NEW",
          source: draft.source,
          code: draft.code,
          title: draft.title,
          explanation: draft.explanation,
          proposedAction: draft.proposedAction,
          recipeCandidate: draft.recipeCandidate,
          autoFixEligible: draft.autoFixEligible,
          confidence: draft.confidence,
          firstSeen: observedAt,
          lastSeen: observedAt,
          occurrences: 1,
          contexts: [draft.context],
          evidence: [evidence]
        });
        continue;
      }
      existing.occurrences += 1;
      if (!existing.contexts.some((context) => contextKey(context) === contextKey(draft.context))) {
        existing.contexts.push(draft.context);
      }
      if (!existing.evidence.some((entry) => evidenceKey(entry) === evidenceKey(evidence))) {
        existing.evidence.push(evidence);
      }
      if (draft.confidence !== null) {
        existing.confidence = existing.confidence === null ? draft.confidence : Math.max(existing.confidence, draft.confidence);
      }
      existing.autoFixEligible = existing.autoFixEligible && draft.autoFixEligible;
      if (existing.source !== draft.source) existing.source = "RUNTIME";
    }
    return [...items.values()];
  }
  function applyDelta(current, previous) {
    if (!previous) return current;
    const previousByFingerprint = new Map(previous.items.map((item) => [item.fingerprint, item]));
    const currentFingerprints = new Set(current.map((item) => item.fingerprint));
    const result = current.map((item) => {
      const before = previousByFingerprint.get(item.fingerprint);
      if (!before) return item;
      const regressed = before.status === "RESOLVED";
      return {
        ...item,
        firstSeen: before.firstSeen,
        status: regressed ? "REGRESSED" : before.status === "ACCEPTED_RISK" ? "ACCEPTED_RISK" : "OPEN",
        delta: regressed ? "REGRESSED" : "UNCHANGED"
      };
    });
    for (const before of previous.items) {
      if (currentFingerprints.has(before.fingerprint)) continue;
      if (before.status === "RESOLVED") {
        result.push({
          ...before,
          delta: "UNCHANGED",
          occurrences: 0
        });
        continue;
      }
      result.push({
        ...before,
        status: "RESOLVED",
        delta: "RESOLVED",
        occurrences: 0
      });
    }
    return result;
  }
  function sortItems(items) {
    return [...items].sort((a, b) => {
      const category = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
      if (category !== 0) return category;
      const priority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (priority !== 0) return priority;
      const code = a.code.localeCompare(b.code);
      return code !== 0 ? code : a.fingerprint.localeCompare(b.fingerprint);
    });
  }
  function zeroRecord(keys) {
    return Object.fromEntries(keys.map((key) => [key, 0]));
  }
  function summarize(items) {
    const byCategory = zeroRecord(["ERROR", "WARNING", "INFO", "IMPROVEMENT"]);
    const bySeverity = zeroRecord(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
    const byStatus = zeroRecord(["OPEN", "RESOLVED", "REGRESSED", "ACCEPTED_RISK"]);
    const byDelta = zeroRecord(["NEW", "RESOLVED", "REGRESSED", "UNCHANGED"]);
    for (const item of items) {
      byStatus[item.status] += 1;
      byDelta[item.delta] += 1;
      if (item.status !== "RESOLVED") {
        byCategory[item.category] += 1;
        bySeverity[item.severity] += 1;
      }
    }
    return {
      total: items.length,
      active: items.filter((item) => item.status !== "RESOLVED").length,
      byCategory,
      bySeverity,
      byStatus,
      byDelta
    };
  }
  function generateBacklog(report, options = {}) {
    const observedAt = report.generatedAt;
    const items = sortItems(applyDelta(aggregateDrafts(collectDrafts(report, options), observedAt), options.previous));
    return {
      schemaVersion: 1,
      generatedAt: observedAt,
      sourceAudit: {
        schemaVersion: report.schemaVersion,
        pluginVersion: report.pluginVersion,
        rootId: report.root.id,
        rootName: report.root.name,
        score: report.score,
        status: report.status
      },
      summary: summarize(items),
      items
    };
  }
  function serializeBacklogJson(backlog) {
    return `${JSON.stringify(backlog, null, 2)}
`;
  }
  function markdownCell(value) {
    return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  }
  function serializeBacklogMarkdown(backlog) {
    const lines = [
      "# Elementor Prep Backlog",
      "",
      `Generated: ${backlog.generatedAt}`,
      `Source: ${backlog.sourceAudit.rootName} \xB7 score ${backlog.sourceAudit.score} \xB7 ${backlog.sourceAudit.status}`,
      "",
      "## Summary",
      "",
      `- Active: ${backlog.summary.active}`,
      `- Active ERROR: ${backlog.summary.byCategory.ERROR}`,
      `- Active WARNING: ${backlog.summary.byCategory.WARNING}`,
      `- Active IMPROVEMENT: ${backlog.summary.byCategory.IMPROVEMENT}`,
      `- Active INFO: ${backlog.summary.byCategory.INFO}`,
      `- Active severity CRITICAL / HIGH / MEDIUM / LOW: ${backlog.summary.bySeverity.CRITICAL} / ${backlog.summary.bySeverity.HIGH} / ${backlog.summary.bySeverity.MEDIUM} / ${backlog.summary.bySeverity.LOW}`,
      `- New / resolved / regressed / unchanged: ${backlog.summary.byDelta.NEW} / ${backlog.summary.byDelta.RESOLVED} / ${backlog.summary.byDelta.REGRESSED} / ${backlog.summary.byDelta.UNCHANGED}`,
      "",
      "## Items",
      "",
      "| ID | Category | Priority | Status | Delta | Code | Occurrences | Title | Proposed action |",
      "|---|---|---|---|---|---|---:|---|---|",
      ...backlog.items.map((item) => [
        item.id,
        item.category,
        item.priority,
        item.status,
        item.delta,
        item.code,
        String(item.occurrences),
        markdownCell(item.title),
        markdownCell(item.proposedAction)
      ].join(" | ").replace(/^/, "| ").replace(/$/, " |")),
      ""
    ];
    return `${lines.join("\n")}
`;
  }

  // src/core/report-serialization.ts
  function serializeAuditReportJson(report) {
    return `${JSON.stringify(report, null, 2)}
`;
  }
  function cell(value) {
    return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  }
  function serializeAuditReportMarkdown(report) {
    const lines = [
      "# Elementor Prep Audit",
      "",
      `Generated: ${report.generatedAt}`,
      `Root: ${report.root.name} \xB7 ${Math.round(report.root.width)} \xD7 ${Math.round(report.root.height)}`,
      `Score: ${report.score} \xB7 ${report.status}`,
      "",
      "## Summary",
      "",
      `- Nodes: ${report.stats.nodes}`,
      `- Containers: ${report.stats.containers}`,
      `- Auto Layout coverage: ${report.stats.autoLayoutCoveragePct}%`,
      `- Text nodes: ${report.stats.textNodes}`,
      `- Image-like nodes: ${report.stats.imageLikeNodes}`,
      `- Sections: ${report.sections.length}`,
      "",
      "## Findings",
      "",
      "| Severity | Code | Title | Detail |",
      "|---|---|---|---|",
      ...report.findings.map((finding2) => `| ${finding2.severity.toUpperCase()} | ${cell(finding2.code)} | ${cell(finding2.title)} | ${cell(finding2.detail)} |`),
      "",
      "## Sections",
      "",
      "| Section | Score | Status | Pattern | Confidence | Recipe |",
      "|---|---:|---|---|---:|---|",
      ...report.sections.map((section) => `| ${cell(section.name)} | ${section.score} | ${section.status} | ${cell(section.detection?.pattern ?? "\u2014")} | ${section.detection?.confidence ?? "\u2014"} | ${cell(section.recommendedRecipe ?? "\u2014")} |`),
      ""
    ];
    return `${lines.join("\n")}
`;
  }

  // src/core/validator.ts
  var DEFAULT_VALIDATION_THRESHOLDS = {
    version: "p3-v1",
    rootSizePx: 2,
    anchorPositionPx: 2,
    anchorSizePx: 2,
    pixelChannelDelta: 8,
    maxChangedPixelPct: 0.5,
    maxMeanChannelDelta: 0.5
  };
  function stableFingerprint(value) {
    let fnv = 2166136261;
    let djb = 5381;
    for (let index = 0; index < value.length; index += 1) {
      const code = value.charCodeAt(index);
      fnv ^= code;
      fnv = Math.imul(fnv, 16777619);
      djb = (djb << 5) + djb ^ code;
    }
    const a = (fnv >>> 0).toString(16).padStart(8, "0");
    const b = (djb >>> 0).toString(16).padStart(8, "0");
    return `${value.length}:${a}:${b}`;
  }
  function finiteGeometry(geometry) {
    return [geometry.x, geometry.y, geometry.width, geometry.height].every(Number.isFinite) && geometry.width >= 0 && geometry.height >= 0;
  }
  function maxPositionDrift(a, b) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  }
  function maxSizeDrift(a, b) {
    return Math.max(Math.abs(a.width - b.width), Math.abs(a.height - b.height));
  }
  function sortedAnchors(anchors) {
    return [...anchors].sort((a, b) => a.geometry.y - b.geometry.y || a.geometry.x - b.geometry.x || a.geometry.width - b.geometry.width || a.geometry.height - b.geometry.height || a.path.localeCompare(b.path));
  }
  function groupByFingerprint(anchors) {
    const groups = /* @__PURE__ */ new Map();
    for (const anchor of anchors) {
      const existing = groups.get(anchor.fingerprint);
      if (existing) existing.push(anchor);
      else groups.set(anchor.fingerprint, [anchor]);
    }
    for (const [fingerprint, group] of groups) groups.set(fingerprint, sortedAnchors(group));
    return groups;
  }
  function compareAnchorSets(before, after) {
    const a = groupByFingerprint(before);
    const b = groupByFingerprint(after);
    const fingerprints = /* @__PURE__ */ new Set([...a.keys(), ...b.keys()]);
    let contentMatches = before.length === after.length;
    let changedFingerprintGroups = 0;
    let maxPositionDriftPx = 0;
    let maxSizeDriftPx = 0;
    for (const fingerprint of fingerprints) {
      const beforeGroup = a.get(fingerprint) ?? [];
      const afterGroup = b.get(fingerprint) ?? [];
      if (beforeGroup.length !== afterGroup.length) {
        contentMatches = false;
        changedFingerprintGroups += 1;
        continue;
      }
      for (let index = 0; index < beforeGroup.length; index += 1) {
        const left = beforeGroup[index];
        const right = afterGroup[index];
        if (!left || !right) continue;
        maxPositionDriftPx = Math.max(maxPositionDriftPx, maxPositionDrift(left.geometry, right.geometry));
        maxSizeDriftPx = Math.max(maxSizeDriftPx, maxSizeDrift(left.geometry, right.geometry));
      }
    }
    return { contentMatches, changedFingerprintGroups, maxPositionDriftPx, maxSizeDriftPx };
  }
  function snapshotGeometryValid(snapshot) {
    if (!Number.isFinite(snapshot.root.width) || !Number.isFinite(snapshot.root.height)) return false;
    if (snapshot.root.width <= 0 || snapshot.root.height <= 0) return false;
    return [...snapshot.textAnchors, ...snapshot.imageAnchors].every((anchor) => finiteGeometry(anchor.geometry));
  }
  function finding(code, title, detail, evidence) {
    return { code, severity: "error", title, detail, evidence };
  }
  function validateIntegrity(before, after, thresholds = DEFAULT_VALIDATION_THRESHOLDS) {
    const findings = [];
    const beforeValid = snapshotGeometryValid(before);
    const afterValid = snapshotGeometryValid(after);
    if (!beforeValid || !afterValid) {
      findings.push(finding(
        "INVALID_SNAPSHOT_GEOMETRY",
        "Snapshot contains invalid geometry",
        "Validation cannot trust a snapshot containing non-finite, negative, or zero-sized root geometry.",
        { beforeValid, afterValid }
      ));
    }
    const rootDrift = Math.max(
      Math.abs(before.root.width - after.root.width),
      Math.abs(before.root.height - after.root.height)
    );
    if (rootDrift > thresholds.rootSizePx) {
      findings.push(finding(
        "ROOT_GEOMETRY_DRIFT",
        "Section bounds changed",
        "The candidate section changed width or height beyond the allowed root-size tolerance.",
        { maxDriftPx: rootDrift, allowedPx: thresholds.rootSizePx }
      ));
    }
    const text = compareAnchorSets(before.textAnchors, after.textAnchors);
    if (!text.contentMatches) {
      findings.push(finding(
        "TEXT_CONTENT_DRIFT",
        "Text content changed",
        "The candidate does not contain the same multiset of text-content fingerprints as the original section.",
        {
          beforeCount: before.textAnchors.length,
          afterCount: after.textAnchors.length,
          changedFingerprintGroups: text.changedFingerprintGroups
        }
      ));
    } else if (text.maxPositionDriftPx > thresholds.anchorPositionPx || text.maxSizeDriftPx > thresholds.anchorSizePx) {
      findings.push(finding(
        "TEXT_GEOMETRY_DRIFT",
        "Text geometry drifted",
        "Text content is intact, but one or more text anchors moved or resized beyond tolerance.",
        {
          maxPositionDriftPx: text.maxPositionDriftPx,
          maxSizeDriftPx: text.maxSizeDriftPx,
          allowedPositionPx: thresholds.anchorPositionPx,
          allowedSizePx: thresholds.anchorSizePx
        }
      ));
    }
    const image = compareAnchorSets(before.imageAnchors, after.imageAnchors);
    if (!image.contentMatches) {
      findings.push(finding(
        "IMAGE_CONTENT_DRIFT",
        "Image content changed",
        "The candidate does not contain the same multiset of image-fill fingerprints as the original section.",
        {
          beforeCount: before.imageAnchors.length,
          afterCount: after.imageAnchors.length,
          changedFingerprintGroups: image.changedFingerprintGroups
        }
      ));
    } else if (image.maxPositionDriftPx > thresholds.anchorPositionPx || image.maxSizeDriftPx > thresholds.anchorSizePx) {
      findings.push(finding(
        "IMAGE_GEOMETRY_DRIFT",
        "Image geometry drifted",
        "Image content is intact, but one or more image anchors moved or resized beyond tolerance.",
        {
          maxPositionDriftPx: image.maxPositionDriftPx,
          maxSizeDriftPx: image.maxSizeDriftPx,
          allowedPositionPx: thresholds.anchorPositionPx,
          allowedSizePx: thresholds.anchorSizePx
        }
      ));
    }
    const metrics = {
      textAnchorCountBefore: before.textAnchors.length,
      textAnchorCountAfter: after.textAnchors.length,
      imageAnchorCountBefore: before.imageAnchors.length,
      imageAnchorCountAfter: after.imageAnchors.length,
      maxRootSizeDriftPx: rootDrift,
      maxTextPositionDriftPx: text.maxPositionDriftPx,
      maxTextSizeDriftPx: text.maxSizeDriftPx,
      maxImagePositionDriftPx: image.maxPositionDriftPx,
      maxImageSizeDriftPx: image.maxSizeDriftPx,
      visibleNodeCountBefore: before.visibleNodeCount,
      visibleNodeCountAfter: after.visibleNodeCount
    };
    return {
      schemaVersion: 1,
      passed: findings.length === 0,
      thresholdVersion: thresholds.version,
      thresholds,
      findings,
      metrics
    };
  }
  function mergePixelValidation(report, pixel) {
    const findings = [...report.findings];
    const thresholds = report.thresholds;
    if (!pixel.sameDimensions) {
      findings.push(finding(
        "PIXEL_DIMENSION_MISMATCH",
        "Rendered dimensions differ",
        "Original and candidate PNG exports decoded to different pixel dimensions.",
        {
          widthBefore: pixel.widthBefore,
          heightBefore: pixel.heightBefore,
          widthAfter: pixel.widthAfter,
          heightAfter: pixel.heightAfter
        }
      ));
    } else if (pixel.changedPixelPct > thresholds.maxChangedPixelPct || pixel.meanChannelDelta > thresholds.maxMeanChannelDelta) {
      findings.push(finding(
        "PIXEL_DIFF_EXCEEDED",
        "Rendered pixel drift exceeded threshold",
        "The candidate render differs from the original beyond the configured section-level visual tolerance.",
        {
          changedPixelPct: pixel.changedPixelPct,
          allowedChangedPixelPct: thresholds.maxChangedPixelPct,
          meanChannelDelta: pixel.meanChannelDelta,
          allowedMeanChannelDelta: thresholds.maxMeanChannelDelta,
          maxChannelDelta: pixel.maxChannelDelta,
          channelTolerance: pixel.channelTolerance
        }
      ));
    }
    return {
      ...report,
      passed: findings.length === 0,
      findings,
      metrics: { ...report.metrics, pixel }
    };
  }

  // src/plugin/integrity-snapshot.ts
  function numeric2(value, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  }
  function childNodes2(node) {
    if (!("children" in node)) return [];
    return node.children;
  }
  function imageHashes(node) {
    if (!("fills" in node)) return [];
    const fills = node.fills;
    if (!Array.isArray(fills)) return [];
    return fills.filter((paint) => paint.type === "IMAGE").map((paint) => paint.imageHash).filter((hash) => typeof hash === "string" && hash.length > 0);
  }
  function captureIntegritySnapshot(root) {
    const textAnchors = [];
    const imageAnchors = [];
    const nodeTypeCounts = {};
    let visibleNodeCount = 0;
    const walk = (node, state) => {
      if (!node.visible) return;
      visibleNodeCount += 1;
      nodeTypeCounts[node.type] = (nodeTypeCounts[node.type] ?? 0) + 1;
      const geometry = {
        x: state.offsetX,
        y: state.offsetY,
        width: numeric2(node.width),
        height: numeric2(node.height)
      };
      if (node.type === "TEXT") {
        textAnchors.push({
          kind: "text",
          fingerprint: `text:${stableFingerprint(node.characters)}`,
          geometry,
          path: state.path
        });
      }
      const hashes = imageHashes(node);
      hashes.forEach((hash, fillIndex) => {
        imageAnchors.push({
          kind: "image",
          fingerprint: `image:${hash}`,
          geometry,
          path: `${state.path}#fill-${fillIndex}`
        });
      });
      childNodes2(node).forEach((child, index) => {
        walk(child, {
          offsetX: state.offsetX + numeric2(child.x),
          offsetY: state.offsetY + numeric2(child.y),
          path: `${state.path}/${index}`
        });
      });
    };
    visibleNodeCount += 1;
    nodeTypeCounts[root.type] = 1;
    if (root.type === "TEXT") {
      textAnchors.push({
        kind: "text",
        fingerprint: `text:${stableFingerprint(root.characters)}`,
        geometry: { x: 0, y: 0, width: numeric2(root.width), height: numeric2(root.height) },
        path: "0"
      });
    }
    imageHashes(root).forEach((hash, fillIndex) => {
      imageAnchors.push({
        kind: "image",
        fingerprint: `image:${hash}`,
        geometry: { x: 0, y: 0, width: numeric2(root.width), height: numeric2(root.height) },
        path: `0#fill-${fillIndex}`
      });
    });
    childNodes2(root).forEach((child, index) => {
      walk(child, {
        offsetX: numeric2(child.x),
        offsetY: numeric2(child.y),
        path: `0/${index}`
      });
    });
    return {
      schemaVersion: 1,
      root: { width: numeric2(root.width), height: numeric2(root.height) },
      textAnchors,
      imageAnchors,
      visibleNodeCount,
      nodeTypeCounts
    };
  }

  // src/plugin/full-frame-validator.ts
  var MAX_VALIDATION_RENDER_DIMENSION = 2048;
  var DEFAULT_PIXEL_BROKER_TIMEOUT_MS = 3e4;
  var FullFrameValidator = class {
    constructor(postMessage, pixelBrokerTimeoutMs = DEFAULT_PIXEL_BROKER_TIMEOUT_MS) {
      this.postMessage = postMessage;
      this.pixelBrokerTimeoutMs = pixelBrokerTimeoutMs;
      if (!Number.isFinite(pixelBrokerTimeoutMs) || pixelBrokerTimeoutMs <= 0) {
        throw new Error("Pixel broker timeout must be a positive finite number.");
      }
    }
    sequence = 0;
    pending = /* @__PURE__ */ new Map();
    async validate(before, after) {
      const beforeSnapshot = captureIntegritySnapshot(before);
      const afterSnapshot = captureIntegritySnapshot(after);
      const report = validateIntegrity(beforeSnapshot, afterSnapshot, DEFAULT_VALIDATION_THRESHOLDS);
      const largestDimension = Math.max(before.width, before.height, after.width, after.height, 1);
      const renderScale = Math.min(1, MAX_VALIDATION_RENDER_DIMENSION / largestDimension);
      const exportSettings = {
        format: "PNG",
        constraint: { type: "SCALE", value: renderScale }
      };
      const [beforePng, afterPng] = await Promise.all([
        before.exportAsync(exportSettings),
        after.exportAsync(exportSettings)
      ]);
      this.sequence += 1;
      const validationId = this.sequence;
      const labels = { before: before.name, after: after.name };
      return new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(() => {
          const pending = this.pending.get(validationId);
          if (!pending) return;
          this.pending.delete(validationId);
          reject(new Error(`Pixel comparison timed out after ${this.pixelBrokerTimeoutMs} ms.`));
        }, this.pixelBrokerTimeoutMs);
        this.pending.set(validationId, {
          report,
          labels,
          renderScale,
          resolve,
          reject,
          timeoutHandle
        });
        try {
          this.postMessage({
            type: "validation-pixel-request",
            validationId,
            beforePng,
            afterPng,
            channelTolerance: DEFAULT_VALIDATION_THRESHOLDS.pixelChannelDelta
          });
        } catch (error) {
          clearTimeout(timeoutHandle);
          this.pending.delete(validationId);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    }
    finish(validationId, pixelMetrics) {
      const pending = this.pending.get(validationId);
      if (!pending) return false;
      this.pending.delete(validationId);
      clearTimeout(pending.timeoutHandle);
      const report = mergePixelValidation(pending.report, pixelMetrics);
      pending.resolve({ report, labels: pending.labels, renderScale: pending.renderScale });
      return true;
    }
    fail(validationId, message) {
      const pending = this.pending.get(validationId);
      if (!pending) return false;
      this.pending.delete(validationId);
      clearTimeout(pending.timeoutHandle);
      pending.reject(new Error(`Pixel comparison failed: ${message}`));
      return true;
    }
    get pendingCount() {
      return this.pending.size;
    }
  };

  // src/plugin/p5-runtime-build-identity.ts
  var P5_RUNTIME_BUILD_IDENTITY = Object.freeze({
    sourceSha: "2b0dcd668066d5194401a9d4e4400ef3d5a000a8",
    runId: "34463779753",
    runNumber: "1"
  });
  function currentP5RuntimeBuildIdentity() {
    return { ...P5_RUNTIME_BUILD_IDENTITY };
  }

  // src/core/transaction.ts
  function now() {
    return (/* @__PURE__ */ new Date()).toISOString();
  }
  function event(state, detail) {
    return { state, at: now(), ...detail ? { detail } : {} };
  }
  function messageOf(error) {
    return error instanceof Error ? error.message : String(error);
  }
  var sequence = 0;
  function createTransactionId(prefix = "tx") {
    sequence += 1;
    return `${prefix}-${Date.now().toString(36)}-${sequence.toString(36)}`;
  }
  async function safeDiscard(adapter, candidate, events) {
    events.push(event("DISCARDING"));
    try {
      await adapter.discardCandidate(candidate);
      return null;
    } catch (error) {
      return messageOf(error);
    }
  }
  async function runCandidateTransaction(originalNodeId, adapter, transactionId = createTransactionId()) {
    const events = [event("IDLE")];
    let candidate = null;
    try {
      events.push(event("CLONING"));
      candidate = await adapter.cloneOriginal(originalNodeId, transactionId);
      if (candidate.originalNodeId !== originalNodeId) {
        throw new Error("Candidate adapter returned a handle for a different original node.");
      }
    } catch (error) {
      return {
        schemaVersion: 1,
        transactionId,
        state: "FAILED",
        originalNodeId,
        failureStage: "clone",
        error: messageOf(error),
        events: [...events, event("FAILED", "clone failed")]
      };
    }
    try {
      events.push(event("TRANSFORMING"));
      await adapter.transformCandidate(candidate);
    } catch (error) {
      const discardError = await safeDiscard(adapter, candidate, events);
      return {
        schemaVersion: 1,
        transactionId,
        state: "FAILED",
        originalNodeId,
        candidateNodeId: candidate.candidateNodeId,
        failureStage: discardError ? "discard" : "transform",
        error: discardError ? `Transform failed (${messageOf(error)}); candidate cleanup also failed (${discardError}).` : messageOf(error),
        events: [...events, event("FAILED", discardError ? "transform + discard failed" : "transform failed")]
      };
    }
    let validation;
    try {
      events.push(event("VALIDATING"));
      validation = await adapter.validateCandidate(candidate);
    } catch (error) {
      const discardError = await safeDiscard(adapter, candidate, events);
      return {
        schemaVersion: 1,
        transactionId,
        state: "FAILED",
        originalNodeId,
        candidateNodeId: candidate.candidateNodeId,
        failureStage: discardError ? "discard" : "validate",
        error: discardError ? `Validation crashed (${messageOf(error)}); candidate cleanup also failed (${discardError}).` : messageOf(error),
        events: [...events, event("FAILED", discardError ? "validation + discard failed" : "validation failed")]
      };
    }
    if (!validation.passed) {
      const discardError = await safeDiscard(adapter, candidate, events);
      if (discardError) {
        return {
          schemaVersion: 1,
          transactionId,
          state: "FAILED",
          originalNodeId,
          candidateNodeId: candidate.candidateNodeId,
          validation,
          failureStage: "discard",
          error: `Candidate was rejected by validation, but cleanup failed: ${discardError}`,
          events: [...events, event("FAILED", "rejected candidate cleanup failed")]
        };
      }
      return {
        schemaVersion: 1,
        transactionId,
        state: "REJECTED",
        originalNodeId,
        candidateNodeId: candidate.candidateNodeId,
        validation,
        events: [...events, event("REJECTED", "validation did not pass")]
      };
    }
    try {
      events.push(event("COMMITTING"));
      const commit = await adapter.commitCandidate(candidate, transactionId);
      return {
        schemaVersion: 1,
        transactionId,
        state: "COMMITTED",
        originalNodeId,
        candidateNodeId: candidate.candidateNodeId,
        validation,
        commit,
        events: [...events, event("COMMITTED")]
      };
    } catch (error) {
      return {
        schemaVersion: 1,
        transactionId,
        state: "FAILED",
        originalNodeId,
        candidateNodeId: candidate.candidateNodeId,
        validation,
        failureStage: "commit",
        error: messageOf(error),
        events: [...events, event("FAILED", "commit failed; adapter recovery required")]
      };
    }
  }

  // src/plugin/figma-transaction-adapter.ts
  var STAGING_X = 1e5;
  var UNDO_STORAGE_KEY = "pella-elementor-prep:last-transaction-undo";
  function childrenParent(node) {
    if (!node || !("children" in node) || !("insertChild" in node)) return null;
    return node;
  }
  async function frameById(nodeId) {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node || node.type !== "FRAME") throw new Error(`Expected Frame ${nodeId}, but it is unavailable.`);
    return node;
  }
  function copyRootChildLayout(original, candidate) {
    if ("layoutAlign" in original && "layoutAlign" in candidate) candidate.layoutAlign = original.layoutAlign;
    if ("layoutGrow" in original && "layoutGrow" in candidate) candidate.layoutGrow = original.layoutGrow;
    if ("layoutPositioning" in original && "layoutPositioning" in candidate) candidate.layoutPositioning = original.layoutPositioning;
  }
  function encodeUndo(metadata) {
    return [
      "p4v1",
      metadata.originalNodeId,
      metadata.committedNodeId,
      metadata.parentNodeId,
      String(metadata.siblingIndex),
      String(metadata.originalX),
      String(metadata.originalY),
      metadata.backupFrameId
    ].join("|");
  }
  function decodeUndo(token) {
    const [version, originalNodeId, committedNodeId, parentNodeId, index, x, y, backupFrameId] = token.split("|");
    if (version !== "p4v1" || !originalNodeId || !committedNodeId || !parentNodeId || !backupFrameId) {
      throw new Error("Undo token is invalid or unsupported.");
    }
    const siblingIndex = Number(index);
    const originalX = Number(x);
    const originalY = Number(y);
    if (![siblingIndex, originalX, originalY].every(Number.isFinite)) throw new Error("Undo token contains invalid geometry.");
    return { originalNodeId, committedNodeId, parentNodeId, siblingIndex, originalX, originalY, backupFrameId };
  }
  function createBackupFrame(transactionId) {
    const backup = figma.createFrame();
    backup.name = `__PellaBackup__ ${transactionId}`;
    backup.visible = false;
    backup.resize(1, 1);
    backup.x = STAGING_X;
    backup.y = STAGING_X;
    figma.currentPage.appendChild(backup);
    return backup;
  }
  var FigmaCandidateTransactionAdapter = class {
    constructor(options) {
      this.options = options;
    }
    metadata = /* @__PURE__ */ new Map();
    async cloneOriginal(originalNodeId, transactionId) {
      const original = await frameById(originalNodeId);
      const originalParent = original.parent;
      const parent = childrenParent(originalParent);
      if (!originalParent || !parent) throw new Error("Original Frame parent does not support ordered child replacement.");
      if (originalParent.type === "INSTANCE") throw new Error("Section roots inside component instances are not supported by P4 root swap.");
      const siblingIndex = parent.children.findIndex((child) => child.id === original.id);
      if (siblingIndex < 0) throw new Error("Could not resolve original sibling index.");
      const candidate = original.clone();
      const candidateStageName = `__PellaCandidate__ ${transactionId}`;
      figma.currentPage.appendChild(candidate);
      candidate.name = candidateStageName;
      candidate.x = STAGING_X + this.metadata.size * 2e3;
      candidate.y = 0;
      candidate.locked = true;
      this.metadata.set(candidate.id, {
        transactionId,
        originalNodeId: original.id,
        candidateNodeId: candidate.id,
        parentNodeId: originalParent.id,
        siblingIndex,
        originalX: original.x,
        originalY: original.y,
        originalName: original.name,
        originalLocked: original.locked,
        candidateStageName
      });
      return { originalNodeId: original.id, candidateNodeId: candidate.id };
    }
    async transformCandidate(handle) {
      const candidate = await frameById(handle.candidateNodeId);
      candidate.locked = false;
      try {
        await this.options.transform(candidate);
      } finally {
        if (candidate.parent) candidate.locked = true;
      }
    }
    async validateCandidate(handle) {
      const original = await frameById(handle.originalNodeId);
      const candidate = await frameById(handle.candidateNodeId);
      return this.options.validate(original, candidate);
    }
    async discardCandidate(handle) {
      const node = await figma.getNodeByIdAsync(handle.candidateNodeId);
      if (node && node.type === "FRAME") node.remove();
      this.metadata.delete(handle.candidateNodeId);
    }
    async hasPendingUndo() {
      const token = await figma.clientStorage.getAsync(UNDO_STORAGE_KEY);
      return typeof token === "string" && token.length > 0;
    }
    async commitCandidate(handle, transactionId) {
      const metadata = this.metadata.get(handle.candidateNodeId);
      if (!metadata) throw new Error("Candidate metadata is missing; refusing commit.");
      if (metadata.transactionId !== transactionId) throw new Error("Candidate belongs to a different transaction.");
      if (await this.hasPendingUndo()) {
        throw new Error("A previous P4 undo checkpoint is still pending. Restore or finalize it before another commit.");
      }
      const original = await frameById(handle.originalNodeId);
      const candidate = await frameById(handle.candidateNodeId);
      const parentNode = await figma.getNodeByIdAsync(metadata.parentNodeId);
      const parent = childrenParent(parentNode);
      if (!parentNode || !parent) throw new Error("Original parent is unavailable or no longer supports insertion.");
      if (original.parent?.id !== metadata.parentNodeId) throw new Error("Original moved after cloning; refusing stale commit.");
      const backup = createBackupFrame(transactionId);
      let candidateInserted = false;
      let originalBackedUp = false;
      let undoStored = false;
      try {
        candidate.locked = false;
        candidate.name = metadata.originalName;
        parent.insertChild(metadata.siblingIndex, candidate);
        candidateInserted = true;
        copyRootChildLayout(original, candidate);
        if (!("layoutMode" in parentNode) || String(parentNode.layoutMode) === "NONE") {
          candidate.x = metadata.originalX;
          candidate.y = metadata.originalY;
        }
        backup.appendChild(original);
        originalBackedUp = true;
        original.x = 0;
        original.y = 0;
        candidate.locked = metadata.originalLocked;
        const undoToken = encodeUndo({
          originalNodeId: original.id,
          committedNodeId: candidate.id,
          parentNodeId: metadata.parentNodeId,
          siblingIndex: metadata.siblingIndex,
          originalX: metadata.originalX,
          originalY: metadata.originalY,
          backupFrameId: backup.id
        });
        await figma.clientStorage.setAsync(UNDO_STORAGE_KEY, undoToken);
        undoStored = true;
        this.metadata.delete(handle.candidateNodeId);
        return {
          transactionId,
          originalNodeId: original.id,
          committedNodeId: candidate.id,
          parentNodeId: metadata.parentNodeId,
          siblingIndex: metadata.siblingIndex,
          undoToken
        };
      } catch (error) {
        let rollbackError = null;
        try {
          if (undoStored) await figma.clientStorage.deleteAsync(UNDO_STORAGE_KEY);
          if (originalBackedUp || original.parent?.id !== metadata.parentNodeId) {
            parent.insertChild(metadata.siblingIndex, original);
            original.x = metadata.originalX;
            original.y = metadata.originalY;
          }
          if (candidateInserted && candidate.parent?.id === metadata.parentNodeId) {
            figma.currentPage.appendChild(candidate);
            candidate.name = metadata.candidateStageName;
            candidate.x = STAGING_X;
            candidate.y = 0;
            candidate.locked = true;
          }
          if (backup.parent && backup.children.length === 0) backup.remove();
        } catch (rollback) {
          rollbackError = rollback;
        }
        if (rollbackError) {
          throw new Error(`Commit failed (${String(error)}); rollback also failed (${String(rollbackError)}).`);
        }
        throw error;
      }
    }
    async restoreLastCommit(undoToken) {
      const token = undoToken ?? await figma.clientStorage.getAsync(UNDO_STORAGE_KEY);
      if (typeof token !== "string" || token.length === 0) return null;
      const undo = decodeUndo(token);
      const original = await frameById(undo.originalNodeId);
      const committed = await frameById(undo.committedNodeId);
      const committedId = committed.id;
      const parentNode = await figma.getNodeByIdAsync(undo.parentNodeId);
      const backupNode = await figma.getNodeByIdAsync(undo.backupFrameId);
      const parent = childrenParent(parentNode);
      if (!parent) throw new Error("Undo parent is unavailable.");
      if (!backupNode || backupNode.type !== "FRAME") throw new Error("Undo backup Frame is unavailable.");
      if (original.parent?.id !== backupNode.id) throw new Error("Undo original is no longer in its backup Frame.");
      if (committed.parent?.id !== undo.parentNodeId) throw new Error("Committed candidate moved after commit; refusing unsafe undo.");
      parent.insertChild(undo.siblingIndex, original);
      original.x = undo.originalX;
      original.y = undo.originalY;
      committed.remove();
      if (backupNode.children.length === 0) backupNode.remove();
      await figma.clientStorage.deleteAsync(UNDO_STORAGE_KEY);
      return {
        transactionId: "restore",
        originalNodeId: committedId,
        committedNodeId: original.id,
        parentNodeId: undo.parentNodeId,
        siblingIndex: undo.siblingIndex
      };
    }
    /**
     * Explicitly accept the latest committed candidate and discard the retained previous original.
     * This keeps undo storage bounded to one checkpoint and is intentionally irreversible.
     */
    async finalizeLastCommit() {
      const token = await figma.clientStorage.getAsync(UNDO_STORAGE_KEY);
      if (typeof token !== "string" || token.length === 0) return false;
      const undo = decodeUndo(token);
      const original = await frameById(undo.originalNodeId);
      const backupNode = await figma.getNodeByIdAsync(undo.backupFrameId);
      if (!backupNode || backupNode.type !== "FRAME") throw new Error("Undo backup Frame is unavailable; refusing to finalize stale checkpoint.");
      if (original.parent?.id !== backupNode.id) throw new Error("Retained original moved outside its backup; refusing to finalize stale checkpoint.");
      backupNode.remove();
      await figma.clientStorage.deleteAsync(UNDO_STORAGE_KEY);
      return true;
    }
  };

  // src/core/linear-layout-analysis.ts
  function axisGeometry(item, direction) {
    if (direction === "VERTICAL") {
      return {
        start: item.y,
        end: item.y + item.height,
        crossStart: item.x,
        crossEnd: item.x + item.width
      };
    }
    return {
      start: item.x,
      end: item.x + item.width,
      crossStart: item.y,
      crossEnd: item.y + item.height
    };
  }
  function near(a, b, tolerance = 1) {
    return Math.abs(a - b) <= tolerance;
  }
  function analyzeLinearLayoutGeometry(frame, direction) {
    if (!Number.isFinite(frame.width) || !Number.isFinite(frame.height) || frame.width <= 0 || frame.height <= 0) {
      return { ok: false, reason: "Candidate frame has invalid bounds." };
    }
    const children = frame.children.filter((child) => child.visible);
    if (children.length < 2) return { ok: false, reason: "At least two visible direct children are required." };
    if (children.some((child) => child.absolutePositioned)) {
      return { ok: false, reason: "Visible absolute-positioned child blocks the simple Auto Layout recipe." };
    }
    if (children.some((child) => ![child.x, child.y, child.width, child.height].every(Number.isFinite) || child.width < 0 || child.height < 0)) {
      return { ok: false, reason: "Visible child has invalid geometry." };
    }
    const visuallySorted = [...children].sort((a, b) => {
      const left = axisGeometry(a, direction);
      const right = axisGeometry(b, direction);
      return left.start - right.start;
    });
    if (children.some((child, index) => child.id !== visuallySorted[index]?.id)) {
      return { ok: false, reason: "Layer order differs from visual flow order; automatic reordering is intentionally refused." };
    }
    const geometry = children.map((child) => axisGeometry(child, direction));
    const crossStart = geometry[0]?.crossStart ?? 0;
    if (!geometry.every((item) => near(item.crossStart, crossStart))) {
      return { ok: false, reason: "Cross-axis origins are not aligned within 1 px." };
    }
    const gaps = [];
    for (let index = 1; index < geometry.length; index += 1) {
      const previous = geometry[index - 1];
      const current = geometry[index];
      if (!previous || !current) continue;
      const gap2 = current.start - previous.end;
      if (gap2 < -0.5) return { ok: false, reason: "Children overlap on the primary axis." };
      gaps.push(gap2);
    }
    const gap = gaps[0] ?? 0;
    if (!gaps.every((value) => near(value, gap))) {
      return { ok: false, reason: "Primary-axis gaps are not uniform within 1 px." };
    }
    const first = geometry[0];
    const last = geometry.at(-1);
    if (!first || !last) return { ok: false, reason: "Visible child geometry is unavailable." };
    const framePrimarySize = direction === "VERTICAL" ? frame.height : frame.width;
    const frameCrossSize = direction === "VERTICAL" ? frame.width : frame.height;
    const maxCrossEnd = Math.max(...geometry.map((item) => item.crossEnd));
    const startPadding = first.start;
    const endPadding = framePrimarySize - last.end;
    const crossStartPadding = crossStart;
    const crossEndPadding = frameCrossSize - maxCrossEnd;
    if ([startPadding, endPadding, crossStartPadding, crossEndPadding].some((value) => value < -0.5)) {
      return { ok: false, reason: "Child geometry extends outside the candidate frame bounds." };
    }
    return {
      ok: true,
      plan: {
        gap: Math.max(0, gap),
        startPadding: Math.max(0, startPadding),
        endPadding: Math.max(0, endPadding),
        crossStartPadding: Math.max(0, crossStartPadding),
        crossEndPadding: Math.max(0, crossEndPadding)
      }
    };
  }

  // src/core/grid-layout-analysis.ts
  function near2(a, b, tolerance = 1) {
    return Math.abs(a - b) <= tolerance;
  }
  function clusterByStart(items, axis) {
    const sorted = [...items].sort((a, b) => axis === "x" ? a.x - b.x : a.y - b.y);
    const clusters = [];
    for (const item of sorted) {
      const value = axis === "x" ? item.x : item.y;
      const match = clusters.find((cluster) => near2(cluster.start, value));
      if (match) {
        match.items.push(item);
        match.start = match.items.reduce((sum, member) => sum + (axis === "x" ? member.x : member.y), 0) / match.items.length;
      } else {
        clusters.push({ start: value, items: [item] });
      }
    }
    return clusters.sort((a, b) => a.start - b.start);
  }
  function consistentValue(values, label) {
    const first = values[0];
    if (first === void 0 || !Number.isFinite(first)) return { ok: false, reason: `${label} is unavailable.` };
    if (!values.every((value) => Number.isFinite(value) && value >= 0 && near2(value, first))) {
      return { ok: false, reason: `${label} is not consistent within 1 px.` };
    }
    return { ok: true, value: first };
  }
  function analyzeGridLayoutGeometry(frame) {
    if (!Number.isFinite(frame.width) || !Number.isFinite(frame.height) || frame.width <= 0 || frame.height <= 0) {
      return { ok: false, reason: "Candidate grid frame has invalid bounds." };
    }
    if (frame.children.some((child) => !child.visible)) {
      return { ok: false, reason: "Hidden direct children are not supported by the first grid recipe." };
    }
    const children = [...frame.children];
    if (children.length < 4) return { ok: false, reason: "At least four visible direct children are required for a card grid." };
    if (children.some((child) => child.absolutePositioned)) {
      return { ok: false, reason: "Visible absolute-positioned child blocks the simple grid recipe." };
    }
    if (children.some((child) => ![child.x, child.y, child.width, child.height].every(Number.isFinite) || child.width <= 0 || child.height <= 0)) {
      return { ok: false, reason: "Visible grid child has invalid geometry." };
    }
    const xClusters = clusterByStart(children, "x");
    const yClusters = clusterByStart(children, "y");
    const columns = xClusters.length;
    const rows = yClusters.length;
    if (columns < 2 || rows < 2) return { ok: false, reason: "Simple card grid requires at least two columns and two rows." };
    if (columns * rows !== children.length) {
      return { ok: false, reason: "Grid is incomplete or fragmented; every row/column cell must contain exactly one direct child." };
    }
    const rowMajor = [...children].sort((a, b) => {
      if (!near2(a.y, b.y)) return a.y - b.y;
      return a.x - b.x;
    });
    if (children.some((child, index) => child.id !== rowMajor[index]?.id)) {
      return { ok: false, reason: "Layer order differs from row-major visual order; automatic reordering is refused." };
    }
    const occupancy = /* @__PURE__ */ new Set();
    const columnWidths = [];
    const rowHeights = [];
    for (let column = 0; column < columns; column += 1) {
      const cluster = xClusters[column];
      if (!cluster) return { ok: false, reason: "Column cluster is unavailable." };
      const consistency = consistentValue(cluster.items.map((item) => item.width), `Column ${column + 1} widths`);
      if (!consistency.ok) return consistency;
      columnWidths.push(consistency.value);
    }
    for (let row = 0; row < rows; row += 1) {
      const cluster = yClusters[row];
      if (!cluster) return { ok: false, reason: "Row cluster is unavailable." };
      const consistency = consistentValue(cluster.items.map((item) => item.height), `Row ${row + 1} heights`);
      if (!consistency.ok) return consistency;
      rowHeights.push(consistency.value);
    }
    for (const child of children) {
      const column = xClusters.findIndex((cluster) => near2(cluster.start, child.x));
      const row = yClusters.findIndex((cluster) => near2(cluster.start, child.y));
      if (column < 0 || row < 0) return { ok: false, reason: "A grid child does not resolve to a row/column track." };
      const key = `${row}:${column}`;
      if (occupancy.has(key)) return { ok: false, reason: "More than one direct child occupies the same inferred grid cell." };
      occupancy.add(key);
    }
    const columnGaps = [];
    for (let column = 1; column < columns; column += 1) {
      const previous = xClusters[column - 1];
      const current = xClusters[column];
      const previousWidth = columnWidths[column - 1];
      if (!previous || !current || previousWidth === void 0) continue;
      const gap = current.start - (previous.start + previousWidth);
      if (gap < -0.5) return { ok: false, reason: "Grid columns overlap." };
      columnGaps.push(gap);
    }
    const rowGaps = [];
    for (let row = 1; row < rows; row += 1) {
      const previous = yClusters[row - 1];
      const current = yClusters[row];
      const previousHeight = rowHeights[row - 1];
      if (!previous || !current || previousHeight === void 0) continue;
      const gap = current.start - (previous.start + previousHeight);
      if (gap < -0.5) return { ok: false, reason: "Grid rows overlap." };
      rowGaps.push(gap);
    }
    const columnGap = consistentValue(columnGaps, "Column gaps");
    if (!columnGap.ok) return columnGap;
    const rowGap = consistentValue(rowGaps, "Row gaps");
    if (!rowGap.ok) return rowGap;
    const firstColumn = xClusters[0];
    const lastColumn = xClusters.at(-1);
    const firstRow = yClusters[0];
    const lastRow = yClusters.at(-1);
    const lastColumnWidth = columnWidths.at(-1);
    const lastRowHeight = rowHeights.at(-1);
    if (!firstColumn || !lastColumn || !firstRow || !lastRow || lastColumnWidth === void 0 || lastRowHeight === void 0) {
      return { ok: false, reason: "Grid edge geometry is unavailable." };
    }
    const paddingLeft = firstColumn.start;
    const paddingRight = frame.width - (lastColumn.start + lastColumnWidth);
    const paddingTop = firstRow.start;
    const paddingBottom = frame.height - (lastRow.start + lastRowHeight);
    if ([paddingLeft, paddingRight, paddingTop, paddingBottom].some((value) => value < -0.5)) {
      return { ok: false, reason: "Grid child geometry extends outside the candidate frame bounds." };
    }
    return {
      ok: true,
      plan: {
        columns,
        rows,
        columnWidths,
        rowHeights,
        columnGap: Math.max(0, columnGap.value),
        rowGap: Math.max(0, rowGap.value),
        paddingLeft: Math.max(0, paddingLeft),
        paddingRight: Math.max(0, paddingRight),
        paddingTop: Math.max(0, paddingTop),
        paddingBottom: Math.max(0, paddingBottom)
      }
    };
  }

  // src/plugin/safe-recipe-transform.ts
  function resolveFrameByPath(root, path) {
    let current = root;
    for (const index of path) {
      if (!("children" in current)) return null;
      const childNodes3 = current.children;
      const child = childNodes3[index];
      if (!child) return null;
      current = child;
    }
    return current.type === "FRAME" ? current : null;
  }
  function directGeometry(frame) {
    return frame.children.map((child) => ({
      id: child.id,
      x: child.x,
      y: child.y,
      width: child.width,
      height: child.height
    }));
  }
  function sameGeometry(before, after, tolerance = 0.5) {
    if (before.length !== after.length) return false;
    return before.every((item, index) => {
      const next = after[index];
      return Boolean(
        next && item.id === next.id && Math.abs(item.x - next.x) <= tolerance && Math.abs(item.y - next.y) <= tolerance && Math.abs(item.width - next.width) <= tolerance && Math.abs(item.height - next.height) <= tolerance
      );
    });
  }
  function linearDirectionForSafeRecipe(plan) {
    if (plan.recipe === "vertical-stack" && plan.pattern === "vertical-stack") return "VERTICAL";
    if (plan.recipe === "horizontal-row" && plan.pattern === "horizontal-row") return "HORIZONTAL";
    if (plan.recipe === "two-column" && plan.pattern === "two-column") return "HORIZONTAL";
    if (plan.recipe === "facts-list" && plan.pattern === "vertical-stack" && plan.semanticHint === "facts-list") return "VERTICAL";
    if (plan.recipe === "footer-columns" && plan.pattern === "horizontal-row" && plan.semanticHint === "footer-columns") return "HORIZONTAL";
    if (plan.recipe === "social-link-strip" && plan.pattern === "horizontal-row" && plan.semanticHint === "social-link-strip") return "HORIZONTAL";
    return null;
  }
  function applyLinearAutoLayout(frame, direction) {
    const beforeChildren = directGeometry(frame);
    const analysis = analyzeLinearLayoutGeometry(
      {
        width: frame.width,
        height: frame.height,
        children: frame.children.map((child) => ({
          id: child.id,
          x: child.x,
          y: child.y,
          width: child.width,
          height: child.height,
          visible: child.visible,
          absolutePositioned: "layoutPositioning" in child && child.layoutPositioning === "ABSOLUTE"
        }))
      },
      direction
    );
    if (!analysis.ok) return { applied: false, reason: analysis.reason, targetNodeId: frame.id };
    const geometry = analysis.plan;
    const originalWidth = frame.width;
    const originalHeight = frame.height;
    frame.layoutMode = direction;
    frame.primaryAxisSizingMode = "FIXED";
    frame.counterAxisSizingMode = "FIXED";
    frame.primaryAxisAlignItems = "MIN";
    frame.counterAxisAlignItems = "MIN";
    frame.itemSpacing = geometry.gap;
    if (direction === "VERTICAL") {
      frame.paddingTop = geometry.startPadding;
      frame.paddingBottom = geometry.endPadding;
      frame.paddingLeft = geometry.crossStartPadding;
      frame.paddingRight = geometry.crossEndPadding;
    } else {
      frame.paddingLeft = geometry.startPadding;
      frame.paddingRight = geometry.endPadding;
      frame.paddingTop = geometry.crossStartPadding;
      frame.paddingBottom = geometry.crossEndPadding;
    }
    frame.resize(originalWidth, originalHeight);
    if (!sameGeometry(beforeChildren, directGeometry(frame))) {
      return {
        applied: false,
        reason: "Linear Auto Layout changed direct-child geometry; candidate must be discarded before P3 commit.",
        targetNodeId: frame.id
      };
    }
    return {
      applied: true,
      reason: `Applied strict ${direction.toLowerCase()} Auto Layout to staged candidate.`,
      targetNodeId: frame.id
    };
  }
  function applyFixedGrid(frame) {
    const beforeChildren = directGeometry(frame);
    const analysis = analyzeGridLayoutGeometry({
      width: frame.width,
      height: frame.height,
      children: frame.children.map((child) => ({
        id: child.id,
        x: child.x,
        y: child.y,
        width: child.width,
        height: child.height,
        visible: child.visible,
        absolutePositioned: "layoutPositioning" in child && child.layoutPositioning === "ABSOLUTE"
      }))
    });
    if (!analysis.ok) return { applied: false, reason: analysis.reason, targetNodeId: frame.id };
    const plan = analysis.plan;
    const originalWidth = frame.width;
    const originalHeight = frame.height;
    frame.layoutMode = "GRID";
    frame.gridAutoTracks = "NONE";
    frame.gridItemsPositioning = "ROW_AUTO_FLOW";
    frame.gridColumnCount = plan.columns;
    frame.gridRowCount = plan.rows;
    frame.gridColumnGap = plan.columnGap;
    frame.gridRowGap = plan.rowGap;
    frame.paddingLeft = plan.paddingLeft;
    frame.paddingRight = plan.paddingRight;
    frame.paddingTop = plan.paddingTop;
    frame.paddingBottom = plan.paddingBottom;
    frame.gridColumnSizes.forEach((track, index) => {
      const width = plan.columnWidths[index];
      if (width === void 0) throw new Error("Grid column track plan is incomplete.");
      track.type = "FIXED";
      track.value = width;
    });
    frame.gridRowSizes.forEach((track, index) => {
      const height = plan.rowHeights[index];
      if (height === void 0) throw new Error("Grid row track plan is incomplete.");
      track.type = "FIXED";
      track.value = height;
    });
    frame.resize(originalWidth, originalHeight);
    if (!sameGeometry(beforeChildren, directGeometry(frame))) {
      return {
        applied: false,
        reason: "GRID Auto Layout changed direct-child geometry; candidate must be discarded before P3 commit.",
        targetNodeId: frame.id
      };
    }
    return {
      applied: true,
      reason: `Applied strict ${plan.columns}\xD7${plan.rows} fixed-track GRID Auto Layout to staged candidate.`,
      targetNodeId: frame.id
    };
  }
  function matchesGridRecipeContract(plan) {
    if (plan.pattern !== "grid" || Boolean(plan.evidence.fragmentedCellCandidate)) return false;
    if (plan.recipe === "simple-card-grid") return plan.semanticHint === "repeated-cards";
    if (plan.recipe === "metric-grid") return plan.semanticHint === "metric-grid";
    return false;
  }
  function applySafeRecipeToCandidate(candidateRoot, plan) {
    if (plan.decision !== "ELIGIBLE" || !plan.recipe) {
      return { applied: false, reason: `Recipe plan is ${plan.decision}; candidate mutation is not permitted.` };
    }
    const target = resolveFrameByPath(candidateRoot, plan.targetPath);
    if (!target) return { applied: false, reason: "Candidate target path no longer resolves to a Frame." };
    const linearDirection = linearDirectionForSafeRecipe(plan);
    if (linearDirection) return applyLinearAutoLayout(target, linearDirection);
    if (matchesGridRecipeContract(plan)) return applyFixedGrid(target);
    if (plan.recipe === "facts-list" || plan.recipe === "footer-columns" || plan.recipe === "social-link-strip" || plan.recipe === "simple-card-grid" || plan.recipe === "metric-grid") {
      return {
        applied: false,
        reason: `${plan.recipe} plan does not match its required semantic/geometric classifier contract.`,
        targetNodeId: target.id
      };
    }
    return {
      applied: false,
      reason: `${plan.recipe} planning is enabled, but its Figma mutation recipe is not enabled yet.`,
      targetNodeId: target.id
    };
  }

  // src/plugin/safe-fix-runtime.ts
  function checkpointAdapter() {
    return new FigmaCandidateTransactionAdapter({
      transform: () => void 0,
      validate: async () => {
        throw new Error("Checkpoint-only adapter does not validate candidates.");
      }
    });
  }
  async function runSafeFixTransaction(original, plan, validateFullP3) {
    if (plan.decision !== "ELIGIBLE" || !plan.recipe) {
      return {
        plan,
        transaction: null,
        skippedReason: `Plan decision is ${plan.decision}; no candidate transaction was started.`
      };
    }
    const adapter = new FigmaCandidateTransactionAdapter({
      transform: (candidate) => {
        const result = applySafeRecipeToCandidate(candidate, plan);
        if (!result.applied) {
          throw new Error(`Safe recipe refused candidate transform: ${result.reason}`);
        }
      },
      validate: validateFullP3
    });
    const transaction = await runCandidateTransaction(original.id, adapter, `p5-${plan.recipe}-${Date.now().toString(36)}`);
    return { plan, transaction };
  }
  async function hasPendingSafeFixCheckpoint() {
    return checkpointAdapter().hasPendingUndo();
  }
  async function restoreLastSafeFix() {
    return checkpointAdapter().restoreLastCommit();
  }
  async function finalizeLastSafeFix() {
    return checkpointAdapter().finalizeLastCommit();
  }

  // src/plugin/p5-runtime-calibration.ts
  var CALIBRATION_PREFIX = "__P5RuntimeCalibration__";
  function solid(r, g, b) {
    return [{ type: "SOLID", color: { r, g, b } }];
  }
  function createRect(name, x, y, width, height, fill) {
    const rect = figma.createRectangle();
    rect.name = name;
    rect.resize(width, height);
    rect.x = x;
    rect.y = y;
    rect.fills = fill;
    return rect;
  }
  function createVerticalFixture(suffix) {
    const parent = figma.createFrame();
    parent.name = `${CALIBRATION_PREFIX} Parent ${suffix}`;
    parent.resize(420, 300);
    parent.x = 13e4;
    parent.y = 0;
    parent.fills = [];
    figma.currentPage.appendChild(parent);
    const original = figma.createFrame();
    original.name = `${CALIBRATION_PREFIX} Vertical ${suffix}`;
    original.resize(320, 220);
    original.x = 40;
    original.y = 40;
    original.fills = [];
    parent.appendChild(original);
    original.appendChild(createRect("Block A", 40, 30, 240, 60, solid(0.16, 0.16, 0.16)));
    original.appendChild(createRect("Block B", 40, 130, 240, 60, solid(0.7, 0.7, 0.7)));
    return { parent, original };
  }
  function verticalPlan(original) {
    return {
      schemaVersion: 1,
      decision: "ELIGIBLE",
      recipe: "vertical-stack",
      reasonCode: "SUPPORTED_HIGH_CONFIDENCE",
      reason: "Disposable compiled-runtime calibration fixture.",
      confidence: 100,
      minConfidence: 90,
      pattern: "vertical-stack",
      targetNodeId: original.id,
      targetNodeName: original.name,
      targetPath: [],
      evidence: { calibration: true }
    };
  }
  function recoveryAdapter() {
    return new FigmaCandidateTransactionAdapter({
      transform: () => void 0,
      validate: async () => {
        throw new Error("Calibration recovery adapter does not validate.");
      }
    });
  }
  async function removeIfPresent(node) {
    if (node?.parent) node.remove();
  }
  async function calibrationLeftovers() {
    let count = 0;
    for (const node of figma.currentPage.children) {
      if (node.name.startsWith(CALIBRATION_PREFIX)) count += 1;
    }
    return count;
  }
  async function runP5RuntimeCalibration(validateFullP3) {
    const guard = recoveryAdapter();
    if (await guard.hasPendingUndo()) {
      throw new Error("A real P4 undo checkpoint is pending. Restore/finalize it before running the disposable runtime self-test.");
    }
    const forcedFixture = createVerticalFixture("forced-reject");
    let forcedCandidateId;
    let forcedResult = {
      state: "FAILED",
      validationRejected: false,
      pixelEvidenceReturned: false,
      changedPixelPct: null,
      candidateDeleted: false,
      originalUntouched: false
    };
    try {
      const plan = verticalPlan(forcedFixture.original);
      const adapter = new FigmaCandidateTransactionAdapter({
        transform: (candidate) => {
          const applied = applySafeRecipeToCandidate(candidate, plan);
          if (!applied.applied) throw new Error(applied.reason);
          candidate.itemSpacing += 8;
        },
        validate: validateFullP3
      });
      const transaction = await runCandidateTransaction(
        forcedFixture.original.id,
        adapter,
        `p5-runtime-forced-${Date.now().toString(36)}`
      );
      forcedCandidateId = transaction.candidateNodeId;
      if (transaction.state === "COMMITTED") {
        await adapter.restoreLastCommit(transaction.commit?.undoToken);
      }
      const candidateNode = forcedCandidateId ? await figma.getNodeByIdAsync(forcedCandidateId) : null;
      const pixel = transaction.validation?.metrics.pixel;
      forcedResult = {
        state: transaction.state,
        validationRejected: transaction.state === "REJECTED" && transaction.validation?.passed === false,
        pixelEvidenceReturned: Boolean(pixel),
        changedPixelPct: pixel?.changedPixelPct ?? null,
        candidateDeleted: candidateNode === null,
        originalUntouched: forcedFixture.original.parent?.id === forcedFixture.parent.id && forcedFixture.parent.children[0]?.id === forcedFixture.original.id
      };
    } finally {
      if (await guard.hasPendingUndo()) {
        try {
          await guard.restoreLastCommit();
        } catch {
          await guard.finalizeLastCommit();
        }
      }
      await removeIfPresent(forcedFixture.parent);
      if (forcedCandidateId) {
        const candidate = await figma.getNodeByIdAsync(forcedCandidateId);
        await removeIfPresent(candidate);
      }
    }
    const restoreFixture = createVerticalFixture("pass-restore");
    let restoreCandidateId;
    let passRestore = {
      state: "FAILED",
      validationPassed: false,
      pixelEvidenceReturned: false,
      changedPixelPct: null,
      committed: false,
      restored: false,
      checkpointCleared: false
    };
    try {
      const plan = verticalPlan(restoreFixture.original);
      const result = await runSafeFixTransaction(restoreFixture.original, plan, validateFullP3);
      const transaction = result.transaction;
      restoreCandidateId = transaction?.candidateNodeId;
      let restored = false;
      if (transaction?.state === "COMMITTED") {
        const recovery = recoveryAdapter();
        const restoreEvidence = await recovery.restoreLastCommit(transaction.commit?.undoToken);
        restored = Boolean(restoreEvidence) && restoreFixture.original.parent?.id === restoreFixture.parent.id;
      }
      const pixel = transaction?.validation?.metrics.pixel;
      passRestore = {
        state: transaction?.state ?? "SKIPPED",
        validationPassed: transaction?.validation?.passed === true,
        pixelEvidenceReturned: Boolean(pixel),
        changedPixelPct: pixel?.changedPixelPct ?? null,
        committed: transaction?.state === "COMMITTED",
        restored,
        checkpointCleared: !await recoveryAdapter().hasPendingUndo()
      };
    } finally {
      if (await guard.hasPendingUndo()) {
        try {
          await guard.restoreLastCommit();
        } catch {
          await guard.finalizeLastCommit();
        }
      }
      await removeIfPresent(restoreFixture.parent);
      if (restoreCandidateId) {
        const candidate = await figma.getNodeByIdAsync(restoreCandidateId);
        await removeIfPresent(candidate);
      }
    }
    const finalizeFixture = createVerticalFixture("pass-finalize");
    const finalizeOriginalId = finalizeFixture.original.id;
    let finalizeCandidateId;
    let passFinalize = {
      state: "FAILED",
      validationPassed: false,
      pixelEvidenceReturned: false,
      changedPixelPct: null,
      committed: false,
      finalized: false,
      candidateRetained: false,
      originalDiscarded: false,
      checkpointCleared: false
    };
    try {
      const plan = verticalPlan(finalizeFixture.original);
      const result = await runSafeFixTransaction(finalizeFixture.original, plan, validateFullP3);
      const transaction = result.transaction;
      finalizeCandidateId = transaction?.commit?.committedNodeId ?? transaction?.candidateNodeId;
      let finalized = false;
      if (transaction?.state === "COMMITTED") {
        finalized = await recoveryAdapter().finalizeLastCommit();
      }
      const committedNode = finalizeCandidateId ? await figma.getNodeByIdAsync(finalizeCandidateId) : null;
      const previousOriginal = await figma.getNodeByIdAsync(finalizeOriginalId);
      const pixel = transaction?.validation?.metrics.pixel;
      passFinalize = {
        state: transaction?.state ?? "SKIPPED",
        validationPassed: transaction?.validation?.passed === true,
        pixelEvidenceReturned: Boolean(pixel),
        changedPixelPct: pixel?.changedPixelPct ?? null,
        committed: transaction?.state === "COMMITTED",
        finalized,
        candidateRetained: committedNode?.type === "FRAME" && committedNode.parent?.id === finalizeFixture.parent.id,
        originalDiscarded: previousOriginal === null,
        checkpointCleared: !await recoveryAdapter().hasPendingUndo()
      };
    } finally {
      if (await guard.hasPendingUndo()) {
        try {
          await guard.restoreLastCommit();
        } catch {
          await guard.finalizeLastCommit();
        }
      }
      await removeIfPresent(finalizeFixture.parent);
      if (finalizeCandidateId) {
        const candidate = await figma.getNodeByIdAsync(finalizeCandidateId);
        await removeIfPresent(candidate);
      }
    }
    const leftovers = await calibrationLeftovers();
    const passed = forcedResult.validationRejected && forcedResult.pixelEvidenceReturned && forcedResult.candidateDeleted && forcedResult.originalUntouched && passRestore.validationPassed && passRestore.pixelEvidenceReturned && passRestore.committed && passRestore.restored && passRestore.checkpointCleared && passFinalize.validationPassed && passFinalize.pixelEvidenceReturned && passFinalize.committed && passFinalize.finalized && passFinalize.candidateRetained && passFinalize.originalDiscarded && passFinalize.checkpointCleared && leftovers === 0;
    return {
      schemaVersion: 1,
      passed,
      forcedReject: forcedResult,
      passRestore,
      passFinalize,
      leftovers
    };
  }

  // src/plugin/p5-runtime-acceptance.ts
  function requireCondition(failures, condition, message) {
    if (!condition) failures.push(message);
  }
  function hasPixelValue(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
  }
  function assessP5RuntimeAcceptance(result) {
    const failures = [];
    requireCondition(failures, result.schemaVersion === 1, "Unsupported P5 runtime evidence schema.");
    requireCondition(failures, result.passed === true, "P5 runtime self-test did not report overall PASS.");
    requireCondition(failures, result.forcedReject.validationRejected, "Forced-reject validation was not rejected.");
    requireCondition(failures, result.forcedReject.pixelEvidenceReturned, "Forced-reject path returned no rendered-pixel evidence.");
    requireCondition(failures, hasPixelValue(result.forcedReject.changedPixelPct), "Forced-reject path has no valid changed-pixel percentage.");
    requireCondition(failures, result.forcedReject.candidateDeleted, "Forced-reject candidate was not deleted.");
    requireCondition(failures, result.forcedReject.originalUntouched, "Forced-reject original was not preserved exactly.");
    requireCondition(failures, result.passRestore.validationPassed, "Restore path Full P3 validation did not pass.");
    requireCondition(failures, result.passRestore.pixelEvidenceReturned, "Restore path returned no rendered-pixel evidence.");
    requireCondition(failures, hasPixelValue(result.passRestore.changedPixelPct), "Restore path has no valid changed-pixel percentage.");
    requireCondition(failures, result.passRestore.committed, "Restore path did not commit the validated candidate.");
    requireCondition(failures, result.passRestore.restored, "Restore path did not restore the retained approved original.");
    requireCondition(failures, result.passRestore.checkpointCleared, "Restore path left a checkpoint pending.");
    requireCondition(failures, result.passFinalize.validationPassed, "Finalize path Full P3 validation did not pass.");
    requireCondition(failures, result.passFinalize.pixelEvidenceReturned, "Finalize path returned no rendered-pixel evidence.");
    requireCondition(failures, hasPixelValue(result.passFinalize.changedPixelPct), "Finalize path has no valid changed-pixel percentage.");
    requireCondition(failures, result.passFinalize.committed, "Finalize path did not commit the validated candidate.");
    requireCondition(failures, result.passFinalize.finalized, "Finalize path did not finalize the checkpoint.");
    requireCondition(failures, result.passFinalize.candidateRetained, "Finalize path did not retain the committed candidate.");
    requireCondition(failures, result.passFinalize.originalDiscarded, "Finalize path did not discard the retained previous original.");
    requireCondition(failures, result.passFinalize.checkpointCleared, "Finalize path left a checkpoint pending.");
    requireCondition(failures, result.leftovers === 0, `Runtime calibration left ${result.leftovers} temporary node(s).`);
    return { accepted: failures.length === 0, failures };
  }

  // src/plugin/p5-runtime-proof-storage.ts
  async function updateP5RuntimeProofFromCalibration(storage, result, build) {
    const calibrationAssessment = assessP5RuntimeAcceptance(result);
    const failures = [...calibrationAssessment.failures];
    if (!isTraceableP5RuntimeBuildIdentity(build)) {
      failures.push("P5 runtime self-test build is not bound to a traceable CI artifact.");
    }
    const assessment = {
      accepted: failures.length === 0,
      failures
    };
    if (assessment.accepted) {
      await storage.setAsync(P5_RUNTIME_PROOF_STORAGE_KEY, createP5RuntimeProof(build));
    } else {
      await storage.deleteAsync(P5_RUNTIME_PROOF_STORAGE_KEY);
    }
    return assessment;
  }

  // src/plugin/p5-runtime-evidence.ts
  var P5_RUNTIME_EVIDENCE_SCHEMA_VERSION = 2;
  function buildP5RuntimeEvidenceBundle(input) {
    const calibrationAcceptance = assessP5RuntimeAcceptance(input.result);
    const failures = [...calibrationAcceptance.failures];
    if (!isTraceableP5RuntimeBuildIdentity(input.build)) {
      failures.push("P5 runtime evidence is not bound to a traceable CI artifact.");
    }
    const acceptance = {
      accepted: failures.length === 0,
      failures
    };
    return {
      schemaVersion: P5_RUNTIME_EVIDENCE_SCHEMA_VERSION,
      capturedAt: input.capturedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      pluginVersion: input.pluginVersion,
      runtimeGateVersion: P5_RUNTIME_GATE_VERSION,
      build: { ...input.build },
      runtimeProofPassedAt: acceptance.accepted ? input.runtimeProofPassedAt : null,
      acceptance: {
        accepted: acceptance.accepted,
        failures: [...acceptance.failures]
      },
      calibration: {
        ...input.result,
        forcedReject: { ...input.result.forcedReject },
        passRestore: { ...input.result.passRestore },
        passFinalize: { ...input.result.passFinalize }
      }
    };
  }

  // src/plugin/p5-runtime-evidence-storage.ts
  var P5_RUNTIME_EVIDENCE_STORAGE_KEY = "pella-elementor-prep:p5-runtime-evidence-v2";
  function objectValue(value) {
    return value && typeof value === "object" ? value : null;
  }
  function pixelValue(value) {
    return value === null || typeof value === "number" && Number.isFinite(value) && value >= 0;
  }
  function booleanFields(value, names) {
    return names.every((name) => typeof value[name] === "boolean");
  }
  function isBuildIdentity(value) {
    const build = objectValue(value);
    return Boolean(
      build && typeof build.sourceSha === "string" && typeof build.runId === "string" && typeof build.runNumber === "string"
    );
  }
  function isCalibrationResult(value) {
    const calibration = objectValue(value);
    if (!calibration) return false;
    const forcedReject = objectValue(calibration.forcedReject);
    const passRestore = objectValue(calibration.passRestore);
    const passFinalize = objectValue(calibration.passFinalize);
    if (!forcedReject || !passRestore || !passFinalize) return false;
    return calibration.schemaVersion === 1 && typeof calibration.passed === "boolean" && typeof calibration.leftovers === "number" && Number.isInteger(calibration.leftovers) && calibration.leftovers >= 0 && typeof forcedReject.state === "string" && booleanFields(forcedReject, [
      "validationRejected",
      "pixelEvidenceReturned",
      "candidateDeleted",
      "originalUntouched"
    ]) && pixelValue(forcedReject.changedPixelPct) && typeof passRestore.state === "string" && booleanFields(passRestore, [
      "validationPassed",
      "pixelEvidenceReturned",
      "committed",
      "restored",
      "checkpointCleared"
    ]) && pixelValue(passRestore.changedPixelPct) && typeof passFinalize.state === "string" && booleanFields(passFinalize, [
      "validationPassed",
      "pixelEvidenceReturned",
      "committed",
      "finalized",
      "candidateRetained",
      "originalDiscarded",
      "checkpointCleared"
    ]) && pixelValue(passFinalize.changedPixelPct);
  }
  function isP5RuntimeEvidenceBundle(value) {
    const candidate = objectValue(value);
    if (!candidate) return false;
    const acceptance = objectValue(candidate.acceptance);
    if (!acceptance || typeof acceptance.accepted !== "boolean" || !Array.isArray(acceptance.failures)) return false;
    if (!acceptance.failures.every((failure) => typeof failure === "string")) return false;
    const proofTimestampValid = acceptance.accepted ? typeof candidate.runtimeProofPassedAt === "string" : candidate.runtimeProofPassedAt === null;
    return candidate.schemaVersion === 2 && typeof candidate.capturedAt === "string" && typeof candidate.pluginVersion === "string" && typeof candidate.runtimeGateVersion === "string" && isBuildIdentity(candidate.build) && proofTimestampValid && isCalibrationResult(candidate.calibration);
  }
  async function loadLatestP5RuntimeEvidence(storage, key = P5_RUNTIME_EVIDENCE_STORAGE_KEY) {
    try {
      const stored = await storage.getAsync(key);
      return isP5RuntimeEvidenceBundle(stored) ? stored : null;
    } catch {
      return null;
    }
  }
  async function persistP5RuntimeEvidenceBestEffort(storage, evidence, key = P5_RUNTIME_EVIDENCE_STORAGE_KEY) {
    try {
      await storage.setAsync(key, evidence);
      return true;
    } catch {
      return false;
    }
  }

  // src/plugin/p5-runtime-evidence-viewer.ts
  function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }
  function metric(label, value) {
    return `<div class="metric"><strong>${escapeHtml(value ?? "\u2014")}</strong><span>${escapeHtml(label)}</span></div>`;
  }
  function buildP5RuntimeEvidenceViewerHtml(evidence) {
    const result = evidence.calibration;
    const json = JSON.stringify(evidence, null, 2);
    const status = evidence.acceptance.accepted && evidence.runtimeProofPassedAt ? "PASS" : "FAIL";
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
:root { font-family: Inter, system-ui, sans-serif; color-scheme: light dark; }
body { margin: 0; padding: 16px; background: var(--figma-color-bg); color: var(--figma-color-text); }
.hero { border: 1px solid var(--figma-color-border); border-radius: 8px; padding: 12px; margin-bottom: 12px; }
.title { font-size: 14px; font-weight: 700; }
.meta { font-size: 10px; opacity: .75; margin-top: 5px; word-break: break-word; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.metric { border: 1px solid var(--figma-color-border); border-radius: 6px; padding: 8px; }
.metric strong { display: block; font-size: 12px; word-break: break-word; }
.metric span { display: block; font-size: 9px; opacity: .7; margin-top: 3px; }
.failures { border: 1px solid var(--figma-color-border-danger, var(--figma-color-border)); border-radius: 6px; padding: 8px; margin: 12px 0; font-size: 10px; line-height: 1.4; }
button { width: 100%; padding: 9px 10px; border-radius: 6px; border: 1px solid var(--figma-color-border); background: var(--figma-color-bg-secondary); color: var(--figma-color-text); font-weight: 600; cursor: pointer; margin: 12px 0 8px; }
pre { margin: 0; padding: 10px; border: 1px solid var(--figma-color-border); border-radius: 6px; white-space: pre-wrap; word-break: break-word; font-size: 9px; max-height: 340px; overflow: auto; }
</style>
</head>
<body>
<div class="hero">
  <div class="title">P5 Compiled Runtime Acceptance</div>
  <div class="meta">Acceptance: ${escapeHtml(status)}</div>
  <div class="meta">Captured: ${escapeHtml(evidence.capturedAt)}</div>
  <div class="meta">Plugin: ${escapeHtml(evidence.pluginVersion)} \xB7 gate ${escapeHtml(evidence.runtimeGateVersion)}</div>
  <div class="meta">Proof minted: ${escapeHtml(evidence.runtimeProofPassedAt ?? "no")}</div>
</div>
<div class="grid">
  ${metric("build source SHA", evidence.build.sourceSha)}
  ${metric("Actions run #", evidence.build.runNumber)}
  ${metric("Actions run ID", evidence.build.runId)}
  ${metric("overall self-test", result.passed ? "PASS" : "FAIL")}
  ${metric("leftovers", result.leftovers)}
  ${metric("forced reject", result.forcedReject.validationRejected ? "REJECTED" : "NOT REJECTED")}
  ${metric("forced reject pixels %", result.forcedReject.changedPixelPct ?? "\u2014")}
  ${metric("restore Full P3", result.passRestore.validationPassed ? "PASS" : "FAIL")}
  ${metric("restore pixels %", result.passRestore.changedPixelPct ?? "\u2014")}
  ${metric("restore checkpoint", result.passRestore.checkpointCleared ? "CLEARED" : "PENDING")}
  ${metric("finalize Full P3", result.passFinalize.validationPassed ? "PASS" : "FAIL")}
  ${metric("finalize pixels %", result.passFinalize.changedPixelPct ?? "\u2014")}
  ${metric("finalize checkpoint", result.passFinalize.checkpointCleared ? "CLEARED" : "PENDING")}
</div>
${evidence.acceptance.failures.length ? `<div class="failures">${evidence.acceptance.failures.map((failure) => `<div>${escapeHtml(failure)}</div>`).join("")}</div>` : ""}
<button id="copy">Copy bounded acceptance JSON</button>
<pre id="json">${escapeHtml(json)}</pre>
<script>
const copy = document.getElementById('copy');
if (copy) copy.addEventListener('click', async () => {
  const jsonNode = document.getElementById('json');
  if (!jsonNode) return;
  const text = jsonNode.textContent || '';
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    copy.textContent = 'Copied';
  } catch {
    copy.textContent = 'Copy failed \u2014 select JSON below';
  }
});
<\/script>
</body>
</html>`;
  }

  // src/plugin/main.ts
  var PLUGIN_VERSION = "0.1.0-alpha.1";
  var RUNTIME_BUILD = currentP5RuntimeBuildIdentity();
  var BACKLOG_STORAGE_PREFIX = "p9-backlog-v1";
  var auditSequence = 0;
  var p5OperationInFlight = null;
  figma.showUI(__html__, {
    width: 440,
    height: 680,
    themeColors: true
  });
  var fullFrameValidator = new FullFrameValidator((message) => {
    figma.ui.postMessage(message);
  });
  function postError(message, type = "audit-error") {
    figma.ui.postMessage({ type, message });
  }
  function isBacklogDocument(value) {
    if (typeof value !== "object" || value === null) return false;
    const candidate = value;
    return candidate.schemaVersion === 1 && Array.isArray(candidate.items) && typeof candidate.summary === "object" && candidate.summary !== null;
  }
  function backlogStorageKey(fileKey, pageId, frameId) {
    return `${BACKLOG_STORAGE_PREFIX}:${fileKey}:${pageId}:${frameId}`;
  }
  function beginExclusiveP5Operation(operation, errorType) {
    if (p5OperationInFlight) {
      postError(`Another P5 operation (${p5OperationInFlight}) is still running. Wait for it to finish before starting ${operation}.`, errorType);
      return false;
    }
    p5OperationInFlight = operation;
    return true;
  }
  function endExclusiveP5Operation(operation) {
    if (p5OperationInFlight === operation) p5OperationInFlight = null;
  }
  function selectedFrame() {
    const selection = figma.currentPage.selection;
    if (selection.length !== 1) return null;
    const selected = selection[0];
    return selected?.type === "FRAME" ? selected : null;
  }
  async function runtimeProofState() {
    const stored = await figma.clientStorage.getAsync(P5_RUNTIME_PROOF_STORAGE_KEY);
    if (!isValidP5RuntimeProof(stored, RUNTIME_BUILD)) return { valid: false, passedAt: null };
    return { valid: true, passedAt: stored.passedAt };
  }
  async function runAudit(sequence2) {
    const page = figma.currentPage;
    const selection = page.selection;
    if (selection.length !== 1) {
      if (sequence2 === auditSequence) postError("Select exactly one desktop frame to audit.");
      return;
    }
    const selected = selection[0];
    if (!selected || selected.type !== "FRAME") {
      if (sequence2 === auditSequence) postError("Audit currently supports one selected Figma Frame.");
      return;
    }
    const fileKey = typeof figma.fileKey === "string" && figma.fileKey ? figma.fileKey : "local-file";
    const pageId = page.id;
    const pageName = page.name;
    const storageKey = backlogStorageKey(fileKey, pageId, selected.id);
    try {
      const root = scanSceneNode(selected);
      const report = buildAuditReport(root, PLUGIN_VERSION);
      const stored = await figma.clientStorage.getAsync(storageKey);
      if (sequence2 !== auditSequence) return;
      const previous = isBacklogDocument(stored) ? stored : null;
      const backlog = generateBacklog(report, {
        context: {
          ...fileKey !== "local-file" ? { fileKey } : {},
          pageId,
          pageName
        },
        previous
      });
      if (sequence2 !== auditSequence) return;
      await figma.clientStorage.setAsync(storageKey, backlog);
      if (sequence2 !== auditSequence) return;
      figma.ui.postMessage({
        type: "audit-result",
        report,
        backlog,
        auditJson: serializeAuditReportJson(report),
        auditMarkdown: serializeAuditReportMarkdown(report),
        backlogJson: serializeBacklogJson(backlog),
        backlogMarkdown: serializeBacklogMarkdown(backlog)
      });
    } catch (error) {
      if (sequence2 !== auditSequence) return;
      const message = error instanceof Error ? error.message : String(error);
      postError(`Audit failed: ${message}`);
    }
  }
  async function currentSafePlans(selected) {
    const root = scanSceneNode(selected);
    const detections = detectPatterns2(root);
    const roles = detectSpecialRoles(root);
    const plans = planSafeRecipes(root, detections, roles);
    return { root, roles, plans };
  }
  async function runSafePlanPreview() {
    const selected = selectedFrame();
    if (!selected) {
      postError("Select exactly one Frame to preview Safe Fix eligibility.");
      return;
    }
    try {
      const [{ root, roles, plans }, proof, pendingUndo] = await Promise.all([
        currentSafePlans(selected),
        runtimeProofState(),
        hasPendingSafeFixCheckpoint()
      ]);
      figma.ui.postMessage({
        type: "safe-plan-result",
        root: { id: root.id, name: root.name, width: root.geometry.width, height: root.geometry.height },
        plans,
        roles,
        mutationEnabled: proof.valid && !pendingUndo && !p5OperationInFlight,
        runtimeProofValid: proof.valid,
        runtimeProofPassedAt: proof.passedAt,
        runtimeBuild: { ...RUNTIME_BUILD },
        pendingUndo,
        operationInFlight: p5OperationInFlight
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      postError(`Safe Fix preview failed: ${message}`);
    }
  }
  async function runValidation() {
    const selection = figma.currentPage.selection;
    if (selection.length !== 2) {
      postError("Select exactly two section Frames: original first, candidate second.", "validation-error");
      return;
    }
    const before = selection[0];
    const after = selection[1];
    if (!before || !after || before.type !== "FRAME" || after.type !== "FRAME") {
      postError("Validation currently requires exactly two selected Figma Frames.", "validation-error");
      return;
    }
    try {
      const result = await fullFrameValidator.validate(before, after);
      figma.ui.postMessage({
        type: "validation-result",
        report: result.report,
        labels: result.labels,
        renderScale: result.renderScale
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      postError(`Validation failed: ${message}`, "validation-error");
    }
  }
  async function runRuntimeSelfTest() {
    const operation = "runtime-self-test";
    if (!beginExclusiveP5Operation(operation, "validation-error")) return;
    figma.ui.postMessage({ type: "runtime-calibration-started", runtimeBuild: { ...RUNTIME_BUILD } });
    try {
      const result = await runP5RuntimeCalibration(async (before, after) => {
        const validation = await fullFrameValidator.validate(before, after);
        return validation.report;
      });
      const acceptance = await updateP5RuntimeProofFromCalibration(figma.clientStorage, result, RUNTIME_BUILD);
      const proof = await runtimeProofState();
      const evidence = buildP5RuntimeEvidenceBundle({
        pluginVersion: PLUGIN_VERSION,
        build: RUNTIME_BUILD,
        result,
        runtimeProofPassedAt: proof.passedAt
      });
      const evidencePersisted = await persistP5RuntimeEvidenceBestEffort(figma.clientStorage, evidence);
      figma.ui.postMessage({
        type: "runtime-calibration-result",
        result,
        acceptance,
        evidence,
        evidencePersisted,
        runtimeBuild: { ...RUNTIME_BUILD },
        mutationGateUnlocked: proof.valid,
        runtimeProofPassedAt: proof.passedAt
      });
      figma.showUI(buildP5RuntimeEvidenceViewerHtml(evidence), {
        width: 520,
        height: 700,
        themeColors: true
      });
      if (acceptance.accepted && proof.valid) {
        figma.notify(evidencePersisted ? "P5 compiled runtime acceptance passed. Evidence saved; Safe Fix gate unlocked." : "P5 compiled runtime acceptance passed. Evidence storage failed, but Safe Fix gate is unlocked.");
      } else {
        const detail = acceptance.failures[0] ? ` ${acceptance.failures[0]}` : "";
        figma.notify(`P5 compiled runtime acceptance failed; Safe Fix remains locked.${detail}`);
      }
    } catch (error) {
      await figma.clientStorage.deleteAsync(P5_RUNTIME_PROOF_STORAGE_KEY);
      const message = error instanceof Error ? error.message : String(error);
      postError(`P5 runtime self-test failed: ${message}`, "validation-error");
    } finally {
      endExclusiveP5Operation(operation);
    }
  }
  async function runRuntimeEvidenceViewer() {
    const evidence = await loadLatestP5RuntimeEvidence(figma.clientStorage);
    if (!evidence) {
      figma.notify("No valid persisted P5 runtime acceptance evidence is available.");
      return;
    }
    figma.showUI(buildP5RuntimeEvidenceViewerHtml(evidence), {
      width: 520,
      height: 700,
      themeColors: true
    });
  }
  async function runSafeFixApply(message) {
    const selected = selectedFrame();
    if (!selected) {
      postError("Select exactly one Frame before applying a Safe Fix.", "safe-fix-error");
      return;
    }
    const operation = "safe-fix-apply";
    if (!beginExclusiveP5Operation(operation, "safe-fix-error")) return;
    try {
      const [proof, pendingUndo] = await Promise.all([
        runtimeProofState(),
        hasPendingSafeFixCheckpoint()
      ]);
      if (!proof.valid) {
        postError("Safe Fix mutation is locked until Developer: P5 Runtime Self-Test passes in this exact CI-built plugin artifact.", "safe-fix-error");
        return;
      }
      if (pendingUndo) {
        postError("A previous Safe Fix checkpoint is pending. Restore or finalize it before applying another fix.", "safe-fix-error");
        return;
      }
      const { plans } = await currentSafePlans(selected);
      const plan = plans.find((candidate) => candidate.decision === "ELIGIBLE" && candidate.recipe === message.recipe && candidate.targetNodeId === message.targetNodeId);
      if (!plan) {
        postError("The requested Safe Fix is no longer eligible after re-auditing the current selection.", "safe-fix-error");
        return;
      }
      figma.ui.postMessage({
        type: "safe-fix-started",
        recipe: plan.recipe,
        targetNodeName: plan.targetNodeName
      });
      const result = await runSafeFixTransaction(selected, plan, async (before, after) => {
        const validation = await fullFrameValidator.validate(before, after);
        return validation.report;
      });
      const checkpointPending = await hasPendingSafeFixCheckpoint();
      figma.ui.postMessage({
        type: "safe-fix-result",
        plan: result.plan,
        transaction: result.transaction,
        skippedReason: result.skippedReason ?? null,
        pendingUndo: checkpointPending
      });
      if (result.transaction?.state === "COMMITTED") {
        figma.notify("Safe Fix passed full P3 validation and was committed. Restore or finalize the checkpoint.");
      } else if (result.transaction?.state === "REJECTED") {
        figma.notify("Safe Fix candidate was rejected by validation; the original was kept unchanged.");
      } else if (result.transaction?.state === "FAILED") {
        figma.notify("Safe Fix failed safely; the approved original was kept unchanged.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      postError(`Safe Fix failed: ${errorMessage}`, "safe-fix-error");
    } finally {
      endExclusiveP5Operation(operation);
    }
  }
  async function runSafeFixRestore() {
    const operation = "safe-fix-restore";
    if (!beginExclusiveP5Operation(operation, "safe-fix-error")) return;
    try {
      const evidence = await restoreLastSafeFix();
      figma.ui.postMessage({ type: "safe-fix-restore-result", restored: Boolean(evidence), evidence });
      figma.notify(evidence ? "Previous approved original restored." : "No Safe Fix checkpoint is pending.");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      postError(`Safe Fix restore failed: ${message}`, "safe-fix-error");
    } finally {
      endExclusiveP5Operation(operation);
    }
  }
  async function runSafeFixFinalize() {
    const operation = "safe-fix-finalize";
    if (!beginExclusiveP5Operation(operation, "safe-fix-error")) return;
    try {
      const finalized = await finalizeLastSafeFix();
      figma.ui.postMessage({ type: "safe-fix-finalize-result", finalized });
      figma.notify(finalized ? "Safe Fix finalized; previous original backup removed." : "No Safe Fix checkpoint is pending.");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      postError(`Safe Fix finalize failed: ${message}`, "safe-fix-error");
    } finally {
      endExclusiveP5Operation(operation);
    }
  }
  function startAudit() {
    const sequence2 = ++auditSequence;
    void runAudit(sequence2);
  }
  function startValidation() {
    auditSequence += 1;
    void runValidation();
  }
  figma.ui.onmessage = async (message) => {
    if (typeof message !== "object" || message === null || !("type" in message)) return;
    const type = message.type;
    if (type === "audit-request") {
      const sequence2 = ++auditSequence;
      await runAudit(sequence2);
      return;
    }
    if (type === "safe-plan-request") {
      await runSafePlanPreview();
      return;
    }
    if (type === "safe-fix-apply-request") {
      const payload = message;
      if (typeof payload.targetNodeId !== "string" || typeof payload.recipe !== "string") {
        postError("Safe Fix request payload is invalid.", "safe-fix-error");
        return;
      }
      await runSafeFixApply({
        targetNodeId: payload.targetNodeId,
        recipe: payload.recipe
      });
      return;
    }
    if (type === "safe-fix-restore-request") {
      await runSafeFixRestore();
      return;
    }
    if (type === "safe-fix-finalize-request") {
      await runSafeFixFinalize();
      return;
    }
    if (type === "validation-request") {
      auditSequence += 1;
      await runValidation();
      return;
    }
    if (type === "runtime-calibration-request") {
      await runRuntimeSelfTest();
      return;
    }
    if (type === "validation-pixel-result") {
      const payload = message;
      if (typeof payload.validationId !== "number" || typeof payload.pixelMetrics !== "object" || payload.pixelMetrics === null) {
        postError("Pixel validator returned an invalid payload.", "validation-error");
        return;
      }
      if (!fullFrameValidator.finish(payload.validationId, payload.pixelMetrics)) {
        postError("Validation result expired or is no longer pending.", "validation-error");
      }
      return;
    }
    if (type === "validation-pixel-error") {
      const payload = message;
      if (typeof payload.validationId !== "number" || typeof payload.message !== "string") {
        postError("Pixel validator returned an invalid error payload.", "validation-error");
        return;
      }
      if (!fullFrameValidator.fail(payload.validationId, payload.message)) {
        postError("Validation result expired or is no longer pending.", "validation-error");
      }
    }
  };
  figma.on("selectionchange", () => {
    const sequence2 = ++auditSequence;
    if (figma.currentPage.selection.length === 1) void runAudit(sequence2);
  });
  if (figma.command === "p5-runtime-self-test") {
    void runRuntimeSelfTest();
  } else if (figma.command === "p5-runtime-evidence") {
    void runRuntimeEvidenceViewer();
  } else {
    switch (figma.command) {
      case "audit":
      case "export-report":
        startAudit();
        break;
      case "validate":
        startValidation();
        break;
      case "open":
      default:
        if (figma.currentPage.selection.length === 1) startAudit();
        break;
    }
  }
})();
//# sourceMappingURL=code.js.map
