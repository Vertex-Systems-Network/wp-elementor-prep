import type { AuditFinding, AuditReport, FindingSeverity, SectionAudit } from './types';

export type BacklogCategory = 'ERROR' | 'WARNING' | 'INFO' | 'IMPROVEMENT';
export type BacklogSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type BacklogPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type BacklogStatus = 'OPEN' | 'RESOLVED' | 'REGRESSED' | 'ACCEPTED_RISK';
export type BacklogDelta = 'NEW' | 'RESOLVED' | 'REGRESSED' | 'UNCHANGED';
export type BacklogSource = 'AUDIT' | 'RUNTIME';
export type BacklogEvidenceValue = string | number | boolean | null;

export interface BacklogContext {
  fileKey?: string;
  pageId?: string;
  pageName?: string;
  frameId?: string;
  frameName?: string;
  sectionId?: string;
  sectionName?: string;
  nodeId?: string;
  nodeName?: string;
}

export interface BacklogEvidence {
  context: BacklogContext;
  values: Record<string, BacklogEvidenceValue>;
  confidence: number | null;
}

export interface BacklogItem {
  id: string;
  fingerprint: string;
  category: BacklogCategory;
  severity: BacklogSeverity;
  priority: BacklogPriority;
  status: BacklogStatus;
  delta: BacklogDelta;
  source: BacklogSource;
  code: string;
  title: string;
  explanation: string;
  proposedAction: string;
  recipeCandidate: string | null;
  autoFixEligible: boolean;
  confidence: number | null;
  firstSeen: string;
  lastSeen: string;
  occurrences: number;
  contexts: BacklogContext[];
  evidence: BacklogEvidence[];
}

export interface BacklogSummary {
  total: number;
  active: number;
  byCategory: Record<BacklogCategory, number>;
  byStatus: Record<BacklogStatus, number>;
  byDelta: Record<BacklogDelta, number>;
}

export interface BacklogDocument {
  schemaVersion: 1;
  generatedAt: string;
  sourceAudit: {
    schemaVersion: number;
    pluginVersion: string;
    rootId: string;
    rootName: string;
    score: number;
    status: string;
  };
  summary: BacklogSummary;
  items: BacklogItem[];
}

export interface RuntimeBacklogFinding {
  code: string;
  category?: BacklogCategory;
  severity?: BacklogSeverity;
  priority?: BacklogPriority;
  title: string;
  explanation: string;
  proposedAction: string;
  recipeCandidate?: string | null;
  autoFixEligible?: boolean;
  confidence?: number | null;
  context?: BacklogContext;
  evidence?: Record<string, BacklogEvidenceValue>;
}

export interface GenerateBacklogOptions {
  context?: Omit<BacklogContext, 'frameId' | 'frameName' | 'sectionId' | 'sectionName' | 'nodeId' | 'nodeName'>;
  runtimeFindings?: RuntimeBacklogFinding[];
  previous?: BacklogDocument | null;
}

interface BacklogDraft {
  category: BacklogCategory;
  severity: BacklogSeverity;
  priority: BacklogPriority;
  source: BacklogSource;
  code: string;
  title: string;
  explanation: string;
  proposedAction: string;
  recipeCandidate: string | null;
  autoFixEligible: boolean;
  confidence: number | null;
  context: BacklogContext;
  evidence: Record<string, BacklogEvidenceValue>;
}

const CATEGORY_ORDER: Record<BacklogCategory, number> = {
  ERROR: 0,
  WARNING: 1,
  IMPROVEMENT: 2,
  INFO: 3,
};

const PRIORITY_ORDER: Record<BacklogPriority, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
};

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function fnv1a32(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function fingerprintFor(draft: BacklogDraft): string {
  // Deliberately exclude volatile Figma IDs, timestamps and evidence values so the same
  // semantic finding remains stable when repeated in another section/frame or later run.
  const semanticIdentity = [
    draft.category,
    draft.code,
    normalizeText(draft.title),
    normalizeText(draft.proposedAction),
    normalizeText(draft.recipeCandidate ?? ''),
  ].join('|');
  // Two deterministic 32-bit passes make accidental collisions far less likely while keeping
  // the implementation browser/Node portable without crypto or BigInt dependencies.
  const forward = fnv1a32(semanticIdentity);
  const reverse = fnv1a32([...semanticIdentity].reverse().join(''));
  return `p9-${forward}${reverse}`;
}

function contextKey(context: BacklogContext): string {
  return [
    context.fileKey ?? '',
    context.pageId ?? '',
    context.frameId ?? '',
    context.sectionId ?? '',
    context.nodeId ?? '',
    context.pageName ?? '',
    context.frameName ?? '',
    context.sectionName ?? '',
    context.nodeName ?? '',
  ].join('|');
}

function evidenceKey(evidence: BacklogEvidence): string {
  const values = Object.keys(evidence.values)
    .sort()
    .map((key) => `${key}=${String(evidence.values[key])}`)
    .join('|');
  return `${contextKey(evidence.context)}|${evidence.confidence ?? ''}|${values}`;
}

function categoryForFinding(severity: FindingSeverity): BacklogCategory {
  if (severity === 'error') return 'ERROR';
  if (severity === 'warning') return 'WARNING';
  return 'INFO';
}

function severityForCategory(category: BacklogCategory): BacklogSeverity {
  if (category === 'ERROR') return 'HIGH';
  if (category === 'WARNING' || category === 'IMPROVEMENT') return 'MEDIUM';
  return 'LOW';
}

function priorityForCategory(category: BacklogCategory): BacklogPriority {
  if (category === 'ERROR') return 'P1';
  if (category === 'WARNING' || category === 'IMPROVEMENT') return 'P2';
  return 'P3';
}

function actionForFinding(finding: AuditFinding): string {
  switch (finding.code) {
    case 'LOW_AUTO_LAYOUT_COVERAGE':
      return 'Classify manual containers and convert only high-confidence normal-flow structures to safe Auto Layout recipes.';
    case 'PARTIAL_AUTO_LAYOUT_COVERAGE':
      return 'Review remaining manual containers and preserve intentional overlays or absolute-positioned visual roles.';
    case 'GENERIC_LAYER_NAMES':
      return 'Improve semantic layer naming where it aids maintainability; never use names as the sole mutation signal.';
    case 'TEXT_REFLOW_RISK':
      return 'Review fixed-height text behavior and prefer safe auto-height text only where content/layout evidence supports it.';
    case 'ABSOLUTE_POSITIONING_PRESENT':
      return 'Classify absolute-positioned nodes as content, overlay, decoration or background before proposing any normalization.';
    case 'NO_MAJOR_SCREENING_ISSUES':
      return 'Keep the current structure under observation; no automatic change is required from this screening signal.';
    default:
      return 'Review the finding evidence and choose the least invasive deterministic correction that preserves visual output.';
  }
}

function baseContext(report: AuditReport, context?: GenerateBacklogOptions['context']): BacklogContext {
  return {
    ...context,
    frameId: report.root.id,
    frameName: report.root.name,
  };
}

function findingDraft(finding: AuditFinding, context: BacklogContext): BacklogDraft {
  const category = categoryForFinding(finding.severity);
  return {
    category,
    severity: severityForCategory(category),
    priority: priorityForCategory(category),
    source: 'AUDIT',
    code: finding.code,
    title: finding.title,
    explanation: finding.detail,
    proposedAction: actionForFinding(finding),
    recipeCandidate: null,
    autoFixEligible: false,
    confidence: null,
    context,
    evidence: finding.evidence,
  };
}

function recipeDraft(section: SectionAudit, context: BacklogContext): BacklogDraft | null {
  if (!section.recommendedRecipe) return null;
  const detection = section.detection;
  const label = detection?.semanticHint ?? detection?.pattern ?? 'structured layout';
  return {
    category: 'IMPROVEMENT',
    severity: 'MEDIUM',
    priority: 'P2',
    source: 'AUDIT',
    code: 'ELEMENTOR_RECIPE_CANDIDATE',
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
      pattern: detection?.pattern ?? 'unknown',
      confidence: detection?.confidence ?? 0,
    },
  };
}

function runtimeDraft(finding: RuntimeBacklogFinding, fallbackContext: BacklogContext): BacklogDraft {
  const category = finding.category ?? 'ERROR';
  return {
    category,
    severity: finding.severity ?? severityForCategory(category),
    priority: finding.priority ?? priorityForCategory(category),
    source: 'RUNTIME',
    code: finding.code,
    title: finding.title,
    explanation: finding.explanation,
    proposedAction: finding.proposedAction,
    recipeCandidate: finding.recipeCandidate ?? null,
    autoFixEligible: finding.autoFixEligible ?? false,
    confidence: finding.confidence ?? null,
    context: { ...fallbackContext, ...finding.context },
    evidence: finding.evidence ?? {},
  };
}

function collectDrafts(report: AuditReport, options: GenerateBacklogOptions): BacklogDraft[] {
  const frameContext = baseContext(report, options.context);
  const drafts: BacklogDraft[] = report.findings.map((finding) => findingDraft(finding, frameContext));

  for (const section of report.sections) {
    const sectionContext: BacklogContext = {
      ...frameContext,
      sectionId: section.id,
      sectionName: section.name,
    };
    for (const finding of section.findings) drafts.push(findingDraft(finding, sectionContext));
    const recipe = recipeDraft(section, sectionContext);
    if (recipe) drafts.push(recipe);
  }

  for (const runtimeFinding of options.runtimeFindings ?? []) {
    drafts.push(runtimeDraft(runtimeFinding, frameContext));
  }

  return drafts;
}

function aggregateDrafts(drafts: BacklogDraft[], observedAt: string): BacklogItem[] {
  const items = new Map<string, BacklogItem>();

  for (const draft of drafts) {
    const fingerprint = fingerprintFor(draft);
    const existing = items.get(fingerprint);
    const evidence: BacklogEvidence = {
      context: draft.context,
      values: draft.evidence,
      confidence: draft.confidence,
    };

    if (!existing) {
      items.set(fingerprint, {
        id: `BLG-${fingerprint.slice(3).toUpperCase()}`,
        fingerprint,
        category: draft.category,
        severity: draft.severity,
        priority: draft.priority,
        status: 'OPEN',
        delta: 'NEW',
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
        evidence: [evidence],
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
      existing.confidence = existing.confidence === null
        ? draft.confidence
        : Math.max(existing.confidence, draft.confidence);
    }
    existing.autoFixEligible = existing.autoFixEligible && draft.autoFixEligible;
    if (existing.source !== draft.source) existing.source = 'RUNTIME';
  }

  return [...items.values()];
}

function applyDelta(current: BacklogItem[], previous: BacklogDocument | null | undefined): BacklogItem[] {
  if (!previous) return current;

  const previousByFingerprint = new Map(previous.items.map((item) => [item.fingerprint, item]));
  const currentFingerprints = new Set(current.map((item) => item.fingerprint));
  const result = current.map((item) => {
    const before = previousByFingerprint.get(item.fingerprint);
    if (!before) return item;

    const regressed = before.status === 'RESOLVED';
    return {
      ...item,
      firstSeen: before.firstSeen,
      status: regressed ? 'REGRESSED' as const : before.status === 'ACCEPTED_RISK' ? 'ACCEPTED_RISK' as const : 'OPEN' as const,
      delta: regressed ? 'REGRESSED' as const : 'UNCHANGED' as const,
    };
  });

  for (const before of previous.items) {
    if (currentFingerprints.has(before.fingerprint)) continue;
    if (before.status === 'RESOLVED') {
      // Retain resolved history so a finding that returns after multiple clean runs is
      // classified as REGRESSED instead of being forgotten and reintroduced as NEW.
      result.push({
        ...before,
        delta: 'UNCHANGED',
        occurrences: 0,
      });
      continue;
    }
    result.push({
      ...before,
      status: 'RESOLVED',
      delta: 'RESOLVED',
      occurrences: 0,
    });
  }

  return result;
}

function sortItems(items: BacklogItem[]): BacklogItem[] {
  return [...items].sort((a, b) => {
    const category = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    if (category !== 0) return category;
    const priority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priority !== 0) return priority;
    const code = a.code.localeCompare(b.code);
    return code !== 0 ? code : a.fingerprint.localeCompare(b.fingerprint);
  });
}

function zeroRecord<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
}

function summarize(items: BacklogItem[]): BacklogSummary {
  const byCategory = zeroRecord(['ERROR', 'WARNING', 'INFO', 'IMPROVEMENT'] as const);
  const byStatus = zeroRecord(['OPEN', 'RESOLVED', 'REGRESSED', 'ACCEPTED_RISK'] as const);
  const byDelta = zeroRecord(['NEW', 'RESOLVED', 'REGRESSED', 'UNCHANGED'] as const);

  for (const item of items) {
    byCategory[item.category] += 1;
    byStatus[item.status] += 1;
    byDelta[item.delta] += 1;
  }

  return {
    total: items.length,
    active: items.filter((item) => item.status !== 'RESOLVED').length,
    byCategory,
    byStatus,
    byDelta,
  };
}

export function generateBacklog(report: AuditReport, options: GenerateBacklogOptions = {}): BacklogDocument {
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
      status: report.status,
    },
    summary: summarize(items),
    items,
  };
}

export function serializeBacklogJson(backlog: BacklogDocument): string {
  return `${JSON.stringify(backlog, null, 2)}\n`;
}

function markdownCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

export function serializeBacklogMarkdown(backlog: BacklogDocument): string {
  const lines = [
    '# Elementor Prep Backlog',
    '',
    `Generated: ${backlog.generatedAt}`,
    `Source: ${backlog.sourceAudit.rootName} · score ${backlog.sourceAudit.score} · ${backlog.sourceAudit.status}`,
    '',
    '## Summary',
    '',
    `- Active: ${backlog.summary.active}`,
    `- ERROR: ${backlog.summary.byCategory.ERROR}`,
    `- WARNING: ${backlog.summary.byCategory.WARNING}`,
    `- IMPROVEMENT: ${backlog.summary.byCategory.IMPROVEMENT}`,
    `- INFO: ${backlog.summary.byCategory.INFO}`,
    `- New / resolved / regressed / unchanged: ${backlog.summary.byDelta.NEW} / ${backlog.summary.byDelta.RESOLVED} / ${backlog.summary.byDelta.REGRESSED} / ${backlog.summary.byDelta.UNCHANGED}`,
    '',
    '## Items',
    '',
    '| ID | Category | Priority | Status | Delta | Code | Occurrences | Title | Proposed action |',
    '|---|---|---|---|---|---|---:|---|---|',
    ...backlog.items.map((item) => [
      item.id,
      item.category,
      item.priority,
      item.status,
      item.delta,
      item.code,
      String(item.occurrences),
      markdownCell(item.title),
      markdownCell(item.proposedAction),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |')),
    '',
  ];
  return `${lines.join('\n')}\n`;
}
