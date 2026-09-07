import type {
  AuditFinding,
  AuditNode,
  AuditReport,
  AuditStats,
  AuditStatus,
  SectionAudit,
} from './types';
import { computeStats, discoverSections } from './scanner';
import { detectPatterns, recipeForPattern } from './classifier';

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function statusFor(score: number): AuditStatus {
  if (score >= 80) return 'PASS';
  if (score >= 70) return 'REVIEW';
  return 'NEEDS_WORK';
}

function ratio(numerator: number, denominator: number, fallback = 1): number {
  if (denominator <= 0) return fallback;
  return numerator / denominator;
}

/**
 * Screening score only. It intentionally does not claim that Auto Layout percentage equals
 * Elementor readiness; later phases will add deeper sizing, overlay and repeated-pattern signals.
 */
export function scoreStats(stats: AuditStats): number {
  const layout = ratio(stats.autoLayoutContainers, stats.containers) * 50;
  const naming = (1 - ratio(stats.genericNames, stats.nodes, 0)) * 10;
  const textBehavior = ratio(stats.autoHeightTextNodes, stats.textNodes) * 12;
  const absoluteSafety = (1 - Math.min(1, ratio(stats.absolutePositionedNodes, stats.nodes, 0) * 3)) * 8;
  const structuralBaseline = stats.containers > 0 ? 10 : 5;
  const contentBaseline = stats.textNodes > 0 || stats.imageLikeNodes > 0 ? 10 : 5;

  return clamp(layout + naming + textBehavior + absoluteSafety + structuralBaseline + contentBaseline);
}

export function findingsFor(stats: AuditStats): AuditFinding[] {
  const findings: AuditFinding[] = [];

  if (stats.autoLayoutCoveragePct < 50) {
    findings.push({
      code: 'LOW_AUTO_LAYOUT_COVERAGE',
      severity: 'error',
      title: 'Normal layout is likely too manual',
      detail: 'Less than half of container-like nodes currently participate in Auto Layout. This is a screening signal, not proof that every manual frame is wrong.',
      evidence: { autoLayoutCoveragePct: stats.autoLayoutCoveragePct, manualContainers: stats.manualContainers },
    });
  } else if (stats.autoLayoutCoveragePct < 75) {
    findings.push({
      code: 'PARTIAL_AUTO_LAYOUT_COVERAGE',
      severity: 'warning',
      title: 'Layout is only partially structured',
      detail: 'A meaningful share of container-like nodes are still manual and should be classified before any fix is proposed.',
      evidence: { autoLayoutCoveragePct: stats.autoLayoutCoveragePct },
    });
  }

  const genericRatio = ratio(stats.genericNames, stats.nodes, 0);
  if (genericRatio >= 0.45) {
    findings.push({
      code: 'GENERIC_LAYER_NAMES',
      severity: 'warning',
      title: 'Layer semantics are weak',
      detail: 'Generic names are common. Names remain secondary evidence only; geometry and node relationships drive classification.',
      evidence: { genericNames: stats.genericNames, nodes: stats.nodes },
    });
  }

  const textAutoRatio = ratio(stats.autoHeightTextNodes, stats.textNodes);
  if (stats.textNodes > 0 && textAutoRatio < 0.6) {
    findings.push({
      code: 'TEXT_REFLOW_RISK',
      severity: 'warning',
      title: 'Text sizing may create reflow risk',
      detail: 'Many text nodes do not currently use an auto-height style. A later classifier must distinguish intentional fixed text from risky fixed heights.',
      evidence: { textNodes: stats.textNodes, autoHeightTextNodes: stats.autoHeightTextNodes },
    });
  }

  if (stats.absolutePositionedNodes > 0) {
    findings.push({
      code: 'ABSOLUTE_POSITIONING_PRESENT',
      severity: 'info',
      title: 'Absolute positioning requires role classification',
      detail: 'Absolute positioning is valid for overlays and decoration. It must not be auto-penalized or removed before decorative-role classification.',
      evidence: { absolutePositionedNodes: stats.absolutePositionedNodes },
    });
  }

  if (findings.length === 0) {
    findings.push({
      code: 'NO_MAJOR_SCREENING_ISSUES',
      severity: 'info',
      title: 'No major screening issue detected',
      detail: 'This remains an audit signal only; high-confidence mutation requires later validation and transaction phases.',
      evidence: { autoLayoutCoveragePct: stats.autoLayoutCoveragePct },
    });
  }

  return findings;
}

export function auditSection(section: AuditNode): SectionAudit {
  const stats = computeStats(section);
  const detections = detectPatterns(section);
  const detection = detections[0] ?? null;
  let score = scoreStats(stats);

  // Detection is evidence that the layout is understandable, not that it is already structurally ready.
  if (detection && detection.confidence >= 85) score = clamp(score + 3);

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
    // Already-compliant sections do not need a repair recipe even when a pattern is recognized.
    recommendedRecipe: status === 'PASS' || !detection ? null : recipeForPattern(detection.pattern),
  };
}

export function buildAuditReport(root: AuditNode, pluginVersion: string): AuditReport {
  const stats = computeStats(root);
  const sections = discoverSections(root).map(auditSection);
  const score = sections.length > 0
    ? clamp(sections.reduce((sum, section) => sum + section.score, 0) / sections.length)
    : scoreStats(stats);

  return {
    schemaVersion: 1,
    pluginVersion,
    root: {
      id: root.id,
      name: root.name,
      width: root.geometry.width,
      height: root.geometry.height,
    },
    score,
    status: statusFor(score),
    stats,
    findings: findingsFor(stats),
    sections,
    generatedAt: new Date().toISOString(),
  };
}
