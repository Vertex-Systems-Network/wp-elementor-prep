import { describe, expect, it } from 'vitest';
import type { BatchQueueInput, BatchQueueState } from '../src/core/batch-queue';
import type { P7RuntimeBuildIdentity } from '../src/core/batch-runtime-evidence';
import { P5_RUNTIME_GATE_VERSION } from '../src/core/p5-runtime-gate';
import {
  createP7RunKey,
  persistP7DurableSuccesses,
  prepareP7BatchQueue,
  runP7BatchLifecycle,
  type P7BatchMetadataStore,
} from '../src/plugin/p7-batch-lifecycle';

const BUILD_A: P7RuntimeBuildIdentity = {
  sourceSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  runId: '101',
  runNumber: '11',
};
const BUILD_B: P7RuntimeBuildIdentity = {
  sourceSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  runId: '102',
  runNumber: '12',
};

function store(options: { previousRunKey?: string | null } = {}) {
  const writes: BatchQueueState[] = [];
  let hydrateCalls = 0;
  const metadata: P7BatchMetadataStore = {
    hydrateInputs: async (inputs: BatchQueueInput[]) => {
      hydrateCalls += 1;
      return inputs.map((input) => ({
        ...input,
        previousRunKey: options.previousRunKey ?? input.previousRunKey ?? null,
      }));
    },
    recordSuccessfulState: async (state) => {
      writes.push({ ...state, items: state.items.map((item) => ({ ...item })) });
      return {};
    },
  };
  return { metadata, writes, hydrateCalls: () => hydrateCalls };
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
      { buildIdentity: null },
    );

    expect(queue.runKey).toBe(key);
    expect(queue.items[0]?.status).toBe('SKIPPED');
    expect(queue.items[0]?.skipReason).toBe('ALREADY_PROCESSED');
  });

  it('binds production run keys to source SHA so a new build re-audits old successes', async () => {
    const oldKey = createP7RunKey('0.1.0-alpha.1', BUILD_A.sourceSha);
    const fixture = store({ previousRunKey: oldKey });
    const queue = await prepareP7BatchQueue(
      [{ frameId: 'frame-1', frameName: 'Home' }],
      '0.1.0-alpha.1',
      fixture.metadata,
      { buildIdentity: BUILD_B },
    );

    expect(queue.runKey).toBe(createP7RunKey('0.1.0-alpha.1', BUILD_B.sourceSha));
    expect(queue.runKey).not.toBe(oldKey);
    expect(queue.items[0]?.status).toBe('PENDING');
    expect(fixture.hydrateCalls()).toBe(1);
  });

  it('ignores durable skip metadata entirely for an untraceable production build', async () => {
    const fixture = store({ previousRunKey: createP7RunKey('0.1.0-alpha.1') });
    const queue = await prepareP7BatchQueue(
      [{ frameId: 'frame-1', frameName: 'Home', previousRunKey: 'stale' }],
      '0.1.0-alpha.1',
      fixture.metadata,
      { buildIdentity: { sourceSha: 'local', runId: 'local', runNumber: 'local' } },
    );

    expect(fixture.hydrateCalls()).toBe(0);
    expect(queue.items[0]?.status).toBe('PENDING');
    expect(queue.runKey).not.toContain('build-source:');
  });

  it('does not write metadata when no frame is durably succeeded', async () => {
    const fixture = store();
    const queue = await prepareP7BatchQueue(
      [{ frameId: 'frame-1', frameName: 'Home' }],
      '0.1.0-alpha.1',
      fixture.metadata,
      { buildIdentity: null },
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
      { buildIdentity: null },
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
      { buildIdentity: null },
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
