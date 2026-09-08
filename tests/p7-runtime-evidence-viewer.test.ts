import { describe, expect, it } from 'vitest';
import type { P7RuntimeEvidenceInspection } from '../src/plugin/p7-runtime-evidence-inspector';
import { buildP7RuntimeEvidenceViewerHtml } from '../src/plugin/p7-runtime-evidence-viewer';

function available(): P7RuntimeEvidenceInspection {
  return {
    status: 'AVAILABLE',
    summary: {
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
  it('renders retained acceptance and both copy surfaces without trusting evidence HTML', () => {
    const html = buildP7RuntimeEvidenceViewerHtml(available());
    expect(html).toContain('Runtime acceptance: FAIL');
    expect(html).toContain('60+ completed stress evidence');
    expect(html).toContain('active-frame cancellation evidence');
    expect(html).toContain('Cancellation evidence &lt;unsafe&gt; needs a longer active processor.');
    expect(html).toContain('Copy acceptance bundle');
    expect(html).toContain('Copy latest bounded JSON');
    expect(html).toContain('&lt;unsafe&gt;');
    expect(html).toContain('Persisted P7 Runtime Evidence');
    expect(html).toContain('60');
    expect(html).toContain('unsupported in this runtime');
    expect(html).toContain('Example &lt;unsafe&gt; warning');
    expect(html).not.toContain('</pre><script>bad()</script>');
    expect(html).toContain('&lt;/pre&gt;&lt;script&gt;bad()&lt;/script&gt;');
  });

  it('renders PASS when both retained runtime scenarios satisfy acceptance', () => {
    const inspection = available();
    if (inspection.status !== 'AVAILABLE') throw new Error('expected available inspection');
    const html = buildP7RuntimeEvidenceViewerHtml({
      ...inspection,
      acceptance: {
        accepted: true,
        failures: [],
        stressEvidenceAvailable: true,
        cancellationEvidenceAvailable: true,
      },
      acceptanceJson: '{"schemaVersion":1,"accepted":true,"failures":[]}',
    });
    expect(html).toContain('Runtime acceptance: PASS');
    expect(html).toContain('Copy acceptance bundle');
  });

  it('renders exportable acceptance failures even when no valid latest evidence exists', () => {
    const html = buildP7RuntimeEvidenceViewerHtml({
      status: 'EMPTY',
      message: 'No evidence <yet>',
      acceptance: {
        accepted: false,
        failures: ['60+ completed stress evidence is missing.'],
        stressEvidenceAvailable: false,
        cancellationEvidenceAvailable: false,
      },
      acceptanceJson: '{"schemaVersion":1,"accepted":false,"stress":null,"cancellation":null}',
    });
    expect(html).toContain('Runtime acceptance: FAIL');
    expect(html).toContain('60+ completed stress evidence is missing.');
    expect(html).toContain('No evidence &lt;yet&gt;');
    expect(html).toContain('Copy acceptance bundle');
    expect(html).not.toContain('Copy latest bounded JSON');
  });
});
