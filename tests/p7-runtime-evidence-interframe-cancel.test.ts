import { describe, expect, it } from 'vitest';
import { createBatchQueue } from '../src/core/batch-queue';
import { P7RuntimeEvidenceRecorder } from '../src/core/batch-runtime-evidence';
import { runP7BatchRuntime } from '../src/plugin/p7-batch-runtime';

describe('P7 inter-frame cancellation evidence', () => {
  it('does not attribute an inter-frame cancellation request to the previously settled Frame', async () => {
    const recorder = new P7RuntimeEvidenceRecorder('run-key');
    const queue = createBatchQueue([
      { frameId: 'frame-1', frameName: 'One' },
      { frameId: 'frame-2', frameName: 'Two' },
    ], 'run-key');
    let cancelRequested = false;
    let pauseChecks = 0;
    let processorCalls = 0;

    const result = await runP7BatchRuntime(queue, async () => {
      processorCalls += 1;
      return { status: 'SUCCEEDED' };
    }, {
      shouldCancel: () => cancelRequested,
      checkpointPauseReason: async () => {
        pauseChecks += 1;
        // First call is before frame-1. Second call is after frame-1 has settled. Simulate the UI
        // cancellation arriving during that asynchronous inter-frame safety phase.
        if (pauseChecks === 2) cancelRequested = true;
        return null;
      },
      evidenceRecorder: recorder,
    });

    const evidence = recorder.snapshot(result);
    expect(processorCalls).toBe(1);
    expect(result.status).toBe('CANCELLED');
    expect(evidence.cancellation?.activeFrameIdAtRequest).toBeNull();
    expect(evidence.cancellation?.finalStatus).toBe('CANCELLED');
  });
});
