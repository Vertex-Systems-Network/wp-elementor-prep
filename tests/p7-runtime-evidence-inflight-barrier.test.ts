import { describe, expect, it } from 'vitest';
import { createBatchQueue } from '../src/core/batch-queue';
import { P7RuntimeEvidenceRecorder } from '../src/core/batch-runtime-evidence';
import { runP7BatchRuntime } from '../src/plugin/p7-batch-runtime';

describe('P7 in-flight cancellation barrier', () => {
  it('records the active Frame when external cancellation arrives during an awaited processor and stops only after settlement', async () => {
    const recorder = new P7RuntimeEvidenceRecorder('run-key');
    const queue = createBatchQueue([
      { frameId: 'frame-1', frameName: 'One' },
      { frameId: 'frame-2', frameName: 'Two' },
    ], 'run-key');

    let cancelRequested = false;
    let latestState = queue;
    let release: () => void = () => undefined;
    const processorBarrier = new Promise<void>((resolve) => { release = resolve; });
    let signalStarted: () => void = () => undefined;
    const processorStarted = new Promise<void>((resolve) => { signalStarted = resolve; });

    const running = runP7BatchRuntime(queue, async () => {
      signalStarted();
      await processorBarrier;
      return { status: 'SUCCEEDED' };
    }, {
      checkpointPauseReason: async () => null,
      shouldCancel: () => cancelRequested,
      evidenceRecorder: recorder,
      onState: (state) => { latestState = state; },
    });

    await processorStarted;
    expect(latestState.status).toBe('RUNNING');
    expect(latestState.items[0]?.status).toBe('RUNNING');
    expect(latestState.items[1]?.status).toBe('PENDING');

    // This mirrors a UI cancel click while Full P3/P5 is still awaited. The processor must not be
    // interrupted: only the inter-frame cancellation poll may stop the queue after settlement.
    cancelRequested = true;
    release();

    const result = await running;
    const evidence = recorder.snapshot(result);

    expect(result.status).toBe('CANCELLED');
    expect(result.items[0]?.status).toBe('SUCCEEDED');
    expect(result.items[1]?.status).toBe('CANCELLED');
    expect(evidence.attempts).toHaveLength(1);
    expect(evidence.attempts[0]?.frameIdAtStart).toBe('frame-1');
    expect(evidence.attempts[0]?.outcome).toBe('SUCCEEDED');
    expect(evidence.cancellation?.activeFrameIdAtRequest).toBe('frame-1');
    expect(evidence.cancellation?.settledAt).not.toBeNull();
    expect(evidence.cancellation?.finalStatus).toBe('CANCELLED');
    expect(evidence.maxConcurrentProcessors).toBe(1);
  });
});
