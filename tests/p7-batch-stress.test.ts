import { describe, expect, it } from 'vitest';
import { createBatchQueue, summarizeBatchQueue } from '../src/core/batch-queue';
import { runBatchQueue } from '../src/core/batch-runner';

describe('P7 60-frame synthetic stress calibration', () => {
  it('processes 60 frames sequentially with compact queue state and isolated failures', async () => {
    const inputs = Array.from({ length: 60 }, (_, index) => ({
      frameId: `desktop-${index + 1}`,
      frameName: `Desktop ${index + 1}`,
      previousRunKey: index % 10 === 0 ? 'plugin-v7:recipes-v1' : null,
    }));
    const queue = createBatchQueue(inputs, 'plugin-v7:recipes-v1');

    let active = 0;
    let maxActive = 0;
    let processed = 0;
    const result = await runBatchQueue(queue, async (item) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      processed += 1;
      await Promise.resolve();
      active -= 1;

      if (item.frameId === 'desktop-17' || item.frameId === 'desktop-43') {
        return { status: 'FAILED', error: 'synthetic validation rejection' };
      }
      return { status: 'SUCCEEDED' };
    });

    const summary = summarizeBatchQueue(result);
    expect(maxActive).toBe(1);
    expect(processed).toBe(54);
    expect(summary).toMatchObject({
      total: 60,
      succeeded: 52,
      failed: 2,
      skipped: 6,
      pending: 0,
      running: 0,
      finished: 60,
      progressPct: 100,
    });
    expect(result.status).toBe('COMPLETED');

    // Queue entries stay compact: identity + execution metadata only, never audit trees/render bytes.
    for (const item of result.items) {
      expect(Object.keys(item).sort()).toEqual([
        'attempts',
        'error',
        'frameId',
        'frameName',
        'skipReason',
        'status',
      ]);
    }
  });
});
