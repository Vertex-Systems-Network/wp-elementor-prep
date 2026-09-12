import type { P7RuntimeBuildIdentity } from '../core/batch-runtime-evidence';
import type { BuildReadyReportV2 } from '../core/build-ready-types';

export interface P14PreviewFreshnessEvidence {
  pluginVersion: string;
  build: P7RuntimeBuildIdentity;
  buildReady: Pick<BuildReadyReportV2, 'runId' | 'source'>;
}

export interface P14PreviewFreshnessAssessment {
  valid: boolean;
  failures: string[];
}

/**
 * Proves that persisted P13 evidence still represents the exact selected Frame state and the
 * exact compiled plugin build that is asking to render the read-only P14 preview.
 */
export function assessP14PreviewFreshness(
  evidence: P14PreviewFreshnessEvidence,
  currentBuildReady: Pick<BuildReadyReportV2, 'runId' | 'source'>,
  currentPluginVersion: string,
  currentBuild: P7RuntimeBuildIdentity,
): P14PreviewFreshnessAssessment {
  const failures: string[] = [];

  if (evidence.pluginVersion !== currentPluginVersion) {
    failures.push('Persisted P13 evidence belongs to a different plugin version.');
  }
  if (evidence.build.sourceSha !== currentBuild.sourceSha
    || evidence.build.runId !== currentBuild.runId
    || evidence.build.runNumber !== currentBuild.runNumber) {
    failures.push('Persisted P13 evidence belongs to a different compiled plugin build.');
  }

  if (evidence.buildReady.runId !== currentBuildReady.runId) {
    failures.push('Persisted P13 Build-Ready run identity is stale for the selected Frame.');
  }
  if (evidence.buildReady.source.rootId !== currentBuildReady.source.rootId) {
    failures.push('Persisted P13 Build-Ready root identity no longer matches the selected Frame.');
  }
  if (evidence.buildReady.source.structuralHash !== currentBuildReady.source.structuralHash) {
    failures.push('The selected Frame changed after its persisted P13 audit.');
  }
  if (evidence.buildReady.source.configHash !== currentBuildReady.source.configHash) {
    failures.push('Persisted P13 Build-Ready configuration does not match the current preview configuration.');
  }
  if (evidence.buildReady.source.analyzerVersion !== currentBuildReady.source.analyzerVersion) {
    failures.push('Persisted P13 Build-Ready analyzer version does not match the current analyzer.');
  }

  return { valid: failures.length === 0, failures };
}
