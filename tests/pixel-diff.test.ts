import { describe, expect, it } from 'vitest';
import { comparePixelBuffers } from '../src/core/pixel-diff';
import type { IntegritySnapshot } from '../src/core/validation-types';
import { mergePixelValidation, validateIntegrity } from '../src/core/validator';

function rgba(...values: number[]): Uint8ClampedArray {
  return new Uint8ClampedArray(values);
}

function snapshot(): IntegritySnapshot {
  return {
    schemaVersion: 1,
    root: { width: 2, height: 1 },
    textAnchors: [],
    imageAnchors: [],
    visibleNodeCount: 1,
    nodeTypeCounts: { FRAME: 1 },
  };
}

describe('comparePixelBuffers', () => {
  it('reports an exact no-op render as zero drift', () => {
    const pixels = rgba(10, 20, 30, 255, 40, 50, 60, 255);
    const metrics = comparePixelBuffers(
      { width: 2, height: 1, data: pixels },
      { width: 2, height: 1, data: pixels },
      8,
    );

    expect(metrics.sameDimensions).toBe(true);
    expect(metrics.changedPixels).toBe(0);
    expect(metrics.changedPixelPct).toBe(0);
    expect(metrics.meanChannelDelta).toBe(0);
  });

  it('ignores per-channel changes inside tolerance but still records mean delta', () => {
    const before = rgba(10, 20, 30, 255);
    const after = rgba(16, 25, 30, 255);
    const metrics = comparePixelBuffers(
      { width: 1, height: 1, data: before },
      { width: 1, height: 1, data: after },
      8,
    );

    expect(metrics.changedPixels).toBe(0);
    expect(metrics.meanChannelDelta).toBeGreaterThan(0);
  });

  it('marks a pixel changed when any channel exceeds tolerance', () => {
    const metrics = comparePixelBuffers(
      { width: 1, height: 1, data: rgba(0, 0, 0, 255) },
      { width: 1, height: 1, data: rgba(20, 0, 0, 255) },
      8,
    );

    expect(metrics.changedPixels).toBe(1);
    expect(metrics.changedPixelPct).toBe(100);
    expect(metrics.maxChannelDelta).toBe(20);
  });

  it('reports dimension mismatch explicitly', () => {
    const metrics = comparePixelBuffers(
      { width: 1, height: 1, data: rgba(0, 0, 0, 255) },
      { width: 2, height: 1, data: rgba(0, 0, 0, 255, 0, 0, 0, 255) },
      8,
    );

    expect(metrics.sameDimensions).toBe(false);
    expect(metrics.changedPixelPct).toBe(100);
  });

  it('throws on malformed RGBA buffer lengths', () => {
    expect(() => comparePixelBuffers(
      { width: 2, height: 1, data: rgba(0, 0, 0, 255) },
      { width: 2, height: 1, data: rgba(0, 0, 0, 255) },
      8,
    )).toThrow(/RGBA dimensions/);
  });
});

describe('mergePixelValidation', () => {
  it('keeps a clean integrity report passing when rendered pixels are equivalent', () => {
    const integrity = validateIntegrity(snapshot(), snapshot());
    const pixel = comparePixelBuffers(
      { width: 1, height: 1, data: rgba(10, 10, 10, 255) },
      { width: 1, height: 1, data: rgba(10, 10, 10, 255) },
      integrity.thresholds.pixelChannelDelta,
    );

    expect(mergePixelValidation(integrity, pixel).passed).toBe(true);
  });

  it('fails a rendered dimension mismatch', () => {
    const integrity = validateIntegrity(snapshot(), snapshot());
    const pixel = comparePixelBuffers(
      { width: 1, height: 1, data: rgba(0, 0, 0, 255) },
      { width: 2, height: 1, data: rgba(0, 0, 0, 255, 0, 0, 0, 255) },
      integrity.thresholds.pixelChannelDelta,
    );
    const report = mergePixelValidation(integrity, pixel);

    expect(report.passed).toBe(false);
    expect(report.findings.some((item) => item.code === 'PIXEL_DIMENSION_MISMATCH')).toBe(true);
  });

  it('fails visual drift above configured changed-pixel threshold', () => {
    const integrity = validateIntegrity(snapshot(), snapshot());
    const before = new Uint8ClampedArray(100 * 4);
    const after = new Uint8ClampedArray(100 * 4);
    after[0] = 255;
    after[4] = 255;
    const pixel = comparePixelBuffers(
      { width: 100, height: 1, data: before },
      { width: 100, height: 1, data: after },
      integrity.thresholds.pixelChannelDelta,
    );
    const report = mergePixelValidation(integrity, pixel);

    expect(pixel.changedPixelPct).toBe(2);
    expect(report.passed).toBe(false);
    expect(report.findings.some((item) => item.code === 'PIXEL_DIFF_EXCEEDED')).toBe(true);
  });
});
