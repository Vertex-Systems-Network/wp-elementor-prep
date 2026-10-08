import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { comparePixelBuffers } from '../src/core/pixel-diff';
import { buildReleaseUi } from '../scripts/release-ui-contract.mjs';
import {
  PIXEL_DIFF_RUNTIME_END,
  PIXEL_DIFF_RUNTIME_START,
  compilePixelDiffRuntime,
  injectPixelDiffRuntime,
} from '../scripts/ui-pixel-diff-runtime.mjs';

function buffer(width, height, seed) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < data.length; index += 1) data[index] = (index * seed + seed * 7) % 256;
  return { width, height, data };
}

function runtimeFrom(html) {
  const start = html.indexOf(PIXEL_DIFF_RUNTIME_START);
  const end = html.indexOf(PIXEL_DIFF_RUNTIME_END);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return runInNewContext(html.slice(start, end + PIXEL_DIFF_RUNTIME_END.length));
}

describe('recovery M0.10 — single pixel-diff implementation', () => {
  it('the source UI keeps no hand-written pixel comparison', async () => {
    const ui = await readFile('src/ui/ui.html', 'utf8');
    expect(ui).not.toContain('function comparePixels(');
    expect(ui).toContain('const comparePixels = __PIXEL_DIFF_RUNTIME__;');
  });

  it('the publishable UI runs exactly the unit-tested core comparison', async () => {
    const releaseUi = buildReleaseUi(await readFile('src/ui/ui.html', 'utf8'));
    expect(releaseUi).not.toContain('function comparePixels(');
    const runtimeCompare = runtimeFrom(releaseUi);
    const cases = [
      [buffer(4, 3, 3), buffer(4, 3, 3), 8],
      [buffer(4, 3, 3), buffer(4, 3, 5), 8],
      [buffer(4, 3, 3), buffer(4, 3, 5), 255],
      [buffer(4, 3, 3), buffer(3, 4, 3), 8],
      [buffer(0, 0, 1), buffer(0, 0, 1), 8],
    ];
    for (const [before, after, tolerance] of cases) {
      expect(JSON.parse(JSON.stringify(runtimeCompare(before, after, tolerance)))).toEqual(comparePixelBuffers(before, after, tolerance));
    }
    expect(() => runtimeCompare({ width: 2, height: 2, data: [0] }, { width: 2, height: 2, data: [0] }, 8)).toThrow(/length/);
  });

  it('fails closed when the placeholder is missing or the compiled runtime is unusable', () => {
    expect(() => injectPixelDiffRuntime('<script>const a = 1;</script>', 'x')).toThrow(/__PIXEL_DIFF_RUNTIME__/);
    // esbuild escapes closing script tags; the compiler additionally refuses any that survive.
    expect(compilePixelDiffRuntime('export const x = "</script>"; export function comparePixelBuffers() {}')).not.toMatch(/<\/script/i);
    expect(() => runInNewContext(compilePixelDiffRuntime('export const other = 1;'))).toThrow(/unavailable/);
  });
});
