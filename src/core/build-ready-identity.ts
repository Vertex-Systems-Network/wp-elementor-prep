export const BUILD_READY_ANALYZER_VERSION = 'p13-core-v2' as const;

export interface BuildReadyRunIdentityInput {
  structuralHash: string;
  configHash: string;
  analyzerVersion: string;
}

/**
 * Deterministic semantic identity for one P13 Build-Ready analysis.
 * generatedAt and runtime/build metadata are intentionally excluded; analyzer semantics are not.
 */
export function buildBuildReadyRunId(input: BuildReadyRunIdentityInput): string {
  return `p13-${input.structuralHash}-${input.configHash}-${input.analyzerVersion}`;
}

export function isCurrentBuildReadyAnalyzerVersion(value: unknown): value is typeof BUILD_READY_ANALYZER_VERSION {
  return value === BUILD_READY_ANALYZER_VERSION;
}

export function matchesCurrentBuildReadyRunIdentity(input: {
  runId: unknown;
  structuralHash: unknown;
  configHash: unknown;
  analyzerVersion: unknown;
}): boolean {
  if (typeof input.runId !== 'string'
    || typeof input.structuralHash !== 'string'
    || typeof input.configHash !== 'string'
    || !isCurrentBuildReadyAnalyzerVersion(input.analyzerVersion)) {
    return false;
  }

  return input.runId === buildBuildReadyRunId({
    structuralHash: input.structuralHash,
    configHash: input.configHash,
    analyzerVersion: input.analyzerVersion,
  });
}
