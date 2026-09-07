import { detectPatterns } from './classification';
import { detectSpecialRoles } from './roles';
import type { AdvancedPatternDetection, AdvancedPatternDecision, AdvancedPatternKind } from './advanced-types';
import type { AuditNode, PatternDetection, RoleDetection } from './types';

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function visibleContainers(node: AuditNode): AuditNode[] {
  return node.children.filter((child) => child.visible && child.isContainer);
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

function locate(root: AuditNode, targetId: string): AuditNode | null {
  const queue = [root];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (current.id === targetId) return current;
    queue.push(...current.children);
  }
  return null;
}

function containsNode(root: AuditNode, targetId: string): boolean {
  if (root.id === targetId) return true;
  return root.children.some((child) => containsNode(child, targetId));
}

function explicitTimelineName(node: AuditNode): boolean {
  return /\b(timeline|journey|history|career|milestone|milestones|roadmap|chapter|chapters|experience)\b/i.test(node.name);
}

function explicitMilestoneName(node: AuditNode): boolean {
  return /\b(milestone|milestones|roadmap|year|years|history|journey|timeline|career|chapter|chapters)\b/i.test(node.name);
}

function explicitPageName(node: AuditNode): boolean {
  return /\b(desktop|page|app|home|homepage|website|landing)\b/i.test(node.name);
}

function chapterSequenceStats(target: AuditNode): {
  children: AuditNode[];
  sequentialPct: number;
  textRichPct: number;
  broadPct: number;
} {
  const children = visibleContainers(target).filter((child) => {
    const widthRatio = child.geometry.width / Math.max(1, target.geometry.width);
    const heightRatio = child.geometry.height / Math.max(1, target.geometry.height);
    return widthRatio >= 0.25 && heightRatio >= 0.04;
  });
  const sorted = [...children].sort((a, b) => a.geometry.y - b.geometry.y);
  let sequentialPairs = 0;
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (!previous || !current) continue;
    if (current.geometry.y >= previous.geometry.y + previous.geometry.height - 6) sequentialPairs += 1;
  }

  const sequentialPct = sorted.length >= 2
    ? Math.round((sequentialPairs / (sorted.length - 1)) * 100)
    : 0;
  const textRich = children.filter((child) => textDescendants(child) >= 2).length;
  const broad = children.filter((child) => child.geometry.width >= target.geometry.width * 0.35).length;

  return {
    children: sorted,
    sequentialPct,
    textRichPct: Math.round((textRich / Math.max(1, children.length)) * 100),
    broadPct: Math.round((broad / Math.max(1, children.length)) * 100),
  };
}

function sideForChapter(chapter: AuditNode, target: AuditNode): 'left' | 'right' | 'center' {
  const targetMid = target.geometry.width / 2;
  let center = chapter.geometry.x + chapter.geometry.width / 2;

  if (chapter.geometry.width >= target.geometry.width * 0.76) {
    const nested = visibleContainers(chapter)
      .filter((child) => {
        const widthRatio = child.geometry.width / Math.max(1, target.geometry.width);
        return widthRatio >= 0.18 && widthRatio <= 0.68;
      })
      .sort((a, b) => (b.geometry.width * b.geometry.height) - (a.geometry.width * a.geometry.height));
    const dominant = nested[0];
    if (dominant) center = chapter.geometry.x + dominant.geometry.x + dominant.geometry.width / 2;
  }

  if (center <= targetMid - target.geometry.width * 0.06) return 'left';
  if (center >= targetMid + target.geometry.width * 0.06) return 'right';
  return 'center';
}

function pushUnique(
  output: AdvancedPatternDetection[],
  detection: AdvancedPatternDetection,
): void {
  const existingIndex = output.findIndex((candidate) => (
    candidate.pattern === detection.pattern && candidate.targetNodeId === detection.targetNodeId
  ));
  if (existingIndex < 0) {
    output.push(detection);
    return;
  }
  const existing = output[existingIndex];
  if (existing && detection.confidence > existing.confidence) output[existingIndex] = detection;
}

function makeDetection(
  pattern: AdvancedPatternKind,
  decision: AdvancedPatternDecision,
  confidence: number,
  target: AuditNode,
  evidence: Record<string, string | number | boolean>,
  relatedNodeIds: string[] = [],
): AdvancedPatternDetection {
  return {
    pattern,
    decision,
    confidence: clamp(confidence),
    targetNodeId: target.id,
    targetNodeName: target.name,
    relatedNodeIds,
    evidence,
  };
}

function timelineTargets(section: AuditNode, base: PatternDetection[]): AuditNode[] {
  const byId = new Map<string, AuditNode>();
  if (explicitTimelineName(section)) byId.set(section.id, section);

  for (const detection of base) {
    if (detection.semanticHint !== 'timeline-chapter') continue;
    const target = locate(section, detection.targetNodeId);
    if (target) byId.set(target.id, target);
  }

  const queue: Array<{ node: AuditNode; depth: number }> = [{ node: section, depth: 0 }];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (current.depth > 0 && explicitTimelineName(current.node)) byId.set(current.node.id, current.node);
    if (current.depth >= 3) continue;
    for (const child of visibleContainers(current.node)) queue.push({ node: child, depth: current.depth + 1 });
  }

  return [...byId.values()];
}

function detectTimelinePatterns(
  section: AuditNode,
  base: PatternDetection[],
  roles: RoleDetection[],
  output: AdvancedPatternDetection[],
): void {
  for (const target of timelineTargets(section, base)) {
    const stats = chapterSequenceStats(target);
    if (stats.children.length < 4 || stats.sequentialPct < 70 || stats.textRichPct < 60 || stats.broadPct < 70) continue;

    const sequenceConfidence = clamp(
      48 + stats.sequentialPct * 0.2 + stats.textRichPct * 0.14 + stats.broadPct * 0.08 + (explicitTimelineName(target) ? 8 : 0),
    );
    pushUnique(output, makeDetection(
      'timeline-sequence',
      'REVIEW',
      sequenceConfidence,
      target,
      {
        semanticRule: 'explicit-or-semantic-timeline-sequential-chapters',
        chapterCount: stats.children.length,
        sequentialPairPct: stats.sequentialPct,
        textRichChapterPct: stats.textRichPct,
        broadChapterPct: stats.broadPct,
        explicitTimelineName: explicitTimelineName(target),
        mutationEnabled: false,
      },
      stats.children.map((child) => child.id),
    ));

    const sides = stats.children.map((chapter) => sideForChapter(chapter, target)).filter((side) => side !== 'center');
    const leftCount = sides.filter((side) => side === 'left').length;
    const rightCount = sides.filter((side) => side === 'right').length;
    let alternatingPairs = 0;
    for (let index = 1; index < sides.length; index += 1) {
      if (sides[index] !== sides[index - 1]) alternatingPairs += 1;
    }
    const alternationPct = sides.length >= 2
      ? Math.round((alternatingPairs / (sides.length - 1)) * 100)
      : 0;

    if (sides.length >= 4 && leftCount >= 2 && rightCount >= 2 && alternationPct >= 75) {
      pushUnique(output, makeDetection(
        'alternating-timeline',
        'REVIEW',
        clamp(62 + alternationPct * 0.25 + Math.min(8, sides.length)),
        target,
        {
          semanticRule: 'alternating-chapter-content-sides',
          sideEvidenceCount: sides.length,
          leftChapterCount: leftCount,
          rightChapterCount: rightCount,
          alternationPct,
          mutationEnabled: false,
        },
        stats.children.map((child) => child.id),
      ));
    }

    const preservedRoles = roles.filter((role) => containsNode(target, role.targetNodeId));
    if (preservedRoles.length > 0) {
      const backgroundCount = preservedRoles.filter((role) => role.role === 'background-layer').length;
      const absoluteCount = preservedRoles.filter((role) => role.role === 'absolute-overlay').length;
      const decorativeCount = preservedRoles.filter((role) => role.role === 'decorative-overlay').length;
      pushUnique(output, makeDetection(
        'timeline-decoration-overlay',
        'PRESERVE',
        Math.max(...preservedRoles.map((role) => role.confidence)),
        target,
        {
          preservationRule: 'timeline-special-role-descendants',
          preservedRoleCount: preservedRoles.length,
          backgroundRoleCount: backgroundCount,
          absoluteOverlayCount: absoluteCount,
          decorativeOverlayCount: decorativeCount,
          flattenIntoNormalFlow: false,
        },
        preservedRoles.map((role) => role.targetNodeId),
      ));
    }
  }
}

function detectBaseAdvancedPatterns(
  section: AuditNode,
  base: PatternDetection[],
  output: AdvancedPatternDetection[],
): void {
  for (const detection of base) {
    const target = locate(section, detection.targetNodeId);
    if (!target) continue;

    if (detection.pattern === 'carousel-track') {
      const clips = Boolean(detection.evidence.clipsContent) || target.clipsContent;
      pushUnique(output, makeDetection(
        'carousel-viewport-track',
        clips ? 'PRESERVE' : 'REVIEW',
        detection.confidence,
        target,
        {
          preservationRule: 'wider-track-overflow-is-intentional',
          overflowPx: Number(detection.evidence.overflowPx ?? 0),
          itemCount: Number(detection.evidence.itemCount ?? 0),
          widthConsistencyPct: Number(detection.evidence.widthConsistencyPct ?? 0),
          clipsContent: clips,
          blindOverflowCompression: false,
          mutationEnabled: false,
        },
      ));
    }

    if (detection.pattern === 'grid' && detection.evidence.fragmentedCellCandidate === true) {
      pushUnique(output, makeDetection(
        'fragmented-card-synthesis',
        'REVIEW',
        detection.confidence,
        target,
        {
          synthesisRule: 'dominant-grid-anchors-with-fragmented-missing-cells',
          columns: Number(detection.evidence.columns ?? 0),
          rows: Number(detection.evidence.rows ?? 0),
          missingSlots: Number(detection.evidence.missingSlots ?? 0),
          anchorCount: Number(detection.evidence.anchorCount ?? 0),
          fragmentCount: Number(detection.evidence.fragmentCount ?? 0),
          occupancyPct: Number(detection.evidence.occupancyPct ?? 0),
          autoSynthesisEnabled: false,
        },
      ));
    }

    if (detection.pattern === 'grid' && explicitMilestoneName(target)) {
      const itemCount = Number(detection.evidence.itemCount ?? 0);
      const columns = Number(detection.evidence.columns ?? 0);
      const rows = Number(detection.evidence.rows ?? 0);
      if (itemCount >= 4 && itemCount <= 16 && columns >= 2 && rows >= 2) {
        pushUnique(output, makeDetection(
          'milestone-grid',
          'REVIEW',
          Math.min(97, detection.confidence + 3),
          target,
          {
            semanticRule: 'explicit-milestone-name-with-grid-geometry',
            itemCount,
            columns,
            rows,
            fragmentedCellCandidate: detection.evidence.fragmentedCellCandidate === true,
            mutationEnabled: false,
          },
        ));
      }
    }
  }
}

function isHeader(node: AuditNode): boolean {
  return /\b(header|navbar|nav|navigation|topbar|top-bar)\b/i.test(node.name);
}

function isHero(node: AuditNode): boolean {
  return /\b(hero|banner|masthead)\b/i.test(node.name);
}

function verticalOverlapRatio(a: AuditNode, b: AuditNode): number {
  const top = Math.max(a.geometry.y, b.geometry.y);
  const bottom = Math.min(a.geometry.y + a.geometry.height, b.geometry.y + b.geometry.height);
  const overlap = Math.max(0, bottom - top);
  return overlap / Math.max(1, Math.min(a.geometry.height, b.geometry.height));
}

function findHeaderHeroPair(section: AuditNode): { header: AuditNode; hero: AuditNode; overlapPct: number } | null {
  const children = visibleContainers(section);
  const header = children.find(isHeader);
  const hero = children.find(isHero);
  if (!header || !hero) return null;
  const overlapPct = Math.round(verticalOverlapRatio(header, hero) * 100);
  if (overlapPct < 10 && !header.absolutePositioned && !hero.absolutePositioned) return null;
  return { header, hero, overlapPct };
}

function detectPagePatterns(section: AuditNode, roles: RoleDetection[], output: AdvancedPatternDetection[]): void {
  const headerHero = findHeaderHeroPair(section);
  if (headerHero) {
    pushUnique(output, makeDetection(
      'header-hero-overlay',
      'PRESERVE',
      clamp(86 + Math.min(10, headerHero.overlapPct / 5) + (headerHero.header.absolutePositioned ? 4 : 0)),
      section,
      {
        preservationRule: 'named-header-hero-overlap',
        overlapPct: headerHero.overlapPct,
        headerAbsolute: headerHero.header.absolutePositioned,
        heroAbsolute: headerHero.hero.absolutePositioned,
        normalizeAsIndependentSequentialSections: false,
      },
      [headerHero.header.id, headerHero.hero.id],
    ));
  }

  if (!explicitPageName(section)) return;
  const directRoleTargets = new Set(
    roles
      .filter((role) => role.parentNodeId === section.id && role.role !== 'absolute-overlay')
      .map((role) => role.targetNodeId),
  );
  const children = visibleContainers(section).filter((child) => !directRoleTargets.has(child.id));
  if (children.length < 5) return;

  const broad = children.filter((child) => child.geometry.width >= section.geometry.width * 0.72).length;
  const broadPct = Math.round((broad / children.length) * 100);
  const sorted = [...children].sort((a, b) => a.geometry.y - b.geometry.y);
  let acceptablePairs = 0;
  let overlayPairs = 0;
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (!previous || !current) continue;
    const nonOverlapping = current.geometry.y >= previous.geometry.y + previous.geometry.height - 6;
    const knownHeaderHero = (isHeader(previous) && isHero(current)) || (isHero(previous) && isHeader(current));
    if (nonOverlapping || knownHeaderHero) {
      acceptablePairs += 1;
      if (!nonOverlapping && knownHeaderHero) overlayPairs += 1;
    }
  }
  const sequentialPct = sorted.length >= 2
    ? Math.round((acceptablePairs / (sorted.length - 1)) * 100)
    : 0;
  if (broadPct < 70 || sequentialPct < 80) return;

  const alreadyVertical = section.isAutoLayout && section.layoutMode === 'VERTICAL';
  pushUnique(output, makeDetection(
    'page-vertical-flow',
    alreadyVertical ? 'NOOP' : 'CANDIDATE',
    clamp(54 + broadPct * 0.18 + sequentialPct * 0.18 + (explicitPageName(section) ? 8 : 0)),
    section,
    {
      structuralRule: 'broad-sequential-page-sections',
      sectionCount: children.length,
      broadSectionPct: broadPct,
      sequentialPairPct: sequentialPct,
      allowedHeaderHeroOverlayPairs: overlayPairs,
      excludedPreservationRoleCount: directRoleTargets.size,
      alreadyVerticalAutoLayout: alreadyVertical,
      mutationEnabled: false,
    },
    children.map((child) => child.id),
  ));
}

/**
 * P6 read-only evidence classifier. It deliberately does not produce mutation plans yet.
 * Advanced structures are surfaced as CANDIDATE/REVIEW/PRESERVE/NOOP so visual calibration can
 * happen before any transformer is connected to P4.
 */
export function detectAdvancedPatterns(
  section: AuditNode,
  baseDetections: PatternDetection[] = detectPatterns(section, 4, 16),
  roles: RoleDetection[] = detectSpecialRoles(section, 4, 30),
): AdvancedPatternDetection[] {
  const output: AdvancedPatternDetection[] = [];

  detectBaseAdvancedPatterns(section, baseDetections, output);
  detectTimelinePatterns(section, baseDetections, roles, output);
  detectPagePatterns(section, roles, output);

  const decisionPriority: Record<AdvancedPatternDecision, number> = {
    PRESERVE: 4,
    REVIEW: 3,
    CANDIDATE: 2,
    NOOP: 1,
  };

  return output.sort((a, b) => (
    b.confidence - a.confidence
    || decisionPriority[b.decision] - decisionPriority[a.decision]
    || a.pattern.localeCompare(b.pattern)
  ));
}
