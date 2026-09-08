import { build } from 'esbuild';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir('dist', { recursive: true });

const buildSourceSha = process.env.WPEP_BUILD_SOURCE_SHA ?? 'local';
const buildRunId = process.env.WPEP_BUILD_RUN_ID ?? 'local';
const buildRunNumber = process.env.WPEP_BUILD_RUN_NUMBER ?? 'local';
const buildDefines = {
  __WPEP_BUILD_SOURCE_SHA__: JSON.stringify(buildSourceSha),
  __WPEP_BUILD_RUN_ID__: JSON.stringify(buildRunId),
  __WPEP_BUILD_RUN_NUMBER__: JSON.stringify(buildRunNumber),
};

await build({
  entryPoints: ['src/plugin/main.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  platform: 'browser',
  target: 'es2022',
  format: 'iife',
  sourcemap: true,
  define: buildDefines,
});

await build({
  entryPoints: ['src/tools/verify-p7-closure.ts'],
  bundle: true,
  outfile: 'dist/verify-p7-closure.mjs',
  platform: 'node',
  target: 'node20',
  format: 'esm',
  minify: false,
  define: buildDefines,
});

await cp('src/ui/ui.html', 'dist/ui.html');

const template = await readFile('manifest.template.json', 'utf8');
const pluginId = process.env.FIGMA_PLUGIN_ID ?? '000000000000000000';
const manifest = template.replace('__FIGMA_PLUGIN_ID__', pluginId);
await writeFile('dist/manifest.json', manifest);

console.log(`Built dist/ with plugin id ${pluginId} from ${buildSourceSha} (run ${buildRunNumber}/${buildRunId})`);
