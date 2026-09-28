#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => { const [key, ...rest] = arg.replace(/^--/, '').split('='); return [key, rest.join('=')]; }));
const required = ['registry', 'selection', 'import', 'frontend', 'responsive', 'out'];
for (const key of required) if (!args[key]) throw new Error(`Missing --${key}.`);
const load = async (path) => JSON.parse(await readFile(resolve(path), 'utf8'));
const registry = await load(args.registry);
const receipts = { import: await load(args.import), frontend: await load(args.frontend), responsive: await load(args.responsive) };
const entry = [...(registry.elementor ?? []), ...(registry.gutenberg ?? [])].find((item) => item.id === args.selection);
const issues = [];
if (!entry) issues.push('OPTION_BANK_SELECTION_NOT_IN_REGISTRY');
if (entry?.status === 'UNSUPPORTED') issues.push('OPTION_BANK_SELECTION_UNSUPPORTED');
const target = entry?.id?.startsWith('elementor:')
  ? entry.id.split(':').slice(1)
  : [entry?.id?.split(':').slice(1).join(':')];
for (const [kind, receipt] of Object.entries(receipts)) {
  if (!receipt || typeof receipt !== 'object' || receipt.result !== 'PASS') issues.push(`${kind.toUpperCase()}_RECEIPT_NOT_PASS`);
  const observed = receipt?.target ?? {};
  if (entry?.id?.startsWith('elementor:')) {
    const free = observed.elementorFreeVersion ?? observed.elementor_free_version;
    const pro = observed.elementorProVersion ?? observed.elementor_pro_version;
    if (free !== target[0] || pro !== target[1]) issues.push(`${kind.toUpperCase()}_ELEMENTOR_VERSION_MISMATCH`);
  } else if (entry?.id?.startsWith('gutenberg:')) {
    const version = observed.wordpressVersion ?? observed.gutenbergVersion;
    if (version !== target[0]) issues.push(`${kind.toUpperCase()}_WORDPRESS_VERSION_MISMATCH`);
  }
}
const report = {
  schemaVersion: 1,
  gate: 'p15-option-bank-runtime-binding-v1',
  selection: args.selection,
  bankSnapshot: entry?.snapshot ?? null,
  status: issues.length === 0 ? 'BOUND_RUNTIME_PASS' : 'RUNTIME_REVIEW_REQUIRED',
  receipts: Object.fromEntries(Object.entries(args).filter(([key]) => ['import', 'frontend', 'responsive'].includes(key)).map(([key, value]) => [key, basename(value)])),
  issues,
  authority: { targetCompatibilityClaim: false, productionAcceptance: false, phaseExit: false },
  notes: ['This gate binds independently captured receipts to the selected bank version. It does not create evidence or upgrade a failed/missing receipt.'],
};
await writeFile(resolve(args.out), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ out: resolve(args.out), status: report.status, issues }, null, 2));
process.exitCode = issues.length === 0 ? 0 : 2;
