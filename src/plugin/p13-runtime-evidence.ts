import type { P7RuntimeBuildIdentity } from '../core/batch-runtime-evidence';
import { serializeBuildReadyReportJson } from '../core/build-ready';
import {
  BUILD_READY_ANALYZER_VERSION,
  matchesCurrentBuildReadyRunIdentity,
} from '../core/build-ready-identity';
import type { BuildReadyReportV2 } from '../core/build-ready-types';
import type { AuditReport } from '../core/types';

export const P13_RUNTIME_EVIDENCE_SCHEMA_VERSION = 1 as const;
export const P13_RUNTIME_EVIDENCE_STORAGE_KEY = 'p13-runtime-evidence-v1';
export const P13_RUNTIME_EVIDENCE_MAX_BYTES = 512_000;

export interface P13RuntimeEvidenceContext {
  fileKey: string;
  pageId: string;
  pageName: string;
  frameId: string;
  frameName: string;
}

export interface P13RuntimeAuditSummary {
  schemaVersion: 1;
  generatedAt: string;
  score: number;
  status: AuditReport['status'];
  root: {
    id: string;
    name: string;
    width: number;
    height: number;
  };
  stats: AuditReport['stats'];
  findingCodes: string[];
}

export interface P13RuntimeEvidenceBundle {
  schemaVersion: typeof P13_RUNTIME_EVIDENCE_SCHEMA_VERSION;
  acceptanceAuthority: false;
  capturedAt: string;
  pluginVersion: string;
  build: P7RuntimeBuildIdentity;
  traceableBuild: boolean;
  realFigmaContext: boolean;
  context: P13RuntimeEvidenceContext;
  audit: P13RuntimeAuditSummary;
  buildReady: BuildReadyReportV2;
  buildReadyJson: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isTraceableP13BuildIdentity(build: P7RuntimeBuildIdentity): boolean {
  return /^[0-9a-f]{40}$/i.test(build.sourceSha)
    && /^\d+$/.test(build.runId)
    && /^\d+$/.test(build.runNumber);
}

export function isRealP13FigmaContext(context: P13RuntimeEvidenceContext): boolean {
  return context.fileKey.length > 0 && context.fileKey !== 'local-file';
}

export function utf8ByteLength(value: string): number {
  let bytes = 0;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff && index + 1 < value.length) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        index += 1;
      } else bytes += 3;
    } else bytes += 3;
  }
  return bytes;
}

function auditSummary(report: AuditReport): P13RuntimeAuditSummary {
  return {
    schemaVersion: 1,
    generatedAt: report.generatedAt,
    score: report.score,
    status: report.status,
    root: {
      id: report.root.id,
      name: report.root.name,
      width: report.root.width,
      height: report.root.height,
    },
    stats: { ...report.stats },
    findingCodes: report.findings.map((finding) => finding.code).sort(),
  };
}

/**
 * Build a read-only P13 evidence record from the exact report produced inside the plugin runtime.
 * The record deliberately carries no mutation/release authority. The serialized Build-Ready JSON
 * is recomputed here rather than accepted from a caller so evidence cannot contain contradictory
 * object/string representations.
 */
export function buildP13RuntimeEvidenceBundle(input: {
  pluginVersion: string;
  build: P7RuntimeBuildIdentity;
  context: P13RuntimeEvidenceContext;
  audit: AuditReport;
  buildReady: BuildReadyReportV2;
  capturedAt?: string;
}): P13RuntimeEvidenceBundle {
  return {
    schemaVersion: P13_RUNTIME_EVIDENCE_SCHEMA_VERSION,
    acceptanceAuthority: false,
    capturedAt: input.capturedAt ?? new Date().toISOString(),
    pluginVersion: input.pluginVersion,
    build: { ...input.build },
    traceableBuild: isTraceableP13BuildIdentity(input.build),
    realFigmaContext: isRealP13FigmaContext(input.context),
    context: { ...input.context },
    audit: auditSummary(input.audit),
    buildReady: input.buildReady,
    buildReadyJson: serializeBuildReadyReportJson(input.buildReady),
  };
}

export function serializeP13RuntimeEvidenceJson(bundle: P13RuntimeEvidenceBundle): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function validateP13RuntimeEvidence(value: unknown): { valid: boolean; reason: string | null } {
  if (!isRecord(value)) return { valid: false, reason: 'Evidence must be an object.' };
  if (value.schemaVersion !== P13_RUNTIME_EVIDENCE_SCHEMA_VERSION) {
    return { valid: false, reason: 'Unsupported P13 runtime evidence schema version.' };
  }
  if (value.acceptanceAuthority !== false) {
    return { valid: false, reason: 'P13 runtime evidence must explicitly carry no acceptance authority.' };
  }
  if (typeof value.capturedAt !== 'string' || Number.isNaN(Date.parse(value.capturedAt))) {
    return { valid: false, reason: 'capturedAt must be a valid timestamp.' };
  }
  if (typeof value.pluginVersion !== 'string' || value.pluginVersion.length === 0) {
    return { valid: false, reason: 'pluginVersion is missing.' };
  }

  const build = value.build;
  if (!isRecord(build)
    || typeof build.sourceSha !== 'string'
    || typeof build.runId !== 'string'
    || typeof build.runNumber !== 'string') {
    return { valid: false, reason: 'Compiled build identity is missing or malformed.' };
  }
  const computedTraceable = isTraceableP13BuildIdentity(build as unknown as P7RuntimeBuildIdentity);
  if (value.traceableBuild !== computedTraceable) {
    return { valid: false, reason: 'traceableBuild contradicts the compiled build identity.' };
  }

  const context = value.context;
  if (!isRecord(context)) return { valid: false, reason: 'Figma runtime context is missing.' };
  for (const field of ['fileKey', 'pageId', 'pageName', 'frameId', 'frameName'] as const) {
    if (typeof context[field] !== 'string' || context[field].length === 0) {
      return { valid: false, reason: `Runtime context field ${field} is missing.` };
    }
  }
  const computedRealContext = isRealP13FigmaContext(context as unknown as P13RuntimeEvidenceContext);
  if (value.realFigmaContext !== computedRealContext) {
    return { valid: false, reason: 'realFigmaContext contradicts the captured runtime context.' };
  }

  const audit = value.audit;
  if (!isRecord(audit)
    || audit.schemaVersion !== 1
    || !finiteNumber(audit.score)
    || typeof audit.status !== 'string'
    || !isRecord(audit.root)
    || !isRecord(audit.stats)
    || !Array.isArray(audit.findingCodes)) {
    return { valid: false, reason: 'Audit-v1 summary is missing or malformed.' };
  }

  const buildReady = value.buildReady;
  if (!isRecord(buildReady)
    || buildReady.schemaVersion !== 1
    || buildReady.buildReadyScoreVersion !== 2
    || buildReady.responsiveRiskVersion !== 1
    || typeof buildReady.runId !== 'string'
    || !isRecord(buildReady.source)
    || !isRecord(buildReady.score)
    || !Array.isArray(buildReady.categories)
    || !Array.isArray(buildReady.findings)
    || !isRecord(buildReady.coverage)
    || !Array.isArray(buildReady.limitations)) {
    return { valid: false, reason: 'Build-Ready report is missing or malformed.' };
  }
  if (buildReady.source.analyzerVersion !== BUILD_READY_ANALYZER_VERSION) {
    return { valid: false, reason: `Unsupported Build-Ready analyzer version; expected ${BUILD_READY_ANALYZER_VERSION}.` };
  }
  if (!matchesCurrentBuildReadyRunIdentity({
    runId: buildReady.runId,
    structuralHash: buildReady.source.structuralHash,
    configHash: buildReady.source.configHash,
    analyzerVersion: buildReady.source.analyzerVersion,
  })) {
    return { valid: false, reason: 'Build-Ready runId contradicts the exact source/config/analyzer identity.' };
  }
  if (buildReady.source.rootId !== context.frameId || buildReady.source.rootName !== context.frameName) {
    return { valid: false, reason: 'Build-Ready source identity does not match the captured Figma frame.' };
  }
  if (typeof value.buildReadyJson !== 'string') {
    return { valid: false, reason: 'Serialized Build-Ready JSON is missing.' };
  }
  const canonical = serializeBuildReadyReportJson(buildReady as unknown as BuildReadyReportV2);
  if (value.buildReadyJson !== canonical) {
    return { valid: false, reason: 'Serialized Build-Ready JSON contradicts the captured report.' };
  }

  const bytes = utf8ByteLength(JSON.stringify(value));
  if (bytes > P13_RUNTIME_EVIDENCE_MAX_BYTES) {
    return { valid: false, reason: `Evidence exceeds the ${P13_RUNTIME_EVIDENCE_MAX_BYTES}-byte bound.` };
  }
  return { valid: true, reason: null };
}
