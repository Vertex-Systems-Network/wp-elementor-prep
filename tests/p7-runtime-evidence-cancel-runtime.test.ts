import { describe, expect, it } from 'vitest';
import { createBatchQueue } from '../src/core/batch-queue';
import { P7RuntimeEvidenceRecorder } from '../src/core/batch-runtime-evidence';
import { runP7BatchRuntime } from '../src/plugin/p7-batch-runtime';

describe('P7 runtime cancellation evidence composition', () => {
  it('captures the active frame when cancellation becomes true during its processor transaction', async () => {
    const recorder = new P7RuntimeEvidenceRecorder('run-key');
    const queue = createBatchQueue([
      { frameId: 'frame-1', frameName: 'One' },
      { frameId: 'frame-2', frameName: 'Two' },
    ], 'run-key');
    let cancelRequested = false;

    const result = await runP7BatchRuntime(queue, async () => {
      // Mirrors a UI cancellation request arriving while Full P3/P5 work is active. The scheduler
      // does not inspect it until this transaction settles.
      cancelRequested = true;
      return { status: 'SUCCEEDED' };
    }, {
      checkpointPauseReason: async () => null,
      shouldCancel: () => cancelRequested,
      evidenceRecorder: recorder,
    });

    const evidence = recorder.snapshot(result);
    expect(result.status).toBe('CANCELLED');
    expect(result.items[0]?.status).toBe('SUCCEEDED');
    expect(result.items[1]?.status).toBe('CANCELLED');
    expect(evidence.cancellation?.activeFrameIdAtRequest).toBe('frame-1');
    expect(evidence.cancellation?.settledAt).not.toBeNull();
    expect(evidence.cancellation?.finalStatus).toBe('CANCELLED');
    expect(evidence.maxConcurrentProcessors).toBe(1);
  });
});
