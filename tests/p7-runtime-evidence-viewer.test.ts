import { describe, expect, it } from 'vitest';
import type { P7RuntimeEvidenceInspection } from '../src/plugin/p7-runtime-evidence-inspector';
import { buildP7RuntimeEvidenceViewerHtml } from '../src/plugin/p7-runtime-evidence-viewer';

const BUILD = {
  sourceSha: '0123456789abcdef0123456789abcdef01234567',
  runId: '34217708751',
  runNumber: '292',
};

function available(): P7RuntimeEvidenceInspection {
  return {
    status: 'AVAILABLE',
    summary: {
      buildSourceSha: BUILD.sourceSha,
      buildRunId: BUILD.runId,
      buildRunNumber: BUILD.runNumber,
      runKey: 'run-key',
      startedAt: '2026-09-08T01:00:00.000Z',
      elapsedMs: 12000,
      segmentCount: 2,
      recordedAttemptCount: 60,
      totalProcessorMs: 9500,
      maxConcurrentProcessors: 1,
      checkpointPauseCount: 3,
      checkpointResolutionCount: 3,
      cancellationRequested: true,
      cancellationSettled: true,
      finalStatus: 'CANCELLED',
      finalFinishedCount: 59,
      finalTotalCount: 60,
      memorySamplingSupported: false,
      memorySampleCount: 0,
      observedPeakUsedJsHeapBytesAtSamplePoints: null,
      attemptEvidenceTruncated: false,
      checkpointEvidenceTruncated: false,
    },
    closure: {
      accepted: false,
      failures: ['P5 prerequisite <unsafe> is not valid for this build.'],
      p5PrerequisiteValid: false,
      p5ProofPassedAt: null,
      currentBuildTraceable: true,
      runtimeEvidenceMatchesCurrentBuild: true,
    },
    closureJson: '{"schemaVersion":1,"accepted":false,"currentBuild":{"sourceSha":"<unsafe>"}}',
    acceptance: {
      accepted: false,
      failures: ['Cancellation evidence <unsafe> needs a longer active processor.'],
      stressEvidenceAvailable: true,
      cancellationEvidenceAvailable: true,
    },
    acceptanceJson: '{"schemaVersion":1,"accepted":false,"stress":{"frame":"<unsafe>"},"cancellation":{}}',
    warnings: ['Example <unsafe> warning'],
    snapshot: {} as never,
    json: '{"frameName":"</pre><script>bad()</script>"}',
  };
}

describe('P7 runtime evidence viewer', () => {
  it('renders closure + runtime acceptance, visible build provenance and copy surfaces without trusting evidence HTML', () => {
    const html = buildP7RuntimeEvidenceViewerHtml(available());
    expect(html).toContain('Closure acceptance: FAIL');
    expect(html).toContain('P5 exact-build prerequisite');
    expect(html).toContain('runtime evidence = current build');
    expect(html).toContain('P5 prerequisite &lt;unsafe&gt; is not valid for this build.');
    expect(html).toContain('Copy closure bundle');
    expect(html).toContain('Runtime acceptance: FAIL');
    expect(html).toContain('60+ completed stress evidence');
    expect(html).toContain('active-frame cancellation evidence');
    expect(html).toContain('Cancellation evidence &lt;unsafe&gt; needs a longer active processor.');
    expect(html).toContain('Copy runtime acceptance bundle');
    expect(html).toContain('Copy latest bounded JSON');
    expect(html).toContain('&lt;unsafe&gt;');
    expect(html).toContain('Persisted P7 Runtime Evidence');
    expect(html).toContain('build source SHA');
    expect(html).toContain(BUILD.sourceSha);
    expect(html).toContain('Actions run #');
    expect(html).toContain(BUILD.runNumber);
    expect(html).toContain('Actions run id');
    expect(html).toContain(BUILD.runId);
    expect(html).toContain('60');
    expect(html).toContain('unsupported in this runtime');
    expect(html).toContain('Example &lt;unsafe&gt; warning');
    expect(html).not.toContain('</pre><script>bad()</script>');
    expect(html).toContain('&lt;/pre&gt;&lt;script&gt;bad()&lt;/script&gt;');
  });

  it('renders final closure PASS only when both runtime and exact-build P5 prerequisite pass', () => {
    const inspection = available();
    if (inspection.status !== 'AVAILABLE') throw new Error('expected available inspection');
    const html = buildP7RuntimeEvidenceViewerHtml({
      ...inspection,
      closure: {
        accepted: true,
        failures: [],
        p5PrerequisiteValid: true,
        p5ProofPassedAt: '2026-09-08T00:59:00.000Z',
        currentBuildTraceable: true,
        runtimeEvidenceMatchesCurrentBuild: true,
      },
      closureJson: '{"schemaVersion":1,"accepted":true,"failures":[]}',
      acceptance: {
        accepted: true,
        failures: [],
        stressEvidenceAvailable: true,
        cancellationEvidenceAvailable: true,
      },
      acceptanceJson: '{"schemaVersion":1,"accepted":true,"failures":[]}',
    });
    expect(html).toContain('Closure acceptance: PASS');
    expect(html).toContain('Runtime acceptance: PASS');
    expect(html).toContain('Copy closure bundle');
  });

  it('renders exportable closure/runtime failures even when no valid latest evidence exists', () => {
    const html = buildP7RuntimeEvidenceViewerHtml({
      status: 'EMPTY',
      message: 'No evidence <yet>',
      closure: {
        accepted: false,
        failures: ['P5 exact-build prerequisite is missing.'],
        p5PrerequisiteValid: false,
        p5ProofPassedAt: null,
        currentBuildTraceable: true,
        runtimeEvidenceMatchesCurrentBuild: false,
      },
      closureJson: '{"schemaVersion":1,"accepted":false}',
      acceptance: {
        accepted: false,
        failures: ['60+ completed stress evidence is missing.'],
        stressEvidenceAvailable: false,
        cancellationEvidenceAvailable: false,
      },
      acceptanceJson: '{"schemaVersion":1,"accepted":false,"stress":null,"cancellation":null}',
    });
    expect(html).toContain('Closure acceptance: FAIL');
    expect(html).toContain('P5 exact-build prerequisite is missing.');
    expect(html).toContain('Runtime acceptance: FAIL');
    expect(html).toContain('60+ completed stress evidence is missing.');
    expect(html).toContain('No evidence &lt;yet&gt;');
    expect(html).toContain('Copy closure bundle');
    expect(html).toContain('Copy runtime acceptance bundle');
    expect(html).not.toContain('Copy latest bounded JSON');
  });
});
