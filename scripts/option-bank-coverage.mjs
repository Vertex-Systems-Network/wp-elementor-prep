#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=')];
}));
const input = args.input;
const out = args.out;
if (!input || !out) throw new Error('Usage: node scripts/option-bank-coverage.mjs --input=docs/option-bank/elementor-<free>-<pro>.json --out=docs/option-bank/coverage-<free>-<pro>.json');
const snapshot = JSON.parse(await readFile(resolve(input), 'utf8'));
const mapped = new Set([
  'flex_direction', 'flex_gap', 'padding', 'flex_align_items', 'flex_justify_content',
  'background_background', 'background_color', 'border_radius', 'title', 'header_size',
  'align', 'editor', 'text', 'link', 'image',
]);
const classify = (target) => {
  const keys = Object.keys(snapshot.targets?.[target]?.literalControlKeys ?? {});
  const entries = keys.map((key) => ({ key, status: mapped.has(key) ? 'MAPPED' : 'RUNTIME_REQUIRED' }));
  return { inventoriedKeys: keys.length, mappedKeys: entries.filter((entry) => entry.status === 'MAPPED').length, runtimeRequiredKeys: entries.filter((entry) => entry.status === 'RUNTIME_REQUIRED').length, entries };
};
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  sourceSnapshot: basename(input),
  adapter: { id: 'elementor-v3-container', mappingEvidence: 'src/targets/elementor/v3-template-generator.ts', mappedControlKeys: [...mapped].sort() },
  targets: { elementor_free: classify('elementor_free'), elementor_pro: classify('elementor_pro') },
  authority: { runtimeImport: 'NOT_RUN', saveSerialization: 'NOT_RUN', frontendRender: 'NOT_RUN', responsiveParity: 'NOT_RUN', productionAcceptance: false },
  notes: ['MAPPED means the key is emitted by the current static generator settings. It does not prove that the target accepts or renders the value.', 'RUNTIME_REQUIRED is fail-closed until genuine target evidence exists.'],
};
await writeFile(resolve(out), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ out: resolve(out), free: report.targets.elementor_free, pro: report.targets.elementor_pro }, null, 2));
