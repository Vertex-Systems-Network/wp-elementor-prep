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
    warnings: ['Example <unsafe> warning'],
    snapshot: {} as never,
    json: '{"frameName":"</pre><script>bad()</script>"}',
  };
}

describe('P7 runtime evidence viewer', () => {
  it('renders a copyable bounded evidence view without trusting evidence HTML', () => {
    const html = buildP7RuntimeEvidenceViewerHtml(available());
    expect(html).toContain('Persisted P7 Runtime Evidence');
    expect(html).toContain('Copy bounded JSON');
    expect(html).toContain('60');
    expect(html).toContain('unsupported in this runtime');
    expect(html).toContain('Example &lt;unsafe&gt; warning');
    expect(html).not.toContain('</pre><script>bad()</script>');
    expect(html).toContain('&lt;/pre&gt;&lt;script&gt;bad()&lt;/script&gt;');
  });

  it('renders a read-only empty state when no valid evidence exists', () => {
    const html = buildP7RuntimeEvidenceViewerHtml({
      status: 'EMPTY',
      message: 'No evidence <yet>',
    });
    expect(html).toContain('No evidence &lt;yet&gt;');
    expect(html).not.toContain('Copy bounded JSON');
  });
});
