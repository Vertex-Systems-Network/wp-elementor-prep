import { build } from 'esbuild';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir('dist', { recursive: true });

const sourceSha = process.env.SOURCE_SHA ?? process.env.GITHUB_SHA ?? 'local';
const githubRunId = process.env.GITHUB_RUN_ID ?? 'local';
const githubRunNumber = process.env.GITHUB_RUN_NUMBER ?? 'local';

await build({
  entryPoints: ['src/plugin/main.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  platform: 'browser',
  target: 'es2022',
  format: 'iife',
  sourcemap: true,
  define: {
    __P5_SOURCE_SHA__: JSON.stringify(sourceSha),
    __P5_GITHUB_RUN_ID__: JSON.stringify(githubRunId),
    __P5_GITHUB_RUN_NUMBER__: JSON.stringify(githubRunNumber),
  },
});

await cp('src/ui/ui.html', 'dist/ui.html');

const template = await readFile('manifest.template.json', 'utf8');
const pluginId = process.env.FIGMA_PLUGIN_ID ?? '000000000000000000';
const manifest = template.replace('__FIGMA_PLUGIN_ID__', pluginId);
await writeFile('dist/manifest.json', manifest);

console.log(`Built dist/ with plugin id ${pluginId}; source ${sourceSha}; Actions run ${githubRunNumber}/${githubRunId}`);
