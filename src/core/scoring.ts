import type {
  AuditFinding,
  AuditNode,
  AuditReport,
  AuditStats,
  AuditStatus,
  SectionAudit,
} from './types';
import { computeStats, discoverSections } from './scanner';

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function statusFor(score: number): AuditStatus {
  if (score >= 80) return 'PASS';
  if (score >= 55) return 'REVIEW';
  return 'NEEDS_WORK';
}

function ratio(numerator: number, denominator: number, fallback = 1): number {
  if (denominator <= 0) return fallback;
  return numerator / denominator;
}

export function scoreStats(stats: AuditStats): number {
  const layout = ratio(stats.autoLayoutContainers, stats.containers) * 55;
  const naming = (1 - ratio(stats.genericNames, stats.nodes, 0)) * 15;
  const textBehavior = ratio(stats.autoHeightTextNodes, stats.textNodes) * 12;
  const absoluteSafety = (1 - Math.min(1, ratio(stats.absolutePositionedNodes, stats.nodes, 0) * 3)) * 8;
  const structuralBaseline = stats.containers > 0 ? 10 : 5;

  return clamp(layout + naming + textBehavior + absoluteSafety + structuralBaseline);
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
      detail: 'Generic names are common. Names are only an advisory signal and will not be used as the primary layout classifier.',
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
      detail: 'Absolute positioning is valid for overlays and decoration. Future analysis must classify these nodes before applying any penalty or fix.',
      evidence: { absolutePositionedNodes: stats.absolutePositionedNodes },
    });
  }

  if (findings.length === 0) {
    findings.push({
      code: 'NO_MAJOR_SCREENING_ISSUES',
      severity: 'info',
      title: 'No major screening issue detected',
      detail: 'This is an initial audit signal only; geometric recipe classification still needs to run before any future mutation.',
      evidence: { autoLayoutCoveragePct: stats.autoLayoutCoveragePct },
    });
  }

  return findings;
}

function near(a: number, b: number, tolerance = 3): boolean {
  return Math.abs(a - b) <= tolerance;
}

export function recommendRecipe(section: AuditNode): string | null {
  const visible = section.children.filter((child) => child.visible && child.isContainer);
  const only = visible.length === 1 ? visible[0] : undefined;
  const candidates = only ? only.children.filter((child) => child.visible && child.isContainer) : visible;

  if (candidates.length === 2) {
    const [a, b] = candidates;
    if (a && b && near(a.geometry.y, b.geometry.y, 5)) return 'two-column';
  }

  if (candidates.length >= 4) {
    const widths = candidates.map((child) => child.geometry.width).filter((width) => width > 0);
    const average = widths.reduce((sum, width) => sum + width, 0) / Math.max(1, widths.length);
    const consistent = widths.filter((width) => Math.abs(width - average) <= average * 0.12).length;
    if (consistent >= Math.ceil(widths.length * 0.7)) return 'grid';
  }

  return null;
}

export function auditSection(section: AuditNode): SectionAudit {
  const stats = computeStats(section);
  const score = scoreStats(stats);
  return {
    id: section.id,
    name: section.name,
    score,
    status: statusFor(score),
    stats,
    findings: findingsFor(stats),
    recommendedRecipe: recommendRecipe(section),
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
