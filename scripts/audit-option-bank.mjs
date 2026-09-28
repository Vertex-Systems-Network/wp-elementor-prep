#!/usr/bin/env node
import { mkdtemp, readFile, rm, writeFile, access, readdir } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=')];
}));
const freeZip = args['elementor-free'];
const proZip = args['elementor-pro'];
const outDir = resolve(args['bank-dir'] ?? 'docs/option-bank');
const gutenbergVersion = args['gutenberg-version'];
const contractsPath = args['gutenberg-contracts'];
if (!freeZip || !proZip) {
  throw new Error('Usage: npm run audit:elementor -- --elementor-free=/path/elementor.zip --elementor-pro=/path/elementor-pro.zip [--bank-dir=docs/option-bank]');
}
const safeZip = async (zip, target) => {
  const { stdout } = await execFileAsync('unzip', ['-Z1', zip]);
  for (const name of stdout.split(/\r?\n/).filter(Boolean)) {
    if (name.startsWith('/') || name.split('/').includes('..')) throw new Error(`Unsafe ZIP path: ${name}`);
  }
  await execFileAsync('unzip', ['-q', zip, '-d', target]);
};
const findHeader = async (dir, fileName) => {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) { const nested = await findHeader(path, fileName); if (nested) return nested; }
    else if (entry.name === fileName) return path;
  }
  return null;
};
const readVersion = async (dir, kind) => {
  const header = await findHeader(dir, kind === 'free' ? 'elementor.php' : 'elementor-pro.php');
  if (!header) throw new Error(`Could not find ${kind} plugin header in ZIP.`);
  const source = await readFile(header, 'utf8');
  const match = source.match(/^[ \t/*#-]*Version:\s*([^\r\n]+)/m) ?? source.match(new RegExp(`${kind === 'free' ? 'ELEMENTOR_VERSION' : 'ELEMENTOR_PRO_VERSION'}\\s*[:=]\\s*['\"]([^'\"]+)`));
  if (!match?.[1]) throw new Error(`Could not detect ${kind} version from ${header}.`);
  return match[1].trim();
};
const inventory = async (dir, root) => {
  const files = [];
  const walk = async (current) => {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith('.php')) files.push(path);
    }
  };
  await walk(dir);
  const keys = {};
  let calls = 0;
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(/->add_(control|responsive_control)\s*\(\s*['"]([^'"]+)['"]/g)) {
      calls += 1;
      const [, kind, key] = match;
      (keys[key] ??= []).push({ kind, file: relative(root, file) });
    }
  }
  return { phpFiles: files.length, literalControlRegistrationCalls: calls, literalControlKeys: Object.fromEntries(Object.entries(keys).sort(([a], [b]) => a.localeCompare(b))) };
};
const temp = await mkdtemp(join(tmpdir(), 'wp-elementor-option-bank-'));
try {
  const freeDir = join(temp, 'free'); const proDir = join(temp, 'pro');
  await safeZip(resolve(freeZip), freeDir); await safeZip(resolve(proZip), proDir);
  const freeVersion = await readVersion(freeDir, 'free'); const proVersion = await readVersion(proDir, 'pro');
  await access(outDir).catch(async () => { throw new Error(`Bank directory does not exist: ${outDir}`); });
  const snapshot = {
    schemaVersion: 2, generatedAt: new Date().toISOString(),
    kind: 'elementor', versions: { free: freeVersion, pro: proVersion },
    sources: { freeZip: resolve(freeZip), proZip: resolve(proZip) },
    targets: { elementor_free: await inventory(freeDir, freeDir), elementor_pro: await inventory(proDir, proDir) },
    notes: ['ZIPs were extracted into an isolated temporary directory.', 'Static literal registrations only; this does not prove import, save, frontend rendering, responsive behavior or target compatibility.'],
  };
  const snapshotName = `elementor-${freeVersion}-${proVersion}.json`;
  await writeFile(join(outDir, snapshotName), JSON.stringify(snapshot, null, 2) + '\n');
  const registryPath = join(outDir, 'registry.json');
  let registry = { schemaVersion: 1, elementor: [], gutenberg: [] };
  try { registry = JSON.parse(await readFile(registryPath, 'utf8')); } catch {}
  registry.schemaVersion = 1; registry.elementor = Array.isArray(registry.elementor) ? registry.elementor : []; registry.gutenberg = Array.isArray(registry.gutenberg) ? registry.gutenberg : [];
  const id = `elementor:${freeVersion}:${proVersion}`;
  registry.elementor = registry.elementor.filter((entry) => entry.id !== id);
  registry.elementor.push({ id, label: `Elementor Free ${freeVersion} + Pro ${proVersion}`, snapshot: snapshotName, status: 'INVENTORIED', generatedAt: snapshot.generatedAt });
  registry.elementor.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  if (gutenbergVersion) {
    const contracts = contractsPath ? JSON.parse(await readFile(resolve(contractsPath), 'utf8')) : null;
    const entry = { id: `gutenberg:${gutenbergVersion}`, label: `Gutenberg/WordPress ${gutenbergVersion}`, snapshot: contractsPath ? relative(outDir, resolve(contractsPath)) : 'gutenberg-official-contracts.json', status: 'INVENTORIED', generatedAt: new Date().toISOString() };
    registry.gutenberg = registry.gutenberg.filter((item) => item.id !== entry.id); registry.gutenberg.push(entry); registry.gutenberg.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  }
  await writeFile(registryPath, JSON.stringify(registry, null, 2) + '\n');
  const gapReport = { schemaVersion: 1, generatedAt: new Date().toISOString(), selection: id, evidence: { snapshot: snapshotName, freeKeys: Object.keys(snapshot.targets.elementor_free.literalControlKeys).length, proKeys: Object.keys(snapshot.targets.elementor_pro.literalControlKeys).length }, statuses: { INVENTORIED: 2, MAPPED: 0, RUNTIME_REQUIRED: 2, UNSUPPORTED: 0 }, notes: ['Static inventory is recorded. Runtime/import/render/serialization mapping remains explicitly RUNTIME_REQUIRED until target evidence exists.'] };
  await writeFile(join(outDir, `gap-report-${freeVersion}-${proVersion}.json`), JSON.stringify(gapReport, null, 2) + '\n');
  console.log(JSON.stringify({ snapshot: join(outDir, snapshotName), registry: registryPath, gapReport: join(outDir, `gap-report-${freeVersion}-${proVersion}.json`), versions: snapshot.versions }, null, 2));
} finally { await rm(temp, { recursive: true, force: true }); }
