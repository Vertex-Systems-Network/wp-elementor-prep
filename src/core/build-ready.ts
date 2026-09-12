import { computeStats, flatten } from './scanner';
import type { AuditNode } from './types';
import { analyzeResponsiveRisk, RESPONSIVE_RISK_RULES } from './responsive-risk';
import {
  analyzeSafePreparationCandidates,
  SAFE_PREPARATION_CANDIDATE_RULES,
} from './safe-preparation-candidates';
import {
  BUILD_READY_SCHEMA_VERSION,
  BUILD_READY_SCORE_VERSION,
  RESPONSIVE_RISK_VERSION,
} from './build-ready-types';
import type {
  BuildReadyCategory,
  BuildReadyCategoryResult,
  BuildReadyFinding,
  BuildReadyLimitation,
  BuildReadyReportV2,
  BuildReadyRuleDefinition,
  BuildReadyRunConfig,
  BuildReadySeverity,
  BuildReadyStatus,
  EvidenceCoverage,
  ResponsiveRiskSummary,
} from './build-ready-types';

const ANALYZER_VERSION = 'p13-core-v1';
const DEFAULT_CONFIG: BuildReadyRunConfig = {
  referenceWidths: [1440, 1024, 768, 390],
  minOverallCoverage: 0.8,
  maxCollisionChildren: 24,
  maxFindingsPerRule: 20,
  maxNodes: 10000,
};

const CATEGORY_WEIGHTS: Record<BuildReadyCategory, number> = {
  STRUCTURE: 30,
  RESPONSIVE_RISK: 25,
  CONSISTENCY: 15,
  HANDOFF_READINESS: 20,
  QA_ADVISORIES: 10,
};

const CORE_RULES: Record<string, BuildReadyRuleDefinition> = {
  BR_LOW_AUTO_LAYOUT_COVERAGE: {
    id: 'BR_LOW_AUTO_LAYOUT_COVERAGE',
    version: 1,
    category: 'STRUCTURE',
    severity: 'HIGH',
    confidencePolicy: 'HIGH_ONLY',
    maxPenalty: 18,
    dedupeKeyStrategy: 'root',
    remediationClass: 'MANUAL_REVIEW',
  },
  BR_PARTIAL_AUTO_LAYOUT_COVERAGE: {
    id: 'BR_PARTIAL_AUTO_LAYOUT_COVERAGE',
    version: 1,
    category: 'STRUCTURE',
    severity: 'MEDIUM',
    confidencePolicy: 'HIGH_ONLY',
    maxPenalty: 8,
    dedupeKeyStrategy: 'root',
    remediationClass: 'MANUAL_REVIEW',
  },
  BR_DEEP_NESTING: {
    id: 'BR_DEEP_NESTING',
    version: 1,
    category: 'STRUCTURE',
    severity: 'LOW',
    confidencePolicy: 'ADVISORY',
    maxPenalty: 4,
    dedupeKeyStrategy: 'root',
    remediationClass: 'ADVISORY',
  },
  BR_REPEATED_STRUCTURE_DRIFT: {
    id: 'BR_REPEATED_STRUCTURE_DRIFT',
    version: 1,
    category: 'CONSISTENCY',
    severity: 'LOW',
    confidencePolicy: 'ADVISORY',
    maxPenalty: 6,
    dedupeKeyStrategy: 'parent-signature',
    remediationClass: 'ADVISORY',
  },
  BR_GENERIC_LAYER_NAMES: {
    id: 'BR_GENERIC_LAYER_NAMES',
    version: 1,
    category: 'HANDOFF_READINESS',
    severity: 'MEDIUM',
    confidencePolicy: 'HIGH_ONLY',
    maxPenalty: 12,
    dedupeKeyStrategy: 'root',
    remediationClass: 'MANUAL_REVIEW',
  },
};

const ALL_RULES: Record<string, BuildReadyRuleDefinition> = {
  ...CORE_RULES,
  ...RESPONSIVE_RISK_RULES,
  ...SAFE_PREPARATION_CANDIDATE_RULES,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function round(value: number, digits = 3): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function normalizeConfig(config: Partial<BuildReadyRunConfig> = {}): BuildReadyRunConfig {
  const widths = config.referenceWidths ?? DEFAULT_CONFIG.referenceWidths;
  const referenceWidths = [...new Set(widths.filter((width) => Number.isFinite(width) && width > 0).map(Math.round))]
    .sort((a, b) => b - a);
  return {
    referenceWidths: referenceWidths.length > 0 ? referenceWidths : [...DEFAULT_CONFIG.referenceWidths],
    minOverallCoverage: Math.max(0, Math.min(1, config.minOverallCoverage ?? DEFAULT_CONFIG.minOverallCoverage)),
    maxCollisionChildren: Math.max(2, Math.min(100, Math.round(config.maxCollisionChildren ?? DEFAULT_CONFIG.maxCollisionChildren))),
    maxFindingsPerRule: Math.max(1, Math.min(100, Math.round(config.maxFindingsPerRule ?? DEFAULT_CONFIG.maxFindingsPerRule))),
    maxNodes: Math.max(100, Math.min(100000, Math.round(config.maxNodes ?? DEFAULT_CONFIG.maxNodes))),
  };
}

function fnv1a(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function canonicalNode(node: AuditNode): unknown {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    geometry: [
      round(node.geometry.x, 4),
      round(node.geometry.y, 4),
      round(node.geometry.width, 4),
      round(node.geometry.height, 4),
    ],
    layoutMode: node.layoutMode,
    auto: node.isAutoLayout,
    container: node.isContainer,
    text: node.isText,
    image: node.isImageLike,
    generic: node.isGenericName,
    textLength: node.textLength,
    textAutoResize: node.textAutoResize,
    absolute: node.absolutePositioned,
    clips: node.clipsContent,
    opacity: round(node.opacity, 4),
    visible: node.visible,
    children: node.children.map(canonicalNode),
  };
}

function configHash(config: BuildReadyRunConfig): string {
  return fnv1a(JSON.stringify(config));
}

function structuralHash(root: AuditNode): string {
  return fnv1a(JSON.stringify(canonicalNode(root)));
}

function severityRank(severity: BuildReadySeverity): number {
  return { LOW: 0, MEDIUM: 1, HIGH: 2, BLOCKER: 3 }[severity];
}

function makeCoreFinding(
  ruleId: keyof typeof CORE_RULES,
  nodeIds: string[],
  overrides: {
    severity?: BuildReadySeverity;
    confidence: number;
    title: string;
    detail: string;
    evidence: Record<string, string | number | boolean>;
    penalty: number;
    relatedCategories?: BuildReadyCategory[];
  },
): BuildReadyFinding {
  const rule = CORE_RULES[ruleId];
  if (!rule) throw new Error(`Unknown P13 core rule: ${ruleId}`);
  return {
    id: `${rule.id}:${nodeIds.join(':')}`,
    ruleId: rule.id,
    ruleVersion: rule.version,
    category: rule.category,
    relatedCategories: overrides.relatedCategories ?? [],
    severity: overrides.severity ?? rule.severity,
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

function maxDepth(root: AuditNode): number {
  let max = 0;
  const stack: Array<{ node: AuditNode; depth: number }> = [{ node: root, depth: 0 }];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    max = Math.max(max, current.depth);
    for (const child of current.node.children) stack.push({ node: child, depth: current.depth + 1 });
  }
  return max;
}

function structureFindings(root: AuditNode): BuildReadyFinding[] {
  const stats = computeStats(root);
  const findings: BuildReadyFinding[] = [];
  if (stats.containers > 0 && stats.autoLayoutCoveragePct < 50) {
    findings.push(makeCoreFinding('BR_LOW_AUTO_LAYOUT_COVERAGE', [root.id], {
      confidence: 96,
      title: 'Normal layout has substantial manual-flow debt',
      detail: 'Less than half of container-like nodes use Auto Layout. This is structural implementation debt, not proof that every manual frame is wrong.',
      evidence: {
        autoLayoutCoveragePct: stats.autoLayoutCoveragePct,
        manualContainers: stats.manualContainers,
        containers: stats.containers,
      },
      penalty: 18,
    }));
  } else if (stats.containers > 0 && stats.autoLayoutCoveragePct < 75) {
    findings.push(makeCoreFinding('BR_PARTIAL_AUTO_LAYOUT_COVERAGE', [root.id], {
      confidence: 94,
      title: 'Layout structure is only partially flow-based',
      detail: 'A meaningful share of container-like nodes remains manual. P13 reports the debt but does not mutate the source.',
      evidence: {
        autoLayoutCoveragePct: stats.autoLayoutCoveragePct,
        manualContainers: stats.manualContainers,
        containers: stats.containers,
      },
      penalty: 8,
    }));
  }

  const depth = maxDepth(root);
  if (depth > 16) {
    findings.push(makeCoreFinding('BR_DEEP_NESTING', [root.id], {
      confidence: 70,
      title: 'Deep nesting increases handoff complexity',
      detail: 'The subtree is deeply nested. This is a bounded advisory because some editorial/composite designs legitimately require depth.',
      evidence: { maxDepth: depth },
      penalty: Math.min(4, 1 + Math.floor((depth - 16) / 4)),
    }));
  }
  return findings;
}

function normalizeRepeatName(name: string): string {
  return name.toLowerCase().replace(/\b(copy|clone)\b/g, '').replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();
}

function consistencyFindings(root: AuditNode): BuildReadyFinding[] {
  const findings: BuildReadyFinding[] = [];
  for (const parent of flatten(root)) {
    if (!parent.visible || !parent.isContainer) continue;
    const groups = new Map<string, AuditNode[]>();
    for (const child of parent.children) {
      if (!child.visible || !child.isContainer || child.absolutePositioned || child.geometry.width <= 0) continue;
      const signature = `${normalizeRepeatName(child.name)}|${child.type}|${child.layoutMode}|${child.children.length}`;
      const group = groups.get(signature) ?? [];
      group.push(child);
      groups.set(signature, group);
    }

    for (const [signature, group] of groups) {
      if (group.length < 3) continue;
      const widths = group.map((node) => node.geometry.width);
      const min = Math.min(...widths);
      const max = Math.max(...widths);
      if (min <= 0) continue;
      const spread = max / min;
      if (spread < 1.35) continue;
      findings.push(makeCoreFinding('BR_REPEATED_STRUCTURE_DRIFT', [parent.id, ...group.slice(0, 3).map((node) => node.id)], {
        confidence: 66,
        title: 'Repeated sibling structures have measurable width drift',
        detail: 'Three or more sibling containers share a structural/name signature but their widths diverge materially. Intentional variation remains possible, so this is advisory.',
        evidence: {
          repeatSignature: signature,
          repeatedCount: group.length,
          minWidth: round(min, 2),
          maxWidth: round(max, 2),
          widthSpreadRatio: round(spread, 2),
        },
        penalty: 2,
      }));
    }
  }
  return findings;
}

function handoffFindings(root: AuditNode): BuildReadyFinding[] {
  const stats = computeStats(root);
  if (stats.nodes <= 0) return [];
  const genericRatio = stats.genericNames / stats.nodes;
  if (genericRatio < 0.45) return [];
  const penalty = genericRatio >= 0.65 ? 12 : 6;
  return [makeCoreFinding('BR_GENERIC_LAYER_NAMES', [root.id], {
    severity: genericRatio >= 0.65 ? 'HIGH' : 'MEDIUM',
    confidence: 98,
    title: 'Layer naming provides weak implementation semantics',
    detail: 'Generic names are common. Naming is secondary evidence, but heavy generic naming increases handoff interpretation cost.',
    evidence: {
      genericNames: stats.genericNames,
      nodes: stats.nodes,
      genericRatio: round(genericRatio, 3),
    },
    penalty,
  })];
}

function usableGeometry(node: AuditNode): boolean {
  return Number.isFinite(node.geometry.x)
    && Number.isFinite(node.geometry.y)
    && Number.isFinite(node.geometry.width)
    && Number.isFinite(node.geometry.height)
    && node.geometry.width > 0
    && node.geometry.height >= 0;
}

function coverageFor(root: AuditNode): EvidenceCoverage {
  const nodes = flatten(root).filter((node) => node.visible);
  let unsupportedNodes = 0;
  let unknownGeometryNodes = 0;
  let analyzedNodes = 0;
  for (const node of nodes) {
    const unsupported = node.isContainer && node.layoutMode === 'UNKNOWN';
    if (unsupported) {
      unsupportedNodes += 1;
      continue;
    }
    if (!usableGeometry(node)) {
      unknownGeometryNodes += 1;
      continue;
    }
    analyzedNodes += 1;
  }

  const eligibleNodes = nodes.length;
  const overallCoverage = eligibleNodes === 0 ? 0 : analyzedNodes / eligibleNodes;
  const stats = computeStats(root);
  const textNodes = nodes.filter((node) => node.isText);
  const textAnalyzed = textNodes.filter(usableGeometry).length;
  const geometryCoverage = eligibleNodes === 0 ? 0 : (eligibleNodes - unknownGeometryNodes) / eligibleNodes;
  const unknownContainers = nodes.filter((node) => node.isContainer && node.layoutMode === 'UNKNOWN').length;
  const containerCoverage = stats.containers === 0
    ? overallCoverage
    : (stats.containers - unknownContainers) / stats.containers;

  return {
    scannedNodes: nodes.length,
    eligibleNodes,
    analyzedNodes,
    unsupportedNodes,
    unknownGeometryNodes,
    categoryCoverage: {
      STRUCTURE: round(Math.max(0, Math.min(1, containerCoverage))),
      RESPONSIVE_RISK: round(Math.max(0, Math.min(1, geometryCoverage))),
      CONSISTENCY: round(Math.max(0, Math.min(1, geometryCoverage))),
      HANDOFF_READINESS: eligibleNodes > 0 ? 1 : 0,
      QA_ADVISORIES: textNodes.length === 0 ? round(overallCoverage) : round(textAnalyzed / textNodes.length),
    },
    overallCoverage: round(overallCoverage),
  };
}

function cappedPenalty(findings: BuildReadyFinding[], category: BuildReadyCategory): number {
  const byRule = new Map<string, number>();
  for (const finding of findings) {
    if (finding.category !== category || finding.penalty <= 0) continue;
    const rule = ALL_RULES[finding.ruleId];
    if (!rule) continue;
    byRule.set(finding.ruleId, (byRule.get(finding.ruleId) ?? 0) + finding.penalty);
  }
  let total = 0;
  for (const [ruleId, penalty] of byRule) {
    const rule = ALL_RULES[ruleId];
    if (!rule) continue;
    total += Math.min(rule.maxPenalty, penalty);
  }
  return total;
}

function statusForCategory(
  score: number,
  categoryFindings: BuildReadyFinding[],
  coverage: number,
  minCoverage: number,
): BuildReadyStatus {
  if (coverage < minCoverage) return 'INSUFFICIENT_EVIDENCE';
  if (categoryFindings.some((finding) => finding.severity === 'BLOCKER') || score < 70) return 'NOT_READY';
  if (score < 90 || categoryFindings.some((finding) => finding.severity === 'HIGH')) return 'REVIEW';
  return 'READY';
}

function categoryResults(
  findings: BuildReadyFinding[],
  coverage: EvidenceCoverage,
  config: BuildReadyRunConfig,
): BuildReadyCategoryResult[] {
  return (Object.keys(CATEGORY_WEIGHTS) as BuildReadyCategory[]).map((category) => {
    const categoryFindings = findings.filter((finding) => finding.category === category);
    const penalty = cappedPenalty(findings, category);
    const score = clampScore(100 - penalty);
    const categoryCoverage = coverage.categoryCoverage[category];
    return {
      category,
      score,
      status: statusForCategory(score, categoryFindings, categoryCoverage, config.minOverallCoverage),
      applicableWeight: CATEGORY_WEIGHTS[category],
      coverage: categoryCoverage,
      findingCount: categoryFindings.length,
      penaltiesApplied: penalty,
    };
  });
}

function responsiveSummary(findings: BuildReadyFinding[], coverage: EvidenceCoverage): ResponsiveRiskSummary {
  const relevant = findings.filter((finding) =>
    finding.category === 'RESPONSIVE_RISK' || finding.relatedCategories.includes('RESPONSIVE_RISK'));
  if (coverage.categoryCoverage.RESPONSIVE_RISK <= 0) {
    return { level: 'UNKNOWN', findingCount: relevant.length, highRiskCount: 0, triggeredReferenceWidths: [] };
  }
  const maxSeverity = relevant.reduce<BuildReadySeverity>(
    (max, finding) => severityRank(finding.severity) > severityRank(max) ? finding.severity : max,
    'LOW',
  );
  const level: ResponsiveRiskSummary['level'] = relevant.length === 0
    ? 'LOW'
    : maxSeverity === 'BLOCKER'
      ? 'BLOCKER'
      : maxSeverity === 'HIGH'
        ? 'HIGH'
        : maxSeverity === 'MEDIUM'
          ? 'MEDIUM'
          : 'LOW';
  const widths = new Set<number>();
  for (const finding of relevant) {
    const raw = finding.evidence.triggeredReferenceWidths;
    if (typeof raw !== 'string') continue;
    for (const token of raw.split(',')) {
      const width = Number(token);
      if (Number.isFinite(width) && width > 0) widths.add(width);
    }
  }
  return {
    level,
    findingCount: relevant.length,
    highRiskCount: relevant.filter((finding) => finding.severity === 'HIGH' || finding.severity === 'BLOCKER').length,
    triggeredReferenceWidths: [...widths].sort((a, b) => b - a),
  };
}

function overallScore(
  categories: BuildReadyCategoryResult[],
  findings: BuildReadyFinding[],
  coverage: EvidenceCoverage,
  config: BuildReadyRunConfig,
): { score: number | null; status: BuildReadyStatus; hasHighRisk: boolean; blockerCount: number } {
  const blockerCount = findings.filter((finding) => finding.severity === 'BLOCKER').length;
  const hasHighRisk = findings.some((finding) => finding.severity === 'HIGH' || finding.severity === 'BLOCKER');
  if (coverage.overallCoverage < config.minOverallCoverage
    || categories.some((category) => category.status === 'INSUFFICIENT_EVIDENCE')) {
    return { score: null, status: 'INSUFFICIENT_EVIDENCE', hasHighRisk, blockerCount };
  }
  const weighted = categories.reduce((sum, category) =>
    sum + (category.score ?? 0) * category.applicableWeight, 0);
  const weight = categories.reduce((sum, category) => sum + category.applicableWeight, 0);
  const score = clampScore(weighted / Math.max(1, weight));
  let status: BuildReadyStatus;
  if (blockerCount > 0 || score < 70) status = 'NOT_READY';
  else if (score < 90 || hasHighRisk || categories.some((category) => category.status === 'REVIEW')) status = 'REVIEW';
  else status = 'READY';
  return { score, status, hasHighRisk, blockerCount };
}

function defaultLimitations(): BuildReadyLimitation[] {
  return [
    {
      code: 'P13_DEFER_LONG_UNBREAKABLE_CONTENT',
      detail: 'Actual text characters/tokens are not retained by AuditNode, so RR_LONG_UNBREAKABLE_CONTENT is deferred rather than inferred from text length.',
      consequence: 'DEFERRED_RULE',
    },
    {
      code: 'P13_DEFER_SPACING_PRESSURE',
      detail: 'Normalized gap/padding constraints are not retained yet, so RR_BREAKPOINT_SPACING_PRESSURE is deferred.',
      consequence: 'DEFERRED_RULE',
    },
    {
      code: 'P13_DEFER_MIN_WIDTH_STACK_PRESSURE',
      detail: 'Minimum/intrinsic sizing modes are not retained yet, so RR_MIN_WIDTH_STACK_PRESSURE is deferred.',
      consequence: 'DEFERRED_RULE',
    },
    {
      code: 'P13_LIMIT_TEXT_REFLOW',
      detail: 'Font metrics and horizontal sizing constraints are not retained. Long fixed-resize text is advisory only and cannot create a blocker.',
      consequence: 'REDUCED_CONFIDENCE',
    },
    {
      code: 'P13_LIMIT_MEDIA_SIZING',
      detail: 'Media sizing-mode constraints are not retained. Media wrapper analysis is geometry-only and advisory.',
      consequence: 'REDUCED_CONFIDENCE',
    },
  ];
}

function insufficientReport(
  root: AuditNode,
  config: BuildReadyRunConfig,
  generatedAt: string,
  coverage: EvidenceCoverage,
  limitations: BuildReadyLimitation[],
): BuildReadyReportV2 {
  const sourceHash = structuralHash(root);
  const cfgHash = configHash(config);
  const categories = (Object.keys(CATEGORY_WEIGHTS) as BuildReadyCategory[]).map((category) => ({
    category,
    score: null,
    status: 'INSUFFICIENT_EVIDENCE' as const,
    applicableWeight: CATEGORY_WEIGHTS[category],
    coverage: coverage.categoryCoverage[category],
    findingCount: 0,
    penaltiesApplied: 0,
  }));
  return {
    schemaVersion: BUILD_READY_SCHEMA_VERSION,
    buildReadyScoreVersion: BUILD_READY_SCORE_VERSION,
    responsiveRiskVersion: RESPONSIVE_RISK_VERSION,
    runId: `p13-${sourceHash}-${cfgHash}`,
    generatedAt,
    source: {
      rootId: root.id,
      rootName: root.name,
      structuralHash: sourceHash,
      configHash: cfgHash,
      analyzerVersion: ANALYZER_VERSION,
    },
    config,
    score: { score: null, status: 'INSUFFICIENT_EVIDENCE', hasHighRisk: false, blockerCount: 0 },
    categories,
    responsiveRisk: { level: 'UNKNOWN', findingCount: 0, highRiskCount: 0, triggeredReferenceWidths: [] },
    findings: [],
    coverage,
    limitations,
  };
}

export function buildBuildReadyReport(
  root: AuditNode,
  configOverrides: Partial<BuildReadyRunConfig> = {},
  generatedAt = new Date().toISOString(),
): BuildReadyReportV2 {
  const config = normalizeConfig(configOverrides);
  const coverage = coverageFor(root);
  const limitations = defaultLimitations();
  if (coverage.scannedNodes === 0 || coverage.scannedNodes > config.maxNodes) {
    if (coverage.scannedNodes > config.maxNodes) {
      limitations.unshift({
        code: 'P13_INPUT_TOO_LARGE',
        detail: `Input contains ${coverage.scannedNodes} visible nodes; configured maximum is ${config.maxNodes}.`,
        consequence: 'INSUFFICIENT_EVIDENCE',
      });
    }
    return insufficientReport(root, config, generatedAt, coverage, limitations);
  }

  const context = { root, config };
  const findings = [
    ...structureFindings(root),
    ...analyzeSafePreparationCandidates(root),
    ...consistencyFindings(root),
    ...handoffFindings(root),
    ...analyzeResponsiveRisk(context),
  ]
    .sort((a, b) =>
      severityRank(b.severity) - severityRank(a.severity)
      || a.ruleId.localeCompare(b.ruleId)
      || a.nodeIds.join('/').localeCompare(b.nodeIds.join('/')),
    )
    .filter((finding, index, all) =>
      all.findIndex((candidate) => candidate.id === finding.id) === index);

  const perRuleCount = new Map<string, number>();
  const boundedFindings = findings.filter((finding) => {
    const count = perRuleCount.get(finding.ruleId) ?? 0;
    if (count >= config.maxFindingsPerRule) return false;
    perRuleCount.set(finding.ruleId, count + 1);
    return true;
  });

  const categories = categoryResults(boundedFindings, coverage, config);
  const score = overallScore(categories, boundedFindings, coverage, config);
  const sourceHash = structuralHash(root);
  const cfgHash = configHash(config);

  return {
    schemaVersion: BUILD_READY_SCHEMA_VERSION,
    buildReadyScoreVersion: BUILD_READY_SCORE_VERSION,
    responsiveRiskVersion: RESPONSIVE_RISK_VERSION,
    runId: `p13-${sourceHash}-${cfgHash}`,
    generatedAt,
    source: {
      rootId: root.id,
      rootName: root.name,
      structuralHash: sourceHash,
      configHash: cfgHash,
      analyzerVersion: ANALYZER_VERSION,
    },
    config,
    score,
    categories,
    responsiveRisk: responsiveSummary(boundedFindings, coverage),
    findings: boundedFindings,
    coverage,
    limitations,
  };
}

export function serializeBuildReadyReportJson(report: BuildReadyReportV2): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
