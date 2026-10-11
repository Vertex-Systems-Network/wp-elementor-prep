import { describe, expect, it, vi } from 'vitest';
import { compareTiledPixelBuffers, type PixelBuffer } from '../src/core/pixel-diff';
import { FULL_RESOLUTION_TOO_LARGE_CODE, FullFrameValidator } from '../src/plugin/full-frame-validator';

function solid(width: number, height: number, value = 200): PixelBuffer & { data: Uint8ClampedArray } {
  return { width, height, data: new Uint8ClampedArray(width * height * 4).fill(value) };
}
function paint(buffer: PixelBuffer & { data: Uint8ClampedArray }, x0: number, y0: number, w: number, h: number, value = 0) {
  for (let y = y0; y < y0 + h; y += 1) for (let x = x0; x < x0 + w; x += 1) buffer.data.fill(value, (y * buffer.width + x) * 4, (y * buffer.width + x) * 4 + 4);
}

describe('recovery M5.4 — full-resolution tiled pixel comparison', () => {
  it('catches a local change that the whole-frame share would let through', () => {
    const before = solid(1000, 600);
    const after = solid(1000, 600);
    paint(after, 20, 20, 40, 40); // 1600 px = 0.27% of the frame, but 16% of its 100x100 section
    const sections = [{ id: 'hero', x: 0, y: 0, width: 100, height: 100, maxChangedPct: 0.5 }, { id: 'rest', x: 0, y: 100, width: 1000, height: 500, maxChangedPct: 0.5 }];
    const result = compareTiledPixelBuffers(before, after, 8, 512, sections, 0.5);
    expect(result.metrics.changedPixelPct).toBe(0.2667);
    expect(result.sections).toEqual([
      { id: 'hero', totalPixels: 10000, changedPixels: 1600, changedPct: 16, maxChangedPct: 0.5, pass: false },
      { id: 'rest', totalPixels: 500000, changedPixels: 0, changedPct: 0, maxChangedPct: 0.5, pass: true },
    ]);
    expect(result).toMatchObject({ tileSize: 512, tiles: 4, changedTiles: 1, worstTile: { x: 0, y: 0 }, pass: false });
  });

  it('passes identical renders and fails any dimension change', () => {
    const same = compareTiledPixelBuffers(solid(300, 200), solid(300, 200), 8, 128, [{ id: 's', x: 0, y: 0, width: 300, height: 200, maxChangedPct: 0 }], 0.5);
    expect(same).toMatchObject({ pass: true, changedTiles: 0, worstTile: null, tiles: 6 });
    expect(compareTiledPixelBuffers(solid(300, 200), solid(300, 201), 8, 128, [], 0.5).pass).toBe(false);
  });

});

const frame = (name: string, width = 1000, height = 600) => ({ type: 'FRAME', name, visible: true, x: 0, y: 0, width, height, children: [], fills: [],
  exportAsync: vi.fn(async () => new Uint8Array([1, 2, 3])) }) as unknown as FrameNode;

describe('recovery M5.4 — FullFrameValidator.validateFullResolution', () => {
  it('renders at scale 1, requests a tiled comparison and fails on a section over budget', async () => {
    const posted: Array<Record<string, unknown>> = [];
    const validator = new FullFrameValidator((message) => posted.push(message as unknown as Record<string, unknown>));
    const before = frame('Before');
    const sections = [{ id: 'hero', x: 0, y: 0, width: 100, height: 100, maxChangedPct: 0.5 }];
    const pending = validator.validateFullResolution(before, frame('After'), sections);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect((before.exportAsync as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toEqual({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
    expect(posted[0]).toMatchObject({ type: 'validation-pixel-request', tiled: { tileSize: 512, sections, maxChangedPct: 0.5 } });
    const a = solid(1000, 600);
    const b = solid(1000, 600);
    paint(b, 20, 20, 40, 40, 150); // a moderate local change: global share and mean delta stay within the frame rule
    validator.finish(posted[0]!.validationId as number, compareTiledPixelBuffers(a, b, 8, 512, sections, 0.5));
    const result = await pending;
    expect(result.report.passed).toBe(false);
    expect(result.report.findings.map((finding) => finding.code)).toEqual(['PIXEL_SECTION_BUDGET_EXCEEDED']);
  });

  it('rejects malformed tiled metrics and frames beyond the full-resolution limit', async () => {
    const posted: Array<Record<string, unknown>> = [];
    const validator = new FullFrameValidator((message) => posted.push(message as unknown as Record<string, unknown>));
    const pending = validator.validateFullResolution(frame('A'), frame('B'), []);
    await new Promise((resolve) => setTimeout(resolve, 0));
    validator.finish(posted[0]!.validationId as number, { metrics: {}, pass: true, sections: [] });
    await expect(pending).rejects.toThrow(/invalid or inconsistent/);
    await expect(validator.validateFullResolution(frame('A', 20000, 100), frame('B', 20000, 100), [])).rejects.toThrow(FULL_RESOLUTION_TOO_LARGE_CODE);
  });
});
