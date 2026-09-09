import { build } from 'esbuild';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
await mkdir('dist', { recursive: true });

await build({
  entryPoints: ['src/plugin/main.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  platform: 'browser',
  target: 'es2022',
  format: 'iife',
  sourcemap: true,
  define: {
    __PLUGIN_VERSION__: JSON.stringify(packageJson.version),
  },
});

await cp('src/ui/ui.html', 'dist/ui.html');

const template = await readFile('manifest.template.json', 'utf8');
const pluginId = process.env.FIGMA_PLUGIN_ID ?? '000000000000000000';
const manifest = template.replace('__FIGMA_PLUGIN_ID__', pluginId);
await writeFile('dist/manifest.json', manifest);

console.log(`Built dist/ ${packageJson.version} with plugin id ${pluginId}`);
