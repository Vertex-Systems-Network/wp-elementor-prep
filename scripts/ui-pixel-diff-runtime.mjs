import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';

export const PIXEL_DIFF_UI_PLACEHOLDER = '__PIXEL_DIFF_RUNTIME__';
export const PIXEL_DIFF_RUNTIME_START = '/* wpep:pixel-diff-runtime:start */';
export const PIXEL_DIFF_RUNTIME_END = '/* wpep:pixel-diff-runtime:end */';
const PIXEL_DIFF_SOURCE_PATH = 'src/core/pixel-diff.ts';

/**
 * Compile the unit-tested `src/core/pixel-diff.ts` into a self-contained expression that evaluates
 * to `comparePixelBuffers`, so the plugin UI runs exactly the implementation the tests cover.
 */
export function compilePixelDiffRuntime(source = readFileSync(PIXEL_DIFF_SOURCE_PATH, 'utf8')) {
  const { code } = transformSync(source, {
    loader: 'ts',
    format: 'iife',
    globalName: 'wpepPixelDiffModule',
    target: 'es2020',
    legalComments: 'none',
  });
  if (/<\/script/i.test(code)) throw new Error('Compiled pixel-diff runtime must not contain a closing script tag.');
  return `${PIXEL_DIFF_RUNTIME_START}(() => {\n${code}\nif (typeof wpepPixelDiffModule.comparePixelBuffers !== 'function') throw new Error('Pixel-diff runtime is unavailable.');\nreturn wpepPixelDiffModule.comparePixelBuffers;\n})()${PIXEL_DIFF_RUNTIME_END}`;
}

/** Substitute the pixel-diff placeholder in the plugin UI; shared by development and release builds. */
export function injectPixelDiffRuntime(ui, runtime = compilePixelDiffRuntime()) {
  if (!ui.includes(PIXEL_DIFF_UI_PLACEHOLDER)) {
    throw new Error(`Plugin UI contract drifted: missing ${PIXEL_DIFF_UI_PLACEHOLDER} placeholder.`);
  }
  return ui.split(PIXEL_DIFF_UI_PLACEHOLDER).join(runtime);
}
