import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('dist-cli', { recursive: true });
await build({
  entryPoints: ['src/cli/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist-cli/elementor-prep.mjs',
  sourcemap: false,
  legalComments: 'none',
});

await writeFile(
  'dist-cli/README.txt',
  'Run with: node elementor-prep.mjs <audit:figma|audit:snapshot|backlog:generate> [options]\n',
  'utf8',
);
console.log('Built dist-cli/elementor-prep.mjs');
