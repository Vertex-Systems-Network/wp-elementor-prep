import { describe, expect, it } from 'vitest';
import type { BatchQueueInput, BatchQueueState } from '../src/core/batch-queue';
import { P5_RUNTIME_GATE_VERSION } from '../src/core/p5-runtime-gate';
import {
  createP7RunKey,
  persistP7DurableSuccesses,
  prepareP7BatchQueue,
  runP7BatchLifecycle,
  type P7BatchMetadataStore,
} from '../src/plugin/p7-batch-lifecycle';

function store(options: { previousRunKey?: string | null } = {}) {
  const writes: BatchQueueState[] = [];
  const metadata: P7BatchMetadataStore = {
    hydrateInputs: async (inputs: BatchQueueInput[]) => inputs.map((input) => ({
      ...input,
      previousRunKey: options.previousRunKey ?? input.previousRunKey ?? null,
    })),
    recordSuccessfulState: async (state) => {
      writes.push({ ...state, items: state.items.map((item) => ({ ...item })) });
      return {};
    },
  };
  return { metadata, writes };
}

describe('P7 batch lifecycle persistence', () => {
  it('builds a compatibility-sensitive run key and hydrates prior finalized metadata before queueing', async () => {
    const key = createP7RunKey('0.1.0-alpha.1');
    expect(key).toContain('plugin:0.1.0-alpha.1');
    expect(key).toContain(`runtime-proof:${P5_RUNTIME_GATE_VERSION}`);

    const fixture = store({ previousRunKey: key });
    const queue = await prepareP7BatchQueue(
      [{ frameId: 'frame-1', frameName: 'Home' }],
      '0.1.0-alpha.1',
      fixture.metadata,
    );

    expect(queue.runKey).toBe(key);
    expect(queue.items[0]?.status).toBe('SKIPPED');
    expect(queue.items[0]?.skipReason).toBe('ALREADY_PROCESSED');
  });

  it('does not write metadata when no frame is durably succeeded', async () => {
    const fixture = store();
    const queue = await prepareP7BatchQueue(
      [{ frameId: 'frame-1', frameName: 'Home' }],
      '0.1.0-alpha.1',
      fixture.metadata,
    );
    await persistP7DurableSuccesses(queue, fixture.metadata);
    expect(fixture.writes).toHaveLength(0);
  });

  it('persists durable successes reached by the generic batch lifecycle', async () => {
    const fixture = store();
    const queue = await prepareP7BatchQueue(
      [
        { frameId: 'frame-1', frameName: 'Home' },
        { frameId: 'frame-2', frameName: 'About' },
      ],
      '0.1.0-alpha.1',
      fixture.metadata,
    );

    const result = await runP7BatchLifecycle(
      queue,
      async (item) => item.frameId === 'frame-1'
        ? { status: 'SUCCEEDED' }
        : { status: 'FAILED', error: 'fixture failure' },
      fixture.metadata,
      { checkpointPauseReason: async () => null },
    );

    expect(result.items.map((item) => item.status)).toEqual(['SUCCEEDED', 'FAILED']);
    expect(fixture.writes).toHaveLength(1);
    expect(fixture.writes[0]?.items[0]?.status).toBe('SUCCEEDED');
  });

  it('does not persist a committed frame while its checkpoint remains unresolved', async () => {
    const fixture = store();
    const queue = await prepareP7BatchQueue(
      [{ frameId: 'frame-1', frameName: 'Home' }],
      '0.1.0-alpha.1',
      fixture.metadata,
    );

    const result = await runP7BatchLifecycle(
      queue,
      async () => ({ status: 'CHECKPOINT_PENDING', committedFrameId: 'candidate-1' }),
      fixture.metadata,
      { checkpointPauseReason: async () => null },
    );

    expect(result.items[0]?.frameId).toBe('candidate-1');
    expect(result.items[0]?.status).toBe('AWAITING_CHECKPOINT');
    expect(fixture.writes).toHaveLength(0);
  });
});
