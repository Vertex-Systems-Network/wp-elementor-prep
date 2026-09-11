import { flatten } from './scanner';
import { detectSpecialRoles } from './roles';
import type { AuditNode } from './types';
import type {
  BuildReadyAnalysisContext,
  BuildReadyFinding,
  BuildReadyRuleDefinition,
  BuildReadySeverity,
} from './build-ready-types';

export const RESPONSIVE_RISK_RULES: Record<string, BuildReadyRuleDefinition> = {
  RR_HORIZONTAL_DENSITY: {
    id: 'RR_HORIZONTAL_DENSITY',
    version: 1,
    category: 'RESPONSIVE_RISK',
    severity: 'MEDIUM',
    confidencePolicy: 'MEDIUM_PLUS',
    maxPenalty: 20,
    dedupeKeyStrategy: 'container-id',
    remediationClass: 'MANUAL_REVIEW',
  },
  RR_OVERFLOW_CLIP_DEPENDENCY: {
    id: 'RR_OVERFLOW_CLIP_DEPENDENCY',
    version: 1,
    category: 'RESPONSIVE_RISK',
    severity: 'HIGH',
    confidencePolicy: 'HIGH_ONLY',
    maxPenalty: 16,
    dedupeKeyStrategy: 'parent-child',
    remediationClass: 'MANUAL_REVIEW',
  },
  RR_OVERLAP_COLLISION: {
    id: 'RR_OVERLAP_COLLISION',
    version: 1,
    category: 'RESPONSIVE_RISK',
    severity: 'MEDIUM',
    confidencePolicy: 'MEDIUM_PLUS',
    maxPenalty: 16,
    dedupeKeyStrategy: 'parent-pair',
    remediationClass: 'MANUAL_REVIEW',
  },
  RR_ABSOLUTE_FLOW_DEPENDENCY: {
    id: 'RR_ABSOLUTE_FLOW_DEPENDENCY',
    version: 1,
    category: 'RESPONSIVE_RISK',
    severity: 'MEDIUM',
    confidencePolicy: 'ADVISORY',
    maxPenalty: 10,
    dedupeKeyStrategy: 'node-id',
    remediationClass: 'MANUAL_REVIEW',
  },
  RR_MEDIA_WRAPPER_RISK: {
    id: 'RR_MEDIA_WRAPPER_RISK',
    version: 1,
    category: 'RESPONSIVE_RISK',
    severity: 'LOW',
    confidencePolicy: 'ADVISORY',
    maxPenalty: 8,
    dedupeKeyStrategy: 'parent-child',
    remediationClass: 'ADVISORY',
  },
  RR_FIXED_HEIGHT_TEXT_CLIP: {
    id: 'RR_FIXED_HEIGHT_TEXT_CLIP',
    version: 1,
    category: 'QA_ADVISORIES',
    severity: 'LOW',
    confidencePolicy: 'ADVISORY',
    maxPenalty: 0,
    dedupeKeyStrategy: 'node-id',
    remediationClass: 'ADVISORY',
  },
};

function round(value: number, digits = 2): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function subtreeHasText(node: AuditNode): boolean {
  if (node.isText) return true;
  const stack = [...node.children];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    if (current.isText) return true;
    stack.push(...current.children);
  }
  return false;
}

function intersectionArea(a: AuditNode, b: AuditNode): number {
  const left = Math.max(a.geometry.x, b.geometry.x);
  const top = Math.max(a.geometry.y, b.geometry.y);
  const right = Math.min(a.geometry.x + a.geometry.width, b.geometry.x + b.geometry.width);
  const bottom = Math.min(a.geometry.y + a.geometry.height, b.geometry.y + b.geometry.height);
  if (right <= left || bottom <= top) return 0;
  return (right - left) * (bottom - top);
}

function severityRank(severity: BuildReadySeverity): number {
  return { LOW: 0, MEDIUM: 1, HIGH: 2, BLOCKER: 3 }[severity];
}

function finding(
  ruleId: keyof typeof RESPONSIVE_RISK_RULES,
  nodeIds: string[],
  overrides: {
    severity?: BuildReadySeverity;
    confidence: number;
    title: string;
    detail: string;
    evidence: Record<string, string | number | boolean>;
    penalty: number;
    relatedCategories?: BuildReadyFinding['relatedCategories'];
  },
): BuildReadyFinding {
  const rule = RESPONSIVE_RISK_RULES[ruleId];
  if (!rule) throw new Error(`Unknown P13 rule: ${ruleId}`);
  const severity = overrides.severity ?? rule.severity;
  return {
    id: `${rule.id}:${nodeIds.join(':')}`,
    ruleId: rule.id,
    ruleVersion: rule.version,
    category: rule.category,
    relatedCategories: overrides.relatedCategories ?? [],
    severity,
    confidence: Math.max(0, Math.min(100, Math.round(overrides.confidence))),
    title: overrides.title,
    detail: overrides.detail,
    nodeIds,
    evidence: overrides.evidence,
    penalty: Math.max(0, overrides.penalty),
    remediationClass: rule.remediationClass,
    targetAgnostic: true,
  };
}

function densityFindings(context: BuildReadyAnalysisContext): BuildReadyFinding[] {
  const results: BuildReadyFinding[] = [];
  for (const container of flatten(context.root)) {
    if (!container.visible || container.layoutMode !== 'HORIZONTAL' || container.geometry.width <= 0) continue;
    const children = container.children.filter((child) => child.visible && !child.absolutePositioned && child.geometry.width > 0);
    if (children.length < 2) continue;

    const combinedWidth = children.reduce((sum, child) => sum + child.geometry.width, 0);
    const currentRatio = combinedWidth / container.geometry.width;
    const triggered = context.config.referenceWidths.filter(
      (width) => width > 0 && width <= container.geometry.width && combinedWidth / width >= 0.92,
    );
    if (currentRatio < 0.92 && triggered.length === 0) continue;

    const severity: BuildReadySeverity = currentRatio > 1.02 ? 'HIGH' : 'MEDIUM';
    results.push(finding('RR_HORIZONTAL_DENSITY', [container.id], {
      severity,
      confidence: currentRatio > 1.02 ? 90 : 76,
      title: 'Horizontal layout has contraction pressure',
      detail: 'Visible in-flow child widths consume most or more than the available row width. Reference widths are analysis probes only; no mobile layout is inferred.',
      evidence: {
        parentWidth: round(container.geometry.width),
        combinedChildWidth: round(combinedWidth),
        currentDensityRatio: round(currentRatio),
        childCount: children.length,
        triggeredReferenceWidths: triggered.join(','),
      },
      penalty: severity === 'HIGH' ? 8 : 4,
    }));
  }
  return results;
}

function overflowFindings(context: BuildReadyAnalysisContext): BuildReadyFinding[] {
  const results: BuildReadyFinding[] = [];
  for (const parent of flatten(context.root)) {
    if (!parent.visible || !parent.clipsContent || parent.geometry.width <= 0 || parent.geometry.height < 0) continue;
    for (const child of parent.children) {
      if (!child.visible || child.geometry.width < 0 || child.geometry.height < 0) continue;
      const overflowLeft = Math.max(0, -child.geometry.x);
      const overflowTop = Math.max(0, -child.geometry.y);
      const overflowRight = Math.max(0, child.geometry.x + child.geometry.width - parent.geometry.width);
      const overflowBottom = Math.max(0, child.geometry.y + child.geometry.height - parent.geometry.height);
      const overflow = Math.max(overflowLeft, overflowTop, overflowRight, overflowBottom);
      if (overflow <= 1) continue;

      results.push(finding('RR_OVERFLOW_CLIP_DEPENDENCY', [parent.id, child.id], {
        confidence: 94,
        title: 'Visible geometry depends on clipping',
        detail: 'A child extends beyond a clipping parent. Width changes can expose or hide content differently, so this requires review rather than an invented responsive fix.',
        evidence: {
          parentWidth: round(parent.geometry.width),
          parentHeight: round(parent.geometry.height),
          overflowPx: round(overflow),
          childX: round(child.geometry.x),
          childY: round(child.geometry.y),
          childWidth: round(child.geometry.width),
          childHeight: round(child.geometry.height),
        },
        penalty: 8,
      }));
    }
  }
  return results;
}

function overlapFindings(context: BuildReadyAnalysisContext): BuildReadyFinding[] {
  const results: BuildReadyFinding[] = [];
  const roleTargets = new Set(detectSpecialRoles(context.root, 6, 200).map((role) => role.targetNodeId));

  for (const parent of flatten(context.root)) {
    if (!parent.visible || !parent.isContainer) continue;
    const candidates = parent.children
      .filter((child) =>
        child.visible
        && !child.absolutePositioned
        && !roleTargets.has(child.id)
        && child.geometry.width > 0
        && child.geometry.height > 0,
      )
      .slice(0, context.config.maxCollisionChildren);

    for (let i = 0; i < candidates.length; i += 1) {
      const a = candidates[i];
      if (!a) continue;
      for (let j = i + 1; j < candidates.length; j += 1) {
        const b = candidates[j];
        if (!b) continue;
        const intersection = intersectionArea(a, b);
        if (intersection <= 0) continue;
        const minArea = Math.max(1, Math.min(
          a.geometry.width * a.geometry.height,
          b.geometry.width * b.geometry.height,
        ));
        const overlapRatio = intersection / minArea;
        if (overlapRatio < 0.12) continue;
        const severity: BuildReadySeverity = overlapRatio >= 0.35 ? 'HIGH' : 'MEDIUM';
        results.push(finding('RR_OVERLAP_COLLISION', [parent.id, a.id, b.id], {
          severity,
          confidence: severity === 'HIGH' ? 88 : 74,
          title: 'Non-overlay siblings materially overlap',
          detail: 'Sibling geometry overlaps without a retained special-overlay role. The current source should be reviewed before treating this as normal responsive flow.',
          evidence: {
            overlapRatio: round(overlapRatio),
            overlapArea: round(intersection),
            parentWidth: round(parent.geometry.width),
          },
          penalty: severity === 'HIGH' ? 6 : 3,
        }));
      }
    }
  }
  return results;
}

function absoluteFlowFindings(context: BuildReadyAnalysisContext): BuildReadyFinding[] {
  const results: BuildReadyFinding[] = [];
  const roles = new Map(detectSpecialRoles(context.root, 6, 200).map((role) => [role.targetNodeId, role]));
  for (const node of flatten(context.root)) {
    if (!node.visible || !node.absolutePositioned) continue;
    const role = roles.get(node.id);
    const hasText = subtreeHasText(node);

    // Geometry-only decorative/background overlays are preserved rather than penalized.
    if (!hasText && (node.isImageLike || node.opacity <= 0.65 || role?.role === 'background-layer' || role?.role === 'decorative-overlay')) {
      continue;
    }
    if (!hasText) continue;

    results.push(finding('RR_ABSOLUTE_FLOW_DEPENDENCY', [node.id], {
      confidence: node.isText ? 72 : 68,
      title: 'Content-bearing absolute layer may depend on desktop geometry',
      detail: 'Text-bearing content is absolutely positioned. This is a review signal only; legitimate badges and overlays must be preserved if intentional.',
      evidence: {
        isText: node.isText,
        descendantTextPresent: hasText,
        width: round(node.geometry.width),
        height: round(node.geometry.height),
        retainedRole: role?.role ?? 'none',
      },
      penalty: 2,
    }));
  }
  return results;
}

function mediaFindings(context: BuildReadyAnalysisContext): BuildReadyFinding[] {
  const results: BuildReadyFinding[] = [];
  for (const parent of flatten(context.root)) {
    if (!parent.visible || parent.geometry.width <= 0) continue;
    for (const child of parent.children) {
      if (!child.visible || !child.isImageLike || child.geometry.width <= 0) continue;
      const widthRatio = child.geometry.width / parent.geometry.width;
      if (widthRatio <= 1.05) continue;
      results.push(finding('RR_MEDIA_WRAPPER_RISK', [parent.id, child.id], {
        confidence: 64,
        title: 'Media exceeds its wrapper width',
        detail: 'Image-like geometry is wider than its parent. Sizing-mode data is not yet retained, so this remains an advisory rather than a compatibility claim.',
        evidence: {
          parentWidth: round(parent.geometry.width),
          mediaWidth: round(child.geometry.width),
          widthRatio: round(widthRatio),
        },
        penalty: 1,
      }));
    }
  }
  return results;
}

function fixedTextFindings(context: BuildReadyAnalysisContext): BuildReadyFinding[] {
  const results: BuildReadyFinding[] = [];
  for (const node of flatten(context.root)) {
    if (!node.visible || !node.isText || node.textLength < 80) continue;
    if (node.textAutoResize === 'HEIGHT' || node.textAutoResize === 'WIDTH_AND_HEIGHT') continue;

    results.push(finding('RR_FIXED_HEIGHT_TEXT_CLIP', [node.id], {
      confidence: 60,
      title: 'Long text lacks retained auto-height behavior',
      detail: 'The text is relatively long and does not expose an auto-height resize mode. Font metrics are not retained here, so this is advisory and carries no score penalty.',
      evidence: {
        textLength: node.textLength,
        textAutoResize: node.textAutoResize ?? 'null',
        width: round(node.geometry.width),
        height: round(node.geometry.height),
      },
      penalty: 0,
      relatedCategories: ['RESPONSIVE_RISK'],
    }));
  }
  return results;
}

export function analyzeResponsiveRisk(context: BuildReadyAnalysisContext): BuildReadyFinding[] {
  const findings = [
    ...densityFindings(context),
    ...overflowFindings(context),
    ...overlapFindings(context),
    ...absoluteFlowFindings(context),
    ...mediaFindings(context),
    ...fixedTextFindings(context),
  ];

  return findings
    .sort((a, b) =>
      severityRank(b.severity) - severityRank(a.severity)
      || a.ruleId.localeCompare(b.ruleId)
      || a.nodeIds.join('/').localeCompare(b.nodeIds.join('/')),
    )
    .slice(0, Math.max(1, context.config.maxFindingsPerRule * Object.keys(RESPONSIVE_RISK_RULES).length));
}
