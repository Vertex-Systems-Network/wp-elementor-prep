import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PixelDiffMetrics } from '../src/core/validation-types';
import { FullFrameValidator, isValidPixelDiffMetrics, PIXEL_BROKER_UNAVAILABLE_CODE, PixelBrokerUnavailableError } from '../src/plugin/full-frame-validator';

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

  it('rejects malformed or internally inconsistent pixel evidence', () => {
    expect(isValidPixelDiffMetrics({ ...exactPixelMetrics(), channelTolerance: 9 }, 8)).toBe(false);
    expect(isValidPixelDiffMetrics({ ...exactPixelMetrics(), changedPixels: 1, changedPixelPct: 0 }, 8)).toBe(false);
    expect(isValidPixelDiffMetrics({ ...exactPixelMetrics(), widthBefore: 4096 }, 8)).toBe(false);
    expect(isValidPixelDiffMetrics({ ...exactPixelMetrics(), meanChannelDelta: 10, maxChannelDelta: 5 }, 8)).toBe(false);
  });

  it('consumes a pending validation but rejects its promise when broker metrics are forged', async () => {
    const posted: Array<{ validationId: number }> = [];
    const validator = new FullFrameValidator((message) => posted.push(message), 250);
    const validationPromise = validator.validate(fakeFrame('Before'), fakeFrame('After'));
    const rejection = expect(validationPromise).rejects.toThrow('invalid or inconsistent metrics');
    await settleExports();

    expect(posted).toHaveLength(1);
    expect(validator.finish(posted[0]!.validationId, {
      ...exactPixelMetrics(),
      channelTolerance: 0,
    })).toBe(true);
    expect(validator.pendingCount).toBe(0);
    await rejection;
  });
});

describe('recovery M0.7 — pixel broker resilience when a viewer replaces the main panel', () => {
  it('fails fast with a structured error when the broker UI is not active, without exporting', async () => {
    const posted: unknown[] = [];
    const validator = new FullFrameValidator((message) => posted.push(message), 30_000, () => false);
    const before = fakeFrame('Before');
    await expect(validator.validate(before, fakeFrame('After'))).rejects.toMatchObject({
      name: 'PixelBrokerUnavailableError',
      code: PIXEL_BROKER_UNAVAILABLE_CODE,
    });
    expect(posted).toHaveLength(0);
    expect(validator.pendingCount).toBe(0);
  });

  it('refuses to post when the broker becomes unavailable during export', async () => {
    let available = true;
    const posted: unknown[] = [];
    const validator = new FullFrameValidator((message) => posted.push(message), 30_000, () => available);
    const validationPromise = validator.validate(fakeFrame('Before'), fakeFrame('After'));
    available = false;
    await expect(validationPromise).rejects.toBeInstanceOf(PixelBrokerUnavailableError);
    expect(posted).toHaveLength(0);
  });

  it('rejects every in-flight validation immediately instead of waiting for the timeout', async () => {
    vi.useFakeTimers();
    const posted: unknown[] = [];
    const validator = new FullFrameValidator((message) => posted.push(message), 30_000);
    const first = validator.validate(fakeFrame('A'), fakeFrame('B'));
    const second = validator.validate(fakeFrame('C'), fakeFrame('D'));
    const rejections = Promise.all([
      expect(first).rejects.toBeInstanceOf(PixelBrokerUnavailableError),
      expect(second).rejects.toBeInstanceOf(PixelBrokerUnavailableError),
    ]);
    await settleExports();
    expect(validator.pendingCount).toBe(2);
    expect(validator.failAllPending()).toBe(2);
    expect(validator.pendingCount).toBe(0);
    await rejections;
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
});

describe('recovery M0.7 — main panel wiring', () => {
  it('routes every viewer through showViewerUi so in-flight pixel validation fails fast', async () => {
    const { readFile } = await import('node:fs/promises');
    const main = await readFile('src/plugin/main.ts', 'utf8');
    const directShowUi = main.match(/figma\.showUI\(/g) ?? [];
    expect(directShowUi).toHaveLength(2);
    expect(main).toContain('figma.showUI(__html__, {');
    expect(main).toMatch(/function showViewerUi\(html: string, options: ShowUIOptions\): void \{\n  mainPanelActive = false;\n  fullFrameValidator\.failAllPending\(\);\n  figma\.showUI\(html, options\);/);
    expect(main).toContain('}, undefined, () => mainPanelActive);');
  });
});
