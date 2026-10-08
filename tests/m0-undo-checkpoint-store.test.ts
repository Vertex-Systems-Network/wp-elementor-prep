import { describe, expect, it } from 'vitest';
import { decodeUndo } from '../src/plugin/figma-transaction-adapter';
import {
  UNDO_BACKUP_FRAME_NAME_PREFIX,
  UndoCheckpointStore,
  type UndoCheckpointNodeRef,
} from '../src/plugin/undo-checkpoint-store';

const TOKEN = 'p4v1|1:2|1:9|0:1|0|10|20|1:5';

class FakeEnvironment {
  documentValue = '';
  constructor(
    readonly legacy: { value: unknown },
    readonly nodes: Map<string, UndoCheckpointNodeRef>,
  ) {}

  store(): UndoCheckpointStore {
    return new UndoCheckpointStore({
      readDocument: () => this.documentValue,
      writeDocument: (value) => { this.documentValue = value; },
      readLegacy: async () => this.legacy.value,
      deleteLegacy: async () => { this.legacy.value = undefined; },
      resolveNode: async (nodeId) => this.nodes.get(nodeId) ?? null,
    }, decodeUndo);
  }
}

function checkpointNodes(): Map<string, UndoCheckpointNodeRef> {
  return new Map([
    ['1:5', { id: '1:5', type: 'FRAME', name: `${UNDO_BACKUP_FRAME_NAME_PREFIX} p5-x`, parentId: '0:1' }],
    ['1:2', { id: '1:2', type: 'FRAME', name: 'Approved Desktop', parentId: '1:5' }],
    ['1:9', { id: '1:9', type: 'FRAME', name: 'Approved Desktop', parentId: '0:1' }],
  ]);
}

describe('recovery M0.6 — per-document Safe Fix undo checkpoint', () => {
  it('keeps checkpoints per document so file A never blocks file B', async () => {
    const legacy = { value: undefined as unknown };
    const fileA = new FakeEnvironment(legacy, checkpointNodes());
    const fileB = new FakeEnvironment(legacy, new Map());
    await fileA.store().set(TOKEN);
    expect(await fileA.store().get()).toBe(TOKEN);
    expect(await fileB.store().get()).toBeNull();
    expect(await fileB.store().assess()).toBe('NONE');
    expect(legacy.value).toBeUndefined();
  });

  it('ignores a legacy global token whose nodes are not in this document and keeps it for its own file', async () => {
    const legacy = { value: TOKEN as unknown };
    const otherFile = new FakeEnvironment(legacy, new Map([
      // Same node id, but not a backup Frame: node ids collide across Figma files.
      ['1:5', { id: '1:5', type: 'FRAME', name: 'Hero', parentId: '0:1' }],
    ]));
    expect(await otherFile.store().get()).toBeNull();
    expect(otherFile.documentValue).toBe('');
    expect(legacy.value).toBe(TOKEN);

    const ownerFile = new FakeEnvironment(legacy, checkpointNodes());
    expect(await ownerFile.store().get()).toBe(TOKEN);
    expect(ownerFile.documentValue).toBe(TOKEN);
    expect(legacy.value).toBeUndefined();
  });

  it('assesses VALID vs STALE and clears only a stale checkpoint', async () => {
    const valid = new FakeEnvironment({ value: undefined }, checkpointNodes());
    await valid.store().set(TOKEN);
    expect(await valid.store().assess()).toBe('VALID');
    await expect(valid.store().clearStale()).rejects.toThrow(/still valid/);
    expect(valid.documentValue).toBe(TOKEN);

    const nodes = checkpointNodes();
    nodes.delete('1:5');
    const stale = new FakeEnvironment({ value: undefined }, nodes);
    stale.documentValue = TOKEN;
    expect(await stale.store().assess()).toBe('STALE');
    expect(await stale.store().clearStale()).toBe(true);
    expect(stale.documentValue).toBe('');
    expect(await stale.store().clearStale()).toBe(false);
  });

  it('treats an undecodable stored token as stale and refuses to store an empty token', async () => {
    const env = new FakeEnvironment({ value: undefined }, checkpointNodes());
    env.documentValue = 'garbage';
    expect(await env.store().assess()).toBe('STALE');
    await expect(env.store().set('')).rejects.toThrow(/empty/);
  });
});
