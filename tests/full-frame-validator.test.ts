import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PixelDiffMetrics } from '../src/core/validation-types';
import { FullFrameValidator } from '../src/plugin/full-frame-validator';

function fakeFrame(name: string): FrameNode {
  return {
    type: 'FRAME',
    name,
    visible: true,
    x: 0,
    y: 0,
    width: 100,
    height: 80,
    children: [],
    fills: [],
    exportAsync: vi.fn(async () => new Uint8Array([1, 2, 3])),
  } as unknown as FrameNode;
}

function exactPixelMetrics(): PixelDiffMetrics {
  return {
    sameDimensions: true,
    widthBefore: 100,
    heightBefore: 80,
    widthAfter: 100,
    heightAfter: 80,
    totalPixels: 8000,
    changedPixels: 0,
    changedPixelPct: 0,
    meanChannelDelta: 0,
    maxChannelDelta: 0,
    channelTolerance: 8,
  };
}

async function settleExports(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => {
  vi.useRealTimers();
});

describe('FullFrameValidator pixel broker lifecycle', () => {
  it('rejects invalid timeout configuration', () => {
    expect(() => new FullFrameValidator(() => undefined, 0)).toThrow(/positive finite/);
    expect(() => new FullFrameValidator(() => undefined, Number.NaN)).toThrow(/positive finite/);
  });

  it('fails closed and clears pending state when the UI pixel broker never responds', async () => {
    vi.useFakeTimers();
    const posted: unknown[] = [];
    const validator = new FullFrameValidator((message) => posted.push(message), 25);

    const validationPromise = validator.validate(fakeFrame('Before'), fakeFrame('After'));
    const rejection = expect(validationPromise).rejects.toThrow('Pixel comparison timed out after 25 ms.');

    await settleExports();
    expect(posted).toHaveLength(1);
    expect(validator.pendingCount).toBe(1);

    await vi.advanceTimersByTimeAsync(25);
    await rejection;
    expect(validator.pendingCount).toBe(0);
  });

  it('clears the timeout and resolves when exact pixel evidence arrives', async () => {
    vi.useFakeTimers();
    const posted: Array<{ validationId: number }> = [];
    const validator = new FullFrameValidator((message) => posted.push(message), 25);

    const validationPromise = validator.validate(fakeFrame('Before'), fakeFrame('After'));
    await settleExports();

    expect(posted).toHaveLength(1);
    expect(validator.pendingCount).toBe(1);
    expect(validator.finish(posted[0]!.validationId, exactPixelMetrics())).toBe(true);

    const result = await validationPromise;
    expect(result.report.passed).toBe(true);
    expect(result.report.metrics.pixel?.changedPixelPct).toBe(0);
    expect(validator.pendingCount).toBe(0);

    await vi.advanceTimersByTimeAsync(50);
    expect(validator.pendingCount).toBe(0);
  });
});
