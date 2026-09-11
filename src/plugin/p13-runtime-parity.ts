import type { BuildReadyReportV2 } from '../core/build-ready-types';
import type { P13RuntimeEvidenceBundle } from './p13-runtime-evidence';

export interface P13RuntimeParityMismatch {
  path: string;
  plugin: unknown;
  cli: unknown;
}

export interface P13RuntimeParityAssessment {
  schemaVersion: 1;
  acceptanceAuthority: false;
  parityCandidateAccepted: boolean;
  traceablePluginBuild: boolean;
  sameRunIdentity: boolean;
  mismatchCount: number;
  mismatches: P13RuntimeParityMismatch[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * `generatedAt` is runtime metadata, not semantic analyzer output. All other Build-Ready fields,
 * including runId/source/config/rule versions/findings/coverage/limitations, must match exactly.
 */
export function normalizeBuildReadyForParity(report: BuildReadyReportV2): unknown {
  const parsed = JSON.parse(JSON.stringify(report)) as Record<string, unknown>;
  delete parsed.generatedAt;
  return parsed;
}

function collectMismatches(
  plugin: unknown,
  cli: unknown,
  path: string,
  output: P13RuntimeParityMismatch[],
  limit: number,
): void {
  if (output.length >= limit) return;
  if (Object.is(plugin, cli)) return;

  if (Array.isArray(plugin) || Array.isArray(cli)) {
    if (!Array.isArray(plugin) || !Array.isArray(cli)) {
      output.push({ path, plugin, cli });
      return;
    }
    if (plugin.length !== cli.length) {
      output.push({ path: `${path}.length`, plugin: plugin.length, cli: cli.length });
    }
    const length = Math.min(plugin.length, cli.length);
    for (let index = 0; index < length && output.length < limit; index += 1) {
      collectMismatches(plugin[index], cli[index], `${path}[${index}]`, output, limit);
    }
    return;
  }

  if (isRecord(plugin) || isRecord(cli)) {
    if (!isRecord(plugin) || !isRecord(cli)) {
      output.push({ path, plugin, cli });
      return;
    }
    const keys = [...new Set([...Object.keys(plugin), ...Object.keys(cli)])].sort();
    for (const key of keys) {
      if (output.length >= limit) return;
      const next = path ? `${path}.${key}` : key;
      if (!(key in plugin) || !(key in cli)) {
        output.push({ path: next, plugin: plugin[key], cli: cli[key] });
        continue;
      }
      collectMismatches(plugin[key], cli[key], next, output, limit);
    }
    return;
  }

  output.push({ path, plugin, cli });
}

export function compareP13PluginEvidenceToCli(
  evidence: P13RuntimeEvidenceBundle,
  cliReport: BuildReadyReportV2,
  maxMismatches = 50,
): P13RuntimeParityAssessment {
  const mismatches: P13RuntimeParityMismatch[] = [];
  const pluginNormalized = normalizeBuildReadyForParity(evidence.buildReady);
  const cliNormalized = normalizeBuildReadyForParity(cliReport);
  collectMismatches(pluginNormalized, cliNormalized, 'buildReady', mismatches, Math.max(1, maxMismatches));

  const sameRunIdentity = evidence.buildReady.runId === cliReport.runId
    && evidence.buildReady.source.structuralHash === cliReport.source.structuralHash
    && evidence.buildReady.source.configHash === cliReport.source.configHash;
  if (!sameRunIdentity && mismatches.length < maxMismatches) {
    mismatches.unshift({
      path: 'buildReady.runIdentity',
      plugin: {
        runId: evidence.buildReady.runId,
        structuralHash: evidence.buildReady.source.structuralHash,
        configHash: evidence.buildReady.source.configHash,
      },
      cli: {
        runId: cliReport.runId,
        structuralHash: cliReport.source.structuralHash,
        configHash: cliReport.source.configHash,
      },
    });
  }

  return {
    schemaVersion: 1,
    acceptanceAuthority: false,
    parityCandidateAccepted: evidence.traceableBuild && sameRunIdentity && mismatches.length === 0,
    traceablePluginBuild: evidence.traceableBuild,
    sameRunIdentity,
    mismatchCount: mismatches.length,
    mismatches,
  };
}
