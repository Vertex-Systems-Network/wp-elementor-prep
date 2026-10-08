import { describe, expect, it } from 'vitest';
import { ScanBoundsExceededError, scanSceneNode, scanSceneNodeWithinBounds } from '../src/core/scanner';
import { createSelectionAuditScheduler } from '../src/plugin/selection-audit-scheduler';

function tree(visibleLeaves: number, hiddenLeaves = 0): SceneNode {
  const children = [
    ...Array.from({ length: visibleLeaves }, (_, index) => ({ id: `v${index}`, name: `Leaf ${index}`, type: 'RECTANGLE', visible: true, x: 0, y: index, width: 1, height: 1 })),
    ...Array.from({ length: hiddenLeaves }, (_, index) => ({ id: `h${index}`, name: `Hidden ${index}`, type: 'RECTANGLE', visible: false, x: 0, y: index, width: 1, height: 1 })),
  ];
  return { id: 'root', name: 'Root', type: 'FRAME', visible: true, x: 0, y: 0, width: 100, height: 100, layoutMode: 'NONE', children } as unknown as SceneNode;
}

describe('recovery M0.11 — debounced selection audit', () => {
  it('collapses rapid selection changes into one audit of the final selection', () => {
    const timers = new Map<number, () => void>();
    let nextHandle = 0;
    let runs = 0;
    const scheduler = createSelectionAuditScheduler({
      delayMs: 250,
      setTimer: (callback) => { nextHandle += 1; timers.set(nextHandle, callback); return nextHandle; },
      clearTimer: (handle) => { timers.delete(handle as number); },
      run: () => { runs += 1; },
    });
    scheduler.schedule();
    scheduler.schedule();
    scheduler.schedule();
    expect(timers.size).toBe(1);
    expect(scheduler.pending).toBe(true);
    const [firstHandle, fire] = [...timers.entries()][0]!;
    timers.delete(firstHandle);
    fire();
    expect(runs).toBe(1);
    expect(scheduler.pending).toBe(false);
    scheduler.schedule();
    scheduler.cancel();
    expect(timers.size).toBe(0);
    expect(scheduler.pending).toBe(false);
    expect(runs).toBe(1);
  });
});

describe('recovery M0.11 — scan node budget enforced during traversal', () => {
  it('matches the unbounded scan when the selection is within budget', () => {
    const node = tree(5, 2);
    expect(scanSceneNodeWithinBounds(node, { maxVisibleNodes: 6, maxTotalNodes: 8 })).toEqual(scanSceneNode(node));
  });

  it('fails fast on the visible-node budget (same unit as Build-Ready maxNodes)', () => {
    expect(() => scanSceneNodeWithinBounds(tree(6), { maxVisibleNodes: 6, maxTotalNodes: 100 })).toThrow(ScanBoundsExceededError);
    try {
      scanSceneNodeWithinBounds(tree(6), { maxVisibleNodes: 6, maxTotalNodes: 100 });
    } catch (error) {
      expect(error).toMatchObject({ code: 'SCAN_NODE_LIMIT_EXCEEDED', limit: 6, counted: 'visible' });
    }
  });

  it('bounds hidden layers with the total-node cap', () => {
    expect(() => scanSceneNodeWithinBounds(tree(1, 10), { maxVisibleNodes: 100, maxTotalNodes: 5 }))
      .toThrow(/more than 5 layers in total/);
  });
});
