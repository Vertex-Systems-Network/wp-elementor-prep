import { describe, expect, it } from 'vitest';
import type { P7RuntimeBuildIdentity } from '../src/core/batch-runtime-evidence';
import type { BuildReadyReportV2 } from '../src/core/build-ready-types';
import {
  assessP14PreviewFreshness,
  type P14PreviewFreshnessEvidence,
} from '../src/plugin/p14-preview-freshness';

const currentBuild: P7RuntimeBuildIdentity = {
  sourceSha: 'a'.repeat(40),
  runId: '12345',
  runNumber: '67',
};

function source(overrides: Partial<BuildReadyReportV2['source']> = {}): BuildReadyReportV2['source'] {
  return {
    rootId: 'frame-1',
    rootName: 'Desktop — Original',
    structuralHash: 'struct-1',
    configHash: 'config-1',
    analyzerVersion: 'p13-core-v1',
    ...overrides,
  };
}

function report(overrides: {
  runId?: string;
  source?: Partial<BuildReadyReportV2['source']>;
} = {}): Pick<BuildReadyReportV2, 'runId' | 'source'> {
  return {
    runId: overrides.runId ?? 'p13-struct-1-config-1',
    source: source(overrides.source),
  };
}

function evidence(overrides: {
  pluginVersion?: string;
  build?: Partial<P7RuntimeBuildIdentity>;
  runId?: string;
  source?: Partial<BuildReadyReportV2['source']>;
} = {}): P14PreviewFreshnessEvidence {
  return {
    pluginVersion: overrides.pluginVersion ?? '0.1.0-alpha.1',
    build: { ...currentBuild, ...overrides.build },
    buildReady: report({ runId: overrides.runId, source: overrides.source }),
  };
}

describe('P14 Guided Prepare preview evidence freshness', () => {
  it('accepts exact current-build and current-Frame fingerprint evidence', () => {
    expect(assessP14PreviewFreshness(
      evidence(),
      report(),
      '0.1.0-alpha.1',
      currentBuild,
    )).toEqual({ valid: true, failures: [] });
  });

  it.each([
    [{ runId: 'p13-stale-config-1' }, 'run identity'],
    [{ source: { rootId: 'frame-2' } }, 'root identity'],
    [{ source: { structuralHash: 'struct-2' } }, 'selected Frame changed'],
    [{ source: { configHash: 'config-2' } }, 'configuration'],
    [{ source: { analyzerVersion: 'p13-core-v2' } }, 'analyzer version'],
  ] as Array<[
    { runId?: string; source?: Partial<BuildReadyReportV2['source']> },
    string,
  ]>)('rejects stale Build-Ready evidence %#', (override, expectedFailure) => {
    const result = assessP14PreviewFreshness(
      evidence(override),
      report(),
      '0.1.0-alpha.1',
      currentBuild,
    );
    expect(result.valid).toBe(false);
    expect(result.failures.some((failure) => failure.includes(expectedFailure))).toBe(true);
  });

  it('rejects evidence from a different plugin version', () => {
    const result = assessP14PreviewFreshness(
      evidence({ pluginVersion: '0.0.9' }),
      report(),
      '0.1.0-alpha.1',
      currentBuild,
    );
    expect(result.valid).toBe(false);
    expect(result.failures.some((failure) => failure.includes('different plugin version'))).toBe(true);
  });

  it.each([
    { sourceSha: 'b'.repeat(40) },
    { runId: '99999' },
    { runNumber: '99' },
  ])('rejects evidence from a different compiled build %#', (buildOverride) => {
    const result = assessP14PreviewFreshness(
      evidence({ build: buildOverride }),
      report(),
      '0.1.0-alpha.1',
      currentBuild,
    );
    expect(result.valid).toBe(false);
    expect(result.failures.some((failure) => failure.includes('different compiled plugin build'))).toBe(true);
  });
});
