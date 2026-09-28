#!/usr/bin/env node
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=')];
}));
const freeDir = args['free-dir'];
const proDir = args['pro-dir'];
const outPath = args.out;
if (!freeDir || !proDir || !outPath) {
  throw new Error('Usage: node scripts/refresh-option-bank.mjs --free-dir=/path/elementor --pro-dir=/path/elementor-pro --out=docs/option-bank/elementor-<free>-<pro>.json');
}
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(file));
    else if (entry.name.endsWith('.php')) result.push(file);
  }
  return result;
}
async function inventory(directory) {
  const keys = new Map();
  const phpFiles = await walk(resolve(directory));
  const widgetClassFiles = [];
  let calls = 0;
  for (const file of phpFiles) {
    const source = await readFile(file, 'utf8');
    if (/class\s+\w+\s+extends\s+(?:Widget_Base|Base_Widget)/.test(source)) widgetClassFiles.push(relative(directory, file));
    for (const match of source.matchAll(/->add_(control|responsive_control)\s*\(\s*['"]([^'"]+)['"]/g)) {
      calls += 1;
      const [, kind, key] = match;
      const list = keys.get(key) ?? [];
      list.push({ kind, file: relative(directory, file) });
      keys.set(key, list);
    }
  }
  return {
    phpFiles: phpFiles.length,
    widgetClassFiles: widgetClassFiles.sort(),
    literalControlRegistrationCalls: calls,
    literalControlKeys: Object.fromEntries([...keys.entries()].sort(([a], [b]) => a.localeCompare(b))),
  };
}
const result = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  sources: { elementorFree: { directory: resolve(freeDir) }, elementorPro: { directory: resolve(proDir) } },
  targets: { elementor_free: await inventory(freeDir), elementor_pro: await inventory(proDir) },
  notes: [
    'Static literal registrations only; dynamic/generated keys are separately marked for review.',
    'This inventory does not prove import, save, frontend rendering, responsive behavior or target compatibility.',
  ],
};
await writeFile(outPath, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ out: resolve(outPath), freeKeys: Object.keys(result.targets.elementor_free.literalControlKeys).length, proKeys: Object.keys(result.targets.elementor_pro.literalControlKeys).length }));
